var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/comment/common/comment', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/editor/common/editorAction', 'vs/editor/common/editorCommonExtensions', './blockCommentCommand', './lineCommentCommand'], function (require, exports, nls, keyCodes_1, winjs_base_1, editorAction_1, editorCommonExtensions_1, blockCommentCommand_1, lineCommentCommand_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var CommentLineAction = (function (_super) {
        __extends(CommentLineAction, _super);
        function CommentLineAction(descriptor, editor, type) {
            _super.call(this, descriptor, editor);
            this._type = type;
        }
        CommentLineAction.prototype.run = function () {
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var commands = [];
            var selections = this.editor.getSelections();
            var opts = model.getOptions();
            for (var i = 0; i < selections.length; i++) {
                commands.push(new lineCommentCommand_1.LineCommentCommand(selections[i], opts.tabSize, this._type));
            }
            this.editor.executeCommands(this.id, commands);
            return winjs_base_1.TPromise.as(null);
        };
        CommentLineAction.ID = 'editor.action.commentLine';
        return CommentLineAction;
    }(editorAction_1.EditorAction));
    var ToggleCommentLineAction = (function (_super) {
        __extends(ToggleCommentLineAction, _super);
        function ToggleCommentLineAction(descriptor, editor) {
            _super.call(this, descriptor, editor, lineCommentCommand_1.Type.Toggle);
        }
        ToggleCommentLineAction.ID = 'editor.action.commentLine';
        return ToggleCommentLineAction;
    }(CommentLineAction));
    var AddLineCommentAction = (function (_super) {
        __extends(AddLineCommentAction, _super);
        function AddLineCommentAction(descriptor, editor) {
            _super.call(this, descriptor, editor, lineCommentCommand_1.Type.ForceAdd);
        }
        AddLineCommentAction.ID = 'editor.action.addCommentLine';
        return AddLineCommentAction;
    }(CommentLineAction));
    var RemoveLineCommentAction = (function (_super) {
        __extends(RemoveLineCommentAction, _super);
        function RemoveLineCommentAction(descriptor, editor) {
            _super.call(this, descriptor, editor, lineCommentCommand_1.Type.ForceRemove);
        }
        RemoveLineCommentAction.ID = 'editor.action.removeCommentLine';
        return RemoveLineCommentAction;
    }(CommentLineAction));
    var BlockCommentAction = (function (_super) {
        __extends(BlockCommentAction, _super);
        function BlockCommentAction(descriptor, editor) {
            _super.call(this, descriptor, editor);
        }
        BlockCommentAction.prototype.run = function () {
            var commands = [];
            var selections = this.editor.getSelections();
            for (var i = 0; i < selections.length; i++) {
                commands.push(new blockCommentCommand_1.BlockCommentCommand(selections[i]));
            }
            this.editor.executeCommands(this.id, commands);
            return winjs_base_1.TPromise.as(null);
        };
        BlockCommentAction.ID = 'editor.action.blockComment';
        return BlockCommentAction;
    }(editorAction_1.EditorAction));
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(ToggleCommentLineAction, ToggleCommentLineAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.US_SLASH
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(AddLineCommentAction, AddLineCommentAction.ID, nls.localize(1, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_C)
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(RemoveLineCommentAction, RemoveLineCommentAction.ID, nls.localize(2, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_U)
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(BlockCommentAction, BlockCommentAction.ID, nls.localize(3, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_A,
        linux: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_A }
    }));
});
//# sourceMappingURL=comment.js.map