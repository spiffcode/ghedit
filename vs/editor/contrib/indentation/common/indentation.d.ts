import { TPromise } from 'vs/base/common/winjs.base';
import { EditorAction } from 'vs/editor/common/editorAction';
import { ICommonCodeEditor, IEditorActionDescriptorData } from 'vs/editor/common/editorCommon';
import { IQuickOpenService } from 'vs/workbench/services/quickopen/common/quickOpenService';
import { IModelService } from 'vs/editor/common/services/modelService';
export declare class IndentationToSpacesAction extends EditorAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare class IndentationToTabsAction extends EditorAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare class ChangeIndentationSizeAction extends EditorAction {
    private insertSpaces;
    private quickOpenService;
    private modelService;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, insertSpaces: boolean, quickOpenService: IQuickOpenService, modelService: IModelService);
    run(): TPromise<boolean>;
}
export declare class IndentUsingTabs extends ChangeIndentationSizeAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, quickOpenService: IQuickOpenService, modelService: IModelService);
}
export declare class IndentUsingSpaces extends ChangeIndentationSizeAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, quickOpenService: IQuickOpenService, modelService: IModelService);
}
export declare class DetectIndentation extends EditorAction {
    private modelService;
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, modelService: IModelService);
    run(): TPromise<boolean>;
}
export declare class ToggleRenderWhitespaceAction extends EditorAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare class ToggleRenderControlCharacterAction extends EditorAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor);
    run(): TPromise<boolean>;
}
