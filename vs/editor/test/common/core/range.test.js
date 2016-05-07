define(["require", "exports", 'assert', 'vs/editor/common/core/range'], function (require, exports, assert, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Editor Core - Range', function () {
        test('empty range', function () {
            var s = new range_1.Range(1, 1, 1, 1);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 1);
            assert.equal(s.endLineNumber, 1);
            assert.equal(s.endColumn, 1);
            assert.equal(s.isEmpty(), true);
        });
        test('swap start and stop same line', function () {
            var s = new range_1.Range(1, 2, 1, 1);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 1);
            assert.equal(s.endLineNumber, 1);
            assert.equal(s.endColumn, 2);
            assert.equal(s.isEmpty(), false);
        });
        test('swap start and stop', function () {
            var s = new range_1.Range(2, 1, 1, 2);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 2);
            assert.equal(s.endLineNumber, 2);
            assert.equal(s.endColumn, 1);
            assert.equal(s.isEmpty(), false);
        });
        test('no swap same line', function () {
            var s = new range_1.Range(1, 1, 1, 2);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 1);
            assert.equal(s.endLineNumber, 1);
            assert.equal(s.endColumn, 2);
            assert.equal(s.isEmpty(), false);
        });
        test('no swap', function () {
            var s = new range_1.Range(1, 1, 2, 1);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 1);
            assert.equal(s.endLineNumber, 2);
            assert.equal(s.endColumn, 1);
            assert.equal(s.isEmpty(), false);
        });
        test('compareRangesUsingEnds', function () {
            var a, b;
            a = new range_1.Range(1, 1, 1, 3);
            b = new range_1.Range(1, 2, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) < 0, 'a.start < b.start, a.end < b.end');
            a = new range_1.Range(1, 1, 1, 3);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) < 0, 'a.start = b.start, a.end < b.end');
            a = new range_1.Range(1, 2, 1, 3);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) < 0, 'a.start > b.start, a.end < b.end');
            a = new range_1.Range(1, 1, 1, 4);
            b = new range_1.Range(1, 2, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) < 0, 'a.start < b.start, a.end = b.end');
            a = new range_1.Range(1, 1, 1, 4);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) === 0, 'a.start = b.start, a.end = b.end');
            a = new range_1.Range(1, 2, 1, 4);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) > 0, 'a.start > b.start, a.end = b.end');
            a = new range_1.Range(1, 1, 1, 5);
            b = new range_1.Range(1, 2, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) > 0, 'a.start < b.start, a.end > b.end');
            a = new range_1.Range(1, 1, 2, 4);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) > 0, 'a.start = b.start, a.end > b.end');
            a = new range_1.Range(1, 1, 5, 1);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) > 0, 'a.start = b.start, a.end > b.end');
        });
    });
});
//# sourceMappingURL=range.test.js.map