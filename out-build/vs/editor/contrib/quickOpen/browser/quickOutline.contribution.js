define(["require", "exports", 'vs/nls!vs/editor/contrib/quickOpen/browser/quickOutline.contribution', 'vs/base/common/keyCodes', 'vs/editor/common/editorCommonExtensions', './quickOutline'], function (require, exports, nls, keyCodes_1, editorCommonExtensions_1, quickOutline_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // Contribute "Quick Outline" to context menu
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(quickOutline_1.QuickOutlineAction, quickOutline_1.QuickOutlineAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_O
    }));
});
//# sourceMappingURL=quickOutline.contribution.js.map