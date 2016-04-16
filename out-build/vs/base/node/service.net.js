/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'net', 'vs/base/common/event', 'vs/base/common/service', 'vs/base/common/winjs.base'], function (require, exports, net, event_1, service_1, winjs_base_1) {
    'use strict';
    function bufferIndexOf(buffer, value, start) {
        if (start === void 0) { start = 0; }
        while (start < buffer.length && buffer[start] !== value) {
            start++;
        }
        return start;
    }
    var Protocol = (function () {
        function Protocol(socket) {
            this.socket = socket;
            this.buffer = null;
        }
        Protocol.prototype.send = function (message) {
            this.socket.write(JSON.stringify(message));
            this.socket.write(Protocol.Boundary);
        };
        Protocol.prototype.onMessage = function (callback) {
            var _this = this;
            this.socket.on('data', function (data) {
                var lastIndex = 0;
                var index = 0;
                while ((index = bufferIndexOf(data, 0, lastIndex)) < data.length) {
                    var dataToParse = data.slice(lastIndex, index);
                    if (_this.buffer) {
                        callback(JSON.parse(Buffer.concat([_this.buffer, dataToParse]).toString('utf8')));
                        _this.buffer = null;
                    }
                    else {
                        callback(JSON.parse(dataToParse.toString('utf8')));
                    }
                    lastIndex = index + 1;
                }
                if (index - lastIndex > 0) {
                    var dataToBuffer = data.slice(lastIndex, index);
                    if (_this.buffer) {
                        _this.buffer = Buffer.concat([_this.buffer, dataToBuffer]);
                    }
                    else {
                        _this.buffer = dataToBuffer;
                    }
                }
            });
        };
        Protocol.Boundary = new Buffer([0]);
        return Protocol;
    }());
    var Server = (function () {
        function Server(server) {
            var _this = this;
            this.server = server;
            this.services = Object.create(null);
            this.server.on('connection', function (socket) {
                var ipcServer = new service_1.Server(new Protocol(socket));
                Object.keys(_this.services)
                    .forEach(function (name) { return ipcServer.registerService(name, _this.services[name]); });
                socket.once('close', function () { return ipcServer.dispose(); });
            });
        }
        Server.prototype.registerService = function (serviceName, service) {
            this.services[serviceName] = service;
        };
        Server.prototype.dispose = function () {
            this.services = null;
            this.server.close();
            this.server = null;
        };
        return Server;
    }());
    exports.Server = Server;
    var Client = (function () {
        function Client(socket) {
            var _this = this;
            this.socket = socket;
            this._onClose = new event_1.Emitter();
            this.ipcClient = new service_1.Client(new Protocol(socket));
            socket.once('close', function () { return _this._onClose.fire(); });
        }
        Object.defineProperty(Client.prototype, "onClose", {
            get: function () { return this._onClose.event; },
            enumerable: true,
            configurable: true
        });
        Client.prototype.getService = function (serviceName, serviceCtor) {
            return this.ipcClient.getService(serviceName, serviceCtor);
        };
        Client.prototype.dispose = function () {
            this.socket.end();
            this.socket = null;
            this.ipcClient = null;
        };
        return Client;
    }());
    exports.Client = Client;
    function serve(hook) {
        return new winjs_base_1.TPromise(function (c, e) {
            var server = net.createServer();
            server.on('error', e);
            server.listen(hook, function () {
                server.removeListener('error', e);
                c(new Server(server));
            });
        });
    }
    exports.serve = serve;
    function connect(hook) {
        return new winjs_base_1.TPromise(function (c, e) {
            var socket = net.createConnection(hook, function () {
                socket.removeListener('error', e);
                c(new Client(socket));
            });
            socket.once('error', e);
        });
    }
    exports.connect = connect;
});
//# sourceMappingURL=service.net.js.map