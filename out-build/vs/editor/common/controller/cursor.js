var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/errors', 'vs/base/common/eventEmitter', 'vs/base/common/lifecycle', 'vs/editor/common/commands/replaceCommand', 'vs/editor/common/controller/cursorCollection', 'vs/editor/common/controller/handlerDispatcher', 'vs/editor/common/controller/oneCursor', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/core/selection', 'vs/editor/common/editorCommon'], function (require, exports, nls, errors_1, eventEmitter_1, lifecycle_1, replaceCommand_1, cursorCollection_1, handlerDispatcher_1, oneCursor_1, position_1, range_1, selection_1, editorCommon) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var RevealTarget;
    (function (RevealTarget) {
        RevealTarget[RevealTarget["Primary"] = 0] = "Primary";
        RevealTarget[RevealTarget["TopMost"] = 1] = "TopMost";
        RevealTarget[RevealTarget["BottomMost"] = 2] = "BottomMost";
    })(RevealTarget || (RevealTarget = {}));
    var Cursor = (function (_super) {
        __extends(Cursor, _super);
        function Cursor(editorId, configuration, model, viewModelHelper, enableEmptySelectionClipboard) {
            var _this = this;
            _super.call(this, [
                editorCommon.EventType.CursorPositionChanged,
                editorCommon.EventType.CursorSelectionChanged,
                editorCommon.EventType.CursorRevealRange,
                editorCommon.EventType.CursorScrollRequest
            ]);
            this._columnSelectToLineNumber = 0;
            this._columnSelectToVisualColumn = 0;
            this.editorId = editorId;
            this.configuration = configuration;
            this.model = model;
            this.viewModelHelper = viewModelHelper;
            this.enableEmptySelectionClipboard = enableEmptySelectionClipboard;
            if (!this.viewModelHelper) {
                this.viewModelHelper = {
                    viewModel: this.model,
                    convertModelPositionToViewPosition: function (lineNumber, column) {
                        return new position_1.Position(lineNumber, column);
                    },
                    convertModelRangeToViewRange: function (modelRange) {
                        return modelRange;
                    },
                    convertViewToModelPosition: function (lineNumber, column) {
                        return new position_1.Position(lineNumber, column);
                    },
                    convertViewSelectionToModelSelection: function (viewSelection) {
                        return viewSelection;
                    },
                    validateViewPosition: function (viewLineNumber, viewColumn, modelPosition) {
                        return modelPosition;
                    },
                    validateViewRange: function (viewStartLineNumber, viewStartColumn, viewEndLineNumber, viewEndColumn, modelRange) {
                        return modelRange;
                    }
                };
            }
            this.cursors = new cursorCollection_1.CursorCollection(this.editorId, this.model, this.configuration, this.viewModelHelper);
            this.cursorUndoStack = [];
            this.typingListeners = {};
            this._isHandling = false;
            this.modelUnbinds = [];
            this.modelUnbinds.push(this.model.addListener2(editorCommon.EventType.ModelContentChanged, function (e) {
                _this._onModelContentChanged(e);
            }));
            this.modelUnbinds.push(this.model.addListener2(editorCommon.EventType.ModelModeChanged, function (e) {
                _this._onModelModeChanged();
            }));
            this.modelUnbinds.push(this.model.addListener2(editorCommon.EventType.ModelModeSupportChanged, function (e) {
                // TODO@Alex: react only if certain supports changed?
                _this._onModelModeChanged();
            }));
            this._registerHandlers();
        }
        Cursor.prototype.dispose = function () {
            this.modelUnbinds = lifecycle_1.dispose(this.modelUnbinds);
            this.model = null;
            this.cursors.dispose();
            this.cursors = null;
            this.configuration.handlerDispatcher.clearHandlers();
            this.configuration = null;
            this.viewModelHelper = null;
            _super.prototype.dispose.call(this);
        };
        Cursor.prototype.saveState = function () {
            var selections = this.cursors.getSelections(), result = [], selection;
            for (var i = 0; i < selections.length; i++) {
                selection = selections[i];
                result.push({
                    inSelectionMode: !selection.isEmpty(),
                    selectionStart: {
                        lineNumber: selection.selectionStartLineNumber,
                        column: selection.selectionStartColumn,
                    },
                    position: {
                        lineNumber: selection.positionLineNumber,
                        column: selection.positionColumn,
                    }
                });
            }
            return result;
        };
        Cursor.prototype.restoreState = function (states) {
            var _this = this;
            var desiredSelections = [], state;
            for (var i = 0; i < states.length; i++) {
                state = states[i];
                var positionLineNumber = 1, positionColumn = 1;
                // Avoid missing properties on the literal
                if (state.position && state.position.lineNumber) {
                    positionLineNumber = state.position.lineNumber;
                }
                if (state.position && state.position.column) {
                    positionColumn = state.position.column;
                }
                var selectionStartLineNumber = positionLineNumber, selectionStartColumn = positionColumn;
                // Avoid missing properties on the literal
                if (state.selectionStart && state.selectionStart.lineNumber) {
                    selectionStartLineNumber = state.selectionStart.lineNumber;
                }
                if (state.selectionStart && state.selectionStart.column) {
                    selectionStartColumn = state.selectionStart.column;
                }
                desiredSelections.push({
                    selectionStartLineNumber: selectionStartLineNumber,
                    selectionStartColumn: selectionStartColumn,
                    positionLineNumber: positionLineNumber,
                    positionColumn: positionColumn
                });
            }
            this._onHandler('restoreState', function (ctx) {
                _this.cursors.setSelections(desiredSelections);
                return false;
            }, new handlerDispatcher_1.DispatcherEvent('restoreState', null));
        };
        Cursor.prototype.setEditableRange = function (range) {
            this.model.setEditableRange(range);
        };
        Cursor.prototype.getEditableRange = function () {
            return this.model.getEditableRange();
        };
        Cursor.prototype.addTypingListener = function (character, callback) {
            if (!this.typingListeners.hasOwnProperty(character)) {
                this.typingListeners[character] = [];
            }
            this.typingListeners[character].push(callback);
        };
        Cursor.prototype.removeTypingListener = function (character, callback) {
            if (this.typingListeners.hasOwnProperty(character)) {
                var listeners = this.typingListeners[character];
                for (var i = 0; i < listeners.length; i++) {
                    if (listeners[i] === callback) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            }
        };
        Cursor.prototype._onModelModeChanged = function () {
            // the mode of this model has changed
            this.cursors.updateMode();
        };
        Cursor.prototype._onModelContentChanged = function (e) {
            var _this = this;
            if (e.changeType === editorCommon.EventType.ModelContentChangedFlush) {
                // a model.setValue() was called
                this.cursors.dispose();
                this.cursors = new cursorCollection_1.CursorCollection(this.editorId, this.model, this.configuration, this.viewModelHelper);
                this.emitCursorPositionChanged('model', 'contentFlush');
                this.emitCursorSelectionChanged('model', 'contentFlush');
            }
            else {
                if (!this._isHandling) {
                    this._onHandler('recoverSelectionFromMarkers', function (ctx) {
                        var result = _this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor.recoverSelectionFromMarkers(oneCtx); });
                        ctx.shouldPushStackElementBefore = false;
                        ctx.shouldPushStackElementAfter = false;
                        return result;
                    }, new handlerDispatcher_1.DispatcherEvent('modelChange', null));
                }
            }
        };
        // ------ some getters/setters
        Cursor.prototype.getSelection = function () {
            return this.cursors.getSelection(0);
        };
        Cursor.prototype.getSelections = function () {
            return this.cursors.getSelections();
        };
        Cursor.prototype.getPosition = function () {
            return this.cursors.getPosition(0);
        };
        Cursor.prototype.setSelections = function (source, selections) {
            var _this = this;
            this._onHandler('setSelections', function (ctx) {
                ctx.shouldReveal = false;
                _this.cursors.setSelections(selections);
                return false;
            }, new handlerDispatcher_1.DispatcherEvent(source, null));
        };
        // ------ auxiliary handling logic
        Cursor.prototype._createAndInterpretHandlerCtx = function (eventSource, eventData, callback) {
            var currentHandlerCtx = {
                cursorPositionChangeReason: '',
                shouldReveal: true,
                shouldRevealVerticalInCenter: false,
                shouldRevealHorizontal: true,
                shouldRevealTarget: RevealTarget.Primary,
                eventSource: eventSource,
                eventData: eventData,
                executeCommands: [],
                hasExecutedCommands: false,
                isCursorUndo: false,
                postOperationRunnables: [],
                shouldPushStackElementBefore: false,
                shouldPushStackElementAfter: false,
                requestScrollDeltaLines: 0,
                setColumnSelectToLineNumber: 0,
                setColumnSelectToVisualColumn: 0
            };
            callback(currentHandlerCtx);
            this._interpretHandlerContext(currentHandlerCtx);
            this.cursors.normalize();
            return currentHandlerCtx.hasExecutedCommands;
        };
        Cursor.prototype._onHandler = function (command, handler, e) {
            this._isHandling = true;
            this.charactersTyped = '';
            var handled = false;
            try {
                var oldSelections = this.cursors.getSelections();
                var oldViewSelections = this.cursors.getViewSelections();
                var prevCursorsState = this.cursors.saveState();
                var eventSource = e.getSource();
                var cursorPositionChangeReason;
                var shouldReveal;
                var shouldRevealVerticalInCenter;
                var shouldRevealHorizontal;
                var shouldRevealTarget;
                var isCursorUndo;
                var requestScrollDeltaLines;
                var hasExecutedCommands = this._createAndInterpretHandlerCtx(eventSource, e.getData(), function (currentHandlerCtx) {
                    handled = handler(currentHandlerCtx);
                    cursorPositionChangeReason = currentHandlerCtx.cursorPositionChangeReason;
                    shouldReveal = currentHandlerCtx.shouldReveal;
                    shouldRevealTarget = currentHandlerCtx.shouldRevealTarget;
                    shouldRevealVerticalInCenter = currentHandlerCtx.shouldRevealVerticalInCenter;
                    shouldRevealHorizontal = currentHandlerCtx.shouldRevealHorizontal;
                    isCursorUndo = currentHandlerCtx.isCursorUndo;
                    requestScrollDeltaLines = currentHandlerCtx.requestScrollDeltaLines;
                });
                if (hasExecutedCommands) {
                    this.cursorUndoStack = [];
                }
                // Ping typing listeners after the model emits events & after I emit events
                for (var i = 0; i < this.charactersTyped.length; i++) {
                    var chr = this.charactersTyped.charAt(i);
                    if (this.typingListeners.hasOwnProperty(chr)) {
                        var listeners = this.typingListeners[chr].slice(0);
                        for (var j = 0, lenJ = listeners.length; j < lenJ; j++) {
                            // Hoping that listeners understand that the view might be in an awkward state
                            try {
                                listeners[j]();
                            }
                            catch (e) {
                                errors_1.onUnexpectedError(e);
                            }
                        }
                    }
                }
                var newSelections = this.cursors.getSelections();
                var newViewSelections = this.cursors.getViewSelections();
                var somethingChanged = false;
                if (oldSelections.length !== newSelections.length) {
                    somethingChanged = true;
                }
                else {
                    for (var i = 0, len = oldSelections.length; !somethingChanged && i < len; i++) {
                        if (!oldSelections[i].equalsSelection(newSelections[i])) {
                            somethingChanged = true;
                        }
                    }
                    for (var i = 0, len = oldViewSelections.length; !somethingChanged && i < len; i++) {
                        if (!oldViewSelections[i].equalsSelection(newViewSelections[i])) {
                            somethingChanged = true;
                        }
                    }
                }
                if (somethingChanged) {
                    if (!hasExecutedCommands && !isCursorUndo) {
                        this.cursorUndoStack.push(prevCursorsState);
                    }
                    if (this.cursorUndoStack.length > 50) {
                        this.cursorUndoStack = this.cursorUndoStack.splice(0, this.cursorUndoStack.length - 50);
                    }
                    this.emitCursorPositionChanged(eventSource, cursorPositionChangeReason);
                    if (shouldReveal) {
                        this.emitCursorRevealRange(shouldRevealTarget, shouldRevealVerticalInCenter ? editorCommon.VerticalRevealType.Center : editorCommon.VerticalRevealType.Simple, shouldRevealHorizontal);
                    }
                    this.emitCursorSelectionChanged(eventSource, cursorPositionChangeReason);
                }
                if (requestScrollDeltaLines) {
                    this.emitCursorScrollRequest(requestScrollDeltaLines);
                }
            }
            catch (err) {
                errors_1.onUnexpectedError(err);
            }
            this._isHandling = false;
            return handled;
        };
        Cursor.prototype._interpretHandlerContext = function (ctx) {
            if (ctx.shouldPushStackElementBefore) {
                this.model.pushStackElement();
                ctx.shouldPushStackElementBefore = false;
            }
            this._columnSelectToLineNumber = ctx.setColumnSelectToLineNumber;
            this._columnSelectToVisualColumn = ctx.setColumnSelectToVisualColumn;
            ctx.hasExecutedCommands = this._internalExecuteCommands(ctx.executeCommands, ctx.postOperationRunnables) || ctx.hasExecutedCommands;
            ctx.executeCommands = [];
            if (ctx.shouldPushStackElementAfter) {
                this.model.pushStackElement();
                ctx.shouldPushStackElementAfter = false;
            }
            var hasPostOperationRunnables = false;
            for (var i = 0, len = ctx.postOperationRunnables.length; i < len; i++) {
                if (ctx.postOperationRunnables[i]) {
                    hasPostOperationRunnables = true;
                    break;
                }
            }
            if (hasPostOperationRunnables) {
                var postOperationRunnables = ctx.postOperationRunnables.slice(0);
                ctx.postOperationRunnables = [];
                this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                    if (postOperationRunnables[cursorIndex]) {
                        postOperationRunnables[cursorIndex](oneCtx);
                    }
                    return false;
                });
                this._interpretHandlerContext(ctx);
            }
        };
        Cursor.prototype._interpretCommandResult = function (cursorState) {
            if (!cursorState) {
                return false;
            }
            this.cursors.setSelections(cursorState);
            return true;
        };
        Cursor.prototype._getEditOperationsFromCommand = function (ctx, majorIdentifier, command) {
            var _this = this;
            // This method acts as a transaction, if the command fails
            // everything it has done is ignored
            var operations = [], operationMinor = 0;
            var addEditOperation = function (selection, text) {
                if (selection.isEmpty() && text === '') {
                    // This command wants to add a no-op => no thank you
                    return;
                }
                operations.push({
                    identifier: {
                        major: majorIdentifier,
                        minor: operationMinor++
                    },
                    range: selection,
                    text: text,
                    forceMoveMarkers: false
                });
            };
            var hadTrackedRange = false;
            var trackSelection = function (selection, trackPreviousOnEmpty) {
                var selectionMarkerStickToPreviousCharacter, positionMarkerStickToPreviousCharacter;
                if (selection.isEmpty()) {
                    // Try to lock it with surrounding text
                    if (typeof trackPreviousOnEmpty === 'boolean') {
                        selectionMarkerStickToPreviousCharacter = trackPreviousOnEmpty;
                        positionMarkerStickToPreviousCharacter = trackPreviousOnEmpty;
                    }
                    else {
                        var maxLineColumn = _this.model.getLineMaxColumn(selection.startLineNumber);
                        if (selection.startColumn === maxLineColumn) {
                            selectionMarkerStickToPreviousCharacter = true;
                            positionMarkerStickToPreviousCharacter = true;
                        }
                        else {
                            selectionMarkerStickToPreviousCharacter = false;
                            positionMarkerStickToPreviousCharacter = false;
                        }
                    }
                }
                else {
                    if (selection.getDirection() === editorCommon.SelectionDirection.LTR) {
                        selectionMarkerStickToPreviousCharacter = false;
                        positionMarkerStickToPreviousCharacter = true;
                    }
                    else {
                        selectionMarkerStickToPreviousCharacter = true;
                        positionMarkerStickToPreviousCharacter = false;
                    }
                }
                var l = ctx.selectionStartMarkers.length;
                ctx.selectionStartMarkers[l] = _this.model._addMarker(selection.selectionStartLineNumber, selection.selectionStartColumn, selectionMarkerStickToPreviousCharacter);
                ctx.positionMarkers[l] = _this.model._addMarker(selection.positionLineNumber, selection.positionColumn, positionMarkerStickToPreviousCharacter);
                return l.toString();
            };
            var editOperationBuilder = {
                addEditOperation: addEditOperation,
                trackSelection: trackSelection
            };
            try {
                command.getEditOperations(this.model, editOperationBuilder);
            }
            catch (e) {
                e.friendlyMessage = nls.localize('corrupt.commands', "Unexpected exception while executing command.");
                errors_1.onUnexpectedError(e);
                return {
                    operations: [],
                    hadTrackedRange: false
                };
            }
            return {
                operations: operations,
                hadTrackedRange: hadTrackedRange
            };
        };
        Cursor.prototype._getEditOperations = function (ctx, commands) {
            var oneResult;
            var operations = [];
            var hadTrackedRanges = [];
            var anyoneHadTrackedRange;
            for (var i = 0; i < commands.length; i++) {
                if (commands[i]) {
                    oneResult = this._getEditOperationsFromCommand(ctx, i, commands[i]);
                    operations = operations.concat(oneResult.operations);
                    hadTrackedRanges[i] = oneResult.hadTrackedRange;
                    anyoneHadTrackedRange = anyoneHadTrackedRange || hadTrackedRanges[i];
                }
                else {
                    hadTrackedRanges[i] = false;
                }
            }
            return {
                operations: operations,
                hadTrackedRanges: hadTrackedRanges,
                anyoneHadTrackedRange: anyoneHadTrackedRange
            };
        };
        Cursor.prototype._getLoserCursorMap = function (operations) {
            // This is destructive on the array
            operations = operations.slice(0);
            // Sort operations with last one first
            operations.sort(function (a, b) {
                // Note the minus!
                return -(range_1.Range.compareRangesUsingEnds(a.range, b.range));
            });
            // Operations can not overlap!
            var loserCursorsMap = {};
            var previousOp;
            var currentOp;
            var loserMajor;
            for (var i = 1; i < operations.length; i++) {
                previousOp = operations[i - 1];
                currentOp = operations[i];
                if (previousOp.range.getStartPosition().isBefore(currentOp.range.getEndPosition())) {
                    if (previousOp.identifier.major > currentOp.identifier.major) {
                        // previousOp loses the battle
                        loserMajor = previousOp.identifier.major;
                    }
                    else {
                        loserMajor = currentOp.identifier.major;
                    }
                    loserCursorsMap[loserMajor.toString()] = true;
                    for (var j = 0; j < operations.length; j++) {
                        if (operations[j].identifier.major === loserMajor) {
                            operations.splice(j, 1);
                            if (j < i) {
                                i--;
                            }
                            j--;
                        }
                    }
                    if (i > 0) {
                        i--;
                    }
                }
            }
            return loserCursorsMap;
        };
        Cursor.prototype._collapseDeleteCommands = function (rawCmds, postOperationRunnables) {
            if (rawCmds.length === 1) {
                return;
            }
            // Merge adjacent delete commands
            var allAreDeleteCommands = rawCmds.every(function (command) {
                if (!(command instanceof replaceCommand_1.ReplaceCommand)) {
                    return false;
                }
                var replCmd = command;
                if (replCmd.getText().length > 0) {
                    return false;
                }
                return true;
            });
            if (!allAreDeleteCommands) {
                return;
            }
            var commands = rawCmds;
            var cursors = commands.map(function (cmd, i) {
                return {
                    range: commands[i].getRange(),
                    postOperationRunnable: postOperationRunnables[i],
                    order: i
                };
            });
            cursors.sort(function (a, b) {
                return range_1.Range.compareRangesUsingStarts(a.range, b.range);
            });
            var previousCursor = cursors[0];
            for (var i = 1; i < cursors.length; i++) {
                if (previousCursor.range.endLineNumber === cursors[i].range.startLineNumber && previousCursor.range.endColumn === cursors[i].range.startColumn) {
                    // Merge ranges
                    var mergedRange = new range_1.Range(previousCursor.range.startLineNumber, previousCursor.range.startColumn, cursors[i].range.endLineNumber, cursors[i].range.endColumn);
                    previousCursor.range = mergedRange;
                    commands[cursors[i].order].setRange(mergedRange);
                    commands[previousCursor.order].setRange(mergedRange);
                }
                else {
                    // Push previous cursor
                    previousCursor = cursors[i];
                }
            }
        };
        Cursor.prototype._internalExecuteCommands = function (commands, postOperationRunnables) {
            var ctx = {
                selectionStartMarkers: [],
                positionMarkers: []
            };
            this._collapseDeleteCommands(commands, postOperationRunnables);
            var r = this._innerExecuteCommands(ctx, commands, postOperationRunnables);
            for (var i = 0; i < ctx.selectionStartMarkers.length; i++) {
                this.model._removeMarker(ctx.selectionStartMarkers[i]);
                this.model._removeMarker(ctx.positionMarkers[i]);
            }
            return r;
        };
        Cursor.prototype._arrayIsEmpty = function (commands) {
            var i, len;
            for (i = 0, len = commands.length; i < len; i++) {
                if (commands[i]) {
                    return false;
                }
            }
            return true;
        };
        Cursor.prototype._innerExecuteCommands = function (ctx, commands, postOperationRunnables) {
            var _this = this;
            if (this.configuration.editor.readOnly) {
                return false;
            }
            if (this._arrayIsEmpty(commands)) {
                return false;
            }
            var selectionsBefore = this.cursors.getSelections();
            var commandsData = this._getEditOperations(ctx, commands);
            if (commandsData.operations.length === 0 && !commandsData.anyoneHadTrackedRange) {
                return false;
            }
            var rawOperations = commandsData.operations;
            var editableRange = this.model.getEditableRange();
            var editableRangeStart = editableRange.getStartPosition();
            var editableRangeEnd = editableRange.getEndPosition();
            for (var i = 0; i < rawOperations.length; i++) {
                var operationRange = rawOperations[i].range;
                if (!editableRangeStart.isBeforeOrEqual(operationRange.getStartPosition()) || !operationRange.getEndPosition().isBeforeOrEqual(editableRangeEnd)) {
                    // These commands are outside of the editable range
                    return false;
                }
            }
            var loserCursorsMap = this._getLoserCursorMap(rawOperations);
            if (loserCursorsMap.hasOwnProperty('0')) {
                // These commands are very messed up
                console.warn('Ignoring commands');
                return false;
            }
            // Remove operations belonging to losing cursors
            var filteredOperations = [];
            for (var i = 0; i < rawOperations.length; i++) {
                if (!loserCursorsMap.hasOwnProperty(rawOperations[i].identifier.major.toString())) {
                    filteredOperations.push(rawOperations[i]);
                }
            }
            var selectionsAfter = this.model.pushEditOperations(selectionsBefore, filteredOperations, function (inverseEditOperations) {
                var groupedInverseEditOperations = [];
                for (var i = 0; i < selectionsBefore.length; i++) {
                    groupedInverseEditOperations[i] = [];
                }
                for (var i = 0; i < inverseEditOperations.length; i++) {
                    var op = inverseEditOperations[i];
                    groupedInverseEditOperations[op.identifier.major].push(op);
                }
                var minorBasedSorter = function (a, b) {
                    return a.identifier.minor - b.identifier.minor;
                };
                var cursorSelections = [];
                for (var i = 0; i < selectionsBefore.length; i++) {
                    if (groupedInverseEditOperations[i].length > 0 || commandsData.hadTrackedRanges[i]) {
                        groupedInverseEditOperations[i].sort(minorBasedSorter);
                        cursorSelections[i] = commands[i].computeCursorState(_this.model, {
                            getInverseEditOperations: function () {
                                return groupedInverseEditOperations[i];
                            },
                            getTrackedSelection: function (id) {
                                var idx = parseInt(id, 10);
                                var selectionStartMarker = _this.model._getMarker(ctx.selectionStartMarkers[idx]);
                                var positionMarker = _this.model._getMarker(ctx.positionMarkers[idx]);
                                return new selection_1.Selection(selectionStartMarker.lineNumber, selectionStartMarker.column, positionMarker.lineNumber, positionMarker.column);
                            }
                        });
                    }
                    else {
                        cursorSelections[i] = selectionsBefore[i];
                    }
                }
                return cursorSelections;
            });
            // Extract losing cursors
            var losingCursorIndex;
            var losingCursors = [];
            for (losingCursorIndex in loserCursorsMap) {
                if (loserCursorsMap.hasOwnProperty(losingCursorIndex)) {
                    losingCursors.push(parseInt(losingCursorIndex, 10));
                }
            }
            // Sort losing cursors descending
            losingCursors.sort(function (a, b) {
                return b - a;
            });
            // Remove losing cursors
            for (var i = 0; i < losingCursors.length; i++) {
                selectionsAfter.splice(losingCursors[i], 1);
                postOperationRunnables.splice(losingCursors[i], 1);
            }
            return this._interpretCommandResult(selectionsAfter);
        };
        // -----------------------------------------------------------------------------------------------------------
        // ----- emitting events
        Cursor.prototype.emitCursorPositionChanged = function (source, reason) {
            var positions = this.cursors.getPositions();
            var primaryPosition = positions[0];
            var secondaryPositions = positions.slice(1);
            var viewPositions = this.cursors.getViewPositions();
            var primaryViewPosition = viewPositions[0];
            var secondaryViewPositions = viewPositions.slice(1);
            var isInEditableRange = true;
            if (this.model.hasEditableRange()) {
                var editableRange = this.model.getEditableRange();
                if (!editableRange.containsPosition(primaryPosition)) {
                    isInEditableRange = false;
                }
            }
            var e = {
                position: primaryPosition,
                viewPosition: primaryViewPosition,
                secondaryPositions: secondaryPositions,
                secondaryViewPositions: secondaryViewPositions,
                reason: reason,
                source: source,
                isInEditableRange: isInEditableRange
            };
            this.emit(editorCommon.EventType.CursorPositionChanged, e);
        };
        Cursor.prototype.emitCursorSelectionChanged = function (source, reason) {
            var selections = this.cursors.getSelections();
            var primarySelection = selections[0];
            var secondarySelections = selections.slice(1);
            var viewSelections = this.cursors.getViewSelections();
            var primaryViewSelection = viewSelections[0];
            var secondaryViewSelections = viewSelections.slice(1);
            var e = {
                selection: primarySelection,
                viewSelection: primaryViewSelection,
                secondarySelections: secondarySelections,
                secondaryViewSelections: secondaryViewSelections,
                source: source,
                reason: reason
            };
            this.emit(editorCommon.EventType.CursorSelectionChanged, e);
        };
        Cursor.prototype.emitCursorScrollRequest = function (lineScrollOffset) {
            var e = {
                deltaLines: lineScrollOffset
            };
            this.emit(editorCommon.EventType.CursorScrollRequest, e);
        };
        Cursor.prototype.emitCursorRevealRange = function (revealTarget, verticalType, revealHorizontal) {
            var positions = this.cursors.getPositions();
            var viewPositions = this.cursors.getViewPositions();
            var position = positions[0];
            var viewPosition = viewPositions[0];
            if (revealTarget === RevealTarget.TopMost) {
                for (var i = 1; i < positions.length; i++) {
                    if (positions[i].isBefore(position)) {
                        position = positions[i];
                        viewPosition = viewPositions[i];
                    }
                }
            }
            else if (revealTarget === RevealTarget.BottomMost) {
                for (var i = 1; i < positions.length; i++) {
                    if (position.isBeforeOrEqual(positions[i])) {
                        position = positions[i];
                        viewPosition = viewPositions[i];
                    }
                }
            }
            else {
                if (positions.length > 1) {
                    // no revealing!
                    return;
                }
            }
            var range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            var viewRange = new range_1.Range(viewPosition.lineNumber, viewPosition.column, viewPosition.lineNumber, viewPosition.column);
            var e = {
                range: range,
                viewRange: viewRange,
                verticalType: verticalType,
                revealHorizontal: revealHorizontal
            };
            this.emit(editorCommon.EventType.CursorRevealRange, e);
        };
        // -----------------------------------------------------------------------------------------------------------
        // ----- handlers beyond this point
        Cursor.prototype._registerHandlers = function () {
            var _this = this;
            var H = editorCommon.Handler;
            var handlersMap = {};
            handlersMap[H.JumpToBracket] = function (ctx) { return _this._jumpToBracket(ctx); };
            handlersMap[H.MoveTo] = function (ctx) { return _this._moveTo(false, ctx); };
            handlersMap[H.MoveToSelect] = function (ctx) { return _this._moveTo(true, ctx); };
            handlersMap[H.ColumnSelect] = function (ctx) { return _this._columnSelectMouse(ctx); };
            handlersMap[H.AddCursorUp] = function (ctx) { return _this._addCursorUp(ctx); };
            handlersMap[H.AddCursorDown] = function (ctx) { return _this._addCursorDown(ctx); };
            handlersMap[H.CreateCursor] = function (ctx) { return _this._createCursor(ctx); };
            handlersMap[H.LastCursorMoveToSelect] = function (ctx) { return _this._lastCursorMoveTo(ctx); };
            handlersMap[H.CursorLeft] = function (ctx) { return _this._moveLeft(false, ctx); };
            handlersMap[H.CursorLeftSelect] = function (ctx) { return _this._moveLeft(true, ctx); };
            handlersMap[H.CursorWordLeft] = function (ctx) { return _this._moveWordLeft(false, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.CursorWordStartLeft] = function (ctx) { return _this._moveWordLeft(false, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.CursorWordEndLeft] = function (ctx) { return _this._moveWordLeft(false, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.CursorWordLeftSelect] = function (ctx) { return _this._moveWordLeft(true, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.CursorWordStartLeftSelect] = function (ctx) { return _this._moveWordLeft(true, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.CursorWordEndLeftSelect] = function (ctx) { return _this._moveWordLeft(true, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.CursorRight] = function (ctx) { return _this._moveRight(false, ctx); };
            handlersMap[H.CursorRightSelect] = function (ctx) { return _this._moveRight(true, ctx); };
            handlersMap[H.CursorWordRight] = function (ctx) { return _this._moveWordRight(false, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.CursorWordStartRight] = function (ctx) { return _this._moveWordRight(false, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.CursorWordEndRight] = function (ctx) { return _this._moveWordRight(false, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.CursorWordRightSelect] = function (ctx) { return _this._moveWordRight(true, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.CursorWordStartRightSelect] = function (ctx) { return _this._moveWordRight(true, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.CursorWordEndRightSelect] = function (ctx) { return _this._moveWordRight(true, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.CursorUp] = function (ctx) { return _this._moveUp(false, false, ctx); };
            handlersMap[H.CursorUpSelect] = function (ctx) { return _this._moveUp(true, false, ctx); };
            handlersMap[H.CursorDown] = function (ctx) { return _this._moveDown(false, false, ctx); };
            handlersMap[H.CursorDownSelect] = function (ctx) { return _this._moveDown(true, false, ctx); };
            handlersMap[H.CursorPageUp] = function (ctx) { return _this._moveUp(false, true, ctx); };
            handlersMap[H.CursorPageUpSelect] = function (ctx) { return _this._moveUp(true, true, ctx); };
            handlersMap[H.CursorPageDown] = function (ctx) { return _this._moveDown(false, true, ctx); };
            handlersMap[H.CursorPageDownSelect] = function (ctx) { return _this._moveDown(true, true, ctx); };
            handlersMap[H.CursorHome] = function (ctx) { return _this._moveToBeginningOfLine(false, ctx); };
            handlersMap[H.CursorHomeSelect] = function (ctx) { return _this._moveToBeginningOfLine(true, ctx); };
            handlersMap[H.CursorEnd] = function (ctx) { return _this._moveToEndOfLine(false, ctx); };
            handlersMap[H.CursorEndSelect] = function (ctx) { return _this._moveToEndOfLine(true, ctx); };
            handlersMap[H.CursorTop] = function (ctx) { return _this._moveToBeginningOfBuffer(false, ctx); };
            handlersMap[H.CursorTopSelect] = function (ctx) { return _this._moveToBeginningOfBuffer(true, ctx); };
            handlersMap[H.CursorBottom] = function (ctx) { return _this._moveToEndOfBuffer(false, ctx); };
            handlersMap[H.CursorBottomSelect] = function (ctx) { return _this._moveToEndOfBuffer(true, ctx); };
            handlersMap[H.CursorColumnSelectLeft] = function (ctx) { return _this._columnSelectLeft(ctx); };
            handlersMap[H.CursorColumnSelectRight] = function (ctx) { return _this._columnSelectRight(ctx); };
            handlersMap[H.CursorColumnSelectUp] = function (ctx) { return _this._columnSelectUp(false, ctx); };
            handlersMap[H.CursorColumnSelectPageUp] = function (ctx) { return _this._columnSelectUp(true, ctx); };
            handlersMap[H.CursorColumnSelectDown] = function (ctx) { return _this._columnSelectDown(false, ctx); };
            handlersMap[H.CursorColumnSelectPageDown] = function (ctx) { return _this._columnSelectDown(true, ctx); };
            handlersMap[H.SelectAll] = function (ctx) { return _this._selectAll(ctx); };
            handlersMap[H.LineSelect] = function (ctx) { return _this._line(false, ctx); };
            handlersMap[H.LineSelectDrag] = function (ctx) { return _this._line(true, ctx); };
            handlersMap[H.LastCursorLineSelect] = function (ctx) { return _this._lastCursorLine(false, ctx); };
            handlersMap[H.LastCursorLineSelectDrag] = function (ctx) { return _this._lastCursorLine(true, ctx); };
            handlersMap[H.LineInsertBefore] = function (ctx) { return _this._lineInsertBefore(ctx); };
            handlersMap[H.LineInsertAfter] = function (ctx) { return _this._lineInsertAfter(ctx); };
            handlersMap[H.LineBreakInsert] = function (ctx) { return _this._lineBreakInsert(ctx); };
            handlersMap[H.WordSelect] = function (ctx) { return _this._word(false, ctx); };
            handlersMap[H.WordSelectDrag] = function (ctx) { return _this._word(true, ctx); };
            handlersMap[H.LastCursorWordSelect] = function (ctx) { return _this._lastCursorWord(ctx); };
            handlersMap[H.CancelSelection] = function (ctx) { return _this._cancelSelection(ctx); };
            handlersMap[H.RemoveSecondaryCursors] = function (ctx) { return _this._removeSecondaryCursors(ctx); };
            handlersMap[H.Type] = function (ctx) { return _this._type(ctx); };
            handlersMap[H.ReplacePreviousChar] = function (ctx) { return _this._replacePreviousChar(ctx); };
            handlersMap[H.Tab] = function (ctx) { return _this._tab(ctx); };
            handlersMap[H.Indent] = function (ctx) { return _this._indent(ctx); };
            handlersMap[H.Outdent] = function (ctx) { return _this._outdent(ctx); };
            handlersMap[H.Paste] = function (ctx) { return _this._paste(ctx); };
            handlersMap[H.ScrollLineUp] = function (ctx) { return _this._scrollUp(false, ctx); };
            handlersMap[H.ScrollLineDown] = function (ctx) { return _this._scrollDown(false, ctx); };
            handlersMap[H.ScrollPageUp] = function (ctx) { return _this._scrollUp(true, ctx); };
            handlersMap[H.ScrollPageDown] = function (ctx) { return _this._scrollDown(true, ctx); };
            handlersMap[H.DeleteLeft] = function (ctx) { return _this._deleteLeft(ctx); };
            handlersMap[H.DeleteWordLeft] = function (ctx) { return _this._deleteWordLeft(true, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.DeleteWordStartLeft] = function (ctx) { return _this._deleteWordLeft(false, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.DeleteWordEndLeft] = function (ctx) { return _this._deleteWordLeft(false, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.DeleteRight] = function (ctx) { return _this._deleteRight(ctx); };
            handlersMap[H.DeleteWordRight] = function (ctx) { return _this._deleteWordRight(true, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.DeleteWordStartRight] = function (ctx) { return _this._deleteWordRight(false, oneCursor_1.WordNavigationType.WordStart, ctx); };
            handlersMap[H.DeleteWordEndRight] = function (ctx) { return _this._deleteWordRight(false, oneCursor_1.WordNavigationType.WordEnd, ctx); };
            handlersMap[H.DeleteAllLeft] = function (ctx) { return _this._deleteAllLeft(ctx); };
            handlersMap[H.DeleteAllRight] = function (ctx) { return _this._deleteAllRight(ctx); };
            handlersMap[H.Cut] = function (ctx) { return _this._cut(ctx); };
            handlersMap[H.ExpandLineSelection] = function (ctx) { return _this._expandLineSelection(ctx); };
            handlersMap[H.Undo] = function (ctx) { return _this._undo(ctx); };
            handlersMap[H.CursorUndo] = function (ctx) { return _this._cursorUndo(ctx); };
            handlersMap[H.Redo] = function (ctx) { return _this._redo(ctx); };
            handlersMap[H.ExecuteCommand] = function (ctx) { return _this._externalExecuteCommand(ctx); };
            handlersMap[H.ExecuteCommands] = function (ctx) { return _this._externalExecuteCommands(ctx); };
            var createHandler = function (handlerId, handlerExec) {
                return function (e) { return _this._onHandler(handlerId, handlerExec, e); };
            };
            var keys = Object.keys(handlersMap);
            for (var i = 0, len = keys.length; i < len; i++) {
                var handler = keys[i];
                this.configuration.handlerDispatcher.setHandler(handler, createHandler(handler, handlersMap[handler]));
            }
        };
        Cursor.prototype._invokeForAllSorted = function (ctx, callable, pushStackElementBefore, pushStackElementAfter) {
            if (pushStackElementBefore === void 0) { pushStackElementBefore = true; }
            if (pushStackElementAfter === void 0) { pushStackElementAfter = true; }
            return this._doInvokeForAll(ctx, true, callable, pushStackElementBefore, pushStackElementAfter);
        };
        Cursor.prototype._invokeForAll = function (ctx, callable, pushStackElementBefore, pushStackElementAfter) {
            if (pushStackElementBefore === void 0) { pushStackElementBefore = true; }
            if (pushStackElementAfter === void 0) { pushStackElementAfter = true; }
            return this._doInvokeForAll(ctx, false, callable, pushStackElementBefore, pushStackElementAfter);
        };
        Cursor.prototype._doInvokeForAll = function (ctx, sorted, callable, pushStackElementBefore, pushStackElementAfter) {
            if (pushStackElementBefore === void 0) { pushStackElementBefore = true; }
            if (pushStackElementAfter === void 0) { pushStackElementAfter = true; }
            var result = false;
            var cursors = this.cursors.getAll();
            if (sorted) {
                cursors = cursors.sort(function (a, b) {
                    return range_1.Range.compareRangesUsingStarts(a.getSelection(), b.getSelection());
                });
            }
            var context;
            ctx.shouldPushStackElementBefore = pushStackElementBefore;
            ctx.shouldPushStackElementAfter = pushStackElementAfter;
            for (var i = 0; i < cursors.length; i++) {
                context = {
                    cursorPositionChangeReason: '',
                    shouldReveal: true,
                    shouldRevealVerticalInCenter: false,
                    shouldRevealHorizontal: true,
                    executeCommand: null,
                    postOperationRunnable: null,
                    shouldPushStackElementBefore: false,
                    shouldPushStackElementAfter: false,
                    requestScrollDeltaLines: 0
                };
                result = callable(i, cursors[i], context) || result;
                if (i === 0) {
                    ctx.cursorPositionChangeReason = context.cursorPositionChangeReason;
                    ctx.shouldRevealHorizontal = context.shouldRevealHorizontal;
                    ctx.shouldReveal = context.shouldReveal;
                    ctx.shouldRevealVerticalInCenter = context.shouldRevealVerticalInCenter;
                    ctx.requestScrollDeltaLines = context.requestScrollDeltaLines;
                }
                ctx.shouldPushStackElementBefore = ctx.shouldPushStackElementBefore || context.shouldPushStackElementBefore;
                ctx.shouldPushStackElementAfter = ctx.shouldPushStackElementAfter || context.shouldPushStackElementAfter;
                ctx.executeCommands[i] = context.executeCommand;
                ctx.postOperationRunnables[i] = context.postOperationRunnable;
            }
            return result;
        };
        Cursor.prototype._jumpToBracket = function (ctx) {
            this.cursors.killSecondaryCursors();
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.jumpToBracket(oneCursor, oneCtx); });
        };
        Cursor.prototype._moveTo = function (inSelectionMode, ctx) {
            this.cursors.killSecondaryCursors();
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveTo(oneCursor, inSelectionMode, ctx.eventData.position, ctx.eventData.viewPosition, ctx.eventSource, oneCtx); });
        };
        Cursor.prototype._getColumnSelectToLineNumber = function () {
            if (!this._columnSelectToLineNumber) {
                var primaryCursor = this.cursors.getAll()[0];
                var primaryPos = primaryCursor.getViewPosition();
                return primaryPos.lineNumber;
            }
            return this._columnSelectToLineNumber;
        };
        Cursor.prototype._getColumnSelectToVisualColumn = function () {
            if (!this._columnSelectToVisualColumn) {
                var primaryCursor = this.cursors.getAll()[0];
                var primaryPos = primaryCursor.getViewPosition();
                return primaryCursor.getViewVisibleColumnFromColumn(primaryPos.lineNumber, primaryPos.column);
            }
            return this._columnSelectToVisualColumn;
        };
        Cursor.prototype._columnSelectMouse = function (ctx) {
            var cursors = this.cursors.getAll();
            var result = oneCursor_1.OneCursorOp.columnSelectMouse(cursors[0], ctx.eventData.position, ctx.eventData.viewPosition, ctx.eventData.mouseColumn - 1);
            ctx.shouldRevealTarget = (result.reversed ? RevealTarget.TopMost : RevealTarget.BottomMost);
            ctx.shouldReveal = true;
            ctx.setColumnSelectToLineNumber = result.toLineNumber;
            ctx.setColumnSelectToVisualColumn = result.toVisualColumn;
            this.cursors.setSelections(result.selections, result.viewSelections);
            return true;
        };
        Cursor.prototype._columnSelectOp = function (ctx, op) {
            var primary = this.cursors.getAll()[0];
            var result = op(primary, this._getColumnSelectToLineNumber(), this._getColumnSelectToVisualColumn());
            ctx.shouldRevealTarget = (result.reversed ? RevealTarget.TopMost : RevealTarget.BottomMost);
            ctx.shouldReveal = true;
            ctx.setColumnSelectToLineNumber = result.toLineNumber;
            ctx.setColumnSelectToVisualColumn = result.toVisualColumn;
            this.cursors.setSelections(result.selections, result.viewSelections);
            return true;
        };
        Cursor.prototype._columnSelectLeft = function (ctx) {
            return this._columnSelectOp(ctx, function (cursor, toViewLineNumber, toViewVisualColumn) { return oneCursor_1.OneCursorOp.columnSelectLeft(cursor, toViewLineNumber, toViewVisualColumn); });
        };
        Cursor.prototype._columnSelectRight = function (ctx) {
            return this._columnSelectOp(ctx, function (cursor, toViewLineNumber, toViewVisualColumn) { return oneCursor_1.OneCursorOp.columnSelectRight(cursor, toViewLineNumber, toViewVisualColumn); });
        };
        Cursor.prototype._columnSelectUp = function (isPaged, ctx) {
            return this._columnSelectOp(ctx, function (cursor, toViewLineNumber, toViewVisualColumn) { return oneCursor_1.OneCursorOp.columnSelectUp(isPaged, cursor, toViewLineNumber, toViewVisualColumn); });
        };
        Cursor.prototype._columnSelectDown = function (isPaged, ctx) {
            return this._columnSelectOp(ctx, function (cursor, toViewLineNumber, toViewVisualColumn) { return oneCursor_1.OneCursorOp.columnSelectDown(isPaged, cursor, toViewLineNumber, toViewVisualColumn); });
        };
        Cursor.prototype._createCursor = function (ctx) {
            if (this.configuration.editor.readOnly || this.model.hasEditableRange()) {
                return false;
            }
            this.cursors.addSecondaryCursor({
                selectionStartLineNumber: 1,
                selectionStartColumn: 1,
                positionLineNumber: 1,
                positionColumn: 1
            });
            // Manually move to get events
            var lastAddedCursor = this.cursors.getLastAddedCursor();
            this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                if (oneCursor === lastAddedCursor) {
                    if (ctx.eventData.wholeLine) {
                        return oneCursor_1.OneCursorOp.line(oneCursor, false, ctx.eventData.position, ctx.eventData.viewPosition, oneCtx);
                    }
                    else {
                        return oneCursor_1.OneCursorOp.moveTo(oneCursor, false, ctx.eventData.position, ctx.eventData.viewPosition, ctx.eventSource, oneCtx);
                    }
                }
                return false;
            });
            ctx.shouldReveal = false;
            ctx.shouldRevealHorizontal = false;
            return true;
        };
        Cursor.prototype._lastCursorMoveTo = function (ctx) {
            if (this.configuration.editor.readOnly || this.model.hasEditableRange()) {
                return false;
            }
            var lastAddedCursor = this.cursors.getLastAddedCursor();
            this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                if (oneCursor === lastAddedCursor) {
                    return oneCursor_1.OneCursorOp.moveTo(oneCursor, true, ctx.eventData.position, ctx.eventData.viewPosition, ctx.eventSource, oneCtx);
                }
                return false;
            });
            ctx.shouldReveal = false;
            ctx.shouldRevealHorizontal = false;
            return true;
        };
        Cursor.prototype._addCursorUp = function (ctx) {
            if (this.configuration.editor.readOnly) {
                return false;
            }
            var originalCnt = this.cursors.getSelections().length;
            this.cursors.duplicateCursors();
            ctx.shouldRevealTarget = RevealTarget.TopMost;
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                if (cursorIndex >= originalCnt) {
                    return oneCursor_1.OneCursorOp.translateUp(oneCursor, oneCtx);
                }
                return false;
            });
        };
        Cursor.prototype._addCursorDown = function (ctx) {
            if (this.configuration.editor.readOnly) {
                return false;
            }
            var originalCnt = this.cursors.getSelections().length;
            this.cursors.duplicateCursors();
            ctx.shouldRevealTarget = RevealTarget.BottomMost;
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                if (cursorIndex >= originalCnt) {
                    return oneCursor_1.OneCursorOp.translateDown(oneCursor, oneCtx);
                }
                return false;
            });
        };
        Cursor.prototype._moveLeft = function (inSelectionMode, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveLeft(oneCursor, inSelectionMode, oneCtx); });
        };
        Cursor.prototype._moveWordLeft = function (inSelectionMode, wordNavigationType, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveWordLeft(oneCursor, inSelectionMode, wordNavigationType, oneCtx); });
        };
        Cursor.prototype._moveRight = function (inSelectionMode, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveRight(oneCursor, inSelectionMode, oneCtx); });
        };
        Cursor.prototype._moveWordRight = function (inSelectionMode, wordNavigationType, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveWordRight(oneCursor, inSelectionMode, wordNavigationType, oneCtx); });
        };
        Cursor.prototype._moveDown = function (inSelectionMode, isPaged, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveDown(oneCursor, inSelectionMode, isPaged, oneCtx); });
        };
        Cursor.prototype._moveUp = function (inSelectionMode, isPaged, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveUp(oneCursor, inSelectionMode, isPaged, oneCtx); });
        };
        Cursor.prototype._moveToBeginningOfLine = function (inSelectionMode, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveToBeginningOfLine(oneCursor, inSelectionMode, oneCtx); });
        };
        Cursor.prototype._moveToEndOfLine = function (inSelectionMode, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveToEndOfLine(oneCursor, inSelectionMode, oneCtx); });
        };
        Cursor.prototype._moveToBeginningOfBuffer = function (inSelectionMode, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveToBeginningOfBuffer(oneCursor, inSelectionMode, oneCtx); });
        };
        Cursor.prototype._moveToEndOfBuffer = function (inSelectionMode, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.moveToEndOfBuffer(oneCursor, inSelectionMode, oneCtx); });
        };
        Cursor.prototype._selectAll = function (ctx) {
            this.cursors.killSecondaryCursors();
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.selectAll(oneCursor, oneCtx); });
        };
        Cursor.prototype._line = function (inSelectionMode, ctx) {
            this.cursors.killSecondaryCursors();
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.line(oneCursor, inSelectionMode, ctx.eventData.position, ctx.eventData.viewPosition, oneCtx); });
        };
        Cursor.prototype._lastCursorLine = function (inSelectionMode, ctx) {
            if (this.configuration.editor.readOnly || this.model.hasEditableRange()) {
                return false;
            }
            var lastAddedCursor = this.cursors.getLastAddedCursor();
            this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                if (oneCursor === lastAddedCursor) {
                    return oneCursor_1.OneCursorOp.line(oneCursor, inSelectionMode, ctx.eventData.position, ctx.eventData.viewPosition, oneCtx);
                }
                return false;
            });
            ctx.shouldReveal = false;
            ctx.shouldRevealHorizontal = false;
            return true;
        };
        Cursor.prototype._expandLineSelection = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.expandLineSelection(oneCursor, oneCtx); });
        };
        Cursor.prototype._lineInsertBefore = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.lineInsertBefore(oneCursor, oneCtx); });
        };
        Cursor.prototype._lineInsertAfter = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.lineInsertAfter(oneCursor, oneCtx); });
        };
        Cursor.prototype._lineBreakInsert = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.lineBreakInsert(oneCursor, oneCtx); });
        };
        Cursor.prototype._word = function (inSelectionMode, ctx) {
            this.cursors.killSecondaryCursors();
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.word(oneCursor, inSelectionMode, ctx.eventData.position, oneCtx); });
        };
        Cursor.prototype._lastCursorWord = function (ctx) {
            if (this.configuration.editor.readOnly || this.model.hasEditableRange()) {
                return false;
            }
            var lastAddedCursor = this.cursors.getLastAddedCursor();
            this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                if (oneCursor === lastAddedCursor) {
                    return oneCursor_1.OneCursorOp.word(oneCursor, true, ctx.eventData.position, oneCtx);
                }
                return false;
            });
            ctx.shouldReveal = false;
            ctx.shouldRevealHorizontal = false;
            return true;
        };
        Cursor.prototype._removeSecondaryCursors = function (ctx) {
            this.cursors.killSecondaryCursors();
            return true;
        };
        Cursor.prototype._cancelSelection = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.cancelSelection(oneCursor, oneCtx); });
        };
        Cursor.prototype._type = function (ctx) {
            var _this = this;
            var text = ctx.eventData.text;
            if (ctx.eventSource === 'keyboard') {
                // If this event is coming straight from the keyboard, look for electric characters and enter
                var i, len, chr;
                for (i = 0, len = text.length; i < len; i++) {
                    chr = text.charAt(i);
                    this.charactersTyped += chr;
                    // Here we must interpret each typed character individually, that's why we create a new context
                    ctx.hasExecutedCommands = this._createAndInterpretHandlerCtx(ctx.eventSource, ctx.eventData, function (charHandlerCtx) {
                        _this._invokeForAll(charHandlerCtx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.type(oneCursor, chr, oneCtx); }, false, false);
                        // The last typed character gets to win
                        ctx.cursorPositionChangeReason = charHandlerCtx.cursorPositionChangeReason;
                        ctx.shouldReveal = charHandlerCtx.shouldReveal;
                        ctx.shouldRevealVerticalInCenter = charHandlerCtx.shouldRevealVerticalInCenter;
                        ctx.shouldRevealHorizontal = charHandlerCtx.shouldRevealHorizontal;
                    }) || ctx.hasExecutedCommands;
                }
            }
            else {
                this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.actualType(oneCursor, text, false, oneCtx); });
            }
            return true;
        };
        Cursor.prototype._replacePreviousChar = function (ctx) {
            var text = ctx.eventData.text;
            var replaceCharCnt = ctx.eventData.replaceCharCnt;
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.replacePreviousChar(oneCursor, text, replaceCharCnt, oneCtx); });
        };
        Cursor.prototype._tab = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.tab(oneCursor, oneCtx); }, false, false);
        };
        Cursor.prototype._indent = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.indent(oneCursor, oneCtx); });
        };
        Cursor.prototype._outdent = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.outdent(oneCursor, oneCtx); });
        };
        Cursor.prototype._paste = function (ctx) {
            var distributedPaste = this._distributePasteToCursors(ctx);
            if (distributedPaste) {
                return this._invokeForAllSorted(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.paste(oneCursor, distributedPaste[cursorIndex], false, oneCtx); });
            }
            else {
                return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.paste(oneCursor, ctx.eventData.text, ctx.eventData.pasteOnNewLine, oneCtx); });
            }
        };
        Cursor.prototype._scrollUp = function (isPaged, ctx) {
            ctx.requestScrollDeltaLines = isPaged ? -this.configuration.editor.pageSize : -1;
            return true;
        };
        Cursor.prototype._scrollDown = function (isPaged, ctx) {
            ctx.requestScrollDeltaLines = isPaged ? this.configuration.editor.pageSize : 1;
            return true;
        };
        Cursor.prototype._distributePasteToCursors = function (ctx) {
            if (ctx.eventData.pasteOnNewLine) {
                return null;
            }
            var selections = this.cursors.getSelections();
            if (selections.length === 1) {
                return null;
            }
            for (var i = 0; i < selections.length; i++) {
                if (selections[i].startLineNumber !== selections[i].endLineNumber) {
                    return null;
                }
            }
            var pastePieces = ctx.eventData.text.split(/\r\n|\r|\n/);
            if (pastePieces.length !== selections.length) {
                return null;
            }
            return pastePieces;
        };
        Cursor.prototype._deleteLeft = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.deleteLeft(oneCursor, oneCtx); }, false, false);
        };
        Cursor.prototype._deleteWordLeft = function (whitespaceHeuristics, wordNavigationType, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.deleteWordLeft(oneCursor, whitespaceHeuristics, wordNavigationType, oneCtx); }, false, false);
        };
        Cursor.prototype._deleteRight = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.deleteRight(oneCursor, oneCtx); }, false, false);
        };
        Cursor.prototype._deleteWordRight = function (whitespaceHeuristics, wordNavigationType, ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.deleteWordRight(oneCursor, whitespaceHeuristics, wordNavigationType, oneCtx); }, false, false);
        };
        Cursor.prototype._deleteAllLeft = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.deleteAllLeft(oneCursor, oneCtx); }, false, false);
        };
        Cursor.prototype._deleteAllRight = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.deleteAllRight(oneCursor, oneCtx); }, false, false);
        };
        Cursor.prototype._cut = function (ctx) {
            var _this = this;
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) { return oneCursor_1.OneCursorOp.cut(oneCursor, _this.enableEmptySelectionClipboard, oneCtx); });
        };
        Cursor.prototype._undo = function (ctx) {
            ctx.cursorPositionChangeReason = 'undo';
            ctx.hasExecutedCommands = true;
            this._interpretCommandResult(this.model.undo());
            return true;
        };
        Cursor.prototype._cursorUndo = function (ctx) {
            if (this.cursorUndoStack.length === 0) {
                return false;
            }
            ctx.cursorPositionChangeReason = 'undo';
            ctx.isCursorUndo = true;
            this.cursors.restoreState(this.cursorUndoStack.pop());
            return true;
        };
        Cursor.prototype._redo = function (ctx) {
            ctx.cursorPositionChangeReason = 'redo';
            ctx.hasExecutedCommands = true;
            this._interpretCommandResult(this.model.redo());
            return true;
        };
        Cursor.prototype._externalExecuteCommand = function (ctx) {
            this.cursors.killSecondaryCursors();
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                oneCtx.shouldPushStackElementBefore = true;
                oneCtx.shouldPushStackElementAfter = true;
                oneCtx.executeCommand = ctx.eventData;
                return false;
            });
        };
        Cursor.prototype._externalExecuteCommands = function (ctx) {
            return this._invokeForAll(ctx, function (cursorIndex, oneCursor, oneCtx) {
                oneCtx.shouldPushStackElementBefore = true;
                oneCtx.shouldPushStackElementAfter = true;
                oneCtx.executeCommand = ctx.eventData[cursorIndex];
                return false;
            });
        };
        return Cursor;
    }(eventEmitter_1.EventEmitter));
    exports.Cursor = Cursor;
});
