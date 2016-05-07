define(["require", "exports", 'vs/editor/common/core/range', 'vs/editor/common/core/selection'], function (require, exports, range_1, selection_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SurroundSelectionCommand = (function () {
        function SurroundSelectionCommand(range, charBeforeSelection, charAfterSelection) {
            this._range = range;
            this._charBeforeSelection = charBeforeSelection;
            this._charAfterSelection = charAfterSelection;
        }
        SurroundSelectionCommand.prototype.getEditOperations = function (model, builder) {
            builder.addEditOperation(new range_1.Range(this._range.startLineNumber, this._range.startColumn, this._range.startLineNumber, this._range.startColumn), this._charBeforeSelection);
            builder.addEditOperation(new range_1.Range(this._range.endLineNumber, this._range.endColumn, this._range.endLineNumber, this._range.endColumn), this._charAfterSelection);
        };
        SurroundSelectionCommand.prototype.computeCursorState = function (model, helper) {
            var inverseEditOperations = helper.getInverseEditOperations();
            var firstOperationRange = inverseEditOperations[0].range;
            var secondOperationRange = inverseEditOperations[1].range;
            return new selection_1.Selection(firstOperationRange.endLineNumber, firstOperationRange.endColumn, secondOperationRange.endLineNumber, secondOperationRange.endColumn - this._charAfterSelection.length);
        };
        return SurroundSelectionCommand;
    }());
    exports.SurroundSelectionCommand = SurroundSelectionCommand;
});
//# sourceMappingURL=surroundSelectionCommand.js.map