import { IDisposable } from 'vs/base/common/lifecycle';
import { IPosition } from 'vs/editor/common/editorCommon';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from 'vs/editor/browser/editorBrowser';
export declare class LightBulpWidget implements IContentWidget, IDisposable {
    private editor;
    private position;
    private domNode;
    private visible;
    private onclick;
    private toDispose;
    allowEditorOverflow: boolean;
    constructor(editor: ICodeEditor, onclick: (pos: IPosition) => void);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition;
    show(where: IPosition): void;
    hide(): void;
}
