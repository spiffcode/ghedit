/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/workbench/parts/files/common/editors/textFileEditorModel', 'vs/workbench/common/editor'], function (require, exports, assert, uri_1, textFileEditorModel_1, editor_1) {
    'use strict';
    suite('Files - TextFileEditorModelCache', function () {
        test('add, remove, clear', function () {
            var cache = new textFileEditorModel_1.TextFileEditorModelCache();
            var m1 = new editor_1.EditorModel();
            var m2 = new editor_1.EditorModel();
            var m3 = new editor_1.EditorModel();
            cache.add(uri_1.default.file('/test.html'), m1);
            cache.add(uri_1.default.file('/some/other.html'), m2);
            cache.add(uri_1.default.file('/some/this.txt'), m3);
            assert(!cache.get(uri_1.default.file('foo')));
            assert.strictEqual(cache.get(uri_1.default.file('/test.html')), m1);
            var result = cache.getAll();
            assert.strictEqual(3, result.length);
            result = cache.getAll(uri_1.default.file('/yes'));
            assert.strictEqual(0, result.length);
            result = cache.getAll(uri_1.default.file('/some/other.txt'));
            assert.strictEqual(0, result.length);
            result = cache.getAll(uri_1.default.file('/some/other.html'));
            assert.strictEqual(1, result.length);
            cache.remove(uri_1.default.file(''));
            result = cache.getAll();
            assert.strictEqual(3, result.length);
            cache.remove(uri_1.default.file('/test.html'));
            result = cache.getAll();
            assert.strictEqual(2, result.length);
            cache.clear();
            result = cache.getAll();
            assert.strictEqual(0, result.length);
        });
    });
});
//# sourceMappingURL=textFileEditorModelCache.test.js.map