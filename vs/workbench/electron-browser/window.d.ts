import { IViewletService } from 'vs/workbench/services/viewlet/common/viewletService';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IEventService } from 'vs/platform/event/common/event';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IEditorGroupService } from 'vs/workbench/services/group/common/groupService';
export interface IWindowConfiguration {
    window: {
        openFilesInNewWindow: boolean;
        reopenFolders: string;
        restoreFullscreen: boolean;
        zoomLevel: number;
    };
}
export declare class ElectronWindow {
    private contextService;
    private eventService;
    private storageService;
    private editorService;
    private editorGroupService;
    private viewletService;
    private win;
    private windowId;
    constructor(win: Electron.BrowserWindow, shellContainer: HTMLElement, contextService: IWorkspaceContextService, eventService: IEventService, storageService: IStorageService, editorService: IWorkbenchEditorService, editorGroupService: IEditorGroupService, viewletService: IViewletService);
    private registerListeners();
    private getFileKind(resource);
    openNew(): void;
    close(): void;
    reload(): void;
    showMessageBox(options: Electron.ShowMessageBoxOptions): number;
    showSaveDialog(options: Electron.SaveDialogOptions, callback?: (fileName: string) => void): string;
    setFullScreen(fullscreen: boolean): void;
    openDevTools(): void;
    setMenuBarVisibility(visible: boolean): void;
    focus(): void;
    flashFrame(): void;
}
