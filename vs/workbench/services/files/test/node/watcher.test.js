/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/platform', 'vs/platform/files/common/files', 'vs/base/common/uri', 'vs/workbench/services/files/test/node/utils', 'vs/workbench/services/files/node/watcher/common'], function (require, exports, assert, platform, files_1, uri_1, utils, common_1) {
    'use strict';
    var TestFileWatcher = (function () {
        function TestFileWatcher(events) {
            this.eventEmitter = events;
        }
        TestFileWatcher.prototype.report = function (changes) {
            this.onRawFileEvents(changes);
        };
        TestFileWatcher.prototype.onRawFileEvents = function (events) {
            // Normalize
            var normalizedEvents = common_1.normalize(events);
            // Emit through broadcast service
            if (normalizedEvents.length > 0) {
                this.eventEmitter.emit(files_1.EventType.FILE_CHANGES, common_1.toFileChangesEvent(normalizedEvents));
            }
        };
        return TestFileWatcher;
    }());
    var Path;
    (function (Path) {
        Path[Path["UNIX"] = 0] = "UNIX";
        Path[Path["WINDOWS"] = 1] = "WINDOWS";
        Path[Path["UNC"] = 2] = "UNC";
    })(Path || (Path = {}));
    ;
    suite('Watcher', function () {
        test('watching - simple add/update/delete', function (done) {
            var events = new utils.TestEventService();
            var watch = new TestFileWatcher(events);
            var added = uri_1.default.file('/users/data/src/added.txt');
            var updated = uri_1.default.file('/users/data/src/updated.txt');
            var deleted = uri_1.default.file('/users/data/src/deleted.txt');
            var raw = [
                { path: added.fsPath, type: files_1.FileChangeType.ADDED },
                { path: updated.fsPath, type: files_1.FileChangeType.UPDATED },
                { path: deleted.fsPath, type: files_1.FileChangeType.DELETED },
            ];
            events.on(files_1.EventType.FILE_CHANGES, function (e) {
                assert.ok(e);
                assert.equal(e.changes.length, 3);
                assert.ok(e.contains(added, files_1.FileChangeType.ADDED));
                assert.ok(e.contains(updated, files_1.FileChangeType.UPDATED));
                assert.ok(e.contains(deleted, files_1.FileChangeType.DELETED));
                done();
            });
            watch.report(raw);
        });
        var pathSpecs = platform.isWindows ? [Path.WINDOWS, Path.UNC] : [Path.UNIX];
        pathSpecs.forEach(function (p) {
            test('watching - delete only reported for top level folder (' + p + ')', function (done) {
                var events = new utils.TestEventService();
                var watch = new TestFileWatcher(events);
                var deletedFolderA = uri_1.default.file(p === Path.UNIX ? '/users/data/src/todelete1' : p === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete1' : '\\\\localhost\\users\\data\\src\\todelete1');
                var deletedFolderB = uri_1.default.file(p === Path.UNIX ? '/users/data/src/todelete2' : p === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete2' : '\\\\localhost\\users\\data\\src\\todelete2');
                var deletedFolderBF1 = uri_1.default.file(p === Path.UNIX ? '/users/data/src/todelete2/file.txt' : p === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete2\\file.txt' : '\\\\localhost\\users\\data\\src\\todelete2\\file.txt');
                var deletedFolderBF2 = uri_1.default.file(p === Path.UNIX ? '/users/data/src/todelete2/more/test.txt' : p === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete2\\more\\test.txt' : '\\\\localhost\\users\\data\\src\\todelete2\\more\\test.txt');
                var deletedFolderBF3 = uri_1.default.file(p === Path.UNIX ? '/users/data/src/todelete2/super/bar/foo.txt' : p === Path.WINDOWS ? 'C:\\users\\data\\src\\todelete2\\super\\bar\\foo.txt' : '\\\\localhost\\users\\data\\src\\todelete2\\super\\bar\\foo.txt');
                var deletedFileA = uri_1.default.file(p === Path.UNIX ? '/users/data/src/deleteme.txt' : p === Path.WINDOWS ? 'C:\\users\\data\\src\\deleteme.txt' : '\\\\localhost\\users\\data\\src\\deleteme.txt');
                var addedFile = uri_1.default.file(p === Path.UNIX ? '/users/data/src/added.txt' : p === Path.WINDOWS ? 'C:\\users\\data\\src\\added.txt' : '\\\\localhost\\users\\data\\src\\added.txt');
                var updatedFile = uri_1.default.file(p === Path.UNIX ? '/users/data/src/updated.txt' : p === Path.WINDOWS ? 'C:\\users\\data\\src\\updated.txt' : '\\\\localhost\\users\\data\\src\\updated.txt');
                var raw = [
                    { path: deletedFolderA.fsPath, type: files_1.FileChangeType.DELETED },
                    { path: deletedFolderB.fsPath, type: files_1.FileChangeType.DELETED },
                    { path: deletedFolderBF1.fsPath, type: files_1.FileChangeType.DELETED },
                    { path: deletedFolderBF2.fsPath, type: files_1.FileChangeType.DELETED },
                    { path: deletedFolderBF3.fsPath, type: files_1.FileChangeType.DELETED },
                    { path: deletedFileA.fsPath, type: files_1.FileChangeType.DELETED },
                    { path: addedFile.fsPath, type: files_1.FileChangeType.ADDED },
                    { path: updatedFile.fsPath, type: files_1.FileChangeType.UPDATED }
                ];
                events.on(files_1.EventType.FILE_CHANGES, function (e) {
                    assert.ok(e);
                    assert.equal(e.changes.length, 5);
                    assert.ok(e.contains(deletedFolderA, files_1.FileChangeType.DELETED));
                    assert.ok(e.contains(deletedFolderB, files_1.FileChangeType.DELETED));
                    assert.ok(e.contains(deletedFileA, files_1.FileChangeType.DELETED));
                    assert.ok(e.contains(addedFile, files_1.FileChangeType.ADDED));
                    assert.ok(e.contains(updatedFile, files_1.FileChangeType.UPDATED));
                    done();
                });
                watch.report(raw);
            });
        });
        test('watching - event normalization: ignore CREATE followed by DELETE', function (done) {
            var events = new utils.TestEventService();
            var watch = new TestFileWatcher(events);
            var created = uri_1.default.file('/users/data/src/related');
            var deleted = uri_1.default.file('/users/data/src/related');
            var unrelated = uri_1.default.file('/users/data/src/unrelated');
            var raw = [
                { path: created.fsPath, type: files_1.FileChangeType.ADDED },
                { path: deleted.fsPath, type: files_1.FileChangeType.DELETED },
                { path: unrelated.fsPath, type: files_1.FileChangeType.UPDATED },
            ];
            events.on(files_1.EventType.FILE_CHANGES, function (e) {
                assert.ok(e);
                assert.equal(e.changes.length, 1);
                assert.ok(e.contains(unrelated, files_1.FileChangeType.UPDATED));
                done();
            });
            watch.report(raw);
        });
        test('watching - event normalization: flatten DELETE followed by CREATE into CHANGE', function (done) {
            var events = new utils.TestEventService();
            var watch = new TestFileWatcher(events);
            var deleted = uri_1.default.file('/users/data/src/related');
            var created = uri_1.default.file('/users/data/src/related');
            var unrelated = uri_1.default.file('/users/data/src/unrelated');
            var raw = [
                { path: deleted.fsPath, type: files_1.FileChangeType.DELETED },
                { path: created.fsPath, type: files_1.FileChangeType.ADDED },
                { path: unrelated.fsPath, type: files_1.FileChangeType.UPDATED },
            ];
            events.on(files_1.EventType.FILE_CHANGES, function (e) {
                assert.ok(e);
                assert.equal(e.changes.length, 2);
                assert.ok(e.contains(deleted, files_1.FileChangeType.UPDATED));
                assert.ok(e.contains(unrelated, files_1.FileChangeType.UPDATED));
                done();
            });
            watch.report(raw);
        });
        test('watching - event normalization: ignore UPDATE when CREATE received', function (done) {
            var events = new utils.TestEventService();
            var watch = new TestFileWatcher(events);
            var created = uri_1.default.file('/users/data/src/related');
            var updated = uri_1.default.file('/users/data/src/related');
            var unrelated = uri_1.default.file('/users/data/src/unrelated');
            var raw = [
                { path: created.fsPath, type: files_1.FileChangeType.ADDED },
                { path: updated.fsPath, type: files_1.FileChangeType.UPDATED },
                { path: unrelated.fsPath, type: files_1.FileChangeType.UPDATED },
            ];
            events.on(files_1.EventType.FILE_CHANGES, function (e) {
                assert.ok(e);
                assert.equal(e.changes.length, 2);
                assert.ok(e.contains(created, files_1.FileChangeType.ADDED));
                assert.ok(!e.contains(created, files_1.FileChangeType.UPDATED));
                assert.ok(e.contains(unrelated, files_1.FileChangeType.UPDATED));
                done();
            });
            watch.report(raw);
        });
        test('watching - event normalization: apply DELETE', function (done) {
            var events = new utils.TestEventService();
            var watch = new TestFileWatcher(events);
            var updated = uri_1.default.file('/users/data/src/related');
            var updated2 = uri_1.default.file('/users/data/src/related');
            var deleted = uri_1.default.file('/users/data/src/related');
            var unrelated = uri_1.default.file('/users/data/src/unrelated');
            var raw = [
                { path: updated.fsPath, type: files_1.FileChangeType.UPDATED },
                { path: updated2.fsPath, type: files_1.FileChangeType.UPDATED },
                { path: unrelated.fsPath, type: files_1.FileChangeType.UPDATED },
                { path: updated.fsPath, type: files_1.FileChangeType.DELETED }
            ];
            events.on(files_1.EventType.FILE_CHANGES, function (e) {
                assert.ok(e);
                assert.equal(e.changes.length, 2);
                assert.ok(e.contains(deleted, files_1.FileChangeType.DELETED));
                assert.ok(!e.contains(updated, files_1.FileChangeType.UPDATED));
                assert.ok(e.contains(unrelated, files_1.FileChangeType.UPDATED));
                done();
            });
            watch.report(raw);
        });
    });
});
//# sourceMappingURL=watcher.test.js.map