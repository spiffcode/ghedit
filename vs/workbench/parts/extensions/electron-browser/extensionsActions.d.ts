import 'vs/css!./media/extensionActions';
import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import Event from 'vs/base/common/event';
import { IExtension, IExtensionsWorkbenchService } from './extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMessageService } from 'vs/platform/message/common/message';
import { ToggleViewletAction } from 'vs/workbench/browser/viewlet';
import { IViewletService } from 'vs/workbench/services/viewlet/common/viewletService';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class InstallAction extends Action {
    private extensionsWorkbenchService;
    private static InstallLabel;
    private static InstallingLabel;
    private disposables;
    private _extension;
    extension: IExtension;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    private update();
    run(): TPromise<any>;
    dispose(): void;
}
export declare class UninstallAction extends Action {
    private extensionsWorkbenchService;
    private messageService;
    private instantiationService;
    private disposables;
    private _extension;
    extension: IExtension;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, messageService: IMessageService, instantiationService: IInstantiationService);
    private update();
    run(): TPromise<any>;
    dispose(): void;
}
export declare class CombinedInstallAction extends Action {
    private static NoExtensionClass;
    private installAction;
    private uninstallAction;
    private disposables;
    private _extension;
    extension: IExtension;
    constructor(instantiationService: IInstantiationService);
    private update();
    run(): TPromise<any>;
    dispose(): void;
}
export declare class UpdateAction extends Action {
    private extensionsWorkbenchService;
    private static EnabledClass;
    private static DisabledClass;
    private disposables;
    private _extension;
    extension: IExtension;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    private update();
    run(): TPromise<any>;
    dispose(): void;
}
export declare class EnableAction extends Action {
    private extensionsWorkbenchService;
    private instantiationService;
    private static EnabledClass;
    private static DisabledClass;
    private disposables;
    private _extension;
    extension: IExtension;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, instantiationService: IInstantiationService);
    private update();
    run(): TPromise<any>;
    dispose(): void;
}
export declare class OpenExtensionsViewletAction extends ToggleViewletAction {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, viewletService: IViewletService, editorService: IWorkbenchEditorService);
}
export declare class InstallExtensionsAction extends OpenExtensionsViewletAction {
    static ID: string;
    static LABEL: string;
}
export declare class ShowInstalledExtensionsAction extends Action {
    private viewletService;
    private extensionsWorkbenchService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, viewletService: IViewletService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    run(): TPromise<void>;
}
export declare class ClearExtensionsInputAction extends ShowInstalledExtensionsAction {
    static ID: string;
    static LABEL: string;
    private disposables;
    constructor(id: string, label: string, onSearchChange: Event<string>, viewletService: IViewletService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    private onSearchChange(value);
    dispose(): void;
}
export declare class ShowOutdatedExtensionsAction extends Action {
    private viewletService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, viewletService: IViewletService);
    run(): TPromise<void>;
    protected isEnabled(): boolean;
}
export declare class ShowPopularExtensionsAction extends Action {
    private viewletService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, viewletService: IViewletService);
    run(): TPromise<void>;
    protected isEnabled(): boolean;
}
export declare class ShowRecommendedExtensionsAction extends Action {
    private viewletService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, viewletService: IViewletService);
    run(): TPromise<void>;
    protected isEnabled(): boolean;
}
