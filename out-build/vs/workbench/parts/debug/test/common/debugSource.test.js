/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/workbench/parts/debug/common/debugSource'], function (require, exports, assert, uri_1, debugSource_1) {
    "use strict";
    suite('Debug - Source', function () {
        test('from raw source', function () {
            var rawSource = {
                name: 'zz',
                path: '/xx/yy/zz',
                sourceReference: 0
            };
            var source = new debugSource_1.Source(rawSource);
            assert.equal(source.available, true);
            assert.equal(source.name, rawSource.name);
            assert.equal(source.inMemory, false);
            assert.equal(source.reference, rawSource.sourceReference);
            assert.equal(source.uri.toString(), uri_1.default.file(rawSource.path).toString());
        });
        test('from raw internal source', function () {
            var rawSource = {
                name: 'internalModule.js',
                sourceReference: 11
            };
            var source = new debugSource_1.Source(rawSource);
            assert.equal(source.available, true);
            assert.equal(source.name, rawSource.name);
            assert.equal(source.inMemory, true);
            assert.equal(source.reference, rawSource.sourceReference);
        });
    });
});
//# sourceMappingURL=debugSource.test.js.map