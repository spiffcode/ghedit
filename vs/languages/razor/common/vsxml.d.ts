import Modes = require('vs/editor/common/modes');
import { AbstractState } from 'vs/editor/common/modes/abstractState';
export interface IVSXMLWrapperState extends Modes.IState {
    setVSXMLState(newVSXMLState: VSXMLState): void;
}
export declare class EmbeddedState extends AbstractState {
    private state;
    private parentState;
    constructor(mode: Modes.IMode, state: Modes.IState, parentState: Modes.IState);
    getParentState(): Modes.IState;
    makeClone(): EmbeddedState;
    equals(other: Modes.IState): boolean;
    setState(nextState: Modes.IState): void;
    postTokenize(result: Modes.ITokenizationResult, stream: Modes.IStream): Modes.ITokenizationResult;
    tokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class VSXMLEmbeddedState extends EmbeddedState {
    constructor(mode: Modes.IMode, state: Modes.IState, parentState: IVSXMLWrapperState);
    equals(other: Modes.IState): boolean;
    setState(nextState: Modes.IState): void;
    postTokenize(result: Modes.ITokenizationResult, stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class VSXMLState extends AbstractState {
    parent: Modes.IState;
    whitespaceTokenType: string;
    private name;
    constructor(mode: Modes.IMode, name: string, parent: Modes.IState, whitespaceTokenType?: string);
    equals(other: Modes.IState): boolean;
    tokenize(stream: Modes.IStream): Modes.ITokenizationResult;
    stateTokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class VSXMLString extends VSXMLState {
    constructor(mode: Modes.IMode, parent: Modes.IState);
    makeClone(): VSXMLString;
    equals(other: Modes.IState): boolean;
    stateTokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class VSXMLTag extends VSXMLState {
    constructor(mode: Modes.IMode, parent: Modes.IState);
    makeClone(): VSXMLTag;
    equals(other: Modes.IState): boolean;
    stateTokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class VSXMLExpression extends VSXMLState {
    constructor(mode: Modes.IMode, parent: Modes.IState);
    makeClone(): VSXMLExpression;
    equals(other: Modes.IState): boolean;
    stateTokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
