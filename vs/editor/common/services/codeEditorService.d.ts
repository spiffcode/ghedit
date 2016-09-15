import Event from 'vs/base/common/event';
import { ICommonCodeEditor, IDecorationRenderOptions, IModelDecorationOptions } from 'vs/editor/common/editorCommon';
export declare var ID_CODE_EDITOR_SERVICE: string;
export declare var ICodeEditorService: {
    (...args: any[]): void;
    type: ICodeEditorService;
};
export interface ICodeEditorService {
    _serviceBrand: any;
    addCodeEditor(editor: ICommonCodeEditor): void;
    onCodeEditorAdd: Event<ICommonCodeEditor>;
    removeCodeEditor(editor: ICommonCodeEditor): void;
    onCodeEditorRemove: Event<ICommonCodeEditor>;
    getCodeEditor(editorId: string): ICommonCodeEditor;
    listCodeEditors(): ICommonCodeEditor[];
    /**
     * Returns the current focused code editor (if the focus is in the editor or in an editor widget) or null.
     */
    getFocusedCodeEditor(): ICommonCodeEditor;
    registerDecorationType(key: string, options: IDecorationRenderOptions, parentTypeKey?: string): void;
    removeDecorationType(key: string): void;
    resolveDecorationOptions(typeKey: string, writable: boolean): IModelDecorationOptions;
}
