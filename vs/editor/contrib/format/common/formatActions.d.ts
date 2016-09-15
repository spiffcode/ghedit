import { TPromise } from 'vs/base/common/winjs.base';
import { EditorAction } from 'vs/editor/common/editorAction';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { Selection } from 'vs/editor/common/core/selection';
export declare class FormatAction extends EditorAction {
    static ID: string;
    private _disposables;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    dispose(): void;
    isSupported(): boolean;
    run(): TPromise<boolean>;
    apply(editor: editorCommon.ICommonCodeEditor, editorSelection: Selection, value: editorCommon.ISingleEditOperation[]): void;
}
