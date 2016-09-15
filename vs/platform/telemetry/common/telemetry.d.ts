import { TPromise } from 'vs/base/common/winjs.base';
import { ITimerEvent } from 'vs/base/common/timer';
export declare const ITelemetryService: {
    (...args: any[]): void;
    type: ITelemetryService;
};
export interface ITelemetryInfo {
    sessionId: string;
    machineId: string;
    instanceId: string;
}
export interface ITelemetryService {
    _serviceBrand: any;
    /**
     * Sends a telemetry event that has been privacy approved.
     * Do not call this unless you have been given approval.
     */
    publicLog(eventName: string, data?: any): TPromise<void>;
    /**
     * Starts a telemetry timer. Call stop() to send the event.
     */
    timedPublicLog(name: string, data?: any): ITimerEvent;
    getTelemetryInfo(): TPromise<ITelemetryInfo>;
    isOptedIn: boolean;
}
export declare const NullTelemetryService: ITelemetryService;
export interface ITelemetryAppender {
    log(eventName: string, data: any): void;
}
export declare function combinedAppender(...appenders: ITelemetryAppender[]): ITelemetryAppender;
export declare const NullAppender: ITelemetryAppender;
export declare function anonymize(input: string): string;
