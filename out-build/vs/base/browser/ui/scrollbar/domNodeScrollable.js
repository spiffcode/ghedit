var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/dom', 'vs/base/browser/touch', 'vs/base/common/lifecycle', 'vs/base/common/scrollable', 'vs/base/common/event'], function (require, exports, DomUtils, touch_1, lifecycle_1, scrollable_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var DomNodeScrollable = (function (_super) {
        __extends(DomNodeScrollable, _super);
        function DomNodeScrollable(domNode) {
            var _this = this;
            _super.call(this);
            this._onScroll = this._register(new event_1.Emitter());
            this._domNode = domNode;
            this._gestureHandler = this._register(new touch_1.Gesture(this._domNode));
            this._lastScrollTop = this.getScrollTop();
            this._lastScrollLeft = this.getScrollLeft();
            this._register(DomUtils.addDisposableListener(this._domNode, 'scroll', function (e) {
                _this._emitScrollEvent();
            }));
        }
        DomNodeScrollable.prototype.onContentsDimensions = function () {
            this._emitScrollEvent();
        };
        DomNodeScrollable.prototype._emitScrollEvent = function () {
            var vertical = (this._lastScrollTop !== this.getScrollTop());
            this._lastScrollTop = this.getScrollTop();
            var horizontal = (this._lastScrollLeft !== this.getScrollLeft());
            this._lastScrollLeft = this.getScrollLeft();
            this._onScroll.fire(new scrollable_1.ScrollEvent(this.getScrollTop(), this.getScrollLeft(), this.getScrollWidth(), this.getScrollHeight(), vertical, horizontal));
        };
        DomNodeScrollable.prototype.dispose = function () {
            this._domNode = null;
            _super.prototype.dispose.call(this);
        };
        DomNodeScrollable.prototype.getScrollHeight = function () {
            return this._domNode.scrollHeight;
        };
        DomNodeScrollable.prototype.getScrollWidth = function () {
            return this._domNode.scrollWidth;
        };
        DomNodeScrollable.prototype.getScrollLeft = function () {
            return this._domNode.scrollLeft;
        };
        DomNodeScrollable.prototype.setScrollLeft = function (scrollLeft) {
            this._domNode.scrollLeft = scrollLeft;
        };
        DomNodeScrollable.prototype.getScrollTop = function () {
            return this._domNode.scrollTop;
        };
        DomNodeScrollable.prototype.setScrollTop = function (scrollTop) {
            this._domNode.scrollTop = scrollTop;
        };
        DomNodeScrollable.prototype.addScrollListener = function (callback) {
            return this._onScroll.event(callback);
        };
        return DomNodeScrollable;
    }(lifecycle_1.Disposable));
    exports.DomNodeScrollable = DomNodeScrollable;
});
