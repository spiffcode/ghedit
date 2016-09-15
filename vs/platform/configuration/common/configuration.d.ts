import Event from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { JSONPath } from 'vs/base/common/json';
export declare const IConfigurationService: {
    (...args: any[]): void;
    type: IConfigurationService;
};
export interface IConfigurationService {
    _serviceBrand: any;
    /**
     * Fetches the appropriate section of the configuration JSON file.
     * This will be an object keyed off the section name.
     */
    getConfiguration<T>(section?: string): T;
    /**
     * Similar to #getConfiguration() but ensures that the latest configuration
     * from disk is fetched.
     */
    loadConfiguration<T>(section?: string): TPromise<T>;
    /**
     * Returns iff the workspace has configuration or not.
     */
    hasWorkspaceConfiguration(): boolean;
    /**
     * Event that fires when the configuration changes.
     */
    onDidUpdateConfiguration: Event<IConfigurationServiceEvent>;
    /**
     * Sets a user configuration. An the setting does not yet exist in the settings, it will be
     * added.
     */
    setUserConfiguration(key: string | JSONPath, value: any): Thenable<void>;
}
export interface IConfigurationServiceEvent {
    config: any;
}
export declare function getConfigurationValue<T>(config: any, settingPath: string, defaultValue?: T): T;
