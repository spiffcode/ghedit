var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/lifecycle'], function (require, exports, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ScrollEvent = (function () {
        function ScrollEvent(scrollTop, scrollLeft, scrollWidth, scrollHeight, vertical, horizontal) {
            this.scrollTop = Math.round(scrollTop);
            this.scrollLeft = Math.round(scrollLeft);
            this.scrollWidth = Math.round(scrollWidth);
            this.scrollHeight = Math.round(scrollHeight);
            this.vertical = Boolean(vertical);
            this.horizontal = Boolean(horizontal);
        }
        return ScrollEvent;
    }());
    exports.ScrollEvent = ScrollEvent;
    var ScrollableValues = (function () {
        function ScrollableValues(scrollTop, scrollLeft, scrollWidth, scrollHeight) {
            this.scrollTop = Math.round(scrollTop);
            this.scrollLeft = Math.round(scrollLeft);
            this.scrollWidth = Math.round(scrollWidth);
            this.scrollHeight = Math.round(scrollHeight);
        }
        ScrollableValues.prototype.equals = function (other) {
            return (this.scrollTop === other.scrollTop
                && this.scrollLeft === other.scrollLeft
                && this.scrollWidth === other.scrollWidth
                && this.scrollHeight === other.scrollHeight);
        };
        return ScrollableValues;
    }());
    exports.ScrollableValues = ScrollableValues;
    var DelegateScrollable = (function (_super) {
        __extends(DelegateScrollable, _super);
        function DelegateScrollable(actual, onChange) {
            var _this = this;
            _super.call(this);
            this._actual = actual;
            this._onChange = onChange;
            this._values = new ScrollableValues(this._actual.getScrollTop(), this._actual.getScrollLeft(), this._actual.getScrollWidth(), this._actual.getScrollHeight());
            this._register(this._actual.addScrollListener(function (newValues) { return _this._update(newValues); }));
        }
        DelegateScrollable.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        DelegateScrollable.prototype._update = function (e) {
            if (this._values.equals(e)) {
                return;
            }
            this._values = new ScrollableValues(e.scrollTop, e.scrollLeft, e.scrollWidth, e.scrollHeight);
            this._onChange();
        };
        DelegateScrollable.prototype.getScrollTop = function () { return this._values.scrollTop; };
        DelegateScrollable.prototype.getScrollLeft = function () { return this._values.scrollLeft; };
        DelegateScrollable.prototype.getScrollWidth = function () { return this._values.scrollWidth; };
        DelegateScrollable.prototype.getScrollHeight = function () { return this._values.scrollHeight; };
        DelegateScrollable.prototype.setScrollTop = function (scrollTop) {
            this._actual.setScrollTop(scrollTop);
        };
        DelegateScrollable.prototype.setScrollLeft = function (scrollLeft) {
            this._actual.setScrollLeft(scrollLeft);
        };
        return DelegateScrollable;
    }(lifecycle_1.Disposable));
    exports.DelegateScrollable = DelegateScrollable;
});
//# sourceMappingURL=scrollable.js.map