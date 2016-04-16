/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'fs', 'path', 'os', 'assert', 'vs/workbench/services/files/node/fileService', 'vs/platform/files/common/files', 'vs/base/common/async', 'vs/base/common/uri', 'vs/base/common/uuid', 'vs/base/node/extfs', 'vs/base/node/encoding', 'vs/workbench/services/files/test/node/utils'], function (require, exports, fs, path, os, assert, fileService_1, files_1, async_1, uri_1, uuid, extfs, encodingLib, utils) {
    'use strict';
    suite('FileService', function () {
        var events;
        var service;
        var parentDir = path.join(os.tmpdir(), 'vsctests', 'service');
        var testDir;
        setup(function (done) {
            var id = uuid.generateUuid();
            testDir = path.join(parentDir, id);
            var sourceDir = require.toUrl('./fixtures/service');
            extfs.copy(sourceDir, testDir, function () {
                events = new utils.TestEventService();
                service = new fileService_1.FileService(testDir, { disableWatcher: true }, events);
                done();
            });
        });
        teardown(function (done) {
            service.dispose();
            events.dispose();
            extfs.del(parentDir, os.tmpdir(), function () { }, done);
        });
        test('resolveContents', function (done) {
            service.resolveContents([
                uri_1.default.file(path.join(testDir, 'index.html')),
                uri_1.default.file(path.join(testDir, '404.html')),
                uri_1.default.file(path.join(testDir, 'deep', 'company.js')),
            ]).done(function (r) {
                assert.equal(r.length, 2);
                assert.equal(r.some(function (c) { return c.name === 'index.html'; }), true);
                assert.equal(r.some(function (c) { return c.name === 'company.js'; }), true);
                done();
            });
        });
        test('createFile', function (done) {
            var contents = 'Hello World';
            service.createFile(uri_1.default.file(path.join(testDir, 'test.txt')), contents).done(function (s) {
                assert.equal(s.name, 'test.txt');
                assert.equal(fs.existsSync(s.resource.fsPath), true);
                assert.equal(fs.readFileSync(s.resource.fsPath), contents);
                done();
            });
        });
        test('createFolder', function (done) {
            service.resolveFile(uri_1.default.file(testDir)).done(function (parent) {
                return service.createFolder(uri_1.default.file(path.join(parent.resource.fsPath, 'newFolder'))).then(function (f) {
                    assert.equal(f.name, 'newFolder');
                    assert.equal(fs.existsSync(f.resource.fsPath), true);
                    done();
                });
            });
        });
        test('renameFile', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.rename(source.resource, 'other.html').then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    done();
                });
            });
        });
        test('renameFolder', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'deep'))).done(function (source) {
                return service.rename(source.resource, 'deeper').then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    done();
                });
            });
        });
        test('renameFile - MIX CASE', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.rename(source.resource, 'INDEX.html').then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(path.basename(renamed.resource.fsPath), 'INDEX.html');
                    done();
                });
            });
        });
        test('moveFile', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.moveFile(source.resource, uri_1.default.file(path.join(testDir, 'other.html'))).then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    done();
                });
            });
        });
        test('move - FILE_MOVE_CONFLICT', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.moveFile(source.resource, uri_1.default.file(path.join(testDir, 'binary.txt'))).then(null, function (e) {
                    assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_MOVE_CONFLICT);
                    done();
                });
            });
        });
        test('moveFile - MIX CASE', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.moveFile(source.resource, uri_1.default.file(path.join(testDir, 'INDEX.html'))).then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(path.basename(renamed.resource.fsPath), 'INDEX.html');
                    done();
                });
            });
        });
        test('moveFile - overwrite folder with file', function (done) {
            service.resolveFile(uri_1.default.file(testDir)).done(function (parent) {
                return service.createFolder(uri_1.default.file(path.join(parent.resource.fsPath, 'conway.js'))).then(function (f) {
                    return service.moveFile(uri_1.default.file(path.join(testDir, 'deep', 'conway.js')), f.resource, true).then(function (moved) {
                        assert.equal(fs.existsSync(moved.resource.fsPath), true);
                        assert.ok(fs.statSync(moved.resource.fsPath).isFile);
                        done();
                    });
                });
            });
        });
        test('copyFile', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.copyFile(source.resource, uri_1.default.file(path.join(testDir, 'other.html'))).then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(fs.existsSync(source.resource.fsPath), true);
                    done();
                });
            });
        });
        test('copyFile - overwrite folder with file', function (done) {
            service.resolveFile(uri_1.default.file(testDir)).done(function (parent) {
                return service.createFolder(uri_1.default.file(path.join(parent.resource.fsPath, 'conway.js'))).then(function (f) {
                    return service.copyFile(uri_1.default.file(path.join(testDir, 'deep', 'conway.js')), f.resource, true).then(function (copied) {
                        assert.equal(fs.existsSync(copied.resource.fsPath), true);
                        assert.ok(fs.statSync(copied.resource.fsPath).isFile);
                        done();
                    });
                });
            });
        });
        test('importFile', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'deep'))).done(function (target) {
                return service.importFile(uri_1.default.file(require.toUrl('./fixtures/service/index.html')), target.resource).then(function (res) {
                    assert.equal(res.isNew, true);
                    assert.equal(fs.existsSync(res.stat.resource.fsPath), true);
                    done();
                });
            });
        });
        test('importFile - MIX CASE', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.rename(source.resource, 'CONWAY.js').then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.ok(fs.readdirSync(testDir).some(function (f) { return f === 'CONWAY.js'; }));
                    return service.resolveFile(uri_1.default.file(path.join(testDir, 'deep', 'conway.js'))).done(function (source) {
                        return service.importFile(source.resource, uri_1.default.file(testDir)).then(function (res) {
                            assert.equal(fs.existsSync(res.stat.resource.fsPath), true);
                            assert.ok(fs.readdirSync(testDir).some(function (f) { return f === 'conway.js'; }));
                            done();
                        });
                    });
                });
            });
        });
        test('importFile - overwrite folder with file', function (done) {
            service.resolveFile(uri_1.default.file(testDir)).done(function (parent) {
                return service.createFolder(uri_1.default.file(path.join(parent.resource.fsPath, 'conway.js'))).then(function (f) {
                    return service.importFile(uri_1.default.file(path.join(testDir, 'deep', 'conway.js')), uri_1.default.file(testDir)).then(function (res) {
                        assert.equal(fs.existsSync(res.stat.resource.fsPath), true);
                        assert.ok(fs.readdirSync(testDir).some(function (f) { return f === 'conway.js'; }));
                        assert.ok(fs.statSync(res.stat.resource.fsPath).isFile);
                        done();
                    });
                });
            });
        });
        test('importFile - same file', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.importFile(source.resource, uri_1.default.file(path.dirname(source.resource.fsPath))).then(function (imported) {
                    assert.equal(imported.stat.size, source.size);
                    done();
                });
            });
        });
        test('deleteFile', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'deep', 'conway.js'))).done(function (source) {
                return service.del(source.resource).then(function () {
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    done();
                });
            });
        });
        test('deleteFolder', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'deep'))).done(function (source) {
                return service.del(source.resource).then(function () {
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    done();
                });
            });
        });
        test('resolveFile', function (done) {
            service.resolveFile(uri_1.default.file(testDir), { resolveTo: [uri_1.default.file(path.join(testDir, 'deep'))] }).done(function (r) {
                assert.equal(r.children.length, 6);
                var deep = utils.getByName(r, 'deep');
                assert.equal(deep.children.length, 4);
                done();
            });
        });
        test('updateContent', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'small.txt'));
            service.resolveContent(resource).done(function (c) {
                assert.equal(c.value, 'Small File');
                c.value = 'Updates to the small file';
                return service.updateContent(c.resource, c.value).then(function (c) {
                    assert.equal(fs.readFileSync(resource.fsPath), 'Updates to the small file');
                    done();
                });
            });
        });
        test('updateContent - use encoding (UTF 16 BE)', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'small.txt'));
            var encoding = 'utf16be';
            service.resolveContent(resource).done(function (c) {
                c.encoding = encoding;
                return service.updateContent(c.resource, c.value, { encoding: encoding }).then(function (c) {
                    return async_1.nfcall(encodingLib.detectEncodingByBOM, c.resource.fsPath).then(function (enc) {
                        assert.equal(enc, encodingLib.UTF16be);
                        return service.resolveContent(resource).then(function (c) {
                            assert.equal(c.encoding, encoding);
                            done();
                        });
                    });
                });
            });
        });
        test('updateContent - encoding preserved (UTF 16 LE)', function (done) {
            var encoding = 'utf16le';
            var resource = uri_1.default.file(path.join(testDir, 'some_utf16le.css'));
            service.resolveContent(resource).done(function (c) {
                assert.equal(c.encoding, encoding);
                c.value = 'Some updates';
                return service.updateContent(c.resource, c.value, { encoding: encoding }).then(function (c) {
                    return async_1.nfcall(encodingLib.detectEncodingByBOM, c.resource.fsPath).then(function (enc) {
                        assert.equal(enc, encodingLib.UTF16le);
                        return service.resolveContent(resource).then(function (c) {
                            assert.equal(c.encoding, encoding);
                            done();
                        });
                    });
                });
            });
        });
        test('resolveContent - FILE_IS_BINARY', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'binary.txt'));
            service.resolveContent(resource, { acceptTextOnly: true }).done(null, function (e) {
                assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_IS_BINARY);
                return service.resolveContent(uri_1.default.file(path.join(testDir, 'small.txt')), { acceptTextOnly: true }).then(function (r) {
                    assert.equal(r.name, 'small.txt');
                    done();
                });
            });
        });
        test('resolveContent - FILE_IS_DIRECTORY', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'deep'));
            service.resolveContent(resource).done(null, function (e) {
                assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_IS_DIRECTORY);
                done();
            });
        });
        test('resolveContent - FILE_NOT_FOUND', function (done) {
            var resource = uri_1.default.file(path.join(testDir, '404.html'));
            service.resolveContent(resource).done(null, function (e) {
                assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_NOT_FOUND);
                done();
            });
        });
        test('resolveContent - FILE_NOT_MODIFIED_SINCE', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveContent(resource).done(function (c) {
                return service.resolveContent(resource, { etag: c.etag }).then(null, function (e) {
                    assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_NOT_MODIFIED_SINCE);
                    done();
                });
            });
        });
        test('resolveContent - FILE_MODIFIED_SINCE', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveContent(resource).done(function (c) {
                fs.writeFileSync(resource.fsPath, 'Updates Incoming!');
                return service.updateContent(resource, c.value, { etag: c.etag, mtime: c.mtime - 1000 }).then(null, function (e) {
                    assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_MODIFIED_SINCE);
                    done();
                });
            });
        });
        test('resolveContent - encoding picked up', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            var encoding = 'windows1252';
            service.resolveContent(resource, { encoding: encoding }).done(function (c) {
                assert.equal(c.encoding, encoding);
                done();
            });
        });
        test('resolveContent - user overrides BOM', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'some_utf16le.css'));
            service.resolveContent(resource, { encoding: 'windows1252' }).done(function (c) {
                assert.equal(c.encoding, 'windows1252');
                done();
            });
        });
        test('resolveContent - BOM removed', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'some_utf8_bom.txt'));
            service.resolveContent(resource).done(function (c) {
                assert.equal(encodingLib.detectEncodingByBOMFromBuffer(new Buffer(c.value), 512), null);
                done();
            });
        });
        test('resolveContent - invalid encoding', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveContent(resource, { encoding: 'superduper' }).done(function (c) {
                assert.equal(c.encoding, 'utf8');
                done();
            });
        });
        test('watchFileChanges', function (done) {
            var toWatch = uri_1.default.file(path.join(testDir, 'index.html'));
            service.watchFileChanges(toWatch);
            events.on(files_1.EventType.FILE_CHANGES, function (e) {
                assert.ok(e);
                service.unwatchFileChanges(toWatch);
                done();
            });
            setTimeout(function () {
                fs.writeFileSync(toWatch.fsPath, 'Changes');
            }, 100);
        });
        test('options - encoding', function (done) {
            // setup
            var _id = uuid.generateUuid();
            var _testDir = path.join(parentDir, _id);
            var _sourceDir = require.toUrl('./fixtures/service');
            extfs.copy(_sourceDir, _testDir, function () {
                var encodingOverride = [];
                encodingOverride.push({
                    resource: uri_1.default.file(path.join(testDir, 'deep')),
                    encoding: 'utf16le'
                });
                var _service = new fileService_1.FileService(_testDir, {
                    encoding: 'windows1252',
                    encodingOverride: encodingOverride,
                    disableWatcher: true
                }, null);
                _service.resolveContent(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (c) {
                    assert.equal(c.encoding, 'windows1252');
                    return _service.resolveContent(uri_1.default.file(path.join(testDir, 'deep', 'conway.js'))).done(function (c) {
                        assert.equal(c.encoding, 'utf16le');
                        // teardown
                        _service.dispose();
                        done();
                    });
                });
            });
        });
        test('UTF 8 BOMs', function (done) {
            // setup
            var _id = uuid.generateUuid();
            var _testDir = path.join(parentDir, _id);
            var _sourceDir = require.toUrl('./fixtures/service');
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            var _service = new fileService_1.FileService(_testDir, {
                disableWatcher: true
            }, null);
            extfs.copy(_sourceDir, _testDir, function () {
                fs.readFile(resource.fsPath, function (error, data) {
                    assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), null);
                    // Update content: UTF_8 => UTF_8_BOM
                    _service.updateContent(resource, 'Hello Bom', { encoding: encodingLib.UTF8_with_bom }).done(function () {
                        fs.readFile(resource.fsPath, function (error, data) {
                            assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), encodingLib.UTF8);
                            // Update content: PRESERVE BOM when using UTF-8
                            _service.updateContent(resource, 'Please stay Bom', { encoding: encodingLib.UTF8 }).done(function () {
                                fs.readFile(resource.fsPath, function (error, data) {
                                    assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), encodingLib.UTF8);
                                    // Update content: REMOVE BOM
                                    _service.updateContent(resource, 'Go away Bom', { encoding: encodingLib.UTF8, overwriteEncoding: true }).done(function () {
                                        fs.readFile(resource.fsPath, function (error, data) {
                                            assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), null);
                                            // Update content: BOM comes not back
                                            _service.updateContent(resource, 'Do not come back Bom', { encoding: encodingLib.UTF8 }).done(function () {
                                                fs.readFile(resource.fsPath, function (error, data) {
                                                    assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), null);
                                                    _service.dispose();
                                                    done();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=fileService.test.js.map