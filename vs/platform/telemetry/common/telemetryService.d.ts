import { ITelemetryService, ITelemetryAppender, ITelemetryInfo } from 'vs/platform/telemetry/common/telemetry';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TPromise } from 'vs/base/common/winjs.base';
import { ITimerEvent } from 'vs/base/common/timer';
export interface ITelemetryServiceConfig {
    appender: ITelemetryAppender;
    commonProperties?: TPromise<{
        [name: string]: any;
    }>;
    piiPaths?: string[];
    userOptIn?: boolean;
}
export declare class TelemetryService implements ITelemetryService {
    private _configurationService;
    static IDLE_START_EVENT_NAME: string;
    static IDLE_STOP_EVENT_NAME: string;
    _serviceBrand: any;
    private _appender;
    private _commonProperties;
    private _piiPaths;
    private _userOptIn;
    private _disposables;
    private _timeKeeper;
    private _cleanupPatterns;
    constructor(config: ITelemetryServiceConfig, _configurationService: IConfigurationService);
    private _updateUserOptIn();
    private _onTelemetryTimerEventStop(events);
    isOptedIn: boolean;
    getTelemetryInfo(): TPromise<ITelemetryInfo>;
    dispose(): void;
    timedPublicLog(name: string, data?: any): ITimerEvent;
    publicLog(eventName: string, data?: any): TPromise<any>;
    private _cleanupInfo(stack);
}
