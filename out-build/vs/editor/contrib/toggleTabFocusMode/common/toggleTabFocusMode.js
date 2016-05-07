var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/toggleTabFocusMode/common/toggleTabFocusMode', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommonExtensions'], function (require, exports, nls, keyCodes_1, winjs_base_1, editorAction_1, editorActionEnablement_1, editorCommonExtensions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ToggleTabFocusModeAction = (function (_super) {
        __extends(ToggleTabFocusModeAction, _super);
        function ToggleTabFocusModeAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
        }
        ToggleTabFocusModeAction.prototype.run = function () {
            if (this.editor.getConfiguration().tabFocusMode) {
                this.editor.updateOptions({ tabFocusMode: false });
            }
            else {
                this.editor.updateOptions({ tabFocusMode: true });
            }
            return winjs_base_1.TPromise.as(true);
        };
        ToggleTabFocusModeAction.ID = 'editor.action.toggleTabFocusMode';
        return ToggleTabFocusModeAction;
    }(editorAction_1.EditorAction));
    exports.ToggleTabFocusModeAction = ToggleTabFocusModeAction;
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(ToggleTabFocusModeAction, ToggleTabFocusModeAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_M,
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_M }
    }));
});
//# sourceMappingURL=toggleTabFocusMode.js.map