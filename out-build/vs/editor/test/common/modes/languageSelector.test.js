/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/editor/common/modes/languageSelector'], function (require, exports, assert, uri_1, languageSelector_1) {
    'use strict';
    suite('LanguageSelector', function () {
        var model = {
            language: 'farboo',
            uri: uri_1.default.parse('file:///testbed/file.fb')
        };
        test('score, invalid selector', function () {
            assert.equal(languageSelector_1.score({}, model.uri, model.language), 0);
            assert.equal(languageSelector_1.score(undefined, model.uri, model.language), undefined);
            assert.equal(languageSelector_1.score(null, model.uri, model.language), undefined);
            assert.equal(languageSelector_1.score('', model.uri, model.language), 0);
        });
        test('score, any language', function () {
            assert.equal(languageSelector_1.score({ language: '*' }, model.uri, model.language), 5);
            assert.equal(languageSelector_1.score('*', model.uri, model.language), 5);
        });
        test('score, filter', function () {
            assert.equal(languageSelector_1.score('farboo', model.uri, model.language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo' }, model.uri, model.language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo', scheme: 'file' }, model.uri, model.language), 20);
            assert.equal(languageSelector_1.score({ language: 'farboo', scheme: 'http' }, model.uri, model.language), 0);
            assert.equal(languageSelector_1.score({ pattern: '**/*.fb' }, model.uri, model.language), 5);
            // assert.equal(score({ pattern: '/testbed/file.fb' }, model.uri, model.language), 10); fails on windows
        });
        test('score, max(filters)', function () {
            var match = { language: 'farboo', scheme: 'file' };
            var fail = { language: 'farboo', scheme: 'http' };
            assert.equal(languageSelector_1.score(match, model.uri, model.language), 20);
            assert.equal(languageSelector_1.score(fail, model.uri, model.language), 0);
            assert.equal(languageSelector_1.score([match, fail], model.uri, model.language), 20);
            assert.equal(languageSelector_1.score(['farboo', '*'], model.uri, model.language), 10);
            assert.equal(languageSelector_1.score(['*', 'farboo'], model.uri, model.language), 10);
        });
    });
});
//# sourceMappingURL=languageSelector.test.js.map