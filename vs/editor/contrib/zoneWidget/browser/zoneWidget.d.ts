import 'vs/css!./zoneWidget';
import { Disposables } from 'vs/base/common/lifecycle';
import { Sash, IHorizontalSashLayoutProvider } from 'vs/base/browser/ui/sash/sash';
import { IPosition, IRange } from 'vs/editor/common/editorCommon';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, IViewZone } from 'vs/editor/browser/editorBrowser';
export interface IOptions {
    showFrame?: boolean;
    showArrow?: boolean;
    frameColor?: string;
    className?: string;
    isAccessible?: boolean;
    isResizeable?: boolean;
}
export declare class ViewZoneDelegate implements IViewZone {
    domNode: HTMLElement;
    id: number;
    afterLineNumber: number;
    afterColumn: number;
    heightInLines: number;
    private _onDomNodeTop;
    private _onComputedHeight;
    constructor(domNode: HTMLElement, afterLineNumber: number, afterColumn: number, heightInLines: number, onDomNodeTop: (top: number) => void, onComputedHeight: (height: number) => void);
    onDomNodeTop(top: number): void;
    onComputedHeight(height: number): void;
}
export declare class OverlayWidgetDelegate implements IOverlayWidget {
    private _id;
    private _domNode;
    constructor(id: string, domNode: HTMLElement);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition;
}
export declare abstract class ZoneWidget implements IHorizontalSashLayoutProvider {
    protected _viewZone: ViewZoneDelegate;
    protected _overlayWidget: OverlayWidgetDelegate;
    protected _resizeSash: Sash;
    protected _disposables: Disposables;
    container: HTMLElement;
    domNode: HTMLElement;
    position: IPosition;
    editor: ICodeEditor;
    options: IOptions;
    constructor(editor: ICodeEditor, options?: IOptions);
    create(): void;
    private _getWidth(info?);
    private _onViewZoneTop(top);
    private _onViewZoneHeight(height);
    show(rangeOrPos: IRange | IPosition, heightInLines: number): void;
    private _decoratingElementsHeight();
    private _showImpl(where, heightInLines);
    dispose(): void;
    protected abstract _fillContainer(container: HTMLElement): void;
    protected _onWidth(widthInPixel: number): void;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    private _initSash();
    getHorizontalSashLeft(): number;
    getHorizontalSashTop(): number;
    getHorizontalSashWidth(): number;
}
