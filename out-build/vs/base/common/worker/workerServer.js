define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/marshalling', 'vs/base/common/winjs.base', 'vs/base/common/worker/workerProtocol'], function (require, exports, errors_1, marshalling_1, winjs_base_1, workerProtocol) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WorkerServer = (function () {
        function WorkerServer(postSerializedMessage) {
            this._postSerializedMessage = postSerializedMessage;
            this._workerId = 0;
            this._requestHandler = null;
            this._lastReq = 0;
            this._awaitedReplies = {};
            this._bindConsole();
            this._remoteCom = new workerProtocol.RemoteCom(this);
        }
        WorkerServer.prototype.getRemoteCom = function () {
            return this._remoteCom;
        };
        WorkerServer.prototype._bindConsole = function () {
            self.console = {
                log: this._sendPrintMessage.bind(this, workerProtocol.PrintType.LOG),
                debug: this._sendPrintMessage.bind(this, workerProtocol.PrintType.DEBUG),
                info: this._sendPrintMessage.bind(this, workerProtocol.PrintType.INFO),
                warn: this._sendPrintMessage.bind(this, workerProtocol.PrintType.WARN),
                error: this._sendPrintMessage.bind(this, workerProtocol.PrintType.ERROR)
            };
            errors_1.setUnexpectedErrorHandler(function (e) {
                self.console.error(e);
            });
        };
        WorkerServer.prototype._sendPrintMessage = function (level) {
            var objects = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                objects[_i - 1] = arguments[_i];
            }
            var transformedObjects = objects.map(function (obj) { return (obj instanceof Error) ? errors_1.transformErrorForSerialization(obj) : obj; });
            var msg = {
                monacoWorker: true,
                from: this._workerId,
                req: '0',
                type: workerProtocol.MessageType.PRINT,
                level: level,
                payload: (transformedObjects.length === 1 ? transformedObjects[0] : transformedObjects)
            };
            this._postMessage(msg);
        };
        WorkerServer.prototype._sendReply = function (msgId, action, payload) {
            var msg = {
                monacoWorker: true,
                from: this._workerId,
                req: '0',
                id: msgId,
                type: workerProtocol.MessageType.REPLY,
                action: action,
                payload: (payload instanceof Error) ? errors_1.transformErrorForSerialization(payload) : payload
            };
            this._postMessage(msg);
        };
        WorkerServer.prototype.request = function (requestName, payload) {
            if (requestName.charAt(0) === '$') {
                throw new Error('Illegal requestName: ' + requestName);
            }
            var req = String(++this._lastReq);
            var msg = {
                monacoWorker: true,
                from: this._workerId,
                req: req,
                type: requestName,
                payload: payload
            };
            var reply = {
                c: null,
                e: null,
                p: null
            };
            var r = new winjs_base_1.TPromise(function (c, e, p) {
                reply.c = c;
                reply.e = e;
                reply.p = p;
            });
            this._awaitedReplies[req] = reply;
            this._postMessage(msg);
            return r;
        };
        WorkerServer.prototype.loadModule = function (moduleId, callback, errorback) {
            require([moduleId], function () {
                var result = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    result[_i - 0] = arguments[_i];
                }
                callback(result[0]);
            }, errorback);
        };
        WorkerServer.prototype.onmessage = function (msg) {
            this._onmessage(marshalling_1.parse(msg));
        };
        WorkerServer.prototype._postMessage = function (msg) {
            this._postSerializedMessage(marshalling_1.stringify(msg));
        };
        WorkerServer.prototype._onmessage = function (msg) {
            var _this = this;
            if (msg.type === workerProtocol.MessageType.REPLY) {
                // this message is a reply to a request we've made to the main thread previously
                var typedMsg = msg;
                if (!typedMsg.seq || !this._awaitedReplies.hasOwnProperty(typedMsg.seq)) {
                    console.error('Worker received unexpected reply from main thread', msg);
                    return;
                }
                var reply = this._awaitedReplies[typedMsg.seq];
                delete this._awaitedReplies[typedMsg.seq];
                if (typedMsg.err) {
                    reply.e(typedMsg.err);
                }
                else {
                    reply.c(typedMsg.payload);
                }
                return;
            }
            var c = this._sendReply.bind(this, msg.id, workerProtocol.ReplyType.COMPLETE);
            var e = this._sendReply.bind(this, msg.id, workerProtocol.ReplyType.ERROR);
            var p = this._sendReply.bind(this, msg.id, workerProtocol.ReplyType.PROGRESS);
            switch (msg.type) {
                case workerProtocol.MessageType.INITIALIZE:
                    this._workerId = msg.payload.id;
                    var loaderConfig = msg.payload.loaderConfiguration;
                    // TODO@Alex: share this code with simpleWorker
                    if (loaderConfig) {
                        // Remove 'baseUrl', handling it is beyond scope for now
                        if (typeof loaderConfig.baseUrl !== 'undefined') {
                            delete loaderConfig['baseUrl'];
                        }
                        if (typeof loaderConfig.paths !== 'undefined') {
                            if (typeof loaderConfig.paths.vs !== 'undefined') {
                                delete loaderConfig.paths['vs'];
                            }
                        }
                        var nlsConfig_1 = loaderConfig['vs/nls'];
                        // We need to have pseudo translation
                        if (nlsConfig_1 && nlsConfig_1.pseudo) {
                            require(['vs/nls'], function (nlsPlugin) {
                                nlsPlugin.setPseudoTranslation(nlsConfig_1.pseudo);
                            });
                        }
                        // Since this is in a web worker, enable catching errors
                        loaderConfig.catchError = true;
                        self.require.config(loaderConfig);
                    }
                    var MonacoEnvironment = msg.payload.MonacoEnvironment;
                    if (MonacoEnvironment) {
                        self.MonacoEnvironment = MonacoEnvironment;
                    }
                    this.loadModule(msg.payload.moduleId, function (handlerModule) {
                        _this._requestHandler = handlerModule.value;
                        c();
                    }, e);
                    break;
                default:
                    this._handleMessage(msg, c, e, p);
                    break;
            }
        };
        WorkerServer.prototype._handleMessage = function (msg, c, e, p) {
            if (msg.type === '_proxyObj') {
                this._remoteCom.handleMessage(msg.payload).then(c, e, p);
                return;
            }
            if (!this._requestHandler) {
                e('Request handler not loaded');
                return;
            }
            if ((msg.type in this._requestHandler) && (typeof this._requestHandler[msg.type] === 'function')) {
                // var now = (new Date()).getTime();
                try {
                    this._requestHandler[msg.type].call(this._requestHandler, this, c, e, p, msg.payload);
                }
                catch (handlerError) {
                    e(errors_1.transformErrorForSerialization(handlerError));
                }
            }
            else {
                this._requestHandler.request(this, c, e, p, msg);
            }
        };
        return WorkerServer;
    }());
    exports.WorkerServer = WorkerServer;
    function create(postMessage) {
        return new WorkerServer(postMessage);
    }
    exports.create = create;
});
//# sourceMappingURL=workerServer.js.map