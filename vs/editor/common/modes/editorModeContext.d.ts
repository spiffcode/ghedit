import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommonCodeEditor } from 'vs/editor/common/editorCommon';
export declare class EditorModeContext {
    private _disposables;
    private _editor;
    private _hasCompletionItemProvider;
    private _hasCodeActionsProvider;
    private _hasCodeLensProvider;
    private _hasDefinitionProvider;
    private _hasHoverProvider;
    private _hasDocumentHighlightProvider;
    private _hasDocumentSymbolProvider;
    private _hasReferenceProvider;
    private _hasRenameProvider;
    private _hasFormattingProvider;
    private _hasSignatureHelpProvider;
    constructor(editor: ICommonCodeEditor, keybindingService: IKeybindingService);
    dispose(): void;
    reset(): void;
    private _update();
}
