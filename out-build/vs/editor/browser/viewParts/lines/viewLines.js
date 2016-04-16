var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/async', 'vs/base/browser/browser', 'vs/base/browser/styleMutator', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser', 'vs/editor/browser/view/viewLayer', 'vs/editor/browser/viewParts/lines/viewLine'], function (require, exports, async_1, browser, styleMutator_1, range_1, editorCommon, editorBrowser_1, viewLayer_1, viewLine_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LastRenderedData = (function () {
        function LastRenderedData() {
            this._currentVisibleRange = new range_1.Range(1, 1, 1, 1);
            this._bigNumbersDelta = 0;
        }
        LastRenderedData.prototype.getCurrentVisibleRange = function () {
            return this._currentVisibleRange;
        };
        LastRenderedData.prototype.setCurrentVisibleRange = function (currentVisibleRange) {
            this._currentVisibleRange = currentVisibleRange;
        };
        LastRenderedData.prototype.getBigNumbersDelta = function () {
            return this._bigNumbersDelta;
        };
        LastRenderedData.prototype.setBigNumbersDelta = function (bigNumbersDelta) {
            this._bigNumbersDelta = bigNumbersDelta;
        };
        return LastRenderedData;
    }());
    var ViewLines = (function (_super) {
        __extends(ViewLines, _super);
        function ViewLines(context, layoutProvider) {
            var _this = this;
            _super.call(this, context);
            this._lineHeight = this._context.configuration.editor.lineHeight;
            this._isViewportWrapping = this._context.configuration.editor.wrappingInfo.isViewportWrapping;
            this._revealHorizontalRightPadding = this._context.configuration.editor.revealHorizontalRightPadding;
            this._layoutProvider = layoutProvider;
            this.domNode.setClassName(editorBrowser_1.ClassNames.VIEW_LINES);
            // --- width & height
            this._maxLineWidth = 0;
            this._asyncUpdateLineWidths = new async_1.RunOnceScheduler(function () {
                _this._updateLineWidths();
            }, 200);
            this._lastRenderedData = new LastRenderedData();
            this._lastCursorRevealRangeHorizontallyEvent = null;
            this._textRangeRestingSpot = document.createElement('div');
            this._textRangeRestingSpot.className = 'textRangeRestingSpot';
        }
        ViewLines.prototype.dispose = function () {
            this._asyncUpdateLineWidths.dispose();
            this._layoutProvider = null;
            _super.prototype.dispose.call(this);
        };
        ViewLines.prototype.getDomNode = function () {
            return this.domNode.domNode;
        };
        // ---- begin view event handlers
        ViewLines.prototype.onConfigurationChanged = function (e) {
            var shouldRender = _super.prototype.onConfigurationChanged.call(this, e);
            if (e.wrappingInfo) {
                this._maxLineWidth = 0;
            }
            if (e.lineHeight) {
                this._lineHeight = this._context.configuration.editor.lineHeight;
            }
            if (e.wrappingInfo) {
                this._isViewportWrapping = this._context.configuration.editor.wrappingInfo.isViewportWrapping;
            }
            if (e.revealHorizontalRightPadding) {
                this._revealHorizontalRightPadding = this._context.configuration.editor.revealHorizontalRightPadding;
            }
            return shouldRender;
        };
        ViewLines.prototype.onLayoutChanged = function (layoutInfo) {
            var shouldRender = _super.prototype.onLayoutChanged.call(this, layoutInfo);
            this._maxLineWidth = 0;
            return shouldRender;
        };
        ViewLines.prototype.onModelFlushed = function () {
            var shouldRender = _super.prototype.onModelFlushed.call(this);
            this._maxLineWidth = 0;
            return shouldRender;
        };
        ViewLines.prototype.onScrollWidthChanged = function (scrollWidth) {
            this.domNode.setWidth(scrollWidth);
            return false;
        };
        ViewLines.prototype.onModelDecorationsChanged = function (e) {
            var shouldRender = _super.prototype.onModelDecorationsChanged.call(this, e);
            for (var i = 0; i < this._lines.length; i++) {
                this._lines[i].onModelDecorationsChanged();
            }
            return shouldRender || true;
        };
        ViewLines.prototype.onCursorRevealRange = function (e) {
            var newScrollTop = this._computeScrollTopToRevealRange(this._layoutProvider.getCurrentViewport(), e.range, e.verticalType);
            if (e.revealHorizontal) {
                this._lastCursorRevealRangeHorizontallyEvent = e;
            }
            this._layoutProvider.setScrollTop(newScrollTop);
            return true;
        };
        ViewLines.prototype.onCursorScrollRequest = function (e) {
            var currentScrollTop = this._layoutProvider.getScrollTop();
            var newScrollTop = currentScrollTop + e.deltaLines * this._lineHeight;
            this._layoutProvider.setScrollTop(newScrollTop);
            return true;
        };
        ViewLines.prototype.onScrollChanged = function (e) {
            return _super.prototype.onScrollChanged.call(this, e) || true;
        };
        // ---- end view event handlers
        // ----------- HELPERS FOR OTHERS
        ViewLines.prototype.getPositionFromDOMInfo = function (spanNode, offset) {
            var lineNumber = this._getLineNumberFromDOMInfo(spanNode);
            if (lineNumber === -1) {
                // Couldn't find span node
                return null;
            }
            if (lineNumber < 1 || lineNumber > this._context.model.getLineCount()) {
                // lineNumber is outside range
                return null;
            }
            if (this._context.model.getLineMaxColumn(lineNumber) === 1) {
                // Line is empty
                return {
                    lineNumber: lineNumber,
                    column: 1
                };
            }
            var lineIndex = lineNumber - this._rendLineNumberStart;
            if (lineIndex < 0 || lineIndex >= this._lines.length) {
                // Couldn't find line
                return null;
            }
            var column = this._lines[lineIndex].getColumnOfNodeOffset(lineNumber, spanNode, offset);
            var minColumn = this._context.model.getLineMinColumn(lineNumber);
            if (column < minColumn) {
                column = minColumn;
            }
            return {
                lineNumber: lineNumber,
                column: column
            };
        };
        ViewLines.prototype._getLineNumberFromDOMInfo = function (spanNode) {
            while (spanNode && spanNode.nodeType === 1) {
                if (spanNode.className === editorBrowser_1.ClassNames.VIEW_LINE) {
                    return parseInt(spanNode.getAttribute('lineNumber'), 10);
                }
                spanNode = spanNode.parentElement;
            }
            return -1;
        };
        ViewLines.prototype.getLineWidth = function (lineNumber) {
            var lineIndex = lineNumber - this._rendLineNumberStart;
            if (lineIndex < 0 || lineIndex >= this._lines.length) {
                return -1;
            }
            return this._lines[lineIndex].getWidth();
        };
        ViewLines.prototype.linesVisibleRangesForRange = function (range, includeNewLines) {
            if (this.shouldRender()) {
                // Cannot read from the DOM because it is dirty
                // i.e. the model & the dom are out of sync, so I'd be reading something stale
                return null;
            }
            var originalEndLineNumber = range.endLineNumber;
            range = range_1.Range.intersectRanges(range, this._lastRenderedData.getCurrentVisibleRange());
            if (!range) {
                return null;
            }
            var visibleRanges = [];
            var clientRectDeltaLeft = this.domNode.domNode.getBoundingClientRect().left;
            var nextLineModelLineNumber;
            if (includeNewLines) {
                nextLineModelLineNumber = this._context.model.convertViewPositionToModelPosition(range.startLineNumber, 1).lineNumber;
            }
            for (var lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
                var lineIndex = lineNumber - this._rendLineNumberStart;
                if (lineIndex < 0 || lineIndex >= this._lines.length) {
                    continue;
                }
                var startColumn = lineNumber === range.startLineNumber ? range.startColumn : 1;
                var endColumn = lineNumber === range.endLineNumber ? range.endColumn : this._context.model.getLineMaxColumn(lineNumber);
                var visibleRangesForLine = this._lines[lineIndex].getVisibleRangesForRange(startColumn, endColumn, clientRectDeltaLeft, this._textRangeRestingSpot);
                if (!visibleRangesForLine || visibleRangesForLine.length === 0) {
                    continue;
                }
                if (includeNewLines && lineNumber < originalEndLineNumber) {
                    var currentLineModelLineNumber = nextLineModelLineNumber;
                    nextLineModelLineNumber = this._context.model.convertViewPositionToModelPosition(lineNumber + 1, 1).lineNumber;
                    if (currentLineModelLineNumber !== nextLineModelLineNumber) {
                        visibleRangesForLine[visibleRangesForLine.length - 1].width += ViewLines.LINE_FEED_WIDTH;
                    }
                }
                visibleRanges.push(new editorCommon.LineVisibleRanges(lineNumber, visibleRangesForLine));
            }
            if (visibleRanges.length === 0) {
                return null;
            }
            return visibleRanges;
        };
        ViewLines.prototype.visibleRangesForRange2 = function (range, deltaTop) {
            if (this.shouldRender()) {
                // Cannot read from the DOM because it is dirty
                // i.e. the model & the dom are out of sync, so I'd be reading something stale
                return null;
            }
            range = range_1.Range.intersectRanges(range, this._lastRenderedData.getCurrentVisibleRange());
            if (!range) {
                return null;
            }
            var result = [];
            var clientRectDeltaLeft = this.domNode.domNode.getBoundingClientRect().left;
            var bigNumbersDelta = this._lastRenderedData.getBigNumbersDelta();
            for (var lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
                var lineIndex = lineNumber - this._rendLineNumberStart;
                if (lineIndex < 0 || lineIndex >= this._lines.length) {
                    continue;
                }
                var startColumn = lineNumber === range.startLineNumber ? range.startColumn : 1;
                var endColumn = lineNumber === range.endLineNumber ? range.endColumn : this._context.model.getLineMaxColumn(lineNumber);
                var visibleRangesForLine = this._lines[lineIndex].getVisibleRangesForRange(startColumn, endColumn, clientRectDeltaLeft, this._textRangeRestingSpot);
                if (!visibleRangesForLine || visibleRangesForLine.length === 0) {
                    continue;
                }
                var adjustedLineNumberVerticalOffset = this._layoutProvider.getVerticalOffsetForLineNumber(lineNumber) - bigNumbersDelta + deltaTop;
                for (var i = 0, len = visibleRangesForLine.length; i < len; i++) {
                    result.push(new editorCommon.VisibleRange(adjustedLineNumberVerticalOffset, visibleRangesForLine[i].left, visibleRangesForLine[i].width));
                }
            }
            if (result.length === 0) {
                return null;
            }
            return result;
        };
        // --- implementation
        ViewLines.prototype._createLine = function () {
            return viewLine_1.createLine(this._context);
        };
        ViewLines.prototype._updateLineWidths = function () {
            var i, localMaxLineWidth = 1, widthInPx;
            // Read line widths
            for (i = 0; i < this._lines.length; i++) {
                widthInPx = this._lines[i].getWidth();
                localMaxLineWidth = Math.max(localMaxLineWidth, widthInPx);
            }
            this._ensureMaxLineWidth(localMaxLineWidth);
        };
        ViewLines.prototype.prepareRender = function () {
            throw new Error('Not supported');
        };
        ViewLines.prototype.render = function () {
            throw new Error('Not supported');
        };
        ViewLines.prototype.renderText = function (linesViewportData, onAfterLinesRendered) {
            if (!this.shouldRender()) {
                throw new Error('I did not ask to render!');
            }
            // (1) render lines - ensures lines are in the DOM
            _super.prototype._renderLines.call(this, linesViewportData);
            this._lastRenderedData.setBigNumbersDelta(linesViewportData.bigNumbersDelta);
            this._lastRenderedData.setCurrentVisibleRange(linesViewportData.visibleRange);
            this.domNode.setWidth(this._layoutProvider.getScrollWidth());
            this.domNode.setHeight(Math.min(this._layoutProvider.getTotalHeight(), 1000000));
            // (2) execute DOM writing that forces sync layout (e.g. textArea manipulation)
            onAfterLinesRendered();
            // (3) compute horizontal scroll position:
            //  - this must happen after the lines are in the DOM since it might need a line that rendered just now
            //  - it might change `scrollWidth` and `scrollLeft`
            if (this._lastCursorRevealRangeHorizontallyEvent) {
                var revealHorizontalRange = this._lastCursorRevealRangeHorizontallyEvent.range;
                this._lastCursorRevealRangeHorizontallyEvent = null;
                // allow `visibleRangesForRange2` to work
                this.onDidRender();
                // compute new scroll position
                var newScrollLeft = this._computeScrollLeftToRevealRange(revealHorizontalRange);
                var isViewportWrapping = this._isViewportWrapping;
                if (!isViewportWrapping) {
                    // ensure `scrollWidth` is large enough
                    this._ensureMaxLineWidth(newScrollLeft.maxHorizontalOffset);
                }
                // set `scrollLeft`
                this._layoutProvider.setScrollLeft(newScrollLeft.scrollLeft);
            }
            // (4) handle scrolling
            if (browser.canUseTranslate3d) {
                var transform = 'translate3d(' + -this._layoutProvider.getScrollLeft() + 'px, ' + linesViewportData.visibleRangesDeltaTop + 'px, 0px)';
                styleMutator_1.StyleMutator.setTransform(this.domNode.domNode.parentNode, transform);
            }
            else {
                styleMutator_1.StyleMutator.setTop(this.domNode.domNode.parentNode, linesViewportData.visibleRangesDeltaTop); // TODO@Alex
                styleMutator_1.StyleMutator.setLeft(this.domNode.domNode.parentNode, -this._layoutProvider.getScrollLeft()); // TODO@Alex
            }
            // Update max line width (not so important, it is just so the horizontal scrollbar doesn't get too small)
            this._asyncUpdateLineWidths.schedule();
        };
        // --- width
        ViewLines.prototype._ensureMaxLineWidth = function (lineWidth) {
            var iLineWidth = Math.ceil(lineWidth);
            if (this._maxLineWidth < iLineWidth) {
                this._maxLineWidth = iLineWidth;
                this._layoutProvider.onMaxLineWidthChanged(this._maxLineWidth);
            }
        };
        ViewLines.prototype._computeScrollTopToRevealRange = function (viewport, range, verticalType) {
            var viewportStartY = viewport.top, viewportHeight = viewport.height, viewportEndY = viewportStartY + viewportHeight, boxStartY, boxEndY;
            // Have a box that includes one extra line height (for the horizontal scrollbar)
            boxStartY = this._layoutProvider.getVerticalOffsetForLineNumber(range.startLineNumber);
            boxEndY = this._layoutProvider.getVerticalOffsetForLineNumber(range.endLineNumber) + this._layoutProvider.heightInPxForLine(range.endLineNumber);
            if (verticalType === editorCommon.VerticalRevealType.Simple) {
                // Reveal one line more for the arrow down case, when the last line would be covered by the scrollbar
                boxEndY += this._lineHeight;
            }
            var newScrollTop;
            if (verticalType === editorCommon.VerticalRevealType.Center || verticalType === editorCommon.VerticalRevealType.CenterIfOutsideViewport) {
                if (verticalType === editorCommon.VerticalRevealType.CenterIfOutsideViewport && viewportStartY <= boxStartY && boxEndY <= viewportEndY) {
                    // Box is already in the viewport... do nothing
                    newScrollTop = viewportStartY;
                }
                else {
                    // Box is outside the viewport... center it
                    var boxMiddleY = (boxStartY + boxEndY) / 2;
                    newScrollTop = Math.max(0, boxMiddleY - viewportHeight / 2);
                }
            }
            else {
                newScrollTop = this._computeMinimumScrolling(viewportStartY, viewportEndY, boxStartY, boxEndY);
            }
            return newScrollTop;
        };
        ViewLines.prototype._computeScrollLeftToRevealRange = function (range) {
            var maxHorizontalOffset = 0;
            if (range.startLineNumber !== range.endLineNumber) {
                // Two or more lines? => scroll to base (That's how you see most of the two lines)
                return {
                    scrollLeft: 0,
                    maxHorizontalOffset: maxHorizontalOffset
                };
            }
            var viewport = this._layoutProvider.getCurrentViewport(), viewportStartX = viewport.left, viewportEndX = viewportStartX + viewport.width;
            var visibleRanges = this.visibleRangesForRange2(range, 0), boxStartX = Number.MAX_VALUE, boxEndX = 0;
            if (!visibleRanges) {
                // Unknown
                return {
                    scrollLeft: viewportStartX,
                    maxHorizontalOffset: maxHorizontalOffset
                };
            }
            var i, visibleRange;
            for (i = 0; i < visibleRanges.length; i++) {
                visibleRange = visibleRanges[i];
                if (visibleRange.left < boxStartX) {
                    boxStartX = visibleRange.left;
                }
                if (visibleRange.left + visibleRange.width > boxEndX) {
                    boxEndX = visibleRange.left + visibleRange.width;
                }
            }
            maxHorizontalOffset = boxEndX;
            boxStartX = Math.max(0, boxStartX - ViewLines.HORIZONTAL_EXTRA_PX);
            boxEndX += this._revealHorizontalRightPadding;
            var newScrollLeft = this._computeMinimumScrolling(viewportStartX, viewportEndX, boxStartX, boxEndX);
            return {
                scrollLeft: newScrollLeft,
                maxHorizontalOffset: maxHorizontalOffset
            };
        };
        ViewLines.prototype._computeMinimumScrolling = function (viewportStart, viewportEnd, boxStart, boxEnd) {
            viewportStart = viewportStart | 0;
            viewportEnd = viewportEnd | 0;
            boxStart = boxStart | 0;
            boxEnd = boxEnd | 0;
            var viewportLength = viewportEnd - viewportStart;
            var boxLength = boxEnd - boxStart;
            if (boxLength < viewportLength) {
                // The box would fit in the viewport
                if (boxStart < viewportStart) {
                    // The box is above the viewport
                    return boxStart;
                }
                else if (boxEnd > viewportEnd) {
                    // The box is below the viewport
                    return Math.max(0, boxEnd - viewportLength);
                }
            }
            else {
                // The box would not fit in the viewport
                // Reveal the beginning of the box
                return boxStart;
            }
            return viewportStart;
        };
        /**
         * Width to extends a line to render the line feed at the end of the line
         */
        ViewLines.LINE_FEED_WIDTH = 10;
        /**
         * Adds this ammount of pixels to the right of lines (no-one wants to type near the edge of the viewport)
         */
        ViewLines.HORIZONTAL_EXTRA_PX = 30;
        return ViewLines;
    }(viewLayer_1.ViewLayer));
    exports.ViewLines = ViewLines;
});
//# sourceMappingURL=viewLines.js.map