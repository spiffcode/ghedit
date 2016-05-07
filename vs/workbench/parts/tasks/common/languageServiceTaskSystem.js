var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/eventEmitter', 'vs/workbench/parts/tasks/common/taskSystem'], function (require, exports, winjs_base_1, eventEmitter_1, taskSystem_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LanguageServiceTaskSystem = (function (_super) {
        __extends(LanguageServiceTaskSystem, _super);
        function LanguageServiceTaskSystem(configuration, telemetryService, modeService) {
            _super.call(this);
            this.configuration = configuration;
            this.telemetryService = telemetryService;
            this.modeService = modeService;
        }
        LanguageServiceTaskSystem.prototype.build = function () {
            return this.processMode(function (mode) {
                return mode.taskSupport && mode.taskSupport.build
                    ? mode.taskSupport.build()
                    : null;
            }, 'build', taskSystem_1.Triggers.shortcut);
        };
        LanguageServiceTaskSystem.prototype.rebuild = function () {
            return this.processMode(function (mode) {
                return mode.taskSupport && mode.taskSupport.rebuild
                    ? mode.taskSupport.rebuild()
                    : null;
            }, 'rebuild', taskSystem_1.Triggers.shortcut);
        };
        LanguageServiceTaskSystem.prototype.clean = function () {
            return this.processMode(function (mode) {
                return mode.taskSupport && mode.taskSupport.clean
                    ? mode.taskSupport.clean()
                    : null;
            }, 'clean', taskSystem_1.Triggers.shortcut);
        };
        LanguageServiceTaskSystem.prototype.runTest = function () {
            return { promise: winjs_base_1.TPromise.wrapError('Not implemented yet.') };
        };
        LanguageServiceTaskSystem.prototype.run = function (taskIdentifier) {
            return { promise: winjs_base_1.TPromise.wrapError('Not implemented yet.') };
        };
        LanguageServiceTaskSystem.prototype.isActive = function () {
            return winjs_base_1.TPromise.as(false);
        };
        LanguageServiceTaskSystem.prototype.isActiveSync = function () {
            return false;
        };
        LanguageServiceTaskSystem.prototype.canAutoTerminate = function () {
            return false;
        };
        LanguageServiceTaskSystem.prototype.terminate = function () {
            return winjs_base_1.TPromise.as({ success: true });
        };
        LanguageServiceTaskSystem.prototype.terminateSync = function () {
            return { success: true };
        };
        LanguageServiceTaskSystem.prototype.tasks = function () {
            var result = [];
            return winjs_base_1.TPromise.as(result);
        };
        LanguageServiceTaskSystem.prototype.processMode = function (fn, taskName, trigger) {
            var _this = this;
            var telemetryEvent = {
                trigger: trigger,
                command: 'languageService',
                success: true
            };
            return { promise: winjs_base_1.Promise.join(this.configuration.modes.map(function (mode) {
                    return _this.modeService.getOrCreateMode(mode);
                })).then(function (modes) {
                    var promises = [];
                    modes.forEach(function (mode) {
                        var promise = fn(mode);
                        if (promise) {
                            promises.push(promise);
                        }
                    });
                    return winjs_base_1.Promise.join(promises);
                }).then(function (value) {
                    _this.telemetryService.publicLog(LanguageServiceTaskSystem.TelemetryEventName, telemetryEvent);
                    return value;
                }, function (err) {
                    telemetryEvent.success = false;
                    _this.telemetryService.publicLog(LanguageServiceTaskSystem.TelemetryEventName, telemetryEvent);
                    return winjs_base_1.Promise.wrapError(err);
                }) };
        };
        LanguageServiceTaskSystem.TelemetryEventName = 'taskService';
        return LanguageServiceTaskSystem;
    }(eventEmitter_1.EventEmitter));
    exports.LanguageServiceTaskSystem = LanguageServiceTaskSystem;
});
//# sourceMappingURL=languageServiceTaskSystem.js.map