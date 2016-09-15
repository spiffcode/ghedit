import 'vs/css!./gotoLine';
import { IContext, QuickOpenEntry, QuickOpenModel } from 'vs/base/parts/quickopen/browser/quickOpenModel';
import { IAutoFocus, Mode } from 'vs/base/parts/quickopen/common/quickOpen';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { BaseEditorQuickOpenAction, IDecorator } from './editorQuickOpen';
export declare class GotoLineEntry extends QuickOpenEntry {
    private _parseResult;
    private decorator;
    private editor;
    constructor(line: string, editor: editorCommon.IEditor, decorator: IDecorator);
    private _parseInput(line);
    getLabel(): string;
    getAriaLabel(): string;
    run(mode: Mode, context: IContext): boolean;
    runOpen(): boolean;
    runPreview(): boolean;
    private toSelection();
}
export declare class GotoLineAction extends BaseEditorQuickOpenAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    _getModel(value: string): QuickOpenModel;
    _getAutoFocus(searchValue: string): IAutoFocus;
    _getInputAriaLabel(): string;
}
