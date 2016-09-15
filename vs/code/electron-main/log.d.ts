import { IEnvironmentService } from 'vs/code/electron-main/env';
export declare const ILogService: {
    (...args: any[]): void;
    type: ILogService;
};
export interface ILogService {
    _serviceBrand: any;
    log(...args: any[]): void;
}
export declare class MainLogService implements ILogService {
    private envService;
    _serviceBrand: any;
    constructor(envService: IEnvironmentService);
    log(...args: any[]): void;
}
