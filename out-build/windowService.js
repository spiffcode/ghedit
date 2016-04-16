/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/instantiation/common/instantiation', 'vs/base/common/event'], function (require, exports, instantiation_1, event_1) {
    'use strict';
    //import {ipcRenderer as ipc, remote} from 'electron';
    // TODO: const windowId = remote.getCurrentWindow().id;
    var windowId = 666;
    exports.IWindowService = instantiation_1.createDecorator('windowService');
    var BogusWindow = (function () {
        function BogusWindow() {
        }
        BogusWindow.prototype.showSaveDialog = function (options, callback) {
            /* TODO:
            if (callback) {
                return dialog.showSaveDialog(this.win, options, callback);
            }
    
            return dialog.showSaveDialog(this.win, options); // https://github.com/atom/electron/issues/4936
            */
            return 'unimplemented';
        };
        BogusWindow.prototype.showMessageBox = function (options) {
            // TODO:		return dialog.showMessageBox(this.win, options);
            return 0;
        };
        return BogusWindow;
    }());
    exports.BogusWindow = BogusWindow;
    var WindowService = (function () {
        function WindowService() {
            this.serviceId = exports.IWindowService;
            this._onBroadcast = new event_1.Emitter();
            this.windowId = windowId;
            this.registerListeners();
        }
        WindowService.prototype.registerListeners = function () {
            /* TODO:
            ipc.on('vscode:broadcast', (event, b: IBroadcast) => {
                this._onBroadcast.fire(b);
            });
            */
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
            /* TODO:
            ipc.send('vscode:broadcast', this.getWindowId(), target, {
                channel: b.channel,
                payload: b.payload
            });
            */
        };
        return WindowService;
    }());
    exports.WindowService = WindowService;
});
//# sourceMappingURL=windowService.js.map