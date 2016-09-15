import { TPromise } from 'vs/base/common/winjs.base';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorAction } from 'vs/editor/common/editorAction';
import { ICommonCodeEditor, IEditorActionDescriptorData, IEditorContribution } from 'vs/editor/common/editorCommon';
import { ISuggestSupport } from 'vs/editor/common/modes';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
export declare class SuggestController implements IEditorContribution {
    private editor;
    static ID: string;
    static getController(editor: ICommonCodeEditor): SuggestController;
    private model;
    private widget;
    private triggerCharacterListeners;
    private toDispose;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService);
    getId(): string;
    dispose(): void;
    private update();
    triggerSuggest(triggerCharacter?: string, groups?: ISuggestSupport[][]): TPromise<boolean>;
    acceptSelectedSuggestion(): void;
    cancelSuggestWidget(): void;
    selectNextSuggestion(): void;
    selectNextPageSuggestion(): void;
    selectPrevSuggestion(): void;
    selectPrevPageSuggestion(): void;
    toggleSuggestionDetails(): void;
}
export declare class TriggerSuggestAction extends EditorAction {
    static ID: string;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor);
    isSupported(): boolean;
    run(): TPromise<boolean>;
}
