define(["require", "exports", 'vs/nls!vs/workbench/parts/emmet/node/emmet.contribution', 'vs/platform/platform', 'vs/editor/common/editorCommonExtensions', 'vs/platform/configuration/common/configurationRegistry', 'vs/editor/common/editorCommon', './emmetActions', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/base/common/keyCodes', 'vs/platform/keybinding/common/keybindingService'], function (require, exports, nls, platform_1, editorCommonExtensions_1, configurationRegistry_1, editorCommon, emmetActions_1, keybindingsRegistry_1, keyCodes_1, keybindingService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(emmetActions_1.ExpandAbbreviationAction, emmetActions_1.ExpandAbbreviationAction.ID, nls.localize(0, null)));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandRule({
        id: emmetActions_1.ExpandAbbreviationAction.ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(),
        context: keybindingService_1.KbExpr.and(keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS), keybindingService_1.KbExpr.not(editorCommon.KEYBINDING_CONTEXT_EDITOR_HAS_NON_EMPTY_SELECTION), keybindingService_1.KbExpr.not(editorCommon.KEYBINDING_CONTEXT_EDITOR_HAS_MULTIPLE_SELECTIONS), keybindingService_1.KbExpr.not(editorCommon.KEYBINDING_CONTEXT_EDITOR_TAB_MOVES_FOCUS), keybindingService_1.KbExpr.has('config.emmet.triggerExpansionOnTab')),
        primary: keyCodes_1.KeyCode.Tab
    });
    // Configuration: emmet
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'emmet',
        'order': 7,
        'title': nls.localize(1, null),
        'type': 'object',
        'properties': {
            'emmet.triggerExpansionOnTab': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize(2, null)
            }
        }
    });
});
//# sourceMappingURL=emmet.contribution.js.map