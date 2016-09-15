import actions = require('vs/base/common/actions');
import lifecycle = require('vs/base/common/lifecycle');
import { TPromise } from 'vs/base/common/winjs.base';
import editorCommon = require('vs/editor/common/editorCommon');
import editorbrowser = require('vs/editor/browser/editorBrowser');
import { EditorAction } from 'vs/editor/common/editorAction';
import { IEventService } from 'vs/platform/event/common/event';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommandService } from 'vs/platform/commands/common/commands';
import debug = require('vs/workbench/parts/debug/common/debug');
import model = require('vs/workbench/parts/debug/common/debugModel');
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import IDebugService = debug.IDebugService;
export declare class AbstractDebugAction extends actions.Action {
    protected debugService: IDebugService;
    protected keybindingService: IKeybindingService;
    protected toDispose: lifecycle.IDisposable[];
    private keybinding;
    constructor(id: string, label: string, cssClass: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(e?: any): TPromise<any>;
    protected updateLabel(newLabel: string): void;
    protected updateEnablement(state: debug.State): void;
    protected isEnabled(state: debug.State): boolean;
    dispose(): void;
}
export declare class ConfigureAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(event?: any): TPromise<any>;
}
export declare class SelectConfigAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(configName: string): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class StartDebugAction extends AbstractDebugAction {
    private commandService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService, commandService: ICommandService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class RestartDebugAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    static RECONNECT_LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class StepOverDebugAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(thread: debug.IThread): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class StepIntoDebugAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(thread: debug.IThread): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class StepOutDebugAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(thread: debug.IThread): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class StepBackDebugAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(thread: debug.IThread): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class StopDebugAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    static DISCONNECT_LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class ContinueAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(thread: debug.IThread): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class PauseAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(thread: debug.IThread): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class RestartFrameAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(frame: debug.IStackFrame): TPromise<any>;
}
export declare class RemoveBreakpointAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(breakpoint: debug.IBreakpoint): TPromise<any>;
}
export declare class RemoveAllBreakpointsAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class ToggleEnablementAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(element: debug.IEnablement): TPromise<any>;
}
export declare class EnableAllBreakpointsAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class DisableAllBreakpointsAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class ToggleBreakpointsActivatedAction extends AbstractDebugAction {
    static ID: string;
    static ACTIVATE_LABEL: string;
    static DEACTIVATE_LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class ReapplyBreakpointsAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class AddFunctionBreakpointAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
}
export declare class RenameFunctionBreakpointAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(fbp: debug.IFunctionBreakpoint): TPromise<any>;
}
export declare class AddConditionalBreakpointAction extends AbstractDebugAction {
    private editor;
    private lineNumber;
    private instantiationService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, editor: editorbrowser.ICodeEditor, lineNumber: number, debugService: IDebugService, keybindingService: IKeybindingService, instantiationService: IInstantiationService);
    run(): TPromise<any>;
}
export declare class EditConditionalBreakpointAction extends AbstractDebugAction {
    private editor;
    private lineNumber;
    private instantiationService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, editor: editorbrowser.ICodeEditor, lineNumber: number, debugService: IDebugService, keybindingService: IKeybindingService, instantiationService: IInstantiationService);
    run(breakpoint: debug.IBreakpoint): TPromise<any>;
}
export declare class ToggleBreakpointAction extends EditorAction {
    private debugService;
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, debugService: IDebugService);
    run(): TPromise<any>;
}
export declare class EditorConditionalBreakpointAction extends EditorAction {
    private debugService;
    private instantiationService;
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, debugService: IDebugService, instantiationService: IInstantiationService);
    run(): TPromise<any>;
}
export declare class SetValueAction extends AbstractDebugAction {
    private variable;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, variable: model.Variable, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class RunToCursorAction extends EditorAction {
    static ID: string;
    private debugService;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, debugService: IDebugService);
    run(): TPromise<void>;
    isSupported(): boolean;
}
export declare class AddWatchExpressionAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class SelectionToReplAction extends EditorAction {
    private debugService;
    private panelService;
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, debugService: IDebugService, panelService: IPanelService);
    run(): TPromise<any>;
    isSupported(): boolean;
}
export declare class ShowDebugHoverAction extends EditorAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<any>;
}
export declare class AddToWatchExpressionsAction extends AbstractDebugAction {
    private expression;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, expression: debug.IExpression, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
}
export declare class RenameWatchExpressionAction extends AbstractDebugAction {
    private expression;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, expression: model.Expression, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
}
export declare class RemoveWatchExpressionAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(expression: model.Expression): TPromise<any>;
}
export declare class RemoveAllWatchExpressionsAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
export declare class ClearReplAction extends AbstractDebugAction {
    private panelService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService, panelService: IPanelService);
    run(): TPromise<any>;
}
export declare class ToggleReplAction extends AbstractDebugAction {
    private partService;
    private panelService;
    private eventService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, partService: IPartService, panelService: IPanelService, keybindingService: IKeybindingService, eventService: IEventService);
    run(): TPromise<any>;
    private registerListeners();
    private isReplVisible();
}
export declare class RunAction extends AbstractDebugAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, debugService: IDebugService, keybindingService: IKeybindingService);
    run(): TPromise<any>;
    protected isEnabled(state: debug.State): boolean;
}
