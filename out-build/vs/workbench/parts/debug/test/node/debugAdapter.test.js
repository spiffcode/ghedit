/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/paths', 'vs/base/common/platform', 'vs/workbench/parts/debug/node/debugAdapter'], function (require, exports, assert, paths, platform, debugAdapter_1) {
    "use strict";
    suite('Debug - Adapter', function () {
        var adapter;
        var extensionFolderPath = 'a/b/c/';
        var rawAdapter = {
            type: 'mock',
            label: 'Mock Debug',
            enableBreakpointsFor: { 'languageIds': ['markdown'] },
            program: './out/mock/mockDebug.js',
            win: {
                runtime: 'winRuntime'
            },
            linux: {
                runtime: 'linuxRuntime'
            },
            osx: {
                runtime: 'osxRuntime'
            },
            configurationAttributes: {
                launch: {
                    required: ['program'],
                    properties: {
                        program: {
                            'type': 'string',
                            'description': 'Workspace relative path to a text file.',
                            'default': 'readme.md'
                        }
                    }
                }
            },
            initialConfigurations: [
                {
                    name: 'Mock-Debug',
                    type: 'mock',
                    request: 'launch',
                    program: 'readme.md'
                }
            ]
        };
        setup(function () {
            adapter = new debugAdapter_1.Adapter(rawAdapter, null, extensionFolderPath);
        });
        teardown(function () {
            adapter = null;
        });
        test('adapter attributes', function () {
            assert.equal(adapter.type, rawAdapter.type);
            assert.equal(adapter.label, rawAdapter.label);
            assert.equal(adapter.program, paths.join(extensionFolderPath, rawAdapter.program));
            assert.equal(adapter.runtime, platform.isLinux ? rawAdapter.linux.runtime : platform.isMacintosh ? rawAdapter.osx.runtime : rawAdapter.win.runtime);
            assert.deepEqual(adapter.initialConfigurations, rawAdapter.initialConfigurations);
        });
        test('schema attributes', function () {
            var schemaAttribute = adapter.getSchemaAttributes()[0];
            assert.notDeepEqual(schemaAttribute, rawAdapter.configurationAttributes);
            Object.keys(rawAdapter.configurationAttributes.launch).forEach(function (key) {
                assert.deepEqual(schemaAttribute[key], rawAdapter.configurationAttributes.launch[key]);
            });
            assert.equal(schemaAttribute['additionalProperties'], false);
            assert.equal(!!schemaAttribute['properties']['request'], true);
            assert.equal(!!schemaAttribute['properties']['name'], true);
            assert.equal(!!schemaAttribute['properties']['type'], true);
            assert.equal(!!schemaAttribute['properties']['preLaunchTask'], true);
        });
    });
});
//# sourceMappingURL=debugAdapter.test.js.map