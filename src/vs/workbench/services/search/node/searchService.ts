/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {TPromise, PPromise} from 'vs/base/common/winjs.base';
import uri from 'vs/base/common/uri';
import glob = require('vs/base/common/glob');
import objects = require('vs/base/common/objects');
import scorer = require('vs/base/common/scorer');
import strings = require('vs/base/common/strings');
// TODO: import {getNextTickChannel} from 'vs/base/parts/ipc/common/ipc';
// TODO: import {Client} from 'vs/base/parts/ipc/node/ipc.cp';
import {IProgress, LineMatch, FileMatch, ISearchComplete, ISearchProgressItem, QueryType, IFileMatch, ISearchQuery, ISearchConfiguration, ISearchService} from 'vs/platform/search/common/search';
import {IUntitledEditorService} from 'vs/workbench/services/untitled/common/untitledEditorService';
import {IModelService} from 'vs/editor/common/services/modelService';
import {IWorkspaceContextService} from 'vs/platform/workspace/common/workspace';
import {IConfigurationService} from 'vs/platform/configuration/common/configuration';
// TODO: import {IRawSearch, ISerializedSearchComplete, ISerializedSearchProgressItem, ISerializedFileMatch, IRawSearchService} from './search';
// TODO: import {ISearchChannel, SearchChannelClient} from './searchIpc';
import {IGithubService} from 'ghedit/githubService';
var github = require('ghedit/lib/github');
import {Github, SearchResult, ResultItem, TextMatch, FragmentMatch, SearchOptions, Search as GithubApiSearch, Error as GithubError} from 'github';
import {IRawSearch} from 'vs/workbench/services/search/node/search';
import {Engine as GithubFileSearchEngine} from 'vs/workbench/services/search/node/fileSearch';
import {IEditorService} from 'vs/platform/editor/common/editor';
import {Limiter} from 'vs/base/common/async';
import {ITextEditorModel} from 'vs/platform/editor/common/editor';
import {IModel} from 'vs/editor/common/editorCommon';

export class SearchService implements ISearchService {
	public _serviceBrand: any;

	// private diskSearch: DiskSearch;
	private githubSearch: GithubSearch;

	constructor(
		@IModelService private modelService: IModelService,
		@IUntitledEditorService private untitledEditorService: IUntitledEditorService,
		@IWorkspaceContextService private contextService: IWorkspaceContextService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IGithubService private githubService: IGithubService
	) {
		let config = contextService.getConfiguration();
		// this.diskSearch = new DiskSearch(!config.env.isBuilt || config.env.verboseLogging);
		this.githubSearch = new GithubSearch(this.githubService);
	}

	public search(query: ISearchQuery): PPromise<ISearchComplete, ISearchProgressItem> {
		const configuration = this.configurationService.getConfiguration<ISearchConfiguration>();

		// Configuration: Encoding
		if (!query.fileEncoding) {
			let fileEncoding = configuration && configuration.files && configuration.files.encoding;
			query.fileEncoding = fileEncoding;
		}

		// Configuration: File Excludes
		let fileExcludes = configuration && configuration.files && configuration.files.exclude;
		if (fileExcludes) {
			if (!query.excludePattern) {
				query.excludePattern = fileExcludes;
			} else {
				objects.mixin(query.excludePattern, fileExcludes, false /* no overwrite */);
			}
		}

		let rawSearchQuery: PPromise<void, ISearchProgressItem>;
		return new PPromise<ISearchComplete, ISearchProgressItem>((onComplete, onError, onProgress) => {

			// Get local results from dirty/untitled
			let localResultsFlushed = false;
			let localResults = this.getLocalResults(query);

			let flushLocalResultsOnce = function () {
				if (!localResultsFlushed) {
					localResultsFlushed = true;
					Object.keys(localResults).map((key) => localResults[key]).filter((res) => !!res).forEach(onProgress);
				}
			};

			// Delegate to parent for real file results
			// rawSearchQuery = this.diskSearch.search(query).then(
			rawSearchQuery = this.githubSearch.search(query).then(

				// on Complete
				(complete) => {
					flushLocalResultsOnce();
					onComplete({
						limitHit: complete.limitHit,
						results: complete.results.filter((match) => typeof localResults[match.resource.toString()] === 'undefined'), // dont override local results
						stats: complete.stats
					});
				},

				// on Error
				(error) => {
					flushLocalResultsOnce();
					onError(error);
				},

				// on Progress
				(progress) => {
					flushLocalResultsOnce();

					// Match
					if (progress.resource) {
						if (typeof localResults[progress.resource.toString()] === 'undefined') { // don't override local results
							onProgress(progress);
						}
					}

					// Progress
					else {
						onProgress(<IProgress>progress);
					}
				});
		}, () => rawSearchQuery && rawSearchQuery.cancel());
	}

