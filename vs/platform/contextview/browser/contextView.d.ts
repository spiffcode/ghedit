import { IDisposable } from 'vs/base/common/lifecycle';
import { IAction } from 'vs/base/common/actions';
import { IActionItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { TPromise } from 'vs/base/common/winjs.base';
import { Keybinding } from 'vs/base/common/keyCodes';
export declare const IContextViewService: {
    (...args: any[]): void;
    type: IContextViewService;
};
export interface IContextViewService {
    _serviceBrand: any;
    showContextView(delegate: IContextViewDelegate): void;
    hideContextView(data?: any): void;
    layout(): void;
}
export interface IContextViewDelegate {
    getAnchor(): HTMLElement | {
        x: number;
        y: number;
    };
    render(container: HTMLElement): IDisposable;
    canRelayout?: boolean;
    onDOMEvent?(e: Event, activeElement: HTMLElement): void;
    onHide?(data?: any): void;
}
export declare const IContextMenuService: {
    (...args: any[]): void;
    type: IContextMenuService;
};
export interface IContextMenuService {
    _serviceBrand: any;
    showContextMenu(delegate: IContextMenuDelegate): void;
}
export interface IContextMenuDelegate {
    getAnchor(): HTMLElement | {
        x: number;
        y: number;
    };
    getActions(): TPromise<(IAction | ContextSubMenu)[]>;
    getActionItem?(action: IAction): IActionItem;
    getActionsContext?(): any;
    getKeyBinding?(action: IAction): Keybinding;
    getMenuClassName?(): string;
    onHide?(didCancel: boolean): void;
}
export declare class ContextSubMenu {
    label: string;
    entries: (ContextSubMenu | IAction)[];
    constructor(label: string, entries: (ContextSubMenu | IAction)[]);
}
