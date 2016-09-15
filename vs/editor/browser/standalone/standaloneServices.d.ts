import { IDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IEditorService } from 'vs/platform/editor/common/editor';
import { IEventService } from 'vs/platform/event/common/event';
import { IExtensionService } from 'vs/platform/extensions/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { IMessageService } from 'vs/platform/message/common/message';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ICodeEditorService } from 'vs/editor/common/services/codeEditorService';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorkerService';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IModelService } from 'vs/editor/common/services/modelService';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { ICompatWorkerService } from 'vs/editor/common/services/compatWorkerService';
export interface IEditorContextViewService extends IContextViewService {
    dispose(): void;
    setContainer(domNode: HTMLElement): void;
}
export interface IEditorOverrideServices {
    /**
     * @internal
     */
    compatWorkerService?: ICompatWorkerService;
    /**
     * @internal
     */
    modeService?: IModeService;
    /**
     * @internal
     */
    extensionService?: IExtensionService;
    /**
     * @internal
     */
    instantiationService?: IInstantiationService;
    /**
     * @internal
     */
    messageService?: IMessageService;
    /**
     * @internal
     */
    markerService?: IMarkerService;
    /**
     * @internal
     */
    menuService?: IMenuService;
    /**
     * @internal
     */
    editorService?: IEditorService;
    /**
     * @internal
     */
    commandService?: ICommandService;
    /**
     * @internal
     */
    keybindingService?: IKeybindingService;
    /**
     * @internal
     */
    contextService?: IWorkspaceContextService;
    /**
     * @internal
     */
    contextViewService?: IEditorContextViewService;
    /**
     * @internal
     */
    contextMenuService?: IContextMenuService;
    /**
     * @internal
     */
    telemetryService?: ITelemetryService;
    /**
     * @internal
     */
    eventService?: IEventService;
    /**
     * @internal
     */
    storageService?: IStorageService;
    /**
     * @internal
     */
    configurationService?: IConfigurationService;
    /**
     * @internal
     */
    progressService?: IProgressService;
    /**
     * @internal
     */
    modelService?: IModelService;
    /**
     * @internal
     */
    codeEditorService?: ICodeEditorService;
    /**
     * @internal
     */
    editorWorkerService?: IEditorWorkerService;
}
export interface IStaticServices {
    configurationService: IConfigurationService;
    compatWorkerService: ICompatWorkerService;
    modeService: IModeService;
    extensionService: IExtensionService;
    markerService: IMarkerService;
    menuService: IMenuService;
    contextService: IWorkspaceContextService;
    messageService: IMessageService;
    telemetryService: ITelemetryService;
    modelService: IModelService;
    codeEditorService: ICodeEditorService;
    editorWorkerService: IEditorWorkerService;
    eventService: IEventService;
    storageService: IStorageService;
    commandService: ICommandService;
    instantiationService: IInstantiationService;
}
export declare function ensureStaticPlatformServices(services: IEditorOverrideServices): IEditorOverrideServices;
export declare function ensureDynamicPlatformServices(domElement: HTMLElement, services: IEditorOverrideServices): IDisposable[];
export declare function getOrCreateStaticServices(services?: IEditorOverrideServices): IStaticServices;
