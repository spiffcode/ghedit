define(["require", "exports", 'vs/base/common/async', 'vs/base/common/lifecycle', 'vs/base/common/strings', 'vs/editor/common/commands/replaceCommand', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', './findDecorations', './replaceAllCommand'], function (require, exports, async_1, lifecycle_1, strings, replaceCommand_1, position_1, range_1, editorCommon, findDecorations_1, replaceAllCommand_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.FIND_IDS = {
        StartFindAction: 'actions.find',
        NextMatchFindAction: 'editor.action.nextMatchFindAction',
        PreviousMatchFindAction: 'editor.action.previousMatchFindAction',
        NextSelectionMatchFindAction: 'editor.action.nextSelectionMatchFindAction',
        PreviousSelectionMatchFindAction: 'editor.action.previousSelectionMatchFindAction',
        AddSelectionToNextFindMatchAction: 'editor.action.addSelectionToNextFindMatch',
        MoveSelectionToNextFindMatchAction: 'editor.action.moveSelectionToNextFindMatch',
        StartFindReplaceAction: 'editor.action.startFindReplaceAction',
        CloseFindWidgetCommand: 'closeFindWidget',
        ToggleCaseSensitiveCommand: 'toggleFindCaseSensitive',
        ToggleWholeWordCommand: 'toggleFindWholeWord',
        ToggleRegexCommand: 'toggleFindRegex',
        ReplaceOneAction: 'editor.action.replaceOne',
        ReplaceAllAction: 'editor.action.replaceAll'
    };
    exports.MATCHES_LIMIT = 999;
    var FindModelBoundToEditorModel = (function () {
        function FindModelBoundToEditorModel(editor, state) {
            var _this = this;
            this._editor = editor;
            this._state = state;
            this._toDispose = [];
            this._decorations = new findDecorations_1.FindDecorations(editor);
            this._toDispose.push(this._decorations);
            this._updateDecorationsScheduler = new async_1.RunOnceScheduler(function () { return _this.research(false); }, 100);
            this._toDispose.push(this._updateDecorationsScheduler);
            this._toDispose.push(this._editor.addListener2(editorCommon.EventType.CursorPositionChanged, function (e) {
                if (e.reason === 'explicit' || e.reason === 'undo' || e.reason === 'redo') {
                    _this._decorations.setStartPosition(_this._editor.getPosition());
                }
            }));
            this._ignoreModelContentChanged = false;
            this._toDispose.push(this._editor.addListener2(editorCommon.EventType.ModelContentChanged, function (e) {
                if (_this._ignoreModelContentChanged) {
                    return;
                }
                if (e.changeType === editorCommon.EventType.ModelContentChangedFlush) {
                    // a model.setValue() was called
                    _this._decorations.reset();
                }
                _this._decorations.setStartPosition(_this._editor.getPosition());
                _this._updateDecorationsScheduler.schedule();
            }));
            this._toDispose.push(this._state.addChangeListener(function (e) { return _this._onStateChanged(e); }));
            this.research(false, this._state.searchScope);
        }
        FindModelBoundToEditorModel.prototype.dispose = function () {
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        FindModelBoundToEditorModel.prototype._onStateChanged = function (e) {
            if (e.searchString || e.isReplaceRevealed || e.isRegex || e.wholeWord || e.matchCase || e.searchScope) {
                if (e.searchScope) {
                    this.research(e.moveCursor, this._state.searchScope);
                }
                else {
                    this.research(e.moveCursor);
                }
            }
        };
        FindModelBoundToEditorModel._getSearchRange = function (model, searchOnlyEditableRange, findScope) {
            var searchRange;
            if (searchOnlyEditableRange) {
                searchRange = model.getEditableRange();
            }
            else {
                searchRange = model.getFullModelRange();
            }
            // If we have set now or before a find scope, use it for computing the search range
            if (findScope) {
                searchRange = searchRange.intersectRanges(findScope);
            }
            return searchRange;
        };
        FindModelBoundToEditorModel.prototype.research = function (moveCursor, newFindScope) {
            var findScope = null;
            if (typeof newFindScope !== 'undefined') {
                findScope = newFindScope;
            }
            else {
                findScope = this._decorations.getFindScope();
            }
            if (findScope !== null) {
                findScope = new range_1.Range(findScope.startLineNumber, 1, findScope.endLineNumber, this._editor.getModel().getLineMaxColumn(findScope.endLineNumber));
            }
            var findMatches = this._findMatches(findScope, exports.MATCHES_LIMIT);
            this._decorations.set(findMatches, findScope);
            this._state.changeMatchInfo(this._decorations.getCurrentMatchesPosition(this._editor.getSelection()), this._decorations.getCount());
            if (moveCursor) {
                this._moveToNextMatch(this._decorations.getStartPosition());
            }
        };
        FindModelBoundToEditorModel.prototype._hasMatches = function () {
            return (this._state.matchesCount > 0);
        };
        FindModelBoundToEditorModel.prototype._cannotFind = function () {
            if (!this._hasMatches()) {
                var findScope = this._decorations.getFindScope();
                if (findScope) {
                    // Reveal the selection so user is reminded that 'selection find' is on.
                    this._editor.revealRangeInCenterIfOutsideViewport(findScope);
                }
                return true;
            }
            return false;
        };
        FindModelBoundToEditorModel.prototype._moveToPrevMatch = function (before, isRecursed) {
            if (isRecursed === void 0) { isRecursed = false; }
            if (this._cannotFind()) {
                return;
            }
            var findScope = this._decorations.getFindScope();
            var searchRange = FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), this._state.isReplaceRevealed, findScope);
            // ...(----)...|...
            if (searchRange.getEndPosition().isBefore(before)) {
                before = searchRange.getEndPosition();
            }
            // ...|...(----)...
            if (before.isBefore(searchRange.getStartPosition())) {
                before = searchRange.getEndPosition();
            }
            var lineNumber = before.lineNumber, column = before.column;
            var model = this._editor.getModel();
            if (this._state.isRegex) {
                // Force advancing to the previous line if searching for $
                if (this._state.searchString === '$') {
                    if (lineNumber === 1) {
                        lineNumber = model.getLineCount();
                    }
                    else {
                        lineNumber--;
                    }
                    column = model.getLineMaxColumn(lineNumber);
                }
                // Force advancing to the previous line if searching for ^ or ^$ and cursor is at the beginning
                if (this._state.searchString === '^' || this._state.searchString === '^$') {
                    if (column === 1) {
                        if (lineNumber === 1) {
                            lineNumber = model.getLineCount();
                        }
                        else {
                            lineNumber--;
                        }
                        column = model.getLineMaxColumn(lineNumber);
                    }
                }
            }
            var position = new position_1.Position(lineNumber, column);
            var prevMatch = model.findPreviousMatch(this._state.searchString, position, this._state.isRegex, this._state.matchCase, this._state.wholeWord);
            if (!prevMatch) {
                // there is precisely one match and selection is on top of it
                return;
            }
            if (!isRecursed && !searchRange.containsRange(prevMatch)) {
                return this._moveToPrevMatch(prevMatch.getStartPosition(), true);
            }
            var matchesPosition = this._decorations.setCurrentFindMatch(prevMatch);
            this._state.changeMatchInfo(matchesPosition, this._decorations.getCount());
            this._editor.setSelection(prevMatch);
            this._editor.revealRangeInCenterIfOutsideViewport(prevMatch);
        };
        FindModelBoundToEditorModel.prototype.moveToPrevMatch = function () {
            this._moveToPrevMatch(this._editor.getSelection().getStartPosition());
        };
        FindModelBoundToEditorModel.prototype._moveToNextMatch = function (after, isRecursed) {
            if (isRecursed === void 0) { isRecursed = false; }
            if (this._cannotFind()) {
                return;
            }
            var findScope = this._decorations.getFindScope();
            var searchRange = FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), this._state.isReplaceRevealed, findScope);
            // ...(----)...|...
            if (searchRange.getEndPosition().isBefore(after)) {
                after = searchRange.getStartPosition();
            }
            // ...|...(----)...
            if (after.isBefore(searchRange.getStartPosition())) {
                after = searchRange.getStartPosition();
            }
            var lineNumber = after.lineNumber, column = after.column;
            var model = this._editor.getModel();
            if (this._state.isRegex) {
                // Force advancing to the next line if searching for ^ or ^$
                if (this._state.searchString === '^' || this._state.searchString === '^$') {
                    if (lineNumber === model.getLineCount()) {
                        lineNumber = 1;
                    }
                    else {
                        lineNumber++;
                    }
                    column = 1;
                }
                // Force advancing to the next line if searching for $ and at the end of the line
                if (this._state.searchString === '$') {
                    if (column === model.getLineMaxColumn(lineNumber)) {
                        if (lineNumber === model.getLineCount()) {
                            lineNumber = 1;
                        }
                        else {
                            lineNumber++;
                        }
                        column = 1;
                    }
                }
            }
            var position = new position_1.Position(lineNumber, column);
            var nextMatch = model.findNextMatch(this._state.searchString, position, this._state.isRegex, this._state.matchCase, this._state.wholeWord);
            if (!nextMatch) {
                // there is precisely one match and selection is on top of it
                return;
            }
            if (!isRecursed && !searchRange.containsRange(nextMatch)) {
                return this._moveToNextMatch(nextMatch.getEndPosition(), true);
            }
            var matchesPosition = this._decorations.setCurrentFindMatch(nextMatch);
            this._state.changeMatchInfo(matchesPosition, this._decorations.getCount());
            this._editor.setSelection(nextMatch);
            this._editor.revealRangeInCenterIfOutsideViewport(nextMatch);
        };
        FindModelBoundToEditorModel.prototype.moveToNextMatch = function () {
            this._moveToNextMatch(this._editor.getSelection().getEndPosition());
        };
        FindModelBoundToEditorModel.prototype.getReplaceString = function (matchedString) {
            if (!this._state.isRegex) {
                return this._state.replaceString;
            }
            var regexp = strings.createRegExp(this._state.searchString, this._state.isRegex, this._state.matchCase, this._state.wholeWord, true);
            // Parse the replace string to support that \t or \n mean the right thing
            var parsedReplaceString = parseReplaceString(this._state.replaceString);
            return matchedString.replace(regexp, parsedReplaceString);
        };
        FindModelBoundToEditorModel.prototype._rangeIsMatch = function (range) {
            var selection = this._editor.getSelection();
            var selectionText = this._editor.getModel().getValueInRange(selection);
            var regexp = strings.createSafeRegExp(this._state.searchString, this._state.isRegex, this._state.matchCase, this._state.wholeWord);
            var m = selectionText.match(regexp);
            return (m && m[0].length === selectionText.length);
        };
        FindModelBoundToEditorModel.prototype.replace = function () {
            if (!this._hasMatches()) {
                return;
            }
            var selection = this._editor.getSelection();
            var selectionText = this._editor.getModel().getValueInRange(selection);
            if (this._rangeIsMatch(selection)) {
                // selection sits on a find match => replace it!
                var replaceString = this.getReplaceString(selectionText);
                var command = new replaceCommand_1.ReplaceCommand(selection, replaceString);
                this._executeEditorCommand('replace', command);
                this._decorations.setStartPosition(new position_1.Position(selection.startLineNumber, selection.startColumn + replaceString.length));
                this.research(true);
            }
            else {
                this._decorations.setStartPosition(this._editor.getPosition());
                this.moveToNextMatch();
            }
        };
        FindModelBoundToEditorModel.prototype._findMatches = function (findScope, limitResultCount) {
            var searchRange = FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), this._state.isReplaceRevealed, findScope);
            return this._editor.getModel().findMatches(this._state.searchString, searchRange, this._state.isRegex, this._state.matchCase, this._state.wholeWord, limitResultCount);
        };
        FindModelBoundToEditorModel.prototype.replaceAll = function () {
            if (!this._hasMatches()) {
                return;
            }
            var model = this._editor.getModel();
            var findScope = this._decorations.getFindScope();
            // Get all the ranges (even more than the highlighted ones)
            var ranges = this._findMatches(findScope, Number.MAX_VALUE);
            var replaceStrings = [];
            for (var i = 0, len = ranges.length; i < len; i++) {
                replaceStrings.push(this.getReplaceString(model.getValueInRange(ranges[i])));
            }
            var command = new replaceAllCommand_1.ReplaceAllCommand(ranges, replaceStrings);
            this._executeEditorCommand('replaceAll', command);
            this.research(false);
        };
        FindModelBoundToEditorModel.prototype._executeEditorCommand = function (source, command) {
            try {
                this._ignoreModelContentChanged = true;
                this._editor.executeCommand(source, command);
            }
            finally {
                this._ignoreModelContentChanged = false;
            }
        };
        return FindModelBoundToEditorModel;
    }());
    exports.FindModelBoundToEditorModel = FindModelBoundToEditorModel;
    var BACKSLASH_CHAR_CODE = '\\'.charCodeAt(0);
    var DOLLAR_CHAR_CODE = '$'.charCodeAt(0);
    var ZERO_CHAR_CODE = '0'.charCodeAt(0);
    var n_CHAR_CODE = 'n'.charCodeAt(0);
    var t_CHAR_CODE = 't'.charCodeAt(0);
    /**
     * \n => LF
     * \t => TAB
     * \\ => \
     * $0 => $& (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter)
     * everything else stays untouched
     */
    function parseReplaceString(input) {
        if (!input || input.length === 0) {
            return input;
        }
        var substrFrom = 0, result = '';
        for (var i = 0, len = input.length; i < len; i++) {
            var chCode = input.charCodeAt(i);
            if (chCode === BACKSLASH_CHAR_CODE) {
                // move to next char
                i++;
                if (i >= len) {
                    // string ends with a \
                    break;
                }
                var nextChCode = input.charCodeAt(i);
                var replaceWithCharacter = null;
                switch (nextChCode) {
                    case BACKSLASH_CHAR_CODE:
                        // \\ => \
                        replaceWithCharacter = '\\';
                        break;
                    case n_CHAR_CODE:
                        // \n => LF
                        replaceWithCharacter = '\n';
                        break;
                    case t_CHAR_CODE:
                        // \t => TAB
                        replaceWithCharacter = '\t';
                        break;
                }
                if (replaceWithCharacter) {
                    result += input.substring(substrFrom, i - 1) + replaceWithCharacter;
                    substrFrom = i + 1;
                }
            }
            if (chCode === DOLLAR_CHAR_CODE) {
                // move to next char
                i++;
                if (i >= len) {
                    // string ends with a $
                    break;
                }
                var nextChCode = input.charCodeAt(i);
                var replaceWithCharacter = null;
                switch (nextChCode) {
                    case ZERO_CHAR_CODE:
                        // $0 => $&
                        replaceWithCharacter = '$&';
                        break;
                }
                if (replaceWithCharacter) {
                    result += input.substring(substrFrom, i - 1) + replaceWithCharacter;
                    substrFrom = i + 1;
                }
            }
        }
        if (substrFrom === 0) {
            // no replacement occured
            return input;
        }
        return result + input.substring(substrFrom);
    }
    exports.parseReplaceString = parseReplaceString;
});
//# sourceMappingURL=findModel.js.map