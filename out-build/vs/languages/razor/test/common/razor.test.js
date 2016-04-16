define(["require", "exports", 'vs/editor/test/common/modesUtil', 'vs/languages/razor/common/razorTokenTypes', 'vs/languages/html/common/html', 'vs/languages/razor/common/razor', 'vs/platform/test/common/nullThreadService', 'vs/editor/test/common/mocks/mockModeService', 'vs/platform/instantiation/common/instantiationService'], function (require, exports, modesUtil, razorTokenTypes, html_1, razor_1, nullThreadService_1, mockModeService_1, instantiationService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Syntax Highlighting - Razor', function () {
        var tokenizationSupport;
        (function () {
            var threadService = nullThreadService_1.NULL_THREAD_SERVICE;
            var modeService = new mockModeService_1.MockModeService();
            var inst = instantiationService_1.createInstantiationService({
                threadService: threadService,
                modeService: modeService
            });
            threadService.setInstantiationService(inst);
            var mode = new razor_1.RAZORMode({ id: 'razor' }, inst, modeService, threadService);
            tokenizationSupport = mode.tokenizationSupport;
        })();
        test('', function () {
            modesUtil.executeTests(tokenizationSupport, [
                // Embedding - embedded html
                [{
                        line: '@{ var x; <b>x</b> }',
                        tokens: [
                            { startIndex: 0, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 2, type: '' },
                            { startIndex: 3, type: 'keyword.cs' },
                            { startIndex: 6, type: '' },
                            { startIndex: 7, type: 'ident.cs' },
                            { startIndex: 8, type: 'punctuation.cs' },
                            { startIndex: 9, type: '' },
                            { startIndex: 10, type: html_1.htmlTokenTypes.DELIM_START },
                            { startIndex: 11, type: html_1.htmlTokenTypes.getTag('b') },
                            { startIndex: 12, type: html_1.htmlTokenTypes.DELIM_START },
                            { startIndex: 13, type: 'ident.cs' },
                            { startIndex: 14, type: html_1.htmlTokenTypes.DELIM_END },
                            { startIndex: 16, type: html_1.htmlTokenTypes.getTag('b') },
                            { startIndex: 17, type: html_1.htmlTokenTypes.DELIM_END },
                            { startIndex: 18, type: '' },
                            { startIndex: 19, type: razorTokenTypes.EMBED_CS }
                        ] }],
                // Comments - razor comment inside csharp
                [{
                        line: '@{ var x; @* comment *@ x= 0; }',
                        tokens: [
                            { startIndex: 0, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 2, type: '' },
                            { startIndex: 3, type: 'keyword.cs' },
                            { startIndex: 6, type: '' },
                            { startIndex: 7, type: 'ident.cs' },
                            { startIndex: 8, type: 'punctuation.cs' },
                            { startIndex: 9, type: '' },
                            { startIndex: 10, type: 'comment.cs' },
                            { startIndex: 23, type: '' },
                            { startIndex: 24, type: 'ident.cs' },
                            { startIndex: 25, type: 'punctuation.cs' },
                            { startIndex: 26, type: '' },
                            { startIndex: 27, type: 'number.cs' },
                            { startIndex: 28, type: 'punctuation.cs' },
                            { startIndex: 29, type: '' },
                            { startIndex: 30, type: razorTokenTypes.EMBED_CS }
                        ] }],
                // Blocks - simple
                [{
                        line: '@{ var total = 0; }',
                        tokens: [
                            { startIndex: 0, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 2, type: '' },
                            { startIndex: 3, type: 'keyword.cs' },
                            { startIndex: 6, type: '' },
                            { startIndex: 7, type: 'ident.cs' },
                            { startIndex: 12, type: '' },
                            { startIndex: 13, type: 'punctuation.cs' },
                            { startIndex: 14, type: '' },
                            { startIndex: 15, type: 'number.cs' },
                            { startIndex: 16, type: 'punctuation.cs' },
                            { startIndex: 17, type: '' },
                            { startIndex: 18, type: razorTokenTypes.EMBED_CS }
                        ] }],
                [{
                        line: '@if(true){ var total = 0; }',
                        tokens: [
                            { startIndex: 0, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 1, type: 'keyword.cs' },
                            { startIndex: 3, type: 'punctuation.parenthesis.cs' },
                            { startIndex: 4, type: 'keyword.cs' },
                            { startIndex: 8, type: 'punctuation.parenthesis.cs' },
                            { startIndex: 9, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 10, type: '' },
                            { startIndex: 11, type: 'keyword.cs' },
                            { startIndex: 14, type: '' },
                            { startIndex: 15, type: 'ident.cs' },
                            { startIndex: 20, type: '' },
                            { startIndex: 21, type: 'punctuation.cs' },
                            { startIndex: 22, type: '' },
                            { startIndex: 23, type: 'number.cs' },
                            { startIndex: 24, type: 'punctuation.cs' },
                            { startIndex: 25, type: '' },
                            { startIndex: 26, type: razorTokenTypes.EMBED_CS }
                        ] }],
                // Expressions - csharp expressions in html
                [{
                        line: 'test@xyz<br>',
                        tokens: [
                            { startIndex: 0, type: '' },
                            { startIndex: 4, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 5, type: 'ident.cs' },
                            { startIndex: 8, type: html_1.htmlTokenTypes.DELIM_START },
                            { startIndex: 9, type: html_1.htmlTokenTypes.getTag('br') },
                            { startIndex: 11, type: html_1.htmlTokenTypes.DELIM_START }
                        ] }],
                [{
                        line: 'test@xyz',
                        tokens: [
                            { startIndex: 0, type: '' },
                            { startIndex: 4, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 5, type: 'ident.cs' }
                        ] }],
                [{
                        line: 'test @ xyz',
                        tokens: [
                            { startIndex: 0, type: '' },
                            { startIndex: 5, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 6, type: '' },
                            { startIndex: 7, type: 'ident.cs' }
                        ] }],
                [{
                        line: 'test @(foo) xyz',
                        tokens: [
                            { startIndex: 0, type: '' },
                            { startIndex: 5, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 7, type: 'ident.cs' },
                            { startIndex: 10, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 11, type: '' }
                        ] }],
                [{
                        line: 'test @(foo(\")\")) xyz',
                        tokens: [
                            { startIndex: 0, type: '' },
                            { startIndex: 5, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 7, type: 'ident.cs' },
                            { startIndex: 10, type: 'punctuation.parenthesis.cs' },
                            { startIndex: 11, type: 'string.cs' },
                            { startIndex: 14, type: 'punctuation.parenthesis.cs' },
                            { startIndex: 15, type: razorTokenTypes.EMBED_CS },
                            { startIndex: 16, type: '' }
                        ] }],
                // Escaping - escaped at character
                [{
                        line: 'test@@xyz',
                        tokens: [
                            { startIndex: 0, type: '' }
                        ] }]
            ]);
        });
    });
});
//# sourceMappingURL=razor.test.js.map