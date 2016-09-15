import { TPromise } from 'vs/base/common/winjs.base';
import { EditorModel } from 'vs/workbench/common/editor';
import URI from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
/**
 * An editor model that just represents a resource and mime for a resource that can be loaded.
 */
export declare class BinaryEditorModel extends EditorModel {
    protected fileService: IFileService;
    private name;
    private resource;
    private size;
    constructor(resource: URI, name: string, fileService: IFileService);
    /**
     * The name of the binary resource.
     */
    getName(): string;
    /**
     * The resource of the binary resource.
     */
    getResource(): URI;
    /**
     * The size of the binary file if known.
     */
    getSize(): number;
    load(): TPromise<EditorModel>;
}
