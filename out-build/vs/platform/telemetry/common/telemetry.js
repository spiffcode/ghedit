define(["require", "exports", 'vs/platform/platform', 'vs/base/common/winjs.base', 'vs/base/common/timer', 'vs/platform/instantiation/common/instantiation'], function (require, exports, platform_1, winjs_base_1, timer_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.ITelemetryService = instantiation_1.createDecorator('telemetryService');
    exports.Extenstions = {
        TelemetryAppenders: 'telemetry.appenders'
    };
    exports.NullTelemetryService = {
        serviceId: undefined,
        timedPublicLog: function (name, data) { return timer_1.nullEvent; },
        publicLog: function (eventName, data) { },
        addTelemetryAppender: function (appender) { return { dispose: function () { } }; },
        getTelemetryInfo: function () {
            return winjs_base_1.TPromise.as({
                instanceId: 'someValue.instanceId',
                sessionId: 'someValue.sessionId',
                machineId: 'someValue.machineId'
            });
        }
    };
    var TelemetryAppendersRegistry = (function () {
        function TelemetryAppendersRegistry() {
            this._telemetryAppenderCtors = [];
        }
        TelemetryAppendersRegistry.prototype.registerTelemetryAppenderDescriptor = function (ctor) {
            this._telemetryAppenderCtors.push(ctor);
        };
        TelemetryAppendersRegistry.prototype.activate = function (instantiationService) {
            var service = instantiationService.getInstance(exports.ITelemetryService);
            for (var _i = 0, _a = this._telemetryAppenderCtors; _i < _a.length; _i++) {
                var ctor = _a[_i];
                var instance = instantiationService.createInstance(ctor);
                service.addTelemetryAppender(instance);
            }
            // can only be done once
            this._telemetryAppenderCtors = undefined;
        };
        return TelemetryAppendersRegistry;
    }());
    exports.TelemetryAppendersRegistry = TelemetryAppendersRegistry;
    platform_1.Registry.add(exports.Extenstions.TelemetryAppenders, new TelemetryAppendersRegistry());
    // --- util
    function anonymize(input) {
        if (!input) {
            return input;
        }
        var r = '';
        for (var i = 0; i < input.length; i++) {
            var ch = input[i];
            if (ch >= '0' && ch <= '9') {
                r += '0';
                continue;
            }
            if (ch >= 'a' && ch <= 'z') {
                r += 'a';
                continue;
            }
            if (ch >= 'A' && ch <= 'Z') {
                r += 'A';
                continue;
            }
            r += ch;
        }
        return r;
    }
    exports.anonymize = anonymize;
});
//# sourceMappingURL=telemetry.js.map