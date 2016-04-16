/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/workbench/api/node/extHostDocuments', 'vs/workbench/api/node/extHostTypes', 'vs/editor/common/core/range'], function (require, exports, assert, uri_1, extHostDocuments_1, extHostTypes_1, range_1) {
    'use strict';
    suite('ExtHostDocument', function () {
        var data;
        function assertPositionAt(offset, line, character) {
            var position = data.positionAt(offset);
            assert.equal(position.line, line);
            assert.equal(position.character, character);
        }
        function assertOffsetAt(line, character, offset) {
            var pos = new extHostTypes_1.Position(line, character);
            var actual = data.offsetAt(pos);
            assert.equal(actual, offset);
        }
        setup(function () {
            data = new extHostDocuments_1.ExtHostDocumentData(undefined, uri_1.default.file(''), [
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], '\n', 'text', 1, false);
        });
        test('readonly-ness', function () {
            assert.throws(function () { return data.document.uri = null; });
            assert.throws(function () { return data.document.fileName = 'foofile'; });
            assert.throws(function () { return data.document.isDirty = false; });
            assert.throws(function () { return data.document.isUntitled = false; });
            assert.throws(function () { return data.document.languageId = 'dddd'; });
            assert.throws(function () { return data.document.lineCount = 9; });
        });
        test('lines', function () {
            assert.equal(data.document.lineCount, 4);
            assert.throws(function () { return data.document.lineCount = 9; });
            assert.throws(function () { return data.lineAt(-1); });
            assert.throws(function () { return data.lineAt(data.document.lineCount); });
            assert.throws(function () { return data.lineAt(Number.MAX_VALUE); });
            assert.throws(function () { return data.lineAt(Number.MIN_VALUE); });
            assert.throws(function () { return data.lineAt(0.8); });
            var line = data.lineAt(0);
            assert.equal(line.lineNumber, 0);
            assert.equal(line.text.length, 16);
            assert.equal(line.text, 'This is line one');
            assert.equal(line.isEmptyOrWhitespace, false);
            assert.equal(line.firstNonWhitespaceCharacterIndex, 0);
            data.onEvents([{
                    range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
                    text: '\t ',
                    eol: undefined,
                    isRedoing: undefined,
                    isUndoing: undefined,
                    versionId: undefined,
                    rangeLength: undefined,
                }]);
            // line didn't change
            assert.equal(line.text, 'This is line one');
            assert.equal(line.firstNonWhitespaceCharacterIndex, 0);
            // fetch line again
            line = data.lineAt(0);
            assert.equal(line.text, '\t This is line one');
            assert.equal(line.firstNonWhitespaceCharacterIndex, 2);
        });
        test('offsetAt', function () {
            assertOffsetAt(0, 0, 0);
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 16, 16);
            assertOffsetAt(1, 0, 17);
            assertOffsetAt(1, 3, 20);
            assertOffsetAt(2, 0, 45);
            assertOffsetAt(4, 29, 95);
            assertOffsetAt(4, 30, 95);
            assertOffsetAt(4, Number.MAX_VALUE, 95);
            assertOffsetAt(5, 29, 95);
            assertOffsetAt(Number.MAX_VALUE, 29, 95);
            assertOffsetAt(Number.MAX_VALUE, Number.MAX_VALUE, 95);
        });
        test('offsetAt, after remove', function () {
            data.onEvents([{
                    range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                    text: '',
                    eol: undefined,
                    isRedoing: undefined,
                    isUndoing: undefined,
                    versionId: undefined,
                    rangeLength: undefined,
                }]);
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 13, 13);
            assertOffsetAt(1, 0, 14);
        });
        test('offsetAt, after replace', function () {
            data.onEvents([{
                    range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                    text: 'is could be',
                    eol: undefined,
                    isRedoing: undefined,
                    isUndoing: undefined,
                    versionId: undefined,
                    rangeLength: undefined,
                }]);
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 24, 24);
            assertOffsetAt(1, 0, 25);
        });
        test('offsetAt, after insert line', function () {
            data.onEvents([{
                    range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                    text: 'is could be\na line with number',
                    eol: undefined,
                    isRedoing: undefined,
                    isUndoing: undefined,
                    versionId: undefined,
                    rangeLength: undefined,
                }]);
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 13, 13);
            assertOffsetAt(1, 0, 14);
            assertOffsetAt(1, 18, 13 + 1 + 18);
            assertOffsetAt(1, 29, 13 + 1 + 29);
            assertOffsetAt(2, 0, 13 + 1 + 29 + 1);
        });
        test('offsetAt, after remove line', function () {
            data.onEvents([{
                    range: { startLineNumber: 1, startColumn: 3, endLineNumber: 2, endColumn: 6 },
                    text: '',
                    eol: undefined,
                    isRedoing: undefined,
                    isUndoing: undefined,
                    versionId: undefined,
                    rangeLength: undefined,
                }]);
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 2, 2);
            assertOffsetAt(1, 0, 25);
        });
        test('positionAt', function () {
            assertPositionAt(0, 0, 0);
            assertPositionAt(Number.MIN_VALUE, 0, 0);
            assertPositionAt(1, 0, 1);
            assertPositionAt(16, 0, 16);
            assertPositionAt(17, 1, 0);
            assertPositionAt(20, 1, 3);
            assertPositionAt(45, 2, 0);
            assertPositionAt(95, 3, 29);
            assertPositionAt(96, 3, 29);
            assertPositionAt(99, 3, 29);
            assertPositionAt(Number.MAX_VALUE, 3, 29);
        });
    });
    var AssertDocumentLineMappingDirection;
    (function (AssertDocumentLineMappingDirection) {
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["OffsetToPosition"] = 0] = "OffsetToPosition";
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["PositionToOffset"] = 1] = "PositionToOffset";
    })(AssertDocumentLineMappingDirection || (AssertDocumentLineMappingDirection = {}));
    suite('ExtHostDocument updates line mapping', function () {
        function positionToStr(position) {
            return '(' + position.line + ',' + position.character + ')';
        }
        function assertDocumentLineMapping(doc, direction) {
            var allText = doc.getText();
            var line = 0, character = 0, previousIsCarriageReturn = false;
            for (var offset = 0; offset <= allText.length; offset++) {
                // The position coordinate system cannot express the position between \r and \n
                var position = new extHostTypes_1.Position(line, character + (previousIsCarriageReturn ? -1 : 0));
                if (direction === AssertDocumentLineMappingDirection.OffsetToPosition) {
                    var actualPosition = doc.positionAt(offset);
                    assert.equal(positionToStr(actualPosition), positionToStr(position), 'positionAt mismatch for offset ' + offset);
                }
                else {
                    // The position coordinate system cannot express the position between \r and \n
                    var expectedOffset = offset + (previousIsCarriageReturn ? -1 : 0);
                    var actualOffset = doc.offsetAt(position);
                    assert.equal(actualOffset, expectedOffset, 'offsetAt mismatch for position ' + positionToStr(position));
                }
                if (allText.charAt(offset) === '\n') {
                    line++;
                    character = 0;
                }
                else {
                    character++;
                }
                previousIsCarriageReturn = (allText.charAt(offset) === '\r');
            }
        }
        function createChangeEvent(range, text, eol) {
            return {
                range: range,
                text: text,
                eol: eol,
                isRedoing: undefined,
                isUndoing: undefined,
                versionId: undefined,
                rangeLength: undefined,
            };
        }
        function testLineMappingDirectionAfterEvents(lines, eol, direction, events) {
            var myDocument = new extHostDocuments_1.ExtHostDocumentData(undefined, uri_1.default.file(''), lines.slice(0), eol, 'text', 1, false);
            assertDocumentLineMapping(myDocument, direction);
            myDocument.onEvents(events);
            assertDocumentLineMapping(myDocument, direction);
        }
        function testLineMappingAfterEvents(lines, events) {
            testLineMappingDirectionAfterEvents(lines, '\n', AssertDocumentLineMappingDirection.PositionToOffset, events);
            testLineMappingDirectionAfterEvents(lines, '\n', AssertDocumentLineMappingDirection.OffsetToPosition, events);
            testLineMappingDirectionAfterEvents(lines, '\r\n', AssertDocumentLineMappingDirection.PositionToOffset, events);
            testLineMappingDirectionAfterEvents(lines, '\r\n', AssertDocumentLineMappingDirection.OffsetToPosition, events);
        }
        test('line mapping', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], []);
        });
        test('after remove', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 3, 1, 6), '')]);
        });
        test('after replace', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be')]);
        });
        test('after insert line', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be\na line with number')]);
        });
        test('after insert two lines', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be\na line with number\nyet another line')]);
        });
        test('after remove line', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 3, 2, 6), '')]);
        });
        test('after remove two lines', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 3, 3, 6), '')]);
        });
        test('after deleting entire content', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 3, 4, 30), '')]);
        });
        test('after replacing entire content', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 3, 4, 30), 'some new text\nthat\nspans multiple lines')]);
        });
        test('after changing EOL to CRLF', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 1, 1, 1), '', '\r\n')]);
        });
        test('after changing EOL to LF', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], [createChangeEvent(new range_1.Range(1, 1, 1, 1), '', '\n')]);
        });
    });
});
//# sourceMappingURL=extHostDocuments.test.js.map