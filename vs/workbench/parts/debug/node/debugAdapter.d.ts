import debug = require('vs/workbench/parts/debug/common/debug');
import { ISystemVariables } from 'vs/base/common/parsers';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class Adapter {
    extensionDescription: IExtensionDescription;
    runtime: string;
    program: string;
    runtimeArgs: string[];
    args: string[];
    type: string;
    private _label;
    private configurationAttributes;
    initialConfigurations: any[];
    variables: {
        [key: string]: string;
    };
    enableBreakpointsFor: {
        languageIds: string[];
    };
    aiKey: string;
    constructor(rawAdapter: debug.IRawAdapter, systemVariables: ISystemVariables, extensionDescription: IExtensionDescription);
    label: string;
    getSchemaAttributes(): any[];
    private warnRelativePaths(attribute);
}
