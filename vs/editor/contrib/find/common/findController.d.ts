import { Disposable } from 'vs/base/common/lifecycle';
import { TPromise } from 'vs/base/common/winjs.base';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { Selection } from 'vs/editor/common/core/selection';
import { EditorAction } from 'vs/editor/common/editorAction';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { FindReplaceState } from 'vs/editor/contrib/find/common/findState';
export declare enum FindStartFocusAction {
    NoFocusChange = 0,
    FocusFindInput = 1,
    FocusReplaceInput = 2,
}
export interface IFindStartOptions {
    forceRevealReplace: boolean;
    seedSearchStringFromSelection: boolean;
    shouldFocus: FindStartFocusAction;
    shouldAnimate: boolean;
}
export declare const CONTEXT_FIND_WIDGET_VISIBLE: string;
export declare class CommonFindController extends Disposable implements editorCommon.IEditorContribution {
    static ID: string;
    private _editor;
    private _findWidgetVisible;
    protected _state: FindReplaceState;
    private _model;
    static getFindController(editor: editorCommon.ICommonCodeEditor): CommonFindController;
    constructor(editor: editorCommon.ICommonCodeEditor, keybindingService: IKeybindingService);
    dispose(): void;
    private disposeModel();
    getId(): string;
    private _onStateChanged(e);
    getState(): FindReplaceState;
    closeFindWidget(): void;
    toggleCaseSensitive(): void;
    toggleWholeWords(): void;
    toggleRegex(): void;
    setSearchString(searchString: string): void;
    getSelectionSearchString(): string;
    protected _start(opts: IFindStartOptions): void;
    start(opts: IFindStartOptions): void;
    moveToNextMatch(): boolean;
    moveToPrevMatch(): boolean;
    replace(): boolean;
    replaceAll(): boolean;
    selectAllMatches(): boolean;
}
export declare class StartFindAction extends EditorAction {
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare abstract class MatchFindAction extends EditorAction {
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
    protected abstract _run(controller: CommonFindController): boolean;
}
export declare class NextMatchFindAction extends MatchFindAction {
    protected _run(controller: CommonFindController): boolean;
}
export declare class PreviousMatchFindAction extends MatchFindAction {
    protected _run(controller: CommonFindController): boolean;
}
export declare abstract class SelectionMatchFindAction extends EditorAction {
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
    protected abstract _run(controller: CommonFindController): boolean;
}
export declare class NextSelectionMatchFindAction extends SelectionMatchFindAction {
    protected _run(controller: CommonFindController): boolean;
}
export declare class PreviousSelectionMatchFindAction extends SelectionMatchFindAction {
    protected _run(controller: CommonFindController): boolean;
}
export declare class StartFindReplaceAction extends EditorAction {
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export interface IMultiCursorFindResult {
    searchText: string;
    matchCase: boolean;
    wholeWord: boolean;
    currentMatch: Selection;
}
export declare class SelectNextFindMatchAction extends EditorAction {
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    protected _getNextMatch(): Selection;
}
export declare class SelectPreviousFindMatchAction extends EditorAction {
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    protected _getPreviousMatch(): Selection;
}
export declare class AddSelectionToNextFindMatchAction extends SelectNextFindMatchAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare class AddSelectionToPreviousFindMatchAction extends SelectPreviousFindMatchAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare class MoveSelectionToNextFindMatchAction extends SelectNextFindMatchAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare class MoveSelectionToPreviousFindMatchAction extends SelectPreviousFindMatchAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare class SelectHighlightsAction extends EditorAction {
    static ID: string;
    static COMPAT_ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    run(): TPromise<boolean>;
}
export declare class SelectionHighlighter extends Disposable implements editorCommon.IEditorContribution {
    static ID: string;
    private editor;
    private decorations;
    private updateSoon;
    private lastWordUnderCursor;
    constructor(editor: editorCommon.ICommonCodeEditor);
    getId(): string;
    private removeDecorations();
    private _update();
    dispose(): void;
}
