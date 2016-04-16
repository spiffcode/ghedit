var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/filters', 'vs/editor/common/modes/supports'], function (require, exports, winjs_base_1, filters_1, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SuggestSupport = (function () {
        function SuggestSupport(modeId, contribution) {
            this._modeId = modeId;
            this.contribution = contribution;
            this.suggest = function (resource, position) { return contribution.suggest(resource, position); };
            if (typeof contribution.getSuggestionDetails === 'function') {
                this.getSuggestionDetails = function (resource, position, suggestion) { return contribution.getSuggestionDetails(resource, position, suggestion); };
            }
        }
        SuggestSupport.prototype.shouldAutotriggerSuggest = function (context, offset, triggeredByCharacter) {
            var _this = this;
            return supports_1.handleEvent(context, offset, function (nestedMode, context, offset) {
                if (_this._modeId === nestedMode.getId()) {
                    if (_this.contribution.disableAutoTrigger) {
                        return false;
                    }
                    if (!Array.isArray(_this.contribution.excludeTokens)) {
                        return true;
                    }
                    if (_this.contribution.excludeTokens.length === 1 && _this.contribution.excludeTokens[0] === '*') {
                        return false;
                    }
                    return !supports_1.isLineToken(context, offset - 1, _this.contribution.excludeTokens, true);
                }
                else if (nestedMode.suggestSupport) {
                    return nestedMode.suggestSupport.shouldAutotriggerSuggest(context, offset, triggeredByCharacter);
                }
                else {
                    return false;
                }
            });
        };
        SuggestSupport.prototype.getTriggerCharacters = function () {
            return this.contribution.triggerCharacters;
        };
        SuggestSupport.prototype.shouldShowEmptySuggestionList = function () {
            return true;
        };
        return SuggestSupport;
    }());
    exports.SuggestSupport = SuggestSupport;
    var TextualSuggestSupport = (function () {
        function TextualSuggestSupport(modeId, editorWorkerService) {
            this._modeId = modeId;
            this._editorWorkerService = editorWorkerService;
        }
        TextualSuggestSupport.prototype.suggest = function (resource, position, triggerCharacter) {
            return this._editorWorkerService.textualSuggest(resource, position);
        };
        Object.defineProperty(TextualSuggestSupport.prototype, "filter", {
            get: function () {
                return filters_1.matchesStrictPrefix;
            },
            enumerable: true,
            configurable: true
        });
        TextualSuggestSupport.prototype.getTriggerCharacters = function () {
            return [];
        };
        TextualSuggestSupport.prototype.shouldShowEmptySuggestionList = function () {
            return true;
        };
        TextualSuggestSupport.prototype.shouldAutotriggerSuggest = function (context, offset, triggeredByCharacter) {
            var _this = this;
            return supports_1.handleEvent(context, offset, function (nestedMode, context, offset) {
                if (_this._modeId === nestedMode.getId()) {
                    return true;
                }
                else if (nestedMode.suggestSupport) {
                    return nestedMode.suggestSupport.shouldAutotriggerSuggest(context, offset, triggeredByCharacter);
                }
                else {
                    return false;
                }
            });
        };
        return TextualSuggestSupport;
    }());
    exports.TextualSuggestSupport = TextualSuggestSupport;
    var PredefinedResultSuggestSupport = (function (_super) {
        __extends(PredefinedResultSuggestSupport, _super);
        function PredefinedResultSuggestSupport(modeId, modelService, predefined, triggerCharacters, disableAutoTrigger) {
            _super.call(this, modeId, {
                triggerCharacters: triggerCharacters,
                disableAutoTrigger: disableAutoTrigger,
                excludeTokens: [],
                suggest: function (resource, position) {
                    var model = modelService.getModel(resource);
                    var result = _addSuggestionsAtPosition(model, position, predefined, null);
                    return winjs_base_1.TPromise.as(result);
                }
            });
        }
        return PredefinedResultSuggestSupport;
    }(SuggestSupport));
    exports.PredefinedResultSuggestSupport = PredefinedResultSuggestSupport;
    var TextualAndPredefinedResultSuggestSupport = (function (_super) {
        __extends(TextualAndPredefinedResultSuggestSupport, _super);
        function TextualAndPredefinedResultSuggestSupport(modeId, modelService, editorWorkerService, predefined, triggerCharacters, disableAutoTrigger) {
            _super.call(this, modeId, {
                triggerCharacters: triggerCharacters,
                disableAutoTrigger: disableAutoTrigger,
                excludeTokens: [],
                suggest: function (resource, position) {
                    return editorWorkerService.textualSuggest(resource, position).then(function (textualSuggestions) {
                        var model = modelService.getModel(resource);
                        var result = _addSuggestionsAtPosition(model, position, predefined, textualSuggestions);
                        return result;
                    });
                }
            });
        }
        return TextualAndPredefinedResultSuggestSupport;
    }(SuggestSupport));
    exports.TextualAndPredefinedResultSuggestSupport = TextualAndPredefinedResultSuggestSupport;
    function _addSuggestionsAtPosition(model, position, predefined, superSuggestions) {
        if (!predefined || predefined.length === 0) {
            return superSuggestions;
        }
        if (!superSuggestions) {
            superSuggestions = [];
        }
        superSuggestions.push({
            currentWord: model.getWordUntilPosition(position).word,
            suggestions: predefined.slice(0)
        });
        return superSuggestions;
    }
    function filterSuggestions(value) {
        if (!value) {
            return;
        }
        // filter suggestions
        var accept = filters_1.fuzzyContiguousFilter, result = [];
        result.push({
            currentWord: value.currentWord,
            suggestions: value.suggestions.filter(function (element) { return !!accept(value.currentWord, element.label); }),
            incomplete: value.incomplete
        });
        return result;
    }
    exports.filterSuggestions = filterSuggestions;
});
