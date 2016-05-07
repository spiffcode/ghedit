define(["require", "exports", 'vs/base/common/async', 'vs/base/common/errors', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes'], function (require, exports, async_1, errors_1, range_1, editorCommon, editorCommonExtensions_1, modes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function getOccurrencesAtPosition(model, position) {
        var resource = model.getAssociatedResource();
        var orderedByScore = modes_1.OccurrencesRegistry.ordered(model);
        var foundResult = false;
        // in order of score ask the occurrences provider
        // until someone response with a good result
        // (good = none empty array)
        return async_1.sequence(orderedByScore.map(function (provider) {
            return function () {
                if (!foundResult) {
                    return provider.findOccurrences(resource, position).then(function (data) {
                        if (Array.isArray(data) && data.length > 0) {
                            foundResult = true;
                            return data;
                        }
                    }, function (err) {
                        errors_1.onUnexpectedError(err);
                    });
                }
            };
        })).then(function (values) {
            return values[0];
        });
    }
    exports.getOccurrencesAtPosition = getOccurrencesAtPosition;
    editorCommonExtensions_1.CommonEditorRegistry.registerDefaultLanguageCommand('_executeDocumentHighlights', getOccurrencesAtPosition);
    var WordHighlighter = (function () {
        function WordHighlighter(editor) {
            var _this = this;
            this.workerRequestTokenId = 0;
            this.workerRequest = null;
            this.workerRequestCompleted = false;
            this.workerRequestValue = [];
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
            this.editor = editor;
            this.model = this.editor.getModel();
            this.toUnhook = [];
            this.toUnhook.push(editor.addListener(editorCommon.EventType.CursorPositionChanged, function (e) {
                _this._onPositionChanged(e);
            }));
            this.toUnhook.push(editor.addListener(editorCommon.EventType.ModelChanged, function (e) {
                _this._stopAll();
                _this.model = _this.editor.getModel();
            }));
            this.toUnhook.push(editor.addListener('change', function (e) {
                _this._stopAll();
            }));
            this._lastWordRange = null;
            this._decorationIds = [];
            this.workerRequestTokenId = 0;
            this.workerRequest = null;
            this.workerRequestCompleted = false;
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
        }
        WordHighlighter.prototype._removeDecorations = function () {
            if (this._decorationIds.length > 0) {
                // remove decorations
                this._decorationIds = this.editor.deltaDecorations(this._decorationIds, []);
            }
        };
        WordHighlighter.prototype._stopAll = function () {
            this._lastWordRange = null;
            // Remove any existing decorations
            this._removeDecorations();
            // Cancel any renderDecorationsTimer
            if (this.renderDecorationsTimer !== -1) {
                window.clearTimeout(this.renderDecorationsTimer);
                this.renderDecorationsTimer = -1;
            }
            // Cancel any worker request
            if (this.workerRequest !== null) {
                this.workerRequest.cancel();
                this.workerRequest = null;
            }
            // Invalidate any worker request callback
            if (!this.workerRequestCompleted) {
                this.workerRequestTokenId++;
                this.workerRequestCompleted = true;
            }
        };
        WordHighlighter.prototype._onPositionChanged = function (e) {
            var _this = this;
            // ignore typing & other
            if (e.reason !== 'explicit') {
                this._stopAll();
                return;
            }
            // no providers for this model
            if (!modes_1.OccurrencesRegistry.has(this.model)) {
                this._stopAll();
                return;
            }
            var editorSelection = this.editor.getSelection();
            // ignore multiline selection
            if (editorSelection.startLineNumber !== editorSelection.endLineNumber) {
                this._stopAll();
                return;
            }
            var lineNumber = editorSelection.startLineNumber;
            var startColumn = editorSelection.startColumn;
            var endColumn = editorSelection.endColumn;
            var word = this.model.getWordAtPosition({
                lineNumber: lineNumber,
                column: startColumn
            });
            // The selection must be inside a word or surround one word at most
            if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
                this._stopAll();
                return;
            }
            // All the effort below is trying to achieve this:
            // - when cursor is moved to a word, trigger immediately a findOccurences request
            // - 250ms later after the last cursor move event, render the occurences
            // - no flickering!
            var currentWordRange = new range_1.Range(lineNumber, word.startColumn, lineNumber, word.endColumn);
            var workerRequestIsValid = this._lastWordRange && this._lastWordRange.equalsRange(currentWordRange);
            // Even if we are on a different word, if that word is in the decorations ranges, the request is still valid
            // (Same symbol)
            for (var i = 0, len = this._decorationIds.length; !workerRequestIsValid && i < len; i++) {
                var range = this.model.getDecorationRange(this._decorationIds[i]);
                if (range && range.startLineNumber === lineNumber) {
                    if (range.startColumn <= startColumn && range.endColumn >= endColumn) {
                        workerRequestIsValid = true;
                    }
                }
            }
            // There are 4 cases:
            // a) old workerRequest is valid & completed, renderDecorationsTimer fired
            // b) old workerRequest is valid & completed, renderDecorationsTimer not fired
            // c) old workerRequest is valid, but not completed
            // d) old workerRequest is not valid
            // For a) no action is needed
            // For c), member 'lastCursorPositionChangeTime' will be used when installing the timer so no action is needed
            this.lastCursorPositionChangeTime = (new Date()).getTime();
            if (workerRequestIsValid) {
                if (this.workerRequestCompleted && this.renderDecorationsTimer !== -1) {
                    // case b)
                    // Delay the firing of renderDecorationsTimer by an extra 250 ms
                    window.clearTimeout(this.renderDecorationsTimer);
                    this.renderDecorationsTimer = -1;
                    this._beginRenderDecorations();
                }
            }
            else {
                // case d)
                // Stop all previous actions and start fresh
                this._stopAll();
                var myRequestId = ++this.workerRequestTokenId;
                this.workerRequestCompleted = false;
                this.workerRequest = getOccurrencesAtPosition(this.model, this.editor.getPosition());
                this.workerRequest.then(function (data) {
                    if (myRequestId === _this.workerRequestTokenId) {
                        _this.workerRequestCompleted = true;
                        _this.workerRequestValue = data || [];
                        _this._beginRenderDecorations();
                    }
                }).done();
            }
            this._lastWordRange = currentWordRange;
        };
        WordHighlighter.prototype._beginRenderDecorations = function () {
            var _this = this;
            var currentTime = (new Date()).getTime();
            var minimumRenderTime = this.lastCursorPositionChangeTime + 250;
            if (currentTime >= minimumRenderTime) {
                // Synchronous
                this.renderDecorationsTimer = -1;
                this.renderDecorations();
            }
            else {
                // Asyncrhonous
                this.renderDecorationsTimer = window.setTimeout(function () {
                    _this.renderDecorations();
                }, (minimumRenderTime - currentTime));
            }
        };
        WordHighlighter.prototype.renderDecorations = function () {
            this.renderDecorationsTimer = -1;
            var decorations = [];
            for (var i = 0, len = this.workerRequestValue.length; i < len; i++) {
                var info = this.workerRequestValue[i];
                var className = 'wordHighlight';
                var color = '#A0A0A0';
                if (info.kind === 'write') {
                    className = className + 'Strong';
                }
                else if (info.kind === 'text') {
                    className = 'selectionHighlight';
                }
                decorations.push({
                    range: info.range,
                    options: {
                        stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                        className: className,
                        overviewRuler: {
                            color: color,
                            darkColor: color,
                            position: editorCommon.OverviewRulerLane.Center
                        }
                    }
                });
            }
            this._decorationIds = this.editor.deltaDecorations(this._decorationIds, decorations);
        };
        WordHighlighter.prototype.destroy = function () {
            this._stopAll();
            while (this.toUnhook.length > 0) {
                this.toUnhook.pop()();
            }
        };
        return WordHighlighter;
    }());
    var WordHighlighterContribution = (function () {
        function WordHighlighterContribution(editor) {
            this.wordHighligher = new WordHighlighter(editor);
        }
        WordHighlighterContribution.prototype.getId = function () {
            return WordHighlighterContribution.ID;
        };
        WordHighlighterContribution.prototype.dispose = function () {
            this.wordHighligher.destroy();
        };
        WordHighlighterContribution.ID = 'editor.contrib.wordHighlighter';
        return WordHighlighterContribution;
    }());
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorContribution(WordHighlighterContribution);
});
//# sourceMappingURL=wordHighlighter.js.map