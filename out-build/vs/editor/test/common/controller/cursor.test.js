var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/editor/common/controller/cursor', 'vs/editor/common/core/editOperation', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/core/selection', 'vs/editor/common/editorCommon', 'vs/editor/common/model/model', 'vs/editor/common/modes', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/test/common/mocks/mockConfiguration', 'vs/editor/test/common/testModes'], function (require, exports, assert, cursor_1, editOperation_1, position_1, range_1, selection_1, editorCommon_1, model_1, modes_1, richEditSupport_1, mockConfiguration_1, testModes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var H = editorCommon_1.Handler;
    // --------- utils
    function cursorCommand(cursor, command, extraData, sizeProvider, overwriteSource) {
        if (sizeProvider) {
            cursor.configuration.editor.pageSize = sizeProvider.pageSize;
        }
        cursor.configuration.handlerDispatcher.trigger(overwriteSource || 'tests', command, extraData);
    }
    function moveTo(cursor, lineNumber, column, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.MoveToSelect : H.MoveTo, { position: new position_1.Position(lineNumber, column) });
    }
    function moveLeft(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorLeftSelect : H.CursorLeft);
    }
    function moveWordLeft(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorWordLeftSelect : H.CursorWordLeft);
    }
    function moveWordStartLeft(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorWordStartLeftSelect : H.CursorWordStartLeft);
    }
    function moveWordEndLeft(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorWordEndLeftSelect : H.CursorWordEndLeft);
    }
    function moveRight(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorRightSelect : H.CursorRight);
    }
    function moveWordRight(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorWordRightSelect : H.CursorWordRight);
    }
    function moveWordEndRight(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorWordEndRightSelect : H.CursorWordEndRight);
    }
    function moveWordStartRight(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorWordStartRightSelect : H.CursorWordStartRight);
    }
    function moveDown(cursor, linesCount, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (linesCount === 1) {
            cursorCommand(cursor, inSelectionMode ? H.CursorDownSelect : H.CursorDown);
        }
        else {
            cursorCommand(cursor, inSelectionMode ? H.CursorPageDownSelect : H.CursorPageDown, null, { pageSize: linesCount });
        }
    }
    function moveUp(cursor, linesCount, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (linesCount === 1) {
            cursorCommand(cursor, inSelectionMode ? H.CursorUpSelect : H.CursorUp);
        }
        else {
            cursorCommand(cursor, inSelectionMode ? H.CursorPageUpSelect : H.CursorPageUp, null, { pageSize: linesCount });
        }
    }
    function moveToBeginningOfLine(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorHomeSelect : H.CursorHome);
    }
    function moveToEndOfLine(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorEndSelect : H.CursorEnd);
    }
    function moveToBeginningOfBuffer(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorTopSelect : H.CursorTop);
    }
    function moveToEndOfBuffer(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        cursorCommand(cursor, inSelectionMode ? H.CursorBottomSelect : H.CursorBottom);
    }
    function deleteWordLeft(cursor) {
        cursorCommand(cursor, H.DeleteWordLeft);
    }
    function deleteWordStartLeft(cursor) {
        cursorCommand(cursor, H.DeleteWordStartLeft);
    }
    function deleteWordEndLeft(cursor) {
        cursorCommand(cursor, H.DeleteWordEndLeft);
    }
    function deleteWordRight(cursor) {
        cursorCommand(cursor, H.DeleteWordRight);
    }
    function deleteWordStartRight(cursor) {
        cursorCommand(cursor, H.DeleteWordStartRight);
    }
    function deleteWordEndRight(cursor) {
        cursorCommand(cursor, H.DeleteWordEndRight);
    }
    function positionEqual(position, lineNumber, column) {
        assert.deepEqual({
            lineNumber: position.lineNumber,
            column: position.column
        }, {
            lineNumber: lineNumber,
            column: column
        }, 'position equal');
    }
    function selectionEqual(selection, posLineNumber, posColumn, selLineNumber, selColumn) {
        assert.deepEqual({
            selectionStartLineNumber: selection.selectionStartLineNumber,
            selectionStartColumn: selection.selectionStartColumn,
            positionLineNumber: selection.positionLineNumber,
            positionColumn: selection.positionColumn
        }, {
            selectionStartLineNumber: selLineNumber,
            selectionStartColumn: selColumn,
            positionLineNumber: posLineNumber,
            positionColumn: posColumn
        }, 'selection equal');
    }
    function cursorEqual(cursor, posLineNumber, posColumn, selLineNumber, selColumn) {
        if (selLineNumber === void 0) { selLineNumber = posLineNumber; }
        if (selColumn === void 0) { selColumn = posColumn; }
        positionEqual(cursor.getPosition(), posLineNumber, posColumn);
        selectionEqual(cursor.getSelection(), posLineNumber, posColumn, selLineNumber, selColumn);
    }
    function cursorEquals(cursor, selections) {
        var actual = cursor.getSelections().map(function (s) { return s.toString(); });
        var expected = selections.map(function (s) { return s.toString(); });
        assert.deepEqual(actual, expected);
    }
    suite('Editor Controller - Cursor', function () {
        var LINE1 = '    \tMy First Line\t ';
        var LINE2 = '\tMy Second Line';
        var LINE3 = '    Third Line💩';
        var LINE4 = '';
        var LINE5 = '1';
        var thisModel;
        var thisConfiguration;
        var thisCursor;
        setup(function () {
            var text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = new model_1.Model(text, model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            thisConfiguration = new mockConfiguration_1.MockConfiguration(null);
            thisCursor = new cursor_1.Cursor(1, thisConfiguration, thisModel, null, false);
        });
        teardown(function () {
            thisCursor.dispose();
            thisModel.dispose();
            thisConfiguration.dispose();
        });
        test('cursor initialized', function () {
            cursorEqual(thisCursor, 1, 1);
        });
        // --------- absolute move
        test('no move', function () {
            moveTo(thisCursor, 1, 1);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move', function () {
            moveTo(thisCursor, 1, 2);
            cursorEqual(thisCursor, 1, 2);
        });
        test('move in selection mode', function () {
            moveTo(thisCursor, 1, 2, true);
            cursorEqual(thisCursor, 1, 2, 1, 1);
        });
        test('move beyond line end', function () {
            moveTo(thisCursor, 1, 25);
            cursorEqual(thisCursor, 1, LINE1.length + 1);
        });
        test('move empty line', function () {
            moveTo(thisCursor, 4, 20);
            cursorEqual(thisCursor, 4, 1);
        });
        test('move one char line', function () {
            moveTo(thisCursor, 5, 20);
            cursorEqual(thisCursor, 5, 2);
        });
        test('selection down', function () {
            moveTo(thisCursor, 2, 1, true);
            cursorEqual(thisCursor, 2, 1, 1, 1);
        });
        test('move and then select', function () {
            moveTo(thisCursor, 2, 3);
            cursorEqual(thisCursor, 2, 3);
            moveTo(thisCursor, 2, 15, true);
            cursorEqual(thisCursor, 2, 15, 2, 3);
            moveTo(thisCursor, 1, 2, true);
            cursorEqual(thisCursor, 1, 2, 2, 3);
        });
        // --------- move left
        test('move left on top left position', function () {
            moveLeft(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move left', function () {
            moveTo(thisCursor, 1, 3);
            cursorEqual(thisCursor, 1, 3);
            moveLeft(thisCursor);
            cursorEqual(thisCursor, 1, 2);
        });
        test('move left with surrogate pair', function () {
            moveTo(thisCursor, 3, 17);
            cursorEqual(thisCursor, 3, 17);
            moveLeft(thisCursor);
            cursorEqual(thisCursor, 3, 15);
        });
        test('move left goes to previous row', function () {
            moveTo(thisCursor, 2, 1);
            cursorEqual(thisCursor, 2, 1);
            moveLeft(thisCursor);
            cursorEqual(thisCursor, 1, 21);
        });
        test('move left selection', function () {
            moveTo(thisCursor, 2, 1);
            cursorEqual(thisCursor, 2, 1);
            moveLeft(thisCursor, true);
            cursorEqual(thisCursor, 1, 21, 2, 1);
        });
        // --------- move word left
        test('move word left', function () {
            moveTo(thisCursor, 5, 2);
            var expectedStops = [
                [5, 1],
                [4, 1],
                [3, 11],
                [3, 5],
                [3, 1],
                [2, 12],
                [2, 5],
                [2, 2],
                [2, 1],
                [1, 15],
                [1, 9],
                [1, 6],
                [1, 1],
                [1, 1],
            ];
            var actualStops = [];
            for (var i = 0; i < expectedStops.length; i++) {
                moveWordLeft(thisCursor);
                var pos = thisCursor.getPosition();
                actualStops.push([pos.lineNumber, pos.column]);
            }
            assert.deepEqual(actualStops, expectedStops);
        });
        test('move word left selection', function () {
            moveTo(thisCursor, 5, 2);
            cursorEqual(thisCursor, 5, 2);
            moveWordLeft(thisCursor, true);
            cursorEqual(thisCursor, 5, 1, 5, 2);
        });
        // --------- move right
        test('move right on bottom right position', function () {
            moveTo(thisCursor, 5, 2);
            cursorEqual(thisCursor, 5, 2);
            moveRight(thisCursor);
            cursorEqual(thisCursor, 5, 2);
        });
        test('move right', function () {
            moveTo(thisCursor, 1, 3);
            cursorEqual(thisCursor, 1, 3);
            moveRight(thisCursor);
            cursorEqual(thisCursor, 1, 4);
        });
        test('move right with surrogate pair', function () {
            moveTo(thisCursor, 3, 15);
            cursorEqual(thisCursor, 3, 15);
            moveRight(thisCursor);
            cursorEqual(thisCursor, 3, 17);
        });
        test('move right goes to next row', function () {
            moveTo(thisCursor, 1, 21);
            cursorEqual(thisCursor, 1, 21);
            moveRight(thisCursor);
            cursorEqual(thisCursor, 2, 1);
        });
        test('move right selection', function () {
            moveTo(thisCursor, 1, 21);
            cursorEqual(thisCursor, 1, 21);
            moveRight(thisCursor, true);
            cursorEqual(thisCursor, 2, 1, 1, 21);
        });
        // --------- move word right
        test('move word right', function () {
            moveTo(thisCursor, 1, 1);
            var expectedStops = [
                [1, 8],
                [1, 14],
                [1, 19],
                [1, 21],
                [2, 4],
                [2, 11],
                [2, 16],
                [3, 10],
                [3, 17],
                [4, 1],
                [5, 2],
                [5, 2],
            ];
            var actualStops = [];
            for (var i = 0; i < expectedStops.length; i++) {
                moveWordRight(thisCursor);
                var pos = thisCursor.getPosition();
                actualStops.push([pos.lineNumber, pos.column]);
            }
            assert.deepEqual(actualStops, expectedStops);
        });
        test('move word right selection', function () {
            moveTo(thisCursor, 1, 1);
            cursorEqual(thisCursor, 1, 1);
            moveWordRight(thisCursor, true);
            cursorEqual(thisCursor, 1, 8, 1, 1);
        });
        // --------- move down
        test('move down', function () {
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 2, 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 3, 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 4, 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 5, 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 5, 2);
        });
        test('move down with selection', function () {
            moveDown(thisCursor, 1, true);
            cursorEqual(thisCursor, 2, 1, 1, 1);
            moveDown(thisCursor, 1, true);
            cursorEqual(thisCursor, 3, 1, 1, 1);
            moveDown(thisCursor, 1, true);
            cursorEqual(thisCursor, 4, 1, 1, 1);
            moveDown(thisCursor, 1, true);
            cursorEqual(thisCursor, 5, 1, 1, 1);
            moveDown(thisCursor, 1, true);
            cursorEqual(thisCursor, 5, 2, 1, 1);
        });
        test('move down with tabs', function () {
            moveTo(thisCursor, 1, 5);
            cursorEqual(thisCursor, 1, 5);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 2, 2);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 3, 5);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 4, 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 5, 2);
        });
        // --------- move up
        test('move up', function () {
            moveTo(thisCursor, 3, 5);
            cursorEqual(thisCursor, 3, 5);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 2, 2);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 1, 5);
        });
        test('move up with selection', function () {
            moveTo(thisCursor, 3, 5);
            cursorEqual(thisCursor, 3, 5);
            moveUp(thisCursor, 1, true);
            cursorEqual(thisCursor, 2, 2, 3, 5);
            moveUp(thisCursor, 1, true);
            cursorEqual(thisCursor, 1, 5, 3, 5);
        });
        test('move up and down with tabs', function () {
            moveTo(thisCursor, 1, 5);
            cursorEqual(thisCursor, 1, 5);
            moveDown(thisCursor, 4);
            cursorEqual(thisCursor, 5, 2);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 4, 1);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 3, 5);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 2, 2);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 1, 5);
        });
        test('move up and down with end of lines starting from a long one', function () {
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, LINE1.length - 1);
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, LINE1.length + 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 2, LINE2.length + 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 3, LINE3.length + 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 4, LINE4.length + 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 5, LINE5.length + 1);
            moveUp(thisCursor, 4);
            cursorEqual(thisCursor, 1, LINE1.length + 1);
        });
        // --------- move to beginning of line
        test('move to beginning of line', function () {
            moveToBeginningOfLine(thisCursor);
            cursorEqual(thisCursor, 1, 6);
            moveToBeginningOfLine(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move to beginning of line from within line', function () {
            moveTo(thisCursor, 1, 8);
            moveToBeginningOfLine(thisCursor);
            cursorEqual(thisCursor, 1, 6);
            moveToBeginningOfLine(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move to beginning of line from whitespace at beginning of line', function () {
            moveTo(thisCursor, 1, 2);
            moveToBeginningOfLine(thisCursor);
            cursorEqual(thisCursor, 1, 1);
            moveToBeginningOfLine(thisCursor);
            cursorEqual(thisCursor, 1, 6);
        });
        test('move to beginning of line from within line selection', function () {
            moveTo(thisCursor, 1, 8);
            moveToBeginningOfLine(thisCursor, true);
            cursorEqual(thisCursor, 1, 6, 1, 8);
            moveToBeginningOfLine(thisCursor, true);
            cursorEqual(thisCursor, 1, 1, 1, 8);
        });
        // --------- move to end of line
        test('move to end of line', function () {
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, LINE1.length - 1);
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, LINE1.length + 1);
        });
        test('move to end of line from within line', function () {
            moveTo(thisCursor, 1, 6);
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, LINE1.length - 1);
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, LINE1.length + 1);
        });
        test('move to end of line from whitespace at end of line', function () {
            moveTo(thisCursor, 1, 20);
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, LINE1.length + 1);
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, LINE1.length - 1);
        });
        test('move to end of line from within line selection', function () {
            moveTo(thisCursor, 1, 6);
            moveToEndOfLine(thisCursor, true);
            cursorEqual(thisCursor, 1, LINE1.length - 1, 1, 6);
            moveToEndOfLine(thisCursor, true);
            cursorEqual(thisCursor, 1, LINE1.length + 1, 1, 6);
        });
        // --------- move to beginning of buffer
        test('move to beginning of buffer', function () {
            moveToBeginningOfBuffer(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move to beginning of buffer from within first line', function () {
            moveTo(thisCursor, 1, 3);
            moveToBeginningOfBuffer(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move to beginning of buffer from within another line', function () {
            moveTo(thisCursor, 3, 3);
            moveToBeginningOfBuffer(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move to beginning of buffer from within first line selection', function () {
            moveTo(thisCursor, 1, 3);
            moveToBeginningOfBuffer(thisCursor, true);
            cursorEqual(thisCursor, 1, 1, 1, 3);
        });
        test('move to beginning of buffer from within another line selection', function () {
            moveTo(thisCursor, 3, 3);
            moveToBeginningOfBuffer(thisCursor, true);
            cursorEqual(thisCursor, 1, 1, 3, 3);
        });
        // --------- move to end of buffer
        test('move to end of buffer', function () {
            moveToEndOfBuffer(thisCursor);
            cursorEqual(thisCursor, 5, LINE5.length + 1);
        });
        test('move to end of buffer from within last line', function () {
            moveTo(thisCursor, 5, 1);
            moveToEndOfBuffer(thisCursor);
            cursorEqual(thisCursor, 5, LINE5.length + 1);
        });
        test('move to end of buffer from within another line', function () {
            moveTo(thisCursor, 3, 3);
            moveToEndOfBuffer(thisCursor);
            cursorEqual(thisCursor, 5, LINE5.length + 1);
        });
        test('move to end of buffer from within last line selection', function () {
            moveTo(thisCursor, 5, 1);
            moveToEndOfBuffer(thisCursor, true);
            cursorEqual(thisCursor, 5, LINE5.length + 1, 5, 1);
        });
        test('move to end of buffer from within another line selection', function () {
            moveTo(thisCursor, 3, 3);
            moveToEndOfBuffer(thisCursor, true);
            cursorEqual(thisCursor, 5, LINE5.length + 1, 3, 3);
        });
        // --------- delete word left/right
        test('delete word left for non-empty selection', function () {
            moveTo(thisCursor, 3, 7);
            moveRight(thisCursor, true);
            moveRight(thisCursor, true);
            deleteWordLeft(thisCursor);
            assert.equal(thisModel.getLineContent(3), '    Thd Line💩');
            cursorEqual(thisCursor, 3, 7);
        });
        test('delete word left for caret at beginning of document', function () {
            moveTo(thisCursor, 1, 1);
            deleteWordLeft(thisCursor);
            assert.equal(thisModel.getLineContent(1), '    \tMy First Line\t ');
            cursorEqual(thisCursor, 1, 1);
        });
        test('delete word left for caret at end of whitespace', function () {
            moveTo(thisCursor, 3, 11);
            deleteWordLeft(thisCursor);
            assert.equal(thisModel.getLineContent(3), '    Line💩');
            cursorEqual(thisCursor, 3, 5);
        });
        test('delete word left for caret just behind a word', function () {
            moveTo(thisCursor, 2, 11);
            deleteWordLeft(thisCursor);
            assert.equal(thisModel.getLineContent(2), '\tMy  Line');
            cursorEqual(thisCursor, 2, 5);
        });
        test('delete word left for caret inside of a word', function () {
            moveTo(thisCursor, 1, 12);
            deleteWordLeft(thisCursor);
            assert.equal(thisModel.getLineContent(1), '    \tMy st Line\t ');
            cursorEqual(thisCursor, 1, 9);
        });
        test('delete word right for non-empty selection', function () {
            moveTo(thisCursor, 3, 7);
            moveRight(thisCursor, true);
            moveRight(thisCursor, true);
            deleteWordRight(thisCursor);
            assert.equal(thisModel.getLineContent(3), '    Thd Line💩');
            cursorEqual(thisCursor, 3, 7);
        });
        test('delete word right for caret at end of document', function () {
            moveTo(thisCursor, 5, 3);
            deleteWordRight(thisCursor);
            assert.equal(thisModel.getLineContent(5), '1');
            cursorEqual(thisCursor, 5, 2);
        });
        test('delete word right for caret at beggining of whitespace', function () {
            moveTo(thisCursor, 3, 1);
            deleteWordRight(thisCursor);
            assert.equal(thisModel.getLineContent(3), 'Third Line💩');
            cursorEqual(thisCursor, 3, 1);
        });
        test('delete word right for caret just before a word', function () {
            moveTo(thisCursor, 2, 5);
            deleteWordRight(thisCursor);
            assert.equal(thisModel.getLineContent(2), '\tMy  Line');
            cursorEqual(thisCursor, 2, 5);
        });
        test('delete word right for caret inside of a word', function () {
            moveTo(thisCursor, 1, 11);
            deleteWordRight(thisCursor);
            assert.equal(thisModel.getLineContent(1), '    \tMy Fi Line\t ');
            cursorEqual(thisCursor, 1, 11);
        });
        // --------- misc
        test('select all', function () {
            cursorCommand(thisCursor, H.SelectAll);
            cursorEqual(thisCursor, 5, LINE5.length + 1, 1, 1);
        });
        test('expandLineSelection', function () {
            //              0          1         2
            //              01234 56789012345678 0
            // let LINE1 = '    \tMy First Line\t ';
            moveTo(thisCursor, 1, 1);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 1, LINE1.length + 1, 1, 1);
            moveTo(thisCursor, 1, 2);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 1, LINE1.length + 1, 1, 1);
            moveTo(thisCursor, 1, 5);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 1, LINE1.length + 1, 1, 1);
            moveTo(thisCursor, 1, 19);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 1, LINE1.length + 1, 1, 1);
            moveTo(thisCursor, 1, 20);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 1, LINE1.length + 1, 1, 1);
            moveTo(thisCursor, 1, 21);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 1, LINE1.length + 1, 1, 1);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 2, LINE2.length + 1, 1, 1);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 3, LINE3.length + 1, 1, 1);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 4, LINE4.length + 1, 1, 1);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 5, LINE5.length + 1, 1, 1);
            cursorCommand(thisCursor, H.ExpandLineSelection);
            cursorEqual(thisCursor, 5, LINE5.length + 1, 1, 1);
        });
        // --------- eventing
        test('no move doesn\'t trigger event', function () {
            thisCursor.addListener(editorCommon_1.EventType.CursorPositionChanged, function (e) {
                assert.ok(false, 'was not expecting event');
            });
            thisCursor.addListener(editorCommon_1.EventType.CursorSelectionChanged, function (e) {
                assert.ok(false, 'was not expecting event');
            });
            moveTo(thisCursor, 1, 1);
        });
        test('move eventing', function () {
            var events = 0;
            thisCursor.addListener(editorCommon_1.EventType.CursorPositionChanged, function (e) {
                events++;
                positionEqual(e.position, 1, 2);
            });
            thisCursor.addListener(editorCommon_1.EventType.CursorSelectionChanged, function (e) {
                events++;
                selectionEqual(e.selection, 1, 2, 1, 2);
            });
            moveTo(thisCursor, 1, 2);
            assert.equal(events, 2, 'receives 2 events');
        });
        test('move in selection mode eventing', function () {
            var events = 0;
            thisCursor.addListener(editorCommon_1.EventType.CursorPositionChanged, function (e) {
                events++;
                positionEqual(e.position, 1, 2);
            });
            thisCursor.addListener(editorCommon_1.EventType.CursorSelectionChanged, function (e) {
                events++;
                selectionEqual(e.selection, 1, 2, 1, 1);
            });
            moveTo(thisCursor, 1, 2, true);
            assert.equal(events, 2, 'receives 2 events');
        });
        // --------- state save & restore
        test('saveState & restoreState', function () {
            moveTo(thisCursor, 2, 1, true);
            cursorEqual(thisCursor, 2, 1, 1, 1);
            var savedState = JSON.stringify(thisCursor.saveState());
            moveTo(thisCursor, 1, 1, false);
            cursorEqual(thisCursor, 1, 1);
            thisCursor.restoreState(JSON.parse(savedState));
            cursorEqual(thisCursor, 2, 1, 1, 1);
        });
        // --------- updating cursor
        test('Independent model edit 1', function () {
            moveTo(thisCursor, 2, 16, true);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(2, 1, 2, 2))]);
            cursorEqual(thisCursor, 2, 15, 1, 1);
        });
        test('column select 1', function () {
            var model = new model_1.Model([
                '\tprivate compute(a:number): boolean {',
                '\t\tif (a + 3 === 0 || a + 5 === 0) {',
                '\t\t\treturn false;',
                '\t\t}',
                '\t}'
            ].join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            var cursor = new cursor_1.Cursor(1, new mockConfiguration_1.MockConfiguration(null), model, null, true);
            moveTo(cursor, 1, 7, false);
            cursorEqual(cursor, 1, 7);
            cursorCommand(cursor, H.ColumnSelect, {
                position: new position_1.Position(4, 4),
                viewPosition: new position_1.Position(4, 4),
                mouseColumn: 15
            });
            var expectedSelections = [
                new selection_1.Selection(1, 7, 1, 12),
                new selection_1.Selection(2, 4, 2, 9),
                new selection_1.Selection(3, 3, 3, 6),
                new selection_1.Selection(4, 4, 4, 4),
            ];
            cursorEquals(cursor, expectedSelections);
            cursor.dispose();
            model.dispose();
        });
        test('issue #4905 - column select is biased to the right', function () {
            var model = new model_1.Model([
                'var gulp = require("gulp");',
                'var path = require("path");',
                'var rimraf = require("rimraf");',
                'var isarray = require("isarray");',
                'var merge = require("merge-stream");',
                'var concat = require("gulp-concat");',
                'var newer = require("gulp-newer");',
            ].join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            var cursor = new cursor_1.Cursor(1, new mockConfiguration_1.MockConfiguration(null), model, null, true);
            moveTo(cursor, 1, 4, false);
            cursorEqual(cursor, 1, 4);
            cursorCommand(cursor, H.ColumnSelect, {
                position: new position_1.Position(4, 1),
                viewPosition: new position_1.Position(4, 1),
                mouseColumn: 1
            });
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 1),
                new selection_1.Selection(2, 4, 2, 1),
                new selection_1.Selection(3, 4, 3, 1),
                new selection_1.Selection(4, 4, 4, 1),
            ]);
            cursor.dispose();
            model.dispose();
        });
        test('column select with keyboard', function () {
            var model = new model_1.Model([
                'var gulp = require("gulp");',
                'var path = require("path");',
                'var rimraf = require("rimraf");',
                'var isarray = require("isarray");',
                'var merge = require("merge-stream");',
                'var concat = require("gulp-concat");',
                'var newer = require("gulp-newer");',
            ].join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            var cursor = new cursor_1.Cursor(1, new mockConfiguration_1.MockConfiguration(null), model, null, true);
            moveTo(cursor, 1, 4, false);
            cursorEqual(cursor, 1, 4);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 5)
            ]);
            cursorCommand(cursor, H.CursorColumnSelectDown);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 5),
                new selection_1.Selection(2, 4, 2, 5)
            ]);
            cursorCommand(cursor, H.CursorColumnSelectDown);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 5),
                new selection_1.Selection(2, 4, 2, 5),
                new selection_1.Selection(3, 4, 3, 5),
            ]);
            cursorCommand(cursor, H.CursorColumnSelectDown);
            cursorCommand(cursor, H.CursorColumnSelectDown);
            cursorCommand(cursor, H.CursorColumnSelectDown);
            cursorCommand(cursor, H.CursorColumnSelectDown);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 5),
                new selection_1.Selection(2, 4, 2, 5),
                new selection_1.Selection(3, 4, 3, 5),
                new selection_1.Selection(4, 4, 4, 5),
                new selection_1.Selection(5, 4, 5, 5),
                new selection_1.Selection(6, 4, 6, 5),
                new selection_1.Selection(7, 4, 7, 5),
            ]);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 6),
                new selection_1.Selection(2, 4, 2, 6),
                new selection_1.Selection(3, 4, 3, 6),
                new selection_1.Selection(4, 4, 4, 6),
                new selection_1.Selection(5, 4, 5, 6),
                new selection_1.Selection(6, 4, 6, 6),
                new selection_1.Selection(7, 4, 7, 6),
            ]);
            // 10 times
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 16),
                new selection_1.Selection(2, 4, 2, 16),
                new selection_1.Selection(3, 4, 3, 16),
                new selection_1.Selection(4, 4, 4, 16),
                new selection_1.Selection(5, 4, 5, 16),
                new selection_1.Selection(6, 4, 6, 16),
                new selection_1.Selection(7, 4, 7, 16),
            ]);
            // 10 times
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 26),
                new selection_1.Selection(2, 4, 2, 26),
                new selection_1.Selection(3, 4, 3, 26),
                new selection_1.Selection(4, 4, 4, 26),
                new selection_1.Selection(5, 4, 5, 26),
                new selection_1.Selection(6, 4, 6, 26),
                new selection_1.Selection(7, 4, 7, 26),
            ]);
            // 2 times => reaching the ending of lines 1 and 2
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 28),
                new selection_1.Selection(4, 4, 4, 28),
                new selection_1.Selection(5, 4, 5, 28),
                new selection_1.Selection(6, 4, 6, 28),
                new selection_1.Selection(7, 4, 7, 28),
            ]);
            // 4 times => reaching the ending of line 3
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 32),
                new selection_1.Selection(5, 4, 5, 32),
                new selection_1.Selection(6, 4, 6, 32),
                new selection_1.Selection(7, 4, 7, 32),
            ]);
            // 2 times => reaching the ending of line 4
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 34),
                new selection_1.Selection(6, 4, 6, 34),
                new selection_1.Selection(7, 4, 7, 34),
            ]);
            // 1 time => reaching the ending of line 7
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 35),
                new selection_1.Selection(6, 4, 6, 35),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            // 3 times => reaching the ending of lines 5 & 6
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 37),
                new selection_1.Selection(6, 4, 6, 37),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            // cannot go anywhere anymore
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 37),
                new selection_1.Selection(6, 4, 6, 37),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            // cannot go anywhere anymore even if we insist
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorCommand(cursor, H.CursorColumnSelectRight);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 37),
                new selection_1.Selection(6, 4, 6, 37),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            // can easily go back
            cursorCommand(cursor, H.CursorColumnSelectLeft);
            cursorEquals(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 36),
                new selection_1.Selection(6, 4, 6, 36),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            cursor.dispose();
            model.dispose();
        });
    });
    var TestMode = (function () {
        function TestMode() {
        }
        TestMode.prototype.getId = function () {
            return 'testing';
        };
        TestMode.prototype.toSimplifiedMode = function () {
            return this;
        };
        return TestMode;
    }());
    var SurroundingMode = (function (_super) {
        __extends(SurroundingMode, _super);
        function SurroundingMode() {
            _super.call(this);
            this.richEditSupport = new richEditSupport_1.RichEditSupport(this.getId(), null, {
                __characterPairSupport: {
                    autoClosingPairs: [{ open: '(', close: ')' }]
                }
            });
        }
        return SurroundingMode;
    }(TestMode));
    var OnEnterMode = (function (_super) {
        __extends(OnEnterMode, _super);
        function OnEnterMode(indentAction) {
            _super.call(this);
            this.richEditSupport = {
                onEnter: {
                    onEnter: function (model, position) {
                        return {
                            indentAction: indentAction
                        };
                    }
                }
            };
        }
        return OnEnterMode;
    }(TestMode));
    suite('Editor Controller - Regression tests', function () {
        test('Bug 9121: Auto indent + undo + redo is funky', function () {
            usingCursor({
                text: [
                    ''
                ],
                modelOpts: {
                    defaultEOL: editorCommon_1.DefaultEndOfLine.LF,
                    detectIndentation: false,
                    insertSpaces: false,
                    tabSize: 4
                }
            }, function (model, cursor) {
                cursorCommand(cursor, H.Type, { text: '\n' }, null, 'keyboard');
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n', 'assert1');
                cursorCommand(cursor, H.Tab, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\t', 'assert2');
                cursorCommand(cursor, H.Type, { text: '\n' }, null, 'keyboard');
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\t\n\t', 'assert3');
                cursorCommand(cursor, H.Type, { text: 'x' });
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\t\n\tx', 'assert4');
                cursorCommand(cursor, H.CursorLeft, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\t\n\tx', 'assert5');
                cursorCommand(cursor, H.DeleteLeft, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\t\nx', 'assert6');
                cursorCommand(cursor, H.DeleteLeft, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\tx', 'assert7');
                cursorCommand(cursor, H.DeleteLeft, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\nx', 'assert8');
                cursorCommand(cursor, H.DeleteLeft, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), 'x', 'assert9');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\nx', 'assert10');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\t\nx', 'assert11');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\t\n\tx', 'assert12');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\n\t\nx', 'assert13');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), '\nx', 'assert14');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.LF), 'x', 'assert15');
            });
        });
        test('issue #183: jump to matching bracket position', function () {
            usingCursor({
                text: [
                    'var x = (3 + (5-7));'
                ],
                mode: new testModes_1.BracketMode()
            }, function (model, cursor) {
                // ensure is tokenized
                model.getLineContext(1);
                moveTo(cursor, 1, 20);
                cursorCommand(cursor, H.JumpToBracket, null, null, 'keyboard');
                cursorEqual(cursor, 1, 10);
                cursorCommand(cursor, H.JumpToBracket, null, null, 'keyboard');
                cursorEqual(cursor, 1, 20);
                cursorCommand(cursor, H.JumpToBracket, null, null, 'keyboard');
                cursorEqual(cursor, 1, 10);
            });
        });
        test('bug #16543: Tab should indent to correct indentation spot immediately', function () {
            usingCursor({
                text: [
                    'function baz() {',
                    '\tfunction hello() { // something here',
                    '\t',
                    '',
                    '\t}',
                    '}'
                ],
                modelOpts: {
                    defaultEOL: editorCommon_1.DefaultEndOfLine.LF,
                    detectIndentation: false,
                    insertSpaces: false,
                    tabSize: 4
                },
                mode: new OnEnterMode(modes_1.IndentAction.Indent),
            }, function (model, cursor) {
                moveTo(cursor, 4, 1, false);
                cursorEqual(cursor, 4, 1, 4, 1);
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(4), '\t\t');
            });
        });
        test('Bug 18276:[editor] Indentation broken when selection is empty', function () {
            usingCursor({
                text: [
                    'function baz() {'
                ],
                modelOpts: {
                    defaultEOL: editorCommon_1.DefaultEndOfLine.LF,
                    detectIndentation: false,
                    insertSpaces: false,
                    tabSize: 4
                },
            }, function (model, cursor) {
                moveTo(cursor, 1, 2, false);
                cursorEqual(cursor, 1, 2, 1, 2);
                cursorCommand(cursor, H.Indent, null, null, 'keyboard');
                assert.equal(model.getLineContent(1), '\tfunction baz() {');
                cursorEqual(cursor, 1, 3, 1, 3);
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(1), '\tf\tunction baz() {');
            });
        });
        test('bug #16815:Shift+Tab doesn\'t go back to tabstop', function () {
            usingCursor({
                text: [
                    '     function baz() {'
                ],
                mode: new OnEnterMode(modes_1.IndentAction.IndentOutdent),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 1, 6, false);
                cursorEqual(cursor, 1, 6, 1, 6);
                cursorCommand(cursor, H.Outdent, null, null, 'keyboard');
                assert.equal(model.getLineContent(1), '    function baz() {');
                cursorEqual(cursor, 1, 5, 1, 5);
            });
        });
        test('Bug #18293:[regression][editor] Can\'t outdent whitespace line', function () {
            usingCursor({
                text: [
                    '      '
                ],
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 1, 7, false);
                cursorEqual(cursor, 1, 7, 1, 7);
                cursorCommand(cursor, H.Outdent, null, null, 'keyboard');
                assert.equal(model.getLineContent(1), '    ');
                cursorEqual(cursor, 1, 5, 1, 5);
            });
        });
        test('Bug #16657: [editor] Tab on empty line of zero indentation moves cursor to position (1,1)', function () {
            usingCursor({
                text: [
                    'function baz() {',
                    '\tfunction hello() { // something here',
                    '\t',
                    '',
                    '\t}',
                    '}',
                    ''
                ],
                modelOpts: {
                    defaultEOL: editorCommon_1.DefaultEndOfLine.LF,
                    detectIndentation: false,
                    insertSpaces: false,
                    tabSize: 4
                },
            }, function (model, cursor) {
                moveTo(cursor, 7, 1, false);
                cursorEqual(cursor, 7, 1, 7, 1);
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(7), '\t');
                cursorEqual(cursor, 7, 2, 7, 2);
            });
        });
        test('bug #16740: [editor] Cut line doesn\'t quite cut the last line', function () {
            // Part 1 => there is text on the last line
            var text = [
                'asdasd',
                'qwerty'
            ];
            var model = new model_1.Model(text.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            var cursor = new cursor_1.Cursor(1, new mockConfiguration_1.MockConfiguration(null), model, null, true);
            moveTo(cursor, 2, 1, false);
            cursorEqual(cursor, 2, 1, 2, 1);
            cursorCommand(cursor, H.Cut, null, null, 'keyboard');
            assert.equal(model.getLineCount(), 1);
            assert.equal(model.getLineContent(1), 'asdasd');
            cursor.dispose();
            model.dispose();
            // Part 2 => there is no text on the last line
            text = [
                'asdasd',
                ''
            ];
            model = new model_1.Model(text.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            cursor = new cursor_1.Cursor(1, new mockConfiguration_1.MockConfiguration(null), model, null, true);
            moveTo(cursor, 2, 1, false);
            cursorEqual(cursor, 2, 1, 2, 1);
            cursorCommand(cursor, H.Cut, null, null, 'keyboard');
            assert.equal(model.getLineCount(), 1);
            assert.equal(model.getLineContent(1), 'asdasd');
            cursorCommand(cursor, H.Cut, null, null, 'keyboard');
            assert.equal(model.getLineCount(), 1);
            assert.equal(model.getLineContent(1), '');
            cursor.dispose();
            model.dispose();
        });
        test('Bug #11476: Double bracket surrounding + undo is broken', function () {
            usingCursor({
                text: [
                    'hello'
                ],
                mode: new SurroundingMode(),
                modelOpts: { tabSize: 4, insertSpaces: true, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 1, 3, false);
                moveTo(cursor, 1, 5, true);
                cursorEqual(cursor, 1, 5, 1, 3);
                cursorCommand(cursor, H.Type, { text: '(' }, null, 'keyboard');
                cursorEqual(cursor, 1, 6, 1, 4);
                cursorCommand(cursor, H.Type, { text: '(' }, null, 'keyboard');
                cursorEqual(cursor, 1, 7, 1, 5);
            });
        });
        test('issue #1140: Backspace stops prematurely', function () {
            usingCursor({
                text: [
                    'function baz() {',
                    '  return 1;',
                    '};'
                ],
                mode: new SurroundingMode(),
                modelOpts: { tabSize: 4, insertSpaces: true, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 3, 2, false);
                moveTo(cursor, 1, 14, true);
                cursorEqual(cursor, 1, 14, 3, 2);
                cursorCommand(cursor, H.DeleteLeft);
                cursorEqual(cursor, 1, 14, 1, 14);
                assert.equal(model.getLineCount(), 1);
                assert.equal(model.getLineContent(1), 'function baz(;');
            });
        });
        test('issue #1336: Insert cursor below on last line adds a cursor to the end of the current line', function () {
            usingCursor({
                text: [
                    'abc'
                ],
            }, function (model, cursor) {
                cursorCommand(cursor, H.AddCursorDown);
                assert.equal(cursor.getSelections().length, 1);
            });
        });
        test('issue #2205: Multi-cursor pastes in reverse order', function () {
            usingCursor({
                text: [
                    'abc',
                    'def'
                ],
            }, function (model, cursor) {
                moveTo(cursor, 2, 1, false);
                cursorCommand(cursor, H.AddCursorUp);
                assert.equal(cursor.getSelections().length, 2);
                cursorCommand(cursor, H.Paste, { text: '1\n2' });
                assert.equal(model.getLineContent(1), '1abc');
                assert.equal(model.getLineContent(2), '2def');
            });
        });
        test('issue #3071: Investigate why undo stack gets corrupted', function () {
            usingCursor({
                text: [
                    'some lines',
                    'and more lines',
                    'just some text',
                ],
                mode: null,
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                moveTo(cursor, 3, 4, true);
                var isFirst = true;
                model.addListener2(editorCommon_1.EventType.ModelContentChanged, function (e) {
                    if (isFirst) {
                        isFirst = false;
                        cursorCommand(cursor, H.Type, { text: '\t' }, null, 'keyboard');
                    }
                });
                cursorCommand(cursor, H.Tab);
                assert.equal(model.getValue(), [
                    '\t just some text'
                ].join('\n'), '001');
                cursorCommand(cursor, H.Undo);
                assert.equal(model.getValue(), [
                    'some lines',
                    'and more lines',
                    'just some text',
                ].join('\n'), '002');
                cursorCommand(cursor, H.Undo);
                assert.equal(model.getValue(), [
                    'some lines',
                    'and more lines',
                    'just some text',
                ].join('\n'), '003');
            });
        });
        test('issue #3463: pressing tab adds spaces, but not as many as for a tab', function () {
            usingCursor({
                text: [
                    'function a() {',
                    '\tvar a = {',
                    '\t\tx: 3',
                    '\t};',
                    '}',
                ],
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 3, 2, false);
                cursorCommand(cursor, H.Tab);
                assert.equal(model.getLineContent(3), '\t    \tx: 3');
            });
        });
        test('issue #832: deleteWordLeft', function () {
            usingCursor({
                text: [
                    '   /* Just some text a+= 3 +5 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 37, false);
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5 */', '001');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5 ', '002');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +', '003');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 ', '004');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= ', '005');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a', '006');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text ', '007');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some ', '008');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just ', '009');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* ', '010');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '   ', '011');
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), '', '012');
            });
        });
        test('deleteWordStartLeft', function () {
            usingCursor({
                text: [
                    '   /* Just some text a+= 3 +5 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 37, false);
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5 ', '001');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +', '002');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 ', '003');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= ', '004');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a', '005');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text ', '006');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some ', '007');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just ', '008');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* ', '009');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '   ', '010');
                deleteWordStartLeft(cursor);
                assert.equal(model.getLineContent(1), '', '011');
            });
        });
        test('deleteWordEndLeft', function () {
            usingCursor({
                text: [
                    '   /* Just some text a+= 3 +5 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 37, false);
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5 */', '001');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5', '002');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +', '003');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3', '004');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+=', '005');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text a', '006');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some text', '007');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just some', '008');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /* Just', '009');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '   /*', '010');
                deleteWordEndLeft(cursor);
                assert.equal(model.getLineContent(1), '', '011');
            });
        });
        test('issue #832: deleteWordRight', function () {
            usingCursor({
                text: [
                    '   /* Just some text a+= 3 +5-3 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), '/* Just some text a+= 3 +5-3 */  ', '001');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), ' Just some text a+= 3 +5-3 */  ', '002');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), ' some text a+= 3 +5-3 */  ', '003');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), ' text a+= 3 +5-3 */  ', '004');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), ' a+= 3 +5-3 */  ', '005');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), '+= 3 +5-3 */  ', '006');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), ' 3 +5-3 */  ', '007');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), ' +5-3 */  ', '008');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), '5-3 */  ', '009');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), '-3 */  ', '010');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), '3 */  ', '011');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), ' */  ', '012');
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), '  ', '013');
            });
        });
        test('deleteWordStartRight', function () {
            usingCursor({
                text: [
                    '   /* Just some text a+= 3 +5-3 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '/* Just some text a+= 3 +5-3 */  ', '001');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), 'Just some text a+= 3 +5-3 */  ', '002');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), 'some text a+= 3 +5-3 */  ', '003');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), 'text a+= 3 +5-3 */  ', '004');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), 'a+= 3 +5-3 */  ', '005');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '+= 3 +5-3 */  ', '006');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '3 +5-3 */  ', '007');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '+5-3 */  ', '008');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '5-3 */  ', '009');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '-3 */  ', '010');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '3 */  ', '011');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '*/  ', '012');
                deleteWordStartRight(cursor);
                assert.equal(model.getLineContent(1), '', '013');
            });
        });
        test('deleteWordEndRight', function () {
            usingCursor({
                text: [
                    '   /* Just some text a+= 3 +5-3 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), ' Just some text a+= 3 +5-3 */  ', '001');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), ' some text a+= 3 +5-3 */  ', '002');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), ' text a+= 3 +5-3 */  ', '003');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), ' a+= 3 +5-3 */  ', '004');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), '+= 3 +5-3 */  ', '005');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), ' 3 +5-3 */  ', '006');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), ' +5-3 */  ', '007');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), '5-3 */  ', '008');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), '-3 */  ', '009');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), '3 */  ', '010');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), ' */  ', '011');
                deleteWordEndRight(cursor);
                assert.equal(model.getLineContent(1), '  ', '012');
            });
        });
        test('issue #832: moveWordLeft', function () {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 50, false);
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1, '001');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1, '002');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 '.length + 1, '003');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '004');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '005');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '006');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 '.length + 1, '007');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= '.length + 1, '008');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a'.length + 1, '009');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text '.length + 1, '010');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   '.length + 1, '011');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   '.length + 1, '012');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just '.length + 1, '013');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* '.length + 1, '014');
                moveWordLeft(cursor);
                assert.equal(cursor.getPosition().column, '   '.length + 1, '015');
            });
        });
        test('moveWordStartLeft', function () {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 50, false);
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1, '001');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1, '002');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 '.length + 1, '003');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '004');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '005');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '006');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 '.length + 1, '007');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= '.length + 1, '008');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a'.length + 1, '009');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text '.length + 1, '010');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   '.length + 1, '011');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   '.length + 1, '012');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just '.length + 1, '013');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* '.length + 1, '014');
                moveWordStartLeft(cursor);
                assert.equal(cursor.getPosition().column, '   '.length + 1, '015');
            });
        });
        test('moveWordEndLeft', function () {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 50, false);
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1, '001');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1, '002');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1, '003');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3'.length + 1, '004');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '005');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '006');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '007');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3'.length + 1, '008');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+='.length + 1, '009');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a'.length + 1, '010');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text'.length + 1, '011');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more'.length + 1, '012');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some'.length + 1, '013');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just'.length + 1, '014');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, '   /*'.length + 1, '015');
                moveWordEndLeft(cursor);
                assert.equal(cursor.getPosition().column, ''.length + 1, '016');
            });
        });
        test('issue #832: moveWordRight', function () {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /*'.length + 1, '001');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just'.length + 1, '003');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some'.length + 1, '004');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more'.length + 1, '005');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text'.length + 1, '006');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a'.length + 1, '007');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+='.length + 1, '008');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3'.length + 1, '009');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '010');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '011');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '012');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3'.length + 1, '013');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1, '014');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1, '015');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1, '016');
                moveWordRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1, '016');
            });
        });
        test('moveWordEndRight', function () {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /*'.length + 1, '001');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just'.length + 1, '003');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some'.length + 1, '004');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more'.length + 1, '005');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text'.length + 1, '006');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a'.length + 1, '007');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+='.length + 1, '008');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3'.length + 1, '009');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '010');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '011');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '012');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3'.length + 1, '013');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1, '014');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1, '015');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1, '016');
                moveWordEndRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1, '016');
            });
        });
        test('moveWordStartRight', function () {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   '.length + 1, '001');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* '.length + 1, '002');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just '.length + 1, '003');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   '.length + 1, '004');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   '.length + 1, '005');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text '.length + 1, '006');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a'.length + 1, '007');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= '.length + 1, '008');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 '.length + 1, '009');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '010');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '011');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '012');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 '.length + 1, '013');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1, '014');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1, '015');
                moveWordStartRight(cursor);
                assert.equal(cursor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1, '016');
            });
        });
        test('issue #832: word right', function () {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                function assertWordRight(col, expectedCol) {
                    cursorCommand(cursor, col === 1 ? H.WordSelect : H.WordSelectDrag, {
                        position: {
                            lineNumber: 1,
                            column: col
                        },
                        preference: 'right'
                    });
                    assert.equal(cursor.getSelection().startColumn, 1, 'TEST FOR ' + col);
                    assert.equal(cursor.getSelection().endColumn, expectedCol, 'TEST FOR ' + col);
                }
                assertWordRight(1, '   '.length + 1);
                assertWordRight(2, '   '.length + 1);
                assertWordRight(3, '   '.length + 1);
                assertWordRight(4, '   '.length + 1);
                assertWordRight(5, '   /'.length + 1);
                assertWordRight(6, '   /*'.length + 1);
                assertWordRight(7, '   /* '.length + 1);
                assertWordRight(8, '   /* Just'.length + 1);
                assertWordRight(9, '   /* Just'.length + 1);
                assertWordRight(10, '   /* Just'.length + 1);
                assertWordRight(11, '   /* Just'.length + 1);
                assertWordRight(12, '   /* Just '.length + 1);
                assertWordRight(13, '   /* Just some'.length + 1);
                assertWordRight(14, '   /* Just some'.length + 1);
                assertWordRight(15, '   /* Just some'.length + 1);
                assertWordRight(16, '   /* Just some'.length + 1);
                assertWordRight(17, '   /* Just some '.length + 1);
                assertWordRight(18, '   /* Just some  '.length + 1);
                assertWordRight(19, '   /* Just some   '.length + 1);
                assertWordRight(20, '   /* Just some   more'.length + 1);
                assertWordRight(21, '   /* Just some   more'.length + 1);
                assertWordRight(22, '   /* Just some   more'.length + 1);
                assertWordRight(23, '   /* Just some   more'.length + 1);
                assertWordRight(24, '   /* Just some   more '.length + 1);
                assertWordRight(25, '   /* Just some   more  '.length + 1);
                assertWordRight(26, '   /* Just some   more   '.length + 1);
                assertWordRight(27, '   /* Just some   more   text'.length + 1);
                assertWordRight(28, '   /* Just some   more   text'.length + 1);
                assertWordRight(29, '   /* Just some   more   text'.length + 1);
                assertWordRight(30, '   /* Just some   more   text'.length + 1);
                assertWordRight(31, '   /* Just some   more   text '.length + 1);
                assertWordRight(32, '   /* Just some   more   text a'.length + 1);
                assertWordRight(33, '   /* Just some   more   text a+'.length + 1);
                assertWordRight(34, '   /* Just some   more   text a+='.length + 1);
                assertWordRight(35, '   /* Just some   more   text a+= '.length + 1);
                assertWordRight(36, '   /* Just some   more   text a+= 3'.length + 1);
                assertWordRight(37, '   /* Just some   more   text a+= 3 '.length + 1);
                assertWordRight(38, '   /* Just some   more   text a+= 3 +'.length + 1);
                assertWordRight(39, '   /* Just some   more   text a+= 3 +5'.length + 1);
                assertWordRight(40, '   /* Just some   more   text a+= 3 +5-'.length + 1);
                assertWordRight(41, '   /* Just some   more   text a+= 3 +5-3'.length + 1);
                assertWordRight(42, '   /* Just some   more   text a+= 3 +5-3 '.length + 1);
                assertWordRight(43, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1);
                assertWordRight(44, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1);
                assertWordRight(45, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1);
                assertWordRight(46, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1);
                assertWordRight(47, '   /* Just some   more   text a+= 3 +5-3 + 7 *'.length + 1);
                assertWordRight(48, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1);
                assertWordRight(49, '   /* Just some   more   text a+= 3 +5-3 + 7 */ '.length + 1);
                assertWordRight(50, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1);
            });
        });
        test('issue #3882 (1): Ctrl+Delete removing entire line when used at the end of line', function () {
            usingCursor({
                text: [
                    'A line with text.',
                    '   And another one'
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 18, false);
                deleteWordRight(cursor);
                assert.equal(model.getLineContent(1), 'A line with text.   And another one', '001');
            });
        });
        test('issue #3882 (2): Ctrl+Delete removing entire line when used at the end of line', function () {
            usingCursor({
                text: [
                    'A line with text.',
                    '   And another one'
                ],
            }, function (model, cursor) {
                moveTo(cursor, 2, 1, false);
                deleteWordLeft(cursor);
                assert.equal(model.getLineContent(1), 'A line with text.   And another one', '001');
            });
        });
    });
    suite('Editor Controller - Cursor Configuration', function () {
        test('Cursor honors insertSpaces configuration on new line', function () {
            usingCursor({
                text: [
                    '    \tMy First Line\t ',
                    '\tMy Second Line',
                    '    Third Line',
                    '',
                    '1'
                ],
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(1, 21) }, null, 'keyboard');
                cursorCommand(cursor, H.Type, { text: '\n' }, null, 'keyboard');
                assert.equal(model.getLineContent(1), '    \tMy First Line\t ');
                assert.equal(model.getLineContent(2), '        ');
            });
        });
        test('Cursor honors insertSpaces configuration on tab', function () {
            usingCursor({
                text: [
                    '    \tMy First Line\t ',
                    'My Second Line123',
                    '    Third Line',
                    '',
                    '1'
                ],
                modelOpts: { insertSpaces: true, tabSize: 13, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                // Tab on column 1
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(2, 1) }, null, 'keyboard');
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(2), '             My Second Line123');
                cursorCommand(cursor, H.Undo, null, null, 'keyboard');
                // Tab on column 2
                assert.equal(model.getLineContent(2), 'My Second Line123');
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(2, 2) }, null, 'keyboard');
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(2), 'M            y Second Line123');
                cursorCommand(cursor, H.Undo, null, null, 'keyboard');
                // Tab on column 3
                assert.equal(model.getLineContent(2), 'My Second Line123');
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(2, 3) }, null, 'keyboard');
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(2), 'My            Second Line123');
                cursorCommand(cursor, H.Undo, null, null, 'keyboard');
                // Tab on column 4
                assert.equal(model.getLineContent(2), 'My Second Line123');
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(2, 4) }, null, 'keyboard');
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(2), 'My           Second Line123');
                cursorCommand(cursor, H.Undo, null, null, 'keyboard');
                // Tab on column 5
                assert.equal(model.getLineContent(2), 'My Second Line123');
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(2, 5) }, null, 'keyboard');
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(2), 'My S         econd Line123');
                cursorCommand(cursor, H.Undo, null, null, 'keyboard');
                // Tab on column 5
                assert.equal(model.getLineContent(2), 'My Second Line123');
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(2, 5) }, null, 'keyboard');
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(2), 'My S         econd Line123');
                cursorCommand(cursor, H.Undo, null, null, 'keyboard');
                // Tab on column 13
                assert.equal(model.getLineContent(2), 'My Second Line123');
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(2, 13) }, null, 'keyboard');
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(2), 'My Second Li ne123');
                cursorCommand(cursor, H.Undo, null, null, 'keyboard');
                // Tab on column 14
                assert.equal(model.getLineContent(2), 'My Second Line123');
                cursorCommand(cursor, H.MoveTo, { position: new position_1.Position(2, 14) }, null, 'keyboard');
                cursorCommand(cursor, H.Tab, null, null, 'keyboard');
                assert.equal(model.getLineContent(2), 'My Second Lin             e123');
            });
        });
        test('Enter auto-indents with insertSpaces setting 1', function () {
            usingCursor({
                text: [
                    '\thello'
                ],
                mode: new OnEnterMode(modes_1.IndentAction.Indent),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 1, 7, false);
                cursorEqual(cursor, 1, 7, 1, 7);
                cursorCommand(cursor, H.Type, { text: '\n' }, null, 'keyboard');
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.CRLF), '\thello\r\n        ');
            });
        });
        test('Enter auto-indents with insertSpaces setting 2', function () {
            usingCursor({
                text: [
                    '\thello'
                ],
                mode: new OnEnterMode(modes_1.IndentAction.None),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 1, 7, false);
                cursorEqual(cursor, 1, 7, 1, 7);
                cursorCommand(cursor, H.Type, { text: '\n' }, null, 'keyboard');
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.CRLF), '\thello\r\n    ');
            });
        });
        test('Enter auto-indents with insertSpaces setting 3', function () {
            usingCursor({
                text: [
                    '\thell()'
                ],
                mode: new OnEnterMode(modes_1.IndentAction.IndentOutdent),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: editorCommon_1.DefaultEndOfLine.LF }
            }, function (model, cursor) {
                moveTo(cursor, 1, 7, false);
                cursorEqual(cursor, 1, 7, 1, 7);
                cursorCommand(cursor, H.Type, { text: '\n' }, null, 'keyboard');
                assert.equal(model.getValue(editorCommon_1.EndOfLinePreference.CRLF), '\thell(\r\n        \r\n    )');
            });
        });
        test('Insert line before', function () {
            var testInsertLineBefore = function (lineNumber, column, callback) {
                usingCursor({
                    text: [
                        'First line',
                        'Second line',
                        'Third line'
                    ],
                }, function (model, cursor) {
                    moveTo(cursor, lineNumber, column, false);
                    cursorEqual(cursor, lineNumber, column, lineNumber, column);
                    cursorCommand(cursor, H.LineInsertBefore, null, null, 'keyboard');
                    callback(model, cursor);
                });
            };
            testInsertLineBefore(1, 3, function (model, cursor) {
                cursorEqual(cursor, 1, 1, 1, 1);
                assert.equal(model.getLineContent(1), '');
                assert.equal(model.getLineContent(2), 'First line');
                assert.equal(model.getLineContent(3), 'Second line');
                assert.equal(model.getLineContent(4), 'Third line');
            });
            testInsertLineBefore(2, 3, function (model, cursor) {
                cursorEqual(cursor, 2, 1, 2, 1);
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), '');
                assert.equal(model.getLineContent(3), 'Second line');
                assert.equal(model.getLineContent(4), 'Third line');
            });
            testInsertLineBefore(3, 3, function (model, cursor) {
                cursorEqual(cursor, 3, 1, 3, 1);
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), 'Second line');
                assert.equal(model.getLineContent(3), '');
                assert.equal(model.getLineContent(4), 'Third line');
            });
        });
        test('Insert line after', function () {
            var testInsertLineAfter = function (lineNumber, column, callback) {
                usingCursor({
                    text: [
                        'First line',
                        'Second line',
                        'Third line'
                    ],
                }, function (model, cursor) {
                    moveTo(cursor, lineNumber, column, false);
                    cursorEqual(cursor, lineNumber, column, lineNumber, column);
                    cursorCommand(cursor, H.LineInsertAfter, null, null, 'keyboard');
                    callback(model, cursor);
                });
            };
            testInsertLineAfter(1, 3, function (model, cursor) {
                cursorEqual(cursor, 2, 1, 2, 1);
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), '');
                assert.equal(model.getLineContent(3), 'Second line');
                assert.equal(model.getLineContent(4), 'Third line');
            });
            testInsertLineAfter(2, 3, function (model, cursor) {
                cursorEqual(cursor, 3, 1, 3, 1);
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), 'Second line');
                assert.equal(model.getLineContent(3), '');
                assert.equal(model.getLineContent(4), 'Third line');
            });
            testInsertLineAfter(3, 3, function (model, cursor) {
                cursorEqual(cursor, 4, 1, 4, 1);
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), 'Second line');
                assert.equal(model.getLineContent(3), 'Third line');
                assert.equal(model.getLineContent(4), '');
            });
        });
    });
    function usingCursor(opts, callback) {
        var model = new model_1.Model(opts.text.join('\n'), opts.modelOpts || model_1.Model.DEFAULT_CREATION_OPTIONS, opts.mode);
        var config = new mockConfiguration_1.MockConfiguration(null);
        var cursor = new cursor_1.Cursor(1, config, model, null, false);
        callback(model, cursor);
        cursor.dispose();
        config.dispose();
        model.dispose();
    }
});
//# sourceMappingURL=cursor.test.js.map