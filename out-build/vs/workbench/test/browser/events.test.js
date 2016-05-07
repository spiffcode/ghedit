/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/base/common/paths', 'vs/platform/files/common/files', 'vs/base/common/events', 'vs/workbench/common/events'], function (require, exports, assert, uri_1, Paths, Files, events_1, events_2) {
    'use strict';
    var FileChangesEvent = Files.FileChangesEvent;
    suite('Workbench Events', function () {
        test('Base Event', function () {
            var origEvent = {};
            var event = new events_1.Event(origEvent);
            assert.strictEqual(event.originalEvent, origEvent);
            assert(event.time);
        });
        test('Command Event', function () {
            var actionId = 'foo.bar';
            var origEvent = {};
            var event = new events_2.CommandEvent(actionId, origEvent);
            assert.strictEqual(event.originalEvent, origEvent);
            assert.strictEqual(event.actionId, actionId);
            assert(event.time);
        });
        test('Editor Change Event', function () {
            var editor = {};
            var origEvent = {};
            var input = {};
            var options = {};
            var id = 'foo.bar';
            var event = new events_2.EditorEvent(editor, id, input, options, 0, origEvent);
            assert.strictEqual(event.editor, editor);
            assert.strictEqual(event.originalEvent, origEvent);
            assert.strictEqual(event.editorId, id);
            assert.strictEqual(event.editorInput, input);
            assert.strictEqual(event.editorOptions, options);
            assert(event.time);
        });
        test('Property Change Event', function () {
            var key = 'foo';
            var origEvent = {};
            var oldValue = { foo: 'bar' };
            var newValue = { foo: 'foo' };
            var event = new events_1.PropertyChangeEvent(key, oldValue, newValue, origEvent);
            assert.strictEqual(event.originalEvent, origEvent);
            assert.strictEqual(event.key, key);
            assert.strictEqual(event.oldValue, oldValue);
            assert.strictEqual(event.newValue, newValue);
            assert(event.time);
        });
        test('File Changes Event', function () {
            var changes = [
                { resource: uri_1.default.file(Paths.join('C:\\', '/foo/updated.txt')), type: 0 },
                { resource: uri_1.default.file(Paths.join('C:\\', '/foo/otherupdated.txt')), type: 0 },
                { resource: uri_1.default.file(Paths.join('C:\\', '/added.txt')), type: 1 },
                { resource: uri_1.default.file(Paths.join('C:\\', '/bar/deleted.txt')), type: 2 },
                { resource: uri_1.default.file(Paths.join('C:\\', '/bar/folder')), type: 2 }
            ];
            var r1 = new FileChangesEvent(changes);
            assert(!r1.contains(toResource('/foo'), 0));
            assert(r1.contains(toResource('/foo/updated.txt'), 0));
            assert(!r1.contains(toResource('/foo/updated.txt'), 1));
            assert(!r1.contains(toResource('/foo/updated.txt'), 2));
            assert(r1.contains(toResource('/bar/folder'), 2));
            assert(r1.contains(toResource('/bar/folder/somefile'), 2));
            assert(r1.contains(toResource('/bar/folder/somefile/test.txt'), 2));
            assert(!r1.contains(toResource('/bar/folder2/somefile'), 2));
            assert.strictEqual(5, r1.changes.length);
            assert.strictEqual(1, r1.getAdded().length);
            assert.strictEqual(true, r1.gotAdded());
            assert.strictEqual(2, r1.getUpdated().length);
            assert.strictEqual(true, r1.gotUpdated());
            assert.strictEqual(2, r1.getDeleted().length);
            assert.strictEqual(true, r1.gotDeleted());
        });
        function toResource(path) {
            return uri_1.default.file(Paths.join('C:\\', path));
        }
        test('Composite Event', function () {
            var compositeId = 'foo.bar';
            var origEvent = {};
            var event = new events_2.CompositeEvent(compositeId, origEvent);
            assert.strictEqual(event.originalEvent, origEvent);
            assert.strictEqual(event.compositeId, compositeId);
            assert(event.time);
        });
    });
});
//# sourceMappingURL=events.test.js.map