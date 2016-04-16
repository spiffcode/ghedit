define(["require", "exports", 'assert', 'vs/base/common/filters'], function (require, exports, assert, filters_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function filterOk(filter, word, wordToMatchAgainst, highlights) {
        var r = filter(word, wordToMatchAgainst);
        assert(r);
        if (highlights) {
            assert.deepEqual(r, highlights);
        }
    }
    function filterNotOk(filter, word, suggestion) {
        assert(!filter(word, suggestion));
    }
    suite('Filters', function () {
        test('or', function () {
            var filter, counters;
            var newFilter = function (i, r) {
                return function () { counters[i]++; return r; };
            };
            counters = [0, 0];
            filter = filters_1.or(newFilter(0, false), newFilter(1, false));
            filterNotOk(filter, 'anything', 'anything');
            assert.deepEqual(counters, [1, 1]);
            counters = [0, 0];
            filter = filters_1.or(newFilter(0, true), newFilter(1, false));
            filterOk(filter, 'anything', 'anything');
            assert.deepEqual(counters, [1, 0]);
            counters = [0, 0];
            filter = filters_1.or(newFilter(0, true), newFilter(1, true));
            filterOk(filter, 'anything', 'anything');
            assert.deepEqual(counters, [1, 0]);
            counters = [0, 0];
            filter = filters_1.or(newFilter(0, false), newFilter(1, true));
            filterOk(filter, 'anything', 'anything');
            assert.deepEqual(counters, [1, 1]);
        });
        test('PrefixFilter - case sensitive', function () {
            filterNotOk(filters_1.matchesStrictPrefix, '', '');
            filterOk(filters_1.matchesStrictPrefix, '', 'anything', []);
            filterOk(filters_1.matchesStrictPrefix, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesStrictPrefix, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesStrictPrefix, 'alpha', 'alp');
            filterOk(filters_1.matchesStrictPrefix, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesStrictPrefix, 'x', 'alpha');
            filterNotOk(filters_1.matchesStrictPrefix, 'A', 'alpha');
            filterNotOk(filters_1.matchesStrictPrefix, 'AlPh', 'alPHA');
        });
        test('PrefixFilter - ignore case', function () {
            filterOk(filters_1.matchesPrefix, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesPrefix, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesPrefix, 'alpha', 'alp');
            filterOk(filters_1.matchesPrefix, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesPrefix, 'x', 'alpha');
            filterOk(filters_1.matchesPrefix, 'A', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.matchesPrefix, 'AlPh', 'alPHA', [{ start: 0, end: 4 }]);
        });
        test('CamelCaseFilter', function () {
            filterNotOk(filters_1.matchesCamelCase, '', '');
            filterOk(filters_1.matchesCamelCase, '', 'anything', []);
            filterOk(filters_1.matchesCamelCase, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesCamelCase, 'AlPhA', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesCamelCase, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesCamelCase, 'alpha', 'alp');
            filterOk(filters_1.matchesCamelCase, 'c', 'CamelCaseRocks', [
                { start: 0, end: 1 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cc', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 6 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'ccr', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 6 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cacr', 'CamelCaseRocks', [
                { start: 0, end: 2 },
                { start: 5, end: 6 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cacar', 'CamelCaseRocks', [
                { start: 0, end: 2 },
                { start: 5, end: 7 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'ccarocks', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 7 },
                { start: 9, end: 14 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cr', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fba', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbar', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 6 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbara', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 7 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbaa', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 },
                { start: 6, end: 7 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbaab', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 },
                { start: 6, end: 8 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'c2d', 'canvasCreation2D', [
                { start: 0, end: 1 },
                { start: 14, end: 16 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cce', '_canvasCreationEvent', [
                { start: 1, end: 2 },
                { start: 7, end: 8 },
                { start: 15, end: 16 }
            ]);
        });
        test('CamelCaseFilter - #19256', function () {
            assert(filters_1.matchesCamelCase('Debug Console', 'Open: Debug Console'));
            assert(filters_1.matchesCamelCase('Debug console', 'Open: Debug Console'));
            assert(filters_1.matchesCamelCase('debug console', 'Open: Debug Console'));
        });
        test('matchesContiguousSubString', function () {
            filterOk(filters_1.matchesContiguousSubString, 'cela', 'cancelAnimationFrame()', [
                { start: 3, end: 7 }
            ]);
        });
        test('matchesSubString', function () {
            filterOk(filters_1.matchesSubString, 'cmm', 'cancelAnimationFrame()', [
                { start: 0, end: 1 },
                { start: 9, end: 10 },
                { start: 18, end: 19 }
            ]);
        });
        test('WordFilter', function () {
            filterOk(filters_1.matchesWords, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesWords, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesWords, 'alpha', 'alp');
            filterOk(filters_1.matchesWords, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesWords, 'x', 'alpha');
            filterOk(filters_1.matchesWords, 'A', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.matchesWords, 'AlPh', 'alPHA', [{ start: 0, end: 4 }]);
            assert(filters_1.matchesWords('Debug Console', 'Open: Debug Console'));
            filterOk(filters_1.matchesWords, 'gp', 'Git: Pull', [{ start: 0, end: 1 }, { start: 5, end: 6 }]);
            filterOk(filters_1.matchesWords, 'g p', 'Git: Pull', [{ start: 0, end: 1 }, { start: 4, end: 6 }]);
            filterOk(filters_1.matchesWords, 'gipu', 'Git: Pull', [{ start: 0, end: 2 }, { start: 5, end: 7 }]);
            filterOk(filters_1.matchesWords, 'gp', 'Category: Git: Pull', [{ start: 10, end: 11 }, { start: 15, end: 16 }]);
            filterOk(filters_1.matchesWords, 'g p', 'Category: Git: Pull', [{ start: 10, end: 11 }, { start: 14, end: 16 }]);
            filterOk(filters_1.matchesWords, 'gipu', 'Category: Git: Pull', [{ start: 10, end: 12 }, { start: 15, end: 17 }]);
            filterNotOk(filters_1.matchesWords, 'it', 'Git: Pull');
            filterNotOk(filters_1.matchesWords, 'll', 'Git: Pull');
            filterOk(filters_1.matchesWords, 'git: プル', 'git: プル', [{ start: 0, end: 7 }]);
            filterOk(filters_1.matchesWords, 'git プル', 'git: プル', [{ start: 0, end: 3 }, { start: 4, end: 7 }]);
            filterOk(filters_1.matchesWords, 'öäk', 'Öhm: Älles Klar', [{ start: 0, end: 1 }, { start: 5, end: 6 }, { start: 11, end: 12 }]);
        });
    });
});
//# sourceMappingURL=filters.test.js.map