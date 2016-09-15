import 'vs/css!./peekViewWidget';
import Event from 'vs/base/common/event';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ICommonCodeEditor } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IOptions, ZoneWidget } from './zoneWidget';
export declare var IPeekViewService: {
    (...args: any[]): void;
    type: IPeekViewService;
};
export interface IPeekViewService {
    _serviceBrand: any;
    isActive: boolean;
    contextKey: string;
}
export declare function getOuterEditor(accessor: ServicesAccessor, args: any): ICommonCodeEditor;
export declare class PeekViewWidget extends ZoneWidget implements IPeekViewService {
    _serviceBrand: any;
    contextKey: string;
    private _onDidClose;
    private _isActive;
    protected _headElement: HTMLDivElement;
    protected _primaryHeading: HTMLElement;
    protected _secondaryHeading: HTMLElement;
    protected _metaHeading: HTMLElement;
    protected _actionbarWidget: ActionBar;
    protected _bodyElement: HTMLDivElement;
    constructor(editor: ICodeEditor, contextKey: string, options?: IOptions);
    dispose(): void;
    onDidClose: Event<PeekViewWidget>;
    isActive: boolean;
    show(where: any, heightInLines: number): void;
    protected _fillContainer(container: HTMLElement): void;
    protected _fillHead(container: HTMLElement): void;
    protected _onTitleClick(event: MouseEvent): void;
    setTitle(primaryHeading: string, secondaryHeading?: string): void;
    setMetaTitle(value: string): void;
    protected _fillBody(container: HTMLElement): void;
    _doLayout(heightInPixel: number, widthInPixel: number): void;
    protected _doLayoutHead(heightInPixel: number, widthInPixel: number): void;
    protected _doLayoutBody(heightInPixel: number, widthInPixel: number): void;
}
