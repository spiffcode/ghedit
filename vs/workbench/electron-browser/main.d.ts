import winjs = require('vs/base/common/winjs.base');
import { IGlobalSettings } from 'vs/workbench/common/options';
import { IEnvironment } from 'vs/platform/workspace/common/workspace';
export interface IPath {
    filePath: string;
    lineNumber?: number;
    columnNumber?: number;
}
export interface IMainEnvironment extends IEnvironment {
    workspacePath?: string;
    filesToOpen?: IPath[];
    filesToCreate?: IPath[];
    filesToDiff?: IPath[];
    extensionsToInstall?: string[];
    userEnv: {
        [key: string]: string;
    };
}
export declare function startup(environment: IMainEnvironment, globalSettings: IGlobalSettings): winjs.TPromise<void>;
