var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/event', 'vs/base/common/lifecycle', 'vs/base/browser/browser', 'vs/base/browser/dom', 'vs/base/browser/styleMutator', 'vs/editor/common/config/commonEditorConfig', 'vs/editor/common/controller/textAreaHandler', 'vs/editor/common/controller/textAreaState', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/common/viewModel/viewEventHandler'], function (require, exports, event_1, lifecycle_1, browser, dom, styleMutator_1, commonEditorConfig_1, textAreaHandler_1, textAreaState_1, range_1, editorCommon, viewEventHandler_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ClipboardEventWrapper = (function () {
        function ClipboardEventWrapper(event) {
            this._event = event;
        }
        ClipboardEventWrapper.prototype.canUseTextData = function () {
            if (this._event.clipboardData) {
                return true;
            }
            if (window.clipboardData) {
                return true;
            }
            return false;
        };
        ClipboardEventWrapper.prototype.setTextData = function (text) {
            if (this._event.clipboardData) {
                this._event.clipboardData.setData('text/plain', text);
                this._event.preventDefault();
                return;
            }
            if (window.clipboardData) {
                window.clipboardData.setData('Text', text);
                this._event.preventDefault();
                return;
            }
            throw new Error('ClipboardEventWrapper.setTextData: Cannot use text data!');
        };
        ClipboardEventWrapper.prototype.getTextData = function () {
            if (this._event.clipboardData) {
                this._event.preventDefault();
                return this._event.clipboardData.getData('text/plain');
            }
            if (window.clipboardData) {
                this._event.preventDefault();
                return window.clipboardData.getData('Text');
            }
            throw new Error('ClipboardEventWrapper.getTextData: Cannot use text data!');
        };
        return ClipboardEventWrapper;
    }());
    var KeyboardEventWrapper = (function () {
        function KeyboardEventWrapper(actual) {
            this._actual = actual;
        }
        KeyboardEventWrapper.prototype.equals = function (keybinding) {
            return this._actual.equals(keybinding);
        };
        KeyboardEventWrapper.prototype.preventDefault = function () {
            this._actual.preventDefault();
        };
        KeyboardEventWrapper.prototype.isDefaultPrevented = function () {
            if (this._actual.browserEvent) {
                return this._actual.browserEvent.defaultPrevented;
            }
            return false;
        };
        return KeyboardEventWrapper;
    }());
    var TextAreaWrapper = (function (_super) {
        __extends(TextAreaWrapper, _super);
        function TextAreaWrapper(textArea) {
            var _this = this;
            _super.call(this);
            this._onKeyDown = this._register(new event_1.Emitter());
            this.onKeyDown = this._onKeyDown.event;
            this._onKeyUp = this._register(new event_1.Emitter());
            this.onKeyUp = this._onKeyUp.event;
            this._onKeyPress = this._register(new event_1.Emitter());
            this.onKeyPress = this._onKeyPress.event;
            this._onCompositionStart = this._register(new event_1.Emitter());
            this.onCompositionStart = this._onCompositionStart.event;
            this._onCompositionEnd = this._register(new event_1.Emitter());
            this.onCompositionEnd = this._onCompositionEnd.event;
            this._onInput = this._register(new event_1.Emitter());
            this.onInput = this._onInput.event;
            this._onCut = this._register(new event_1.Emitter());
            this.onCut = this._onCut.event;
            this._onCopy = this._register(new event_1.Emitter());
            this.onCopy = this._onCopy.event;
            this._onPaste = this._register(new event_1.Emitter());
            this.onPaste = this._onPaste.event;
            this._textArea = textArea;
            this._register(dom.addStandardDisposableListener(this._textArea, 'keydown', function (e) { return _this._onKeyDown.fire(new KeyboardEventWrapper(e)); }));
            this._register(dom.addStandardDisposableListener(this._textArea, 'keyup', function (e) { return _this._onKeyUp.fire(new KeyboardEventWrapper(e)); }));
            this._register(dom.addStandardDisposableListener(this._textArea, 'keypress', function (e) { return _this._onKeyPress.fire(new KeyboardEventWrapper(e)); }));
            this._register(dom.addDisposableListener(this._textArea, 'compositionstart', function (e) { return _this._onCompositionStart.fire(); }));
            this._register(dom.addDisposableListener(this._textArea, 'compositionend', function (e) { return _this._onCompositionEnd.fire(); }));
            this._register(dom.addDisposableListener(this._textArea, 'input', function (e) { return _this._onInput.fire(); }));
            this._register(dom.addDisposableListener(this._textArea, 'cut', function (e) { return _this._onCut.fire(new ClipboardEventWrapper(e)); }));
            this._register(dom.addDisposableListener(this._textArea, 'copy', function (e) { return _this._onCopy.fire(new ClipboardEventWrapper(e)); }));
            this._register(dom.addDisposableListener(this._textArea, 'paste', function (e) { return _this._onPaste.fire(new ClipboardEventWrapper(e)); }));
        }
        Object.defineProperty(TextAreaWrapper.prototype, "actual", {
            get: function () {
                return this._textArea;
            },
            enumerable: true,
            configurable: true
        });
        TextAreaWrapper.prototype.getValue = function () {
            // console.log('current value: ' + this._textArea.value);
            return this._textArea.value;
        };
        TextAreaWrapper.prototype.setValue = function (reason, value) {
            // console.log('reason: ' + reason + ', current value: ' + this._textArea.value + ' => new value: ' + value);
            this._textArea.value = value;
        };
        TextAreaWrapper.prototype.getSelectionStart = function () {
            return this._textArea.selectionStart;
        };
        TextAreaWrapper.prototype.getSelectionEnd = function () {
            return this._textArea.selectionEnd;
        };
        TextAreaWrapper.prototype.setSelectionRange = function (selectionStart, selectionEnd) {
            var activeElement = document.activeElement;
            if (activeElement === this._textArea) {
                this._textArea.setSelectionRange(selectionStart, selectionEnd);
            }
            else {
                this._setSelectionRangeJumpy(selectionStart, selectionEnd);
            }
        };
        TextAreaWrapper.prototype._setSelectionRangeJumpy = function (selectionStart, selectionEnd) {
            try {
                var scrollState = dom.saveParentsScrollTop(this._textArea);
                this._textArea.focus();
                this._textArea.setSelectionRange(selectionStart, selectionEnd);
                dom.restoreParentsScrollTop(this._textArea, scrollState);
            }
            catch (e) {
                // Sometimes IE throws when setting selection (e.g. textarea is off-DOM)
                console.log('an error has been thrown!');
            }
        };
        TextAreaWrapper.prototype.isInOverwriteMode = function () {
            // In IE, pressing Insert will bring the typing into overwrite mode
            if (browser.isIE11orEarlier && document.queryCommandValue('OverWrite')) {
                return true;
            }
            return false;
        };
        return TextAreaWrapper;
    }(lifecycle_1.Disposable));
    var KeyboardHandler = (function (_super) {
        __extends(KeyboardHandler, _super);
        function KeyboardHandler(context, viewController, viewHelper) {
            var _this = this;
            _super.call(this);
            this._lastCursorSelectionChanged = null;
            this.context = context;
            this.viewController = viewController;
            this.textArea = new TextAreaWrapper(viewHelper.textArea);
            this.viewHelper = viewHelper;
            this.contentLeft = 0;
            this.contentWidth = 0;
            this.scrollLeft = 0;
            this.textAreaHandler = new textAreaHandler_1.TextAreaHandler(browser, this._getStrategy(), this.textArea, this.context.model, function () { return _this.viewHelper.flushAnyAccumulatedEvents(); });
            this._toDispose = [];
            this._toDispose.push(this.textAreaHandler.onKeyDown(function (e) { return _this.viewController.emitKeyDown(e._actual); }));
            this._toDispose.push(this.textAreaHandler.onKeyUp(function (e) { return _this.viewController.emitKeyUp(e._actual); }));
            this._toDispose.push(this.textAreaHandler.onPaste(function (e) { return _this.viewController.paste('keyboard', e.text, e.pasteOnNewLine); }));
            this._toDispose.push(this.textAreaHandler.onCut(function (e) { return _this.viewController.cut('keyboard'); }));
            this._toDispose.push(this.textAreaHandler.onType(function (e) {
                if (e.replaceCharCnt) {
                    _this.viewController.replacePreviousChar('keyboard', e.text, e.replaceCharCnt);
                }
                else {
                    _this.viewController.type('keyboard', e.text);
                }
            }));
            this._toDispose.push(this.textAreaHandler.onCompositionStart(function (e) {
                var lineNumber = e.showAtLineNumber;
                var column = e.showAtColumn;
                var revealPositionEvent = {
                    range: new range_1.Range(lineNumber, column, lineNumber, column),
                    verticalType: editorCommon.VerticalRevealType.Simple,
                    revealHorizontal: true
                };
                _this.context.privateViewEventBus.emit(editorCommon.ViewEventNames.RevealRangeEvent, revealPositionEvent);
                // Find range pixel position
                var visibleRange = _this.viewHelper.visibleRangeForPositionRelativeToEditor(lineNumber, column);
                if (visibleRange) {
                    styleMutator_1.StyleMutator.setTop(_this.textArea.actual, visibleRange.top);
                    styleMutator_1.StyleMutator.setLeft(_this.textArea.actual, _this.contentLeft + visibleRange.left - _this.scrollLeft);
                }
                if (browser.isIE11orEarlier) {
                    styleMutator_1.StyleMutator.setWidth(_this.textArea.actual, _this.contentWidth);
                }
                // Show the textarea
                styleMutator_1.StyleMutator.setHeight(_this.textArea.actual, _this.context.configuration.editor.lineHeight);
                dom.addClass(_this.viewHelper.viewDomNode, 'ime-input');
            }));
            this._toDispose.push(this.textAreaHandler.onCompositionEnd(function (e) {
                _this.textArea.actual.style.height = '';
                _this.textArea.actual.style.width = '';
                styleMutator_1.StyleMutator.setLeft(_this.textArea.actual, 0);
                styleMutator_1.StyleMutator.setTop(_this.textArea.actual, 0);
                dom.removeClass(_this.viewHelper.viewDomNode, 'ime-input');
            }));
            this._toDispose.push(commonEditorConfig_1.GlobalScreenReaderNVDA.onChange(function (value) {
                _this.textAreaHandler.setStrategy(_this._getStrategy());
            }));
            this.context.addEventHandler(this);
        }
        KeyboardHandler.prototype.dispose = function () {
            this.context.removeEventHandler(this);
            this.textAreaHandler.dispose();
            this.textArea.dispose();
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        KeyboardHandler.prototype._getStrategy = function () {
            if (commonEditorConfig_1.GlobalScreenReaderNVDA.getValue()) {
                return textAreaState_1.TextAreaStrategy.NVDA;
            }
            if (this.context.configuration.editor.experimentalScreenReader) {
                return textAreaState_1.TextAreaStrategy.NVDA;
            }
            return textAreaState_1.TextAreaStrategy.IENarrator;
        };
        KeyboardHandler.prototype.focusTextArea = function () {
            this.textAreaHandler.writePlaceholderAndSelectTextAreaSync();
        };
        KeyboardHandler.prototype.onConfigurationChanged = function (e) {
            // Give textarea same font size & line height as editor, for the IME case (when the textarea is visible)
            styleMutator_1.StyleMutator.setFontSize(this.textArea.actual, this.context.configuration.editor.fontSize);
            styleMutator_1.StyleMutator.setLineHeight(this.textArea.actual, this.context.configuration.editor.lineHeight);
            if (e.experimentalScreenReader) {
                this.textAreaHandler.setStrategy(this._getStrategy());
            }
            return false;
        };
        KeyboardHandler.prototype.onScrollChanged = function (e) {
            this.scrollLeft = e.scrollLeft;
            return false;
        };
        KeyboardHandler.prototype.onViewFocusChanged = function (isFocused) {
            this.textAreaHandler.setHasFocus(isFocused);
            return false;
        };
        KeyboardHandler.prototype.onCursorSelectionChanged = function (e) {
            this._lastCursorSelectionChanged = e;
            return false;
        };
        KeyboardHandler.prototype.onCursorPositionChanged = function (e) {
            this.textAreaHandler.setCursorPosition(e.position);
            return false;
        };
        KeyboardHandler.prototype.onLayoutChanged = function (layoutInfo) {
            this.contentLeft = layoutInfo.contentLeft;
            this.contentWidth = layoutInfo.contentWidth;
            return false;
        };
        KeyboardHandler.prototype.writeToTextArea = function () {
            if (this._lastCursorSelectionChanged) {
                var e = this._lastCursorSelectionChanged;
                this._lastCursorSelectionChanged = null;
                this.textAreaHandler.setCursorSelections(e.selection, e.secondarySelections);
            }
        };
        return KeyboardHandler;
    }(viewEventHandler_1.ViewEventHandler));
    exports.KeyboardHandler = KeyboardHandler;
});
//# sourceMappingURL=keyboardHandler.js.map