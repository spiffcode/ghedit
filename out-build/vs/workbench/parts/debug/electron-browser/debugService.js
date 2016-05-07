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
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/electron-browser/debugService', 'vs/base/common/lifecycle', 'vs/base/common/mime', 'vs/base/common/eventEmitter', 'vs/base/common/uri', 'vs/base/common/actions', 'vs/base/common/arrays', 'vs/base/common/types', 'vs/base/common/errors', 'vs/base/common/severity', 'vs/base/common/winjs.base', 'vs/base/browser/ui/aria/aria', 'vs/base/node/aiAdapter', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/markers/common/markers', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/extensions/common/extensions', 'vs/platform/instantiation/common/instantiation', 'vs/platform/files/common/files', 'vs/platform/event/common/event', 'vs/platform/message/common/message', 'vs/platform/telemetry/common/telemetry', 'vs/platform/storage/common/storage', 'vs/workbench/common/editor', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/node/rawDebugSession', 'vs/workbench/parts/debug/common/debugModel', 'vs/workbench/parts/debug/browser/debugEditorInputs', 'vs/workbench/parts/debug/common/debugViewModel', 'vs/workbench/parts/debug/electron-browser/debugActions', 'vs/workbench/parts/debug/browser/breakpointWidget', 'vs/workbench/parts/debug/node/debugConfigurationManager', 'vs/workbench/parts/debug/common/debugSource', 'vs/workbench/parts/tasks/common/taskService', 'vs/workbench/parts/tasks/common/taskSystem', 'vs/workbench/services/viewlet/common/viewletService', 'vs/workbench/services/panel/common/panelService', 'vs/workbench/services/part/common/partService', 'vs/workbench/parts/files/common/files', 'vs/workbench/services/workspace/common/contextService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/window/electron-browser/windowService', 'vs/workbench/services/thread/electron-browser/threadService', 'electron'], function (require, exports, nls, lifecycle, mime, ee, uri_1, actions_1, arrays, types, errors, severity_1, winjs_base_1, aria, aiAdapter_1, keybindingService_1, markers_1, lifecycle_1, extensions_1, instantiation_1, files_1, event_1, message_1, telemetry_1, storage_1, wbeditorcommon, debug, session, model, debugEditorInputs_1, viewmodel, debugactions, breakpointWidget_1, debugConfigurationManager_1, debugSource_1, taskService_1, taskSystem_1, viewletService_1, panelService_1, partService_1, files_2, contextService_1, editorService_1, windowService_1, threadService_1, electron_1) {
    "use strict";
    var DEBUG_BREAKPOINTS_KEY = 'debug.breakpoint';
    var DEBUG_BREAKPOINTS_ACTIVATED_KEY = 'debug.breakpointactivated';
    var DEBUG_FUNCTION_BREAKPOINTS_KEY = 'debug.functionbreakpoint';
    var DEBUG_EXCEPTION_BREAKPOINTS_KEY = 'debug.exceptionbreakpoint';
    var DEBUG_WATCH_EXPRESSIONS_KEY = 'debug.watchexpressions';
    var DEBUG_SELECTED_CONFIG_NAME_KEY = 'debug.selectedconfigname';
    var DebugService = (function (_super) {
        __extends(DebugService, _super);
        function DebugService(storageService, editorService, textFileService, viewletService, panelService, fileService, messageService, partService, windowService, telemetryService, contextService, keybindingService, eventService, lifecycleService, instantiationService, extensionService, markerService, taskService) {
            _super.call(this);
            this.storageService = storageService;
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.viewletService = viewletService;
            this.panelService = panelService;
            this.fileService = fileService;
            this.messageService = messageService;
            this.partService = partService;
            this.windowService = windowService;
            this.telemetryService = telemetryService;
            this.contextService = contextService;
            this.lifecycleService = lifecycleService;
            this.instantiationService = instantiationService;
            this.extensionService = extensionService;
            this.markerService = markerService;
            this.taskService = taskService;
            this.serviceId = debug.IDebugService;
            this.toDispose = [];
            this.toDisposeOnSessionEnd = [];
            this.debugStringEditorInputs = [];
            this.session = null;
            this.state = debug.State.Inactive;
            if (!this.contextService.getWorkspace()) {
                this.state = debug.State.Disabled;
            }
            this.configurationManager = this.instantiationService.createInstance(debugConfigurationManager_1.ConfigurationManager, this.storageService.get(DEBUG_SELECTED_CONFIG_NAME_KEY, storage_1.StorageScope.WORKSPACE, 'null'));
            this.inDebugMode = keybindingService.createKey(debug.CONTEXT_IN_DEBUG_MODE, false);
            this.model = new model.Model(this.loadBreakpoints(), this.storageService.getBoolean(DEBUG_BREAKPOINTS_ACTIVATED_KEY, storage_1.StorageScope.WORKSPACE, true), this.loadFunctionBreakpoints(), this.loadExceptionBreakpoints(), this.loadWatchExpressions());
            this.toDispose.push(this.model);
            this.viewModel = new viewmodel.ViewModel();
            this.registerListeners(eventService, lifecycleService);
        }
        DebugService.prototype.registerListeners = function (eventService, lifecycleService) {
            var _this = this;
            this.toDispose.push(eventService.addListener2(files_1.EventType.FILE_CHANGES, function (e) { return _this.onFileChanges(e); }));
            if (this.taskService) {
                this.toDispose.push(this.taskService.addListener2(taskService_1.TaskServiceEvents.Active, function (e) {
                    _this.lastTaskEvent = e;
                }));
                this.toDispose.push(this.taskService.addListener2(taskService_1.TaskServiceEvents.Inactive, function (e) {
                    if (e.type === taskService_1.TaskType.SingleRun) {
                        _this.lastTaskEvent = null;
                    }
                }));
                this.toDispose.push(this.taskService.addListener2(taskService_1.TaskServiceEvents.Terminated, function (e) {
                    _this.lastTaskEvent = null;
                }));
            }
            lifecycleService.onShutdown(this.store, this);
            lifecycleService.onShutdown(this.dispose, this);
            this.toDispose.push(this.windowService.onBroadcast(this.onBroadcast, this));
        };
        DebugService.prototype.onBroadcast = function (broadcast) {
            // attach: PH is ready to be attached to
            if (broadcast.channel === threadService_1.EXTENSION_ATTACH_BROADCAST_CHANNEL) {
                this.rawAttach(broadcast.payload.port);
                return;
            }
            if (broadcast.channel === threadService_1.EXTENSION_TERMINATE_BROADCAST_CHANNEL) {
                this.onSessionEnd();
                return;
            }
            // from this point on we require an active session
            var session = this.getActiveSession();
            if (!session || session.getType() !== 'extensionHost') {
                return; // we are only intersted if we have an active debug session for extensionHost
            }
            // a plugin logged output, show it inside the REPL
            if (broadcast.channel === threadService_1.EXTENSION_LOG_BROADCAST_CHANNEL) {
                var extensionOutput = broadcast.payload;
                var sev = extensionOutput.severity === 'warn' ? severity_1.default.Warning : extensionOutput.severity === 'error' ? severity_1.default.Error : severity_1.default.Info;
                var args = [];
                try {
                    var parsed_1 = JSON.parse(extensionOutput.arguments);
                    args.push.apply(args, Object.getOwnPropertyNames(parsed_1).map(function (o) { return parsed_1[o]; }));
                }
                catch (error) {
                    args.push(extensionOutput.arguments);
                }
                // add output for each argument logged
                var simpleVals = [];
                for (var i = 0; i < args.length; i++) {
                    var a = args[i];
                    // undefined gets printed as 'undefined'
                    if (typeof a === 'undefined') {
                        simpleVals.push('undefined');
                    }
                    else if (a === null) {
                        simpleVals.push('null');
                    }
                    else if (types.isObject(a) || Array.isArray(a)) {
                        // flush any existing simple values logged
                        if (simpleVals.length) {
                            this.logToRepl(simpleVals.join(' '), sev);
                            simpleVals = [];
                        }
                        // show object
                        this.logToRepl(a, sev);
                    }
                    else if (typeof a === 'string') {
                        var buf = '';
                        for (var j = 0, len = a.length; j < len; j++) {
                            if (a[j] === '%' && (a[j + 1] === 's' || a[j + 1] === 'i' || a[j + 1] === 'd')) {
                                i++; // read over substitution
                                buf += !types.isUndefinedOrNull(args[i]) ? args[i] : ''; // replace
                                j++; // read over directive
                            }
                            else {
                                buf += a[j];
                            }
                        }
                        simpleVals.push(buf);
                    }
                    else {
                        simpleVals.push(a);
                    }
                }
                // flush simple values
                if (simpleVals.length) {
                    this.logToRepl(simpleVals.join(' '), sev);
                }
            }
        };
        DebugService.prototype.registerSessionListeners = function () {
            var _this = this;
            this.toDisposeOnSessionEnd.push(this.session);
            this.toDisposeOnSessionEnd.push(this.session.addListener2(debug.SessionEvents.INITIALIZED, function (event) {
                aria.status(nls.localize(0, null));
                _this.sendAllBreakpoints().then(function () {
                    if (_this.session.capabilities.supportsConfigurationDoneRequest) {
                        _this.session.configurationDone().done(null, errors.onUnexpectedError);
                    }
                });
            }));
            this.toDisposeOnSessionEnd.push(this.session.addListener2(debug.SessionEvents.STOPPED, function (event) {
                _this.setStateAndEmit(debug.State.Stopped);
                var threadId = event.body.threadId;
                _this.getThreadData(threadId).done(function () {
                    var thread = _this.model.getThreads()[threadId];
                    _this.model.rawUpdate({
                        threadId: threadId,
                        stoppedDetails: event.body,
                        allThreadsStopped: event.body.allThreadsStopped
                    });
                    thread.getCallStack(_this).then(function (callStack) {
                        _this.windowService.getWindow().focus();
                        if (callStack.length > 0) {
                            // focus first stack frame from top that has source location
                            var stackFrameToFocus = arrays.first(callStack, function (sf) { return sf.source && sf.source.available; }, callStack[0]);
                            _this.setFocusedStackFrameAndEvaluate(stackFrameToFocus);
                            aria.alert(nls.localize(1, null, event.body.reason, stackFrameToFocus.source ? stackFrameToFocus.source.name : '', stackFrameToFocus.lineNumber));
                            return _this.openOrRevealEditor(stackFrameToFocus.source, stackFrameToFocus.lineNumber, false, false);
                        }
                        else {
                            _this.setFocusedStackFrameAndEvaluate(null);
                        }
                    });
                }, errors.onUnexpectedError);
            }));
            this.toDisposeOnSessionEnd.push(this.session.addListener2(debug.SessionEvents.CONTINUED, function () {
                aria.status(nls.localize(2, null));
                _this.model.continueThreads();
                _this.setFocusedStackFrameAndEvaluate(null);
                _this.setStateAndEmit(_this.configurationManager.getConfiguration().noDebug ? debug.State.RunningNoDebug : debug.State.Running);
            }));
            this.toDisposeOnSessionEnd.push(this.session.addListener2(debug.SessionEvents.THREAD, function (event) {
                if (event.body.reason === 'started') {
                    _this.session.threads().done(function (result) {
                        var thread = result.body.threads.filter(function (thread) { return thread.id === event.body.threadId; }).pop();
                        if (thread) {
                            _this.model.rawUpdate({
                                threadId: thread.id,
                                thread: thread
                            });
                        }
                    }, errors.onUnexpectedError);
                }
                else if (event.body.reason === 'exited') {
                    _this.model.clearThreads(true, event.body.threadId);
                }
            }));
            this.toDisposeOnSessionEnd.push(this.session.addListener2(debug.SessionEvents.DEBUGEE_TERMINATED, function (event) {
                aria.status(nls.localize(3, null));
                if (_this.session && _this.session.getId() === event.sessionId) {
                    if (event.body && typeof event.body.restart === 'boolean' && event.body.restart) {
                        _this.restartSession().done(null, function (err) { return _this.messageService.show(severity_1.default.Error, err.message); });
                    }
                    else {
                        _this.session.disconnect().done(null, errors.onUnexpectedError);
                    }
                }
            }));
            this.toDisposeOnSessionEnd.push(this.session.addListener2(debug.SessionEvents.OUTPUT, function (event) {
                if (event.body && event.body.category === 'telemetry') {
                    // only log telemetry events from debug adapter if the adapter provided the telemetry key
                    if (_this.telemetryAdapter) {
                        _this.telemetryAdapter.log(event.body.output, event.body.data);
                    }
                }
                else if (event.body && typeof event.body.output === 'string' && event.body.output.length > 0) {
                    _this.onOutput(event);
                }
            }));
            this.toDisposeOnSessionEnd.push(this.session.addListener2(debug.SessionEvents.BREAKPOINT, function (event) {
                var id = event.body && event.body.breakpoint ? event.body.breakpoint.id : undefined;
                var breakpoint = _this.model.getBreakpoints().filter(function (bp) { return bp.idFromAdapter === id; }).pop();
                if (breakpoint) {
                    _this.model.updateBreakpoints((_a = {}, _a[breakpoint.getId()] = event.body.breakpoint, _a));
                }
                else {
                    var functionBreakpoint = _this.model.getFunctionBreakpoints().filter(function (bp) { return bp.idFromAdapter === id; }).pop();
                    if (functionBreakpoint) {
                        _this.model.updateFunctionBreakpoints((_b = {}, _b[functionBreakpoint.getId()] = event.body.breakpoint, _b));
                    }
                }
                var _a, _b;
            }));
            this.toDisposeOnSessionEnd.push(this.session.addListener2(debug.SessionEvents.SERVER_EXIT, function (event) {
                // 'Run without debugging' mode VSCode must terminate the extension host. More details: #3905
                if (_this.session.getType() === 'extensionHost' && _this.state === debug.State.RunningNoDebug) {
                    electron_1.ipcRenderer.send('vscode:closeExtensionHostWindow', _this.contextService.getWorkspace().resource.fsPath);
                }
                if (_this.session && _this.session.getId() === event.sessionId) {
                    _this.onSessionEnd();
                }
            }));
        };
        DebugService.prototype.onOutput = function (event) {
            var outputSeverity = event.body.category === 'stderr' ? severity_1.default.Error : event.body.category === 'console' ? severity_1.default.Warning : severity_1.default.Info;
            this.appendReplOutput(event.body.output, outputSeverity);
        };
        DebugService.prototype.getThreadData = function (threadId) {
            var _this = this;
            return this.model.getThreads()[threadId] ? winjs_base_1.TPromise.as(undefined) :
                this.session.threads().then(function (response) {
                    var thread = response.body.threads.filter(function (t) { return t.id === threadId; }).pop();
                    if (!thread) {
                        throw new Error(nls.localize(4, null, threadId));
                    }
                    _this.model.rawUpdate({
                        threadId: thread.id,
                        thread: thread
                    });
                });
        };
        DebugService.prototype.loadBreakpoints = function () {
            try {
                return JSON.parse(this.storageService.get(DEBUG_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE, '[]')).map(function (breakpoint) {
                    return new model.Breakpoint(new debugSource_1.Source(breakpoint.source.raw ? breakpoint.source.raw : { path: uri_1.default.parse(breakpoint.source.uri).fsPath, name: breakpoint.source.name }), breakpoint.desiredLineNumber || breakpoint.lineNumber, breakpoint.enabled, breakpoint.condition);
                });
            }
            catch (e) {
                return [];
            }
        };
        DebugService.prototype.loadFunctionBreakpoints = function () {
            try {
                return JSON.parse(this.storageService.get(DEBUG_FUNCTION_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE, '[]')).map(function (fb) {
                    return new model.FunctionBreakpoint(fb.name, fb.enabled);
                });
            }
            catch (e) {
                return [];
            }
        };
        DebugService.prototype.loadExceptionBreakpoints = function () {
            var result = null;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_EXCEPTION_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE, '[]')).map(function (exBreakpoint) {
                    return new model.ExceptionBreakpoint(exBreakpoint.filter || exBreakpoint.name, exBreakpoint.label, exBreakpoint.enabled);
                });
            }
            catch (e) {
                result = [];
            }
            return result;
        };
        DebugService.prototype.loadWatchExpressions = function () {
            try {
                return JSON.parse(this.storageService.get(DEBUG_WATCH_EXPRESSIONS_KEY, storage_1.StorageScope.WORKSPACE, '[]')).map(function (watch) {
                    return new model.Expression(watch.name, false, watch.id);
                });
            }
            catch (e) {
                return [];
            }
        };
        DebugService.prototype.getState = function () {
            return this.state;
        };
        DebugService.prototype.setStateAndEmit = function (newState) {
            this.state = newState;
            this.emit(debug.ServiceEvents.STATE_CHANGED);
        };
        Object.defineProperty(DebugService.prototype, "enabled", {
            get: function () {
                return !!this.contextService.getWorkspace();
            },
            enumerable: true,
            configurable: true
        });
        DebugService.prototype.setFocusedStackFrameAndEvaluate = function (focusedStackFrame) {
            this.viewModel.setFocusedStackFrame(focusedStackFrame);
            if (focusedStackFrame) {
                this.model.evaluateWatchExpressions(this.session, focusedStackFrame);
            }
            else {
                this.model.clearWatchExpressionValues();
            }
        };
        DebugService.prototype.setBreakpointsForModel = function (modelUri, rawData) {
            this.model.removeBreakpoints(this.model.getBreakpoints().filter(function (bp) { return bp.source.uri.toString() === modelUri.toString(); }));
            this.model.addBreakpoints(rawData);
        };
        DebugService.prototype.toggleBreakpoint = function (rawBreakpoint) {
            var breakpoint = this.model.getBreakpoints().filter(function (bp) { return bp.lineNumber === rawBreakpoint.lineNumber && bp.source.uri.toString() === rawBreakpoint.uri.toString(); }).pop();
            if (breakpoint) {
                this.model.removeBreakpoints([breakpoint]);
            }
            else {
                this.model.addBreakpoints([rawBreakpoint]);
            }
            return this.sendBreakpoints(rawBreakpoint.uri);
        };
        DebugService.prototype.enableOrDisableAllBreakpoints = function (enabled) {
            this.model.enableOrDisableAllBreakpoints(enabled);
            return this.sendAllBreakpoints();
        };
        DebugService.prototype.toggleEnablement = function (element) {
            this.model.toggleEnablement(element);
            if (element instanceof model.Breakpoint) {
                var breakpoint = element;
                return this.sendBreakpoints(breakpoint.source.uri);
            }
            else if (element instanceof model.FunctionBreakpoint) {
                return this.sendFunctionBreakpoints();
            }
            return this.sendExceptionBreakpoints();
        };
        DebugService.prototype.removeAllBreakpoints = function () {
            var _this = this;
            var urisToClear = arrays.distinct(this.model.getBreakpoints(), function (bp) { return bp.source.uri.toString(); }).map(function (bp) { return bp.source.uri; });
            this.model.removeBreakpoints(this.model.getBreakpoints());
            return winjs_base_1.TPromise.join(urisToClear.map(function (uri) { return _this.sendBreakpoints(uri); }));
        };
        DebugService.prototype.toggleBreakpointsActivated = function () {
            this.model.toggleBreakpointsActivated();
            return this.sendAllBreakpoints();
        };
        DebugService.prototype.editBreakpoint = function (editor, lineNumber) {
            if (breakpointWidget_1.BreakpointWidget.INSTANCE) {
                breakpointWidget_1.BreakpointWidget.INSTANCE.dispose();
            }
            this.instantiationService.createInstance(breakpointWidget_1.BreakpointWidget, editor, lineNumber);
            breakpointWidget_1.BreakpointWidget.INSTANCE.show({ lineNumber: lineNumber, column: 1 }, 2);
            return winjs_base_1.TPromise.as(null);
        };
        DebugService.prototype.addFunctionBreakpoint = function () {
            this.model.addFunctionBreakpoint('');
        };
        DebugService.prototype.renameFunctionBreakpoint = function (id, newFunctionName) {
            this.model.updateFunctionBreakpoints((_a = {}, _a[id] = { name: newFunctionName }, _a));
            return this.sendFunctionBreakpoints();
            var _a;
        };
        DebugService.prototype.removeFunctionBreakpoints = function (id) {
            this.model.removeFunctionBreakpoints(id);
            return this.sendFunctionBreakpoints();
        };
        DebugService.prototype.addReplExpression = function (name) {
            this.telemetryService.publicLog('debugService/addReplExpression');
            return this.model.addReplExpression(this.session, this.viewModel.getFocusedStackFrame(), name);
        };
        DebugService.prototype.logToRepl = function (value, severity) {
            this.model.logToRepl(value, severity);
        };
        DebugService.prototype.appendReplOutput = function (value, severity) {
            this.model.appendReplOutput(value, severity);
        };
        DebugService.prototype.clearReplExpressions = function () {
            this.model.clearReplExpressions();
        };
        DebugService.prototype.addWatchExpression = function (name) {
            return this.model.addWatchExpression(this.session, this.viewModel.getFocusedStackFrame(), name);
        };
        DebugService.prototype.renameWatchExpression = function (id, newName) {
            return this.model.renameWatchExpression(this.session, this.viewModel.getFocusedStackFrame(), id, newName);
        };
        DebugService.prototype.clearWatchExpressions = function (id) {
            this.model.clearWatchExpressions(id);
        };
        DebugService.prototype.createSession = function (noDebug, changeViewState) {
            var _this = this;
            if (changeViewState === void 0) { changeViewState = !this.partService.isSideBarHidden(); }
            this.clearReplExpressions();
            return this.textFileService.saveAll()
                .then(function () { return _this.extensionService.onReady()
                .then(function () { return _this.setConfiguration(_this.configurationManager.getConfigurationName())
                .then(function () {
                var configuration = _this.configurationManager.getConfiguration();
                if (!configuration) {
                    return _this.configurationManager.openConfigFile(false).then(function (openend) {
                        if (openend) {
                            _this.messageService.show(severity_1.default.Info, nls.localize(5, null));
                        }
                    });
                }
                configuration.noDebug = noDebug;
                if (!_this.configurationManager.getAdapter()) {
                    _this.emit(debug.ServiceEvents.TYPE_NOT_SUPPORTED, configuration.type);
                    return configuration.type ? winjs_base_1.TPromise.wrapError(new Error(nls.localize(6, null, configuration.type)))
                        : winjs_base_1.TPromise.wrapError(errors.create(nls.localize(7, null), { actions: [message_1.CloseAction, _this.instantiationService.createInstance(debugactions.ConfigureAction, debugactions.ConfigureAction.ID, debugactions.ConfigureAction.LABEL)] }));
                }
                return _this.runPreLaunchTask(configuration.preLaunchTask).then(function (taskSummary) {
                    var errorCount = configuration.preLaunchTask ? _this.markerService.getStatistics().errors : 0;
                    var failureExitCode = taskSummary && taskSummary.exitCode !== undefined && taskSummary.exitCode !== 0;
                    if (errorCount === 0 && !failureExitCode) {
                        return _this.doCreateSession(configuration, changeViewState);
                    }
                    _this.messageService.show(severity_1.default.Error, {
                        message: errorCount > 1 ? nls.localize(8, null, configuration.preLaunchTask) :
                            errorCount === 1 ? nls.localize(9, null, configuration.preLaunchTask) :
                                nls.localize(10, null, configuration.preLaunchTask, taskSummary.exitCode),
                        actions: [message_1.CloseAction, new actions_1.Action('debug.continue', nls.localize(11, null), null, true, function () {
                                _this.messageService.hideAll();
                                return _this.doCreateSession(configuration, changeViewState);
                            })]
                    });
                }, function (err) {
                    if (err.code !== taskSystem_1.TaskErrors.NotConfigured) {
                        throw err;
                    }
                    _this.messageService.show(err.severity, {
                        message: err.message,
                        actions: [message_1.CloseAction, _this.taskService.configureAction()]
                    });
                });
            }); }); });
        };
        DebugService.prototype.doCreateSession = function (configuration, changeViewState) {
            var _this = this;
            this.setStateAndEmit(debug.State.Initializing);
            var key = this.configurationManager.getAdapter().aiKey;
            var telemetryInfo = Object.create(null);
            this.telemetryService.getTelemetryInfo().then(function (info) {
                telemetryInfo['common.vscodemachineid'] = info.machineId;
                telemetryInfo['common.vscodesessionid'] = info.sessionId;
            }, errors.onUnexpectedError);
            this.telemetryAdapter = new aiAdapter_1.AIAdapter(key, this.configurationManager.getAdapter().type, null, telemetryInfo);
            this.session = new session.RawDebugSession(this.messageService, this.telemetryService, configuration.debugServer, this.configurationManager.getAdapter(), this.telemetryAdapter);
            this.registerSessionListeners();
            return this.session.initialize({
                adapterID: configuration.type,
                pathFormat: 'path',
                linesStartAt1: true,
                columnsStartAt1: true
            }).then(function (result) {
                if (!_this.session) {
                    return winjs_base_1.TPromise.wrapError(new Error(nls.localize(12, null)));
                }
                _this.model.setExceptionBreakpoints(_this.session.capabilities.exceptionBreakpointFilters);
                return configuration.request === 'attach' ? _this.session.attach(configuration) : _this.session.launch(configuration);
            }).then(function (result) {
                if (changeViewState) {
                    _this.viewletService.openViewlet(debug.VIEWLET_ID);
                    _this.revealRepl(false).done(undefined, errors.onUnexpectedError);
                }
                // Do not change status bar to orange if we are just running without debug.
                if (!configuration.noDebug) {
                    _this.partService.addClass('debugging');
                }
                _this.extensionService.activateByEvent("onDebug:" + configuration.type).done(null, errors.onUnexpectedError);
                _this.contextService.updateOptions('editor', {
                    glyphMargin: true
                });
                _this.inDebugMode.set(true);
                _this.telemetryService.publicLog('debugSessionStart', { type: configuration.type, breakpointCount: _this.model.getBreakpoints().length, exceptionBreakpoints: _this.model.getExceptionBreakpoints(), watchExpressionsCount: _this.model.getWatchExpressions().length });
            }).then(undefined, function (error) {
                _this.telemetryService.publicLog('debugMisconfiguration', { type: configuration ? configuration.type : undefined });
                _this.setStateAndEmit(debug.State.Inactive);
                if (_this.session) {
                    _this.session.disconnect();
                }
                var configureAction = _this.instantiationService.createInstance(debugactions.ConfigureAction, debugactions.ConfigureAction.ID, debugactions.ConfigureAction.LABEL);
                var actions = (error.actions && error.actions.length) ? error.actions.concat([configureAction]) : [message_1.CloseAction, configureAction];
                return winjs_base_1.TPromise.wrapError(errors.create(error.message, { actions: actions }));
            });
        };
        DebugService.prototype.runPreLaunchTask = function (taskName) {
            var _this = this;
            if (!taskName) {
                return winjs_base_1.TPromise.as(null);
            }
            // run a task before starting a debug session
            return this.taskService.tasks().then(function (descriptions) {
                var filteredTasks = descriptions.filter(function (task) { return task.name === taskName; });
                if (filteredTasks.length !== 1) {
                    return winjs_base_1.TPromise.wrapError(errors.create(nls.localize(13, null, taskName), {
                        actions: [
                            message_1.CloseAction,
                            _this.taskService.configureAction(),
                            _this.instantiationService.createInstance(debugactions.ConfigureAction, debugactions.ConfigureAction.ID, debugactions.ConfigureAction.LABEL)
                        ]
                    }));
                }
                // task is already running - nothing to do.
                if (_this.lastTaskEvent && _this.lastTaskEvent.taskName === taskName) {
                    return winjs_base_1.TPromise.as(null);
                }
                if (_this.lastTaskEvent) {
                    // there is a different task running currently.
                    return winjs_base_1.TPromise.wrapError(errors.create(nls.localize(14, null, _this.lastTaskEvent.taskName, taskName)));
                }
                // no task running, execute the preLaunchTask.
                var taskPromise = _this.taskService.run(filteredTasks[0].id).then(function (result) {
                    _this.lastTaskEvent = null;
                    return result;
                }, function (err) {
                    _this.lastTaskEvent = null;
                });
                if (filteredTasks[0].isWatching) {
                    return new winjs_base_1.TPromise(function (c, e) { return _this.taskService.addOneTimeListener(taskService_1.TaskServiceEvents.Inactive, function () { return c(null); }); });
                }
                return taskPromise;
            });
        };
        DebugService.prototype.rawAttach = function (port) {
            if (this.session) {
                if (!this.session.isAttach) {
                    return this.session.attach({ port: port });
                }
                this.session.disconnect().done(null, errors.onUnexpectedError);
            }
            var configuration = this.configurationManager.getConfiguration();
            this.setStateAndEmit(debug.State.Initializing);
            return this.doCreateSession({
                type: configuration.type,
                request: 'attach',
                port: port,
                sourceMaps: configuration.sourceMaps,
                outDir: configuration.outDir,
                debugServer: configuration.debugServer
            }, false);
        };
        DebugService.prototype.restartSession = function () {
            var _this = this;
            return this.session ? this.session.disconnect(true).then(function () {
                return new winjs_base_1.TPromise(function (c, e) {
                    setTimeout(function () {
                        _this.createSession(false, false).then(function () { return c(null); }, function (err) { return e(err); });
                    }, 300);
                });
            }) : this.createSession(false, false);
        };
        DebugService.prototype.getActiveSession = function () {
            return this.session;
        };
        DebugService.prototype.onSessionEnd = function () {
            if (this.session) {
                var bpsExist = this.model.getBreakpoints().length > 0;
                this.telemetryService.publicLog('debugSessionStop', {
                    type: this.session.getType(),
                    success: this.session.emittedStopped || !bpsExist,
                    sessionLengthInSeconds: this.session.getLengthInSeconds(),
                    breakpointCount: this.model.getBreakpoints().length,
                    watchExpressionsCount: this.model.getWatchExpressions().length
                });
            }
            this.session = null;
            try {
                this.toDisposeOnSessionEnd = lifecycle.dispose(this.toDisposeOnSessionEnd);
            }
            catch (e) {
            }
            this.partService.removeClass('debugging');
            this.editorService.focusEditor();
            this.model.clearThreads(true);
            this.setFocusedStackFrameAndEvaluate(null);
            this.setStateAndEmit(debug.State.Inactive);
            // set breakpoints back to unverified since the session ended.
            // source reference changes across sessions, so we do not use it to persist the source.
            var data = {};
            this.model.getBreakpoints().forEach(function (bp) {
                delete bp.source.raw.sourceReference;
                data[bp.getId()] = { line: bp.lineNumber, verified: false };
            });
            this.model.updateBreakpoints(data);
            if (this.telemetryAdapter) {
                this.telemetryAdapter.dispose();
                this.telemetryAdapter = null;
            }
            this.inDebugMode.reset();
        };
        DebugService.prototype.getModel = function () {
            return this.model;
        };
        DebugService.prototype.getViewModel = function () {
            return this.viewModel;
        };
        DebugService.prototype.openOrRevealEditor = function (source, lineNumber, preserveFocus, sideBySide) {
            var _this = this;
            var visibleEditors = this.editorService.getVisibleEditors();
            for (var i = 0; i < visibleEditors.length; i++) {
                var fileInput = wbeditorcommon.asFileEditorInput(visibleEditors[i].input);
                if ((fileInput && fileInput.getResource().toString() === source.uri.toString()) ||
                    (visibleEditors[i].input instanceof debugEditorInputs_1.DebugStringEditorInput && visibleEditors[i].input.getResource().toString() === source.uri.toString())) {
                    var control = visibleEditors[i].getControl();
                    if (control) {
                        control.revealLineInCenterIfOutsideViewport(lineNumber);
                        control.setSelection({ startLineNumber: lineNumber, startColumn: 1, endLineNumber: lineNumber, endColumn: 1 });
                        return this.editorService.openEditor(visibleEditors[i].input, wbeditorcommon.TextEditorOptions.create({ preserveFocus: preserveFocus, forceActive: true }), visibleEditors[i].position);
                    }
                    return winjs_base_1.TPromise.as(null);
                }
            }
            if (source.inMemory) {
                // internal module
                if (source.reference !== 0 && this.session) {
                    return this.session.source({ sourceReference: source.reference }).then(function (response) {
                        var editorInput = _this.getDebugStringEditorInput(source, response.body.content, mime.guessMimeTypes(source.name)[0]);
                        return _this.editorService.openEditor(editorInput, wbeditorcommon.TextEditorOptions.create({
                            selection: {
                                startLineNumber: lineNumber,
                                startColumn: 1,
                                endLineNumber: lineNumber,
                                endColumn: 1
                            },
                            preserveFocus: preserveFocus
                        }), sideBySide);
                    });
                }
                return this.sourceIsUnavailable(source, sideBySide);
            }
            return this.fileService.resolveFile(source.uri).then(function () {
                return _this.editorService.openEditor({
                    resource: source.uri,
                    options: {
                        selection: {
                            startLineNumber: lineNumber,
                            startColumn: 1,
                            endLineNumber: lineNumber,
                            endColumn: 1
                        },
                        preserveFocus: preserveFocus
                    }
                }, sideBySide);
            }, function (err) { return _this.sourceIsUnavailable(source, sideBySide); });
        };
        DebugService.prototype.sourceIsUnavailable = function (source, sideBySide) {
            this.model.sourceIsUnavailable(source);
            var editorInput = this.getDebugStringEditorInput(source, nls.localize(15, null, source.uri.fsPath), 'text/plain');
            return this.editorService.openEditor(editorInput, wbeditorcommon.TextEditorOptions.create({ preserveFocus: true }), sideBySide);
        };
        DebugService.prototype.revealRepl = function (focus) {
            var _this = this;
            if (focus === void 0) { focus = true; }
            return this.panelService.openPanel(debug.REPL_ID, focus).then(function (repl) {
                var elements = _this.model.getReplElements();
                if (repl && elements.length > 0) {
                    return repl.reveal(elements[elements.length - 1]);
                }
            });
        };
        DebugService.prototype.canSetBreakpointsIn = function (model) {
            return this.configurationManager.canSetBreakpointsIn(model);
        };
        DebugService.prototype.getConfigurationName = function () {
            return this.configurationManager.getConfigurationName();
        };
        DebugService.prototype.setConfiguration = function (name) {
            var _this = this;
            return this.configurationManager.setConfiguration(name).then(function () { return _this.emit(debug.ServiceEvents.CONFIGURATION_CHANGED); });
        };
        DebugService.prototype.openConfigFile = function (sideBySide) {
            return this.configurationManager.openConfigFile(sideBySide);
        };
        DebugService.prototype.loadLaunchConfig = function () {
            return this.configurationManager.loadLaunchConfig();
        };
        DebugService.prototype.getDebugStringEditorInput = function (source, value, mtype) {
            var filtered = this.debugStringEditorInputs.filter(function (input) { return input.getResource().toString() === source.uri.toString(); });
            if (filtered.length === 0) {
                var result = this.instantiationService.createInstance(debugEditorInputs_1.DebugStringEditorInput, source.name, source.uri, source.origin, value, mtype, void 0);
                this.debugStringEditorInputs.push(result);
                this.toDisposeOnSessionEnd.push(result);
                return result;
            }
            else {
                return filtered[0];
            }
        };
        DebugService.prototype.sendAllBreakpoints = function () {
            var _this = this;
            return winjs_base_1.TPromise.join(arrays.distinct(this.model.getBreakpoints(), function (bp) { return bp.source.uri.toString(); }).map(function (bp) { return _this.sendBreakpoints(bp.source.uri); }))
                .then(function () { return _this.sendFunctionBreakpoints(); })
                .then(function () { return _this.sendExceptionBreakpoints(); });
        };
        DebugService.prototype.sendBreakpoints = function (modelUri) {
            var _this = this;
            if (!this.session || !this.session.readyForBreakpoints) {
                return winjs_base_1.TPromise.as(null);
            }
            var breakpointsToSend = arrays.distinct(this.model.getBreakpoints().filter(function (bp) { return _this.model.areBreakpointsActivated() && bp.enabled && bp.source.uri.toString() === modelUri.toString(); }), function (bp) { return ("" + bp.desiredLineNumber); });
            var rawSource = breakpointsToSend.length > 0 ? breakpointsToSend[0].source.raw : debugSource_1.Source.toRawSource(modelUri, this.model);
            return this.session.setBreakpoints({ source: rawSource, lines: breakpointsToSend.map(function (bp) { return bp.desiredLineNumber; }),
                breakpoints: breakpointsToSend.map(function (bp) { return ({ line: bp.desiredLineNumber, condition: bp.condition }); }) }).then(function (response) {
                var data = {};
                for (var i = 0; i < breakpointsToSend.length; i++) {
                    data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
                }
                _this.model.updateBreakpoints(data);
            });
        };
        DebugService.prototype.sendFunctionBreakpoints = function () {
            var _this = this;
            if (!this.session || !this.session.readyForBreakpoints || !this.session.capabilities.supportsFunctionBreakpoints) {
                return winjs_base_1.TPromise.as(null);
            }
            var breakpointsToSend = this.model.getFunctionBreakpoints().filter(function (fbp) { return fbp.enabled && _this.model.areBreakpointsActivated(); });
            return this.session.setFunctionBreakpoints({ breakpoints: breakpointsToSend }).then(function (response) {
                var data = {};
                for (var i = 0; i < breakpointsToSend.length; i++) {
                    data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
                }
                _this.model.updateFunctionBreakpoints(data);
            });
        };
        DebugService.prototype.sendExceptionBreakpoints = function () {
            if (!this.session || !this.session.readyForBreakpoints || this.model.getExceptionBreakpoints().length === 0) {
                return winjs_base_1.TPromise.as(null);
            }
            var enabledExceptionBps = this.model.getExceptionBreakpoints().filter(function (exb) { return exb.enabled; });
            return this.session.setExceptionBreakpoints({ filters: enabledExceptionBps.map(function (exb) { return exb.filter; }) });
        };
        DebugService.prototype.onFileChanges = function (fileChangesEvent) {
            this.model.removeBreakpoints(this.model.getBreakpoints().filter(function (bp) {
                return fileChangesEvent.contains(bp.source.uri, files_1.FileChangeType.DELETED);
            }));
        };
        DebugService.prototype.store = function () {
            this.storageService.store(DEBUG_BREAKPOINTS_KEY, JSON.stringify(this.model.getBreakpoints()), storage_1.StorageScope.WORKSPACE);
            this.storageService.store(DEBUG_BREAKPOINTS_ACTIVATED_KEY, this.model.areBreakpointsActivated() ? 'true' : 'false', storage_1.StorageScope.WORKSPACE);
            this.storageService.store(DEBUG_FUNCTION_BREAKPOINTS_KEY, JSON.stringify(this.model.getFunctionBreakpoints()), storage_1.StorageScope.WORKSPACE);
            this.storageService.store(DEBUG_EXCEPTION_BREAKPOINTS_KEY, JSON.stringify(this.model.getExceptionBreakpoints()), storage_1.StorageScope.WORKSPACE);
            this.storageService.store(DEBUG_SELECTED_CONFIG_NAME_KEY, this.configurationManager.getConfigurationName(), storage_1.StorageScope.WORKSPACE);
            this.storageService.store(DEBUG_WATCH_EXPRESSIONS_KEY, JSON.stringify(this.model.getWatchExpressions()), storage_1.StorageScope.WORKSPACE);
        };
        DebugService.prototype.dispose = function () {
            this.toDisposeOnSessionEnd = lifecycle.dispose(this.toDisposeOnSessionEnd);
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        DebugService = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, files_2.ITextFileService),
            __param(3, viewletService_1.IViewletService),
            __param(4, panelService_1.IPanelService),
            __param(5, files_1.IFileService),
            __param(6, message_1.IMessageService),
            __param(7, partService_1.IPartService),
            __param(8, windowService_1.IWindowService),
            __param(9, telemetry_1.ITelemetryService),
            __param(10, contextService_1.IWorkspaceContextService),
            __param(11, keybindingService_1.IKeybindingService),
            __param(12, event_1.IEventService),
            __param(13, lifecycle_1.ILifecycleService),
            __param(14, instantiation_1.IInstantiationService),
            __param(15, extensions_1.IExtensionService),
            __param(16, markers_1.IMarkerService),
            __param(17, taskService_1.ITaskService)
        ], DebugService);
        return DebugService;
    }(ee.EventEmitter));
    exports.DebugService = DebugService;
});
//# sourceMappingURL=debugService.js.map