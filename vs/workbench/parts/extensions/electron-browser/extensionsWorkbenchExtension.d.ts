import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IExtensionManagementService, IExtensionGalleryService, IExtensionTipsService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMessageService } from 'vs/platform/message/common/message';
import { IExtensionsWorkbenchService } from './extensions';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IActivityService } from 'vs/workbench/services/activity/common/activityService';
export declare class ExtensionsWorkbenchExtension implements IWorkbenchContribution {
    private instantiationService;
    private extensionManagementService;
    private messageService;
    constructor(instantiationService: IInstantiationService, extensionManagementService: IExtensionManagementService, messageService: IMessageService, contextService: IWorkspaceContextService, extenstionTips: IExtensionTipsService, galleryService: IExtensionGalleryService);
    private registerListeners();
    private install(extensions);
    getId(): string;
}
export declare class StatusUpdater implements IWorkbenchContribution {
    private activityService;
    private extensionsWorkbenchService;
    private disposables;
    constructor(activityService: IActivityService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    getId(): string;
    private onServiceChange();
    dispose(): void;
}
