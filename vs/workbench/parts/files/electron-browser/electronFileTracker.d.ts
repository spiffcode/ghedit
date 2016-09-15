import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITextFileService } from 'vs/workbench/parts/files/common/files';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWindowService } from 'vs/workbench/services/window/electron-browser/windowService';
import { IUntitledEditorService } from 'vs/workbench/services/untitled/common/untitledEditorService';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IEventService } from 'vs/platform/event/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IViewletService } from 'vs/workbench/services/viewlet/common/viewletService';
import { IEditorGroupService } from 'vs/workbench/services/group/common/groupService';
export interface IPath {
    filePath: string;
    lineNumber?: number;
    columnNumber?: number;
}
export interface IOpenFileRequest {
    filesToOpen?: IPath[];
    filesToCreate?: IPath[];
    filesToDiff?: IPath[];
}
export declare class FileTracker implements IWorkbenchContribution {
    private contextService;
    private eventService;
    private partService;
    private fileService;
    private textFileService;
    private viewletService;
    private editorService;
    private editorGroupService;
    private instantiationService;
    private untitledEditorService;
    private lifecycleService;
    private windowService;
    private activeOutOfWorkspaceWatchers;
    private isDocumentedEdited;
    private toUnbind;
    constructor(contextService: IWorkspaceContextService, eventService: IEventService, partService: IPartService, fileService: IFileService, textFileService: ITextFileService, viewletService: IViewletService, editorService: IWorkbenchEditorService, editorGroupService: IEditorGroupService, instantiationService: IInstantiationService, untitledEditorService: IUntitledEditorService, lifecycleService: ILifecycleService, windowService: IWindowService);
    private registerListeners();
    private onOpenFiles(request);
    private openResources(resources, diffMode);
    private toInputs(paths, isNew);
    private onEditorsChanged();
    private onUntitledDirtyEvent();
    private onUntitledSavedEvent();
    private onTextFileDirty(e);
    private onTextFileSaved(e);
    private onTextFileSaveError(e);
    private onTextFileReverted(e);
    private updateDocumentEdited();
    getId(): string;
    dispose(): void;
}
