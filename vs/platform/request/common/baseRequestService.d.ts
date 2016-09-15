import { TPromise } from 'vs/base/common/winjs.base';
import http = require('vs/base/common/http');
import { IRequestService } from 'vs/platform/request/common/request';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
/**
 * Simple IRequestService implementation to allow sharing of this service implementation
 * between different layers of the platform.
 */
export declare class BaseRequestService implements IRequestService {
    _serviceBrand: any;
    private _serviceMap;
    private _origin;
    protected _telemetryService: ITelemetryService;
    constructor(contextService: IWorkspaceContextService, telemetryService?: ITelemetryService);
    private computeOrigin(workspaceUri);
    protected makeCrossOriginRequest(options: http.IXHROptions): TPromise<http.IXHRResponse>;
    makeRequest(options: http.IXHROptions): TPromise<http.IXHRResponse>;
}
