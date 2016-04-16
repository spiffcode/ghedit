define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Position = (function () {
        function Position(lineNumber, column) {
            this.lineNumber = lineNumber | 0;
            this.column = column | 0;
        }
        Position.prototype.equals = function (other) {
            return Position.equals(this, other);
        };
        Position.equals = function (a, b) {
            if (!a && !b) {
                return true;
            }
            return (!!a &&
                !!b &&
                a.lineNumber === b.lineNumber &&
                a.column === b.column);
        };
        Position.prototype.isBefore = function (other) {
            return Position.isBefore(this, other);
        };
        Position.isBefore = function (a, b) {
            if (a.lineNumber < b.lineNumber) {
                return true;
            }
            if (b.lineNumber < a.lineNumber) {
                return false;
            }
            return a.column < b.column;
        };
        Position.prototype.isBeforeOrEqual = function (other) {
            return Position.isBeforeOrEqual(this, other);
        };
        Position.isBeforeOrEqual = function (a, b) {
            if (a.lineNumber < b.lineNumber) {
                return true;
            }
            if (b.lineNumber < a.lineNumber) {
                return false;
            }
            return a.column <= b.column;
        };
        Position.prototype.clone = function () {
            return new Position(this.lineNumber, this.column);
        };
        Position.prototype.toString = function () {
            return '(' + this.lineNumber + ',' + this.column + ')';
        };
        // ---
        Position.lift = function (pos) {
            return new Position(pos.lineNumber, pos.column);
        };
        Position.isIPosition = function (obj) {
            return (obj
                && (typeof obj.lineNumber === 'number')
                && (typeof obj.column === 'number'));
        };
        Position.asEmptyRange = function (position) {
            return {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            };
        };
        Position.startPosition = function (range) {
            return {
                lineNumber: range.startLineNumber,
                column: range.startColumn
            };
        };
        Position.endPosition = function (range) {
            return {
                lineNumber: range.endLineNumber,
                column: range.endColumn
            };
        };
        return Position;
    }());
    exports.Position = Position;
});
