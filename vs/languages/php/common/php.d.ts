import WinJS = require('vs/base/common/winjs.base');
import Modes = require('vs/editor/common/modes');
import { CompatMode } from 'vs/editor/common/modes/abstractMode';
import { AbstractState } from 'vs/editor/common/modes/abstractState';
import { IModeService } from 'vs/editor/common/services/modeService';
import { LanguageConfiguration } from 'vs/editor/common/modes/languageConfigurationRegistry';
import { ILeavingNestedModeData, ITokenizationCustomization } from 'vs/editor/common/modes/supports/tokenizationSupport';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorkerService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICompatWorkerService } from 'vs/editor/common/services/compatWorkerService';
export declare class PHPState extends AbstractState {
    private name;
    private whitespaceTokenType;
    parent: Modes.IState;
    constructor(mode: Modes.IMode, name: string, parent: Modes.IState, whitespaceTokenType?: string);
    equals(other: Modes.IState): boolean;
    tokenize(stream: Modes.IStream): Modes.ITokenizationResult;
    stateTokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class PHPString extends PHPState {
    private delimiter;
    private isAtBeginning;
    constructor(mode: Modes.IMode, parent: Modes.IState, delimiter: string, isAtBeginning?: boolean);
    makeClone(): AbstractState;
    equals(other: Modes.IState): boolean;
    tokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class PHPNumber extends PHPState {
    private firstDigit;
    constructor(mode: Modes.IMode, parent: Modes.IState, firstDigit: string);
    makeClone(): AbstractState;
    equals(other: Modes.IState): boolean;
    tokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class PHPLineComment extends PHPState {
    constructor(mode: Modes.IMode, parent: Modes.IState);
    makeClone(): AbstractState;
    equals(other: Modes.IState): boolean;
    tokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class PHPDocComment extends PHPState {
    constructor(mode: Modes.IMode, parent: Modes.IState);
    makeClone(): AbstractState;
    equals(other: Modes.IState): boolean;
    tokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class PHPStatement extends PHPState {
    constructor(mode: Modes.IMode, parent: Modes.IState);
    makeClone(): AbstractState;
    equals(other: Modes.IState): boolean;
    stateTokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class PHPPlain extends PHPState {
    constructor(mode: Modes.IMode, parent: Modes.IState);
    makeClone(): AbstractState;
    equals(other: Modes.IState): boolean;
    stateTokenize(stream: Modes.IStream): Modes.ITokenizationResult;
}
export declare class PHPEnterHTMLState extends PHPState {
    constructor(mode: Modes.IMode, parent: Modes.IState);
    makeClone(): AbstractState;
    equals(other: Modes.IState): boolean;
}
export declare class PHPMode extends CompatMode implements ITokenizationCustomization {
    static LANG_CONFIG: LanguageConfiguration;
    tokenizationSupport: Modes.ITokenizationSupport;
    private modeService;
    constructor(descriptor: Modes.IModeDescriptor, modeService: IModeService, configurationService: IConfigurationService, editorWorkerService: IEditorWorkerService, compatWorkerService: ICompatWorkerService);
    getInitialState(): Modes.IState;
    enterNestedMode(state: Modes.IState): boolean;
    getNestedModeInitialState(myState: Modes.IState): {
        state: Modes.IState;
        missingModePromise: WinJS.Promise;
    };
    getLeavingNestedModeData(line: string, state: Modes.IState): ILeavingNestedModeData;
    onReturningFromNestedMode(myStateAfterNestedMode: Modes.IState, lastNestedModeState: Modes.IState): void;
}
