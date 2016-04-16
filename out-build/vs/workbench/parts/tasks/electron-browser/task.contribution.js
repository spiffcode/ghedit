/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/tasks/electron-browser/task.contribution', 'vs/base/common/flags', 'vs/base/common/winjs.base', 'vs/base/common/severity', 'vs/base/common/objects', 'vs/base/common/actions', 'vs/base/browser/dom', 'vs/base/common/lifecycle', 'vs/base/common/eventEmitter', 'vs/base/browser/builder', 'vs/base/common/types', 'vs/base/common/keyCodes', 'vs/base/common/glob', 'vs/base/common/platform', 'vs/platform/platform', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/actions/common/actions', 'vs/platform/instantiation/common/extensions', 'vs/platform/event/common/event', 'vs/platform/message/common/message', 'vs/platform/markers/common/markers', 'vs/platform/telemetry/common/telemetry', 'vs/platform/configuration/common/configuration', 'vs/platform/files/common/files', 'vs/platform/extensions/common/extensions', 'vs/editor/common/services/modeService', 'vs/editor/common/services/modelService', 'vs/platform/jsonschemas/common/jsonContributionRegistry', 'vs/workbench/common/actionRegistry', 'vs/workbench/browser/parts/statusbar/statusbar', 'vs/workbench/browser/quickopen', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/workspace/common/contextService', 'vs/workbench/parts/lib/node/systemVariables', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/output/common/output', 'vs/workbench/parts/tasks/common/taskSystem', 'vs/workbench/parts/tasks/common/taskService', 'vs/workbench/parts/tasks/common/taskTemplates', 'vs/workbench/parts/tasks/common/languageServiceTaskSystem', 'vs/workbench/parts/tasks/node/processRunnerSystem', 'vs/workbench/parts/tasks/node/processRunnerDetector', 'vs/css!./media/task.contribution', 'vs/workbench/parts/tasks/browser/taskQuickOpen'], function (require, exports, nls, Env, winjs_base_1, severity_1, Objects, actions_1, Dom, lifecycle_1, eventEmitter_1, Builder, Types, keyCodes_1, glob_1, platform_1, platform_2, lifecycle_2, actions_2, extensions_1, event_1, message_1, markers_1, telemetry_1, configuration_1, files_1, extensions_2, modeService_1, modelService_1, jsonContributionRegistry, actionRegistry_1, statusbar_1, quickopen_1, quickOpenService_1, editorService_1, contextService_1, systemVariables_1, files_2, output_1, taskSystem_1, taskService_1, taskTemplates_1, languageServiceTaskSystem_1, processRunnerSystem_1, processRunnerDetector_1) {
    'use strict';
    var $ = Builder.$;
    var AbstractTaskAction = (function (_super) {
        __extends(AbstractTaskAction, _super);
        function AbstractTaskAction(id, label, taskService, telemetryService) {
            _super.call(this, id, label);
            this.taskService = taskService;
            this.telemetryService = telemetryService;
        }
        AbstractTaskAction = __decorate([
            __param(2, taskService_1.ITaskService),
            __param(3, telemetry_1.ITelemetryService)
        ], AbstractTaskAction);
        return AbstractTaskAction;
    }(actions_1.Action));
    var BuildAction = (function (_super) {
        __extends(BuildAction, _super);
        function BuildAction(id, label, taskService, telemetryService) {
            _super.call(this, id, label, taskService, telemetryService);
        }
        BuildAction.prototype.run = function () {
            return this.taskService.build();
        };
        BuildAction.ID = 'workbench.action.tasks.build';
        BuildAction.TEXT = nls.localize(0, null);
        BuildAction = __decorate([
            __param(2, taskService_1.ITaskService),
            __param(3, telemetry_1.ITelemetryService)
        ], BuildAction);
        return BuildAction;
    }(AbstractTaskAction));
    var TestAction = (function (_super) {
        __extends(TestAction, _super);
        function TestAction(id, label, taskService, telemetryService) {
            _super.call(this, id, label, taskService, telemetryService);
        }
        TestAction.prototype.run = function () {
            return this.taskService.runTest();
        };
        TestAction.ID = 'workbench.action.tasks.test';
        TestAction.TEXT = nls.localize(1, null);
        TestAction = __decorate([
            __param(2, taskService_1.ITaskService),
            __param(3, telemetry_1.ITelemetryService)
        ], TestAction);
        return TestAction;
    }(AbstractTaskAction));
    var RebuildAction = (function (_super) {
        __extends(RebuildAction, _super);
        function RebuildAction(id, label, taskService, telemetryService) {
            _super.call(this, id, label, taskService, telemetryService);
        }
        RebuildAction.prototype.run = function () {
            return this.taskService.rebuild();
        };
        RebuildAction.ID = 'workbench.action.tasks.rebuild';
        RebuildAction.TEXT = nls.localize(2, null);
        RebuildAction = __decorate([
            __param(2, taskService_1.ITaskService),
            __param(3, telemetry_1.ITelemetryService)
        ], RebuildAction);
        return RebuildAction;
    }(AbstractTaskAction));
    var CleanAction = (function (_super) {
        __extends(CleanAction, _super);
        function CleanAction(id, label, taskService, telemetryService) {
            _super.call(this, id, label, taskService, telemetryService);
        }
        CleanAction.prototype.run = function () {
            return this.taskService.clean();
        };
        CleanAction.ID = 'workbench.action.tasks.clean';
        CleanAction.TEXT = nls.localize(3, null);
        CleanAction = __decorate([
            __param(2, taskService_1.ITaskService),
            __param(3, telemetry_1.ITelemetryService)
        ], CleanAction);
        return CleanAction;
    }(AbstractTaskAction));
    var ConfigureTaskRunnerAction = (function (_super) {
        __extends(ConfigureTaskRunnerAction, _super);
        function ConfigureTaskRunnerAction(id, label, configurationService, editorService, fileService, contextService, outputService, messageService, quickOpenService) {
            _super.call(this, id, label);
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.fileService = fileService;
            this.contextService = contextService;
            this.outputService = outputService;
            this.messageService = messageService;
            this.quickOpenService = quickOpenService;
        }
        ConfigureTaskRunnerAction.prototype.run = function (event) {
            var _this = this;
            if (!this.contextService.getWorkspace()) {
                this.messageService.show(severity_1.default.Info, nls.localize(5, null));
                return winjs_base_1.TPromise.as(undefined);
            }
            var sideBySide = !!(event && (event.ctrlKey || event.metaKey));
            return this.fileService.resolveFile(this.contextService.toResource('.vscode/tasks.json')).then(function (success) {
                return success;
            }, function (err) {
                ;
                return _this.quickOpenService.pick(taskTemplates_1.templates, { placeHolder: nls.localize(6, null) }).then(function (selection) {
                    if (!selection) {
                        return undefined;
                    }
                    var contentPromise;
                    if (selection.autoDetect) {
                        var outputChannel_1 = _this.outputService.getChannel(TaskService.OutputChannelId);
                        outputChannel_1.show();
                        outputChannel_1.append(nls.localize(7, null, selection.id) + '\n');
                        var detector = new processRunnerDetector_1.ProcessRunnerDetector(_this.fileService, _this.contextService, new systemVariables_1.SystemVariables(_this.editorService, _this.contextService));
                        contentPromise = detector.detect(false, selection.id).then(function (value) {
                            var config = value.config;
                            if (value.stderr && value.stderr.length > 0) {
                                value.stderr.forEach(function (line) {
                                    outputChannel_1.append(line + '\n');
                                });
                                _this.messageService.show(severity_1.default.Warning, nls.localize(8, null));
                                return selection.content;
                            }
                            else if (config) {
                                if (value.stdout && value.stdout.length > 0) {
                                    value.stdout.forEach(function (line) { return outputChannel_1.append(line + '\n'); });
                                }
                                var content = JSON.stringify(config, null, '\t');
                                content = [
                                    '{',
                                    '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
                                    '\t// for the documentation about the tasks.json format',
                                ].join('\n') + content.substr(1);
                                return content;
                            }
                            else {
                                return selection.content;
                            }
                        });
                    }
                    else {
                        contentPromise = winjs_base_1.TPromise.as(selection.content);
                    }
                    return contentPromise.then(function (content) {
                        return _this.fileService.createFile(_this.contextService.toResource('.vscode/tasks.json'), content);
                    });
                });
            }).then(function (stat) {
                if (!stat) {
                    return undefined;
                }
                // // (2) Open editor with configuration file
                return _this.editorService.openEditor({
                    resource: stat.resource,
                    options: {
                        forceOpen: true
                    }
                }, sideBySide);
            }, function (error) {
                throw new Error(nls.localize(9, null));
            });
        };
        ConfigureTaskRunnerAction.ID = 'workbench.action.tasks.configureTaskRunner';
        ConfigureTaskRunnerAction.TEXT = nls.localize(4, null);
        ConfigureTaskRunnerAction = __decorate([
            __param(2, configuration_1.IConfigurationService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, contextService_1.IWorkspaceContextService),
            __param(6, output_1.IOutputService),
            __param(7, message_1.IMessageService),
            __param(8, quickOpenService_1.IQuickOpenService)
        ], ConfigureTaskRunnerAction);
        return ConfigureTaskRunnerAction;
    }(actions_1.Action));
    var CloseMessageAction = (function (_super) {
        __extends(CloseMessageAction, _super);
        function CloseMessageAction() {
            _super.call(this, CloseMessageAction.ID, CloseMessageAction.TEXT);
        }
        CloseMessageAction.prototype.run = function () {
            if (this.closeFunction) {
                this.closeFunction();
            }
            return winjs_base_1.TPromise.as(null);
        };
        CloseMessageAction.ID = 'workbench.action.build.closeMessage';
        CloseMessageAction.TEXT = nls.localize(10, null);
        return CloseMessageAction;
    }(actions_1.Action));
    var TerminateAction = (function (_super) {
        __extends(TerminateAction, _super);
        function TerminateAction(id, label, taskService, telemetryService) {
            _super.call(this, id, label, taskService, telemetryService);
        }
        TerminateAction.prototype.run = function () {
            var _this = this;
            return this.taskService.isActive().then(function (active) {
                if (active) {
                    return _this.taskService.terminate().then(function (response) {
                        if (response.success) {
                            return;
                        }
                        else {
                            return winjs_base_1.Promise.wrapError(nls.localize(12, null));
                        }
                    });
                }
            });
        };
        TerminateAction.ID = 'workbench.action.tasks.terminate';
        TerminateAction.TEXT = nls.localize(11, null);
        TerminateAction = __decorate([
            __param(2, taskService_1.ITaskService),
            __param(3, telemetry_1.ITelemetryService)
        ], TerminateAction);
        return TerminateAction;
    }(AbstractTaskAction));
    var ShowLogAction = (function (_super) {
        __extends(ShowLogAction, _super);
        function ShowLogAction(id, label, taskService, telemetryService, outputService) {
            _super.call(this, id, label, taskService, telemetryService);
            this.outputService = outputService;
        }
        ShowLogAction.prototype.run = function () {
            return this.outputService.getChannel(TaskService.OutputChannelId).show();
        };
        ShowLogAction.ID = 'workbench.action.tasks.showLog';
        ShowLogAction.TEXT = nls.localize(13, null);
        ShowLogAction = __decorate([
            __param(2, taskService_1.ITaskService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, output_1.IOutputService)
        ], ShowLogAction);
        return ShowLogAction;
    }(AbstractTaskAction));
    var RunTaskAction = (function (_super) {
        __extends(RunTaskAction, _super);
        function RunTaskAction(id, label, quickOpenService) {
            _super.call(this, id, label);
            this.quickOpenService = quickOpenService;
        }
        RunTaskAction.prototype.run = function (event) {
            this.quickOpenService.show('task ');
            return winjs_base_1.TPromise.as(null);
        };
        RunTaskAction.ID = 'workbench.action.tasks.runTask';
        RunTaskAction.TEXT = nls.localize(14, null);
        RunTaskAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService)
        ], RunTaskAction);
        return RunTaskAction;
    }(actions_1.Action));
    var StatusBarItem = (function () {
        function StatusBarItem(quickOpenService, markerService, outputService, taskService) {
            this.quickOpenService = quickOpenService;
            this.markerService = markerService;
            this.outputService = outputService;
            this.taskService = taskService;
            this.activeCount = 0;
        }
        StatusBarItem.prototype.render = function (container) {
            var _this = this;
            var callOnDispose = [], element = document.createElement('div'), 
            // icon = document.createElement('a'),
            progress = document.createElement('div'), label = document.createElement('a'), error = document.createElement('div'), warning = document.createElement('div'), info = document.createElement('div');
            Dom.addClass(element, 'task-statusbar-item');
            // dom.addClass(icon, 'task-statusbar-item-icon');
            // element.appendChild(icon);
            Dom.addClass(progress, 'task-statusbar-item-progress');
            element.appendChild(progress);
            progress.innerHTML = StatusBarItem.progressChars[0];
            $(progress).hide();
            Dom.addClass(label, 'task-statusbar-item-label');
            element.appendChild(label);
            Dom.addClass(error, 'task-statusbar-item-label-error');
            error.innerHTML = '0';
            label.appendChild(error);
            Dom.addClass(warning, 'task-statusbar-item-label-warning');
            warning.innerHTML = '0';
            label.appendChild(warning);
            Dom.addClass(info, 'task-statusbar-item-label-info');
            label.appendChild(info);
            $(info).hide();
            //		callOnDispose.push(dom.addListener(icon, 'click', (e:MouseEvent) => {
            //			this.outputService.showOutput(TaskService.OutputChannel, e.ctrlKey || e.metaKey, true);
            //		}));
            callOnDispose.push(Dom.addDisposableListener(label, 'click', function (e) {
                _this.quickOpenService.show('!');
            }));
            var updateStatus = function (element, stats) {
                if (stats > 0) {
                    element.innerHTML = stats.toString();
                    $(element).show();
                    return true;
                }
                else {
                    $(element).hide();
                    return false;
                }
            };
            var manyMarkers = nls.localize(15, null);
            var updateLabel = function (stats) {
                error.innerHTML = stats.errors < 100 ? stats.errors.toString() : manyMarkers;
                warning.innerHTML = stats.warnings < 100 ? stats.warnings.toString() : manyMarkers;
                updateStatus(info, stats.infos);
            };
            this.markerService.onMarkerChanged(function (changedResources) {
                updateLabel(_this.markerService.getStatistics());
            });
            callOnDispose.push(this.taskService.addListener2(taskService_1.TaskServiceEvents.Active, function () {
                _this.activeCount++;
                if (_this.activeCount === 1) {
                    var index_1 = 1;
                    var chars_1 = StatusBarItem.progressChars;
                    progress.innerHTML = chars_1[0];
                    _this.intervalToken = setInterval(function () {
                        progress.innerHTML = chars_1[index_1];
                        index_1++;
                        if (index_1 >= chars_1.length) {
                            index_1 = 0;
                        }
                    }, 50);
                    $(progress).show();
                }
            }));
            callOnDispose.push(this.taskService.addListener2(taskService_1.TaskServiceEvents.Inactive, function (data) {
                _this.activeCount--;
                if (_this.activeCount === 0) {
                    $(progress).hide();
                    clearInterval(_this.intervalToken);
                    _this.intervalToken = null;
                }
            }));
            callOnDispose.push(this.taskService.addListener2(taskService_1.TaskServiceEvents.Terminated, function () {
                if (_this.activeCount !== 0) {
                    $(progress).hide();
                    if (_this.intervalToken) {
                        clearInterval(_this.intervalToken);
                        _this.intervalToken = null;
                    }
                    _this.activeCount = 0;
                }
            }));
            container.appendChild(element);
            return {
                dispose: function () {
                    callOnDispose = lifecycle_1.dispose(callOnDispose);
                }
            };
        };
        StatusBarItem.progressChars = '|/-\\';
        StatusBarItem = __decorate([
            __param(0, quickOpenService_1.IQuickOpenService),
            __param(1, markers_1.IMarkerService),
            __param(2, output_1.IOutputService),
            __param(3, taskService_1.ITaskService)
        ], StatusBarItem);
        return StatusBarItem;
    }());
    var TaskService = (function (_super) {
        __extends(TaskService, _super);
        function TaskService(modeService, configurationService, markerService, outputService, messageService, editorService, fileService, contextService, telemetryService, textFileService, lifecycleService, eventService, modelService, extensionService, quickOpenService) {
            var _this = this;
            _super.call(this);
            this.serviceId = taskService_1.ITaskService;
            this.modeService = modeService;
            this.configurationService = configurationService;
            this.markerService = markerService;
            this.outputService = outputService;
            this.messageService = messageService;
            this.editorService = editorService;
            this.fileService = fileService;
            this.contextService = contextService;
            this.telemetryService = telemetryService;
            this.textFileService = textFileService;
            this.eventService = eventService;
            this.modelService = modelService;
            this.extensionService = extensionService;
            this.quickOpenService = quickOpenService;
            this.taskSystemListeners = [];
            this.clearTaskSystemPromise = false;
            this.outputChannel = this.outputService.getChannel(TaskService.OutputChannelId);
            this.configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function () {
                _this.emit(taskService_1.TaskServiceEvents.ConfigChanged);
                if (_this._taskSystem && _this._taskSystem.isActiveSync()) {
                    _this.clearTaskSystemPromise = true;
                }
                else {
                    _this._taskSystem = null;
                    _this._taskSystemPromise = null;
                }
                _this.disposeTaskSystemListeners();
            });
            lifecycleService.addBeforeShutdownParticipant(this);
        }
        TaskService.prototype.disposeTaskSystemListeners = function () {
            this.taskSystemListeners.forEach(function (unbind) { return unbind(); });
            this.taskSystemListeners = [];
        };
        TaskService.prototype.disposeFileChangesListener = function () {
            if (this.fileChangesListener) {
                this.fileChangesListener();
                this.fileChangesListener = null;
            }
        };
        Object.defineProperty(TaskService.prototype, "taskSystemPromise", {
            get: function () {
                var _this = this;
                if (!this._taskSystemPromise) {
                    var variables_1 = new systemVariables_1.SystemVariables(this.editorService, this.contextService);
                    var clearOutput_1 = true;
                    this._taskSystemPromise = winjs_base_1.TPromise.as(this.configurationService.getConfiguration('tasks')).then(function (config) {
                        var parseErrors = config ? config.$parseErrors : null;
                        if (parseErrors) {
                            var isAffected = false;
                            for (var i = 0; i < parseErrors.length; i++) {
                                if (/tasks\.json$/.test(parseErrors[i])) {
                                    isAffected = true;
                                    break;
                                }
                            }
                            if (isAffected) {
                                _this.outputChannel.append(nls.localize(17, null));
                                _this.outputChannel.show(true);
                                return winjs_base_1.TPromise.wrapError({});
                            }
                        }
                        var configPromise;
                        if (config) {
                            if (_this.isRunnerConfig(config) && _this.hasDetectorSupport(config)) {
                                var fileConfig_1 = config;
                                configPromise = new processRunnerDetector_1.ProcessRunnerDetector(_this.fileService, _this.contextService, variables_1, fileConfig_1).detect(true).then(function (value) {
                                    clearOutput_1 = _this.printStderr(value.stderr);
                                    var detectedConfig = value.config;
                                    if (!detectedConfig) {
                                        return config;
                                    }
                                    var result = Objects.clone(fileConfig_1);
                                    var configuredTasks = Object.create(null);
                                    if (!result.tasks) {
                                        if (detectedConfig.tasks) {
                                            result.tasks = detectedConfig.tasks;
                                        }
                                    }
                                    else {
                                        result.tasks.forEach(function (task) { return configuredTasks[task.taskName] = task; });
                                        detectedConfig.tasks.forEach(function (task) {
                                            if (!configuredTasks[task.taskName]) {
                                                result.tasks.push(task);
                                            }
                                        });
                                    }
                                    return result;
                                });
                            }
                            else {
                                configPromise = winjs_base_1.TPromise.as(config);
                            }
                        }
                        else {
                            configPromise = new processRunnerDetector_1.ProcessRunnerDetector(_this.fileService, _this.contextService, variables_1).detect(true).then(function (value) {
                                clearOutput_1 = _this.printStderr(value.stderr);
                                return value.config;
                            });
                        }
                        return configPromise.then(function (config) {
                            if (!config) {
                                _this._taskSystemPromise = null;
                                throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize(18, null), taskSystem_1.TaskErrors.NotConfigured);
                            }
                            var result = null;
                            if (config.buildSystem === 'service') {
                                result = new languageServiceTaskSystem_1.LanguageServiceTaskSystem(config, _this.telemetryService, _this.modeService);
                            }
                            else if (_this.isRunnerConfig(config)) {
                                result = new processRunnerSystem_1.ProcessRunnerSystem(config, variables_1, _this.markerService, _this.modelService, _this.telemetryService, _this.outputService, TaskService.OutputChannelId, clearOutput_1);
                            }
                            if (result === null) {
                                _this._taskSystemPromise = null;
                                throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize(19, null), taskSystem_1.TaskErrors.NoValidTaskRunner);
                            }
                            _this.taskSystemListeners.push(result.addListener(taskSystem_1.TaskSystemEvents.Active, function (event) { return _this.emit(taskService_1.TaskServiceEvents.Active, event); }));
                            _this.taskSystemListeners.push(result.addListener(taskSystem_1.TaskSystemEvents.Inactive, function (event) { return _this.emit(taskService_1.TaskServiceEvents.Inactive, event); }));
                            _this._taskSystem = result;
                            return result;
                        }, function (err) {
                            _this.handleError(err);
                            return winjs_base_1.Promise.wrapError(err);
                        });
                    });
                }
                return this._taskSystemPromise;
            },
            enumerable: true,
            configurable: true
        });
        TaskService.prototype.printStderr = function (stderr) {
            var _this = this;
            var result = true;
            if (stderr && stderr.length > 0) {
                stderr.forEach(function (line) {
                    result = false;
                    _this.outputChannel.append(line + '\n');
                });
                this.outputChannel.show(true);
            }
            return result;
        };
        TaskService.prototype.isRunnerConfig = function (config) {
            return !config.buildSystem || config.buildSystem === 'program';
        };
        TaskService.prototype.hasDetectorSupport = function (config) {
            if (!config.command) {
                return false;
            }
            return processRunnerDetector_1.ProcessRunnerDetector.supports(config.command);
        };
        TaskService.prototype.configureAction = function () {
            return new ConfigureTaskRunnerAction(ConfigureTaskRunnerAction.ID, ConfigureTaskRunnerAction.TEXT, this.configurationService, this.editorService, this.fileService, this.contextService, this.outputService, this.messageService, this.quickOpenService);
        };
        TaskService.prototype.build = function () {
            return this.executeTarget(function (taskSystem) { return taskSystem.build(); });
        };
        TaskService.prototype.rebuild = function () {
            return this.executeTarget(function (taskSystem) { return taskSystem.rebuild(); });
        };
        TaskService.prototype.clean = function () {
            return this.executeTarget(function (taskSystem) { return taskSystem.clean(); });
        };
        TaskService.prototype.runTest = function () {
            return this.executeTarget(function (taskSystem) { return taskSystem.runTest(); });
        };
        TaskService.prototype.run = function (taskIdentifier) {
            return this.executeTarget(function (taskSystem) { return taskSystem.run(taskIdentifier); });
        };
        TaskService.prototype.executeTarget = function (fn) {
            var _this = this;
            return this.textFileService.saveAll().then(function (value) {
                return _this.taskSystemPromise.
                    then(function (taskSystem) {
                    return taskSystem.isActive().then(function (active) {
                        if (!active) {
                            return fn(taskSystem);
                        }
                        else {
                            throw new taskSystem_1.TaskError(severity_1.default.Warning, nls.localize(20, null), taskSystem_1.TaskErrors.RunningTask);
                        }
                    });
                }).
                    then(function (runResult) {
                    if (runResult.restartOnFileChanges) {
                        var pattern_1 = runResult.restartOnFileChanges;
                        _this.fileChangesListener = _this.eventService.addListener(files_1.EventType.FILE_CHANGES, function (event) {
                            var needsRestart = event.changes.some(function (change) {
                                return (change.type === files_1.FileChangeType.ADDED || change.type === files_1.FileChangeType.DELETED) && !!glob_1.match(pattern_1, change.resource.fsPath);
                            });
                            if (needsRestart) {
                                _this.terminate().done(function () {
                                    // We need to give the child process a change to stop.
                                    platform_1.setTimeout(function () {
                                        _this.executeTarget(fn);
                                    }, 2000);
                                });
                            }
                        });
                    }
                    return runResult.promise.then(function (value) {
                        if (_this.clearTaskSystemPromise) {
                            _this._taskSystemPromise = null;
                            _this.clearTaskSystemPromise = false;
                        }
                        return value;
                    });
                }, function (err) {
                    _this.handleError(err);
                });
            });
        };
        TaskService.prototype.isActive = function () {
            if (this._taskSystemPromise) {
                return this.taskSystemPromise.then(function (taskSystem) { return taskSystem.isActive(); });
            }
            return winjs_base_1.TPromise.as(false);
        };
        TaskService.prototype.terminate = function () {
            var _this = this;
            if (this._taskSystemPromise) {
                return this.taskSystemPromise.then(function (taskSystem) {
                    return taskSystem.terminate();
                }).then(function (response) {
                    if (response.success) {
                        if (_this.clearTaskSystemPromise) {
                            _this._taskSystemPromise = null;
                            _this.clearTaskSystemPromise = false;
                        }
                        _this.emit(taskService_1.TaskServiceEvents.Terminated, {});
                        _this.disposeFileChangesListener();
                    }
                    return response;
                });
            }
            return winjs_base_1.TPromise.as({ success: true });
        };
        TaskService.prototype.tasks = function () {
            return this.taskSystemPromise.then(function (taskSystem) { return taskSystem.tasks(); });
        };
        TaskService.prototype.beforeShutdown = function () {
            var _this = this;
            if (this._taskSystem && this._taskSystem.isActiveSync()) {
                if (this._taskSystem.canAutoTerminate() || this.messageService.confirm({
                    message: nls.localize(21, null),
                    primaryButton: nls.localize(22, null)
                })) {
                    return this._taskSystem.terminate().then(function (response) {
                        if (response.success) {
                            _this.emit(taskService_1.TaskServiceEvents.Terminated, {});
                            _this._taskSystem = null;
                            _this.disposeFileChangesListener();
                            _this.disposeTaskSystemListeners();
                            return false; // no veto
                        }
                        return true; // veto
                    }, function (err) {
                        return true; // veto
                    });
                }
                else {
                    return true; // veto
                }
            }
            return false; // Nothing to do here
        };
        TaskService.prototype.handleError = function (err) {
            var showOutput = true;
            if (err instanceof taskSystem_1.TaskError) {
                var buildError = err;
                var needsConfig = buildError.code === taskSystem_1.TaskErrors.NotConfigured || buildError.code === taskSystem_1.TaskErrors.NoBuildTask || buildError.code === taskSystem_1.TaskErrors.NoTestTask;
                var needsTerminate = buildError.code === taskSystem_1.TaskErrors.RunningTask;
                if (needsConfig || needsTerminate) {
                    var closeAction = new CloseMessageAction();
                    var action = needsConfig
                        ? this.configureAction()
                        : new TerminateAction(TerminateAction.ID, TerminateAction.TEXT, this, this.telemetryService);
                    closeAction.closeFunction = this.messageService.show(buildError.severity, { message: buildError.message, actions: [closeAction, action] });
                }
                else {
                    this.messageService.show(buildError.severity, buildError.message);
                }
            }
            else if (err instanceof Error) {
                var error = err;
                this.messageService.show(severity_1.default.Error, error.message);
            }
            else if (Types.isString(err)) {
                this.messageService.show(severity_1.default.Error, err);
            }
            else {
                this.messageService.show(severity_1.default.Error, nls.localize(23, null));
            }
            if (showOutput) {
                this.outputChannel.show(true);
            }
        };
        TaskService.SERVICE_ID = 'taskService';
        TaskService.OutputChannelId = 'tasks';
        TaskService.OutputChannelLabel = nls.localize(16, null);
        TaskService = __decorate([
            __param(0, modeService_1.IModeService),
            __param(1, configuration_1.IConfigurationService),
            __param(2, markers_1.IMarkerService),
            __param(3, output_1.IOutputService),
            __param(4, message_1.IMessageService),
            __param(5, editorService_1.IWorkbenchEditorService),
            __param(6, files_1.IFileService),
            __param(7, contextService_1.IWorkspaceContextService),
            __param(8, telemetry_1.ITelemetryService),
            __param(9, files_2.ITextFileService),
            __param(10, lifecycle_2.ILifecycleService),
            __param(11, event_1.IEventService),
            __param(12, modelService_1.IModelService),
            __param(13, extensions_2.IExtensionService),
            __param(14, quickOpenService_1.IQuickOpenService)
        ], TaskService);
        return TaskService;
    }(eventEmitter_1.EventEmitter));
    var tasksCategory = nls.localize(24, null);
    var workbenchActionsRegistry = platform_2.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ConfigureTaskRunnerAction, ConfigureTaskRunnerAction.ID, ConfigureTaskRunnerAction.TEXT), tasksCategory);
    if (Env.enableTasks) {
        // Task Service
        extensions_1.registerSingleton(taskService_1.ITaskService, TaskService);
        // Actions
        workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(BuildAction, BuildAction.ID, BuildAction.TEXT, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_B }), tasksCategory);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(TestAction, TestAction.ID, TestAction.TEXT, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_T }), tasksCategory);
        // workbenchActionsRegistry.registerWorkbenchAction(new SyncActionDescriptor(RebuildAction, RebuildAction.ID, RebuildAction.TEXT), tasksCategory);
        // workbenchActionsRegistry.registerWorkbenchAction(new SyncActionDescriptor(CleanAction, CleanAction.ID, CleanAction.TEXT), tasksCategory);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(TerminateAction, TerminateAction.ID, TerminateAction.TEXT), tasksCategory);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ShowLogAction, ShowLogAction.ID, ShowLogAction.TEXT), tasksCategory);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(RunTaskAction, RunTaskAction.ID, RunTaskAction.TEXT), tasksCategory);
        // Register Quick Open
        platform_2.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor('vs/workbench/parts/tasks/browser/taskQuickOpen', 'QuickOpenHandler', 'task ', nls.localize(25, null)));
        // Status bar
        var statusbarRegistry = platform_2.Registry.as(statusbar_1.Extensions.Statusbar);
        statusbarRegistry.registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(StatusBarItem, statusbar_1.StatusbarAlignment.LEFT, 50 /* Medium Priority */));
        // Output channel
        var outputChannelRegistry = platform_2.Registry.as(output_1.Extensions.OutputChannels);
        outputChannelRegistry.registerChannel(TaskService.OutputChannelId, TaskService.OutputChannelLabel);
        // (<IWorkbenchContributionsRegistry>Registry.as(WorkbenchExtensions.Workbench)).registerWorkbenchContribution(TaskServiceParticipant);
        // tasks.json validation
        var schemaId = 'vscode://schemas/tasks';
        var schema = {
            'id': schemaId,
            'description': 'Task definition file',
            'type': 'object',
            'default': {
                'version': '0.1.0',
                'command': 'myCommand',
                'isShellCommand': false,
                'args': [],
                'showOutput': 'always',
                'tasks': [
                    {
                        'taskName': 'build',
                        'showOutput': 'silent',
                        'isBuildCommand': true,
                        'problemMatcher': ['$tsc', '$lessCompile']
                    }
                ]
            },
            'definitions': {
                'showOutputType': {
                    'type': 'string',
                    'enum': ['always', 'silent', 'never'],
                    'default': 'silent'
                },
                'patternType': {
                    'anyOf': [
                        {
                            'type': 'string',
                            'enum': ['$tsc', '$tsc-watch', '$msCompile', '$lessCompile', '$gulp-tsc', '$cpp', '$csc', '$vb', '$jshint', '$jshint-stylish', '$eslint-compact', '$eslint-stylish', '$go']
                        },
                        {
                            '$ref': '#/definitions/pattern'
                        },
                        {
                            'type': 'array',
                            'items': {
                                '$ref': '#/definitions/pattern'
                            }
                        }
                    ]
                },
                'pattern': {
                    'default': {
                        'regexp': '^([^\\\\s].*)\\\\((\\\\d+,\\\\d+)\\\\):\\\\s*(.*)$',
                        'file': 1,
                        'location': 2,
                        'message': 3
                    },
                    'additionalProperties': false,
                    'properties': {
                        'regexp': {
                            'type': 'string',
                            'description': nls.localize(26, null)
                        },
                        'file': {
                            'type': 'integer',
                            'description': nls.localize(27, null)
                        },
                        'location': {
                            'type': 'integer',
                            'description': nls.localize(28, null)
                        },
                        'line': {
                            'type': 'integer',
                            'description': nls.localize(29, null)
                        },
                        'column': {
                            'type': 'integer',
                            'description': nls.localize(30, null)
                        },
                        'endLine': {
                            'type': 'integer',
                            'description': nls.localize(31, null)
                        },
                        'endColumn': {
                            'type': 'integer',
                            'description': nls.localize(32, null)
                        },
                        'severity': {
                            'type': 'integer',
                            'description': nls.localize(33, null)
                        },
                        'code': {
                            'type': 'integer',
                            'description': nls.localize(34, null)
                        },
                        'message': {
                            'type': 'integer',
                            'description': nls.localize(35, null)
                        },
                        'loop': {
                            'type': 'boolean',
                            'description': nls.localize(36, null)
                        }
                    }
                },
                'problemMatcherType': {
                    'oneOf': [
                        {
                            'type': 'string',
                            'enum': ['$tsc', '$tsc-watch', '$msCompile', '$lessCompile', '$gulp-tsc', '$jshint', '$jshint-stylish', '$eslint-compact', '$eslint-stylish', '$go']
                        },
                        {
                            '$ref': '#/definitions/problemMatcher'
                        },
                        {
                            'type': 'array',
                            'items': {
                                'anyOf': [
                                    {
                                        '$ref': '#/definitions/problemMatcher'
                                    },
                                    {
                                        'type': 'string',
                                        'enum': ['$tsc', '$tsc-watch', '$msCompile', '$lessCompile', '$gulp-tsc', '$jshint', '$jshint-stylish', '$eslint-compact', '$eslint-stylish', '$go']
                                    }
                                ]
                            }
                        }
                    ]
                },
                'watchingPattern': {
                    'type': 'object',
                    'additionalProperties': false,
                    'properties': {
                        'regexp': {
                            'type': 'string',
                            'description': nls.localize(37, null)
                        },
                        'file': {
                            'type': 'integer',
                            'description': nls.localize(38, null)
                        },
                    }
                },
                'problemMatcher': {
                    'type': 'object',
                    'additionalProperties': false,
                    'properties': {
                        'base': {
                            'type': 'string',
                            'enum': ['$tsc', '$tsc-watch', '$msCompile', '$lessCompile', '$gulp-tsc', '$jshint', '$jshint-stylish', '$eslint-compact', '$eslint-stylish', '$go'],
                            'description': nls.localize(39, null)
                        },
                        'owner': {
                            'type': 'string',
                            'description': nls.localize(40, null)
                        },
                        'severity': {
                            'type': 'string',
                            'enum': ['error', 'warning', 'info'],
                            'description': nls.localize(41, null)
                        },
                        'applyTo': {
                            'type': 'string',
                            'enum': ['allDocuments', 'openDocuments', 'closedDocuments'],
                            'description': nls.localize(42, null)
                        },
                        'pattern': {
                            '$ref': '#/definitions/patternType',
                            'description': nls.localize(43, null)
                        },
                        'fileLocation': {
                            'oneOf': [
                                {
                                    'type': 'string',
                                    'enum': ['absolute', 'relative']
                                },
                                {
                                    'type': 'array',
                                    'items': {
                                        'type': 'string'
                                    }
                                }
                            ],
                            'description': nls.localize(44, null)
                        },
                        'watching': {
                            'type': 'object',
                            'additionalProperties': false,
                            'properties': {
                                'activeOnStart': {
                                    'type': 'boolean',
                                    'description': nls.localize(45, null)
                                },
                                'beginsPattern': {
                                    'oneOf': [
                                        {
                                            'type': 'string'
                                        },
                                        {
                                            'type': '#/definitions/watchingPattern'
                                        }
                                    ],
                                    'description': nls.localize(46, null)
                                },
                                'endsPattern': {
                                    'oneOf': [
                                        {
                                            'type': 'string'
                                        },
                                        {
                                            'type': '#/definitions/watchingPattern'
                                        }
                                    ],
                                    'description': nls.localize(47, null)
                                }
                            }
                        },
                        'watchedTaskBeginsRegExp': {
                            'type': 'string',
                            'description': nls.localize(48, null)
                        },
                        'watchedTaskEndsRegExp': {
                            'type': 'string',
                            'description': nls.localize(49, null)
                        }
                    }
                },
                'baseTaskRunnerConfiguration': {
                    'type': 'object',
                    'properties': {
                        'command': {
                            'type': 'string',
                            'description': nls.localize(50, null)
                        },
                        'isShellCommand': {
                            'type': 'boolean',
                            'default': true,
                            'description': nls.localize(51, null)
                        },
                        'args': {
                            'type': 'array',
                            'description': nls.localize(52, null),
                            'items': {
                                'type': 'string'
                            }
                        },
                        'options': {
                            'type': 'object',
                            'description': nls.localize(53, null),
                            'properties': {
                                'cwd': {
                                    'type': 'string',
                                    'description': nls.localize(54, null)
                                },
                                'env': {
                                    'type': 'object',
                                    'additionalProperties': {
                                        'type': 'string'
                                    },
                                    'description': nls.localize(55, null)
                                }
                            },
                            'additionalProperties': {
                                'type': ['string', 'array', 'object']
                            }
                        },
                        'showOutput': {
                            '$ref': '#/definitions/showOutputType',
                            'description': nls.localize(56, null)
                        },
                        'isWatching': {
                            'type': 'boolean',
                            'description': nls.localize(57, null),
                            'default': true
                        },
                        'promptOnClose': {
                            'type': 'boolean',
                            'description': nls.localize(58, null),
                            'default': false
                        },
                        'echoCommand': {
                            'type': 'boolean',
                            'description': nls.localize(59, null),
                            'default': true
                        },
                        'suppressTaskName': {
                            'type': 'boolean',
                            'description': nls.localize(60, null),
                            'default': true
                        },
                        'taskSelector': {
                            'type': 'string',
                            'description': nls.localize(61, null)
                        },
                        'problemMatcher': {
                            '$ref': '#/definitions/problemMatcherType',
                            'description': nls.localize(62, null)
                        },
                        'tasks': {
                            'type': 'array',
                            'description': nls.localize(63, null),
                            'items': {
                                'type': 'object',
                                '$ref': '#/definitions/taskDescription'
                            }
                        }
                    }
                },
                'taskDescription': {
                    'type': 'object',
                    'required': ['taskName'],
                    'additionalProperties': false,
                    'properties': {
                        'taskName': {
                            'type': 'string',
                            'description': nls.localize(64, null)
                        },
                        'args': {
                            'type': 'array',
                            'description': nls.localize(65, null),
                            'items': {
                                'type': 'string'
                            }
                        },
                        'suppressTaskName': {
                            'type': 'boolean',
                            'description': nls.localize(66, null),
                            'default': true
                        },
                        'showOutput': {
                            '$ref': '#/definitions/showOutputType',
                            'description': nls.localize(67, null)
                        },
                        'echoCommand': {
                            'type': 'boolean',
                            'description': nls.localize(68, null),
                            'default': true
                        },
                        'isWatching': {
                            'type': 'boolean',
                            'description': nls.localize(69, null),
                            'default': true
                        },
                        'isBuildCommand': {
                            'type': 'boolean',
                            'description': nls.localize(70, null),
                            'default': true
                        },
                        'isTestCommand': {
                            'type': 'boolean',
                            'description': nls.localize(71, null),
                            'default': true
                        },
                        'problemMatcher': {
                            '$ref': '#/definitions/problemMatcherType',
                            'description': nls.localize(72, null)
                        }
                    },
                    'defaultSnippets': [
                        {
                            'label': 'Empty task',
                            'body': {
                                'taskName': '{{taskName}}'
                            }
                        }
                    ]
                }
            },
            'allOf': [
                {
                    'type': 'object',
                    'required': ['version'],
                    'properties': {
                        'version': {
                            'type': 'string',
                            'enum': ['0.1.0'],
                            'description': nls.localize(73, null)
                        },
                        'windows': {
                            '$ref': '#/definitions/baseTaskRunnerConfiguration',
                            'description': nls.localize(74, null)
                        },
                        'osx': {
                            '$ref': '#/definitions/baseTaskRunnerConfiguration',
                            'description': nls.localize(75, null)
                        },
                        'linux': {
                            '$ref': '#/definitions/baseTaskRunnerConfiguration',
                            'description': nls.localize(76, null)
                        }
                    }
                },
                {
                    '$ref': '#/definitions/baseTaskRunnerConfiguration'
                }
            ]
        };
        var jsonRegistry = platform_2.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
        jsonRegistry.registerSchema(schemaId, schema);
        jsonRegistry.addSchemaFileAssociation('/.vscode/tasks.json', schemaId);
    }
});
//# sourceMappingURL=task.contribution.js.map