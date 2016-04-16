define(["require", "exports", 'vs/base/common/platform', 'vs/base/common/errors', 'vs/base/browser/dom', 'vs/base/common/keyCodes'], function (require, exports, platform, errors, dom, keyCodes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LegacyRenderer = (function () {
        function LegacyRenderer() {
        }
        LegacyRenderer.prototype.getHeight = function (tree, element) {
            return 20;
        };
        LegacyRenderer.prototype.getTemplateId = function (tree, element) {
            return 'legacy';
        };
        LegacyRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            return {
                root: container,
                element: null,
                previousCleanupFn: null
            };
        };
        LegacyRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateData.previousCleanupFn) {
                templateData.previousCleanupFn(tree, templateData.element);
            }
            while (templateData.root.firstChild) {
                templateData.root.removeChild(templateData.root.firstChild);
            }
            templateData.element = element;
            templateData.previousCleanupFn = this.render(tree, element, templateData.root);
        };
        LegacyRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            if (templateData.previousCleanupFn) {
                templateData.previousCleanupFn(tree, templateData.element);
            }
            templateData.root = null;
            templateData.element = null;
            templateData.previousCleanupFn = null;
        };
        LegacyRenderer.prototype.render = function (tree, element, container, previousCleanupFn) {
            container.textContent = '' + element;
            return null;
        };
        return LegacyRenderer;
    }());
    exports.LegacyRenderer = LegacyRenderer;
    (function (ClickBehavior) {
        /**
         * Handle the click when the mouse button is pressed but not released yet.
         */
        ClickBehavior[ClickBehavior["ON_MOUSE_DOWN"] = 0] = "ON_MOUSE_DOWN";
        /**
         * Handle the click when the mouse button is released.
         */
        ClickBehavior[ClickBehavior["ON_MOUSE_UP"] = 1] = "ON_MOUSE_UP";
    })(exports.ClickBehavior || (exports.ClickBehavior = {}));
    var ClickBehavior = exports.ClickBehavior;
    var KeybindingDispatcher = (function () {
        function KeybindingDispatcher() {
            this._arr = [];
        }
        KeybindingDispatcher.prototype.set = function (keybinding, callback) {
            this._arr.push({
                keybinding: keybinding,
                callback: callback
            });
        };
        KeybindingDispatcher.prototype.dispatch = function (keybinding) {
            // Loop from the last to the first to handle overwrites
            for (var i = this._arr.length - 1; i >= 0; i--) {
                var item = this._arr[i];
                if (keybinding === item.keybinding) {
                    return item.callback;
                }
            }
            return null;
        };
        return KeybindingDispatcher;
    }());
    exports.KeybindingDispatcher = KeybindingDispatcher;
    var DefaultController = (function () {
        function DefaultController(options) {
            var _this = this;
            if (options === void 0) { options = { clickBehavior: ClickBehavior.ON_MOUSE_UP }; }
            this.options = options;
            this.downKeyBindingDispatcher = new KeybindingDispatcher();
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.SPACE, function (t, e) { return _this.onSpace(t, e); });
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.UP_ARROW, function (t, e) { return _this.onUp(t, e); });
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.PAGE_UP, function (t, e) { return _this.onPageUp(t, e); });
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.DOWN_ARROW, function (t, e) { return _this.onDown(t, e); });
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.PAGE_DOWN, function (t, e) { return _this.onPageDown(t, e); });
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.LEFT_ARROW, function (t, e) { return _this.onLeft(t, e); });
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.RIGHT_ARROW, function (t, e) { return _this.onRight(t, e); });
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.ESCAPE, function (t, e) { return _this.onEscape(t, e); });
            this.upKeyBindingDispatcher = new KeybindingDispatcher();
            this.upKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.ENTER, this.onEnter.bind(this));
            this.upKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.CTRLCMD_ENTER, this.onEnter.bind(this));
        }
        DefaultController.prototype.onMouseDown = function (tree, element, event, origin) {
            if (origin === void 0) { origin = 'mouse'; }
            if (this.options.clickBehavior === ClickBehavior.ON_MOUSE_DOWN && event.leftButton) {
                if (event.target) {
                    if (event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
                        return false; // Ignore event if target is a form input field (avoids browser specific issues)
                    }
                    if (dom.findParentWithClass(event.target, 'monaco-action-bar', 'row')) {
                        return false; // Ignore event if target is over an action bar of the row
                    }
                }
                // Propagate to onLeftClick now
                return this.onLeftClick(tree, element, event, origin);
            }
            return false;
        };
        DefaultController.prototype.onClick = function (tree, element, event) {
            var isMac = platform.isMacintosh;
            // A Ctrl click on the Mac is a context menu event
            if (isMac && event.ctrlKey) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            if (event.middleButton) {
                return false; // Give contents of the item a chance to handle this (e.g. open link in new tab)
            }
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
                return false; // Ignore event if target is a form input field (avoids browser specific issues)
            }
            if (this.options.clickBehavior === ClickBehavior.ON_MOUSE_DOWN && event.leftButton) {
                return false; // Already handled by onMouseDown
            }
            return this.onLeftClick(tree, element, event);
        };
        DefaultController.prototype.onLeftClick = function (tree, element, eventish, origin) {
            if (origin === void 0) { origin = 'mouse'; }
            var payload = { origin: origin, originalEvent: eventish };
            if (tree.getInput() === element) {
                tree.clearFocus(payload);
                tree.clearSelection(payload);
            }
            else {
                var isMouseDown = eventish && eventish.browserEvent && eventish.browserEvent.type === 'mousedown';
                if (!isMouseDown) {
                    eventish.preventDefault(); // we cannot preventDefault onMouseDown because this would break DND otherwise
                }
                eventish.stopPropagation();
                tree.DOMFocus();
                tree.setSelection([element], payload);
                tree.setFocus(element, payload);
                if (tree.isExpanded(element)) {
                    tree.collapse(element).done(null, errors.onUnexpectedError);
                }
                else {
                    tree.expand(element).done(null, errors.onUnexpectedError);
                }
            }
            return true;
        };
        DefaultController.prototype.onContextMenu = function (tree, element, event) {
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
                return false; // allow context menu on input fields
            }
            // Prevent native context menu from showing up
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            return false;
        };
        DefaultController.prototype.onTap = function (tree, element, event) {
            var target = event.initialTarget;
            if (target && target.tagName && target.tagName.toLowerCase() === 'input') {
                return false; // Ignore event if target is a form input field (avoids browser specific issues)
            }
            return this.onLeftClick(tree, element, event, 'touch');
        };
        DefaultController.prototype.onKeyDown = function (tree, event) {
            return this.onKey(this.downKeyBindingDispatcher, tree, event);
        };
        DefaultController.prototype.onKeyUp = function (tree, event) {
            return this.onKey(this.upKeyBindingDispatcher, tree, event);
        };
        DefaultController.prototype.onKey = function (bindings, tree, event) {
            var handler = bindings.dispatch(event.asKeybinding());
            if (handler) {
                if (handler(tree, event)) {
                    event.preventDefault();
                    event.stopPropagation();
                    return true;
                }
            }
            return false;
        };
        DefaultController.prototype.onUp = function (tree, event) {
            var payload = { origin: 'keyboard', originalEvent: event };
            if (tree.getHighlight()) {
                tree.clearHighlight(payload);
            }
            else {
                tree.focusPrevious(1, payload);
                tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
            }
            return true;
        };
        DefaultController.prototype.onPageUp = function (tree, event) {
            var payload = { origin: 'keyboard', originalEvent: event };
            if (tree.getHighlight()) {
                tree.clearHighlight(payload);
            }
            else {
                tree.focusPreviousPage(payload);
                tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
            }
            return true;
        };
        DefaultController.prototype.onDown = function (tree, event) {
            var payload = { origin: 'keyboard', originalEvent: event };
            if (tree.getHighlight()) {
                tree.clearHighlight(payload);
            }
            else {
                tree.focusNext(1, payload);
                tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
            }
            return true;
        };
        DefaultController.prototype.onPageDown = function (tree, event) {
            var payload = { origin: 'keyboard', originalEvent: event };
            if (tree.getHighlight()) {
                tree.clearHighlight(payload);
            }
            else {
                tree.focusNextPage(payload);
                tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
            }
            return true;
        };
        DefaultController.prototype.onLeft = function (tree, event) {
            var payload = { origin: 'keyboard', originalEvent: event };
            if (tree.getHighlight()) {
                tree.clearHighlight(payload);
            }
            else {
                var focus = tree.getFocus();
                tree.collapse(focus).then(function (didCollapse) {
                    if (focus && !didCollapse) {
                        tree.focusParent(payload);
                        return tree.reveal(tree.getFocus());
                    }
                }).done(null, errors.onUnexpectedError);
            }
            return true;
        };
        DefaultController.prototype.onRight = function (tree, event) {
            var payload = { origin: 'keyboard', originalEvent: event };
            if (tree.getHighlight()) {
                tree.clearHighlight(payload);
            }
            else {
                var focus = tree.getFocus();
                tree.expand(focus).done(null, errors.onUnexpectedError);
            }
            return true;
        };
        DefaultController.prototype.onEnter = function (tree, event) {
            var payload = { origin: 'keyboard', originalEvent: event };
            if (tree.getHighlight()) {
                return false;
            }
            var focus = tree.getFocus();
            if (focus) {
                tree.setSelection([focus], payload);
            }
            return true;
        };
        DefaultController.prototype.onSpace = function (tree, event) {
            if (tree.getHighlight()) {
                return false;
            }
            var focus = tree.getFocus();
            if (focus) {
                tree.toggleExpansion(focus);
            }
            return true;
        };
        DefaultController.prototype.onEscape = function (tree, event) {
            var payload = { origin: 'keyboard', originalEvent: event };
            if (tree.getHighlight()) {
                tree.clearHighlight(payload);
                return true;
            }
            if (tree.getSelection().length) {
                tree.clearSelection(payload);
                return true;
            }
            if (tree.getFocus()) {
                tree.clearFocus(payload);
                return true;
            }
            return false;
        };
        return DefaultController;
    }());
    exports.DefaultController = DefaultController;
    var DefaultDragAndDrop = (function () {
        function DefaultDragAndDrop() {
        }
        DefaultDragAndDrop.prototype.getDragURI = function (tree, element) {
            return null;
        };
        DefaultDragAndDrop.prototype.onDragStart = function (tree, data, originalEvent) {
            return;
        };
        DefaultDragAndDrop.prototype.onDragOver = function (tree, data, targetElement, originalEvent) {
            return null;
        };
        DefaultDragAndDrop.prototype.drop = function (tree, data, targetElement, originalEvent) {
            return;
        };
        return DefaultDragAndDrop;
    }());
    exports.DefaultDragAndDrop = DefaultDragAndDrop;
    var DefaultFilter = (function () {
        function DefaultFilter() {
        }
        DefaultFilter.prototype.isVisible = function (tree, element) {
            return true;
        };
        return DefaultFilter;
    }());
    exports.DefaultFilter = DefaultFilter;
    var DefaultSorter = (function () {
        function DefaultSorter() {
        }
        DefaultSorter.prototype.compare = function (tree, element, otherElement) {
            return 0;
        };
        return DefaultSorter;
    }());
    exports.DefaultSorter = DefaultSorter;
    var DefaultAccessibilityProvider = (function () {
        function DefaultAccessibilityProvider() {
        }
        DefaultAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            return null;
        };
        return DefaultAccessibilityProvider;
    }());
    exports.DefaultAccessibilityProvider = DefaultAccessibilityProvider;
});
