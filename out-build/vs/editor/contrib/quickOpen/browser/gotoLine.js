/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/quickOpen/browser/gotoLine', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/base/parts/quickopen/common/quickOpen', 'vs/editor/common/editorCommon', './editorQuickOpen', 'vs/css!./gotoLine'], function (require, exports, nls, quickOpenModel_1, quickOpen_1, editorCommon, editorQuickOpen_1) {
    'use strict';
    var GotoLineEntry = (function (_super) {
        __extends(GotoLineEntry, _super);
        function GotoLineEntry(line, editor, decorator) {
            _super.call(this);
            this.editor = editor;
            this.decorator = decorator;
            this._parseResult = this._parseInput(line);
        }
        GotoLineEntry.prototype._parseInput = function (line) {
            var numbers = line.split(',').map(function (part) { return parseInt(part, 10); }).filter(function (part) { return !isNaN(part); }), position;
            if (numbers.length === 0) {
                position = { lineNumber: -1, column: -1 };
            }
            else if (numbers.length === 1) {
                position = { lineNumber: numbers[0], column: 1 };
            }
            else {
                position = { lineNumber: numbers[0], column: numbers[1] };
            }
            var editorType = this.editor.getEditorType(), model;
            switch (editorType) {
                case editorCommon.EditorType.IDiffEditor:
                    model = this.editor.getModel().modified;
                    break;
                case editorCommon.EditorType.ICodeEditor:
                    model = this.editor.getModel();
                    break;
                default:
                    throw new Error();
            }
            var isValid = model.validatePosition(position).equals(position), label;
            if (isValid) {
                if (position.column && position.column > 1) {
                    label = nls.localize(0, null, position.lineNumber, position.column);
                }
                else {
                    label = nls.localize(1, null, position.lineNumber, position.column);
                }
            }
            else if (position.lineNumber < 1 || position.lineNumber > model.getLineCount()) {
                label = nls.localize(2, null, model.getLineCount());
            }
            else {
                label = nls.localize(3, null, model.getLineMaxColumn(position.lineNumber));
            }
            return {
                position: position,
                isValid: isValid,
                label: label
            };
        };
        GotoLineEntry.prototype.getLabel = function () {
            return this._parseResult.label;
        };
        GotoLineEntry.prototype.getAriaLabel = function () {
            return nls.localize(4, null, this._parseResult.label);
        };
        GotoLineEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                return this.runOpen();
            }
            return this.runPreview();
        };
        GotoLineEntry.prototype.runOpen = function () {
            // No-op if range is not valid
            if (!this._parseResult.isValid) {
                return false;
            }
            // Apply selection and focus
            var range = this.toSelection();
            this.editor.setSelection(range);
            this.editor.revealRangeInCenter(range);
            this.editor.focus();
            return true;
        };
        GotoLineEntry.prototype.runPreview = function () {
            // No-op if range is not valid
            if (!this._parseResult.isValid) {
                this.decorator.clearDecorations();
                return false;
            }
            // Select Line Position
            var range = this.toSelection();
            this.editor.revealRangeInCenter(range);
            // Decorate if possible
            this.decorator.decorateLine(range, this.editor);
            return false;
        };
        GotoLineEntry.prototype.toSelection = function () {
            return {
                startLineNumber: this._parseResult.position.lineNumber,
                startColumn: this._parseResult.position.column,
                endLineNumber: this._parseResult.position.lineNumber,
                endColumn: this._parseResult.position.column
            };
        };
        return GotoLineEntry;
    }(quickOpenModel_1.QuickOpenEntry));
    exports.GotoLineEntry = GotoLineEntry;
    var GotoLineAction = (function (_super) {
        __extends(GotoLineAction, _super);
        function GotoLineAction(descriptor, editor) {
            _super.call(this, descriptor, editor, nls.localize(5, null));
        }
        GotoLineAction.prototype._getModel = function (value) {
            return new quickOpenModel_1.QuickOpenModel([new GotoLineEntry(value, this.editor, this)]);
        };
        GotoLineAction.prototype._getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: searchValue.length > 0
            };
        };
        GotoLineAction.prototype._getInputAriaLabel = function () {
            return nls.localize(6, null);
        };
        GotoLineAction.ID = 'editor.action.gotoLine';
        return GotoLineAction;
    }(editorQuickOpen_1.BaseEditorQuickOpenAction));
    exports.GotoLineAction = GotoLineAction;
});
//# sourceMappingURL=gotoLine.js.map