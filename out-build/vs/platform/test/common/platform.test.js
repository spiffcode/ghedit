define(["require", "exports", 'assert', 'vs/platform/platform', 'vs/base/common/types'], function (require, exports, assert, Platform, Types) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Platform / Registry', function () {
        test('registry - api', function () {
            assert.ok(Types.isFunction(Platform.Registry.add));
            assert.ok(Types.isFunction(Platform.Registry.as));
            assert.ok(Types.isFunction(Platform.Registry.knows));
        });
        test('registry - mixin', function () {
            Platform.Registry.add('foo', { bar: true });
            assert.ok(Platform.Registry.knows('foo'));
            assert.ok(Platform.Registry.as('foo').bar);
            assert.equal(Platform.Registry.as('foo').bar, true);
        });
        test('registry - knows, as', function () {
            var ext = {};
            Platform.Registry.add('knows,as', ext);
            assert.ok(Platform.Registry.knows('knows,as'));
            assert.ok(!Platform.Registry.knows('knows,as1234'));
            assert.ok(Platform.Registry.as('knows,as') === ext);
            assert.ok(Platform.Registry.as('knows,as1234') === null);
        });
        test('registry - mixin, fails on duplicate ids', function () {
            Platform.Registry.add('foo-dup', { bar: true });
            try {
                Platform.Registry.add('foo-dup', { bar: false });
                assert.ok(false);
            }
            catch (e) {
                assert.ok(true);
            }
        });
    });
});
//# sourceMappingURL=platform.test.js.map