/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/platform/test/common/nullThreadService', 'vs/base/common/winjs.base'], function (require, exports, nullThreadService_1, winjs_base_1) {
    'use strict';
    var TestThreadService = (function (_super) {
        __extends(TestThreadService, _super);
        function TestThreadService(instantiationService) {
            _super.call(this);
            this._callCountValue = 0;
            this.setInstantiationService(instantiationService);
        }
        Object.defineProperty(TestThreadService.prototype, "_callCount", {
            get: function () {
                return this._callCountValue;
            },
            set: function (value) {
                this._callCountValue = value;
                if (this._callCountValue === 0) {
                    if (this._completeIdle) {
                        this._completeIdle();
                    }
                    this._idle = undefined;
                }
            },
            enumerable: true,
            configurable: true
        });
        TestThreadService.prototype.sync = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c) {
                setTimeout(c, 0);
            }).then(function () {
                if (_this._callCount === 0) {
                    return;
                }
                if (!_this._idle) {
                    _this._idle = new winjs_base_1.TPromise(function (c, e) {
                        _this._completeIdle = c;
                    }, function () {
                        // no cancel
                    });
                }
                return _this._idle;
            });
        };
        TestThreadService.prototype._registerAndInstantiateMainProcessActor = function (id, descriptor) {
            var _this = this;
            var _calls = [];
            var _instance;
            return this._getOrCreateProxyInstance({
                callOnRemote: function (proxyId, path, args) {
                    _this._callCount++;
                    _calls.push({ path: path, args: args });
                    return new winjs_base_1.TPromise(function (c) {
                        setTimeout(c, 0);
                    }).then(function () {
                        if (!_instance) {
                            _instance = _this._instantiationService.createInstance(descriptor.ctor);
                        }
                        var p;
                        try {
                            var _a = _calls.shift(), path_1 = _a.path, args_1 = _a.args;
                            var result = _instance[path_1].apply(_instance, args_1);
                            p = winjs_base_1.TPromise.is(result) ? result : winjs_base_1.TPromise.as(result);
                        }
                        catch (err) {
                            p = winjs_base_1.TPromise.wrapError(err);
                        }
                        return p.then(function (result) {
                            _this._callCount--;
                            return result;
                        }, function (err) {
                            _this._callCount--;
                            return winjs_base_1.TPromise.wrapError(err);
                        });
                    });
                }
            }, id, descriptor);
        };
        TestThreadService.prototype._registerAndInstantiateExtHostActor = function (id, descriptor) {
            return this._getOrCreateLocalInstance(id, descriptor);
        };
        return TestThreadService;
    }(nullThreadService_1.NullThreadService));
    exports.TestThreadService = TestThreadService;
});
//# sourceMappingURL=testThreadService.js.map