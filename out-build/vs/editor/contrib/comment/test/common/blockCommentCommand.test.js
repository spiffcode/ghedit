define(["require", "exports", 'vs/editor/common/core/selection', 'vs/editor/contrib/comment/common/blockCommentCommand', 'vs/editor/test/common/commands/commandTestUtils', 'vs/editor/test/common/testModes'], function (require, exports, selection_1, blockCommentCommand_1, commandTestUtils_1, testModes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function testBlockCommentCommand(lines, selection, expectedLines, expectedSelection) {
        var mode = new testModes_1.CommentMode({ lineCommentToken: '!@#', blockCommentStartToken: '<0', blockCommentEndToken: '0>' });
        commandTestUtils_1.testCommand(lines, mode, selection, function (sel) { return new blockCommentCommand_1.BlockCommentCommand(sel); }, expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Block Comment Command', function () {
        test('empty selection wraps itself', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 3), [
                'fi<00>rst',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('invisible selection ignored', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 1), [
                '<0first',
                '0>\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 2, 1));
        });
        test('bug9511', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 6, 1, 1), [
                '<0first0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 8));
            testBlockCommentCommand([
                '<0first0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 8, 1, 3), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 6));
        });
        test('one line selection', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 6, 1, 3), [
                'fi<0rst0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 8));
        });
        test('one line selection toggle', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 6, 1, 3), [
                'fi<0rst0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 8));
            testBlockCommentCommand([
                'fi<0rst0>',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 8, 1, 5), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 6));
        });
        test('multi line selection', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 1, 1), [
                '<0first',
                '\tse0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 2, 4));
        });
        test('multi line selection toggle', function () {
            testBlockCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 1, 1), [
                '<0first',
                '\tse0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 2, 4));
            testBlockCommentCommand([
                '<0first',
                '\tse0>cond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 1, 3), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 2, 4));
        });
        test('fuzzy removes', function () {
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.Selection(2, 5, 1, 7), [
                'asd  qwe',
                'asd  qwe'
            ], new selection_1.Selection(1, 5, 2, 5));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.Selection(2, 5, 1, 6), [
                'asd  qwe',
                'asd  qwe'
            ], new selection_1.Selection(1, 5, 2, 5));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.Selection(2, 5, 1, 5), [
                'asd  qwe',
                'asd  qwe'
            ], new selection_1.Selection(1, 5, 2, 5));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.Selection(2, 5, 1, 11), [
                'asd  qwe',
                'asd  qwe'
            ], new selection_1.Selection(1, 5, 2, 5));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.Selection(2, 1, 1, 11), [
                'asd  qwe',
                'asd  qwe'
            ], new selection_1.Selection(1, 5, 2, 5));
            testBlockCommentCommand([
                'asd <0 qwe',
                'asd 0> qwe'
            ], new selection_1.Selection(2, 7, 1, 11), [
                'asd  qwe',
                'asd  qwe'
            ], new selection_1.Selection(1, 5, 2, 5));
        });
    });
});
//# sourceMappingURL=blockCommentCommand.test.js.map