/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/platform', 'vs/base/common/uuid', 'vs/platform/telemetry/common/telemetry', 'vs/platform/telemetry/common/errorTelemetry', 'vs/base/browser/idleMonitor', 'vs/base/common/winjs.base', 'vs/base/common/lifecycle', 'vs/base/common/timer', 'vs/base/common/objects'], function (require, exports, Platform, uuid, telemetry_1, errorTelemetry_1, idleMonitor_1, winjs_base_1, lifecycle_1, timer_1, objects_1) {
    'use strict';
    var TelemetryService = (function () {
        function TelemetryService(config) {
            var _this = this;
            this.serviceId = telemetry_1.ITelemetryService;
            this._appenders = [];
            this._disposables = [];
            this._eventCount = 0;
            this._startTime = new Date();
            this._optInFriendly = ['optInStatus']; //holds a cache of predefined events that can be sent regardress of user optin status
            this._configuration = objects_1.withDefaults(config, {
                cleanupPatterns: [],
                sessionID: uuid.generateUuid() + Date.now(),
                enableHardIdle: true,
                enableSoftIdle: true,
                userOptIn: true,
            });
            // static cleanup patterns for:
            // #1 `file:///DANGEROUS/PATH/resources/app/Useful/Information`
            // #2 // Any other file path that doesn't match the approved form above should be cleaned.
            // #3 "Error: ENOENT; no such file or directory" is often followed with PII, clean it
            this._configuration.cleanupPatterns.push([/file:\/\/\/.*?\/resources\/app\//gi, '<APP_ROOT>'], [/file:\/\/\/.*/gi, '<SOME_FILE_URI>'], [/ENOENT: no such file or directory.*?\'([^\']+)\'/gi, 'ENOENT: no such file or directory']);
            this._telemetryInfo = {
                sessionId: this._configuration.sessionID,
                instanceId: undefined,
                machineId: undefined
            };
            this._timeKeeper = new timer_1.TimeKeeper();
            this._disposables.push(this._timeKeeper);
            this._disposables.push(this._timeKeeper.addListener(function (events) { return _this._onTelemetryTimerEventStop(events); }));
            var errorTelemetry = new errorTelemetry_1.default(this, TelemetryService.ERROR_FLUSH_TIMEOUT);
            this._disposables.push(errorTelemetry);
            if (this._configuration.enableHardIdle) {
                this._hardIdleMonitor = new idleMonitor_1.IdleMonitor();
                this._disposables.push(this._hardIdleMonitor);
            }
            if (this._configuration.enableSoftIdle) {
                this._softIdleMonitor = new idleMonitor_1.IdleMonitor(TelemetryService.SOFT_IDLE_TIME);
                this._softIdleMonitor.addOneTimeActiveListener(function () { return _this._onUserActive(); });
                this._softIdleMonitor.addOneTimeIdleListener(function () { return _this._onUserIdle(); });
                this._disposables.push(this._softIdleMonitor);
            }
        }
        TelemetryService.prototype._onUserIdle = function () {
            var _this = this;
            this.publicLog(TelemetryService.IDLE_START_EVENT_NAME);
            this._softIdleMonitor.addOneTimeIdleListener(function () { return _this._onUserIdle(); });
        };
        TelemetryService.prototype._onUserActive = function () {
            var _this = this;
            this.publicLog(TelemetryService.IDLE_STOP_EVENT_NAME);
            this._softIdleMonitor.addOneTimeActiveListener(function () { return _this._onUserActive(); });
        };
        TelemetryService.prototype._onTelemetryTimerEventStop = function (events) {
            for (var i = 0; i < events.length; i++) {
                var event_1 = events[i];
                var data = event_1.data || {};
                data.duration = event_1.timeTaken();
                this.publicLog(event_1.name, data);
            }
        };
        TelemetryService.prototype.getTelemetryInfo = function () {
            return winjs_base_1.TPromise.as(this._telemetryInfo);
        };
        TelemetryService.prototype.dispose = function () {
            this._disposables = lifecycle_1.dispose(this._disposables);
            for (var _i = 0, _a = this._appenders; _i < _a.length; _i++) {
                var appender = _a[_i];
                appender.dispose();
            }
        };
        TelemetryService.prototype.timedPublicLog = function (name, data) {
            var topic = 'public';
            var event = this._timeKeeper.start(topic, name);
            if (data) {
                event.data = data;
            }
            return event;
        };
        TelemetryService.prototype.publicLog = function (eventName, data) {
            this._handleEvent(eventName, data);
        };
        TelemetryService.prototype._handleEvent = function (eventName, data) {
            var _this = this;
            if (this._hardIdleMonitor && this._hardIdleMonitor.getStatus() === idleMonitor_1.UserStatus.Idle) {
                return;
            }
            // don't send events when the user is optout unless the event is flaged as optin friendly
            if (!this._configuration.userOptIn && this._optInFriendly.indexOf(eventName) === -1) {
                return;
            }
            this._eventCount++;
            if (!data) {
                data = Object.create(null);
            }
            // (first) add common properties
            var eventDate = new Date();
            data['sessionID'] = this._telemetryInfo.sessionId;
            data['timestamp'] = eventDate;
            data['version'] = this._configuration.version;
            data['userId'] = this._userIdHash;
            data['commitHash'] = this._configuration.commitHash;
            data['common.platform'] = Platform.Platform[Platform.platform];
            data['common.timesincesessionstart'] = (eventDate.getTime() - this._startTime.getTime());
            data['common.sequence'] = this._eventCount;
            data['common.instanceId'] = this._telemetryInfo.instanceId;
            data['common.machineId'] = this._telemetryInfo.machineId;
            // (last) remove all PII from data
            data = objects_1.cloneAndChange(data, function (value) {
                if (typeof value === 'string') {
                    return _this._cleanupInfo(value);
                }
            });
            for (var _i = 0, _a = this._appenders; _i < _a.length; _i++) {
                var appender = _a[_i];
                appender.log(eventName, data);
            }
        };
        TelemetryService.prototype._cleanupInfo = function (stack) {
            // sanitize with configured cleanup patterns
            for (var _i = 0, _a = this._configuration.cleanupPatterns; _i < _a.length; _i++) {
                var tuple = _a[_i];
                var regexp = tuple[0], replaceValue = tuple[1];
                stack = stack.replace(regexp, replaceValue);
            }
            return stack;
        };
        TelemetryService.prototype.addTelemetryAppender = function (appender) {
            var _this = this;
            this._appenders.push(appender);
            return {
                dispose: function () {
                    var index = _this._appenders.indexOf(appender);
                    if (index > -1) {
                        _this._appenders.splice(index, 1);
                    }
                }
            };
        };
        // how long of inactivity before a user is considered 'inactive' - 2 minutes
        TelemetryService.SOFT_IDLE_TIME = 2 * 60 * 1000;
        TelemetryService.IDLE_START_EVENT_NAME = 'UserIdleStart';
        TelemetryService.IDLE_STOP_EVENT_NAME = 'UserIdleStop';
        TelemetryService.ERROR_FLUSH_TIMEOUT = 5 * 1000;
        return TelemetryService;
    }());
    exports.TelemetryService = TelemetryService;
});
//# sourceMappingURL=telemetryService.js.map