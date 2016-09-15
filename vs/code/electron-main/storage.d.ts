import { IEnvironmentService } from 'vs/code/electron-main/env';
export declare const IStorageService: {
    (...args: any[]): void;
    type: IStorageService;
};
export interface IStorageService {
    _serviceBrand: any;
    onStore<T>(clb: (key: string, oldValue: T, newValue: T) => void): () => void;
    getItem<T>(key: string, defaultValue?: T): T;
    setItem(key: string, data: any): void;
    removeItem(key: string): void;
}
export declare class StorageService implements IStorageService {
    private envService;
    _serviceBrand: any;
    private dbPath;
    private database;
    private eventEmitter;
    constructor(envService: IEnvironmentService);
    onStore<T>(clb: (key: string, oldValue: T, newValue: T) => void): () => void;
    getItem<T>(key: string, defaultValue?: T): T;
    setItem(key: string, data: any): void;
    removeItem(key: string): void;
    private load();
    private save();
}
