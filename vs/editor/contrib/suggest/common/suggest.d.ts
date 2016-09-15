import { TPromise } from 'vs/base/common/winjs.base';
import { IReadOnlyModel } from 'vs/editor/common/editorCommon';
import { ISuggestResult, ISuggestSupport, ISuggestion } from 'vs/editor/common/modes';
import { Position } from 'vs/editor/common/core/position';
export declare const Context: {
    Visible: string;
    MultipleSuggestions: string;
    AcceptOnKey: string;
};
export interface ISuggestionItem {
    suggestion: ISuggestion;
    container: ISuggestResult;
    support: ISuggestSupport;
}
export declare type SnippetConfig = 'top' | 'bottom' | 'inline' | 'none' | 'only';
export interface ISuggestOptions {
    groups?: ISuggestSupport[][];
    snippetConfig?: SnippetConfig;
}
export declare function provideSuggestionItems(model: IReadOnlyModel, position: Position, options?: ISuggestOptions): TPromise<ISuggestionItem[]>;
