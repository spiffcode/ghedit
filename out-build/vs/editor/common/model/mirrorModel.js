var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/editor/common/editorCommon', 'vs/editor/common/model/modelLine', 'vs/editor/common/model/textModel', 'vs/editor/common/model/textModelWithTokens', 'vs/editor/common/viewModel/prefixSumComputer'], function (require, exports, lifecycle_1, editorCommon, modelLine_1, textModel_1, textModelWithTokens_1, prefixSumComputer_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var AbstractMirrorModel = (function (_super) {
        __extends(AbstractMirrorModel, _super);
        function AbstractMirrorModel(allowedEventTypes, versionId, value, mode, associatedResource) {
            _super.call(this, allowedEventTypes.concat([editorCommon.EventType.ModelDispose]), value, false, mode);
            this._setVersionId(versionId);
            this._associatedResource = associatedResource;
        }
        AbstractMirrorModel.prototype.getModeId = function () {
            return this.getMode().getId();
        };
        AbstractMirrorModel.prototype.getEmbeddedAtPosition = function (position) {
            return null;
        };
        AbstractMirrorModel.prototype.getAllEmbedded = function () {
            return [];
        };
        AbstractMirrorModel.prototype._constructLines = function (rawText) {
            _super.prototype._constructLines.call(this, rawText);
            // Force EOL to be \n
            this._EOL = '\n';
        };
        AbstractMirrorModel.prototype.destroy = function () {
            this.dispose();
        };
        AbstractMirrorModel.prototype.dispose = function () {
            this.emit(editorCommon.EventType.ModelDispose);
            _super.prototype.dispose.call(this);
        };
        AbstractMirrorModel.prototype.getAssociatedResource = function () {
            return this._associatedResource;
        };
        AbstractMirrorModel.prototype._ensurePrefixSum = function () {
            if (!this._lineStarts) {
                var lineStartValues = [], eolLength = this.getEOL().length;
                for (var i = 0, len = this._lines.length; i < len; i++) {
                    lineStartValues.push(this._lines[i].text.length + eolLength);
                }
                this._lineStarts = new prefixSumComputer_1.PrefixSumComputer(lineStartValues);
            }
        };
        AbstractMirrorModel.prototype.getRangeFromOffsetAndLength = function (offset, length) {
            var startPosition = this.getPositionFromOffset(offset), endPosition = this.getPositionFromOffset(offset + length);
            return {
                startLineNumber: startPosition.lineNumber,
                startColumn: startPosition.column,
                endLineNumber: endPosition.lineNumber,
                endColumn: endPosition.column
            };
        };
        AbstractMirrorModel.prototype.getOffsetAndLengthFromRange = function (range) {
            var startOffset = this.getOffsetFromPosition({ lineNumber: range.startLineNumber, column: range.startColumn }), endOffset = this.getOffsetFromPosition({ lineNumber: range.endLineNumber, column: range.endColumn });
            return {
                offset: startOffset,
                length: endOffset - startOffset
            };
        };
        AbstractMirrorModel.prototype.getPositionFromOffset = function (offset) {
            this._ensurePrefixSum();
            var r = this._lineStarts.getIndexOf(offset);
            return {
                lineNumber: r.index + 1,
                column: this.getEOL().length + r.remainder
            };
        };
        AbstractMirrorModel.prototype.getOffsetFromPosition = function (position) {
            return this.getLineStart(position.lineNumber) + position.column - 1 /* column isn't zero-index based */;
        };
        AbstractMirrorModel.prototype.getLineStart = function (lineNumber) {
            this._ensurePrefixSum();
            var lineIndex = Math.min(lineNumber, this._lines.length) - 1;
            return this._lineStarts.getAccumulatedValue(lineIndex - 1);
        };
        AbstractMirrorModel.prototype.getAllWordsWithRange = function () {
            if (this._lines.length > 10000) {
                // This is a very heavy method, unavailable for very heavy models
                return [];
            }
            var result = [], i;
            var toTextRange = function (info) {
                var s = line.text.substring(info.start, info.end);
                var r = { startLineNumber: i + 1, startColumn: info.start + 1, endLineNumber: i + 1, endColumn: info.end + 1 };
                result.push({ text: s, range: r });
            };
            for (i = 0; i < this._lines.length; i++) {
                var line = this._lines[i];
                this.wordenize(line.text).forEach(toTextRange);
            }
            return result;
        };
        AbstractMirrorModel.prototype.getAllWords = function () {
            var _this = this;
            var result = [];
            this._lines.forEach(function (line) {
                _this.wordenize(line.text).forEach(function (info) {
                    result.push(line.text.substring(info.start, info.end));
                });
            });
            return result;
        };
        AbstractMirrorModel.prototype.getAllUniqueWords = function (skipWordOnce) {
            var foundSkipWord = false;
            var uniqueWords = {};
            return this.getAllWords().filter(function (word) {
                if (skipWordOnce && !foundSkipWord && skipWordOnce === word) {
                    foundSkipWord = true;
                    return false;
                }
                else if (uniqueWords[word]) {
                    return false;
                }
                else {
                    uniqueWords[word] = true;
                    return true;
                }
            });
        };
        //	// TODO@Joh, TODO@Alex - remove these and make sure the super-things work
        AbstractMirrorModel.prototype.wordenize = function (content) {
            var result = [];
            var match;
            var wordsRegexp = this._getWordDefinition();
            while (match = wordsRegexp.exec(content)) {
                result.push({ start: match.index, end: match.index + match[0].length });
            }
            return result;
        };
        return AbstractMirrorModel;
    }(textModelWithTokens_1.TextModelWithTokens));
    exports.AbstractMirrorModel = AbstractMirrorModel;
    var MirrorModelEmbedded = (function (_super) {
        __extends(MirrorModelEmbedded, _super);
        function MirrorModelEmbedded(actualModel, includeRanges, mode, url) {
            _super.call(this, ['changed'], actualModel.getVersionId(), MirrorModelEmbedded._getMirrorValueWithinRanges(actualModel, includeRanges), mode, url);
            this._actualModel = actualModel;
        }
        MirrorModelEmbedded._getMirrorValueWithinRanges = function (actualModel, includeRanges) {
            var resultingText = '', prevLineAdded = 1, prevColumnAdded = 1, i;
            for (i = 0; i < includeRanges.length; i++) {
                var includeRange = includeRanges[i];
                resultingText += actualModel.getEmptiedValueInRange({
                    startLineNumber: prevLineAdded,
                    startColumn: prevColumnAdded,
                    endLineNumber: includeRange.startLineNumber,
                    endColumn: includeRange.startColumn
                }, ' ');
                resultingText += actualModel.getValueInRange(includeRange);
                prevLineAdded = includeRange.endLineNumber;
                prevColumnAdded = includeRange.endColumn;
            }
            var lastLineNumber = actualModel.getLineCount(), lastColumn = actualModel.getLineMaxColumn(lastLineNumber);
            resultingText += actualModel.getEmptiedValueInRange({
                startLineNumber: prevLineAdded,
                startColumn: prevColumnAdded,
                endLineNumber: lastLineNumber,
                endColumn: lastColumn
            }, ' ');
            var actualModelOptions = actualModel.getOptions();
            return textModel_1.TextModel.toRawText(resultingText, {
                tabSize: actualModelOptions.tabSize,
                insertSpaces: actualModelOptions.insertSpaces,
                detectIndentation: false,
                defaultEOL: actualModelOptions.defaultEOL
            });
        };
        MirrorModelEmbedded.prototype.setIncludedRanges = function (newIncludedRanges) {
            var prevVersionId = this.getVersionId();
            // Force recreating of line starts (when used)
            this._lineStarts = null;
            this._constructLines(MirrorModelEmbedded._getMirrorValueWithinRanges(this._actualModel, newIncludedRanges));
            this._resetTokenizationState();
            this._setVersionId(prevVersionId + 1);
            this.emit('changed', {});
        };
        return MirrorModelEmbedded;
    }(AbstractMirrorModel));
    exports.MirrorModelEmbedded = MirrorModelEmbedded;
    var EmbeddedModeRange = (function () {
        function EmbeddedModeRange(mode) {
            this.mode = mode;
            this.ranges = [];
        }
        return EmbeddedModeRange;
    }());
    function createTestMirrorModelFromString(value, mode, associatedResource) {
        if (mode === void 0) { mode = null; }
        return new MirrorModel(null, 0, textModel_1.TextModel.toRawText(value, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS), mode, associatedResource);
    }
    exports.createTestMirrorModelFromString = createTestMirrorModelFromString;
    var MirrorModel = (function (_super) {
        __extends(MirrorModel, _super);
        function MirrorModel(resourceService, versionId, value, mode, associatedResource) {
            _super.call(this, ['changed'], versionId, value, mode, associatedResource);
            this._resourceService = resourceService;
            this._embeddedModels = {};
            this._updateEmbeddedModels();
        }
        MirrorModel.prototype.getEmbeddedAtPosition = function (position) {
            var modeAtPosition = this.getModeAtPosition(position.lineNumber, position.column);
            if (this._embeddedModels.hasOwnProperty(modeAtPosition.getId())) {
                return this._embeddedModels[modeAtPosition.getId()];
            }
            return null;
        };
        MirrorModel.prototype.getAllEmbedded = function () {
            var _this = this;
            return Object.keys(this._embeddedModels).map(function (embeddedModeId) { return _this._embeddedModels[embeddedModeId]; });
        };
        MirrorModel.prototype.dispose = function () {
            var _this = this;
            _super.prototype.dispose.call(this);
            var embeddedModels = Object.keys(this._embeddedModels).map(function (modeId) { return _this._embeddedModels[modeId]; });
            embeddedModels.forEach(function (embeddedModel) { return _this._resourceService.remove(embeddedModel.getAssociatedResource()); });
            lifecycle_1.dispose(embeddedModels);
            this._embeddedModels = {};
        };
        MirrorModel.prototype.setMode = function (newModeOrPromise) {
            _super.prototype.setMode.call(this, newModeOrPromise);
            this._updateEmbeddedModels();
        };
        MirrorModel._getModesRanges = function (model) {
            var encounteredModesRanges = {};
            var getOrCreateEmbeddedModeRange = function (modeId, mode) {
                if (!encounteredModesRanges.hasOwnProperty(modeId)) {
                    encounteredModesRanges[modeId] = new EmbeddedModeRange(mode);
                }
                return encounteredModesRanges[modeId];
            };
            var lineCount = model.getLineCount();
            var currentModeId = model.getMode().getId();
            var currentMode = model.getMode();
            var currentStartLineNumber = 1, currentStartColumn = 1;
            for (var lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
                var modeTransitions = model._getLineModeTransitions(lineNumber);
                for (var i = 0; i < modeTransitions.length; i++) {
                    var modeTransition = modeTransitions[i];
                    if (modeTransition.mode.getId() !== currentModeId) {
                        var modeRange = getOrCreateEmbeddedModeRange(currentModeId, currentMode);
                        modeRange.ranges.push({
                            startLineNumber: currentStartLineNumber,
                            startColumn: currentStartColumn,
                            endLineNumber: lineNumber,
                            endColumn: modeTransition.startIndex + 1
                        });
                        currentModeId = modeTransition.mode.getId();
                        currentMode = modeTransition.mode;
                        currentStartLineNumber = lineNumber;
                        currentStartColumn = modeTransition.startIndex + 1;
                    }
                }
            }
            var lastLineNumber = lineCount;
            var lastColumn = model.getLineMaxColumn(lastLineNumber);
            if (currentStartLineNumber !== lastLineNumber || currentStartColumn !== lastColumn) {
                var modeRange = getOrCreateEmbeddedModeRange(currentModeId, currentMode);
                modeRange.ranges.push({
                    startLineNumber: currentStartLineNumber,
                    startColumn: currentStartColumn,
                    endLineNumber: lastLineNumber,
                    endColumn: lastColumn
                });
            }
            return encounteredModesRanges;
        };
        MirrorModel.prototype._updateEmbeddedModels = function () {
            if (!this._resourceService || !this.getMode().tokenizationSupport || !this.getMode().tokenizationSupport.shouldGenerateEmbeddedModels) {
                return false;
            }
            var newModesRanges = MirrorModel._getModesRanges(this);
            // Empty out embedded models that have disappeared
            var oldNestedModesIds = Object.keys(this._embeddedModels);
            for (var i = 0; i < oldNestedModesIds.length; i++) {
                var oldNestedModeId = oldNestedModesIds[i];
                if (!newModesRanges.hasOwnProperty(oldNestedModeId)) {
                    this._embeddedModels[oldNestedModeId].setIncludedRanges([{
                            startLineNumber: 1,
                            startColumn: 1,
                            endLineNumber: 1,
                            endColumn: 1
                        }]);
                }
            }
            var newNestedModesIds = Object.keys(newModesRanges);
            for (var i = 0; i < newNestedModesIds.length; i++) {
                var newNestedModeId = newNestedModesIds[i];
                if (this._embeddedModels.hasOwnProperty(newNestedModeId)) {
                    this._embeddedModels[newNestedModeId].setIncludedRanges(newModesRanges[newNestedModeId].ranges);
                }
                else {
                    // TODO@Alex: implement derived resources (embedded mirror models) better
                    var embeddedModelUrl = this.getAssociatedResource().withFragment(this.getAssociatedResource().fragment + 'URL_MARSHAL_REMOVE' + newNestedModeId);
                    this._embeddedModels[newNestedModeId] = new MirrorModelEmbedded(this, newModesRanges[newNestedModeId].ranges, newModesRanges[newNestedModeId].mode, embeddedModelUrl);
                    this._resourceService.insert(this._embeddedModels[newNestedModeId].getAssociatedResource(), this._embeddedModels[newNestedModeId]);
                }
            }
            return false;
        };
        MirrorModel.prototype.onEvents = function (events) {
            var changed = false;
            for (var i = 0, len = events.contentChanged.length; i < len; i++) {
                var contentChangedEvent = events.contentChanged[i];
                // Force recreating of line starts
                this._lineStarts = null;
                this._setVersionId(contentChangedEvent.versionId);
                switch (contentChangedEvent.changeType) {
                    case editorCommon.EventType.ModelContentChangedFlush:
                        this._onLinesFlushed(contentChangedEvent);
                        changed = true;
                        break;
                    case editorCommon.EventType.ModelContentChangedLinesDeleted:
                        this._onLinesDeleted(contentChangedEvent);
                        changed = true;
                        break;
                    case editorCommon.EventType.ModelContentChangedLinesInserted:
                        this._onLinesInserted(contentChangedEvent);
                        changed = true;
                        break;
                    case editorCommon.EventType.ModelContentChangedLineChanged:
                        this._onLineChanged(contentChangedEvent);
                        changed = true;
                        break;
                }
            }
            var shouldFlushMarkers = false;
            if (changed) {
                this.emit('changed', {});
                shouldFlushMarkers = this._updateEmbeddedModels();
            }
            return shouldFlushMarkers;
        };
        MirrorModel.prototype._onLinesFlushed = function (e) {
            // Flush my lines
            this._constructLines(e.detail);
            this._resetTokenizationState();
        };
        MirrorModel.prototype._onLineChanged = function (e) {
            this._lines[e.lineNumber - 1].applyEdits({}, [{
                    startColumn: 1,
                    endColumn: Number.MAX_VALUE,
                    text: e.detail,
                    forceMoveMarkers: false
                }]);
            this._invalidateLine(e.lineNumber - 1);
        };
        MirrorModel.prototype._onLinesDeleted = function (e) {
            var fromLineIndex = e.fromLineNumber - 1, toLineIndex = e.toLineNumber - 1;
            // Save first line's state
            var firstLineState = this._lines[fromLineIndex].getState();
            this._lines.splice(fromLineIndex, toLineIndex - fromLineIndex + 1);
            if (fromLineIndex < this._lines.length) {
                // This check is always true in real world, but the tests forced this
                // Restore first line's state
                this._lines[fromLineIndex].setState(firstLineState);
                // Invalidate line
                this._invalidateLine(fromLineIndex);
            }
        };
        MirrorModel.prototype._onLinesInserted = function (e) {
            var lineIndex, i, splitLines = e.detail.split('\n');
            for (lineIndex = e.fromLineNumber - 1, i = 0; lineIndex < e.toLineNumber; lineIndex++, i++) {
                this._lines.splice(lineIndex, 0, new modelLine_1.ModelLine(0, splitLines[i]));
            }
            if (e.fromLineNumber >= 2) {
                // This check is always true in real world, but the tests forced this
                this._invalidateLine(e.fromLineNumber - 2);
            }
        };
        return MirrorModel;
    }(AbstractMirrorModel));
    exports.MirrorModel = MirrorModel;
});
