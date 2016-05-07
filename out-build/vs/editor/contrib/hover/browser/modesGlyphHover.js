var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './hoverOperation', './hoverWidgets'], function (require, exports, hoverOperation_1, hoverWidgets_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MarginComputer = (function () {
        function MarginComputer(editor) {
            this._editor = editor;
            this._lineNumber = -1;
        }
        MarginComputer.prototype.setLineNumber = function (lineNumber) {
            this._lineNumber = lineNumber;
            this._result = [];
        };
        MarginComputer.prototype.clearResult = function () {
            this._result = [];
        };
        MarginComputer.prototype.computeSync = function () {
            var result = [], lineDecorations = this._editor.getLineDecorations(this._lineNumber), i, len, d;
            for (i = 0, len = lineDecorations.length; i < len; i++) {
                d = lineDecorations[i];
                if (d.options.glyphMarginClassName && d.options.hoverMessage) {
                    result.push({
                        value: d.options.hoverMessage
                    });
                }
            }
            return result;
        };
        MarginComputer.prototype.onResult = function (result, isFromSynchronousComputation) {
            this._result = this._result.concat(result);
        };
        MarginComputer.prototype.getResult = function () {
            return this._result;
        };
        MarginComputer.prototype.getResultWithLoadingMessage = function () {
            return this.getResult();
        };
        return MarginComputer;
    }());
    var ModesGlyphHoverWidget = (function (_super) {
        __extends(ModesGlyphHoverWidget, _super);
        function ModesGlyphHoverWidget(editor) {
            var _this = this;
            _super.call(this, ModesGlyphHoverWidget.ID, editor);
            this._lastLineNumber = -1;
            this._computer = new MarginComputer(this._editor);
            this._hoverOperation = new hoverOperation_1.HoverOperation(this._computer, function (result) { return _this._withResult(result); }, null, function (result) { return _this._withResult(result); });
        }
        ModesGlyphHoverWidget.prototype.onModelDecorationsChanged = function () {
            if (this._isVisible) {
                // The decorations have changed and the hover is visible,
                // we need to recompute the displayed text
                this._hoverOperation.cancel();
                this._computer.clearResult();
                this._hoverOperation.start();
            }
        };
        ModesGlyphHoverWidget.prototype.startShowingAt = function (lineNumber) {
            if (this._lastLineNumber === lineNumber) {
                // We have to show the widget at the exact same line number as before, so no work is needed
                return;
            }
            this._hoverOperation.cancel();
            this.hide();
            this._lastLineNumber = lineNumber;
            this._computer.setLineNumber(lineNumber);
            this._hoverOperation.start();
        };
        ModesGlyphHoverWidget.prototype.hide = function () {
            this._lastLineNumber = -1;
            this._hoverOperation.cancel();
            _super.prototype.hide.call(this);
        };
        ModesGlyphHoverWidget.prototype._withResult = function (result) {
            this._messages = result;
            if (this._messages.length > 0) {
                this._renderMessages(this._lastLineNumber, this._messages);
            }
            else {
                this.hide();
            }
        };
        ModesGlyphHoverWidget.prototype._renderMessages = function (lineNumber, messages) {
            var fragment = document.createDocumentFragment();
            messages.forEach(function (msg) {
                var row = document.createElement('div');
                var span = null;
                if (msg.className) {
                    span = document.createElement('span');
                    span.textContent = msg.value;
                    span.className = msg.className;
                    row.appendChild(span);
                }
                else {
                    row.textContent = msg.value;
                }
                fragment.appendChild(row);
            });
            this._domNode.textContent = '';
            this._domNode.appendChild(fragment);
            // show
            this.showAt(lineNumber);
        };
        ModesGlyphHoverWidget.ID = 'editor.contrib.modesGlyphHoverWidget';
        return ModesGlyphHoverWidget;
    }(hoverWidgets_1.GlyphHoverWidget));
    exports.ModesGlyphHoverWidget = ModesGlyphHoverWidget;
});
//# sourceMappingURL=modesGlyphHover.js.map