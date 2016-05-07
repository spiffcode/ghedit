define(["require", "exports", 'vs/base/common/async', 'vs/base/common/arrays', 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes', 'vs/editor/common/modes/supports'], function (require, exports, async_1, arrays_1, errors_1, winjs_base_1, editorCommonExtensions_1, modes_1, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.CONTEXT_SUGGEST_WIDGET_VISIBLE = 'suggestWidgetVisible';
    exports.CONTEXT_SUGGESTION_SUPPORTS_ACCEPT_ON_KEY = 'suggestionSupportsAcceptOnKey';
    exports.ACCEPT_SELECTED_SUGGESTION_CMD = 'acceptSelectedSuggestion';
    function suggest(model, position, triggerCharacter, groups) {
        if (!groups) {
            groups = modes_1.SuggestRegistry.orderedGroups(model);
        }
        var resource = model.getAssociatedResource();
        var result = [];
        var factory = groups.map(function (supports, index) {
            return function () {
                // stop as soon as a group produced a result
                if (result.length > 0) {
                    return;
                }
                // for each support in the group ask for suggestions
                return winjs_base_1.TPromise.join(supports.map(function (support) {
                    return support.suggest(resource, position, triggerCharacter).then(function (values) {
                        if (!values) {
                            return;
                        }
                        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                            var suggestResult = values_1[_i];
                            if (!suggestResult || arrays_1.isFalsyOrEmpty(suggestResult.suggestions)) {
                                continue;
                            }
                            result.push({
                                support: support,
                                currentWord: suggestResult.currentWord,
                                incomplete: suggestResult.incomplete,
                                suggestions: suggestResult.suggestions
                            });
                        }
                    }, errors_1.onUnexpectedError);
                }));
            };
        });
        return async_1.sequence(factory).then(function () {
            // add snippets to the first group
            var snippets = supports_1.SnippetsRegistry.getSnippets(model, position);
            result.push(snippets);
            return result;
        });
    }
    exports.suggest = suggest;
    editorCommonExtensions_1.CommonEditorRegistry.registerDefaultLanguageCommand('_executeCompletionItemProvider', function (model, position, args) {
        var triggerCharacter = args['triggerCharacter'];
        if (typeof triggerCharacter !== 'undefined' && typeof triggerCharacter !== 'string') {
            throw errors_1.illegalArgument('triggerCharacter');
        }
        return suggest(model, position, triggerCharacter);
    });
});
//# sourceMappingURL=suggest.js.map