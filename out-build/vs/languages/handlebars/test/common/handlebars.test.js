var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/test/common/modesUtil', 'vs/languages/html/common/html', 'vs/languages/handlebars/common/handlebarsTokenTypes', 'vs/languages/handlebars/common/handlebars', 'vs/editor/test/common/mocks/mockModeService', 'vs/platform/test/common/nullThreadService', 'vs/platform/instantiation/common/instantiationService', 'vs/editor/test/common/mocks/mockMode'], function (require, exports, modesUtil, html_1, handlebarsTokenTypes, handlebars_1, mockModeService_1, nullThreadService_1, instantiationService_1, mockMode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var HandlebarsMockModeService = (function (_super) {
        __extends(HandlebarsMockModeService, _super);
        function HandlebarsMockModeService() {
            _super.call(this);
            this._handlebarsMode = null;
        }
        HandlebarsMockModeService.prototype.setHandlebarsMode = function (handlebarsMode) {
            this._handlebarsMode = handlebarsMode;
        };
        HandlebarsMockModeService.prototype.isRegisteredMode = function (mimetypeOrModeId) {
            if (mimetypeOrModeId === 'text/javascript') {
                return true;
            }
            if (mimetypeOrModeId === 'text/x-handlebars-template') {
                return true;
            }
            throw new Error('Not implemented');
        };
        HandlebarsMockModeService.prototype.getMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            if (commaSeparatedMimetypesOrCommaSeparatedIds === 'text/javascript') {
                return new mockMode_1.MockTokenizingMode('js', 'mock-js');
            }
            if (commaSeparatedMimetypesOrCommaSeparatedIds === 'text/x-handlebars-template') {
                return this._handlebarsMode;
            }
            throw new Error('Not implemented');
        };
        return HandlebarsMockModeService;
    }(mockModeService_1.MockModeService));
    suite('Handlebars', function () {
        var tokenizationSupport;
        (function () {
            var threadService = nullThreadService_1.NULL_THREAD_SERVICE;
            var modeService = new HandlebarsMockModeService();
            var inst = instantiationService_1.createInstantiationService({
                threadService: threadService,
                modeService: modeService
            });
            threadService.setInstantiationService(inst);
            var mode = new handlebars_1.HandlebarsMode({ id: 'handlebars' }, inst, modeService, threadService);
            modeService.setHandlebarsMode(mode);
            tokenizationSupport = mode.tokenizationSupport;
        })();
        test('Just HTML', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<h1>handlebars!</h1>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 3, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 4, type: '' },
                        { startIndex: 15, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 17, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 19, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        test('Expressions', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<h1>{{ title }}</h1>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 3, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 4, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 6, type: '' },
                        { startIndex: 7, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 12, type: '' },
                        { startIndex: 13, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 15, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 17, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 19, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        test('Expressions Sans Whitespace', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<h1>{{title}}</h1>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 3, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 4, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 6, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 11, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 13, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 15, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 17, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        test('Unescaped Expressions', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<h1>{{{ title }}}</h1>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 3, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 4, type: handlebarsTokenTypes.EMBED_UNESCAPED },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 13, type: '' },
                        { startIndex: 14, type: handlebarsTokenTypes.EMBED_UNESCAPED },
                        { startIndex: 17, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 19, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 21, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        test('Blocks', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<ul>{{#each items}}<li>{{item}}</li>{{/each}}</ul>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('ul') },
                        { startIndex: 3, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 4, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 6, type: handlebarsTokenTypes.KEYWORD },
                        { startIndex: 11, type: '' },
                        { startIndex: 12, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 17, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 19, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 20, type: html_1.htmlTokenTypes.getTag('li') },
                        { startIndex: 22, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 23, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 25, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 29, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 31, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 33, type: html_1.htmlTokenTypes.getTag('li') },
                        { startIndex: 35, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 36, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 38, type: handlebarsTokenTypes.KEYWORD },
                        { startIndex: 43, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 45, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 47, type: html_1.htmlTokenTypes.getTag('ul') },
                        { startIndex: 49, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        test('Multiline', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<div>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('div') },
                        { startIndex: 4, type: html_1.htmlTokenTypes.DELIM_START }
                    ] }, {
                    line: '{{#if foo}}',
                    tokens: [
                        { startIndex: 0, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 2, type: handlebarsTokenTypes.KEYWORD },
                        { startIndex: 5, type: '' },
                        { startIndex: 6, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 9, type: handlebarsTokenTypes.EMBED }
                    ] }, {
                    line: '<span>{{bar}}</span>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('span') },
                        { startIndex: 5, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 6, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 8, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 11, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 13, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 15, type: html_1.htmlTokenTypes.getTag('span') },
                        { startIndex: 19, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }, {
                    line: '{{/if}}',
                    tokens: null }
            ]);
        });
        test('Div end', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '</div>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 2, type: html_1.htmlTokenTypes.getTag('div') },
                        { startIndex: 5, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        // shamelessly stolen from the HTML test bed since Handlebars are a superset of HTML
        test('Embedded Content in HTML', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/javascript">var i= 10;</script>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: html_1.htmlTokenTypes.ATTRIB_NAME },
                        { startIndex: 12, type: html_1.htmlTokenTypes.DELIM_ASSIGN },
                        { startIndex: 13, type: html_1.htmlTokenTypes.ATTRIB_VALUE },
                        { startIndex: 30, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 31, type: 'mock-js' },
                        { startIndex: 41, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 43, type: html_1.htmlTokenTypes.getTag('script') },
                        { startIndex: 49, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        test('HTML Expressions', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/x-handlebars-template"><h1>{{ title }}</h1></script>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: html_1.htmlTokenTypes.ATTRIB_NAME },
                        { startIndex: 12, type: html_1.htmlTokenTypes.DELIM_ASSIGN },
                        { startIndex: 13, type: html_1.htmlTokenTypes.ATTRIB_VALUE },
                        { startIndex: 41, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 42, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 43, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 45, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 46, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 48, type: '' },
                        { startIndex: 49, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 54, type: '' },
                        { startIndex: 55, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 57, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 59, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 61, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 62, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 64, type: html_1.htmlTokenTypes.getTag('script') },
                        { startIndex: 70, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        test('Multi-line HTML Expressions', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/x-handlebars-template">',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: html_1.htmlTokenTypes.ATTRIB_NAME },
                        { startIndex: 12, type: html_1.htmlTokenTypes.DELIM_ASSIGN },
                        { startIndex: 13, type: html_1.htmlTokenTypes.ATTRIB_VALUE },
                        { startIndex: 41, type: html_1.htmlTokenTypes.DELIM_START }
                    ] }, {
                    line: '<h1>{{ title }}</h1>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 3, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 4, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 6, type: '' },
                        { startIndex: 7, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 12, type: '' },
                        { startIndex: 13, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 15, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 17, type: html_1.htmlTokenTypes.getTag('h1') },
                        { startIndex: 19, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }, {
                    line: '</script>',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 2, type: html_1.htmlTokenTypes.getTag('script') },
                        { startIndex: 8, type: html_1.htmlTokenTypes.DELIM_END }
                    ] }
            ]);
        });
        test('HTML Nested Modes', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '{{foo}}<script></script>{{bar}}',
                    tokens: [
                        { startIndex: 0, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 2, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 5, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 7, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 8, type: html_1.htmlTokenTypes.getTag('script') },
                        { startIndex: 14, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 15, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 17, type: html_1.htmlTokenTypes.getTag('script') },
                        { startIndex: 23, type: html_1.htmlTokenTypes.DELIM_END },
                        { startIndex: 24, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 26, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 29, type: handlebarsTokenTypes.EMBED }
                    ] }
            ]);
        });
        test('else keyword', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '{{else}}',
                    tokens: [
                        { startIndex: 0, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 2, type: handlebarsTokenTypes.KEYWORD },
                        { startIndex: 6, type: handlebarsTokenTypes.EMBED }
                    ] }
            ]);
        });
        test('else keyword #2', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '{{elseFoo}}',
                    tokens: [
                        { startIndex: 0, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 2, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 9, type: handlebarsTokenTypes.EMBED }
                    ] }
            ]);
        });
        test('Token inside attribute', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<a href="/posts/{{permalink}}">',
                    tokens: [
                        { startIndex: 0, type: html_1.htmlTokenTypes.DELIM_START },
                        { startIndex: 1, type: html_1.htmlTokenTypes.getTag('a') },
                        { startIndex: 2, type: '' },
                        { startIndex: 3, type: html_1.htmlTokenTypes.ATTRIB_NAME },
                        { startIndex: 7, type: html_1.htmlTokenTypes.DELIM_ASSIGN },
                        { startIndex: 8, type: html_1.htmlTokenTypes.ATTRIB_VALUE },
                        { startIndex: 16, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 18, type: handlebarsTokenTypes.VARIABLE },
                        { startIndex: 27, type: handlebarsTokenTypes.EMBED },
                        { startIndex: 29, type: html_1.htmlTokenTypes.ATTRIB_VALUE },
                        { startIndex: 30, type: html_1.htmlTokenTypes.DELIM_START }
                    ] }
            ]);
        });
    });
});
//# sourceMappingURL=handlebars.test.js.map