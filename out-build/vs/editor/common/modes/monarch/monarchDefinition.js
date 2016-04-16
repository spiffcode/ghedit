define(["require", "exports", 'vs/editor/common/modes/supports/suggestSupport'], function (require, exports, suggestSupport_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function createRichEditSupport(lexer) {
        return {
            wordPattern: lexer.wordDefinition,
            comments: {
                lineComment: lexer.lineComment,
                blockComment: [lexer.blockCommentStart, lexer.blockCommentEnd]
            },
            brackets: lexer.standardBrackets,
            __electricCharacterSupport: {
                // regexBrackets: lexer.enhancedBrackets,
                caseInsensitive: lexer.ignoreCase,
                embeddedElectricCharacters: lexer.outdentTriggers.split('')
            },
            __characterPairSupport: {
                autoClosingPairs: lexer.autoClosingPairs
            }
        };
    }
    exports.createRichEditSupport = createRichEditSupport;
    function createSuggestSupport(modelService, editorWorkerService, modeId, lexer) {
        if (lexer.suggestSupport.textualCompletions) {
            return new suggestSupport_1.TextualAndPredefinedResultSuggestSupport(modeId, modelService, editorWorkerService, lexer.suggestSupport.snippets, lexer.suggestSupport.triggerCharacters, lexer.suggestSupport.disableAutoTrigger);
        }
        else {
            return new suggestSupport_1.PredefinedResultSuggestSupport(modeId, modelService, lexer.suggestSupport.snippets, lexer.suggestSupport.triggerCharacters, lexer.suggestSupport.disableAutoTrigger);
        }
    }
    exports.createSuggestSupport = createSuggestSupport;
});
