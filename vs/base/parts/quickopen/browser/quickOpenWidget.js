var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/common/platform', 'vs/base/browser/browser', 'vs/base/common/events', 'vs/base/common/types', 'vs/base/common/errors', 'vs/base/common/uuid', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenViewer', 'vs/base/browser/builder', 'vs/base/browser/ui/inputbox/inputBox', 'vs/base/common/severity', 'vs/base/parts/tree/browser/treeImpl', 'vs/base/browser/ui/progressbar/progressbar', 'vs/base/browser/keyboardEvent', 'vs/base/parts/tree/browser/treeDefaults', 'vs/base/browser/dom', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/css!./quickopen'], function (require, exports, nls, winjs_base_1, platform, browser, events_1, types, errors, uuid, quickOpen_1, quickOpenViewer_1, builder_1, inputBox_1, severity_1, treeImpl_1, progressbar_1, keyboardEvent_1, treeDefaults_1, DOM, keyCodes_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var QuickOpenController = (function (_super) {
        __extends(QuickOpenController, _super);
        function QuickOpenController() {
            _super.apply(this, arguments);
        }
        QuickOpenController.prototype.onContextMenu = function (tree, element, event) {
            if (platform.isMacintosh) {
                return this.onLeftClick(tree, element, event); // https://github.com/Microsoft/vscode/issues/1011
            }
            return _super.prototype.onContextMenu.call(this, tree, element, event);
        };
        return QuickOpenController;
    }(treeDefaults_1.DefaultController));
    exports.QuickOpenController = QuickOpenController;
    var DEFAULT_INPUT_ARIA_LABEL = nls.localize('quickOpenAriaLabel', "Quick picker. Type to narrow down results.");
    var QuickOpenWidget = (function () {
        function QuickOpenWidget(container, callbacks, options, usageLogger) {
            this.toUnbind = [];
            this.container = container;
            this.callbacks = callbacks;
            this.options = options;
            this.usageLogger = usageLogger;
            this.model = null;
        }
        QuickOpenWidget.prototype.getModel = function () {
            return this.model;
        };
        QuickOpenWidget.prototype.setCallbacks = function (callbacks) {
            this.callbacks = callbacks;
        };
        QuickOpenWidget.prototype.create = function () {
            var _this = this;
            this.builder = builder_1.$().div(function (div) {
                // Eventing
                div.on(DOM.EventType.KEY_DOWN, function (e) {
                    var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (keyboardEvent.keyCode === keyCodes_1.KeyCode.Escape) {
                        DOM.EventHelper.stop(e, true);
                        _this.hide(true);
                    }
                })
                    .on(DOM.EventType.CONTEXT_MENU, function (e) { return DOM.EventHelper.stop(e, true); }) // Do this to fix an issue on Mac where the menu goes into the way
                    .on(DOM.EventType.FOCUS, function (e) { return _this.gainingFocus(); }, null, true)
                    .on(DOM.EventType.BLUR, function (e) { return _this.loosingFocus(e); }, null, true);
                // Progress Bar
                _this.progressBar = new progressbar_1.ProgressBar(div.clone());
                _this.progressBar.getContainer().hide();
                // Input Field
                div.div({ 'class': 'quick-open-input' }, function (inputContainer) {
                    _this.inputContainer = inputContainer;
                    _this.inputBox = new inputBox_1.InputBox(inputContainer.getHTMLElement(), null, {
                        placeholder: _this.options.inputPlaceHolder || '',
                        ariaLabel: DEFAULT_INPUT_ARIA_LABEL
                    });
                    // ARIA
                    _this.inputElement = _this.inputBox.inputElement;
                    _this.inputElement.setAttribute('role', 'combobox');
                    _this.inputElement.setAttribute('aria-haspopup', 'false');
                    _this.inputElement.setAttribute('aria-autocomplete', 'list');
                    DOM.addDisposableListener(_this.inputBox.inputElement, DOM.EventType.KEY_DOWN, function (e) {
                        var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                        // Do not handle Tab: It is used to navigate between elements without mouse
                        if (keyboardEvent.keyCode === keyCodes_1.KeyCode.Tab) {
                            return;
                        }
                        else if (keyboardEvent.keyCode === keyCodes_1.KeyCode.Tab || keyboardEvent.keyCode === keyCodes_1.KeyCode.DownArrow || keyboardEvent.keyCode === keyCodes_1.KeyCode.UpArrow || keyboardEvent.keyCode === keyCodes_1.KeyCode.PageDown || keyboardEvent.keyCode === keyCodes_1.KeyCode.PageUp) {
                            DOM.EventHelper.stop(e, true);
                            _this.navigateInTree(keyboardEvent.keyCode, keyboardEvent.shiftKey);
                        }
                        else if (keyboardEvent.keyCode === keyCodes_1.KeyCode.Enter) {
                            DOM.EventHelper.stop(e, true);
                            var focus_1 = _this.tree.getFocus();
                            if (focus_1) {
                                _this.elementSelected(focus_1, e);
                            }
                        }
                        else if (browser.isIE9 && (keyboardEvent.keyCode === keyCodes_1.KeyCode.Backspace || keyboardEvent.keyCode === keyCodes_1.KeyCode.Delete)) {
                            _this.onType();
                        }
                    });
                    DOM.addDisposableListener(_this.inputBox.inputElement, DOM.EventType.INPUT, function (e) {
                        _this.onType();
                    });
                });
                // Tree
                _this.treeContainer = div.div({
                    'class': 'quick-open-tree'
                }, function (div) {
                    _this.tree = new treeImpl_1.Tree(div.getHTMLElement(), {
                        dataSource: new quickOpenViewer_1.DataSource(_this),
                        controller: new QuickOpenController({ clickBehavior: treeDefaults_1.ClickBehavior.ON_MOUSE_UP }),
                        renderer: new quickOpenViewer_1.Renderer(_this),
                        filter: new quickOpenViewer_1.Filter(_this),
                        accessibilityProvider: new quickOpenViewer_1.AccessibilityProvider(_this)
                    }, {
                        twistiePixels: 11,
                        indentPixels: 0,
                        alwaysFocused: true,
                        verticalScrollMode: 'visible',
                        ariaLabel: nls.localize('treeAriaLabel', "Quick Picker")
                    });
                    _this.treeElement = _this.tree.getHTMLElement();
                    // Handle Focus and Selection event
                    _this.toUnbind.push(_this.tree.addListener(events_1.EventType.FOCUS, function (event) {
                        _this.elementFocused(event.focus, event);
                    }));
                    _this.toUnbind.push(_this.tree.addListener(events_1.EventType.SELECTION, function (event) {
                        if (event.selection && event.selection.length > 0) {
                            _this.elementSelected(event.selection[0], event);
                        }
                    }));
                }).
                    on(DOM.EventType.KEY_DOWN, function (e) {
                    var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    // Only handle when in quick navigation mode
                    if (!_this.quickNavigateConfiguration) {
                        return;
                    }
                    // Support keyboard navigation in quick navigation mode
                    if (keyboardEvent.keyCode === keyCodes_1.KeyCode.DownArrow || keyboardEvent.keyCode === keyCodes_1.KeyCode.UpArrow || keyboardEvent.keyCode === keyCodes_1.KeyCode.PageDown || keyboardEvent.keyCode === keyCodes_1.KeyCode.PageUp) {
                        DOM.EventHelper.stop(e, true);
                        _this.navigateInTree(keyboardEvent.keyCode);
                    }
                }).
                    on(DOM.EventType.KEY_UP, function (e) {
                    var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    var keyCode = keyboardEvent.keyCode;
                    // Only handle when in quick navigation mode
                    if (!_this.quickNavigateConfiguration) {
                        return;
                    }
                    // Select element when keys are pressed that signal it
                    var quickNavKeys = _this.quickNavigateConfiguration.keybindings;
                    var wasTriggerKeyPressed = keyCode === keyCodes_1.KeyCode.Enter || quickNavKeys.some(function (k) {
                        if (k.hasShift() && keyCode === keyCodes_1.KeyCode.Shift) {
                            if (keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey) {
                                return false; // this is an optimistic check for the shift key being used to navigate back in quick open
                            }
                            return true;
                        }
                        if (k.hasAlt() && keyCode === keyCodes_1.KeyCode.Alt) {
                            return true;
                        }
                        // Mac is a bit special
                        if (platform.isMacintosh) {
                            if (k.hasCtrlCmd() && keyCode === keyCodes_1.KeyCode.Meta) {
                                return true;
                            }
                            if (k.hasWinCtrl() && keyCode === keyCodes_1.KeyCode.Ctrl) {
                                return true;
                            }
                        }
                        else {
                            if (k.hasCtrlCmd() && keyCode === keyCodes_1.KeyCode.Ctrl) {
                                return true;
                            }
                            if (k.hasWinCtrl() && keyCode === keyCodes_1.KeyCode.Meta) {
                                return true;
                            }
                        }
                        return false;
                    });
                    if (wasTriggerKeyPressed) {
                        var focus_2 = _this.tree.getFocus();
                        if (focus_2) {
                            _this.elementSelected(focus_2, e);
                        }
                    }
                }).
                    clone();
            })
                .addClass('quick-open-widget')
                .addClass((browser.isIE10orEarlier) ? ' no-shadow' : '')
                .build(this.container);
            // Support layout
            if (this.layoutDimensions) {
                this.layout(this.layoutDimensions);
            }
        };
        QuickOpenWidget.prototype.onType = function () {
            var value = this.inputBox.value;
            // Adjust help text as needed if present
            if (this.helpText) {
                if (value) {
                    this.helpText.hide();
                }
                else {
                    this.helpText.show();
                }
            }
            // Send to callbacks
            this.callbacks.onType(value);
        };
        QuickOpenWidget.prototype.quickNavigate = function (configuration, next) {
            if (this.isVisible) {
                // Transition into quick navigate mode if not yet done
                if (!this.quickNavigateConfiguration) {
                    this.quickNavigateConfiguration = configuration;
                    this.tree.DOMFocus();
                }
                // Navigate
                this.navigateInTree(next ? keyCodes_1.KeyCode.DownArrow : keyCodes_1.KeyCode.UpArrow);
            }
        };
        QuickOpenWidget.prototype.navigateInTree = function (keyCode, isShift) {
            var model = this.tree.getInput();
            var entries = model ? model.entries : [];
            var focus = this.tree.getFocus();
            var cycled = false;
            var revealToTop = false;
            // Support cycle-through navigation
            if (entries.length > 1) {
                // Up from no entry or first entry goes down to last
                if ((keyCode === keyCodes_1.KeyCode.UpArrow || (keyCode === keyCodes_1.KeyCode.Tab && isShift)) && (focus === entries[0] || !focus)) {
                    this.tree.focusLast();
                    cycled = true;
                }
                else if ((keyCode === keyCodes_1.KeyCode.DownArrow || keyCode === keyCodes_1.KeyCode.Tab && !isShift) && focus === entries[entries.length - 1]) {
                    this.tree.focusFirst();
                    cycled = true;
                }
            }
            // Normal Navigation
            if (!cycled) {
                switch (keyCode) {
                    case keyCodes_1.KeyCode.DownArrow:
                        this.tree.focusNext();
                        break;
                    case keyCodes_1.KeyCode.UpArrow:
                        this.tree.focusPrevious();
                        break;
                    case keyCodes_1.KeyCode.PageDown:
                        this.tree.focusNextPage();
                        break;
                    case keyCodes_1.KeyCode.PageUp:
                        this.tree.focusPreviousPage();
                        break;
                    case keyCodes_1.KeyCode.Tab:
                        if (isShift) {
                            this.tree.focusPrevious();
                        }
                        else {
                            this.tree.focusNext();
                        }
                        break;
                }
            }
            // Reveal
            focus = this.tree.getFocus();
            if (focus) {
                revealToTop ? this.tree.reveal(focus, 0).done(null, errors.onUnexpectedError) : this.tree.reveal(focus).done(null, errors.onUnexpectedError);
            }
        };
        QuickOpenWidget.prototype.elementFocused = function (value, event) {
            if (!value || !this.isVisible()) {
                return;
            }
            // ARIA
            this.inputElement.setAttribute('aria-activedescendant', this.treeElement.getAttribute('aria-activedescendant'));
            var context = { event: event, quickNavigateConfiguration: this.quickNavigateConfiguration };
            this.model.runner.run(value, quickOpen_1.Mode.PREVIEW, context);
        };
        QuickOpenWidget.prototype.elementSelected = function (value, event) {
            var hide = true;
            // Trigger open of element on selection
            if (this.isVisible()) {
                var context = { event: event, quickNavigateConfiguration: this.quickNavigateConfiguration };
                hide = this.model.runner.run(value, quickOpen_1.Mode.OPEN, context);
            }
            // add telemetry when an item is accepted, logging the index of the item in the list and the length of the list
            // to measure the rate of the success and the relevance of the order
            if (this.usageLogger) {
                var indexOfAcceptedElement = this.model.entries.indexOf(value);
                var entriesCount = this.model.entries.length;
                this.usageLogger.publicLog('quickOpenWidgetItemAccepted', { index: indexOfAcceptedElement, count: entriesCount, isQuickNavigate: this.quickNavigateConfiguration ? true : false });
            }
            // Hide if command was run successfully
            if (hide) {
                this.hide();
            }
        };
        QuickOpenWidget.prototype.show = function (param, autoFocus, quickNavigateConfiguration) {
            if (types.isUndefined(autoFocus)) {
                autoFocus = {};
            }
            this.visible = true;
            this.isLoosingFocus = false;
            this.quickNavigateConfiguration = quickNavigateConfiguration;
            // Adjust UI for quick navigate mode
            if (this.quickNavigateConfiguration) {
                this.inputContainer.hide();
                if (this.options.enableAnimations) {
                    this.treeContainer.removeClass('transition');
                }
                this.builder.show();
                this.tree.DOMFocus();
            }
            else {
                this.inputContainer.show();
                if (this.options.enableAnimations) {
                    this.treeContainer.addClass('transition');
                }
                this.builder.show();
                this.inputBox.focus();
            }
            // Adjust Help text for IE
            if (this.helpText) {
                if (this.quickNavigateConfiguration || types.isString(param)) {
                    this.helpText.hide();
                }
                else {
                    this.helpText.show();
                }
            }
            // Show based on param
            if (types.isString(param)) {
                this.doShowWithPrefix(param);
            }
            else {
                this.doShowWithInput(param, autoFocus);
            }
            if (this.callbacks.onShow) {
                this.callbacks.onShow();
            }
        };
        QuickOpenWidget.prototype.doShowWithPrefix = function (prefix) {
            this.inputBox.value = prefix;
            this.callbacks.onType(prefix);
        };
        QuickOpenWidget.prototype.doShowWithInput = function (input, autoFocus) {
            this.setInput(input, autoFocus);
        };
        QuickOpenWidget.prototype.setInputAndLayout = function (input, autoFocus) {
            var _this = this;
            // Use a generated token to avoid race conditions from setting input
            var currentInputToken = uuid.generateUuid();
            this.currentInputToken = currentInputToken;
            // setInput and Layout
            this.setTreeHeightForInput(input).then(function () {
                if (_this.currentInputToken === currentInputToken) {
                    _this.tree.setInput(null).then(function () {
                        _this.model = input;
                        // ARIA
                        _this.inputElement.setAttribute('aria-haspopup', String(input && input.entries && input.entries.length > 0));
                        return _this.tree.setInput(input);
                    }).done(function () {
                        // Indicate entries to tree
                        _this.tree.layout();
                        // Handle auto focus
                        if (input && input.entries.some(function (e) { return _this.isElementVisible(input, e); })) {
                            _this.autoFocus(input, autoFocus);
                        }
                    }, errors.onUnexpectedError);
                }
            });
        };
        QuickOpenWidget.prototype.isElementVisible = function (input, e) {
            if (!input.filter) {
                return true;
            }
            return input.filter.isVisible(e);
        };
        QuickOpenWidget.prototype.autoFocus = function (input, autoFocus) {
            var _this = this;
            if (autoFocus === void 0) { autoFocus = {}; }
            var entries = input.entries.filter(function (e) { return _this.isElementVisible(input, e); });
            // First check for auto focus of prefix matches
            if (autoFocus.autoFocusPrefixMatch) {
                var caseSensitiveMatch = void 0;
                var caseInsensitiveMatch = void 0;
                var prefix = autoFocus.autoFocusPrefixMatch;
                var lowerCasePrefix = prefix.toLowerCase();
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    var label = input.dataSource.getLabel(entry);
                    if (!caseSensitiveMatch && label.indexOf(prefix) === 0) {
                        caseSensitiveMatch = entry;
                    }
                    else if (!caseInsensitiveMatch && label.toLowerCase().indexOf(lowerCasePrefix) === 0) {
                        caseInsensitiveMatch = entry;
                    }
                    if (caseSensitiveMatch && caseInsensitiveMatch) {
                        break;
                    }
                }
                var entryToFocus = caseSensitiveMatch || caseInsensitiveMatch;
                if (entryToFocus) {
                    this.tree.setFocus(entryToFocus);
                    this.tree.reveal(entryToFocus, 0).done(null, errors.onUnexpectedError);
                    return;
                }
            }
            // Second check for auto focus of first entry
            if (autoFocus.autoFocusFirstEntry) {
                this.tree.focusFirst();
                this.tree.reveal(this.tree.getFocus(), 0).done(null, errors.onUnexpectedError);
            }
            else if (typeof autoFocus.autoFocusIndex === 'number') {
                if (entries.length > autoFocus.autoFocusIndex) {
                    this.tree.focusNth(autoFocus.autoFocusIndex);
                    this.tree.reveal(this.tree.getFocus()).done(null, errors.onUnexpectedError);
                }
            }
            else if (autoFocus.autoFocusSecondEntry) {
                if (entries.length > 1) {
                    this.tree.focusNth(1);
                }
            }
        };
        QuickOpenWidget.prototype.refresh = function (input, autoFocus) {
            var _this = this;
            if (!this.isVisible()) {
                return;
            }
            // Apply height & Refresh
            this.setTreeHeightForInput(input).then(function () {
                _this.tree.refresh().done(function () {
                    // Indicate entries to tree
                    _this.tree.layout();
                    // Handle auto focus
                    if (!_this.tree.getFocus() && input && input.entries.some(function (e) { return _this.isElementVisible(input, e); })) {
                        _this.autoFocus(input, autoFocus);
                    }
                }, errors.onUnexpectedError);
            });
        };
        QuickOpenWidget.prototype.setTreeHeightForInput = function (input) {
            var _this = this;
            var newHeight = this.getHeight(input) + 'px';
            var oldHeight = this.treeContainer.style('height');
            // Apply
            this.treeContainer.style({ height: newHeight });
            // Return instantly if we don't CSS transition or the height is the same as old
            if (!this.treeContainer.hasClass('transition') || oldHeight === newHeight) {
                return winjs_base_1.TPromise.as(null);
            }
            // Otherwise return promise that only fulfills when the CSS transition has ended
            return new winjs_base_1.TPromise(function (c, e) {
                var unbind = [];
                var complete = false;
                var completeHandler = function () {
                    if (!complete) {
                        complete = true;
                        unbind = lifecycle_1.dispose(unbind);
                        c(null);
                    }
                };
                _this.treeContainer.once('webkitTransitionEnd', completeHandler, unbind);
                _this.treeContainer.once('transitionend', completeHandler, unbind);
            });
        };
        QuickOpenWidget.prototype.getHeight = function (input) {
            var _this = this;
            var renderer = input.renderer;
            if (!input) {
                var itemHeight = renderer.getHeight(null);
                return this.options.minItemsToShow ? this.options.minItemsToShow * itemHeight : 0;
            }
            var height = 0;
            var preferredItemsHeight;
            if (this.layoutDimensions && this.layoutDimensions.height) {
                preferredItemsHeight = (this.layoutDimensions.height - 50 /* subtract height of input field (30px) and some spacing (drop shadow) to fit */) * 0.40 /* max 40% of screen */;
            }
            if (!preferredItemsHeight || preferredItemsHeight > QuickOpenWidget.MAX_ITEMS_HEIGHT) {
                preferredItemsHeight = QuickOpenWidget.MAX_ITEMS_HEIGHT;
            }
            var entries = input.entries.filter(function (e) { return _this.isElementVisible(input, e); });
            var maxEntries = this.options.maxItemsToShow || entries.length;
            for (var i = 0; i < maxEntries && i < entries.length; i++) {
                var entryHeight = renderer.getHeight(entries[i]);
                if (height + entryHeight <= preferredItemsHeight) {
                    height += entryHeight;
                }
                else {
                    break;
                }
            }
            return height;
        };
        QuickOpenWidget.prototype.hide = function (isCancel) {
            var _this = this;
            if (isCancel === void 0) { isCancel = false; }
            if (!this.isVisible()) {
                return;
            }
            this.visible = false;
            this.builder.hide();
            this.builder.domBlur();
            // report failure cases
            if (isCancel) {
                if (this.model) {
                    var entriesCount = this.model.entries.filter(function (e) { return _this.isElementVisible(_this.model, e); }).length;
                    if (this.usageLogger) {
                        this.usageLogger.publicLog('quickOpenWidgetCancelled', { count: entriesCount, isQuickNavigate: this.quickNavigateConfiguration ? true : false });
                    }
                }
            }
            // Clear input field and clear tree
            this.inputBox.value = '';
            this.tree.setInput(null);
            // ARIA
            this.inputElement.setAttribute('aria-haspopup', 'false');
            // Reset Tree Height
            this.treeContainer.style({ height: (this.options.minItemsToShow ? this.options.minItemsToShow * 22 : 0) + 'px' });
            // Clear any running Progress
            this.progressBar.stop().getContainer().hide();
            // Clear Focus
            if (this.tree.isDOMFocused()) {
                this.tree.DOMBlur();
            }
            else if (this.inputBox.hasFocus()) {
                this.inputBox.blur();
            }
            // Callbacks
            if (isCancel) {
                this.callbacks.onCancel();
            }
            else {
                this.callbacks.onOk();
            }
            if (this.callbacks.onHide) {
                this.callbacks.onHide();
            }
        };
        QuickOpenWidget.prototype.setPlaceHolder = function (placeHolder) {
            if (this.inputBox) {
                this.inputBox.setPlaceHolder(placeHolder);
            }
        };
        QuickOpenWidget.prototype.setValue = function (value) {
            if (this.inputBox) {
                this.inputBox.value = value;
                this.inputBox.select();
            }
        };
        QuickOpenWidget.prototype.setPassword = function (isPassword) {
            if (this.inputBox) {
                this.inputBox.inputElement.type = isPassword ? 'password' : 'text';
            }
        };
        QuickOpenWidget.prototype.setInput = function (input, autoFocus, ariaLabel) {
            if (!this.isVisible()) {
                return;
            }
            // Adapt tree height to entries and apply input
            this.setInputAndLayout(input, autoFocus);
            // Apply ARIA
            if (this.inputBox) {
                this.inputBox.setAriaLabel(ariaLabel || DEFAULT_INPUT_ARIA_LABEL);
            }
        };
        QuickOpenWidget.prototype.getInput = function () {
            return this.tree.getInput();
        };
        QuickOpenWidget.prototype.showInputDecoration = function (decoration) {
            if (this.inputBox) {
                this.inputBox.showMessage({ type: decoration === severity_1.default.Info ? inputBox_1.MessageType.INFO : decoration === severity_1.default.Warning ? inputBox_1.MessageType.WARNING : inputBox_1.MessageType.ERROR, content: '' });
            }
        };
        QuickOpenWidget.prototype.clearInputDecoration = function () {
            if (this.inputBox) {
                this.inputBox.hideMessage();
            }
        };
        QuickOpenWidget.prototype.runFocus = function () {
            var focus = this.tree.getFocus();
            if (focus) {
                this.elementSelected(focus);
                return true;
            }
            return false;
        };
        QuickOpenWidget.prototype.getProgressBar = function () {
            return this.progressBar;
        };
        QuickOpenWidget.prototype.setExtraClass = function (clazz) {
            var previousClass = this.builder.getProperty('extra-class');
            if (previousClass) {
                this.builder.removeClass(previousClass);
            }
            if (clazz) {
                this.builder.addClass(clazz);
                this.builder.setProperty('extra-class', clazz);
            }
            else if (previousClass) {
                this.builder.removeProperty('extra-class');
            }
        };
        QuickOpenWidget.prototype.isVisible = function () {
            return this.visible;
        };
        QuickOpenWidget.prototype.layout = function (dimension) {
            this.layoutDimensions = dimension;
            // Apply to quick open width (height is dynamic by number of items to show)
            var quickOpenWidth = Math.min(this.layoutDimensions.width * 0.62 /* golden cut */, QuickOpenWidget.MAX_WIDTH);
            if (this.builder) {
                // quick open
                this.builder.style({
                    width: quickOpenWidth + 'px',
                    marginLeft: '-' + (quickOpenWidth / 2) + 'px'
                });
                // input field
                this.inputContainer.style({
                    width: (quickOpenWidth - 12) + 'px'
                });
            }
        };
        QuickOpenWidget.prototype.gainingFocus = function () {
            this.isLoosingFocus = false;
        };
        QuickOpenWidget.prototype.loosingFocus = function (e) {
            var _this = this;
            if (!this.isVisible()) {
                return;
            }
            var relatedTarget = e.relatedTarget;
            if (!this.quickNavigateConfiguration && DOM.isAncestor(relatedTarget, this.builder.getHTMLElement())) {
                return; // user clicked somewhere into quick open widget, do not close thereby
            }
            this.isLoosingFocus = true;
            winjs_base_1.TPromise.timeout(0).then(function () {
                if (!_this.isLoosingFocus) {
                    return;
                }
                var veto = _this.callbacks.onFocusLost && _this.callbacks.onFocusLost();
                if (!veto) {
                    _this.hide(false /* Do not treat loosing focus as cancel! */);
                }
            });
        };
        QuickOpenWidget.prototype.dispose = function () {
            while (this.toUnbind.length) {
                this.toUnbind.pop()();
            }
            this.progressBar.dispose();
            this.inputBox.dispose();
            this.tree.dispose();
        };
        QuickOpenWidget.MAX_WIDTH = 600; // Max total width of quick open widget
        QuickOpenWidget.MAX_ITEMS_HEIGHT = 20 * 22; // Max height of item list below input field
        return QuickOpenWidget;
    }());
    exports.QuickOpenWidget = QuickOpenWidget;
});
//# sourceMappingURL=quickOpenWidget.js.map