	private getLocalResults(query: ISearchQuery): { [resourcePath: string]: IFileMatch; } {
		let localResults: { [resourcePath: string]: IFileMatch; } = Object.create(null);

		if (query.type === QueryType.Text) {
			let models = this.modelService.getModels();
			models.forEach((model) => {
				let resource = model.uri;
				if (!resource) {
					return;
				}

				// Support untitled files
				if (resource.scheme === 'untitled') {
					if (!this.untitledEditorService.get(resource)) {
						return;
					}
				}

				// Don't support other resource schemes than files for now
				else if (resource.scheme !== 'file') {
					return;
				}

				if (!this.matches(resource, query.filePattern, query.includePattern, query.excludePattern)) {
					return; // respect user filters
				}

				// Use editor API to find matches
				let ranges = model.findMatches(query.contentPattern.pattern, false, query.contentPattern.isRegExp, query.contentPattern.isCaseSensitive, query.contentPattern.isWordMatch);
				if (ranges.length) {
					let fileMatch = new FileMatch(resource);
					localResults[resource.toString()] = fileMatch;

					ranges.forEach((range) => {
						fileMatch.lineMatches.push(new LineMatch(model.getLineContent(range.startLineNumber), range.startLineNumber - 1, [[range.startColumn - 1, range.endColumn - range.startColumn]]));
					});
				} else {
					localResults[resource.toString()] = false; // flag as empty result
				}
			});
		}

		return localResults;
	}

	private matches(resource: uri, filePattern: string, includePattern: glob.IExpression, excludePattern: glob.IExpression): boolean {
		let workspaceRelativePath = this.contextService.toWorkspaceRelativePath(resource);

		// file pattern
		if (filePattern) {
			if (resource.scheme !== 'file') {
				return false; // if we match on file pattern, we have to ignore non file resources
			}

			if (!scorer.matches(resource.fsPath, strings.stripWildcards(filePattern).toLowerCase())) {
				return false;
			}
		}

		// includes
		if (includePattern) {
			if (resource.scheme !== 'file') {
				return false; // if we match on file patterns, we have to ignore non file resources
			}

			if (!glob.match(includePattern, workspaceRelativePath || resource.fsPath)) {
				return false;
			}
		}

		// excludes
		if (excludePattern) {
			if (resource.scheme !== 'file') {
				return true; // e.g. untitled files can never be excluded with file patterns
			}

			if (glob.match(excludePattern, workspaceRelativePath || resource.fsPath)) {
				return false;
			}
		}

		return true;
	}
}

class GithubSearch {
	private fakeLineNumber: number;
	private editorService: IEditorService;
	private sentGa: boolean;

	constructor(private githubService: IGithubService) {
		this.fakeLineNumber = 1;
		this.sentGa = false;
	}

	public setEditorService(editorService: IEditorService) {
		this.editorService = editorService;
	}

	private textSearch(query: ISearchQuery) : PPromise<ISearchComplete, ISearchProgressItem> {
		return new PPromise<ISearchComplete, ISearchProgressItem>((c, e, p) => {
			// If this isn't the default branch, fail.
			if (!this.githubService.isDefaultBranch()) {
				let br = this.githubService.getDefaultBranch();
				e("Github only provides search on the default branch (" + br + ").");
				return;
			}

			let fileWalkStartTime = Date.now();

			// q=foo+repo:spiffcode/ghedit_test
			let q:string = query.contentPattern.pattern + '+repo:' + this.githubService.repoName;
			let s: GithubApiSearch = new github.Search({ query: encodeURIComponent(q) });
			s.code(null, (err: GithubError, result: SearchResult) => {
				if (err) {
					if (err.error) {
						e(err.error)
					} else {
						e(err);
					}
					return;
				}

				// Github only provides search on forks if the fork has
				// more star ratings than the parent.
				if (result.items.length == 0 && this.githubService.isFork()) {
					e("Github doesn't provide search on forked repos unless the star rating is greater than the parent repo.");
					return;
				}

				// Search on IModel's to get accurate search results. Github's search results
				// are not complete and don't have line numbers.
				this.modelSearch(query.contentPattern.pattern, result.items.map((item) => uri.file(item.path))).then((matches) => {
					c({ limitHit: result.incomplete_results, results: matches,
						stats: { fileWalkStartTime: fileWalkStartTime, fileWalkResultTime: Date.now(), directoriesWalked: 1, filesWalked: 1 } });
				}, () => {
					e('Github error performing search.')
				});
			});
		});
	}

	private modelSearch(pattern: string, uris: uri[]) : TPromise<FileMatch[]> {
		// Return FileMatch[] given a pattern and a list of uris
		return new TPromise<FileMatch[]>((c, e) => {
			let limiter = new Limiter(1);
			let promises = uris.map((uri) => limiter.queue(() => this.editorService.resolveEditorModel({ resource: uri })));
			TPromise.join(promises).then((models: ITextEditorModel[]) => {
				let matches: FileMatch[] = [];
				models.forEach((model) => {
					var textEditorModel = <IModel>model.textEditorModel;
					let m = new FileMatch(textEditorModel.uri);
					textEditorModel.findMatches(pattern, false, false, false, true).forEach((r) => {
						let frag = textEditorModel.getLineContent(r.startLineNumber);
						m.lineMatches.push(new LineMatch(frag, r.startLineNumber, [[ r.startColumn - 1, r.endColumn - r.startColumn ]]));
					});
					matches.push(m);
				});
				c(matches);
			}, () => c([]));
		});
	}

