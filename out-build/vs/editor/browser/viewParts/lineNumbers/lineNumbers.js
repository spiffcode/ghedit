/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/platform', 'vs/editor/browser/view/dynamicViewOverlay', 'vs/editor/browser/editorBrowser', 'vs/css!./lineNumbers'], function (require, exports, platform, dynamicViewOverlay_1, editorBrowser_1) {
    'use strict';
    var LineNumbersOverlay = (function (_super) {
        __extends(LineNumbersOverlay, _super);
        function LineNumbersOverlay(context) {
            _super.call(this);
            this._context = context;
            this._lineHeight = this._context.configuration.editor.lineHeight;
            this._lineNumbers = this._context.configuration.editor.lineNumbers;
            this._lineNumbersLeft = 0;
            this._lineNumbersWidth = 0;
            this._renderResult = null;
            this._context.addEventHandler(this);
        }
        LineNumbersOverlay.prototype.dispose = function () {
            this._context.removeEventHandler(this);
            this._context = null;
            this._renderResult = null;
        };
        // --- begin event handlers
        LineNumbersOverlay.prototype.onModelFlushed = function () {
            return true;
        };
        LineNumbersOverlay.prototype.onModelDecorationsChanged = function (e) {
            return false;
        };
        LineNumbersOverlay.prototype.onModelLinesDeleted = function (e) {
            return true;
        };
        LineNumbersOverlay.prototype.onModelLineChanged = function (e) {
            return true;
        };
        LineNumbersOverlay.prototype.onModelLinesInserted = function (e) {
            return true;
        };
        LineNumbersOverlay.prototype.onCursorPositionChanged = function (e) {
            return false;
        };
        LineNumbersOverlay.prototype.onCursorSelectionChanged = function (e) {
            return false;
        };
        LineNumbersOverlay.prototype.onCursorRevealRange = function (e) {
            return false;
        };
        LineNumbersOverlay.prototype.onConfigurationChanged = function (e) {
            if (e.lineHeight) {
                this._lineHeight = this._context.configuration.editor.lineHeight;
            }
            if (e.lineNumbers) {
                this._lineNumbers = this._context.configuration.editor.lineNumbers;
            }
            return true;
        };
        LineNumbersOverlay.prototype.onLayoutChanged = function (layoutInfo) {
            this._lineNumbersLeft = layoutInfo.lineNumbersLeft;
            this._lineNumbersWidth = layoutInfo.lineNumbersWidth;
            return true;
        };
        LineNumbersOverlay.prototype.onScrollChanged = function (e) {
            return e.vertical;
        };
        LineNumbersOverlay.prototype.onZonesChanged = function () {
            return true;
        };
        LineNumbersOverlay.prototype.onScrollWidthChanged = function (scrollWidth) {
            return false;
        };
        LineNumbersOverlay.prototype.onScrollHeightChanged = function (scrollHeight) {
            return false;
        };
        // --- end event handlers
        LineNumbersOverlay.prototype.prepareRender = function (ctx) {
            if (!this.shouldRender()) {
                throw new Error('I did not ask to render!');
            }
            if (!this._lineNumbers) {
                this._renderResult = null;
                return;
            }
            var lineHeightClassName = (platform.isLinux ? (this._lineHeight % 2 === 0 ? ' lh-even' : ' lh-odd') : '');
            var lineHeight = this._lineHeight.toString();
            var visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            var visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            var common = '<div class="' + editorBrowser_1.ClassNames.LINE_NUMBERS + lineHeightClassName + '" style="left:' + this._lineNumbersLeft.toString() + 'px;width:' + this._lineNumbersWidth.toString() + 'px;height:' + lineHeight + 'px;">';
            var output = [];
            for (var lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                var lineIndex = lineNumber - visibleStartLineNumber;
                var renderLineNumber = this._context.model.getLineRenderLineNumber(lineNumber);
                if (renderLineNumber) {
                    output[lineIndex] = (common
                        + renderLineNumber
                        + '</div>');
                }
                else {
                    output[lineIndex] = '';
                }
            }
            this._renderResult = output;
        };
        LineNumbersOverlay.prototype.render = function (startLineNumber, lineNumber) {
            if (!this._renderResult) {
                return '';
            }
            var lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
                throw new Error('Unexpected render request');
            }
            return this._renderResult[lineIndex];
        };
        return LineNumbersOverlay;
    }(dynamicViewOverlay_1.DynamicViewOverlay));
    exports.LineNumbersOverlay = LineNumbersOverlay;
});
