import workbenchExt = require('vs/workbench/common/contributions');
import { IFileService } from 'vs/platform/files/common/files';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class SnippetsTracker implements workbenchExt.IWorkbenchContribution {
    private fileService;
    private lifecycleService;
    private static FILE_WATCH_DELAY;
    private snippetFolder;
    private toDispose;
    private watcher;
    private fileWatchDelayer;
    constructor(fileService: IFileService, lifecycleService: ILifecycleService, contextService: IWorkspaceContextService);
    private registerListeners();
    private scanUserSnippets();
    private unregisterListener();
    getId(): string;
    dispose(): void;
}
