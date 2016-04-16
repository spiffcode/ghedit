define(["require", "exports", 'vs/editor/common/core/selection', 'vs/editor/contrib/linesOperations/common/sortLinesCommand', 'vs/editor/test/common/commands/commandTestUtils'], function (require, exports, selection_1, sortLinesCommand_1, commandTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function testSortLinesAscendingCommand(lines, selection, expectedLines, expectedSelection) {
        commandTestUtils_1.testCommand(lines, null, selection, function (sel) { return new sortLinesCommand_1.SortLinesCommand(sel, false); }, expectedLines, expectedSelection);
    }
    function testSortLinesDescendingCommand(lines, selection, expectedLines, expectedSelection) {
        commandTestUtils_1.testCommand(lines, null, selection, function (sel) { return new sortLinesCommand_1.SortLinesCommand(sel, true); }, expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Sort Lines Command', function () {
        test('no op unless at least two lines selected 1', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 1));
        });
        test('no op unless at least two lines selected 2', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 2, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 2, 1));
        });
        test('sorting two lines ascending', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 3, 4, 2), [
                'first',
                'second line',
                'fourth line',
                'third line',
                'fifth'
            ], new selection_1.Selection(3, 3, 4, 2));
        });
        test('sorting first 4 lines ascending', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 5, 1), [
                'first',
                'fourth line',
                'second line',
                'third line',
                'fifth'
            ], new selection_1.Selection(1, 1, 5, 1));
        });
        test('sorting all lines ascending', function () {
            testSortLinesAscendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 5, 6), [
                'fifth',
                'first',
                'fourth line',
                'second line',
                'third line',
            ], new selection_1.Selection(1, 1, 5, 6));
        });
        test('sorting first 4 lines desscending', function () {
            testSortLinesDescendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 5, 1), [
                'third line',
                'second line',
                'fourth line',
                'first',
                'fifth'
            ], new selection_1.Selection(1, 1, 5, 1));
        });
        test('sorting all lines descending', function () {
            testSortLinesDescendingCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 5, 6), [
                'third line',
                'second line',
                'fourth line',
                'first',
                'fifth',
            ], new selection_1.Selection(1, 1, 5, 6));
        });
    });
});
//# sourceMappingURL=sortLinesCommand.test.js.map