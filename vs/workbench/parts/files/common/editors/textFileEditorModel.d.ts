import { TPromise } from 'vs/base/common/winjs.base';
import URI from 'vs/base/common/uri';
import { IMode } from 'vs/editor/common/modes';
import { ITextFileService, ModelState } from 'vs/workbench/parts/files/common/files';
import { EncodingMode, EditorModel, IEncodingSupport } from 'vs/workbench/common/editor';
import { BaseTextEditorModel } from 'vs/workbench/common/editor/textEditorModel';
import { IFileService } from 'vs/platform/files/common/files';
import { IEventService } from 'vs/platform/event/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMessageService } from 'vs/platform/message/common/message';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IModelService } from 'vs/editor/common/services/modelService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
/**
 * The save error handler can be installed on the text text file editor model to install code that executes when save errors occur.
 */
export interface ISaveErrorHandler {
    /**
     * Called whenever a save fails.
     */
    onSaveError(error: any, model: TextFileEditorModel): void;
}
/**
 * The text file editor model listens to changes to its underlying code editor model and saves these changes through the file service back to the disk.
 */
export declare class TextFileEditorModel extends BaseTextEditorModel implements IEncodingSupport {
    private messageService;
    private eventService;
    private fileService;
    private instantiationService;
    private telemetryService;
    private textFileService;
    static ID: string;
    private static saveErrorHandler;
    private resource;
    private contentEncoding;
    private preferredEncoding;
    private textModelChangeListener;
    private textFileServiceListener;
    private dirty;
    private versionId;
    private bufferSavedVersionId;
    private versionOnDiskStat;
    private blockModelContentChange;
    private autoSaveAfterMillies;
    private autoSaveAfterMilliesEnabled;
    private autoSavePromises;
    private mapPendingSaveToVersionId;
    private disposed;
    private inConflictResolutionMode;
    private inErrorMode;
    private lastDirtyTime;
    private createTextEditorModelPromise;
    constructor(resource: URI, preferredEncoding: string, messageService: IMessageService, modeService: IModeService, modelService: IModelService, eventService: IEventService, fileService: IFileService, instantiationService: IInstantiationService, telemetryService: ITelemetryService, textFileService: ITextFileService);
    private registerListeners();
    private updateAutoSaveConfiguration(config);
    /**
     * Set a save error handler to install code that executes when save errors occur.
     */
    static setSaveErrorHandler(handler: ISaveErrorHandler): void;
    /**
     * When set, will disable any saving (including auto save) until the model is loaded again. This allows to resolve save conflicts
     * without running into subsequent save errors when editing the model.
     */
    setConflictResolutionMode(): void;
    /**
     * Answers if this model is currently in conflic resolution mode or not.
     */
    isInConflictResolutionMode(): boolean;
    /**
     * Discards any local changes and replaces the model with the contents of the version on disk.
     */
    revert(): TPromise<void>;
    load(force?: boolean): TPromise<EditorModel>;
    protected getOrCreateMode(modeService: IModeService, preferredModeIds: string, firstLineText?: string): TPromise<IMode>;
    private onModelContentChanged(e);
    private makeDirty(e?);
    private doAutoSave(versionId);
    private cancelAutoSavePromises();
    /**
     * Saves the current versionId of this editor model if it is dirty.
     */
    save(overwriteReadonly?: boolean, overwriteEncoding?: boolean): TPromise<void>;
    private doSave(versionId, isAutoSave, overwriteReadonly?, overwriteEncoding?);
    private setDirty(dirty);
    private updateVersionOnDiskStat(newVersionOnDiskStat);
    private onSaveError(error);
    private emitEvent(type, event);
    private isBusySaving();
    /**
     * Returns true if the content of this model has changes that are not yet saved back to the disk.
     */
    isDirty(): boolean;
    /**
     * Returns the time in millies when this working copy was edited by the user.
     */
    getLastDirtyTime(): number;
    /**
     * Returns the time in millies when this working copy was last modified by the user or some other program.
     */
    getLastModifiedTime(): number;
    /**
     * Returns the state this text text file editor model is in with regards to changes and saving.
     */
    getState(): ModelState;
    getEncoding(): string;
    setEncoding(encoding: string, mode: EncodingMode): void;
    updatePreferredEncoding(encoding: string): void;
    private isNewEncoding(encoding);
    isResolved(): boolean;
    /**
     * Returns true if the dispose() method of this model has been called.
     */
    isDisposed(): boolean;
    /**
     * Returns the full resource URI of the file this text file editor model is about.
     */
    getResource(): URI;
    dispose(): void;
}
export declare class TextFileEditorModelCache {
    private mapResourcePathToModel;
    constructor();
    dispose(resource: URI): void;
    get(resource: URI): TextFileEditorModel;
    getAll(resource?: URI): TextFileEditorModel[];
    add(resource: URI, model: TextFileEditorModel): void;
    clear(): void;
    remove(resource: URI): void;
}
export declare const CACHE: TextFileEditorModelCache;
