import { TPromise } from 'vs/base/common/winjs.base';
import { IReadOnlyModel } from 'vs/editor/common/editorCommon';
import { IFilter, IMatch } from 'vs/base/common/filters';
import { ISuggestResult, ISuggestion } from 'vs/editor/common/modes';
import { ISuggestionItem } from './suggest';
import { Position } from 'vs/editor/common/core/position';
export declare class CompletionItem {
    suggestion: ISuggestion;
    highlights: IMatch[];
    container: ISuggestResult;
    filter: IFilter;
    private _support;
    constructor(item: ISuggestionItem);
    resolveDetails(model: IReadOnlyModel, position: Position): TPromise<ISuggestion>;
    updateDetails(value: ISuggestion): void;
}
export declare class LineContext {
    leadingLineContent: string;
    characterCountDelta: number;
}
export declare class CompletionModel {
    raw: ISuggestionItem[];
    private _lineContext;
    private _items;
    private _filteredItems;
    constructor(raw: ISuggestionItem[], leadingLineContent: string);
    lineContext: LineContext;
    items: CompletionItem[];
    private _filter();
}
