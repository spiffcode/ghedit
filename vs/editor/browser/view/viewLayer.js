var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/browser/view/viewPart', 'vs/base/browser/styleMutator'], function (require, exports, viewPart_1, styleMutator_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ViewLayer = (function (_super) {
        __extends(ViewLayer, _super);
        function ViewLayer(context) {
            var _this = this;
            _super.call(this, context);
            this.domNode = this._createDomNode();
            this._lines = [];
            this._rendLineNumberStart = 1;
            this._scrollDomNode = null;
            this._scrollDomNodeIsAbove = false;
            this._renderer = new ViewLayerRenderer(function () { return _this._createLine(); }, function () { return _this._extraDomNodeHTML(); });
        }
        ViewLayer.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._lines = null;
        };
        ViewLayer.prototype._extraDomNodeHTML = function () {
            return '';
        };
        // ---- begin view event handlers
        ViewLayer.prototype.onConfigurationChanged = function (e) {
            for (var i = 0; i < this._lines.length; i++) {
                this._lines[i].onConfigurationChanged(e);
            }
            return true;
        };
        ViewLayer.prototype.onLayoutChanged = function (layoutInfo) {
            return true;
        };
        ViewLayer.prototype.onScrollChanged = function (e) {
            return e.vertical;
        };
        ViewLayer.prototype.onZonesChanged = function () {
            return true;
        };
        ViewLayer.prototype.onModelFlushed = function () {
            this._lines = [];
            this._rendLineNumberStart = 1;
            this._scrollDomNode = null;
            // No need to clear the dom node because a full .innerHTML will occur in ViewLayerRenderer._render
            return true;
        };
        ViewLayer.prototype.onModelLinesDeleted = function (e) {
            var from = Math.max(e.fromLineNumber - this._rendLineNumberStart, 0);
            var to = Math.min(e.toLineNumber - this._rendLineNumberStart, this._lines.length - 1);
            var i;
            // Adjust this._rendLineNumberStart
            if (e.fromLineNumber < this._rendLineNumberStart) {
                // Deleting lines starting above the viewport
                if (e.toLineNumber < this._rendLineNumberStart) {
                    // All deleted lines are above the viewport
                    this._rendLineNumberStart -= (e.toLineNumber - e.fromLineNumber + 1);
                }
                else {
                    // Some deleted lines are inside the viewport
                    this._rendLineNumberStart = e.fromLineNumber;
                }
            }
            // Remove lines if they fall in the viewport
            if (from <= to) {
                // Remove from DOM
                for (i = from; i <= to; i++) {
                    var lineDomNode = this._lines[i].getDomNode();
                    if (lineDomNode) {
                        this.domNode.domNode.removeChild(lineDomNode);
                    }
                }
                // Remove from array
                this._lines.splice(from, to - from + 1);
            }
            // Mark the rest of the visible lines as possibly invalid
            for (i = from; i < this._lines.length; i++) {
                this._lines[i].onLinesDeletedAbove();
            }
            return true;
        };
        ViewLayer.prototype.onModelLineChanged = function (e) {
            var lineIndex = e.lineNumber - this._rendLineNumberStart, shouldRender = false;
            if (lineIndex >= 0 && lineIndex < this._lines.length) {
                this._lines[lineIndex].onContentChanged();
                shouldRender = true;
            }
            // Mark the rest of the visible lines as possibly invalid
            for (var i = Math.max(lineIndex, 0); i < this._lines.length; i++) {
                this._lines[i].onLineChangedAbove();
                shouldRender = true;
            }
            return shouldRender;
        };
        ViewLayer.prototype.onModelLinesInserted = function (e) {
            var i;
            if (e.fromLineNumber <= this._rendLineNumberStart) {
                // a. We are inserting lines above the viewport
                this._rendLineNumberStart += (e.toLineNumber - e.fromLineNumber + 1);
                // Mark the visible lines as possibly invalid
                for (i = 0; i < this._lines.length; i++) {
                    this._lines[i].onLinesInsertedAbove();
                }
                return true;
            }
            if (e.fromLineNumber >= this._rendLineNumberStart + this._lines.length) {
                // b. We are inserting lines below the viewport
                return false;
            }
            // c. We are inserting lines in the viewport
            var insertFrom = Math.min(e.fromLineNumber - this._rendLineNumberStart, this._lines.length - 1);
            var insertTo = Math.min(e.toLineNumber - this._rendLineNumberStart, this._lines.length - 1);
            if (insertFrom <= insertTo) {
                // Insert lines that fall inside the viewport
                for (i = insertFrom; i <= insertTo; i++) {
                    var line = this._createLine();
                    this._lines.splice(i, 0, line);
                }
                // We need to remove lines that are pushed outside the viewport by this insertion,
                // due to the Math.min above on `insertTo`. Otherwise, it is possible for the next line
                // after the insertion to be marked `maybeInvalid` when it should be definitely `invalid`.
                var insertCount = insertTo - insertFrom + 1;
                for (i = 0; i < insertCount; i++) {
                    // Remove from array
                    var lastLine = this._lines.pop();
                    // Remove from DOM
                    var lineDomNode = lastLine.getDomNode();
                    if (lineDomNode) {
                        this.domNode.domNode.removeChild(lineDomNode);
                    }
                }
            }
            // Mark the rest of the lines as possibly invalid
            for (i = insertTo; i < this._lines.length; i++) {
                this._lines[i].onLinesInsertedAbove();
            }
            return true;
        };
        ViewLayer.prototype.onModelTokensChanged = function (e) {
            var changedFromIndex = e.fromLineNumber - this._rendLineNumberStart;
            var changedToIndex = e.toLineNumber - this._rendLineNumberStart;
            if (changedToIndex < 0 || changedFromIndex >= this._lines.length) {
                return false;
            }
            var fromIndex = Math.min(Math.max(changedFromIndex, 0), this._lines.length - 1);
            var toIndex = Math.min(Math.max(changedToIndex, 0), this._lines.length - 1);
            var somethingMayHaveChanged = false;
            for (var i = fromIndex; i <= toIndex; i++) {
                somethingMayHaveChanged = true;
                this._lines[i].onTokensChanged();
            }
            return somethingMayHaveChanged;
        };
        // ---- end view event handlers
        ViewLayer.prototype._renderLines = function (linesViewportData) {
            var ctx = {
                domNode: this.domNode.domNode,
                rendLineNumberStart: this._rendLineNumberStart,
                lines: this._lines,
                linesLength: this._lines.length,
                getInlineDecorationsForLineInViewport: function (lineNumber) { return linesViewportData.getInlineDecorationsForLineInViewport(lineNumber); },
                viewportTop: linesViewportData.viewportTop,
                viewportHeight: linesViewportData.viewportHeight,
                scrollDomNode: this._scrollDomNode,
                scrollDomNodeIsAbove: this._scrollDomNodeIsAbove
            };
            // Decide if this render will do a single update (single large .innerHTML) or many updates (inserting/removing dom nodes)
            var resCtx = this._renderer.renderWithManyUpdates(ctx, linesViewportData.startLineNumber, linesViewportData.endLineNumber, linesViewportData.relativeVerticalOffset);
            this._rendLineNumberStart = resCtx.rendLineNumberStart;
            this._lines = resCtx.lines;
            this._scrollDomNode = resCtx.scrollDomNode;
            this._scrollDomNodeIsAbove = resCtx.scrollDomNodeIsAbove;
        };
        ViewLayer.prototype._createDomNode = function () {
            var domNode = styleMutator_1.createFastDomNode(document.createElement('div'));
            domNode.setClassName('view-layer');
            domNode.setPosition('absolute');
            domNode.domNode.setAttribute('role', 'presentation');
            domNode.domNode.setAttribute('aria-hidden', 'true');
            return domNode;
        };
        ViewLayer.prototype._createLine = function () {
            throw new Error('Implement me!');
        };
        return ViewLayer;
    }(viewPart_1.ViewPart));
    exports.ViewLayer = ViewLayer;
    var ViewLayerRenderer = (function () {
        function ViewLayerRenderer(createLine, extraDomNodeHTML) {
            this._createLine = createLine;
            this._extraDomNodeHTML = extraDomNodeHTML;
        }
        ViewLayerRenderer.prototype.renderWithManyUpdates = function (ctx, startLineNumber, stopLineNumber, deltaTop) {
            return this._render(ctx, startLineNumber, stopLineNumber, deltaTop);
        };
        ViewLayerRenderer.prototype._render = function (inContext, startLineNumber, stopLineNumber, deltaTop) {
            var ctx = {
                domNode: inContext.domNode,
                rendLineNumberStart: inContext.rendLineNumberStart,
                lines: inContext.lines.slice(0),
                linesLength: inContext.linesLength,
                getInlineDecorationsForLineInViewport: inContext.getInlineDecorationsForLineInViewport,
                viewportTop: inContext.viewportTop,
                viewportHeight: inContext.viewportHeight,
                scrollDomNode: inContext.scrollDomNode,
                scrollDomNodeIsAbove: inContext.scrollDomNodeIsAbove
            };
            var canRemoveScrollDomNode = true;
            if (ctx.scrollDomNode) {
                var time = this._getScrollDomNodeTime(ctx.scrollDomNode);
                if ((new Date()).getTime() - time < 1000) {
                    canRemoveScrollDomNode = false;
                }
            }
            if (canRemoveScrollDomNode && ((ctx.rendLineNumberStart + ctx.linesLength - 1 < startLineNumber) || (stopLineNumber < ctx.rendLineNumberStart))) {
                // There is no overlap whatsoever
                ctx.rendLineNumberStart = startLineNumber;
                ctx.linesLength = stopLineNumber - startLineNumber + 1;
                ctx.lines = [];
                for (var x = startLineNumber; x <= stopLineNumber; x++) {
                    ctx.lines[x - startLineNumber] = this._createLine();
                }
                this._finishRendering(ctx, true, deltaTop);
                ctx.scrollDomNode = null;
                return ctx;
            }
            // Update lines which will remain untouched
            this._renderUntouchedLines(ctx, Math.max(startLineNumber - ctx.rendLineNumberStart, 0), Math.min(stopLineNumber - ctx.rendLineNumberStart, ctx.linesLength - 1), deltaTop, startLineNumber);
            var fromLineNumber, toLineNumber, removeCnt;
            if (ctx.rendLineNumberStart > startLineNumber) {
                // Insert lines before
                fromLineNumber = startLineNumber;
                toLineNumber = Math.min(stopLineNumber, ctx.rendLineNumberStart - 1);
                if (fromLineNumber <= toLineNumber) {
                    this._insertLinesBefore(ctx, fromLineNumber, toLineNumber, deltaTop, startLineNumber);
                    ctx.linesLength += toLineNumber - fromLineNumber + 1;
                    // Clean garbage above
                    if (ctx.scrollDomNode && ctx.scrollDomNodeIsAbove) {
                        if (ctx.scrollDomNode.parentNode) {
                            ctx.scrollDomNode.parentNode.removeChild(ctx.scrollDomNode);
                        }
                        ctx.scrollDomNode = null;
                    }
                }
            }
            else if (ctx.rendLineNumberStart < startLineNumber) {
                // Remove lines before
                removeCnt = Math.min(ctx.linesLength, startLineNumber - ctx.rendLineNumberStart);
                if (removeCnt > 0) {
                    this._removeLinesBefore(ctx, removeCnt);
                    ctx.linesLength -= removeCnt;
                }
            }
            ctx.rendLineNumberStart = startLineNumber;
            if (ctx.rendLineNumberStart + ctx.linesLength - 1 < stopLineNumber) {
                // Insert lines after
                fromLineNumber = ctx.rendLineNumberStart + ctx.linesLength;
                toLineNumber = stopLineNumber;
                if (fromLineNumber <= toLineNumber) {
                    this._insertLinesAfter(ctx, fromLineNumber, toLineNumber, deltaTop, startLineNumber);
                    ctx.linesLength += toLineNumber - fromLineNumber + 1;
                    // Clean garbage below
                    if (ctx.scrollDomNode && !ctx.scrollDomNodeIsAbove) {
                        if (ctx.scrollDomNode.parentNode) {
                            ctx.scrollDomNode.parentNode.removeChild(ctx.scrollDomNode);
                        }
                        ctx.scrollDomNode = null;
                    }
                }
            }
            else if (ctx.rendLineNumberStart + ctx.linesLength - 1 > stopLineNumber) {
                // Remove lines after
                fromLineNumber = Math.max(0, stopLineNumber - ctx.rendLineNumberStart + 1);
                toLineNumber = ctx.linesLength - 1;
                removeCnt = toLineNumber - fromLineNumber + 1;
                if (removeCnt > 0) {
                    this._removeLinesAfter(ctx, removeCnt);
                    ctx.linesLength -= removeCnt;
                }
            }
            this._finishRendering(ctx, false, deltaTop);
            return ctx;
        };
        ViewLayerRenderer.prototype._renderUntouchedLines = function (ctx, startIndex, endIndex, deltaTop, deltaLN) {
            var i, lineNumber;
            for (i = startIndex; i <= endIndex; i++) {
                lineNumber = ctx.rendLineNumberStart + i;
                var lineDomNode = ctx.lines[i].getDomNode();
                if (lineDomNode) {
                    ctx.lines[i].layoutLine(lineNumber, deltaTop[lineNumber - deltaLN]);
                }
            }
        };
        ViewLayerRenderer.prototype._insertLinesBefore = function (ctx, fromLineNumber, toLineNumber, deltaTop, deltaLN) {
            var newLines = [], line, lineNumber;
            for (lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
                line = this._createLine();
                newLines.push(line);
            }
            ctx.lines = newLines.concat(ctx.lines);
        };
        ViewLayerRenderer.prototype._getScrollDomNodeTime = function (domNode) {
            var lastScrollTime = domNode.getAttribute('last-scroll-time');
            if (lastScrollTime) {
                return parseInt(lastScrollTime, 10);
            }
            return 0;
        };
        ViewLayerRenderer.prototype._removeIfNotScrollDomNode = function (ctx, domNode, isAbove) {
            var time = this._getScrollDomNodeTime(domNode);
            if (!time) {
                ctx.domNode.removeChild(domNode);
                return;
            }
            if (ctx.scrollDomNode) {
                var otherTime = this._getScrollDomNodeTime(ctx.scrollDomNode);
                if (otherTime > time) {
                    // The other is the real scroll dom node
                    ctx.domNode.removeChild(domNode);
                    return;
                }
                if (ctx.scrollDomNode.parentNode) {
                    ctx.scrollDomNode.parentNode.removeChild(ctx.scrollDomNode);
                }
                ctx.scrollDomNode = null;
            }
            ctx.scrollDomNode = domNode;
            ctx.scrollDomNodeIsAbove = isAbove;
        };
        ViewLayerRenderer.prototype._removeLinesBefore = function (ctx, removeCount) {
            var i;
            for (i = 0; i < removeCount; i++) {
                var lineDomNode = ctx.lines[i].getDomNode();
                if (lineDomNode) {
                    this._removeIfNotScrollDomNode(ctx, lineDomNode, true);
                }
            }
            ctx.lines.splice(0, removeCount);
        };
        ViewLayerRenderer.prototype._insertLinesAfter = function (ctx, fromLineNumber, toLineNumber, deltaTop, deltaLN) {
            var newLines = [], line, lineNumber;
            for (lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
                line = this._createLine();
                newLines.push(line);
            }
            ctx.lines = ctx.lines.concat(newLines);
        };
        ViewLayerRenderer.prototype._removeLinesAfter = function (ctx, removeCount) {
            var i, removeIndex = ctx.linesLength - removeCount;
            for (i = 0; i < removeCount; i++) {
                var lineDomNode = ctx.lines[removeIndex + i].getDomNode();
                if (lineDomNode) {
                    this._removeIfNotScrollDomNode(ctx, lineDomNode, false);
                }
            }
            ctx.lines.splice(removeIndex, removeCount);
        };
        ViewLayerRenderer._resolveInlineDecorations = function (ctx) {
            var result = [];
            for (var i = 0, len = ctx.linesLength; i < len; i++) {
                var lineNumber = i + ctx.rendLineNumberStart;
                result[i] = ctx.getInlineDecorationsForLineInViewport(lineNumber);
            }
            return result;
        };
        ViewLayerRenderer.prototype._finishRenderingNewLines = function (ctx, domNodeIsEmpty, newLinesHTML, wasNew) {
            var lastChild = ctx.domNode.lastChild;
            if (domNodeIsEmpty || !lastChild) {
                ctx.domNode.innerHTML = this._extraDomNodeHTML() + newLinesHTML.join('');
            }
            else {
                lastChild.insertAdjacentHTML('afterend', newLinesHTML.join(''));
            }
            var currChild = ctx.domNode.lastChild;
            for (var i = ctx.linesLength - 1; i >= 0; i--) {
                var line = ctx.lines[i];
                if (wasNew[i]) {
                    line.setDomNode(currChild);
                    currChild = currChild.previousSibling;
                }
            }
        };
        ViewLayerRenderer.prototype._finishRenderingInvalidLines = function (ctx, invalidLinesHTML, wasInvalid) {
            var hugeDomNode = document.createElement('div');
            hugeDomNode.innerHTML = invalidLinesHTML.join('');
            var lineDomNode, source;
            for (var i = 0; i < ctx.linesLength; i++) {
                var line = ctx.lines[i];
                if (wasInvalid[i]) {
                    source = hugeDomNode.firstChild;
                    lineDomNode = line.getDomNode();
                    lineDomNode.parentNode.replaceChild(source, lineDomNode);
                    line.setDomNode(source);
                }
            }
        };
        ViewLayerRenderer.prototype._finishRendering = function (ctx, domNodeIsEmpty, deltaTop) {
            var inlineDecorations = ViewLayerRenderer._resolveInlineDecorations(ctx);
            var i, len, line, lineNumber, hadNewLine = false, wasNew = [], newLinesHTML = [], hadInvalidLine = false, wasInvalid = [], invalidLinesHTML = [];
            for (i = 0, len = ctx.linesLength; i < len; i++) {
                line = ctx.lines[i];
                lineNumber = i + ctx.rendLineNumberStart;
                if (line.shouldUpdateHTML(ctx.rendLineNumberStart, lineNumber, inlineDecorations[i])) {
                    var lineDomNode = line.getDomNode();
                    if (!lineDomNode) {
                        // Line is new
                        line.getLineOuterHTML(newLinesHTML, lineNumber, deltaTop[i]);
                        wasNew[i] = true;
                        hadNewLine = true;
                    }
                    else {
                        // Line is invalid
                        line.getLineOuterHTML(invalidLinesHTML, lineNumber, deltaTop[i]);
                        wasInvalid[i] = true;
                        hadInvalidLine = true;
                    }
                }
            }
            if (hadNewLine) {
                this._finishRenderingNewLines(ctx, domNodeIsEmpty, newLinesHTML, wasNew);
            }
            if (hadInvalidLine) {
                this._finishRenderingInvalidLines(ctx, invalidLinesHTML, wasInvalid);
            }
        };
        return ViewLayerRenderer;
    }());
});
//# sourceMappingURL=viewLayer.js.map