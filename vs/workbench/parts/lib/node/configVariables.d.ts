import { SystemVariables } from './systemVariables';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import URI from 'vs/base/common/uri';
export declare class ConfigVariables extends SystemVariables {
    private configurationService;
    constructor(configurationService: IConfigurationService, editorService: IWorkbenchEditorService, contextService: IWorkspaceContextService, workspaceRoot?: URI, envVariables?: {
        [key: string]: string;
    });
    protected resolveString(value: string): string;
}
