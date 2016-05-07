define(["require", "exports", 'assert', 'vs/editor/common/core/editOperation', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/common/model/model', 'vs/editor/test/common/testModes'], function (require, exports, assert, editOperation_1, position_1, range_1, editorCommon_1, model_1, testModes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // --------- utils
    function isNotABracket(model, lineNumber, column) {
        var match = model.matchBracket(new position_1.Position(lineNumber, column));
        assert.equal(match.isAccurate, true, 'is not matching brackets at ' + lineNumber + ', ' + column);
        assert.equal(match.brackets, null, 'is not matching brackets at ' + lineNumber + ', ' + column);
    }
    function isBracket(model, lineNumber1, column11, column12, lineNumber2, column21, column22) {
        var match = model.matchBracket(new position_1.Position(lineNumber1, column11));
        assert.deepEqual(match, {
            brackets: [
                new range_1.Range(lineNumber1, column11, lineNumber1, column12),
                new range_1.Range(lineNumber2, column21, lineNumber2, column22)
            ],
            isAccurate: true
        }, 'is matching brackets at ' + lineNumber1 + ', ' + column11);
    }
    function rangeEqual(range, startLineNumber, startColumn, endLineNumber, endColumn) {
        assert.deepEqual(range, new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn));
    }
    var LINE1 = 'My First Line';
    var LINE2 = '\t\tMy Second Line';
    var LINE3 = '    Third Line';
    var LINE4 = '';
    var LINE5 = '1';
    suite('Editor Model - Model', function () {
        var thisModel;
        setup(function () {
            var text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, null);
        });
        teardown(function () {
            thisModel.dispose();
        });
        // --------- insert text
        test('model getValue', function () {
            assert.equal(thisModel.getValue(), 'My First Line\n\t\tMy Second Line\n    Third Line\n\n1');
        });
        test('model insert empty text', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), '')]);
            assert.equal(thisModel.getLineCount(), 5);
            assert.equal(thisModel.getLineContent(1), 'My First Line');
        });
        test('model insert text without newline 1', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'foo ')]);
            assert.equal(thisModel.getLineCount(), 5);
            assert.equal(thisModel.getLineContent(1), 'foo My First Line');
        });
        test('model insert text without newline 2', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 3), ' foo')]);
            assert.equal(thisModel.getLineCount(), 5);
            assert.equal(thisModel.getLineContent(1), 'My foo First Line');
        });
        test('model insert text with one newline', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 3), ' new line\nNo longer')]);
            assert.equal(thisModel.getLineCount(), 6);
            assert.equal(thisModel.getLineContent(1), 'My new line');
            assert.equal(thisModel.getLineContent(2), 'No longer First Line');
        });
        test('model insert text with two newlines', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 3), ' new line\nOne more line in the middle\nNo longer')]);
            assert.equal(thisModel.getLineCount(), 7);
            assert.equal(thisModel.getLineContent(1), 'My new line');
            assert.equal(thisModel.getLineContent(2), 'One more line in the middle');
            assert.equal(thisModel.getLineContent(3), 'No longer First Line');
        });
        test('model insert text with many newlines', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 3), '\n\n\n\n')]);
            assert.equal(thisModel.getLineCount(), 9);
            assert.equal(thisModel.getLineContent(1), 'My');
            assert.equal(thisModel.getLineContent(2), '');
            assert.equal(thisModel.getLineContent(3), '');
            assert.equal(thisModel.getLineContent(4), '');
            assert.equal(thisModel.getLineContent(5), ' First Line');
        });
        // --------- insert text eventing
        test('model insert empty text does not trigger eventing', function () {
            thisModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                assert.ok(false, 'was not expecting event');
            });
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), '')]);
        });
        test('model insert text without newline eventing', function () {
            var listenerCalls = 0;
            thisModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                listenerCalls++;
                assert.equal(e.changeType, editorCommon_1.EventType.ModelContentChangedLineChanged);
                assert.equal(e.lineNumber, 1);
            });
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'foo ')]);
            assert.equal(listenerCalls, 1, 'listener calls');
        });
        test('model insert text with one newline eventing', function () {
            var listenerCalls = 0;
            var order = 0;
            thisModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                listenerCalls++;
                if (e.changeType === editorCommon_1.EventType.ModelContentChangedLineChanged) {
                    if (order === 0) {
                        assert.equal(++order, 1, 'ModelContentChangedLineChanged first');
                        assert.equal(e.lineNumber, 1, 'ModelContentChangedLineChanged line number 1');
                    }
                    else {
                        assert.equal(++order, 2, 'ModelContentChangedLineChanged first');
                        assert.equal(e.lineNumber, 1, 'ModelContentChangedLineChanged line number 1');
                    }
                }
                else if (e.changeType === editorCommon_1.EventType.ModelContentChangedLinesInserted) {
                    assert.equal(++order, 3, 'ModelContentChangedLinesInserted second');
                    assert.equal(e.fromLineNumber, 2, 'ModelContentChangedLinesInserted fromLineNumber');
                    assert.equal(e.toLineNumber, 2, 'ModelContentChangedLinesInserted toLineNumber');
                }
                else {
                    assert.ok(false);
                }
            });
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 3), ' new line\nNo longer')]);
            assert.equal(listenerCalls, 3, 'listener calls');
        });
        // --------- delete text
        test('model delete empty text', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 1))]);
            assert.equal(thisModel.getLineCount(), 5);
            assert.equal(thisModel.getLineContent(1), 'My First Line');
        });
        test('model delete text from one line', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 2))]);
            assert.equal(thisModel.getLineCount(), 5);
            assert.equal(thisModel.getLineContent(1), 'y First Line');
        });
        test('model delete text from one line 2', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'a')]);
            assert.equal(thisModel.getLineContent(1), 'aMy First Line');
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 2, 1, 4))]);
            assert.equal(thisModel.getLineCount(), 5);
            assert.equal(thisModel.getLineContent(1), 'a First Line');
        });
        test('model delete all text from a line', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 14))]);
            assert.equal(thisModel.getLineCount(), 5);
            assert.equal(thisModel.getLineContent(1), '');
        });
        test('model delete text from two lines', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 4, 2, 6))]);
            assert.equal(thisModel.getLineCount(), 4);
            assert.equal(thisModel.getLineContent(1), 'My Second Line');
        });
        test('model delete text from many lines', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 4, 3, 5))]);
            assert.equal(thisModel.getLineCount(), 3);
            assert.equal(thisModel.getLineContent(1), 'My Third Line');
        });
        test('model delete everything', function () {
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 5, 2))]);
            assert.equal(thisModel.getLineCount(), 1);
            assert.equal(thisModel.getLineContent(1), '');
        });
        // --------- delete text eventing
        test('model delete empty text does not trigger eventing', function () {
            thisModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                assert.ok(false, 'was not expecting event');
            });
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 1))]);
        });
        test('model delete text from one line eventing', function () {
            var listenerCalls = 0;
            thisModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                listenerCalls++;
                assert.equal(e.changeType, editorCommon_1.EventType.ModelContentChangedLineChanged);
                assert.equal(e.lineNumber, 1);
            });
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 2))]);
            assert.equal(listenerCalls, 1, 'listener calls');
        });
        test('model delete all text from a line eventing', function () {
            var listenerCalls = 0;
            thisModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                listenerCalls++;
                assert.equal(e.changeType, editorCommon_1.EventType.ModelContentChangedLineChanged);
                assert.equal(e.lineNumber, 1);
            });
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 14))]);
            assert.equal(listenerCalls, 1, 'listener calls');
        });
        test('model delete text from two lines eventing', function () {
            var listenerCalls = 0;
            var order = 0;
            thisModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                listenerCalls++;
                if (e.changeType === editorCommon_1.EventType.ModelContentChangedLineChanged) {
                    if (order === 0) {
                        assert.equal(++order, 1);
                        assert.equal(e.lineNumber, 1);
                    }
                    else {
                        assert.equal(++order, 2);
                        assert.equal(e.lineNumber, 1);
                    }
                }
                else if (e.changeType === editorCommon_1.EventType.ModelContentChangedLinesDeleted) {
                    assert.equal(++order, 3);
                    assert.equal(e.fromLineNumber, 2);
                    assert.equal(e.toLineNumber, 2);
                }
                else {
                    assert.ok(false);
                }
            });
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 4, 2, 6))]);
            assert.equal(listenerCalls, 3, 'listener calls');
        });
        test('model delete text from many lines eventing', function () {
            var listenerCalls = 0;
            var order = 0;
            thisModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                listenerCalls++;
                if (e.changeType === editorCommon_1.EventType.ModelContentChangedLineChanged) {
                    if (order === 0) {
                        assert.equal(++order, 1);
                        assert.equal(e.lineNumber, 1);
                    }
                    else {
                        assert.equal(++order, 2);
                        assert.equal(e.lineNumber, 1);
                    }
                }
                else if (e.changeType === editorCommon_1.EventType.ModelContentChangedLinesDeleted) {
                    assert.equal(++order, 3);
                    assert.equal(e.fromLineNumber, 2);
                    assert.equal(e.toLineNumber, 3);
                }
                else {
                    assert.ok(false);
                }
            });
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 4, 3, 5))]);
            assert.equal(listenerCalls, 3, 'listener calls');
        });
        // --------- getValueInRange
        test('getValueInRange', function () {
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 1, 1)), '');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 1, 2)), 'M');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 2, 1, 3)), 'y');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 1, 14)), 'My First Line');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 2, 1)), 'My First Line\n');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 2, 2)), 'My First Line\n\t');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 2, 3)), 'My First Line\n\t\t');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 2, 17)), 'My First Line\n\t\tMy Second Line');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 3, 1)), 'My First Line\n\t\tMy Second Line\n');
            assert.equal(thisModel.getValueInRange(new range_1.Range(1, 1, 4, 1)), 'My First Line\n\t\tMy Second Line\n    Third Line\n');
        });
        // --------- getValueLengthInRange
        test('getValueLengthInRange', function () {
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 1, 1)), ''.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 1, 2)), 'M'.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 2, 1, 3)), 'y'.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 1, 14)), 'My First Line'.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 2, 1)), 'My First Line\n'.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 2, 2)), 'My First Line\n\t'.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 2, 3)), 'My First Line\n\t\t'.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 2, 17)), 'My First Line\n\t\tMy Second Line'.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 3, 1)), 'My First Line\n\t\tMy Second Line\n'.length);
            assert.equal(thisModel.getValueLengthInRange(new range_1.Range(1, 1, 4, 1)), 'My First Line\n\t\tMy Second Line\n    Third Line\n'.length);
        });
        // --------- setValue
        test('setValue eventing', function () {
            var listenerCalls = 0;
            thisModel.addOneTimeListener(editorCommon_1.EventType.ModelContentChanged, function (e) {
                listenerCalls++;
                assert.equal(e.changeType, editorCommon_1.EventType.ModelContentChangedFlush);
                assert.deepEqual(e.detail.lines, ['new value']);
            });
            thisModel.setValue('new value');
            assert.equal(listenerCalls, 1, 'listener calls');
        });
        //	var LINE1 = 'My First Line';
        //	var LINE2 = '\t\tMy Second Line';
        //	var LINE3 = '    Third Line';
        //	var LINE4 = '';
        //	var LINE5 = '1';
    });
    // --------- Special Unicode LINE SEPARATOR character
    suite('Editor Model - Model Line Separators', function () {
        var thisModel;
        setup(function () {
            var text = LINE1 + '\u2028' +
                LINE2 + '\n' +
                LINE3 + '\u2028' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, null);
        });
        teardown(function () {
            thisModel.destroy();
        });
        test('model getValue', function () {
            assert.equal(thisModel.getValue(), 'My First Line\u2028\t\tMy Second Line\n    Third Line\u2028\n1');
        });
        test('model lines', function () {
            assert.equal(thisModel.getLineCount(), 3);
        });
        test('Bug 13333:Model should line break on lonely CR too', function () {
            var model = new model_1.Model('Hello\rWorld!\r\nAnother line', model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            assert.equal(model.getLineCount(), 3);
            assert.equal(model.getValue(), 'Hello\r\nWorld!\r\nAnother line');
            model.dispose();
        });
    });
    // --------- bracket matching
    suite('Editor Model - bracket Matching', function () {
        var thisModel;
        var bracketMode = new testModes_1.BracketMode();
        setup(function () {
            var text = 'var bar = {' + '\n' +
                'foo: {' + '\n' +
                '}, bar: {hallo: [{' + '\n' +
                '}, {' + '\n' +
                '}]}}';
            thisModel = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, bracketMode);
        });
        teardown(function () {
            thisModel.destroy();
        });
        test('Model bracket matching 1', function () {
            var brackets = [
                [1, 11, 12, 5, 4, 5],
                [1, 12, 11, 5, 4, 5],
                [5, 5, 4, 1, 11, 12],
                [2, 6, 7, 3, 1, 2],
                [2, 7, 6, 3, 1, 2],
                [3, 1, 2, 2, 6, 7],
                [3, 2, 1, 2, 6, 7],
                [3, 9, 10, 5, 3, 4],
                [3, 10, 9, 5, 3, 4],
                [5, 4, 3, 3, 9, 10],
                [3, 17, 18, 5, 2, 3],
                [3, 18, 17, 5, 2, 3],
                [5, 3, 2, 3, 17, 18],
                [3, 19, 18, 4, 1, 2],
                [4, 2, 1, 3, 18, 19],
                [4, 1, 2, 3, 18, 19],
                [4, 4, 5, 5, 1, 2],
                [4, 5, 4, 5, 1, 2],
                [5, 2, 1, 4, 4, 5],
                [5, 1, 2, 4, 4, 5]
            ];
            var i, len, b, isABracket = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} };
            for (i = 0, len = brackets.length; i < len; i++) {
                b = brackets[i];
                isBracket(thisModel, b[0], b[1], b[2], b[3], b[4], b[5]);
                isABracket[b[0]][b[1]] = true;
            }
            for (i = 1, len = thisModel.getLineCount(); i <= len; i++) {
                var line = thisModel.getLineContent(i), j, lenJ;
                for (j = 1, lenJ = line.length + 1; j <= lenJ; j++) {
                    if (!isABracket[i].hasOwnProperty(j)) {
                        isNotABracket(thisModel, i, j);
                    }
                }
            }
        });
    });
    suite('Editor Model - bracket Matching 2', function () {
        var thisModel;
        var bracketMode = new testModes_1.BracketMode();
        setup(function () {
            var text = ')]}{[(' + '\n' +
                ')]}{[(';
            thisModel = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, bracketMode);
        });
        teardown(function () {
            thisModel.destroy();
        });
        test('Model bracket matching', function () {
            isNotABracket(thisModel, 1, 1);
            isNotABracket(thisModel, 1, 2);
            isNotABracket(thisModel, 1, 3);
            isBracket(thisModel, 1, 4, 5, 2, 3, 4);
            isBracket(thisModel, 1, 5, 4, 2, 3, 4);
            isBracket(thisModel, 1, 6, 5, 2, 2, 3);
            isBracket(thisModel, 1, 7, 6, 2, 1, 2);
            isBracket(thisModel, 2, 1, 2, 1, 6, 7);
            isBracket(thisModel, 2, 2, 1, 1, 6, 7);
            isBracket(thisModel, 2, 3, 2, 1, 5, 6);
            isBracket(thisModel, 2, 4, 3, 1, 4, 5);
            isNotABracket(thisModel, 2, 5);
            isNotABracket(thisModel, 2, 6);
            isNotABracket(thisModel, 2, 7);
        });
    });
    // --------- Words
    suite('Editor Model - Words', function () {
        var thisModel;
        setup(function () {
            var text = ['This text has some  words. '];
            thisModel = new model_1.Model(text.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
        });
        teardown(function () {
            thisModel.destroy();
        });
        test('Get all words', function () {
            var words = [
                { start: 0, end: 4 },
                { start: 5, end: 9 },
                { start: 10, end: 13 },
                { start: 14, end: 18 },
                { start: 20, end: 25 },
                { start: 25, end: 26 }
            ];
            var modelWords = thisModel.getWords(1);
            for (var i = 0; i < modelWords.length; i++) {
                assert.deepEqual(modelWords[i], words[i]);
            }
        });
        test('Get word at position', function () {
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 1)), { word: 'This', startColumn: 1, endColumn: 5 });
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 2)), { word: 'This', startColumn: 1, endColumn: 5 });
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 4)), { word: 'This', startColumn: 1, endColumn: 5 });
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 5)), { word: 'This', startColumn: 1, endColumn: 5 });
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 6)), { word: 'text', startColumn: 6, endColumn: 10 });
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 19)), { word: 'some', startColumn: 15, endColumn: 19 });
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 20)), null);
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 21)), { word: 'words', startColumn: 21, endColumn: 26 });
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 26)), { word: 'words', startColumn: 21, endColumn: 26 });
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 27)), null);
            assert.deepEqual(thisModel.getWordAtPosition(new position_1.Position(1, 28)), null);
        });
    });
    // --------- Find
    suite('Editor Model - Find', function () {
        var thisModel;
        setup(function () {
            var text = [
                'This is some foo - bar text which contains foo and bar - as in Barcelona.',
                'Now it begins a word fooBar and now it is caps Foo-isn\'t this great?',
                'And here\'s a dull line with nothing interesting in it',
                'It is also interesting if it\'s part of a word like amazingFooBar',
                'Again nothing interesting here'
            ];
            thisModel = new model_1.Model(text.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
        });
        teardown(function () {
            thisModel.dispose();
        });
        test('Simple find', function () {
            var ranges = [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 22, 2, 25],
                [2, 48, 2, 51],
                [4, 59, 4, 62]
            ];
            var matches = thisModel.findMatches('foo', false, false, false, false);
            assert.equal(matches.length, ranges.length);
            for (var i = 0; i < matches.length; i++) {
                rangeEqual(matches[i], ranges[i][0], ranges[i][1], ranges[i][2], ranges[i][3]);
            }
        });
        test('Case sensitive find', function () {
            var ranges = [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 22, 2, 25]
            ];
            var matches = thisModel.findMatches('foo', false, false, true, false);
            assert.equal(matches.length, ranges.length);
            for (var i = 0; i < matches.length; i++) {
                rangeEqual(matches[i], ranges[i][0], ranges[i][1], ranges[i][2], ranges[i][3]);
            }
        });
        test('Whole words find', function () {
            var ranges = [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 48, 2, 51]
            ];
            var matches = thisModel.findMatches('foo', false, false, false, true);
            assert.equal(matches.length, ranges.length);
            for (var i = 0; i < matches.length; i++) {
                rangeEqual(matches[i], ranges[i][0], ranges[i][1], ranges[i][2], ranges[i][3]);
            }
        });
        test('/^/ find', function () {
            var ranges = [
                [1, 1, 1, 1],
                [2, 1, 2, 1],
                [3, 1, 3, 1],
                [4, 1, 4, 1],
                [5, 1, 5, 1]
            ];
            var matches = thisModel.findMatches('^', false, true, false, false);
            assert.equal(matches.length, ranges.length);
            for (var i = 0; i < matches.length; i++) {
                rangeEqual(matches[i], ranges[i][0], ranges[i][1], ranges[i][2], ranges[i][3]);
            }
        });
        test('/$/ find', function () {
            var ranges = [
                [1, 74, 1, 74],
                [2, 69, 2, 69],
                [3, 54, 3, 54],
                [4, 65, 4, 65],
                [5, 31, 5, 31]
            ];
            var matches = thisModel.findMatches('$', false, true, false, false);
            assert.equal(matches.length, ranges.length);
            for (var i = 0; i < matches.length; i++) {
                rangeEqual(matches[i], ranges[i][0], ranges[i][1], ranges[i][2], ranges[i][3]);
            }
        });
        test('/^$/ find', function () {
            var text = [
                'This is some foo - bar text which contains foo and bar - as in Barcelona.',
                '',
                'And here\'s a dull line with nothing interesting in it',
                '',
                'Again nothing interesting here'
            ];
            var model = new model_1.Model(text.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            var ranges = [
                [2, 1, 2, 1],
                [4, 1, 4, 1]
            ];
            var matches = model.findMatches('^$', false, true, false, false);
            assert.equal(matches.length, ranges.length);
            for (var i = 0; i < matches.length; i++) {
                rangeEqual(matches[i], ranges[i][0], ranges[i][1], ranges[i][2], ranges[i][3]);
            }
            model.dispose();
        });
    });
});
//# sourceMappingURL=model.test.js.map