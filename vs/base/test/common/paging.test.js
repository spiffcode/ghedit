/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/paging', 'vs/base/common/winjs.base'], function (require, exports, assert, paging_1, winjs_base_1) {
    'use strict';
    suite('PagedModel', function () {
        var model;
        setup(function () {
            var pager = {
                firstPage: [0, 1, 2, 3, 4],
                pageSize: 5,
                total: 100,
                getPage: function (pageIndex) { return winjs_base_1.TPromise.as([0, 1, 2, 3, 4].map(function (i) { return i + (pageIndex * 5); })); }
            };
            model = new paging_1.PagedModel(pager);
        });
        test('isResolved', function () {
            assert(model.isResolved(0));
            assert(model.isResolved(1));
            assert(model.isResolved(2));
            assert(model.isResolved(3));
            assert(model.isResolved(4));
            assert(!model.isResolved(5));
            assert(!model.isResolved(6));
            assert(!model.isResolved(7));
            assert(!model.isResolved(8));
            assert(!model.isResolved(9));
            assert(!model.isResolved(10));
            assert(!model.isResolved(99));
        });
        test('resolve single', function () {
            assert(!model.isResolved(5));
            return model.resolve(5).then(function () {
                assert(model.isResolved(5));
            });
        });
        test('resolve page', function () {
            assert(!model.isResolved(5));
            assert(!model.isResolved(6));
            assert(!model.isResolved(7));
            assert(!model.isResolved(8));
            assert(!model.isResolved(9));
            assert(!model.isResolved(10));
            return model.resolve(5).then(function () {
                assert(model.isResolved(5));
                assert(model.isResolved(6));
                assert(model.isResolved(7));
                assert(model.isResolved(8));
                assert(model.isResolved(9));
                assert(!model.isResolved(10));
            });
        });
        test('resolve page 2', function () {
            assert(!model.isResolved(5));
            assert(!model.isResolved(6));
            assert(!model.isResolved(7));
            assert(!model.isResolved(8));
            assert(!model.isResolved(9));
            assert(!model.isResolved(10));
            return model.resolve(10).then(function () {
                assert(!model.isResolved(5));
                assert(!model.isResolved(6));
                assert(!model.isResolved(7));
                assert(!model.isResolved(8));
                assert(!model.isResolved(9));
                assert(model.isResolved(10));
            });
        });
    });
});
//# sourceMappingURL=paging.test.js.map