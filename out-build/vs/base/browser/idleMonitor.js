var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/async', 'vs/base/common/eventEmitter', 'vs/base/common/lifecycle', 'vs/base/browser/browserService', 'vs/base/browser/dom'], function (require, exports, async_1, eventEmitter_1, lifecycle_1, browserService_1, dom) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (UserStatus) {
        UserStatus[UserStatus["Idle"] = 0] = "Idle";
        UserStatus[UserStatus["Active"] = 1] = "Active";
    })(exports.UserStatus || (exports.UserStatus = {}));
    var UserStatus = exports.UserStatus;
    exports.DEFAULT_IDLE_TIME = 60 * 60 * 1000; // 60 minutes
    var IdleMonitor = (function (_super) {
        __extends(IdleMonitor, _super);
        function IdleMonitor(idleTime) {
            var _this = this;
            if (idleTime === void 0) { idleTime = exports.DEFAULT_IDLE_TIME; }
            _super.call(this);
            this._status = null;
            this._idleCheckTimeout = this._register(new async_1.TimeoutTimer());
            this._lastActiveTime = -1;
            this._idleTime = idleTime;
            this._eventEmitter = this._register(new eventEmitter_1.EventEmitter());
            this._register(dom.addDisposableListener(browserService_1.getService().document, 'mousemove', function () { return _this._onUserActive(); }));
            this._register(dom.addDisposableListener(browserService_1.getService().document, 'keydown', function () { return _this._onUserActive(); }));
            this._onUserActive();
        }
        IdleMonitor.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        IdleMonitor.prototype.addOneTimeActiveListener = function (callback) {
            return this._eventEmitter.addOneTimeDisposableListener('onActive', callback);
        };
        IdleMonitor.prototype.addOneTimeIdleListener = function (callback) {
            return this._eventEmitter.addOneTimeDisposableListener('onIdle', callback);
        };
        IdleMonitor.prototype.getStatus = function () {
            return this._status;
        };
        IdleMonitor.prototype._onUserActive = function () {
            this._lastActiveTime = (new Date()).getTime();
            if (this._status !== UserStatus.Active) {
                this._status = UserStatus.Active;
                this._scheduleIdleCheck();
                this._eventEmitter.emit('onActive');
            }
        };
        IdleMonitor.prototype._onUserIdle = function () {
            if (this._status !== UserStatus.Idle) {
                this._status = UserStatus.Idle;
                this._eventEmitter.emit('onIdle');
            }
        };
        IdleMonitor.prototype._scheduleIdleCheck = function () {
            var _this = this;
            var minimumTimeWhenUserCanBecomeIdle = this._lastActiveTime + this._idleTime;
            this._idleCheckTimeout.setIfNotSet(function () {
                _this._checkIfUserIsIdle();
            }, minimumTimeWhenUserCanBecomeIdle - (new Date()).getTime());
        };
        IdleMonitor.prototype._checkIfUserIsIdle = function () {
            var actualIdleTime = (new Date()).getTime() - this._lastActiveTime;
            if (actualIdleTime >= this._idleTime) {
                this._onUserIdle();
            }
            else {
                this._scheduleIdleCheck();
            }
        };
        return IdleMonitor;
    }(lifecycle_1.Disposable));
    exports.IdleMonitor = IdleMonitor;
});
//# sourceMappingURL=idleMonitor.js.map