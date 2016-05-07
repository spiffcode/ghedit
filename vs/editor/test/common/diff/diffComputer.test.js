define(["require", "exports", 'assert', 'vs/editor/common/diff/diffComputer'], function (require, exports, assert, diffComputer_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function extractCharChangeRepresentation(change, expectedChange) {
        var hasOriginal = expectedChange && expectedChange.originalStartLineNumber > 0;
        var hasModified = expectedChange && expectedChange.modifiedStartLineNumber > 0;
        return {
            originalStartLineNumber: hasOriginal ? change.originalStartLineNumber : 0,
            originalStartColumn: hasOriginal ? change.originalStartColumn : 0,
            originalEndLineNumber: hasOriginal ? change.originalEndLineNumber : 0,
            originalEndColumn: hasOriginal ? change.originalEndColumn : 0,
            modifiedStartLineNumber: hasModified ? change.modifiedStartLineNumber : 0,
            modifiedStartColumn: hasModified ? change.modifiedStartColumn : 0,
            modifiedEndLineNumber: hasModified ? change.modifiedEndLineNumber : 0,
            modifiedEndColumn: hasModified ? change.modifiedEndColumn : 0,
        };
    }
    function extractLineChangeRepresentation(change, expectedChange) {
        var result = {
            originalStartLineNumber: change.originalStartLineNumber,
            originalEndLineNumber: change.originalEndLineNumber,
            modifiedStartLineNumber: change.modifiedStartLineNumber,
            modifiedEndLineNumber: change.modifiedEndLineNumber
        };
        if (change.charChanges) {
            var charChanges = [];
            for (var i = 0; i < change.charChanges.length; i++) {
                charChanges.push(extractCharChangeRepresentation(change.charChanges[i], expectedChange && expectedChange.charChanges && i < expectedChange.charChanges.length ? expectedChange.charChanges[i] : null));
            }
            result.charChanges = charChanges;
        }
        return result;
    }
    function assertDiff(originalLines, modifiedLines, expectedChanges, shouldPostProcessCharChanges, shouldIgnoreTrimWhitespace) {
        if (shouldPostProcessCharChanges === void 0) { shouldPostProcessCharChanges = false; }
        if (shouldIgnoreTrimWhitespace === void 0) { shouldIgnoreTrimWhitespace = false; }
        var diffComputer = new diffComputer_1.DiffComputer(originalLines, modifiedLines, {
            shouldPostProcessCharChanges: shouldPostProcessCharChanges || false,
            shouldIgnoreTrimWhitespace: shouldIgnoreTrimWhitespace || false,
            shouldConsiderTrimWhitespaceInEmptyCase: true
        });
        var changes = diffComputer.computeDiff();
        var extracted = [];
        for (var i = 0; i < changes.length; i++) {
            extracted.push(extractLineChangeRepresentation(changes[i], i < expectedChanges.length ? expectedChanges[i] : null));
        }
        assert.deepEqual(extracted, expectedChanges);
    }
    function createLineDeletion(startLineNumber, endLineNumber, modifiedLineNumber) {
        return {
            originalStartLineNumber: startLineNumber,
            originalEndLineNumber: endLineNumber,
            modifiedStartLineNumber: modifiedLineNumber,
            modifiedEndLineNumber: 0
        };
    }
    function createLineInsertion(startLineNumber, endLineNumber, originalLineNumber) {
        return {
            originalStartLineNumber: originalLineNumber,
            originalEndLineNumber: 0,
            modifiedStartLineNumber: startLineNumber,
            modifiedEndLineNumber: endLineNumber
        };
    }
    function createLineChange(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges) {
        return {
            originalStartLineNumber: originalStartLineNumber,
            originalEndLineNumber: originalEndLineNumber,
            modifiedStartLineNumber: modifiedStartLineNumber,
            modifiedEndLineNumber: modifiedEndLineNumber,
            charChanges: charChanges
        };
    }
    function createCharInsertion(startLineNumber, startColumn, endLineNumber, endColumn) {
        return {
            originalStartLineNumber: 0,
            originalStartColumn: 0,
            originalEndLineNumber: 0,
            originalEndColumn: 0,
            modifiedStartLineNumber: startLineNumber,
            modifiedStartColumn: startColumn,
            modifiedEndLineNumber: endLineNumber,
            modifiedEndColumn: endColumn
        };
    }
    function createCharDeletion(startLineNumber, startColumn, endLineNumber, endColumn) {
        return {
            originalStartLineNumber: startLineNumber,
            originalStartColumn: startColumn,
            originalEndLineNumber: endLineNumber,
            originalEndColumn: endColumn,
            modifiedStartLineNumber: 0,
            modifiedStartColumn: 0,
            modifiedEndLineNumber: 0,
            modifiedEndColumn: 0
        };
    }
    function createCharChange(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn) {
        return {
            originalStartLineNumber: originalStartLineNumber,
            originalStartColumn: originalStartColumn,
            originalEndLineNumber: originalEndLineNumber,
            originalEndColumn: originalEndColumn,
            modifiedStartLineNumber: modifiedStartLineNumber,
            modifiedStartColumn: modifiedStartColumn,
            modifiedEndLineNumber: modifiedEndLineNumber,
            modifiedEndColumn: modifiedEndColumn
        };
    }
    suite('Editor Diff - DiffComputer', function () {
        // ---- insertions
        test('one inserted line below', function () {
            var original = ['line'];
            var modified = ['line', 'new line'];
            var expected = [createLineInsertion(2, 2, 1)];
            assertDiff(original, modified, expected);
        });
        test('two inserted lines below', function () {
            var original = ['line'];
            var modified = ['line', 'new line', 'another new line'];
            var expected = [createLineInsertion(2, 3, 1)];
            assertDiff(original, modified, expected);
        });
        test('one inserted line above', function () {
            var original = ['line'];
            var modified = ['new line', 'line'];
            var expected = [createLineInsertion(1, 1, 0)];
            assertDiff(original, modified, expected);
        });
        test('two inserted lines above', function () {
            var original = ['line'];
            var modified = ['new line', 'another new line', 'line'];
            var expected = [createLineInsertion(1, 2, 0)];
            assertDiff(original, modified, expected);
        });
        test('one inserted line in middle', function () {
            var original = ['line1', 'line2', 'line3', 'line4'];
            var modified = ['line1', 'line2', 'new line', 'line3', 'line4'];
            var expected = [createLineInsertion(3, 3, 2)];
            assertDiff(original, modified, expected);
        });
        test('two inserted lines in middle', function () {
            var original = ['line1', 'line2', 'line3', 'line4'];
            var modified = ['line1', 'line2', 'new line', 'another new line', 'line3', 'line4'];
            var expected = [createLineInsertion(3, 4, 2)];
            assertDiff(original, modified, expected);
        });
        test('two inserted lines in middle interrupted', function () {
            var original = ['line1', 'line2', 'line3', 'line4'];
            var modified = ['line1', 'line2', 'new line', 'line3', 'another new line', 'line4'];
            var expected = [createLineInsertion(3, 3, 2), createLineInsertion(5, 5, 3)];
            assertDiff(original, modified, expected);
        });
        // ---- deletions
        test('one deleted line below', function () {
            var original = ['line', 'new line'];
            var modified = ['line'];
            var expected = [createLineDeletion(2, 2, 1)];
            assertDiff(original, modified, expected);
        });
        test('two deleted lines below', function () {
            var original = ['line', 'new line', 'another new line'];
            var modified = ['line'];
            var expected = [createLineDeletion(2, 3, 1)];
            assertDiff(original, modified, expected);
        });
        test('one deleted lines above', function () {
            var original = ['new line', 'line'];
            var modified = ['line'];
            var expected = [createLineDeletion(1, 1, 0)];
            assertDiff(original, modified, expected);
        });
        test('two deleted lines above', function () {
            var original = ['new line', 'another new line', 'line'];
            var modified = ['line'];
            var expected = [createLineDeletion(1, 2, 0)];
            assertDiff(original, modified, expected);
        });
        test('one deleted line in middle', function () {
            var original = ['line1', 'line2', 'new line', 'line3', 'line4'];
            var modified = ['line1', 'line2', 'line3', 'line4'];
            var expected = [createLineDeletion(3, 3, 2)];
            assertDiff(original, modified, expected);
        });
        test('two deleted lines in middle', function () {
            var original = ['line1', 'line2', 'new line', 'another new line', 'line3', 'line4'];
            var modified = ['line1', 'line2', 'line3', 'line4'];
            var expected = [createLineDeletion(3, 4, 2)];
            assertDiff(original, modified, expected);
        });
        test('two deleted lines in middle interrupted', function () {
            var original = ['line1', 'line2', 'new line', 'line3', 'another new line', 'line4'];
            var modified = ['line1', 'line2', 'line3', 'line4'];
            var expected = [createLineDeletion(3, 3, 2), createLineDeletion(5, 5, 3)];
            assertDiff(original, modified, expected);
        });
        // ---- changes
        test('one line changed: chars inserted at the end', function () {
            var original = ['line'];
            var modified = ['line changed'];
            var expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharInsertion(1, 5, 1, 13)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars inserted at the beginning', function () {
            var original = ['line'];
            var modified = ['my line'];
            var expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharInsertion(1, 1, 1, 4)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars inserted in the middle', function () {
            var original = ['abba'];
            var modified = ['abzzba'];
            var expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharInsertion(1, 3, 1, 5)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars inserted in the middle (two spots)', function () {
            var original = ['abba'];
            var modified = ['abzzbzza'];
            var expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharInsertion(1, 3, 1, 5),
                    createCharInsertion(1, 6, 1, 8)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars deleted 1', function () {
            var original = ['abcdefg'];
            var modified = ['abcfg'];
            var expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharDeletion(1, 4, 1, 6)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars deleted 2', function () {
            var original = ['abcdefg'];
            var modified = ['acfg'];
            var expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharDeletion(1, 2, 1, 3),
                    createCharDeletion(1, 4, 1, 6)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('two lines changed 1', function () {
            var original = ['abcd', 'efgh'];
            var modified = ['abcz'];
            var expected = [
                createLineChange(1, 2, 1, 1, [
                    createCharChange(1, 4, 2, 5, 1, 4, 1, 5)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('two lines changed 2', function () {
            var original = ['foo', 'abcd', 'efgh', 'BAR'];
            var modified = ['foo', 'abcz', 'BAR'];
            var expected = [
                createLineChange(2, 3, 2, 2, [
                    createCharChange(2, 4, 3, 5, 2, 4, 2, 5)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('two lines changed 3', function () {
            var original = ['foo', 'abcd', 'efgh', 'BAR'];
            var modified = ['foo', 'abcz', 'zzzzefgh', 'BAR'];
            var expected = [
                createLineChange(2, 3, 2, 3, [
                    createCharChange(2, 4, 2, 5, 2, 4, 3, 5)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('three lines changed', function () {
            var original = ['foo', 'abcd', 'efgh', 'BAR'];
            var modified = ['foo', 'zzzefgh', 'xxx', 'BAR'];
            var expected = [
                createLineChange(2, 3, 2, 3, [
                    createCharChange(2, 1, 2, 5, 2, 1, 2, 4),
                    createCharInsertion(3, 1, 3, 4)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('big change part 1', function () {
            var original = ['foo', 'abcd', 'efgh', 'BAR'];
            var modified = ['hello', 'foo', 'zzzefgh', 'xxx', 'BAR'];
            var expected = [
                createLineInsertion(1, 1, 0),
                createLineChange(2, 3, 3, 4, [
                    createCharChange(2, 1, 2, 5, 3, 1, 3, 4),
                    createCharInsertion(4, 1, 4, 4)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('big change part 2', function () {
            var original = ['foo', 'abcd', 'efgh', 'BAR', 'RAB'];
            var modified = ['hello', 'foo', 'zzzefgh', 'xxx', 'BAR'];
            var expected = [
                createLineInsertion(1, 1, 0),
                createLineChange(2, 3, 3, 4, [
                    createCharChange(2, 1, 2, 5, 3, 1, 3, 4),
                    createCharInsertion(4, 1, 4, 4)
                ]),
                createLineDeletion(5, 5, 5)
            ];
            assertDiff(original, modified, expected);
        });
        test('char change postprocessing merges', function () {
            var original = ['abba'];
            var modified = ['azzzbzzzbzzza'];
            var expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 2, 1, 4, 1, 2, 1, 13)
                ])
            ];
            assertDiff(original, modified, expected, true);
        });
        test('ignore trim whitespace', function () {
            var original = ['\t\t foo ', 'abcd', 'efgh', '\t\t BAR\t\t'];
            var modified = ['  hello\t', '\t foo   \t', 'zzzefgh', 'xxx', '   BAR   \t'];
            var expected = [
                createLineInsertion(1, 1, 0),
                createLineChange(2, 3, 3, 4, [
                    createCharChange(2, 1, 2, 5, 3, 1, 3, 4),
                    createCharInsertion(4, 1, 4, 4)
                ])
            ];
            assertDiff(original, modified, expected, false, true);
        });
    });
});
//# sourceMappingURL=diffComputer.test.js.map