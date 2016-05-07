define(["require", "exports", 'vs/nls!vs/editor/contrib/quickOpen/browser/quickCommand.contribution', 'vs/base/common/keyCodes', 'vs/base/browser/browser', 'vs/editor/common/editorCommonExtensions', './quickCommand'], function (require, exports, nls, keyCodes_1, browser, editorCommonExtensions_1, quickCommand_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // Contribute "Quick Command" to context menu
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(quickCommand_1.QuickCommandAction, quickCommand_1.QuickCommandAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: (browser.isIE11orEarlier ? keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.F1 : keyCodes_1.KeyCode.F1)
    }));
});
//# sourceMappingURL=quickCommand.contribution.js.map