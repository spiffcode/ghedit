var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/base/common/strings', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/common/model/modelLine', 'vs/editor/common/model/indentationGuesser', 'vs/editor/common/config/defaultConfig'], function (require, exports, eventEmitter_1, strings, position_1, range_1, editorCommon, modelLine_1, indentationGuesser_1, defaultConfig_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LIMIT_FIND_COUNT = 999;
    var TextModel = (function (_super) {
        __extends(TextModel, _super);
        function TextModel(allowedEventTypes, rawText) {
            allowedEventTypes.push(editorCommon.EventType.ModelContentChanged, editorCommon.EventType.ModelOptionsChanged);
            _super.call(this, allowedEventTypes);
            this._options = rawText.options;
            this._constructLines(rawText);
            this._setVersionId(1);
            this._isDisposed = false;
            this._isDisposing = false;
        }
        TextModel.prototype.getOptions = function () {
            return this._options;
        };
        TextModel.prototype.updateOptions = function (newOpts) {
            var somethingChanged = false;
            var changed = {
                tabSize: false,
                insertSpaces: false
            };
            if (typeof newOpts.insertSpaces !== 'undefined') {
                if (this._options.insertSpaces !== newOpts.insertSpaces) {
                    somethingChanged = true;
                    changed.insertSpaces = true;
                    this._options.insertSpaces = newOpts.insertSpaces;
                }
            }
            if (typeof newOpts.tabSize !== 'undefined') {
                if (this._options.tabSize !== newOpts.tabSize) {
                    somethingChanged = true;
                    changed.tabSize = true;
                    this._options.tabSize = newOpts.tabSize;
                }
            }
            if (somethingChanged) {
                this.emit(editorCommon.EventType.ModelOptionsChanged, changed);
            }
        };
        TextModel.prototype.detectIndentation = function (defaultInsertSpaces, defaultTabSize) {
            var lines = this._lines.map(function (line) { return line.text; });
            var guessedIndentation = indentationGuesser_1.guessIndentation(lines, defaultTabSize, defaultInsertSpaces);
            this.updateOptions({
                insertSpaces: guessedIndentation.insertSpaces,
                tabSize: guessedIndentation.tabSize
            });
        };
        TextModel.prototype._normalizeIndentationFromWhitespace = function (str) {
            var tabSize = this._options.tabSize;
            var insertSpaces = this._options.insertSpaces;
            var spacesCnt = 0;
            for (var i = 0; i < str.length; i++) {
                if (str.charAt(i) === '\t') {
                    spacesCnt += tabSize;
                }
                else {
                    spacesCnt++;
                }
            }
            var result = '';
            if (!insertSpaces) {
                var tabsCnt = Math.floor(spacesCnt / tabSize);
                spacesCnt = spacesCnt % tabSize;
                for (var i = 0; i < tabsCnt; i++) {
                    result += '\t';
                }
            }
            for (var i = 0; i < spacesCnt; i++) {
                result += ' ';
            }
            return result;
        };
        TextModel.prototype.normalizeIndentation = function (str) {
            var firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(str);
            if (firstNonWhitespaceIndex === -1) {
                firstNonWhitespaceIndex = str.length;
            }
            return this._normalizeIndentationFromWhitespace(str.substring(0, firstNonWhitespaceIndex)) + str.substring(firstNonWhitespaceIndex);
        };
        TextModel.prototype.getOneIndent = function () {
            var tabSize = this._options.tabSize;
            var insertSpaces = this._options.insertSpaces;
            if (insertSpaces) {
                var result = '';
                for (var i = 0; i < tabSize; i++) {
                    result += ' ';
                }
                return result;
            }
            else {
                return '\t';
            }
        };
        TextModel.prototype.getVersionId = function () {
            return this._versionId;
        };
        TextModel.prototype.getAlternativeVersionId = function () {
            return this._alternativeVersionId;
        };
        TextModel.prototype._increaseVersionId = function () {
            this._setVersionId(this._versionId + 1);
        };
        TextModel.prototype._setVersionId = function (newVersionId) {
            this._versionId = newVersionId;
            this._alternativeVersionId = this._versionId;
        };
        TextModel.prototype._overwriteAlternativeVersionId = function (newAlternativeVersionId) {
            this._alternativeVersionId = newAlternativeVersionId;
        };
        TextModel.prototype.isDisposed = function () {
            return this._isDisposed;
        };
        TextModel.prototype.dispose = function () {
            this._isDisposed = true;
            // Null out members, such that any use of a disposed model will throw exceptions sooner rather than later
            this._lines = null;
            this._EOL = null;
            this._BOM = null;
            _super.prototype.dispose.call(this);
        };
        TextModel.prototype._createContentChangedFlushEvent = function () {
            return {
                changeType: editorCommon.EventType.ModelContentChangedFlush,
                detail: null,
                // TODO@Alex -> remove these fields from here
                versionId: -1,
                isUndoing: false,
                isRedoing: false
            };
        };
        TextModel.prototype._emitContentChanged2 = function (startLineNumber, startColumn, endLineNumber, endColumn, rangeLength, text, isUndoing, isRedoing) {
            var e = {
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                rangeLength: rangeLength,
                text: text,
                eol: this._EOL,
                versionId: this.getVersionId(),
                isUndoing: isUndoing,
                isRedoing: isRedoing
            };
            if (!this._isDisposing) {
                this.emit(editorCommon.EventType.ModelContentChanged2, e);
            }
        };
        TextModel.prototype._resetValue = function (e, newValue) {
            this._constructLines(newValue);
            this._increaseVersionId();
            e.detail = this.toRawText();
            e.versionId = this._versionId;
        };
        TextModel.prototype.toRawText = function () {
            return {
                BOM: this._BOM,
                EOL: this._EOL,
                lines: this.getLinesContent(),
                length: this.getValueLength(),
                options: this._options
            };
        };
        TextModel.prototype.equals = function (other) {
            if (this._BOM !== other.BOM) {
                return false;
            }
            if (this._EOL !== other.EOL) {
                return false;
            }
            if (this._lines.length !== other.lines.length) {
                return false;
            }
            for (var i = 0, len = this._lines.length; i < len; i++) {
                if (this._lines[i].text !== other.lines[i]) {
                    return false;
                }
            }
            return true;
        };
        TextModel.prototype.setValue = function (value) {
            var rawText = null;
            if (value !== null) {
                rawText = TextModel.toRawText(value, {
                    tabSize: this._options.tabSize,
                    insertSpaces: this._options.insertSpaces,
                    detectIndentation: false,
                    defaultEOL: this._options.defaultEOL
                });
            }
            this.setValueFromRawText(rawText);
        };
        TextModel.prototype.setValueFromRawText = function (newValue) {
            if (newValue === null) {
                // There's nothing to do
                return;
            }
            var oldFullModelRange = this.getFullModelRange();
            var oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
            var endLineNumber = this.getLineCount();
            var endColumn = this.getLineMaxColumn(endLineNumber);
            var e = this._createContentChangedFlushEvent();
            this._resetValue(e, newValue);
            this._emitModelContentChangedFlushEvent(e);
            this._emitContentChanged2(1, 1, endLineNumber, endColumn, oldModelValueLength, this.getValue(), false, false);
        };
        TextModel.prototype.getValue = function (eol, preserveBOM) {
            if (preserveBOM === void 0) { preserveBOM = false; }
            var fullModelRange = this.getFullModelRange();
            var fullModelValue = this.getValueInRange(fullModelRange, eol);
            if (preserveBOM) {
                return this._BOM + fullModelValue;
            }
            return fullModelValue;
        };
        TextModel.prototype.getValueLength = function (eol, preserveBOM) {
            if (preserveBOM === void 0) { preserveBOM = false; }
            var fullModelRange = this.getFullModelRange();
            var fullModelValue = this.getValueLengthInRange(fullModelRange, eol);
            if (preserveBOM) {
                return this._BOM.length + fullModelValue;
            }
            return fullModelValue;
        };
        TextModel.prototype.getEmptiedValueInRange = function (rawRange, fillCharacter, eol) {
            if (fillCharacter === void 0) { fillCharacter = ''; }
            if (eol === void 0) { eol = editorCommon.EndOfLinePreference.TextDefined; }
            var range = this.validateRange(rawRange);
            if (range.isEmpty()) {
                return '';
            }
            if (range.startLineNumber === range.endLineNumber) {
                return this._repeatCharacter(fillCharacter, range.endColumn - range.startColumn);
            }
            var lineEnding = this._getEndOfLine(eol), startLineIndex = range.startLineNumber - 1, endLineIndex = range.endLineNumber - 1, resultLines = [];
            resultLines.push(this._repeatCharacter(fillCharacter, this._lines[startLineIndex].text.length - range.startColumn + 1));
            for (var i = startLineIndex + 1; i < endLineIndex; i++) {
                resultLines.push(this._repeatCharacter(fillCharacter, this._lines[i].text.length));
            }
            resultLines.push(this._repeatCharacter(fillCharacter, range.endColumn - 1));
            return resultLines.join(lineEnding);
        };
        TextModel.prototype._repeatCharacter = function (fillCharacter, count) {
            var r = '';
            for (var i = 0; i < count; i++) {
                r += fillCharacter;
            }
            return r;
        };
        TextModel.prototype.getValueInRange = function (rawRange, eol) {
            if (eol === void 0) { eol = editorCommon.EndOfLinePreference.TextDefined; }
            var range = this.validateRange(rawRange);
            if (range.isEmpty()) {
                return '';
            }
            if (range.startLineNumber === range.endLineNumber) {
                return this._lines[range.startLineNumber - 1].text.substring(range.startColumn - 1, range.endColumn - 1);
            }
            var lineEnding = this._getEndOfLine(eol), startLineIndex = range.startLineNumber - 1, endLineIndex = range.endLineNumber - 1, resultLines = [];
            resultLines.push(this._lines[startLineIndex].text.substring(range.startColumn - 1));
            for (var i = startLineIndex + 1; i < endLineIndex; i++) {
                resultLines.push(this._lines[i].text);
            }
            resultLines.push(this._lines[endLineIndex].text.substring(0, range.endColumn - 1));
            return resultLines.join(lineEnding);
        };
        TextModel.prototype.getValueLengthInRange = function (rawRange, eol) {
            if (eol === void 0) { eol = editorCommon.EndOfLinePreference.TextDefined; }
            var range = this.validateRange(rawRange);
            if (range.isEmpty()) {
                return 0;
            }
            if (range.startLineNumber === range.endLineNumber) {
                return (range.endColumn - range.startColumn);
            }
            var lineEndingLength = this._getEndOfLine(eol).length, startLineIndex = range.startLineNumber - 1, endLineIndex = range.endLineNumber - 1, result = 0;
            result += (this._lines[startLineIndex].text.length - range.startColumn + 1);
            for (var i = startLineIndex + 1; i < endLineIndex; i++) {
                result += lineEndingLength + this._lines[i].text.length;
            }
            result += lineEndingLength + (range.endColumn - 1);
            return result;
        };
        TextModel.prototype.isDominatedByLongLines = function (longLineBoundary) {
            var smallLineCharCount = 0, longLineCharCount = 0, i, len, lines = this._lines, lineLength;
            for (i = 0, len = this._lines.length; i < len; i++) {
                lineLength = lines[i].text.length;
                if (lineLength >= longLineBoundary) {
                    longLineCharCount += lineLength;
                }
                else {
                    smallLineCharCount += lineLength;
                }
            }
            return (longLineCharCount > smallLineCharCount);
        };
        TextModel.prototype.getLineCount = function () {
            return this._lines.length;
        };
        TextModel.prototype.getLineContent = function (lineNumber) {
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
            }
            return this._lines[lineNumber - 1].text;
        };
        TextModel.prototype.getLinesContent = function () {
            var r = [];
            for (var i = 0, len = this._lines.length; i < len; i++) {
                r[i] = this._lines[i].text;
            }
            return r;
        };
        TextModel.prototype.getEOL = function () {
            return this._EOL;
        };
        TextModel.prototype.setEOL = function (eol) {
            var newEOL = (eol === editorCommon.EndOfLineSequence.CRLF ? '\r\n' : '\n');
            if (this._EOL === newEOL) {
                // Nothing to do
                return;
            }
            var oldFullModelRange = this.getFullModelRange();
            var oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
            var endLineNumber = this.getLineCount();
            var endColumn = this.getLineMaxColumn(endLineNumber);
            this._EOL = newEOL;
            this._increaseVersionId();
            var e = this._createContentChangedFlushEvent();
            e.detail = this.toRawText();
            e.versionId = this._versionId;
            this._emitModelContentChangedFlushEvent(e);
            this._emitContentChanged2(1, 1, endLineNumber, endColumn, oldModelValueLength, this.getValue(), false, false);
        };
        TextModel.prototype.getLineMinColumn = function (lineNumber) {
            return 1;
        };
        TextModel.prototype.getLineMaxColumn = function (lineNumber) {
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
            }
            return this._lines[lineNumber - 1].text.length + 1;
        };
        TextModel.prototype.getLineFirstNonWhitespaceColumn = function (lineNumber) {
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
            }
            var result = strings.firstNonWhitespaceIndex(this._lines[lineNumber - 1].text);
            if (result === -1) {
                return 0;
            }
            return result + 1;
        };
        TextModel.prototype.getLineLastNonWhitespaceColumn = function (lineNumber) {
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
            }
            var result = strings.lastNonWhitespaceIndex(this._lines[lineNumber - 1].text);
            if (result === -1) {
                return 0;
            }
            return result + 2;
        };
        TextModel.prototype.validateLineNumber = function (lineNumber) {
            if (lineNumber < 1) {
                lineNumber = 1;
            }
            if (lineNumber > this._lines.length) {
                lineNumber = this._lines.length;
            }
            return lineNumber;
        };
        TextModel.prototype.validatePosition = function (position) {
            var lineNumber = position.lineNumber ? position.lineNumber : 1;
            var column = position.column ? position.column : 1;
            if (lineNumber < 1) {
                lineNumber = 1;
            }
            if (lineNumber > this._lines.length) {
                lineNumber = this._lines.length;
            }
            if (column < 1) {
                column = 1;
            }
            var maxColumn = this.getLineMaxColumn(lineNumber);
            if (column > maxColumn) {
                column = maxColumn;
            }
            return new position_1.Position(lineNumber, column);
        };
        TextModel.prototype.validateRange = function (range) {
            var start = this.validatePosition(new position_1.Position(range.startLineNumber, range.startColumn));
            var end = this.validatePosition(new position_1.Position(range.endLineNumber, range.endColumn));
            return new range_1.Range(start.lineNumber, start.column, end.lineNumber, end.column);
        };
        TextModel.prototype.modifyPosition = function (rawPosition, offset) {
            var position = this.validatePosition(rawPosition);
            // Handle positive offsets, one line at a time
            while (offset > 0) {
                var maxColumn = this.getLineMaxColumn(position.lineNumber);
                // Get to end of line
                if (position.column < maxColumn) {
                    var subtract = Math.min(offset, maxColumn - position.column);
                    offset -= subtract;
                    position.column += subtract;
                }
                if (offset === 0) {
                    break;
                }
                // Go to next line
                offset -= this._EOL.length;
                if (offset < 0) {
                    throw new Error('TextModel.modifyPosition: Breaking line terminators');
                }
                ++position.lineNumber;
                if (position.lineNumber > this._lines.length) {
                    throw new Error('TextModel.modifyPosition: Offset goes beyond the end of the model');
                }
                position.column = 1;
            }
            // Handle negative offsets, one line at a time
            while (offset < 0) {
                // Get to the start of the line
                if (position.column > 1) {
                    var add = Math.min(-offset, position.column - 1);
                    offset += add;
                    position.column -= add;
                }
                if (offset === 0) {
                    break;
                }
                // Go to the previous line
                offset += this._EOL.length;
                if (offset > 0) {
                    throw new Error('TextModel.modifyPosition: Breaking line terminators');
                }
                --position.lineNumber;
                if (position.lineNumber < 1) {
                    throw new Error('TextModel.modifyPosition: Offset goes beyond the beginning of the model');
                }
                position.column = this.getLineMaxColumn(position.lineNumber);
            }
            return position;
        };
        TextModel.prototype.getFullModelRange = function () {
            var lineCount = this.getLineCount();
            return new range_1.Range(1, 1, lineCount, this.getLineMaxColumn(lineCount));
        };
        TextModel.prototype._emitModelContentChangedFlushEvent = function (e) {
            if (!this._isDisposing) {
                this.emit(editorCommon.EventType.ModelContentChanged, e);
            }
        };
        TextModel.toRawText = function (rawText, opts) {
            // Count the number of lines that end with \r\n
            var carriageReturnCnt = 0, lastCarriageReturnIndex = -1;
            while ((lastCarriageReturnIndex = rawText.indexOf('\r', lastCarriageReturnIndex + 1)) !== -1) {
                carriageReturnCnt++;
            }
            // Split the text into liens
            var lines = rawText.split(/\r\n|\r|\n/);
            // Remove the BOM (if present)
            var BOM = '';
            if (strings.startsWithUTF8BOM(lines[0])) {
                BOM = strings.UTF8_BOM_CHARACTER;
                lines[0] = lines[0].substr(1);
            }
            var lineFeedCnt = lines.length - 1;
            var EOL = '';
            if (lineFeedCnt === 0) {
                // This is an empty file or a file with precisely one line
                EOL = (opts.defaultEOL === editorCommon.DefaultEndOfLine.LF ? '\n' : '\r\n');
            }
            else if (carriageReturnCnt > lineFeedCnt / 2) {
                // More than half of the file contains \r\n ending lines
                EOL = '\r\n';
            }
            else {
                // At least one line more ends in \n
                EOL = '\n';
            }
            var resolvedOpts;
            if (opts.detectIndentation) {
                var guessedIndentation = indentationGuesser_1.guessIndentation(lines, opts.tabSize, opts.insertSpaces);
                resolvedOpts = {
                    tabSize: guessedIndentation.tabSize,
                    insertSpaces: guessedIndentation.insertSpaces,
                    defaultEOL: opts.defaultEOL
                };
            }
            else {
                resolvedOpts = {
                    tabSize: opts.tabSize,
                    insertSpaces: opts.insertSpaces,
                    defaultEOL: opts.defaultEOL
                };
            }
            return {
                BOM: BOM,
                EOL: EOL,
                lines: lines,
                length: rawText.length,
                options: resolvedOpts
            };
        };
        TextModel.prototype._constructLines = function (rawText) {
            var rawLines = rawText.lines, modelLines = [], i, len;
            for (i = 0, len = rawLines.length; i < len; i++) {
                modelLines.push(new modelLine_1.ModelLine(i + 1, rawLines[i]));
            }
            this._BOM = rawText.BOM;
            this._EOL = rawText.EOL;
            this._lines = modelLines;
        };
        TextModel.prototype._getEndOfLine = function (eol) {
            switch (eol) {
                case editorCommon.EndOfLinePreference.LF:
                    return '\n';
                case editorCommon.EndOfLinePreference.CRLF:
                    return '\r\n';
                case editorCommon.EndOfLinePreference.TextDefined:
                    return this.getEOL();
            }
            throw new Error('Unknown EOL preference');
        };
        TextModel.prototype.findMatches = function (searchString, rawSearchScope, isRegex, matchCase, wholeWord, limitResultCount) {
            if (limitResultCount === void 0) { limitResultCount = LIMIT_FIND_COUNT; }
            var regex = strings.createSafeRegExp(searchString, isRegex, matchCase, wholeWord);
            if (!regex) {
                return [];
            }
            var searchRange;
            if (range_1.Range.isIRange(rawSearchScope)) {
                searchRange = rawSearchScope;
            }
            else {
                searchRange = this.getFullModelRange();
            }
            return this._doFindMatches(searchRange, regex, limitResultCount);
        };
        TextModel.prototype.findNextMatch = function (searchString, rawSearchStart, isRegex, matchCase, wholeWord) {
            var regex = strings.createSafeRegExp(searchString, isRegex, matchCase, wholeWord);
            if (!regex) {
                return null;
            }
            var searchStart = this.validatePosition(rawSearchStart), lineCount = this.getLineCount(), startLineNumber = searchStart.lineNumber, text, r;
            // Look in first line
            text = this._lines[startLineNumber - 1].text.substring(searchStart.column - 1);
            r = this._findMatchInLine(regex, text, startLineNumber, searchStart.column - 1);
            if (r) {
                return r;
            }
            for (var i = 1; i <= lineCount; i++) {
                var lineIndex = (startLineNumber + i - 1) % lineCount;
                text = this._lines[lineIndex].text;
                r = this._findMatchInLine(regex, text, lineIndex + 1, 0);
                if (r) {
                    return r;
                }
            }
            return null;
        };
        TextModel.prototype.findPreviousMatch = function (searchString, rawSearchStart, isRegex, matchCase, wholeWord) {
            var regex = strings.createSafeRegExp(searchString, isRegex, matchCase, wholeWord);
            if (!regex) {
                return null;
            }
            var searchStart = this.validatePosition(rawSearchStart), lineCount = this.getLineCount(), startLineNumber = searchStart.lineNumber, text, r;
            // Look in first line
            text = this._lines[startLineNumber - 1].text.substring(0, searchStart.column - 1);
            r = this._findLastMatchInLine(regex, text, startLineNumber);
            if (r) {
                return r;
            }
            for (var i = 1; i <= lineCount; i++) {
                var lineIndex = (lineCount + startLineNumber - i - 1) % lineCount;
                text = this._lines[lineIndex].text;
                r = this._findLastMatchInLine(regex, text, lineIndex + 1);
                if (r) {
                    return r;
                }
            }
            return null;
        };
        TextModel.prototype._doFindMatches = function (searchRange, searchRegex, limitResultCount) {
            var result = [], text, counter = 0;
            // Early case for a search range that starts & stops on the same line number
            if (searchRange.startLineNumber === searchRange.endLineNumber) {
                text = this._lines[searchRange.startLineNumber - 1].text.substring(searchRange.startColumn - 1, searchRange.endColumn - 1);
                counter = this._findMatchesInLine(searchRegex, text, searchRange.startLineNumber, searchRange.startColumn - 1, counter, result, limitResultCount);
                return result;
            }
            // Collect results from first line
            text = this._lines[searchRange.startLineNumber - 1].text.substring(searchRange.startColumn - 1);
            counter = this._findMatchesInLine(searchRegex, text, searchRange.startLineNumber, searchRange.startColumn - 1, counter, result, limitResultCount);
            // Collect results from middle lines
            for (var lineNumber = searchRange.startLineNumber + 1; lineNumber < searchRange.endLineNumber && counter < limitResultCount; lineNumber++) {
                counter = this._findMatchesInLine(searchRegex, this._lines[lineNumber - 1].text, lineNumber, 0, counter, result, limitResultCount);
            }
            // Collect results from last line
            if (counter < limitResultCount) {
                text = this._lines[searchRange.endLineNumber - 1].text.substring(0, searchRange.endColumn - 1);
                counter = this._findMatchesInLine(searchRegex, text, searchRange.endLineNumber, 0, counter, result, limitResultCount);
            }
            return result;
        };
        TextModel.prototype._findMatchInLine = function (searchRegex, text, lineNumber, deltaOffset) {
            var m = searchRegex.exec(text);
            if (!m) {
                return null;
            }
            return new range_1.Range(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset);
        };
        TextModel.prototype._findLastMatchInLine = function (searchRegex, text, lineNumber) {
            var bestResult = null;
            var m;
            while ((m = searchRegex.exec(text))) {
                var result = new range_1.Range(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length);
                if (result.equalsRange(bestResult)) {
                    break;
                }
                bestResult = result;
            }
            return bestResult;
        };
        TextModel.prototype._findMatchesInLine = function (searchRegex, text, lineNumber, deltaOffset, counter, result, limitResultCount) {
            var m;
            // Reset regex to search from the beginning
            searchRegex.lastIndex = 0;
            do {
                m = searchRegex.exec(text);
                if (m) {
                    var range = new range_1.Range(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset);
                    // Exit early if the regex matches the same range
                    if (range.equalsRange(result[result.length - 1])) {
                        return counter;
                    }
                    result.push(range);
                    counter++;
                    if (counter >= limitResultCount) {
                        return counter;
                    }
                }
            } while (m);
            return counter;
        };
        TextModel.DEFAULT_CREATION_OPTIONS = {
            tabSize: defaultConfig_1.DEFAULT_INDENTATION.tabSize,
            insertSpaces: defaultConfig_1.DEFAULT_INDENTATION.insertSpaces,
            detectIndentation: false,
            defaultEOL: editorCommon.DefaultEndOfLine.LF
        };
        return TextModel;
    }(eventEmitter_1.OrderGuaranteeEventEmitter));
    exports.TextModel = TextModel;
    var RawText = (function () {
        function RawText() {
        }
        RawText.fromString = function (rawText, opts) {
            return TextModel.toRawText(rawText, opts);
        };
        RawText.fromStringWithModelOptions = function (rawText, model) {
            var opts = model.getOptions();
            return TextModel.toRawText(rawText, {
                tabSize: opts.tabSize,
                insertSpaces: opts.insertSpaces,
                detectIndentation: false,
                defaultEOL: opts.defaultEOL
            });
        };
        return RawText;
    }());
    exports.RawText = RawText;
});
