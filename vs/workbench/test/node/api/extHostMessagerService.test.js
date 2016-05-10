/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/workbench/api/node/extHostMessageService'], function (require, exports, assert, extHostMessageService_1) {
    'use strict';
    suite('ExtHostMessageService', function () {
        test('propagte handle on select', function () {
            var service = new extHostMessageService_1.MainThreadMessageService({
                show: function (sev, m) {
                    assert.equal(m.actions.length, 1);
                    setImmediate(function () { return m.actions[0].run(); });
                    return function () { };
                }
            });
            return service.$showMessage(1, 'h', [{ handle: 42, title: 'a thing', isCloseAffordance: true }]).then(function (handle) {
                assert.equal(handle, 42);
            });
        });
        test('isCloseAffordance', function () {
            var actions;
            var service = new extHostMessageService_1.MainThreadMessageService({
                show: function (sev, m) {
                    actions = m.actions;
                }
            });
            // default close action
            service.$showMessage(1, '', [{ title: 'a thing', isCloseAffordance: false, handle: 0 }]);
            assert.equal(actions.length, 2);
            var first = actions[0], second = actions[1];
            assert.equal(first.label, 'Close');
            assert.equal(second.label, 'a thing');
            // override close action
            service.$showMessage(1, '', [{ title: 'a thing', isCloseAffordance: true, handle: 0 }]);
            assert.equal(actions.length, 1);
            first = actions[0];
            assert.equal(first.label, 'a thing');
        });
        test('hide on select', function () {
            var actions;
            var c;
            var service = new extHostMessageService_1.MainThreadMessageService({
                show: function (sev, m) {
                    c = 0;
                    actions = m.actions;
                    return function () {
                        c += 1;
                    };
                }
            });
            service.$showMessage(1, '', [{ title: 'a thing', isCloseAffordance: true, handle: 0 }]);
            assert.equal(actions.length, 1);
            actions[0].run();
            assert.equal(c, 1);
        });
    });
});
//# sourceMappingURL=extHostMessagerService.test.js.map