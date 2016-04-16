/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/browser/dom', 'vs/base/common/marked/marked'], function (require, exports, DOM, marked_1) {
    'use strict';
    /**
     * Create html nodes for the given content element.
     *
     * @param content a html element description
     * @param actionCallback a callback function for any action links in the string. Argument is the zero-based index of the clicked action.
     */
    function renderHtml(content, options) {
        if (options === void 0) { options = {}; }
        if (typeof content === 'string') {
            return _renderHtml({ isText: true, text: content }, options);
        }
        else if (Array.isArray(content)) {
            return _renderHtml({ children: content }, options);
        }
        else if (content) {
            return _renderHtml(content, options);
        }
    }
    exports.renderHtml = renderHtml;
    function _renderHtml(content, options) {
        if (options === void 0) { options = {}; }
        var codeBlockRenderer = options.codeBlockRenderer, actionCallback = options.actionCallback;
        if (content.isText) {
            return document.createTextNode(content.text);
        }
        var tagName = getSafeTagName(content.tagName) || 'div';
        var element = document.createElement(tagName);
        if (content.className) {
            element.className = content.className;
        }
        if (content.text) {
            element.textContent = content.text;
        }
        if (content.style) {
            element.setAttribute('style', content.style);
        }
        if (content.customStyle) {
            Object.keys(content.customStyle).forEach(function (key) {
                element.style[key] = content.customStyle[key];
            });
        }
        if (content.code && codeBlockRenderer) {
            var html = codeBlockRenderer(content.code.language, content.code.value);
            element.innerHTML = html;
        }
        if (content.children) {
            content.children.forEach(function (child) {
                element.appendChild(renderHtml(child, options));
            });
        }
        if (content.formattedText) {
            renderFormattedText(element, parseFormattedText(content.formattedText), actionCallback);
        }
        if (content.markdown) {
            var renderer = new marked_1.marked.Renderer();
            renderer.link = function (href, title, text) {
                return "<a href=\"#\" data-href=\"" + href + "\" title=\"" + (title || text) + "\">" + text + "</a>";
            };
            renderer.paragraph = function (text) {
                return "<div>" + text + "</div>";
            };
            if (options.codeBlockRenderer) {
                renderer.code = function (code, lang) {
                    return options.codeBlockRenderer(lang, code);
                };
            }
            if (options.actionCallback) {
                DOM.addStandardDisposableListener(element, 'click', function (event) {
                    if (event.target.tagName === 'A') {
                        var href = event.target.dataset['href'];
                        if (href) {
                            options.actionCallback(href, event);
                        }
                    }
                });
            }
            element.innerHTML = marked_1.marked(content.markdown, {
                sanitize: true,
                renderer: renderer
            });
        }
        return element;
    }
    var SAFE_TAG_NAMES = {
        a: true,
        b: true,
        blockquote: true,
        code: true,
        del: true,
        dd: true,
        div: true,
        dl: true,
        dt: true,
        em: true,
        h1h2h3i: true,
        img: true,
        kbd: true,
        li: true,
        ol: true,
        p: true,
        pre: true,
        s: true,
        span: true,
        sup: true,
        sub: true,
        strong: true,
        strike: true,
        ul: true,
        br: true,
        hr: true,
    };
    function getSafeTagName(tagName) {
        if (!tagName) {
            return null;
        }
        if (SAFE_TAG_NAMES.hasOwnProperty(tagName)) {
            return tagName;
        }
        return null;
    }
    // // --- markdown worker renderer
    // namespace marked {
    // 	const workerFactory = new DefaultWorkerFactory();
    // 	let worker: WorkerClient;
    // 	let workerDisposeHandle: number;
    // 	export function html(source: string): TPromise<string> {
    // 		const t1 = Date.now();
    // 		if (!worker) {
    // 			worker = new WorkerClient(workerFactory, 'vs/base/common/marked/simpleMarkedWorker', (msg) => msg.type, client => { shutdown(); });
    // 		}
    // 		function shutdown() {
    // 			if (worker) {
    // 				worker.dispose();
    // 				worker = undefined;
    // 			}
    // 		}
    // 		// re-schedule termination
    // 		clearTimeout(workerDisposeHandle);
    // 		workerDisposeHandle = setTimeout(shutdown, 1000 * 5);
    // 		return worker.request('markdownToHtml', { source, hightlight: false }).then(html => {
    // 			console.log(`t1: ${Date.now() - t1}ms`);
    // 			return html;
    // 		});
    // 	}
    // }
    // --- formatted string parsing
    var StringStream = (function () {
        function StringStream(source) {
            this.source = source;
            this.index = 0;
        }
        StringStream.prototype.eos = function () {
            return this.index >= this.source.length;
        };
        StringStream.prototype.next = function () {
            var next = this.peek();
            this.advance();
            return next;
        };
        StringStream.prototype.peek = function () {
            return this.source[this.index];
        };
        StringStream.prototype.advance = function () {
            this.index++;
        };
        return StringStream;
    }());
    var FormatType;
    (function (FormatType) {
        FormatType[FormatType["Invalid"] = 0] = "Invalid";
        FormatType[FormatType["Root"] = 1] = "Root";
        FormatType[FormatType["Text"] = 2] = "Text";
        FormatType[FormatType["Bold"] = 3] = "Bold";
        FormatType[FormatType["Italics"] = 4] = "Italics";
        FormatType[FormatType["Action"] = 5] = "Action";
        FormatType[FormatType["ActionClose"] = 6] = "ActionClose";
        FormatType[FormatType["NewLine"] = 7] = "NewLine";
    })(FormatType || (FormatType = {}));
    function renderFormattedText(element, treeNode, actionCallback) {
        var child;
        if (treeNode.type === FormatType.Text) {
            child = document.createTextNode(treeNode.content);
        }
        else if (treeNode.type === FormatType.Bold) {
            child = document.createElement('b');
        }
        else if (treeNode.type === FormatType.Italics) {
            child = document.createElement('i');
        }
        else if (treeNode.type === FormatType.Action) {
            var a = document.createElement('a');
            a.href = '#';
            DOM.addStandardDisposableListener(a, 'click', function (event) {
                actionCallback(String(treeNode.index), event);
            });
            child = a;
        }
        else if (treeNode.type === FormatType.NewLine) {
            child = document.createElement('br');
        }
        else if (treeNode.type === FormatType.Root) {
            child = element;
        }
        if (element !== child) {
            element.appendChild(child);
        }
        if (Array.isArray(treeNode.children)) {
            treeNode.children.forEach(function (nodeChild) {
                renderFormattedText(child, nodeChild, actionCallback);
            });
        }
    }
    function parseFormattedText(content) {
        var root = {
            type: FormatType.Root,
            children: []
        };
        var actionItemIndex = 0;
        var current = root;
        var stack = [];
        var stream = new StringStream(content);
        while (!stream.eos()) {
            var next = stream.next();
            var isEscapedFormatType = (next === '\\' && formatTagType(stream.peek()) !== FormatType.Invalid);
            if (isEscapedFormatType) {
                next = stream.next(); // unread the backslash if it escapes a format tag type
            }
            if (!isEscapedFormatType && isFormatTag(next) && next === stream.peek()) {
                stream.advance();
                if (current.type === FormatType.Text) {
                    current = stack.pop();
                }
                var type = formatTagType(next);
                if (current.type === type || (current.type === FormatType.Action && type === FormatType.ActionClose)) {
                    current = stack.pop();
                }
                else {
                    var newCurrent = {
                        type: type,
                        children: []
                    };
                    if (type === FormatType.Action) {
                        newCurrent.index = actionItemIndex;
                        actionItemIndex++;
                    }
                    current.children.push(newCurrent);
                    stack.push(current);
                    current = newCurrent;
                }
            }
            else if (next === '\n') {
                if (current.type === FormatType.Text) {
                    current = stack.pop();
                }
                current.children.push({
                    type: FormatType.NewLine
                });
            }
            else {
                if (current.type !== FormatType.Text) {
                    var textCurrent = {
                        type: FormatType.Text,
                        content: next
                    };
                    current.children.push(textCurrent);
                    stack.push(current);
                    current = textCurrent;
                }
                else {
                    current.content += next;
                }
            }
        }
        if (current.type === FormatType.Text) {
            current = stack.pop();
        }
        if (stack.length) {
        }
        return root;
    }
    function isFormatTag(char) {
        return formatTagType(char) !== FormatType.Invalid;
    }
    function formatTagType(char) {
        switch (char) {
            case '*':
                return FormatType.Bold;
            case '_':
                return FormatType.Italics;
            case '[':
                return FormatType.Action;
            case ']':
                return FormatType.ActionClose;
            default:
                return FormatType.Invalid;
        }
    }
});
