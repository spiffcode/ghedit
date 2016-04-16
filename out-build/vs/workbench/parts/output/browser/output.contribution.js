/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls!vs/workbench/parts/output/browser/output.contribution', 'vs/base/common/keyCodes', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes/modesRegistry', 'vs/platform/platform', 'vs/platform/actions/common/actions', 'vs/platform/instantiation/common/extensions', 'vs/workbench/common/actionRegistry', 'vs/workbench/parts/output/common/outputServices', 'vs/workbench/parts/output/browser/outputActions', 'vs/workbench/parts/output/common/output', 'vs/workbench/browser/panel', 'vs/css!../browser/media/output.contribution'], function (require, exports, nls, keyCodes_1, editorCommonExtensions_1, modesRegistry_1, platform, actions_1, extensions_1, actionRegistry_1, outputServices_1, outputActions_1, output_1, panel) {
    "use strict";
    // Register Service
    extensions_1.registerSingleton(output_1.IOutputService, outputServices_1.OutputService);
    // Register Output Mode
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: output_1.OUTPUT_MODE_ID,
        extensions: [],
        aliases: [null],
        mimetypes: [output_1.OUTPUT_MIME],
        moduleId: 'vs/workbench/parts/output/common/outputMode',
        ctorName: 'OutputMode'
    });
    // Register Output Panel
    platform.Registry.as(panel.Extensions.Panels).registerPanel(new panel.PanelDescriptor('vs/workbench/parts/output/browser/outputPanel', 'OutputPanel', output_1.OUTPUT_PANEL_ID, nls.localize(0, null), 'output'));
    // register toggle output action globally
    var actionRegistry = platform.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(outputActions_1.ToggleOutputAction, outputActions_1.ToggleOutputAction.ID, outputActions_1.ToggleOutputAction.LABEL, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_U,
        linux: {
            primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_H // On Ubuntu Ctrl+Shift+U is taken by some global OS command
        }
    }), nls.localize(1, null));
    // Contribute to Context Menu of Output Window
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(outputActions_1.ClearOutputEditorAction, outputActions_1.ClearOutputEditorAction.ID, nls.localize(2, null)));
});
//# sourceMappingURL=output.contribution.js.map