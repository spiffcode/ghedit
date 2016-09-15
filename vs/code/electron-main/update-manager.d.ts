import { EventEmitter } from 'events';
import { IEnvironmentService } from 'vs/code/electron-main/env';
import { ISettingsService } from 'vs/code/electron-main/settings';
import { ILifecycleService } from 'vs/code/electron-main/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare enum State {
    Uninitialized = 0,
    Idle = 1,
    CheckingForUpdate = 2,
    UpdateAvailable = 3,
    UpdateDownloaded = 4,
}
export declare enum ExplicitState {
    Implicit = 0,
    Explicit = 1,
}
export interface IUpdate {
    releaseNotes: string;
    version: string;
    date: Date;
    quitAndUpdate: () => void;
}
export declare const IUpdateService: {
    (...args: any[]): void;
    type: IUpdateService;
};
export interface IUpdateService {
    _serviceBrand: any;
    feedUrl: string;
    channel: string;
    initialize(): void;
    state: State;
    availableUpdate: IUpdate;
    lastCheckDate: Date;
    checkForUpdates(explicit: boolean): void;
    on(event: string, listener: Function): this;
}
export declare class UpdateManager extends EventEmitter implements IUpdateService {
    private lifecycleService;
    private envService;
    private settingsService;
    _serviceBrand: any;
    private _state;
    private explicitState;
    private _availableUpdate;
    private _lastCheckDate;
    private raw;
    private _feedUrl;
    private _channel;
    constructor(instantiationService: IInstantiationService, lifecycleService: ILifecycleService, envService: IEnvironmentService, settingsService: ISettingsService);
    private initRaw();
    private quitAndUpdate(rawQuitAndUpdate);
    feedUrl: string;
    channel: string;
    initialize(): void;
    state: State;
    availableUpdate: IUpdate;
    lastCheckDate: Date;
    checkForUpdates(explicit?: boolean): void;
    private setState(state, availableUpdate?);
    private getUpdateChannel();
    private getUpdateFeedUrl(channel);
}
