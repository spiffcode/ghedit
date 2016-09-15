import { EventEmitter } from 'events';
import { ISettingsService } from 'vs/code/electron-main/settings';
import { IEnvironmentService } from 'vs/code/electron-main/env';
export interface IUpdate {
    url: string;
    name: string;
    releaseNotes?: string;
    version?: string;
}
export declare class LinuxAutoUpdaterImpl extends EventEmitter {
    private envService;
    private settingsService;
    private url;
    private currentRequest;
    constructor(envService: IEnvironmentService, settingsService: ISettingsService);
    setFeedURL(url: string): void;
    checkForUpdates(): void;
}
