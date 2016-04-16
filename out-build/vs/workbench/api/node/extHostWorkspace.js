var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/errors', 'vs/platform/search/common/search', 'vs/platform/workspace/common/workspace', 'vs/platform/thread/common/thread', 'vs/platform/event/common/event', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/parts/files/common/files', 'vs/editor/common/services/bulkEdit', 'vs/base/common/winjs.base', 'vs/workbench/api/node/extHostTypeConverters'], function (require, exports, errors_1, search_1, workspace_1, thread_1, event_1, editorService_1, files_1, bulkEdit_1, winjs_base_1, extHostTypeConverters_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostWorkspace = (function () {
        function ExtHostWorkspace(threadService, workspacePath) {
            this._proxy = threadService.getRemotable(MainThreadWorkspace);
            this._workspacePath = workspacePath;
        }
        ExtHostWorkspace.prototype.getPath = function () {
            return this._workspacePath;
        };
        ExtHostWorkspace.prototype.getRelativePath = function (pathOrUri) {
            var path;
            if (typeof pathOrUri === 'string') {
                path = pathOrUri;
            }
            else {
                path = pathOrUri.fsPath;
            }
            if (this._workspacePath && this._workspacePath.length < path.length) {
                // return relative(workspacePath, path);
                return path.substring(this._workspacePath.length);
            }
            return path;
        };
        ExtHostWorkspace.prototype.findFiles = function (include, exclude, maxResults, token) {
            var _this = this;
            var requestId = ExtHostWorkspace._requestIdPool++;
            var result = this._proxy.$startSearch(include, exclude, maxResults, requestId);
            if (token) {
                token.onCancellationRequested(function () { return _this._proxy.$cancelSearch(requestId); });
            }
            return result;
        };
        ExtHostWorkspace.prototype.saveAll = function (includeUntitled) {
            return this._proxy.$saveAll(includeUntitled);
        };
        ExtHostWorkspace.prototype.appyEdit = function (edit) {
            var resourceEdits = [];
            var entries = edit.entries();
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                var uri = entry[0], edits = entry[1];
                for (var _a = 0, edits_1 = edits; _a < edits_1.length; _a++) {
                    var edit_1 = edits_1[_a];
                    resourceEdits.push({
                        resource: uri,
                        newText: edit_1.newText,
                        range: extHostTypeConverters_1.fromRange(edit_1.range)
                    });
                }
            }
            return this._proxy.$applyWorkspaceEdit(resourceEdits);
        };
        ExtHostWorkspace._requestIdPool = 0;
        ExtHostWorkspace = __decorate([
            __param(0, thread_1.IThreadService)
        ], ExtHostWorkspace);
        return ExtHostWorkspace;
    }());
    exports.ExtHostWorkspace = ExtHostWorkspace;
    var MainThreadWorkspace = (function () {
        function MainThreadWorkspace(searchService, contextService, textFileService, editorService, eventService) {
            this._activeSearches = Object.create(null);
            this._searchService = searchService;
            this._workspace = contextService.getWorkspace();
            this._textFileService = textFileService;
            this._editorService = editorService;
            this._eventService = eventService;
        }
        MainThreadWorkspace.prototype.$startSearch = function (include, exclude, maxResults, requestId) {
            var _this = this;
            if (!this._workspace) {
                return;
            }
            var search = this._searchService.search({
                folderResources: [this._workspace.resource],
                type: search_1.QueryType.File,
                maxResults: maxResults,
                includePattern: (_a = {}, _a[include] = true, _a),
                excludePattern: (_b = {}, _b[exclude] = true, _b),
            }).then(function (result) {
                return result.results.map(function (m) { return m.resource; });
            }, function (err) {
                if (!errors_1.isPromiseCanceledError(err)) {
                    return winjs_base_1.TPromise.wrapError(err);
                }
            });
            this._activeSearches[requestId] = search;
            var onDone = function () { return delete _this._activeSearches[requestId]; };
            search.done(onDone, onDone);
            return search;
            var _a, _b;
        };
        MainThreadWorkspace.prototype.$cancelSearch = function (requestId) {
            var search = this._activeSearches[requestId];
            if (search) {
                delete this._activeSearches[requestId];
                search.cancel();
                return winjs_base_1.TPromise.as(true);
            }
        };
        MainThreadWorkspace.prototype.$saveAll = function (includeUntitled) {
            return this._textFileService.saveAll(includeUntitled).then(function (result) {
                return result.results.every(function (each) { return each.success === true; });
            });
        };
        MainThreadWorkspace.prototype.$applyWorkspaceEdit = function (edits) {
            var codeEditor;
            var editor = this._editorService.getActiveEditor();
            if (editor) {
                var candidate = editor.getControl();
                if (typeof candidate.getEditorType === 'function') {
                    // enough proof
                    codeEditor = candidate;
                }
            }
            return bulkEdit_1.bulkEdit(this._eventService, this._editorService, codeEditor, edits)
                .then(function () { return true; });
        };
        MainThreadWorkspace = __decorate([
            thread_1.Remotable.MainContext('MainThreadWorkspace'),
            __param(0, search_1.ISearchService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, files_1.ITextFileService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, event_1.IEventService)
        ], MainThreadWorkspace);
        return MainThreadWorkspace;
    }());
    exports.MainThreadWorkspace = MainThreadWorkspace;
});
//# sourceMappingURL=extHostWorkspace.js.map