define(["require", "exports", 'vs/base/common/winjs.base', './thread'], function (require, exports, winjs_base_1, thread) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.THREAD_SERVICE_PROPERTY_NAME = '__$$__threadService';
    function findMember(proto, target) {
        for (var i in proto) {
            if (proto[i] === target) {
                return i;
            }
        }
        throw new Error('Member not found in prototype');
    }
    function findThreadService(obj) {
        var threadService = obj[exports.THREAD_SERVICE_PROPERTY_NAME];
        if (!threadService) {
            throw new Error('Objects that use thread attributes must be instantiated with the thread service');
        }
        return threadService;
    }
    function OneWorkerFn(type, target, conditionOrAffinity, affinity) {
        if (affinity === void 0) { affinity = thread.ThreadAffinity.None; }
        var methodName = findMember(type.prototype, target), condition;
        if (typeof conditionOrAffinity === 'function') {
            condition = conditionOrAffinity;
        }
        else if (typeof conditionOrAffinity !== 'undefined') {
            affinity = conditionOrAffinity;
        }
        type.prototype[methodName] = function () {
            var param = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                param[_i - 0] = arguments[_i];
            }
            if (!condition) {
                return findThreadService(this).OneWorker(this, methodName, target, param, affinity);
            }
            else {
                var that_1 = this, promise = condition.call(that_1);
                if (!winjs_base_1.TPromise.is(promise)) {
                    promise = winjs_base_1.TPromise.as(promise);
                }
                return promise.then(function () {
                    return findThreadService(that_1).OneWorker(that_1, methodName, target, param, affinity);
                });
            }
        };
    }
    exports.OneWorkerAttr = OneWorkerFn;
    function AllWorkersAttr(type, target) {
        var methodName = findMember(type.prototype, target);
        type.prototype[methodName] = function () {
            var param = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                param[_i - 0] = arguments[_i];
            }
            return findThreadService(this).AllWorkers(this, methodName, target, param);
        };
    }
    exports.AllWorkersAttr = AllWorkersAttr;
});
