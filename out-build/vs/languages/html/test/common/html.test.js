var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/editor/common/modes', 'vs/editor/test/common/modesUtil', 'vs/editor/common/model/model', 'vs/languages/html/common/htmlTokenTypes', 'vs/editor/common/modes/supports/onEnter', 'vs/editor/common/model/textModelWithTokens', 'vs/editor/common/model/textModel', 'vs/editor/common/core/range', 'vs/editor/test/common/mocks/mockModeService', 'vs/platform/test/common/nullThreadService', 'vs/platform/instantiation/common/instantiationService', 'vs/languages/html/common/html', 'vs/editor/test/common/mocks/mockMode', 'vs/editor/common/modes/supports/richEditSupport'], function (require, exports, assert, Modes, modesUtil, model_1, htmlTokenTypes_1, onEnter_1, textModelWithTokens_1, textModel_1, range_1, mockModeService_1, nullThreadService_1, instantiationService_1, html_1, mockMode_1, richEditSupport_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockJSMode = (function (_super) {
        __extends(MockJSMode, _super);
        function MockJSMode() {
            _super.call(this, 'js', 'mock-js');
            this.richEditSupport = new richEditSupport_1.RichEditSupport(this.getId(), null, {
                brackets: [
                    ['(', ')'],
                    ['{', '}'],
                    ['[', ']']
                ],
                onEnterRules: [
                    {
                        // e.g. /** | */
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        afterText: /^\s*\*\/$/,
                        action: { indentAction: Modes.IndentAction.IndentOutdent, appendText: ' * ' }
                    },
                    {
                        // e.g. /** ...|
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        action: { indentAction: Modes.IndentAction.None, appendText: ' * ' }
                    },
                    {
                        // e.g.  * ...|
                        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                        action: { indentAction: Modes.IndentAction.None, appendText: '* ' }
                    },
                    {
                        // e.g.  */|
                        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                        action: { indentAction: Modes.IndentAction.None, removeText: 1 }
                    }
                ]
            });
        }
        return MockJSMode;
    }(mockMode_1.MockTokenizingMode));
    var HTMLMockModeService = (function (_super) {
        __extends(HTMLMockModeService, _super);
        function HTMLMockModeService() {
            _super.apply(this, arguments);
        }
        HTMLMockModeService.prototype.isRegisteredMode = function (mimetypeOrModeId) {
            if (mimetypeOrModeId === 'text/javascript') {
                return true;
            }
            if (mimetypeOrModeId === 'text/plain') {
                return false;
            }
            throw new Error('Not implemented');
        };
        HTMLMockModeService.prototype.getMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            if (commaSeparatedMimetypesOrCommaSeparatedIds === 'text/javascript') {
                return new MockJSMode();
            }
            if (commaSeparatedMimetypesOrCommaSeparatedIds === 'text/plain') {
                return null;
            }
            throw new Error('Not implemented');
        };
        return HTMLMockModeService;
    }(mockModeService_1.MockModeService));
    suite('Colorizing - HTML', function () {
        var tokenizationSupport;
        var _mode;
        (function () {
            var threadService = nullThreadService_1.NULL_THREAD_SERVICE;
            var modeService = new HTMLMockModeService();
            var inst = instantiationService_1.createInstantiationService({
                threadService: threadService,
                modeService: modeService
            });
            threadService.setInstantiationService(inst);
            _mode = new html_1.HTMLMode({ id: 'html' }, inst, modeService, threadService);
            tokenizationSupport = _mode.tokenizationSupport;
        })();
        test('Open Start Tag #1', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') }
                    ] }
            ]);
        });
        test('Open Start Tag #2', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<input',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('input') }
                    ] }
            ]);
        });
        test('Open Start Tag with Invalid Tag', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '< abc',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: '' }
                    ] }
            ]);
        });
        test('Open Start Tag #3', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '< abc>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: '' }
                    ] }
            ]);
        });
        test('Open Start Tag #4', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: 'i <len;',
                    tokens: [
                        { startIndex: 0, type: '' },
                        { startIndex: 2, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 3, type: htmlTokenTypes_1.getTag('len') },
                        { startIndex: 6, type: '' }
                    ] }
            ]);
        });
        test('Open Start Tag #5', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Open End Tag', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '</a',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 2, type: htmlTokenTypes_1.getTag('a') }
                    ] }
            ]);
        });
        test('Complete Start Tag', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Complete Start Tag with Whitespace', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc >',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('bug 9809 - Complete Start Tag with Namespaceprefix', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<foo:bar>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('foo-bar') },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Complete End Tag', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '</abc>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 2, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 5, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Complete End Tag with Whitespace', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '</abc  >',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 2, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 5, type: '' },
                        { startIndex: 7, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Empty Tag', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc />',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Embedded Content #1', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/javascript">var i= 10;</script>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 12, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 13, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 30, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 31, type: 'mock-js' },
                        { startIndex: 41, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 43, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 49, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Embedded Content #2', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/javascript">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 12, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 13, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 30, type: htmlTokenTypes_1.DELIM_START }
                    ] }, {
                    line: 'var i= 10;',
                    tokens: [
                        { startIndex: 0, type: 'mock-js' },
                    ] }, {
                    line: '</script>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 2, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Embedded Content #3', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/javascript">var i= 10;',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 12, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 13, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 30, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 31, type: 'mock-js' },
                    ] }, {
                    line: '</script>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 2, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Embedded Content #4', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/javascript">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 12, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 13, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 30, type: htmlTokenTypes_1.DELIM_START }
                    ] }, {
                    line: 'var i= 10;</script>',
                    tokens: [
                        { startIndex: 0, type: 'mock-js' },
                        { startIndex: 10, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 12, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 18, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Embedded Content #5', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/plain">a\n<a</script>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 12, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 13, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 25, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 26, type: '' },
                        { startIndex: 30, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 32, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 38, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Embedded Content #6', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script>a</script><script>b</script>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 8, type: 'mock-js' },
                        { startIndex: 9, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 11, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 17, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 18, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 19, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 25, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 26, type: 'mock-js' },
                        { startIndex: 27, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 29, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 35, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Embedded Content #7', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/javascript"></script>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 12, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 13, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 30, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 31, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 33, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 39, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Embedded Content #8', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script>var i= 10;</script>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 8, type: 'mock-js' },
                        { startIndex: 18, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 20, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 26, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Embedded Content #9', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<script type="text/javascript" src="main.js"></script>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 7, type: '' },
                        { startIndex: 8, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 12, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 13, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 30, type: '' },
                        { startIndex: 31, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 34, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 35, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 44, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 45, type: htmlTokenTypes_1.DELIM_END },
                        { startIndex: 47, type: htmlTokenTypes_1.getTag('script') },
                        { startIndex: 53, type: htmlTokenTypes_1.DELIM_END }
                    ] }
            ]);
        });
        test('Tag with Attribute', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo="bar">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 9, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 14, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with Empty Attribute Value', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo=\'bar\'>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 9, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 14, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with empty atrributes', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo="">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 9, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 11, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with Attributes', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo="bar" bar="foo">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 9, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 14, type: '' },
                        { startIndex: 15, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 18, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 19, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 24, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with Attribute And Whitespace', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo=  "bar">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 9, type: '' },
                        { startIndex: 11, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 16, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with Attribute And Whitespace #2', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo = "bar">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: '' },
                        { startIndex: 9, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 10, type: '' },
                        { startIndex: 11, type: htmlTokenTypes_1.ATTRIB_VALUE },
                        { startIndex: 16, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with Name-Only-Attribute #1', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with Name-Only-Attribute #2', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo bar>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: '' },
                        { startIndex: 9, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 12, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with Invalid Attribute Name', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo!@#="bar">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: '' },
                        { startIndex: 13, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 16, type: '' },
                        { startIndex: 17, type: htmlTokenTypes_1.DELIM_START }
                    ] }
            ]);
        });
        test('Tag with Invalid Attribute Value', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<abc foo=">',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_START },
                        { startIndex: 1, type: htmlTokenTypes_1.getTag('abc') },
                        { startIndex: 4, type: '' },
                        { startIndex: 5, type: htmlTokenTypes_1.ATTRIB_NAME },
                        { startIndex: 8, type: htmlTokenTypes_1.DELIM_ASSIGN },
                        { startIndex: 9, type: htmlTokenTypes_1.ATTRIB_VALUE }
                    ] }
            ]);
        });
        test('Simple Comment 1', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<!--a-->',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_COMMENT },
                        { startIndex: 4, type: htmlTokenTypes_1.COMMENT },
                        { startIndex: 5, type: htmlTokenTypes_1.DELIM_COMMENT }
                    ] }
            ]);
        });
        test('Simple Comment 2', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<!--a>foo bar</a -->',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_COMMENT },
                        { startIndex: 4, type: htmlTokenTypes_1.COMMENT },
                        { startIndex: 17, type: htmlTokenTypes_1.DELIM_COMMENT }
                    ] }
            ]);
        });
        test('Multiline Comment', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<!--a>\nfoo \nbar</a -->',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_COMMENT },
                        { startIndex: 4, type: htmlTokenTypes_1.COMMENT },
                        { startIndex: 19, type: htmlTokenTypes_1.DELIM_COMMENT }
                    ] }
            ]);
        });
        test('Simple Doctype', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<!DOCTYPE a>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_DOCTYPE },
                        { startIndex: 9, type: htmlTokenTypes_1.DOCTYPE },
                        { startIndex: 11, type: htmlTokenTypes_1.DELIM_DOCTYPE }
                    ] }
            ]);
        });
        test('Simple Doctype #2', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<!doctype a>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_DOCTYPE },
                        { startIndex: 9, type: htmlTokenTypes_1.DOCTYPE },
                        { startIndex: 11, type: htmlTokenTypes_1.DELIM_DOCTYPE }
                    ] }
            ]);
        });
        test('Simple Doctype #4', function () {
            modesUtil.assertTokenization(tokenizationSupport, [{
                    line: '<!DOCTYPE a\n"foo" \'bar\'>',
                    tokens: [
                        { startIndex: 0, type: htmlTokenTypes_1.DELIM_DOCTYPE },
                        { startIndex: 9, type: htmlTokenTypes_1.DOCTYPE },
                        { startIndex: 23, type: htmlTokenTypes_1.DELIM_DOCTYPE }
                    ] }
            ]);
        });
        test('onEnter 1', function () {
            var model = new model_1.Model('<script type=\"text/javascript\">function f() { foo(); }', model_1.Model.DEFAULT_CREATION_OPTIONS, _mode);
            var actual = _mode.richEditSupport.onEnter.onEnter(model, {
                lineNumber: 1,
                column: 46
            });
            assert.equal(actual.indentAction, Modes.IndentAction.Indent);
            model.dispose();
        });
        test('onEnter 2', function () {
            function onEnter(line, offset) {
                var model = new textModelWithTokens_1.TextModelWithTokens([], textModel_1.TextModel.toRawText(line, model_1.Model.DEFAULT_CREATION_OPTIONS), false, _mode);
                var result = onEnter_1.getRawEnterActionAtPosition(model, 1, offset + 1);
                model.dispose();
                return result;
            }
            function assertOnEnter(text, offset, expected) {
                var _actual = onEnter(text, offset);
                var actual = _actual ? _actual.indentAction : null;
                var actualStr = actual ? Modes.IndentAction[actual] : null;
                var expectedStr = expected ? Modes.IndentAction[expected] : null;
                assert.equal(actualStr, expectedStr, 'TEXT: <<' + text + '>>, OFFSET: <<' + offset + '>>');
            }
            assertOnEnter('', 0, null);
            assertOnEnter('>', 1, null);
            assertOnEnter('span>', 5, null);
            assertOnEnter('</span>', 7, null);
            assertOnEnter('<img />', 7, null);
            assertOnEnter('<span>', 6, Modes.IndentAction.Indent);
            assertOnEnter('<p>', 3, Modes.IndentAction.Indent);
            assertOnEnter('<span><span>', 6, Modes.IndentAction.Indent);
            assertOnEnter('<p><span>', 3, Modes.IndentAction.Indent);
            assertOnEnter('<span></SPan>', 6, Modes.IndentAction.IndentOutdent);
            assertOnEnter('<span></span>', 6, Modes.IndentAction.IndentOutdent);
            assertOnEnter('<p></p>', 3, Modes.IndentAction.IndentOutdent);
            assertOnEnter('<span>a</span>', 6, Modes.IndentAction.Indent);
            assertOnEnter('<span>a</span>', 7, Modes.IndentAction.IndentOutdent);
            assertOnEnter('<span> </span>', 6, Modes.IndentAction.Indent);
            assertOnEnter('<span> </span>', 7, Modes.IndentAction.IndentOutdent);
        });
        test('matchBracket', function () {
            function toString(brackets) {
                if (!brackets) {
                    return null;
                }
                brackets.sort(range_1.Range.compareRangesUsingStarts);
                return brackets.map(function (b) { return b.toString(); });
            }
            function assertBracket(lines, lineNumber, column, expected) {
                var model = new textModelWithTokens_1.TextModelWithTokens([], textModel_1.TextModel.toRawText(lines.join('\n'), textModel_1.TextModel.DEFAULT_CREATION_OPTIONS), false, _mode);
                // force tokenization
                model.getLineContext(model.getLineCount());
                var actual = model.matchBracket({
                    lineNumber: lineNumber,
                    column: column
                });
                var actualStr = actual ? toString(actual.brackets) : null;
                var expectedStr = toString(expected);
                assert.deepEqual(actualStr, expectedStr, 'TEXT <<' + lines.join('\n') + '>>, POS: ' + lineNumber + ', ' + column);
            }
            assertBracket(['<p></p>'], 1, 1, [new range_1.Range(1, 1, 1, 2), new range_1.Range(1, 3, 1, 4)]);
            assertBracket(['<p></p>'], 1, 2, [new range_1.Range(1, 1, 1, 2), new range_1.Range(1, 3, 1, 4)]);
            assertBracket(['<p></p>'], 1, 3, [new range_1.Range(1, 1, 1, 2), new range_1.Range(1, 3, 1, 4)]);
            assertBracket(['<p></p>'], 1, 4, [new range_1.Range(1, 1, 1, 2), new range_1.Range(1, 3, 1, 4)]);
            assertBracket(['<p></p>'], 1, 5, [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 7, 1, 8)]);
            assertBracket(['<p></p>'], 1, 6, null);
            assertBracket(['<p></p>'], 1, 7, [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 7, 1, 8)]);
            assertBracket(['<p></p>'], 1, 8, [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 7, 1, 8)]);
            assertBracket(['<script>a[a</script>a[a<script>a]a'], 1, 10, [new range_1.Range(1, 10, 1, 11), new range_1.Range(1, 33, 1, 34)]);
            assertBracket(['<script>a[a</script>a[a<script>a]a'], 1, 11, [new range_1.Range(1, 10, 1, 11), new range_1.Range(1, 33, 1, 34)]);
            assertBracket(['<script>a[a</script>a[a<script>a]a'], 1, 22, null);
            assertBracket(['<script>a[a</script>a[a<script>a]a'], 1, 23, null);
            assertBracket(['<script>a[a</script>a[a<script>a]a'], 1, 33, [new range_1.Range(1, 10, 1, 11), new range_1.Range(1, 33, 1, 34)]);
            assertBracket(['<script>a[a</script>a[a<script>a]a'], 1, 34, [new range_1.Range(1, 10, 1, 11), new range_1.Range(1, 33, 1, 34)]);
            assertBracket(['<script>a[a</script>a]a<script>a]a'], 1, 10, [new range_1.Range(1, 10, 1, 11), new range_1.Range(1, 33, 1, 34)]);
            assertBracket(['<script>a[a</script>a]a<script>a]a'], 1, 11, [new range_1.Range(1, 10, 1, 11), new range_1.Range(1, 33, 1, 34)]);
            assertBracket(['<script>a[a</script>a]a<script>a]a'], 1, 22, null);
            assertBracket(['<script>a[a</script>a]a<script>a]a'], 1, 23, null);
            assertBracket(['<script>a[a</script>a]a<script>a]a'], 1, 33, [new range_1.Range(1, 10, 1, 11), new range_1.Range(1, 33, 1, 34)]);
            assertBracket(['<script>a[a</script>a]a<script>a]a'], 1, 34, [new range_1.Range(1, 10, 1, 11), new range_1.Range(1, 33, 1, 34)]);
        });
    });
});
//# sourceMappingURL=html.test.js.map