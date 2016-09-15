import { TPromise } from 'vs/base/common/winjs.base';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { BaseRequestService } from 'vs/platform/request/common/baseRequestService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IXHROptions, IXHRResponse } from 'vs/base/common/http';
export declare class RequestService extends BaseRequestService {
    private disposables;
    private proxyUrl;
    private strictSSL;
    constructor(contextService: IWorkspaceContextService, configurationService: IConfigurationService, telemetryService?: ITelemetryService);
    private configure(config);
    makeRequest(options: IXHROptions): TPromise<IXHRResponse>;
    protected makeCrossOriginRequest(options: IXHROptions): TPromise<IXHRResponse>;
    dispose(): void;
}
