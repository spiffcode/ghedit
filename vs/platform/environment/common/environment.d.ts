import { TPromise } from 'vs/base/common/winjs.base';
export declare const IEnvironmentService: {
    (...args: any[]): void;
    type: IEnvironmentService;
};
export interface IEnvironmentService {
    _serviceBrand: any;
    appRoot: string;
    userHome: string;
    userDataPath: string;
    extensionsPath: string;
    extensionDevelopmentPath: string;
    isBuilt: boolean;
    createPaths(): TPromise<void>;
}
