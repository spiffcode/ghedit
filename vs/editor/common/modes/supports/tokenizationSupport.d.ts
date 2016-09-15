import { IDisposable } from 'vs/base/common/lifecycle';
import { TPromise } from 'vs/base/common/winjs.base';
import * as modes from 'vs/editor/common/modes';
export interface ILeavingNestedModeData {
    /**
     * The part of the line that will be tokenized by the nested mode
     */
    nestedModeBuffer: string;
    /**
     * The part of the line that will be tokenized by the parent mode when it continues after the nested mode
     */
    bufferAfterNestedMode: string;
    /**
     * The state that will be used for continuing tokenization by the parent mode after the nested mode
     */
    stateAfterNestedMode: modes.IState;
}
export interface IEnteringNestedModeData {
    mode: modes.IMode;
    missingModePromise: TPromise<void>;
}
export interface ITokenizationCustomization {
    getInitialState(): modes.IState;
    enterNestedMode?: (state: modes.IState) => boolean;
    getNestedMode?: (state: modes.IState) => IEnteringNestedModeData;
    getNestedModeInitialState?: (myState: modes.IState) => {
        state: modes.IState;
        missingModePromise: TPromise<void>;
    };
    /**
     * Return null if the line does not leave the nested mode
     */
    getLeavingNestedModeData?: (line: string, state: modes.IState) => ILeavingNestedModeData;
    /**
     * Callback for when leaving a nested mode and returning to the outer mode.
     * @param myStateAfterNestedMode The outer mode's state that will begin to tokenize
     * @param lastNestedModeState The nested mode's last state
     */
    onReturningFromNestedMode?: (myStateAfterNestedMode: modes.IState, lastNestedModeState: modes.IState) => void;
}
export declare class TokenizationSupport implements modes.ITokenizationSupport, IDisposable {
    static MAX_EMBEDDED_LEVELS: number;
    private customization;
    private defaults;
    supportsNestedModes: boolean;
    private _mode;
    private _embeddedModesListeners;
    constructor(mode: modes.IMode, customization: ITokenizationCustomization, supportsNestedModes: boolean);
    dispose(): void;
    getInitialState(): modes.IState;
    tokenize(line: string, state: modes.IState, deltaOffset?: number, stopAtOffset?: number): modes.ILineTokens;
    /**
     * Precondition is: nestedModeState.getMode() !== this
     * This means we are in a nested mode when parsing starts on this line.
     */
    private _nestedTokenize(buffer, nestedModeState, deltaOffset, stopAtOffset, prependTokens, prependModeTransitions);
    /**
     * Precondition is: state.getMode() === this
     * This means we are in the current mode when parsing starts on this line.
     */
    private _myTokenize(buffer, myState, deltaOffset, stopAtOffset, prependTokens, prependModeTransitions);
    private _getEmbeddedLevel(state);
    private enterNestedMode(state);
    private getNestedMode(state);
    private static _validatedNestedMode(input);
    private getNestedModeInitialState(state);
    private getLeavingNestedModeData(line, state);
    private onReturningFromNestedMode(myStateAfterNestedMode, lastNestedModeState);
}
