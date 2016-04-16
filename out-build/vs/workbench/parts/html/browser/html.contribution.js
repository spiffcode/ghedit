define(["require", "exports", 'vs/nls!vs/workbench/parts/html/browser/html.contribution', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/services/editor/common/editorService', 'vs/base/common/uri', '../common/htmlInput', 'vs/workbench/parts/html/browser/htmlPreviewPart', 'vs/platform/platform', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/platform/instantiation/common/descriptors'], function (require, exports, nls_1, keybindingsRegistry_1, instantiation_1, editorService_1, uri_1, htmlInput_1, htmlPreviewPart_1, platform_1, baseEditor_1, descriptors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // --- Register Editor
    platform_1.Registry.as(baseEditor_1.Extensions.Editors).registerEditor(new baseEditor_1.EditorDescriptor(htmlPreviewPart_1.HtmlPreviewPart.ID, nls_1.localize(0, null), 'vs/workbench/parts/html/browser/htmlPreviewPart', 'HtmlPreviewPart'), [new descriptors_1.SyncDescriptor(htmlInput_1.HtmlInput)]);
    // --- Register Commands
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
        id: '_workbench.previewHtml',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(0),
        handler: function (accessor, args) {
            var resource = args[0], position = args[1];
            var uri = resource instanceof uri_1.default ? resource : uri_1.default.parse(resource);
            var input = accessor.get(instantiation_1.IInstantiationService).createInstance(htmlInput_1.HtmlInput, uri.fsPath, undefined, uri);
            return accessor.get(editorService_1.IWorkbenchEditorService).openEditor(input, null, position)
                .then(function (editor) { return true; });
        },
        context: undefined,
        primary: undefined
    });
});
//# sourceMappingURL=html.contribution.js.map