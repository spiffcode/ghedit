define(["require", "exports", 'vs/languages/json/common/json', 'vs/editor/test/common/modesUtil', 'vs/languages/json/common/features/jsonTokenTypes', 'vs/platform/test/common/nullThreadService', 'vs/platform/instantiation/common/instantiationService'], function (require, exports, jsonMode, modesUtil, jsonTokenTypes, nullThreadService_1, instantiationService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('JSON - tokenization', function () {
        var tokenizationSupport;
        var assertOnEnter;
        (function () {
            var threadService = nullThreadService_1.NULL_THREAD_SERVICE;
            var inst = instantiationService_1.createInstantiationService({
                threadService: threadService
            });
            threadService.setInstantiationService(inst);
            var mode = new jsonMode.JSONMode({ id: 'json' }, inst, threadService);
            tokenizationSupport = mode.tokenizationSupport;
            assertOnEnter = modesUtil.createOnEnterAsserter(mode.getId(), mode.richEditSupport);
        })();
        test('', function () {
            modesUtil.executeTests(tokenizationSupport, [
                // tokens and brackets
                [{
                        line: '{',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_OBJECT }
                        ] }],
                [{
                        line: '[',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_ARRAY }
                        ] }],
                [{
                        line: '}',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_OBJECT }
                        ] }],
                [{
                        line: ']',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_ARRAY }
                        ] }],
                [{
                        line: ':',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_COLON }
                        ] }],
                [{
                        line: ',',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_COMMA }
                        ] }],
                // literals and keyword
                [{
                        line: '-0.123e+9203',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_VALUE_NUMBER }
                        ] }],
                [{
                        line: 'true',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_VALUE_BOOLEAN }
                        ] }],
                [{
                        line: 'false',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_VALUE_BOOLEAN }
                        ] }],
                [{
                        line: 'null',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_VALUE_NULL }
                        ] }],
                [{
                        line: '"foo"',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_PROPERTY_NAME }
                        ] }],
                [{
                        line: '"foo',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_PROPERTY_NAME }
                        ] }],
                // comments and whitespace
                [{
                        line: '//null',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_COMMENT_LINE }
                        ] }],
                [{
                        line: '/*null*/',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_COMMENT_BLOCK }
                        ] }],
                [{
                        line: '/*null',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_COMMENT_BLOCK }
                        ] }],
                [{
                        line: '\t \r\n',
                        tokens: [
                            { startIndex: 0, type: '' },
                            { startIndex: 2, type: '' }
                        ] }],
                // sequences
                [{
                        line: '{ "foo": null }',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_OBJECT },
                            { startIndex: 1, type: '' },
                            { startIndex: 2, type: jsonTokenTypes.TOKEN_PROPERTY_NAME },
                            { startIndex: 7, type: jsonTokenTypes.TOKEN_DELIM_COLON },
                            { startIndex: 8, type: '' },
                            { startIndex: 9, type: jsonTokenTypes.TOKEN_VALUE_NULL },
                            { startIndex: 13, type: '' },
                            { startIndex: 14, type: jsonTokenTypes.TOKEN_DELIM_OBJECT }
                        ] }],
                // JSON sample
                [{
                        line: '{ "foo": "bar" }',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_OBJECT },
                            { startIndex: 1, type: '' },
                            { startIndex: 2, type: jsonTokenTypes.TOKEN_PROPERTY_NAME },
                            { startIndex: 7, type: jsonTokenTypes.TOKEN_DELIM_COLON },
                            { startIndex: 8, type: '' },
                            { startIndex: 9, type: jsonTokenTypes.TOKEN_VALUE_STRING },
                            { startIndex: 14, type: '' },
                            { startIndex: 15, type: jsonTokenTypes.TOKEN_DELIM_OBJECT }
                        ] }],
                // Arrays, keywords, and numbers
                [{
                        line: '[-1.5e+4, true, false, null]',
                        tokens: [
                            { startIndex: 0, type: jsonTokenTypes.TOKEN_DELIM_ARRAY },
                            { startIndex: 1, type: jsonTokenTypes.TOKEN_VALUE_NUMBER },
                            { startIndex: 8, type: jsonTokenTypes.TOKEN_DELIM_COMMA },
                            { startIndex: 9, type: '' },
                            { startIndex: 10, type: jsonTokenTypes.TOKEN_VALUE_BOOLEAN },
                            { startIndex: 14, type: jsonTokenTypes.TOKEN_DELIM_COMMA },
                            { startIndex: 15, type: '' },
                            { startIndex: 16, type: jsonTokenTypes.TOKEN_VALUE_BOOLEAN },
                            { startIndex: 21, type: jsonTokenTypes.TOKEN_DELIM_COMMA },
                            { startIndex: 22, type: '' },
                            { startIndex: 23, type: jsonTokenTypes.TOKEN_VALUE_NULL },
                            { startIndex: 27, type: jsonTokenTypes.TOKEN_DELIM_ARRAY }
                        ] }]
            ]);
        });
        test('onEnter', function () {
            assertOnEnter.indents('', '"value": {', '');
            assertOnEnter.nothing('', '"value":(', '');
            assertOnEnter.indents('', '"value":[', '');
            assertOnEnter.indentsOutdents('', '"value":{', '}');
        });
    });
});
//# sourceMappingURL=json.test.js.map