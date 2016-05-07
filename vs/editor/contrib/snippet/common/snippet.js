/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/collections', 'vs/base/common/keyCodes', 'vs/base/common/strings', 'vs/platform/keybinding/common/keybindingService', 'vs/editor/common/core/editOperation', 'vs/editor/common/core/range', 'vs/editor/common/core/selection', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions'], function (require, exports, collections, keyCodes_1, strings, keybindingService_1, editOperation_1, range_1, selection_1, editorCommon, editorCommonExtensions_1) {
    'use strict';
    (function (ExternalSnippetType) {
        ExternalSnippetType[ExternalSnippetType["TextMateSnippet"] = 0] = "TextMateSnippet";
        ExternalSnippetType[ExternalSnippetType["EmmetSnippet"] = 1] = "EmmetSnippet";
    })(exports.ExternalSnippetType || (exports.ExternalSnippetType = {}));
    var ExternalSnippetType = exports.ExternalSnippetType;
    var CodeSnippet = (function () {
        function CodeSnippet(snippetTemplate) {
            this.lines = [];
            this.placeHolders = [];
            this._lastGeneratedId = 0;
            this.startPlaceHolderIndex = 0;
            this.finishPlaceHolderIndex = -1;
            this.parseTemplate(snippetTemplate);
        }
        CodeSnippet.prototype.parseTemplate = function (template) {
            var placeHoldersMap = {};
            var i, len, j, lenJ, templateLines = template.split('\n');
            for (i = 0, len = templateLines.length; i < len; i++) {
                var parsedLine = this.parseLine(templateLines[i], function (id) {
                    if (collections.contains(placeHoldersMap, id)) {
                        return placeHoldersMap[id].value;
                    }
                    return '';
                });
                for (j = 0, lenJ = parsedLine.placeHolders.length; j < lenJ; j++) {
                    var linePlaceHolder = parsedLine.placeHolders[j];
                    var occurence = new range_1.Range(i + 1, linePlaceHolder.startColumn, i + 1, linePlaceHolder.endColumn);
                    var placeHolder;
                    if (collections.contains(placeHoldersMap, linePlaceHolder.id)) {
                        placeHolder = placeHoldersMap[linePlaceHolder.id];
                    }
                    else {
                        placeHolder = {
                            id: linePlaceHolder.id,
                            value: linePlaceHolder.value,
                            occurences: []
                        };
                        this.placeHolders.push(placeHolder);
                        if (linePlaceHolder.value === '') {
                            this.finishPlaceHolderIndex = this.placeHolders.length - 1;
                        }
                        placeHoldersMap[linePlaceHolder.id] = placeHolder;
                    }
                    placeHolder.occurences.push(occurence);
                }
                this.lines.push(parsedLine.line);
            }
            if (this.placeHolders.length > this.startPlaceHolderIndex) {
                var startPlaceHolder = this.placeHolders[this.startPlaceHolderIndex];
                if (startPlaceHolder.value === '' && startPlaceHolder.id === '') {
                    // Do not start at an empty placeholder if possible
                    if (this.placeHolders.length > 1) {
                        this.startPlaceHolderIndex++;
                    }
                }
            }
        };
        CodeSnippet.prototype.parseLine = function (line, findDefaultValueForId) {
            // Placeholder 0 is the entire line
            var placeHolderStack = [{ placeHolderId: '', placeHolderText: '' }];
            var placeHolders = [];
            var i = 0;
            var len = line.length;
            var resultIndex = 0;
            while (i < len) {
                var restOfLine = line.substr(i);
                // Look for the start of a placeholder {{
                if (/^{{/.test(restOfLine)) {
                    i += 2;
                    placeHolderStack.push({ placeHolderId: '', placeHolderText: '' });
                    // Look for id
                    var matches = restOfLine.match(/^{{(\w+):/);
                    if (Array.isArray(matches) && matches.length === 2) {
                        placeHolderStack[placeHolderStack.length - 1].placeHolderId = matches[1];
                        i += matches[1].length + 1; // +1 to account for the : at the end of the id
                    }
                    continue;
                }
                // Look for the end of a placeholder. placeHolderStack[0] is the top-level line.
                if (placeHolderStack.length > 1 && /^}}/.test(restOfLine)) {
                    i += 2;
                    if (placeHolderStack[placeHolderStack.length - 1].placeHolderId.length === 0) {
                        // This placeholder did not have an explicit id
                        placeHolderStack[placeHolderStack.length - 1].placeHolderId = placeHolderStack[placeHolderStack.length - 1].placeHolderText;
                        if (placeHolderStack[placeHolderStack.length - 1].placeHolderId === '_') {
                            // This is just an empty tab stop
                            placeHolderStack[placeHolderStack.length - 1].placeHolderId = 'TAB_STOP_' + String(++this._lastGeneratedId);
                            placeHolderStack[placeHolderStack.length - 1].placeHolderText = '';
                            --resultIndex; // Roll back one iteration of the result index as we made the text empty
                        }
                    }
                    if (placeHolderStack[placeHolderStack.length - 1].placeHolderText.length === 0) {
                        // This placeholder is empty or was a mirror
                        var defaultValue = findDefaultValueForId(placeHolderStack[placeHolderStack.length - 1].placeHolderId);
                        placeHolderStack[placeHolderStack.length - 1].placeHolderText = defaultValue;
                        resultIndex += defaultValue.length;
                    }
                    placeHolders.push({
                        id: placeHolderStack[placeHolderStack.length - 1].placeHolderId,
                        value: placeHolderStack[placeHolderStack.length - 1].placeHolderText,
                        startColumn: resultIndex + 1 - placeHolderStack[placeHolderStack.length - 1].placeHolderText.length,
                        endColumn: resultIndex + 1
                    });
                    // Insert our text into the previous placeholder
                    placeHolderStack[placeHolderStack.length - 2].placeHolderText += placeHolderStack[placeHolderStack.length - 1].placeHolderText;
                    placeHolderStack.pop();
                    continue;
                }
                // Look for escapes
                if (/^\\./.test(restOfLine)) {
                    if (restOfLine.charAt(1) === '{' || restOfLine.charAt(1) === '}' || restOfLine.charAt(1) === '\\') {
                        ++i; // Skip the escape slash and take the character literally
                    }
                    else {
                        // invalid escapes
                        placeHolderStack[placeHolderStack.length - 1].placeHolderText += line.charAt(i);
                        ++resultIndex;
                        ++i;
                    }
                }
                //This is an escape sequence or not a special character, just insert it
                placeHolderStack[placeHolderStack.length - 1].placeHolderText += line.charAt(i);
                ++resultIndex;
                ++i;
            }
            // Sort the placeholder in order of apperance:
            placeHolders.sort(function (a, b) {
                if (a.startColumn < b.startColumn) {
                    return -1;
                }
                if (a.startColumn > b.startColumn) {
                    return 1;
                }
                if (a.endColumn < b.endColumn) {
                    return -1;
                }
                if (a.endColumn > b.endColumn) {
                    return 1;
                }
                return 0;
            });
            return {
                line: placeHolderStack[0].placeHolderText,
                placeHolders: placeHolders
            };
        };
        // This is used for both TextMate and Emmet
        CodeSnippet.convertExternalSnippet = function (snippet, snippetType) {
            var openBraces = 0;
            var convertedSnippet = '';
            var i = 0;
            var len = snippet.length;
            while (i < len) {
                var restOfLine = snippet.substr(i);
                // Cursor tab stop
                if (/^\$0/.test(restOfLine)) {
                    i += 2;
                    convertedSnippet += snippetType === ExternalSnippetType.EmmetSnippet ? '{{_}}' : '{{}}';
                    continue;
                }
                if (/^\$\{0\}/.test(restOfLine)) {
                    i += 4;
                    convertedSnippet += snippetType === ExternalSnippetType.EmmetSnippet ? '{{_}}' : '{{}}';
                    continue;
                }
                if (snippetType === ExternalSnippetType.EmmetSnippet && /^\|/.test(restOfLine)) {
                    ++i;
                    convertedSnippet += '{{}}';
                    continue;
                }
                // Tab stops
                var matches = restOfLine.match(/^\$(\d+)/);
                if (Array.isArray(matches) && matches.length === 2) {
                    i += 1 + matches[1].length;
                    convertedSnippet += '{{' + matches[1] + ':}}';
                    continue;
                }
                matches = restOfLine.match(/^\$\{(\d+)\}/);
                if (Array.isArray(matches) && matches.length === 2) {
                    i += 3 + matches[1].length;
                    convertedSnippet += '{{' + matches[1] + ':}}';
                    continue;
                }
                // Open brace patterns placeholder
                if (/^\${/.test(restOfLine)) {
                    i += 2;
                    ++openBraces;
                    convertedSnippet += '{{';
                    continue;
                }
                // Close brace patterns placeholder
                if (openBraces > 0 && /^}/.test(restOfLine)) {
                    i += 1;
                    --openBraces;
                    convertedSnippet += '}}';
                    continue;
                }
                // Escapes
                if (/^\\./.test(restOfLine)) {
                    i += 2;
                    if (/^\\\$/.test(restOfLine)) {
                        convertedSnippet += '$';
                    }
                    else {
                        convertedSnippet += restOfLine.substr(0, 2);
                    }
                    continue;
                }
                // Escape braces that don't belong to a placeholder
                matches = restOfLine.match(/^({|})/);
                if (Array.isArray(matches) && matches.length === 2) {
                    i += 1;
                    convertedSnippet += '\\' + matches[1];
                    continue;
                }
                i += 1;
                convertedSnippet += restOfLine.charAt(0);
            }
            return convertedSnippet;
        };
        CodeSnippet.prototype.extractLineIndentation = function (str, maxColumn) {
            if (maxColumn === void 0) { maxColumn = Number.MAX_VALUE; }
            var fullIndentation = strings.getLeadingWhitespace(str);
            if (fullIndentation.length > maxColumn - 1) {
                return fullIndentation.substring(0, maxColumn - 1);
            }
            return fullIndentation;
        };
        CodeSnippet.prototype.bind = function (referenceLine, deltaLine, firstLineDeltaColumn, config) {
            var resultLines = [];
            var resultPlaceHolders = [];
            var referenceIndentation = this.extractLineIndentation(referenceLine, firstLineDeltaColumn + 1);
            var originalLine, originalLineIndentation, remainingLine, indentation;
            var i, len, j, lenJ;
            // Compute resultLines & keep deltaColumns as a reference for adjusting placeholders
            var deltaColumns = [];
            for (i = 0, len = this.lines.length; i < len; i++) {
                originalLine = this.lines[i];
                if (i === 0) {
                    deltaColumns[i + 1] = firstLineDeltaColumn;
                    resultLines[i] = originalLine;
                }
                else {
                    originalLineIndentation = this.extractLineIndentation(originalLine);
                    remainingLine = originalLine.substr(originalLineIndentation.length);
                    indentation = config.normalizeIndentation(referenceIndentation + originalLineIndentation);
                    deltaColumns[i + 1] = indentation.length - originalLineIndentation.length;
                    resultLines[i] = indentation + remainingLine;
                }
            }
            // Compute resultPlaceHolders
            var originalPlaceHolder, originalOccurence, resultOccurences;
            for (i = 0, len = this.placeHolders.length; i < len; i++) {
                originalPlaceHolder = this.placeHolders[i];
                resultOccurences = [];
                for (j = 0, lenJ = originalPlaceHolder.occurences.length; j < lenJ; j++) {
                    originalOccurence = originalPlaceHolder.occurences[j];
                    resultOccurences.push({
                        startLineNumber: originalOccurence.startLineNumber + deltaLine,
                        startColumn: originalOccurence.startColumn + deltaColumns[originalOccurence.startLineNumber],
                        endLineNumber: originalOccurence.endLineNumber + deltaLine,
                        endColumn: originalOccurence.endColumn + deltaColumns[originalOccurence.endLineNumber]
                    });
                }
                resultPlaceHolders.push({
                    id: originalPlaceHolder.id,
                    value: originalPlaceHolder.value,
                    occurences: resultOccurences
                });
            }
            return {
                lines: resultLines,
                placeHolders: resultPlaceHolders,
                startPlaceHolderIndex: this.startPlaceHolderIndex,
                finishPlaceHolderIndex: this.finishPlaceHolderIndex
            };
        };
        return CodeSnippet;
    }());
    exports.CodeSnippet = CodeSnippet;
    var InsertSnippetController = (function () {
        function InsertSnippetController(editor, adaptedSnippet, startLineNumber, initialAlternativeVersionId, onStop) {
            this.editor = editor;
            this._onStop = onStop;
            this.model = editor.getModel();
            this.finishPlaceHolderIndex = adaptedSnippet.finishPlaceHolderIndex;
            this.trackedPlaceHolders = [];
            this.placeHolderDecorations = [];
            this.currentPlaceHolderIndex = adaptedSnippet.startPlaceHolderIndex;
            this.highlightDecorationId = null;
            this.isFinished = false;
            this._initialAlternativeVersionId = initialAlternativeVersionId;
            this.initialize(adaptedSnippet, startLineNumber);
        }
        InsertSnippetController.prototype.dispose = function () {
            this.stopAll();
        };
        InsertSnippetController.prototype.initialize = function (adaptedSnippet, startLineNumber) {
            var _this = this;
            var i, len;
            for (i = 0, len = adaptedSnippet.placeHolders.length; i < len; i++) {
                var placeHolder = adaptedSnippet.placeHolders[i];
                var trackedRanges = [];
                for (var j = 0, lenJ = placeHolder.occurences.length; j < lenJ; j++) {
                    trackedRanges.push(this.model.addTrackedRange(placeHolder.occurences[j], editorCommon.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges));
                }
                this.trackedPlaceHolders.push({
                    ranges: trackedRanges
                });
            }
            this.editor.changeDecorations(function (changeAccessor) {
                var newDecorations = [];
                var endLineNumber = startLineNumber + adaptedSnippet.lines.length - 1;
                var endLineNumberMaxColumn = _this.model.getLineMaxColumn(endLineNumber);
                newDecorations.push({
                    range: new range_1.Range(startLineNumber, 1, endLineNumber, endLineNumberMaxColumn),
                    options: {
                        className: 'new-snippet',
                        isWholeLine: true
                    }
                });
                for (var i_1 = 0, len_1 = _this.trackedPlaceHolders.length; i_1 < len_1; i_1++) {
                    var className = (i_1 === _this.finishPlaceHolderIndex) ? 'finish-snippet-placeholder' : 'snippet-placeholder';
                    newDecorations.push({
                        range: _this.model.getTrackedRange(_this.trackedPlaceHolders[i_1].ranges[0]),
                        options: {
                            className: className
                        }
                    });
                }
                var decorations = changeAccessor.deltaDecorations([], newDecorations);
                _this.highlightDecorationId = decorations[0];
                _this.placeHolderDecorations = decorations.slice(1);
            });
            this.listenersToRemove = [];
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.ModelContentChanged, function (e) {
                if (_this.isFinished) {
                    return;
                }
                if (e.changeType === editorCommon.EventType.ModelContentChangedFlush) {
                    // a model.setValue() was called
                    _this.stopAll();
                }
                else if (e.changeType === editorCommon.EventType.ModelContentChangedLineChanged) {
                    var changedLine = e.lineNumber;
                    var highlightRange = _this.model.getDecorationRange(_this.highlightDecorationId);
                    if (changedLine < highlightRange.startLineNumber || changedLine > highlightRange.endLineNumber) {
                        _this.stopAll();
                    }
                }
                else if (e.changeType === editorCommon.EventType.ModelContentChangedLinesInserted) {
                    var insertLine = e.fromLineNumber;
                    var highlightRange = _this.model.getDecorationRange(_this.highlightDecorationId);
                    if (insertLine < highlightRange.startLineNumber || insertLine > highlightRange.endLineNumber) {
                        _this.stopAll();
                    }
                }
                else if (e.changeType === editorCommon.EventType.ModelContentChangedLinesDeleted) {
                    var deleteLine1 = e.fromLineNumber;
                    var deleteLine2 = e.toLineNumber;
                    var highlightRange = _this.model.getDecorationRange(_this.highlightDecorationId);
                    var deletedLinesAbove = (deleteLine2 < highlightRange.startLineNumber);
                    var deletedLinesBelow = (deleteLine1 > highlightRange.endLineNumber);
                    if (deletedLinesAbove || deletedLinesBelow) {
                        _this.stopAll();
                    }
                }
                var newAlternateVersionId = _this.editor.getModel().getAlternativeVersionId();
                if (_this._initialAlternativeVersionId === newAlternateVersionId) {
                    // We executed undo until we reached the same version we started with
                    _this.stopAll();
                }
            }));
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.CursorPositionChanged, function (e) {
                if (_this.isFinished) {
                    return;
                }
                var highlightRange = _this.model.getDecorationRange(_this.highlightDecorationId);
                var lineNumber = e.position.lineNumber;
                if (lineNumber < highlightRange.startLineNumber || lineNumber > highlightRange.endLineNumber) {
                    _this.stopAll();
                }
            }));
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.ModelChanged, function () {
                _this.stopAll();
            }));
            var blurTimeout = -1;
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.EditorBlur, function () {
                // Blur if within 100ms we do not focus back
                blurTimeout = setTimeout(function () {
                    _this.stopAll();
                }, 100);
            }));
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.EditorFocus, function () {
                // Cancel the blur timeout (if any)
                if (blurTimeout !== -1) {
                    clearTimeout(blurTimeout);
                    blurTimeout = -1;
                }
            }));
            this.listenersToRemove.push(this.model.addListener(editorCommon.EventType.ModelDecorationsChanged, function (e) {
                if (_this.isFinished) {
                    return;
                }
                var modelEditableRange = _this.model.getEditableRange(), previousRange = null, allCollapsed = true, allEqualToEditableRange = true;
                for (var i = 0; (allCollapsed || allEqualToEditableRange) && i < _this.trackedPlaceHolders.length; i++) {
                    var ranges = _this.trackedPlaceHolders[i].ranges;
                    for (var j = 0; (allCollapsed || allEqualToEditableRange) && j < ranges.length; j++) {
                        var range = _this.model.getTrackedRange(ranges[j]);
                        if (allCollapsed) {
                            if (!range.isEmpty()) {
                                allCollapsed = false;
                            }
                            else if (previousRange === null) {
                                previousRange = range;
                            }
                            else if (!previousRange.equalsRange(range)) {
                                allCollapsed = false;
                            }
                        }
                        if (allEqualToEditableRange && !modelEditableRange.equalsRange(range)) {
                            allEqualToEditableRange = false;
                        }
                    }
                }
                if (allCollapsed || allEqualToEditableRange) {
                    _this.stopAll();
                }
                else {
                    if (_this.finishPlaceHolderIndex !== -1) {
                        var finishPlaceHolderDecorationId = _this.placeHolderDecorations[_this.finishPlaceHolderIndex];
                        var finishPlaceHolderRange = _this.model.getDecorationRange(finishPlaceHolderDecorationId);
                        var finishPlaceHolderOptions = _this.model.getDecorationOptions(finishPlaceHolderDecorationId);
                        var finishPlaceHolderRangeIsEmpty = finishPlaceHolderRange.isEmpty();
                        var finishPlaceHolderClassNameIsForEmpty = (finishPlaceHolderOptions.className === 'finish-snippet-placeholder');
                        // Remember xor? :)
                        var needsChanging = Number(finishPlaceHolderRangeIsEmpty) ^ Number(finishPlaceHolderClassNameIsForEmpty);
                        if (needsChanging) {
                            _this.editor.changeDecorations(function (changeAccessor) {
                                var className = finishPlaceHolderRangeIsEmpty ? 'finish-snippet-placeholder' : 'snippet-placeholder';
                                changeAccessor.changeDecorationOptions(finishPlaceHolderDecorationId, {
                                    className: className
                                });
                            });
                        }
                    }
                }
            }));
            this.doLinkEditing();
        };
        InsertSnippetController.prototype.onNextPlaceHolder = function () {
            return this.changePlaceHolder(true);
        };
        InsertSnippetController.prototype.onPrevPlaceHolder = function () {
            return this.changePlaceHolder(false);
        };
        InsertSnippetController.prototype.changePlaceHolder = function (goToNext) {
            if (this.isFinished) {
                return false;
            }
            var oldPlaceHolderIndex = this.currentPlaceHolderIndex;
            var oldRange = this.model.getTrackedRange(this.trackedPlaceHolders[oldPlaceHolderIndex].ranges[0]);
            var sameRange = true;
            do {
                if (goToNext) {
                    this.currentPlaceHolderIndex = (this.currentPlaceHolderIndex + 1) % this.trackedPlaceHolders.length;
                }
                else {
                    this.currentPlaceHolderIndex = (this.trackedPlaceHolders.length + this.currentPlaceHolderIndex - 1) % this.trackedPlaceHolders.length;
                }
                var newRange = this.model.getTrackedRange(this.trackedPlaceHolders[this.currentPlaceHolderIndex].ranges[0]);
                sameRange = oldRange.equalsRange(newRange);
            } while (this.currentPlaceHolderIndex !== oldPlaceHolderIndex && sameRange);
            this.doLinkEditing();
            return true;
        };
        InsertSnippetController.prototype.onAccept = function () {
            if (this.isFinished) {
                return false;
            }
            if (this.finishPlaceHolderIndex !== -1) {
                var finishRange = this.model.getTrackedRange(this.trackedPlaceHolders[this.finishPlaceHolderIndex].ranges[0]);
                // Let's just position cursor at the end of the finish range
                this.editor.setPosition({
                    lineNumber: finishRange.endLineNumber,
                    column: finishRange.endColumn
                });
            }
            this.stopAll();
            return true;
        };
        InsertSnippetController.prototype.onEscape = function () {
            if (this.isFinished) {
                return false;
            }
            this.stopAll();
            // Cancel multi-cursor
            this.editor.setSelections([this.editor.getSelections()[0]]);
            return true;
        };
        InsertSnippetController.prototype.doLinkEditing = function () {
            var selections = [];
            for (var i = 0, len = this.trackedPlaceHolders[this.currentPlaceHolderIndex].ranges.length; i < len; i++) {
                var range = this.model.getTrackedRange(this.trackedPlaceHolders[this.currentPlaceHolderIndex].ranges[i]);
                selections.push({
                    selectionStartLineNumber: range.startLineNumber,
                    selectionStartColumn: range.startColumn,
                    positionLineNumber: range.endLineNumber,
                    positionColumn: range.endColumn
                });
            }
            this.editor.setSelections(selections);
        };
        InsertSnippetController.prototype.stopAll = function () {
            var _this = this;
            if (this.isFinished) {
                return;
            }
            this._onStop();
            this.isFinished = true;
            this.listenersToRemove.forEach(function (element) {
                element();
            });
            this.listenersToRemove = [];
            for (var i = 0; i < this.trackedPlaceHolders.length; i++) {
                var ranges = this.trackedPlaceHolders[i].ranges;
                for (var j = 0; j < ranges.length; j++) {
                    this.model.removeTrackedRange(ranges[j]);
                }
            }
            this.trackedPlaceHolders = [];
            this.editor.changeDecorations(function (changeAccessor) {
                var toRemove = [];
                toRemove.push(_this.highlightDecorationId);
                for (var i_2 = 0; i_2 < _this.placeHolderDecorations.length; i_2++) {
                    toRemove.push(_this.placeHolderDecorations[i_2]);
                }
                changeAccessor.deltaDecorations(toRemove, []);
                _this.placeHolderDecorations = [];
                _this.highlightDecorationId = null;
            });
        };
        return InsertSnippetController;
    }());
    function getSnippetController(editor) {
        return editor.getContribution(SnippetController.ID);
    }
    exports.getSnippetController = getSnippetController;
    var SnippetController = (function () {
        function SnippetController(editor, keybindingService) {
            this._editor = editor;
            this._currentController = null;
            this._inSnippetMode = keybindingService.createKey(exports.CONTEXT_SNIPPET_MODE, false);
        }
        SnippetController.prototype.dispose = function () {
            if (this._currentController) {
                this._currentController.dispose();
                this._currentController = null;
            }
        };
        SnippetController.prototype.getId = function () {
            return SnippetController.ID;
        };
        SnippetController.prototype.run = function (snippet, overwriteBefore, overwriteAfter) {
            var prevController = this._currentController;
            this._currentController = null;
            if (snippet.placeHolders.length === 0) {
                // No placeholders => execute for all editor selections
                this._runForAllSelections(snippet, overwriteBefore, overwriteAfter);
            }
            else {
                this._runForPrimarySelection(snippet, overwriteBefore, overwriteAfter);
            }
            if (!this._currentController) {
                // we didn't end up in snippet mode again => restore previous controller
                this._currentController = prevController;
            }
            else {
                // we ended up in snippet mode => dispose previous controller if necessary
                if (prevController) {
                    prevController.dispose();
                }
            }
        };
        SnippetController._getTypeRangeForSelection = function (model, selection, overwriteBefore, overwriteAfter) {
            var typeRange;
            if (overwriteBefore || overwriteAfter) {
                typeRange = model.validateRange(range_1.Range.plusRange(selection, {
                    startLineNumber: selection.positionLineNumber,
                    startColumn: selection.positionColumn - overwriteBefore,
                    endLineNumber: selection.positionLineNumber,
                    endColumn: selection.positionColumn + overwriteAfter
                }));
            }
            else {
                typeRange = selection;
            }
            return typeRange;
        };
        SnippetController._getAdaptedSnippet = function (model, snippet, typeRange) {
            return snippet.bind(model.getLineContent(typeRange.startLineNumber), typeRange.startLineNumber - 1, typeRange.startColumn - 1, model);
        };
        SnippetController._addCommandForSnippet = function (model, adaptedSnippet, typeRange, out) {
            var insertText = adaptedSnippet.lines.join('\n');
            var currentText = model.getValueInRange(typeRange, editorCommon.EndOfLinePreference.LF);
            if (insertText !== currentText) {
                out.push(editOperation_1.EditOperation.replaceMove(typeRange, insertText));
            }
        };
        SnippetController.prototype._runForPrimarySelection = function (snippet, overwriteBefore, overwriteAfter) {
            var _this = this;
            var initialAlternativeVersionId = this._editor.getModel().getAlternativeVersionId();
            var edits = [];
            var prepared = SnippetController._prepareSnippet(this._editor, this._editor.getSelection(), snippet, overwriteBefore, overwriteAfter);
            SnippetController._addCommandForSnippet(this._editor.getModel(), prepared.adaptedSnippet, prepared.typeRange, edits);
            if (edits.length > 0) {
                this._editor.getModel().pushStackElement();
                this._editor.executeEdits('editor.contrib.insertSnippetHelper', edits);
                this._editor.getModel().pushStackElement();
            }
            var cursorOnly = SnippetController._getSnippetCursorOnly(prepared.adaptedSnippet);
            if (cursorOnly) {
                this._editor.setSelection(selection_1.Selection.createSelection(cursorOnly.lineNumber, cursorOnly.column, cursorOnly.lineNumber, cursorOnly.column));
            }
            else if (prepared.adaptedSnippet.placeHolders.length > 0) {
                this._inSnippetMode.set(true);
                this._currentController = new InsertSnippetController(this._editor, prepared.adaptedSnippet, prepared.typeRange.startLineNumber, initialAlternativeVersionId, function () {
                    _this._inSnippetMode.reset();
                });
            }
        };
        SnippetController.prototype._runForAllSelections = function (snippet, overwriteBefore, overwriteAfter) {
            var selections = this._editor.getSelections(), edits = [];
            for (var i = 0; i < selections.length; i++) {
                var prepared = SnippetController._prepareSnippet(this._editor, selections[i], snippet, overwriteBefore, overwriteAfter);
                SnippetController._addCommandForSnippet(this._editor.getModel(), prepared.adaptedSnippet, prepared.typeRange, edits);
            }
            if (edits.length > 0) {
                this._editor.getModel().pushStackElement();
                this._editor.executeEdits('editor.contrib.insertSnippetHelper', edits);
                this._editor.getModel().pushStackElement();
            }
        };
        SnippetController._prepareSnippet = function (editor, selection, snippet, overwriteBefore, overwriteAfter) {
            var model = editor.getModel();
            var typeRange = SnippetController._getTypeRangeForSelection(model, selection, overwriteBefore, overwriteAfter);
            if (snippet.lines.length === 1) {
                var nextTextOnLine = model.getLineContent(typeRange.endLineNumber).substr(typeRange.endColumn - 1);
                var nextInSnippet = snippet.lines[0].substr(overwriteBefore);
                var commonPrefix = strings.commonPrefixLength(nextTextOnLine, nextInSnippet);
                if (commonPrefix > 0) {
                    typeRange = typeRange.setEndPosition(typeRange.endLineNumber, typeRange.endColumn + commonPrefix);
                }
            }
            var adaptedSnippet = SnippetController._getAdaptedSnippet(model, snippet, typeRange);
            return {
                typeRange: typeRange,
                adaptedSnippet: adaptedSnippet
            };
        };
        SnippetController._getSnippetCursorOnly = function (snippet) {
            if (snippet.placeHolders.length !== 1) {
                return null;
            }
            var placeHolder = snippet.placeHolders[0];
            if (placeHolder.value !== '' || placeHolder.occurences.length !== 1) {
                return null;
            }
            var placeHolderRange = placeHolder.occurences[0];
            if (!range_1.Range.isEmpty(placeHolderRange)) {
                return null;
            }
            return {
                lineNumber: placeHolderRange.startLineNumber,
                column: placeHolderRange.startColumn
            };
        };
        SnippetController.prototype.jumpToNextPlaceholder = function () {
            if (this._currentController) {
                this._currentController.onNextPlaceHolder();
            }
        };
        SnippetController.prototype.jumpToPrevPlaceholder = function () {
            if (this._currentController) {
                this._currentController.onPrevPlaceHolder();
            }
        };
        SnippetController.prototype.acceptSnippet = function () {
            if (this._currentController) {
                this._currentController.onAccept();
            }
        };
        SnippetController.prototype.leaveSnippet = function () {
            if (this._currentController) {
                this._currentController.onEscape();
            }
        };
        SnippetController.ID = 'editor.contrib.snippetController';
        SnippetController = __decorate([
            __param(1, keybindingService_1.IKeybindingService)
        ], SnippetController);
        return SnippetController;
    }());
    exports.CONTEXT_SNIPPET_MODE = 'inSnippetMode';
    var weight = editorCommonExtensions_1.CommonEditorRegistry.commandWeight(30);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorContribution(SnippetController);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand('jumpToNextSnippetPlaceholder', weight, { primary: keyCodes_1.KeyCode.Tab }, true, exports.CONTEXT_SNIPPET_MODE, function (ctx, editor, args) {
        getSnippetController(editor).jumpToNextPlaceholder();
    });
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand('jumpToPrevSnippetPlaceholder', weight, { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Tab }, true, exports.CONTEXT_SNIPPET_MODE, function (ctx, editor, args) {
        getSnippetController(editor).jumpToPrevPlaceholder();
    });
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand('acceptSnippet', weight, { primary: keyCodes_1.KeyCode.Enter }, true, exports.CONTEXT_SNIPPET_MODE, function (ctx, editor, args) {
        getSnippetController(editor).acceptSnippet();
    });
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand('leaveSnippet', weight, { primary: keyCodes_1.KeyCode.Escape, secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Escape] }, true, exports.CONTEXT_SNIPPET_MODE, function (ctx, editor, args) {
        getSnippetController(editor).leaveSnippet();
    });
});
//# sourceMappingURL=snippet.js.map