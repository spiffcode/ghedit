import * as modes from 'vs/editor/common/modes';
export declare class NullState implements modes.IState {
    private mode;
    private stateData;
    constructor(mode: modes.IMode, stateData: modes.IState);
    clone(): modes.IState;
    equals(other: modes.IState): boolean;
    getMode(): modes.IMode;
    tokenize(stream: modes.IStream): modes.ITokenizationResult;
    getStateData(): modes.IState;
    setStateData(stateData: modes.IState): void;
}
export declare class NullMode implements modes.IMode {
    static ID: string;
    constructor();
    getId(): string;
    toSimplifiedMode(): modes.IMode;
}
export declare function nullTokenize(mode: modes.IMode, buffer: string, state: modes.IState, deltaOffset?: number, stopAtOffset?: number): modes.ILineTokens;
