var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/browser', 'vs/base/browser/ui/scrollbar/abstractScrollbar', 'vs/base/browser/mouseEvent', 'vs/base/browser/ui/scrollbar/scrollableElement'], function (require, exports, Browser, abstractScrollbar_1, mouseEvent_1, scrollableElement_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var VerticalScrollbar = (function (_super) {
        __extends(VerticalScrollbar, _super);
        function VerticalScrollbar(scrollable, parent, options) {
            var _this = this;
            var s = new abstractScrollbar_1.ScrollbarState((options.verticalHasArrows ? options.arrowSize : 0), (options.vertical === scrollableElement_1.Visibility.Hidden ? 0 : options.verticalScrollbarSize), 
            // give priority to vertical scroll bar over horizontal and let it scroll all the way to the bottom
            0);
            _super.call(this, options.forbidTranslate3dUse, options.lazyRender, parent, s, options.vertical, 'vertical');
            this._scrollable = scrollable;
            this._createDomNode();
            if (options.verticalHasArrows) {
                var arrowDelta = (options.arrowSize - abstractScrollbar_1.ARROW_IMG_SIZE) / 2;
                var scrollbarDelta = (options.verticalScrollbarSize - abstractScrollbar_1.ARROW_IMG_SIZE) / 2;
                this._createArrow('up-arrow', arrowDelta, scrollbarDelta, null, null, options.verticalScrollbarSize, options.arrowSize, function () { return _this._createMouseWheelEvent(1); });
                this._createArrow('down-arrow', null, scrollbarDelta, arrowDelta, null, options.verticalScrollbarSize, options.arrowSize, function () { return _this._createMouseWheelEvent(-1); });
            }
            this._createSlider(0, Math.floor((options.verticalScrollbarSize - options.verticalSliderSize) / 2), options.verticalSliderSize, null);
        }
        VerticalScrollbar.prototype._createMouseWheelEvent = function (sign) {
            return new mouseEvent_1.StandardMouseWheelEvent(null, 0, sign);
        };
        VerticalScrollbar.prototype._updateSlider = function (sliderSize, sliderPosition) {
            this.slider.setHeight(sliderSize);
            if (!this._forbidTranslate3dUse && Browser.canUseTranslate3d) {
                this.slider.setTransform('translate3d(0px, ' + sliderPosition + 'px, 0px)');
            }
            else {
                this.slider.setTop(sliderPosition);
            }
        };
        VerticalScrollbar.prototype._renderDomNode = function (largeSize, smallSize) {
            this.domNode.setWidth(smallSize);
            this.domNode.setHeight(largeSize);
            this.domNode.setRight(0);
            this.domNode.setTop(0);
        };
        VerticalScrollbar.prototype._mouseDownRelativePosition = function (e, domNodePosition) {
            return e.posy - domNodePosition.top;
        };
        VerticalScrollbar.prototype._sliderMousePosition = function (e) {
            return e.posy;
        };
        VerticalScrollbar.prototype._sliderOrthogonalMousePosition = function (e) {
            return e.posx;
        };
        VerticalScrollbar.prototype._getScrollPosition = function () {
            return this._scrollable.getScrollTop();
        };
        VerticalScrollbar.prototype._setScrollPosition = function (scrollPosition) {
            this._scrollable.setScrollTop(scrollPosition);
        };
        return VerticalScrollbar;
    }(abstractScrollbar_1.AbstractScrollbar));
    exports.VerticalScrollbar = VerticalScrollbar;
});
