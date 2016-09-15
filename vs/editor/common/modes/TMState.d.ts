import { IMode, IState, ITokenizationResult } from 'vs/editor/common/modes';
import { StackElement } from 'vscode-textmate';
export declare class TMState implements IState {
    private _mode;
    private _parentEmbedderState;
    private _ruleStack;
    constructor(mode: IMode, parentEmbedderState: IState, ruleStack: StackElement);
    clone(): TMState;
    equals(other: IState): boolean;
    getMode(): IMode;
    tokenize(stream: any): ITokenizationResult;
    getStateData(): IState;
    setStateData(state: IState): void;
    getRuleStack(): StackElement;
    setRuleStack(ruleStack: StackElement): void;
}
