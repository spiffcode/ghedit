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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/search/browser/openSymbolHandler', 'vs/base/common/async', 'vs/workbench/browser/quickopen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/base/common/filters', 'vs/base/common/labels', 'vs/workbench/services/editor/common/editorService', 'vs/platform/instantiation/common/instantiation', 'vs/platform/workspace/common/workspace', 'vs/editor/common/services/modeService', 'vs/workbench/parts/search/common/search'], function (require, exports, winjs_base_1, nls, async_1, quickopen_1, quickOpenModel_1, filters, labels, editorService_1, instantiation_1, workspace_1, modeService_1, search_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SymbolEntry = (function (_super) {
        __extends(SymbolEntry, _super);
        function SymbolEntry(name, parameters, description, resource, type, range, highlights, editorService) {
            _super.call(this, editorService);
            this.name = name;
            this.parameters = parameters;
            this.description = description;
            this.resource = resource;
            this.type = type;
            this.range = range;
            this.setHighlights(highlights);
        }
        SymbolEntry.prototype.getLabel = function () {
            return this.name + this.parameters;
        };
        SymbolEntry.prototype.getAriaLabel = function () {
            return nls.localize(0, null, this.getLabel());
        };
        SymbolEntry.prototype.getName = function () {
            return this.name;
        };
        SymbolEntry.prototype.getParameters = function () {
            return this.parameters;
        };
        SymbolEntry.prototype.getDescription = function () {
            return this.description;
        };
        SymbolEntry.prototype.getType = function () {
            return this.type;
        };
        SymbolEntry.prototype.getIcon = function () {
            return this.type;
        };
        SymbolEntry.prototype.getInput = function () {
            var input = {
                resource: this.resource,
            };
            if (this.range) {
                input.options = {
                    selection: {
                        startLineNumber: this.range.startLineNumber,
                        startColumn: this.range.startColumn
                    }
                };
            }
            return input;
        };
        return SymbolEntry;
    }(quickopen_1.EditorQuickOpenEntry));
    var OpenSymbolHandler = (function (_super) {
        __extends(OpenSymbolHandler, _super);
        function OpenSymbolHandler(editorService, modeService, instantiationService, contextService) {
            _super.call(this);
            this.editorService = editorService;
            this.modeService = modeService;
            this.instantiationService = instantiationService;
            this.contextService = contextService;
            this.delayer = new async_1.ThrottledDelayer(OpenSymbolHandler.SEARCH_DELAY);
            this.isStandalone = true;
        }
        OpenSymbolHandler.prototype.setStandalone = function (standalone) {
            this.delayer = standalone ? new async_1.ThrottledDelayer(OpenSymbolHandler.SEARCH_DELAY) : null;
            this.isStandalone = standalone;
        };
        OpenSymbolHandler.prototype.canRun = function () {
            return true;
        };
        OpenSymbolHandler.prototype.getResults = function (searchValue) {
            var _this = this;
            searchValue = searchValue.trim();
            var promise;
            // Respond directly to empty search
            if (!searchValue) {
                promise = winjs_base_1.TPromise.as([]);
            }
            else if (this.delayer) {
                promise = this.delayer.trigger(function () { return _this.doGetResults(searchValue); }); // Run search with delay as needed
            }
            else {
                promise = this.doGetResults(searchValue);
            }
            return promise.then(function (e) { return new quickOpenModel_1.QuickOpenModel(e); });
        };
        OpenSymbolHandler.prototype.doGetResults = function (searchValue) {
            var _this = this;
            return search_1.getNavigateToItems(searchValue).then(function (bearings) {
                return _this.toQuickOpenEntries(bearings, searchValue);
            });
        };
        OpenSymbolHandler.prototype.toQuickOpenEntries = function (types, searchValue) {
            var _this = this;
            var results = [];
            // Convert to Entries
            types.forEach(function (element) {
                if (!OpenSymbolHandler.SUPPORTED_OPEN_TYPES.some(function (type) { return element.type === type; })) {
                    return;
                }
                // Find Highlights
                var highlights = filters.matchesFuzzy(searchValue, element.name);
                if (highlights) {
                    var resource = element.resourceUri;
                    if (resource.scheme === 'file') {
                        var path = labels.getPathLabel(resource, _this.contextService);
                        var container = void (0);
                        // Type is top level in module with path spec, use path info then (/folder/file.ts)
                        if (element.containerName === path) {
                            container = path;
                        }
                        else if (element.containerName === resource.toString() && element.containerName.indexOf('/') >= 0) {
                            container = element.containerName.substr(element.containerName.lastIndexOf('/') + 1);
                        }
                        else if (element.containerName && element.containerName.indexOf('.') >= 0) {
                            container = element.containerName.substr(element.containerName.lastIndexOf('.') + 1);
                        }
                        else {
                            container = element.containerName || path;
                        }
                        results.push(new SymbolEntry(element.name, element.parameters, container, resource, element.type, element.range, highlights, _this.editorService));
                    }
                }
            });
            // Sort (Standalone only)
            if (this.isStandalone) {
                return results.sort(this.sort.bind(this, searchValue.toLowerCase()));
            }
            return results;
        };
        OpenSymbolHandler.prototype.sort = function (searchValue, elementA, elementB) {
            // Sort by Type if name is identical
            var elementAName = elementA.getName().toLowerCase();
            var elementBName = elementB.getName().toLowerCase();
            if (elementAName === elementBName) {
                var elementAType = elementA.getType();
                var elementBType = elementB.getType();
                if (elementAType !== elementBType) {
                    return OpenSymbolHandler.SUPPORTED_OPEN_TYPES.indexOf(elementAType) < OpenSymbolHandler.SUPPORTED_OPEN_TYPES.indexOf(elementBType) ? -1 : 1;
                }
            }
            return quickOpenModel_1.QuickOpenEntry.compare(elementA, elementB, searchValue);
        };
        OpenSymbolHandler.prototype.getGroupLabel = function () {
            return nls.localize(1, null);
        };
        OpenSymbolHandler.prototype.getEmptyLabel = function (searchString) {
            if (searchString.length > 0) {
                return nls.localize(2, null);
            }
            return nls.localize(3, null);
        };
        OpenSymbolHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: true,
                autoFocusPrefixMatch: searchValue.trim()
            };
        };
        OpenSymbolHandler.SUPPORTED_OPEN_TYPES = ['class', 'interface', 'enum', 'function', 'method'];
        OpenSymbolHandler.SEARCH_DELAY = 500; // This delay accommodates for the user typing a word and then stops typing to start searching
        OpenSymbolHandler = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, modeService_1.IModeService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], OpenSymbolHandler);
        return OpenSymbolHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.OpenSymbolHandler = OpenSymbolHandler;
});
//# sourceMappingURL=openSymbolHandler.js.map