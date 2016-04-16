var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/test/common/modesUtil', 'vs/languages/html/common/html', 'vs/editor/test/common/mocks/mockModeService', 'vs/platform/test/common/nullThreadService', 'vs/platform/instantiation/common/instantiationService', 'vs/languages/markdown/common/markdown', 'vs/editor/test/common/mocks/mockMode'], function (require, exports, modesUtil, html_1, mockModeService_1, nullThreadService_1, instantiationService_1, markdown_1, mockMode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MarkdownMockModeService = (function (_super) {
        __extends(MarkdownMockModeService, _super);
        function MarkdownMockModeService() {
            _super.apply(this, arguments);
        }
        MarkdownMockModeService.prototype.isRegisteredMode = function (mimetypeOrModeId) {
            if (mimetypeOrModeId === 'javascript') {
                return true;
            }
            if (mimetypeOrModeId === 'css') {
                return true;
            }
            throw new Error('Not implemented');
        };
        MarkdownMockModeService.prototype.getMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            if (commaSeparatedMimetypesOrCommaSeparatedIds === 'javascript') {
                return new mockMode_1.MockTokenizingMode('js', 'mock-js');
            }
            if (commaSeparatedMimetypesOrCommaSeparatedIds === 'css') {
                return new mockMode_1.MockTokenizingMode('css', 'mock-css');
            }
            throw new Error('Not implemented');
        };
        MarkdownMockModeService.prototype.getModeIdForLanguageName = function (alias) {
            if (alias === 'text/javascript') {
                return 'javascript';
            }
            if (alias === 'text/css') {
                return 'css';
            }
            console.log(alias);
            throw new Error('Not implemented');
        };
        return MarkdownMockModeService;
    }(mockModeService_1.MockModeService));
    suite('Markdown - tokenization', function () {
        var tokenizationSupport;
        (function () {
            var threadService = nullThreadService_1.NULL_THREAD_SERVICE;
            var modeService = new MarkdownMockModeService();
            var inst = instantiationService_1.createInstantiationService({
                threadService: threadService,
                modeService: modeService
            });
            threadService.setInstantiationService(inst);
            var mode = new markdown_1.MarkdownMode({ id: 'markdown' }, inst, threadService, modeService, null, null, null);
            tokenizationSupport = mode.tokenizationSupport;
        })();
        test('', function () {
            modesUtil.executeTests(tokenizationSupport, [
                // HTML and embedded content - bug 16912
                [{
                        line: '<b>foo</b>*bar*',
                        tokens: [
                            { startIndex: 0, type: html_1.htmlTokenTypes.getTag('b.md') },
                            { startIndex: 3, type: '' },
                            { startIndex: 6, type: html_1.htmlTokenTypes.getTag('b.md') },
                            { startIndex: 10, type: 'emphasis.md' }
                        ] }],
                [{
                        line: '</b>*bar*',
                        tokens: [
                            { startIndex: 0, type: html_1.htmlTokenTypes.getTag('b.md') },
                            { startIndex: 4, type: 'emphasis.md' }
                        ] }],
                [{
                        line: '<script>alert("foo")</script>*bar*',
                        tokens: [
                            { startIndex: 0, type: html_1.htmlTokenTypes.getTag('script.md') },
                            { startIndex: 8, type: 'mock-js' },
                            { startIndex: 20, type: html_1.htmlTokenTypes.getTag('script.md') },
                            { startIndex: 29, type: 'emphasis.md' }
                        ] }],
                [{
                        line: '<style>div { background: red }</style>*bar*',
                        tokens: [
                            { startIndex: 0, type: html_1.htmlTokenTypes.getTag('style.md') },
                            { startIndex: 7, type: 'mock-css' },
                            { startIndex: 30, type: html_1.htmlTokenTypes.getTag('style.md') },
                            { startIndex: 38, type: 'emphasis.md' }
                        ] }]
            ]);
        });
    });
});
//# sourceMappingURL=markdown.test.js.map