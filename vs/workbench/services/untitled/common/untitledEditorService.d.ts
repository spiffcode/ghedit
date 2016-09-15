import URI from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { UntitledEditorInput } from 'vs/workbench/common/editor/untitledEditorInput';
export declare const IUntitledEditorService: {
    (...args: any[]): void;
    type: IUntitledEditorService;
};
export interface IUntitledEditorService {
    _serviceBrand: any;
    /**
     * Returns the untitled editor input matching the provided resource.
     */
    get(resource: URI): UntitledEditorInput;
    /**
     * Returns all untitled editor inputs.
     */
    getAll(resources?: URI[]): UntitledEditorInput[];
    /**
     * Returns dirty untitled editors as resource URIs.
     */
    getDirty(): URI[];
    /**
     * Returns true iff the provided resource is dirty.
     */
    isDirty(resource: URI): boolean;
    /**
     * Reverts the untitled resources if found.
     */
    revertAll(resources?: URI[]): URI[];
    /**
     * Creates a new untitled input with the optional resource URI or returns an existing one
     * if the provided resource exists already as untitled input.
     *
     * It is valid to pass in a file resource. In that case the path will be used as identifier.
     * The use case is to be able to create a new file with a specific path with VSCode.
     */
    createOrGet(resource?: URI, modeId?: string): UntitledEditorInput;
    /**
     * A check to find out if a untitled resource has a file path associated or not.
     */
    hasAssociatedFilePath(resource: URI): boolean;
}
export declare class UntitledEditorService implements IUntitledEditorService {
    private instantiationService;
    _serviceBrand: any;
    private static CACHE;
    private static KNOWN_ASSOCIATED_FILE_PATHS;
    constructor(instantiationService: IInstantiationService);
    get(resource: URI): UntitledEditorInput;
    getAll(resources?: URI[]): UntitledEditorInput[];
    revertAll(resources?: URI[], force?: boolean): URI[];
    isDirty(resource: URI): boolean;
    getDirty(): URI[];
    createOrGet(resource?: URI, modeId?: string): UntitledEditorInput;
    private doCreate(resource?, hasAssociatedFilePath?, modeId?);
    private resourceToUntitled(resource);
    hasAssociatedFilePath(resource: URI): boolean;
}
