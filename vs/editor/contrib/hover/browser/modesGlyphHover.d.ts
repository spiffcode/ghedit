import { IRange } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { GlyphHoverWidget } from './hoverWidgets';
export interface IHoverMessage {
    value?: string;
    range?: IRange;
    className?: string;
}
export declare class ModesGlyphHoverWidget extends GlyphHoverWidget {
    static ID: string;
    private _messages;
    private _lastLineNumber;
    private _computer;
    private _hoverOperation;
    constructor(editor: ICodeEditor);
    dispose(): void;
    onModelDecorationsChanged(): void;
    startShowingAt(lineNumber: number): void;
    hide(): void;
    _withResult(result: IHoverMessage[]): void;
    private _renderMessages(lineNumber, messages);
}
