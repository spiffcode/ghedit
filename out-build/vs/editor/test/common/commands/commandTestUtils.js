define(["require", "exports", 'assert', 'vs/editor/common/controller/cursor', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/common/model/model', 'vs/editor/test/common/mocks/mockConfiguration'], function (require, exports, assert, cursor_1, range_1, editorCommon, model_1, mockConfiguration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function testCommand(lines, mode, selection, commandFactory, expectedLines, expectedSelection) {
        var model = new model_1.Model(lines.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, mode);
        var config = new mockConfiguration_1.MockConfiguration(null);
        var cursor = new cursor_1.Cursor(0, config, model, null, false);
        cursor.setSelections('tests', [selection]);
        cursor.configuration.handlerDispatcher.trigger('tests', editorCommon.Handler.ExecuteCommand, commandFactory(cursor.getSelection()));
        var actualValue = model.toRawText().lines;
        assert.deepEqual(actualValue, expectedLines);
        var actualSelection = cursor.getSelection();
        assert.deepEqual(actualSelection.toString(), expectedSelection.toString());
        cursor.dispose();
        config.dispose();
        model.dispose();
    }
    exports.testCommand = testCommand;
    /**
     * Extract edit operations if command `command` were to execute on model `model`
     */
    function getEditOperation(model, command) {
        var operations = [];
        var editOperationBuilder = {
            addEditOperation: function (range, text) {
                operations.push({
                    identifier: null,
                    range: range,
                    text: text,
                    forceMoveMarkers: false
                });
            },
            trackSelection: function (selection) {
                return null;
            }
        };
        command.getEditOperations(model, editOperationBuilder);
        return operations;
    }
    exports.getEditOperation = getEditOperation;
    /**
     * Create single edit operation
     */
    function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber, selectionColumn) {
        if (selectionLineNumber === void 0) { selectionLineNumber = positionLineNumber; }
        if (selectionColumn === void 0) { selectionColumn = positionColumn; }
        return {
            identifier: null,
            range: new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text,
            forceMoveMarkers: false
        };
    }
    exports.createSingleEditOp = createSingleEditOp;
    /**
     * Create single edit operation
     */
    function createInsertDeleteSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber, selectionColumn) {
        if (selectionLineNumber === void 0) { selectionLineNumber = positionLineNumber; }
        if (selectionColumn === void 0) { selectionColumn = positionColumn; }
        return {
            identifier: null,
            range: new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text,
            forceMoveMarkers: true
        };
    }
    exports.createInsertDeleteSingleEditOp = createInsertDeleteSingleEditOp;
});
//# sourceMappingURL=commandTestUtils.js.map