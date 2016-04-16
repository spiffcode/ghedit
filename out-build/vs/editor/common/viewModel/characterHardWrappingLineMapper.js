define(["require", "exports", 'vs/base/common/strings', 'vs/editor/common/editorCommon', 'vs/editor/common/viewModel/prefixSumComputer', 'vs/editor/common/viewModel/splitLinesCollection'], function (require, exports, strings, editorCommon_1, prefixSumComputer_1, splitLinesCollection_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var CharacterClass;
    (function (CharacterClass) {
        CharacterClass[CharacterClass["NONE"] = 0] = "NONE";
        CharacterClass[CharacterClass["BREAK_BEFORE"] = 1] = "BREAK_BEFORE";
        CharacterClass[CharacterClass["BREAK_AFTER"] = 2] = "BREAK_AFTER";
        CharacterClass[CharacterClass["BREAK_OBTRUSIVE"] = 3] = "BREAK_OBTRUSIVE";
        CharacterClass[CharacterClass["BREAK_IDEOGRAPHIC"] = 4] = "BREAK_IDEOGRAPHIC"; // for Han and Kana.
    })(CharacterClass || (CharacterClass = {}));
    var CharacterClassifier = (function () {
        function CharacterClassifier(BREAK_BEFORE, BREAK_AFTER, BREAK_OBTRUSIVE) {
            this._asciiMap = [];
            for (var i = 0; i < 256; i++) {
                this._asciiMap[i] = CharacterClass.NONE;
            }
            this._map = [];
            for (var i = 0; i < BREAK_BEFORE.length; i++) {
                this._set(BREAK_BEFORE.charCodeAt(i), CharacterClass.BREAK_BEFORE);
            }
            for (var i = 0; i < BREAK_AFTER.length; i++) {
                this._set(BREAK_AFTER.charCodeAt(i), CharacterClass.BREAK_AFTER);
            }
            for (var i = 0; i < BREAK_OBTRUSIVE.length; i++) {
                this._set(BREAK_OBTRUSIVE.charCodeAt(i), CharacterClass.BREAK_OBTRUSIVE);
            }
        }
        CharacterClassifier.prototype._set = function (charCode, charClass) {
            if (charCode < 256) {
                this._asciiMap[charCode] = charClass;
            }
            this._map[charCode] = charClass;
        };
        CharacterClassifier.prototype.classify = function (charCode) {
            if (charCode < 256) {
                return this._asciiMap[charCode];
            }
            var charClass = this._map[charCode];
            if (charClass) {
                return charClass;
            }
            // Initialize CharacterClass.BREAK_IDEOGRAPHIC for these Unicode ranges:
            // 1. CJK Unified Ideographs (0x4E00 -- 0x9FFF)
            // 2. CJK Unified Ideographs Extension A (0x3400 -- 0x4DBF)
            // 3. Hiragana and Katakana (0x3040 -- 0x30FF)
            if ((charCode >= 0x3040 && charCode <= 0x30FF)
                || (charCode >= 0x3400 && charCode <= 0x4DBF)
                || (charCode >= 0x4E00 && charCode <= 0x9FFF)) {
                return CharacterClass.BREAK_IDEOGRAPHIC;
            }
            return CharacterClass.NONE;
        };
        return CharacterClassifier;
    }());
    var CharacterHardWrappingLineMapperFactory = (function () {
        function CharacterHardWrappingLineMapperFactory(breakBeforeChars, breakAfterChars, breakObtrusiveChars) {
            this.classifier = new CharacterClassifier(breakBeforeChars, breakAfterChars, breakObtrusiveChars);
        }
        // TODO@Alex -> duplicated in lineCommentCommand
        CharacterHardWrappingLineMapperFactory.nextVisibleColumn = function (currentVisibleColumn, tabSize, isTab, columnSize) {
            currentVisibleColumn = +currentVisibleColumn; //@perf
            tabSize = +tabSize; //@perf
            columnSize = +columnSize; //@perf
            if (isTab) {
                return currentVisibleColumn + (tabSize - (currentVisibleColumn % tabSize));
            }
            return currentVisibleColumn + columnSize;
        };
        CharacterHardWrappingLineMapperFactory.prototype.createLineMapping = function (lineText, tabSize, breakingColumn, columnsForFullWidthChar, hardWrappingIndent) {
            if (breakingColumn === -1) {
                return null;
            }
            tabSize = +tabSize; //@perf
            breakingColumn = +breakingColumn; //@perf
            columnsForFullWidthChar = +columnsForFullWidthChar; //@perf
            hardWrappingIndent = +hardWrappingIndent; //@perf
            var wrappedTextIndentVisibleColumn = 0;
            var wrappedTextIndent = '';
            var TAB_CHAR_CODE = '\t'.charCodeAt(0);
            if (hardWrappingIndent !== editorCommon_1.WrappingIndent.None) {
                var firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineText);
                if (firstNonWhitespaceIndex !== -1) {
                    wrappedTextIndent = lineText.substring(0, firstNonWhitespaceIndex);
                    for (var i = 0; i < firstNonWhitespaceIndex; i++) {
                        wrappedTextIndentVisibleColumn = CharacterHardWrappingLineMapperFactory.nextVisibleColumn(wrappedTextIndentVisibleColumn, tabSize, lineText.charCodeAt(i) === TAB_CHAR_CODE, 1);
                    }
                    if (hardWrappingIndent === editorCommon_1.WrappingIndent.Indent) {
                        wrappedTextIndent += '\t';
                        wrappedTextIndentVisibleColumn = CharacterHardWrappingLineMapperFactory.nextVisibleColumn(wrappedTextIndentVisibleColumn, tabSize, true, 1);
                    }
                    // Force sticking to beginning of line if indentColumn > 66% breakingColumn
                    if (wrappedTextIndentVisibleColumn > 1 / 2 * breakingColumn) {
                        wrappedTextIndent = '';
                        wrappedTextIndentVisibleColumn = 0;
                    }
                }
            }
            var classifier = this.classifier;
            var lastBreakingOffset = 0; // Last 0-based offset in the lineText at which a break happened
            var breakingLengths = []; // The length of each broken-up line text
            var breakingLengthsIndex = 0; // The count of breaks already done
            var visibleColumn = 0; // Visible column since the beginning of the current line
            var breakBeforeOffset; // 0-based offset in the lineText before which breaking
            var restoreVisibleColumnFrom;
            var niceBreakOffset = -1; // Last index of a character that indicates a break should happen before it (more desirable)
            var niceBreakVisibleColumn = 0; // visible column if a break were to be later introduced before `niceBreakOffset`
            var obtrusiveBreakOffset = -1; // Last index of a character that indicates a break should happen before it (less desirable)
            var obtrusiveBreakVisibleColumn = 0; // visible column if a break were to be later introduced before `obtrusiveBreakOffset`
            var len = lineText.length;
            for (var i = 0; i < len; i++) {
                // At this point, there is a certainty that the character before `i` fits on the current line,
                // but the character at `i` might not fit
                var charCode = lineText.charCodeAt(i);
                var charCodeIsTab = (charCode === TAB_CHAR_CODE);
                var charCodeClass = classifier.classify(charCode);
                if (charCodeClass === CharacterClass.BREAK_BEFORE) {
                    // This is a character that indicates that a break should happen before it
                    // Since we are certain the character before `i` fits, there's no extra checking needed,
                    // just mark it as a nice breaking opportunity
                    niceBreakOffset = i;
                    niceBreakVisibleColumn = 0;
                }
                // CJK breaking : before break
                if (charCodeClass === CharacterClass.BREAK_IDEOGRAPHIC && i > 0) {
                    var prevCode = lineText.charCodeAt(i - 1);
                    var prevClass = classifier.classify(prevCode);
                    if (prevClass !== CharacterClass.BREAK_BEFORE) {
                        niceBreakOffset = i;
                        niceBreakVisibleColumn = 0;
                    }
                }
                var charColumnSize = 1;
                if (strings.isFullWidthCharacter(charCode)) {
                    charColumnSize = columnsForFullWidthChar;
                }
                // Advance visibleColumn with character at `i`
                visibleColumn = CharacterHardWrappingLineMapperFactory.nextVisibleColumn(visibleColumn, tabSize, charCodeIsTab, charColumnSize);
                if (visibleColumn > breakingColumn && i !== 0) {
                    // We need to break at least before character at `i`:
                    //  - break before niceBreakLastOffset if it exists (and re-establish a correct visibleColumn by using niceBreakVisibleColumn + charAt(i))
                    //  - otherwise, break before obtrusiveBreakLastOffset if it exists (and re-establish a correct visibleColumn by using obtrusiveBreakVisibleColumn + charAt(i))
                    //  - otherwise, break before i (and re-establish a correct visibleColumn by charAt(i))
                    if (niceBreakOffset !== -1) {
                        // We will break before `niceBreakLastOffset`
                        breakBeforeOffset = niceBreakOffset;
                        restoreVisibleColumnFrom = niceBreakVisibleColumn + wrappedTextIndentVisibleColumn;
                    }
                    else if (obtrusiveBreakOffset !== -1) {
                        // We will break before `obtrusiveBreakLastOffset`
                        breakBeforeOffset = obtrusiveBreakOffset;
                        restoreVisibleColumnFrom = obtrusiveBreakVisibleColumn + wrappedTextIndentVisibleColumn;
                    }
                    else {
                        // We will break before `i`
                        breakBeforeOffset = i;
                        restoreVisibleColumnFrom = 0 + wrappedTextIndentVisibleColumn;
                    }
                    // Break before character at `breakBeforeOffset`
                    breakingLengths[breakingLengthsIndex++] = breakBeforeOffset - lastBreakingOffset;
                    lastBreakingOffset = breakBeforeOffset;
                    // Re-establish visibleColumn by taking character at `i` into account
                    visibleColumn = CharacterHardWrappingLineMapperFactory.nextVisibleColumn(restoreVisibleColumnFrom, tabSize, charCodeIsTab, charColumnSize);
                    // Reset markers
                    niceBreakOffset = -1;
                    niceBreakVisibleColumn = 0;
                    obtrusiveBreakOffset = -1;
                    obtrusiveBreakVisibleColumn = 0;
                }
                // At this point, there is a certainty that the character at `i` fits on the current line
                if (niceBreakOffset !== -1) {
                    // Advance niceBreakVisibleColumn
                    niceBreakVisibleColumn = CharacterHardWrappingLineMapperFactory.nextVisibleColumn(niceBreakVisibleColumn, tabSize, charCodeIsTab, charColumnSize);
                }
                if (obtrusiveBreakOffset !== -1) {
                    // Advance obtrusiveBreakVisibleColumn
                    obtrusiveBreakVisibleColumn = CharacterHardWrappingLineMapperFactory.nextVisibleColumn(obtrusiveBreakVisibleColumn, tabSize, charCodeIsTab, charColumnSize);
                }
                if (charCodeClass === CharacterClass.BREAK_AFTER) {
                    // This is a character that indicates that a break should happen after it
                    niceBreakOffset = i + 1;
                    niceBreakVisibleColumn = 0;
                }
                // CJK breaking : after break
                if (charCodeClass === CharacterClass.BREAK_IDEOGRAPHIC && i < len - 1) {
                    var nextCode = lineText.charCodeAt(i + 1);
                    var nextClass = classifier.classify(nextCode);
                    if (nextClass !== CharacterClass.BREAK_AFTER) {
                        niceBreakOffset = i + 1;
                        niceBreakVisibleColumn = 0;
                    }
                }
                if (charCodeClass === CharacterClass.BREAK_OBTRUSIVE) {
                    // This is an obtrusive character that indicates that a break should happen after it
                    obtrusiveBreakOffset = i + 1;
                    obtrusiveBreakVisibleColumn = 0;
                }
            }
            if (breakingLengthsIndex === 0) {
                return null;
            }
            // Add last segment
            breakingLengths[breakingLengthsIndex++] = len - lastBreakingOffset;
            return new CharacterHardWrappingLineMapping(new prefixSumComputer_1.PrefixSumComputer(breakingLengths), wrappedTextIndent);
        };
        return CharacterHardWrappingLineMapperFactory;
    }());
    exports.CharacterHardWrappingLineMapperFactory = CharacterHardWrappingLineMapperFactory;
    var CharacterHardWrappingLineMapping = (function () {
        function CharacterHardWrappingLineMapping(prefixSums, wrappedLinesIndent) {
            this._prefixSums = prefixSums;
            this._wrappedLinesIndent = wrappedLinesIndent;
        }
        CharacterHardWrappingLineMapping.prototype.getOutputLineCount = function () {
            return this._prefixSums.getCount();
        };
        CharacterHardWrappingLineMapping.prototype.getWrappedLinesIndent = function () {
            return this._wrappedLinesIndent;
        };
        CharacterHardWrappingLineMapping.prototype.getInputOffsetOfOutputPosition = function (outputLineIndex, outputOffset) {
            if (outputLineIndex === 0) {
                return outputOffset;
            }
            else {
                return this._prefixSums.getAccumulatedValue(outputLineIndex - 1) + outputOffset;
            }
        };
        CharacterHardWrappingLineMapping.prototype.getOutputPositionOfInputOffset = function (inputOffset) {
            var r = this._prefixSums.getIndexOf(inputOffset);
            return new splitLinesCollection_1.OutputPosition(r.index, r.remainder);
        };
        return CharacterHardWrappingLineMapping;
    }());
    exports.CharacterHardWrappingLineMapping = CharacterHardWrappingLineMapping;
});
//# sourceMappingURL=characterHardWrappingLineMapper.js.map