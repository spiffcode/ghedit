/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/lifecycle', 'vs/base/browser/builder', 'vs/base/common/platform', 'vs/base/common/actions', 'vs/base/browser/dom', 'vs/base/common/events', 'vs/base/common/types', 'vs/base/common/eventEmitter', 'vs/base/browser/touch', 'vs/base/browser/keyboardEvent', 'vs/base/common/keyCodes', 'vs/css!./actionbar'], function (require, exports, nls, lifecycle, builder_1, platform, actions_1, DOM, events_1, types, eventEmitter_1, touch_1, keyboardEvent_1, keyCodes_1) {
    'use strict';
    var BaseActionItem = (function (_super) {
        __extends(BaseActionItem, _super);
        function BaseActionItem(context, action) {
            var _this = this;
            _super.call(this);
            this._callOnDispose = [];
            this._context = context || this;
            this._action = action;
            if (action instanceof actions_1.Action) {
                var l = action.addBulkListener(function (events) {
                    if (!_this.builder) {
                        // we have not been rendered yet, so there
                        // is no point in updating the UI
                        return;
                    }
                    events.forEach(function (event) {
                        switch (event.getType()) {
                            case actions_1.Action.ENABLED:
                                _this._updateEnabled();
                                break;
                            case actions_1.Action.LABEL:
                                _this._updateLabel();
                                _this._updateTooltip();
                                break;
                            case actions_1.Action.TOOLTIP:
                                _this._updateTooltip();
                                break;
                            case actions_1.Action.CLASS:
                                _this._updateClass();
                                break;
                            case actions_1.Action.CHECKED:
                                _this._updateChecked();
                                break;
                            default:
                                _this._updateUnknown(event);
                                break;
                        }
                    });
                });
                this._callOnDispose.push(l);
            }
        }
        Object.defineProperty(BaseActionItem.prototype, "callOnDispose", {
            get: function () {
                return this._callOnDispose;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseActionItem.prototype, "actionRunner", {
            get: function () {
                return this._actionRunner;
            },
            set: function (actionRunner) {
                this._actionRunner = actionRunner;
            },
            enumerable: true,
            configurable: true
        });
        BaseActionItem.prototype.getAction = function () {
            return this._action;
        };
        BaseActionItem.prototype.isEnabled = function () {
            return this._action.enabled;
        };
        BaseActionItem.prototype.setActionContext = function (newContext) {
            this._context = newContext;
        };
        BaseActionItem.prototype.render = function (container) {
            var _this = this;
            this.builder = builder_1.$(container);
            this.gesture = new touch_1.Gesture(container);
            this.builder.on(DOM.EventType.CLICK, function (event) { _this.onClick(event); });
            this.builder.on(touch_1.EventType.Tap, function (e) { _this.onClick(e); });
            if (platform.isMacintosh) {
                this.builder.on(DOM.EventType.CONTEXT_MENU, function (event) { _this.onClick(event); }); // https://github.com/Microsoft/vscode/issues/1011
            }
            this.builder.on('mousedown', function (e) {
                if (e.button === 0 && _this._action.enabled) {
                    _this.builder.addClass('active');
                }
            });
            this.builder.on(['mouseup', 'mouseout'], function (e) {
                if (e.button === 0 && _this._action.enabled) {
                    _this.builder.removeClass('active');
                }
            });
        };
        BaseActionItem.prototype.onClick = function (event) {
            DOM.EventHelper.stop(event, true);
            this._actionRunner.run(this._action, this._context || event);
        };
        BaseActionItem.prototype.focus = function () {
            if (this.builder) {
                this.builder.domFocus();
            }
        };
        BaseActionItem.prototype.blur = function () {
            if (this.builder) {
                this.builder.domBlur();
            }
        };
        BaseActionItem.prototype._updateEnabled = function () {
            // implement in subclass
        };
        BaseActionItem.prototype._updateLabel = function () {
            // implement in subclass
        };
        BaseActionItem.prototype._updateTooltip = function () {
            // implement in subclass
        };
        BaseActionItem.prototype._updateClass = function () {
            // implement in subclass
        };
        BaseActionItem.prototype._updateChecked = function () {
            // implement in subclass
        };
        BaseActionItem.prototype._updateUnknown = function (event) {
            // can implement in subclass
        };
        BaseActionItem.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.builder) {
                this.builder.destroy();
                this.builder = null;
            }
            if (this.gesture) {
                this.gesture.dispose();
                this.gesture = null;
            }
            lifecycle.cAll(this._callOnDispose);
        };
        return BaseActionItem;
    }(eventEmitter_1.EventEmitter));
    exports.BaseActionItem = BaseActionItem;
    var Separator = (function (_super) {
        __extends(Separator, _super);
        function Separator(label, order) {
            _super.call(this, Separator.ID, label, label ? 'separator text' : 'separator');
            this.checked = false;
            this.enabled = false;
            this.order = order;
        }
        Separator.ID = 'actions.monaco.separator';
        return Separator;
    }(actions_1.Action));
    exports.Separator = Separator;
    var ActionItem = (function (_super) {
        __extends(ActionItem, _super);
        function ActionItem(context, action, options) {
            if (options === void 0) { options = {}; }
            _super.call(this, context, action);
            this.options = options;
            this.options.icon = options.icon !== undefined ? options.icon : false;
            this.options.label = options.label !== undefined ? options.label : true;
            this.cssClass = '';
        }
        ActionItem.prototype.render = function (container) {
            _super.prototype.render.call(this, container);
            this.$e = builder_1.$('a.action-label').appendTo(this.builder);
            this.$e.attr({ role: 'button' });
            if (this.options.label && this.options.keybinding) {
                builder_1.$('span.keybinding').text(this.options.keybinding).appendTo(this.builder);
            }
            this._updateClass();
            this._updateLabel();
            this._updateTooltip();
            this._updateEnabled();
            this._updateChecked();
        };
        ActionItem.prototype.focus = function () {
            _super.prototype.focus.call(this);
            this.$e.domFocus();
        };
        ActionItem.prototype._updateLabel = function () {
            if (this.options.label) {
                this.$e.text(this.getAction().label);
            }
        };
        ActionItem.prototype._updateTooltip = function () {
            var title = null;
            if (this.getAction().tooltip) {
                title = this.getAction().tooltip;
            }
            else if (!this.options.label && this.getAction().label && this.options.icon) {
                title = this.getAction().label;
                if (this.options.keybinding) {
                    title = nls.localize({ key: 'titleLabel', comment: ['action title', 'action keybinding'] }, "{0} ({1})", title, this.options.keybinding);
                }
            }
            if (title) {
                this.$e.attr({ title: title });
            }
        };
        ActionItem.prototype._updateClass = function () {
            if (this.cssClass) {
                this.$e.removeClass(this.cssClass);
            }
            if (this.options.icon) {
                this.cssClass = this.getAction().class;
                this.$e.addClass('icon');
                if (this.cssClass) {
                    this.$e.addClass(this.cssClass);
                }
                this._updateEnabled();
            }
            else {
                this.$e.removeClass('icon');
            }
        };
        ActionItem.prototype._updateEnabled = function () {
            if (this.getAction().enabled) {
                this.builder.removeClass('disabled');
                this.$e.removeClass('disabled');
                this.$e.attr({ tabindex: 0 });
            }
            else {
                this.builder.addClass('disabled');
                this.$e.addClass('disabled');
                DOM.removeTabIndexAndUpdateFocus(this.$e.getHTMLElement());
            }
        };
        ActionItem.prototype._updateChecked = function () {
            if (this.getAction().checked) {
                this.$e.addClass('checked');
            }
            else {
                this.$e.removeClass('checked');
            }
        };
        return ActionItem;
    }(BaseActionItem));
    exports.ActionItem = ActionItem;
    var ProgressItem = (function (_super) {
        __extends(ProgressItem, _super);
        function ProgressItem() {
            _super.apply(this, arguments);
        }
        ProgressItem.prototype.render = function (parent) {
            var container = document.createElement('div');
            builder_1.$(container).addClass('progress-item');
            var label = document.createElement('div');
            builder_1.$(label).addClass('label');
            label.textContent = this.getAction().label;
            label.title = this.getAction().label;
            _super.prototype.render.call(this, label);
            var progress = document.createElement('div');
            progress.textContent = '\u2026';
            builder_1.$(progress).addClass('tag', 'progress');
            var done = document.createElement('div');
            done.textContent = '\u2713';
            builder_1.$(done).addClass('tag', 'done');
            var error = document.createElement('div');
            error.textContent = '!';
            builder_1.$(error).addClass('tag', 'error');
            this.callOnDispose.push(this.addListener(events_1.EventType.BEFORE_RUN, function () {
                builder_1.$(progress).addClass('active');
                builder_1.$(done).removeClass('active');
                builder_1.$(error).removeClass('active');
            }));
            this.callOnDispose.push(this.addListener(events_1.EventType.RUN, function (result) {
                builder_1.$(progress).removeClass('active');
                if (result.error) {
                    builder_1.$(done).removeClass('active');
                    builder_1.$(error).addClass('active');
                }
                else {
                    builder_1.$(error).removeClass('active');
                    builder_1.$(done).addClass('active');
                }
            }));
            container.appendChild(label);
            container.appendChild(progress);
            container.appendChild(done);
            container.appendChild(error);
            parent.appendChild(container);
        };
        ProgressItem.prototype.dispose = function () {
            lifecycle.cAll(this.callOnDispose);
            _super.prototype.dispose.call(this);
        };
        return ProgressItem;
    }(BaseActionItem));
    exports.ProgressItem = ProgressItem;
    (function (ActionsOrientation) {
        ActionsOrientation[ActionsOrientation["HORIZONTAL"] = 1] = "HORIZONTAL";
        ActionsOrientation[ActionsOrientation["VERTICAL"] = 2] = "VERTICAL";
    })(exports.ActionsOrientation || (exports.ActionsOrientation = {}));
    var ActionsOrientation = exports.ActionsOrientation;
    var defaultOptions = {
        orientation: ActionsOrientation.HORIZONTAL,
        context: null
    };
    var ActionBar = (function (_super) {
        __extends(ActionBar, _super);
        function ActionBar(container, options) {
            var _this = this;
            if (options === void 0) { options = defaultOptions; }
            _super.call(this);
            this.options = options;
            this._context = options.context;
            this.toDispose = [];
            this._actionRunner = this.options.actionRunner;
            if (!this._actionRunner) {
                this._actionRunner = new actions_1.ActionRunner();
                this.toDispose.push(this._actionRunner);
            }
            this.toDispose.push(this.addEmitter2(this._actionRunner));
            this.items = [];
            this.focusedItem = undefined;
            this.domNode = document.createElement('div');
            this.domNode.className = 'monaco-action-bar';
            var isVertical = this.options.orientation === ActionsOrientation.VERTICAL;
            if (isVertical) {
                this.domNode.className += ' vertical';
            }
            builder_1.$(this.domNode).on(DOM.EventType.KEY_DOWN, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                var eventHandled = true;
                if (event.equals(isVertical ? keyCodes_1.CommonKeybindings.UP_ARROW : keyCodes_1.CommonKeybindings.LEFT_ARROW)) {
                    _this.focusPrevious();
                }
                else if (event.equals(isVertical ? keyCodes_1.CommonKeybindings.DOWN_ARROW : keyCodes_1.CommonKeybindings.RIGHT_ARROW)) {
                    _this.focusNext();
                }
                else if (event.equals(keyCodes_1.CommonKeybindings.ESCAPE)) {
                    _this.cancel();
                }
                else if (event.equals(keyCodes_1.CommonKeybindings.ENTER) || event.equals(keyCodes_1.CommonKeybindings.SPACE)) {
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
            // Prevent native context menu on actions
            builder_1.$(this.domNode).on(DOM.EventType.CONTEXT_MENU, function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            builder_1.$(this.domNode).on(DOM.EventType.KEY_UP, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                // Run action on Enter/Space
                if (event.equals(keyCodes_1.CommonKeybindings.ENTER) || event.equals(keyCodes_1.CommonKeybindings.SPACE)) {
                    _this.doTrigger(event);
                    event.preventDefault();
                    event.stopPropagation();
                }
                else if (event.equals(keyCodes_1.CommonKeybindings.TAB) || event.equals(keyCodes_1.CommonKeybindings.SHIFT_TAB)) {
                    _this.updateFocusedItem();
                }
            });
            this.focusTracker = DOM.trackFocus(this.domNode);
            this.focusTracker.addBlurListener(function () {
                if (document.activeElement === _this.domNode || !DOM.isAncestor(document.activeElement, _this.domNode)) {
                    _this.emit(DOM.EventType.BLUR, {});
                    _this.focusedItem = undefined;
                }
            });
            this.focusTracker.addFocusListener(function () { return _this.updateFocusedItem(); });
            this.actionsList = document.createElement('ul');
            this.actionsList.className = 'actions-container';
            this.actionsList.setAttribute('role', 'toolbar');
            if (this.options.ariaLabel) {
                this.actionsList.setAttribute('aria-label', this.options.ariaLabel);
            }
            this.domNode.appendChild(this.actionsList);
            container = (container instanceof builder_1.Builder) ? container.getHTMLElement() : container;
            container.appendChild(this.domNode);
        }
        ActionBar.prototype.setAriaLabel = function (label) {
            if (label) {
                this.actionsList.setAttribute('aria-label', label);
            }
            else {
                this.actionsList.removeAttribute('aria-label');
            }
        };
        ActionBar.prototype.updateFocusedItem = function () {
            for (var i = 0; i < this.actionsList.children.length; i++) {
                var elem = this.actionsList.children[i];
                if (DOM.isAncestor(document.activeElement, elem)) {
                    this.focusedItem = i;
                    break;
                }
            }
        };
        Object.defineProperty(ActionBar.prototype, "context", {
            get: function () {
                return this._context;
            },
            set: function (context) {
                this._context = context;
                this.items.forEach(function (i) { return i.setActionContext(context); });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionBar.prototype, "actionRunner", {
            get: function () {
                return this._actionRunner;
            },
            set: function (actionRunner) {
                if (actionRunner) {
                    this._actionRunner = actionRunner;
                    this.items.forEach(function (item) { return item.actionRunner = actionRunner; });
                }
            },
            enumerable: true,
            configurable: true
        });
        ActionBar.prototype.getContainer = function () {
            return builder_1.$(this.domNode);
        };
        ActionBar.prototype.push = function (actions, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            if (!Array.isArray(actions)) {
                actions = [actions];
            }
            var index = types.isNumber(options.index) ? options.index : null;
            actions.forEach(function (action) {
                var actionItemElement = document.createElement('li');
                actionItemElement.className = 'action-item';
                actionItemElement.setAttribute('role', 'presentation');
                var item = null;
                if (_this.options.actionItemProvider) {
                    item = _this.options.actionItemProvider(action);
                }
                if (!item) {
                    item = new ActionItem(_this.context, action, options);
                }
                item.actionRunner = _this._actionRunner;
                item.setActionContext(_this.context);
                _this.addEmitter(item);
                item.render(actionItemElement);
                if (index === null || index < 0 || index >= _this.actionsList.children.length) {
                    _this.actionsList.appendChild(actionItemElement);
                }
                else {
                    _this.actionsList.insertBefore(actionItemElement, _this.actionsList.children[index++]);
                }
                _this.items.push(item);
            });
        };
        ActionBar.prototype.clear = function () {
            var item;
            while (item = this.items.pop()) {
                item.dispose();
            }
            builder_1.$(this.actionsList).empty();
        };
        ActionBar.prototype.length = function () {
            return this.items.length;
        };
        ActionBar.prototype.isEmpty = function () {
            return this.items.length === 0;
        };
        ActionBar.prototype.onContentsChange = function () {
            this.emit(events_1.EventType.CONTENTS_CHANGED);
        };
        ActionBar.prototype.focus = function (selectFirst) {
            if (selectFirst && typeof this.focusedItem === 'undefined') {
                this.focusedItem = 0;
            }
            this.updateFocus();
        };
        ActionBar.prototype.focusNext = function () {
            if (typeof this.focusedItem === 'undefined') {
                this.focusedItem = this.items.length - 1;
            }
            var startIndex = this.focusedItem;
            var item;
            do {
                this.focusedItem = (this.focusedItem + 1) % this.items.length;
                item = this.items[this.focusedItem];
            } while (this.focusedItem !== startIndex && !item.isEnabled());
            if (this.focusedItem === startIndex && !item.isEnabled()) {
                this.focusedItem = undefined;
            }
            this.updateFocus();
        };
        ActionBar.prototype.focusPrevious = function () {
            if (typeof this.focusedItem === 'undefined') {
                this.focusedItem = 0;
            }
            var startIndex = this.focusedItem;
            var item;
            do {
                this.focusedItem = this.focusedItem - 1;
                if (this.focusedItem < 0) {
                    this.focusedItem = this.items.length - 1;
                }
                item = this.items[this.focusedItem];
            } while (this.focusedItem !== startIndex && !item.isEnabled());
            if (this.focusedItem === startIndex && !item.isEnabled()) {
                this.focusedItem = undefined;
            }
            this.updateFocus();
        };
        ActionBar.prototype.updateFocus = function () {
            if (typeof this.focusedItem === 'undefined') {
                this.domNode.focus();
                return;
            }
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                var actionItem = item;
                if (i === this.focusedItem) {
                    if (types.isFunction(actionItem.focus)) {
                        actionItem.focus();
                    }
                }
                else {
                    if (types.isFunction(actionItem.blur)) {
                        actionItem.blur();
                    }
                }
            }
        };
        ActionBar.prototype.doTrigger = function (event) {
            if (typeof this.focusedItem === 'undefined') {
                return; //nothing to focus
            }
            // trigger action
            var actionItem = this.items[this.focusedItem];
            this.run(actionItem._action, actionItem._context || event).done();
        };
        ActionBar.prototype.cancel = function () {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur(); // remove focus from focussed action
            }
            this.emit(events_1.EventType.CANCEL);
        };
        ActionBar.prototype.run = function (action, context) {
            return this._actionRunner.run(action, context);
        };
        ActionBar.prototype.dispose = function () {
            if (this.items !== null) {
                this.clear();
            }
            this.items = null;
            if (this.focusTracker) {
                this.focusTracker.dispose();
                this.focusTracker = null;
            }
            this.toDispose = lifecycle.dispose(this.toDispose);
            this.getContainer().destroy();
            _super.prototype.dispose.call(this);
        };
        return ActionBar;
    }(eventEmitter_1.EventEmitter));
    exports.ActionBar = ActionBar;
    var SelectActionItem = (function (_super) {
        __extends(SelectActionItem, _super);
        function SelectActionItem(ctx, action, options, selected) {
            _super.call(this, ctx, action);
            this.select = document.createElement('select');
            this.select.className = 'action-bar-select';
            this.options = options;
            this.selected = selected;
            this.toDispose = [];
            this.registerListeners();
        }
        SelectActionItem.prototype.setOptions = function (options, selected) {
            this.options = options;
            this.selected = selected;
            this.doSetOptions();
        };
        SelectActionItem.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(DOM.addStandardDisposableListener(this.select, 'change', function (e) {
                _this.actionRunner.run(_this._action, _this.getActionContext(e.target.value)).done();
            }));
        };
        SelectActionItem.prototype.getActionContext = function (option) {
            return option;
        };
        SelectActionItem.prototype.focus = function () {
            if (this.select) {
                this.select.focus();
            }
        };
        SelectActionItem.prototype.blur = function () {
            if (this.select) {
                this.select.blur();
            }
        };
        SelectActionItem.prototype.render = function (container) {
            DOM.addClass(container, 'select-container');
            container.appendChild(this.select);
            this.doSetOptions();
        };
        SelectActionItem.prototype.doSetOptions = function () {
            var _this = this;
            this.select.options.length = 0;
            this.options.forEach(function (option) {
                _this.select.add(_this.createOption(option));
            });
            if (this.selected >= 0) {
                this.select.selectedIndex = this.selected;
            }
        };
        SelectActionItem.prototype.createOption = function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.text = value;
            return option;
        };
        SelectActionItem.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        return SelectActionItem;
    }(BaseActionItem));
    exports.SelectActionItem = SelectActionItem;
});
//# sourceMappingURL=actionbar.js.map