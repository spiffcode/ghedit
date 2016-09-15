import 'vs/css!./findWidget';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { Widget } from 'vs/base/browser/ui/widget';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { FindReplaceState } from 'vs/editor/contrib/find/common/findState';
export interface IFindController {
    replace(): void;
    replaceAll(): void;
}
export declare class FindWidget extends Widget implements IOverlayWidget {
    private static ID;
    private static PART_WIDTH;
    private static FIND_INPUT_AREA_WIDTH;
    private static REPLACE_INPUT_AREA_WIDTH;
    private _codeEditor;
    private _state;
    private _controller;
    private _contextViewProvider;
    private _keybindingService;
    private _domNode;
    private _findInput;
    private _replaceInputBox;
    private _toggleReplaceBtn;
    private _matchesCount;
    private _prevBtn;
    private _nextBtn;
    private _toggleSelectionFind;
    private _closeBtn;
    private _replaceBtn;
    private _replaceAllBtn;
    private _isVisible;
    private _isReplaceVisible;
    private _focusTracker;
    constructor(codeEditor: ICodeEditor, controller: IFindController, state: FindReplaceState, contextViewProvider: IContextViewProvider, keybindingService: IKeybindingService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition;
    private _onStateChanged(e);
    private _updateMatchesCount();
    /**
     * If 'selection find' is ON we should not disable the button (its function is to cancel 'selection find').
     * If 'selection find' is OFF we enable the button only if there is a multi line selection.
     */
    private _updateToggleSelectionFindButton();
    private _updateButtons();
    private _reveal(animate);
    private _hide(focusTheEditor);
    focusFindInput(): void;
    focusReplaceInput(): void;
    private _onFindInputKeyDown(e);
    private _onReplaceInputKeyDown(e);
    private _keybindingLabelFor(actionId);
    private _buildFindPart();
    private _buildReplacePart();
    private _buildDomNode();
}
