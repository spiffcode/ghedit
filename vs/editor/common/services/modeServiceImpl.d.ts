import Event from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { TPromise } from 'vs/base/common/winjs.base';
import { IExtensionService } from 'vs/platform/extensions/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as modes from 'vs/editor/common/modes';
import { IModeLookupResult, IModeService } from 'vs/editor/common/services/modeService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class ModeServiceImpl implements IModeService {
    _serviceBrand: any;
    private _instantiationService;
    protected _extensionService: IExtensionService;
    private _activationPromises;
    private _instantiatedModes;
    private _config;
    private _registry;
    private _onDidAddModes;
    onDidAddModes: Event<string[]>;
    private _onDidCreateMode;
    onDidCreateMode: Event<modes.IMode>;
    constructor(instantiationService: IInstantiationService, extensionService: IExtensionService);
    getConfigurationForMode(modeId: string): any;
    configureMode(mimetype: string, options: any): void;
    configureModeById(modeId: string, options: any): void;
    protected _configureAllModes(config: any): void;
    isRegisteredMode(mimetypeOrModeId: string): boolean;
    isCompatMode(modeId: string): boolean;
    getRegisteredModes(): string[];
    getRegisteredLanguageNames(): string[];
    getExtensions(alias: string): string[];
    getMimeForMode(modeId: string): string;
    getLanguageName(modeId: string): string;
    getModeIdForLanguageName(alias: string): string;
    getModeId(commaSeparatedMimetypesOrCommaSeparatedIds: string): string;
    getConfigurationFiles(modeId: string): string[];
    lookup(commaSeparatedMimetypesOrCommaSeparatedIds: string): IModeLookupResult[];
    getMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): modes.IMode;
    getModeIdByLanguageName(languageName: string): string;
    getModeIdByFilenameOrFirstLine(filename: string, firstLine?: string): string;
    onReady(): TPromise<boolean>;
    getOrCreateMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): TPromise<modes.IMode>;
    getOrCreateModeByLanguageName(languageName: string): TPromise<modes.IMode>;
    getOrCreateModeByFilenameOrFirstLine(filename: string, firstLine?: string): TPromise<modes.IMode>;
    private _getOrCreateMode(modeId);
    private _createMode(modeId);
    private _createModeDescriptor(modeId);
    private _registerTokenizationSupport<T>(mode, callback);
    private registerModeSupport<T>(modeId, callback);
    registerTokenizationSupport(modeId: string, callback: (mode: modes.IMode) => modes.ITokenizationSupport): IDisposable;
    registerTokenizationSupport2(modeId: string, support: modes.TokensProvider): IDisposable;
}
export declare class TokenizationState2Adapter implements modes.IState {
    private _mode;
    private _actual;
    private _stateData;
    constructor(mode: modes.IMode, actual: modes.IState2, stateData: modes.IState);
    actual: modes.IState2;
    clone(): TokenizationState2Adapter;
    equals(other: modes.IState): boolean;
    getMode(): modes.IMode;
    tokenize(stream: any): any;
    getStateData(): modes.IState;
    setStateData(stateData: modes.IState): void;
}
export declare class TokenizationSupport2Adapter implements modes.ITokenizationSupport {
    private _mode;
    private _actual;
    constructor(mode: modes.IMode, actual: modes.TokensProvider);
    getInitialState(): modes.IState;
    tokenize(line: string, state: modes.IState, offsetDelta?: number, stopAtOffset?: number): modes.ILineTokens;
}
export declare class MainThreadModeServiceImpl extends ModeServiceImpl {
    private _configurationService;
    private _onReadyPromise;
    constructor(instantiationService: IInstantiationService, extensionService: IExtensionService, configurationService: IConfigurationService);
    onReady(): TPromise<boolean>;
    private onConfigurationChange(configuration);
}
