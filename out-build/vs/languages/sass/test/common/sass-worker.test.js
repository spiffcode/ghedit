define(["require", "exports", 'assert', 'vs/editor/common/model/mirrorModel', 'vs/languages/sass/common/sassWorker', 'vs/base/common/uri', 'vs/editor/common/services/resourceServiceImpl', 'vs/base/common/winjs.base', 'vs/editor/test/common/servicesTestUtils', 'vs/editor/test/common/modesTestUtils'], function (require, exports, assert, mm, sassWorker, uri_1, ResourceService, WinJS, servicesUtil2, modesUtil) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('SASS - Worker', function () {
        var mockSASSWorkerEnv = function (url, content) {
            var resourceService = new ResourceService.ResourceService();
            var model = mm.createTestMirrorModelFromString(content, modesUtil.createMockMode('mock.mode.id', /(#?-?\d*\.\d\w*%?)|([$@#!]?[\w-?]+%?)|[$@#!]/g), url);
            resourceService.insert(url, model);
            var services = servicesUtil2.createMockEditorWorkerServices({
                resourceService: resourceService,
            });
            var worker = new sassWorker.SassWorker('mock.mode.id', services.resourceService, services.markerService);
            return { worker: worker, model: model };
        };
        var testSuggestionsFor = function (value, stringBefore) {
            var url = uri_1.default.parse('test://1');
            var env = mockSASSWorkerEnv(url, value);
            var idx = stringBefore ? value.indexOf(stringBefore) + stringBefore.length : 0;
            var position = env.model.getPositionFromOffset(idx);
            return env.worker.suggest(url, position).then(function (result) { return result[0]; });
        };
        var testValueSetFor = function (value, selection, selectionLength, up) {
            var url = uri_1.default.parse('test://1');
            var env = mockSASSWorkerEnv(url, value);
            var pos = env.model.getPositionFromOffset(value.indexOf(selection));
            var range = { startLineNumber: pos.lineNumber, startColumn: pos.column, endLineNumber: pos.lineNumber, endColumn: pos.column + selectionLength };
            return env.worker.navigateValueSet(url, range, up);
        };
        var testOccurrences = function (value, tokenBefore) {
            var url = uri_1.default.parse('test://1');
            var env = mockSASSWorkerEnv(url, value);
            var pos = env.model.getPositionFromOffset(value.indexOf(tokenBefore) + tokenBefore.length);
            return env.worker.findOccurrences(url, pos).then(function (occurrences) { return { occurrences: occurrences, model: env.model }; });
        };
        var assertSuggestion = function (completion, label, type) {
            var proposalsFound = completion.suggestions.filter(function (suggestion) {
                return suggestion.label === label && (!type || suggestion.type === type);
            });
            if (proposalsFound.length != 1) {
                assert.fail("Suggestion not found: " + label + ", has " + completion.suggestions.map(function (s) { return s.label; }).join(', '));
            }
        };
        var assertReplaceResult = function (result, expected) {
            assert.equal(result.value, expected);
        };
        var assertOccurrences = function (occurrences, model, expectedNumber, expectedContent) {
            assert.equal(occurrences.length, expectedNumber);
            occurrences.forEach(function (occurrence) {
                assert.equal(model.getValueInRange(occurrence.range), expectedContent);
            });
        };
        test('Intellisense Sass', function (testDone) {
            WinJS.Promise.join([
                testSuggestionsFor('$i: 0; body { width: ', 'width: ').then(function (completion) {
                    assert.equal(completion.currentWord, '');
                    assertSuggestion(completion, '$i');
                }),
                testSuggestionsFor('@for $i from 1 to 3 { $', '{ $').then(function (completion) {
                    assert.equal(completion.currentWord, '$');
                    assertSuggestion(completion, '$i');
                }),
                testSuggestionsFor('@for $i from 1 through 3 { .item-#{$i} { width: 2em * $i; } }', '.item-#{').then(function (completion) {
                    assert.equal(completion.currentWord, '');
                    assertSuggestion(completion, '$i');
                }),
                testSuggestionsFor('.foo { background-color: d', 'background-color: d').then(function (completion) {
                    assert.equal(completion.currentWord, 'd');
                    assertSuggestion(completion, 'darken');
                    assertSuggestion(completion, 'desaturate');
                }),
                testSuggestionsFor('@function foo($x, $y) { @return $x + $y; } .foo { background-color: f', 'background-color: f').then(function (completion) {
                    assert.equal(completion.currentWord, 'f');
                    assertSuggestion(completion, 'foo');
                }),
                testSuggestionsFor('.foo { di span { } ', 'di').then(function (completion) {
                    assert.equal(completion.currentWord, 'di');
                    assertSuggestion(completion, 'display');
                    assertSuggestion(completion, 'div');
                }),
                testSuggestionsFor('.foo { .', '{ .').then(function (completion) {
                    assert.equal(completion.currentWord, '');
                    assertSuggestion(completion, '.foo');
                }),
                // issue #250
                testSuggestionsFor('.foo { display: block;', 'block;').then(function (completion) {
                    assert.equal(completion.currentWord, '');
                    assert.equal(0, completion.suggestions.length);
                })
            ]).done(function () { return testDone(); }, function (errors) {
                testDone(errors.reduce(function (e1, e2) { return e1 || e2; }));
            });
        });
        test('Sass Value sets', function (testDone) {
            WinJS.Promise.join([
                testValueSetFor('@mixin foo { display: inline }', 'inline', 6, false).then(function (result) {
                    assertReplaceResult(result, 'flex');
                }),
                testValueSetFor('@mixin foo($i) { display: flex }', 'flex', 7, true).then(function (result) {
                    assertReplaceResult(result, 'inline');
                }),
                testValueSetFor('.foo { .bar { display: inline } }', 'inline', 0, false).then(function (result) {
                    assertReplaceResult(result, 'flex');
                }),
                testValueSetFor('@mixin foo { display: inline }', 'line', 0, false).then(function (result) {
                    assertReplaceResult(result, 'flex');
                }),
                testValueSetFor('@mixin foo { display: inline }', 'display', 0, false).then(function (result) {
                    assert.ok(!result);
                })
            ]).done(function () { return testDone(); }, function (errors) {
                testDone(errors.reduce(function (e1, e2) { return e1 || e2; }));
            });
        });
        test('Sass Occurrences', function (testDone) {
            WinJS.Promise.join([
                testOccurrences('@mixin /*here*/foo { display: inline } foo { @include foo; }', '/*here*/').then(function (result) {
                    assertOccurrences(result.occurrences, result.model, 2, 'foo');
                }),
                testOccurrences('@mixin foo { display: inline } foo { @include /*here*/foo; }', '/*here*/').then(function (result) {
                    assertOccurrences(result.occurrences, result.model, 2, 'foo');
                }),
                testOccurrences('@mixin foo { display: inline } /*here*/foo { @include foo; }', '/*here*/').then(function (result) {
                    assertOccurrences(result.occurrences, result.model, 1, 'foo');
                }),
                testOccurrences('@function /*here*/foo($i) { @return $i*$i; } #foo { width: foo(2); }', '/*here*/').then(function (result) {
                    assertOccurrences(result.occurrences, result.model, 2, 'foo');
                }),
                testOccurrences('@function foo($i) { @return $i*$i; } #foo { width: /*here*/foo(2); }', '/*here*/').then(function (result) {
                    assertOccurrences(result.occurrences, result.model, 2, 'foo');
                }),
            ]).done(function () { return testDone(); }, function (errors) {
                testDone(errors.reduce(function (e1, e2) { return e1 || e2; }));
            });
        });
    });
});
//# sourceMappingURL=sass-worker.test.js.map