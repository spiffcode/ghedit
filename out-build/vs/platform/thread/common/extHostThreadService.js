var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', './abstractThreadService', 'vs/platform/thread/common/thread'], function (require, exports, winjs_base_1, abstractThreadService, thread_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostThreadService = (function (_super) {
        __extends(ExtHostThreadService, _super);
        function ExtHostThreadService(remoteCom) {
            _super.call(this, false);
            this.serviceId = thread_1.IThreadService;
            this._remoteCom = remoteCom;
            this._remoteCom.setManyHandler(this);
        }
        ExtHostThreadService.prototype.OneWorker = function (obj, methodName, target, params, affinity) {
            return winjs_base_1.TPromise.as(null);
        };
        ExtHostThreadService.prototype.AllWorkers = function (obj, methodName, target, params) {
            return winjs_base_1.TPromise.as(null);
        };
        ExtHostThreadService.prototype.addStatusListener = function (listener) {
            // Nothing to do
        };
        ExtHostThreadService.prototype.removeStatusListener = function (listener) {
            // Nothing to do
        };
        ExtHostThreadService.prototype._registerAndInstantiateMainProcessActor = function (id, descriptor) {
            return this._getOrCreateProxyInstance(this._remoteCom, id, descriptor);
        };
        ExtHostThreadService.prototype._registerMainProcessActor = function (id, actor) {
            throw new Error('Not supported in this runtime context!');
        };
        ExtHostThreadService.prototype._registerAndInstantiateExtHostActor = function (id, descriptor) {
            return this._getOrCreateLocalInstance(id, descriptor);
        };
        ExtHostThreadService.prototype._registerExtHostActor = function (id, actor) {
            this._registerLocalInstance(id, actor);
        };
        ExtHostThreadService.prototype._registerAndInstantiateWorkerActor = function (id, descriptor, whichWorker) {
            throw new Error('Not supported in this runtime context! Cannot communicate directly from Extension Host to Worker!');
        };
        ExtHostThreadService.prototype._registerWorkerActor = function (id, actor) {
            throw new Error('Not supported in this runtime context!');
        };
        return ExtHostThreadService;
    }(abstractThreadService.AbstractThreadService));
    exports.ExtHostThreadService = ExtHostThreadService;
});
//# sourceMappingURL=extHostThreadService.js.map