/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/types', 'vs/base/common/platform', 'vs/base/common/uri', 'vs/base/common/paths', 'vs/workbench/parts/files/browser/fileActions', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/files/common/explorerViewModel'], function (require, exports, assert, types_1, platform_1, uri_1, paths_1, fileActions_1, files_1, explorerViewModel_1) {
    'use strict';
    function createStat(path, name, isFolder, hasChildren, size, mtime) {
        return new explorerViewModel_1.FileStat(toResource(path), isFolder, hasChildren, name, mtime);
    }
    function toResource(path) {
        return uri_1.default.file(paths_1.join('C:\\', path));
    }
    suite('Files - View Model', function () {
        test('Properties', function () {
            var d = new Date().getTime();
            var s = createStat('/path/to/stat', 'sName', true, true, 8096, d);
            assert.strictEqual(s.isDirectoryResolved, false);
            assert.strictEqual(s.resource.fsPath, toResource('/path/to/stat').fsPath);
            assert.strictEqual(s.name, 'sName');
            assert.strictEqual(s.isDirectory, true);
            assert.strictEqual(s.hasChildren, true);
            assert.strictEqual(s.mtime, new Date(d).getTime());
            assert(types_1.isArray(s.children) && s.children.length === 0);
            s = createStat('/path/to/stat', 'sName', false, false, 8096, d);
            assert(types_1.isUndefinedOrNull(s.children));
        });
        test('Add and Remove Child, check for hasChild', function () {
            var d = new Date().getTime();
            var s = createStat('/path/to/stat', 'sName', true, false, 8096, d);
            var s2 = createStat('/path/to/stat2', 'sName2', false, false, 8096, d);
            var child1 = createStat('/path/to/stat/foo', 'foo', true, false, 8096, d);
            var child2 = createStat('/path/to/stat/bar.html', 'bar', false, false, 8096, d);
            var child4 = createStat('/otherpath/to/other/otherbar.html', 'otherbar.html', false, false, 8096, d);
            assert.throws(function () {
                s2.addChild(child1); // Can not add into non directory
            });
            assert.throws(function () {
                s2.addChild(null);
            });
            assert.throws(function () {
                s2.hasChild(child1.name);
            });
            assert.throws(function () {
                s2.removeChild(child1);
            });
            assert.throws(function () {
                s.hasChild(null);
            });
            assert(!s.hasChild(child1.name));
            assert(!s.hasChild(child2.name));
            s.addChild(child1);
            assert(s.hasChild(child1.name));
            assert(!s.hasChild(child1.name.toUpperCase()));
            assert(s.hasChild(child1.name.toUpperCase(), true));
            assert(s.children.length === 1);
            assert(s.hasChildren);
            s.addChild(child1);
            assert(s.children.length === 1);
            s.removeChild(child1);
            assert(!s.hasChildren);
            assert(s.children.length === 0);
            // Assert that adding a child updates its path properly
            s.addChild(child4);
            assert.strictEqual(child4.resource.fsPath, toResource('/path/to/stat/' + child4.name).fsPath);
        });
        test('Move', function () {
            var d = new Date().getTime();
            var s1 = createStat('/', '/', true, false, 8096, d);
            var s2 = createStat('/path', 'path', true, false, 8096, d);
            var s3 = createStat('/path/to', 'to', true, false, 8096, d);
            var s4 = createStat('/path/to/stat', 'stat', false, false, 8096, d);
            s1.addChild(s2);
            s2.addChild(s3);
            s3.addChild(s4);
            assert.throws(function () {
                s4.move(null);
            });
            assert.throws(function () {
                s2.move(s4); // Can not move into a file
            });
            assert.throws(function () {
                s1.move(s3); // Can not move root
            });
            s4.move(s1);
            assert.strictEqual(s3.children.length, 0);
            assert.strictEqual(s3.hasChildren, false);
            assert.strictEqual(s1.children.length, 2);
            // Assert the new path of the moved element
            assert.strictEqual(s4.resource.fsPath, toResource('/' + s4.name).fsPath);
            // Move a subtree with children
            var leaf = createStat('/leaf', 'leaf', true, false, 8096, d);
            var leafC1 = createStat('/leaf/folder', 'folder', true, false, 8096, d);
            var leafCC2 = createStat('/leaf/folder/index.html', 'index.html', true, false, 8096, d);
            leaf.addChild(leafC1);
            leafC1.addChild(leafCC2);
            s1.addChild(leaf);
            leafC1.move(s3);
            assert.strictEqual(leafC1.resource.fsPath, uri_1.default.file(s3.resource.fsPath + '/' + leafC1.name).fsPath);
            assert.strictEqual(leafCC2.resource.fsPath, uri_1.default.file(leafC1.resource.fsPath + '/' + leafCC2.name).fsPath);
        });
        test('Rename', function () {
            var d = new Date().getTime();
            var s1 = createStat('/', '/', true, false, 8096, d);
            var s2 = createStat('/path', 'path', true, false, 8096, d);
            var s3 = createStat('/path/to', 'to', true, false, 8096, d);
            var s4 = createStat('/path/to/stat', 'stat', true, false, 8096, d);
            var s5 = createStat('/path/to/stat', 'stat', true, false, 8096, d);
            assert.throws(function () {
                s2.rename(null);
            });
            assert.throws(function () {
                s1.rename(s2); // Can not rename root
            });
            assert.throws(function () {
                s4.rename(s5); // Can not rename to stat from different workspace
            });
            s1.addChild(s2);
            s2.addChild(s3);
            s3.addChild(s4);
            var s2renamed = createStat('/otherpath', 'otherpath', true, true, 8096, d);
            s2.rename(s2renamed);
            // Verify the paths have changed including children
            assert.strictEqual(s2.name, s2renamed.name);
            assert.strictEqual(s2.resource.fsPath, s2renamed.resource.fsPath);
            assert.strictEqual(s3.resource.fsPath, toResource('/otherpath/to').fsPath);
            assert.strictEqual(s4.resource.fsPath, toResource('/otherpath/to/stat').fsPath);
            var s4renamed = createStat('/otherpath/to/statother.js', 'statother.js', true, false, 8096, d);
            s4.rename(s4renamed);
            assert.strictEqual(s4.name, s4renamed.name);
            assert.strictEqual(s4.resource.fsPath, s4renamed.resource.fsPath);
        });
        test('Find', function () {
            var d = new Date().getTime();
            var s1 = createStat('/', '/', true, false, 8096, d);
            var s2 = createStat('/path', 'path', true, false, 8096, d);
            var s3 = createStat('/path/to', 'to', true, false, 8096, d);
            var s4 = createStat('/path/to/stat', 'stat', true, false, 8096, d);
            var child1 = createStat('/path/to/stat/foo', 'foo', true, false, 8096, d);
            var child2 = createStat('/path/to/stat/foo/bar.html', 'bar.html', false, false, 8096, d);
            s1.addChild(s2);
            s2.addChild(s3);
            s3.addChild(s4);
            s4.addChild(child1);
            child1.addChild(child2);
            assert.strictEqual(s1.find(child2.resource), child2);
            assert.strictEqual(s1.find(child1.resource), child1);
            assert.strictEqual(s1.find(s4.resource), s4);
            assert.strictEqual(s1.find(s3.resource), s3);
            assert.strictEqual(s1.find(s2.resource), s2);
            assert.strictEqual(s1.find(toResource('foobar')), null);
            assert.strictEqual(s1.find(toResource('/')), s1);
        });
        test('Find with mixed case', function () {
            var d = new Date().getTime();
            var s1 = createStat('/', '/', true, false, 8096, d);
            var s2 = createStat('/path', 'path', true, false, 8096, d);
            var s3 = createStat('/path/to', 'to', true, false, 8096, d);
            var s4 = createStat('/path/to/stat', 'stat', true, false, 8096, d);
            var child1 = createStat('/path/to/stat/foo', 'foo', true, false, 8096, d);
            var child2 = createStat('/path/to/stat/foo/bar.html', 'bar.html', false, false, 8096, d);
            s1.addChild(s2);
            s2.addChild(s3);
            s3.addChild(s4);
            s4.addChild(child1);
            child1.addChild(child2);
            if (platform_1.isLinux) {
                assert.ok(!s1.find(toResource('/path/to/stat/Foo')));
                assert.ok(!s1.find(toResource('/Path/to/stat/foo/bar.html')));
            }
            else {
                assert.ok(s1.find(toResource('/path/to/stat/Foo')));
                assert.ok(s1.find(toResource('/Path/to/stat/foo/bar.html')));
            }
        });
        test('Validate File Name (For Create)', function () {
            var d = new Date().getTime();
            var s = createStat('/path/to/stat', 'sName', true, true, 8096, d);
            var sChild = createStat('/path/to/stat/alles.klar', 'alles.klar', true, true, 8096, d);
            s.addChild(sChild);
            assert(fileActions_1.validateFileName(s, null) !== null);
            assert(fileActions_1.validateFileName(s, '') !== null);
            assert(fileActions_1.validateFileName(s, '  ') !== null);
            assert(fileActions_1.validateFileName(s, 'Read Me') === null, 'name containing space');
            assert(fileActions_1.validateFileName(s, 'foo/bar') !== null);
            assert(fileActions_1.validateFileName(s, 'foo\\bar') !== null);
            if (platform_1.isWindows) {
                assert(fileActions_1.validateFileName(s, 'foo:bar') !== null);
                assert(fileActions_1.validateFileName(s, 'foo*bar') !== null);
                assert(fileActions_1.validateFileName(s, 'foo?bar') !== null);
                assert(fileActions_1.validateFileName(s, 'foo<bar') !== null);
                assert(fileActions_1.validateFileName(s, 'foo>bar') !== null);
                assert(fileActions_1.validateFileName(s, 'foo|bar') !== null);
            }
            assert(fileActions_1.validateFileName(s, 'alles.klar') !== null);
            assert(fileActions_1.validateFileName(s, '.foo') === null);
            assert(fileActions_1.validateFileName(s, 'foo.bar') === null);
            assert(fileActions_1.validateFileName(s, 'foo') === null);
        });
        test('Validate File Name (For Rename)', function () {
            var d = new Date().getTime();
            var s = createStat('/path/to/stat', 'sName', true, true, 8096, d);
            var sChild = createStat('/path/to/stat/alles.klar', 'alles.klar', true, true, 8096, d);
            s.addChild(sChild);
            assert(fileActions_1.validateFileName(s, 'alles.klar') !== null);
            if (platform_1.isLinux) {
                assert(fileActions_1.validateFileName(s, 'Alles.klar') === null);
                assert(fileActions_1.validateFileName(s, 'Alles.Klar') === null);
            }
            else {
                assert(fileActions_1.validateFileName(s, 'Alles.klar') !== null);
                assert(fileActions_1.validateFileName(s, 'Alles.Klar') !== null);
            }
            assert(fileActions_1.validateFileName(s, '.foo') === null);
            assert(fileActions_1.validateFileName(s, 'foo.bar') === null);
            assert(fileActions_1.validateFileName(s, 'foo') === null);
        });
        test('File Change Event (with stats)', function () {
            var d = new Date().toUTCString();
            var s1 = new explorerViewModel_1.FileStat(toResource('/path/to/sName'), false, false, 'sName', 8096 /* Size */, d);
            var s2 = new explorerViewModel_1.FileStat(toResource('/path/to/sName'), false, false, 'sName', 16000 /* Size */, d);
            var s3 = new explorerViewModel_1.FileStat(toResource('/path/to/sNameMoved'), false, false, 'sNameMoved', 8096 /* Size */, d);
            // Got Added
            var event = new files_1.LocalFileChangeEvent(null, s1);
            assert(event.gotAdded());
            assert(!event.gotDeleted());
            assert(!event.gotUpdated());
            assert(!event.gotMoved());
            // Got Removed
            event = new files_1.LocalFileChangeEvent(s1, null);
            assert(!event.gotAdded());
            assert(event.gotDeleted());
            assert(!event.gotUpdated());
            assert(!event.gotMoved());
            // Got Moved
            event = new files_1.LocalFileChangeEvent(s3, s1);
            assert(!event.gotAdded());
            assert(!event.gotDeleted());
            assert(!event.gotUpdated());
            assert(event.gotMoved());
            // Got Updated
            event = new files_1.LocalFileChangeEvent(s2, s1);
            assert(!event.gotAdded());
            assert(!event.gotDeleted());
            assert(event.gotUpdated());
            assert(!event.gotMoved());
            // No Change
            event = new files_1.LocalFileChangeEvent(s1, s1);
            assert(!event.gotAdded());
            assert(!event.gotDeleted());
            assert(!event.gotUpdated());
            assert(!event.gotMoved());
        });
        test('Merge Local with Disk', function () {
            var d = new Date().toUTCString();
            var merge1 = new explorerViewModel_1.FileStat(uri_1.default.file(paths_1.join('C:\\', '/path/to')), true, false, 'to', 8096, d);
            var merge2 = new explorerViewModel_1.FileStat(uri_1.default.file(paths_1.join('C:\\', '/path/to')), true, false, 'to', 16000, new Date(0).toUTCString());
            // Merge Properties
            explorerViewModel_1.FileStat.mergeLocalWithDisk(merge2, merge1);
            assert.strictEqual(merge1.mtime, merge2.mtime);
            // Merge Child when isDirectoryResolved=false is a no-op
            merge2.addChild(new explorerViewModel_1.FileStat(uri_1.default.file(paths_1.join('C:\\', '/path/to/foo.html')), true, false, 'foo.html', 8096, d));
            explorerViewModel_1.FileStat.mergeLocalWithDisk(merge2, merge1);
            assert.strictEqual(merge1.children.length, 0);
            // Merge Child with isDirectoryResolved=true
            merge2.addChild(new explorerViewModel_1.FileStat(uri_1.default.file(paths_1.join('C:\\', '/path/to/foo.html')), true, false, 'foo.html', 8096, d));
            merge2.isDirectoryResolved = true;
            explorerViewModel_1.FileStat.mergeLocalWithDisk(merge2, merge1);
            assert.strictEqual(merge1.children.length, 1);
            assert.strictEqual(merge1.children[0].name, 'foo.html');
            assert.deepEqual(merge1.children[0].parent, merge1, 'Check parent');
            // Verify that merge does not replace existing children, but updates properties in that case
            var existingChild = merge1.children[0];
            explorerViewModel_1.FileStat.mergeLocalWithDisk(merge2, merge1);
            assert.ok(existingChild === merge1.children[0]);
        });
    });
});
//# sourceMappingURL=viewModel.test.js.map