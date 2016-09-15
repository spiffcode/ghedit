import http = require('vs/base/common/http');
import { TPromise } from 'vs/base/common/winjs.base';
export declare const IRequestService: {
    (...args: any[]): void;
    type: IRequestService;
};
export interface IRequestService {
    _serviceBrand: any;
    /**
     * Wraps the call into WinJS.XHR to allow for mocking and telemetry. Use this instead
     * of calling WinJS.XHR directly.
     */
    makeRequest(options: http.IXHROptions): TPromise<http.IXHRResponse>;
}
