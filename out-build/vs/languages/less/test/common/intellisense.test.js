define(["require", "exports", 'assert', 'vs/editor/common/model/mirrorModel', 'vs/languages/less/common/lessWorker', 'vs/base/common/uri', 'vs/editor/common/services/resourceServiceImpl', 'vs/base/common/winjs.base', 'vs/editor/test/common/servicesTestUtils', 'vs/editor/test/common/modesTestUtils'], function (require, exports, assert, mm, lessWorker, uri_1, ResourceService, WinJS, servicesUtil2, modesUtil) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('LESS - Intellisense', function () {
        //------------ TEST suggestions ----------------
        var testSuggestionsFor = function (value, stringBefore) {
            var resourceService = new ResourceService.ResourceService();
            var url = uri_1.default.parse('test://1');
            resourceService.insert(url, mm.createTestMirrorModelFromString(value, modesUtil.createMockMode('mock.mode.id', /(-?\d*\.\d+)|([\w-]+)/g), url));
            var services = servicesUtil2.createMockEditorWorkerServices({
                resourceService: resourceService,
            });
            var worker = new lessWorker.LessWorker('mock.mode.id', services.resourceService, services.markerService);
            var position;
            if (stringBefore === null) {
                position = { column: 1, lineNumber: 1 };
            }
            else {
                var idx = value.indexOf(stringBefore);
                position = {
                    column: idx + stringBefore.length + 1,
                    lineNumber: 1
                };
            }
            return worker.suggest(url, position).then(function (result) { return result[0]; });
        };
        var assertSuggestion = function (completion, label) {
            var proposalsFound = completion.suggestions.filter(function (suggestion) {
                return suggestion.label === label;
            });
            if (proposalsFound.length != 1) {
                assert.fail("Suggestion not found: " + label + ", has " + completion.suggestions.map(function (s) { return s.label; }).join(', '));
            }
        };
        test('LESS - Intellisense', function (testDone) {
            WinJS.Promise.join([
                testSuggestionsFor('body { ', '{ ').then(function (completion) {
                    assert.equal(completion.currentWord, '');
                    assertSuggestion(completion, 'display');
                    assertSuggestion(completion, 'background');
                }),
                testSuggestionsFor('body { ver', 'ver').then(function (completion) {
                    assert.equal(completion.currentWord, 'ver');
                    assertSuggestion(completion, 'vertical-align');
                }),
                testSuggestionsFor('body { word-break: ', ': ').then(function (completion) {
                    assert.equal(completion.currentWord, '');
                    assertSuggestion(completion, 'keep-all');
                }),
                testSuggestionsFor('body { inner { vertical-align: }', ': ').then(function (completion) {
                    assert.equal(completion.currentWord, '');
                    assertSuggestion(completion, 'bottom');
                }),
                testSuggestionsFor('@var1: 3; body { inner { vertical-align: }', 'align: ').then(function (completion) {
                    assert.equal(completion.currentWord, '');
                    assertSuggestion(completion, '@var1');
                }),
                testSuggestionsFor('.foo { background-color: d', 'background-color: d').then(function (completion) {
                    assert.equal(completion.currentWord, 'd');
                    assertSuggestion(completion, 'darken');
                    assertSuggestion(completion, 'desaturate');
                })
            ]).done(function () { return testDone(); }, function (errors) {
                testDone(errors.reduce(function (e1, e2) { return e1 || e2; }));
            });
        });
    });
});
//# sourceMappingURL=intellisense.test.js.map