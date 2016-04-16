/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/base/common/iterator', 'vs/base/parts/tree/browser/treeViewModel'], function (require, exports, assert, iterator_1, treeViewModel_1) {
    'use strict';
    function makeItem(id, height) {
        return {
            id: id,
            getHeight: function () { return height; },
            isExpanded: function () { return false; },
            getAllTraits: function () { return []; }
        };
    }
    function makeItems() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var r = [];
        for (var i = 0; i < args.length; i += 2) {
            r.push(makeItem(args[i], args[i + 1]));
        }
        return r;
    }
    function makeNavigator() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var items = makeItems.apply(null, args);
        var i = 0;
        return {
            next: function () {
                return items[i++] || null;
            }
        };
    }
    var TestHeightMap = (function (_super) {
        __extends(TestHeightMap, _super);
        function TestHeightMap() {
            _super.apply(this, arguments);
        }
        TestHeightMap.prototype.createViewItem = function (item) {
            return {
                model: item,
                top: 0,
                height: item.getHeight()
            };
        };
        return TestHeightMap;
    }(treeViewModel_1.HeightMap));
    suite('TreeView - HeightMap', function () {
        var rangeMap;
        setup(function () {
            rangeMap = new TestHeightMap();
            rangeMap.onInsertItems(makeNavigator('a', 3, 'b', 30, 'c', 25, 'd', 2));
        });
        teardown(function () {
            rangeMap.dispose();
            rangeMap = null;
        });
        test('simple', function () {
            assert.equal(rangeMap.itemAt(0), 'a');
            assert.equal(rangeMap.itemAt(2), 'a');
            assert.equal(rangeMap.itemAt(3), 'b');
            assert.equal(rangeMap.itemAt(32), 'b');
            assert.equal(rangeMap.itemAt(33), 'c');
            assert.equal(rangeMap.itemAt(40), 'c');
            assert.equal(rangeMap.itemAt(57), 'c');
            assert.equal(rangeMap.itemAt(58), 'd');
            assert.equal(rangeMap.itemAt(59), 'd');
            assert.throws(function () { return rangeMap.itemAt(60); });
        });
        test('onInsertItems at beginning', function () {
            var navigator = makeNavigator('x', 4, 'y', 20, 'z', 8);
            rangeMap.onInsertItems(navigator);
            assert.equal(rangeMap.itemAt(0), 'x');
            assert.equal(rangeMap.itemAt(3), 'x');
            assert.equal(rangeMap.itemAt(4), 'y');
            assert.equal(rangeMap.itemAt(23), 'y');
            assert.equal(rangeMap.itemAt(24), 'z');
            assert.equal(rangeMap.itemAt(31), 'z');
            assert.equal(rangeMap.itemAt(32), 'a');
            assert.equal(rangeMap.itemAt(34), 'a');
            assert.equal(rangeMap.itemAt(35), 'b');
            assert.equal(rangeMap.itemAt(64), 'b');
            assert.equal(rangeMap.itemAt(65), 'c');
            assert.equal(rangeMap.itemAt(89), 'c');
            assert.equal(rangeMap.itemAt(90), 'd');
            assert.equal(rangeMap.itemAt(91), 'd');
            assert.throws(function () { return rangeMap.itemAt(92); });
        });
        test('onInsertItems in middle', function () {
            var navigator = makeNavigator('x', 4, 'y', 20, 'z', 8);
            rangeMap.onInsertItems(navigator, 'a');
            assert.equal(rangeMap.itemAt(0), 'a');
            assert.equal(rangeMap.itemAt(2), 'a');
            assert.equal(rangeMap.itemAt(3), 'x');
            assert.equal(rangeMap.itemAt(6), 'x');
            assert.equal(rangeMap.itemAt(7), 'y');
            assert.equal(rangeMap.itemAt(26), 'y');
            assert.equal(rangeMap.itemAt(27), 'z');
            assert.equal(rangeMap.itemAt(34), 'z');
            assert.equal(rangeMap.itemAt(35), 'b');
            assert.equal(rangeMap.itemAt(64), 'b');
            assert.equal(rangeMap.itemAt(65), 'c');
            assert.equal(rangeMap.itemAt(89), 'c');
            assert.equal(rangeMap.itemAt(90), 'd');
            assert.equal(rangeMap.itemAt(91), 'd');
            assert.throws(function () { return rangeMap.itemAt(92); });
        });
        test('onInsertItems at end', function () {
            var navigator = makeNavigator('x', 4, 'y', 20, 'z', 8);
            rangeMap.onInsertItems(navigator, 'd');
            assert.equal(rangeMap.itemAt(0), 'a');
            assert.equal(rangeMap.itemAt(2), 'a');
            assert.equal(rangeMap.itemAt(3), 'b');
            assert.equal(rangeMap.itemAt(32), 'b');
            assert.equal(rangeMap.itemAt(33), 'c');
            assert.equal(rangeMap.itemAt(57), 'c');
            assert.equal(rangeMap.itemAt(58), 'd');
            assert.equal(rangeMap.itemAt(59), 'd');
            assert.equal(rangeMap.itemAt(60), 'x');
            assert.equal(rangeMap.itemAt(63), 'x');
            assert.equal(rangeMap.itemAt(64), 'y');
            assert.equal(rangeMap.itemAt(83), 'y');
            assert.equal(rangeMap.itemAt(84), 'z');
            assert.equal(rangeMap.itemAt(91), 'z');
            assert.throws(function () { return rangeMap.itemAt(92); });
        });
        test('onRemoveItems at beginning', function () {
            rangeMap.onRemoveItems(new iterator_1.ArrayIterator(['a', 'b']));
            assert.equal(rangeMap.itemAt(0), 'c');
            assert.equal(rangeMap.itemAt(24), 'c');
            assert.equal(rangeMap.itemAt(25), 'd');
            assert.equal(rangeMap.itemAt(26), 'd');
            assert.throws(function () { return rangeMap.itemAt(27); });
        });
        test('onRemoveItems in middle', function () {
            rangeMap.onRemoveItems(new iterator_1.ArrayIterator(['c']));
            assert.equal(rangeMap.itemAt(0), 'a');
            assert.equal(rangeMap.itemAt(2), 'a');
            assert.equal(rangeMap.itemAt(3), 'b');
            assert.equal(rangeMap.itemAt(32), 'b');
            assert.equal(rangeMap.itemAt(33), 'd');
            assert.equal(rangeMap.itemAt(34), 'd');
            assert.throws(function () { return rangeMap.itemAt(35); });
        });
        test('onRemoveItems at end', function () {
            rangeMap.onRemoveItems(new iterator_1.ArrayIterator(['c', 'd']));
            assert.equal(rangeMap.itemAt(0), 'a');
            assert.equal(rangeMap.itemAt(2), 'a');
            assert.equal(rangeMap.itemAt(3), 'b');
            assert.equal(rangeMap.itemAt(32), 'b');
            assert.throws(function () { return rangeMap.itemAt(33); });
        });
        test('onRefreshItems at beginning', function () {
            var navigator = makeNavigator('a', 1, 'b', 1);
            rangeMap.onRefreshItems(navigator);
            assert.equal(rangeMap.itemAt(0), 'a');
            assert.equal(rangeMap.itemAt(1), 'b');
            assert.equal(rangeMap.itemAt(2), 'c');
            assert.equal(rangeMap.itemAt(26), 'c');
            assert.equal(rangeMap.itemAt(27), 'd');
            assert.equal(rangeMap.itemAt(28), 'd');
            assert.throws(function () { return rangeMap.itemAt(29); });
        });
        test('onRefreshItems in middle', function () {
            var navigator = makeNavigator('b', 40, 'c', 4);
            rangeMap.onRefreshItems(navigator);
            assert.equal(rangeMap.itemAt(0), 'a');
            assert.equal(rangeMap.itemAt(2), 'a');
            assert.equal(rangeMap.itemAt(3), 'b');
            assert.equal(rangeMap.itemAt(42), 'b');
            assert.equal(rangeMap.itemAt(43), 'c');
            assert.equal(rangeMap.itemAt(46), 'c');
            assert.equal(rangeMap.itemAt(47), 'd');
            assert.equal(rangeMap.itemAt(48), 'd');
            assert.throws(function () { return rangeMap.itemAt(49); });
        });
        test('onRefreshItems at end', function () {
            var navigator = makeNavigator('d', 22);
            rangeMap.onRefreshItems(navigator);
            assert.equal(rangeMap.itemAt(0), 'a');
            assert.equal(rangeMap.itemAt(2), 'a');
            assert.equal(rangeMap.itemAt(3), 'b');
            assert.equal(rangeMap.itemAt(32), 'b');
            assert.equal(rangeMap.itemAt(33), 'c');
            assert.equal(rangeMap.itemAt(57), 'c');
            assert.equal(rangeMap.itemAt(58), 'd');
            assert.equal(rangeMap.itemAt(79), 'd');
            assert.throws(function () { return rangeMap.itemAt(80); });
        });
        test('withItemsInRange', function () {
            var i = 0;
            var itemsInRange = ['a', 'b'];
            rangeMap.withItemsInRange(2, 27, function (item) { assert.equal(item, itemsInRange[i++]); });
            assert.equal(i, itemsInRange.length);
            i = 0;
            itemsInRange = ['a', 'b'];
            rangeMap.withItemsInRange(0, 3, function (item) { assert.equal(item, itemsInRange[i++]); });
            assert.equal(i, itemsInRange.length);
            i = 0;
            itemsInRange = ['a'];
            rangeMap.withItemsInRange(0, 2, function (item) { assert.equal(item, itemsInRange[i++]); });
            assert.equal(i, itemsInRange.length);
            i = 0;
            itemsInRange = ['a'];
            rangeMap.withItemsInRange(0, 2, function (item) { assert.equal(item, itemsInRange[i++]); });
            assert.equal(i, itemsInRange.length);
            i = 0;
            itemsInRange = ['b', 'c'];
            rangeMap.withItemsInRange(15, 39, function (item) { assert.equal(item, itemsInRange[i++]); });
            assert.equal(i, itemsInRange.length);
            i = 0;
            itemsInRange = ['a', 'b', 'c', 'd'];
            rangeMap.withItemsInRange(1, 58, function (item) { assert.equal(item, itemsInRange[i++]); });
            assert.equal(i, itemsInRange.length);
            i = 0;
            itemsInRange = ['c', 'd'];
            rangeMap.withItemsInRange(45, 58, function (item) { assert.equal(item, itemsInRange[i++]); });
            assert.equal(i, itemsInRange.length);
        });
    });
});
//# sourceMappingURL=treeViewModel.test.js.map