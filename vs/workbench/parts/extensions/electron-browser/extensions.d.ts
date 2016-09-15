import { IViewlet } from 'vs/workbench/common/viewlet';
import Event from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { IPager } from 'vs/base/common/paging';
import { IQueryOptions } from 'vs/platform/extensionManagement/common/extensionManagement';
export declare const VIEWLET_ID: string;
export interface IExtensionsViewlet extends IViewlet {
    search(text: string, immediate?: boolean): void;
}
export declare enum ExtensionState {
    Installing = 0,
    Installed = 1,
    NeedsRestart = 2,
    Uninstalled = 3,
}
export interface IExtension {
    state: ExtensionState;
    name: string;
    displayName: string;
    publisher: string;
    publisherDisplayName: string;
    version: string;
    latestVersion: string;
    description: string;
    readmeUrl: string;
    iconUrl: string;
    installCount: number;
    rating: number;
    ratingCount: number;
    outdated: boolean;
}
export declare const SERVICE_ID: string;
export declare const IExtensionsWorkbenchService: {
    (...args: any[]): void;
    type: IExtensionsWorkbenchService;
};
export interface IExtensionsWorkbenchService {
    _serviceBrand: any;
    onChange: Event<void>;
    local: IExtension[];
    queryLocal(): TPromise<IExtension[]>;
    queryGallery(options?: IQueryOptions): TPromise<IPager<IExtension>>;
    getRecommendations(): TPromise<IExtension[]>;
    canInstall(extension: IExtension): boolean;
    install(extension: IExtension): TPromise<void>;
    uninstall(extension: IExtension): TPromise<void>;
}
