var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/multicursor/common/multicursor', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/editor/common/editorAction', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions'], function (require, exports, nls, keyCodes_1, winjs_base_1, editorAction_1, editorCommon_1, editorCommonExtensions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var InsertCursorAbove = (function (_super) {
        __extends(InsertCursorAbove, _super);
        function InsertCursorAbove(descriptor, editor) {
            _super.call(this, descriptor, editor, editorCommon_1.Handler.AddCursorUp);
        }
        InsertCursorAbove.ID = 'editor.action.insertCursorAbove';
        return InsertCursorAbove;
    }(editorAction_1.HandlerEditorAction));
    var InsertCursorBelow = (function (_super) {
        __extends(InsertCursorBelow, _super);
        function InsertCursorBelow(descriptor, editor) {
            _super.call(this, descriptor, editor, editorCommon_1.Handler.AddCursorDown);
        }
        InsertCursorBelow.ID = 'editor.action.insertCursorBelow';
        return InsertCursorBelow;
    }(editorAction_1.HandlerEditorAction));
    var InsertCursorAtEndOfEachLineSelected = (function (_super) {
        __extends(InsertCursorAtEndOfEachLineSelected, _super);
        function InsertCursorAtEndOfEachLineSelected(descriptor, editor) {
            _super.call(this, descriptor, editor);
        }
        InsertCursorAtEndOfEachLineSelected.prototype.run = function () {
            var selection = this.editor.getSelection();
            if (!selection.isEmpty()) {
                var model = this.editor.getModel();
                var newSelections = new Array();
                var selectionStart = selection.getStartPosition();
                var selectionEnd = selection.getEndPosition();
                for (var i = selectionStart.lineNumber; i <= selectionEnd.lineNumber; i++) {
                    if (i !== selectionEnd.lineNumber) {
                        var currentLineMaxColumn = model.getLineMaxColumn(i);
                        newSelections.push({
                            selectionStartLineNumber: i,
                            selectionStartColumn: currentLineMaxColumn,
                            positionLineNumber: i,
                            positionColumn: currentLineMaxColumn
                        });
                    }
                    else if (selectionEnd.column > 0) {
                        newSelections.push({
                            selectionStartLineNumber: selectionEnd.lineNumber,
                            selectionStartColumn: selectionEnd.column,
                            positionLineNumber: selectionEnd.lineNumber,
                            positionColumn: selectionEnd.column
                        });
                    }
                }
                this.editor.setSelections(newSelections);
            }
            return winjs_base_1.TPromise.as(true);
        };
        InsertCursorAtEndOfEachLineSelected.ID = 'editor.action.insertCursorAtEndOfEachLineSelected';
        return InsertCursorAtEndOfEachLineSelected;
    }(editorAction_1.EditorAction));
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(InsertCursorAbove, InsertCursorAbove.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.UpArrow,
        linux: {
            primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.UpArrow,
            secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.UpArrow]
        }
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(InsertCursorBelow, InsertCursorBelow.ID, nls.localize(1, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.DownArrow,
        linux: {
            primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.DownArrow,
            secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.DownArrow]
        }
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(InsertCursorAtEndOfEachLineSelected, InsertCursorAtEndOfEachLineSelected.ID, nls.localize(2, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_I
    }));
});
//# sourceMappingURL=multicursor.js.map