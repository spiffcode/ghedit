define(["require", "exports", 'vs/base/common/event', 'vs/platform/lifecycle/common/lifecycle'], function (require, exports, event_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var NullLifecycleService = (function () {
        function NullLifecycleService() {
            this.serviceId = lifecycle_1.ILifecycleService;
            this._onShutdown = new event_1.Emitter();
        }
        NullLifecycleService.prototype.addBeforeShutdownParticipant = function (p) {
        };
        Object.defineProperty(NullLifecycleService.prototype, "onShutdown", {
            get: function () {
                return this._onShutdown.event;
            },
            enumerable: true,
            configurable: true
        });
        NullLifecycleService.prototype.setThreadService = function (service) {
        };
        return NullLifecycleService;
    }());
    exports.Instance = new NullLifecycleService();
});
//# sourceMappingURL=nullLifecycleService.js.map