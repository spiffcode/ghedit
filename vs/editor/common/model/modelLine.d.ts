import { ILineTokens, IReadOnlyLineMarker } from 'vs/editor/common/editorCommon';
import { IMode, IState } from 'vs/editor/common/modes';
import { TokensInflatorMap } from 'vs/editor/common/model/tokensBinaryEncoding';
import { ModeTransition } from 'vs/editor/common/core/modeTransition';
import { LineToken } from 'vs/editor/common/model/lineToken';
import { ViewLineToken } from 'vs/editor/common/core/viewLineToken';
export interface ILineEdit {
    startColumn: number;
    endColumn: number;
    text: string;
    forceMoveMarkers: boolean;
}
export interface ILineMarker extends IReadOnlyLineMarker {
    id: string;
    column: number;
    stickToPreviousCharacter: boolean;
    oldLineNumber: number;
    oldColumn: number;
    line: ModelLine;
}
export interface IChangedMarkers {
    [markerId: string]: boolean;
}
export interface ITextWithMarkers {
    text: string;
    markers: ILineMarker[];
}
export declare class ModelLine {
    private _lineNumber;
    lineNumber: number;
    private _text;
    text: string;
    /**
     * bits 31 - 1 => indentLevel
     * bit 0 => isInvalid
     */
    private _metadata;
    isInvalid: boolean;
    /**
     * Returns:
     *  - -1 => the line consists of whitespace
     *  - otherwise => the indent level is returned value
     */
    getIndentLevel(): number;
    private _setPlusOneIndentLevel(value);
    updateTabSize(tabSize: number): void;
    private _state;
    private _modeTransitions;
    private _lineTokens;
    private _markers;
    constructor(lineNumber: number, text: string, tabSize: number);
    setState(state: IState): void;
    getState(): IState;
    getModeTransitions(topLevelMode: IMode): ModeTransition[];
    setTokens(map: TokensInflatorMap, tokens: LineToken[], topLevelMode: IMode, modeTransitions: ModeTransition[]): void;
    private _setLineTokensFromDeflated(tokens);
    getTokens(map: TokensInflatorMap): ILineTokens;
    private _createTokensAdjuster();
    private _setText(text, tabSize);
    private _createMarkersAdjuster(changedMarkers);
    applyEdits(changedMarkers: IChangedMarkers, edits: ILineEdit[], tabSize: number): number;
    split(changedMarkers: IChangedMarkers, splitColumn: number, forceMoveMarkers: boolean, tabSize: number): ModelLine;
    append(changedMarkers: IChangedMarkers, other: ModelLine, tabSize: number): void;
    addMarker(marker: ILineMarker): void;
    addMarkers(markers: ILineMarker[]): void;
    private static _compareMarkers(a, b);
    removeMarker(marker: ILineMarker): void;
    removeMarkers(deleteMarkers: {
        [markerId: string]: boolean;
    }): void;
    getMarkers(): ILineMarker[];
    updateLineNumber(changedMarkers: IChangedMarkers, newLineNumber: number): void;
    deleteLine(changedMarkers: IChangedMarkers, setMarkersColumn: number, setMarkersOldLineNumber: number): ILineMarker[];
    private _indexOfMarkerId(markerId);
}
export declare class LineTokens implements ILineTokens {
    private map;
    private _tokens;
    constructor(map: TokensInflatorMap, tokens: number[]);
    getBinaryEncodedTokensMap(): TokensInflatorMap;
    getBinaryEncodedTokens(): number[];
    getTokenCount(): number;
    getTokenStartIndex(tokenIndex: number): number;
    getTokenType(tokenIndex: number): string;
    getTokenEndIndex(tokenIndex: number, textLength: number): number;
    equals(other: ILineTokens): boolean;
    findIndexOfOffset(offset: number): number;
    inflate(): ViewLineToken[];
    sliceAndInflate(startOffset: number, endOffset: number, deltaStartIndex: number): ViewLineToken[];
}
export declare class DefaultLineTokens implements ILineTokens {
    static INSTANCE: DefaultLineTokens;
    getTokenCount(): number;
    getTokenStartIndex(tokenIndex: number): number;
    getTokenType(tokenIndex: number): string;
    getTokenEndIndex(tokenIndex: number, textLength: number): number;
    equals(other: ILineTokens): boolean;
    findIndexOfOffset(offset: number): number;
    inflate(): ViewLineToken[];
    sliceAndInflate(startOffset: number, endOffset: number, deltaStartIndex: number): ViewLineToken[];
}
