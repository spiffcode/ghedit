import { Position } from 'vs/editor/common/core/position';
import { IPosition } from 'vs/editor/common/editorCommon';
import * as editorBrowser from 'vs/editor/browser/editorBrowser';
import { Widget } from 'vs/base/browser/ui/widget';
export declare class ContentHoverWidget extends Widget implements editorBrowser.IContentWidget {
    private _id;
    protected _editor: editorBrowser.ICodeEditor;
    protected _isVisible: boolean;
    private _containerDomNode;
    protected _domNode: HTMLElement;
    protected _showAtPosition: Position;
    private _stoleFocus;
    allowEditorOverflow: boolean;
    constructor(id: string, editor: editorBrowser.ICodeEditor);
    getId(): string;
    getDomNode(): HTMLElement;
    showAt(position: IPosition, focus: boolean): void;
    hide(): void;
    getPosition(): editorBrowser.IContentWidgetPosition;
    dispose(): void;
}
export declare class GlyphHoverWidget extends Widget implements editorBrowser.IOverlayWidget {
    private _id;
    protected _editor: editorBrowser.ICodeEditor;
    protected _isVisible: boolean;
    protected _domNode: HTMLElement;
    protected _showAtLineNumber: number;
    constructor(id: string, editor: editorBrowser.ICodeEditor);
    getId(): string;
    getDomNode(): HTMLElement;
    showAt(lineNumber: number): void;
    hide(): void;
    getPosition(): editorBrowser.IOverlayWidgetPosition;
    dispose(): void;
}
