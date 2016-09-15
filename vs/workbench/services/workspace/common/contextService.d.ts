import { IOptions } from 'vs/workbench/common/options';
import { IEventService } from 'vs/platform/event/common/event';
import { IWorkspace, IConfiguration, IWorkspaceContextService as IBaseWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { BaseWorkspaceContextService } from 'vs/platform/workspace/common/baseWorkspaceContextService';
export declare const IWorkspaceContextService: {
    (...args: any[]): void;
    type: IWorkspaceContextService;
};
export interface IWorkspaceContextService extends IBaseWorkspaceContextService {
    _serviceBrand: any;
    /**
     * Provides access to the options object the platform is running with.
     */
    getOptions(): IOptions;
    /**
     * Update options in the running instance.
     */
    updateOptions(key: string, value: any): void;
}
export declare class WorkspaceContextService extends BaseWorkspaceContextService implements IWorkspaceContextService {
    private eventService;
    _serviceBrand: any;
    constructor(eventService: IEventService, workspace: IWorkspace, configuration?: IConfiguration, options?: any);
    updateOptions(key: string, value: any): void;
}
