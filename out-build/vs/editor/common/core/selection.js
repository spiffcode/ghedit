var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/core/range', 'vs/editor/common/editorCommon'], function (require, exports, range_1, editorCommon_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Selection = (function (_super) {
        __extends(Selection, _super);
        function Selection(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn) {
            _super.call(this, selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn);
            this.selectionStartLineNumber = selectionStartLineNumber;
            this.selectionStartColumn = selectionStartColumn;
            this.positionLineNumber = positionLineNumber;
            this.positionColumn = positionColumn;
        }
        Selection.prototype.clone = function () {
            return new Selection(this.selectionStartLineNumber, this.selectionStartColumn, this.positionLineNumber, this.positionColumn);
        };
        Selection.prototype.toString = function () {
            return '[' + this.selectionStartLineNumber + ',' + this.selectionStartColumn + ' -> ' + this.positionLineNumber + ',' + this.positionColumn + ']';
        };
        Selection.prototype.equalsSelection = function (other) {
            return (Selection.selectionsEqual(this, other));
        };
        Selection.prototype.getDirection = function () {
            if (this.selectionStartLineNumber === this.startLineNumber && this.selectionStartColumn === this.startColumn) {
                return editorCommon_1.SelectionDirection.LTR;
            }
            return editorCommon_1.SelectionDirection.RTL;
        };
        Selection.prototype.setEndPosition = function (endLineNumber, endColumn) {
            if (this.getDirection() === editorCommon_1.SelectionDirection.LTR) {
                return new Selection(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
            }
            return new Selection(endLineNumber, endColumn, this.startLineNumber, this.startColumn);
        };
        Selection.prototype.setStartPosition = function (startLineNumber, startColumn) {
            if (this.getDirection() === editorCommon_1.SelectionDirection.LTR) {
                return new Selection(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
            }
            return new Selection(this.endLineNumber, this.endColumn, startLineNumber, startColumn);
        };
        // ----
        Selection.createSelection = function (selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn) {
            return new Selection(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn);
        };
        Selection.liftSelection = function (sel) {
            return new Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
        };
        Selection.selectionsEqual = function (a, b) {
            return (a.selectionStartLineNumber === b.selectionStartLineNumber &&
                a.selectionStartColumn === b.selectionStartColumn &&
                a.positionLineNumber === b.positionLineNumber &&
                a.positionColumn === b.positionColumn);
        };
        Selection.selectionsArrEqual = function (a, b) {
            if (a && !b || !a && b) {
                return false;
            }
            if (!a && !b) {
                return true;
            }
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0, len = a.length; i < len; i++) {
                if (!this.selectionsEqual(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        };
        Selection.isISelection = function (obj) {
            return (obj
                && (typeof obj.selectionStartLineNumber === 'number')
                && (typeof obj.selectionStartColumn === 'number')
                && (typeof obj.positionLineNumber === 'number')
                && (typeof obj.positionColumn === 'number'));
        };
        Selection.createWithDirection = function (startLineNumber, startColumn, endLineNumber, endColumn, direction) {
            if (direction === editorCommon_1.SelectionDirection.LTR) {
                return new Selection(startLineNumber, startColumn, endLineNumber, endColumn);
            }
            return new Selection(endLineNumber, endColumn, startLineNumber, startColumn);
        };
        return Selection;
    }(range_1.Range));
    exports.Selection = Selection;
});
