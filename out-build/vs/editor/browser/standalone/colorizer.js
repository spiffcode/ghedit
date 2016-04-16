define(["require", "exports", 'vs/base/common/async', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommon', 'vs/editor/common/viewLayout/viewLineRenderer', 'vs/editor/common/model/tokensBinaryEncoding'], function (require, exports, async_1, winjs_base_1, editorCommon_1, viewLineRenderer_1, TokensBinaryEncoding) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Colorizer = (function () {
        function Colorizer() {
        }
        Colorizer.colorizeElement = function (modeService, domNode, options) {
            options = options || {};
            var theme = options.theme || 'vs';
            var mimeType = options.mimeType || domNode.getAttribute('lang') || domNode.getAttribute('data-lang');
            if (!mimeType) {
                console.error('Mode not detected');
                return;
            }
            var text = domNode.firstChild.nodeValue;
            domNode.className += 'monaco-editor ' + theme;
            var render = function (str) {
                domNode.innerHTML = str;
            };
            return this.colorize(modeService, text, mimeType, options).then(render, function (err) { return console.error(err); }, render);
        };
        Colorizer.colorize = function (modeService, text, mimeType, options) {
            options = options || {};
            if (typeof options.tabSize === 'undefined') {
                options.tabSize = 4;
            }
            var lines = text.split('\n'), c, e, p, isCancelled = false, mode;
            var result = new winjs_base_1.TPromise(function (_c, _e, _p) {
                c = _c;
                e = _e;
                p = _p;
            }, function () {
                isCancelled = true;
            });
            var colorize = new async_1.RunOnceScheduler(function () {
                if (isCancelled) {
                    return;
                }
                var r = actualColorize(lines, mode, options.tabSize);
                if (r.retokenize.length > 0) {
                    // There are retokenization requests
                    r.retokenize.forEach(function (p) { return p.then(scheduleColorize); });
                    p(r.result);
                }
                else {
                    // There are no (more) retokenization requests
                    c(r.result);
                }
            }, 0);
            var scheduleColorize = function () { return colorize.schedule(); };
            modeService.getOrCreateMode(mimeType).then(function (_mode) {
                if (!_mode) {
                    e('Mode not found: "' + mimeType + '".');
                    return;
                }
                if (!_mode.tokenizationSupport) {
                    e('Mode found ("' + _mode.getId() + '"), but does not support tokenization.');
                    return;
                }
                mode = _mode;
                scheduleColorize();
            });
            return result;
        };
        Colorizer.colorizeLine = function (line, tokens, tabSize) {
            if (tabSize === void 0) { tabSize = 4; }
            var renderResult = viewLineRenderer_1.renderLine(new viewLineRenderer_1.RenderLineInput(line, tabSize, 0, -1, false, tokens));
            return renderResult.output;
        };
        Colorizer.colorizeModelLine = function (model, lineNumber, tabSize) {
            if (tabSize === void 0) { tabSize = 4; }
            var content = model.getLineContent(lineNumber);
            var tokens = model.getLineTokens(lineNumber, false);
            var inflatedTokens = TokensBinaryEncoding.inflateArr(tokens.getBinaryEncodedTokensMap(), tokens.getBinaryEncodedTokens());
            return this.colorizeLine(content, inflatedTokens, tabSize);
        };
        return Colorizer;
    }());
    exports.Colorizer = Colorizer;
    function actualColorize(lines, mode, tabSize) {
        var tokenization = mode.tokenizationSupport, html = [], state = tokenization.getInitialState(), i, length, line, tokenizeResult, renderResult, retokenize = [];
        for (i = 0, length = lines.length; i < length; i++) {
            line = lines[i];
            tokenizeResult = tokenization.tokenize(line, state);
            if (tokenizeResult.retokenize) {
                retokenize.push(tokenizeResult.retokenize);
            }
            renderResult = viewLineRenderer_1.renderLine(new viewLineRenderer_1.RenderLineInput(line, tabSize, 0, -1, false, tokenizeResult.tokens.map(function (t) { return new editorCommon_1.ViewLineToken(t.startIndex, t.type); })));
            html = html.concat(renderResult.output);
            html.push('<br/>');
            state = tokenizeResult.endState;
        }
        return {
            result: html.join(''),
            retokenize: retokenize
        };
    }
});
