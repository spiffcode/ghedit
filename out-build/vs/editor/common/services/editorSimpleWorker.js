/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/editor/common/core/range', 'vs/base/common/filters', 'vs/editor/common/diff/diffComputer', 'vs/editor/common/model/mirrorModel2', 'vs/editor/common/model/textModelWithTokensHelpers', 'vs/editor/common/modes/linkComputer', 'vs/editor/common/modes/supports/inplaceReplaceSupport', 'vs/editor/common/services/editorSimpleWorkerCommon'], function (require, exports, uri_1, winjs_base_1, range_1, filters_1, diffComputer_1, mirrorModel2_1, textModelWithTokensHelpers_1, linkComputer_1, inplaceReplaceSupport_1, editorSimpleWorkerCommon_1) {
    'use strict';
    var MirrorModel = (function (_super) {
        __extends(MirrorModel, _super);
        function MirrorModel() {
            _super.apply(this, arguments);
        }
        MirrorModel.prototype.getLinesContent = function () {
            return this._lines.slice(0);
        };
        MirrorModel.prototype.getLineCount = function () {
            return this._lines.length;
        };
        MirrorModel.prototype.getLineContent = function (lineNumber) {
            return this._lines[lineNumber - 1];
        };
        MirrorModel.prototype.getWordAtPosition = function (position, wordDefinition) {
            var wordAtText = textModelWithTokensHelpers_1.WordHelper._getWordAtText(position.column, textModelWithTokensHelpers_1.WordHelper.ensureValidWordDefinition(wordDefinition), this._lines[position.lineNumber - 1], 0);
            if (wordAtText) {
                return new range_1.Range(position.lineNumber, wordAtText.startColumn, position.lineNumber, wordAtText.endColumn);
            }
            return null;
        };
        MirrorModel.prototype.getWordUntilPosition = function (position, wordDefinition) {
            var wordAtPosition = this.getWordAtPosition(position, wordDefinition);
            if (!wordAtPosition) {
                return {
                    word: '',
                    startColumn: position.column,
                    endColumn: position.column
                };
            }
            return {
                word: this._lines[position.lineNumber - 1].substring(wordAtPosition.startColumn - 1, position.column - 1),
                startColumn: wordAtPosition.startColumn,
                endColumn: position.column
            };
        };
        MirrorModel.prototype._getAllWords = function (wordDefinition) {
            var _this = this;
            var result = [];
            this._lines.forEach(function (line) {
                _this._wordenize(line, wordDefinition).forEach(function (info) {
                    result.push(line.substring(info.start, info.end));
                });
            });
            return result;
        };
        MirrorModel.prototype.getAllUniqueWords = function (wordDefinition, skipWordOnce) {
            var foundSkipWord = false;
            var uniqueWords = {};
            return this._getAllWords(wordDefinition).filter(function (word) {
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
        MirrorModel.prototype._wordenize = function (content, wordDefinition) {
            var result = [];
            var match;
            while (match = wordDefinition.exec(content)) {
                if (match[0].length === 0) {
                    // it did match the empty string
                    break;
                }
                result.push({ start: match.index, end: match.index + match[0].length });
            }
            return result;
        };
        MirrorModel.prototype.getValueInRange = function (range) {
            if (range.startLineNumber === range.endLineNumber) {
                return this._lines[range.startLineNumber - 1].substring(range.startColumn - 1, range.endColumn - 1);
            }
            var lineEnding = this._eol, startLineIndex = range.startLineNumber - 1, endLineIndex = range.endLineNumber - 1, resultLines = [];
            resultLines.push(this._lines[startLineIndex].substring(range.startColumn - 1));
            for (var i = startLineIndex + 1; i < endLineIndex; i++) {
                resultLines.push(this._lines[i]);
            }
            resultLines.push(this._lines[endLineIndex].substring(0, range.endColumn - 1));
            return resultLines.join(lineEnding);
        };
        return MirrorModel;
    }(mirrorModel2_1.MirrorModel2));
    var EditorSimpleWorkerImpl = (function (_super) {
        __extends(EditorSimpleWorkerImpl, _super);
        function EditorSimpleWorkerImpl() {
            _super.call(this);
            this._models = Object.create(null);
        }
        EditorSimpleWorkerImpl.prototype.acceptNewModel = function (data) {
            this._models[data.url] = new MirrorModel(uri_1.default.parse(data.url), data.value.lines, data.value.EOL, data.versionId);
        };
        EditorSimpleWorkerImpl.prototype.acceptModelChanged = function (strURL, events) {
            if (!this._models[strURL]) {
                return;
            }
            var model = this._models[strURL];
            model.onEvents(events);
        };
        EditorSimpleWorkerImpl.prototype.acceptRemovedModel = function (strURL) {
            if (!this._models[strURL]) {
                return;
            }
            delete this._models[strURL];
        };
        // ---- BEGIN diff --------------------------------------------------------------------------
        EditorSimpleWorkerImpl.prototype.computeDiff = function (originalUrl, modifiedUrl, ignoreTrimWhitespace) {
            var original = this._models[originalUrl];
            var modified = this._models[modifiedUrl];
            if (!original || !modified) {
                return null;
            }
            var originalLines = original.getLinesContent();
            var modifiedLines = modified.getLinesContent();
            var diffComputer = new diffComputer_1.DiffComputer(originalLines, modifiedLines, {
                shouldPostProcessCharChanges: true,
                shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
                shouldConsiderTrimWhitespaceInEmptyCase: true
            });
            return winjs_base_1.TPromise.as(diffComputer.computeDiff());
        };
        EditorSimpleWorkerImpl.prototype.computeDirtyDiff = function (originalUrl, modifiedUrl, ignoreTrimWhitespace) {
            var original = this._models[originalUrl];
            var modified = this._models[modifiedUrl];
            if (!original || !modified) {
                return null;
            }
            var originalLines = original.getLinesContent();
            var modifiedLines = modified.getLinesContent();
            var diffComputer = new diffComputer_1.DiffComputer(originalLines, modifiedLines, {
                shouldPostProcessCharChanges: false,
                shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
                shouldConsiderTrimWhitespaceInEmptyCase: false
            });
            return winjs_base_1.TPromise.as(diffComputer.computeDiff());
        };
        // ---- END diff --------------------------------------------------------------------------
        EditorSimpleWorkerImpl.prototype.computeLinks = function (modelUrl) {
            var model = this._models[modelUrl];
            if (!model) {
                return null;
            }
            return winjs_base_1.TPromise.as(linkComputer_1.computeLinks(model));
        };
        // ---- BEGIN suggest --------------------------------------------------------------------------
        EditorSimpleWorkerImpl.prototype.textualSuggest = function (modelUrl, position, wordDef, wordDefFlags) {
            var model = this._models[modelUrl];
            if (!model) {
                return null;
            }
            return winjs_base_1.TPromise.as(this._suggestFiltered(model, position, new RegExp(wordDef, wordDefFlags)));
        };
        EditorSimpleWorkerImpl.prototype._suggestFiltered = function (model, position, wordDefRegExp) {
            var value = this._suggestUnfiltered(model, position, wordDefRegExp);
            // filter suggestions
            return [{
                    currentWord: value.currentWord,
                    suggestions: value.suggestions.filter(function (element) { return !!filters_1.fuzzyContiguousFilter(value.currentWord, element.label); }),
                    incomplete: value.incomplete
                }];
        };
        EditorSimpleWorkerImpl.prototype._suggestUnfiltered = function (model, position, wordDefRegExp) {
            var currentWord = model.getWordUntilPosition(position, wordDefRegExp).word;
            var allWords = model.getAllUniqueWords(wordDefRegExp, currentWord);
            var suggestions = allWords.filter(function (word) {
                return !(/^-?\d*\.?\d/.test(word)); // filter out numbers
            }).map(function (word) {
                return {
                    type: 'text',
                    label: word,
                    codeSnippet: word,
                    noAutoAccept: true
                };
            });
            return {
                currentWord: currentWord,
                suggestions: suggestions
            };
        };
        // ---- END suggest --------------------------------------------------------------------------
        EditorSimpleWorkerImpl.prototype.navigateValueSet = function (modelUrl, range, up, wordDef, wordDefFlags) {
            var model = this._models[modelUrl];
            if (!model) {
                return null;
            }
            var wordDefRegExp = new RegExp(wordDef, wordDefFlags);
            if (range.startColumn === range.endColumn) {
                range.endColumn += 1;
            }
            var selectionText = model.getValueInRange(range);
            var wordRange = model.getWordAtPosition({ lineNumber: range.startLineNumber, column: range.startColumn }, wordDefRegExp);
            var word = null;
            if (wordRange !== null) {
                word = model.getValueInRange(wordRange);
            }
            var result = inplaceReplaceSupport_1.BasicInplaceReplace.INSTANCE.navigateValueSet(range, selectionText, wordRange, word, up);
            return winjs_base_1.TPromise.as(result);
        };
        return EditorSimpleWorkerImpl;
    }(editorSimpleWorkerCommon_1.EditorSimpleWorker));
    exports.EditorSimpleWorkerImpl = EditorSimpleWorkerImpl;
    /**
     * Called on the worker side
     */
    function create() {
        return new EditorSimpleWorkerImpl();
    }
    exports.create = create;
});
//# sourceMappingURL=editorSimpleWorker.js.map