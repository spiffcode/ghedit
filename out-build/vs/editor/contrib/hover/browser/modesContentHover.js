var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/hover/browser/modesContentHover', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/base/browser/htmlContentRenderer', 'vs/platform/opener/common/opener', 'vs/editor/common/core/range', 'vs/editor/common/modes', 'vs/editor/common/modes/textToHtmlTokenizer', '../common/hover', './hoverOperation', './hoverWidgets', 'vs/css!vs/base/browser/ui/progressbar/progressbar'], function (require, exports, nls, uri_1, winjs_base_1, htmlContentRenderer_1, opener_1, range_1, modes_1, textToHtmlTokenizer_1, hover_1, hoverOperation_1, hoverWidgets_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ModesContentComputer = (function () {
        function ModesContentComputer(editor) {
            this._editor = editor;
            this._range = null;
        }
        ModesContentComputer.prototype.setRange = function (range) {
            this._range = range;
            this._result = [];
        };
        ModesContentComputer.prototype.clearResult = function () {
            this._result = [];
        };
        ModesContentComputer.prototype.computeAsync = function () {
            var model = this._editor.getModel();
            if (!modes_1.ExtraInfoRegistry.has(model)) {
                return winjs_base_1.TPromise.as(null);
            }
            return hover_1.getExtraInfoAtPosition(model, {
                lineNumber: this._range.startLineNumber,
                column: this._range.startColumn
            });
        };
        ModesContentComputer.prototype.computeSync = function () {
            var _this = this;
            var result = [];
            var lineNumber = this._range.startLineNumber;
            if (lineNumber > this._editor.getModel().getLineCount()) {
                // Illegal line number => no results
                return result;
            }
            var lineDecorations = this._editor.getLineDecorations(lineNumber);
            var maxColumn = this._editor.getModel().getLineMaxColumn(lineNumber);
            lineDecorations.forEach(function (d) {
                var startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                var endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                if (startColumn <= _this._range.startColumn && _this._range.endColumn <= endColumn && (d.options.hoverMessage || (d.options.htmlMessage && d.options.htmlMessage.length > 0))) {
                    var obj = {
                        value: d.options.hoverMessage,
                        range: new range_1.Range(_this._range.startLineNumber, startColumn, _this._range.startLineNumber, endColumn)
                    };
                    if (d.options.htmlMessage) {
                        obj.htmlContent = d.options.htmlMessage;
                    }
                    result.push(obj);
                }
            });
            return result;
        };
        ModesContentComputer.prototype.onResult = function (result, isFromSynchronousComputation) {
            // Always put synchronous messages before asynchronous ones
            if (isFromSynchronousComputation) {
                this._result = result.concat(this._result);
            }
            else {
                this._result = this._result.concat(result);
            }
        };
        ModesContentComputer.prototype.getResult = function () {
            return this._result.slice(0);
        };
        ModesContentComputer.prototype.getResultWithLoadingMessage = function () {
            return this._result.slice(0).concat([this._getLoadingMessage()]);
        };
        ModesContentComputer.prototype._getLoadingMessage = function () {
            return {
                range: this._range,
                htmlContent: [{
                        tagName: 'div',
                        className: '',
                        children: [{
                                text: nls.localize(0, null)
                            }]
                    }]
            };
        };
        return ModesContentComputer;
    }());
    var ModesContentHoverWidget = (function (_super) {
        __extends(ModesContentHoverWidget, _super);
        function ModesContentHoverWidget(editor, openerService) {
            var _this = this;
            _super.call(this, ModesContentHoverWidget.ID, editor);
            this._computer = new ModesContentComputer(this._editor);
            this._highlightDecorations = [];
            this._isChangingDecorations = false;
            this._openerService = openerService || opener_1.NullOpenerService;
            this._hoverOperation = new hoverOperation_1.HoverOperation(this._computer, function (result) { return _this._withResult(result, true); }, null, function (result) { return _this._withResult(result, false); });
        }
        ModesContentHoverWidget.prototype.onModelDecorationsChanged = function () {
            if (this._isChangingDecorations) {
                return;
            }
            if (this._isVisible) {
                // The decorations have changed and the hover is visible,
                // we need to recompute the displayed text
                this._hoverOperation.cancel();
                this._computer.clearResult();
                this._hoverOperation.start();
            }
        };
        ModesContentHoverWidget.prototype.startShowingAt = function (range, focus) {
            if (this._lastRange) {
                if (this._lastRange.equalsRange(range)) {
                    // We have to show the widget at the exact same range as before, so no work is needed
                    return;
                }
            }
            this._hoverOperation.cancel();
            if (this._isVisible) {
                // The range might have changed, but the hover is visible
                // Instead of hiding it completely, filter out messages that are still in the new range and
                // kick off a new computation
                if (this._showAtPosition.lineNumber !== range.startLineNumber) {
                    this.hide();
                }
                else {
                    var filteredMessages = [];
                    for (var i = 0, len = this._messages.length; i < len; i++) {
                        var msg = this._messages[i];
                        var rng = msg.range;
                        if (rng.startColumn <= range.startColumn && rng.endColumn >= range.endColumn) {
                            filteredMessages.push(msg);
                        }
                    }
                    if (filteredMessages.length > 0) {
                        this._renderMessages(range, filteredMessages);
                    }
                    else {
                        this.hide();
                    }
                }
            }
            this._lastRange = range;
            this._computer.setRange(range);
            this._shouldFocus = focus;
            this._hoverOperation.start();
        };
        ModesContentHoverWidget.prototype.hide = function () {
            this._lastRange = null;
            this._hoverOperation.cancel();
            _super.prototype.hide.call(this);
            this._isChangingDecorations = true;
            this._highlightDecorations = this._editor.deltaDecorations(this._highlightDecorations, []);
            this._isChangingDecorations = false;
        };
        ModesContentHoverWidget.prototype._withResult = function (result, complete) {
            this._messages = result;
            if (this._lastRange && this._messages.length > 0) {
                this._renderMessages(this._lastRange, this._messages);
            }
            else if (complete) {
                this.hide();
            }
        };
        // TODO@Alex: pull this out into a common utility class
        ModesContentHoverWidget.prototype._renderMessages = function (renderRange, messages) {
            var _this = this;
            // update column from which to show
            var renderColumn = Number.MAX_VALUE, highlightRange = messages[0].range, fragment = document.createDocumentFragment();
            messages.forEach(function (msg) {
                if (!msg.range) {
                    return;
                }
                renderColumn = Math.min(renderColumn, msg.range.startColumn);
                highlightRange = range_1.Range.plusRange(highlightRange, msg.range);
                var row = document.createElement('div');
                var span = null;
                var container = row;
                if (msg.className) {
                    span = document.createElement('span');
                    span.className = msg.className;
                    container = span;
                    row.appendChild(span);
                }
                if (msg.htmlContent && msg.htmlContent.length > 0) {
                    msg.htmlContent.forEach(function (content) {
                        container.appendChild(htmlContentRenderer_1.renderHtml(content, {
                            actionCallback: function (content) {
                                _this._openerService.open(uri_1.default.parse(content));
                            },
                            codeBlockRenderer: function (modeId, value) {
                                var mode;
                                var model = _this._editor.getModel();
                                if (!model.isDisposed()) {
                                    mode = model.getMode();
                                }
                                return textToHtmlTokenizer_1.tokenizeToString(value, model.getMode());
                            }
                        }));
                    });
                }
                else {
                    container.textContent = msg.value;
                }
                fragment.appendChild(row);
            });
            this._domNode.textContent = '';
            this._domNode.appendChild(fragment);
            // show
            this.showAt({
                lineNumber: renderRange.startLineNumber,
                column: renderColumn
            }, this._shouldFocus);
            this._isChangingDecorations = true;
            this._highlightDecorations = this._editor.deltaDecorations(this._highlightDecorations, [{
                    range: highlightRange,
                    options: {
                        className: 'hoverHighlight'
                    }
                }]);
            this._isChangingDecorations = false;
        };
        ModesContentHoverWidget.ID = 'editor.contrib.modesContentHoverWidget';
        return ModesContentHoverWidget;
    }(hoverWidgets_1.ContentHoverWidget));
    exports.ModesContentHoverWidget = ModesContentHoverWidget;
});
//# sourceMappingURL=modesContentHover.js.map