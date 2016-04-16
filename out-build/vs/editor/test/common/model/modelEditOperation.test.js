define(["require", "exports", 'assert', 'vs/editor/common/core/range', 'vs/editor/common/model/model'], function (require, exports, assert, range_1, model_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Editor Model - Model Edit Operation', function () {
        var LINE1 = 'My First Line';
        var LINE2 = '\t\tMy Second Line';
        var LINE3 = '    Third Line';
        var LINE4 = '';
        var LINE5 = '1';
        var model;
        setup(function () {
            var text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            model = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, null);
        });
        teardown(function () {
            model.dispose();
            model = null;
        });
        function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber, selectionColumn) {
            if (selectionLineNumber === void 0) { selectionLineNumber = positionLineNumber; }
            if (selectionColumn === void 0) { selectionColumn = positionColumn; }
            var range = new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn);
            return {
                identifier: {
                    major: 0,
                    minor: 0
                },
                range: range,
                text: text,
                forceMoveMarkers: false
            };
        }
        function assertSingleEditOp(singleEditOp, editedLines) {
            var editOp = [singleEditOp];
            var inverseEditOp = model.applyEdits(editOp);
            assert.equal(model.getLineCount(), editedLines.length);
            for (var i = 0; i < editedLines.length; i++) {
                assert.equal(model.getLineContent(i + 1), editedLines[i]);
            }
            var originalOp = model.applyEdits(inverseEditOp);
            assert.equal(model.getLineCount(), 5);
            assert.equal(model.getLineContent(1), LINE1);
            assert.equal(model.getLineContent(2), LINE2);
            assert.equal(model.getLineContent(3), LINE3);
            assert.equal(model.getLineContent(4), LINE4);
            assert.equal(model.getLineContent(5), LINE5);
            assert.deepEqual(originalOp, editOp);
        }
        test('Insert inline', function () {
            assertSingleEditOp(createSingleEditOp('a', 1, 1), [
                'aMy First Line',
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/inline 1', function () {
            assertSingleEditOp(createSingleEditOp(' incredibly awesome', 1, 3), [
                'My incredibly awesome First Line',
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/inline 2', function () {
            assertSingleEditOp(createSingleEditOp(' with text at the end.', 1, 14), [
                'My First Line with text at the end.',
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/inline 3', function () {
            assertSingleEditOp(createSingleEditOp('My new First Line.', 1, 1, 1, 14), [
                'My new First Line.',
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/multi line 1', function () {
            assertSingleEditOp(createSingleEditOp('My new First Line.', 1, 1, 3, 15), [
                'My new First Line.',
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/multi line 2', function () {
            assertSingleEditOp(createSingleEditOp('My new First Line.', 1, 2, 3, 15), [
                'MMy new First Line.',
                LINE4,
                LINE5
            ]);
        });
        test('Replace inline/multi line 3', function () {
            assertSingleEditOp(createSingleEditOp('My new First Line.', 1, 2, 3, 2), [
                'MMy new First Line.   Third Line',
                LINE4,
                LINE5
            ]);
        });
        test('Replace muli line/multi line', function () {
            assertSingleEditOp(createSingleEditOp('1\n2\n3\n4\n', 1, 1), [
                '1',
                '2',
                '3',
                '4',
                LINE1,
                LINE2,
                LINE3,
                LINE4,
                LINE5
            ]);
        });
    });
});
//# sourceMappingURL=modelEditOperation.test.js.map