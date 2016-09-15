import { TPromise } from 'vs/base/common/winjs.base';
import { EditorAction } from 'vs/editor/common/editorAction';
import { ICommonCodeEditor, IEditorActionDescriptorData } from 'vs/editor/common/editorCommon';
export declare class TriggerParameterHintsAction extends EditorAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor);
    isSupported(): boolean;
    run(): TPromise<boolean>;
}
