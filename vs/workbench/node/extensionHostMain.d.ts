import { TPromise } from 'vs/base/common/winjs.base';
import { IMainProcessExtHostIPC } from 'vs/platform/extensions/common/ipcRemoteCom';
import { Client } from 'vs/base/parts/ipc/node/ipc.net';
export interface IInitData {
    threadService: any;
    contextService: {
        workspace: any;
        configuration: any;
        options: any;
    };
}
export declare function exit(code?: number): void;
export declare class ExtensionHostMain {
    private _isTerminating;
    private _contextService;
    private _extensionService;
    constructor(remoteCom: IMainProcessExtHostIPC, initData: IInitData, sharedProcessClient: Client);
    private _getOrCreateWorkspaceStoragePath();
    start(): TPromise<void>;
    terminate(): void;
    private readExtensions();
    private static scanExtensions(collector, builtinExtensionsPath, userInstallPath, extensionDevelopmentPath, version);
    private handleEagerExtensions();
    private handleWorkspaceContainsEagerExtensions();
    private handleExtensionTests();
    private gracefulExit(code);
}
