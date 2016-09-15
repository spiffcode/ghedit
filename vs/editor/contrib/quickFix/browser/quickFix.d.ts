import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorService } from 'vs/platform/editor/common/editor';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { IMessageService } from 'vs/platform/message/common/message';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { EditorAction } from 'vs/editor/common/editorAction';
import { ICommonCodeEditor, IEditorActionDescriptorData, IEditorContribution } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
export declare class QuickFixController implements IEditorContribution {
    private _markerService;
    private _keybindingService;
    private _commandService;
    static ID: string;
    static getQuickFixController(editor: ICommonCodeEditor): QuickFixController;
    private editor;
    private model;
    private suggestWidget;
    private quickFixWidgetVisible;
    constructor(editor: ICodeEditor, _markerService: IMarkerService, _keybindingService: IKeybindingService, _commandService: ICommandService, telemetryService: ITelemetryService, editorService: IEditorService, messageService: IMessageService);
    getId(): string;
    private onAccept(fix, range);
    run(): TPromise<boolean>;
    dispose(): void;
    acceptSelectedSuggestion(): void;
    closeWidget(): void;
    selectNextSuggestion(): void;
    selectNextPageSuggestion(): void;
    selectPrevSuggestion(): void;
    selectPrevPageSuggestion(): void;
}
export declare class QuickFixAction extends EditorAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor);
    isSupported(): boolean;
    run(): TPromise<boolean>;
}
