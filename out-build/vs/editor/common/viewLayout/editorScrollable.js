var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/base/common/scrollable'], function (require, exports, eventEmitter_1, scrollable_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var EditorScrollable = (function (_super) {
        __extends(EditorScrollable, _super);
        function EditorScrollable() {
            _super.call(this, [
                EditorScrollable._SCROLL_EVENT
            ]);
            this.scrollTop = 0;
            this.scrollLeft = 0;
            this.scrollWidth = 0;
            this.scrollHeight = 0;
            this.width = 0;
            this.height = 0;
        }
        EditorScrollable.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        // ------------ (visible) width
        EditorScrollable.prototype.getWidth = function () {
            return this.width;
        };
        EditorScrollable.prototype.setWidth = function (width) {
            width = Math.floor(width);
            if (width < 0) {
                width = 0;
            }
            if (this.width !== width) {
                this.width = width;
                // Revalidate
                this.setScrollWidth(this.scrollWidth);
                this.setScrollLeft(this.scrollLeft);
            }
        };
        // ------------ scroll width
        EditorScrollable.prototype.getScrollWidth = function () {
            return this.scrollWidth;
        };
        EditorScrollable.prototype.setScrollWidth = function (scrollWidth) {
            scrollWidth = Math.floor(scrollWidth);
            if (scrollWidth < this.width) {
                scrollWidth = this.width;
            }
            if (this.scrollWidth !== scrollWidth) {
                this.scrollWidth = scrollWidth;
                // Revalidate
                this.setScrollLeft(this.scrollLeft);
                this._emitScrollEvent(false, false);
            }
        };
        // ------------ scroll left
        EditorScrollable.prototype.getScrollLeft = function () {
            return this.scrollLeft;
        };
        EditorScrollable.prototype.setScrollLeft = function (scrollLeft) {
            scrollLeft = Math.floor(scrollLeft);
            if (scrollLeft < 0) {
                scrollLeft = 0;
            }
            if (scrollLeft + this.width > this.scrollWidth) {
                scrollLeft = this.scrollWidth - this.width;
            }
            if (this.scrollLeft !== scrollLeft) {
                this.scrollLeft = scrollLeft;
                this._emitScrollEvent(false, true);
            }
        };
        // ------------ (visible) height
        EditorScrollable.prototype.getHeight = function () {
            return this.height;
        };
        EditorScrollable.prototype.setHeight = function (height) {
            height = Math.floor(height);
            if (height < 0) {
                height = 0;
            }
            if (this.height !== height) {
                this.height = height;
                // Revalidate
                this.setScrollHeight(this.scrollHeight);
                this.setScrollTop(this.scrollTop);
            }
        };
        // ------------ scroll height
        EditorScrollable.prototype.getScrollHeight = function () {
            return this.scrollHeight;
        };
        EditorScrollable.prototype.setScrollHeight = function (scrollHeight) {
            scrollHeight = Math.floor(scrollHeight);
            if (scrollHeight < this.height) {
                scrollHeight = this.height;
            }
            if (this.scrollHeight !== scrollHeight) {
                this.scrollHeight = scrollHeight;
                // Revalidate
                this.setScrollTop(this.scrollTop);
                this._emitScrollEvent(false, false);
            }
        };
        // ------------ scroll top
        EditorScrollable.prototype.getScrollTop = function () {
            return this.scrollTop;
        };
        EditorScrollable.prototype.setScrollTop = function (scrollTop) {
            scrollTop = Math.floor(scrollTop);
            if (scrollTop < 0) {
                scrollTop = 0;
            }
            if (scrollTop + this.height > this.scrollHeight) {
                scrollTop = this.scrollHeight - this.height;
            }
            if (this.scrollTop !== scrollTop) {
                this.scrollTop = scrollTop;
                this._emitScrollEvent(true, false);
            }
        };
        EditorScrollable.prototype._emitScrollEvent = function (vertical, horizontal) {
            var e = new scrollable_1.ScrollEvent(this.getScrollTop(), this.getScrollLeft(), this.getScrollWidth(), this.getScrollHeight(), vertical, horizontal);
            this.emit(EditorScrollable._SCROLL_EVENT, e);
        };
        EditorScrollable.prototype.addScrollListener = function (listener) {
            return this.addListener2(EditorScrollable._SCROLL_EVENT, listener);
        };
        // ------------ events
        EditorScrollable._SCROLL_EVENT = 'scroll';
        return EditorScrollable;
    }(eventEmitter_1.EventEmitter));
    exports.EditorScrollable = EditorScrollable;
});
//# sourceMappingURL=editorScrollable.js.map