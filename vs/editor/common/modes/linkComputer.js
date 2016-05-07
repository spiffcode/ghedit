define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // State machine for http:// or https://
    var STATE_MAP = [], START_STATE = 1, END_STATE = 9, ACCEPT_STATE = 10;
    STATE_MAP[1] = { 'h': 2, 'H': 2 };
    STATE_MAP[2] = { 't': 3, 'T': 3 };
    STATE_MAP[3] = { 't': 4, 'T': 4 };
    STATE_MAP[4] = { 'p': 5, 'P': 5 };
    STATE_MAP[5] = { 's': 6, 'S': 6, ':': 7 };
    STATE_MAP[6] = { ':': 7 };
    STATE_MAP[7] = { '/': 8 };
    STATE_MAP[8] = { '/': 9 };
    var CharacterClass;
    (function (CharacterClass) {
        CharacterClass[CharacterClass["None"] = 0] = "None";
        CharacterClass[CharacterClass["ForceTermination"] = 1] = "ForceTermination";
        CharacterClass[CharacterClass["CannotEndIn"] = 2] = "CannotEndIn";
    })(CharacterClass || (CharacterClass = {}));
    var getCharacterClasses = (function () {
        var FORCE_TERMINATION_CHARACTERS = ' \t<>\'\"';
        var CANNOT_END_WITH_CHARACTERS = '.,;';
        var _cachedResult = null;
        var findLargestCharCode = function (str) {
            var r = 0;
            for (var i = 0, len = str.length; i < len; i++) {
                r = Math.max(r, str.charCodeAt(i));
            }
            return r;
        };
        var set = function (str, toWhat) {
            for (var i = 0, len = str.length; i < len; i++) {
                _cachedResult[str.charCodeAt(i)] = toWhat;
            }
        };
        return function () {
            if (_cachedResult === null) {
                // Find cachedResult size
                var largestCharCode = Math.max(findLargestCharCode(FORCE_TERMINATION_CHARACTERS), findLargestCharCode(CANNOT_END_WITH_CHARACTERS));
                // Initialize cachedResult
                _cachedResult = [];
                for (var i = 0; i < largestCharCode; i++) {
                    _cachedResult[i] = CharacterClass.None;
                }
                // Fill in cachedResult
                set(FORCE_TERMINATION_CHARACTERS, CharacterClass.ForceTermination);
                set(CANNOT_END_WITH_CHARACTERS, CharacterClass.CannotEndIn);
            }
            return _cachedResult;
        };
    })();
    var _openParens = '('.charCodeAt(0);
    var _closeParens = ')'.charCodeAt(0);
    var _openSquareBracket = '['.charCodeAt(0);
    var _closeSquareBracket = ']'.charCodeAt(0);
    var _openCurlyBracket = '{'.charCodeAt(0);
    var _closeCurlyBracket = '}'.charCodeAt(0);
    var LinkComputer = (function () {
        function LinkComputer() {
        }
        LinkComputer._createLink = function (line, lineNumber, linkBeginIndex, linkEndIndex) {
            return {
                range: {
                    startLineNumber: lineNumber,
                    startColumn: linkBeginIndex + 1,
                    endLineNumber: lineNumber,
                    endColumn: linkEndIndex + 1
                },
                url: line.substring(linkBeginIndex, linkEndIndex)
            };
        };
        LinkComputer.computeLinks = function (model) {
            var i, lineCount, result = [];
            var line, j, lastIncludedCharIndex, len, characterClasses = getCharacterClasses(), characterClassesLength = characterClasses.length, linkBeginIndex, state, ch, chCode, chClass, resetStateMachine, hasOpenParens, hasOpenSquareBracket, hasOpenCurlyBracket;
            for (i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
                line = model.getLineContent(i);
                j = 0;
                len = line.length;
                linkBeginIndex = 0;
                state = START_STATE;
                hasOpenParens = false;
                hasOpenSquareBracket = false;
                hasOpenCurlyBracket = false;
                while (j < len) {
                    ch = line.charAt(j);
                    chCode = line.charCodeAt(j);
                    resetStateMachine = false;
                    if (state === ACCEPT_STATE) {
                        switch (chCode) {
                            case _openParens:
                                hasOpenParens = true;
                                chClass = CharacterClass.None;
                                break;
                            case _closeParens:
                                chClass = (hasOpenParens ? CharacterClass.None : CharacterClass.ForceTermination);
                                break;
                            case _openSquareBracket:
                                hasOpenSquareBracket = true;
                                chClass = CharacterClass.None;
                                break;
                            case _closeSquareBracket:
                                chClass = (hasOpenSquareBracket ? CharacterClass.None : CharacterClass.ForceTermination);
                                break;
                            case _openCurlyBracket:
                                hasOpenCurlyBracket = true;
                                chClass = CharacterClass.None;
                                break;
                            case _closeCurlyBracket:
                                chClass = (hasOpenCurlyBracket ? CharacterClass.None : CharacterClass.ForceTermination);
                                break;
                            default:
                                chClass = (chCode < characterClassesLength ? characterClasses[chCode] : CharacterClass.None);
                        }
                        // Check if character terminates link
                        if (chClass === CharacterClass.ForceTermination) {
                            // Do not allow to end link in certain characters...
                            lastIncludedCharIndex = j - 1;
                            do {
                                chCode = line.charCodeAt(lastIncludedCharIndex);
                                chClass = (chCode < characterClassesLength ? characterClasses[chCode] : CharacterClass.None);
                                if (chClass !== CharacterClass.CannotEndIn) {
                                    break;
                                }
                                lastIncludedCharIndex--;
                            } while (lastIncludedCharIndex > linkBeginIndex);
                            result.push(LinkComputer._createLink(line, i, linkBeginIndex, lastIncludedCharIndex + 1));
                            resetStateMachine = true;
                        }
                    }
                    else if (state === END_STATE) {
                        chClass = (chCode < characterClassesLength ? characterClasses[chCode] : CharacterClass.None);
                        // Check if character terminates link
                        if (chClass === CharacterClass.ForceTermination) {
                            resetStateMachine = true;
                        }
                        else {
                            state = ACCEPT_STATE;
                        }
                    }
                    else {
                        if (STATE_MAP[state].hasOwnProperty(ch)) {
                            state = STATE_MAP[state][ch];
                        }
                        else {
                            resetStateMachine = true;
                        }
                    }
                    if (resetStateMachine) {
                        state = START_STATE;
                        hasOpenParens = false;
                        hasOpenSquareBracket = false;
                        hasOpenCurlyBracket = false;
                        // Record where the link started
                        linkBeginIndex = j + 1;
                    }
                    j++;
                }
                if (state === ACCEPT_STATE) {
                    result.push(LinkComputer._createLink(line, i, linkBeginIndex, len));
                }
            }
            return result;
        };
        return LinkComputer;
    }());
    /**
     * Returns an array of all links contains in the provided
     * document. *Note* that this operation is computational
     * expensive and should not run in the UI thread.
     */
    function computeLinks(model) {
        if (!model || typeof model.getLineCount !== 'function' || typeof model.getLineContent !== 'function') {
            // Unknown caller!
            return [];
        }
        return LinkComputer.computeLinks(model);
    }
    exports.computeLinks = computeLinks;
});
//# sourceMappingURL=linkComputer.js.map