/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/node/rawDebugSession', 'child_process', 'fs', 'net', 'vs/base/common/platform', 'vs/base/common/actions', 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/base/common/severity', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/node/v8Protocol', 'vs/base/node/stdFork', 'vs/platform/message/common/message', 'electron'], function (require, exports, nls, cp, fs, net, platform, actions_1, errors, winjs_base_1, severity_1, debug, v8, stdfork, message_1, electron_1) {
    "use strict";
    var RawDebugSession = (function (_super) {
        __extends(RawDebugSession, _super);
        function RawDebugSession(messageService, telemetryService, debugServerPort, adapter, telemtryAdapter) {
            _super.call(this);
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.debugServerPort = debugServerPort;
            this.adapter = adapter;
            this.telemtryAdapter = telemtryAdapter;
            this.socket = null;
            this.capabilities = {};
            this.sentPromises = [];
        }
        RawDebugSession.prototype.initServer = function () {
            var _this = this;
            if (this.cachedInitServer) {
                return this.cachedInitServer;
            }
            var serverPromise = this.debugServerPort ? this.connectServer(this.debugServerPort) : this.startServer();
            this.cachedInitServer = serverPromise.then(function () {
                _this.startTime = new Date().getTime();
            }, function (err) {
                _this.cachedInitServer = null;
                return winjs_base_1.TPromise.wrapError(err);
            });
            return this.cachedInitServer;
        };
        RawDebugSession.prototype.send = function (command, args) {
            var _this = this;
            return this.initServer().then(function () {
                var promise = _super.prototype.send.call(_this, command, args).then(function (response) { return response; }, function (errorResponse) {
                    var error = errorResponse.body ? errorResponse.body.error : null;
                    var message = error ? debug.formatPII(error.format, false, error.variables) : errorResponse.message;
                    if (error && error.sendTelemetry) {
                        _this.telemetryService.publicLog('debugProtocolErrorResponse', { error: message });
                        _this.telemtryAdapter.log('debugProtocolErrorResponse', { error: message });
                    }
                    if (error && error.url) {
                        var label = error.urlLabel ? error.urlLabel : nls.localize(0, null);
                        return winjs_base_1.TPromise.wrapError(errors.create(message, { actions: [message_1.CloseAction, new actions_1.Action('debug.moreInfo', label, null, true, function () {
                                    electron_1.shell.openExternal(error.url);
                                    return winjs_base_1.TPromise.as(null);
                                })] }));
                    }
                    return winjs_base_1.TPromise.wrapError(new Error(message));
                });
                _this.sentPromises.push(promise);
                return promise;
            });
        };
        RawDebugSession.prototype.initialize = function (args) {
            var _this = this;
            return this.send('initialize', args).then(function (response) {
                _this.capabilities = response.body || _this.capabilities;
                return response;
            });
        };
        RawDebugSession.prototype.launch = function (args) {
            this.isAttach = false;
            return this.sendAndLazyEmit('launch', args);
        };
        RawDebugSession.prototype.attach = function (args) {
            this.isAttach = true;
            return this.sendAndLazyEmit('attach', args);
        };
        RawDebugSession.prototype.next = function (args) {
            return this.sendAndLazyEmit('next', args);
        };
        RawDebugSession.prototype.stepIn = function (args) {
            return this.sendAndLazyEmit('stepIn', args);
        };
        RawDebugSession.prototype.stepOut = function (args) {
            return this.sendAndLazyEmit('stepOut', args);
        };
        RawDebugSession.prototype.continue = function (args) {
            return this.sendAndLazyEmit('continue', args);
        };
        // node sometimes sends "stopped" events earlier than the response for the "step" request.
        // due to this we only emit "continued" if we did not miss a stopped event.
        // we do not emit straight away to reduce viewlet flickering.
        RawDebugSession.prototype.sendAndLazyEmit = function (command, args, eventType) {
            var _this = this;
            if (eventType === void 0) { eventType = debug.SessionEvents.CONTINUED; }
            var count = this.flowEventsCount;
            return this.send(command, args).then(function (response) {
                setTimeout(function () {
                    if (_this.flowEventsCount === count) {
                        _this.emit(eventType);
                    }
                }, 500);
                return response;
            });
        };
        RawDebugSession.prototype.pause = function (args) {
            return this.send('pause', args);
        };
        RawDebugSession.prototype.disconnect = function (restart, force) {
            var _this = this;
            if (restart === void 0) { restart = false; }
            if (force === void 0) { force = false; }
            if (this.stopServerPending && force) {
                return this.stopServer();
            }
            // Cancel all sent promises on disconnect so debug trees are not left in a broken state #3666.
            // Give a 1s timeout to give a chance for some promises to complete.
            setTimeout(function () {
                _this.sentPromises.forEach(function (p) { return p.cancel(); });
                _this.sentPromises = [];
            }, 1000);
            if ((this.serverProcess || this.socket) && !this.stopServerPending) {
                // point of no return: from now on don't report any errors
                this.stopServerPending = true;
                this.restarted = restart;
                return this.send('disconnect', { restart: restart }).then(function () { return _this.stopServer(); }, function () { return _this.stopServer(); });
            }
            return winjs_base_1.TPromise.as(null);
        };
        RawDebugSession.prototype.setBreakpoints = function (args) {
            return this.send('setBreakpoints', args);
        };
        RawDebugSession.prototype.setFunctionBreakpoints = function (args) {
            return this.send('setFunctionBreakpoints', args);
        };
        RawDebugSession.prototype.setExceptionBreakpoints = function (args) {
            return this.send('setExceptionBreakpoints', args);
        };
        RawDebugSession.prototype.configurationDone = function () {
            return this.send('configurationDone', null);
        };
        RawDebugSession.prototype.stackTrace = function (args) {
            return this.send('stackTrace', args);
        };
        RawDebugSession.prototype.scopes = function (args) {
            return this.send('scopes', args);
        };
        RawDebugSession.prototype.variables = function (args) {
            return this.send('variables', args);
        };
        RawDebugSession.prototype.source = function (args) {
            return this.send('source', args);
        };
        RawDebugSession.prototype.threads = function () {
            return this.send('threads', null);
        };
        RawDebugSession.prototype.evaluate = function (args) {
            return this.send('evaluate', args);
        };
        RawDebugSession.prototype.getLengthInSeconds = function () {
            return (new Date().getTime() - this.startTime) / 1000;
        };
        RawDebugSession.prototype.getType = function () {
            return this.adapter.type;
        };
        RawDebugSession.prototype.connectServer = function (port) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                _this.socket = net.createConnection(port, '127.0.0.1', function () {
                    _this.connect(_this.socket, _this.socket);
                    c(null);
                });
                _this.socket.on('error', function (err) {
                    e(err);
                });
                _this.socket.on('close', function () { return _this.onServerExit(); });
            });
        };
        RawDebugSession.prototype.startServer = function () {
            var _this = this;
            if (!this.adapter.program) {
                return winjs_base_1.TPromise.wrapError(new Error(nls.localize(1, null, this.adapter.type)));
            }
            return this.getLaunchDetails().then(function (d) { return _this.launchServer(d).then(function () {
                _this.serverProcess.on('error', function (err) { return _this.onServerError(err); });
                _this.serverProcess.on('exit', function (code, signal) { return _this.onServerExit(); });
                var sanitize = function (s) { return s.toString().replace(/\r?\n$/mg, ''); };
                // this.serverProcess.stdout.on('data', (data: string) => {
                // 	console.log('%c' + sanitize(data), 'background: #ddd; font-style: italic;');
                // });
                _this.serverProcess.stderr.on('data', function (data) {
                    console.log(sanitize(data));
                });
                _this.connect(_this.serverProcess.stdout, _this.serverProcess.stdin);
            }); });
        };
        RawDebugSession.prototype.launchServer = function (launch) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                if (launch.command === 'node') {
                    stdfork.fork(launch.argv[0], launch.argv.slice(1), {}, function (err, child) {
                        if (err) {
                            e(new Error(nls.localize(2, null, launch.argv[0])));
                        }
                        _this.serverProcess = child;
                        c(null);
                    });
                }
                else {
                    _this.serverProcess = cp.spawn(launch.command, launch.argv, {
                        stdio: [
                            'pipe',
                            'pipe',
                            'pipe' // stderr
                        ],
                    });
                    c(null);
                }
            });
        };
        RawDebugSession.prototype.stopServer = function () {
            var _this = this;
            if (this.socket !== null) {
                this.socket.end();
                this.cachedInitServer = null;
                this.emit(debug.SessionEvents.SERVER_EXIT);
            }
            if (!this.serverProcess) {
                return winjs_base_1.TPromise.as(null);
            }
            this.stopServerPending = true;
            var ret;
            // when killing a process in windows its child
            // processes are *not* killed but become root
            // processes. Therefore we use TASKKILL.EXE
            if (platform.isWindows) {
                ret = new winjs_base_1.TPromise(function (c, e) {
                    var killer = cp.exec("taskkill /F /T /PID " + _this.serverProcess.pid, function (err, stdout, stderr) {
                        if (err) {
                            return e(err);
                        }
                    });
                    killer.on('exit', c);
                    killer.on('error', e);
                });
            }
            else {
                this.serverProcess.kill('SIGTERM');
                ret = winjs_base_1.TPromise.as(null);
            }
            return ret;
        };
        RawDebugSession.prototype.getLaunchDetails = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                fs.exists(_this.adapter.program, function (exists) {
                    if (exists) {
                        c(null);
                    }
                    else {
                        e(new Error(nls.localize(3, null, _this.adapter.program)));
                    }
                });
            }).then(function () {
                if (_this.adapter.runtime) {
                    return {
                        command: _this.adapter.runtime,
                        argv: (_this.adapter.runtimeArgs || []).concat([_this.adapter.program]).concat(_this.adapter.args || [])
                    };
                }
                return {
                    command: _this.adapter.program,
                    argv: _this.adapter.args || []
                };
            });
        };
        RawDebugSession.prototype.onServerError = function (err) {
            this.messageService.show(severity_1.default.Error, nls.localize(4, null, err.message));
            this.stopServer().done(null, errors.onUnexpectedError);
        };
        RawDebugSession.prototype.onServerExit = function () {
            this.serverProcess = null;
            this.cachedInitServer = null;
            if (!this.stopServerPending) {
                this.messageService.show(severity_1.default.Error, nls.localize(5, null));
            }
            this.emit(debug.SessionEvents.SERVER_EXIT);
        };
        RawDebugSession.prototype.dispose = function () {
            this.disconnect().done(null, errors.onUnexpectedError);
        };
        return RawDebugSession;
    }(v8.V8Protocol));
    exports.RawDebugSession = RawDebugSession;
});
//# sourceMappingURL=rawDebugSession.js.map