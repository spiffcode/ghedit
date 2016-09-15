import { IMode, IState, IStream, ITokenizationResult } from 'vs/editor/common/modes';
export declare class AbstractState implements IState {
    private mode;
    private stateData;
    constructor(mode: IMode, stateData?: IState);
    getMode(): IMode;
    clone(): IState;
    makeClone(): AbstractState;
    initializeFrom(other: AbstractState): void;
    getStateData(): IState;
    setStateData(state: IState): void;
    equals(other: IState): boolean;
    tokenize(stream: IStream): ITokenizationResult;
    static safeEquals(a: IState, b: IState): boolean;
    static safeClone(state: IState): IState;
}
