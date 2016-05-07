/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/arrays', 'vs/base/common/objects', 'vs/base/common/winjs.base', 'vs/base/common/filters'], function (require, exports, arrays_1, objects_1, winjs_base_1, filters_1) {
    'use strict';
    var CompletionItem = (function () {
        function CompletionItem(suggestion, container) {
            this._support = container.support;
            this.suggestion = suggestion;
            this.container = container;
            this.filter = container.support && container.support.filter || filters_1.fuzzyContiguousFilter;
        }
        CompletionItem.prototype.resolveDetails = function (resource, position) {
            if (!this._support || typeof this._support.getSuggestionDetails !== 'function') {
                return winjs_base_1.TPromise.as(this.suggestion);
            }
            return this._support.getSuggestionDetails(resource, position, this.suggestion);
        };
        CompletionItem.prototype.updateDetails = function (value) {
            this.suggestion = objects_1.assign(this.suggestion, value);
        };
        CompletionItem.compare = function (item, otherItem) {
            var suggestion = item.suggestion;
            var otherSuggestion = otherItem.suggestion;
            if (typeof suggestion.sortText === 'string' && typeof otherSuggestion.sortText === 'string') {
                var one = suggestion.sortText.toLowerCase();
                var other = otherSuggestion.sortText.toLowerCase();
                if (one < other) {
                    return -1;
                }
                else if (one > other) {
                    return 1;
                }
            }
            return suggestion.label.toLowerCase() < otherSuggestion.label.toLowerCase() ? -1 : 1;
        };
        return CompletionItem;
    }());
    exports.CompletionItem = CompletionItem;
    var LineContext = (function () {
        function LineContext() {
        }
        return LineContext;
    }());
    exports.LineContext = LineContext;
    var CompletionModel = (function () {
        function CompletionModel(raw, leadingLineContent) {
            this.raw = raw;
            this._items = [];
            this._filteredItems = undefined;
            this._lineContext = { leadingLineContent: leadingLineContent, characterCountDelta: 0 };
            for (var _i = 0, raw_1 = raw; _i < raw_1.length; _i++) {
                var container = raw_1[_i];
                for (var _a = 0, _b = container.suggestions; _a < _b.length; _a++) {
                    var suggestion = _b[_a];
                    this._items.push(new CompletionItem(suggestion, container));
                }
            }
            this._items.sort(CompletionItem.compare);
        }
        Object.defineProperty(CompletionModel.prototype, "lineContext", {
            get: function () {
                return this._lineContext;
            },
            set: function (value) {
                if (this._lineContext !== value) {
                    this._filteredItems = undefined;
                    this._lineContext = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompletionModel.prototype, "items", {
            get: function () {
                if (!this._filteredItems) {
                    this._filter();
                }
                return this._filteredItems;
            },
            enumerable: true,
            configurable: true
        });
        CompletionModel.prototype._filter = function () {
            this._filteredItems = [];
            var _a = this._lineContext, leadingLineContent = _a.leadingLineContent, characterCountDelta = _a.characterCountDelta;
            for (var _i = 0, _b = this._items; _i < _b.length; _i++) {
                var item = _b[_i];
                var overwriteBefore = item.suggestion.overwriteBefore;
                if (typeof overwriteBefore !== 'number') {
                    overwriteBefore = item.container.currentWord.length;
                }
                var start = leadingLineContent.length - (overwriteBefore + characterCountDelta);
                var word = leadingLineContent.substr(start);
                var filter = item.filter, suggestion = item.suggestion;
                var match = false;
                // compute highlights based on 'label'
                item.highlights = filter(word, suggestion.label);
                match = item.highlights !== null;
                // no match on label -> check on codeSnippet
                if (!match && suggestion.codeSnippet !== suggestion.label) {
                    match = !arrays_1.isFalsyOrEmpty((filter(word, suggestion.codeSnippet.replace(/{{.+?}}/g, '')))); // filters {{text}}-snippet syntax
                }
                // no match on label nor codeSnippet -> check on filterText
                if (!match && typeof suggestion.filterText === 'string') {
                    match = !arrays_1.isFalsyOrEmpty(filter(word, suggestion.filterText));
                }
                if (match) {
                    this._filteredItems.push(item);
                }
            }
        };
        return CompletionModel;
    }());
    exports.CompletionModel = CompletionModel;
});
//# sourceMappingURL=completionModel.js.map