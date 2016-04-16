define(["require", "exports", 'assert', 'vs/base/common/assert'], function (require, exports, assert, assert_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Assert', function () {
        test('ok', function () {
            assert.throws(function () {
                assert_1.ok(false);
            });
            assert.throws(function () {
                assert_1.ok(null);
            });
            assert.throws(function () {
                assert_1.ok();
            });
            assert.throws(function () {
                assert_1.ok(null, 'Foo Bar');
            }, function (e) {
                return e.message.indexOf('Foo Bar') >= 0;
            });
            assert_1.ok(true);
            assert_1.ok('foo');
            assert_1.ok({});
            assert_1.ok(5);
        });
    });
});
//# sourceMappingURL=assert.test.js.map