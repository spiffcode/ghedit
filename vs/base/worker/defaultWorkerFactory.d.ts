import { IWorker, IWorkerCallback, IWorkerFactory } from 'vs/base/common/worker/workerClient';
export declare class DefaultWorkerFactory implements IWorkerFactory {
    private static LAST_WORKER_ID;
    private _fallbackToIframe;
    private _webWorkerFailedBeforeError;
    constructor(fallbackToIframe: boolean);
    create(moduleId: string, onMessageCallback: IWorkerCallback, onErrorCallback: (err: any) => void): IWorker;
}
