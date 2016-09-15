import { IDisposable } from 'vs/base/common/lifecycle';
import { TPromise } from 'vs/base/common/winjs.base';
import { Range } from 'vs/editor/common/core/range';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { TextModel } from 'vs/editor/common/model/textModel';
import { TokenIterator } from 'vs/editor/common/model/tokenIterator';
import { ILineContext, IMode } from 'vs/editor/common/modes';
import { ModeTransition } from 'vs/editor/common/core/modeTransition';
export interface IRetokenizeRequest extends IDisposable {
    isFulfilled: boolean;
    /**
     * If null, the entire model will be retokenzied, use null with caution
     */
    getRange(): editorCommon.IRange;
}
export declare class FullModelRetokenizer implements IRetokenizeRequest {
    isFulfilled: boolean;
    _model: TextModelWithTokens;
    private _retokenizePromise;
    private _isDisposed;
    constructor(retokenizePromise: TPromise<void>, model: TextModelWithTokens);
    getRange(): editorCommon.IRange;
    dispose(): void;
}
export declare class TextModelWithTokens extends TextModel implements editorCommon.ITokenizedModel {
    private static MODE_TOKENIZATION_FAILED_MSG;
    private _mode;
    private _modeListener;
    private _modeToModelBinder;
    private _tokensInflatorMap;
    private _invalidLineStartIndex;
    private _lastState;
    private _revalidateTokensTimeout;
    private _scheduleRetokenizeNow;
    private _retokenizers;
    constructor(allowedEventTypes: string[], rawText: editorCommon.IRawText, modeOrPromise: IMode | TPromise<IMode>);
    dispose(): void;
    protected _shouldAutoTokenize(): boolean;
    private _massageMode(mode);
    whenModeIsReady(): TPromise<IMode>;
    onRetokenizerFulfilled(): void;
    private _retokenizeNow();
    _createRetokenizer(retokenizePromise: TPromise<void>, lineNumber: number): IRetokenizeRequest;
    _resetValue(e: editorCommon.IModelContentChangedFlushEvent, newValue: editorCommon.IRawText): void;
    _resetMode(e: editorCommon.IModelModeChangedEvent, newMode: IMode): void;
    private _resetModeListener(newMode);
    private _onModeSupportChanged(e);
    _resetTokenizationState(): void;
    private _clearTimers();
    private _initializeTokenizationState();
    getLineTokens(lineNumber: number, inaccurateTokensAcceptable?: boolean): editorCommon.ILineTokens;
    getLineContext(lineNumber: number): ILineContext;
    _getInternalTokens(lineNumber: number): editorCommon.ILineTokens;
    getMode(): IMode;
    setMode(newModeOrPromise: IMode | TPromise<IMode>): void;
    getModeIdAtPosition(_lineNumber: number, _column: number): string;
    _invalidateLine(lineIndex: number): void;
    private static _toLineTokens(tokens);
    private static _toModeTransitions(modeTransitions);
    private _updateLineTokens(lineIndex, map, topLevelMode, r);
    private _beginBackgroundTokenization();
    _warmUpTokens(): void;
    private _revalidateTokensNow(toLineNumber?);
    private getStateBeforeLine(lineNumber);
    private getStateAfterLine(lineNumber);
    _getLineModeTransitions(lineNumber: number): ModeTransition[];
    private _updateTokensUntilLine(lineNumber, emitEvents);
    private emitModelTokensChangedEvent(fromLineNumber, toLineNumber);
    private _emitModelModeChangedEvent(e);
    private _emitModelModeSupportChangedEvent(e);
    _lineIsTokenized(lineNumber: number): boolean;
    _getWordDefinition(): RegExp;
    getWordAtPosition(position: editorCommon.IPosition): editorCommon.IWordAtPosition;
    getWordUntilPosition(position: editorCommon.IPosition): editorCommon.IWordAtPosition;
    tokenIterator(position: editorCommon.IPosition, callback: (it: TokenIterator) => any): any;
    findMatchingBracketUp(bracket: string, _position: editorCommon.IPosition): Range;
    matchBracket(position: editorCommon.IPosition): [Range, Range];
    private _matchBracket(position);
    private _matchFoundBracket(foundBracket, data, isOpen);
    private _findMatchingBracketUp(bracket, position);
    private _findMatchingBracketDown(bracket, position);
    findPrevBracket(_position: editorCommon.IPosition): editorCommon.IFoundBracket;
    findNextBracket(_position: editorCommon.IPosition): editorCommon.IFoundBracket;
    private _toFoundBracket(r);
}
