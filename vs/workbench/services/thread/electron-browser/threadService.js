/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/workbench/services/thread/electron-browser/threadService', 'vs/base/common/actions', 'vs/base/common/errors', 'vs/base/common/marshalling', 'vs/base/common/objects', 'vs/base/common/strings', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/base/node/ports', 'vs/platform/extensions/common/ipcRemoteCom', 'vs/platform/message/common/message', 'vs/platform/thread/common/mainThreadService', 'child_process', 'electron'], function (require, exports, nls, actions_1, errors_1, marshalling_1, objects, strings, uri_1, winjs_base_1, ports_1, ipcRemoteCom_1, message_1, mainThreadService_1, child_process_1, electron_1) {
    'use strict';
    exports.EXTENSION_LOG_BROADCAST_CHANNEL = 'vscode:extensionLog';
    exports.EXTENSION_ATTACH_BROADCAST_CHANNEL = 'vscode:extensionAttach';
    exports.EXTENSION_TERMINATE_BROADCAST_CHANNEL = 'vscode:extensionTerminate';
    // Enable to see detailed message communication between window and extension host
    var logExtensionHostCommunication = false;
    var MainThreadService = (function (_super) {
        __extends(MainThreadService, _super);
        function MainThreadService(contextService, messageService, windowService, lifecycleService) {
            var _this = this;
            _super.call(this, contextService, 'vs/editor/common/worker/editorWorkerServer', 1);
            this.extensionHostProcessManager = new ExtensionHostProcessManager(contextService, messageService, windowService, lifecycleService);
            var logCommunication = logExtensionHostCommunication || contextService.getConfiguration().env.logExtensionHostCommunication;
            // Message: Window --> Extension Host
            this.remoteCom = ipcRemoteCom_1.create(function (msg) {
                if (logCommunication) {
                    console.log('%c[Window \u2192 Extension]%c[len: ' + strings.pad(msg.length, 5, ' ') + ']', 'color: darkgreen', 'color: grey', msg);
                }
                _this.extensionHostProcessManager.postMessage(msg);
            });
            // Message: Extension Host --> Window
            this.extensionHostProcessManager.startExtensionHostProcess(function (msg) {
                if (logCommunication) {
                    console.log('%c[Extension \u2192 Window]%c[len: ' + strings.pad(msg.length, 5, ' ') + ']', 'color: darkgreen', 'color: grey', msg);
                }
                _this.remoteCom.handle(msg);
            });
            this.remoteCom.setManyHandler(this);
            lifecycleService.onShutdown(function () { return _this.dispose(); });
        }
        MainThreadService.prototype.dispose = function () {
            this.extensionHostProcessManager.terminate();
        };
        MainThreadService.prototype._registerAndInstantiateExtHostActor = function (id, descriptor) {
            return this._getOrCreateProxyInstance(this.remoteCom, id, descriptor);
        };
        return MainThreadService;
    }(mainThreadService_1.MainThreadService));
    exports.MainThreadService = MainThreadService;
    var ExtensionHostProcessManager = (function () {
        function ExtensionHostProcessManager(contextService, messageService, windowService, lifecycleService) {
            this.contextService = contextService;
            this.messageService = messageService;
            this.windowService = windowService;
            this.lifecycleService = lifecycleService;
            // handle extension host lifecycle a bit special when we know we are developing an extension that runs inside
            var config = this.contextService.getConfiguration();
            this.isExtensionDevelopmentHost = !!config.env.extensionDevelopmentPath;
            this.isExtensionDevelopmentDebugging = !!config.env.debugBrkExtensionHost;
            this.isExtensionDevelopmentTestFromCli = this.isExtensionDevelopmentHost && !!config.env.extensionTestsPath && !config.env.debugBrkExtensionHost;
            this.unsentMessages = [];
            this.extensionHostProcessReady = false;
            lifecycleService.addBeforeShutdownParticipant(this);
        }
        ExtensionHostProcessManager.prototype.startExtensionHostProcess = function (onExtensionHostMessage) {
            var _this = this;
            var config = this.contextService.getConfiguration();
            var opts = {
                env: objects.mixin(objects.clone(process.env), { AMD_ENTRYPOINT: 'vs/workbench/node/extensionHostProcess', PIPE_LOGGING: 'true', VERBOSE_LOGGING: true })
            };
            // Help in case we fail to start it
            if (!config.env.isBuilt || this.isExtensionDevelopmentHost) {
                this.initializeTimer = setTimeout(function () {
                    var msg = _this.isExtensionDevelopmentDebugging ? nls.localize(0, null) : nls.localize(1, null);
                    _this.messageService.show(message_1.Severity.Warning, msg);
                }, 10000);
            }
            // Initialize extension host process with hand shakes
            this.initializeExtensionHostProcess = new winjs_base_1.TPromise(function (c, e) {
                // Resolve additional execution args (e.g. debug)
                return _this.resolveDebugPort(config, function (port) {
                    if (port) {
                        opts.execArgv = ['--nolazy', (_this.isExtensionDevelopmentDebugging ? '--debug-brk=' : '--debug=') + port];
                    }
                    // Run Extension Host as fork of current process
                    _this.extensionHostProcessHandle = child_process_1.fork(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, ['--type=extensionHost'], opts);
                    // Notify debugger that we are ready to attach to the process if we run a development extension
                    if (_this.isExtensionDevelopmentHost && port) {
                        _this.windowService.broadcast({
                            channel: exports.EXTENSION_ATTACH_BROADCAST_CHANNEL,
                            payload: {
                                port: port
                            }
                        }, config.env.extensionDevelopmentPath /* target */);
                    }
                    // Messages from Extension host
                    _this.extensionHostProcessHandle.on('message', function (msg) {
                        // 1) Host is ready to receive messages, initialize it
                        if (msg === 'ready') {
                            if (_this.initializeTimer) {
                                window.clearTimeout(_this.initializeTimer);
                            }
                            var initPayload = marshalling_1.stringify({
                                parentPid: process.pid,
                                contextService: {
                                    workspace: _this.contextService.getWorkspace(),
                                    configuration: _this.contextService.getConfiguration(),
                                    options: _this.contextService.getOptions()
                                },
                            });
                            _this.extensionHostProcessHandle.send(initPayload);
                        }
                        else if (msg === 'initialized') {
                            _this.unsentMessages.forEach(function (m) { return _this.postMessage(m); });
                            _this.unsentMessages = [];
                            _this.extensionHostProcessReady = true;
                            c(_this.extensionHostProcessHandle);
                        }
                        else if (msg && msg.type === '__$console') {
                            var logEntry = msg;
                            var args = [];
                            try {
                                var parsed_1 = JSON.parse(logEntry.arguments);
                                args.push.apply(args, Object.getOwnPropertyNames(parsed_1).map(function (o) { return parsed_1[o]; }));
                            }
                            catch (error) {
                                args.push(logEntry.arguments);
                            }
                            // If the first argument is a string, check for % which indicates that the message
                            // uses substitution for variables. In this case, we cannot just inject our colored
                            // [Extension Host] to the front because it breaks substitution.
                            var consoleArgs = [];
                            if (typeof args[0] === 'string' && args[0].indexOf('%') >= 0) {
                                consoleArgs = [("%c[Extension Host]%c " + args[0]), 'color: blue', 'color: black'].concat(args.slice(1));
                            }
                            else {
                                consoleArgs = ['%c[Extension Host]', 'color: blue'].concat(args);
                            }
                            // Send to local console unless we run tests from cli
                            if (!_this.isExtensionDevelopmentTestFromCli) {
                                console[logEntry.severity].apply(console, consoleArgs);
                            }
                            // Log on main side if running tests from cli
                            if (_this.isExtensionDevelopmentTestFromCli) {
                                electron_1.ipcRenderer.send('vscode:log', logEntry);
                            }
                            else if (!config.env.isBuilt || _this.isExtensionDevelopmentHost) {
                                _this.windowService.broadcast({
                                    channel: exports.EXTENSION_LOG_BROADCAST_CHANNEL,
                                    payload: logEntry
                                }, config.env.extensionDevelopmentPath /* target */);
                            }
                        }
                        else {
                            onExtensionHostMessage(msg);
                        }
                    });
                    // Lifecycle
                    var onExit = function () { return _this.terminate(); };
                    process.once('exit', onExit);
                    _this.extensionHostProcessHandle.on('error', function (err) {
                        var errorMessage = errors_1.toErrorMessage(err);
                        if (errorMessage === _this.lastExtensionHostError) {
                            return; // prevent error spam
                        }
                        _this.lastExtensionHostError = errorMessage;
                        _this.messageService.show(message_1.Severity.Error, nls.localize(2, null, errorMessage));
                    });
                    _this.extensionHostProcessHandle.on('exit', function (code, signal) {
                        process.removeListener('exit', onExit);
                        if (!_this.terminating) {
                            // Unexpected termination
                            if (!_this.isExtensionDevelopmentHost) {
                                _this.messageService.show(message_1.Severity.Error, {
                                    message: nls.localize(3, null),
                                    actions: [new actions_1.Action('reloadWindow', nls.localize(4, null), null, true, function () { _this.windowService.getWindow().reload(); return winjs_base_1.TPromise.as(null); })]
                                });
                                console.error('Extension host terminated unexpectedly. Code: ', code, ' Signal: ', signal);
                            }
                            else if (!_this.isExtensionDevelopmentTestFromCli) {
                                _this.windowService.getWindow().close();
                            }
                            else {
                                electron_1.ipcRenderer.send('vscode:exit', code);
                            }
                        }
                    });
                });
            }, function () { return _this.terminate(); });
        };
        ExtensionHostProcessManager.prototype.resolveDebugPort = function (config, clb) {
            var _this = this;
            // Check for a free debugging port
            if (typeof config.env.debugExtensionHostPort === 'number') {
                return ports_1.findFreePort(config.env.debugExtensionHostPort, 10 /* try 10 ports */, function (port) {
                    if (!port) {
                        console.warn('%c[Extension Host] %cCould not find a free port for debugging', 'color: blue', 'color: black');
                        return clb(void 0);
                    }
                    if (port !== config.env.debugExtensionHostPort) {
                        console.warn('%c[Extension Host] %cProvided debugging port ' + config.env.debugExtensionHostPort + ' is not free, using ' + port + ' instead.', 'color: blue', 'color: black');
                    }
                    if (_this.isExtensionDevelopmentDebugging) {
                        console.warn('%c[Extension Host] %cSTOPPED on first line for debugging on port ' + port, 'color: blue', 'color: black');
                    }
                    else {
                        console.info('%c[Extension Host] %cdebugger listening on port ' + port, 'color: blue', 'color: black');
                    }
                    return clb(port);
                });
            }
            else {
                return clb(void 0);
            }
        };
        ExtensionHostProcessManager.prototype.postMessage = function (msg) {
            if (this.extensionHostProcessReady) {
                this.extensionHostProcessHandle.send(msg);
            }
            else if (this.initializeExtensionHostProcess) {
                this.initializeExtensionHostProcess.done(function (p) { return p.send(msg); });
            }
            else {
                this.unsentMessages.push(msg);
            }
        };
        ExtensionHostProcessManager.prototype.terminate = function () {
            this.terminating = true;
            if (this.extensionHostProcessHandle) {
                this.extensionHostProcessHandle.send({
                    type: '__$terminate'
                });
            }
        };
        ExtensionHostProcessManager.prototype.beforeShutdown = function () {
            // If the extension development host was started without debugger attached we need
            // to communicate this back to the main side to terminate the debug session
            if (this.isExtensionDevelopmentHost && !this.isExtensionDevelopmentTestFromCli && !this.isExtensionDevelopmentDebugging) {
                this.windowService.broadcast({
                    channel: exports.EXTENSION_TERMINATE_BROADCAST_CHANNEL,
                    payload: true
                }, this.contextService.getConfiguration().env.extensionDevelopmentPath /* target */);
                return winjs_base_1.TPromise.timeout(100 /* wait a bit for IPC to get delivered */).then(function () { return false; });
            }
            return false;
        };
        return ExtensionHostProcessManager;
    }());
});
//# sourceMappingURL=threadService.js.map