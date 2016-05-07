define(["require", "exports", 'assert', 'vs/base/browser/htmlContentRenderer'], function (require, exports, assert, htmlContentRenderer_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('HtmlContent', function () {
        test('render text', function () {
            var result = htmlContentRenderer_1.renderHtml({
                text: 'testing',
                isText: true
            });
            assert.strictEqual(result.nodeType, document.TEXT_NODE);
        });
        test('cannot render script tag', function () {
            var host = document.createElement('div');
            document.body.appendChild(host);
            host.appendChild(htmlContentRenderer_1.renderHtml({
                tagName: 'script',
                text: 'alert(\'owned -- injected script tag via htmlContent!\')'
            }));
            assert(true);
            document.body.removeChild(host);
        });
        test('render simple element', function () {
            var result = htmlContentRenderer_1.renderHtml({
                text: 'testing'
            });
            assert.strictEqual(result.nodeType, document.ELEMENT_NODE);
            assert.strictEqual(result.textContent, 'testing');
            assert.strictEqual(result.tagName, 'DIV');
        });
        test('render element with class', function () {
            var result = htmlContentRenderer_1.renderHtml({
                text: 'testing',
                className: 'testClass'
            });
            assert.strictEqual(result.nodeType, document.ELEMENT_NODE);
            assert.strictEqual(result.className, 'testClass');
        });
        test('render element with style', function () {
            var result = htmlContentRenderer_1.renderHtml({
                text: 'testing',
                style: 'width: 100px;'
            });
            assert.strictEqual(result.getAttribute('style'), 'width: 100px;');
        });
        test('render element with custom style', function () {
            var result = htmlContentRenderer_1.renderHtml({
                text: 'testing',
                customStyle: {
                    'width': '100px'
                }
            });
            assert.strictEqual(result.style.width, '100px');
        });
        test('render element with children', function () {
            var result = htmlContentRenderer_1.renderHtml({
                className: 'parent',
                children: [{
                        text: 'child'
                    }]
            });
            assert.strictEqual(result.children.length, 1);
            assert.strictEqual(result.className, 'parent');
            assert.strictEqual(result.firstChild.textContent, 'child');
        });
        test('simple formatting', function () {
            var result = htmlContentRenderer_1.renderHtml({
                formattedText: '**bold**'
            });
            assert.strictEqual(result.children.length, 1);
            assert.strictEqual(result.firstChild.textContent, 'bold');
            assert.strictEqual(result.firstChild.tagName, 'B');
            assert.strictEqual(result.innerHTML, '<b>bold</b>');
            result = htmlContentRenderer_1.renderHtml({
                formattedText: '__italics__'
            });
            assert.strictEqual(result.innerHTML, '<i>italics</i>');
            result = htmlContentRenderer_1.renderHtml({
                formattedText: 'this string has **bold** and __italics__'
            });
            assert.strictEqual(result.innerHTML, 'this string has <b>bold</b> and <i>italics</i>');
        });
        test('no formatting', function () {
            var result = htmlContentRenderer_1.renderHtml({
                formattedText: 'this is just a string'
            });
            assert.strictEqual(result.innerHTML, 'this is just a string');
        });
        test('preserve newlines', function () {
            var result = htmlContentRenderer_1.renderHtml({
                formattedText: 'line one\nline two'
            });
            assert.strictEqual(result.innerHTML, 'line one<br>line two');
        });
        test('action', function () {
            var callbackCalled = false;
            var result = htmlContentRenderer_1.renderHtml({
                formattedText: '[[action]]'
            }, {
                actionCallback: function (content) {
                    assert.strictEqual(content, '0');
                    callbackCalled = true;
                }
            });
            assert.strictEqual(result.innerHTML, '<a href="#">action</a>');
            var event = document.createEvent('MouseEvent');
            event.initEvent('click', true, true);
            result.firstChild.dispatchEvent(event);
            assert.strictEqual(callbackCalled, true);
        });
        test('fancy action', function () {
            var callbackCalled = false;
            var result = htmlContentRenderer_1.renderHtml({
                formattedText: '__**[[action]]**__'
            }, {
                actionCallback: function (content) {
                    assert.strictEqual(content, '0');
                    callbackCalled = true;
                }
            });
            assert.strictEqual(result.innerHTML, '<i><b><a href="#">action</a></b></i>');
            var event = document.createEvent('MouseEvent');
            event.initEvent('click', true, true);
            result.firstChild.firstChild.firstChild.dispatchEvent(event);
            assert.strictEqual(callbackCalled, true);
        });
        test('escaped formatting', function () {
            var result = htmlContentRenderer_1.renderHtml({
                formattedText: '\\*\\*bold\\*\\*'
            });
            assert.strictEqual(result.children.length, 0);
            assert.strictEqual(result.innerHTML, '**bold**');
        });
    });
});
//# sourceMappingURL=htmlContent.test.js.map