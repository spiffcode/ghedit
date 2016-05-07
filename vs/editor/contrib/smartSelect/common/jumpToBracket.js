var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/smartSelect/common/jumpToBracket', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions'], function (require, exports, nls, keyCodes_1, winjs_base_1, editorAction_1, editorActionEnablement_1, editorCommon_1, editorCommonExtensions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SelectBracketAction = (function (_super) {
        __extends(SelectBracketAction, _super);
        function SelectBracketAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
        }
        SelectBracketAction.prototype.run = function () {
            this.editor.trigger(this.id, editorCommon_1.Handler.JumpToBracket, {});
            return winjs_base_1.TPromise.as(true);
        };
        SelectBracketAction.ID = 'editor.action.jumpToBracket';
        return SelectBracketAction;
    }(editorAction_1.EditorAction));
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(SelectBracketAction, SelectBracketAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_BACKSLASH
    }));
});
//# sourceMappingURL=jumpToBracket.js.map