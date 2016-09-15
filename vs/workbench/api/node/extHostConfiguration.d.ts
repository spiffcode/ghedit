import Event from 'vs/base/common/event';
import { WorkspaceConfiguration } from 'vscode';
import { ExtHostConfigurationShape } from './extHost.protocol';
export declare class ExtHostConfiguration extends ExtHostConfigurationShape {
    private _config;
    private _hasConfig;
    private _onDidChangeConfiguration;
    constructor();
    onDidChangeConfiguration: Event<void>;
    $acceptConfigurationChanged(config: any): void;
    getConfiguration(section?: string): WorkspaceConfiguration;
    private static _lookUp(section, config);
}
