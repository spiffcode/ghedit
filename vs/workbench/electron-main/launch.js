/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/workbench/electron-main/windows', 'vs/base/common/winjs.base', './log'], function (require, exports, windows_1, winjs_base_1, log_1) {
    'use strict';
    var LaunchChannel = (function () {
        function LaunchChannel(service) {
            this.service = service;
        }
        LaunchChannel.prototype.call = function (command) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            switch (command) {
                case 'start': return this.service.start(args[0], args[1]);
            }
        };
        return LaunchChannel;
    }());
    exports.LaunchChannel = LaunchChannel;
    var LaunchChannelClient = (function () {
        function LaunchChannelClient(channel) {
            this.channel = channel;
        }
        LaunchChannelClient.prototype.start = function (args, userEnv) {
            return this.channel.call('start', args, userEnv);
        };
        return LaunchChannelClient;
    }());
    exports.LaunchChannelClient = LaunchChannelClient;
    var LaunchService = (function () {
        function LaunchService(logService, windowsManager) {
            this.logService = logService;
            this.windowsManager = windowsManager;
        }
        LaunchService.prototype.start = function (args, userEnv) {
            var _this = this;
            this.logService.log('Received data from other instance', args);
            // Otherwise handle in windows manager
            var usedWindows;
            if (!!args.extensionDevelopmentPath) {
                this.windowsManager.openPluginDevelopmentHostWindow({ cli: args, userEnv: userEnv });
            }
            else if (args.pathArguments.length === 0 && args.openNewWindow) {
                usedWindows = this.windowsManager.open({ cli: args, userEnv: userEnv, forceNewWindow: true, forceEmpty: true });
            }
            else if (args.pathArguments.length === 0) {
                usedWindows = [this.windowsManager.focusLastActive(args)];
            }
            else {
                usedWindows = this.windowsManager.open({
                    cli: args,
                    userEnv: userEnv,
                    forceNewWindow: args.waitForWindowClose || args.openNewWindow,
                    preferNewWindow: !args.openInSameWindow,
                    diffMode: args.diffMode
                });
            }
            // If the other instance is waiting to be killed, we hook up a window listener if one window
            // is being used and only then resolve the startup promise which will kill this second instance
            if (args.waitForWindowClose && usedWindows && usedWindows.length === 1 && usedWindows[0]) {
                var windowId_1 = usedWindows[0].id;
                return new winjs_base_1.TPromise(function (c, e) {
                    var unbind = _this.windowsManager.onClose(function (id) {
                        if (id === windowId_1) {
                            unbind();
                            c(null);
                        }
                    });
                });
            }
            return winjs_base_1.TPromise.as(null);
        };
        LaunchService = __decorate([
            __param(0, log_1.ILogService),
            __param(1, windows_1.IWindowsService)
        ], LaunchService);
        return LaunchService;
    }());
    exports.LaunchService = LaunchService;
});
//# sourceMappingURL=launch.js.map