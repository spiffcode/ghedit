/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    'use strict';
    var ArrayIterator = (function () {
        function ArrayIterator(items, start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = items.length; }
            this.items = items;
            this.start = start;
            this.end = end;
            this.index = start - 1;
        }
        ArrayIterator.prototype.next = function () {
            this.index = Math.min(this.index + 1, this.end);
            if (this.index === this.end) {
                return null;
            }
            return this.items[this.index];
        };
        return ArrayIterator;
    }());
    exports.ArrayIterator = ArrayIterator;
    var MappedIterator = (function () {
        function MappedIterator(iterator, fn) {
            this.iterator = iterator;
            this.fn = fn;
            // noop
        }
        MappedIterator.prototype.next = function () { return this.fn(this.iterator.next()); };
        return MappedIterator;
    }());
    exports.MappedIterator = MappedIterator;
    var MappedNavigator = (function (_super) {
        __extends(MappedNavigator, _super);
        function MappedNavigator(navigator, fn) {
            _super.call(this, navigator, fn);
            this.navigator = navigator;
        }
        MappedNavigator.prototype.current = function () { return this.fn(this.navigator.current()); };
        MappedNavigator.prototype.previous = function () { return this.fn(this.navigator.previous()); };
        MappedNavigator.prototype.parent = function () { return this.fn(this.navigator.parent()); };
        MappedNavigator.prototype.first = function () { return this.fn(this.navigator.first()); };
        MappedNavigator.prototype.last = function () { return this.fn(this.navigator.last()); };
        return MappedNavigator;
    }(MappedIterator));
    exports.MappedNavigator = MappedNavigator;
});
