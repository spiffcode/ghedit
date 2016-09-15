import URI from 'vs/base/common/uri';
import Actions = require('vs/base/common/actions');
import WinJS = require('vs/base/common/winjs.base');
import Descriptors = require('vs/platform/instantiation/common/descriptors');
import Instantiation = require('vs/platform/instantiation/common/instantiation');
import { KbExpr, IKeybindings, IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDisposable } from 'vs/base/common/lifecycle';
import Event from 'vs/base/common/event';
export interface ICommandAction {
    id: string;
    title: string;
    category?: string;
    iconClass?: string;
}
export interface IMenu extends IDisposable {
    onDidChange: Event<IMenu>;
    getActions(): [string, Actions.IAction[]][];
}
export interface IMenuItem {
    command: ICommandAction;
    alt?: ICommandAction;
    when?: KbExpr;
    group?: 'navigation' | string;
    order?: number;
}
export declare enum MenuId {
    EditorTitle = 1,
    EditorContext = 2,
    ExplorerContext = 3,
}
export declare const IMenuService: {
    (...args: any[]): void;
    type: IMenuService;
};
export interface IMenuService {
    _serviceBrand: any;
    createMenu(id: MenuId, scopedKeybindingService: IKeybindingService): IMenu;
    getCommandActions(): ICommandAction[];
}
export interface IMenuRegistry {
    commands: {
        [id: string]: ICommandAction;
    };
    addCommand(userCommand: ICommandAction): boolean;
    getCommand(id: string): ICommandAction;
    appendMenuItem(menu: MenuId, item: IMenuItem): IDisposable;
    getMenuItems(loc: MenuId): IMenuItem[];
}
export declare const MenuRegistry: IMenuRegistry;
export declare class MenuItemAction extends Actions.Action {
    private _item;
    private _commandService;
    private static _getMenuItemId(item);
    private _resource;
    constructor(_item: IMenuItem, _commandService: ICommandService);
    resource: URI;
    item: IMenuItem;
    command: ICommandAction;
    altCommand: ICommandAction;
    run(alt: boolean): WinJS.TPromise<{}>;
}
export declare class ExecuteCommandAction extends Actions.Action {
    private _commandService;
    constructor(id: string, label: string, _commandService: ICommandService);
    run(...args: any[]): WinJS.TPromise<any>;
}
export declare class SyncActionDescriptor {
    private _descriptor;
    private _id;
    private _label;
    private _keybindings;
    private _keybindingContext;
    private _keybindingWeight;
    constructor(ctor: Instantiation.IConstructorSignature2<string, string, Actions.Action>, id: string, label: string, keybindings?: IKeybindings, keybindingContext?: KbExpr, keybindingWeight?: number);
    syncDescriptor: Descriptors.SyncDescriptor0<Actions.Action>;
    id: string;
    label: string;
    keybindings: IKeybindings;
    keybindingContext: KbExpr;
    keybindingWeight: number;
}
/**
 * A proxy for an action that needs to load code in order to confunction. Can be used from contributions to defer
 * module loading up to the point until the run method is being executed.
 */
export declare class DeferredAction extends Actions.Action {
    private _instantiationService;
    private _descriptor;
    private _cachedAction;
    private _emitterUnbind;
    constructor(_instantiationService: Instantiation.IInstantiationService, _descriptor: Descriptors.AsyncDescriptor0<Actions.Action>, id: string, label?: string, cssClass?: string, enabled?: boolean);
    cachedAction: Actions.IAction;
    id: string;
    label: string;
    class: string;
    enabled: boolean;
    order: number;
    run(event?: any): WinJS.Promise;
    private _createAction();
    dispose(): void;
}
