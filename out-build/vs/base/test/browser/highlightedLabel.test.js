define(["require", "exports", 'assert', 'vs/base/browser/ui/highlightedlabel/highlightedLabel'], function (require, exports, assert, highlightedLabel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('HighlightedLabel', function () {
        var label;
        setup(function () {
            label = new highlightedLabel_1.HighlightedLabel(document.createElement('div'));
        });
        teardown(function () {
            label.dispose();
            label = null;
        });
        test('empty label', function () {
            assert.equal(label.element.innerHTML, '');
        });
        test('no decorations', function () {
            label.set('hello');
            assert.equal(label.element.innerHTML, '<span>hello</span>');
        });
        test('escape html', function () {
            label.set('hel<lo');
            assert.equal(label.element.innerHTML, '<span>hel&lt;lo</span>');
        });
        test('everything highlighted', function () {
            label.set('hello', [{ start: 0, end: 5 }]);
            assert.equal(label.element.innerHTML, '<span class="highlight">hello</span>');
        });
        test('beginning highlighted', function () {
            label.set('hellothere', [{ start: 0, end: 5 }]);
            assert.equal(label.element.innerHTML, '<span class="highlight">hello</span><span>there</span>');
        });
        test('ending highlighted', function () {
            label.set('goodbye', [{ start: 4, end: 7 }]);
            assert.equal(label.element.innerHTML, '<span>good</span><span class="highlight">bye</span>');
        });
        test('middle highlighted', function () {
            label.set('foobarfoo', [{ start: 3, end: 6 }]);
            assert.equal(label.element.innerHTML, '<span>foo</span><span class="highlight">bar</span><span>foo</span>');
        });
    });
});
//# sourceMappingURL=highlightedLabel.test.js.map