import { TPromise } from 'vs/base/common/winjs.base';
import Event from 'vs/base/common/event';
import editor = require('vs/editor/common/editorCommon');
import extensionsRegistry = require('vs/platform/extensions/common/extensionsRegistry');
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ICommandService } from 'vs/platform/commands/common/commands';
import debug = require('vs/workbench/parts/debug/common/debug');
import { Adapter } from 'vs/workbench/parts/debug/node/debugAdapter';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IQuickOpenService } from 'vs/workbench/services/quickopen/common/quickOpenService';
export declare const debuggersExtPoint: extensionsRegistry.IExtensionPoint<debug.IRawAdapter[]>;
export declare const breakpointsExtPoint: extensionsRegistry.IExtensionPoint<debug.IRawBreakpointContribution[]>;
export declare const schemaId: string;
export declare class ConfigurationManager implements debug.IConfigurationManager {
    private contextService;
    private fileService;
    private telemetryService;
    private editorService;
    private configurationService;
    private quickOpenService;
    private commandService;
    configuration: debug.IConfig;
    private systemVariables;
    private adapters;
    private allModeIdsForBreakpoints;
    private _onDidConfigurationChange;
    constructor(configName: string, contextService: IWorkspaceContextService, fileService: IFileService, telemetryService: ITelemetryService, editorService: IWorkbenchEditorService, configurationService: IConfigurationService, quickOpenService: IQuickOpenService, commandService: ICommandService);
    private registerListeners();
    onDidConfigurationChange: Event<string>;
    configurationName: string;
    adapter: Adapter;
    /**
     * Resolve all interactive variables in configuration #6569
     */
    resolveInteractiveVariables(): TPromise<debug.IConfig>;
    setConfiguration(nameOrConfig: string | debug.IConfig): TPromise<void>;
    openConfigFile(sideBySide: boolean): TPromise<boolean>;
    private getInitialConfigFileContent();
    private massageInitialConfigurations(adapter);
    canSetBreakpointsIn(model: editor.IModel): boolean;
    loadLaunchConfig(): TPromise<debug.IGlobalConfig>;
}
