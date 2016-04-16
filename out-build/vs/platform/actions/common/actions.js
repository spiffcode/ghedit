var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/actions', 'vs/base/common/winjs.base', 'vs/base/common/assert', 'vs/platform/instantiation/common/descriptors', 'vs/platform/instantiation/common/instantiation'], function (require, exports, Actions, WinJS, Assert, Descriptors, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.IActionsService = instantiation_1.createDecorator('actionsService');
    var SyncActionDescriptor = (function () {
        function SyncActionDescriptor(ctor, id, label, keybindings, keybindingContext, keybindingWeight) {
            this._id = id;
            this._label = label;
            this._keybindings = keybindings;
            this._keybindingContext = keybindingContext;
            this._keybindingWeight = keybindingWeight;
            this._descriptor = Descriptors.createSyncDescriptor(ctor, this._id, this._label);
        }
        Object.defineProperty(SyncActionDescriptor.prototype, "syncDescriptor", {
            get: function () {
                return this._descriptor;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SyncActionDescriptor.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SyncActionDescriptor.prototype, "label", {
            get: function () {
                return this._label;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SyncActionDescriptor.prototype, "keybindings", {
            get: function () {
                return this._keybindings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SyncActionDescriptor.prototype, "keybindingContext", {
            get: function () {
                return this._keybindingContext;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SyncActionDescriptor.prototype, "keybindingWeight", {
            get: function () {
                return this._keybindingWeight;
            },
            enumerable: true,
            configurable: true
        });
        return SyncActionDescriptor;
    }());
    exports.SyncActionDescriptor = SyncActionDescriptor;
    /**
     * A proxy for an action that needs to load code in order to confunction. Can be used from contributions to defer
     * module loading up to the point until the run method is being executed.
     */
    var DeferredAction = (function (_super) {
        __extends(DeferredAction, _super);
        function DeferredAction(_instantiationService, _descriptor, id, label, cssClass, enabled) {
            if (label === void 0) { label = ''; }
            if (cssClass === void 0) { cssClass = ''; }
            if (enabled === void 0) { enabled = true; }
            _super.call(this, id, label, cssClass, enabled);
            this._instantiationService = _instantiationService;
            this._descriptor = _descriptor;
        }
        Object.defineProperty(DeferredAction.prototype, "cachedAction", {
            get: function () {
                return this._cachedAction;
            },
            set: function (action) {
                this._cachedAction = action;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeferredAction.prototype, "id", {
            get: function () {
                if (this._cachedAction instanceof Actions.Action) {
                    return this._cachedAction.id;
                }
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeferredAction.prototype, "label", {
            get: function () {
                if (this._cachedAction instanceof Actions.Action) {
                    return this._cachedAction.label;
                }
                return this._label;
            },
            set: function (value) {
                if (this._cachedAction instanceof Actions.Action) {
                    this._cachedAction.label = value;
                }
                else {
                    this._setLabel(value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeferredAction.prototype, "class", {
            get: function () {
                if (this._cachedAction instanceof Actions.Action) {
                    return this._cachedAction.class;
                }
                return this._cssClass;
            },
            set: function (value) {
                if (this._cachedAction instanceof Actions.Action) {
                    this._cachedAction.class = value;
                }
                else {
                    this._setClass(value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeferredAction.prototype, "enabled", {
            get: function () {
                if (this._cachedAction instanceof Actions.Action) {
                    return this._cachedAction.enabled;
                }
                return this._enabled;
            },
            set: function (value) {
                if (this._cachedAction instanceof Actions.Action) {
                    this._cachedAction.enabled = value;
                }
                else {
                    this._setEnabled(value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeferredAction.prototype, "order", {
            get: function () {
                if (this._cachedAction instanceof Actions.Action) {
                    return this._cachedAction.order;
                }
                return this._order;
            },
            set: function (order) {
                if (this._cachedAction instanceof Actions.Action) {
                    this._cachedAction.order = order;
                }
                else {
                    this._order = order;
                }
            },
            enumerable: true,
            configurable: true
        });
        DeferredAction.prototype.run = function (event) {
            if (this._cachedAction) {
                return this._cachedAction.run(event);
            }
            return this._createAction().then(function (action) {
                return action.run(event);
            });
        };
        DeferredAction.prototype._createAction = function () {
            var _this = this;
            var promise = WinJS.TPromise.as(undefined);
            return promise.then(function () {
                return _this._instantiationService.createInstance(_this._descriptor);
            }).then(function (action) {
                Assert.ok(action instanceof Actions.Action, 'Action must be an instanceof Base Action');
                _this._cachedAction = action;
                // Pipe events from the instantated action through this deferred action
                _this._emitterUnbind = _this.addEmitter(_this._cachedAction);
                return action;
            });
        };
        DeferredAction.prototype.dispose = function () {
            if (this._emitterUnbind) {
                this._emitterUnbind();
            }
            if (this._cachedAction) {
                this._cachedAction.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        return DeferredAction;
    }(Actions.Action));
    exports.DeferredAction = DeferredAction;
});
