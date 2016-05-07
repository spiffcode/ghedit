/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/platform', 'vs/nls', 'vs/workbench/browser/quickopen', 'vs/platform/platform', 'vs/platform/actions/common/actions', 'vs/workbench/common/actionRegistry', 'vs/base/common/keyCodes', 'vs/workbench/parts/quickopen/browser/gotoSymbolHandler', 'vs/workbench/parts/quickopen/browser/commandsHandler', 'vs/workbench/parts/quickopen/browser/gotoLineHandler', 'vs/workbench/parts/quickopen/browser/helpHandler', 'vs/workbench/parts/quickopen/browser/markersHandler'], function (require, exports, env, nls, quickopen_1, platform_1, actions_1, actionRegistry_1, keyCodes_1, gotoSymbolHandler_1, commandsHandler_1, gotoLineHandler_1, helpHandler_1, markersHandler_1) {
    'use strict';
    // Register Actions
    var registry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(markersHandler_1.GotoMarkerAction, markersHandler_1.GotoMarkerAction.Id, markersHandler_1.GotoMarkerAction.Label, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_M
    }));
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(commandsHandler_1.ShowAllCommandsAction, commandsHandler_1.ShowAllCommandsAction.ID, commandsHandler_1.ShowAllCommandsAction.LABEL, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_P,
        secondary: [keyCodes_1.KeyCode.F1]
    }));
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(gotoLineHandler_1.GotoLineAction, gotoLineHandler_1.GotoLineAction.ID, gotoLineHandler_1.GotoLineAction.LABEL, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_G,
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_G }
    }));
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(gotoSymbolHandler_1.GotoSymbolAction, gotoSymbolHandler_1.GotoSymbolAction.ID, gotoSymbolHandler_1.GotoSymbolAction.LABEL, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_O
    }));
    // Register Quick Open Handler
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor('vs/workbench/parts/quickopen/browser/markersHandler', 'MarkersHandler', markersHandler_1.GotoMarkerAction.Prefix, [
        {
            prefix: markersHandler_1.GotoMarkerAction.Prefix,
            needsEditor: false,
            description: env.isMacintosh ? nls.localize('desc.mac', "Show Errors or Warnings") : nls.localize('desc.win', "Show Errors and Warnings")
        },
    ]));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor('vs/workbench/parts/quickopen/browser/commandsHandler', 'CommandsHandler', commandsHandler_1.ALL_COMMANDS_PREFIX, nls.localize('commandsHandlerDescriptionDefault', "Show and Run Commands")));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor('vs/workbench/parts/quickopen/browser/gotoLineHandler', 'GotoLineHandler', gotoLineHandler_1.GOTO_LINE_PREFIX, [
        {
            prefix: gotoLineHandler_1.GOTO_LINE_PREFIX,
            needsEditor: true,
            description: env.isMacintosh ? nls.localize('gotoLineDescriptionMac', "Go to Line") : nls.localize('gotoLineDescriptionWin', "Go to Line")
        },
    ]));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor('vs/workbench/parts/quickopen/browser/gotoSymbolHandler', 'GotoSymbolHandler', gotoSymbolHandler_1.GOTO_SYMBOL_PREFIX, [
        {
            prefix: gotoSymbolHandler_1.GOTO_SYMBOL_PREFIX,
            needsEditor: true,
            description: env.isMacintosh ? nls.localize('gotoSymbolDescriptionNormalMac', "Go to Symbol") : nls.localize('gotoSymbolDescriptionNormalWin', "Go to Symbol")
        },
        {
            prefix: gotoSymbolHandler_1.GOTO_SYMBOL_PREFIX + gotoSymbolHandler_1.SCOPE_PREFIX,
            needsEditor: true,
            description: nls.localize('gotoSymbolDescriptionScoped', "Go to Symbol by Category")
        }
    ]));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor('vs/workbench/parts/quickopen/browser/helpHandler', 'HelpHandler', helpHandler_1.HELP_PREFIX, nls.localize('helpDescription', "Show Help")));
});
//# sourceMappingURL=quickopen.contribution.js.map