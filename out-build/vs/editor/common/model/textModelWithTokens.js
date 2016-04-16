var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/async', 'vs/base/common/errors', 'vs/base/common/lifecycle', 'vs/base/common/stopwatch', 'vs/base/common/timer', 'vs/base/common/winjs.base', 'vs/editor/common/config/defaultConfig', 'vs/editor/common/editorCommon', 'vs/editor/common/model/textModel', 'vs/editor/common/model/textModelWithTokensHelpers', 'vs/editor/common/model/tokenIterator', 'vs/editor/common/modes/nullMode', 'vs/editor/common/modes/supports', 'vs/editor/common/modes/supports/richEditBrackets', 'vs/editor/common/model/tokensBinaryEncoding', 'vs/editor/common/core/modeTransition'], function (require, exports, nls, async_1, errors_1, lifecycle_1, stopwatch_1, timer, winjs_base_1, defaultConfig_1, editorCommon, textModel_1, textModelWithTokensHelpers_1, tokenIterator_1, nullMode_1, supports_1, richEditBrackets_1, TokensBinaryEncoding, modeTransition_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var TokensInflatorMap = (function () {
        function TokensInflatorMap() {
            this._inflate = [''];
            this._deflate = { '': 0 };
        }
        return TokensInflatorMap;
    }());
    exports.TokensInflatorMap = TokensInflatorMap;
    var ModeToModelBinder = (function () {
        function ModeToModelBinder(modePromise, model) {
            var _this = this;
            this._modePromise = modePromise;
            // Create an external mode promise that fires after the mode is set to the model
            this._externalModePromise = new winjs_base_1.TPromise(function (c, e, p) {
                _this._externalModePromise_c = c;
                _this._externalModePromise_e = e;
            }, function () {
                // this promise cannot be canceled
            });
            this._model = model;
            this._isDisposed = false;
            // Ensure asynchronicity
            winjs_base_1.TPromise.timeout(0).then(function () {
                return _this._modePromise;
            }).then(function (mode) {
                if (_this._isDisposed) {
                    _this._externalModePromise_c(false);
                    return;
                }
                var model = _this._model;
                _this.dispose();
                model.setMode(mode);
                model._warmUpTokens();
                _this._externalModePromise_c(true);
            }).done(null, function (err) {
                _this._externalModePromise_e(err);
                errors_1.onUnexpectedError(err);
            });
        }
        ModeToModelBinder.prototype.getModePromise = function () {
            return this._externalModePromise;
        };
        ModeToModelBinder.prototype.dispose = function () {
            this._modePromise = null;
            this._model = null;
            this._isDisposed = true;
        };
        return ModeToModelBinder;
    }());
    var FullModelRetokenizer = (function () {
        function FullModelRetokenizer(retokenizePromise, model) {
            var _this = this;
            this._retokenizePromise = retokenizePromise;
            this._model = model;
            this._isDisposed = false;
            this.isFulfilled = false;
            // Ensure asynchronicity
            winjs_base_1.TPromise.timeout(0).then(function () {
                return _this._retokenizePromise;
            }).then(function () {
                if (_this._isDisposed) {
                    return;
                }
                _this.isFulfilled = true;
                _this._model.onRetokenizerFulfilled();
            }).done(null, errors_1.onUnexpectedError);
        }
        FullModelRetokenizer.prototype.getRange = function () {
            return null;
        };
        FullModelRetokenizer.prototype.dispose = function () {
            this._retokenizePromise = null;
            this._model = null;
            this._isDisposed = true;
        };
        return FullModelRetokenizer;
    }());
    exports.FullModelRetokenizer = FullModelRetokenizer;
    var LineContext = (function () {
        function LineContext(topLevelMode, line) {
            this.modeTransitions = line.getModeTransitions(topLevelMode);
            this._text = line.text;
            this._lineTokens = line.getTokens();
        }
        LineContext.prototype.getLineContent = function () {
            return this._text;
        };
        LineContext.prototype.getTokenCount = function () {
            return this._lineTokens.getTokenCount();
        };
        LineContext.prototype.getTokenStartIndex = function (tokenIndex) {
            return this._lineTokens.getTokenStartIndex(tokenIndex);
        };
        LineContext.prototype.getTokenEndIndex = function (tokenIndex) {
            return this._lineTokens.getTokenEndIndex(tokenIndex, this._text.length);
        };
        LineContext.prototype.getTokenType = function (tokenIndex) {
            return this._lineTokens.getTokenType(tokenIndex);
        };
        LineContext.prototype.getTokenText = function (tokenIndex) {
            var startIndex = this._lineTokens.getTokenStartIndex(tokenIndex);
            var endIndex = this._lineTokens.getTokenEndIndex(tokenIndex, this._text.length);
            return this._text.substring(startIndex, endIndex);
        };
        LineContext.prototype.findIndexOfOffset = function (offset) {
            return this._lineTokens.findIndexOfOffset(offset);
        };
        return LineContext;
    }());
    var TextModelWithTokens = (function (_super) {
        __extends(TextModelWithTokens, _super);
        function TextModelWithTokens(allowedEventTypes, rawText, shouldAutoTokenize, modeOrPromise) {
            var _this = this;
            allowedEventTypes.push(editorCommon.EventType.ModelTokensChanged);
            allowedEventTypes.push(editorCommon.EventType.ModelModeChanged);
            allowedEventTypes.push(editorCommon.EventType.ModelModeSupportChanged);
            _super.call(this, allowedEventTypes, rawText);
            this._shouldAutoTokenize = shouldAutoTokenize;
            this._mode = null;
            this._modeListener = null;
            this._modeToModelBinder = null;
            this._tokensInflatorMap = null;
            this._stopLineTokenizationAfter = defaultConfig_1.DefaultConfig.editor.stopLineTokenizationAfter;
            this._invalidLineStartIndex = 0;
            this._lastState = null;
            this._revalidateTokensTimeout = -1;
            this._scheduleRetokenizeNow = null;
            this._retokenizers = null;
            this._shouldSimplifyMode = (rawText.length > TextModelWithTokens.MODEL_SYNC_LIMIT);
            this._shouldDenyMode = (rawText.length > TextModelWithTokens.MODEL_TOKENIZATION_LIMIT);
            if (!modeOrPromise) {
                this._mode = new nullMode_1.NullMode();
            }
            else if (winjs_base_1.TPromise.is(modeOrPromise)) {
                // TODO@Alex: To avoid mode id changes, we check if this promise is resolved
                var promiseValue = modeOrPromise._value;
                if (promiseValue && typeof promiseValue.getId === 'function') {
                    // The promise is already resolved
                    this._mode = this._massageMode(promiseValue);
                    this._resetModeListener(this._mode);
                }
                else {
                    var modePromise = modeOrPromise;
                    this._modeToModelBinder = new ModeToModelBinder(modePromise, this);
                    this._mode = new nullMode_1.NullMode();
                }
            }
            else {
                this._mode = this._massageMode(modeOrPromise);
                this._resetModeListener(this._mode);
            }
            this._revalidateTokensTimeout = -1;
            this._scheduleRetokenizeNow = new async_1.RunOnceScheduler(function () { return _this._retokenizeNow(); }, 200);
            this._retokenizers = [];
            this._resetTokenizationState();
        }
        TextModelWithTokens.prototype.dispose = function () {
            if (this._modeToModelBinder) {
                this._modeToModelBinder.dispose();
                this._modeToModelBinder = null;
            }
            this._resetModeListener(null);
            this._clearTimers();
            this._mode = null;
            this._lastState = null;
            this._tokensInflatorMap = null;
            this._retokenizers = lifecycle_1.dispose(this._retokenizers);
            this._scheduleRetokenizeNow.dispose();
            _super.prototype.dispose.call(this);
        };
        TextModelWithTokens.prototype.isTooLargeForHavingAMode = function () {
            return this._shouldDenyMode;
        };
        TextModelWithTokens.prototype.isTooLargeForHavingARichMode = function () {
            return this._shouldSimplifyMode;
        };
        TextModelWithTokens.prototype._massageMode = function (mode) {
            if (this.isTooLargeForHavingAMode()) {
                return new nullMode_1.NullMode();
            }
            if (this.isTooLargeForHavingARichMode()) {
                return mode.toSimplifiedMode();
            }
            return mode;
        };
        TextModelWithTokens.prototype.whenModeIsReady = function () {
            var _this = this;
            if (this._modeToModelBinder) {
                // Still waiting for some mode to load
                return this._modeToModelBinder.getModePromise().then(function () { return _this._mode; });
            }
            return winjs_base_1.TPromise.as(this._mode);
        };
        TextModelWithTokens.prototype.onRetokenizerFulfilled = function () {
            this._scheduleRetokenizeNow.schedule();
        };
        TextModelWithTokens.prototype._retokenizeNow = function () {
            var fulfilled = this._retokenizers.filter(function (r) { return r.isFulfilled; });
            this._retokenizers = this._retokenizers.filter(function (r) { return !r.isFulfilled; });
            var hasFullModel = false;
            for (var i = 0; i < fulfilled.length; i++) {
                if (!fulfilled[i].getRange()) {
                    hasFullModel = true;
                }
            }
            if (hasFullModel) {
                // Just invalidate all the lines
                for (var i = 0, len = this._lines.length; i < len; i++) {
                    this._lines[i].isInvalid = true;
                }
                this._invalidLineStartIndex = 0;
            }
            else {
                var minLineNumber = Number.MAX_VALUE;
                for (var i = 0; i < fulfilled.length; i++) {
                    var range = fulfilled[i].getRange();
                    minLineNumber = Math.min(minLineNumber, range.startLineNumber);
                    for (var lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
                        this._lines[lineNumber - 1].isInvalid = true;
                    }
                }
                if (minLineNumber - 1 < this._invalidLineStartIndex) {
                    if (this._invalidLineStartIndex < this._lines.length) {
                        this._lines[this._invalidLineStartIndex].isInvalid = true;
                    }
                    this._invalidLineStartIndex = minLineNumber - 1;
                }
            }
            this._beginBackgroundTokenization();
            for (var i = 0; i < fulfilled.length; i++) {
                fulfilled[i].dispose();
            }
        };
        TextModelWithTokens.prototype._createRetokenizer = function (retokenizePromise, lineNumber) {
            return new FullModelRetokenizer(retokenizePromise, this);
        };
        TextModelWithTokens.prototype._resetValue = function (e, newValue) {
            _super.prototype._resetValue.call(this, e, newValue);
            // Cancel tokenization, clear all tokens and begin tokenizing
            this._resetTokenizationState();
        };
        TextModelWithTokens.prototype._resetMode = function (e, newMode) {
            // Cancel tokenization, clear all tokens and begin tokenizing
            this._mode = newMode;
            this._resetModeListener(newMode);
            this._resetTokenizationState();
            this.emitModelTokensChangedEvent(1, this.getLineCount());
        };
        TextModelWithTokens.prototype._resetModeListener = function (newMode) {
            var _this = this;
            if (this._modeListener) {
                this._modeListener.dispose();
                this._modeListener = null;
            }
            if (newMode && typeof newMode.addSupportChangedListener === 'function') {
                this._modeListener = newMode.addSupportChangedListener(function (e) { return _this._onModeSupportChanged(e); });
            }
        };
        TextModelWithTokens.prototype._onModeSupportChanged = function (e) {
            this._emitModelModeSupportChangedEvent(e);
            if (e.tokenizationSupport) {
                this._resetTokenizationState();
                this.emitModelTokensChangedEvent(1, this.getLineCount());
            }
        };
        TextModelWithTokens.prototype._resetTokenizationState = function () {
            this._retokenizers = lifecycle_1.dispose(this._retokenizers);
            this._scheduleRetokenizeNow.cancel();
            this._clearTimers();
            for (var i = 0; i < this._lines.length; i++) {
                this._lines[i].setState(null);
            }
            this._initializeTokenizationState();
        };
        TextModelWithTokens.prototype._clearTimers = function () {
            if (this._revalidateTokensTimeout !== -1) {
                clearTimeout(this._revalidateTokensTimeout);
                this._revalidateTokensTimeout = -1;
            }
        };
        TextModelWithTokens.prototype._initializeTokenizationState = function () {
            // Initialize tokenization states
            var initialState = null;
            if (this._mode.tokenizationSupport) {
                try {
                    initialState = this._mode.tokenizationSupport.getInitialState();
                }
                catch (e) {
                    e.friendlyMessage = TextModelWithTokens.MODE_TOKENIZATION_FAILED_MSG;
                    errors_1.onUnexpectedError(e);
                    this._mode = new nullMode_1.NullMode();
                }
            }
            if (!initialState) {
                initialState = new nullMode_1.NullState(this._mode, null);
            }
            this._lines[0].setState(initialState);
            this._lastState = null;
            this._tokensInflatorMap = new TokensInflatorMap();
            this._invalidLineStartIndex = 0;
            this._beginBackgroundTokenization();
        };
        TextModelWithTokens.prototype.setStopLineTokenizationAfter = function (stopLineTokenizationAfter) {
            this._stopLineTokenizationAfter = stopLineTokenizationAfter;
        };
        TextModelWithTokens.prototype.getLineTokens = function (lineNumber, inaccurateTokensAcceptable) {
            if (inaccurateTokensAcceptable === void 0) { inaccurateTokensAcceptable = false; }
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
            }
            if (!inaccurateTokensAcceptable) {
                this._updateTokensUntilLine(lineNumber, true);
            }
            return this._lines[lineNumber - 1].getTokens();
        };
        TextModelWithTokens.prototype.getLineContext = function (lineNumber) {
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
            }
            this._updateTokensUntilLine(lineNumber, true);
            return new LineContext(this._mode, this._lines[lineNumber - 1]);
        };
        TextModelWithTokens.prototype._getInternalTokens = function (lineNumber) {
            this._updateTokensUntilLine(lineNumber, true);
            return this._lines[lineNumber - 1].getTokens();
        };
        TextModelWithTokens.prototype.setValue = function (value, newModeOrPromise) {
            if (newModeOrPromise === void 0) { newModeOrPromise = null; }
            var rawText = null;
            if (value !== null) {
                rawText = textModel_1.TextModel.toRawText(value, {
                    tabSize: this._options.tabSize,
                    insertSpaces: this._options.insertSpaces,
                    detectIndentation: false,
                    defaultEOL: this._options.defaultEOL
                });
            }
            this.setValueFromRawText(rawText, newModeOrPromise);
        };
        TextModelWithTokens.prototype.setValueFromRawText = function (value, newModeOrPromise) {
            if (newModeOrPromise === void 0) { newModeOrPromise = null; }
            if (value !== null) {
                _super.prototype.setValueFromRawText.call(this, value);
            }
            if (newModeOrPromise) {
                if (this._modeToModelBinder) {
                    this._modeToModelBinder.dispose();
                    this._modeToModelBinder = null;
                }
                if (winjs_base_1.TPromise.is(newModeOrPromise)) {
                    this._modeToModelBinder = new ModeToModelBinder(newModeOrPromise, this);
                }
                else {
                    var actualNewMode = this._massageMode(newModeOrPromise);
                    if (this._mode !== actualNewMode) {
                        var e2 = {
                            oldMode: this._mode,
                            newMode: actualNewMode
                        };
                        this._resetMode(e2, actualNewMode);
                        this._emitModelModeChangedEvent(e2);
                    }
                }
            }
        };
        TextModelWithTokens.prototype.getMode = function () {
            return this._mode;
        };
        TextModelWithTokens.prototype.setMode = function (newModeOrPromise) {
            if (!newModeOrPromise) {
                // There's nothing to do
                return;
            }
            this.setValueFromRawText(null, newModeOrPromise);
        };
        TextModelWithTokens.prototype.getModeAtPosition = function (_lineNumber, _column) {
            var validPosition = this.validatePosition({
                lineNumber: _lineNumber,
                column: _column
            });
            var lineNumber = validPosition.lineNumber;
            var column = validPosition.column;
            if (column === 1) {
                return this.getStateBeforeLine(lineNumber).getMode();
            }
            else if (column === this.getLineMaxColumn(lineNumber)) {
                return this.getStateAfterLine(lineNumber).getMode();
            }
            else {
                var modeTransitions = this._getLineModeTransitions(lineNumber);
                var modeTransitionIndex = modeTransition_1.ModeTransition.findIndexInSegmentsArray(modeTransitions, column - 1);
                return modeTransitions[modeTransitionIndex].mode;
            }
        };
        TextModelWithTokens.prototype._invalidateLine = function (lineIndex) {
            this._lines[lineIndex].isInvalid = true;
            if (lineIndex < this._invalidLineStartIndex) {
                if (this._invalidLineStartIndex < this._lines.length) {
                    this._lines[this._invalidLineStartIndex].isInvalid = true;
                }
                this._invalidLineStartIndex = lineIndex;
                this._beginBackgroundTokenization();
            }
        };
        TextModelWithTokens._toLineTokens = function (tokens) {
            if (!tokens || tokens.length === 0) {
                return [];
            }
            if (tokens[0] instanceof editorCommon.LineToken) {
                return tokens;
            }
            var result = [];
            for (var i = 0, len = tokens.length; i < len; i++) {
                result[i] = new editorCommon.LineToken(tokens[i].startIndex, tokens[i].type);
            }
            return result;
        };
        TextModelWithTokens._toModeTransitions = function (modeTransitions) {
            if (!modeTransitions || modeTransitions.length === 0) {
                return [];
            }
            if (modeTransitions[0] instanceof modeTransition_1.ModeTransition) {
                return modeTransitions;
            }
            var result = [];
            for (var i = 0, len = modeTransitions.length; i < len; i++) {
                result[i] = new modeTransition_1.ModeTransition(modeTransitions[i].startIndex, modeTransitions[i].mode);
            }
            return result;
        };
        TextModelWithTokens.prototype._updateLineTokens = function (lineIndex, map, topLevelMode, r) {
            this._lines[lineIndex].setTokens(map, TextModelWithTokens._toLineTokens(r.tokens), topLevelMode, TextModelWithTokens._toModeTransitions(r.modeTransitions));
        };
        TextModelWithTokens.prototype._beginBackgroundTokenization = function () {
            var _this = this;
            if (this._shouldAutoTokenize && this._revalidateTokensTimeout === -1) {
                this._revalidateTokensTimeout = setTimeout(function () {
                    _this._revalidateTokensTimeout = -1;
                    _this._revalidateTokensNow();
                }, 0);
            }
        };
        TextModelWithTokens.prototype._warmUpTokens = function () {
            // Warm up first 100 lines (if it takes less than 50ms)
            var maxLineNumber = Math.min(100, this.getLineCount());
            var toLineNumber = maxLineNumber;
            for (var lineNumber = 1; lineNumber <= maxLineNumber; lineNumber++) {
                var text = this._lines[lineNumber - 1].text;
                if (text.length >= 200) {
                    // This line is over 200 chars long, so warm up without it
                    toLineNumber = lineNumber - 1;
                    break;
                }
            }
            this._revalidateTokensNow(toLineNumber);
        };
        TextModelWithTokens.prototype._revalidateTokensNow = function (toLineNumber) {
            if (toLineNumber === void 0) { toLineNumber = this._invalidLineStartIndex + 1000000; }
            var t1 = timer.start(timer.Topic.EDITOR, 'backgroundTokenization');
            toLineNumber = Math.min(this._lines.length, toLineNumber);
            var MAX_ALLOWED_TIME = 20, fromLineNumber = this._invalidLineStartIndex + 1, tokenizedChars = 0, currentCharsToTokenize = 0, currentEstimatedTimeToTokenize = 0, stopLineTokenizationAfter = this._stopLineTokenizationAfter, sw = stopwatch_1.StopWatch.create(false), elapsedTime;
            // Tokenize at most 1000 lines. Estimate the tokenization speed per character and stop when:
            // - MAX_ALLOWED_TIME is reached
            // - tokenizing the next line would go above MAX_ALLOWED_TIME
            for (var lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
                elapsedTime = sw.elapsed();
                if (elapsedTime > MAX_ALLOWED_TIME) {
                    // Stop if MAX_ALLOWED_TIME is reached
                    toLineNumber = lineNumber - 1;
                    break;
                }
                // Compute how many characters will be tokenized for this line
                currentCharsToTokenize = this._lines[lineNumber - 1].text.length;
                if (stopLineTokenizationAfter !== -1 && currentCharsToTokenize > stopLineTokenizationAfter) {
                    currentCharsToTokenize = stopLineTokenizationAfter;
                }
                if (tokenizedChars > 0) {
                    // If we have enough history, estimate how long tokenizing this line would take
                    currentEstimatedTimeToTokenize = (elapsedTime / tokenizedChars) * currentCharsToTokenize;
                    if (elapsedTime + currentEstimatedTimeToTokenize > MAX_ALLOWED_TIME) {
                        // Tokenizing this line will go above MAX_ALLOWED_TIME
                        toLineNumber = lineNumber - 1;
                        break;
                    }
                }
                this._updateTokensUntilLine(lineNumber, false);
                tokenizedChars += currentCharsToTokenize;
            }
            elapsedTime = sw.elapsed();
            if (fromLineNumber <= toLineNumber) {
                this.emitModelTokensChangedEvent(fromLineNumber, toLineNumber);
            }
            if (this._invalidLineStartIndex < this._lines.length) {
                this._beginBackgroundTokenization();
            }
            t1.stop();
        };
        TextModelWithTokens.prototype.getStateBeforeLine = function (lineNumber) {
            this._updateTokensUntilLine(lineNumber - 1, true);
            return this._lines[lineNumber - 1].getState();
        };
        TextModelWithTokens.prototype.getStateAfterLine = function (lineNumber) {
            this._updateTokensUntilLine(lineNumber, true);
            return lineNumber < this._lines.length ? this._lines[lineNumber].getState() : this._lastState;
        };
        TextModelWithTokens.prototype._getLineModeTransitions = function (lineNumber) {
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
            }
            this._updateTokensUntilLine(lineNumber, true);
            return this._lines[lineNumber - 1].getModeTransitions(this._mode);
        };
        TextModelWithTokens.prototype._updateTokensUntilLine = function (lineNumber, emitEvents) {
            var linesLength = this._lines.length;
            var endLineIndex = lineNumber - 1;
            var stopLineTokenizationAfter = this._stopLineTokenizationAfter;
            if (stopLineTokenizationAfter === -1) {
                stopLineTokenizationAfter = 1000000000; // 1 billion, if a line is so long, you have other trouble :).
            }
            var fromLineNumber = this._invalidLineStartIndex + 1, toLineNumber = lineNumber;
            // Validate all states up to and including endLineIndex
            for (var lineIndex = this._invalidLineStartIndex; lineIndex <= endLineIndex; lineIndex++) {
                var endStateIndex = lineIndex + 1;
                var r = null;
                var text = this._lines[lineIndex].text;
                if (this._mode.tokenizationSupport) {
                    try {
                        // Tokenize only the first X characters
                        r = this._mode.tokenizationSupport.tokenize(this._lines[lineIndex].text, this._lines[lineIndex].getState(), 0, stopLineTokenizationAfter);
                    }
                    catch (e) {
                        e.friendlyMessage = TextModelWithTokens.MODE_TOKENIZATION_FAILED_MSG;
                        errors_1.onUnexpectedError(e);
                    }
                    if (r && r.retokenize) {
                        this._retokenizers.push(this._createRetokenizer(r.retokenize, lineIndex + 1));
                    }
                    if (r && r.tokens && r.tokens.length > 0) {
                        // Cannot have a stop offset before the last token
                        r.actualStopOffset = Math.max(r.actualStopOffset, r.tokens[r.tokens.length - 1].startIndex + 1);
                    }
                    if (r && r.actualStopOffset < text.length) {
                        // Treat the rest of the line (if above limit) as one default token
                        r.tokens.push({
                            startIndex: r.actualStopOffset,
                            type: ''
                        });
                        // Use as end state the starting state
                        r.endState = this._lines[lineIndex].getState();
                    }
                }
                if (!r) {
                    r = nullMode_1.nullTokenize(this._mode, text, this._lines[lineIndex].getState());
                }
                if (!r.modeTransitions) {
                    r.modeTransitions = [];
                }
                if (r.modeTransitions.length === 0) {
                    // Make sure there is at least the transition to the top-most mode
                    r.modeTransitions.push({
                        startIndex: 0,
                        mode: this._mode
                    });
                }
                this._updateLineTokens(lineIndex, this._tokensInflatorMap, this._mode, r);
                if (this._lines[lineIndex].isInvalid) {
                    this._lines[lineIndex].isInvalid = false;
                }
                if (endStateIndex < linesLength) {
                    if (this._lines[endStateIndex].getState() !== null && r.endState.equals(this._lines[endStateIndex].getState())) {
                        // The end state of this line remains the same
                        var nextInvalidLineIndex = lineIndex + 1;
                        while (nextInvalidLineIndex < linesLength) {
                            if (this._lines[nextInvalidLineIndex].isInvalid) {
                                break;
                            }
                            if (nextInvalidLineIndex + 1 < linesLength) {
                                if (this._lines[nextInvalidLineIndex + 1].getState() === null) {
                                    break;
                                }
                            }
                            else {
                                if (this._lastState === null) {
                                    break;
                                }
                            }
                            nextInvalidLineIndex++;
                        }
                        this._invalidLineStartIndex = Math.max(this._invalidLineStartIndex, nextInvalidLineIndex);
                        lineIndex = nextInvalidLineIndex - 1; // -1 because the outer loop increments it
                    }
                    else {
                        this._lines[endStateIndex].setState(r.endState);
                    }
                }
                else {
                    this._lastState = r.endState;
                }
            }
            this._invalidLineStartIndex = Math.max(this._invalidLineStartIndex, endLineIndex + 1);
            if (emitEvents && fromLineNumber <= toLineNumber) {
                this.emitModelTokensChangedEvent(fromLineNumber, toLineNumber);
            }
        };
        TextModelWithTokens.prototype.emitModelTokensChangedEvent = function (fromLineNumber, toLineNumber) {
            var e = {
                fromLineNumber: fromLineNumber,
                toLineNumber: toLineNumber
            };
            if (!this._isDisposing) {
                this.emit(editorCommon.EventType.ModelTokensChanged, e);
            }
        };
        TextModelWithTokens.prototype._emitModelModeChangedEvent = function (e) {
            if (!this._isDisposing) {
                this.emit(editorCommon.EventType.ModelModeChanged, e);
            }
        };
        TextModelWithTokens.prototype._emitModelModeSupportChangedEvent = function (e) {
            if (!this._isDisposing) {
                this.emit(editorCommon.EventType.ModelModeSupportChanged, e);
            }
        };
        // Having tokens allows implementing additional helper methods
        TextModelWithTokens.prototype._lineIsTokenized = function (lineNumber) {
            return this._invalidLineStartIndex > lineNumber - 1;
        };
        TextModelWithTokens.prototype._getWordDefinition = function () {
            return textModelWithTokensHelpers_1.WordHelper.massageWordDefinitionOf(this._mode);
        };
        TextModelWithTokens.prototype.getWordAtPosition = function (position) {
            return textModelWithTokensHelpers_1.WordHelper.getWordAtPosition(this, this.validatePosition(position));
        };
        TextModelWithTokens.prototype.getWordUntilPosition = function (position) {
            var wordAtPosition = this.getWordAtPosition(position);
            if (!wordAtPosition) {
                return {
                    word: '',
                    startColumn: position.column,
                    endColumn: position.column
                };
            }
            return {
                word: wordAtPosition.word.substr(0, position.column - wordAtPosition.startColumn),
                startColumn: wordAtPosition.startColumn,
                endColumn: position.column
            };
        };
        TextModelWithTokens.prototype.getWords = function (lineNumber) {
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
            }
            return textModelWithTokensHelpers_1.WordHelper.getWords(this, this.validateLineNumber(lineNumber));
        };
        TextModelWithTokens.prototype.tokenIterator = function (position, callback) {
            var iter = new tokenIterator_1.TokenIterator(this, this.validatePosition(position));
            var result = callback(iter);
            iter._invalidate();
            return result;
        };
        TextModelWithTokens.prototype.findMatchingBracketUp = function (bracket, _position) {
            var position = this.validatePosition(_position);
            var modeTransitions = this._lines[position.lineNumber - 1].getModeTransitions(this._mode);
            var currentModeIndex = modeTransition_1.ModeTransition.findIndexInSegmentsArray(modeTransitions, position.column - 1);
            var currentMode = modeTransitions[currentModeIndex];
            var currentModeBrackets = currentMode.mode.richEditSupport ? currentMode.mode.richEditSupport.brackets : null;
            if (!currentModeBrackets) {
                return null;
            }
            var data = currentModeBrackets.textIsBracket[bracket];
            if (!data) {
                return null;
            }
            return this._findMatchingBracketUp(data, position);
        };
        TextModelWithTokens.prototype.matchBracket = function (position, inaccurateResultAcceptable) {
            if (inaccurateResultAcceptable === void 0) { inaccurateResultAcceptable = false; }
            return this._matchBracket(this.validatePosition(position));
        };
        TextModelWithTokens.prototype._matchBracket = function (position) {
            var tokensMap = this._tokensInflatorMap;
            var lineNumber = position.lineNumber;
            var lineText = this._lines[lineNumber - 1].text;
            var lineTokens = this._lines[lineNumber - 1].getTokens();
            var tokens = lineTokens.getBinaryEncodedTokens();
            var currentTokenIndex = lineTokens.findIndexOfOffset(position.column - 1);
            var currentTokenStart = getStartIndex(tokens[currentTokenIndex]);
            var modeTransitions = this._lines[lineNumber - 1].getModeTransitions(this._mode);
            var currentModeIndex = modeTransition_1.ModeTransition.findIndexInSegmentsArray(modeTransitions, position.column - 1);
            var currentMode = modeTransitions[currentModeIndex];
            var currentModeBrackets = currentMode.mode.richEditSupport ? currentMode.mode.richEditSupport.brackets : null;
            // If position is in between two tokens, try first looking in the previous token
            if (currentTokenIndex > 0 && currentTokenStart === position.column - 1) {
                var prevTokenIndex = currentTokenIndex - 1;
                var prevTokenType = getType(tokensMap, tokens[prevTokenIndex]);
                // check that previous token is not to be ignored
                if (!supports_1.ignoreBracketsInToken(prevTokenType)) {
                    var prevTokenStart = getStartIndex(tokens[prevTokenIndex]);
                    var prevMode = currentMode;
                    var prevModeBrackets = currentModeBrackets;
                    // check if previous token is in a different mode
                    if (currentModeIndex > 0 && currentMode.startIndex === position.column - 1) {
                        prevMode = modeTransitions[currentModeIndex - 1];
                        prevModeBrackets = prevMode.mode.richEditSupport ? prevMode.mode.richEditSupport.brackets : null;
                    }
                    if (prevModeBrackets) {
                        // limit search in case previous token is very large, there's no need to go beyond `maxBracketLength`
                        prevTokenStart = Math.max(prevTokenStart, position.column - 1 - prevModeBrackets.maxBracketLength);
                        var foundBracket = richEditBrackets_1.BracketsUtils.findPrevBracketInToken(prevModeBrackets.reversedRegex, lineNumber, lineText, prevTokenStart, currentTokenStart);
                        // check that we didn't hit a bracket too far away from position
                        if (foundBracket && foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
                            var foundBracketText = lineText.substring(foundBracket.startColumn - 1, foundBracket.endColumn - 1);
                            var r = this._matchFoundBracket(foundBracket, prevModeBrackets.textIsBracket[foundBracketText], prevModeBrackets.textIsOpenBracket[foundBracketText]);
                            // check that we can actually match this bracket
                            if (r) {
                                return r;
                            }
                        }
                    }
                }
            }
            // check that the token is not to be ignored
            if (!supports_1.ignoreBracketsInToken(getType(tokensMap, tokens[currentTokenIndex]))) {
                if (currentModeBrackets) {
                    // limit search to not go before `maxBracketLength`
                    currentTokenStart = Math.max(currentTokenStart, position.column - 1 - currentModeBrackets.maxBracketLength);
                    // limit search to not go after `maxBracketLength`
                    var currentTokenEnd = (currentTokenIndex + 1 < tokens.length ? getStartIndex(tokens[currentTokenIndex + 1]) : lineText.length);
                    currentTokenEnd = Math.min(currentTokenEnd, position.column - 1 + currentModeBrackets.maxBracketLength);
                    // it might still be the case that [currentTokenStart -> currentTokenEnd] contains multiple brackets
                    while (true) {
                        var foundBracket = richEditBrackets_1.BracketsUtils.findNextBracketInText(currentModeBrackets.forwardRegex, lineNumber, lineText.substring(currentTokenStart, currentTokenEnd), currentTokenStart);
                        if (!foundBracket) {
                            // there are no brackets in this text
                            break;
                        }
                        // check that we didn't hit a bracket too far away from position
                        if (foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
                            var foundBracketText = lineText.substring(foundBracket.startColumn - 1, foundBracket.endColumn - 1);
                            var r = this._matchFoundBracket(foundBracket, currentModeBrackets.textIsBracket[foundBracketText], currentModeBrackets.textIsOpenBracket[foundBracketText]);
                            // check that we can actually match this bracket
                            if (r) {
                                return r;
                            }
                        }
                        currentTokenStart = foundBracket.endColumn - 1;
                    }
                }
            }
            return {
                brackets: null,
                isAccurate: true
            };
        };
        TextModelWithTokens.prototype._matchFoundBracket = function (foundBracket, data, isOpen) {
            if (isOpen) {
                var matched = this._findMatchingBracketDown(data, foundBracket.getEndPosition());
                if (matched) {
                    return {
                        brackets: [foundBracket, matched],
                        isAccurate: true
                    };
                }
            }
            else {
                var matched = this._findMatchingBracketUp(data, foundBracket.getStartPosition());
                if (matched) {
                    return {
                        brackets: [foundBracket, matched],
                        isAccurate: true
                    };
                }
            }
            return null;
        };
        TextModelWithTokens.prototype._findMatchingBracketUp = function (bracket, position) {
            // console.log('_findMatchingBracketUp: ', 'bracket: ', JSON.stringify(bracket), 'startPosition: ', String(position));
            var modeId = bracket.modeId;
            var tokensMap = this._tokensInflatorMap;
            var reversedBracketRegex = bracket.reversedRegex;
            var count = -1;
            for (var lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
                var lineTokens = this._lines[lineNumber - 1].getTokens();
                var lineText = this._lines[lineNumber - 1].text;
                var tokens = lineTokens.getBinaryEncodedTokens();
                var modeTransitions = this._lines[lineNumber - 1].getModeTransitions(this._mode);
                var currentModeIndex = modeTransitions.length - 1;
                var currentModeStart = modeTransitions[currentModeIndex].startIndex;
                var currentModeId = modeTransitions[currentModeIndex].mode.getId();
                var tokensLength = tokens.length - 1;
                var currentTokenEnd = lineText.length;
                if (lineNumber === position.lineNumber) {
                    tokensLength = lineTokens.findIndexOfOffset(position.column - 1);
                    currentTokenEnd = position.column - 1;
                    currentModeIndex = modeTransition_1.ModeTransition.findIndexInSegmentsArray(modeTransitions, position.column - 1);
                    currentModeStart = modeTransitions[currentModeIndex].startIndex;
                    currentModeId = modeTransitions[currentModeIndex].mode.getId();
                }
                for (var tokenIndex = tokensLength; tokenIndex >= 0; tokenIndex--) {
                    var currentToken = tokens[tokenIndex];
                    var currentTokenType = getType(tokensMap, currentToken);
                    var currentTokenStart = getStartIndex(currentToken);
                    if (currentTokenStart < currentModeStart) {
                        currentModeIndex--;
                        currentModeStart = modeTransitions[currentModeIndex].startIndex;
                        currentModeId = modeTransitions[currentModeIndex].mode.getId();
                    }
                    if (currentModeId === modeId && !supports_1.ignoreBracketsInToken(currentTokenType)) {
                        while (true) {
                            var r = richEditBrackets_1.BracketsUtils.findPrevBracketInToken(reversedBracketRegex, lineNumber, lineText, currentTokenStart, currentTokenEnd);
                            if (!r) {
                                break;
                            }
                            var hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1);
                            if (hitText === bracket.open) {
                                count++;
                            }
                            else if (hitText === bracket.close) {
                                count--;
                            }
                            if (count === 0) {
                                return r;
                            }
                            currentTokenEnd = r.startColumn - 1;
                        }
                    }
                    currentTokenEnd = currentTokenStart;
                }
            }
            return null;
        };
        TextModelWithTokens.prototype._findMatchingBracketDown = function (bracket, position) {
            // console.log('_findMatchingBracketDown: ', 'bracket: ', JSON.stringify(bracket), 'startPosition: ', String(position));
            var modeId = bracket.modeId;
            var tokensMap = this._tokensInflatorMap;
            var bracketRegex = bracket.forwardRegex;
            var count = 1;
            for (var lineNumber = position.lineNumber, lineCount = this.getLineCount(); lineNumber <= lineCount; lineNumber++) {
                var lineTokens = this._lines[lineNumber - 1].getTokens();
                var lineText = this._lines[lineNumber - 1].text;
                var tokens = lineTokens.getBinaryEncodedTokens();
                var modeTransitions = this._lines[lineNumber - 1].getModeTransitions(this._mode);
                var currentModeIndex = 0;
                var nextModeStart = (currentModeIndex + 1 < modeTransitions.length ? modeTransitions[currentModeIndex + 1].startIndex : lineText.length + 1);
                var currentModeId = modeTransitions[currentModeIndex].mode.getId();
                var startTokenIndex = 0;
                var currentTokenStart = getStartIndex(startTokenIndex);
                if (lineNumber === position.lineNumber) {
                    startTokenIndex = lineTokens.findIndexOfOffset(position.column - 1);
                    currentTokenStart = Math.max(currentTokenStart, position.column - 1);
                    currentModeIndex = modeTransition_1.ModeTransition.findIndexInSegmentsArray(modeTransitions, position.column - 1);
                    nextModeStart = (currentModeIndex + 1 < modeTransitions.length ? modeTransitions[currentModeIndex + 1].startIndex : lineText.length + 1);
                    currentModeId = modeTransitions[currentModeIndex].mode.getId();
                }
                for (var tokenIndex = startTokenIndex, tokensLength = tokens.length; tokenIndex < tokensLength; tokenIndex++) {
                    var currentToken = tokens[tokenIndex];
                    var currentTokenType = getType(tokensMap, currentToken);
                    var currentTokenEnd = tokenIndex + 1 < tokensLength ? getStartIndex(tokens[tokenIndex + 1]) : lineText.length;
                    if (currentTokenStart >= nextModeStart) {
                        currentModeIndex++;
                        nextModeStart = (currentModeIndex + 1 < modeTransitions.length ? modeTransitions[currentModeIndex + 1].startIndex : lineText.length + 1);
                        currentModeId = modeTransitions[currentModeIndex].mode.getId();
                    }
                    if (currentModeId === modeId && !supports_1.ignoreBracketsInToken(currentTokenType)) {
                        while (true) {
                            var r = richEditBrackets_1.BracketsUtils.findNextBracketInToken(bracketRegex, lineNumber, lineText, currentTokenStart, currentTokenEnd);
                            if (!r) {
                                break;
                            }
                            var hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1);
                            if (hitText === bracket.open) {
                                count++;
                            }
                            else if (hitText === bracket.close) {
                                count--;
                            }
                            if (count === 0) {
                                return r;
                            }
                            currentTokenStart = r.endColumn - 1;
                        }
                    }
                    currentTokenStart = currentTokenEnd;
                }
            }
            return null;
        };
        TextModelWithTokens.prototype.findPrevBracket = function (_position) {
            var position = this.validatePosition(_position);
            var tokensMap = this._tokensInflatorMap;
            var reversedBracketRegex = /[\(\)\[\]\{\}]/; // TODO@Alex: use mode's brackets
            for (var lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
                var lineTokens = this._lines[lineNumber - 1].getTokens();
                var lineText = this._lines[lineNumber - 1].text;
                var tokens = lineTokens.getBinaryEncodedTokens();
                var tokensLength = tokens.length - 1;
                var currentTokenEnd = lineText.length;
                if (lineNumber === position.lineNumber) {
                    tokensLength = lineTokens.findIndexOfOffset(position.column - 1);
                    currentTokenEnd = position.column - 1;
                }
                for (var tokenIndex = tokensLength; tokenIndex >= 0; tokenIndex--) {
                    var currentToken = tokens[tokenIndex];
                    var currentTokenType = getType(tokensMap, currentToken);
                    var currentTokenStart = getStartIndex(currentToken);
                    if (!supports_1.ignoreBracketsInToken(currentTokenType)) {
                        var r = richEditBrackets_1.BracketsUtils.findPrevBracketInToken(reversedBracketRegex, lineNumber, lineText, currentTokenStart, currentTokenEnd);
                        if (r) {
                            return this._toFoundBracket(r);
                        }
                    }
                    currentTokenEnd = currentTokenStart;
                }
            }
            return null;
        };
        TextModelWithTokens.prototype.findNextBracket = function (_position) {
            var position = this.validatePosition(_position);
            var tokensMap = this._tokensInflatorMap;
            var bracketRegex = /[\(\)\[\]\{\}]/; // TODO@Alex: use mode's brackets
            for (var lineNumber = position.lineNumber, lineCount = this.getLineCount(); lineNumber <= lineCount; lineNumber++) {
                var lineTokens = this._lines[lineNumber - 1].getTokens();
                var lineText = this._lines[lineNumber - 1].text;
                var tokens = lineTokens.getBinaryEncodedTokens();
                var startTokenIndex = 0;
                var currentTokenStart = getStartIndex(startTokenIndex);
                if (lineNumber === position.lineNumber) {
                    startTokenIndex = lineTokens.findIndexOfOffset(position.column - 1);
                    currentTokenStart = Math.max(currentTokenStart, position.column - 1);
                }
                for (var tokenIndex = startTokenIndex, tokensLength = tokens.length; tokenIndex < tokensLength; tokenIndex++) {
                    var currentToken = tokens[tokenIndex];
                    var currentTokenType = getType(tokensMap, currentToken);
                    var currentTokenEnd = tokenIndex + 1 < tokensLength ? getStartIndex(tokens[tokenIndex + 1]) : lineText.length;
                    if (!supports_1.ignoreBracketsInToken(currentTokenType)) {
                        var r = richEditBrackets_1.BracketsUtils.findNextBracketInToken(bracketRegex, lineNumber, lineText, currentTokenStart, currentTokenEnd);
                        if (r) {
                            return this._toFoundBracket(r);
                        }
                    }
                    currentTokenStart = currentTokenEnd;
                }
            }
            return null;
        };
        TextModelWithTokens.prototype._toFoundBracket = function (r) {
            if (!r) {
                return null;
            }
            var text = this.getValueInRange(r);
            // TODO@Alex: use mode's brackets
            switch (text) {
                case '(': return { range: r, open: '(', close: ')', isOpen: true };
                case ')': return { range: r, open: '(', close: ')', isOpen: false };
                case '[': return { range: r, open: '[', close: ']', isOpen: true };
                case ']': return { range: r, open: '[', close: ']', isOpen: false };
                case '{': return { range: r, open: '{', close: '}', isOpen: true };
                case '}': return { range: r, open: '{', close: '}', isOpen: false };
            }
            return null;
        };
        TextModelWithTokens.MODE_TOKENIZATION_FAILED_MSG = nls.localize('mode.tokenizationSupportFailed', "The mode has failed while tokenizing the input.");
        TextModelWithTokens.MODEL_SYNC_LIMIT = 5 * 1024 * 1024; // 5 MB
        TextModelWithTokens.MODEL_TOKENIZATION_LIMIT = 20 * 1024 * 1024; // 20 MB
        return TextModelWithTokens;
    }(textModel_1.TextModel));
    exports.TextModelWithTokens = TextModelWithTokens;
    var getType = TokensBinaryEncoding.getType;
    var getStartIndex = TokensBinaryEncoding.getStartIndex;
});
