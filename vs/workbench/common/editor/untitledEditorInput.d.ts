import { TPromise } from 'vs/base/common/winjs.base';
import URI from 'vs/base/common/uri';
import { UntitledEditorInput as AbstractUntitledEditorInput, EditorModel, EncodingMode, ConfirmResult } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IEventService } from 'vs/platform/event/common/event';
import { ITextFileService } from 'vs/workbench/parts/files/common/files';
/**
 * An editor input to be used for untitled text buffers.
 */
export declare class UntitledEditorInput extends AbstractUntitledEditorInput {
    private instantiationService;
    private lifecycleService;
    private contextService;
    private modeService;
    private textFileService;
    private eventService;
    static ID: string;
    static SCHEMA: string;
    private resource;
    private hasAssociatedFilePath;
    private modeId;
    private cachedModel;
    private toUnbind;
    constructor(resource: URI, hasAssociatedFilePath: boolean, modeId: string, instantiationService: IInstantiationService, lifecycleService: ILifecycleService, contextService: IWorkspaceContextService, modeService: IModeService, textFileService: ITextFileService, eventService: IEventService);
    private registerListeners();
    private onDirtyStateChange(e);
    getTypeId(): string;
    getResource(): URI;
    getName(): string;
    getDescription(): string;
    isDirty(): boolean;
    confirmSave(): ConfirmResult;
    save(): TPromise<boolean>;
    revert(): TPromise<boolean>;
    suggestFileName(): string;
    getMime(): string;
    getEncoding(): string;
    setEncoding(encoding: string, mode: EncodingMode): void;
    resolve(refresh?: boolean): TPromise<EditorModel>;
    private createModel();
    matches(otherInput: any): boolean;
    dispose(): void;
}
