/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/workbench/parts/debug/common/replHistory'], function (require, exports, assert, replHistory_1) {
    "use strict";
    suite('Debug - Repl History', function () {
        var history;
        setup(function () {
            history = new replHistory_1.ReplHistory(['one', 'two', 'three', 'four', 'five']);
        });
        teardown(function () {
            history = null;
        });
        test('previous and next', function () {
            assert.equal(history.previous(), 'five');
            assert.equal(history.previous(), 'four');
            assert.equal(history.previous(), 'three');
            assert.equal(history.previous(), 'two');
            assert.equal(history.previous(), 'one');
            assert.equal(history.previous(), null);
            assert.equal(history.next(), 'two');
            assert.equal(history.next(), 'three');
            assert.equal(history.next(), 'four');
            assert.equal(history.next(), 'five');
        });
        test('evaluated and remember', function () {
            history.evaluated('six');
            assert.equal(history.previous(), 'six');
            assert.equal(history.previous(), 'five');
            assert.equal(history.next(), 'six');
            history.remember('six++', true);
            assert.equal(history.next(), 'six++');
            assert.equal(history.previous(), 'six');
            history.evaluated('seven');
            assert.equal(history.previous(), 'seven');
            assert.equal(history.previous(), 'six');
        });
    });
});
//# sourceMappingURL=replHistory.test.js.map