import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { TPromise } from 'vs/base/common/winjs.base';
export declare class EnvironmentService implements IEnvironmentService {
    _serviceBrand: any;
    private _appRoot;
    appRoot: string;
    private _userHome;
    userHome: string;
    private _userDataPath;
    userDataPath: string;
    private _extensionsPath;
    extensionsPath: string;
    private _extensionDevelopmentPath;
    extensionDevelopmentPath: string;
    isBuilt: boolean;
    constructor();
    createPaths(): TPromise<void>;
}
