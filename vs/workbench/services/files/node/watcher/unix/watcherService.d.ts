import { IEventService } from 'vs/platform/event/common/event';
export declare class FileWatcher {
    private basePath;
    private ignored;
    private eventEmitter;
    private errorLogger;
    private verboseLogging;
    private debugBrkFileWatcherPort;
    private static MAX_RESTARTS;
    private isDisposed;
    private restartCounter;
    constructor(basePath: string, ignored: string[], eventEmitter: IEventService, errorLogger: (msg: string) => void, verboseLogging: boolean, debugBrkFileWatcherPort: number);
    startWatching(): () => void;
    private onRawFileEvents(events);
}
