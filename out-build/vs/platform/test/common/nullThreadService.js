var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/platform/thread/common/abstractThreadService', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/thread/common/thread'], function (require, exports, winjs, abstractThreadService, instantiationService, thread_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var NullThreadService = (function (_super) {
        __extends(NullThreadService, _super);
        function NullThreadService() {
            _super.call(this, true);
            this.serviceId = thread_1.IThreadService;
            this.setInstantiationService(instantiationService.createInstantiationService({
                threadService: this
            }));
        }
        NullThreadService.prototype._doCreateInstance = function (params) {
            return _super.prototype._doCreateInstance.call(this, params);
        };
        NullThreadService.prototype.OneWorker = function (obj, methodName, target, params, affinity) {
            return winjs.TPromise.as(null);
        };
        NullThreadService.prototype.AllWorkers = function (obj, methodName, target, params) {
            return winjs.TPromise.as(null);
        };
        NullThreadService.prototype.addStatusListener = function (listener) {
            // Nothing to do
        };
        NullThreadService.prototype.removeStatusListener = function (listener) {
            // Nothing to do
        };
        NullThreadService.prototype._registerAndInstantiateMainProcessActor = function (id, descriptor) {
            return this._getOrCreateLocalInstance(id, descriptor);
        };
        NullThreadService.prototype._registerMainProcessActor = function (id, actor) {
            this._registerLocalInstance(id, actor);
        };
        NullThreadService.prototype._registerAndInstantiateExtHostActor = function (id, descriptor) {
            return this._getOrCreateLocalInstance(id, descriptor);
        };
        NullThreadService.prototype._registerExtHostActor = function (id, actor) {
            throw new Error('Not supported in this runtime context!');
        };
        NullThreadService.prototype._registerAndInstantiateWorkerActor = function (id, descriptor, whichWorker) {
            return this._getOrCreateProxyInstance({
                callOnRemote: function (proxyId, path, args) {
                    return winjs.TPromise.as(null);
                }
            }, id, descriptor);
        };
        NullThreadService.prototype._registerWorkerActor = function (id, actor) {
            throw new Error('Not supported in this runtime context!');
        };
        return NullThreadService;
    }(abstractThreadService.AbstractThreadService));
    exports.NullThreadService = NullThreadService;
    exports.NULL_THREAD_SERVICE = new NullThreadService();
});
//# sourceMappingURL=nullThreadService.js.map