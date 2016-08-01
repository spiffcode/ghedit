var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/uri', 'vs/base/common/glob', 'vs/base/common/objects', 'vs/base/common/scorer', 'vs/base/common/strings', 'vs/platform/search/common/search', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/editor/common/services/modelService', 'vs/platform/workspace/common/workspace', 'vs/platform/configuration/common/configuration', 'forked/fileSearch'], function (require, exports, winjs_base_1, uri_1, glob, objects, scorer, strings, search_1, untitledEditorService_1, modelService_1, workspace_1, configuration_1, fileSearch_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var github = require('lib/github');
    var SearchService = (function () {
        function SearchService(githubService, modelService, untitledEditorService, contextService, configurationService) {
            this.githubService = githubService;
            this.modelService = modelService;
            this.untitledEditorService = untitledEditorService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.serviceId = search_1.ISearchService;
            var config = contextService.getConfiguration();
            // this.diskSearch = new DiskSearch(!config.env.isBuilt || config.env.verboseLogging);
            this.githubSearch = new GithubSearch(this.githubService);
        }
        SearchService.prototype.search = function (query) {
            var _this = this;
            var configuration = this.configurationService.getConfiguration();
            // Configuration: Encoding
            if (!query.fileEncoding) {
                var fileEncoding = configuration && configuration.files && configuration.files.encoding;
                query.fileEncoding = fileEncoding;
            }
            // Configuration: File Excludes
            var fileExcludes = configuration && configuration.files && configuration.files.exclude;
            if (fileExcludes) {
                if (!query.excludePattern) {
                    query.excludePattern = fileExcludes;
                }
                else {
                    objects.mixin(query.excludePattern, fileExcludes, false /* no overwrite */);
                }
            }
            var rawSearchQuery;
            return new winjs_base_1.PPromise(function (onComplete, onError, onProgress) {
                // Get local results from dirty/untitled
                var localResultsFlushed = false;
                var localResults = _this.getLocalResults(query);
                var flushLocalResultsOnce = function () {
                    if (!localResultsFlushed) {
                        localResultsFlushed = true;
                        Object.keys(localResults).map(function (key) { return localResults[key]; }).filter(function (res) { return !!res; }).forEach(onProgress);
                    }
                };
                // Delegate to parent for real file results
                // rawSearchQuery = this.diskSearch.search(query).then(
                rawSearchQuery = _this.githubSearch.search(query).then(
                // on Complete
                function (complete) {
                    flushLocalResultsOnce();
                    onComplete({ results: complete.results.filter(function (match) { return typeof localResults[match.resource.toString()] === 'undefined'; }), limitHit: complete.limitHit }); // dont override local results
                }, 
                // on Error
                function (error) {
                    flushLocalResultsOnce();
                    onError(error);
                }, 
                // on Progress
                function (progress) {
                    flushLocalResultsOnce();
                    // Match
                    if (progress.resource) {
                        if (typeof localResults[progress.resource.toString()] === 'undefined') {
                            onProgress(progress);
                        }
                    }
                    else {
                        onProgress(progress);
                    }
                });
            }, function () { return rawSearchQuery && rawSearchQuery.cancel(); });
        };
        SearchService.prototype.getLocalResults = function (query) {
            var _this = this;
            var localResults = Object.create(null);
            if (query.type === search_1.QueryType.Text) {
                var models = this.modelService.getModels();
                models.forEach(function (model) {
                    var resource = model.getAssociatedResource();
                    if (!resource) {
                        return;
                    }
                    // Support untitled files
                    if (resource.scheme === 'untitled') {
                        if (!_this.untitledEditorService.get(resource)) {
                            return;
                        }
                    }
                    else if (resource.scheme !== 'file') {
                        return;
                    }
                    if (!_this.matches(resource, query.filePattern, query.includePattern, query.excludePattern)) {
                        return; // respect user filters
                    }
                    // Use editor API to find matches
                    var ranges = model.findMatches(query.contentPattern.pattern, false, query.contentPattern.isRegExp, query.contentPattern.isCaseSensitive, query.contentPattern.isWordMatch);
                    if (ranges.length) {
                        var fileMatch_1 = new search_1.FileMatch(resource);
                        localResults[resource.toString()] = fileMatch_1;
                        ranges.forEach(function (range) {
                            fileMatch_1.lineMatches.push(new search_1.LineMatch(model.getLineContent(range.startLineNumber), range.startLineNumber - 1, [[range.startColumn - 1, range.endColumn - range.startColumn]]));
                        });
                    }
                    else {
                        localResults[resource.toString()] = false; // flag as empty result
                    }
                });
            }
            return localResults;
        };
        SearchService.prototype.matches = function (resource, filePattern, includePattern, excludePattern) {
            var workspaceRelativePath = this.contextService.toWorkspaceRelativePath(resource);
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
        };
        SearchService = __decorate([
            __param(1, modelService_1.IModelService),
            __param(2, untitledEditorService_1.IUntitledEditorService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, configuration_1.IConfigurationService)
        ], SearchService);
        return SearchService;
    }());
    exports.SearchService = SearchService;
    var GithubSearch = (function () {
        function GithubSearch(githubService) {
            this.githubService = githubService;
            this.fakeLineNumber = 1;
        }
        GithubSearch.prototype.lineMatchesFromFragments = function (fragment, matches) {
            // Github search returns matches from aribtrary fragments pulled from a file.
            // Fragments often don't start on a line, and there is no line number information.
            var lineMatches = [];
            // Pull hacky ILineMatch info from the fragment.
            var parts = [];
            var indexStart = 0;
            var lines = fragment.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var indexEnd = indexStart + lines[i].length;
                parts.push({ line: lines[i], start: indexStart, end: indexEnd });
                indexStart = indexEnd + 1;
            }
            for (var i = 0; i < matches.length; i++) {
                var start = matches[i].indices[0];
                var end = matches[i].indices[1];
                for (var j = 0; j < parts.length; j++) {
                    if (start >= parts[j].start && end <= parts[j].end) {
                        lineMatches.push(new search_1.LineMatch(parts[j].line, this.fakeLineNumber++, [[start - parts[j].start, end - start]]));
                    }
                }
            }
            return lineMatches;
        };
        GithubSearch.prototype.textSearch = function (query) {
            var _this = this;
            return new winjs_base_1.PPromise(function (c, e, p) {
                // If this isn't the default branch, fail.
                if (!_this.githubService.isDefaultBranch()) {
                    var br = _this.githubService.getDefaultBranch();
                    e("Github only provides search on the default branch (" + br + ").");
                    return;
                }
                // q=foo+repo:spiffcode/ghcode_test
                var q = query.contentPattern.pattern + '+repo:' + _this.githubService.repoName;
                var s = new github.Search({ query: encodeURIComponent(q) });
                s.code(null, function (err, result) {
                    if (err) {
                        if (err.error) {
                            e(err.error);
                        }
                        else {
                            e(err);
                        }
                        return;
                    }
                    var matches = [];
                    for (var i = 0; i < result.items.length; i++) {
                        var item = result.items[i];
                        var m = new search_1.FileMatch(uri_1.default.file(item.path));
                        for (var j = 0; j < item.text_matches.length; j++) {
                            var lineMatches = _this.lineMatchesFromFragments(item.text_matches[j].fragment, item.text_matches[j].matches);
                            m.lineMatches = m.lineMatches.concat(lineMatches);
                        }
                        matches.push(m);
                        p(m);
                    }
                    // Github only provides search on forks if the fork has
                    // more star ratings than the parent.
                    if (matches.length == 0 && _this.githubService.isFork()) {
                        e("Github doesn't provide search on forked repos unless the star rating is greater than the parent repo.");
                        return;
                    }
                    c({ limitHit: result.incomplete_results, results: matches });
                });
            });
        };
        GithubSearch.prototype.fileSearch = function (query) {
            // Map from ISearchQuery to IRawSearch
            var config = {
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
                query.folderResources.forEach(function (r) {
                    config.rootFolders.push(r.path);
                });
            }
            if (query.extraFileResources) {
                config.extraFiles = [];
                query.extraFileResources.forEach(function (r) {
                    config.extraFiles.push(r.path);
                });
            }
            var engine = new fileSearch_1.Engine(config, this.githubService.getCache());
            var matches = [];
            return new winjs_base_1.PPromise(function (c, e, p) {
                engine.search(function (match) {
                    if (match) {
                        matches.push(match);
                        p(match);
                    }
                }, function (progress) {
                    p(progress);
                }, function (error, isLimitHit) {
                    if (error) {
                        e(error);
                    }
                    else {
                        c({ limitHit: isLimitHit, results: matches });
                    }
                });
            }, function () { return engine.cancel(); });
        };
        GithubSearch.prototype.search = function (query) {
            if (query.type === search_1.QueryType.File) {
                return this.fileSearch(query);
            }
            else {
                return this.textSearch(query);
            }
        };
        return GithubSearch;
    }());
});
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
//# sourceMappingURL=searchService.js.map