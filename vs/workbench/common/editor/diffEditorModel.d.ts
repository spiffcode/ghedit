import { TPromise } from 'vs/base/common/winjs.base';
import { EditorModel } from 'vs/workbench/common/editor';
/**
 * The base editor model for the diff editor. It is made up of two editor models, the original version
 * and the modified version.
 */
export declare class DiffEditorModel extends EditorModel {
    private _originalModel;
    private _modifiedModel;
    constructor(originalModel: EditorModel, modifiedModel: EditorModel);
    originalModel: EditorModel;
    modifiedModel: EditorModel;
    load(): TPromise<EditorModel>;
    isResolved(): boolean;
    dispose(): void;
}
