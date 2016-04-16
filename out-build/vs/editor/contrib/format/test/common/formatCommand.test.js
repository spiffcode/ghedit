define(["require", "exports", 'assert', 'vs/editor/common/core/range', 'vs/editor/common/core/selection', 'vs/editor/common/model/model', 'vs/editor/contrib/format/common/formatCommand', 'vs/editor/test/common/commands/commandTestUtils'], function (require, exports, assert, range_1, selection_1, model_1, formatCommand_1, commandTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function editOp(startLineNumber, startColumn, endLineNumber, endColumn, text) {
        return {
            range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
            text: text.join('\n'),
            forceMoveMarkers: false
        };
    }
    suite('FormatCommand.trimEdit', function () {
        function testTrimEdit(lines, edit, expected) {
            var model = new model_1.Model(lines.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            var actual = formatCommand_1.EditOperationsCommand.trimEdit(edit, model);
            assert.deepEqual(actual, expected);
            model.dispose();
        }
        test('single-line no-op', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 1, 10, [
                'some text'
            ]), null);
        });
        test('multi-line no-op 1', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 2, 16, [
                'some text',
                'some other text'
            ]), null);
        });
        test('multi-line no-op 2', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 2, 1, [
                'some text',
                ''
            ]), null);
        });
        test('simple prefix, no suffix', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 1, 10, [
                'some interesting thing'
            ]), editOp(1, 6, 1, 10, [
                'interesting thing'
            ]));
        });
        test('whole line prefix, no suffix', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 1, 10, [
                'some text',
                'interesting thing'
            ]), editOp(1, 10, 1, 10, [
                '',
                'interesting thing'
            ]));
        });
        test('multi-line prefix, no suffix', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 2, 16, [
                'some text',
                'some other interesting thing'
            ]), editOp(2, 12, 2, 16, [
                'interesting thing'
            ]));
        });
        test('no prefix, simple suffix', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 1, 10, [
                'interesting text'
            ]), editOp(1, 1, 1, 5, [
                'interesting'
            ]));
        });
        test('no prefix, whole line suffix', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 1, 10, [
                'interesting thing',
                'some text'
            ]), editOp(1, 1, 1, 1, [
                'interesting thing',
                ''
            ]));
        });
        test('no prefix, multi-line suffix', function () {
            testTrimEdit([
                'some text',
                'some other text'
            ], editOp(1, 1, 2, 16, [
                'interesting thing text',
                'some other text'
            ]), editOp(1, 1, 1, 5, [
                'interesting thing'
            ]));
        });
        test('no overlapping prefix & suffix', function () {
            testTrimEdit([
                'some cool text'
            ], editOp(1, 1, 1, 15, [
                'some interesting text'
            ]), editOp(1, 6, 1, 10, [
                'interesting'
            ]));
        });
        test('overlapping prefix & suffix 1', function () {
            testTrimEdit([
                'some cool text'
            ], editOp(1, 1, 1, 15, [
                'some cool cool text'
            ]), editOp(1, 11, 1, 11, [
                'cool '
            ]));
        });
        test('overlapping prefix & suffix 2', function () {
            testTrimEdit([
                'some cool cool text'
            ], editOp(1, 1, 1, 29, [
                'some cool text'
            ]), editOp(1, 11, 1, 16, [
                ''
            ]));
        });
    });
    suite('FormatCommand', function () {
        function testFormatCommand(lines, selection, edits, expectedLines, expectedSelection) {
            commandTestUtils_1.testCommand(lines, null, selection, function (sel) { return new formatCommand_1.EditOperationsCommand(edits, sel); }, expectedLines, expectedSelection);
        }
        test('no-op', function () {
            testFormatCommand([
                'some text',
                'some other text'
            ], new selection_1.Selection(2, 1, 2, 5), [
                editOp(1, 1, 2, 16, [
                    'some text',
                    'some other text'
                ])
            ], [
                'some text',
                'some other text'
            ], new selection_1.Selection(2, 1, 2, 5));
        });
        test('trim beginning', function () {
            testFormatCommand([
                'some text',
                'some other text'
            ], new selection_1.Selection(2, 1, 2, 5), [
                editOp(1, 1, 2, 16, [
                    'some text',
                    'some new other text'
                ])
            ], [
                'some text',
                'some new other text'
            ], new selection_1.Selection(2, 1, 2, 5));
        });
        test('issue #144', function () {
            testFormatCommand([
                'package caddy',
                '',
                'func main() {',
                '\tfmt.Println("Hello World! :)")',
                '}',
                ''
            ], new selection_1.Selection(1, 1, 1, 1), [
                editOp(1, 1, 6, 1, [
                    'package caddy',
                    '',
                    'import "fmt"',
                    '',
                    'func main() {',
                    '\tfmt.Println("Hello World! :)")',
                    '}',
                    ''
                ])
            ], [
                'package caddy',
                '',
                'import "fmt"',
                '',
                'func main() {',
                '\tfmt.Println("Hello World! :)")',
                '}',
                ''
            ], new selection_1.Selection(1, 1, 1, 1));
        });
    });
});
//# sourceMappingURL=formatCommand.test.js.map