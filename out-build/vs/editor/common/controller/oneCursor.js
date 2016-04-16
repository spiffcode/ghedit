define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/strings', 'vs/editor/common/commands/replaceCommand', 'vs/editor/common/commands/shiftCommand', 'vs/editor/common/commands/surroundSelectionCommand', 'vs/editor/common/controller/cursorMoveHelper', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/core/selection', 'vs/editor/common/editorCommon', 'vs/editor/common/modes', 'vs/editor/common/modes/supports/onEnter'], function (require, exports, errors_1, strings, replaceCommand_1, shiftCommand_1, surroundSelectionCommand_1, cursorMoveHelper_1, position_1, range_1, selection_1, editorCommon, modes_1, onEnter_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (WordType) {
        WordType[WordType["None"] = 0] = "None";
        WordType[WordType["Regular"] = 1] = "Regular";
        WordType[WordType["Separator"] = 2] = "Separator";
    })(exports.WordType || (exports.WordType = {}));
    var WordType = exports.WordType;
    ;
    var CharacterClass;
    (function (CharacterClass) {
        CharacterClass[CharacterClass["Regular"] = 0] = "Regular";
        CharacterClass[CharacterClass["Whitespace"] = 1] = "Whitespace";
        CharacterClass[CharacterClass["WordSeparator"] = 2] = "WordSeparator";
    })(CharacterClass || (CharacterClass = {}));
    ;
    (function (WordNavigationType) {
        WordNavigationType[WordNavigationType["WordStart"] = 0] = "WordStart";
        WordNavigationType[WordNavigationType["WordEnd"] = 1] = "WordEnd";
    })(exports.WordNavigationType || (exports.WordNavigationType = {}));
    var WordNavigationType = exports.WordNavigationType;
    var CH_REGULAR = CharacterClass.Regular;
    var CH_WHITESPACE = CharacterClass.Whitespace;
    var CH_WORD_SEPARATOR = CharacterClass.WordSeparator;
    var W_NONE = WordType.None;
    var W_REGULAR = WordType.Regular;
    var W_SEPARATOR = WordType.Separator;
    var OneCursor = (function () {
        function OneCursor(editorId, model, configuration, modeConfiguration, viewModelHelper) {
            this.editorId = editorId;
            this.model = model;
            this.configuration = configuration;
            this.modeConfiguration = modeConfiguration;
            this.viewModelHelper = viewModelHelper;
            this.helper = new CursorHelper(this.model, this.configuration);
            this.bracketDecorations = [];
            this._set(new range_1.Range(1, 1, 1, 1), 0, new position_1.Position(1, 1), 0, new range_1.Range(1, 1, 1, 1), new position_1.Position(1, 1));
        }
        OneCursor.prototype._set = function (selectionStart, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns, viewSelectionStart, viewPosition) {
            this.selectionStart = selectionStart;
            this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
            this.position = position;
            this.leftoverVisibleColumns = leftoverVisibleColumns;
            this.viewSelectionStart = viewSelectionStart;
            this.viewPosition = viewPosition;
            this._cachedSelection = OneCursor.computeSelection(this.selectionStart, this.position);
            this._cachedViewSelection = OneCursor.computeSelection(this.viewSelectionStart, this.viewPosition);
            this._selStartMarker = this._ensureMarker(this._selStartMarker, this._cachedSelection.startLineNumber, this._cachedSelection.startColumn, true);
            this._selEndMarker = this._ensureMarker(this._selEndMarker, this._cachedSelection.endLineNumber, this._cachedSelection.endColumn, false);
            this._selDirection = this._cachedSelection.getDirection();
        };
        OneCursor.prototype._ensureMarker = function (markerId, lineNumber, column, stickToPreviousCharacter) {
            if (!markerId) {
                return this.model._addMarker(lineNumber, column, stickToPreviousCharacter);
            }
            else {
                this.model._changeMarker(markerId, lineNumber, column);
                this.model._changeMarkerStickiness(markerId, stickToPreviousCharacter);
                return markerId;
            }
        };
        OneCursor.prototype.saveState = function () {
            return {
                selectionStart: this.selectionStart,
                viewSelectionStart: this.viewSelectionStart,
                position: this.position,
                viewPosition: this.viewPosition,
                leftoverVisibleColumns: this.leftoverVisibleColumns,
                selectionStartLeftoverVisibleColumns: this.selectionStartLeftoverVisibleColumns
            };
        };
        OneCursor.prototype.restoreState = function (state) {
            var position = this.model.validatePosition(state.position);
            var selectionStart;
            if (state.selectionStart) {
                selectionStart = this.model.validateRange(state.selectionStart);
            }
            else {
                selectionStart = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            }
            var viewPosition = this.viewModelHelper.validateViewPosition(state.viewPosition.lineNumber, state.viewPosition.column, position);
            var viewSelectionStart;
            if (state.viewSelectionStart) {
                viewSelectionStart = this.viewModelHelper.validateViewRange(state.viewSelectionStart.startLineNumber, state.viewSelectionStart.startColumn, state.viewSelectionStart.endLineNumber, state.viewSelectionStart.endColumn, selectionStart);
            }
            else {
                viewSelectionStart = this.viewModelHelper.convertModelRangeToViewRange(selectionStart);
            }
            this._set(selectionStart, state.selectionStartLeftoverVisibleColumns, position, state.leftoverVisibleColumns, viewSelectionStart, viewPosition);
        };
        OneCursor.prototype.updateModeConfiguration = function (modeConfiguration) {
            this.modeConfiguration = modeConfiguration;
        };
        OneCursor.prototype.duplicate = function () {
            var result = new OneCursor(this.editorId, this.model, this.configuration, this.modeConfiguration, this.viewModelHelper);
            result._set(this.selectionStart, this.selectionStartLeftoverVisibleColumns, this.position, this.leftoverVisibleColumns, this.viewSelectionStart, this.viewPosition);
            return result;
        };
        OneCursor.prototype.dispose = function () {
            this.model._removeMarker(this._selStartMarker);
            this.model._removeMarker(this._selEndMarker);
            this.bracketDecorations = this.model.deltaDecorations(this.bracketDecorations, [], this.editorId);
        };
        OneCursor.prototype.adjustBracketDecorations = function () {
            var bracketMatch = null;
            var selection = this.getSelection();
            if (selection.isEmpty()) {
                bracketMatch = this.model.matchBracket(this.position, /*inaccurateResultAcceptable*/ true);
            }
            var newDecorations = [];
            if (bracketMatch && bracketMatch.brackets) {
                var options = {
                    stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                    className: 'bracket-match'
                };
                newDecorations.push({ range: bracketMatch.brackets[0], options: options });
                newDecorations.push({ range: bracketMatch.brackets[1], options: options });
            }
            this.bracketDecorations = this.model.deltaDecorations(this.bracketDecorations, newDecorations, this.editorId);
        };
        OneCursor.computeSelection = function (selectionStart, position) {
            var startLineNumber, startColumn, endLineNumber, endColumn;
            if (selectionStart.isEmpty()) {
                startLineNumber = selectionStart.startLineNumber;
                startColumn = selectionStart.startColumn;
                endLineNumber = position.lineNumber;
                endColumn = position.column;
            }
            else {
                if (position.isBeforeOrEqual(selectionStart.getStartPosition())) {
                    startLineNumber = selectionStart.endLineNumber;
                    startColumn = selectionStart.endColumn;
                    endLineNumber = position.lineNumber;
                    endColumn = position.column;
                }
                else {
                    startLineNumber = selectionStart.startLineNumber;
                    startColumn = selectionStart.startColumn;
                    endLineNumber = position.lineNumber;
                    endColumn = position.column;
                }
            }
            return new selection_1.Selection(startLineNumber, startColumn, endLineNumber, endColumn);
        };
        OneCursor.prototype.setSelection = function (desiredSelection) {
            var position = this.model.validatePosition({
                lineNumber: desiredSelection.positionLineNumber,
                column: desiredSelection.positionColumn
            });
            var selectionStartPosition = this.model.validatePosition({
                lineNumber: desiredSelection.selectionStartLineNumber,
                column: desiredSelection.selectionStartColumn
            });
            var selectionStart = new range_1.Range(selectionStartPosition.lineNumber, selectionStartPosition.column, selectionStartPosition.lineNumber, selectionStartPosition.column);
            var viewPosition = this.viewModelHelper.convertModelPositionToViewPosition(position.lineNumber, position.column);
            var viewSelectionStart = this.viewModelHelper.convertModelRangeToViewRange(selectionStart);
            this._set(selectionStart, 0, position, 0, viewSelectionStart, viewPosition);
        };
        OneCursor.prototype.setViewSelection = function (desiredViewSel) {
            var viewSelectionStart = this.viewModelHelper.validateViewRange(desiredViewSel.selectionStartLineNumber, desiredViewSel.selectionStartColumn, desiredViewSel.selectionStartLineNumber, desiredViewSel.selectionStartColumn, this.selectionStart);
            var viewPosition = this.viewModelHelper.validateViewPosition(desiredViewSel.positionLineNumber, desiredViewSel.positionColumn, this.position);
            this._set(this.selectionStart, 0, this.position, 0, viewSelectionStart, viewPosition);
        };
        // -------------------- START modifications
        OneCursor.prototype.setSelectionStart = function (rng, viewRng) {
            this._set(rng, this.selectionStartLeftoverVisibleColumns, this.position, this.leftoverVisibleColumns, viewRng, this.viewPosition);
        };
        OneCursor.prototype.collapseSelection = function () {
            var selectionStart = new range_1.Range(this.position.lineNumber, this.position.column, this.position.lineNumber, this.position.column);
            var viewSelectionStart = new range_1.Range(this.viewPosition.lineNumber, this.viewPosition.column, this.viewPosition.lineNumber, this.viewPosition.column);
            this._set(selectionStart, 0, this.position, this.leftoverVisibleColumns, viewSelectionStart, this.viewPosition);
        };
        OneCursor.prototype.moveModelPosition = function (inSelectionMode, lineNumber, column, leftoverVisibleColumns, ensureInEditableRange) {
            var viewPosition = this.viewModelHelper.convertModelPositionToViewPosition(lineNumber, column);
            this._move(inSelectionMode, lineNumber, column, viewPosition.lineNumber, viewPosition.column, leftoverVisibleColumns, ensureInEditableRange);
        };
        OneCursor.prototype.moveViewPosition = function (inSelectionMode, viewLineNumber, viewColumn, leftoverVisibleColumns, ensureInEditableRange) {
            var modelPosition = this.viewModelHelper.convertViewToModelPosition(viewLineNumber, viewColumn);
            this._move(inSelectionMode, modelPosition.lineNumber, modelPosition.column, viewLineNumber, viewColumn, leftoverVisibleColumns, ensureInEditableRange);
        };
        OneCursor.prototype._move = function (inSelectionMode, lineNumber, column, viewLineNumber, viewColumn, leftoverVisibleColumns, ensureInEditableRange) {
            if (ensureInEditableRange) {
                var editableRange = this.model.getEditableRange();
                if (lineNumber < editableRange.startLineNumber || (lineNumber === editableRange.startLineNumber && column < editableRange.startColumn)) {
                    lineNumber = editableRange.startLineNumber;
                    column = editableRange.startColumn;
                    var viewPosition = this.viewModelHelper.convertModelPositionToViewPosition(lineNumber, column);
                    viewLineNumber = viewPosition.lineNumber;
                    viewColumn = viewPosition.column;
                }
                else if (lineNumber > editableRange.endLineNumber || (lineNumber === editableRange.endLineNumber && column > editableRange.endColumn)) {
                    lineNumber = editableRange.endLineNumber;
                    column = editableRange.endColumn;
                    var viewPosition = this.viewModelHelper.convertModelPositionToViewPosition(lineNumber, column);
                    viewLineNumber = viewPosition.lineNumber;
                    viewColumn = viewPosition.column;
                }
            }
            this._actualMove(inSelectionMode, new position_1.Position(lineNumber, column), new position_1.Position(viewLineNumber, viewColumn), leftoverVisibleColumns);
        };
        OneCursor.prototype._actualMove = function (inSelectionMode, position, viewPosition, leftoverVisibleColumns) {
            if (inSelectionMode) {
                // move just position
                this._set(this.selectionStart, this.selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns, this.viewSelectionStart, viewPosition);
            }
            else {
                // move everything
                var selectionStart = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
                var viewSelectionStart = new range_1.Range(viewPosition.lineNumber, viewPosition.column, viewPosition.lineNumber, viewPosition.column);
                this._set(selectionStart, leftoverVisibleColumns, position, leftoverVisibleColumns, viewSelectionStart, viewPosition);
            }
        };
        OneCursor.prototype._recoverSelectionFromMarkers = function () {
            var start = this.model._getMarker(this._selStartMarker);
            var end = this.model._getMarker(this._selEndMarker);
            if (this._selDirection === editorCommon.SelectionDirection.LTR) {
                return new selection_1.Selection(start.lineNumber, start.column, end.lineNumber, end.column);
            }
            return new selection_1.Selection(end.lineNumber, end.column, start.lineNumber, start.column);
        };
        OneCursor.prototype.recoverSelectionFromMarkers = function (ctx) {
            ctx.cursorPositionChangeReason = 'recoverFromMarkers';
            ctx.shouldPushStackElementBefore = true;
            ctx.shouldPushStackElementAfter = true;
            ctx.shouldReveal = false;
            ctx.shouldRevealHorizontal = false;
            var recoveredSelection = this._recoverSelectionFromMarkers();
            var selectionStart = new range_1.Range(recoveredSelection.selectionStartLineNumber, recoveredSelection.selectionStartColumn, recoveredSelection.selectionStartLineNumber, recoveredSelection.selectionStartColumn);
            var position = new position_1.Position(recoveredSelection.positionLineNumber, recoveredSelection.positionColumn);
            var viewSelectionStart = this.viewModelHelper.convertModelRangeToViewRange(selectionStart);
            var viewPosition = this.viewModelHelper.convertViewToModelPosition(position.lineNumber, position.column);
            this._set(selectionStart, 0, position, 0, viewSelectionStart, viewPosition);
            return true;
        };
        // -------------------- END modifications
        // -------------------- START reading API
        OneCursor.prototype.getSelectionStart = function () {
            return this.selectionStart;
        };
        OneCursor.prototype.getPosition = function () {
            return this.position;
        };
        OneCursor.prototype.getSelection = function () {
            return this._cachedSelection;
        };
        OneCursor.prototype.getViewPosition = function () {
            return this.viewPosition;
        };
        OneCursor.prototype.getViewSelection = function () {
            return this._cachedViewSelection;
        };
        OneCursor.prototype.getValidViewPosition = function () {
            return this.viewModelHelper.validateViewPosition(this.viewPosition.lineNumber, this.viewPosition.column, this.position);
        };
        OneCursor.prototype.hasSelection = function () {
            return (!this.getSelection().isEmpty() || !this.selectionStart.isEmpty());
        };
        OneCursor.prototype.getBracketsDecorations = function () {
            return this.bracketDecorations;
        };
        OneCursor.prototype.getLeftoverVisibleColumns = function () {
            return this.leftoverVisibleColumns;
        };
        OneCursor.prototype.getSelectionStartLeftoverVisibleColumns = function () {
            return this.selectionStartLeftoverVisibleColumns;
        };
        OneCursor.prototype.setSelectionStartLeftoverVisibleColumns = function (value) {
            this.selectionStartLeftoverVisibleColumns = value;
        };
        // -- utils
        OneCursor.prototype.validatePosition = function (position) {
            return this.model.validatePosition(position);
        };
        OneCursor.prototype.validateViewPosition = function (viewLineNumber, viewColumn, modelPosition) {
            return this.viewModelHelper.validateViewPosition(viewLineNumber, viewColumn, modelPosition);
        };
        OneCursor.prototype.convertViewToModelPosition = function (lineNumber, column) {
            return this.viewModelHelper.convertViewToModelPosition(lineNumber, column);
        };
        OneCursor.prototype.convertViewSelectionToModelSelection = function (viewSelection) {
            return this.viewModelHelper.convertViewSelectionToModelSelection(viewSelection);
        };
        OneCursor.prototype.convertModelPositionToViewPosition = function (lineNumber, column) {
            return this.viewModelHelper.convertModelPositionToViewPosition(lineNumber, column);
        };
        // -- model
        OneCursor.prototype.getLineContent = function (lineNumber) {
            return this.model.getLineContent(lineNumber);
        };
        // public findWord(position:editorCommon.IEditorPosition, preference:string, skipSyntaxTokens?:boolean): editorCommon.IWordRange {
        // 	return this.helper.findWord(position, preference, skipSyntaxTokens);
        // }
        OneCursor.prototype.findPreviousWordOnLine = function (position) {
            return this.helper.findPreviousWordOnLine(position);
        };
        OneCursor.prototype.findNextWordOnLine = function (position) {
            return this.helper.findNextWordOnLine(position);
        };
        OneCursor.prototype.getLeftOfPosition = function (lineNumber, column) {
            return this.helper.getLeftOfPosition(this.model, lineNumber, column);
        };
        OneCursor.prototype.getRightOfPosition = function (lineNumber, column) {
            return this.helper.getRightOfPosition(this.model, lineNumber, column);
        };
        OneCursor.prototype.getPositionUp = function (lineNumber, column, leftoverVisibleColumns, count, allowMoveOnFirstLine) {
            return this.helper.getPositionUp(this.model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnFirstLine);
        };
        OneCursor.prototype.getPositionDown = function (lineNumber, column, leftoverVisibleColumns, count, allowMoveOnLastLine) {
            return this.helper.getPositionDown(this.model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnLastLine);
        };
        OneCursor.prototype.getColumnAtBeginningOfLine = function (lineNumber, column) {
            return this.helper.getColumnAtBeginningOfLine(this.model, lineNumber, column);
        };
        OneCursor.prototype.getColumnAtEndOfLine = function (lineNumber, column) {
            return this.helper.getColumnAtEndOfLine(this.model, lineNumber, column);
        };
        OneCursor.prototype.getVisibleColumnFromColumn = function (lineNumber, column) {
            return this.helper.visibleColumnFromColumn(this.model, lineNumber, column);
        };
        OneCursor.prototype.getViewVisibleColumnFromColumn = function (viewLineNumber, viewColumn) {
            return this.helper.visibleColumnFromColumn(this.viewModelHelper.viewModel, viewLineNumber, viewColumn);
        };
        // -- view
        OneCursor.prototype.getViewLineCount = function () {
            return this.viewModelHelper.viewModel.getLineCount();
        };
        OneCursor.prototype.getViewLineMaxColumn = function (lineNumber) {
            return this.viewModelHelper.viewModel.getLineMaxColumn(lineNumber);
        };
        OneCursor.prototype.getLeftOfViewPosition = function (lineNumber, column) {
            return this.helper.getLeftOfPosition(this.viewModelHelper.viewModel, lineNumber, column);
        };
        OneCursor.prototype.getRightOfViewPosition = function (lineNumber, column) {
            return this.helper.getRightOfPosition(this.viewModelHelper.viewModel, lineNumber, column);
        };
        OneCursor.prototype.getViewPositionUp = function (lineNumber, column, leftoverVisibleColumns, count, allowMoveOnFirstLine) {
            return this.helper.getPositionUp(this.viewModelHelper.viewModel, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnFirstLine);
        };
        OneCursor.prototype.getViewPositionDown = function (lineNumber, column, leftoverVisibleColumns, count, allowMoveOnLastLine) {
            return this.helper.getPositionDown(this.viewModelHelper.viewModel, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnLastLine);
        };
        OneCursor.prototype.getColumnAtBeginningOfViewLine = function (lineNumber, column) {
            return this.helper.getColumnAtBeginningOfLine(this.viewModelHelper.viewModel, lineNumber, column);
        };
        OneCursor.prototype.getColumnAtEndOfViewLine = function (lineNumber, column) {
            return this.helper.getColumnAtEndOfLine(this.viewModelHelper.viewModel, lineNumber, column);
        };
        OneCursor.prototype.columnSelect = function (fromViewLineNumber, fromViewVisibleColumn, toViewLineNumber, toViewVisibleColumn) {
            var _this = this;
            var r = this.helper.columnSelect(this.viewModelHelper.viewModel, fromViewLineNumber, fromViewVisibleColumn, toViewLineNumber, toViewVisibleColumn);
            return {
                reversed: r.reversed,
                viewSelections: r.viewSelections,
                selections: r.viewSelections.map(function (sel) { return _this.convertViewSelectionToModelSelection(sel); }),
                toLineNumber: toViewLineNumber,
                toVisualColumn: toViewVisibleColumn
            };
        };
        return OneCursor;
    }());
    exports.OneCursor = OneCursor;
    var OneCursorOp = (function () {
        function OneCursorOp() {
        }
        // -------------------- START handlers that simply change cursor state
        OneCursorOp.jumpToBracket = function (cursor, ctx) {
            var bracketDecorations = cursor.getBracketsDecorations();
            if (bracketDecorations.length !== 2) {
                return false;
            }
            var firstBracket = cursor.model.getDecorationRange(bracketDecorations[0]);
            var secondBracket = cursor.model.getDecorationRange(bracketDecorations[1]);
            var position = cursor.getPosition();
            if (Utils.isPositionAtRangeEdges(position, firstBracket) || Utils.isPositionInsideRange(position, firstBracket)) {
                cursor.moveModelPosition(false, secondBracket.endLineNumber, secondBracket.endColumn, 0, false);
                return true;
            }
            if (Utils.isPositionAtRangeEdges(position, secondBracket) || Utils.isPositionInsideRange(position, secondBracket)) {
                cursor.moveModelPosition(false, firstBracket.endLineNumber, firstBracket.endColumn, 0, false);
                return true;
            }
            return false;
        };
        OneCursorOp.moveTo = function (cursor, inSelectionMode, position, viewPosition, eventSource, ctx) {
            var validatedPosition = cursor.model.validatePosition(position);
            var validatedViewPosition;
            if (viewPosition) {
                validatedViewPosition = cursor.validateViewPosition(viewPosition.lineNumber, viewPosition.column, validatedPosition);
            }
            else {
                validatedViewPosition = cursor.convertModelPositionToViewPosition(validatedPosition.lineNumber, validatedPosition.column);
            }
            var reason = (eventSource === 'mouse' ? 'explicit' : null);
            if (eventSource === 'api') {
                ctx.shouldRevealVerticalInCenter = true;
            }
            if (reason) {
                ctx.cursorPositionChangeReason = reason;
            }
            cursor.moveViewPosition(inSelectionMode, validatedViewPosition.lineNumber, validatedViewPosition.column, 0, false);
            return true;
        };
        OneCursorOp._columnSelectOp = function (cursor, toViewLineNumber, toViewVisualColumn) {
            var viewStartSelection = cursor.getViewSelection();
            var fromVisibleColumn = cursor.getVisibleColumnFromColumn(viewStartSelection.selectionStartLineNumber, viewStartSelection.selectionStartColumn);
            return cursor.columnSelect(viewStartSelection.selectionStartLineNumber, fromVisibleColumn, toViewLineNumber, toViewVisualColumn);
        };
        OneCursorOp.columnSelectMouse = function (cursor, position, viewPosition, toViewVisualColumn) {
            var validatedPosition = cursor.model.validatePosition(position);
            var validatedViewPosition;
            if (viewPosition) {
                validatedViewPosition = cursor.validateViewPosition(viewPosition.lineNumber, viewPosition.column, validatedPosition);
            }
            else {
                validatedViewPosition = cursor.convertModelPositionToViewPosition(validatedPosition.lineNumber, validatedPosition.column);
            }
            return this._columnSelectOp(cursor, validatedViewPosition.lineNumber, toViewVisualColumn);
        };
        OneCursorOp.columnSelectLeft = function (cursor, toViewLineNumber, toViewVisualColumn) {
            if (toViewVisualColumn > 1) {
                toViewVisualColumn--;
            }
            return this._columnSelectOp(cursor, toViewLineNumber, toViewVisualColumn);
        };
        OneCursorOp.columnSelectRight = function (cursor, toViewLineNumber, toViewVisualColumn) {
            var maxVisualViewColumn = 0;
            var minViewLineNumber = Math.min(cursor.getViewPosition().lineNumber, toViewLineNumber);
            var maxViewLineNumber = Math.max(cursor.getViewPosition().lineNumber, toViewLineNumber);
            for (var lineNumber = minViewLineNumber; lineNumber <= maxViewLineNumber; lineNumber++) {
                var lineMaxViewColumn = cursor.getViewLineMaxColumn(lineNumber);
                var lineMaxVisualViewColumn = cursor.getViewVisibleColumnFromColumn(lineNumber, lineMaxViewColumn);
                maxVisualViewColumn = Math.max(maxVisualViewColumn, lineMaxVisualViewColumn);
            }
            if (toViewVisualColumn < maxVisualViewColumn) {
                toViewVisualColumn++;
            }
            return this._columnSelectOp(cursor, toViewLineNumber, toViewVisualColumn);
        };
        OneCursorOp.columnSelectUp = function (isPaged, cursor, toViewLineNumber, toViewVisualColumn) {
            var linesCount = isPaged ? cursor.configuration.editor.pageSize : 1;
            toViewLineNumber -= linesCount;
            if (toViewLineNumber < 1) {
                toViewLineNumber = 1;
            }
            return this._columnSelectOp(cursor, toViewLineNumber, toViewVisualColumn);
        };
        OneCursorOp.columnSelectDown = function (isPaged, cursor, toViewLineNumber, toViewVisualColumn) {
            var linesCount = isPaged ? cursor.configuration.editor.pageSize : 1;
            toViewLineNumber += linesCount;
            if (toViewLineNumber > cursor.getViewLineCount()) {
                toViewLineNumber = cursor.getViewLineCount();
            }
            return this._columnSelectOp(cursor, toViewLineNumber, toViewVisualColumn);
        };
        OneCursorOp.moveLeft = function (cursor, inSelectionMode, ctx) {
            var viewLineNumber, viewColumn;
            if (cursor.hasSelection() && !inSelectionMode) {
                // If we are in selection mode, move left without selection cancels selection and puts cursor at the beginning of the selection
                var viewSelection = cursor.getViewSelection();
                var viewSelectionStart = cursor.validateViewPosition(viewSelection.startLineNumber, viewSelection.startColumn, cursor.getSelection().getStartPosition());
                viewLineNumber = viewSelectionStart.lineNumber;
                viewColumn = viewSelectionStart.column;
            }
            else {
                var validatedViewPosition = cursor.getValidViewPosition();
                var r = cursor.getLeftOfViewPosition(validatedViewPosition.lineNumber, validatedViewPosition.column);
                viewLineNumber = r.lineNumber;
                viewColumn = r.column;
            }
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(inSelectionMode, viewLineNumber, viewColumn, 0, true);
            return true;
        };
        OneCursorOp.moveWordLeft = function (cursor, inSelectionMode, wordNavigationType, ctx) {
            var position = cursor.getPosition();
            var lineNumber = position.lineNumber;
            var column = position.column;
            if (column === 1) {
                if (lineNumber > 1) {
                    lineNumber = lineNumber - 1;
                    column = cursor.model.getLineMaxColumn(lineNumber);
                }
            }
            var prevWordOnLine = cursor.findPreviousWordOnLine(new position_1.Position(lineNumber, column));
            if (wordNavigationType === WordNavigationType.WordStart) {
                if (prevWordOnLine) {
                    column = prevWordOnLine.start + 1;
                }
                else {
                    column = 1;
                }
            }
            else {
                if (prevWordOnLine && column <= prevWordOnLine.end + 1) {
                    prevWordOnLine = cursor.findPreviousWordOnLine(new position_1.Position(lineNumber, prevWordOnLine.start + 1));
                }
                if (prevWordOnLine) {
                    column = prevWordOnLine.end + 1;
                }
                else {
                    column = 1;
                }
            }
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveModelPosition(inSelectionMode, lineNumber, column, 0, true);
            return true;
        };
        OneCursorOp.moveRight = function (cursor, inSelectionMode, ctx) {
            var viewLineNumber, viewColumn;
            if (cursor.hasSelection() && !inSelectionMode) {
                // If we are in selection mode, move right without selection cancels selection and puts cursor at the end of the selection
                var viewSelection = cursor.getViewSelection();
                var viewSelectionEnd = cursor.validateViewPosition(viewSelection.endLineNumber, viewSelection.endColumn, cursor.getSelection().getEndPosition());
                viewLineNumber = viewSelectionEnd.lineNumber;
                viewColumn = viewSelectionEnd.column;
            }
            else {
                var validatedViewPosition = cursor.getValidViewPosition();
                var r = cursor.getRightOfViewPosition(validatedViewPosition.lineNumber, validatedViewPosition.column);
                viewLineNumber = r.lineNumber;
                viewColumn = r.column;
            }
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(inSelectionMode, viewLineNumber, viewColumn, 0, true);
            return true;
        };
        OneCursorOp.moveWordRight = function (cursor, inSelectionMode, wordNavigationType, ctx) {
            var position = cursor.getPosition();
            var lineNumber = position.lineNumber;
            var column = position.column;
            if (column === cursor.model.getLineMaxColumn(lineNumber)) {
                if (lineNumber < cursor.model.getLineCount()) {
                    lineNumber = lineNumber + 1;
                    column = 1;
                }
            }
            var nextWordOnLine = cursor.findNextWordOnLine(new position_1.Position(lineNumber, column));
            if (wordNavigationType === WordNavigationType.WordEnd) {
                if (nextWordOnLine) {
                    column = nextWordOnLine.end + 1;
                }
                else {
                    column = cursor.model.getLineMaxColumn(lineNumber);
                }
            }
            else {
                if (nextWordOnLine && column >= nextWordOnLine.start + 1) {
                    nextWordOnLine = cursor.findNextWordOnLine(new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.start + 1;
                }
                else {
                    column = cursor.model.getLineMaxColumn(lineNumber);
                }
            }
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveModelPosition(inSelectionMode, lineNumber, column, 0, true);
            return true;
        };
        OneCursorOp.moveDown = function (cursor, inSelectionMode, isPaged, ctx) {
            var linesCount = isPaged ? cursor.configuration.editor.pageSize : 1;
            var viewLineNumber, viewColumn;
            if (cursor.hasSelection() && !inSelectionMode) {
                // If we are in selection mode, move down acts relative to the end of selection
                var viewSelection = cursor.getViewSelection();
                var viewSelectionEnd = cursor.validateViewPosition(viewSelection.endLineNumber, viewSelection.endColumn, cursor.getSelection().getEndPosition());
                viewLineNumber = viewSelectionEnd.lineNumber;
                viewColumn = viewSelectionEnd.column;
            }
            else {
                var validatedViewPosition = cursor.getValidViewPosition();
                viewLineNumber = validatedViewPosition.lineNumber;
                viewColumn = validatedViewPosition.column;
            }
            var r = cursor.getViewPositionDown(viewLineNumber, viewColumn, cursor.getLeftoverVisibleColumns(), linesCount, true);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(inSelectionMode, r.lineNumber, r.column, r.leftoverVisibleColumns, true);
            return true;
        };
        OneCursorOp.translateDown = function (cursor, ctx) {
            var selection = cursor.getViewSelection();
            var selectionStart = cursor.getViewPositionDown(selection.selectionStartLineNumber, selection.selectionStartColumn, cursor.getSelectionStartLeftoverVisibleColumns(), 1, false);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(false, selectionStart.lineNumber, selectionStart.column, cursor.getLeftoverVisibleColumns(), true);
            var position = cursor.getViewPositionDown(selection.positionLineNumber, selection.positionColumn, cursor.getLeftoverVisibleColumns(), 1, false);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(true, position.lineNumber, position.column, position.leftoverVisibleColumns, true);
            cursor.setSelectionStartLeftoverVisibleColumns(selectionStart.leftoverVisibleColumns);
            return true;
        };
        OneCursorOp.moveUp = function (cursor, inSelectionMode, isPaged, ctx) {
            var linesCount = isPaged ? cursor.configuration.editor.pageSize : 1;
            var viewLineNumber, viewColumn;
            if (cursor.hasSelection() && !inSelectionMode) {
                // If we are in selection mode, move up acts relative to the beginning of selection
                var viewSelection = cursor.getViewSelection();
                var viewSelectionStart = cursor.validateViewPosition(viewSelection.startLineNumber, viewSelection.startColumn, cursor.getSelection().getStartPosition());
                viewLineNumber = viewSelectionStart.lineNumber;
                viewColumn = viewSelectionStart.column;
            }
            else {
                var validatedViewPosition = cursor.getValidViewPosition();
                viewLineNumber = validatedViewPosition.lineNumber;
                viewColumn = validatedViewPosition.column;
            }
            var r = cursor.getViewPositionUp(viewLineNumber, viewColumn, cursor.getLeftoverVisibleColumns(), linesCount, true);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(inSelectionMode, r.lineNumber, r.column, r.leftoverVisibleColumns, true);
            return true;
        };
        OneCursorOp.translateUp = function (cursor, ctx) {
            var selection = cursor.getViewSelection();
            var selectionStart = cursor.getViewPositionUp(selection.selectionStartLineNumber, selection.selectionStartColumn, cursor.getSelectionStartLeftoverVisibleColumns(), 1, false);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(false, selectionStart.lineNumber, selectionStart.column, cursor.getLeftoverVisibleColumns(), true);
            var position = cursor.getViewPositionUp(selection.positionLineNumber, selection.positionColumn, cursor.getLeftoverVisibleColumns(), 1, false);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(true, position.lineNumber, position.column, position.leftoverVisibleColumns, true);
            cursor.setSelectionStartLeftoverVisibleColumns(selectionStart.leftoverVisibleColumns);
            return true;
        };
        OneCursorOp.moveToBeginningOfLine = function (cursor, inSelectionMode, ctx) {
            var validatedViewPosition = cursor.getValidViewPosition();
            var viewLineNumber = validatedViewPosition.lineNumber;
            var viewColumn = validatedViewPosition.column;
            viewColumn = cursor.getColumnAtBeginningOfViewLine(viewLineNumber, viewColumn);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(inSelectionMode, viewLineNumber, viewColumn, 0, true);
            return true;
        };
        OneCursorOp.moveToEndOfLine = function (cursor, inSelectionMode, ctx) {
            var validatedViewPosition = cursor.getValidViewPosition();
            var viewLineNumber = validatedViewPosition.lineNumber;
            var viewColumn = validatedViewPosition.column;
            viewColumn = cursor.getColumnAtEndOfViewLine(viewLineNumber, viewColumn);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveViewPosition(inSelectionMode, viewLineNumber, viewColumn, 0, true);
            return true;
        };
        OneCursorOp.expandLineSelection = function (cursor, ctx) {
            ctx.cursorPositionChangeReason = 'explicit';
            var viewSel = cursor.getViewSelection();
            var viewStartLineNumber = viewSel.startLineNumber;
            var viewStartColumn = viewSel.startColumn;
            var viewEndLineNumber = viewSel.endLineNumber;
            var viewEndColumn = viewSel.endColumn;
            var viewEndMaxColumn = cursor.getViewLineMaxColumn(viewEndLineNumber);
            if (viewStartColumn !== 1 || viewEndColumn !== viewEndMaxColumn) {
                viewStartColumn = 1;
                viewEndColumn = viewEndMaxColumn;
            }
            else {
                // Expand selection with one more line down
                var moveResult = cursor.getViewPositionDown(viewEndLineNumber, viewEndColumn, 0, 1, true);
                viewEndLineNumber = moveResult.lineNumber;
                viewEndColumn = cursor.getViewLineMaxColumn(viewEndLineNumber);
            }
            cursor.moveViewPosition(false, viewStartLineNumber, viewStartColumn, 0, true);
            cursor.moveViewPosition(true, viewEndLineNumber, viewEndColumn, 0, true);
            return true;
        };
        OneCursorOp.moveToBeginningOfBuffer = function (cursor, inSelectionMode, ctx) {
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveModelPosition(inSelectionMode, 1, 1, 0, true);
            return true;
        };
        OneCursorOp.moveToEndOfBuffer = function (cursor, inSelectionMode, ctx) {
            var lastLineNumber = cursor.model.getLineCount();
            var lastColumn = cursor.model.getLineMaxColumn(lastLineNumber);
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveModelPosition(inSelectionMode, lastLineNumber, lastColumn, 0, true);
            return true;
        };
        OneCursorOp.selectAll = function (cursor, ctx) {
            var selectEntireBuffer = true;
            var newSelectionStartLineNumber, newSelectionStartColumn, newPositionLineNumber, newPositionColumn;
            if (cursor.model.hasEditableRange()) {
                // Toggle between selecting editable range and selecting the entire buffer
                var editableRange = cursor.model.getEditableRange();
                var selection = cursor.getSelection();
                if (!selection.equalsRange(editableRange)) {
                    // Selection is not editable range => select editable range
                    selectEntireBuffer = false;
                    newSelectionStartLineNumber = editableRange.startLineNumber;
                    newSelectionStartColumn = editableRange.startColumn;
                    newPositionLineNumber = editableRange.endLineNumber;
                    newPositionColumn = editableRange.endColumn;
                }
            }
            if (selectEntireBuffer) {
                newSelectionStartLineNumber = 1;
                newSelectionStartColumn = 1;
                newPositionLineNumber = cursor.model.getLineCount();
                newPositionColumn = cursor.model.getLineMaxColumn(newPositionLineNumber);
            }
            cursor.moveModelPosition(false, newSelectionStartLineNumber, newSelectionStartColumn, 0, false);
            cursor.moveModelPosition(true, newPositionLineNumber, newPositionColumn, 0, false);
            ctx.shouldReveal = false;
            ctx.shouldRevealHorizontal = false;
            return true;
        };
        OneCursorOp.line = function (cursor, inSelectionMode, _position, _viewPosition, ctx) {
            // TODO@Alex -> select in editable range
            var position = cursor.validatePosition(_position);
            var viewPosition = (_viewPosition ?
                cursor.validateViewPosition(_viewPosition.lineNumber, _viewPosition.column, position)
                : cursor.convertModelPositionToViewPosition(position.lineNumber, position.column));
            ctx.cursorPositionChangeReason = 'explicit';
            ctx.shouldRevealHorizontal = false;
            if (!inSelectionMode || !cursor.hasSelection()) {
                // Entering line selection for the first time
                var selectToLineNumber = position.lineNumber + 1;
                var selectToColumn = 1;
                if (selectToLineNumber > cursor.model.getLineCount()) {
                    selectToLineNumber = cursor.model.getLineCount();
                    selectToColumn = cursor.model.getLineMaxColumn(selectToLineNumber);
                }
                var selectionStartRange = new range_1.Range(position.lineNumber, 1, selectToLineNumber, selectToColumn);
                var r1 = cursor.convertModelPositionToViewPosition(position.lineNumber, 1);
                var r2 = cursor.convertModelPositionToViewPosition(selectToLineNumber, selectToColumn);
                cursor.setSelectionStart(selectionStartRange, new range_1.Range(r1.lineNumber, r1.column, r2.lineNumber, r2.column));
                cursor.moveModelPosition(cursor.hasSelection(), selectionStartRange.endLineNumber, selectionStartRange.endColumn, 0, false);
                return true;
            }
            else {
                // Continuing line selection
                var enteringLineNumber = cursor.getSelectionStart().getStartPosition().lineNumber;
                if (position.lineNumber < enteringLineNumber) {
                    cursor.moveViewPosition(cursor.hasSelection(), viewPosition.lineNumber, 1, 0, false);
                }
                else if (position.lineNumber > enteringLineNumber) {
                    var selectToViewLineNumber = viewPosition.lineNumber + 1;
                    var selectToViewColumn = 1;
                    if (selectToViewLineNumber > cursor.getViewLineCount()) {
                        selectToViewLineNumber = cursor.getViewLineCount();
                        selectToViewColumn = cursor.getViewLineMaxColumn(selectToViewLineNumber);
                    }
                    cursor.moveViewPosition(cursor.hasSelection(), selectToViewLineNumber, selectToViewColumn, 0, false);
                }
                else {
                    var endPositionOfSelectionStart = cursor.getSelectionStart().getEndPosition();
                    cursor.moveModelPosition(cursor.hasSelection(), endPositionOfSelectionStart.lineNumber, endPositionOfSelectionStart.column, 0, false);
                }
                return true;
            }
        };
        OneCursorOp.word = function (cursor, inSelectionMode, position, ctx) {
            // TODO@Alex -> select in editable range
            var validatedPosition = cursor.validatePosition(position);
            var prevWord = cursor.findPreviousWordOnLine(validatedPosition);
            var isInPrevWord = (prevWord && prevWord.wordType === WordType.Regular && prevWord.start < validatedPosition.column - 1 && validatedPosition.column - 1 <= prevWord.end);
            var nextWord = cursor.findNextWordOnLine(validatedPosition);
            var isInNextWord = (nextWord && nextWord.wordType === WordType.Regular && nextWord.start < validatedPosition.column - 1 && validatedPosition.column - 1 <= nextWord.end);
            var lineNumber;
            var column;
            if (!inSelectionMode || !cursor.hasSelection()) {
                var startColumn = void 0;
                var endColumn = void 0;
                if (isInPrevWord) {
                    startColumn = prevWord.start + 1;
                    endColumn = prevWord.end + 1;
                }
                else if (isInNextWord) {
                    startColumn = nextWord.start + 1;
                    endColumn = nextWord.end + 1;
                }
                else {
                    if (prevWord) {
                        startColumn = prevWord.end + 1;
                    }
                    else {
                        startColumn = 1;
                    }
                    if (nextWord) {
                        endColumn = nextWord.start + 1;
                    }
                    else {
                        endColumn = cursor.model.getLineMaxColumn(validatedPosition.lineNumber);
                    }
                }
                var selectionStartRange = new range_1.Range(validatedPosition.lineNumber, startColumn, validatedPosition.lineNumber, endColumn);
                var r1 = cursor.convertModelPositionToViewPosition(validatedPosition.lineNumber, startColumn);
                var r2 = cursor.convertModelPositionToViewPosition(validatedPosition.lineNumber, endColumn);
                cursor.setSelectionStart(selectionStartRange, new range_1.Range(r1.lineNumber, r1.column, r2.lineNumber, r2.column));
                lineNumber = selectionStartRange.endLineNumber;
                column = selectionStartRange.endColumn;
            }
            else {
                var startColumn = void 0;
                var endColumn = void 0;
                if (isInPrevWord) {
                    startColumn = prevWord.start + 1;
                    endColumn = prevWord.end + 1;
                }
                else if (isInNextWord) {
                    startColumn = nextWord.start + 1;
                    endColumn = nextWord.end + 1;
                }
                else {
                    startColumn = validatedPosition.column;
                    endColumn = validatedPosition.column;
                }
                lineNumber = validatedPosition.lineNumber;
                if (validatedPosition.isBeforeOrEqual(cursor.getSelectionStart().getStartPosition())) {
                    column = startColumn;
                    var possiblePosition = new position_1.Position(lineNumber, column);
                    if (cursor.getSelectionStart().containsPosition(possiblePosition)) {
                        column = cursor.getSelectionStart().endColumn;
                    }
                }
                else {
                    column = endColumn;
                    var possiblePosition = new position_1.Position(lineNumber, column);
                    if (cursor.getSelectionStart().containsPosition(possiblePosition)) {
                        column = cursor.getSelectionStart().startColumn;
                    }
                }
            }
            ctx.cursorPositionChangeReason = 'explicit';
            cursor.moveModelPosition(cursor.hasSelection(), lineNumber, column, 0, false);
            return true;
        };
        OneCursorOp.cancelSelection = function (cursor, ctx) {
            if (!cursor.hasSelection()) {
                return false;
            }
            cursor.collapseSelection();
            return true;
        };
        // -------------------- STOP handlers that simply change cursor state
        // -------------------- START type interceptors & co.
        OneCursorOp._typeInterceptorEnter = function (cursor, ch, ctx) {
            if (ch !== '\n') {
                return false;
            }
            return this._enter(cursor, false, ctx);
        };
        OneCursorOp.lineInsertBefore = function (cursor, ctx) {
            var lineNumber = cursor.getPosition().lineNumber;
            if (lineNumber === 1) {
                ctx.executeCommand = new replaceCommand_1.ReplaceCommandWithoutChangingPosition(new range_1.Range(1, 1, 1, 1), '\n');
                return true;
            }
            lineNumber--;
            var column = cursor.model.getLineMaxColumn(lineNumber);
            return this._enter(cursor, false, ctx, new position_1.Position(lineNumber, column), new range_1.Range(lineNumber, column, lineNumber, column));
        };
        OneCursorOp.lineInsertAfter = function (cursor, ctx) {
            var position = cursor.getPosition();
            var column = cursor.model.getLineMaxColumn(position.lineNumber);
            return this._enter(cursor, false, ctx, new position_1.Position(position.lineNumber, column), new range_1.Range(position.lineNumber, column, position.lineNumber, column));
        };
        OneCursorOp.lineBreakInsert = function (cursor, ctx) {
            return this._enter(cursor, true, ctx);
        };
        OneCursorOp._enter = function (cursor, keepPosition, ctx, position, range) {
            if (typeof position === 'undefined') {
                position = cursor.getPosition();
            }
            if (typeof range === 'undefined') {
                range = cursor.getSelection();
            }
            ctx.shouldPushStackElementBefore = true;
            var r = onEnter_1.getEnterActionAtPosition(cursor.model, position.lineNumber, position.column);
            var enterAction = r.enterAction;
            var indentation = r.indentation;
            if (enterAction.indentAction === modes_1.IndentAction.None) {
                // Nothing special
                this.actualType(cursor, '\n' + cursor.model.normalizeIndentation(indentation + enterAction.appendText), keepPosition, ctx, range);
            }
            else if (enterAction.indentAction === modes_1.IndentAction.Indent) {
                // Indent once
                this.actualType(cursor, '\n' + cursor.model.normalizeIndentation(indentation + enterAction.appendText), keepPosition, ctx, range);
            }
            else if (enterAction.indentAction === modes_1.IndentAction.IndentOutdent) {
                // Ultra special
                var normalIndent = cursor.model.normalizeIndentation(indentation);
                var increasedIndent = cursor.model.normalizeIndentation(indentation + enterAction.appendText);
                var typeText = '\n' + increasedIndent + '\n' + normalIndent;
                if (keepPosition) {
                    ctx.executeCommand = new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, typeText);
                }
                else {
                    ctx.executeCommand = new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, typeText, -1, increasedIndent.length - normalIndent.length);
                }
            }
            else if (enterAction.indentAction === modes_1.IndentAction.Outdent) {
                var desiredIndentCount = shiftCommand_1.ShiftCommand.unshiftIndentCount(indentation, indentation.length + 1, cursor.model.getOptions().tabSize);
                var actualIndentation = '';
                for (var i = 0; i < desiredIndentCount; i++) {
                    actualIndentation += '\t';
                }
                this.actualType(cursor, '\n' + cursor.model.normalizeIndentation(actualIndentation + enterAction.appendText), keepPosition, ctx, range);
            }
            return true;
        };
        OneCursorOp._typeInterceptorAutoClosingCloseChar = function (cursor, ch, ctx) {
            if (!cursor.configuration.editor.autoClosingBrackets) {
                return false;
            }
            var selection = cursor.getSelection();
            if (!selection.isEmpty() || !cursor.modeConfiguration.autoClosingPairsClose.hasOwnProperty(ch)) {
                return false;
            }
            var position = cursor.getPosition();
            var lineText = cursor.model.getLineContent(position.lineNumber);
            var beforeCharacter = lineText[position.column - 1];
            if (beforeCharacter !== ch) {
                return false;
            }
            var typeSelection = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1);
            ctx.executeCommand = new replaceCommand_1.ReplaceCommand(typeSelection, ch);
            return true;
        };
        OneCursorOp._typeInterceptorAutoClosingOpenChar = function (cursor, ch, ctx) {
            if (!cursor.configuration.editor.autoClosingBrackets) {
                return false;
            }
            var selection = cursor.getSelection();
            if (!selection.isEmpty() || !cursor.modeConfiguration.autoClosingPairsOpen.hasOwnProperty(ch)) {
                return false;
            }
            var richEditSupport = cursor.model.getMode().richEditSupport;
            if (!richEditSupport || !richEditSupport.characterPair) {
                return false;
            }
            var position = cursor.getPosition();
            var lineText = cursor.model.getLineContent(position.lineNumber);
            var beforeCharacter = lineText[position.column - 1];
            // Only consider auto closing the pair if a space follows or if another autoclosed pair follows
            if (beforeCharacter) {
                var isBeforeCloseBrace = false;
                for (var closeBrace in cursor.modeConfiguration.autoClosingPairsClose) {
                    if (beforeCharacter === closeBrace) {
                        isBeforeCloseBrace = true;
                        break;
                    }
                }
                if (!isBeforeCloseBrace && !/\s/.test(beforeCharacter)) {
                    return false;
                }
            }
            var lineContext = cursor.model.getLineContext(position.lineNumber);
            var shouldAutoClosePair = false;
            try {
                shouldAutoClosePair = richEditSupport.characterPair.shouldAutoClosePair(ch, lineContext, position.column - 1);
            }
            catch (e) {
                errors_1.onUnexpectedError(e);
            }
            if (!shouldAutoClosePair) {
                return false;
            }
            ctx.shouldPushStackElementBefore = true;
            var closeCharacter = cursor.modeConfiguration.autoClosingPairsOpen[ch];
            ctx.executeCommand = new replaceCommand_1.ReplaceCommandWithOffsetCursorState(selection, ch + closeCharacter, 0, -closeCharacter.length);
            return true;
        };
        OneCursorOp._typeInterceptorSurroundSelection = function (cursor, ch, ctx) {
            if (!cursor.configuration.editor.autoClosingBrackets) {
                return false;
            }
            var selection = cursor.getSelection();
            if (selection.isEmpty() || !cursor.modeConfiguration.surroundingPairs.hasOwnProperty(ch)) {
                return false;
            }
            var selectionContainsOnlyWhitespace = true, lineNumber, startIndex, endIndex, charIndex, charCode, lineText, _tab = '\t'.charCodeAt(0), _space = ' '.charCodeAt(0);
            for (lineNumber = selection.startLineNumber; lineNumber <= selection.endLineNumber; lineNumber++) {
                lineText = cursor.model.getLineContent(lineNumber);
                startIndex = (lineNumber === selection.startLineNumber ? selection.startColumn - 1 : 0);
                endIndex = (lineNumber === selection.endLineNumber ? selection.endColumn - 1 : lineText.length);
                for (charIndex = startIndex; charIndex < endIndex; charIndex++) {
                    charCode = lineText.charCodeAt(charIndex);
                    if (charCode !== _tab && charCode !== _space) {
                        selectionContainsOnlyWhitespace = false;
                        // Break outer loop
                        lineNumber = selection.endLineNumber + 1;
                        // Break inner loop
                        charIndex = endIndex;
                    }
                }
            }
            if (selectionContainsOnlyWhitespace) {
                return false;
            }
            var closeCharacter = cursor.modeConfiguration.surroundingPairs[ch];
            ctx.shouldPushStackElementBefore = true;
            ctx.shouldPushStackElementAfter = true;
            ctx.executeCommand = new surroundSelectionCommand_1.SurroundSelectionCommand(selection, ch, closeCharacter);
            return true;
        };
        OneCursorOp._typeInterceptorElectricChar = function (cursor, ch, ctx) {
            var _this = this;
            if (!cursor.modeConfiguration.electricChars.hasOwnProperty(ch)) {
                return false;
            }
            ctx.postOperationRunnable = function (postOperationCtx) { return _this._typeInterceptorElectricCharRunnable(cursor, postOperationCtx); };
            return this.actualType(cursor, ch, false, ctx);
        };
        OneCursorOp._typeInterceptorElectricCharRunnable = function (cursor, ctx) {
            var position = cursor.getPosition();
            var lineText = cursor.model.getLineContent(position.lineNumber);
            var lineContext = cursor.model.getLineContext(position.lineNumber);
            var electricAction;
            var richEditSupport = cursor.model.getMode().richEditSupport;
            if (richEditSupport && richEditSupport.electricCharacter) {
                try {
                    electricAction = richEditSupport.electricCharacter.onElectricCharacter(lineContext, position.column - 2);
                }
                catch (e) {
                    errors_1.onUnexpectedError(e);
                }
            }
            if (electricAction) {
                var matchOpenBracket = electricAction.matchOpenBracket;
                var appendText = electricAction.appendText;
                if (matchOpenBracket) {
                    var match = cursor.model.findMatchingBracketUp(matchOpenBracket, {
                        lineNumber: position.lineNumber,
                        column: position.column - matchOpenBracket.length
                    });
                    if (match) {
                        var matchLineNumber = match.startLineNumber;
                        var matchLine = cursor.model.getLineContent(matchLineNumber);
                        var matchLineIndentation = strings.getLeadingWhitespace(matchLine);
                        var newIndentation = cursor.model.normalizeIndentation(matchLineIndentation);
                        var lineFirstNonBlankColumn = cursor.model.getLineFirstNonWhitespaceColumn(position.lineNumber) || position.column;
                        var oldIndentation = lineText.substring(0, lineFirstNonBlankColumn - 1);
                        if (oldIndentation !== newIndentation) {
                            var prefix = lineText.substring(lineFirstNonBlankColumn - 1, position.column - 1);
                            var typeText = newIndentation + prefix;
                            var typeSelection = new range_1.Range(position.lineNumber, 1, position.lineNumber, position.column);
                            ctx.shouldPushStackElementAfter = true;
                            ctx.executeCommand = new replaceCommand_1.ReplaceCommand(typeSelection, typeText);
                        }
                    }
                }
                else if (appendText) {
                    var columnDeltaOffset = -appendText.length;
                    if (electricAction.advanceCount) {
                        columnDeltaOffset += electricAction.advanceCount;
                    }
                    ctx.shouldPushStackElementAfter = true;
                    ctx.executeCommand = new replaceCommand_1.ReplaceCommandWithOffsetCursorState(cursor.getSelection(), appendText, 0, columnDeltaOffset);
                }
            }
        };
        OneCursorOp.actualType = function (cursor, text, keepPosition, ctx, range) {
            if (typeof range === 'undefined') {
                range = cursor.getSelection();
            }
            if (keepPosition) {
                ctx.executeCommand = new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, text);
            }
            else {
                ctx.executeCommand = new replaceCommand_1.ReplaceCommand(range, text);
            }
            return true;
        };
        OneCursorOp.type = function (cursor, ch, ctx) {
            if (this._typeInterceptorEnter(cursor, ch, ctx)) {
                return true;
            }
            if (this._typeInterceptorAutoClosingCloseChar(cursor, ch, ctx)) {
                return true;
            }
            if (this._typeInterceptorAutoClosingOpenChar(cursor, ch, ctx)) {
                return true;
            }
            if (this._typeInterceptorSurroundSelection(cursor, ch, ctx)) {
                return true;
            }
            if (this._typeInterceptorElectricChar(cursor, ch, ctx)) {
                return true;
            }
            return this.actualType(cursor, ch, false, ctx);
        };
        OneCursorOp.replacePreviousChar = function (cursor, txt, replaceCharCnt, ctx) {
            var pos = cursor.getPosition();
            var range;
            var startColumn = Math.max(1, pos.column - replaceCharCnt);
            range = new range_1.Range(pos.lineNumber, startColumn, pos.lineNumber, pos.column);
            ctx.executeCommand = new replaceCommand_1.ReplaceCommand(range, txt);
            return true;
        };
        OneCursorOp._goodIndentForLine = function (cursor, lineNumber) {
            var lastLineNumber = lineNumber - 1;
            for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
                var lineText = cursor.model.getLineContent(lastLineNumber);
                var nonWhitespaceIdx = strings.lastNonWhitespaceIndex(lineText);
                if (nonWhitespaceIdx >= 0) {
                    break;
                }
            }
            if (lastLineNumber < 1) {
                // No previous line with content found
                return '\t';
            }
            var r = onEnter_1.getEnterActionAtPosition(cursor.model, lastLineNumber, cursor.model.getLineMaxColumn(lastLineNumber));
            var indentation;
            if (r.enterAction.indentAction === modes_1.IndentAction.Outdent) {
                var modelOpts = cursor.model.getOptions();
                var desiredIndentCount = shiftCommand_1.ShiftCommand.unshiftIndentCount(r.indentation, r.indentation.length, modelOpts.tabSize);
                indentation = '';
                for (var i = 0; i < desiredIndentCount; i++) {
                    indentation += '\t';
                }
                indentation = cursor.model.normalizeIndentation(indentation);
            }
            else {
                indentation = r.indentation;
            }
            var result = indentation + r.enterAction.appendText;
            if (result.length === 0) {
                // good position is at column 1, but we gotta do something...
                return '\t';
            }
            return result;
        };
        OneCursorOp.tab = function (cursor, ctx) {
            var selection = cursor.getSelection();
            if (selection.isEmpty()) {
                var typeText = '';
                if (cursor.model.getLineMaxColumn(selection.startLineNumber) === 1) {
                    // Line is empty => indent straight to the right place
                    typeText = cursor.model.normalizeIndentation(this._goodIndentForLine(cursor, selection.startLineNumber));
                }
                else {
                    var position = cursor.getPosition();
                    var modelOpts = cursor.model.getOptions();
                    if (modelOpts.insertSpaces) {
                        var visibleColumnFromColumn = cursor.getVisibleColumnFromColumn(position.lineNumber, position.column);
                        var tabSize = modelOpts.tabSize;
                        var spacesCnt = tabSize - (visibleColumnFromColumn % tabSize);
                        for (var i = 0; i < spacesCnt; i++) {
                            typeText += ' ';
                        }
                    }
                    else {
                        typeText = '\t';
                    }
                }
                ctx.executeCommand = new replaceCommand_1.ReplaceCommand(selection, typeText);
                return true;
            }
            else {
                return this.indent(cursor, ctx);
            }
        };
        OneCursorOp.indent = function (cursor, ctx) {
            var selection = cursor.getSelection();
            ctx.shouldPushStackElementBefore = true;
            ctx.shouldPushStackElementAfter = true;
            ctx.executeCommand = new shiftCommand_1.ShiftCommand(selection, {
                isUnshift: false,
                tabSize: cursor.model.getOptions().tabSize,
                oneIndent: cursor.model.getOneIndent()
            });
            ctx.shouldRevealHorizontal = false;
            return true;
        };
        OneCursorOp.outdent = function (cursor, ctx) {
            var selection = cursor.getSelection();
            ctx.shouldPushStackElementBefore = true;
            ctx.shouldPushStackElementAfter = true;
            ctx.executeCommand = new shiftCommand_1.ShiftCommand(selection, {
                isUnshift: true,
                tabSize: cursor.model.getOptions().tabSize,
                oneIndent: cursor.model.getOneIndent()
            });
            ctx.shouldRevealHorizontal = false;
            return true;
        };
        OneCursorOp.paste = function (cursor, text, pasteOnNewLine, ctx) {
            var position = cursor.getPosition();
            ctx.cursorPositionChangeReason = 'paste';
            if (pasteOnNewLine && text.charAt(text.length - 1) === '\n') {
                if (text.indexOf('\n') === text.length - 1) {
                    // Paste entire line at the beginning of line
                    var typeSelection = new range_1.Range(position.lineNumber, 1, position.lineNumber, 1);
                    ctx.executeCommand = new replaceCommand_1.ReplaceCommand(typeSelection, text);
                    return true;
                }
            }
            ctx.executeCommand = new replaceCommand_1.ReplaceCommand(cursor.getSelection(), text);
            return true;
        };
        // -------------------- END type interceptors & co.
        // -------------------- START delete handlers & co.
        OneCursorOp._autoClosingPairDelete = function (cursor, ctx) {
            // Returns true if delete was handled.
            if (!cursor.configuration.editor.autoClosingBrackets) {
                return false;
            }
            if (!cursor.getSelection().isEmpty()) {
                return false;
            }
            var position = cursor.getPosition();
            var lineText = cursor.model.getLineContent(position.lineNumber);
            var character = lineText[position.column - 2];
            if (!cursor.modeConfiguration.autoClosingPairsOpen.hasOwnProperty(character)) {
                return false;
            }
            var afterCharacter = lineText[position.column - 1];
            var closeCharacter = cursor.modeConfiguration.autoClosingPairsOpen[character];
            if (afterCharacter !== closeCharacter) {
                return false;
            }
            var deleteSelection = new range_1.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column + 1);
            ctx.executeCommand = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
            return true;
        };
        OneCursorOp.deleteLeft = function (cursor, ctx) {
            if (this._autoClosingPairDelete(cursor, ctx)) {
                // This was a case for an auto-closing pair delete
                return true;
            }
            var deleteSelection = cursor.getSelection();
            if (deleteSelection.isEmpty()) {
                var position = cursor.getPosition();
                var leftOfPosition = cursor.getLeftOfPosition(position.lineNumber, position.column);
                deleteSelection = new range_1.Range(leftOfPosition.lineNumber, leftOfPosition.column, position.lineNumber, position.column);
            }
            if (deleteSelection.isEmpty()) {
                // Probably at beginning of file => ignore
                return true;
            }
            if (deleteSelection.startLineNumber !== deleteSelection.endLineNumber) {
                ctx.shouldPushStackElementBefore = true;
            }
            ctx.executeCommand = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
            return true;
        };
        OneCursorOp._findLastNonWhitespaceChar = function (str, startIndex) {
            for (var chIndex = startIndex; chIndex >= 0; chIndex--) {
                var ch = str.charAt(chIndex);
                if (ch !== ' ' && ch !== '\t') {
                    return chIndex;
                }
            }
            return -1;
        };
        OneCursorOp.deleteWordLeftWhitespace = function (cursor, ctx) {
            var position = cursor.getPosition();
            var lineContent = cursor.getLineContent(position.lineNumber);
            var startIndex = position.column - 2;
            var lastNonWhitespace = this._findLastNonWhitespaceChar(lineContent, startIndex);
            if (lastNonWhitespace + 1 < startIndex) {
                // bingo
                ctx.executeCommand = new replaceCommand_1.ReplaceCommand(new range_1.Range(position.lineNumber, lastNonWhitespace + 2, position.lineNumber, position.column), '');
                return true;
            }
            return false;
        };
        OneCursorOp.deleteWordLeft = function (cursor, whitespaceHeuristics, wordNavigationType, ctx) {
            if (this._autoClosingPairDelete(cursor, ctx)) {
                // This was a case for an auto-closing pair delete
                return true;
            }
            var selection = cursor.getSelection();
            if (selection.isEmpty()) {
                var position = cursor.getPosition();
                var lineNumber = position.lineNumber;
                var column = position.column;
                if (lineNumber === 1 && column === 1) {
                    // Ignore deleting at beginning of file
                    return true;
                }
                if (whitespaceHeuristics && this.deleteWordLeftWhitespace(cursor, ctx)) {
                    return true;
                }
                var prevWordOnLine = cursor.findPreviousWordOnLine(position);
                if (wordNavigationType === WordNavigationType.WordStart) {
                    if (prevWordOnLine) {
                        column = prevWordOnLine.start + 1;
                    }
                    else {
                        column = 1;
                    }
                }
                else {
                    if (prevWordOnLine && column <= prevWordOnLine.end + 1) {
                        prevWordOnLine = cursor.findPreviousWordOnLine(new position_1.Position(lineNumber, prevWordOnLine.start + 1));
                    }
                    if (prevWordOnLine) {
                        column = prevWordOnLine.end + 1;
                    }
                    else {
                        column = 1;
                    }
                }
                var deleteSelection = new range_1.Range(lineNumber, column, lineNumber, position.column);
                if (!deleteSelection.isEmpty()) {
                    ctx.executeCommand = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
                    return true;
                }
            }
            return this.deleteLeft(cursor, ctx);
        };
        OneCursorOp.deleteRight = function (cursor, ctx) {
            var deleteSelection = cursor.getSelection();
            if (deleteSelection.isEmpty()) {
                var position = cursor.getPosition();
                var rightOfPosition = cursor.getRightOfPosition(position.lineNumber, position.column);
                deleteSelection = new range_1.Range(rightOfPosition.lineNumber, rightOfPosition.column, position.lineNumber, position.column);
            }
            if (deleteSelection.isEmpty()) {
                // Probably at end of file => ignore
                return true;
            }
            if (deleteSelection.startLineNumber !== deleteSelection.endLineNumber) {
                ctx.shouldPushStackElementBefore = true;
            }
            ctx.executeCommand = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
            return true;
        };
        OneCursorOp._findFirstNonWhitespaceChar = function (str, startIndex) {
            var len = str.length;
            for (var chIndex = startIndex; chIndex < len; chIndex++) {
                var ch = str.charAt(chIndex);
                if (ch !== ' ' && ch !== '\t') {
                    return chIndex;
                }
            }
            return len;
        };
        OneCursorOp.deleteWordRightWhitespace = function (cursor, ctx) {
            var position = cursor.getPosition();
            var lineContent = cursor.getLineContent(position.lineNumber);
            var startIndex = position.column - 1;
            var firstNonWhitespace = this._findFirstNonWhitespaceChar(lineContent, startIndex);
            if (startIndex + 1 < firstNonWhitespace) {
                // bingo
                ctx.executeCommand = new replaceCommand_1.ReplaceCommand(new range_1.Range(position.lineNumber, position.column, position.lineNumber, firstNonWhitespace + 1), '');
                return true;
            }
            return false;
        };
        OneCursorOp.deleteWordRight = function (cursor, whitespaceHeuristics, wordNavigationType, ctx) {
            var selection = cursor.getSelection();
            if (selection.isEmpty()) {
                var position = cursor.getPosition();
                var lineNumber = position.lineNumber;
                var column = position.column;
                var lineCount = cursor.model.getLineCount();
                var maxColumn = cursor.model.getLineMaxColumn(lineNumber);
                if (lineNumber === lineCount && column === maxColumn) {
                    // Ignore deleting at end of file
                    return true;
                }
                if (whitespaceHeuristics && this.deleteWordRightWhitespace(cursor, ctx)) {
                    return true;
                }
                var nextWordOnLine = cursor.findNextWordOnLine(position);
                if (wordNavigationType === WordNavigationType.WordEnd) {
                    if (nextWordOnLine) {
                        column = nextWordOnLine.end + 1;
                    }
                    else {
                        column = maxColumn;
                    }
                }
                else {
                    if (nextWordOnLine && column >= nextWordOnLine.start + 1) {
                        nextWordOnLine = cursor.findNextWordOnLine(new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                    }
                    if (nextWordOnLine) {
                        column = nextWordOnLine.start + 1;
                    }
                    else {
                        column = maxColumn;
                    }
                }
                var deleteSelection = new range_1.Range(lineNumber, column, lineNumber, position.column);
                if (!deleteSelection.isEmpty()) {
                    ctx.executeCommand = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
                    return true;
                }
            }
            // fall back to normal deleteRight behavior
            return this.deleteRight(cursor, ctx);
        };
        OneCursorOp.deleteAllLeft = function (cursor, ctx) {
            if (this._autoClosingPairDelete(cursor, ctx)) {
                // This was a case for an auto-closing pair delete
                return true;
            }
            var selection = cursor.getSelection();
            if (selection.isEmpty()) {
                var position = cursor.getPosition();
                var lineNumber = position.lineNumber;
                var column = position.column;
                if (column === 1) {
                    // Ignore deleting at beginning of line
                    return true;
                }
                var deleteSelection = new range_1.Range(lineNumber, 1, lineNumber, column);
                if (!deleteSelection.isEmpty()) {
                    ctx.executeCommand = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
                    return true;
                }
            }
            return this.deleteLeft(cursor, ctx);
        };
        OneCursorOp.deleteAllRight = function (cursor, ctx) {
            var selection = cursor.getSelection();
            if (selection.isEmpty()) {
                var position = cursor.getPosition();
                var lineNumber = position.lineNumber;
                var column = position.column;
                var maxColumn = cursor.model.getLineMaxColumn(lineNumber);
                if (column === maxColumn) {
                    // Ignore deleting at end of file
                    return true;
                }
                var deleteSelection = new range_1.Range(lineNumber, column, lineNumber, maxColumn);
                if (!deleteSelection.isEmpty()) {
                    ctx.executeCommand = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
                    return true;
                }
            }
            return this.deleteRight(cursor, ctx);
        };
        OneCursorOp.cut = function (cursor, enableEmptySelectionClipboard, ctx) {
            var selection = cursor.getSelection();
            if (selection.isEmpty()) {
                if (enableEmptySelectionClipboard) {
                    // This is a full line cut
                    var position = cursor.getPosition();
                    var startLineNumber, startColumn, endLineNumber, endColumn;
                    if (position.lineNumber < cursor.model.getLineCount()) {
                        // Cutting a line in the middle of the model
                        startLineNumber = position.lineNumber;
                        startColumn = 1;
                        endLineNumber = position.lineNumber + 1;
                        endColumn = 1;
                    }
                    else if (position.lineNumber > 1) {
                        // Cutting the last line & there are more than 1 lines in the model
                        startLineNumber = position.lineNumber - 1;
                        startColumn = cursor.model.getLineMaxColumn(position.lineNumber - 1);
                        endLineNumber = position.lineNumber;
                        endColumn = cursor.model.getLineMaxColumn(position.lineNumber);
                    }
                    else {
                        // Cutting the single line that the model contains
                        startLineNumber = position.lineNumber;
                        startColumn = 1;
                        endLineNumber = position.lineNumber;
                        endColumn = cursor.model.getLineMaxColumn(position.lineNumber);
                    }
                    var deleteSelection = new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
                    if (!deleteSelection.isEmpty()) {
                        ctx.executeCommand = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
                    }
                }
                else {
                    // Cannot cut empty selection
                    return false;
                }
            }
            else {
                // Delete left or right, they will both result in the selection being deleted
                this.deleteRight(cursor, ctx);
            }
            return true;
        };
        return OneCursorOp;
    }());
    exports.OneCursorOp = OneCursorOp;
    var CursorHelper = (function () {
        function CursorHelper(model, configuration) {
            var _this = this;
            this.model = model;
            this.configuration = configuration;
            this.moveHelper = new cursorMoveHelper_1.CursorMoveHelper({
                getIndentationOptions: function () {
                    return _this.model.getOptions();
                }
            });
        }
        CursorHelper.prototype.getLeftOfPosition = function (model, lineNumber, column) {
            return this.moveHelper.getLeftOfPosition(model, lineNumber, column);
        };
        CursorHelper.prototype.getRightOfPosition = function (model, lineNumber, column) {
            return this.moveHelper.getRightOfPosition(model, lineNumber, column);
        };
        CursorHelper.prototype.getPositionUp = function (model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnFirstLine) {
            return this.moveHelper.getPositionUp(model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnFirstLine);
        };
        CursorHelper.prototype.getPositionDown = function (model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnLastLine) {
            return this.moveHelper.getPositionDown(model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnLastLine);
        };
        CursorHelper.prototype.getColumnAtBeginningOfLine = function (model, lineNumber, column) {
            return this.moveHelper.getColumnAtBeginningOfLine(model, lineNumber, column);
        };
        CursorHelper.prototype.getColumnAtEndOfLine = function (model, lineNumber, column) {
            return this.moveHelper.getColumnAtEndOfLine(model, lineNumber, column);
        };
        CursorHelper.prototype.columnSelect = function (model, fromLineNumber, fromVisibleColumn, toLineNumber, toVisibleColumn) {
            return this.moveHelper.columnSelect(model, fromLineNumber, fromVisibleColumn, toLineNumber, toVisibleColumn);
        };
        CursorHelper.prototype.visibleColumnFromColumn = function (model, lineNumber, column) {
            return this.moveHelper.visibleColumnFromColumn(model, lineNumber, column);
        };
        // /**
        //  * ATTENTION: This works with 0-based columns (as oposed to the regular 1-based columns)
        //  */
        // public nextTabColumn(column:number): number {
        // 	return CursorMoveHelper.nextTabColumn(column, this.configuration.getIndentationOptions().tabSize);
        // }
        // /**
        //  * ATTENTION: This works with 0-based columns (as oposed to the regular 1-based columns)
        //  */
        // public prevTabColumn(column:number): number {
        // 	return CursorMoveHelper.prevTabColumn(column, this.configuration.getIndentationOptions().tabSize);
        // }
        // public findWord(position:editorCommon.IEditorPosition, preference:string, skipSyntaxTokens:boolean=false): editorCommon.IWordRange {
        // 	var words = this.model.getWords(position.lineNumber);
        // 	var searchIndex:number, i:number, len:number;
        // 	if (skipSyntaxTokens) {
        // 		searchIndex = position.column - 1;
        // 		if (preference === 'left') {
        // 			for (i = words.length - 1; i >= 0; i--) {
        // 				if (words[i].start >= searchIndex) {
        // 					continue;
        // 				}
        // 				return words[i];
        // 			}
        // 		} else {
        // 			for (i = 0, len = words.length; i < len; i++) {
        // 				if (words[i].end <= searchIndex) {
        // 					continue;
        // 				}
        // 				return words[i];
        // 			}
        // 		}
        // 	} else {
        // 		searchIndex = position.column;
        // 		if (preference === 'left') {
        // 			if (searchIndex !== 1) {
        // 				searchIndex = searchIndex - 0.1;
        // 			}
        // 		} else {
        // 			if (searchIndex !== this.model.getLineMaxColumn(position.lineNumber)) {
        // 				searchIndex = searchIndex + 0.1;
        // 			}
        // 		}
        // 		searchIndex = searchIndex - 1;
        // 		for (i = 0, len = words.length; i < len; i++) {
        // 			if (words[i].start <= searchIndex && searchIndex <= words[i].end) {
        // 				return words[i];
        // 			}
        // 		}
        // 	}
        // 	return null;
        // }
        CursorHelper.prototype._createWord = function (lineContent, wordType, start, end) {
            // console.log('WORD ==> ' + start + ' => ' + end + ':::: <<<' + lineContent.substring(start, end) + '>>>');
            return { start: start, end: end, wordType: wordType };
        };
        CursorHelper.prototype.findPreviousWordOnLine = function (_position) {
            var position = this.model.validatePosition(_position);
            var wordSeparators = getMapForWordSeparators(this.configuration.editor.wordSeparators);
            var lineContent = this.model.getLineContent(position.lineNumber);
            var wordType = W_NONE;
            for (var chIndex = position.column - 2; chIndex >= 0; chIndex--) {
                var chCode = lineContent.charCodeAt(chIndex);
                var chClass = (wordSeparators[chCode] || CharacterClass.Regular);
                if (chClass === CH_REGULAR) {
                    if (wordType === W_SEPARATOR) {
                        return this._createWord(lineContent, wordType, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                    wordType = W_REGULAR;
                }
                else if (chClass === CH_WORD_SEPARATOR) {
                    if (wordType === W_REGULAR) {
                        return this._createWord(lineContent, wordType, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                    wordType = W_SEPARATOR;
                }
                else if (chClass === CH_WHITESPACE) {
                    if (wordType !== W_NONE) {
                        return this._createWord(lineContent, wordType, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                }
            }
            if (wordType !== W_NONE) {
                return this._createWord(lineContent, wordType, 0, this._findEndOfWord(lineContent, wordSeparators, wordType, 0));
            }
            return null;
        };
        CursorHelper.prototype._findEndOfWord = function (lineContent, wordSeparators, wordType, startIndex) {
            var len = lineContent.length;
            for (var chIndex = startIndex; chIndex < len; chIndex++) {
                var chCode = lineContent.charCodeAt(chIndex);
                var chClass = (wordSeparators[chCode] || CharacterClass.Regular);
                if (chClass === CH_WHITESPACE) {
                    return chIndex;
                }
                if (wordType === W_REGULAR && chClass === CH_WORD_SEPARATOR) {
                    return chIndex;
                }
                if (wordType === W_SEPARATOR && chClass === CH_REGULAR) {
                    return chIndex;
                }
            }
            return len;
        };
        CursorHelper.prototype.findNextWordOnLine = function (_position) {
            var position = this.model.validatePosition(_position);
            var wordSeparators = getMapForWordSeparators(this.configuration.editor.wordSeparators);
            var lineContent = this.model.getLineContent(position.lineNumber);
            var wordType = W_NONE;
            var len = lineContent.length;
            for (var chIndex = position.column - 1; chIndex < len; chIndex++) {
                var chCode = lineContent.charCodeAt(chIndex);
                var chClass = (wordSeparators[chCode] || CharacterClass.Regular);
                if (chClass === CH_REGULAR) {
                    if (wordType === W_SEPARATOR) {
                        return this._createWord(lineContent, wordType, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                    wordType = W_REGULAR;
                }
                else if (chClass === CH_WORD_SEPARATOR) {
                    if (wordType === W_REGULAR) {
                        return this._createWord(lineContent, wordType, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                    wordType = W_SEPARATOR;
                }
                else if (chClass === CH_WHITESPACE) {
                    if (wordType !== W_NONE) {
                        return this._createWord(lineContent, wordType, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                }
            }
            if (wordType !== W_NONE) {
                return this._createWord(lineContent, wordType, this._findStartOfWord(lineContent, wordSeparators, wordType, len - 1), len);
            }
            return null;
        };
        CursorHelper.prototype._findStartOfWord = function (lineContent, wordSeparators, wordType, startIndex) {
            for (var chIndex = startIndex; chIndex >= 0; chIndex--) {
                var chCode = lineContent.charCodeAt(chIndex);
                var chClass = (wordSeparators[chCode] || CharacterClass.Regular);
                if (chClass === CH_WHITESPACE) {
                    return chIndex + 1;
                }
                if (wordType === W_REGULAR && chClass === CH_WORD_SEPARATOR) {
                    return chIndex + 1;
                }
                if (wordType === W_SEPARATOR && chClass === CH_REGULAR) {
                    return chIndex + 1;
                }
            }
            return 0;
        };
        return CursorHelper;
    }());
    function once(keyFn, computeFn) {
        var cache = {};
        return function (input) {
            var key = keyFn(input);
            if (!cache.hasOwnProperty(key)) {
                cache[key] = computeFn(input);
            }
            return cache[key];
        };
    }
    var getMapForWordSeparators = once(function (input) { return input; }, function (input) {
        var r = [];
        // Make array fast for ASCII text
        for (var chCode = 0; chCode < 256; chCode++) {
            r[chCode] = CharacterClass.Regular;
        }
        for (var i = 0, len = input.length; i < len; i++) {
            r[input.charCodeAt(i)] = CharacterClass.WordSeparator;
        }
        r[' '.charCodeAt(0)] = CharacterClass.Whitespace;
        r['\t'.charCodeAt(0)] = CharacterClass.Whitespace;
        return r;
    });
    var Utils = (function () {
        function Utils() {
        }
        /**
         * Range contains position (including edges)?
         */
        Utils.rangeContainsPosition = function (range, position) {
            if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
                return false;
            }
            if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
                return false;
            }
            if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
                return false;
            }
            return true;
        };
        /**
         * Tests if position is contained inside range.
         * If position is either the starting or ending of a range, false is returned.
         */
        Utils.isPositionInsideRange = function (position, range) {
            if (position.lineNumber < range.startLineNumber) {
                return false;
            }
            if (position.lineNumber > range.endLineNumber) {
                return false;
            }
            if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
                return false;
            }
            if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
                return false;
            }
            return true;
        };
        Utils.isPositionAtRangeEdges = function (position, range) {
            if (position.lineNumber === range.startLineNumber && position.column === range.startColumn) {
                return true;
            }
            if (position.lineNumber === range.endLineNumber && position.column === range.endColumn) {
                return true;
            }
            return false;
        };
        return Utils;
    }());
});
