define(["require", "exports", 'assert', 'vs/editor/common/model/model', 'vs/editor/common/modes', 'vs/editor/common/modes/monarch/monarchCompile', 'vs/editor/common/modes/monarch/monarchLexer', 'vs/editor/test/common/servicesTestUtils', 'vs/editor/test/common/mocks/mockMode'], function (require, exports, assert, model_1, modes, monarchCompile_1, monarchLexer_1, servicesTestUtils_1, mockMode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function assertWords(actual, expected, message) {
        assert.deepEqual(actual, expected, message);
    }
    exports.assertWords = assertWords;
    function assertTokenization(tokenizationSupport, tests) {
        var state = tokenizationSupport.getInitialState();
        for (var i = 0, len = tests.length; i < len; i++) {
            assert.ok(true, tests[i].line);
            var result = tokenizationSupport.tokenize(tests[i].line, state);
            if (tests[i].tokens) {
                assert.deepEqual(toRelaxedTokens(result.tokens), toRelaxedTokens(tests[i].tokens), JSON.stringify(result.tokens, null, '\t'));
            }
            state = result.endState;
        }
    }
    exports.assertTokenization = assertTokenization;
    function createOnEnterAsserter(modeId, richEditSupport) {
        var assertOne = function (oneLineAboveText, beforeText, afterText, expected) {
            var model = new model_1.Model([oneLineAboveText, beforeText + afterText].join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, new mockMode_1.MockMode(modeId));
            var actual = richEditSupport.onEnter.onEnter(model, { lineNumber: 2, column: beforeText.length + 1 });
            if (expected === modes.IndentAction.None) {
                assert.equal(actual, null, oneLineAboveText + '\\n' + beforeText + '|' + afterText);
            }
            else {
                assert.equal(actual.indentAction, expected, oneLineAboveText + '\\n' + beforeText + '|' + afterText);
            }
            model.dispose();
        };
        return {
            nothing: function (oneLineAboveText, beforeText, afterText) {
                assertOne(oneLineAboveText, beforeText, afterText, modes.IndentAction.None);
            },
            indents: function (oneLineAboveText, beforeText, afterText) {
                assertOne(oneLineAboveText, beforeText, afterText, modes.IndentAction.Indent);
            },
            outdents: function (oneLineAboveText, beforeText, afterText) {
                assertOne(oneLineAboveText, beforeText, afterText, modes.IndentAction.Outdent);
            },
            indentsOutdents: function (oneLineAboveText, beforeText, afterText) {
                assertOne(oneLineAboveText, beforeText, afterText, modes.IndentAction.IndentOutdent);
            }
        };
    }
    exports.createOnEnterAsserter = createOnEnterAsserter;
    function executeTests(tokenizationSupport, tests) {
        for (var i = 0, len = tests.length; i < len; i++) {
            assert.ok(true, 'TEST #' + i);
            executeTest(tokenizationSupport, tests[i]);
        }
    }
    exports.executeTests = executeTests;
    function executeMonarchTokenizationTests(name, language, tests) {
        var lexer = monarchCompile_1.compile(language);
        var modeService = servicesTestUtils_1.createMockModeService();
        var tokenizationSupport = monarchLexer_1.createTokenizationSupport(modeService, new mockMode_1.MockMode(), lexer);
        executeTests(tokenizationSupport, tests);
    }
    exports.executeMonarchTokenizationTests = executeMonarchTokenizationTests;
    function toRelaxedTokens(tokens) {
        return tokens.map(function (t) {
            return {
                startIndex: t.startIndex,
                type: t.type
            };
        });
    }
    function executeTest(tokenizationSupport, tests) {
        var state = tokenizationSupport.getInitialState();
        for (var i = 0, len = tests.length; i < len; i++) {
            assert.ok(true, tests[i].line);
            var result = tokenizationSupport.tokenize(tests[i].line, state);
            if (tests[i].tokens) {
                assertTokens(result.tokens, tests[i].tokens, 'Tokenizing line ' + tests[i].line);
            }
            state = result.endState;
        }
    }
    function assertTokens(actual, expected, message) {
        assert.deepEqual(toRelaxedTokens(actual), toRelaxedTokens(expected), message + ': ' + JSON.stringify(actual, null, '\t'));
    }
});
//# sourceMappingURL=modesUtil.js.map