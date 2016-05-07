define(["require", "exports", 'assert', 'vs/platform/keybinding/common/keybindingsRegistry'], function (require, exports, assert, keybindingsRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Keybinding Registry', function () {
        test('command with description', function () {
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
                id: 'test',
                context: undefined,
                primary: undefined,
                weight: 0,
                handler: function (accessor, args) {
                    assert.ok(typeof args === 'string');
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
                id: 'test2',
                description: 'test',
                context: undefined,
                primary: undefined,
                weight: 0,
                handler: function (accessor, args) {
                    assert.ok(typeof args === 'string');
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
                id: 'test3',
                context: undefined,
                primary: undefined,
                weight: 0,
                description: {
                    description: 'a command',
                    args: [{ name: 'value', constraint: Number }]
                },
                handler: function (accessor, args) {
                    return true;
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.getCommands()['test'].apply(undefined, [undefined, 'string']);
            keybindingsRegistry_1.KeybindingsRegistry.getCommands()['test2'].apply(undefined, [undefined, 'string']);
            assert.throws(function () { return keybindingsRegistry_1.KeybindingsRegistry.getCommands()['test3'].apply(undefined, [undefined, 'string']); });
            assert.equal(keybindingsRegistry_1.KeybindingsRegistry.getCommands()['test3'].apply(undefined, [undefined, 1]), true);
        });
    });
});
//# sourceMappingURL=keybindingsRegistry.test.js.map