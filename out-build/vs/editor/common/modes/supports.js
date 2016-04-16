define(["require", "exports", 'vs/base/common/strings', 'vs/editor/common/core/modeTransition'], function (require, exports, strings, modeTransition_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Token = (function () {
        function Token(startIndex, type) {
            this.startIndex = startIndex;
            this.type = type;
        }
        Token.prototype.toString = function () {
            return '(' + this.startIndex + ', ' + this.type + ')';
        };
        return Token;
    }());
    exports.Token = Token;
    var LineTokens = (function () {
        function LineTokens(tokens, modeTransitions, actualStopOffset, endState) {
            this.tokens = tokens;
            this.modeTransitions = modeTransitions;
            this.actualStopOffset = actualStopOffset;
            this.endState = endState;
            this.retokenize = null;
        }
        return LineTokens;
    }());
    exports.LineTokens = LineTokens;
    function handleEvent(context, offset, runner) {
        var modeTransitions = context.modeTransitions;
        if (modeTransitions.length === 1) {
            return runner(modeTransitions[0].mode, context, offset);
        }
        var modeIndex = modeTransition_1.ModeTransition.findIndexInSegmentsArray(modeTransitions, offset);
        var nestedMode = modeTransitions[modeIndex].mode;
        var modeStartIndex = modeTransitions[modeIndex].startIndex;
        var firstTokenInModeIndex = context.findIndexOfOffset(modeStartIndex);
        var nextCharacterAfterModeIndex = -1;
        var nextTokenAfterMode = -1;
        if (modeIndex + 1 < modeTransitions.length) {
            nextTokenAfterMode = context.findIndexOfOffset(modeTransitions[modeIndex + 1].startIndex);
            nextCharacterAfterModeIndex = context.getTokenStartIndex(nextTokenAfterMode);
        }
        else {
            nextTokenAfterMode = context.getTokenCount();
            nextCharacterAfterModeIndex = context.getLineContent().length;
        }
        var firstTokenCharacterOffset = context.getTokenStartIndex(firstTokenInModeIndex);
        var newCtx = new FilteredLineContext(context, nestedMode, firstTokenInModeIndex, nextTokenAfterMode, firstTokenCharacterOffset, nextCharacterAfterModeIndex);
        return runner(nestedMode, newCtx, offset - firstTokenCharacterOffset);
    }
    exports.handleEvent = handleEvent;
    /**
     * Returns {{true}} if the line token at the specified
     * offset matches one of the provided types. Matching
     * happens on a substring start from the end, unless
     * anywhereInToken is set to true in which case matches
     * happen on a substring at any position.
     */
    function isLineToken(context, offset, types, anywhereInToken) {
        if (anywhereInToken === void 0) { anywhereInToken = false; }
        if (!Array.isArray(types) || types.length === 0) {
            return false;
        }
        if (context.getLineContent().length <= offset) {
            return false;
        }
        var tokenIdx = context.findIndexOfOffset(offset);
        var type = context.getTokenType(tokenIdx);
        for (var i = 0, len = types.length; i < len; i++) {
            if (anywhereInToken) {
                if (type.indexOf(types[i]) >= 0) {
                    return true;
                }
            }
            else {
                if (strings.endsWith(type, types[i])) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isLineToken = isLineToken;
    var FilteredLineContext = (function () {
        function FilteredLineContext(actual, mode, firstTokenInModeIndex, nextTokenAfterMode, firstTokenCharacterOffset, nextCharacterAfterModeIndex) {
            this.modeTransitions = [new modeTransition_1.ModeTransition(0, mode)];
            this._actual = actual;
            this._firstTokenInModeIndex = firstTokenInModeIndex;
            this._nextTokenAfterMode = nextTokenAfterMode;
            this._firstTokenCharacterOffset = firstTokenCharacterOffset;
            this._nextCharacterAfterModeIndex = nextCharacterAfterModeIndex;
        }
        FilteredLineContext.prototype.getLineContent = function () {
            var actualLineContent = this._actual.getLineContent();
            return actualLineContent.substring(this._firstTokenCharacterOffset, this._nextCharacterAfterModeIndex);
        };
        FilteredLineContext.prototype.getTokenCount = function () {
            return this._nextTokenAfterMode - this._firstTokenInModeIndex;
        };
        FilteredLineContext.prototype.findIndexOfOffset = function (offset) {
            return this._actual.findIndexOfOffset(offset + this._firstTokenCharacterOffset) - this._firstTokenInModeIndex;
        };
        FilteredLineContext.prototype.getTokenStartIndex = function (tokenIndex) {
            return this._actual.getTokenStartIndex(tokenIndex + this._firstTokenInModeIndex) - this._firstTokenCharacterOffset;
        };
        FilteredLineContext.prototype.getTokenEndIndex = function (tokenIndex) {
            return this._actual.getTokenEndIndex(tokenIndex + this._firstTokenInModeIndex) - this._firstTokenCharacterOffset;
        };
        FilteredLineContext.prototype.getTokenType = function (tokenIndex) {
            return this._actual.getTokenType(tokenIndex + this._firstTokenInModeIndex);
        };
        FilteredLineContext.prototype.getTokenText = function (tokenIndex) {
            return this._actual.getTokenText(tokenIndex + this._firstTokenInModeIndex);
        };
        return FilteredLineContext;
    }());
    exports.FilteredLineContext = FilteredLineContext;
    var IGNORE_IN_TOKENS = /\b(comment|string|regex)\b/;
    function ignoreBracketsInToken(tokenType) {
        return IGNORE_IN_TOKENS.test(tokenType);
    }
    exports.ignoreBracketsInToken = ignoreBracketsInToken;
    // TODO@Martin: find a better home for this code:
    // TODO@Martin: modify suggestSupport to return a boolean if snippets should be presented or not
    //       and turn this into a real registry
    var SnippetsRegistry = (function () {
        function SnippetsRegistry() {
        }
        SnippetsRegistry.registerDefaultSnippets = function (modeId, snippets) {
            this._defaultSnippets[modeId] = (this._defaultSnippets[modeId] || []).concat(snippets);
        };
        SnippetsRegistry.registerSnippets = function (modeId, path, snippets) {
            var snippetsByMode = this._snippets[modeId];
            if (!snippetsByMode) {
                this._snippets[modeId] = snippetsByMode = {};
            }
            snippetsByMode[path] = snippets;
        };
        SnippetsRegistry.getSnippets = function (model, position) {
            var word = model.getWordAtPosition(position);
            var currentPrefix = word ? word.word.substring(0, position.column - word.startColumn) : '';
            var result = {
                currentWord: currentPrefix,
                suggestions: []
            };
            // to avoid that snippets are too prominent in the intellisense proposals:
            // - force that the current prefix matches with the snippet prefix
            // if there's no prfix, only show snippets at the beginning of the line, or after a whitespace
            var filter = null;
            if (currentPrefix.length === 0) {
                if (position.column > 1) {
                    var previousCharacter = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: position.column - 1, endLineNumber: position.lineNumber, endColumn: position.column });
                    if (previousCharacter.trim().length !== 0) {
                        return result;
                    }
                }
            }
            else {
                var lowerCasePrefix_1 = currentPrefix.toLowerCase();
                filter = function (p) {
                    return strings.startsWith(p.label.toLowerCase(), lowerCasePrefix_1);
                };
            }
            var modeId = model.getMode().getId();
            var snippets = [];
            var snipppetsByMode = this._snippets[modeId];
            if (snipppetsByMode) {
                for (var s in snipppetsByMode) {
                    snippets = snippets.concat(snipppetsByMode[s]);
                }
            }
            var defaultSnippets = this._defaultSnippets[modeId];
            if (defaultSnippets) {
                snippets = snippets.concat(defaultSnippets);
            }
            result.suggestions = filter ? snippets.filter(filter) : snippets;
            // if (result.suggestions.length > 0) {
            // 	if (word) {
            // 		// Push also the current word as first suggestion, to avoid unexpected snippet acceptance on Enter.
            // 		result.suggestions = result.suggestions.slice(0);
            // 		result.suggestions.unshift({
            // 			codeSnippet: word.word,
            // 			label: word.word,
            // 			type: 'text'
            // 		});
            // 	}
            // 	result.incomplete = true;
            // }
            return result;
        };
        SnippetsRegistry._defaultSnippets = Object.create(null);
        SnippetsRegistry._snippets = Object.create(null);
        return SnippetsRegistry;
    }());
    exports.SnippetsRegistry = SnippetsRegistry;
});
//# sourceMappingURL=supports.js.map