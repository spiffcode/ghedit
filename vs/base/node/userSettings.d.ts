import { TPromise } from 'vs/base/common/winjs.base';
import Event from 'vs/base/common/event';
export interface ISettings {
    settings: any;
    settingsParseErrors?: string[];
    keybindings: any;
}
export declare class UserSettings {
    private static CHANGE_BUFFER_DELAY;
    globalSettings: ISettings;
    private timeoutHandle;
    private watcher;
    private appSettingsPath;
    private appKeybindingsPath;
    private _onChange;
    constructor(appSettingsPath: string, appKeybindingsPath: string);
    static getValue(userDataPath: string, key: string, fallback?: any): TPromise<any>;
    onChange: Event<ISettings>;
    getValue(key: string, fallback?: any): any;
    private static doGetValue(globalSettings, key, fallback?);
    private registerWatchers();
    private onSettingsFileChange(eventType, fileName);
    loadSync(): boolean;
    private doLoadSync();
    private doLoadSettingsSync();
    private static setNode(root, key, value);
    private doLoadKeybindingsSync();
    dispose(): void;
}
