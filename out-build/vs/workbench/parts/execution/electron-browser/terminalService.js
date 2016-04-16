var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/workbench/parts/execution/common/execution', 'vs/platform/configuration/common/configuration', 'vs/platform/message/common/message', 'child_process', 'vs/base/node/processes'], function (require, exports, errors, uri_1, winjs_base_1, execution_1, configuration_1, message_1, cp, processes) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WinTerminalService = (function () {
        function WinTerminalService(_configurationService, _messageService) {
            this._configurationService = _configurationService;
            this._messageService = _messageService;
            this.serviceId = execution_1.ITerminalService;
        }
        WinTerminalService.prototype.openTerminal = function (path) {
            cp.spawn(processes.getWindowsShell(), ['/c', 'start', '/wait'], { cwd: path });
        };
        WinTerminalService = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, message_1.IMessageService)
        ], WinTerminalService);
        return WinTerminalService;
    }());
    exports.WinTerminalService = WinTerminalService;
    var MacTerminalService = (function () {
        function MacTerminalService() {
            this.serviceId = execution_1.ITerminalService;
        }
        MacTerminalService.prototype.openTerminal = function (path) {
            this.getTerminalHelperScriptPath().done(function (helperPath) {
                cp.spawn('/usr/bin/osascript', [helperPath, path]);
            }, errors.onUnexpectedError);
        };
        MacTerminalService.prototype.getTerminalHelperScriptPath = function () {
            if (this._terminalApplicationScriptPath) {
                return this._terminalApplicationScriptPath;
            }
            return this._terminalApplicationScriptPath = new winjs_base_1.TPromise(function (c, e) {
                var version = '';
                var child = cp.spawn('/usr/bin/osascript', ['-e', 'version of application "iTerm"']);
                child.on('error', e);
                child.stdout.on('data', function (data) {
                    version += data.toString();
                });
                child.on('exit', function (code) {
                    var script = 'terminal.scpt';
                    if (code === 0) {
                        var match = /(\d+).(\d+).(\d+)/.exec(version);
                        if (match.length >= 4) {
                            var major = +match[1];
                            var minor = +match[2];
                            var veryMinor = +match[3];
                            if ((major < 2) || (major === 2 && minor < 9) || (major === 2 && minor === 9 && veryMinor < 20150414)) {
                                script = 'iterm.scpt';
                            }
                            else {
                                script = 'itermNew.scpt'; // versions >= 2.9.20150414 use new script syntax
                            }
                        }
                    }
                    c(script);
                });
            }).then(function (name) { return uri_1.default.parse(require.toUrl("vs/workbench/parts/execution/electron-browser/" + name)).fsPath; });
        };
        return MacTerminalService;
    }());
    exports.MacTerminalService = MacTerminalService;
    var LinuxTerminalService = (function () {
        function LinuxTerminalService() {
            this.serviceId = execution_1.ITerminalService;
        }
        LinuxTerminalService.prototype.openTerminal = function (path) {
            cp.spawn('x-terminal-emulator', [], { cwd: path });
        };
        return LinuxTerminalService;
    }());
    exports.LinuxTerminalService = LinuxTerminalService;
});
//# sourceMappingURL=terminalService.js.map