import { TPromise } from 'vs/base/common/winjs.base';
import { Event as BaseEvent, PropertyChangeEvent } from 'vs/base/common/events';
import URI from 'vs/base/common/uri';
import Event from 'vs/base/common/event';
import { IModel, IEditorOptions, IRawText } from 'vs/editor/common/editorCommon';
import { IDisposable } from 'vs/base/common/lifecycle';
import { EncodingMode, EditorInput, IFileEditorInput, ConfirmResult, IWorkbenchEditorConfiguration, IEditorDescriptor } from 'vs/workbench/common/editor';
import { IFileStat, IFilesConfiguration, IBaseStat, IResolveContentOptions } from 'vs/platform/files/common/files';
/**
 * Explorer viewlet id.
 */
export declare const VIEWLET_ID: string;
/**
 * File editor input id.
 */
export declare const FILE_EDITOR_INPUT_ID: string;
/**
 * Text file editor id.
 */
export declare const TEXT_FILE_EDITOR_ID: string;
/**
 * Binary file editor id.
 */
export declare const BINARY_FILE_EDITOR_ID: string;
/**
 * API class to denote file editor inputs. Internal implementation is provided.
 *
 * Note: This class is not intended to be instantiated.
 */
export declare abstract class FileEditorInput extends EditorInput implements IFileEditorInput {
    abstract setResource(resource: URI): void;
    abstract getResource(): URI;
    abstract setMime(mime: string): void;
    abstract getMime(): string;
    abstract setPreferredEncoding(encoding: string): void;
    abstract setEncoding(encoding: string, mode: EncodingMode): void;
    abstract getEncoding(): string;
}
export interface IFilesConfiguration extends IFilesConfiguration, IWorkbenchEditorConfiguration {
    explorer: {
        openEditors: {
            visible: number;
            dynamicHeight: boolean;
        };
        autoReveal: boolean;
        enableDragAndDrop: boolean;
    };
    editor: IEditorOptions;
}
export interface IFileResource {
    resource: URI;
    isDirectory: boolean;
    mimes: string[];
}
/**
 * Helper to get a file resource from an object.
 */
export declare function asFileResource(obj: any): IFileResource;
/**
 * List of event types from files.
 */
export declare const EventType: {
    FILE_DIRTY: string;
    FILE_SAVING: string;
    FILE_SAVE_ERROR: string;
    FILE_SAVED: string;
    FILE_REVERTED: string;
};
/**
 * States the text text file editor model can be in.
 */
export declare enum ModelState {
    SAVED = 0,
    DIRTY = 1,
    PENDING_SAVE = 2,
    CONFLICT = 3,
    ERROR = 4,
}
/**
 * Local file change events are being emitted when a file is added, removed, moved or its contents got updated. These events
 * are being emitted from within the workbench and are not reflecting the truth on the disk file system. For that, please
 * use FileChangesEvent instead.
 */
export declare class LocalFileChangeEvent extends PropertyChangeEvent {
    constructor(before?: IFileStat, after?: IFileStat, originalEvent?: BaseEvent);
    /**
     * Returns the meta information of the file before the event occurred or null if the file is new.
     */
    getBefore(): IFileStat;
    /**
     * Returns the meta information of the file after the event occurred or null if the file got deleted.
     */
    getAfter(): IFileStat;
    /**
     * Indicates if the file was added as a new file.
     */
    gotAdded(): boolean;
    /**
     * Indicates if the file was moved to a different path.
     */
    gotMoved(): boolean;
    /**
     * Indicates if the files metadata was updated.
     */
    gotUpdated(): boolean;
    /**
     * Indicates if the file was deleted.
     */
    gotDeleted(): boolean;
}
/**
 * Text file change events are emitted when files are saved or reverted.
 */
