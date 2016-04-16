/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/platform/platform', 'vs/workbench/browser/viewlet', 'vs/base/common/types'], function (require, exports, assert, Platform, viewlet_1, Types) {
    'use strict';
    suite('Workbench Viewlet', function () {
        test('ViewletDescriptor API', function () {
            var d = new viewlet_1.ViewletDescriptor('moduleId', 'ctorName', 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            assert.strictEqual(d.cssClass, 'class');
            assert.strictEqual(d.order, 5);
        });
        test('Editor Aware ViewletDescriptor API', function () {
            var d = new viewlet_1.ViewletDescriptor('moduleId', 'ctorName', 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            d = new viewlet_1.ViewletDescriptor('moduleId', 'ctorName', 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
        });
        test('Viewlet extension point and registration', function () {
            assert(Types.isFunction(Platform.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet));
            assert(Types.isFunction(Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlet));
            assert(Types.isFunction(Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets));
            var oldCount = Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets().length;
            var d = new viewlet_1.ViewletDescriptor('moduleId', 'ctorName', 'reg-test-id', 'name');
            Platform.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet(d);
            assert(d === Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlet('reg-test-id'));
            assert.equal(oldCount + 1, Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets().length);
        });
    });
});
//# sourceMappingURL=viewlet.test.js.map