define(["require", "exports", 'assert', 'vs/editor/common/controller/cursor', 'vs/editor/common/core/editOperation', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/core/selection', 'vs/editor/common/model/model', 'vs/editor/common/model/modelLine', 'vs/editor/test/common/mocks/mockConfiguration'], function (require, exports, assert, cursor_1, editOperation_1, position_1, range_1, selection_1, model_1, modelLine_1, mockConfiguration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function testCommand(lines, selection, edits, expectedLines, expectedSelection) {
        var model = new model_1.Model(lines.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
        var config = new mockConfiguration_1.MockConfiguration(null);
        var cursor = new cursor_1.Cursor(0, config, model, null, false);
        cursor.setSelections('tests', [selection]);
        model.applyEdits(edits);
        var actualValue = model.toRawText().lines;
        assert.deepEqual(actualValue, expectedLines);
        var actualSelection = cursor.getSelection();
        assert.deepEqual(actualSelection.toString(), expectedSelection.toString());
        cursor.dispose();
        config.dispose();
        model.dispose();
    }
    function testLineEditMarker(text, column, stickToPreviousCharacter, edit, expectedColumn) {
        var line = new modelLine_1.ModelLine(1, text);
        line.addMarker({
            id: '1',
            line: null,
            column: column,
            stickToPreviousCharacter: stickToPreviousCharacter,
            oldLineNumber: 0,
            oldColumn: 0,
        });
        line.applyEdits({}, [edit]);
        assert.equal(line.getMarkers()[0].column, expectedColumn);
    }
    suite('Editor Side Editing - collapsed selection', function () {
        test('replace at selection', function () {
            testCommand([
                'first',
                'second line',
                'third line',
                'fourth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                editOperation_1.EditOperation.replace(new selection_1.Selection(1, 1, 1, 1), 'something ')
            ], [
                'something first',
                'second line',
                'third line',
                'fourth'
            ], new selection_1.Selection(1, 1, 1, 11));
        });
        test('replace at selection 2', function () {
            testCommand([
                'first',
                'second line',
                'third line',
                'fourth'
            ], new selection_1.Selection(1, 1, 1, 6), [
                editOperation_1.EditOperation.replace(new selection_1.Selection(1, 1, 1, 6), 'something')
            ], [
                'something',
                'second line',
                'third line',
                'fourth'
            ], new selection_1.Selection(1, 1, 1, 10));
        });
        test('ModelLine.applyEdits uses `isReplace`', function () {
            testLineEditMarker('something', 1, true, { startColumn: 1, endColumn: 1, text: 'asd', forceMoveMarkers: false }, 1);
            testLineEditMarker('something', 1, true, { startColumn: 1, endColumn: 1, text: 'asd', forceMoveMarkers: true }, 4);
            testLineEditMarker('something', 1, false, { startColumn: 1, endColumn: 1, text: 'asd', forceMoveMarkers: false }, 4);
            testLineEditMarker('something', 1, false, { startColumn: 1, endColumn: 1, text: 'asd', forceMoveMarkers: true }, 4);
        });
        test('insert at selection', function () {
            testCommand([
                'first',
                'second line',
                'third line',
                'fourth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'something ')
            ], [
                'something first',
                'second line',
                'third line',
                'fourth'
            ], new selection_1.Selection(1, 11, 1, 11));
        });
        test('insert at selection sitting on max column', function () {
            testCommand([
                'first',
                'second line',
                'third line',
                'fourth'
            ], new selection_1.Selection(1, 6, 1, 6), [
                editOperation_1.EditOperation.insert(new position_1.Position(1, 6), ' something\nnew ')
            ], [
                'first something',
                'new ',
                'second line',
                'third line',
                'fourth'
            ], new selection_1.Selection(2, 5, 2, 5));
        });
        test('issue #3994: replace on top of selection', function () {
            testCommand([
                '$obj = New-Object "system.col"'
            ], new selection_1.Selection(1, 30, 1, 30), [
                editOperation_1.EditOperation.replaceMove(new range_1.Range(1, 19, 1, 31), '"System.Collections"')
            ], [
                '$obj = New-Object "System.Collections"'
            ], new selection_1.Selection(1, 39, 1, 39));
        });
    });
});
//# sourceMappingURL=sideEditing.test.js.map