define(["require", "exports", 'vs/base/common/strings', 'vs/editor/common/core/arrays', 'vs/editor/common/editorCommon', 'vs/editor/common/core/range'], function (require, exports, strings, arrays_1, editorCommon_1, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function cmpLineDecorations(a, b) {
        return range_1.Range.compareRangesUsingStarts(a.range, b.range);
    }
    function createLineParts(lineNumber, minLineColumn, lineContent, tabSize, lineTokens, rawLineDecorations, renderWhitespace, indentGuides) {
        if (indentGuides || renderWhitespace) {
            var oldLength = rawLineDecorations.length;
            rawLineDecorations = insertCustomLineDecorations(indentGuides, renderWhitespace, lineNumber, lineContent, tabSize, lineTokens.getFauxIndentLength(), rawLineDecorations);
            if (rawLineDecorations.length !== oldLength) {
                rawLineDecorations.sort(cmpLineDecorations);
            }
        }
        if (rawLineDecorations.length > 0) {
            return createViewLineParts(lineNumber, minLineColumn, lineTokens, lineContent, rawLineDecorations);
        }
        else {
            return createFastViewLineParts(lineTokens, lineContent);
        }
    }
    exports.createLineParts = createLineParts;
    function getColumnOfLinePartOffset(stopRenderingLineAfter, lineParts, lineMaxColumn, charOffsetInPart, partIndex, partLength, offset) {
        if (partIndex >= lineParts.length) {
            return stopRenderingLineAfter;
        }
        if (offset === 0) {
            return lineParts[partIndex].startIndex + 1;
        }
        if (offset === partLength) {
            return (partIndex + 1 < lineParts.length ? lineParts[partIndex + 1].startIndex + 1 : lineMaxColumn);
        }
        var originalMin = lineParts[partIndex].startIndex;
        var originalMax = (partIndex + 1 < lineParts.length ? lineParts[partIndex + 1].startIndex : lineMaxColumn - 1);
        var min = originalMin;
        var max = originalMax;
        // invariant: offsetOf(min) <= offset <= offsetOf(max)
        while (min + 1 < max) {
            var mid = Math.floor((min + max) / 2);
            var midOffset = charOffsetInPart[mid];
            if (midOffset === offset) {
                return mid + 1;
            }
            else if (midOffset > offset) {
                max = mid;
            }
            else {
                min = mid;
            }
        }
        if (min === max) {
            return min + 1;
        }
        var minOffset = charOffsetInPart[min];
        var maxOffset = (max < originalMax ? charOffsetInPart[max] : partLength);
        var distanceToMin = offset - minOffset;
        var distanceToMax = maxOffset - offset;
        if (distanceToMin <= distanceToMax) {
            return min + 1;
        }
        else {
            return max + 1;
        }
    }
    exports.getColumnOfLinePartOffset = getColumnOfLinePartOffset;
    function trimEmptyTrailingPart(parts, lineContent) {
        if (parts.length <= 1) {
            return parts;
        }
        var lastPartStartIndex = parts[parts.length - 1].startIndex;
        if (lastPartStartIndex < lineContent.length) {
            // All is good
            return parts;
        }
        // Remove last line part
        return parts.slice(0, parts.length - 1);
    }
    var _tab = '\t'.charCodeAt(0);
    var _space = ' '.charCodeAt(0);
    function insertOneCustomLineDecoration(dest, lineNumber, startColumn, endColumn, className) {
        dest.push({
            range: new range_1.Range(lineNumber, startColumn, lineNumber, endColumn),
            options: {
                inlineClassName: className
            }
        });
    }
    function insertCustomLineDecorations(indentGuides, renderWhitespace, lineNumber, lineContent, tabSize, fauxIndentLength, rawLineDecorations) {
        if (!indentGuides && !renderWhitespace) {
            return rawLineDecorations;
        }
        var lineLength = lineContent.length;
        if (lineLength === fauxIndentLength) {
            return rawLineDecorations;
        }
        var firstChar = indentGuides ? lineContent.charCodeAt(0) : lineContent.charCodeAt(fauxIndentLength);
        var lastChar = lineContent.charCodeAt(lineLength - 1);
        if (firstChar !== _tab && firstChar !== _space && lastChar !== _tab && lastChar !== _space) {
            // This line contains no leading nor trailing whitespace => fast path
            return rawLineDecorations;
        }
        var firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
        var lastNonWhitespaceIndex;
        if (firstNonWhitespaceIndex === -1) {
            // The entire line is whitespace
            firstNonWhitespaceIndex = lineLength;
            lastNonWhitespaceIndex = lineLength;
        }
        else {
            lastNonWhitespaceIndex = strings.lastNonWhitespaceIndex(lineContent);
        }
        var sm_endIndex = [];
        var sm_decoration = [];
        if (fauxIndentLength > 0) {
            // add faux indent state
            sm_endIndex.push(fauxIndentLength - 1);
            sm_decoration.push(indentGuides ? 'indent-guide' : null);
        }
        if (firstNonWhitespaceIndex > fauxIndentLength) {
            // add leading whitespace state
            sm_endIndex.push(firstNonWhitespaceIndex - 1);
            var leadingClassName = null;
            if (fauxIndentLength > 0) {
                leadingClassName = (renderWhitespace ? 'leading whitespace' : null);
            }
            else {
                if (indentGuides && renderWhitespace) {
                    leadingClassName = 'leading whitespace indent-guide';
                }
                else if (indentGuides) {
                    leadingClassName = 'indent-guide';
                }
                else {
                    leadingClassName = 'leading whitespace';
                }
            }
            sm_decoration.push(leadingClassName);
        }
        // add content state
        sm_endIndex.push(lastNonWhitespaceIndex);
        sm_decoration.push(null);
        // add trailing whitespace state
        sm_endIndex.push(lineLength - 1);
        sm_decoration.push(renderWhitespace ? 'trailing whitespace' : null);
        // add dummy state to avoid array length checks
        sm_endIndex.push(lineLength);
        sm_decoration.push(null);
        return insertCustomLineDecorationsWithStateMachine(lineNumber, lineContent, tabSize, rawLineDecorations, sm_endIndex, sm_decoration);
    }
    function insertCustomLineDecorationsWithStateMachine(lineNumber, lineContent, tabSize, rawLineDecorations, sm_endIndex, sm_decoration) {
        var lineLength = lineContent.length;
        var currentStateIndex = 0;
        var stateEndIndex = sm_endIndex[currentStateIndex];
        var stateDecoration = sm_decoration[currentStateIndex];
        var result = rawLineDecorations.slice(0);
        var tmpIndent = 0;
        var whitespaceStartColumn = 1;
        for (var index = 0; index < lineLength; index++) {
            var chCode = lineContent.charCodeAt(index);
            if (chCode === _tab) {
                tmpIndent = tabSize;
            }
            else {
                tmpIndent++;
            }
            if (index === stateEndIndex) {
                if (stateDecoration !== null) {
                    insertOneCustomLineDecoration(result, lineNumber, whitespaceStartColumn, index + 2, stateDecoration);
                }
                whitespaceStartColumn = index + 2;
                tmpIndent = tmpIndent % tabSize;
                currentStateIndex++;
                stateEndIndex = sm_endIndex[currentStateIndex];
                stateDecoration = sm_decoration[currentStateIndex];
            }
            else {
                if (stateDecoration !== null && tmpIndent >= tabSize) {
                    insertOneCustomLineDecoration(result, lineNumber, whitespaceStartColumn, index + 2, stateDecoration);
                    whitespaceStartColumn = index + 2;
                    tmpIndent = tmpIndent % tabSize;
                }
            }
        }
        return result;
    }
    var LineParts = (function () {
        function LineParts(parts) {
            this._parts = parts;
        }
        LineParts.prototype.getParts = function () {
            return this._parts;
        };
        LineParts.prototype.equals = function (other) {
            return editorCommon_1.ViewLineToken.equalsArray(this._parts, other._parts);
        };
        LineParts.prototype.findIndexOfOffset = function (offset) {
            return arrays_1.Arrays.findIndexInSegmentsArray(this._parts, offset);
        };
        return LineParts;
    }());
    exports.LineParts = LineParts;
    function createFastViewLineParts(lineTokens, lineContent) {
        var parts = lineTokens.getTokens();
        parts = trimEmptyTrailingPart(parts, lineContent);
        return new LineParts(parts);
    }
    function createViewLineParts(lineNumber, minLineColumn, lineTokens, lineContent, rawLineDecorations) {
        // lineDecorations might overlap on top of each other, so they need to be normalized
        var lineDecorations = LineDecorationsNormalizer.normalize(lineNumber, minLineColumn, rawLineDecorations), lineDecorationsIndex = 0, lineDecorationsLength = lineDecorations.length;
        var actualLineTokens = lineTokens.getTokens(), nextStartOffset, currentTokenEndOffset, currentTokenClassName;
        var parts = [];
        for (var i = 0, len = actualLineTokens.length; i < len; i++) {
            nextStartOffset = actualLineTokens[i].startIndex;
            currentTokenEndOffset = (i + 1 < len ? actualLineTokens[i + 1].startIndex : lineTokens.getTextLength());
            currentTokenClassName = actualLineTokens[i].type;
            while (lineDecorationsIndex < lineDecorationsLength && lineDecorations[lineDecorationsIndex].startOffset < currentTokenEndOffset) {
                if (lineDecorations[lineDecorationsIndex].startOffset > nextStartOffset) {
                    // the first decorations starts after the token
                    parts.push(new editorCommon_1.ViewLineToken(nextStartOffset, currentTokenClassName));
                    nextStartOffset = lineDecorations[lineDecorationsIndex].startOffset;
                }
                parts.push(new editorCommon_1.ViewLineToken(nextStartOffset, currentTokenClassName + ' ' + lineDecorations[lineDecorationsIndex].className));
                if (lineDecorations[lineDecorationsIndex].endOffset >= currentTokenEndOffset) {
                    // this decoration goes on to the next token
                    nextStartOffset = currentTokenEndOffset;
                    break;
                }
                else {
                    // this decorations stops inside this token
                    nextStartOffset = lineDecorations[lineDecorationsIndex].endOffset + 1;
                    lineDecorationsIndex++;
                }
            }
            if (nextStartOffset < currentTokenEndOffset) {
                parts.push(new editorCommon_1.ViewLineToken(nextStartOffset, currentTokenClassName));
            }
        }
        return new LineParts(parts);
    }
    var DecorationSegment = (function () {
        function DecorationSegment(startOffset, endOffset, className) {
            this.startOffset = startOffset;
            this.endOffset = endOffset;
            this.className = className;
        }
        return DecorationSegment;
    }());
    exports.DecorationSegment = DecorationSegment;
    var Stack = (function () {
        function Stack() {
            this.stopOffsets = [];
            this.classNames = [];
            this.count = 0;
        }
        Stack.prototype.consumeLowerThan = function (maxStopOffset, nextStartOffset, result) {
            while (this.count > 0 && this.stopOffsets[0] < maxStopOffset) {
                var i = 0;
                // Take all equal stopping offsets
                while (i + 1 < this.count && this.stopOffsets[i] === this.stopOffsets[i + 1]) {
                    i++;
                }
                // Basically we are consuming the first i + 1 elements of the stack
                result.push(new DecorationSegment(nextStartOffset, this.stopOffsets[i], this.classNames.join(' ')));
                nextStartOffset = this.stopOffsets[i] + 1;
                // Consume them
                this.stopOffsets.splice(0, i + 1);
                this.classNames.splice(0, i + 1);
                this.count -= (i + 1);
            }
            if (this.count > 0 && nextStartOffset < maxStopOffset) {
                result.push(new DecorationSegment(nextStartOffset, maxStopOffset - 1, this.classNames.join(' ')));
                nextStartOffset = maxStopOffset;
            }
            return nextStartOffset;
        };
        Stack.prototype.insert = function (stopOffset, className) {
            if (this.count === 0 || this.stopOffsets[this.count - 1] <= stopOffset) {
                // Insert at the end
                this.stopOffsets.push(stopOffset);
                this.classNames.push(className);
            }
            else {
                // Find the insertion position for `stopOffset`
                for (var i = 0; i < this.count; i++) {
                    if (this.stopOffsets[i] >= stopOffset) {
                        this.stopOffsets.splice(i, 0, stopOffset);
                        this.classNames.splice(i, 0, className);
                        break;
                    }
                }
            }
            this.count++;
            return;
        };
        return Stack;
    }());
    var LineDecorationsNormalizer = (function () {
        function LineDecorationsNormalizer() {
        }
        /**
         * Normalize line decorations. Overlapping decorations will generate multiple segments
         */
        LineDecorationsNormalizer.normalize = function (lineNumber, minLineColumn, lineDecorations) {
            var result = [];
            if (lineDecorations.length === 0) {
                return result;
            }
            var stack = new Stack(), nextStartOffset = 0, d, currentStartOffset, currentEndOffset, i, len;
            for (i = 0, len = lineDecorations.length; i < len; i++) {
                d = lineDecorations[i];
                if (d.range.endLineNumber < lineNumber || d.range.startLineNumber > lineNumber) {
                    // Ignore decorations that sit outside this line
                    continue;
                }
                if (d.range.startLineNumber === d.range.endLineNumber && d.range.startColumn === d.range.endColumn) {
                    // Ignore empty range decorations
                    continue;
                }
                currentStartOffset = (d.range.startLineNumber === lineNumber ? d.range.startColumn - 1 : minLineColumn - 1);
                currentEndOffset = (d.range.endLineNumber === lineNumber ? d.range.endColumn - 2 : LineDecorationsNormalizer.MAX_LINE_LENGTH - 1);
                if (currentEndOffset < 0) {
                    // An empty decoration (endColumn === 1)
                    continue;
                }
                nextStartOffset = stack.consumeLowerThan(currentStartOffset, nextStartOffset, result);
                if (stack.count === 0) {
                    nextStartOffset = currentStartOffset;
                }
                stack.insert(currentEndOffset, d.options.inlineClassName);
            }
            stack.consumeLowerThan(LineDecorationsNormalizer.MAX_LINE_LENGTH, nextStartOffset, result);
            return result;
        };
        /**
         * A number that is guaranteed to be larger than the maximum line column
         */
        LineDecorationsNormalizer.MAX_LINE_LENGTH = 10000000;
        return LineDecorationsNormalizer;
    }());
    exports.LineDecorationsNormalizer = LineDecorationsNormalizer;
});
