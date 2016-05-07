/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/find/browser/findWidget', 'vs/base/common/errors', 'vs/base/common/keyCodes', 'vs/base/common/strings', 'vs/base/browser/dom', 'vs/base/browser/ui/findinput/findInput', 'vs/base/browser/ui/inputbox/inputBox', 'vs/base/browser/ui/widget', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser', 'vs/editor/contrib/find/common/findModel', 'vs/css!./findWidget'], function (require, exports, nls, errors_1, keyCodes_1, strings, dom, findInput_1, inputBox_1, widget_1, editorCommon_1, editorBrowser_1, findModel_1) {
    'use strict';
    var NLS_FIND_INPUT_LABEL = nls.localize(0, null);
    var NLS_FIND_INPUT_PLACEHOLDER = nls.localize(1, null);
    var NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize(2, null);
    var NLS_NEXT_MATCH_BTN_LABEL = nls.localize(3, null);
    var NLS_TOGGLE_SELECTION_FIND_TITLE = nls.localize(4, null);
    var NLS_CLOSE_BTN_LABEL = nls.localize(5, null);
    var NLS_REPLACE_INPUT_LABEL = nls.localize(6, null);
    var NLS_REPLACE_INPUT_PLACEHOLDER = nls.localize(7, null);
    var NLS_REPLACE_BTN_LABEL = nls.localize(8, null);
    var NLS_REPLACE_ALL_BTN_LABEL = nls.localize(9, null);
    var NLS_TOGGLE_REPLACE_MODE_BTN_LABEL = nls.localize(10, null);
    var NLS_MATCHES_COUNT_LIMIT_TITLE = nls.localize(11, null);
    var NLS_MATCHES_LOCATION = nls.localize(12, null);
    var NLS_NO_RESULTS = nls.localize(13, null);
    var FindWidget = (function (_super) {
        __extends(FindWidget, _super);
        function FindWidget(codeEditor, controller, state, contextViewProvider, keybindingService) {
            var _this = this;
            _super.call(this);
            this._codeEditor = codeEditor;
            this._controller = controller;
            this._state = state;
            this._contextViewProvider = contextViewProvider;
            this._keybindingService = keybindingService;
            this._isVisible = false;
            this._isReplaceVisible = false;
            this._register(this._state.addChangeListener(function (e) { return _this._onStateChanged(e); }));
            this._buildDomNode();
            this._updateButtons();
            this.focusTracker = this._register(dom.trackFocus(this._findInput.inputBox.inputElement));
            this.focusTracker.addFocusListener(function () { return _this._reseedFindScope(); });
            this._register(this._codeEditor.addListener2(editorCommon_1.EventType.ConfigurationChanged, function (e) {
                if (e.readOnly) {
                    if (_this._codeEditor.getConfiguration().readOnly) {
                        // Hide replace part if editor becomes read only
                        _this._state.change({ isReplaceRevealed: false }, false);
                    }
                    _this._updateButtons();
                }
            }));
            this._register(this._codeEditor.addListener2(editorCommon_1.EventType.CursorSelectionChanged, function () {
                if (_this._isVisible) {
                    _this._updateToggleSelectionFindButton();
                }
            }));
            this._codeEditor.addOverlayWidget(this);
        }
        FindWidget.prototype._reseedFindScope = function () {
            var selection = this._codeEditor.getSelection();
            if (selection.startLineNumber !== selection.endLineNumber) {
                // Reseed find scope
                this._state.change({ searchScope: selection }, true);
            }
        };
        // ----- IOverlayWidget API
        FindWidget.prototype.getId = function () {
            return FindWidget.ID;
        };
        FindWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        FindWidget.prototype.getPosition = function () {
            if (this._isVisible) {
                return {
                    preference: editorBrowser_1.OverlayWidgetPositionPreference.TOP_RIGHT_CORNER
                };
            }
            return null;
        };
        // ----- React to state changes
        FindWidget.prototype._onStateChanged = function (e) {
            if (e.searchString) {
                this._findInput.setValue(this._state.searchString);
                this._updateButtons();
            }
            if (e.replaceString) {
                this._replaceInputBox.value = this._state.replaceString;
            }
            if (e.isRevealed) {
                if (this._state.isRevealed) {
                    this._reveal(true);
                }
                else {
                    this._hide(true);
                }
            }
            if (e.isReplaceRevealed) {
                if (this._state.isReplaceRevealed) {
                    if (!this._codeEditor.getConfiguration().readOnly && !this._isReplaceVisible) {
                        this._isReplaceVisible = true;
                        this._updateButtons();
                    }
                }
                else {
                    if (this._isReplaceVisible) {
                        this._isReplaceVisible = false;
                        this._updateButtons();
                    }
                }
            }
            if (e.isRegex) {
                this._findInput.setRegex(this._state.isRegex);
            }
            if (e.wholeWord) {
                this._findInput.setWholeWords(this._state.wholeWord);
            }
            if (e.matchCase) {
                this._findInput.setCaseSensitive(this._state.matchCase);
            }
            if (e.searchScope) {
                if (this._state.searchScope) {
                    this._toggleSelectionFind.checked = true;
                }
                else {
                    this._toggleSelectionFind.checked = false;
                }
                this._updateToggleSelectionFindButton();
            }
            if (e.searchString || e.matchesCount || e.matchesPosition) {
                var showRedOutline = (this._state.searchString.length > 0 && this._state.matchesCount === 0);
                dom.toggleClass(this._domNode, 'no-results', showRedOutline);
                this._updateMatchesCount();
            }
        };
        FindWidget.prototype._updateMatchesCount = function () {
            if (this._state.matchesCount >= findModel_1.MATCHES_LIMIT) {
                this._matchesCount.title = NLS_MATCHES_COUNT_LIMIT_TITLE;
            }
            else {
                this._matchesCount.title = '';
            }
            // remove previous content
            if (this._matchesCount.firstChild) {
                this._matchesCount.removeChild(this._matchesCount.firstChild);
            }
            var label;
            if (this._state.matchesCount > 0) {
                var matchesCount = String(this._state.matchesCount);
                if (this._state.matchesCount >= findModel_1.MATCHES_LIMIT) {
                    matchesCount += '+';
                }
                var matchesPosition = String(this._state.matchesPosition);
                if (matchesPosition === '0') {
                    matchesPosition = '?';
                }
                label = strings.format(NLS_MATCHES_LOCATION, matchesPosition, matchesCount);
            }
            else {
                label = NLS_NO_RESULTS;
            }
            this._matchesCount.appendChild(document.createTextNode(label));
        };
        // ----- actions
        /**
         * If 'selection find' is ON we should not disable the button (its function is to cancel 'selection find').
         * If 'selection find' is OFF we enable the button only if there is a multi line selection.
         */
        FindWidget.prototype._updateToggleSelectionFindButton = function () {
            var selection = this._codeEditor.getSelection();
            var isMultiLineSelection = selection ? (selection.startLineNumber !== selection.endLineNumber) : false;
            var isChecked = this._toggleSelectionFind.checked;
            this._toggleSelectionFind.setEnabled(this._isVisible && (isChecked || isMultiLineSelection));
        };
        FindWidget.prototype._updateButtons = function () {
            this._findInput.setEnabled(this._isVisible);
            this._replaceInputBox.setEnabled(this._isVisible && this._isReplaceVisible);
            this._updateToggleSelectionFindButton();
            this._closeBtn.setEnabled(this._isVisible);
            var findInputIsNonEmpty = (this._state.searchString.length > 0);
            this._prevBtn.setEnabled(this._isVisible && findInputIsNonEmpty);
            this._nextBtn.setEnabled(this._isVisible && findInputIsNonEmpty);
            this._replaceBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
            this._replaceAllBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
            dom.toggleClass(this._domNode, 'replaceToggled', this._isReplaceVisible);
            this._toggleReplaceBtn.toggleClass('collapse', !this._isReplaceVisible);
            this._toggleReplaceBtn.toggleClass('expand', this._isReplaceVisible);
            this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
            var canReplace = !this._codeEditor.getConfiguration().readOnly;
            this._toggleReplaceBtn.setEnabled(this._isVisible && canReplace);
        };
        FindWidget.prototype._reveal = function (animate) {
            var _this = this;
            if (!this._isVisible) {
                this._isVisible = true;
                this._updateButtons();
                setTimeout(function () {
                    dom.addClass(_this._domNode, 'visible');
                    if (!animate) {
                        dom.addClass(_this._domNode, 'noanimation');
                        setTimeout(function () {
                            dom.removeClass(_this._domNode, 'noanimation');
                        }, 200);
                    }
                }, 0);
                this._codeEditor.layoutOverlayWidget(this);
            }
        };
        FindWidget.prototype._hide = function (focusTheEditor) {
            if (this._isVisible) {
                this._isVisible = false;
                this._updateButtons();
                dom.removeClass(this._domNode, 'visible');
                if (focusTheEditor) {
                    this._codeEditor.focus();
                }
                this._codeEditor.layoutOverlayWidget(this);
            }
        };
        // ----- Public
        FindWidget.prototype.focusFindInput = function () {
            this._findInput.select();
            // Edge browser requires focus() in addition to select()
            this._findInput.focus();
        };
        FindWidget.prototype.focusReplaceInput = function () {
            this._replaceInputBox.select();
            // Edge browser requires focus() in addition to select()
            this._replaceInputBox.focus();
        };
        FindWidget.prototype._onFindInputKeyDown = function (e) {
            switch (e.asKeybinding()) {
                case keyCodes_1.CommonKeybindings.ENTER:
                    this._codeEditor.getAction(findModel_1.FIND_IDS.NextMatchFindAction).run().done(null, errors_1.onUnexpectedError);
                    e.preventDefault();
                    return;
                case keyCodes_1.CommonKeybindings.SHIFT_ENTER:
                    this._codeEditor.getAction(findModel_1.FIND_IDS.PreviousMatchFindAction).run().done(null, errors_1.onUnexpectedError);
                    e.preventDefault();
                    return;
                case keyCodes_1.CommonKeybindings.TAB:
                    if (this._isReplaceVisible) {
                        this._replaceInputBox.focus();
                    }
                    else {
                        this._findInput.focusOnCaseSensitive();
                    }
                    e.preventDefault();
                    return;
                case keyCodes_1.CommonKeybindings.CTRLCMD_DOWN_ARROW:
                    this._codeEditor.focus();
                    e.preventDefault();
                    return;
            }
        };
        FindWidget.prototype._onReplaceInputKeyDown = function (e) {
            switch (e.asKeybinding()) {
                case keyCodes_1.CommonKeybindings.ENTER:
                    this._controller.replace();
                    e.preventDefault();
                    return;
                case keyCodes_1.CommonKeybindings.CTRLCMD_ENTER:
                    this._controller.replaceAll();
                    e.preventDefault();
                    return;
                case keyCodes_1.CommonKeybindings.TAB:
                    this._findInput.focusOnCaseSensitive();
                    e.preventDefault();
                    return;
                case keyCodes_1.CommonKeybindings.SHIFT_TAB:
                    this._findInput.focus();
                    e.preventDefault();
                    return;
                case keyCodes_1.CommonKeybindings.CTRLCMD_DOWN_ARROW:
                    this._codeEditor.focus();
                    e.preventDefault();
                    return;
            }
        };
        // ----- initialization
        FindWidget.prototype._keybindingLabelFor = function (actionId) {
            var keybindings = this._keybindingService.lookupKeybindings(actionId);
            if (keybindings.length === 0) {
                return '';
            }
            return ' (' + this._keybindingService.getLabelFor(keybindings[0]) + ')';
        };
        FindWidget.prototype._buildFindPart = function () {
            var _this = this;
            // Find input
            this._findInput = this._register(new findInput_1.FindInput(null, this._contextViewProvider, {
                width: FindWidget.FIND_INPUT_AREA_WIDTH,
                label: NLS_FIND_INPUT_LABEL,
                placeholder: NLS_FIND_INPUT_PLACEHOLDER,
                appendCaseSensitiveLabel: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleCaseSensitiveCommand),
                appendWholeWordsLabel: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleWholeWordCommand),
                appendRegexLabel: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleRegexCommand),
                validation: function (value) {
                    if (value.length === 0) {
                        return null;
                    }
                    if (!_this._findInput.getRegex()) {
                        return null;
                    }
                    try {
                        /* tslint:disable:no-unused-expression */
                        new RegExp(value);
                        /* tslint:enable:no-unused-expression */
                        return null;
                    }
                    catch (e) {
                        return { content: e.message };
                    }
                }
            }));
            this._register(this._findInput.onKeyDown(function (e) { return _this._onFindInputKeyDown(e); }));
            this._register(this._findInput.onInput(function () {
                _this._state.change({ searchString: _this._findInput.getValue() }, true);
            }));
            this._register(this._findInput.onDidOptionChange(function () {
                _this._state.change({
                    isRegex: _this._findInput.getRegex(),
                    wholeWord: _this._findInput.getWholeWords(),
                    matchCase: _this._findInput.getCaseSensitive()
                }, true);
            }));
            this._register(this._findInput.onCaseSensitiveKeyDown(function (e) {
                if (e.equals(keyCodes_1.CommonKeybindings.SHIFT_TAB)) {
                    if (_this._isReplaceVisible) {
                        _this._replaceInputBox.focus();
                        e.preventDefault();
                    }
                }
            }));
            this._matchesCount = document.createElement('div');
            this._matchesCount.className = 'matchesCount';
            this._updateMatchesCount();
            // Previous button
            this._prevBtn = this._register(new SimpleButton({
                label: NLS_PREVIOUS_MATCH_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.PreviousMatchFindAction),
                className: 'previous',
                onTrigger: function () {
                    _this._codeEditor.getAction(findModel_1.FIND_IDS.PreviousMatchFindAction).run().done(null, errors_1.onUnexpectedError);
                },
                onKeyDown: function (e) { }
            }));
            // Next button
            this._nextBtn = this._register(new SimpleButton({
                label: NLS_NEXT_MATCH_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.NextMatchFindAction),
                className: 'next',
                onTrigger: function () {
                    _this._codeEditor.getAction(findModel_1.FIND_IDS.NextMatchFindAction).run().done(null, errors_1.onUnexpectedError);
                },
                onKeyDown: function (e) { }
            }));
            var findPart = document.createElement('div');
            findPart.className = 'find-part';
            findPart.appendChild(this._findInput.domNode);
            findPart.appendChild(this._matchesCount);
            findPart.appendChild(this._prevBtn.domNode);
            findPart.appendChild(this._nextBtn.domNode);
            // Toggle selection button
            this._toggleSelectionFind = this._register(new SimpleCheckbox({
                parent: findPart,
                title: NLS_TOGGLE_SELECTION_FIND_TITLE,
                onChange: function () {
                    if (_this._toggleSelectionFind.checked) {
                        _this._reseedFindScope();
                    }
                    else {
                        _this._state.change({ searchScope: null }, true);
                    }
                }
            }));
            // Close button
            this._closeBtn = this._register(new SimpleButton({
                label: NLS_CLOSE_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.CloseFindWidgetCommand),
                className: 'close-fw',
                onTrigger: function () {
                    _this._state.change({ isRevealed: false }, false);
                },
                onKeyDown: function (e) {
                    if (e.equals(keyCodes_1.CommonKeybindings.TAB)) {
                        if (_this._isReplaceVisible) {
                            if (_this._replaceBtn.isEnabled()) {
                                _this._replaceBtn.focus();
                            }
                            else {
                                _this._codeEditor.focus();
                            }
                            e.preventDefault();
                        }
                    }
                }
            }));
            findPart.appendChild(this._closeBtn.domNode);
            return findPart;
        };
        FindWidget.prototype._buildReplacePart = function () {
            var _this = this;
            // Replace input
            var replaceInput = document.createElement('div');
            replaceInput.className = 'replace-input';
            replaceInput.style.width = FindWidget.REPLACE_INPUT_AREA_WIDTH + 'px';
            this._replaceInputBox = this._register(new inputBox_1.InputBox(replaceInput, null, {
                ariaLabel: NLS_REPLACE_INPUT_LABEL,
                placeholder: NLS_REPLACE_INPUT_PLACEHOLDER
            }));
            this._register(dom.addStandardDisposableListener(this._replaceInputBox.inputElement, 'keydown', function (e) { return _this._onReplaceInputKeyDown(e); }));
            this._register(dom.addStandardDisposableListener(this._replaceInputBox.inputElement, 'input', function (e) {
                _this._state.change({ replaceString: _this._replaceInputBox.value }, false);
            }));
            // Replace one button
            this._replaceBtn = this._register(new SimpleButton({
                label: NLS_REPLACE_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.ReplaceOneAction),
                className: 'replace',
                onTrigger: function () {
                    _this._controller.replace();
                },
                onKeyDown: function (e) {
                    if (e.equals(keyCodes_1.CommonKeybindings.SHIFT_TAB)) {
                        _this._closeBtn.focus();
                        e.preventDefault();
                    }
                }
            }));
            // Replace all button
            this._replaceAllBtn = this._register(new SimpleButton({
                label: NLS_REPLACE_ALL_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.ReplaceAllAction),
                className: 'replace-all',
                onTrigger: function () {
                    _this._controller.replaceAll();
                },
                onKeyDown: function (e) { }
            }));
            var replacePart = document.createElement('div');
            replacePart.className = 'replace-part';
            replacePart.appendChild(replaceInput);
            replacePart.appendChild(this._replaceBtn.domNode);
            replacePart.appendChild(this._replaceAllBtn.domNode);
            return replacePart;
        };
        FindWidget.prototype._buildDomNode = function () {
            var _this = this;
            // Find part
            var findPart = this._buildFindPart();
            // Replace part
            var replacePart = this._buildReplacePart();
            // Toggle replace button
            this._toggleReplaceBtn = this._register(new SimpleButton({
                label: NLS_TOGGLE_REPLACE_MODE_BTN_LABEL,
                className: 'toggle left',
                onTrigger: function () {
                    _this._state.change({ isReplaceRevealed: !_this._isReplaceVisible }, true);
                },
                onKeyDown: function (e) { }
            }));
            this._toggleReplaceBtn.toggleClass('expand', this._isReplaceVisible);
            this._toggleReplaceBtn.toggleClass('collapse', !this._isReplaceVisible);
            this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
            // Widget
            this._domNode = document.createElement('div');
            this._domNode.className = 'editor-widget find-widget';
            this._domNode.setAttribute('aria-hidden', 'false');
            this._domNode.appendChild(this._toggleReplaceBtn.domNode);
            this._domNode.appendChild(findPart);
            this._domNode.appendChild(replacePart);
        };
        FindWidget.ID = 'editor.contrib.findWidget';
        FindWidget.PART_WIDTH = 275;
        FindWidget.FIND_INPUT_AREA_WIDTH = FindWidget.PART_WIDTH - 54;
        FindWidget.REPLACE_INPUT_AREA_WIDTH = FindWidget.FIND_INPUT_AREA_WIDTH;
        return FindWidget;
    }(widget_1.Widget));
    exports.FindWidget = FindWidget;
    var SimpleCheckbox = (function (_super) {
        __extends(SimpleCheckbox, _super);
        function SimpleCheckbox(opts) {
            var _this = this;
            _super.call(this);
            this._opts = opts;
            this._domNode = document.createElement('div');
            this._domNode.className = 'monaco-checkbox';
            this._domNode.title = this._opts.title;
            this._checkbox = document.createElement('input');
            this._checkbox.type = 'checkbox';
            this._checkbox.className = 'checkbox';
            this._checkbox.id = 'checkbox-' + SimpleCheckbox._COUNTER++;
            this._label = document.createElement('label');
            this._label.className = 'label';
            // Connect the label and the checkbox. Checkbox will get checked when the label recieves a click.
            this._label.htmlFor = this._checkbox.id;
            this._domNode.appendChild(this._checkbox);
            this._domNode.appendChild(this._label);
            this._opts.parent.appendChild(this._domNode);
            this.onchange(this._checkbox, function (e) {
                _this._opts.onChange();
            });
        }
        Object.defineProperty(SimpleCheckbox.prototype, "domNode", {
            get: function () {
                return this._domNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SimpleCheckbox.prototype, "checked", {
            get: function () {
                return this._checkbox.checked;
            },
            set: function (newValue) {
                this._checkbox.checked = newValue;
            },
            enumerable: true,
            configurable: true
        });
        SimpleCheckbox.prototype.focus = function () {
            this._checkbox.focus();
        };
        SimpleCheckbox.prototype.enable = function () {
            this._checkbox.removeAttribute('disabled');
        };
        SimpleCheckbox.prototype.disable = function () {
            this._checkbox.disabled = true;
        };
        SimpleCheckbox.prototype.setEnabled = function (enabled) {
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        };
        SimpleCheckbox._COUNTER = 0;
        return SimpleCheckbox;
    }(widget_1.Widget));
    var SimpleButton = (function (_super) {
        __extends(SimpleButton, _super);
        function SimpleButton(opts) {
            var _this = this;
            _super.call(this);
            this._opts = opts;
            this._domNode = document.createElement('div');
            this._domNode.title = this._opts.label;
            this._domNode.tabIndex = 0;
            this._domNode.className = 'button ' + this._opts.className;
            this._domNode.setAttribute('role', 'button');
            this._domNode.setAttribute('aria-label', this._opts.label);
            this.onclick(this._domNode, function (e) {
                _this._opts.onTrigger();
                e.preventDefault();
            });
            this.onkeydown(this._domNode, function (e) {
                if (e.equals(keyCodes_1.CommonKeybindings.SPACE) || e.equals(keyCodes_1.CommonKeybindings.ENTER)) {
                    _this._opts.onTrigger();
                    e.preventDefault();
                    return;
                }
                _this._opts.onKeyDown(e);
            });
        }
        Object.defineProperty(SimpleButton.prototype, "domNode", {
            get: function () {
                return this._domNode;
            },
            enumerable: true,
            configurable: true
        });
        SimpleButton.prototype.isEnabled = function () {
            return (this._domNode.tabIndex >= 0);
        };
        SimpleButton.prototype.focus = function () {
            this._domNode.focus();
        };
        SimpleButton.prototype.setEnabled = function (enabled) {
            dom.toggleClass(this._domNode, 'disabled', !enabled);
            this._domNode.setAttribute('aria-disabled', String(!enabled));
            this._domNode.tabIndex = enabled ? 0 : -1;
        };
        SimpleButton.prototype.setExpanded = function (expanded) {
            this._domNode.setAttribute('aria-expanded', String(expanded));
        };
        SimpleButton.prototype.toggleClass = function (className, shouldHaveIt) {
            dom.toggleClass(this._domNode, className, shouldHaveIt);
        };
        return SimpleButton;
    }(widget_1.Widget));
});
//# sourceMappingURL=findWidget.js.map