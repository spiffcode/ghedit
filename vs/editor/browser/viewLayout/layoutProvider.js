var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/editorCommon', 'vs/editor/common/viewLayout/editorScrollable', 'vs/editor/common/viewLayout/linesLayout', 'vs/editor/common/viewModel/viewEventHandler', 'vs/editor/browser/viewLayout/scrollManager'], function (require, exports, editorCommon, editorScrollable_1, linesLayout_1, viewEventHandler_1, scrollManager_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LayoutProvider = (function (_super) {
        __extends(LayoutProvider, _super);
        function LayoutProvider(configuration, model, privateViewEventBus, linesContent, viewDomNode, overflowGuardDomNode) {
            _super.call(this);
            this.configuration = configuration;
            this.privateViewEventBus = privateViewEventBus;
            this.model = model;
            this.scrollable = new editorScrollable_1.EditorScrollable();
            this.scrollable.setWidth(this.configuration.editor.layoutInfo.contentWidth);
            this.scrollable.setHeight(this.configuration.editor.layoutInfo.contentHeight);
            this.scrollManager = new scrollManager_1.ScrollManager(this.scrollable, configuration, privateViewEventBus, linesContent, viewDomNode, overflowGuardDomNode);
            this.configuration.setLineCount(this.model.getLineCount());
            this.linesLayout = new linesLayout_1.LinesLayout(configuration, model);
            this._updateHeight();
        }
        LayoutProvider.prototype.dispose = function () {
            this.scrollManager.dispose();
            this.scrollable.dispose();
        };
        LayoutProvider.prototype.updateLineCount = function () {
            this.configuration.setLineCount(this.model.getLineCount());
        };
        // ---- begin view event handlers
        LayoutProvider.prototype.onZonesChanged = function () {
            this._updateHeight();
            return false;
        };
        LayoutProvider.prototype.onModelFlushed = function () {
            this.linesLayout.onModelFlushed();
            this.updateLineCount();
            this._updateHeight();
            return false;
        };
        LayoutProvider.prototype.onModelLinesDeleted = function (e) {
            this.linesLayout.onModelLinesDeleted(e);
            this.updateLineCount();
            this._updateHeight();
            return false;
        };
        LayoutProvider.prototype.onModelLinesInserted = function (e) {
            this.linesLayout.onModelLinesInserted(e);
            this.updateLineCount();
            this._updateHeight();
            return false;
        };
        LayoutProvider.prototype.onConfigurationChanged = function (e) {
            this.linesLayout.onConfigurationChanged(e);
            if (e.layoutInfo) {
                this.scrollable.setWidth(this.configuration.editor.layoutInfo.contentWidth);
                this.scrollable.setHeight(this.configuration.editor.layoutInfo.contentHeight);
                this.scrollManager.onSizeProviderLayoutChanged();
                this._emitLayoutChangedEvent();
            }
            this._updateHeight();
            return false;
        };
        LayoutProvider.prototype._updateHeight = function () {
            var oldScrollHeight = this.scrollable.getScrollHeight();
            this.scrollable.setScrollHeight(this.getTotalHeight());
            var newScrollHeight = this.scrollable.getScrollHeight();
            if (oldScrollHeight !== newScrollHeight) {
                this.privateViewEventBus.emit(editorCommon.EventType.ViewScrollHeightChanged, newScrollHeight);
            }
        };
        // ---- end view event handlers
        // ---- Layouting logic
        LayoutProvider.prototype.getCurrentViewport = function () {
            return new editorCommon.Viewport(this.scrollable.getScrollTop(), this.scrollable.getScrollLeft(), this.scrollable.getWidth(), this.scrollable.getHeight());
        };
        LayoutProvider.prototype.getCenteredViewLineNumberInViewport = function () {
            return this.linesLayout.getCenteredLineInViewport(this.getCurrentViewport());
        };
        LayoutProvider.prototype._emitLayoutChangedEvent = function () {
            this.privateViewEventBus.emit(editorCommon.EventType.ViewLayoutChanged, this.configuration.editor.layoutInfo);
        };
        LayoutProvider.prototype.emitLayoutChangedEvent = function () {
            this._emitLayoutChangedEvent();
        };
        LayoutProvider.prototype._computeScrollWidth = function (maxLineWidth, viewportWidth) {
            var isViewportWrapping = this.configuration.editor.wrappingInfo.isViewportWrapping;
            if (!isViewportWrapping) {
                return Math.max(maxLineWidth + LayoutProvider.LINES_HORIZONTAL_EXTRA_PX, viewportWidth);
            }
            return Math.max(maxLineWidth, viewportWidth);
        };
        LayoutProvider.prototype.onMaxLineWidthChanged = function (maxLineWidth) {
            var newScrollWidth = this._computeScrollWidth(maxLineWidth, this.getCurrentViewport().width);
            var oldScrollWidth = this.scrollable.getScrollWidth();
            this.scrollable.setScrollWidth(newScrollWidth);
            newScrollWidth = this.scrollable.getScrollWidth();
            if (newScrollWidth !== oldScrollWidth) {
                this.privateViewEventBus.emit(editorCommon.EventType.ViewScrollWidthChanged, newScrollWidth);
                // The height might depend on the fact that there is a horizontal scrollbar or not
                this._updateHeight();
            }
        };
        // ---- view state
        LayoutProvider.prototype.saveState = function () {
            var scrollTop = this.scrollable.getScrollTop();
            var firstLineNumberInViewport = this.linesLayout.getLineNumberAtOrAfterVerticalOffset(scrollTop);
            var whitespaceAboveFirstLine = this.linesLayout.getWhitespaceAccumulatedHeightBeforeLineNumber(firstLineNumberInViewport);
            return {
                scrollTop: scrollTop,
                scrollTopWithoutViewZones: scrollTop - whitespaceAboveFirstLine,
                scrollLeft: this.scrollable.getScrollLeft()
            };
        };
        LayoutProvider.prototype.restoreState = function (state) {
            var restoreScrollTop = state.scrollTop;
            if (typeof state.scrollTopWithoutViewZones === 'number' && !this.linesLayout.hasWhitespace()) {
                restoreScrollTop = state.scrollTopWithoutViewZones;
            }
            this.scrollable.setScrollTop(restoreScrollTop);
            this.scrollable.setScrollLeft(state.scrollLeft);
        };
        // ---- IVerticalLayoutProvider
        LayoutProvider.prototype.addWhitespace = function (afterLineNumber, ordinal, height) {
            return this.linesLayout.insertWhitespace(afterLineNumber, ordinal, height);
        };
        LayoutProvider.prototype.changeWhitespace = function (id, newAfterLineNumber, newHeight) {
            return this.linesLayout.changeWhitespace(id, newAfterLineNumber, newHeight);
        };
        LayoutProvider.prototype.removeWhitespace = function (id) {
            return this.linesLayout.removeWhitespace(id);
        };
        LayoutProvider.prototype.getVerticalOffsetForLineNumber = function (lineNumber) {
            return this.linesLayout.getVerticalOffsetForLineNumber(lineNumber);
        };
        LayoutProvider.prototype.heightInPxForLine = function (lineNumber) {
            return this.linesLayout.getHeightForLineNumber(lineNumber);
        };
        LayoutProvider.prototype.isAfterLines = function (verticalOffset) {
            return this.linesLayout.isAfterLines(verticalOffset);
        };
        LayoutProvider.prototype.getLineNumberAtVerticalOffset = function (verticalOffset) {
            return this.linesLayout.getLineNumberAtOrAfterVerticalOffset(verticalOffset);
        };
        LayoutProvider.prototype.getTotalHeight = function () {
            var reserveHorizontalScrollbarHeight = 0;
            if (this.scrollable.getScrollWidth() > this.scrollable.getWidth()) {
                reserveHorizontalScrollbarHeight = this.configuration.editor.scrollbar.horizontalScrollbarSize;
            }
            return this.linesLayout.getTotalHeight(this.getCurrentViewport(), reserveHorizontalScrollbarHeight);
        };
        LayoutProvider.prototype.getWhitespaceAtVerticalOffset = function (verticalOffset) {
            return this.linesLayout.getWhitespaceAtVerticalOffset(verticalOffset);
        };
        LayoutProvider.prototype.getLinesViewportData = function () {
            return this.linesLayout.getLinesViewportData(this.getCurrentViewport());
        };
        LayoutProvider.prototype.getWhitespaceViewportData = function () {
            return this.linesLayout.getWhitespaceViewportData(this.getCurrentViewport());
        };
        LayoutProvider.prototype.getWhitespaces = function () {
            return this.linesLayout.getWhitespaces();
        };
        // ---- IScrollingProvider
        LayoutProvider.prototype.getOverviewRulerInsertData = function () {
            var layoutInfo = this.scrollManager.getOverviewRulerLayoutInfo();
            return {
                parent: layoutInfo.parent,
                insertBefore: layoutInfo.insertBefore
            };
        };
        LayoutProvider.prototype.getScrollbarContainerDomNode = function () {
            return this.scrollManager.getScrollbarContainerDomNode();
        };
        LayoutProvider.prototype.delegateVerticalScrollbarMouseDown = function (browserEvent) {
            this.scrollManager.delegateVerticalScrollbarMouseDown(browserEvent);
        };
        LayoutProvider.prototype.getScrollHeight = function () {
            return this.scrollable.getScrollHeight();
        };
        LayoutProvider.prototype.getScrollWidth = function () {
            return this.scrollable.getScrollWidth();
        };
        LayoutProvider.prototype.getScrollLeft = function () {
            return this.scrollable.getScrollLeft();
        };
        LayoutProvider.prototype.setScrollLeft = function (scrollLeft) {
            this.scrollable.setScrollLeft(scrollLeft);
        };
        LayoutProvider.prototype.getScrollTop = function () {
            return this.scrollable.getScrollTop();
        };
        LayoutProvider.prototype.setScrollTop = function (scrollTop) {
            this.scrollable.setScrollTop(scrollTop);
        };
        LayoutProvider.prototype.getScrolledTopFromAbsoluteTop = function (top) {
            return top - this.scrollable.getScrollTop();
        };
        LayoutProvider.prototype.renderScrollbar = function () {
            this.scrollManager.renderScrollbar();
        };
        LayoutProvider.LINES_HORIZONTAL_EXTRA_PX = 30;
        return LayoutProvider;
    }(viewEventHandler_1.ViewEventHandler));
    exports.LayoutProvider = LayoutProvider;
});
//# sourceMappingURL=layoutProvider.js.map