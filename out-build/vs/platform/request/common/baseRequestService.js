define(["require", "exports", 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/base/common/strings', 'vs/base/common/timer', 'vs/base/common/async', 'vs/base/common/objects', 'vs/platform/request/common/request', 'vs/platform/telemetry/common/telemetry'], function (require, exports, uri_1, winjs_base_1, strings, Timer, Async, objects, request_1, telemetry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Simple IRequestService implementation to allow sharing of this service implementation
     * between different layers of the platform.
     */
    var BaseRequestService = (function () {
        function BaseRequestService(contextService, telemetryService) {
            if (telemetryService === void 0) { telemetryService = telemetry_1.NullTelemetryService; }
            this.serviceId = request_1.IRequestService;
            var workspaceUri = null;
            var workspace = contextService.getWorkspace();
            this._serviceMap = workspace || Object.create(null);
            this._telemetryService = telemetryService;
            if (workspace) {
                workspaceUri = strings.rtrim(workspace.resource.toString(), '/') + '/';
            }
            this.computeOrigin(workspaceUri);
        }
        BaseRequestService.prototype.computeOrigin = function (workspaceUri) {
            if (workspaceUri) {
                // Find root server URL from configuration
                this._origin = workspaceUri;
                var urlPath = uri_1.default.parse(this._origin).path;
                if (urlPath && urlPath.length > 0) {
                    this._origin = this._origin.substring(0, this._origin.length - urlPath.length + 1);
                }
                if (!strings.endsWith(this._origin, '/')) {
                    this._origin += '/';
                }
            }
            else {
                this._origin = '/'; // Configuration not provided, fallback to default
            }
        };
        BaseRequestService.prototype.makeCrossOriginRequest = function (options) {
            return null;
        };
        BaseRequestService.prototype.makeRequest = function (options) {
            var timer = Timer.nullEvent;
            var isXhrRequestCORS = false;
            var url = options.url;
            if (!url) {
                throw new Error('IRequestService.makeRequest: Url is required');
            }
            if ((strings.startsWith(url, 'http://') || strings.startsWith(url, 'https://')) && this._origin && !strings.startsWith(url, this._origin)) {
                var coPromise = this.makeCrossOriginRequest(options);
                if (coPromise) {
                    return coPromise;
                }
                isXhrRequestCORS = true;
            }
            var xhrOptions = options;
            var xhrOptionsPromise = winjs_base_1.TPromise.as(undefined);
            if (!isXhrRequestCORS) {
                xhrOptions = this._telemetryService.getTelemetryInfo().then(function (info) {
                    var additionalHeaders = {};
                    additionalHeaders['X-TelemetrySession'] = info.sessionId;
                    additionalHeaders['X-Requested-With'] = 'XMLHttpRequest';
                    xhrOptions.headers = objects.mixin(xhrOptions.headers, additionalHeaders);
                });
            }
            if (options.timeout) {
                xhrOptions.customRequestInitializer = function (xhrRequest) {
                    xhrRequest.timeout = options.timeout;
                };
            }
            return xhrOptionsPromise.then(function () {
                return Async.always(winjs_base_1.xhr(xhrOptions), (function (xhr) {
                    if (timer.data) {
                        timer.data.status = xhr.status;
                    }
                    timer.stop();
                }));
            });
        };
        return BaseRequestService;
    }());
    exports.BaseRequestService = BaseRequestService;
});
