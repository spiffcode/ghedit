import { TPromise } from 'vs/base/common/winjs.base';
import URI from 'vs/base/common/uri';
import Event from 'vs/base/common/event';
import { ITextFileOperationResult, ITextFileService, IRawTextContent, IAutoSaveConfiguration, AutoSaveMode } from 'vs/workbench/parts/files/common/files';
import { ConfirmResult } from 'vs/workbench/common/editor';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IFileService, IResolveContentOptions } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEventService } from 'vs/platform/event/common/event';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupService } from 'vs/workbench/services/group/common/groupService';
import { IModelService } from 'vs/editor/common/services/modelService';
/**
 * The workbench file service implementation implements the raw file service spec and adds additional methods on top.
 *
 * It also adds diagnostics and logging around file system operations.
 */
export declare abstract class TextFileService implements ITextFileService {
    protected contextService: IWorkspaceContextService;
    private instantiationService;
    private configurationService;
    private telemetryService;
    protected editorService: IWorkbenchEditorService;
    private editorGroupService;
    private eventService;
    protected fileService: IFileService;
    protected modelService: IModelService;
    _serviceBrand: any;
    private listenerToUnbind;
    private _onAutoSaveConfigurationChange;
    private configuredAutoSaveDelay;
    private configuredAutoSaveOnFocusChange;
    constructor(contextService: IWorkspaceContextService, instantiationService: IInstantiationService, configurationService: IConfigurationService, telemetryService: ITelemetryService, editorService: IWorkbenchEditorService, editorGroupService: IEditorGroupService, eventService: IEventService, fileService: IFileService, modelService: IModelService);
    protected init(): void;
    abstract resolveTextContent(resource: URI, options?: IResolveContentOptions): TPromise<IRawTextContent>;
    onAutoSaveConfigurationChange: Event<IAutoSaveConfiguration>;
    protected registerListeners(): void;
    private onEditorsChanged();
    private onConfigurationChange(configuration);
    getDirty(resources?: URI[]): URI[];
    isDirty(resource?: URI): boolean;
    save(resource: URI): TPromise<boolean>;
    saveAll(arg1?: any): TPromise<ITextFileOperationResult>;
    private getFileModels(resources?);
    private getFileModels(resource?);
    private getDirtyFileModels(resources?);
    private getDirtyFileModels(resource?);
    abstract saveAs(resource: URI, targetResource?: URI): TPromise<URI>;
    confirmSave(resources?: URI[]): ConfirmResult;
    revert(resource: URI, force?: boolean): TPromise<boolean>;
    revertAll(resources?: URI[], force?: boolean): TPromise<ITextFileOperationResult>;
    getAutoSaveMode(): AutoSaveMode;
    getAutoSaveConfiguration(): IAutoSaveConfiguration;
    dispose(): void;
}
