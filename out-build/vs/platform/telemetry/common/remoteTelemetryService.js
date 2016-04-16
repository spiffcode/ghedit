var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/errors', 'vs/platform/telemetry/common/telemetry', 'vs/platform/thread/common/thread'], function (require, exports, errors_1, telemetry_1, thread_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Helper always instantiated in the main process to receive telemetry events from remote telemetry services
     */
    var RemoteTelemetryServiceHelper = (function () {
        function RemoteTelemetryServiceHelper(telemetryService) {
            this._telemetryService = telemetryService;
        }
        RemoteTelemetryServiceHelper.prototype.$publicLog = function (eventName, data) {
            this._telemetryService.publicLog(eventName, data);
        };
        RemoteTelemetryServiceHelper.prototype.$getTelemetryInfo = function () {
            return this._telemetryService.getTelemetryInfo();
        };
        RemoteTelemetryServiceHelper = __decorate([
            thread_1.Remotable.MainContext('RemoteTelemetryServiceHelper'),
            __param(0, telemetry_1.ITelemetryService)
        ], RemoteTelemetryServiceHelper);
        return RemoteTelemetryServiceHelper;
    }());
    exports.RemoteTelemetryServiceHelper = RemoteTelemetryServiceHelper;
    var RemoteTelemetryService = (function () {
        function RemoteTelemetryService(name, threadService) {
            this._name = name;
            this._proxy = threadService.getRemotable(RemoteTelemetryServiceHelper);
        }
        RemoteTelemetryService.prototype.getTelemetryInfo = function () {
            return this._proxy.$getTelemetryInfo();
        };
        RemoteTelemetryService.prototype.publicLog = function (eventName, data) {
            data = data || Object.create(null);
            data[this._name] = true;
            this._proxy.$publicLog(eventName, data);
        };
        RemoteTelemetryService.prototype.timedPublicLog = function () {
            throw errors_1.notImplemented();
        };
        RemoteTelemetryService.prototype.addTelemetryAppender = function () {
            throw errors_1.notImplemented();
        };
        return RemoteTelemetryService;
    }());
    exports.RemoteTelemetryService = RemoteTelemetryService;
});
