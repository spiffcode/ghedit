/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'fs', 'path', 'assert', 'vs/workbench/services/files/node/fileService', 'vs/base/common/uri', 'vs/base/common/platform', 'vs/workbench/services/files/test/node/utils'], function (require, exports, fs, path, assert, fileService_1, uri_1, platform_1, utils) {
    'use strict';
    function create(relativePath) {
        var basePath = require.toUrl('./fixtures/resolver');
        var absolutePath = relativePath ? path.join(basePath, relativePath) : basePath;
        var fsStat = fs.statSync(absolutePath);
        return new fileService_1.StatResolver(uri_1.default.file(absolutePath), fsStat.isDirectory(), fsStat.mtime.getTime(), fsStat.size, false);
    }
    function toResource(relativePath) {
        var basePath = require.toUrl('./fixtures/resolver');
        var absolutePath = relativePath ? path.join(basePath, relativePath) : basePath;
        return uri_1.default.file(absolutePath);
    }
    suite('Stat Resolver', function () {
        test('resolve file', function (done) {
            var resolver = create('/index.html');
            resolver.resolve(null).then(function (result) {
                assert.ok(!result.isDirectory);
                assert.equal(result.name, 'index.html');
                assert.ok(!!result.etag);
                resolver = create('examples');
                return resolver.resolve(null).then(function (result) {
                    assert.ok(result.isDirectory);
                });
            })
                .done(function () { return done(); }, done);
        });
        test('resolve directory', function (done) {
            var testsElements = ['examples', 'other', 'index.html', 'site.css'];
            var resolver = create('/');
            resolver.resolve(null).then(function (result) {
                assert.ok(result);
                assert.ok(result.children);
                assert.ok(result.hasChildren);
                assert.ok(result.isDirectory);
                assert.equal(result.children.length, testsElements.length);
                assert.ok(result.children.every(function (entry) {
                    return testsElements.some(function (name) {
                        return path.basename(entry.resource.fsPath) === name;
                    });
                }));
                result.children.forEach(function (value) {
                    assert.ok(path.basename(value.resource.fsPath));
                    if (['examples', 'other'].indexOf(path.basename(value.resource.fsPath)) >= 0) {
                        assert.ok(value.isDirectory);
                        assert.ok(value.hasChildren);
                    }
                    else if (path.basename(value.resource.fsPath) === 'index.html') {
                        assert.ok(!value.isDirectory);
                        assert.ok(value.hasChildren === false);
                    }
                    else if (path.basename(value.resource.fsPath) === 'site.css') {
                        assert.ok(!value.isDirectory);
                        assert.ok(value.hasChildren === false);
                    }
                    else {
                        assert.ok(!'Unexpected value ' + path.basename(value.resource.fsPath));
                    }
                });
            })
                .done(function () { return done(); }, done);
        });
        test('resolve directory - resolveTo single directory', function (done) {
            var resolver = create('/');
            resolver.resolve({ resolveTo: [toResource('other/deep')] }).then(function (result) {
                assert.ok(result);
                assert.ok(result.children);
                assert.ok(result.hasChildren);
                assert.ok(result.isDirectory);
                var children = result.children;
                assert.equal(children.length, 4);
                var other = utils.getByName(result, 'other');
                assert.ok(other);
                assert.ok(other.hasChildren);
                var deep = utils.getByName(other, 'deep');
                assert.ok(deep);
                assert.ok(deep.hasChildren);
                assert.equal(deep.children.length, 4);
            })
                .done(function () { return done(); }, done);
        });
        test('resolve directory - resolveTo single directory - mixed casing', function (done) {
            var resolver = create('/');
            resolver.resolve({ resolveTo: [toResource('other/Deep')] }).then(function (result) {
                assert.ok(result);
                assert.ok(result.children);
                assert.ok(result.hasChildren);
                assert.ok(result.isDirectory);
                var children = result.children;
                assert.equal(children.length, 4);
                var other = utils.getByName(result, 'other');
                assert.ok(other);
                assert.ok(other.hasChildren);
                var deep = utils.getByName(other, 'deep');
                if (platform_1.isLinux) {
                    assert.ok(deep);
                    assert.ok(deep.hasChildren);
                    assert.ok(!deep.children); // not resolved because we got instructed to resolve other/Deep with capital D
                }
                else {
                    assert.ok(deep);
                    assert.ok(deep.hasChildren);
                    assert.equal(deep.children.length, 4);
                }
            })
                .done(function () { return done(); }, done);
        });
        test('resolve directory - resolveTo multiple directories', function (done) {
            var resolver = create('/');
            resolver.resolve({ resolveTo: [toResource('other/deep'), toResource('examples')] }).then(function (result) {
                assert.ok(result);
                assert.ok(result.children);
                assert.ok(result.hasChildren);
                assert.ok(result.isDirectory);
                var children = result.children;
                assert.equal(children.length, 4);
                var other = utils.getByName(result, 'other');
                assert.ok(other);
                assert.ok(other.hasChildren);
                var deep = utils.getByName(other, 'deep');
                assert.ok(deep);
                assert.ok(deep.hasChildren);
                assert.equal(deep.children.length, 4);
                var examples = utils.getByName(result, 'examples');
                assert.ok(examples);
                assert.ok(examples.hasChildren);
                assert.equal(examples.children.length, 4);
            })
                .done(function () { return done(); }, done);
        });
        test('resolve directory - resolveSingleChildFolders', function (done) {
            var resolver = create('/other');
            resolver.resolve({ resolveSingleChildDescendants: true }).then(function (result) {
                assert.ok(result);
                assert.ok(result.children);
                assert.ok(result.hasChildren);
                assert.ok(result.isDirectory);
                var children = result.children;
                assert.equal(children.length, 1);
                var deep = utils.getByName(result, 'deep');
                assert.ok(deep);
                assert.ok(deep.hasChildren);
                assert.equal(deep.children.length, 4);
            })
                .done(function () { return done(); }, done);
        });
    });
});
//# sourceMappingURL=resolver.test.js.map