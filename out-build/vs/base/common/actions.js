var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/eventEmitter', 'vs/base/common/events'], function (require, exports, winjs_base_1, eventEmitter_1, Events) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Checks if the provided object is compatible
     * with the IAction interface.
     * @param thing an object
     */
    function isAction(thing) {
        if (!thing) {
            return false;
        }
        else if (thing instanceof Action) {
            return true;
        }
        else if (typeof thing.id !== 'string') {
            return false;
        }
        else if (typeof thing.label !== 'string') {
            return false;
        }
        else if (typeof thing.class !== 'string') {
            return false;
        }
        else if (typeof thing.enabled !== 'boolean') {
            return false;
        }
        else if (typeof thing.checked !== 'boolean') {
            return false;
        }
        else if (typeof thing.run !== 'function') {
            return false;
        }
        else {
            return true;
        }
    }
    exports.isAction = isAction;
    var Action = (function (_super) {
        __extends(Action, _super);
        function Action(id, label, cssClass, enabled, actionCallback) {
            if (label === void 0) { label = ''; }
            if (cssClass === void 0) { cssClass = ''; }
            if (enabled === void 0) { enabled = true; }
            if (actionCallback === void 0) { actionCallback = null; }
            _super.call(this);
            this._id = id;
            this._label = label;
            this._cssClass = cssClass;
            this._enabled = enabled;
            this._actionCallback = actionCallback;
        }
        Object.defineProperty(Action.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "label", {
            get: function () {
                return this._label;
            },
            set: function (value) {
                this._setLabel(value);
            },
            enumerable: true,
            configurable: true
        });
        Action.prototype._setLabel = function (value) {
            if (this._label !== value) {
                this._label = value;
                this.emit(Action.LABEL, { source: this });
            }
        };
        Object.defineProperty(Action.prototype, "tooltip", {
            get: function () {
                return this._tooltip;
            },
            set: function (value) {
                this._setTooltip(value);
            },
            enumerable: true,
            configurable: true
        });
        Action.prototype._setTooltip = function (value) {
            if (this._tooltip !== value) {
                this._tooltip = value;
                this.emit(Action.TOOLTIP, { source: this });
            }
        };
        Object.defineProperty(Action.prototype, "class", {
            get: function () {
                return this._cssClass;
            },
            set: function (value) {
                this._setClass(value);
            },
            enumerable: true,
            configurable: true
        });
        Action.prototype._setClass = function (value) {
            if (this._cssClass !== value) {
                this._cssClass = value;
                this.emit(Action.CLASS, { source: this });
            }
        };
        Object.defineProperty(Action.prototype, "enabled", {
            get: function () {
                return this._enabled;
            },
            set: function (value) {
                this._setEnabled(value);
            },
            enumerable: true,
            configurable: true
        });
        Action.prototype._setEnabled = function (value) {
            if (this._enabled !== value) {
                this._enabled = value;
                this.emit(Action.ENABLED, { source: this });
            }
        };
        Object.defineProperty(Action.prototype, "checked", {
            get: function () {
                return this._checked;
            },
            set: function (value) {
                this._setChecked(value);
            },
            enumerable: true,
            configurable: true
        });
        Action.prototype._setChecked = function (value) {
            if (this._checked !== value) {
                this._checked = value;
                this.emit(Action.CHECKED, { source: this });
            }
        };
        Object.defineProperty(Action.prototype, "order", {
            get: function () {
                return this._order;
            },
            set: function (value) {
                this._order = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "actionCallback", {
            get: function () {
                return this._actionCallback;
            },
            set: function (value) {
                this._actionCallback = value;
            },
            enumerable: true,
            configurable: true
        });
        Action.prototype.run = function (event) {
            if (this._actionCallback !== null) {
                return this._actionCallback(event);
            }
            else {
                return winjs_base_1.TPromise.as(true);
            }
        };
        Action.LABEL = 'label';
        Action.TOOLTIP = 'tooltip';
        Action.CLASS = 'class';
        Action.ENABLED = 'enabled';
        Action.CHECKED = 'checked';
        return Action;
    }(eventEmitter_1.EventEmitter));
    exports.Action = Action;
    var ProxyAction = (function (_super) {
        __extends(ProxyAction, _super);
        function ProxyAction(delegate, runHandler) {
            _super.call(this, delegate.id, delegate.label, delegate.class, delegate.enabled, null);
            this.delegate = delegate;
            this.runHandler = runHandler;
        }
        Object.defineProperty(ProxyAction.prototype, "id", {
            get: function () {
                return this.delegate.id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProxyAction.prototype, "label", {
            get: function () {
                return this.delegate.label;
            },
            set: function (value) {
                this.delegate.label = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProxyAction.prototype, "class", {
            get: function () {
                return this.delegate.class;
            },
            set: function (value) {
                this.delegate.class = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProxyAction.prototype, "enabled", {
            get: function () {
                return this.delegate.enabled;
            },
            set: function (value) {
                this.delegate.enabled = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProxyAction.prototype, "checked", {
            get: function () {
                return this.delegate.checked;
            },
            set: function (value) {
                this.delegate.checked = value;
            },
            enumerable: true,
            configurable: true
        });
        ProxyAction.prototype.run = function (event) {
            this.runHandler(event);
            return this.delegate.run(event);
        };
        ProxyAction.prototype.addListener = function (eventType, listener) {
            return this.delegate.addListener(eventType, listener);
        };
        ProxyAction.prototype.addBulkListener = function (listener) {
            return this.delegate.addBulkListener(listener);
        };
        ProxyAction.prototype.addEmitter = function (eventEmitter, emitterType) {
            return this.delegate.addEmitter(eventEmitter, emitterType);
        };
        ProxyAction.prototype.addEmitterTypeListener = function (eventType, emitterType, listener) {
            return this.delegate.addEmitterTypeListener(eventType, emitterType, listener);
        };
        ProxyAction.prototype.emit = function (eventType, data) {
            this.delegate.emit(eventType, data);
        };
        return ProxyAction;
    }(Action));
    var ActionRunner = (function (_super) {
        __extends(ActionRunner, _super);
        function ActionRunner() {
            _super.apply(this, arguments);
        }
        ActionRunner.prototype.run = function (action, context) {
            var _this = this;
            if (!action.enabled) {
                return winjs_base_1.TPromise.as(null);
            }
            this.emit(Events.EventType.BEFORE_RUN, { action: action });
            return winjs_base_1.TPromise.as(action.run(context)).then(function (result) {
                _this.emit(Events.EventType.RUN, { action: action, result: result });
            }, function (error) {
                _this.emit(Events.EventType.RUN, { action: action, error: error });
            });
        };
        return ActionRunner;
    }(eventEmitter_1.EventEmitter));
    exports.ActionRunner = ActionRunner;
});
