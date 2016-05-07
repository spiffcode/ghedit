/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/search/browser/openAnythingHandler', 'vs/base/common/async', 'vs/base/common/types', 'vs/base/common/platform', 'vs/base/common/scorer', 'vs/base/common/paths', 'vs/base/common/labels', 'vs/base/common/strings', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/workbench/browser/quickopen', 'vs/workbench/parts/search/browser/openFileHandler', 'vs/workbench/parts/search/browser/openSymbolHandler', 'vs/platform/message/common/message', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/configuration/common/configuration'], function (require, exports, winjs_base_1, nls, async_1, types, platform_1, scorer, paths, labels, strings, quickOpenModel_1, quickopen_1, openFileHandler_1, openSymbolHandler, message_1, instantiation_1, contextService_1, configuration_1) {
    'use strict';
    // OpenSymbolHandler is used from an extension and must be in the main bundle file so it can load
    exports.OpenSymbolHandler = openSymbolHandler.OpenSymbolHandler;
    var OpenAnythingHandler = (function (_super) {
        __extends(OpenAnythingHandler, _super);
        function OpenAnythingHandler(messageService, contextService, instantiationService, configurationService) {
            _super.call(this);
            this.messageService = messageService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            // Instantiate delegate handlers
            this.openSymbolHandler = instantiationService.createInstance(exports.OpenSymbolHandler);
            this.openFileHandler = instantiationService.createInstance(openFileHandler_1.OpenFileHandler);
            this.openSymbolHandler.setStandalone(false);
            this.resultsToSearchCache = Object.create(null);
            this.scorerCache = Object.create(null);
            this.delayer = new async_1.ThrottledDelayer(OpenAnythingHandler.SEARCH_DELAY);
        }
        OpenAnythingHandler.prototype.getResults = function (searchValue) {
            var _this = this;
            searchValue = searchValue.trim();
            // Help Windows users to search for paths when using slash
            if (platform_1.isWindows) {
                searchValue = searchValue.replace(/\//g, '\\');
            }
            // Cancel any pending search
            this.cancelPendingSearch();
            // Treat this call as the handler being in use
            this.isClosed = false;
            // Respond directly to empty search
            if (!searchValue) {
                return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel());
            }
            // Find a suitable range from the pattern looking for ":" and "#"
            var searchWithRange = this.extractRange(searchValue);
            if (searchWithRange) {
                searchValue = searchWithRange.search; // ignore range portion in query
            }
            // Check Cache first
            var cachedResults = this.getResultsFromCache(searchValue, searchWithRange ? searchWithRange.range : null);
            if (cachedResults) {
                return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel(cachedResults));
            }
            // The throttler needs a factory for its promises
            var promiseFactory = function () {
                var receivedFileResults = false;
                // Symbol Results (unless a range is specified)
                var resultPromises = [];
                if (!searchWithRange) {
                    var symbolSearchTimeoutPromiseFn_1 = function (timeout) {
                        return winjs_base_1.TPromise.timeout(timeout).then(function () {
                            // As long as the file search query did not return, push out the symbol timeout
                            // so that the symbol search has a chance to return results at least as long as
                            // the file search did not return.
                            if (!receivedFileResults) {
                                return symbolSearchTimeoutPromiseFn_1(OpenAnythingHandler.SYMBOL_SEARCH_SUBSEQUENT_TIMEOUT);
                            }
                            // Empty result since timeout was reached and file results are in
                            return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel());
                        });
                    };
                    var lookupPromise = _this.openSymbolHandler.getResults(searchValue);
                    var timeoutPromise = symbolSearchTimeoutPromiseFn_1(OpenAnythingHandler.SYMBOL_SEARCH_INITIAL_TIMEOUT);
                    // Timeout lookup after N seconds to not block file search results
                    resultPromises.push(winjs_base_1.TPromise.any([lookupPromise, timeoutPromise]).then(function (result) {
                        return result.value;
                    }));
                }
                else {
                    resultPromises.push(winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel())); // We need this empty promise because we are using the throttler below!
                }
                // File Results
                resultPromises.push(_this.openFileHandler.getResults(searchValue).then(function (results) {
                    receivedFileResults = true;
                    return results;
                }));
                // Join and sort unified
                _this.pendingSearch = winjs_base_1.TPromise.join(resultPromises).then(function (results) {
                    _this.pendingSearch = null;
                    // If the quick open widget has been closed meanwhile, ignore the result
                    if (_this.isClosed) {
                        return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel());
                    }
                    // Combine symbol results and file results
                    var result = results[0].entries.concat(results[1].entries);
                    // Sort
                    var normalizedSearchValue = strings.stripWildcards(searchValue).toLowerCase();
                    result.sort(function (elementA, elementB) { return quickOpenModel_1.QuickOpenEntry.compareByScore(elementA, elementB, searchValue, normalizedSearchValue, _this.scorerCache); });
                    // Apply Range
                    result.forEach(function (element) {
                        if (element instanceof openFileHandler_1.FileEntry) {
                            element.setRange(searchWithRange ? searchWithRange.range : null);
                        }
                    });
                    // Cache for fast lookup
                    _this.resultsToSearchCache[searchValue] = result;
                    // Cap the number of results to make the view snappy
                    var viewResults = result.length > OpenAnythingHandler.MAX_DISPLAYED_RESULTS ? result.slice(0, OpenAnythingHandler.MAX_DISPLAYED_RESULTS) : result;
                    // Apply highlights to file entries
                    viewResults.forEach(function (entry) {
                        if (entry instanceof openFileHandler_1.FileEntry) {
                            var _a = quickOpenModel_1.QuickOpenEntry.highlight(entry, searchValue, true /* fuzzy highlight */), labelHighlights = _a.labelHighlights, descriptionHighlights = _a.descriptionHighlights;
                            entry.setHighlights(labelHighlights, descriptionHighlights);
                        }
                    });
                    return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel(viewResults));
                }, function (error) {
                    _this.pendingSearch = null;
                    _this.messageService.show(message_1.Severity.Error, error);
                });
                return _this.pendingSearch;
            };
            // Trigger through delayer to prevent accumulation while the user is typing
            return this.delayer.trigger(promiseFactory);
        };
        OpenAnythingHandler.prototype.extractRange = function (value) {
            var range = null;
            // Find Line/Column number from search value using RegExp
            var patternMatch = OpenAnythingHandler.LINE_COLON_PATTERN.exec(value);
            if (patternMatch && patternMatch.length > 1) {
                var startLineNumber = parseInt(patternMatch[1], 10);
                // Line Number
                if (types.isNumber(startLineNumber)) {
                    range = {
                        startLineNumber: startLineNumber,
                        startColumn: 1,
                        endLineNumber: startLineNumber,
                        endColumn: 1
                    };
                    // Column Number
                    if (patternMatch.length > 3) {
                        var startColumn = parseInt(patternMatch[3], 10);
                        if (types.isNumber(startColumn)) {
                            range.startColumn = startColumn;
                            range.endColumn = startColumn;
                        }
                    }
                }
                else if (patternMatch[1] === '') {
                    range = {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: 1
                    };
                }
            }
            if (range) {
                return {
                    search: value.substr(0, patternMatch.index),
                    range: range
                };
            }
            return null;
        };
        OpenAnythingHandler.prototype.getResultsFromCache = function (searchValue, range) {
            var _this = this;
            if (range === void 0) { range = null; }
            if (paths.isAbsolute(searchValue)) {
                return null; // bypass cache if user looks up an absolute path where matching goes directly on disk
            }
            // Find cache entries by prefix of search value
            var cachedEntries;
            for (var previousSearch in this.resultsToSearchCache) {
                // If we narrow down, we might be able to reuse the cached results
                if (searchValue.indexOf(previousSearch) === 0) {
                    if (searchValue.indexOf(paths.nativeSep) >= 0 && previousSearch.indexOf(paths.nativeSep) < 0) {
                        continue; // since a path character widens the search for potential more matches, require it in previous search too
                    }
                    cachedEntries = this.resultsToSearchCache[previousSearch];
                    break;
                }
            }
            if (!cachedEntries) {
                return null;
            }
            // Pattern match on results and adjust highlights
            var results = [];
            var normalizedSearchValueLowercase = strings.stripWildcards(searchValue).toLowerCase();
            for (var i = 0; i < cachedEntries.length; i++) {
                var entry = cachedEntries[i];
                // Check for file entries if range is used
                if (range && !(entry instanceof openFileHandler_1.FileEntry)) {
                    continue;
                }
                // Check if this entry is a match for the search value
                var resource = entry.getResource(); // can be null for symbol results!
                var targetToMatch = resource ? labels.getPathLabel(resource, this.contextService) : entry.getLabel();
                if (!scorer.matches(targetToMatch, normalizedSearchValueLowercase)) {
                    continue;
                }
                results.push(entry);
            }
            // Sort
            results.sort(function (elementA, elementB) { return quickOpenModel_1.QuickOpenEntry.compareByScore(elementA, elementB, searchValue, normalizedSearchValueLowercase, _this.scorerCache); });
            // Apply Range
            results.forEach(function (element) {
                if (element instanceof openFileHandler_1.FileEntry) {
                    element.setRange(range);
                }
            });
            // Cap the number of results to make the view snappy
            var viewResults = results.length > OpenAnythingHandler.MAX_DISPLAYED_RESULTS ? results.slice(0, OpenAnythingHandler.MAX_DISPLAYED_RESULTS) : results;
            // Apply highlights
            viewResults.forEach(function (entry) {
                var _a = quickOpenModel_1.QuickOpenEntry.highlight(entry, searchValue, true /* fuzzy highlight */), labelHighlights = _a.labelHighlights, descriptionHighlights = _a.descriptionHighlights;
                entry.setHighlights(labelHighlights, descriptionHighlights);
            });
            return viewResults;
        };
        OpenAnythingHandler.prototype.getGroupLabel = function () {
            return nls.localize(0, null);
        };
        OpenAnythingHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: true
            };
        };
        OpenAnythingHandler.prototype.onClose = function (canceled) {
            this.isClosed = true;
            // Cancel any pending search
            this.cancelPendingSearch();
            // Clear Cache
            this.resultsToSearchCache = Object.create(null);
            this.scorerCache = Object.create(null);
            // Propagate
            this.openSymbolHandler.onClose(canceled);
            this.openFileHandler.onClose(canceled);
        };
        OpenAnythingHandler.prototype.cancelPendingSearch = function () {
            if (this.pendingSearch) {
                this.pendingSearch.cancel();
                this.pendingSearch = null;
            }
        };
        OpenAnythingHandler.LINE_COLON_PATTERN = /[#|:|\(](\d*)([#|:|,](\d*))?\)?$/;
        OpenAnythingHandler.SYMBOL_SEARCH_INITIAL_TIMEOUT = 500; // Ignore symbol search after a timeout to not block search results
        OpenAnythingHandler.SYMBOL_SEARCH_SUBSEQUENT_TIMEOUT = 100;
        OpenAnythingHandler.SEARCH_DELAY = 300; // This delay accommodates for the user typing a word and then stops typing to start searching
        OpenAnythingHandler.MAX_DISPLAYED_RESULTS = 512;
        OpenAnythingHandler = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, contextService_1.IWorkspaceContextService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, configuration_1.IConfigurationService)
        ], OpenAnythingHandler);
        return OpenAnythingHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.OpenAnythingHandler = OpenAnythingHandler;
});
//# sourceMappingURL=openAnythingHandler.js.map