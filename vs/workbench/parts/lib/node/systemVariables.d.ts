import URI from 'vs/base/common/uri';
import { AbstractSystemVariables } from 'vs/base/common/parsers';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
export declare class SystemVariables extends AbstractSystemVariables {
    private editorService;
    private _workspaceRoot;
    private _execPath;
    constructor(editorService: IWorkbenchEditorService, contextService: IWorkspaceContextService, workspaceRoot?: URI, envVariables?: {
        [key: string]: string;
    });
    execPath: string;
    cwd: string;
    workspaceRoot: string;
    file: string;
    relativeFile: string;
    fileBasename: string;
    fileDirname: string;
    fileExtname: string;
    private getFilePath();
}
