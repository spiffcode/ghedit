import * as minimist from 'minimist';
export interface ParsedArgs extends minimist.ParsedArgs {
    help: boolean;
    version: boolean;
    wait: boolean;
    diff: boolean;
    goto: boolean;
    'new-window': boolean;
    'reuse-window': boolean;
    locale: string;
    'user-data-dir': string;
    performance: boolean;
    verbose: boolean;
    logExtensionHostCommunication: boolean;
    debugBrkFileWatcherPort: string;
    'disable-extensions': boolean;
    extensionHomePath: string;
    extensionDevelopmentPath: string;
    extensionTestsPath: string;
    timestamp: string;
    debugBrkPluginHost: string;
    debugPluginHost: string;
    'list-extensions': boolean;
    'install-extension': string | string[];
    'uninstall-extension': string | string[];
}
export declare function parseArgs(args: string[]): ParsedArgs;
export declare const optionsHelp: {
    [name: string]: string;
};
export declare function formatOptions(options: {
    [name: string]: string;
}, columns: number): string;
export declare function buildHelpMessage(version: string): string;
