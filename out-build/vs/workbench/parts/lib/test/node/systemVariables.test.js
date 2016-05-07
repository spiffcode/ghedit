define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/base/common/platform', 'vs/workbench/parts/lib/node/systemVariables'], function (require, exports, assert, uri_1, Platform, systemVariables_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('SystemVariables tests', function () {
        test('SystemVariables: substitute one', function () {
            var systemVariables = new systemVariables_1.SystemVariables(null, null, uri_1.default.parse('file:///VSCode/workspaceLocation'));
            if (Platform.isWindows) {
                assert.strictEqual(systemVariables.resolve('abc ${workspaceRoot} xyz'), 'abc \\VSCode\\workspaceLocation xyz');
            }
            else {
                assert.strictEqual(systemVariables.resolve('abc ${workspaceRoot} xyz'), 'abc /VSCode/workspaceLocation xyz');
            }
        });
        test('SystemVariables: substitute many', function () {
            var systemVariables = new systemVariables_1.SystemVariables(null, null, uri_1.default.parse('file:///VSCode/workspaceLocation'));
            if (Platform.isWindows) {
                assert.strictEqual(systemVariables.resolve('${workspaceRoot} - ${workspaceRoot}'), '\\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation');
            }
            else {
                assert.strictEqual(systemVariables.resolve('${workspaceRoot} - ${workspaceRoot}'), '/VSCode/workspaceLocation - /VSCode/workspaceLocation');
            }
        });
    });
});
//# sourceMappingURL=systemVariables.test.js.map