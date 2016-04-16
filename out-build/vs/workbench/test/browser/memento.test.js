/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/platform/workspace/common/baseWorkspaceContextService', 'vs/platform/storage/common/storage', 'vs/workbench/test/browser/servicesTestUtils', 'vs/workbench/common/memento', 'vs/workbench/common/storage'], function (require, exports, assert, baseWorkspaceContextService_1, storage_1, TestUtils, memento_1, storage_2) {
    'use strict';
    suite('Workbench Memento', function () {
        var context;
        var storage;
        setup(function () {
            context = new baseWorkspaceContextService_1.BaseWorkspaceContextService(TestUtils.TestWorkspace, TestUtils.TestConfiguration, null);
            storage = new storage_2.Storage(context, new storage_2.InMemoryLocalStorage());
        });
        test('Loading and Saving Memento with Scopes', function () {
            var myMemento = new memento_1.Memento('memento.test');
            // Global
            var memento = myMemento.getMemento(storage);
            memento.foo = [1, 2, 3];
            var globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.foo = 'Hello World';
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage);
            assert.deepEqual(memento, { foo: [1, 2, 3] });
            globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'Hello World' });
            // Assert the Mementos are stored properly in storage
            assert.deepEqual(JSON.parse(storage.get('memento/memento.test')), { foo: [1, 2, 3] });
            assert.deepEqual(JSON.parse(storage.get('memento/memento.test', storage_1.StorageScope.WORKSPACE)), { foo: 'Hello World' });
            // Delete Global
            memento = myMemento.getMemento(storage, context);
            delete memento.foo;
            // Delete Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            delete memento.foo;
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, {});
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, {});
            // Assert the Mementos are also removed from storage
            assert.strictEqual(storage.get('memento/memento.test', memento_1.Scope.GLOBAL, null), null);
            assert.strictEqual(storage.get('memento/memento.test', memento_1.Scope.WORKSPACE, null), null);
        });
        test('Save and Load', function () {
            var myMemento = new memento_1.Memento('memento.test');
            // Global
            var memento = myMemento.getMemento(storage, context);
            memento.foo = [1, 2, 3];
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.foo = 'Hello World';
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, { foo: [1, 2, 3] });
            var globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'Hello World' });
            // Global
            memento = myMemento.getMemento(storage, context);
            memento.foo = [4, 5, 6];
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.foo = 'World Hello';
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, { foo: [4, 5, 6] });
            globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'World Hello' });
            // Delete Global
            memento = myMemento.getMemento(storage, context);
            delete memento.foo;
            // Delete Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            delete memento.foo;
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, {});
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, {});
        });
        test('Save and Load - 2 Components with same id', function () {
            var myMemento = new memento_1.Memento('memento.test');
            var myMemento2 = new memento_1.Memento('memento.test');
            // Global
            var memento = myMemento.getMemento(storage, context);
            memento.foo = [1, 2, 3];
            memento = myMemento2.getMemento(storage, context);
            memento.bar = [1, 2, 3];
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.foo = 'Hello World';
            memento = myMemento2.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.bar = 'Hello World';
            myMemento.saveMemento();
            myMemento2.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, { foo: [1, 2, 3], bar: [1, 2, 3] });
            var globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            memento = myMemento2.getMemento(storage, context);
            assert.deepEqual(memento, { foo: [1, 2, 3], bar: [1, 2, 3] });
            globalMemento = myMemento2.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'Hello World', bar: 'Hello World' });
            memento = myMemento2.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'Hello World', bar: 'Hello World' });
        });
    });
});
//# sourceMappingURL=memento.test.js.map