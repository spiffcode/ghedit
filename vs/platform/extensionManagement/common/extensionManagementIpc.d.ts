import { TPromise } from 'vs/base/common/winjs.base';
import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { IExtensionManagementService, ILocalExtension, IGalleryExtension, InstallExtensionEvent, DidInstallExtensionEvent } from './extensionManagement';
import Event from 'vs/base/common/event';
export interface IExtensionManagementChannel extends IChannel {
    call(command: 'event:onInstallExtension'): TPromise<void>;
    call(command: 'event:onDidInstallExtension'): TPromise<void>;
    call(command: 'event:onUninstallExtension'): TPromise<void>;
    call(command: 'event:onDidUninstallExtension'): TPromise<void>;
    call(command: 'install', extensionOrPath: ILocalExtension | string): TPromise<ILocalExtension>;
    call(command: 'uninstall', extension: ILocalExtension): TPromise<void>;
    call(command: 'getInstalled', includeDuplicateVersions: boolean): TPromise<ILocalExtension[]>;
    call(command: string, arg: any): TPromise<any>;
}
export declare class ExtensionManagementChannel implements IExtensionManagementChannel {
    private service;
    constructor(service: IExtensionManagementService);
    call(command: string, arg: any): TPromise<any>;
}
export declare class ExtensionManagementChannelClient implements IExtensionManagementService {
    private channel;
    _serviceBrand: any;
    constructor(channel: IExtensionManagementChannel);
    private _onInstallExtension;
    onInstallExtension: Event<InstallExtensionEvent>;
    private _onDidInstallExtension;
    onDidInstallExtension: Event<DidInstallExtensionEvent>;
    private _onUninstallExtension;
    onUninstallExtension: Event<string>;
    private _onDidUninstallExtension;
    onDidUninstallExtension: Event<string>;
    install(extension: IGalleryExtension): TPromise<void>;
    install(zipPath: string): TPromise<void>;
    uninstall(extension: ILocalExtension): TPromise<void>;
    getInstalled(includeDuplicateVersions?: boolean): TPromise<ILocalExtension[]>;
}
