import { TPromise } from 'vs/base/common/winjs.base';
import URI from 'vs/base/common/uri';
import { EditorModel, EncodingMode, ConfirmResult } from 'vs/workbench/common/editor';
import { ITextFileService, FileEditorInput as CommonFileEditorInput } from 'vs/workbench/parts/files/common/files';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEventService } from 'vs/platform/event/common/event';
/**
 * A file editor input is the input type for the file editor of file system resources.
 */
export declare class FileEditorInput extends CommonFileEditorInput {
    private eventService;
    private instantiationService;
    private contextService;
    private textFileService;
    private static FILE_EDITOR_MODEL_CLIENTS;
    private static FILE_EDITOR_MODEL_LOADERS;
    private resource;
    private mime;
    private preferredEncoding;
    private name;
    private description;
    private verboseDescription;
    private toUnbind;
    /**
     * An editor input who's contents are retrieved from file services.
     */
    constructor(resource: URI, mime: string, preferredEncoding: string, eventService: IEventService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, textFileService: ITextFileService);
    private registerListeners();
    private onDirtyStateChange(e);
    setResource(resource: URI): void;
    getResource(): URI;
    getMime(): string;
    setMime(mime: string): void;
    setPreferredEncoding(encoding: string): void;
    getEncoding(): string;
    setEncoding(encoding: string, mode: EncodingMode): void;
    getTypeId(): string;
    getName(): string;
    getDescription(verbose?: boolean): string;
    isDirty(): boolean;
    confirmSave(): ConfirmResult;
    save(): TPromise<boolean>;
    revert(): TPromise<boolean>;
    getPreferredEditorId(candidates: string[]): string;
    resolve(refresh?: boolean): TPromise<EditorModel>;
    private indexOfClient();
    private createAndLoadModel();
    dispose(): void;
    matches(otherInput: any): boolean;
    /**
     * Exposed so that other internal file API can access the list of all file editor inputs
     * that have been loaded during the session.
     */
    static getAll(desiredFileOrFolderResource: URI): FileEditorInput[];
}
