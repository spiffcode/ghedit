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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/search/browser/openFileHandler', 'vs/base/common/paths', 'vs/base/common/labels', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/workbench/browser/quickopen', 'vs/workbench/parts/search/common/searchQuery', 'vs/workbench/parts/files/common/files', 'vs/workbench/services/editor/common/editorService', 'vs/platform/configuration/common/configuration', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/search/common/search', 'vs/platform/workspace/common/workspace'], function (require, exports, winjs_base_1, nls, paths, labels, quickOpenModel_1, quickopen_1, searchQuery_1, files_1, editorService_1, configuration_1, instantiation_1, message_1, search_1, workspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FileEntry = (function (_super) {
        __extends(FileEntry, _super);
        function FileEntry(name, description, resource, editorService, instantiationService, contextService) {
            _super.call(this, editorService);
            this.instantiationService = instantiationService;
            this.resource = resource;
            this.name = name;
            this.description = description;
        }
        FileEntry.prototype.getLabel = function () {
            return this.name;
        };
        FileEntry.prototype.getAriaLabel = function () {
            return nls.localize(0, null, this.getLabel());
        };
        FileEntry.prototype.getDescription = function () {
            return this.description;
        };
        FileEntry.prototype.getIcon = function () {
            return 'file';
        };
        FileEntry.prototype.getResource = function () {
            return this.resource;
        };
        FileEntry.prototype.setRange = function (range) {
            this.range = range;
        };
        FileEntry.prototype.getInput = function () {
            var input = {
                resource: this.resource,
            };
            if (this.range) {
                input.options = {
                    selection: this.range
                };
            }
            return input;
        };
        FileEntry = __decorate([
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, workspace_1.IWorkspaceContextService)
        ], FileEntry);
        return FileEntry;
    }(quickopen_1.EditorQuickOpenEntry));
    exports.FileEntry = FileEntry;
    var OpenFileHandler = (function (_super) {
        __extends(OpenFileHandler, _super);
        function OpenFileHandler(editorService, messageService, instantiationService, configurationService, contextService, textFileService, searchService) {
            _super.call(this);
            this.editorService = editorService;
            this.messageService = messageService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.textFileService = textFileService;
            this.searchService = searchService;
            this.queryBuilder = this.instantiationService.createInstance(searchQuery_1.QueryBuilder);
        }
        OpenFileHandler.prototype.getResults = function (searchValue) {
            searchValue = searchValue.trim();
            var promise;
            // Respond directly to empty search
            if (!searchValue) {
                promise = winjs_base_1.TPromise.as([]);
            }
            else {
                promise = this.doFindResults(searchValue);
            }
            return promise.then(function (e) { return new quickOpenModel_1.QuickOpenModel(e); });
        };
        OpenFileHandler.prototype.doFindResults = function (searchValue) {
            var _this = this;
            var query = {
                folderResources: this.contextService.getWorkspace() ? [this.contextService.getWorkspace().resource] : [],
                extraFileResources: this.textFileService.getWorkingFilesModel().getOutOfWorkspaceContextEntries().map(function (e) { return e.resource; }),
                filePattern: searchValue
            };
            return this.searchService.search(this.queryBuilder.file(query)).then(function (complete) {
                var results = [];
                for (var i = 0; i < complete.results.length; i++) {
                    var fileMatch = complete.results[i];
                    var label = paths.basename(fileMatch.resource.fsPath);
                    var description = labels.getPathLabel(paths.dirname(fileMatch.resource.fsPath), _this.contextService);
                    results.push(_this.instantiationService.createInstance(FileEntry, label, description, fileMatch.resource));
                }
                return results;
            });
        };
        OpenFileHandler.prototype.getGroupLabel = function () {
            return nls.localize(1, null);
        };
        OpenFileHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: true
            };
        };
        OpenFileHandler = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, message_1.IMessageService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, workspace_1.IWorkspaceContextService),
            __param(5, files_1.ITextFileService),
            __param(6, search_1.ISearchService)
        ], OpenFileHandler);
        return OpenFileHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.OpenFileHandler = OpenFileHandler;
});
//# sourceMappingURL=openFileHandler.js.map