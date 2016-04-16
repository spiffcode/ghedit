define(["require", "exports", 'vs/editor/common/core/editOperation', 'vs/editor/common/core/range'], function (require, exports, editOperation_1, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SortLinesCommand = (function () {
        function SortLinesCommand(selection, descending) {
            this.selection = selection;
            this.descending = descending;
        }
        SortLinesCommand.prototype.getEditOperations = function (model, builder) {
            var op = sortLines(model, this.selection, this.descending);
            if (op) {
                builder.addEditOperation(op.range, op.text);
            }
            this.selectionId = builder.trackSelection(this.selection);
        };
        SortLinesCommand.prototype.computeCursorState = function (model, helper) {
            return helper.getTrackedSelection(this.selectionId);
        };
        return SortLinesCommand;
    }());
    exports.SortLinesCommand = SortLinesCommand;
    /**
     * Generate commands for sorting lines on a model.
     */
    function sortLines(model, selection, descending) {
        var startLineNumber = selection.startLineNumber;
        var endLineNumber = selection.endLineNumber;
        if (selection.endColumn === 1) {
            endLineNumber--;
        }
        // Nothing to sort if user didn't select anything.
        if (startLineNumber >= endLineNumber) {
            return null;
        }
        var linesToSort = [];
        // Get the contents of the selection to be sorted.
        for (var lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            linesToSort.push(model.getLineContent(lineNumber));
        }
        var sorted = linesToSort.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        // If descending, reverse the order.
        if (descending === true) {
            sorted = sorted.reverse();
        }
        return editOperation_1.EditOperation.replace(new range_1.Range(startLineNumber, 1, endLineNumber, model.getLineMaxColumn(endLineNumber)), sorted.join('\n'));
    }
    exports.sortLines = sortLines;
});
