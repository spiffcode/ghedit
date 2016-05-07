define(["require", "exports", 'assert', 'vs/platform/configuration/common/model'], function (require, exports, assert, model) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('ConfigurationService - Model', function () {
        test('simple merge', function () {
            var base = { 'a': 1, 'b': 2 };
            model.merge(base, { 'a': 3, 'c': 4 }, true);
            assert.deepEqual(base, { 'a': 3, 'b': 2, 'c': 4 });
            base = { 'a': 1, 'b': 2 };
            model.merge(base, { 'a': 3, 'c': 4 }, false);
            assert.deepEqual(base, { 'a': 1, 'b': 2, 'c': 4 });
        });
        test('Recursive merge', function () {
            var base = { 'a': { 'b': 1 } };
            model.merge(base, { 'a': { 'b': 2 } }, true);
            assert.deepEqual(base, { 'a': { 'b': 2 } });
        });
        test('Test consolidate (settings)', function () {
            var config1 = {
                contents: {
                    awesome: true
                }
            };
            var config2 = {
                contents: {
                    awesome: false
                }
            };
            var expected = {
                awesome: false
            };
            assert.deepEqual(model.consolidate({ '.vscode/team.settings.json': config1, '.vscode/settings.json': config2 }).contents, expected);
            assert.deepEqual(model.consolidate({ 'settings.json': config2, 'team.settings.json': config1 }).contents, {});
            assert.deepEqual(model.consolidate({ '.vscode/team.settings.json': config1, '.vscode/settings.json': config2, '.vscode/team2.settings.json': config1 }).contents, expected);
        });
        test('Test consolidate (settings and tasks)', function () {
            var config1 = {
                contents: {
                    awesome: true
                }
            };
            var config2 = {
                contents: {
                    awesome: false
                }
            };
            var expected = {
                awesome: true,
                tasks: {
                    awesome: false
                }
            };
            assert.deepEqual(model.consolidate({ '.vscode/settings.json': config1, '.vscode/tasks.json': config2 }).contents, expected);
        });
    });
});
//# sourceMappingURL=model.test.js.map