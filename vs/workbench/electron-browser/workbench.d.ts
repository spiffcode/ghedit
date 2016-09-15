import 'vs/css!./media/workbench';
import { TPromise } from 'vs/base/common/winjs.base';
import { IOptions } from 'vs/workbench/common/options';
import { EditorPart } from 'vs/workbench/browser/parts/editor/editorPart';
import { SidebarPart } from 'vs/workbench/browser/parts/sidebar/sidebarPart';
import { PanelPart } from 'vs/workbench/browser/parts/panel/panelPart';
import { IUntitledEditorService } from 'vs/workbench/services/untitled/common/untitledEditorService';
import { Position, Parts, IPartService } from 'vs/workbench/services/part/common/partService';
import { IWorkspaceContextService as IWorkbenchWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspace, IConfiguration } from 'vs/platform/workspace/common/workspace';
import { IEventService } from 'vs/platform/event/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IMessageService } from 'vs/platform/message/common/message';
import { IThreadService } from 'vs/workbench/services/thread/common/threadService';
export interface IWorkbenchCallbacks {
    onServicesCreated?: () => void;
    onWorkbenchStarted?: (customKeybindingsCount: number) => void;
}
/**
 * The workbench creates and lays out all parts that make up the workbench.
 */
export declare class Workbench implements IPartService {
    private instantiationService;
    private untitledEditorService;
    private eventService;
    private contextService;
    private storageService;
    private lifecycleService;
    private messageService;
    private threadService;
    private static sidebarPositionSettingKey;
    private static statusbarHiddenSettingKey;
    private static sidebarHiddenSettingKey;
    private static panelHiddenSettingKey;
    _serviceBrand: any;
    private container;
    private workbenchParams;
    private workbenchContainer;
    private workbench;
    private workbenchStarted;
    private workbenchCreated;
    private workbenchShutdown;
    private editorService;
    private keybindingService;
    private activitybarPart;
    private sidebarPart;
    private panelPart;
    private editorPart;
    private statusbarPart;
    private quickOpen;
    private workbenchLayout;
    private toDispose;
    private toShutdown;
    private callbacks;
    private creationPromise;
    private creationPromiseComplete;
    private sideBarHidden;
    private statusBarHidden;
    private sideBarPosition;
    private panelHidden;
    private editorBackgroundDelayer;
    private messagesVisibleContext;
    private editorsVisibleContext;
    constructor(container: HTMLElement, workspace: IWorkspace, configuration: IConfiguration, options: IOptions, serviceCollection: ServiceCollection, instantiationService: IInstantiationService, untitledEditorService: IUntitledEditorService, eventService: IEventService, contextService: IWorkbenchWorkspaceContextService, storageService: IStorageService, lifecycleService: ILifecycleService, messageService: IMessageService, threadService: IThreadService);
    private validateParams(container, configuration, options);
    /**
     * Starts the workbench and creates the HTML elements on the container. A workbench can only be started
     * once. Use the shutdown function to free up resources created by the workbench on startup.
     */
    startup(callbacks?: IWorkbenchCallbacks): void;
    private resolveEditorsToOpen();
    private initServices();
    private initSettings();
    /**
     * Returns whether the workbench has been started.
     */
    isStarted(): boolean;
    /**
     * Returns whether the workbench has been fully created.
     */
    isCreated(): boolean;
    joinCreation(): TPromise<boolean>;
    hasFocus(part: Parts): boolean;
    isVisible(part: Parts): boolean;
    isStatusBarHidden(): boolean;
    setStatusBarHidden(hidden: boolean, skipLayout?: boolean): void;
    isSideBarHidden(): boolean;
    setSideBarHidden(hidden: boolean, skipLayout?: boolean): void;
    isPanelHidden(): boolean;
    setPanelHidden(hidden: boolean, skipLayout?: boolean): void;
    getSideBarPosition(): Position;
    setSideBarPosition(position: Position): void;
    dispose(): void;
    /**
     * Asks the workbench and all its UI components inside to lay out according to
     * the containers dimension the workbench is living in.
     */
    layout(): void;
    private shutdownComponents();
    private registerEmitters();
    private hookPartListeners(part);
    private registerListeners();
    private onEditorsChanged();
    private createWorkbenchLayout();
    private createWorkbench();
    private renderWorkbench();
    private createActivityBarPart();
    private createSidebarPart();
    private createPanelPart();
    private createEditorPart();
    private createStatusbarPart();
    getEditorPart(): EditorPart;
    getSidebarPart(): SidebarPart;
    getPanelPart(): PanelPart;
    getInstantiationService(): IInstantiationService;
    addClass(clazz: string): void;
    removeClass(clazz: string): void;
}
