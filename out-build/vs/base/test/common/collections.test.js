define(["require", "exports", 'assert', 'vs/base/common/collections'], function (require, exports, assert, collections) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Collections', function () {
        test('contains', function () {
            assert(!collections.contains({}, 'toString'));
            assert(collections.contains({ toString: 123 }, 'toString'));
            assert(!collections.contains(Object.create(null), 'toString'));
            var dict = Object.create(null);
            dict['toString'] = 123;
            assert(collections.contains(dict, 'toString'));
        });
        test('forEach', function () {
            collections.forEach({}, function () { return assert(false); });
            collections.forEach(Object.create(null), function () { return assert(false); });
            var count = 0;
            collections.forEach({ toString: 123 }, function () { return count++; });
            assert.equal(count, 1);
            count = 0;
            var dict = Object.create(null);
            dict['toString'] = 123;
            collections.forEach(dict, function () { return count++; });
            assert.equal(count, 1);
        });
        test('remove', function () {
            assert(collections.remove({ 'far': 1 }, 'far'));
            assert(!collections.remove({ 'far': 1 }, 'boo'));
        });
    });
});
//# sourceMappingURL=collections.test.js.map