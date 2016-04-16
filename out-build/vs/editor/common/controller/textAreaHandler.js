var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/async', 'vs/base/common/event', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/editor/common/controller/textAreaState', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon'], function (require, exports, async_1, event_1, keyCodes_1, lifecycle_1, textAreaState_1, position_1, range_1, editorCommon_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ReadFromTextArea;
    (function (ReadFromTextArea) {
        ReadFromTextArea[ReadFromTextArea["Type"] = 0] = "Type";
        ReadFromTextArea[ReadFromTextArea["Paste"] = 1] = "Paste";
    })(ReadFromTextArea || (ReadFromTextArea = {}));
    var TextAreaHandler = (function (_super) {
        __extends(TextAreaHandler, _super);
        function TextAreaHandler(Browser, strategy, textArea, model, flushAnyAccumulatedEvents) {
            var _this = this;
            _super.call(this);
            this._onKeyDown = this._register(new event_1.Emitter());
            this.onKeyDown = this._onKeyDown.event;
            this._onKeyUp = this._register(new event_1.Emitter());
            this.onKeyUp = this._onKeyUp.event;
            this._onCut = this._register(new event_1.Emitter());
            this.onCut = this._onCut.event;
            this._onPaste = this._register(new event_1.Emitter());
            this.onPaste = this._onPaste.event;
            this._onType = this._register(new event_1.Emitter());
            this.onType = this._onType.event;
            this._onCompositionStart = this._register(new event_1.Emitter());
            this.onCompositionStart = this._onCompositionStart.event;
            this._onCompositionEnd = this._register(new event_1.Emitter());
            this.onCompositionEnd = this._onCompositionEnd.event;
            this.Browser = Browser;
            this.textArea = textArea;
            this.model = model;
            this.flushAnyAccumulatedEvents = flushAnyAccumulatedEvents;
            this.selection = new range_1.Range(1, 1, 1, 1);
            this.selections = [new range_1.Range(1, 1, 1, 1)];
            this.cursorPosition = new position_1.Position(1, 1);
            this._nextCommand = ReadFromTextArea.Type;
            this.asyncTriggerCut = new async_1.RunOnceScheduler(function () { return _this._onCut.fire(); }, 0);
            this.lastCopiedValue = null;
            this.lastCopiedValueIsFromEmptySelection = false;
            this.textAreaState = textAreaState_1.createTextAreaState(strategy);
            this.hasFocus = false;
            this.lastCompositionEndTime = 0;
            this._register(this.textArea.onKeyDown(function (e) { return _this._onKeyDownHandler(e); }));
            this._register(this.textArea.onKeyUp(function (e) { return _this._onKeyUp.fire(e); }));
            this._register(this.textArea.onKeyPress(function (e) { return _this._onKeyPressHandler(e); }));
            this.textareaIsShownAtCursor = false;
            this._register(this.textArea.onCompositionStart(function () {
                var timeSinceLastCompositionEnd = (new Date().getTime()) - _this.lastCompositionEndTime;
                if (_this.textareaIsShownAtCursor) {
                    return;
                }
                _this.textareaIsShownAtCursor = true;
                // In IE we cannot set .value when handling 'compositionstart' because the entire composition will get canceled.
                var shouldEmptyTextArea = (timeSinceLastCompositionEnd >= 100);
                if (shouldEmptyTextArea) {
                    if (!_this.Browser.isIE11orEarlier) {
                        _this.setTextAreaState('compositionstart', _this.textAreaState.toEmpty());
                    }
                }
                var showAtLineNumber;
                var showAtColumn;
                // In IE we cannot set .value when handling 'compositionstart' because the entire composition will get canceled.
                if (_this.Browser.isIE11orEarlier) {
                    // Ensure selection start is in viewport
                    showAtLineNumber = _this.selection.startLineNumber;
                    showAtColumn = (_this.selection.startColumn - _this.textAreaState.getSelectionStart());
                }
                else {
                    showAtLineNumber = _this.cursorPosition.lineNumber;
                    showAtColumn = _this.cursorPosition.column;
                }
                _this._onCompositionStart.fire({
                    showAtLineNumber: showAtLineNumber,
                    showAtColumn: showAtColumn
                });
            }));
            var readFromTextArea = function () {
                _this.textAreaState = _this.textAreaState.fromTextArea(_this.textArea);
                var typeInput = _this.textAreaState.deduceInput();
                // console.log('==> DEDUCED INPUT: ' + JSON.stringify(typeInput));
                if (_this._nextCommand === ReadFromTextArea.Type) {
                    if (typeInput.text !== '') {
                        _this._onType.fire(typeInput);
                    }
                }
                else {
                    _this.executePaste(typeInput.text);
                    _this._nextCommand = ReadFromTextArea.Type;
                }
            };
            this._register(this.textArea.onCompositionEnd(function () {
                // console.log('onCompositionEnd: ' + this.textArea.getValue());
                // readFromTextArea();
                _this.lastCompositionEndTime = (new Date()).getTime();
                if (!_this.textareaIsShownAtCursor) {
                    return;
                }
                _this.textareaIsShownAtCursor = false;
                _this._onCompositionEnd.fire();
            }));
            this._register(this.textArea.onInput(function () {
                // console.log('onInput: ' + this.textArea.getValue());
                if (_this.textareaIsShownAtCursor) {
                    // console.log('::ignoring input event because the textarea is shown at cursor: ' + this.textArea.getValue());
                    return;
                }
                readFromTextArea();
            }));
            // --- Clipboard operations
            this._register(this.textArea.onCut(function (e) {
                // Ensure we have the latest selection => ask all pending events to be sent
                _this.flushAnyAccumulatedEvents();
                _this._ensureClipboardGetsEditorSelection(e);
                _this.asyncTriggerCut.schedule();
            }));
            this._register(this.textArea.onCopy(function (e) {
                // Ensure we have the latest selection => ask all pending events to be sent
                _this.flushAnyAccumulatedEvents();
                _this._ensureClipboardGetsEditorSelection(e);
            }));
            this._register(this.textArea.onPaste(function (e) {
                if (e.canUseTextData()) {
                    _this.executePaste(e.getTextData());
                }
                else {
                    if (_this.textArea.getSelectionStart() !== _this.textArea.getSelectionEnd()) {
                        // Clean up the textarea, to get a clean paste
                        _this.setTextAreaState('paste', _this.textAreaState.toEmpty());
                    }
                    _this._nextCommand = ReadFromTextArea.Paste;
                }
            }));
            this._writePlaceholderAndSelectTextArea('ctor');
        }
        TextAreaHandler.prototype.dispose = function () {
            this.asyncTriggerCut.dispose();
            _super.prototype.dispose.call(this);
        };
        // --- begin event handlers
        TextAreaHandler.prototype.setStrategy = function (strategy) {
            this.textAreaState = this.textAreaState.toStrategy(strategy);
        };
        TextAreaHandler.prototype.setHasFocus = function (isFocused) {
            if (this.hasFocus === isFocused) {
                // no change
                return;
            }
            this.hasFocus = isFocused;
            if (this.hasFocus) {
                this._writePlaceholderAndSelectTextArea('focusgain');
            }
        };
        TextAreaHandler.prototype.setCursorSelections = function (primary, secondary) {
            this.selection = primary;
            this.selections = [primary].concat(secondary);
            this._writePlaceholderAndSelectTextArea('selection changed');
        };
        TextAreaHandler.prototype.setCursorPosition = function (primary) {
            this.cursorPosition = primary;
        };
        // --- end event handlers
        TextAreaHandler.prototype.setTextAreaState = function (reason, textAreaState) {
            if (!this.hasFocus) {
                textAreaState = textAreaState.resetSelection();
            }
            textAreaState.applyToTextArea(reason, this.textArea, this.hasFocus);
            this.textAreaState = textAreaState;
        };
        TextAreaHandler.prototype._onKeyDownHandler = function (e) {
            if (e.equals(keyCodes_1.CommonKeybindings.ESCAPE)) {
                // Prevent default always for `Esc`, otherwise it will generate a keypress
                // See http://msdn.microsoft.com/en-us/library/ie/ms536939(v=vs.85).aspx
                e.preventDefault();
            }
            this._onKeyDown.fire(e);
        };
        TextAreaHandler.prototype._onKeyPressHandler = function (e) {
            if (!this.hasFocus) {
                // Sometimes, when doing Alt-Tab, in FF, a 'keypress' is sent before a 'focus'
                return;
            }
        };
        // ------------- Operations that are always executed asynchronously
        TextAreaHandler.prototype.executePaste = function (txt) {
            if (txt === '') {
                return;
            }
            var pasteOnNewLine = false;
            if (this.Browser.enableEmptySelectionClipboard) {
                pasteOnNewLine = (txt === this.lastCopiedValue && this.lastCopiedValueIsFromEmptySelection);
            }
            this._onPaste.fire({
                text: txt,
                pasteOnNewLine: pasteOnNewLine
            });
        };
        TextAreaHandler.prototype.writePlaceholderAndSelectTextAreaSync = function () {
            this._writePlaceholderAndSelectTextArea('focusTextArea');
        };
        TextAreaHandler.prototype._writePlaceholderAndSelectTextArea = function (reason) {
            if (!this.textareaIsShownAtCursor) {
                // Do not write to the textarea if it is visible.
                if (this.Browser.isIPad) {
                    // Do not place anything in the textarea for the iPad
                    this.setTextAreaState(reason, this.textAreaState.toEmpty());
                }
                else {
                    this.setTextAreaState(reason, this.textAreaState.fromEditorSelection(this.model, this.selection));
                }
            }
        };
        // ------------- Clipboard operations
        TextAreaHandler.prototype._ensureClipboardGetsEditorSelection = function (e) {
            var whatToCopy = this._getPlainTextToCopy();
            if (e.canUseTextData()) {
                e.setTextData(whatToCopy);
            }
            else {
                this.setTextAreaState('copy or cut', this.textAreaState.fromText(whatToCopy));
            }
            if (this.Browser.enableEmptySelectionClipboard) {
                if (this.Browser.isFirefox) {
                    // When writing "LINE\r\n" to the clipboard and then pasting,
                    // Firefox pastes "LINE\n", so let's work around this quirk
                    this.lastCopiedValue = whatToCopy.replace(/\r\n/g, '\n');
                }
                else {
                    this.lastCopiedValue = whatToCopy;
                }
                var selections = this.selections;
                this.lastCopiedValueIsFromEmptySelection = (selections.length === 1 && selections[0].isEmpty());
            }
        };
        TextAreaHandler.prototype._getPlainTextToCopy = function () {
            var newLineCharacter = this.model.getEOL();
            var selections = this.selections;
            if (selections.length === 1) {
                var range = selections[0];
                if (range.isEmpty()) {
                    if (this.Browser.enableEmptySelectionClipboard) {
                        var modelLineNumber = this.model.convertViewPositionToModelPosition(range.startLineNumber, 1).lineNumber;
                        return this.model.getModelLineContent(modelLineNumber) + newLineCharacter;
                    }
                    else {
                        return '';
                    }
                }
                return this.model.getValueInRange(range, editorCommon_1.EndOfLinePreference.TextDefined);
            }
            else {
                selections = selections.slice(0).sort(range_1.Range.compareRangesUsingStarts);
                var result = [];
                for (var i = 0; i < selections.length; i++) {
                    result.push(this.model.getValueInRange(selections[i], editorCommon_1.EndOfLinePreference.TextDefined));
                }
                return result.join(newLineCharacter);
            }
        };
        return TextAreaHandler;
    }(lifecycle_1.Disposable));
    exports.TextAreaHandler = TextAreaHandler;
});
//# sourceMappingURL=textAreaHandler.js.map