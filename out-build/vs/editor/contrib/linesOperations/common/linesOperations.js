var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/editor/contrib/linesOperations/common/sortLinesCommand', 'vs/editor/common/commands/trimTrailingWhitespaceCommand', 'vs/editor/common/editorAction', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', './copyLinesCommand', './deleteLinesCommand', './moveLinesCommand'], function (require, exports, nls, keyCodes_1, winjs_base_1, sortLinesCommand_1, trimTrailingWhitespaceCommand_1, editorAction_1, editorCommon_1, editorCommonExtensions_1, copyLinesCommand_1, deleteLinesCommand_1, moveLinesCommand_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // copy lines
    var CopyLinesAction = (function (_super) {
        __extends(CopyLinesAction, _super);
        function CopyLinesAction(descriptor, editor, down) {
            _super.call(this, descriptor, editor);
            this.down = down;
        }
        CopyLinesAction.prototype.run = function () {
            var commands = [];
            var selections = this.editor.getSelections();
            for (var i = 0; i < selections.length; i++) {
                commands.push(new copyLinesCommand_1.CopyLinesCommand(selections[i], this.down));
            }
            this.editor.executeCommands(this.id, commands);
            return winjs_base_1.TPromise.as(true);
        };
        return CopyLinesAction;
    }(editorAction_1.EditorAction));
    var CopyLinesUpAction = (function (_super) {
        __extends(CopyLinesUpAction, _super);
        function CopyLinesUpAction(descriptor, editor) {
            _super.call(this, descriptor, editor, false);
        }
        CopyLinesUpAction.ID = 'editor.action.copyLinesUpAction';
        return CopyLinesUpAction;
    }(CopyLinesAction));
    var CopyLinesDownAction = (function (_super) {
        __extends(CopyLinesDownAction, _super);
        function CopyLinesDownAction(descriptor, editor) {
            _super.call(this, descriptor, editor, true);
        }
        CopyLinesDownAction.ID = 'editor.action.copyLinesDownAction';
        return CopyLinesDownAction;
    }(CopyLinesAction));
    // move lines
    var MoveLinesAction = (function (_super) {
        __extends(MoveLinesAction, _super);
        function MoveLinesAction(descriptor, editor, down) {
            _super.call(this, descriptor, editor);
            this.down = down;
        }
        MoveLinesAction.prototype.run = function () {
            var commands = [];
            var selections = this.editor.getSelections();
            for (var i = 0; i < selections.length; i++) {
                commands.push(new moveLinesCommand_1.MoveLinesCommand(selections[i], this.down));
            }
            this.editor.executeCommands(this.id, commands);
            return winjs_base_1.TPromise.as(true);
        };
        return MoveLinesAction;
    }(editorAction_1.EditorAction));
    var MoveLinesUpAction = (function (_super) {
        __extends(MoveLinesUpAction, _super);
        function MoveLinesUpAction(descriptor, editor) {
            _super.call(this, descriptor, editor, false);
        }
        MoveLinesUpAction.ID = 'editor.action.moveLinesUpAction';
        return MoveLinesUpAction;
    }(MoveLinesAction));
    var MoveLinesDownAction = (function (_super) {
        __extends(MoveLinesDownAction, _super);
        function MoveLinesDownAction(descriptor, editor) {
            _super.call(this, descriptor, editor, true);
        }
        MoveLinesDownAction.ID = 'editor.action.moveLinesDownAction';
        return MoveLinesDownAction;
    }(MoveLinesAction));
    var SortLinesAction = (function (_super) {
        __extends(SortLinesAction, _super);
        function SortLinesAction(descriptor, editor, descending) {
            _super.call(this, descriptor, editor);
            this.descending = descending;
        }
        SortLinesAction.prototype.run = function () {
            var command = new sortLinesCommand_1.SortLinesCommand(this.editor.getSelection(), this.descending);
            this.editor.executeCommands(this.id, [command]);
            return winjs_base_1.TPromise.as(true);
        };
        return SortLinesAction;
    }(editorAction_1.EditorAction));
    var SortLinesAscendingAction = (function (_super) {
        __extends(SortLinesAscendingAction, _super);
        function SortLinesAscendingAction(descriptor, editor) {
            _super.call(this, descriptor, editor, false);
        }
        SortLinesAscendingAction.ID = 'editor.action.sortLinesAscending';
        return SortLinesAscendingAction;
    }(SortLinesAction));
    var SortLinesDescendingAction = (function (_super) {
        __extends(SortLinesDescendingAction, _super);
        function SortLinesDescendingAction(descriptor, editor) {
            _super.call(this, descriptor, editor, true);
        }
        SortLinesDescendingAction.ID = 'editor.action.sortLinesDescending';
        return SortLinesDescendingAction;
    }(SortLinesAction));
    var TrimTrailingWhitespaceAction = (function (_super) {
        __extends(TrimTrailingWhitespaceAction, _super);
        function TrimTrailingWhitespaceAction(descriptor, editor) {
            _super.call(this, descriptor, editor);
        }
        TrimTrailingWhitespaceAction.prototype.run = function () {
            var command = new trimTrailingWhitespaceCommand_1.TrimTrailingWhitespaceCommand(this.editor.getSelection());
            this.editor.executeCommands(this.id, [command]);
            return winjs_base_1.TPromise.as(true);
        };
        TrimTrailingWhitespaceAction.ID = 'editor.action.trimTrailingWhitespace';
        return TrimTrailingWhitespaceAction;
    }(editorAction_1.EditorAction));
    exports.TrimTrailingWhitespaceAction = TrimTrailingWhitespaceAction;
    var AbstractRemoveLinesAction = (function (_super) {
        __extends(AbstractRemoveLinesAction, _super);
        function AbstractRemoveLinesAction(descriptor, editor) {
            _super.call(this, descriptor, editor);
        }
        AbstractRemoveLinesAction.prototype._getLinesToRemove = function () {
            // Construct delete operations
            var operations = this.editor.getSelections().map(function (s) {
                var endLineNumber = s.endLineNumber;
                if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
                    endLineNumber -= 1;
                }
                return {
                    startLineNumber: s.startLineNumber,
                    endLineNumber: endLineNumber,
                    positionColumn: s.positionColumn
                };
            });
            // Sort delete operations
            operations.sort(function (a, b) {
                return a.startLineNumber - b.startLineNumber;
            });
            // Merge delete operations on consecutive lines
            var mergedOperations = [];
            var previousOperation = operations[0];
            for (var i = 1; i < operations.length; i++) {
                if (previousOperation.endLineNumber + 1 === operations[i].startLineNumber) {
                    // Merge current operations into the previous one
                    previousOperation.endLineNumber = operations[i].endLineNumber;
                }
                else {
                    // Push previous operation
                    mergedOperations.push(previousOperation);
                    previousOperation = operations[i];
                }
            }
            // Push the last operation
            mergedOperations.push(previousOperation);
            return mergedOperations;
        };
        return AbstractRemoveLinesAction;
    }(editorAction_1.EditorAction));
    var DeleteLinesAction = (function (_super) {
        __extends(DeleteLinesAction, _super);
        function DeleteLinesAction(descriptor, editor) {
            _super.call(this, descriptor, editor);
        }
        DeleteLinesAction.prototype.run = function () {
            var ops = this._getLinesToRemove();
            // Finally, construct the delete lines commands
            var commands = ops.map(function (op) {
                return new deleteLinesCommand_1.DeleteLinesCommand(op.startLineNumber, op.endLineNumber, op.positionColumn);
            });
            this.editor.executeCommands(this.id, commands);
            return winjs_base_1.TPromise.as(true);
        };
        DeleteLinesAction.ID = 'editor.action.deleteLines';
        return DeleteLinesAction;
    }(AbstractRemoveLinesAction));
    var IndentLinesAction = (function (_super) {
        __extends(IndentLinesAction, _super);
        function IndentLinesAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorCommon_1.Handler.Indent);
        }
        IndentLinesAction.ID = 'editor.action.indentLines';
        return IndentLinesAction;
    }(editorAction_1.HandlerEditorAction));
    var OutdentLinesAction = (function (_super) {
        __extends(OutdentLinesAction, _super);
        function OutdentLinesAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorCommon_1.Handler.Outdent);
        }
        OutdentLinesAction.ID = 'editor.action.outdentLines';
        return OutdentLinesAction;
    }(editorAction_1.HandlerEditorAction));
    var InsertLineBeforeAction = (function (_super) {
        __extends(InsertLineBeforeAction, _super);
        function InsertLineBeforeAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorCommon_1.Handler.LineInsertBefore);
        }
        InsertLineBeforeAction.ID = 'editor.action.insertLineBefore';
        return InsertLineBeforeAction;
    }(editorAction_1.HandlerEditorAction));
    var InsertLineAfterAction = (function (_super) {
        __extends(InsertLineAfterAction, _super);
        function InsertLineAfterAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorCommon_1.Handler.LineInsertAfter);
        }
        InsertLineAfterAction.ID = 'editor.action.insertLineAfter';
        return InsertLineAfterAction;
    }(editorAction_1.HandlerEditorAction));
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(DeleteLinesAction, DeleteLinesAction.ID, nls.localize('lines.delete', "Delete Line"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_K
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(SortLinesAscendingAction, SortLinesAscendingAction.ID, nls.localize('lines.sortAscending', "Sort Lines Ascending"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_2
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(SortLinesDescendingAction, SortLinesDescendingAction.ID, nls.localize('lines.sortDescending', "Sort Lines Descending"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_3
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(TrimTrailingWhitespaceAction, TrimTrailingWhitespaceAction.ID, nls.localize('lines.trimTrailingWhitespace', "Trim Trailing Whitespace"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_X
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(MoveLinesDownAction, MoveLinesDownAction.ID, nls.localize('lines.moveDown', "Move Line Down"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.DownArrow,
        linux: { primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.DownArrow }
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(MoveLinesUpAction, MoveLinesUpAction.ID, nls.localize('lines.moveUp', "Move Line Up"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.UpArrow,
        linux: { primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.UpArrow }
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(CopyLinesDownAction, CopyLinesDownAction.ID, nls.localize('lines.copyDown', "Copy Line Down"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.DownArrow,
        linux: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.DownArrow }
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(CopyLinesUpAction, CopyLinesUpAction.ID, nls.localize('lines.copyUp', "Copy Line Up"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.UpArrow,
        linux: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.UpArrow }
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(IndentLinesAction, IndentLinesAction.ID, nls.localize('lines.indent', "Indent Line"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.US_CLOSE_SQUARE_BRACKET
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(OutdentLinesAction, OutdentLinesAction.ID, nls.localize('lines.outdent', "Outdent Line"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.US_OPEN_SQUARE_BRACKET
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(InsertLineBeforeAction, InsertLineBeforeAction.ID, nls.localize('lines.insertBefore', "Insert Line Above"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Enter
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(InsertLineAfterAction, InsertLineAfterAction.ID, nls.localize('lines.insertAfter', "Insert Line Below"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.Enter
    }));
});
