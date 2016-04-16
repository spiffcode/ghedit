/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/objects', 'vs/platform/storage/common/storage', 'vs/workbench/test/browser/servicesTestUtils', 'vs/workbench/common/storage'], function (require, exports, assert, objects_1, storage_1, servicesTestUtils_1, storage_2) {
    'use strict';
    suite('Workbench Storage', function () {
        test('Store Data', function () {
            var context = new servicesTestUtils_1.TestContextService();
            var s = new storage_2.Storage(context, new storage_2.InMemoryLocalStorage());
            var counter = 0;
            var unbind = s.addListener(storage_1.StorageEventType.STORAGE, function (e) {
                assert.strictEqual(e.key, 'Monaco.IDE.Core.Storage.Test.store');
                assert.strictEqual(e.oldValue, null);
                assert.strictEqual(e.newValue, 'foobar');
                counter++;
                assert(counter <= 1);
            });
            s.store('Monaco.IDE.Core.Storage.Test.store', 'foobar');
            s.store('Monaco.IDE.Core.Storage.Test.store', 'foobar');
            unbind();
            counter = 0;
            unbind = s.addListener(storage_1.StorageEventType.STORAGE, function (e) {
                assert.strictEqual(e.key, 'Monaco.IDE.Core.Storage.Test.store');
                assert.strictEqual(e.oldValue, 'foobar');
                assert.strictEqual(e.newValue, 'barfoo');
                counter++;
                assert(counter <= 1);
            });
            s.store('Monaco.IDE.Core.Storage.Test.store', 'barfoo');
            s.store('Monaco.IDE.Core.Storage.Test.store', 'barfoo');
            unbind();
            s.dispose();
        });
        test('Swap Data', function () {
            var context = new servicesTestUtils_1.TestContextService();
            var s = new storage_2.Storage(context, new storage_2.InMemoryLocalStorage());
            var counter = 0;
            var unbind = s.addListener(storage_1.StorageEventType.STORAGE, function (e) {
                assert.strictEqual(e.key, 'Monaco.IDE.Core.Storage.Test.swap');
                assert.strictEqual(e.oldValue, null);
                assert.strictEqual(e.newValue, 'foobar');
                counter++;
                assert(counter <= 1);
            });
            s.swap('Monaco.IDE.Core.Storage.Test.swap', 'foobar', 'barfoo', storage_1.StorageScope.GLOBAL, 'foobar');
            unbind();
            counter = 0;
            unbind = s.addListener(storage_1.StorageEventType.STORAGE, function (e) {
                assert.strictEqual(e.key, 'Monaco.IDE.Core.Storage.Test.swap');
                assert.strictEqual(e.oldValue, 'foobar');
                assert.strictEqual(e.newValue, 'barfoo');
                counter++;
                assert(counter <= 1);
            });
            s.swap('Monaco.IDE.Core.Storage.Test.swap', 'foobar', 'barfoo', storage_1.StorageScope.GLOBAL, 'foobar');
            unbind();
        });
        test('Swap Data with undefined default value', function () {
            var context = new servicesTestUtils_1.TestContextService();
            var s = new storage_2.Storage(context, new storage_2.InMemoryLocalStorage());
            s.swap('Monaco.IDE.Core.Storage.Test.swap', 'foobar', 'barfoo');
            assert.strictEqual('foobar', s.get('Monaco.IDE.Core.Storage.Test.swap'));
            s.swap('Monaco.IDE.Core.Storage.Test.swap', 'foobar', 'barfoo');
            assert.strictEqual('barfoo', s.get('Monaco.IDE.Core.Storage.Test.swap'));
            s.swap('Monaco.IDE.Core.Storage.Test.swap', 'foobar', 'barfoo');
            assert.strictEqual('foobar', s.get('Monaco.IDE.Core.Storage.Test.swap'));
        });
        test('Remove Data', function () {
            var context = new servicesTestUtils_1.TestContextService();
            var s = new storage_2.Storage(context, new storage_2.InMemoryLocalStorage());
            var counter = 0;
            var unbind = s.addListener(storage_1.StorageEventType.STORAGE, function (e) {
                assert.strictEqual(e.key, 'Monaco.IDE.Core.Storage.Test.remove');
                assert.strictEqual(e.oldValue, null);
                assert.strictEqual(e.newValue, 'foobar');
                counter++;
                assert(counter <= 1);
            });
            s.store('Monaco.IDE.Core.Storage.Test.remove', 'foobar');
            unbind();
            counter = 0;
            unbind = s.addListener(storage_1.StorageEventType.STORAGE, function (e) {
                assert.strictEqual(e.key, 'Monaco.IDE.Core.Storage.Test.remove');
                assert.strictEqual(e.oldValue, 'foobar');
                assert.strictEqual(e.newValue, null);
                counter++;
                assert(counter <= 1);
            });
            s.remove('Monaco.IDE.Core.Storage.Test.remove');
            unbind();
        });
        test('Get Data, Integer, Boolean', function () {
            var context = new servicesTestUtils_1.TestContextService();
            var s = new storage_2.Storage(context, new storage_2.InMemoryLocalStorage());
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.get', storage_1.StorageScope.GLOBAL, 'foobar'), 'foobar');
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.get', storage_1.StorageScope.GLOBAL, ''), '');
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getInteger', storage_1.StorageScope.GLOBAL, 5), 5);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getInteger', storage_1.StorageScope.GLOBAL, 0), 0);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getBoolean', storage_1.StorageScope.GLOBAL, true), true);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getBoolean', storage_1.StorageScope.GLOBAL, false), false);
            s.store('Monaco.IDE.Core.Storage.Test.get', 'foobar');
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.get'), 'foobar');
            s.store('Monaco.IDE.Core.Storage.Test.get', '');
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.get'), '');
            s.store('Monaco.IDE.Core.Storage.Test.getInteger', 5);
            assert.strictEqual(s.getInteger('Monaco.IDE.Core.Storage.Test.getInteger'), 5);
            s.store('Monaco.IDE.Core.Storage.Test.getInteger', 0);
            assert.strictEqual(s.getInteger('Monaco.IDE.Core.Storage.Test.getInteger'), 0);
            s.store('Monaco.IDE.Core.Storage.Test.getBoolean', true);
            assert.strictEqual(s.getBoolean('Monaco.IDE.Core.Storage.Test.getBoolean'), true);
            s.store('Monaco.IDE.Core.Storage.Test.getBoolean', false);
            assert.strictEqual(s.getBoolean('Monaco.IDE.Core.Storage.Test.getBoolean'), false);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getDefault', storage_1.StorageScope.GLOBAL, 'getDefault'), 'getDefault');
            assert.strictEqual(s.getInteger('Monaco.IDE.Core.Storage.Test.getIntegerDefault', storage_1.StorageScope.GLOBAL, 5), 5);
            assert.strictEqual(s.getBoolean('Monaco.IDE.Core.Storage.Test.getBooleanDefault', storage_1.StorageScope.GLOBAL, true), true);
        });
        test('Storage cleans up when workspace changes', function () {
            var storageImpl = new storage_2.InMemoryLocalStorage();
            var context = new servicesTestUtils_1.TestContextService();
            var s = new storage_2.Storage(context, storageImpl);
            s.store('key1', 'foobar');
            s.store('key2', 'something');
            s.store('wkey1', 'foo', storage_1.StorageScope.WORKSPACE);
            s.store('wkey2', 'foo2', storage_1.StorageScope.WORKSPACE);
            s = new storage_2.Storage(context, storageImpl);
            assert.strictEqual(s.get('key1', storage_1.StorageScope.GLOBAL), 'foobar');
            assert.strictEqual(s.get('key1', storage_1.StorageScope.WORKSPACE, null), null);
            assert.strictEqual(s.get('key2', storage_1.StorageScope.GLOBAL), 'something');
            assert.strictEqual(s.get('wkey1', storage_1.StorageScope.WORKSPACE), 'foo');
            assert.strictEqual(s.get('wkey2', storage_1.StorageScope.WORKSPACE), 'foo2');
            var ws = objects_1.clone(servicesTestUtils_1.TestWorkspace);
            ws.uid = new Date().getTime() + 100;
            context = new servicesTestUtils_1.TestContextService(ws);
            s = new storage_2.Storage(context, storageImpl);
            assert.strictEqual(s.get('key1', storage_1.StorageScope.GLOBAL), 'foobar');
            assert.strictEqual(s.get('key1', storage_1.StorageScope.WORKSPACE, null), null);
            assert.strictEqual(s.get('key2', storage_1.StorageScope.GLOBAL), 'something');
            assert(!s.get('wkey1', storage_1.StorageScope.WORKSPACE));
            assert(!s.get('wkey2', storage_1.StorageScope.WORKSPACE));
        });
    });
});
//# sourceMappingURL=storage.test.js.map