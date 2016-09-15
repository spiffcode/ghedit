import { EventEmitter } from 'events';
import { TPromise } from 'vs/base/common/winjs.base';
import { ISettingsService } from 'vs/code/electron-main/settings';
import { ILifecycleService } from 'vs/code/electron-main/lifecycle';
import { IEnvironmentService } from 'vs/code/electron-main/env';
export interface IUpdate {
    url: string;
    name: string;
    releaseNotes?: string;
    version?: string;
    hash?: string;
}
export declare class Win32AutoUpdaterImpl extends EventEmitter {
    private lifecycleService;
    private envService;
    private settingsService;
    private url;
    private currentRequest;
    constructor(lifecycleService: ILifecycleService, envService: IEnvironmentService, settingsService: ISettingsService);
    cachePath: TPromise<string>;
    setFeedURL(url: string): void;
    checkForUpdates(): void;
    private getUpdatePackagePath(version);
    private quitAndUpdate(updatePackagePath);
    private cleanup(exceptVersion?);
}
