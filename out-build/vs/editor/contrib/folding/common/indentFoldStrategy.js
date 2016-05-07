/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    function computeRanges(model, tabSize, minimumRangeSize) {
        if (minimumRangeSize === void 0) { minimumRangeSize = 1; }
        var result = [];
        var previousRegions = [];
        previousRegions.push({ indent: -1, line: model.getLineCount() + 1 }); // sentinel, to make sure there's at least one entry
        for (var line = model.getLineCount(); line > 0; line--) {
            var indent = computeIndentLevel(model.getLineContent(line), tabSize);
            if (indent === -1) {
                continue; // only whitespace
            }
            var previous = previousRegions[previousRegions.length - 1];
            if (previous.indent > indent) {
                // discard all regions with larger indent
                do {
                    previousRegions.pop();
                    previous = previousRegions[previousRegions.length - 1];
                } while (previous.indent > indent);
                // new folding range
                var endLineNumber = previous.line - 1;
                if (endLineNumber - line >= minimumRangeSize) {
                    result.push({ startLineNumber: line, endLineNumber: endLineNumber, indent: indent });
                }
            }
            if (previous.indent === indent) {
                previous.line = line;
            }
            else {
                // new region with a bigger indent
                previousRegions.push({ indent: indent, line: line });
            }
        }
        return result.reverse();
    }
    exports.computeRanges = computeRanges;
    function computeIndentLevel(line, tabSize) {
        var i = 0;
        var indent = 0;
        while (i < line.length) {
            var ch = line.charAt(i);
            if (ch === ' ') {
                indent++;
            }
            else if (ch === '\t') {
                indent = indent - indent % tabSize + tabSize;
            }
            else {
                break;
            }
            i++;
        }
        if (i === line.length) {
            return -1; // line only consists of whitespace
        }
        return indent;
    }
    exports.computeIndentLevel = computeIndentLevel;
    /**
     * Limits the number of folding ranges by removing ranges with larger indent levels
     */
    function limitByIndent(ranges, maxEntries) {
        if (ranges.length <= maxEntries) {
            return ranges;
        }
        var indentOccurrences = [];
        ranges.forEach(function (r) {
            if (r.indent < 1000) {
                indentOccurrences[r.indent] = (indentOccurrences[r.indent] || 0) + 1;
            }
        });
        var maxIndent = indentOccurrences.length;
        for (var i = 0; i < indentOccurrences.length; i++) {
            if (indentOccurrences[i]) {
                maxEntries -= indentOccurrences[i];
                if (maxEntries < 0) {
                    maxIndent = i;
                    break;
                }
            }
        }
        return ranges.filter(function (r) { return r.indent < maxIndent; });
    }
    exports.limitByIndent = limitByIndent;
});
//# sourceMappingURL=indentFoldStrategy.js.map