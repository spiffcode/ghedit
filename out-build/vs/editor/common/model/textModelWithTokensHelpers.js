define(["require", "exports", 'vs/editor/common/modes/nullMode', 'vs/editor/common/core/modeTransition'], function (require, exports, nullMode_1, modeTransition_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WordHelper = (function () {
        function WordHelper() {
        }
        WordHelper._safeGetWordDefinition = function (mode) {
            return (mode.richEditSupport ? mode.richEditSupport.wordDefinition : null);
        };
        WordHelper.ensureValidWordDefinition = function (wordDefinition) {
            var result = nullMode_1.NullMode.DEFAULT_WORD_REGEXP;
            if (wordDefinition && (wordDefinition instanceof RegExp)) {
                if (!wordDefinition.global) {
                    var flags = 'g';
                    if (wordDefinition.ignoreCase) {
                        flags += 'i';
                    }
                    if (wordDefinition.multiline) {
                        flags += 'm';
                    }
                    result = new RegExp(wordDefinition.source, flags);
                }
                else {
                    result = wordDefinition;
                }
            }
            result.lastIndex = 0;
            return result;
        };
        WordHelper.massageWordDefinitionOf = function (mode) {
            return WordHelper.ensureValidWordDefinition(WordHelper._safeGetWordDefinition(mode));
        };
        WordHelper.getWords = function (textSource, lineNumber) {
            if (!textSource._lineIsTokenized(lineNumber)) {
                return WordHelper._getWordsInText(textSource.getLineContent(lineNumber), WordHelper.massageWordDefinitionOf(textSource.getMode()));
            }
            var r = [], txt = textSource.getLineContent(lineNumber);
            if (txt.length > 0) {
                var modeTransitions = textSource._getLineModeTransitions(lineNumber), i, len, k, lenK, currentModeStartIndex, currentModeEndIndex, currentWordDefinition, currentModeText, words, startWord, endWord, word;
                // Go through all the modes
                for (i = 0, currentModeStartIndex = 0, len = modeTransitions.length; i < len; i++) {
                    currentWordDefinition = WordHelper.massageWordDefinitionOf(modeTransitions[i].mode);
                    currentModeStartIndex = modeTransitions[i].startIndex;
                    currentModeEndIndex = (i + 1 < len ? modeTransitions[i + 1].startIndex : txt.length);
                    currentModeText = txt.substring(currentModeStartIndex, currentModeEndIndex);
                    words = currentModeText.match(currentWordDefinition);
                    if (!words) {
                        continue;
                    }
                    endWord = 0;
                    for (k = 0, lenK = words.length; k < lenK; k++) {
                        word = words[k];
                        if (word.length > 0) {
                            startWord = currentModeText.indexOf(word, endWord);
                            endWord = startWord + word.length;
                            r.push({
                                start: currentModeStartIndex + startWord,
                                end: currentModeStartIndex + endWord
                            });
                        }
                    }
                }
            }
            return r;
        };
        WordHelper._getWordsInText = function (text, wordDefinition) {
            var words = text.match(wordDefinition) || [], k, startWord, endWord, startColumn, endColumn, word, r = [];
            for (k = 0; k < words.length; k++) {
                word = words[k].trim();
                if (word.length > 0) {
                    startWord = text.indexOf(word, endWord);
                    endWord = startWord + word.length;
                    startColumn = startWord;
                    endColumn = endWord;
                    r.push({
                        start: startColumn,
                        end: endColumn
                    });
                }
            }
            return r;
        };
        WordHelper._getWordAtColumn = function (txt, column, modeIndex, modeTransitions) {
            var modeStartIndex = modeTransitions[modeIndex].startIndex, modeEndIndex = (modeIndex + 1 < modeTransitions.length ? modeTransitions[modeIndex + 1].startIndex : txt.length), mode = modeTransitions[modeIndex].mode;
            return WordHelper._getWordAtText(column, WordHelper.massageWordDefinitionOf(mode), txt.substring(modeStartIndex, modeEndIndex), modeStartIndex);
        };
        WordHelper.getWordAtPosition = function (textSource, position) {
            if (!textSource._lineIsTokenized(position.lineNumber)) {
                return WordHelper._getWordAtText(position.column, WordHelper.massageWordDefinitionOf(textSource.getMode()), textSource.getLineContent(position.lineNumber), 0);
            }
            var result = null;
            var txt = textSource.getLineContent(position.lineNumber), modeTransitions = textSource._getLineModeTransitions(position.lineNumber), columnIndex = position.column - 1, modeIndex = modeTransition_1.ModeTransition.findIndexInSegmentsArray(modeTransitions, columnIndex);
            result = WordHelper._getWordAtColumn(txt, position.column, modeIndex, modeTransitions);
            if (!result && modeIndex > 0 && modeTransitions[modeIndex].startIndex === columnIndex) {
                // The position is right at the beginning of `modeIndex`, so try looking at `modeIndex` - 1 too
                result = WordHelper._getWordAtColumn(txt, position.column, modeIndex - 1, modeTransitions);
            }
            return result;
        };
        WordHelper._getWordAtText = function (column, wordDefinition, text, textOffset) {
            // console.log('_getWordAtText: ', column, text, textOffset);
            var words = text.match(wordDefinition), k, startWord, endWord, startColumn, endColumn, word;
            if (words) {
                for (k = 0; k < words.length; k++) {
                    word = words[k].trim();
                    if (word.length > 0) {
                        startWord = text.indexOf(word, endWord);
                        endWord = startWord + word.length;
                        startColumn = textOffset + startWord + 1;
                        endColumn = textOffset + endWord + 1;
                        if (startColumn <= column && column <= endColumn) {
                            return {
                                word: word,
                                startColumn: startColumn,
                                endColumn: endColumn
                            };
                        }
                    }
                }
            }
            return null;
        };
        return WordHelper;
    }());
    exports.WordHelper = WordHelper;
});
//# sourceMappingURL=textModelWithTokensHelpers.js.map