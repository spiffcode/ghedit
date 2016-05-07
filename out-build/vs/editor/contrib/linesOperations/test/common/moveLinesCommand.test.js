define(["require", "exports", 'vs/editor/common/core/selection', 'vs/editor/contrib/linesOperations/common/moveLinesCommand', 'vs/editor/test/common/commands/commandTestUtils'], function (require, exports, selection_1, moveLinesCommand_1, commandTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function testMoveLinesDownCommand(lines, selection, expectedLines, expectedSelection) {
        commandTestUtils_1.testCommand(lines, null, selection, function (sel) { return new moveLinesCommand_1.MoveLinesCommand(sel, true); }, expectedLines, expectedSelection);
    }
    function testMoveLinesUpCommand(lines, selection, expectedLines, expectedSelection) {
        commandTestUtils_1.testCommand(lines, null, selection, function (sel) { return new moveLinesCommand_1.MoveLinesCommand(sel, false); }, expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Move Lines Command', function () {
        test('move first up / last down disabled', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1));
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 1, 5, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 1, 5, 1));
        });
        test('move first line down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 4, 1, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 2, 1));
        });
        test('move 2nd line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 2, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('issue #1322a: move 2nd line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 12, 2, 12), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 12, 1, 12));
        });
        test('issue #1322b: move last line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 6, 5, 6), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.Selection(4, 6, 4, 6));
        });
        test('issue #1322c: move last line selected up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 6, 5, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.Selection(4, 6, 4, 1));
        });
        test('move last line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 1, 5, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.Selection(4, 1, 4, 1));
        });
        test('move 4th line down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 1, 4, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.Selection(5, 1, 5, 1));
        });
        test('move multiple lines down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 4, 2, 2), [
                'first',
                'fifth',
                'second line',
                'third line',
                'fourth line'
            ], new selection_1.Selection(5, 4, 3, 2));
        });
        test('invisible selection is ignored', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 1, 2, 1));
        });
    });
});
//# sourceMappingURL=moveLinesCommand.test.js.map