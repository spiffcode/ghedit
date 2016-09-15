import { WorkerServer } from 'vs/base/common/worker/workerServer';
export declare const value: {
    markdownToHtml(main: WorkerServer, resolve: Function, reject: Function, progress: Function, data: {
        source: string;
        highlight: boolean;
    }): void;
};
