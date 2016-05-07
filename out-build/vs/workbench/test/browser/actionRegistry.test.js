/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/platform/platform', 'vs/platform/actions/common/actions', 'vs/base/browser/ui/actionbar/actionbar', 'vs/workbench/common/actionRegistry', 'vs/workbench/browser/actionBarRegistry', 'vs/base/common/actions'], function (require, exports, assert, Platform, actions_1, actionbar_1, actionRegistry_1, actionBarRegistry_1, actions_2) {
    'use strict';
    var MyClass = (function (_super) {
        __extends(MyClass, _super);
        function MyClass(id, label) {
            _super.call(this, id, label);
        }
        return MyClass;
    }(actions_2.Action));
    suite('Workbench Action Registry', function () {
        test('Workbench Action Registration', function () {
            var Registry = Platform.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
            var d = new actions_1.SyncActionDescriptor(MyClass, 'id', 'name');
            var oldActions = Registry.getWorkbenchActions().slice(0);
            var oldCount = Registry.getWorkbenchActions().length;
            Registry.registerWorkbenchAction(d);
            Registry.registerWorkbenchAction(d);
            assert.equal(Registry.getWorkbenchActions().length, 1 + oldCount);
            assert.strictEqual(d, Registry.getWorkbenchAction('id'));
            Registry.setWorkbenchActions(oldActions);
        });
        test('Workbench Action Bar prepareActions()', function () {
            var a1 = new actionbar_1.Separator();
            var a2 = new actionbar_1.Separator();
            var a3 = new actions_2.Action('a3');
            var a4 = new actionbar_1.Separator();
            var a5 = new actionbar_1.Separator();
            var a6 = new actions_2.Action('a6');
            var a7 = new actionbar_1.Separator();
            var actions = actionBarRegistry_1.prepareActions([a1, a2, a3, a4, a5, a6, a7]);
            assert.strictEqual(actions.length, 3); // duplicate separators get removed
            assert(actions[0] === a3);
            assert(actions[1] === a5);
            assert(actions[2] === a6);
        });
    });
});
//# sourceMappingURL=actionRegistry.test.js.map