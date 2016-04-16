/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/browser/viewParts/glyphMargin/glyphMargin', 'vs/css!./linesDecorations'], function (require, exports, glyphMargin_1) {
    'use strict';
    var LinesDecorationsOverlay = (function (_super) {
        __extends(LinesDecorationsOverlay, _super);
        function LinesDecorationsOverlay(context) {
            _super.call(this);
            this._context = context;
            this._lineHeight = this._context.configuration.editor.lineHeight;
            this._decorationsLeft = 0;
            this._decorationsWidth = 0;
            this._renderResult = null;
            this._context.addEventHandler(this);
        }
        LinesDecorationsOverlay.prototype.dispose = function () {
            this._context.removeEventHandler(this);
            this._context = null;
            this._renderResult = null;
        };
        // --- begin event handlers
        LinesDecorationsOverlay.prototype.onModelFlushed = function () {
            return true;
        };
        LinesDecorationsOverlay.prototype.onModelDecorationsChanged = function (e) {
            return true;
        };
        LinesDecorationsOverlay.prototype.onModelLinesDeleted = function (e) {
            return true;
        };
        LinesDecorationsOverlay.prototype.onModelLineChanged = function (e) {
            return true;
        };
        LinesDecorationsOverlay.prototype.onModelLinesInserted = function (e) {
            return true;
        };
        LinesDecorationsOverlay.prototype.onCursorPositionChanged = function (e) {
            return false;
        };
        LinesDecorationsOverlay.prototype.onCursorSelectionChanged = function (e) {
            return false;
        };
        LinesDecorationsOverlay.prototype.onCursorRevealRange = function (e) {
            return false;
        };
        LinesDecorationsOverlay.prototype.onConfigurationChanged = function (e) {
            if (e.lineHeight) {
                this._lineHeight = this._context.configuration.editor.lineHeight;
            }
            return true;
        };
        LinesDecorationsOverlay.prototype.onLayoutChanged = function (layoutInfo) {
            this._decorationsLeft = layoutInfo.decorationsLeft;
            this._decorationsWidth = layoutInfo.decorationsWidth;
            return true;
        };
        LinesDecorationsOverlay.prototype.onScrollChanged = function (e) {
            return e.vertical;
        };
        LinesDecorationsOverlay.prototype.onZonesChanged = function () {
            return true;
        };
        LinesDecorationsOverlay.prototype.onScrollWidthChanged = function (scrollWidth) {
            return false;
        };
        LinesDecorationsOverlay.prototype.onScrollHeightChanged = function (scrollHeight) {
            return false;
        };
        // --- end event handlers
        LinesDecorationsOverlay.prototype._getDecorations = function (ctx) {
            var decorations = ctx.getDecorationsInViewport();
            var r = [];
            for (var i = 0, len = decorations.length; i < len; i++) {
                var d = decorations[i];
                if (d.options.linesDecorationsClassName) {
                    r.push(new glyphMargin_1.DecorationToRender(d.range.startLineNumber, d.range.endLineNumber, d.options.linesDecorationsClassName));
                }
            }
            return r;
        };
        LinesDecorationsOverlay.prototype.prepareRender = function (ctx) {
            if (!this.shouldRender()) {
                throw new Error('I did not ask to render!');
            }
            var visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            var visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            var toRender = this._render(visibleStartLineNumber, visibleEndLineNumber, this._getDecorations(ctx));
            var lineHeight = this._lineHeight.toString();
            var left = this._decorationsLeft.toString();
            var width = this._decorationsWidth.toString();
            var common = '" style="left:' + left + 'px;width:' + width + 'px' + ';height:' + lineHeight + 'px;"></div>';
            var output = [];
            for (var lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                var lineIndex = lineNumber - visibleStartLineNumber;
                var classNames = toRender[lineIndex];
                if (classNames.length === 0) {
                    output[lineIndex] = '';
                }
                else {
                    output[lineIndex] = ('<div class="cldr'
                        + classNames
                        + common);
                }
            }
            this._renderResult = output;
        };
        LinesDecorationsOverlay.prototype.render = function (startLineNumber, lineNumber) {
            if (!this._renderResult) {
                return '';
            }
            var lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
                throw new Error('Unexpected render request');
            }
            return this._renderResult[lineIndex];
        };
        return LinesDecorationsOverlay;
    }(glyphMargin_1.DedupOverlay));
    exports.LinesDecorationsOverlay = LinesDecorationsOverlay;
});
