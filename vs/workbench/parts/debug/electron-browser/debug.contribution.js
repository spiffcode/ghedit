/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls', 'vs/base/common/keyCodes', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/platform/actions/common/actions', 'vs/platform/platform', 'vs/platform/instantiation/common/extensions', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/platform/keybinding/common/keybindingService', 'vs/editor/browser/editorBrowserExtensions', 'vs/workbench/common/actionRegistry', 'vs/workbench/browser/viewlet', 'vs/workbench/browser/panel', 'vs/workbench/parts/debug/browser/debugViews', 'vs/workbench/common/contributions', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/browser/debugEditorModelManager', 'vs/workbench/parts/debug/electron-browser/debugActions', 'vs/workbench/parts/debug/browser/debugActionsWidget', 'vs/workbench/parts/debug/electron-browser/debugService', 'vs/workbench/parts/debug/browser/debugEditorContribution', 'vs/workbench/services/viewlet/common/viewletService', 'vs/workbench/services/editor/common/editorService', 'vs/css!../browser/media/debug.contribution', 'vs/css!../browser/media/debugHover'], function (require, exports, nls, keyCodes_1, editorcommon, editorCommonExtensions_1, actions_1, platform, extensions_1, keybindingsRegistry_1, keybindingService_1, editorBrowserExtensions_1, wbaregistry, viewlet, panel, debugViews_1, wbext, debug, debugEditorModelManager_1, dbgactions, debugwidget, service, debugEditorContribution_1, viewletService_1, editorService_1) {
    "use strict";
    var IDebugService = debug.IDebugService;
    var OpenDebugViewletAction = (function (_super) {
        __extends(OpenDebugViewletAction, _super);
        function OpenDebugViewletAction(id, label, viewletService, editorService) {
            _super.call(this, id, label, debug.VIEWLET_ID, viewletService, editorService);
        }
        OpenDebugViewletAction.ID = debug.VIEWLET_ID;
        OpenDebugViewletAction.LABEL = nls.localize('toggleDebugViewlet', "Show Debug");
        OpenDebugViewletAction = __decorate([
            __param(2, viewletService_1.IViewletService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenDebugViewletAction);
        return OpenDebugViewletAction;
    }(viewlet.ToggleViewletAction));
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(debugEditorContribution_1.DebugEditorContribution);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(dbgactions.ToggleBreakpointAction, dbgactions.ToggleBreakpointAction.ID, nls.localize('toggleBreakpointAction', "Debug: Toggle Breakpoint"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyCode.F9
    }, 'Debug: Toggle Breakpoint'));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(dbgactions.ShowDebugHoverAction, dbgactions.ShowDebugHoverAction.ID, nls.localize('showDebugHover', "Debug: Show Hover"), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        kbExpr: keybindingService_1.KbExpr.and(keybindingService_1.KbExpr.has(debug.CONTEXT_IN_DEBUG_MODE), keybindingService_1.KbExpr.has(editorcommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS)),
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_I)
    }, 'Debug: Show Hover'));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(dbgactions.EditorConditionalBreakpointAction, dbgactions.EditorConditionalBreakpointAction.ID, nls.localize('conditionalBreakpointEditorAction', "Debug: Conditional Breakpoint"), void 0, 'Debug: Conditional Breakpoint'));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(dbgactions.SelectionToReplAction, dbgactions.SelectionToReplAction.ID, nls.localize('debugEvaluate', "Debug: Evaluate"), void 0, 'Debug: Evaluate'));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(dbgactions.SelectionToWatchExpressionsAction, dbgactions.SelectionToWatchExpressionsAction.ID, nls.localize('addToWatch', "Debug: Add to Watch"), void 0, 'Debug: Add to Watch'));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(dbgactions.RunToCursorAction, dbgactions.RunToCursorAction.ID, nls.localize('runToCursor', "Debug: Run to Cursor"), void 0, 'Debug: Run to Cursor'));
    // register viewlet
    platform.Registry.as(viewlet.Extensions.Viewlets).registerViewlet(new viewlet.ViewletDescriptor('vs/workbench/parts/debug/browser/debugViewlet', 'DebugViewlet', debug.VIEWLET_ID, nls.localize('debug', "Debug"), 'debug', 40));
    var openViewletKb = {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_D
    };
    // register repl panel
    platform.Registry.as(panel.Extensions.Panels).registerPanel(new panel.PanelDescriptor('vs/workbench/parts/debug/browser/repl', 'Repl', debug.REPL_ID, nls.localize('debugConsole', "Debug Console"), 'repl'));
    platform.Registry.as(panel.Extensions.Panels).setDefaultPanelId(debug.REPL_ID);
    // Register default debug views
    debug.DebugViewRegistry.registerDebugView(debugViews_1.VariablesView, 10);
    debug.DebugViewRegistry.registerDebugView(debugViews_1.WatchExpressionsView, 20);
    debug.DebugViewRegistry.registerDebugView(debugViews_1.CallStackView, 30);
    debug.DebugViewRegistry.registerDebugView(debugViews_1.BreakpointsView, 40);
    // register action to open viewlet
    var registry = platform.Registry.as(wbaregistry.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(OpenDebugViewletAction, OpenDebugViewletAction.ID, OpenDebugViewletAction.LABEL, openViewletKb), 'View: Show Debug', nls.localize('view', "View"));
    platform.Registry.as(wbext.Extensions.Workbench).registerWorkbenchContribution(debugEditorModelManager_1.DebugEditorModelManager);
    platform.Registry.as(wbext.Extensions.Workbench).registerWorkbenchContribution(debugwidget.DebugActionsWidget);
    var debugCategory = nls.localize('debugCategory', "Debug");
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.StartDebugAction, dbgactions.StartDebugAction.ID, dbgactions.StartDebugAction.LABEL, { primary: keyCodes_1.KeyCode.F5 }, keybindingService_1.KbExpr.not(debug.CONTEXT_IN_DEBUG_MODE)), 'Debug: Start Debugging', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.StepOverDebugAction, dbgactions.StepOverDebugAction.ID, dbgactions.StepOverDebugAction.LABEL, { primary: keyCodes_1.KeyCode.F10 }, keybindingService_1.KbExpr.has(debug.CONTEXT_IN_DEBUG_MODE)), 'Debug: Step Over', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.StepIntoDebugAction, dbgactions.StepIntoDebugAction.ID, dbgactions.StepIntoDebugAction.LABEL, { primary: keyCodes_1.KeyCode.F11 }, keybindingService_1.KbExpr.has(debug.CONTEXT_IN_DEBUG_MODE), keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(1)), 'Debug: Step Into', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.StepOutDebugAction, dbgactions.StepOutDebugAction.ID, dbgactions.StepOutDebugAction.LABEL, { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.F11 }, keybindingService_1.KbExpr.has(debug.CONTEXT_IN_DEBUG_MODE)), 'Debug: Step Out', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.RestartDebugAction, dbgactions.RestartDebugAction.ID, dbgactions.RestartDebugAction.LABEL, { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.F5 }, keybindingService_1.KbExpr.has(debug.CONTEXT_IN_DEBUG_MODE)), 'Debug: Restart', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.StopDebugAction, dbgactions.StopDebugAction.ID, dbgactions.StopDebugAction.LABEL, { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.F5 }, keybindingService_1.KbExpr.has(debug.CONTEXT_IN_DEBUG_MODE)), 'Debug: Stop', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.ContinueAction, dbgactions.ContinueAction.ID, dbgactions.ContinueAction.LABEL, { primary: keyCodes_1.KeyCode.F5 }, keybindingService_1.KbExpr.has(debug.CONTEXT_IN_DEBUG_MODE)), 'Debug: Continue', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.PauseAction, dbgactions.PauseAction.ID, dbgactions.PauseAction.LABEL), 'Debug: Pause', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.ConfigureAction, dbgactions.ConfigureAction.ID, dbgactions.ConfigureAction.LABEL), 'Debug: Open launch.json', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.ToggleReplAction, dbgactions.ToggleReplAction.ID, dbgactions.ToggleReplAction.LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_Y, }), 'Debug: Debug Console', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.AddFunctionBreakpointAction, dbgactions.AddFunctionBreakpointAction.ID, dbgactions.AddFunctionBreakpointAction.LABEL), 'Debug: Add Function Breakpoint', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.ReapplyBreakpointsAction, dbgactions.ReapplyBreakpointsAction.ID, dbgactions.ReapplyBreakpointsAction.LABEL), 'Debug: Reapply All Breakpoints', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(dbgactions.RunAction, dbgactions.RunAction.ID, dbgactions.RunAction.LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.F5 }, keybindingService_1.KbExpr.not(debug.CONTEXT_IN_DEBUG_MODE)), 'Debug: Start Without Debugging', debugCategory);
    // register service
    extensions_1.registerSingleton(IDebugService, service.DebugService);
});
//# sourceMappingURL=debug.contribution.js.map