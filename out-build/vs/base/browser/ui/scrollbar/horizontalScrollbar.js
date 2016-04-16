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
    var HorizontalScrollbar = (function (_super) {
        __extends(HorizontalScrollbar, _super);
        function HorizontalScrollbar(scrollable, parent, options) {
            var _this = this;
            var s = new abstractScrollbar_1.ScrollbarState((options.horizontalHasArrows ? options.arrowSize : 0), (options.horizontal === scrollableElement_1.Visibility.Hidden ? 0 : options.horizontalScrollbarSize), (options.vertical === scrollableElement_1.Visibility.Hidden ? 0 : options.verticalScrollbarSize));
            _super.call(this, options.forbidTranslate3dUse, options.lazyRender, parent, s, options.horizontal, 'horizontal');
            this._scrollable = scrollable;
            this._createDomNode();
            if (options.horizontalHasArrows) {
                var arrowDelta = (options.arrowSize - abstractScrollbar_1.ARROW_IMG_SIZE) / 2;
                var scrollbarDelta = (options.horizontalScrollbarSize - abstractScrollbar_1.ARROW_IMG_SIZE) / 2;
                this._createArrow('left-arrow', scrollbarDelta, arrowDelta, null, null, options.arrowSize, options.horizontalScrollbarSize, function () { return _this._createMouseWheelEvent(1); });
                this._createArrow('right-arrow', scrollbarDelta, null, null, arrowDelta, options.arrowSize, options.horizontalScrollbarSize, function () { return _this._createMouseWheelEvent(-1); });
            }
            this._createSlider(Math.floor((options.horizontalScrollbarSize - options.horizontalSliderSize) / 2), 0, null, options.horizontalSliderSize);
        }
        HorizontalScrollbar.prototype._createMouseWheelEvent = function (sign) {
            return new mouseEvent_1.StandardMouseWheelEvent(null, sign, 0);
        };
        HorizontalScrollbar.prototype._updateSlider = function (sliderSize, sliderPosition) {
            this.slider.setWidth(sliderSize);
            if (!this._forbidTranslate3dUse && Browser.canUseTranslate3d) {
                this.slider.setTransform('translate3d(' + sliderPosition + 'px, 0px, 0px)');
            }
            else {
                this.slider.setLeft(sliderPosition);
            }
        };
        HorizontalScrollbar.prototype._renderDomNode = function (largeSize, smallSize) {
            this.domNode.setWidth(largeSize);
            this.domNode.setHeight(smallSize);
            this.domNode.setLeft(0);
            this.domNode.setBottom(0);
        };
        HorizontalScrollbar.prototype._mouseDownRelativePosition = function (e, domNodePosition) {
            return e.posx - domNodePosition.left;
        };
        HorizontalScrollbar.prototype._sliderMousePosition = function (e) {
            return e.posx;
        };
        HorizontalScrollbar.prototype._sliderOrthogonalMousePosition = function (e) {
            return e.posy;
        };
        HorizontalScrollbar.prototype._getScrollPosition = function () {
            return this._scrollable.getScrollLeft();
        };
        HorizontalScrollbar.prototype._setScrollPosition = function (scrollPosition) {
            this._scrollable.setScrollLeft(scrollPosition);
        };
        return HorizontalScrollbar;
    }(abstractScrollbar_1.AbstractScrollbar));
    exports.HorizontalScrollbar = HorizontalScrollbar;
});
