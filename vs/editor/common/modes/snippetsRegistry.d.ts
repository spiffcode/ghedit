import { IReadOnlyModel, IPosition } from 'vs/editor/common/editorCommon';
import { ISuggestion } from 'vs/editor/common/modes';
export declare const Extensions: {
    Snippets: string;
};
export interface ISnippetsRegistry {
    /**
     * Register a snippet to the registry.
     */
    registerSnippets(modeId: string, snippets: ISnippet[], owner?: string): void;
    /**
     * Visit all snippets
     */
    visitSnippets(modeId: string, accept: (snippet: ISnippet) => void): void;
    /**
     * Get all snippet completions for the given position
     */
    getSnippetCompletions(model: IReadOnlyModel, position: IPosition, result: ISuggestion[]): void;
}
export interface ISnippet {
    prefix: string;
    description: string;
    codeSnippet: string;
}
export declare function getNonWhitespacePrefix(model: IReadOnlyModel, position: IPosition): string;
