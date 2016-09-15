import { Range } from 'vs/editor/common/core/range';
import * as editorCommon from 'vs/editor/common/editorCommon';
export interface IPlaceHolder {
    id: string;
    value: string;
    occurences: editorCommon.IRange[];
}
export interface IIndentationNormalizer {
    normalizeIndentation(str: string): string;
}
export interface ICodeSnippet {
    lines: string[];
    placeHolders: IPlaceHolder[];
    finishPlaceHolderIndex: number;
}
export declare enum ExternalSnippetType {
    TextMateSnippet = 0,
    EmmetSnippet = 1,
}
export declare class CodeSnippet implements ICodeSnippet {
    private _lastGeneratedId;
    lines: string[];
    placeHolders: IPlaceHolder[];
    finishPlaceHolderIndex: number;
    constructor(snippetTemplate: string);
    private parseTemplate(template);
    private parseLine(line, findDefaultValueForId);
    static convertExternalSnippet(snippet: string, snippetType: ExternalSnippetType): string;
    private extractLineIndentation(str, maxColumn?);
    bind(referenceLine: string, deltaLine: number, firstLineDeltaColumn: number, config: IIndentationNormalizer): ICodeSnippet;
}
export interface ITrackedPlaceHolder {
    ranges: string[];
}
export interface ISnippetController extends editorCommon.IEditorContribution {
    run(snippet: CodeSnippet, overwriteBefore: number, overwriteAfter: number, stripPrefix?: boolean): void;
    /**
     * Inserts once `snippet` at the start of `replaceRange`, after deleting `replaceRange`.
     */
    runWithReplaceRange(snippet: CodeSnippet, replaceRange: Range, undoStops: boolean): void;
    jumpToNextPlaceholder(): void;
    jumpToPrevPlaceholder(): void;
    acceptSnippet(): void;
    leaveSnippet(): void;
}
export declare function getSnippetController(editor: editorCommon.ICommonCodeEditor): ISnippetController;
export declare var CONTEXT_SNIPPET_MODE: string;
