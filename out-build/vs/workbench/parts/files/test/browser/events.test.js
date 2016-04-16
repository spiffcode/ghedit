/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/files/browser/fileActions'], function (require, exports, assert, files_1, fileActions_1) {
    'use strict';
    suite('Files - Events', function () {
        test('File Change Event (simple)', function () {
            var origEvent = {};
            var oldValue = { foo: 'bar' };
            var newValue = { foo: 'foo' };
            var event = new files_1.LocalFileChangeEvent(oldValue, newValue, origEvent);
            assert.strictEqual(event.originalEvent, origEvent);
            assert.strictEqual(event.oldValue, oldValue);
            assert.strictEqual(event.newValue, newValue);
            assert(event.time);
        });
        test('File Upload Event', function () {
            var origEvent = {};
            var value = { foo: 'bar' };
            var event = new fileActions_1.FileImportedEvent(value, true, origEvent);
            assert.strictEqual(event.originalEvent, origEvent);
            assert.strictEqual(event.newValue, value);
            assert(event.time);
            assert(event.gotAdded());
            assert(!event.gotUpdated());
            assert(!event.gotMoved());
            assert(!event.gotDeleted());
            event = new fileActions_1.FileImportedEvent(value, false, origEvent);
            assert(!event.gotAdded());
            assert(event.gotUpdated());
            assert(!event.gotMoved());
            assert(!event.gotDeleted());
        });
    });
});
//# sourceMappingURL=events.test.js.map