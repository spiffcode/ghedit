define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var DispatcherEvent = (function () {
        function DispatcherEvent(source, data) {
            this.source = source;
            this.data = data;
        }
        DispatcherEvent.prototype.getSource = function () {
            return this.source;
        };
        DispatcherEvent.prototype.getData = function () {
            return this.data;
        };
        return DispatcherEvent;
    }());
    exports.DispatcherEvent = DispatcherEvent;
    var HandlerDispatcher = (function () {
        function HandlerDispatcher() {
            this.registry = {};
        }
        HandlerDispatcher.prototype.setHandler = function (handlerId, handlerCallback) {
            this.registry[handlerId] = handlerCallback;
        };
        HandlerDispatcher.prototype.clearHandlers = function () {
            this.registry = {};
        };
        HandlerDispatcher.prototype.getHandler = function (handlerId) {
            return this.registry.hasOwnProperty(handlerId) ? this.registry[handlerId] : null;
        };
        HandlerDispatcher.prototype.trigger = function (source, handlerId, payload) {
            var handler = this.getHandler(handlerId);
            var handled = false;
            if (handler) {
                var e = new DispatcherEvent(source, payload);
                handled = handler(e);
            }
            return handled;
        };
        return HandlerDispatcher;
    }());
    exports.HandlerDispatcher = HandlerDispatcher;
});
//# sourceMappingURL=handlerDispatcher.js.map