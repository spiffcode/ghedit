import { TPromise } from 'vs/base/common/winjs.base';
import { QuickOpenModel } from 'vs/base/parts/quickopen/browser/quickOpenModel';
import { IAutoFocus } from 'vs/base/parts/quickopen/common/quickOpen';
import { EditorAction } from 'vs/editor/common/editorAction';
import { Behaviour } from 'vs/editor/common/editorActionEnablement';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
export interface IQuickOpenControllerOpts {
    inputAriaLabel: string;
    getModel(value: string): QuickOpenModel;
    getAutoFocus(searchValue: string): IAutoFocus;
    onOk(): void;
    onCancel(): void;
}
export declare class QuickOpenController implements editorCommon.IEditorContribution {
    static ID: string;
    static get(editor: editorCommon.ICommonCodeEditor): QuickOpenController;
    private editor;
    private widget;
    constructor(editor: ICodeEditor);
    getId(): string;
    dispose(): void;
    run(opts: IQuickOpenControllerOpts): void;
}
/**
 * Base class for providing quick open in the editor.
 */
export declare class BaseEditorQuickOpenAction extends EditorAction {
    private lineHighlightDecorationId;
    private lastKnownEditorSelection;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, label: string, condition?: Behaviour);
    run(): TPromise<boolean>;
    /**
     * Subclasses to override to provide the quick open model for the given search value.
     */
    _getModel(value: string): QuickOpenModel;
    /**
     * Subclasses to override to provide the quick open auto focus mode for the given search value.
     */
    _getAutoFocus(searchValue: string): IAutoFocus;
    _getInputAriaLabel(): string;
    decorateLine(range: editorCommon.IRange, editor: ICodeEditor): void;
    clearDecorations(): void;
    /**
     * Subclasses can override this to participate in the close of quick open.
     */
    _onClose(canceled: boolean): void;
    dispose(): void;
}
export interface IDecorator {
    decorateLine(range: editorCommon.IRange, editor: editorCommon.IEditor): void;
    clearDecorations(): void;
}
