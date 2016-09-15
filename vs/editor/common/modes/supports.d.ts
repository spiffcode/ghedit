import { TPromise } from 'vs/base/common/winjs.base';
import * as modes from 'vs/editor/common/modes';
import { ModeTransition } from 'vs/editor/common/core/modeTransition';
export declare class Token implements modes.IToken {
    _tokenBrand: void;
    startIndex: number;
    type: string;
    constructor(startIndex: number, type: string);
    toString(): string;
}
export declare class LineTokens implements modes.ILineTokens {
    _lineTokensBrand: void;
    tokens: Token[];
    modeTransitions: ModeTransition[];
    actualStopOffset: number;
    endState: modes.IState;
    retokenize: TPromise<void>;
    constructor(tokens: Token[], modeTransitions: ModeTransition[], actualStopOffset: number, endState: modes.IState);
}
export declare function handleEvent<T>(context: modes.ILineContext, offset: number, runner: (modeId: string, newContext: modes.ILineContext, offset: number) => T): T;
export declare class FilteredLineContext implements modes.ILineContext {
    modeTransitions: ModeTransition[];
    private _actual;
    private _firstTokenInModeIndex;
    private _nextTokenAfterMode;
    private _firstTokenCharacterOffset;
    private _nextCharacterAfterModeIndex;
    constructor(actual: modes.ILineContext, mode: modes.IMode, firstTokenInModeIndex: number, nextTokenAfterMode: number, firstTokenCharacterOffset: number, nextCharacterAfterModeIndex: number);
    getLineContent(): string;
    getTokenCount(): number;
    findIndexOfOffset(offset: number): number;
    getTokenStartIndex(tokenIndex: number): number;
    getTokenEndIndex(tokenIndex: number): number;
    getTokenType(tokenIndex: number): string;
    getTokenText(tokenIndex: number): string;
}
export declare function ignoreBracketsInToken(tokenType: string): boolean;
