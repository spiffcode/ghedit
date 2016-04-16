/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/platform/configuration/common/configurationRegistry', 'vs/base/common/strings', 'vs/nls!vs/workbench/services/request/node/requestService', 'vs/base/common/lifecycle', 'vs/base/common/timer', 'vs/platform/platform', 'vs/base/common/async', 'vs/platform/configuration/common/configuration', 'vs/platform/request/common/baseRequestService', 'vs/workbench/services/request/node/rawHttpService'], function (require, exports, winjs_base_1, configurationRegistry_1, strings, nls, lifecycle, timer, platform, async, configuration_1, baseRequestService_1, rawHttpService) {
    'use strict';
    var RequestService = (function (_super) {
        __extends(RequestService, _super);
        function RequestService(contextService, configurationService, telemetryService) {
            var _this = this;
            _super.call(this, contextService, telemetryService);
            this.configurationService = configurationService;
            this.callOnDispose = [];
            // proxy setting updating
            this.callOnDispose.push(configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) {
                _this.rawHttpServicePromise.then(function (rawHttpService) {
                    rawHttpService.configure(e.config.http && e.config.http.proxy, e.config.http.proxyStrictSSL);
                });
            }));
        }
        Object.defineProperty(RequestService.prototype, "rawHttpServicePromise", {
            get: function () {
                if (!this._rawHttpServicePromise) {
                    var configuration = this.configurationService.getConfiguration();
                    rawHttpService.configure(configuration.http && configuration.http.proxy, configuration.http.proxyStrictSSL);
                    return winjs_base_1.TPromise.as(rawHttpService);
                }
                return this._rawHttpServicePromise;
            },
            enumerable: true,
            configurable: true
        });
        RequestService.prototype.dispose = function () {
            lifecycle.cAll(this.callOnDispose);
        };
        RequestService.prototype.makeRequest = function (options) {
            var url = options.url;
            if (!url) {
                throw new Error('IRequestService.makeRequest: Url is required.');
            }
            // Support file:// in native environment through XHR
            if (strings.startsWith(url, 'file://')) {
                return winjs_base_1.xhr(options).then(null, function (xhr) {
                    if (xhr.status === 0 && xhr.responseText) {
                        return xhr; // loading resources locally returns a status of 0 which in WinJS is an error so we need to handle it here
                    }
                    return winjs_base_1.Promise.wrapError({ status: 404, responseText: nls.localize(0, null) });
                });
            }
            return _super.prototype.makeRequest.call(this, options);
        };
        /**
         * Make a cross origin request using NodeJS.
         * Note: This method is also called from workers.
         */
        RequestService.prototype.makeCrossOriginRequest = function (options) {
            var timerVar = timer.nullEvent;
            return this.rawHttpServicePromise.then(function (rawHttpService) {
                return async.always(rawHttpService.xhr(options), (function (xhr) {
                    if (timerVar.data) {
                        timerVar.data.status = xhr.status;
                    }
                    timerVar.stop();
                }));
            });
        };
        return RequestService;
    }(baseRequestService_1.BaseRequestService));
    exports.RequestService = RequestService;
    // Configuration
    var confRegistry = platform.Registry.as(configurationRegistry_1.Extensions.Configuration);
    confRegistry.registerConfiguration({
        'id': 'http',
        'order': 9,
        'title': nls.localize(1, null),
        'type': 'object',
        'properties': {
            'http.proxy': {
                'type': 'string',
                'description': nls.localize(2, null)
            },
            'http.proxyStrictSSL': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize(3, null)
            }
        }
    });
});
//# sourceMappingURL=requestService.js.map