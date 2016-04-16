var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/uri', 'vs/base/common/types', 'vs/base/common/paths', 'vs/base/common/marked/marked', 'vs/editor/common/modes/textToHtmlTokenizer', 'vs/base/common/platform', 'vs/editor/common/services/modeService', 'vs/editor/common/services/resourceService', 'vs/platform/markers/common/markers'], function (require, exports, WinJS, uri_1, Types, Paths, Marked, textToHtmlTokenizer_1, platform_1, modeService_1, resourceService_1, markers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Theme;
    (function (Theme) {
        Theme[Theme["LIGHT"] = 0] = "LIGHT";
        Theme[Theme["DARK"] = 1] = "DARK";
        Theme[Theme["HC_BLACK"] = 2] = "HC_BLACK";
    })(Theme || (Theme = {}));
    var MarkdownWorker = (function () {
        function MarkdownWorker(modeId, resourceService, markerService, modeService) {
            this.theme = Theme.DARK;
            this._modeId = modeId;
            this.resourceService = resourceService;
            this.markerService = markerService;
            this.modeService = modeService;
        }
        MarkdownWorker.prototype._doConfigure = function (options) {
            if (options && options.theme) {
                this.theme = (options.theme === 'vs-dark') ? Theme.DARK : (options.theme === 'vs') ? Theme.LIGHT : Theme.HC_BLACK;
            }
            if (options && Types.isArray(options.styles)) {
                this.cssLinks = options.styles;
            }
            return WinJS.TPromise.as(void 0);
        };
        MarkdownWorker.prototype.getEmitOutput = function (resource, absoluteWorkersResourcePath) {
            var _this = this;
            var model = this.resourceService.get(resource);
            var cssLinks = this.cssLinks || [];
            // Custom Renderer to fix href in images
            var renderer = new Marked.marked.Renderer();
            var $this = this;
            renderer.image = function (href, title, text) {
                var out = '<img src="' + $this.fixHref(resource, href) + '" alt="' + text + '"';
                if (title) {
                    out += ' title="' + title + '"';
                }
                out += (this.options && this.options.xhtml) ? '/>' : '>';
                return out;
            };
            // Custom Renderer to open links always in a new tab
            var superRenderLink = renderer.link;
            renderer.link = function (href, title, text) {
                var link = superRenderLink.call(this, href, title, text);
                // We cannot support local anchor tags because the iframe editor does not have a src set
                if (href && href[0] === '#') {
                    link = link.replace('href=', 'localhref=');
                }
                else {
                    link = link.replace('<a', '<a target="_blank"');
                }
                return link;
            };
            var modeService = this.modeService;
            // Custom highlighter to use our modes to render code
            var highlighter = function (code, lang, callback) {
                // Lookup the mode and use the tokenizer to get the HTML
                var mimeForLang = modeService.getModeIdForLanguageName(lang) || lang || MarkdownWorker.DEFAULT_MODE;
                modeService.getOrCreateMode(mimeForLang).then(function (mode) {
                    callback(null, textToHtmlTokenizer_1.tokenizeToString(code, mode));
                });
            };
            return new WinJS.Promise(function (c, e) {
                // Render markdown file contents to HTML
                Marked.marked(model.getValue(), {
                    gfm: true,
                    renderer: renderer,
                    highlight: highlighter
                }, function (error, htmlResult) {
                    // Compute head
                    var head = [
                        '<!DOCTYPE html>',
                        '<html>',
                        '<head>',
                        '<meta http-equiv="Content-type" content="text/html;charset=UTF-8">',
                        (cssLinks.length === 0) ? '<link rel="stylesheet" href="' + absoluteWorkersResourcePath + '/markdown.css" type="text/css" media="screen">' : '',
                        (cssLinks.length === 0) ? '<link rel="stylesheet" href="' + absoluteWorkersResourcePath + '/tokens.css" type="text/css" media="screen">' : '',
                        (_this.theme === Theme.LIGHT) ? MarkdownWorker.LIGHT_SCROLLBAR_CSS : (_this.theme === Theme.DARK) ? MarkdownWorker.DARK_SCROLLBAR_CSS : MarkdownWorker.HC_BLACK_SCROLLBAR_CSS,
                        cssLinks.map(function (style) {
                            return '<link rel="stylesheet" href="' + _this.fixHref(resource, style) + '" type="text/css" media="screen">';
                        }).join('\n'),
                        '</head>',
                        platform_1.isMacintosh ? '<body class="mac">' : '<body>'
                    ].join('\n');
                    // Compute body
                    var body = [
                        (_this.theme === Theme.LIGHT) ? '<div class="monaco-editor vs">' : (_this.theme === Theme.DARK) ? '<div class="monaco-editor vs-dark">' : '<div class="monaco-editor hc-black">',
                        htmlResult,
                        '</div>',
                    ].join('\n');
                    // Tail
                    var tail = [
                        '</body>',
                        '</html>'
                    ].join('\n');
                    c({
                        head: head,
                        body: body,
                        tail: tail
                    });
                });
            });
        };
        MarkdownWorker.prototype.fixHref = function (resource, href) {
            if (href) {
                // Return early if href is already a URL
                if (uri_1.default.parse(href).scheme) {
                    return href;
                }
                // Otherwise convert to a file URI by joining the href with the resource location
                return uri_1.default.file(Paths.join(Paths.dirname(resource.fsPath), href)).toString();
            }
            return href;
        };
        MarkdownWorker.DEFAULT_MODE = 'text/plain';
        // Custom Scrollbar CSS (inlined because of pseudo elements that cannot be made theme aware)
        MarkdownWorker.LIGHT_SCROLLBAR_CSS = [
            '<style type="text/css">',
            '	::-webkit-scrollbar {',
            '		width: 14px;',
            '		height: 14px;',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb {',
            '		background-color: rgba(100, 100, 100, 0.4);',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb:hover {',
            '		background-color: rgba(100, 100, 100, 0.7);',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb:active {',
            '		background-color: rgba(0, 0, 0, 0.6);',
            '	}',
            '</style>'
        ].join('\n');
        MarkdownWorker.DARK_SCROLLBAR_CSS = [
            '<style type="text/css">',
            '	::-webkit-scrollbar {',
            '		width: 14px;',
            '		height: 14px;',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb {',
            '		background-color: rgba(121, 121, 121, 0.4);',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb:hover {',
            '		background-color: rgba(100, 100, 100, 0.7);',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb:active {',
            '		background-color: rgba(85, 85, 85, 0.8);',
            '	}',
            '</style>'
        ].join('\n');
        MarkdownWorker.HC_BLACK_SCROLLBAR_CSS = [
            '<style type="text/css">',
            '	::-webkit-scrollbar {',
            '		width: 14px;',
            '		height: 14px;',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb {',
            '		background-color: rgba(111, 195, 223, 0.3);',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb:hover {',
            '		background-color: rgba(111, 195, 223, 0.4);',
            '	}',
            '',
            '	::-webkit-scrollbar-thumb:active {',
            '		background-color: rgba(111, 195, 223, 0.4);',
            '	}',
            '</style>'
        ].join('\n');
        MarkdownWorker = __decorate([
            __param(1, resourceService_1.IResourceService),
            __param(2, markers_1.IMarkerService),
            __param(3, modeService_1.IModeService)
        ], MarkdownWorker);
        return MarkdownWorker;
    }());
    exports.MarkdownWorker = MarkdownWorker;
});
//# sourceMappingURL=markdownWorker.js.map