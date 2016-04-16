define(["require", "exports", 'vs/editor/common/modes/lineStream', 'vs/editor/common/modes/nullMode', 'vs/editor/common/modes/supports'], function (require, exports, lineStream_1, nullMode_1, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function isFunction(something) {
        return typeof something === 'function';
    }
    var TokenizationSupport = (function () {
        function TokenizationSupport(mode, customization, supportsNestedModes, shouldGenerateEmbeddedModels) {
            this._mode = mode;
            this.customization = customization;
            this.supportsNestedModes = supportsNestedModes;
            this._embeddedModesListeners = {};
            if (this.supportsNestedModes) {
                if (!this._mode.registerSupport) {
                    throw new Error('Cannot be a mode with nested modes unless I can emit a tokenizationSupport changed event!');
                }
            }
            this.shouldGenerateEmbeddedModels = shouldGenerateEmbeddedModels;
            this.defaults = {
                enterNestedMode: !isFunction(customization.enterNestedMode),
                getNestedMode: !isFunction(customization.getNestedMode),
                getNestedModeInitialState: !isFunction(customization.getNestedModeInitialState),
                getLeavingNestedModeData: !isFunction(customization.getLeavingNestedModeData),
                onReturningFromNestedMode: !isFunction(customization.onReturningFromNestedMode)
            };
        }
        TokenizationSupport.prototype.dispose = function () {
            for (var listener in this._embeddedModesListeners) {
                this._embeddedModesListeners[listener].dispose();
                delete this._embeddedModesListeners[listener];
            }
        };
        TokenizationSupport.prototype.getInitialState = function () {
            return this.customization.getInitialState();
        };
        TokenizationSupport.prototype.tokenize = function (line, state, deltaOffset, stopAtOffset) {
            if (deltaOffset === void 0) { deltaOffset = 0; }
            if (stopAtOffset === void 0) { stopAtOffset = deltaOffset + line.length; }
            if (state.getMode() !== this._mode) {
                return this._nestedTokenize(line, state, deltaOffset, stopAtOffset, [], []);
            }
            else {
                return this._myTokenize(line, state, deltaOffset, stopAtOffset, [], []);
            }
        };
        /**
         * Precondition is: nestedModeState.getMode() !== this
         * This means we are in a nested mode when parsing starts on this line.
         */
        TokenizationSupport.prototype._nestedTokenize = function (buffer, nestedModeState, deltaOffset, stopAtOffset, prependTokens, prependModeTransitions) {
            var myStateBeforeNestedMode = nestedModeState.getStateData();
            var leavingNestedModeData = this.getLeavingNestedModeData(buffer, myStateBeforeNestedMode);
            // Be sure to give every embedded mode the
            // opportunity to leave nested mode.
            // i.e. Don't go straight to the most nested mode
            var stepOnceNestedState = nestedModeState;
            while (stepOnceNestedState.getStateData() && stepOnceNestedState.getStateData().getMode() !== this._mode) {
                stepOnceNestedState = stepOnceNestedState.getStateData();
            }
            var nestedMode = stepOnceNestedState.getMode();
            if (!leavingNestedModeData) {
                // tokenization will not leave nested mode
                var result;
                if (nestedMode.tokenizationSupport) {
                    result = nestedMode.tokenizationSupport.tokenize(buffer, nestedModeState, deltaOffset, stopAtOffset);
                }
                else {
                    // The nested mode doesn't have tokenization support,
                    // unfortunatelly this means we have to fake it
                    result = nullMode_1.nullTokenize(nestedMode, buffer, nestedModeState, deltaOffset);
                }
                result.tokens = prependTokens.concat(result.tokens);
                result.modeTransitions = prependModeTransitions.concat(result.modeTransitions);
                return result;
            }
            var nestedModeBuffer = leavingNestedModeData.nestedModeBuffer;
            if (nestedModeBuffer.length > 0) {
                // Tokenize with the nested mode
                var nestedModeLineTokens;
                if (nestedMode.tokenizationSupport) {
                    nestedModeLineTokens = nestedMode.tokenizationSupport.tokenize(nestedModeBuffer, nestedModeState, deltaOffset, stopAtOffset);
                }
                else {
                    // The nested mode doesn't have tokenization support,
                    // unfortunatelly this means we have to fake it
                    nestedModeLineTokens = nullMode_1.nullTokenize(nestedMode, nestedModeBuffer, nestedModeState, deltaOffset);
                }
                // Save last state of nested mode
                nestedModeState = nestedModeLineTokens.endState;
                // Prepend nested mode's result to our result
                prependTokens = prependTokens.concat(nestedModeLineTokens.tokens);
                prependModeTransitions = prependModeTransitions.concat(nestedModeLineTokens.modeTransitions);
            }
            var bufferAfterNestedMode = leavingNestedModeData.bufferAfterNestedMode;
            var myStateAfterNestedMode = leavingNestedModeData.stateAfterNestedMode;
            myStateAfterNestedMode.setStateData(myStateBeforeNestedMode.getStateData());
            this.onReturningFromNestedMode(myStateAfterNestedMode, nestedModeState);
            return this._myTokenize(bufferAfterNestedMode, myStateAfterNestedMode, deltaOffset + nestedModeBuffer.length, stopAtOffset, prependTokens, prependModeTransitions);
        };
        /**
         * Precondition is: state.getMode() === this
         * This means we are in the current mode when parsing starts on this line.
         */
        TokenizationSupport.prototype._myTokenize = function (buffer, myState, deltaOffset, stopAtOffset, prependTokens, prependModeTransitions) {
            var _this = this;
            var lineStream = new lineStream_1.LineStream(buffer);
            var tokenResult, beforeTokenizeStreamPos;
            var previousType = null;
            var retokenize = null;
            myState = myState.clone();
            if (prependModeTransitions.length <= 0 || prependModeTransitions[prependModeTransitions.length - 1].mode !== this._mode) {
                // Avoid transitioning to the same mode (this can happen in case of empty embedded modes)
                prependModeTransitions.push({
                    startIndex: deltaOffset,
                    mode: this._mode
                });
            }
            var maxPos = Math.min(stopAtOffset - deltaOffset, buffer.length);
            while (lineStream.pos() < maxPos) {
                beforeTokenizeStreamPos = lineStream.pos();
                do {
                    tokenResult = myState.tokenize(lineStream);
                    if (tokenResult === null || tokenResult === undefined ||
                        ((tokenResult.type === undefined || tokenResult.type === null) &&
                            (tokenResult.nextState === undefined || tokenResult.nextState === null))) {
                        throw new Error('Tokenizer must return a valid state');
                    }
                    if (tokenResult.nextState) {
                        tokenResult.nextState.setStateData(myState.getStateData());
                        myState = tokenResult.nextState;
                    }
                    if (lineStream.pos() <= beforeTokenizeStreamPos) {
                        throw new Error('Stream did not advance while tokenizing. Mode id is ' + this._mode.getId() + ' (stuck at token type: "' + tokenResult.type + '", prepend tokens: "' + (prependTokens.map(function (t) { return t.type; }).join(',')) + '").');
                    }
                } while (!tokenResult.type && tokenResult.type !== '');
                if (previousType !== tokenResult.type || tokenResult.dontMergeWithPrev || previousType === null) {
                    prependTokens.push(new supports_1.Token(beforeTokenizeStreamPos + deltaOffset, tokenResult.type));
                }
                previousType = tokenResult.type;
                if (this.supportsNestedModes && this.enterNestedMode(myState)) {
                    var currentEmbeddedLevels = this._getEmbeddedLevel(myState);
                    if (currentEmbeddedLevels < TokenizationSupport.MAX_EMBEDDED_LEVELS) {
                        var nestedModeState = this.getNestedModeInitialState(myState);
                        // Re-emit tokenizationSupport change events from all modes that I ever embedded
                        var embeddedMode = nestedModeState.state.getMode();
                        if (typeof embeddedMode.addSupportChangedListener === 'function' && !this._embeddedModesListeners.hasOwnProperty(embeddedMode.getId())) {
                            var emitting = false;
                            this._embeddedModesListeners[embeddedMode.getId()] = embeddedMode.addSupportChangedListener(function (e) {
                                if (emitting) {
                                    return;
                                }
                                if (e.tokenizationSupport) {
                                    emitting = true;
                                    _this._mode.registerSupport('tokenizationSupport', function (mode) {
                                        return mode.tokenizationSupport;
                                    });
                                    emitting = false;
                                }
                            });
                        }
                        if (!lineStream.eos()) {
                            // There is content from the embedded mode
                            var restOfBuffer = buffer.substr(lineStream.pos());
                            var result = this._nestedTokenize(restOfBuffer, nestedModeState.state, deltaOffset + lineStream.pos(), stopAtOffset, prependTokens, prependModeTransitions);
                            result.retokenize = result.retokenize || nestedModeState.missingModePromise;
                            return result;
                        }
                        else {
                            // Transition to the nested mode state
                            myState = nestedModeState.state;
                            retokenize = nestedModeState.missingModePromise;
                        }
                    }
                }
            }
            return {
                tokens: prependTokens,
                actualStopOffset: lineStream.pos() + deltaOffset,
                modeTransitions: prependModeTransitions,
                endState: myState,
                retokenize: retokenize
            };
        };
        TokenizationSupport.prototype._getEmbeddedLevel = function (state) {
            var result = -1;
            while (state) {
                result++;
                state = state.getStateData();
            }
            return result;
        };
        TokenizationSupport.prototype.enterNestedMode = function (state) {
            if (this.defaults.enterNestedMode) {
                return false;
            }
            return this.customization.enterNestedMode(state);
        };
        TokenizationSupport.prototype.getNestedMode = function (state) {
            if (this.defaults.getNestedMode) {
                return null;
            }
            return this.customization.getNestedMode(state);
        };
        TokenizationSupport._validatedNestedMode = function (input) {
            var mode = new nullMode_1.NullMode(), missingModePromise = null;
            if (input && input.mode) {
                mode = input.mode;
            }
            if (input && input.missingModePromise) {
                missingModePromise = input.missingModePromise;
            }
            return {
                mode: mode,
                missingModePromise: missingModePromise
            };
        };
        TokenizationSupport.prototype.getNestedModeInitialState = function (state) {
            if (this.defaults.getNestedModeInitialState) {
                var nestedMode = TokenizationSupport._validatedNestedMode(this.getNestedMode(state));
                var missingModePromise = nestedMode.missingModePromise;
                var nestedModeState;
                if (nestedMode.mode.tokenizationSupport) {
                    nestedModeState = nestedMode.mode.tokenizationSupport.getInitialState();
                }
                else {
                    nestedModeState = new nullMode_1.NullState(nestedMode.mode, null);
                }
                nestedModeState.setStateData(state);
                return {
                    state: nestedModeState,
                    missingModePromise: missingModePromise
                };
            }
            return this.customization.getNestedModeInitialState(state);
        };
        TokenizationSupport.prototype.getLeavingNestedModeData = function (line, state) {
            if (this.defaults.getLeavingNestedModeData) {
                return null;
            }
            return this.customization.getLeavingNestedModeData(line, state);
        };
        TokenizationSupport.prototype.onReturningFromNestedMode = function (myStateAfterNestedMode, lastNestedModeState) {
            if (this.defaults.onReturningFromNestedMode) {
                return null;
            }
            return this.customization.onReturningFromNestedMode(myStateAfterNestedMode, lastNestedModeState);
        };
        TokenizationSupport.MAX_EMBEDDED_LEVELS = 5;
        return TokenizationSupport;
    }());
    exports.TokenizationSupport = TokenizationSupport;
});
