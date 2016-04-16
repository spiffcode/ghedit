define(["require", "exports", 'vs/base/common/event', 'vs/editor/common/services/codeEditorService'], function (require, exports, event_1, codeEditorService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var AbstractCodeEditorService = (function () {
        function AbstractCodeEditorService() {
            this.serviceId = codeEditorService_1.ICodeEditorService;
            this._codeEditors = Object.create(null);
            this._onCodeEditorAdd = new event_1.Emitter();
            this._onCodeEditorRemove = new event_1.Emitter();
        }
        AbstractCodeEditorService.prototype.addCodeEditor = function (editor) {
            this._codeEditors[editor.getId()] = editor;
            this._onCodeEditorAdd.fire(editor);
        };
        Object.defineProperty(AbstractCodeEditorService.prototype, "onCodeEditorAdd", {
            get: function () {
                return this._onCodeEditorAdd.event;
            },
            enumerable: true,
            configurable: true
        });
        AbstractCodeEditorService.prototype.removeCodeEditor = function (editor) {
            if (delete this._codeEditors[editor.getId()]) {
                this._onCodeEditorRemove.fire(editor);
            }
        };
        Object.defineProperty(AbstractCodeEditorService.prototype, "onCodeEditorRemove", {
            get: function () {
                return this._onCodeEditorRemove.event;
            },
            enumerable: true,
            configurable: true
        });
        AbstractCodeEditorService.prototype.getCodeEditor = function (editorId) {
            return this._codeEditors[editorId] || null;
        };
        AbstractCodeEditorService.prototype.listCodeEditors = function () {
            var _this = this;
            return Object.keys(this._codeEditors).map(function (id) { return _this._codeEditors[id]; });
        };
        return AbstractCodeEditorService;
    }());
    exports.AbstractCodeEditorService = AbstractCodeEditorService;
});
