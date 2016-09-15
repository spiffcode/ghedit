import 'vs/css!./quickOutline';
import { TPromise } from 'vs/base/common/winjs.base';
import { QuickOpenModel } from 'vs/base/parts/quickopen/browser/quickOpenModel';
import { IAutoFocus } from 'vs/base/parts/quickopen/common/quickOpen';
import { ICommonCodeEditor, IEditorActionDescriptorData } from 'vs/editor/common/editorCommon';
import { BaseEditorQuickOpenAction } from './editorQuickOpen';
export declare class QuickOutlineAction extends BaseEditorQuickOpenAction {
    static ID: string;
    private cachedResult;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor);
    isSupported(): boolean;
    run(): TPromise<boolean>;
    _getModel(value: string): QuickOpenModel;
    _getAutoFocus(searchValue: string): IAutoFocus;
    _getInputAriaLabel(): string;
    private toQuickOpenEntries(flattened, searchValue);
    private typeToLabel(type, count);
    private sortNormal(searchValue, elementA, elementB);
    private sortScoped(searchValue, elementA, elementB);
    _onClose(canceled: boolean): void;
    dispose(): void;
}
