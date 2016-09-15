import 'vs/css!./media/shell';
import { TPromise } from 'vs/base/common/winjs.base';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IOptions } from 'vs/workbench/common/options';
import { IEventService } from 'vs/platform/event/common/event';
import { IWorkspaceContextService, IConfiguration, IWorkspace } from 'vs/platform/workspace/common/workspace';
import 'vs/platform/opener/electron-browser/opener.contribution';
/**
 * Services that we require for the Shell
 */
export interface ICoreServices {
    contextService: IWorkspaceContextService;
    eventService: IEventService;
    configurationService: IConfigurationService;
}
/**
 * The workbench shell contains the workbench with a rich header containing navigation and the activity bar.
 * With the Shell being the top level element in the page, it is also responsible for driving the layouting.
 */
export declare class WorkbenchShell {
    private storageService;
    private messageService;
    private eventService;
    private contextViewService;
    private windowService;
    private threadService;
    private configurationService;
    private themeService;
    private contextService;
    private telemetryService;
    private container;
    private toUnbind;
    private previousErrorValue;
    private previousErrorTime;
    private content;
    private contentsContainer;
    private configuration;
    private workspace;
    private options;
    private workbench;
    constructor(container: HTMLElement, workspace: IWorkspace, services: ICoreServices, configuration: IConfiguration, options: IOptions);
    private createContents(parent);
    private onWorkbenchStarted(customKeybindingsCount);
    private initServiceCollection();
    open(): void;
    private registerListeners();
    private writeTimers();
    onUnexpectedError(error: any): void;
    layout(): void;
    joinCreation(): TPromise<boolean>;
    dispose(): void;
}
