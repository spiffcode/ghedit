define(["require", "exports", 'vs/base/common/winjs.base', 'vs/platform/thread/common/thread', 'vs/platform/thread/common/threadService', 'vs/platform/instantiation/common/descriptors'], function (require, exports, winjs_base_1, thread_1, threadService_1, descriptors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var AbstractThreadService = (function () {
        function AbstractThreadService(isInMainThread) {
            this.isInMainThread = isInMainThread;
            this._boundObjects = {};
            this._pendingObjects = [];
            this._localObjMap = Object.create(null);
            this._proxyObjMap = Object.create(null);
        }
        AbstractThreadService.prototype.setInstantiationService = function (service) {
            this._instantiationService = service;
        };
        AbstractThreadService.prototype.createInstance = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            return this._doCreateInstance(params);
        };
        AbstractThreadService.prototype._doCreateInstance = function (params) {
            var _this = this;
            var instanceOrPromise = this._instantiationService.createInstance.apply(this._instantiationService, params);
            if (winjs_base_1.TPromise.is(instanceOrPromise)) {
                var objInstantiated_1;
                objInstantiated_1 = instanceOrPromise.then(function (instance) {
                    if (instance.asyncCtor) {
                        var initPromise = instance.asyncCtor();
                        if (winjs_base_1.TPromise.is(initPromise)) {
                            return initPromise.then(function () {
                                return instance;
                            });
                        }
                    }
                    return instance;
                });
                this._pendingObjects.push(objInstantiated_1);
                return objInstantiated_1.then(function (instance) {
                    var r = _this._finishInstance(instance);
                    for (var i = 0; i < _this._pendingObjects.length; i++) {
                        if (_this._pendingObjects[i] === objInstantiated_1) {
                            _this._pendingObjects.splice(i, 1);
                            break;
                        }
                    }
                    return r;
                });
            }
            return this._finishInstance(instanceOrPromise);
        };
        AbstractThreadService.prototype._finishInstance = function (instance) {
            instance[threadService_1.THREAD_SERVICE_PROPERTY_NAME] = this;
            this._boundObjects[instance.getId()] = instance;
            if (instance.creationDone) {
                instance.creationDone();
            }
            return instance;
        };
        AbstractThreadService.prototype.handle = function (rpcId, methodName, args) {
            if (!this._localObjMap[rpcId]) {
                throw new Error('Unknown actor ' + rpcId);
            }
            var actor = this._localObjMap[rpcId];
            var method = actor[methodName];
            if (typeof method !== 'function') {
                throw new Error('Unknown method ' + methodName + ' on actor ' + rpcId);
            }
            return method.apply(actor, args);
        };
        AbstractThreadService.prototype._getOrCreateProxyInstance = function (remoteCom, id, descriptor) {
            if (this._proxyObjMap[id]) {
                return this._proxyObjMap[id];
            }
            var result = createProxyFromCtor(remoteCom, id, descriptor.ctor);
            this._proxyObjMap[id] = result;
            return result;
        };
        AbstractThreadService.prototype._registerLocalInstance = function (id, obj) {
            this._localObjMap[id] = obj;
        };
        AbstractThreadService.prototype._getOrCreateLocalInstance = function (id, descriptor) {
            if (this._localObjMap[id]) {
                return this._localObjMap[id];
            }
            var result = this._instantiationService.createInstance(descriptor);
            this._registerLocalInstance(id, result);
            return result;
        };
        AbstractThreadService.prototype.getRemotable = function (ctor) {
            var id = thread_1.Remotable.getId(ctor);
            if (!id) {
                throw new Error('Unknown Remotable: <<' + id + '>>');
            }
            var desc = descriptors_1.createSyncDescriptor(ctor);
            if (thread_1.Remotable.Registry.MainContext[id]) {
                return this._registerAndInstantiateMainProcessActor(id, desc);
            }
            if (thread_1.Remotable.Registry.ExtHostContext[id]) {
                return this._registerAndInstantiateExtHostActor(id, desc);
            }
            if (thread_1.Remotable.Registry.WorkerContext[id]) {
                return this._registerAndInstantiateWorkerActor(id, desc, thread_1.Remotable.Registry.WorkerContext[id].affinity);
            }
            throw new Error('Unknown Remotable: <<' + id + '>>');
        };
        AbstractThreadService.prototype.registerRemotableInstance = function (ctor, instance) {
            var id = thread_1.Remotable.getId(ctor);
            if (!id) {
                throw new Error('Unknown Remotable: <<' + id + '>>');
            }
            if (thread_1.Remotable.Registry.MainContext[id]) {
                return this._registerMainProcessActor(id, instance);
            }
            if (thread_1.Remotable.Registry.ExtHostContext[id]) {
                return this._registerExtHostActor(id, instance);
            }
            if (thread_1.Remotable.Registry.WorkerContext[id]) {
                return this._registerWorkerActor(id, instance);
            }
            throw new Error('Unknown Remotable: <<' + id + '>>');
        };
        return AbstractThreadService;
    }());
    exports.AbstractThreadService = AbstractThreadService;
    function createProxyFromCtor(remote, id, ctor) {
        var result = {
            $__IS_REMOTE_OBJ: true
        };
        for (var prop in ctor.prototype) {
            if (typeof ctor.prototype[prop] === 'function') {
                result[prop] = createMethodProxy(remote, id, prop);
            }
        }
        return result;
    }
    function createMethodProxy(remote, proxyId, path) {
        return function () {
            var myArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                myArgs[_i - 0] = arguments[_i];
            }
            return remote.callOnRemote(proxyId, path, myArgs);
        };
    }
});
//# sourceMappingURL=abstractThreadService.js.map