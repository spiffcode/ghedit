define(["require", "exports", 'assert', 'vs/editor/common/core/editOperation', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/model/model', 'vs/editor/test/common/testModes'], function (require, exports, assert, editOperation_1, position_1, range_1, model_1, testModes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // --------- utils
    function checkAndClear(highlighter, arr) {
        assert.deepEqual(highlighter.calledFor, arr);
        highlighter.calledFor = [];
    }
    function invalidEqual(model, indexArray) {
        var i, len, asHash = {};
        for (i = 0, len = indexArray.length; i < len; i++) {
            asHash[indexArray[i]] = true;
        }
        for (i = 0, len = model.getLineCount(); i < len; i++) {
            assert.equal(model._lines[i].isInvalid, asHash.hasOwnProperty(i));
        }
    }
    function stateEqual(state, content) {
        assert.equal(state.prevLineContent, content);
    }
    function statesEqual(model, states) {
        var i, len = states.length - 1;
        for (i = 0; i < len; i++) {
            stateEqual(model._lines[i].getState(), states[i]);
        }
        stateEqual(model._lastState, states[len]);
    }
    var LINE1 = '1';
    var LINE2 = '2';
    var LINE3 = '3';
    var LINE4 = '4';
    var LINE5 = '5';
    suite('Editor Model - Model Modes 1', function () {
        var thisHighlighter;
        var thisModel;
        setup(function () {
            thisHighlighter = new testModes_1.ModelMode1();
            var text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, thisHighlighter);
        });
        teardown(function () {
            thisModel.dispose();
        });
        test('model calls syntax highlighter 1', function () {
            thisModel.getLineTokens(1);
            checkAndClear(thisHighlighter, ['1']);
        });
        test('model calls syntax highlighter 2', function () {
            thisModel.getLineTokens(2);
            checkAndClear(thisHighlighter, ['1', '2']);
            thisModel.getLineTokens(2);
            checkAndClear(thisHighlighter, []);
        });
        test('model caches states', function () {
            thisModel.getLineTokens(1);
            checkAndClear(thisHighlighter, ['1']);
            thisModel.getLineTokens(2);
            checkAndClear(thisHighlighter, ['2']);
            thisModel.getLineTokens(3);
            checkAndClear(thisHighlighter, ['3']);
            thisModel.getLineTokens(4);
            checkAndClear(thisHighlighter, ['4']);
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['5']);
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, []);
        });
        test('model invalidates states for one line insert', function () {
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), '-')]);
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['-']);
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, []);
        });
        test('model invalidates states for many lines insert', function () {
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), '0\n-\n+')]);
            assert.equal(thisModel.getLineCount(), 7);
            thisModel.getLineTokens(7);
            checkAndClear(thisHighlighter, ['0', '-', '+']);
            thisModel.getLineTokens(7);
            checkAndClear(thisHighlighter, []);
        });
        test('model invalidates states for one new line', function () {
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 2), '\n')]);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(2, 1), 'a')]);
            thisModel.getLineTokens(6);
            checkAndClear(thisHighlighter, ['1', 'a']);
        });
        test('model invalidates states for one line delete', function () {
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 2), '-')]);
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['1']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 2))]);
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['-']);
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, []);
        });
        test('model invalidates states for many lines delete', function () {
            thisModel.getLineTokens(5);
            checkAndClear(thisHighlighter, ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 3, 1))]);
            thisModel.getLineTokens(3);
            checkAndClear(thisHighlighter, ['3']);
            thisModel.getLineTokens(3);
            checkAndClear(thisHighlighter, []);
        });
    });
    suite('Editor Model - Model Modes 2', function () {
        var thisHighlighter;
        var thisModel;
        setup(function () {
            thisHighlighter = new testModes_1.ModelMode2();
            var text = 'Line1' + '\r\n' +
                'Line2' + '\n' +
                'Line3' + '\n' +
                'Line4' + '\r\n' +
                'Line5';
            thisModel = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, thisHighlighter);
        });
        teardown(function () {
            thisModel.dispose();
        });
        test('getTokensForInvalidLines one text insert', function () {
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 6), '-')]);
            invalidEqual(thisModel, [0]);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', 'Line1-', 'Line2', 'Line3', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines two text insert', function () {
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([
                editOperation_1.EditOperation.insert(new position_1.Position(1, 6), '-'),
                editOperation_1.EditOperation.insert(new position_1.Position(3, 6), '-')
            ]);
            invalidEqual(thisModel, [0, 2]);
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', 'Line1-', 'Line2', 'Line3-', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines one multi-line text insert, one small text insert', function () {
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 6), '\nNew line\nAnother new line')]);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(5, 6), '-')]);
            invalidEqual(thisModel, [0, 4]);
            thisModel.getLineTokens(7);
            statesEqual(thisModel, ['', 'Line1', 'New line', 'Another new line', 'Line2', 'Line3-', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines one delete text', function () {
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 5))]);
            invalidEqual(thisModel, [0]);
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', '1', 'Line2', 'Line3', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines one line delete text', function () {
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 2, 1))]);
            invalidEqual(thisModel, [0]);
            statesEqual(thisModel, ['', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.getLineTokens(4);
            statesEqual(thisModel, ['', 'Line2', 'Line3', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines multiple lines delete text', function () {
            thisModel.getLineTokens(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 3, 3))]);
            invalidEqual(thisModel, [0]);
            statesEqual(thisModel, ['', 'Line3', 'Line4', 'Line5']);
            thisModel.getLineTokens(3);
            statesEqual(thisModel, ['', 'ne3', 'Line4', 'Line5']);
        });
    });
    suite('Editor Model - Token Iterator', function () {
        var thisModel;
        setup(function () {
            var nmode = new testModes_1.NMode(3);
            var text = 'foobarfoobar' + '\r\n' +
                'foobarfoobar' + '\r\n' +
                'foobarfoobar' + '\r\n';
            thisModel = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, nmode);
        });
        teardown(function () {
            thisModel.dispose();
        });
        test('all tokens with ranges', function () {
            var calls = 0;
            var ranges = [
                [1, 4, 4, 7, 7, 10, 10, 13],
                [1, 4, 4, 7, 7, 10, 10, 13],
                [1, 4, 4, 7, 7, 10, 10, 13],
            ];
            thisModel.tokenIterator(new position_1.Position(1, 1), function (iter) {
                var a = [], line = 0;
                while (iter.hasNext()) {
                    calls++;
                    if (a.length === 0) {
                        a = ranges.shift();
                        line += 1;
                    }
                    var next = iter.next();
                    assert.equal(next.lineNumber, line);
                    assert.equal(next.startColumn, a.shift());
                    assert.equal(next.endColumn, a.shift());
                }
            });
            assert.equal(calls, 12, 'calls');
        });
        test('all tokens from beginning with next', function () {
            var n = 0;
            thisModel.tokenIterator(new position_1.Position(1, 1), function (iter) {
                while (iter.hasNext()) {
                    iter.next();
                    n++;
                }
            });
            assert.equal(n, 12);
        });
        test('all tokens from beginning with prev', function () {
            var n = 0;
            thisModel.tokenIterator(new position_1.Position(1, 1), function (iter) {
                while (iter.hasPrev()) {
                    iter.prev();
                    n++;
                }
            });
            assert.equal(n, 1);
        });
        test('all tokens from end with prev', function () {
            var n = 0;
            thisModel.tokenIterator(new position_1.Position(3, 12), function (iter) {
                while (iter.hasPrev()) {
                    iter.prev();
                    n++;
                }
            });
            assert.equal(n, 12);
        });
        test('all tokens from end with next', function () {
            var n = 0;
            thisModel.tokenIterator(new position_1.Position(3, 12), function (iter) {
                while (iter.hasNext()) {
                    iter.next();
                    n++;
                }
            });
            assert.equal(n, 1);
        });
        test('prev and next are assert.equal at start', function () {
            var calls = 0;
            thisModel.tokenIterator(new position_1.Position(1, 2), function (iter) {
                calls++;
                var next = iter.next();
                var prev = iter.prev();
                assert.deepEqual(next, prev);
            });
            assert.equal(calls, 1, 'calls');
        });
        test('position variance within token', function () {
            var calls = 0;
            thisModel.tokenIterator(new position_1.Position(1, 4), function (iter) {
                calls++;
                var next = iter.next();
                assert.equal(next.lineNumber, 1);
                assert.equal(next.startColumn, 4);
                assert.equal(next.endColumn, 7);
            });
            thisModel.tokenIterator(new position_1.Position(1, 5), function (iter) {
                calls++;
                var next = iter.next();
                assert.equal(next.lineNumber, 1);
                assert.equal(next.startColumn, 4);
                assert.equal(next.endColumn, 7);
            });
            thisModel.tokenIterator(new position_1.Position(1, 6), function (iter) {
                calls++;
                var next = iter.next();
                assert.equal(next.lineNumber, 1);
                assert.equal(next.startColumn, 4);
                assert.equal(next.endColumn, 7);
            });
            assert.equal(calls, 3, 'calls');
        });
        test('iterator allows next/prev', function () {
            var n = 0;
            var up = [], down = [];
            thisModel.tokenIterator(new position_1.Position(1, 1), function (iter) {
                while (iter.hasNext()) {
                    var next = iter.next();
                    up.push(next);
                    n++;
                }
                while (iter.hasPrev()) {
                    var prev = iter.prev();
                    down.push(prev);
                    n++;
                }
            });
            assert.equal(n, 24);
            assert.equal(up.length, 12);
            assert.equal(down.length, 12);
            while (up.length) {
                assert.deepEqual(up.pop(), down.shift());
            }
        });
        test('iterator allows prev/next', function () {
            var n = 0;
            var up = [], down = [];
            thisModel.tokenIterator(new position_1.Position(3, 12), function (iter) {
                while (iter.hasPrev()) {
                    var prev = iter.prev();
                    down.push(prev);
                    n++;
                }
                while (iter.hasNext()) {
                    var next = iter.next();
                    up.push(next);
                    n++;
                }
            });
            assert.equal(n, 24);
            assert.equal(up.length, 12);
            assert.equal(down.length, 12);
            while (up.length) {
                assert.deepEqual(up.pop(), down.shift());
            }
        });
        test('iterator can not be used outside of callback', function () {
            var illegalIterReference;
            thisModel.tokenIterator(new position_1.Position(3, 12), function (iter) {
                illegalIterReference = iter;
            });
            try {
                illegalIterReference.hasNext();
                assert.ok(false);
            }
            catch (e) {
                assert.ok(true);
            }
            try {
                illegalIterReference.next();
                assert.ok(false);
            }
            catch (e) {
                assert.ok(true);
            }
            try {
                illegalIterReference.hasPrev();
                assert.ok(false);
            }
            catch (e) {
                assert.ok(true);
            }
            try {
                illegalIterReference.prev();
                assert.ok(false);
            }
            catch (e) {
                assert.ok(true);
            }
        });
    });
});
//# sourceMappingURL=model.modes.test.js.map