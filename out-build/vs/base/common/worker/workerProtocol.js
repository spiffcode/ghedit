define(["require", "exports", 'vs/base/common/winjs.base'], function (require, exports, winjs_base_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.MessageType = {
        INITIALIZE: '$initialize',
        REPLY: '$reply',
        PRINT: '$print'
    };
    exports.ReplyType = {
        COMPLETE: 'complete',
        ERROR: 'error',
        PROGRESS: 'progress'
    };
    exports.PrintType = {
        LOG: 'log',
        DEBUG: 'debug',
        INFO: 'info',
        WARN: 'warn',
        ERROR: 'error'
    };
    var RemoteCom = (function () {
        function RemoteCom(requester) {
            this._requester = requester;
            this._bigHandler = null;
        }
        RemoteCom.prototype.callOnRemote = function (proxyId, path, args) {
            return this._requester.request('_proxyObj', {
                proxyId: proxyId,
                path: path,
                args: args
            });
        };
        RemoteCom.prototype.setManyHandler = function (handler) {
            this._bigHandler = handler;
        };
        RemoteCom.prototype.handleMessage = function (msg) {
            if (!this._bigHandler) {
                throw new Error('got message before big handler attached!');
            }
            return this._invokeHandler(msg.proxyId, msg.path, msg.args);
        };
        RemoteCom.prototype._invokeHandler = function (rpcId, method, args) {
            try {
                return winjs_base_1.TPromise.as(this._bigHandler.handle(rpcId, method, args));
            }
            catch (err) {
                return winjs_base_1.TPromise.wrapError(err);
            }
        };
        return RemoteCom;
    }());
    exports.RemoteCom = RemoteCom;
});
