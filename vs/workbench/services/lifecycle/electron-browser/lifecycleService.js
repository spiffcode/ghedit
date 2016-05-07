var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/errors', 'vs/platform/lifecycle/common/baseLifecycleService', 'vs/base/common/severity', 'electron'], function (require, exports, winjs_base_1, errors, baseLifecycleService_1, severity_1, electron_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LifecycleService = (function (_super) {
        __extends(LifecycleService, _super);
        function LifecycleService(messageService, windowService) {
            _super.call(this);
            this.messageService = messageService;
            this.windowService = windowService;
            this.registerListeners();
        }
        LifecycleService.prototype.registerListeners = function () {
            var _this = this;
            var windowId = this.windowService.getWindowId();
            // Main side indicates that window is about to unload, check for vetos
            electron_1.ipcRenderer.on('vscode:beforeUnload', function (event, reply) {
                var veto = _this.beforeUnload();
                if (typeof veto === 'boolean') {
                    electron_1.ipcRenderer.send(veto ? reply.cancelChannel : reply.okChannel, windowId);
                }
                else {
                    veto.done(function (v) { return electron_1.ipcRenderer.send(v ? reply.cancelChannel : reply.okChannel, windowId); });
                }
            });
        };
        LifecycleService.prototype.beforeUnload = function () {
            var _this = this;
            var veto = this.vetoShutdown();
            if (typeof veto === 'boolean') {
                return this.handleVeto(veto);
            }
            else {
                return veto.then(function (v) { return _this.handleVeto(v); });
            }
        };
        LifecycleService.prototype.handleVeto = function (veto) {
            if (!veto) {
                try {
                    this.fireShutdown();
                }
                catch (error) {
                    errors.onUnexpectedError(error); // unexpected program error and we cause shutdown to cancel in this case
                    return false;
                }
            }
            return veto;
        };
        LifecycleService.prototype.vetoShutdown = function () {
            var _this = this;
            var participants = this.beforeShutdownParticipants;
            var vetoPromises = [];
            var hasPromiseWithVeto = false;
            for (var i = 0; i < participants.length; i++) {
                var participantVeto = participants[i].beforeShutdown();
                if (participantVeto === true) {
                    return true; // return directly when any veto was provided
                }
                else if (participantVeto === false) {
                    continue; // skip
                }
                // We have a promise
                var vetoPromise = participantVeto.then(function (veto) {
                    if (veto) {
                        hasPromiseWithVeto = true;
                    }
                }, function (error) {
                    hasPromiseWithVeto = true;
                    _this.messageService.show(severity_1.default.Error, errors.toErrorMessage(error));
                });
                vetoPromises.push(vetoPromise);
            }
            if (vetoPromises.length === 0) {
                return false; // return directly when no veto was provided
            }
            return winjs_base_1.TPromise.join(vetoPromises).then(function () { return hasPromiseWithVeto; });
        };
        return LifecycleService;
    }(baseLifecycleService_1.BaseLifecycleService));
    exports.LifecycleService = LifecycleService;
});
//# sourceMappingURL=lifecycleService.js.map