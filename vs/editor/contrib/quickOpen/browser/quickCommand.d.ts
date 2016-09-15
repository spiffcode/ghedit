import { IAction } from 'vs/base/common/actions';
import { IContext, IHighlight, QuickOpenEntryGroup, QuickOpenModel } from 'vs/base/parts/quickopen/browser/quickOpenModel';
import { IAutoFocus, Mode } from 'vs/base/parts/quickopen/common/quickOpen';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommonCodeEditor, IEditor, IEditorActionDescriptorData } from 'vs/editor/common/editorCommon';
import { BaseEditorQuickOpenAction } from './editorQuickOpen';
export declare class EditorActionCommandEntry extends QuickOpenEntryGroup {
    private key;
    private action;
    private editor;
    constructor(key: string, highlights: IHighlight[], action: IAction, editor: IEditor);
    getLabel(): string;
    getAriaLabel(): string;
    getGroupLabel(): string;
    run(mode: Mode, context: IContext): boolean;
}
export declare class QuickCommandAction extends BaseEditorQuickOpenAction {
    static ID: string;
    private _keybindingService;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, keybindingService: IKeybindingService);
    _getModel(value: string): QuickOpenModel;
    _sort(elementA: QuickOpenEntryGroup, elementB: QuickOpenEntryGroup): number;
    _editorActionsToEntries(actions: IAction[], searchValue: string): EditorActionCommandEntry[];
    _getAutoFocus(searchValue: string): IAutoFocus;
    _getInputAriaLabel(): string;
}
