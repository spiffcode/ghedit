import { UserSettings, ISettings } from 'vs/base/node/userSettings';
import { IEnvironmentService } from 'vs/code/electron-main/env';
import Event from 'vs/base/common/event';
export declare const ISettingsService: {
    (...args: any[]): void;
    type: ISettingsService;
};
export interface ISettingsService {
    _serviceBrand: any;
    globalSettings: ISettings;
    loadSync(): boolean;
    getValue<T>(key: string, fallback?: T): T;
    onChange: Event<ISettings>;
}
export declare class SettingsManager extends UserSettings implements ISettingsService {
    _serviceBrand: any;
    constructor(envService: IEnvironmentService);
    loadSync(): boolean;
}
