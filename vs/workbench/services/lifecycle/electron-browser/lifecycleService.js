define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/severity', 'vs/base/common/errors', 'vs/platform/lifecycle/common/lifecycle', 'electron', 'vs/base/common/event'], function (require, exports, winjs_base_1, severity_1, errors, lifecycle_1, electron_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LifecycleService = (function () {
        function LifecycleService(_messageService, windowService) {
            this._messageService = _messageService;
            this.windowService = windowService;
            this.serviceId = lifecycle_1.ILifecycleService;
            this._onWillShutdown = new event_1.Emitter();
            this._onShutdown = new event_1.Emitter();
            this._registerListeners();
        }
        Object.defineProperty(LifecycleService.prototype, "onWillShutdown", {
            get: function () {
                return this._onWillShutdown.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LifecycleService.prototype, "onShutdown", {
            get: function () {
                return this._onShutdown.event;
            },
            enumerable: true,
            configurable: true
        });
        LifecycleService.prototype._registerListeners = function () {
            var _this = this;
            var windowId = this.windowService.getWindowId();
            // Main side indicates that window is about to unload, check for vetos
            electron_1.ipcRenderer.on('vscode:beforeUnload', function (event, reply) {
                _this._onBeforeUnload().done(function (veto) {
                    if (veto) {
                        electron_1.ipcRenderer.send(reply.cancelChannel, windowId);
                    }
                    else {
                        _this._onShutdown.fire();
                        electron_1.ipcRenderer.send(reply.okChannel, windowId);
                    }
                });
            });
        };
        LifecycleService.prototype._onBeforeUnload = function () {
            var _this = this;
            var vetos = [];
            this._onWillShutdown.fire({
                veto: function (value) {
                    vetos.push(value);
                }
            });
            if (vetos.length === 0) {
                return winjs_base_1.TPromise.as(false);
            }
            var promises = [];
            var lazyValue = false;
            for (var _i = 0, vetos_1 = vetos; _i < vetos_1.length; _i++) {
                var valueOrPromise = vetos_1[_i];
                // veto, done
                if (valueOrPromise === true) {
                    return winjs_base_1.TPromise.as(true);
                }
                if (winjs_base_1.TPromise.is(valueOrPromise)) {
                    promises.push(valueOrPromise.then(function (value) {
                        if (value) {
                            // veto, done
                            lazyValue = true;
                        }
                    }, function (err) {
                        // error, treated like a veto, done
                        _this._messageService.show(severity_1.default.Error, errors.toErrorMessage(err));
                        lazyValue = true;
                    }));
                }
            }
            return winjs_base_1.TPromise.join(promises).then(function () { return lazyValue; });
        };
        return LifecycleService;
    }());
    exports.LifecycleService = LifecycleService;
});
//# sourceMappingURL=lifecycleService.js.map