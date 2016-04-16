/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/instantiation/common/instantiation', 'vs/base/common/event', 'electron'], function (require, exports, instantiation_1, event_1, electron_1) {
    'use strict';
    var windowId = electron_1.remote.getCurrentWindow().id;
    exports.IWindowService = instantiation_1.createDecorator('windowService');
    var WindowService = (function () {
        function WindowService() {
            this.serviceId = exports.IWindowService;
            this._onBroadcast = new event_1.Emitter();
            this.windowId = windowId;
            this.registerListeners();
        }
        WindowService.prototype.registerListeners = function () {
            var _this = this;
            electron_1.ipcRenderer.on('vscode:broadcast', function (event, b) {
                _this._onBroadcast.fire(b);
            });
        };
        Object.defineProperty(WindowService.prototype, "onBroadcast", {
            get: function () {
                return this._onBroadcast.event;
            },
            enumerable: true,
            configurable: true
        });
        WindowService.prototype.getWindowId = function () {
            return this.windowId;
        };
        WindowService.prototype.getWindow = function () {
            return this.win;
        };
        WindowService.prototype.registerWindow = function (win) {
            this.win = win;
        };
        WindowService.prototype.broadcast = function (b, target) {
            electron_1.ipcRenderer.send('vscode:broadcast', this.getWindowId(), target, {
                channel: b.channel,
                payload: b.payload
            });
        };
        return WindowService;
    }());
    exports.WindowService = WindowService;
});
//# sourceMappingURL=windowService.js.map