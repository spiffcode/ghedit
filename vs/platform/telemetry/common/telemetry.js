define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/timer', 'vs/platform/instantiation/common/instantiation'], function (require, exports, winjs_base_1, timer_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.ITelemetryService = instantiation_1.createDecorator('telemetryService');
    var Extenstions;
    (function (Extenstions) {
        var _telemetryAppenderCtors = [];
        Extenstions.TelemetryAppenders = {
            activate: function (accessor) {
                var telemetryService = accessor.get(exports.ITelemetryService);
                var instantiationService = accessor.get(instantiation_1.IInstantiationService);
                for (var _i = 0, _telemetryAppenderCtors_1 = _telemetryAppenderCtors; _i < _telemetryAppenderCtors_1.length; _i++) {
                    var ctor = _telemetryAppenderCtors_1[_i];
                    var instance = instantiationService.createInstance(ctor);
                    telemetryService.addTelemetryAppender(instance);
                }
                // can only be done once
                _telemetryAppenderCtors = undefined;
            },
            registerTelemetryAppenderDescriptor: function (ctor) {
                _telemetryAppenderCtors.push(ctor);
            }
        };
    })(Extenstions = exports.Extenstions || (exports.Extenstions = {}));
    ;
    exports.NullTelemetryService = {
        serviceId: undefined,
        timedPublicLog: function (name, data) { return timer_1.nullEvent; },
        publicLog: function (eventName, data) { console.log('log: ' + eventName + ' ' + JSON.stringify(data)); },
        addTelemetryAppender: function (appender) { return { dispose: function () { } }; },
        getTelemetryInfo: function () {
            return winjs_base_1.TPromise.as({
                instanceId: 'someValue.instanceId',
                sessionId: 'someValue.sessionId',
                machineId: 'someValue.machineId'
            });
        }
    };
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