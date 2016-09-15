import { IPosition, IWordAtPosition } from 'vs/editor/common/editorCommon';
import { IMode } from 'vs/editor/common/modes';
import { ModeTransition } from 'vs/editor/common/core/modeTransition';
export interface ITextSource {
    _lineIsTokenized(lineNumber: number): boolean;
    getLineContent(lineNumber: number): string;
    getMode(): IMode;
    _getLineModeTransitions(lineNumber: number): ModeTransition[];
}
export interface INonWordTokenMap {
    [key: string]: boolean;
}
export declare class WordHelper {
    private static _safeGetWordDefinition(mode);
    static massageWordDefinitionOf(mode: IMode): RegExp;
    private static _getWordAtColumn(txt, column, modeIndex, modeTransitions);
    static getWordAtPosition(textSource: ITextSource, position: IPosition): IWordAtPosition;
}