export declare class TextFileChangeEvent extends BaseEvent {
    private _resource;
    private _model;
    private _isAutoSaved;
    constructor(resource: URI, model: IModel);
    resource: URI;
    model: IModel;
    setAutoSaved(autoSaved: boolean): void;
    isAutoSaved: boolean;
}
export declare const TEXT_FILE_SERVICE_ID: string;
export interface ITextFileOperationResult {
    results: IResult[];
}
export interface IResult {
    source: URI;
    target?: URI;
    success?: boolean;
}
export interface IAutoSaveConfiguration {
    autoSaveDelay: number;
    autoSaveFocusChange: boolean;
}
export declare enum AutoSaveMode {
    OFF = 0,
    AFTER_SHORT_DELAY = 1,
    AFTER_LONG_DELAY = 2,
    ON_FOCUS_CHANGE = 3,
}
export interface IFileEditorDescriptor extends IEditorDescriptor {
    getMimeTypes(): string[];
}
export declare const ITextFileService: {
    (...args: any[]): void;
    type: ITextFileService;
};
export interface IRawTextContent extends IBaseStat {
    /**
     * The line grouped content of a text file.
     */
    value: IRawText;
    /**
     * The line grouped logical hash of a text file.
     */
    valueLogicalHash: string;
    /**
     * The encoding of the content if known.
     */
    encoding: string;
}
export interface ITextFileService extends IDisposable {
    _serviceBrand: any;
    /**
     * Resolve the contents of a file identified by the resource.
     */
    resolveTextContent(resource: URI, options?: IResolveContentOptions): TPromise<IRawTextContent>;
    /**
     * A resource is dirty if it has unsaved changes or is an untitled file not yet saved.
     *
     * @param resource the resource to check for being dirty. If it is not specified, will check for
     * all dirty resources.
     */
    isDirty(resource?: URI): boolean;
    /**
     * Returns all resources that are currently dirty matching the provided resources or all dirty resources.
     *
     * @param resources the resources to check for being dirty. If it is not specified, will check for
     * all dirty resources.
     */
    getDirty(resources?: URI[]): URI[];
    /**
     * Saves the resource.
     *
     * @param resource the resource to save
     * @return true iff the resource was saved.
     */
    save(resource: URI): TPromise<boolean>;
    /**
     * Saves the provided resource asking the user for a file name.
     *
     * @param resource the resource to save as.
     * @return true iff the file was saved.
     */
    saveAs(resource: URI, targetResource?: URI): TPromise<URI>;
    /**
     * Saves the set of resources and returns a promise with the operation result.
     *
     * @param resources can be null to save all.
     * @param includeUntitled to save all resources and optionally exclude untitled ones.
     */
    saveAll(includeUntitled?: boolean): TPromise<ITextFileOperationResult>;
    saveAll(resources: URI[]): TPromise<ITextFileOperationResult>;
    /**
     * Reverts the provided resource.
     *
     * @param resource the resource of the file to revert.
     * @param force to force revert even when the file is not dirty
     */
    revert(resource: URI, force?: boolean): TPromise<boolean>;
    /**
     * Reverts all the provided resources and returns a promise with the operation result.
     *
     * @param force to force revert even when the file is not dirty
     */
    revertAll(resources?: URI[], force?: boolean): TPromise<ITextFileOperationResult>;
    /**
     * Brings up the confirm dialog to either save, don't save or cancel.
     *
     * @param resources the resources of the files to ask for confirmation or null if
     * confirming for all dirty resources.
     */
    confirmSave(resources?: URI[]): ConfirmResult;
    /**
     * Convinient fast access to the current auto save mode.
     */
    getAutoSaveMode(): AutoSaveMode;
    /**
     * Convinient fast access to the raw configured auto save settings.
     */
    getAutoSaveConfiguration(): IAutoSaveConfiguration;
    /**
     * Event is fired with the auto save configuration whenever it changes.
     */
    onAutoSaveConfigurationChange: Event<IAutoSaveConfiguration>;
}
