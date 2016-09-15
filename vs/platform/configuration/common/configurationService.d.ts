import { TPromise } from 'vs/base/common/winjs.base';
import uri from 'vs/base/common/uri';
import model = require('./model');
import { IDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationService, IConfigurationServiceEvent } from './configuration';
import { IEventService } from 'vs/platform/event/common/event';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import Event from 'vs/base/common/event';
import { JSONPath } from 'vs/base/common/json';
export interface IStat {
    resource: uri;
    isDirectory: boolean;
    children?: {
        resource: uri;
    }[];
}
export interface IContent {
    resource: uri;
    value: string;
}
export declare abstract class ConfigurationService implements IConfigurationService, IDisposable {
    _serviceBrand: any;
    private static RELOAD_CONFIGURATION_DELAY;
    private _onDidUpdateConfiguration;
    protected contextService: IWorkspaceContextService;
    protected eventService: IEventService;
    protected workspaceSettingsRootFolder: string;
    private cachedConfig;
    private bulkFetchFromWorkspacePromise;
    private workspaceFilePathToConfiguration;
    private callOnDispose;
    private reloadConfigurationScheduler;
    constructor(contextService: IWorkspaceContextService, eventService: IEventService, workspaceSettingsRootFolder?: string);
    onDidUpdateConfiguration: Event<IConfigurationServiceEvent>;
    protected registerListeners(): void;
    initialize(): TPromise<void>;
    protected abstract resolveContents(resource: uri[]): TPromise<IContent[]>;
    protected abstract resolveContent(resource: uri): TPromise<IContent>;
    protected abstract resolveStat(resource: uri): TPromise<IStat>;
    abstract setUserConfiguration(key: string | JSONPath, value: any): Thenable<void>;
    getConfiguration<T>(section?: string): T;
    loadConfiguration(section?: string): TPromise<any>;
    private doLoadConfiguration(section?);
    protected loadGlobalConfiguration(): {
        contents: any;
        parseErrors?: string[];
    };
    hasWorkspaceConfiguration(): boolean;
    protected loadWorkspaceConfiguration(section?: string): TPromise<{
        [relativeWorkspacePath: string]: model.IConfigFile;
    }>;
    private onDidRegisterConfiguration();
    protected handleConfigurationChange(): void;
    private handleFileEvents(event);
    dispose(): void;
}
