import { TPromise } from 'vs/base/common/winjs.base';
import { JSONPath } from 'vs/base/common/json';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationService, IConfigurationServiceEvent } from 'vs/platform/configuration/common/configuration';
import Event from 'vs/base/common/event';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
/**
 * Configuration service to be used in the node side.
 * TODO@Joao:
 * 	- defaults handling
 *  - async reading
 *
 * At some point, an async get() on the configuration service would be
 * much easier to implement and reason about. IConfigurationService2?
 */
export declare class NodeConfigurationService implements IConfigurationService, IDisposable {
    _serviceBrand: any;
    private configurationPath;
    private watcher;
    private cache;
    private delayer;
    private disposables;
    private _onDidUpdateConfiguration;
    onDidUpdateConfiguration: Event<IConfigurationServiceEvent>;
    constructor(environmentService: IEnvironmentService);
    getConfiguration<T>(section?: string): T;
    setUserConfiguration(key: string | JSONPath, value: any): Thenable<void>;
    loadConfiguration<T>(section?: string): TPromise<T>;
    private _getConfiguration<T>(section?);
    private load();
    hasWorkspaceConfiguration(): boolean;
    dispose(): void;
}
