define(["require", "exports", 'vs/nls!vs/editor/contrib/quickOpen/browser/gotoLine.contribution', 'vs/base/common/keyCodes', 'vs/editor/common/editorCommonExtensions', './gotoLine'], function (require, exports, nls, keyCodes_1, editorCommonExtensions_1, gotoLine_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // Contribute Ctrl+G to "Go to line" using quick open
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(gotoLine_1.GotoLineAction, gotoLine_1.GotoLineAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_G,
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_G }
    }));
});
//# sourceMappingURL=gotoLine.contribution.js.map