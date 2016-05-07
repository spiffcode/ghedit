define(["require", "exports", 'vs/editor/common/core/selection', 'vs/editor/contrib/linesOperations/common/deleteLinesCommand', 'vs/editor/test/common/commands/commandTestUtils'], function (require, exports, selection_1, deleteLinesCommand_1, commandTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function testDeleteLinesCommand(lines, selection, expectedLines, expectedSelection) {
        commandTestUtils_1.testCommand(lines, null, selection, function (sel) { return deleteLinesCommand_1.DeleteLinesCommand.createFromSelection(sel); }, expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Delete Lines Command', function () {
        test('empty selection in middle of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 3, 2, 3), [
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 3, 2, 3));
        });
        test('empty selection at top of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5), [
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('empty selection at end of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 2, 5, 2), [
                'first',
                'second line',
                'third line',
                'fourth line'
            ], new selection_1.Selection(4, 2, 4, 2));
        });
        test('with selection in middle of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 3, 2, 2), [
                'first',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 2, 2, 2));
        });
        test('with selection at top of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 4, 1, 5), [
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('with selection at end of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 1, 5, 2), [
                'first',
                'second line',
                'third line',
                'fourth line'
            ], new selection_1.Selection(4, 2, 4, 2));
        });
        test('with full line selection in middle of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 1, 2, 1), [
                'first',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 2, 1));
        });
        test('with full line selection at top of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 5), [
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('with full line selection at end of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 1, 5, 2), [
                'first',
                'second line',
                'third line'
            ], new selection_1.Selection(3, 2, 3, 2));
        });
    });
});
//# sourceMappingURL=deleteLinesCommand.test.js.map