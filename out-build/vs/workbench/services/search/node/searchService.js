var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/uri', 'vs/base/common/glob', 'vs/base/common/objects', 'vs/base/common/scorer', 'vs/base/common/strings', 'vs/base/node/service.cp', 'vs/platform/search/common/search', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/editor/common/services/modelService', 'vs/platform/workspace/common/workspace', 'vs/platform/configuration/common/configuration', 'vs/workbench/services/search/node/rawSearchService'], function (require, exports, winjs_base_1, uri_1, glob, objects, scorer, strings, service_cp_1, search_1, untitledEditorService_1, modelService_1, workspace_1, configuration_1, rawSearchService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SearchService = (function () {
        function SearchService(modelService, untitledEditorService, contextService, configurationService) {
            this.modelService = modelService;
            this.untitledEditorService = untitledEditorService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.serviceId = search_1.ISearchService;
            var config = contextService.getConfiguration();
            this.diskSearch = new DiskSearch(!config.env.isBuilt || config.env.verboseLogging);
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
                rawSearchQuery = _this.diskSearch.search(query).then(
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
            __param(0, modelService_1.IModelService),
            __param(1, untitledEditorService_1.IUntitledEditorService),
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, configuration_1.IConfigurationService)
        ], SearchService);
        return SearchService;
    }());
    exports.SearchService = SearchService;
    var DiskSearch = (function () {
        function DiskSearch(verboseLogging) {
            var client = new service_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
                serverName: 'Search',
                timeout: 60 * 1000,
                args: ['--type=searchService'],
                env: {
                    AMD_ENTRYPOINT: 'vs/workbench/services/search/node/searchApp',
                    PIPE_LOGGING: 'true',
                    VERBOSE_LOGGING: verboseLogging
                }
            });
            this.raw = client.getService('SearchService', rawSearchService_1.SearchService);
        }
        DiskSearch.prototype.search = function (query) {
            var result = [];
            var request;
            var rawSearch = {
                rootFolders: query.folderResources ? query.folderResources.map(function (r) { return r.fsPath; }) : [],
                extraFiles: query.extraFileResources ? query.extraFileResources.map(function (r) { return r.fsPath; }) : [],
                filePattern: query.filePattern,
                excludePattern: query.excludePattern,
                includePattern: query.includePattern,
                maxResults: query.maxResults
            };
            if (query.type === search_1.QueryType.Text) {
                rawSearch.contentPattern = query.contentPattern;
                rawSearch.fileEncoding = query.fileEncoding;
            }
            if (query.type === search_1.QueryType.File) {
                request = this.raw.fileSearch(rawSearch);
            }
            else {
                request = this.raw.textSearch(rawSearch);
            }
            return new winjs_base_1.PPromise(function (c, e, p) {
                request.done(function (complete) {
                    c({
                        limitHit: complete.limitHit,
                        results: result
                    });
                }, e, function (data) {
                    // Match
                    if (data.path) {
                        var fileMatch = new search_1.FileMatch(uri_1.default.file(data.path));
                        result.push(fileMatch);
                        if (data.lineMatches) {
                            for (var j = 0; j < data.lineMatches.length; j++) {
                                fileMatch.lineMatches.push(new search_1.LineMatch(data.lineMatches[j].preview, data.lineMatches[j].lineNumber, data.lineMatches[j].offsetAndLengths));
                            }
                        }
                        p(fileMatch);
                    }
                    else {
                        p(data);
                    }
                });
            }, function () { return request.cancel(); });
        };
        return DiskSearch;
    }());
});
//# sourceMappingURL=searchService.js.map