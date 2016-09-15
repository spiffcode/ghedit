import URI from 'vs/base/common/uri';
import { IWorkspaceContextService, IWorkspace, IConfiguration } from './workspace';
/**
 * Simple IWorkspaceContextService implementation to allow sharing of this service implementation
 * between different layers of the platform.
 */
export declare class BaseWorkspaceContextService implements IWorkspaceContextService {
    _serviceBrand: any;
    protected options: any;
    private workspace;
    private configuration;
    constructor(workspace: IWorkspace, configuration?: IConfiguration, options?: any);
    getWorkspace(): IWorkspace;
    getConfiguration(): IConfiguration;
    getOptions(): any;
    isInsideWorkspace(resource: URI): boolean;
    toWorkspaceRelativePath(resource: URI): string;
    toResource(workspaceRelativePath: string): URI;
}
