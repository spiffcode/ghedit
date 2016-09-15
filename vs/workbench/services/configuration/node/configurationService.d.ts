import { TPromise } from 'vs/base/common/winjs.base';
import uri from 'vs/base/common/uri';
import { IConfigFile } from 'vs/platform/configuration/common/model';
import { IStat, IContent, ConfigurationService as CommonConfigurationService } from 'vs/platform/configuration/common/configurationService';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IEventService } from 'vs/platform/event/common/event';
export declare class ConfigurationService extends CommonConfigurationService {
    _serviceBrand: any;
    protected contextService: IWorkspaceContextService;
    private toDispose;
    constructor(contextService: IWorkspaceContextService, eventService: IEventService);
    protected registerListeners(): void;
    private onOptionsChanged(e);
    protected resolveContents(resources: uri[]): TPromise<IContent[]>;
    protected resolveContent(resource: uri): TPromise<IContent>;
    protected resolveStat(resource: uri): TPromise<IStat>;
    protected loadWorkspaceConfiguration(section?: string): TPromise<{
        [relativeWorkspacePath: string]: IConfigFile;
    }>;
    protected loadGlobalConfiguration(): {
        contents: any;
        parseErrors?: string[];
    };
    setUserConfiguration(key: any, value: any): Thenable<void>;
    dispose(): void;
}
