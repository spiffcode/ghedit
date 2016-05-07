var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/toggleWordWrap/common/toggleWordWrap', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/editor/common/config/defaultConfig', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommonExtensions'], function (require, exports, nls, keyCodes_1, winjs_base_1, defaultConfig_1, editorAction_1, editorActionEnablement_1, editorCommonExtensions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ToggleWordWrapAction = (function (_super) {
        __extends(ToggleWordWrapAction, _super);
        function ToggleWordWrapAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
        }
        ToggleWordWrapAction.prototype.run = function () {
            var wrappingInfo = this.editor.getConfiguration().wrappingInfo;
            if (!wrappingInfo.isViewportWrapping) {
                wrappingInfo.wrappingColumn = 0;
            }
            else {
                wrappingInfo.wrappingColumn = defaultConfig_1.DefaultConfig.editor.wrappingColumn;
            }
            this.editor.updateOptions(wrappingInfo);
            return winjs_base_1.TPromise.as(true);
        };
        ToggleWordWrapAction.ID = 'editor.action.toggleWordWrap';
        return ToggleWordWrapAction;
    }(editorAction_1.EditorAction));
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(ToggleWordWrapAction, ToggleWordWrapAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_Z,
        mac: { primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_Z },
        linux: { primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_Z }
    }));
});
//# sourceMappingURL=toggleWordWrap.js.map