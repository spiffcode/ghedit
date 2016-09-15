import { IDisposable } from 'vs/base/common/lifecycle';
export interface ISharedProcessOptions {
    allowOutput?: boolean;
    debugPort?: number;
}
export declare function spawnSharedProcess(options?: ISharedProcessOptions): IDisposable;
