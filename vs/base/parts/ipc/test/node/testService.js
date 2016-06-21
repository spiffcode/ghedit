define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/parts/ipc/common/ipc', 'vs/base/common/event'], function (require, exports, winjs_base_1, ipc_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var TestService = (function () {
        function TestService() {
            this._onMarco = new event_1.Emitter();
            this.onMarco = this._onMarco.event;
        }
        TestService.prototype.marco = function () {
            this._onMarco.fire({ answer: 'polo' });
            return winjs_base_1.TPromise.as('polo');
        };
        TestService.prototype.pong = function (ping) {
            return winjs_base_1.TPromise.as({ incoming: ping, outgoing: 'pong' });
        };
        TestService.prototype.cancelMe = function () {
            return winjs_base_1.TPromise.timeout(100).then(function () { return true; });
        };
        return TestService;
    }());
    exports.TestService = TestService;
    var TestChannel = (function () {
        function TestChannel(testService) {
            this.testService = testService;
        }
        TestChannel.prototype.call = function (command) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            switch (command) {
                case 'pong': return this.testService.pong(args[0]);
                case 'cancelMe': return this.testService.cancelMe();
                case 'marco': return this.testService.marco();
                case 'event:marco': return ipc_1.eventToCall(this.testService.onMarco);
                default: return winjs_base_1.TPromise.wrapError(new Error('command not found'));
            }
        };
        return TestChannel;
    }());
    exports.TestChannel = TestChannel;
    var TestServiceClient = (function () {
        function TestServiceClient(channel) {
            this.channel = channel;
            this._onMarco = ipc_1.eventFromCall(channel, 'event:marco');
        }
        Object.defineProperty(TestServiceClient.prototype, "onMarco", {
            get: function () { return this._onMarco; },
            enumerable: true,
            configurable: true
        });
        ;
        TestServiceClient.prototype.marco = function () {
            return this.channel.call('marco');
        };
        TestServiceClient.prototype.pong = function (ping) {
            return this.channel.call('pong', ping);
        };
        TestServiceClient.prototype.cancelMe = function () {
            return this.channel.call('cancelMe');
        };
        return TestServiceClient;
    }());
    exports.TestServiceClient = TestServiceClient;
});
//# sourceMappingURL=testService.js.map