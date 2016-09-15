import Event from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { TPromise } from 'vs/base/common/winjs.base';
import * as modes from 'vs/editor/common/modes';
export declare var IModeService: {
    (...args: any[]): void;
    type: IModeService;
};
export interface IModeLookupResult {
    modeId: string;
    isInstantiated: boolean;
}
export interface ILanguageExtensionPoint {
    id: string;
    extensions?: string[];
    filenames?: string[];
    filenamePatterns?: string[];
    firstLine?: string;
    aliases?: string[];
    mimetypes?: string[];
    configuration?: string;
}
export interface IValidLanguageExtensionPoint {
    id: string;
    extensions: string[];
    filenames: string[];
    filenamePatterns: string[];
    firstLine: string;
    aliases: string[];
    mimetypes: string[];
    configuration: string;
}
export interface IModeService {
    _serviceBrand: any;
    onDidAddModes: Event<string[]>;
    onDidCreateMode: Event<modes.IMode>;
    configureMode(modeName: string, options: any): void;
    configureModeById(modeId: string, options: any): void;
    getConfigurationForMode(modeId: string): any;
    isRegisteredMode(mimetypeOrModeId: string): boolean;
    isCompatMode(modeId: string): boolean;
    getRegisteredModes(): string[];
    getRegisteredLanguageNames(): string[];
    getExtensions(alias: string): string[];
    getMimeForMode(modeId: string): string;
    getLanguageName(modeId: string): string;
    getModeIdForLanguageName(alias: string): string;
    getModeIdByFilenameOrFirstLine(filename: string, firstLine?: string): string;
    getModeId(commaSeparatedMimetypesOrCommaSeparatedIds: string): string;
    getConfigurationFiles(modeId: string): string[];
    lookup(commaSeparatedMimetypesOrCommaSeparatedIds: string): IModeLookupResult[];
    getMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): modes.IMode;
    getOrCreateMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): TPromise<modes.IMode>;
    getOrCreateModeByLanguageName(languageName: string): TPromise<modes.IMode>;
    getOrCreateModeByFilenameOrFirstLine(filename: string, firstLine?: string): TPromise<modes.IMode>;
    registerTokenizationSupport(modeId: string, callback: (mode: modes.IMode) => modes.ITokenizationSupport): IDisposable;
    registerTokenizationSupport2(modeId: string, support: modes.TokensProvider): IDisposable;
}
