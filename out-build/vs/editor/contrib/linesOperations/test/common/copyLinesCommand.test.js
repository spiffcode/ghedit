define(["require", "exports", 'vs/editor/common/core/selection', 'vs/editor/contrib/linesOperations/common/copyLinesCommand', 'vs/editor/test/common/commands/commandTestUtils'], function (require, exports, selection_1, copyLinesCommand_1, commandTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function testCopyLinesDownCommand(lines, selection, expectedLines, expectedSelection) {
        commandTestUtils_1.testCommand(lines, null, selection, function (sel) { return new copyLinesCommand_1.CopyLinesCommand(sel, true); }, expectedLines, expectedSelection);
    }
    function testCopyLinesUpCommand(lines, selection, expectedLines, expectedSelection) {
        commandTestUtils_1.testCommand(lines, null, selection, function (sel) { return new copyLinesCommand_1.CopyLinesCommand(sel, false); }, expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Copy Lines Command', function () {
        test('copy first line down', function () {
            testCopyLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 1), [
                'first',
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 3, 2, 1));
        });
        test('copy first line up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 1), [
                'first',
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 1));
        });
        test('copy last line down', function () {
            testCopyLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 3, 5, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth',
                'fifth'
            ], new selection_1.Selection(6, 3, 6, 1));
        });
        test('copy last line up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 3, 5, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth',
                'fifth'
            ], new selection_1.Selection(5, 3, 5, 1));
        });
        test('issue #1322: copy line up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 11, 3, 11), [
                'first',
                'second line',
                'third line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 11, 3, 11));
        });
        test('issue #1322: copy last line up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 6, 5, 6), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth',
                'fifth'
            ], new selection_1.Selection(5, 6, 5, 6));
        });
        test('copy many lines up', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 3, 2, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 3, 2, 1));
        });
        test('ignore empty selection', function () {
            testCopyLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 1), [
                'first',
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 1));
        });
    });
});
//# sourceMappingURL=copyLinesCommand.test.js.map