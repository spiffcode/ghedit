/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/set'], function (require, exports, winjs_base_1, set_1) {
    'use strict';
    var PagedModel = (function () {
        function PagedModel(pager, pageTimeout) {
            if (pageTimeout === void 0) { pageTimeout = 500; }
            this.pager = pager;
            this.pageTimeout = pageTimeout;
            this.pages = [];
            this.pages = [{ isResolved: true, promise: null, promiseIndexes: new set_1.ArraySet(), elements: pager.firstPage.slice() }];
            var totalPages = Math.ceil(pager.total / pager.pageSize);
            for (var i = 0, len = totalPages - 1; i < len; i++) {
                this.pages.push({ isResolved: false, promise: null, promiseIndexes: new set_1.ArraySet(), elements: [] });
            }
        }
        Object.defineProperty(PagedModel.prototype, "length", {
            get: function () { return this.pager.total; },
            enumerable: true,
            configurable: true
        });
        PagedModel.prototype.isResolved = function (index) {
            var pageIndex = Math.floor(index / this.pager.pageSize);
            var page = this.pages[pageIndex];
            return !!page.isResolved;
        };
        PagedModel.prototype.get = function (index) {
            var pageIndex = Math.floor(index / this.pager.pageSize);
            var indexInPage = index % this.pager.pageSize;
            var page = this.pages[pageIndex];
            return page.elements[indexInPage];
        };
        PagedModel.prototype.resolve = function (index) {
            var _this = this;
            var pageIndex = Math.floor(index / this.pager.pageSize);
            var indexInPage = index % this.pager.pageSize;
            var page = this.pages[pageIndex];
            if (page.isResolved) {
                return winjs_base_1.TPromise.as(page.elements[indexInPage]);
            }
            if (!page.promise) {
                page.promise = winjs_base_1.TPromise.timeout(this.pageTimeout)
                    .then(function () { return _this.pager.getPage(pageIndex); })
                    .then(function (elements) {
                    page.elements = elements;
                    page.isResolved = true;
                    page.promise = null;
                }, function (err) {
                    page.isResolved = false;
                    page.promise = null;
                    return winjs_base_1.TPromise.wrapError(err);
                });
            }
            return new winjs_base_1.TPromise(function (c, e) {
                page.promiseIndexes.set(index);
                page.promise.done(function () { return c(page.elements[indexInPage]); });
            }, function () {
                if (!page.promise) {
                    return;
                }
                page.promiseIndexes.unset(index);
                if (page.promiseIndexes.elements.length === 0) {
                    page.promise.cancel();
                }
            });
        };
        return PagedModel;
    }());
    exports.PagedModel = PagedModel;
    function mapPager(pager, fn) {
        return {
            firstPage: pager.firstPage.map(fn),
            total: pager.total,
            pageSize: pager.pageSize,
            getPage: function (pageIndex) { return pager.getPage(pageIndex).then(function (r) { return r.map(fn); }); }
        };
    }
    exports.mapPager = mapPager;
});
//# sourceMappingURL=paging.js.map