	private fileSearch(query: ISearchQuery) : PPromise<ISearchComplete, ISearchProgressItem> {
		// Map from ISearchQuery to IRawSearch
		let config: IRawSearch = {
			rootFolders: [''],
			filePattern: query.filePattern,
			excludePattern: query.excludePattern,
			includePattern: query.includePattern,
			contentPattern: query.contentPattern,
			maxResults: query.maxResults,
			fileEncoding: query.fileEncoding
		};

		if (query.folderResources) {
			config.rootFolders = [];
			query.folderResources.forEach((r) => {
				config.rootFolders.push(r.path);
			});
		}

		if (query.extraFileResources) {
			config.extraFiles = [];
			query.extraFileResources.forEach((r) => {
				config.extraFiles.push(r.path);
			});
		}

		let fileWalkStartTime = Date.now();
		let engine = new GithubFileSearchEngine(config, this.githubService.getCache());

		let matches: IFileMatch[] = [];
		return new PPromise<ISearchComplete, ISearchProgressItem>((c, e, p) => {
			engine.search((match) => {
				if (match) {
					matches.push(match);
					p(match);
				}
			}, (progress) => {
				p(progress);
			}, (error, complete) => {
				if (error) {
					e(error);
				} else {
					c({ limitHit: complete.limitHit, results: matches, stats: complete.stats });
				}
			});
		}, () => engine.cancel());
	}

	public search(query: ISearchQuery): PPromise<ISearchComplete, ISearchProgressItem> {
		if (query.type === QueryType.File) {
			if (!this.sentGa) {
				this.sentGa = true;
				setTimeout(() => { this.sentGa = false }, 30);
				(<any>window).sendGa('/workbench/search/filename');
			}
			return this.fileSearch(query);
		} else {
			(<any>window).sendGa('/workbench/search/text');
			return this.textSearch(query);
		}
	}
}

/*
export class DiskSearch {

	private raw: IRawSearchService;

	constructor(verboseLogging: boolean) {
		const client = new Client(
			uri.parse(require.toUrl('bootstrap')).fsPath,
			{
				serverName: 'Search',
				timeout: 60 * 1000,
				args: ['--type=searchService'],
				env: {
					AMD_ENTRYPOINT: 'vs/workbench/services/search/node/searchApp',
					PIPE_LOGGING: 'true',
					VERBOSE_LOGGING: verboseLogging
				}
			}
		);

		const channel = getNextTickChannel(client.getChannel<ISearchChannel>('search'));
		this.raw = new SearchChannelClient(channel);
	}

	public search(query: ISearchQuery): PPromise<ISearchComplete, ISearchProgressItem> {
		let request: PPromise<ISerializedSearchComplete, ISerializedSearchProgressItem>;

		let rawSearch: IRawSearch = {
			rootFolders: query.folderResources ? query.folderResources.map(r => r.fsPath) : [],
			extraFiles: query.extraFileResources ? query.extraFileResources.map(r => r.fsPath) : [],
			filePattern: query.filePattern,
			excludePattern: query.excludePattern,
			includePattern: query.includePattern,
			maxResults: query.maxResults
		};

		if (query.type === QueryType.Text) {
			rawSearch.contentPattern = query.contentPattern;
			rawSearch.fileEncoding = query.fileEncoding;
		}

		if (query.type === QueryType.File) {
			request = this.raw.fileSearch(rawSearch);
		} else {
			request = this.raw.textSearch(rawSearch);
		}

		return DiskSearch.collectResults(request);
	}

	public static collectResults(request: PPromise<ISerializedSearchComplete, ISerializedSearchProgressItem>): PPromise<ISearchComplete, ISearchProgressItem> {
		let result: IFileMatch[] = [];
		return new PPromise<ISearchComplete, ISearchProgressItem>((c, e, p) => {
			request.done((complete) => {
				c({
					limitHit: complete.limitHit,
					results: result,
					stats: complete.stats
				});
			}, e, (data) => {

				// Matches
				if (Array.isArray(data)) {
					const fileMatches = data.map(d => this.createFileMatch(d));
					result = result.concat(fileMatches);
					fileMatches.forEach(p);
				}

				// Match
				else if ((<ISerializedFileMatch>data).path) {
					const fileMatch = this.createFileMatch(data);
					result.push(fileMatch);
					p(fileMatch);
				}

				// Progress
				else {
					p(<IProgress>data);
				}
			});
		}, () => request.cancel());
	}

	private static createFileMatch(data: ISerializedFileMatch): FileMatch {
		let fileMatch = new FileMatch(uri.file(data.path));
		if (data.lineMatches) {
			for (let j = 0; j < data.lineMatches.length; j++) {
				fileMatch.lineMatches.push(new LineMatch(data.lineMatches[j].preview, data.lineMatches[j].lineNumber, data.lineMatches[j].offsetAndLengths));
			}
		}
		return fileMatch;
	}
}
*/
