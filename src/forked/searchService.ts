/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

// Forked from c212f0908f3d29933317bbc3233568fbca7944b1:./vs/workbench/services/search/node/searchService.ts
// This is a port of vs/workbench/services/search/node/searchService.ts with Node dependencies
// removed/replaced.

import {PPromise} from 'vs/base/common/winjs.base';
import uri from 'vs/base/common/uri';
import glob = require('vs/base/common/glob');
import objects = require('vs/base/common/objects');
import scorer = require('vs/base/common/scorer');
import strings = require('vs/base/common/strings');
// TODO: import {Client} from 'vs/base/parts/ipc/node/ipc.cp';
import {IProgress, LineMatch, FileMatch, ISearchComplete, ISearchProgressItem, QueryType, IFileMatch, ISearchQuery, ISearchConfiguration, ISearchService} from 'vs/platform/search/common/search';
import {IUntitledEditorService} from 'vs/workbench/services/untitled/common/untitledEditorService';
import {IModelService} from 'vs/editor/common/services/modelService';
import {IWorkspaceContextService} from 'vs/platform/workspace/common/workspace';
import {IConfigurationService} from 'vs/platform/configuration/common/configuration';
// TODO: import {IRawSearch, ISerializedSearchComplete, ISerializedSearchProgressItem, IRawSearchService} from './search';
// TODO: import {ISearchChannel, SearchChannelClient} from './searchIpc';
import {IGithubService} from 'githubService';
var github = require('lib/github');
import {Github, SearchResult, ResultItem, TextMatch, FragmentMatch, SearchOptions, Search as GithubApiSearch, Error as GithubError} from 'github';
import {IRawSearch} from 'vs/workbench/services/search/node/search';
import {Engine as GithubFileSearchEngine} from 'forked/fileSearch';

export class SearchService implements ISearchService {
	public serviceId = ISearchService;

	// private diskSearch: DiskSearch;
	private githubSearch: GithubSearch;

	constructor(
		private githubService: IGithubService,
		@IModelService private modelService: IModelService,
		@IUntitledEditorService private untitledEditorService: IUntitledEditorService,
		@IWorkspaceContextService private contextService: IWorkspaceContextService,
		@IConfigurationService private configurationService: IConfigurationService
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
					onComplete({ results: complete.results.filter((match) => typeof localResults[match.resource.toString()] === 'undefined'), limitHit: complete.limitHit }); // dont override local results
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
				let resource = model.getAssociatedResource();
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

	constructor(private githubService: IGithubService) {
		this.fakeLineNumber = 1;
	}

	private lineMatchesFromFragments(fragment: string, matches: FragmentMatch[]) : LineMatch[] {
		// Github search returns matches from aribtrary fragments pulled from a file.
		// Fragments often don't start on a line, and there is no line number information.
		let lineMatches: LineMatch[] = [];

		// Pull hacky ILineMatch info from the fragment.
		let parts = [];
		let indexStart = 0;
		let lines: string[] = fragment.split('\n');
		for (let i = 0; i < lines.length; i++) {
			let indexEnd = indexStart + lines[i].length;
			parts.push({ line: lines[i], start: indexStart, end: indexEnd });
			indexStart = indexEnd + 1;
		}

		for (let i = 0; i < matches.length; i++) {
			let start = matches[i].indices[0];
			let end = matches[i].indices[1];
			for (let j = 0; j < parts.length; j++) {
				if (start >= parts[j].start && end <= parts[j].end) {
					lineMatches.push(new LineMatch(parts[j].line, this.fakeLineNumber++, [[ start - parts[j].start, end - start ]]));
				}
			}
		}

		return lineMatches;
	}

	private textSearch(query: ISearchQuery) : PPromise<ISearchComplete, ISearchProgressItem> {
		return new PPromise<ISearchComplete, ISearchProgressItem>((c, e, p) => {
			// If this isn't the default branch, fail.
			if (!this.githubService.isDefaultBranch()) {
				let br = this.githubService.getDefaultBranch();
				e("Github only provides search on the default branch (" + br + ").");
				return;
			}

			// q=foo+repo:spiffcode/ghcode_test
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

				let matches: FileMatch[] = [];
				for (let i = 0; i < result.items.length; i++) {
					let item: ResultItem = result.items[i];
					let m = new FileMatch(uri.file(item.path));
					for (let j = 0; j < item.text_matches.length; j++) {
						let lineMatches = this.lineMatchesFromFragments(item.text_matches[j].fragment, item.text_matches[j].matches);
						m.lineMatches = m.lineMatches.concat(lineMatches);
					}
					matches.push(m);
					p(m);
				}

				// Github only provides search on forks if the fork has
				// more star ratings than the parent.
				if (matches.length == 0 && this.githubService.isFork()) {
					e("Github doesn't provide search on forked repos unless the star rating is greater than the parent repo.");
					return;
				}

				c({ limitHit: result.incomplete_results, results: matches });
			});
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
			}, (error, isLimitHit) => {
				if (error) {
					e(error);
				} else {
					c({ limitHit: isLimitHit, results: matches });
				}
			});
		}, () => engine.cancel());
	}

	public search(query: ISearchQuery): PPromise<ISearchComplete, ISearchProgressItem> {
		if (query.type === QueryType.File) {
			return this.fileSearch(query);
		} else {
			return this.textSearch(query);
		}
	}
}

/*
class DiskSearch {

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

		const channel = client.getChannel<ISearchChannel>('search');
		this.raw = new SearchChannelClient(channel);
	}

	public search(query: ISearchQuery): PPromise<ISearchComplete, ISearchProgressItem> {
		let result: IFileMatch[] = [];
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

		return new PPromise<ISearchComplete, ISearchProgressItem>((c, e, p) => {
			request.done((complete) => {
				c({
					limitHit: complete.limitHit,
					results: result
				});
			}, e, (data) => {

				// Match
				if (data.path) {
					let fileMatch = new FileMatch(uri.file(data.path));
					result.push(fileMatch);

					if (data.lineMatches) {
						for (let j = 0; j < data.lineMatches.length; j++) {
							fileMatch.lineMatches.push(new LineMatch(data.lineMatches[j].preview, data.lineMatches[j].lineNumber, data.lineMatches[j].offsetAndLengths));
						}
					}

					p(fileMatch);
				}

				// Progress
				else {
					p(<IProgress>data);
				}
			});
		}, () => request.cancel());
	}
}
*/