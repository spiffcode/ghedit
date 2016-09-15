import { IStorageService } from 'vs/code/electron-main/storage';
import { TPromise } from 'vs/base/common/winjs.base';
import { ICommandLineArguments, IEnvironmentService, IProcessEnvironment } from 'vs/code/electron-main/env';
import { ILogService } from 'vs/code/electron-main/log';
export interface IWindowState {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    mode?: WindowMode;
}
export interface IWindowCreationOptions {
    state: IWindowState;
    extensionDevelopmentPath?: string;
    allowFullscreen?: boolean;
}
export declare enum WindowMode {
    Maximized = 0,
    Normal = 1,
    Minimized = 2,
    Fullscreen = 3,
}
export declare const defaultWindowState: (mode?: WindowMode) => IWindowState;
export declare enum ReadyState {
    /**
     * This window has not loaded any HTML yet
     */
    NONE = 0,
    /**
     * This window is loading HTML
     */
    LOADING = 1,
    /**
     * This window is navigating to another HTML
     */
    NAVIGATING = 2,
    /**
     * This window is done loading HTML
     */
    READY = 3,
}
export interface IPath {
    workspacePath?: string;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    createFilePath?: boolean;
    installExtensionPath?: boolean;
}
export interface IWindowConfiguration extends ICommandLineArguments {
    execPath: string;
    version: string;
    appName: string;
    applicationName: string;
    darwinBundleIdentifier: string;
    appSettingsHome: string;
    appSettingsPath: string;
    appKeybindingsPath: string;
    userExtensionsHome: string;
    mainIPCHandle: string;
    sharedIPCHandle: string;
    appRoot: string;
    isBuilt: boolean;
    commitHash: string;
    updateFeedUrl: string;
    updateChannel: string;
    recentFiles: string[];
    recentFolders: string[];
    workspacePath?: string;
    filesToOpen?: IPath[];
    filesToCreate?: IPath[];
    filesToDiff?: IPath[];
    extensionsToInstall: string[];
    crashReporter: Electron.CrashReporterStartOptions;
    extensionsGallery: {
        serviceUrl: string;
        itemUrl: string;
    };
    extensionTips: {
        [id: string]: string;
    };
    welcomePage: string;
    releaseNotesUrl: string;
    licenseUrl: string;
    productDownloadUrl: string;
    enableTelemetry: boolean;
    userEnv: IProcessEnvironment;
    aiConfig: {
        key: string;
        asimovKey: string;
    };
    sendASmile: {
        reportIssueUrl: string;
        requestFeatureUrl: string;
    };
}
export declare class VSCodeWindow {
    private logService;
    private envService;
    private storageService;
    static menuBarHiddenKey: string;
    static themeStorageKey: string;
    private static MIN_WIDTH;
    private static MIN_HEIGHT;
    private options;
    private showTimeoutHandle;
    private _id;
    private _win;
    private _lastFocusTime;
    private _readyState;
    private _extensionDevelopmentPath;
    private windowState;
    private currentWindowMode;
    private whenReadyCallbacks;
    private currentConfig;
    private pendingLoadConfig;
    constructor(config: IWindowCreationOptions, logService: ILogService, envService: IEnvironmentService, storageService: IStorageService);
    isPluginDevelopmentHost: boolean;
    extensionDevelopmentPath: string;
    config: IWindowConfiguration;
    id: number;
    win: Electron.BrowserWindow;
    focus(): void;
    lastFocusTime: number;
    openedWorkspacePath: string;
    openedFilePath: string;
    setReady(): void;
    ready(): TPromise<VSCodeWindow>;
    readyState: ReadyState;
    private registerListeners();
    load(config: IWindowConfiguration): void;
    reload(cli?: ICommandLineArguments): void;
    private getUrl(config);
    serializeWindowState(): IWindowState;
    private restoreWindowState(state?);
    private validateWindowState(state);
    getBounds(): Electron.Bounds;
    toggleFullScreen(): void;
    setMenuBarVisibility(visible: boolean): void;
    sendWhenReady(channel: string, ...args: any[]): void;
    send(channel: string, ...args: any[]): void;
    dispose(): void;
}
