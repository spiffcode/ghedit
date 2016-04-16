/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/objects', 'vs/base/common/lifecycle', 'vs/base/common/event'], function (require, exports, winjs_base_1, objects_1, lifecycle_1, event_1) {
    'use strict';
    var RequestType;
    (function (RequestType) {
        RequestType[RequestType["Common"] = 0] = "Common";
        RequestType[RequestType["Cancel"] = 1] = "Cancel";
    })(RequestType || (RequestType = {}));
    var ResponseType;
    (function (ResponseType) {
        ResponseType[ResponseType["Initialize"] = 0] = "Initialize";
        ResponseType[ResponseType["Success"] = 1] = "Success";
        ResponseType[ResponseType["Progress"] = 2] = "Progress";
        ResponseType[ResponseType["Error"] = 3] = "Error";
        ResponseType[ResponseType["ErrorObj"] = 4] = "ErrorObj";
    })(ResponseType || (ResponseType = {}));
    var ServiceState;
    (function (ServiceState) {
        ServiceState[ServiceState["Uninitialized"] = 0] = "Uninitialized";
        ServiceState[ServiceState["Idle"] = 1] = "Idle";
    })(ServiceState || (ServiceState = {}));
    var ServiceEventProperty = '$__SERVICE_EVENT';
    /**
     * Use this as a property decorator.
     */
    function ServiceEvent(target, key) {
        target[key] = (_a = {}, _a[ServiceEventProperty] = true, _a);
        var _a;
    }
    exports.ServiceEvent = ServiceEvent;
    function isServiceEvent(target) {
        return target[ServiceEventProperty];
    }
    exports.isServiceEvent = isServiceEvent;
    var Server = (function () {
        function Server(protocol) {
            var _this = this;
            this.protocol = protocol;
            this.services = Object.create(null);
            this.activeRequests = Object.create(null);
            this.protocol.onMessage(function (r) { return _this.onMessage(r); });
            this.protocol.send({ type: ResponseType.Initialize });
        }
        Server.prototype.registerService = function (serviceName, service) {
            this.services[serviceName] = service;
        };
        Server.prototype.onMessage = function (request) {
            switch (request.type) {
                case RequestType.Common:
                    this.onCommonRequest(request);
                    break;
                case RequestType.Cancel:
                    this.onCancelRequest(request);
                    break;
            }
        };
        Server.prototype.onCommonRequest = function (request) {
            var service = this.services[request.serviceName];
            var servicePrototype = service.constructor.prototype;
            var prototypeMethod = servicePrototype && servicePrototype[request.name];
            var isEvent = prototypeMethod && prototypeMethod[ServiceEventProperty];
            var method = service[request.name];
            var promise;
            if (isEvent) {
                var disposable_1;
                promise = new winjs_base_1.Promise(function (c, e, p) { return disposable_1 = method.call(service, p); }, function () { return disposable_1.dispose(); });
            }
            else {
                if (!method) {
                    promise = winjs_base_1.Promise.wrapError(new Error(request.name + " is not a valid method on " + request.serviceName));
                }
                else {
                    try {
                        promise = method.call.apply(method, [service].concat(request.args));
                    }
                    catch (err) {
                        promise = winjs_base_1.Promise.wrapError(err);
                    }
                }
                if (!winjs_base_1.Promise.is(promise)) {
                    var message = "'" + request.name + "' did not return a promise";
                    console.warn(message);
                    promise = winjs_base_1.Promise.wrapError(new Error(message));
                }
            }
            this.onPromiseRequest(promise, request);
        };
        Server.prototype.onPromiseRequest = function (promise, request) {
            var _this = this;
            var id = request.id;
            var requestPromise = promise.then(function (data) {
                _this.protocol.send({ id: id, data: data, type: ResponseType.Success });
                delete _this.activeRequests[request.id];
            }, function (data) {
                if (data instanceof Error) {
                    _this.protocol.send({ id: id, data: {
                            message: data.message,
                            name: data.name,
                            stack: data.stack ? data.stack.split('\n') : void 0
                        }, type: ResponseType.Error });
                }
                else {
                    _this.protocol.send({ id: id, data: data, type: ResponseType.ErrorObj });
                }
                delete _this.activeRequests[request.id];
            }, function (data) {
                _this.protocol.send({ id: id, data: data, type: ResponseType.Progress });
            });
            this.activeRequests[request.id] = lifecycle_1.toDisposable(function () { return requestPromise.cancel(); });
        };
        Server.prototype.onCancelRequest = function (request) {
            var disposable = this.activeRequests[request.id];
            if (disposable) {
                disposable.dispose();
                delete this.activeRequests[request.id];
            }
        };
        Server.prototype.dispose = function () {
            var _this = this;
            Object.keys(this.activeRequests).forEach(function (id) {
                _this.activeRequests[id].dispose();
            });
            this.activeRequests = null;
        };
        return Server;
    }());
    exports.Server = Server;
    var Client = (function () {
        function Client(protocol) {
            var _this = this;
            this.protocol = protocol;
            this.state = ServiceState.Uninitialized;
            this.bufferedRequests = [];
            this.handlers = Object.create(null);
            this.lastRequestId = 0;
            this.protocol.onMessage(function (r) { return _this.onMessage(r); });
        }
        Client.prototype.getService = function (serviceName, serviceCtor) {
            var _this = this;
            var props = Object.keys(serviceCtor.prototype)
                .filter(function (key) { return key !== 'constructor'; });
            return props.reduce(function (service, key) {
                if (serviceCtor.prototype[key][ServiceEventProperty]) {
                    var promise_1;
                    var emitter_1 = new event_1.Emitter({
                        onFirstListenerAdd: function () {
                            promise_1 = _this.request(serviceName, key)
                                .then(null, null, function (event) { return emitter_1.fire(event); });
                        },
                        onLastListenerRemove: function () {
                            promise_1.cancel();
                            promise_1 = null;
                        }
                    });
                    return objects_1.assign(service, (_a = {}, _a[key] = emitter_1.event, _a));
                }
                return objects_1.assign(service, (_b = {}, _b[key] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    return _this.request.apply(_this, [serviceName, key].concat(args));
                }, _b));
                var _a, _b;
            }, {});
        };
        Client.prototype.request = function (serviceName, name) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var request = {
                raw: {
                    id: this.lastRequestId++,
                    type: RequestType.Common,
                    serviceName: serviceName,
                    name: name,
                    args: args
                }
            };
            if (this.state === ServiceState.Uninitialized) {
                return this.bufferRequest(request);
            }
            return this.doRequest(request);
        };
        Client.prototype.doRequest = function (request) {
            var _this = this;
            var id = request.raw.id;
            return new winjs_base_1.Promise(function (c, e, p) {
                _this.handlers[id] = function (response) {
                    switch (response.type) {
                        case ResponseType.Success:
                            delete _this.handlers[id];
                            c(response.data);
                            break;
                        case ResponseType.Error:
                            delete _this.handlers[id];
                            var error = new Error(response.data.message);
                            error.stack = response.data.stack;
                            error.name = response.data.name;
                            e(error);
                            break;
                        case ResponseType.ErrorObj:
                            delete _this.handlers[id];
                            e(response.data);
                            break;
                        case ResponseType.Progress:
                            p(response.data);
                            break;
                    }
                };
                _this.send(request.raw);
            }, function () { return _this.send({ id: id, type: RequestType.Cancel }); });
        };
        Client.prototype.bufferRequest = function (request) {
            var _this = this;
            var flushedRequest = null;
            return new winjs_base_1.Promise(function (c, e, p) {
                _this.bufferedRequests.push(request);
                request.flush = function () {
                    request.flush = null;
                    flushedRequest = _this.doRequest(request).then(c, e, p);
                };
            }, function () {
                request.flush = null;
                if (_this.state !== ServiceState.Uninitialized) {
                    if (flushedRequest) {
                        flushedRequest.cancel();
                        flushedRequest = null;
                    }
                    return;
                }
                var idx = _this.bufferedRequests.indexOf(request);
                if (idx === -1) {
                    return;
                }
                _this.bufferedRequests.splice(idx, 1);
            });
        };
        Client.prototype.onMessage = function (response) {
            if (this.state === ServiceState.Uninitialized && response.type === ResponseType.Initialize) {
                this.state = ServiceState.Idle;
                this.bufferedRequests.forEach(function (r) { return r.flush && r.flush(); });
                this.bufferedRequests = null;
                return;
            }
            var handler = this.handlers[response.id];
            if (handler) {
                handler(response);
            }
        };
        Client.prototype.send = function (raw) {
            try {
                this.protocol.send(raw);
            }
            catch (err) {
            }
        };
        return Client;
    }());
    exports.Client = Client;
    /**
     * Useful when the service itself is needed right away but the client
     * is wrapped within a promise.
     */
    function getService(clientPromise, serviceName, serviceCtor) {
        var _servicePromise;
        var servicePromise = function () {
            if (!_servicePromise) {
                _servicePromise = clientPromise.then(function (client) { return client.getService(serviceName, serviceCtor); });
            }
            return _servicePromise;
        };
        return Object.keys(serviceCtor.prototype)
            .filter(function (key) { return key !== 'constructor'; })
            .reduce(function (result, key) {
            if (isServiceEvent(serviceCtor.prototype[key])) {
                var promise_2;
                var disposable_2;
                var emitter_2 = new event_1.Emitter({
                    onFirstListenerAdd: function () {
                        promise_2 = servicePromise().then(function (service) {
                            disposable_2 = service[key](function (e) { return emitter_2.fire(e); });
                        });
                    },
                    onLastListenerRemove: function () {
                        if (disposable_2) {
                            disposable_2.dispose();
                            disposable_2 = null;
                        }
                        promise_2.cancel();
                        promise_2 = null;
                    }
                });
                return objects_1.assign(result, (_a = {}, _a[key] = emitter_2.event, _a));
            }
            return objects_1.assign(result, (_b = {},
                _b[key] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    return servicePromise().then(function (service) { return service[key].apply(service, args); });
                },
                _b
            ));
            var _a, _b;
        }, {});
    }
    exports.getService = getService;
});
//# sourceMappingURL=service.js.map