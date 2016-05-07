/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/clipboard/browser/clipboard', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/base/browser/browser', 'vs/editor/common/config/config', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/css!./clipboard'], function (require, exports, nls, keyCodes_1, lifecycle_1, winjs_base_1, browser, config_1, editorAction_1, editorActionEnablement_1, editorCommon, editorCommonExtensions_1) {
    'use strict';
    var ClipboardWritingAction = (function (_super) {
        __extends(ClipboardWritingAction, _super);
        function ClipboardWritingAction(descriptor, editor, condition) {
            var _this = this;
            _super.call(this, descriptor, editor, condition);
            this.toUnhook = [];
            this.toUnhook.push(this.editor.addListener(editorCommon.EventType.CursorSelectionChanged, function (e) {
                _this.resetEnablementState();
            }));
        }
        ClipboardWritingAction.prototype.dispose = function () {
            this.toUnhook = lifecycle_1.cAll(this.toUnhook);
            _super.prototype.dispose.call(this);
        };
        ClipboardWritingAction.prototype.getEnablementState = function () {
            if (browser.enableEmptySelectionClipboard) {
                return true;
            }
            else {
                return !this.editor.getSelection().isEmpty();
            }
        };
        return ClipboardWritingAction;
    }(editorAction_1.EditorAction));
    function editorCursorIsInEditableRange(editor) {
        var model = editor.getModel();
        if (!model) {
            return false;
        }
        var hasEditableRange = model.hasEditableRange();
        if (!hasEditableRange) {
            return true;
        }
        var editableRange = model.getEditableRange();
        var editorPosition = editor.getPosition();
        return editableRange.containsPosition(editorPosition);
    }
    var ExecCommandCutAction = (function (_super) {
        __extends(ExecCommandCutAction, _super);
        function ExecCommandCutAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.Writeable | editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.ShowInContextMenu | editorActionEnablement_1.Behaviour.UpdateOnCursorPositionChange);
        }
        ExecCommandCutAction.prototype.getGroupId = function () {
            return '3_edit/1_cut';
        };
        ExecCommandCutAction.prototype.getEnablementState = function () {
            return _super.prototype.getEnablementState.call(this) && editorCursorIsInEditableRange(this.editor);
        };
        ExecCommandCutAction.prototype.run = function () {
            this.editor.focus();
            document.execCommand('cut');
            return winjs_base_1.TPromise.as(true);
        };
        return ExecCommandCutAction;
    }(ClipboardWritingAction));
    var ExecCommandCopyAction = (function (_super) {
        __extends(ExecCommandCopyAction, _super);
        function ExecCommandCopyAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.ShowInContextMenu);
        }
        ExecCommandCopyAction.prototype.getGroupId = function () {
            return '3_edit/2_copy';
        };
        ExecCommandCopyAction.prototype.run = function () {
            this.editor.focus();
            document.execCommand('copy');
            return winjs_base_1.TPromise.as(true);
        };
        return ExecCommandCopyAction;
    }(ClipboardWritingAction));
    var ExecCommandPasteAction = (function (_super) {
        __extends(ExecCommandPasteAction, _super);
        function ExecCommandPasteAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.Writeable | editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.ShowInContextMenu | editorActionEnablement_1.Behaviour.UpdateOnCursorPositionChange);
        }
        ExecCommandPasteAction.prototype.getGroupId = function () {
            return '3_edit/3_paste';
        };
        ExecCommandPasteAction.prototype.getEnablementState = function () {
            return editorCursorIsInEditableRange(this.editor);
        };
        ExecCommandPasteAction.prototype.run = function () {
            this.editor.focus();
            document.execCommand('paste');
            return null;
        };
        return ExecCommandPasteAction;
    }(editorAction_1.EditorAction));
    function registerClipboardAction(desc) {
        if (!browser.supportsExecCommand(desc.execCommand)) {
            return;
        }
        editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(desc.ctor, desc.id, desc.label, {
            handler: execCommandToHandler.bind(null, desc.id, desc.execCommand),
            context: editorCommonExtensions_1.ContextKey.None,
            primary: desc.primary,
            secondary: desc.secondary,
            win: desc.win,
            linux: desc.linux,
            mac: desc.mac
        }));
    }
    registerClipboardAction({
        ctor: ExecCommandCutAction,
        id: 'editor.action.clipboardCutAction',
        label: nls.localize(0, null),
        execCommand: 'cut',
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_X,
        win: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_X, secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Delete] }
    });
    registerClipboardAction({
        ctor: ExecCommandCopyAction,
        id: 'editor.action.clipboardCopyAction',
        label: nls.localize(1, null),
        execCommand: 'copy',
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_C,
        win: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_C, secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.Insert] }
    });
    registerClipboardAction({
        ctor: ExecCommandPasteAction,
        id: 'editor.action.clipboardPasteAction',
        label: nls.localize(2, null),
        execCommand: 'paste',
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_V,
        win: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_V, secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Insert] }
    });
    function execCommandToHandler(actionId, browserCommand, accessor, args) {
        // If editor text focus
        if (args.context[editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS]) {
            var focusedEditor = config_1.findFocusedEditor(actionId, accessor, args, false);
            if (focusedEditor) {
                focusedEditor.trigger('keyboard', actionId, args);
                return;
            }
        }
        document.execCommand(browserCommand);
    }
});
//# sourceMappingURL=clipboard.js.map