var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/editor/common/modes/monarch/monarch', 'vs/editor/common/modes/monarch/monarchCompile', 'vs/platform/thread/common/threadService', 'vs/languages/html/common/html', 'vs/languages/markdown/common/markdownTokenTypes', 'vs/editor/common/services/modeService', 'vs/platform/instantiation/common/instantiation', 'vs/platform/thread/common/thread', 'vs/editor/common/services/modelService', 'vs/platform/workspace/common/workspace', 'vs/editor/common/services/editorWorkerService', 'vs/editor/common/modes/abstractMode'], function (require, exports, Monarch, Compile, threadService_1, html_1, markdownTokenTypes, modeService_1, instantiation_1, thread_1, modelService_1, workspace_1, editorWorkerService_1, abstractMode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.language = {
        displayName: 'Markdown',
        name: 'md',
        defaultToken: '',
        suggestSupport: {
            disableAutoTrigger: true,
        },
        autoClosingPairs: [],
        blockCommentStart: '<!--',
        blockCommentEnd: '-->',
        // escape codes
        control: /[\\`*_\[\]{}()#+\-\.!]/,
        noncontrol: /[^\\`*_\[\]{}()#+\-\.!]/,
        escapes: /\\(?:@control)/,
        // escape codes for javascript/CSS strings
        jsescapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
        // non matched elements
        empty: [
            'area', 'base', 'basefont', 'br', 'col', 'frame',
            'hr', 'img', 'input', 'isindex', 'link', 'meta', 'param'
        ],
        tokenizer: {
            root: [
                // headers (with #)
                [/^(\s{0,3})(#+)((?:[^\\#]|@escapes)+)((?:#+)?)/, ['white', markdownTokenTypes.TOKEN_HEADER_LEAD, markdownTokenTypes.TOKEN_HEADER, markdownTokenTypes.TOKEN_HEADER]],
                // headers (with =)
                [/^\s*(=+|\-+)\s*$/, markdownTokenTypes.TOKEN_EXT_HEADER],
                // headers (with ***)
                [/^\s*((\*[ ]?)+)\s*$/, markdownTokenTypes.TOKEN_SEPARATOR],
                // quote
                [/^\s*>+/, markdownTokenTypes.TOKEN_QUOTE],
                // list (starting with * or number)
                [/^\s*([\*\-+:]|\d+\.)\s/, markdownTokenTypes.TOKEN_LIST],
                // code block (4 spaces indent)
                [/^(\t|[ ]{4})[^ ].*$/, markdownTokenTypes.TOKEN_BLOCK],
                // code block (3 tilde)
                [/^\s*~{3}\s*((?:\w|[\/\-#])+)?\s*$/, { token: markdownTokenTypes.TOKEN_BLOCK, next: '@codeblock' }],
                // github style code blocks (with backticks and language)
                [/^\s*```\s*((?:\w|[\/\-#])+)\s*$/, { token: markdownTokenTypes.TOKEN_BLOCK, next: '@codeblockgh', nextEmbedded: '$1' }],
                // github style code blocks (with backticks but no language)
                [/^\s*`{3}\s*$/, { token: markdownTokenTypes.TOKEN_BLOCK, next: '@codeblock' }],
                // markup within lines
                { include: '@linecontent' },
            ],
            codeblock: [
                [/^\s*~{3}\s*$/, { token: markdownTokenTypes.TOKEN_BLOCK, next: '@pop' }],
                [/^\s*`{3}\s*$/, { token: markdownTokenTypes.TOKEN_BLOCK, next: '@pop' }],
                [/.*$/, markdownTokenTypes.TOKEN_BLOCK_CODE],
            ],
            // github style code blocks
            codeblockgh: [
                [/```\s*$/, { token: '@rematch', switchTo: '@codeblockghend', nextEmbedded: '@pop' }],
                [/[^`]*$/, markdownTokenTypes.TOKEN_BLOCK_CODE],
            ],
            codeblockghend: [
                [/\s*```/, { token: markdownTokenTypes.TOKEN_BLOCK_CODE, next: '@pop' }],
                [/./, '@rematch', '@pop'],
            ],
            linecontent: [
                // escapes
                [/&\w+;/, 'string.escape'],
                [/@escapes/, 'escape'],
                // various markup
                [/\b__([^\\_]|@escapes|_(?!_))+__\b/, 'strong'],
                [/\*\*([^\\*]|@escapes|\*(?!\*))+\*\*/, 'strong'],
                [/\b_[^_]+_\b/, 'emphasis'],
                [/\*([^\\*]|@escapes)+\*/, 'emphasis'],
                [/`([^\\`]|@escapes)+`/, 'variable'],
                // links
                [/\{[^}]+\}/, 'string.target'],
                [/(!?\[)((?:[^\]\\]|@escapes)*)(\]\([^\)]+\))/, ['string.link', '', 'string.link']],
                [/(!?\[)((?:[^\]\\]|@escapes)*)(\])/, 'string.link'],
                // or html
                { include: 'html' },
            ],
            // Note: it is tempting to rather switch to the real HTML mode instead of building our own here
            // but currently there is a limitation in Monarch that prevents us from doing it: The opening
            // '<' would start the HTML mode, however there is no way to jump 1 character back to let the
            // HTML mode also tokenize the opening angle bracket. Thus, even though we could jump to HTML,
            // we cannot correctly tokenize it in that mode yet.
            html: [
                // html tags
                [/<(\w+)\/>/, html_1.htmlTokenTypes.getTag('$1')],
                [/<(\w+)/, {
                        cases: {
                            '@empty': { token: html_1.htmlTokenTypes.getTag('$1'), next: '@tag.$1' },
                            '@default': { token: html_1.htmlTokenTypes.getTag('$1'), bracket: '@open', next: '@tag.$1' }
                        }
                    }],
                [/<\/(\w+)\s*>/, { token: html_1.htmlTokenTypes.getTag('$1'), bracket: '@close' }],
                [/<!--/, 'comment', '@comment']
            ],
            comment: [
                [/[^<\-]+/, 'comment.content'],
                [/-->/, 'comment', '@pop'],
                [/<!--/, 'comment.content.invalid'],
                [/[<\-]/, 'comment.content']
            ],
            // Almost full HTML tag matching, complete with embedded scripts & styles
            tag: [
                [/[ \t\r\n]+/, 'white'],
                [/(type)(\s*=\s*)(")([^"]+)(")/, [html_1.htmlTokenTypes.ATTRIB_NAME, html_1.htmlTokenTypes.DELIM_ASSIGN, html_1.htmlTokenTypes.ATTRIB_VALUE,
                        { token: html_1.htmlTokenTypes.ATTRIB_VALUE, switchTo: '@tag.$S2.$4' },
                        html_1.htmlTokenTypes.ATTRIB_VALUE]],
                [/(type)(\s*=\s*)(')([^']+)(')/, [html_1.htmlTokenTypes.ATTRIB_NAME, html_1.htmlTokenTypes.DELIM_ASSIGN, html_1.htmlTokenTypes.ATTRIB_VALUE,
                        { token: html_1.htmlTokenTypes.ATTRIB_VALUE, switchTo: '@tag.$S2.$4' },
                        html_1.htmlTokenTypes.ATTRIB_VALUE]],
                [/(\w+)(\s*=\s*)("[^"]*"|'[^']*')/, [html_1.htmlTokenTypes.ATTRIB_NAME, html_1.htmlTokenTypes.DELIM_ASSIGN, html_1.htmlTokenTypes.ATTRIB_VALUE]],
                [/\w+/, html_1.htmlTokenTypes.ATTRIB_NAME],
                [/\/>/, html_1.htmlTokenTypes.getTag('$S2'), '@pop'],
                [/>/, {
                        cases: {
                            '$S2==style': { token: html_1.htmlTokenTypes.getTag('$S2'), switchTo: '@embedded.$S2', nextEmbedded: 'text/css' },
                            '$S2==script': {
                                cases: {
                                    '$S3': { token: html_1.htmlTokenTypes.getTag('$S2'), switchTo: '@embedded.$S2', nextEmbedded: '$S3' },
                                    '@default': { token: html_1.htmlTokenTypes.getTag('$S2'), switchTo: '@embedded.$S2', nextEmbedded: 'text/javascript' }
                                }
                            },
                            '@default': { token: html_1.htmlTokenTypes.getTag('$S2'), next: '@pop' }
                        }
                    }],
            ],
            embedded: [
                [/[^"'<]+/, ''],
                [/<\/(\w+)\s*>/, {
                        cases: {
                            '$1==$S2': { token: '@rematch', next: '@pop', nextEmbedded: '@pop' },
                            '@default': ''
                        }
                    }],
                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/'([^'\\]|\\.)*$/, 'string.invalid'],
                [/"/, 'string', '@string."'],
                [/'/, 'string', '@string.\''],
                [/</, '']
            ],
            // scan embedded strings in javascript or css
            string: [
                [/[^\\"']+/, 'string'],
                [/@jsescapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/["']/, {
                        cases: {
                            '$#==$S2': { token: 'string', next: '@pop' },
                            '@default': 'string'
                        }
                    }]
            ]
        }
    };
    var MarkdownMode = (function (_super) {
        __extends(MarkdownMode, _super);
        function MarkdownMode(descriptor, instantiationService, threadService, modeService, modelService, workspaceContextService, editorWorkerService) {
            _super.call(this, descriptor.id, Compile.compile(exports.language), modeService, modelService, editorWorkerService);
            this._modeWorkerManager = new abstractMode_1.ModeWorkerManager(descriptor, 'vs/languages/markdown/common/markdownWorker', 'MarkdownWorker', null, instantiationService);
            this._threadService = threadService;
            this.emitOutputSupport = this;
            this.configSupport = this;
        }
        MarkdownMode.prototype._worker = function (runner) {
            return this._modeWorkerManager.worker(runner);
        };
        MarkdownMode.prototype.configure = function (options) {
            if (this._threadService.isInMainThread) {
                return this._configureWorkers(options);
            }
            else {
                return this._worker(function (w) { return w._doConfigure(options); });
            }
        };
        MarkdownMode.prototype._configureWorkers = function (options) {
            return this._worker(function (w) { return w._doConfigure(options); });
        };
        MarkdownMode.prototype.getEmitOutput = function (resource, absoluteWorkerResourcesPath) {
            return this._worker(function (w) { return w.getEmitOutput(resource, absoluteWorkerResourcesPath); });
        };
        MarkdownMode.$_configureWorkers = threadService_1.AllWorkersAttr(MarkdownMode, MarkdownMode.prototype._configureWorkers);
        MarkdownMode.$getEmitOutput = threadService_1.OneWorkerAttr(MarkdownMode, MarkdownMode.prototype.getEmitOutput);
        MarkdownMode = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, thread_1.IThreadService),
            __param(3, modeService_1.IModeService),
            __param(4, modelService_1.IModelService),
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, editorWorkerService_1.IEditorWorkerService)
        ], MarkdownMode);
        return MarkdownMode;
    }(Monarch.MonarchMode));
    exports.MarkdownMode = MarkdownMode;
});
//# sourceMappingURL=markdown.js.map