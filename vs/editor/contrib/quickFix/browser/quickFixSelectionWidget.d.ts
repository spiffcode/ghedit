import 'vs/css!./quickFix';
import { ITree, IAccessibilityProvider } from 'vs/base/parts/tree/browser/tree';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { QuickFixModel } from './quickFixModel';
export declare class Message {
    parent: MessageRoot;
    message: string;
    constructor(parent: MessageRoot, message: string);
}
export declare class MessageRoot {
    child: Message;
    constructor(message: string);
}
export declare class AccessibilityProvider implements IAccessibilityProvider {
    constructor();
    getAriaLabel(tree: ITree, element: any): string;
}
export declare class QuickFixSelectionWidget implements IContentWidget {
    static ID: string;
    static WIDTH: number;
    static LOADING_MESSAGE: MessageRoot;
    static NO_SUGGESTIONS_MESSAGE: MessageRoot;
    private editor;
    private shouldShowEmptyList;
    private isActive;
    private isLoading;
    private isAuto;
    private listenersToRemove;
    private modelListenersToRemove;
    private model;
    private telemetryData;
    private telemetryService;
    private domnode;
    private tree;
    private range;
    private _onShown;
    private _onHidden;
    allowEditorOverflow: boolean;
    constructor(editor: ICodeEditor, telemetryService: ITelemetryService, onShown: () => void, onHidden: () => void);
    private _lastAriaAlertLabel;
    private _ariaAlert(newAriaAlertLabel);
    setModel(newModel: QuickFixModel): void;
    selectNextPage(): boolean;
    selectNext(): boolean;
    selectPreviousPage(): boolean;
    selectPrevious(): boolean;
    acceptSelectedSuggestion(): boolean;
    private releaseModel();
    show(): void;
    hide(): void;
    getPosition(): IContentWidgetPosition;
    getDomNode(): HTMLElement;
    getId(): string;
    private submitTelemetryData();
    private updateWidgetHeight();
    destroy(): void;
}
