import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { IWindowService } from 'vs/workbench/services/window/electron-browser/windowService';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IMessageService } from 'vs/platform/message/common/message';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IQuickOpenService } from 'vs/workbench/services/quickopen/common/quickOpenService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class CloseEditorAction extends Action {
    private editorService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, editorService: IWorkbenchEditorService);
    run(): TPromise<any>;
}
export declare class CloseWindowAction extends Action {
    private windowService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, windowService: IWindowService);
    run(): TPromise<boolean>;
}
export declare class CloseFolderAction extends Action {
    private contextService;
    private messageService;
    private windowService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, contextService: IWorkspaceContextService, messageService: IMessageService, windowService: IWindowService);
    run(): TPromise<boolean>;
}
export declare class NewWindowAction extends Action {
    private windowService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, windowService: IWindowService);
    run(): TPromise<boolean>;
}
export declare class ToggleFullScreenAction extends Action {
    private windowService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, windowService: IWindowService);
    run(): TPromise<boolean>;
}
export declare class ToggleMenuBarAction extends Action {
    private windowService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, windowService: IWindowService);
    run(): TPromise<boolean>;
}
export declare class ToggleDevToolsAction extends Action {
    private windowService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, windowService: IWindowService);
    run(): TPromise<boolean>;
}
export declare class ZoomInAction extends Action {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string);
    run(): TPromise<boolean>;
}
export declare class ZoomOutAction extends Action {
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string);
    run(): TPromise<boolean>;
}
export declare class ZoomResetAction extends Action {
    private configurationService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, configurationService: IConfigurationService);
    run(): TPromise<boolean>;
    private getConfiguredZoomLevel();
}
export declare class ShowStartupPerformance extends Action {
    private windowService;
    private contextService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, windowService: IWindowService, contextService: IWorkspaceContextService);
    private _analyzeLoaderTimes();
    run(): TPromise<boolean>;
}
export declare class ReloadWindowAction extends Action {
    private windowService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, windowService: IWindowService);
    run(): TPromise<boolean>;
}
export declare class OpenRecentAction extends Action {
    private contextService;
    private quickOpenService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, contextService: IWorkspaceContextService, quickOpenService: IQuickOpenService);
    run(): TPromise<boolean>;
    private runPick(path, context);
}
export declare class CloseMessagesAction extends Action {
    private messageService;
    private editorService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, messageService: IMessageService, editorService: IWorkbenchEditorService);
    run(): TPromise<boolean>;
}
