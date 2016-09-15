import Event from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ICommonCodeEditor } from 'vs/editor/common/editorCommon';
import { ISuggestSupport, ISuggestion } from 'vs/editor/common/modes';
import { CodeSnippet } from 'vs/editor/contrib/snippet/common/snippet';
import { CompletionModel } from './completionModel';
import { Position } from 'vs/editor/common/core/position';
export interface ICancelEvent {
    retrigger: boolean;
}
export interface ITriggerEvent {
    auto: boolean;
    characterTriggered: boolean;
    retrigger: boolean;
}
export interface ISuggestEvent {
    completionModel: CompletionModel;
    currentWord: string;
    isFrozen: boolean;
    auto: boolean;
}
export interface IAcceptEvent {
    snippet: CodeSnippet;
    overwriteBefore: number;
    overwriteAfter: number;
}
export declare class SuggestModel implements IDisposable {
    private editor;
    private toDispose;
    private autoSuggestDelay;
    private triggerAutoSuggestPromise;
    private state;
    private requestPromise;
    private context;
    private raw;
    private completionModel;
    private incomplete;
    private _onDidCancel;
    onDidCancel: Event<ICancelEvent>;
    private _onDidTrigger;
    onDidTrigger: Event<ITriggerEvent>;
    private _onDidSuggest;
    onDidSuggest: Event<ISuggestEvent>;
    private _onDidAccept;
    onDidAccept: Event<IAcceptEvent>;
    constructor(editor: ICommonCodeEditor);
    cancel(silent?: boolean, retrigger?: boolean): boolean;
    getRequestPosition(): Position;
    private isAutoSuggest();
    private onCursorChange(e);
    private onSuggestRegistryChange();
    trigger(auto: boolean, triggerCharacter?: string, retrigger?: boolean, groups?: ISuggestSupport[][]): void;
    private onNewContext(ctx);
    accept(suggestion: ISuggestion, overwriteBefore: number, overwriteAfter: number): boolean;
    private onEditorConfigurationChange();
    dispose(): void;
}
