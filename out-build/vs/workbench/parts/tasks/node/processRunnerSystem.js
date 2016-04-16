var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/tasks/node/processRunnerSystem', 'vs/base/common/objects', 'vs/base/common/types', 'vs/base/common/platform', 'vs/base/common/winjs.base', 'vs/base/common/async', 'vs/base/common/severity', 'vs/base/common/strings', 'vs/base/common/eventEmitter', 'vs/base/node/processes', 'vs/workbench/parts/tasks/common/problemCollectors', 'vs/workbench/parts/tasks/common/taskSystem', './processRunnerConfiguration'], function (require, exports, nls, Objects, Types, Platform, winjs_base_1, Async, severity_1, Strings, eventEmitter_1, processes_1, problemCollectors_1, taskSystem_1, FileConfig) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ProcessRunnerSystem = (function (_super) {
        __extends(ProcessRunnerSystem, _super);
        function ProcessRunnerSystem(fileConfig, variables, markerService, modelService, telemetryService, outputService, outputChannelId, clearOutput) {
            if (clearOutput === void 0) { clearOutput = true; }
            _super.call(this);
            this.fileConfig = fileConfig;
            this.variables = variables;
            this.markerService = markerService;
            this.modelService = modelService;
            this.outputService = outputService;
            this.telemetryService = telemetryService;
            this.defaultBuildTaskIdentifier = null;
            this.defaultTestTaskIdentifier = null;
            this.childProcess = null;
            this.activeTaskIdentifier = null;
            this.outputChannel = this.outputService.getChannel(outputChannelId);
            if (clearOutput) {
                this.clearOutput();
            }
            this.errorsShown = false;
            var parseResult = FileConfig.parse(fileConfig, this);
            this.validationStatus = parseResult.validationStatus;
            this.configuration = parseResult.configuration;
            this.defaultBuildTaskIdentifier = parseResult.defaultBuildTaskIdentifier;
            this.defaultTestTaskIdentifier = parseResult.defaultTestTaskIdentifier;
            if (!this.validationStatus.isOK()) {
                this.showOutput();
            }
        }
        ProcessRunnerSystem.prototype.build = function () {
            if (!this.defaultBuildTaskIdentifier) {
                throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize(0, null), taskSystem_1.TaskErrors.NoBuildTask);
            }
            return this.executeTask(this.defaultBuildTaskIdentifier, taskSystem_1.Triggers.shortcut);
        };
        ProcessRunnerSystem.prototype.rebuild = function () {
            throw new Error('Task - Rebuild: not implemented yet');
        };
        ProcessRunnerSystem.prototype.clean = function () {
            throw new Error('Task - Clean: not implemented yet');
        };
        ProcessRunnerSystem.prototype.runTest = function () {
            if (!this.defaultTestTaskIdentifier) {
                throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize(1, null), taskSystem_1.TaskErrors.NoTestTask);
            }
            return this.executeTask(this.defaultTestTaskIdentifier, taskSystem_1.Triggers.shortcut);
        };
        ProcessRunnerSystem.prototype.run = function (taskIdentifier) {
            return this.executeTask(taskIdentifier);
        };
        ProcessRunnerSystem.prototype.isActive = function () {
            return winjs_base_1.TPromise.as(!!this.childProcess);
        };
        ProcessRunnerSystem.prototype.isActiveSync = function () {
            return !!this.childProcess;
        };
        ProcessRunnerSystem.prototype.canAutoTerminate = function () {
            if (this.childProcess) {
                if (this.activeTaskIdentifier) {
                    var task = this.configuration.tasks[this.activeTaskIdentifier];
                    if (task) {
                        return !task.promptOnClose;
                    }
                }
                return false;
            }
            return true;
        };
        ProcessRunnerSystem.prototype.terminate = function () {
            if (this.childProcess) {
                return this.childProcess.terminate();
            }
            return winjs_base_1.TPromise.as({ success: true });
        };
        ProcessRunnerSystem.prototype.tasks = function () {
            var _this = this;
            var result;
            if (!this.configuration || !this.configuration.tasks) {
                result = [];
            }
            else {
                result = Object.keys(this.configuration.tasks).map(function (key) { return _this.configuration.tasks[key]; });
            }
            return winjs_base_1.TPromise.as(result);
        };
        ProcessRunnerSystem.prototype.executeTask = function (taskIdentifier, trigger) {
            var _this = this;
            if (trigger === void 0) { trigger = taskSystem_1.Triggers.command; }
            if (this.validationStatus.isFatal()) {
                throw new taskSystem_1.TaskError(severity_1.default.Error, nls.localize(2, null), taskSystem_1.TaskErrors.ConfigValidationError);
            }
            var task = this.configuration.tasks[taskIdentifier];
            if (!task) {
                throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize(3, null), taskSystem_1.TaskErrors.TaskNotFound);
            }
            var telemetryEvent = {
                trigger: trigger,
                command: 'other',
                success: true
            };
            try {
                var result = this.doExecuteTask(task, telemetryEvent);
                result.promise = result.promise.then(function (success) {
                    _this.telemetryService.publicLog(ProcessRunnerSystem.TelemetryEventName, telemetryEvent);
                    return success;
                }, function (err) {
                    telemetryEvent.success = false;
                    _this.telemetryService.publicLog(ProcessRunnerSystem.TelemetryEventName, telemetryEvent);
                    return winjs_base_1.TPromise.wrapError(err);
                });
                return result;
            }
            catch (err) {
                telemetryEvent.success = false;
                this.telemetryService.publicLog(ProcessRunnerSystem.TelemetryEventName, telemetryEvent);
                if (err instanceof taskSystem_1.TaskError) {
                    throw err;
                }
                else if (err instanceof Error) {
                    var error = err;
                    this.outputChannel.append(error.message);
                    throw new taskSystem_1.TaskError(severity_1.default.Error, error.message, taskSystem_1.TaskErrors.UnknownError);
                }
                else {
                    this.outputChannel.append(err.toString());
                    throw new taskSystem_1.TaskError(severity_1.default.Error, nls.localize(4, null), taskSystem_1.TaskErrors.UnknownError);
                }
            }
        };
        ProcessRunnerSystem.prototype.doExecuteTask = function (task, telemetryEvent) {
            var _this = this;
            var taskSummary = {};
            var configuration = this.configuration;
            if (!this.validationStatus.isOK() && !this.errorsShown) {
                this.showOutput();
                this.errorsShown = true;
            }
            else {
                this.clearOutput();
            }
            var args = this.configuration.args ? this.configuration.args.slice() : [];
            // We need to first pass the task name
            if (!task.suppressTaskName) {
                if (this.fileConfig.taskSelector) {
                    args.push(this.fileConfig.taskSelector + task.name);
                }
                else {
                    args.push(task.name);
                }
            }
            // And then additional arguments
            if (task.args) {
                args = args.concat(task.args);
            }
            args = this.resolveVariables(args);
            var command = this.resolveVariable(configuration.command);
            this.childProcess = new processes_1.LineProcess(command, args, configuration.isShellCommand, this.resolveOptions(configuration.options));
            telemetryEvent.command = this.childProcess.getSanitizedCommand();
            // we have no problem matchers defined. So show the output log
            if (task.showOutput === taskSystem_1.ShowOutput.Always || (task.showOutput === taskSystem_1.ShowOutput.Silent && task.problemMatchers.length === 0)) {
                this.showOutput();
            }
            if (task.echoCommand) {
                var prompt_1 = Platform.isWindows ? '>' : '$';
                this.log("running command" + prompt_1 + " " + command + " " + args.join(' '));
            }
            if (task.isWatching) {
                var watchingProblemMatcher_1 = new problemCollectors_1.WatchingProblemCollector(this.resolveMatchers(task.problemMatchers), this.markerService, this.modelService);
                var toUnbind_1 = [];
                var event_1 = { taskId: task.id, taskName: task.name, type: taskSystem_1.TaskType.Watching };
                var eventCounter_1 = 0;
                toUnbind_1.push(watchingProblemMatcher_1.on(problemCollectors_1.ProblemCollectorEvents.WatchingBeginDetected, function () {
                    eventCounter_1++;
                    _this.emit(taskSystem_1.TaskSystemEvents.Active, event_1);
                }));
                toUnbind_1.push(watchingProblemMatcher_1.on(problemCollectors_1.ProblemCollectorEvents.WatchingEndDetected, function () {
                    eventCounter_1--;
                    _this.emit(taskSystem_1.TaskSystemEvents.Inactive, event_1);
                }));
                watchingProblemMatcher_1.aboutToStart();
                var delayer_1 = null;
                this.activeTaskIdentifier = task.id;
                var promise = this.childProcess.start().then(function (success) {
                    _this.childProcessEnded();
                    watchingProblemMatcher_1.dispose();
                    toUnbind_1.forEach(function (unbind) { return unbind(); });
                    toUnbind_1 = null;
                    for (var i = 0; i < eventCounter_1; i++) {
                        _this.emit(taskSystem_1.TaskSystemEvents.Inactive, event_1);
                    }
                    eventCounter_1 = 0;
                    if (!_this.checkTerminated(task, success)) {
                        _this.log(nls.localize(5, null));
                    }
                    if (success.cmdCode && success.cmdCode === 1 && watchingProblemMatcher_1.numberOfMatches === 0 && task.showOutput !== taskSystem_1.ShowOutput.Never) {
                        _this.showOutput();
                    }
                    taskSummary.exitCode = success.cmdCode;
                    return taskSummary;
                }, function (error) {
                    _this.childProcessEnded();
                    watchingProblemMatcher_1.dispose();
                    toUnbind_1.forEach(function (unbind) { return unbind(); });
                    toUnbind_1 = null;
                    for (var i = 0; i < eventCounter_1; i++) {
                        _this.emit(taskSystem_1.TaskSystemEvents.Inactive, event_1);
                    }
                    eventCounter_1 = 0;
                    return _this.handleError(task, error);
                }, function (progress) {
                    var line = Strings.removeAnsiEscapeCodes(progress.line);
                    _this.outputChannel.append(line + '\n');
                    watchingProblemMatcher_1.processLine(line);
                    if (delayer_1 === null) {
                        delayer_1 = new Async.Delayer(3000);
                    }
                    delayer_1.trigger(function () {
                        watchingProblemMatcher_1.forceDelivery();
                        return null;
                    }).then(function () {
                        delayer_1 = null;
                    });
                });
                var result = task.tscWatch ? { restartOnFileChanges: '**/*.ts', promise: promise } : { promise: promise };
                return result;
            }
            else {
                var event_2 = { taskId: task.id, taskName: task.name, type: taskSystem_1.TaskType.SingleRun };
                this.emit(taskSystem_1.TaskSystemEvents.Active, event_2);
                var startStopProblemMatcher_1 = new problemCollectors_1.StartStopProblemCollector(this.resolveMatchers(task.problemMatchers), this.markerService, this.modelService);
                this.activeTaskIdentifier = task.id;
                var promise = this.childProcess.start().then(function (success) {
                    _this.childProcessEnded();
                    startStopProblemMatcher_1.done();
                    startStopProblemMatcher_1.dispose();
                    _this.checkTerminated(task, success);
                    _this.emit(taskSystem_1.TaskSystemEvents.Inactive, event_2);
                    if (success.cmdCode && success.cmdCode === 1 && startStopProblemMatcher_1.numberOfMatches === 0 && task.showOutput !== taskSystem_1.ShowOutput.Never) {
                        _this.showOutput();
                    }
                    taskSummary.exitCode = success.cmdCode;
                    return taskSummary;
                }, function (error) {
                    _this.childProcessEnded();
                    startStopProblemMatcher_1.dispose();
                    _this.emit(taskSystem_1.TaskSystemEvents.Inactive, event_2);
                    return _this.handleError(task, error);
                }, function (progress) {
                    var line = Strings.removeAnsiEscapeCodes(progress.line);
                    _this.outputChannel.append(line + '\n');
                    startStopProblemMatcher_1.processLine(line);
                });
                return { promise: promise };
            }
        };
        ProcessRunnerSystem.prototype.childProcessEnded = function () {
            this.childProcess = null;
            this.activeTaskIdentifier = null;
        };
        ProcessRunnerSystem.prototype.handleError = function (task, error) {
            var makeVisible = false;
            if (error.error && !error.terminated) {
                var args = this.configuration.args ? this.configuration.args.join(' ') : '';
                this.log(nls.localize(6, null, this.configuration.command, args));
                this.outputChannel.append(error.error.message);
                makeVisible = true;
            }
            if (error.stdout) {
                this.outputChannel.append(error.stdout);
                makeVisible = true;
            }
            if (error.stderr) {
                this.outputChannel.append(error.stderr);
                makeVisible = true;
            }
            makeVisible = this.checkTerminated(task, error) || makeVisible;
            if (makeVisible) {
                this.showOutput();
            }
            return winjs_base_1.Promise.wrapError(error);
        };
        ProcessRunnerSystem.prototype.checkTerminated = function (task, data) {
            if (data.terminated) {
                this.log(nls.localize(7, null, task.name));
                return true;
            }
            return false;
        };
        ProcessRunnerSystem.prototype.resolveOptions = function (options) {
            var _this = this;
            var result = { cwd: this.resolveVariable(options.cwd) };
            if (options.env) {
                result.env = Object.create(null);
                Object.keys(options.env).forEach(function (key) {
                    var value = options.env[key];
                    if (Types.isString(value)) {
                        result.env[key] = _this.resolveVariable(value);
                    }
                    else {
                        result.env[key] = value.toString();
                    }
                });
            }
            return result;
        };
        ProcessRunnerSystem.prototype.resolveVariables = function (value) {
            var _this = this;
            return value.map(function (s) { return _this.resolveVariable(s); });
        };
        ProcessRunnerSystem.prototype.resolveMatchers = function (values) {
            var _this = this;
            if (values.length === 0) {
                return values;
            }
            var result = [];
            values.forEach(function (matcher) {
                if (!matcher.filePrefix) {
                    result.push(matcher);
                }
                else {
                    var copy = Objects.clone(matcher);
                    copy.filePrefix = _this.resolveVariable(copy.filePrefix);
                    result.push(copy);
                }
            });
            return result;
        };
        ProcessRunnerSystem.prototype.resolveVariable = function (value) {
            var _this = this;
            var regexp = /\$\{(.*?)\}/g;
            return value.replace(regexp, function (match, name) {
                var value = _this.variables[name];
                if (value) {
                    return value;
                }
                else {
                    return match;
                }
            });
        };
        ProcessRunnerSystem.prototype.log = function (value) {
            this.outputChannel.append(value + '\n');
        };
        ProcessRunnerSystem.prototype.showOutput = function () {
            this.outputChannel.show(true);
        };
        ProcessRunnerSystem.prototype.clearOutput = function () {
            this.outputChannel.clear();
        };
        ProcessRunnerSystem.TelemetryEventName = 'taskService';
        return ProcessRunnerSystem;
    }(eventEmitter_1.EventEmitter));
    exports.ProcessRunnerSystem = ProcessRunnerSystem;
});
//# sourceMappingURL=processRunnerSystem.js.map