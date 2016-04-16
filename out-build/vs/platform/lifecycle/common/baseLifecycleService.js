define(["require", "exports", 'vs/base/common/event', './lifecycle'], function (require, exports, event_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var BaseLifecycleService = (function () {
        function BaseLifecycleService() {
            this.serviceId = lifecycle_1.ILifecycleService;
            this._beforeShutdownParticipants = [];
            this._onShutdown = new event_1.Emitter();
        }
        BaseLifecycleService.prototype.fireShutdown = function () {
            this._onShutdown.fire();
        };
        BaseLifecycleService.prototype.addBeforeShutdownParticipant = function (p) {
            this._beforeShutdownParticipants.push(p);
        };
        Object.defineProperty(BaseLifecycleService.prototype, "beforeShutdownParticipants", {
            get: function () {
                return this._beforeShutdownParticipants;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseLifecycleService.prototype, "onShutdown", {
            get: function () {
                return this._onShutdown.event;
            },
            enumerable: true,
            configurable: true
        });
        return BaseLifecycleService;
    }());
    exports.BaseLifecycleService = BaseLifecycleService;
});
//# sourceMappingURL=baseLifecycleService.js.map