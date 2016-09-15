import 'vs/css!./parameterHints';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { SignatureHelp } from 'vs/editor/common/modes';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from 'vs/editor/browser/editorBrowser';
import Event from 'vs/base/common/event';
import { ICommonCodeEditor } from 'vs/editor/common/editorCommon';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
export interface IHintEvent {
    hints: SignatureHelp;
}
export declare class ParameterHintsModel extends Disposable {
    static DELAY: number;
    private _onHint;
    onHint: Event<IHintEvent>;
    private _onCancel;
    onCancel: Event<void>;
    private editor;
    private enabled;
    private triggerCharactersListeners;
    private active;
    private throttledDelayer;
    constructor(editor: ICommonCodeEditor);
    cancel(silent?: boolean): void;
    trigger(delay?: number): void;
    private doTrigger();
    isTriggered(): boolean;
    private onModelChanged();
    private onCursorChange(e);
    private onEditorConfigurationChange();
    dispose(): void;
}
export declare class ParameterHintsWidget implements IContentWidget, IDisposable {
    private editor;
    static ID: string;
    private model;
    private keyVisible;
    private keyMultipleSignatures;
    private element;
    private signatures;
    private overloads;
    private signatureViews;
    private currentSignature;
    private visible;
    private parameterHints;
    private announcedLabel;
    private disposables;
    allowEditorOverflow: boolean;
    constructor(editor: ICodeEditor, keybindingService: IKeybindingService);
    private show();
    private hide();
    getPosition(): IContentWidgetPosition;
    private render(hints);
    private applyFont(element);
    private renderSignature(element, signature, currentParameter);
    private renderDocumentation(element, signature, activeParameterIdx);
    private select(position);
    next(): boolean;
    previous(): boolean;
    cancel(): void;
    getDomNode(): HTMLElement;
    getId(): string;
    trigger(): void;
    dispose(): void;
}
