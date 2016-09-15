import { TPromise } from 'vs/base/common/winjs.base';
import { IProductConfiguration } from 'vs/platform/product';
export interface IProcessEnvironment {
    [key: string]: string;
}
export interface ICommandLineArguments {
    verboseLogging: boolean;
    debugExtensionHostPort: number;
    debugBrkExtensionHost: boolean;
    debugBrkFileWatcherPort: number;
    logExtensionHostCommunication: boolean;
    disableExtensions: boolean;
    extensionsHomePath: string;
    extensionDevelopmentPath: string;
    extensionTestsPath: string;
    programStart: number;
    pathArguments?: string[];
    enablePerformance?: boolean;
    openNewWindow?: boolean;
    openInSameWindow?: boolean;
    gotoLineMode?: boolean;
    diffMode?: boolean;
    locale?: string;
    waitForWindowClose?: boolean;
}
export declare const IEnvironmentService: {
    (...args: any[]): void;
    type: IEnvironmentService;
};
export interface IEnvironmentService {
    _serviceBrand: any;
    cliArgs: ICommandLineArguments;
    userExtensionsHome: string;
    isTestingFromCli: boolean;
    isBuilt: boolean;
    product: IProductConfiguration;
    updateUrl: string;
    quality: string;
    userHome: string;
    appRoot: string;
    currentWorkingDirectory: string;
    appHome: string;
    appSettingsHome: string;
    appSettingsPath: string;
    appKeybindingsPath: string;
    mainIPCHandle: string;
    sharedIPCHandle: string;
    createPaths(): TPromise<void>;
}
export declare class EnvService implements IEnvironmentService {
    _serviceBrand: any;
    private _cliArgs;
    cliArgs: ICommandLineArguments;
    private _userExtensionsHome;
    userExtensionsHome: string;
    private _isTestingFromCli;
    isTestingFromCli: boolean;
    isBuilt: boolean;
    product: IProductConfiguration;
    updateUrl: string;
    quality: string;
    private _userHome;
    userHome: string;
    private _appRoot;
    appRoot: string;
    private _currentWorkingDirectory;
    currentWorkingDirectory: string;
    private _appHome;
    appHome: string;
    private _appSettingsHome;
    appSettingsHome: string;
    private _appSettingsPath;
    appSettingsPath: string;
    private _appKeybindingsPath;
    appKeybindingsPath: string;
    private _mainIPCHandle;
    mainIPCHandle: string;
    private _sharedIPCHandle;
    sharedIPCHandle: string;
    constructor();
    private getIPCHandleBaseName();
    private static getUniqueUserId();
    createPaths(): TPromise<void>;
}
export declare function getPlatformIdentifier(): string;
export interface IParsedPath {
    path: string;
    line?: number;
    column?: number;
}
export declare function parseLineAndColumnAware(rawPath: string): IParsedPath;
export declare function toLineAndColumnPath(parsedPath: IParsedPath): string;
