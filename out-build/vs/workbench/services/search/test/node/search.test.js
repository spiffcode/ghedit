/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'path', 'assert', 'vs/base/common/paths', 'vs/workbench/services/search/node/fileSearch', 'vs/workbench/services/search/node/textSearch'], function (require, exports, path, assert, paths_1, fileSearch_1, textSearch_1) {
    'use strict';
    function count(lineMatches) {
        var count = 0;
        if (lineMatches) {
            for (var i = 0; i < lineMatches.length; i++) {
                var line = lineMatches[i];
                var wordMatches = line.offsetAndLengths;
                count += wordMatches.length;
            }
        }
        return count;
    }
    function rootfolders() {
        return [path.normalize(require.toUrl('./fixtures'))];
    }
    suite('Search', function () {
        test('Files: *.js', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: '*.js'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 4);
                done();
            });
        });
        test('Files: examples/com*', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: paths_1.normalize(paths_1.join('examples', 'com*'), true)
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: examples (fuzzy)', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: 'xl'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 6);
                done();
            });
        });
        test('Files: NPE (CamelCase)', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: 'NullPE'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: *.*', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: '*.*'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 12);
                done();
            });
        });
        test('Files: *.as', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: '*.as'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 0);
                done();
            });
        });
        test('Files: *.* without derived', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: 'site.*',
                excludePattern: { '**/*.css': { 'when': '$(basename).less' } }
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.ok(path.basename(res.path) === 'site.less');
                done();
            });
        });
        test('Files: *.* exclude folder without wildcard', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: '*.*',
                excludePattern: { 'examples': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 7);
                done();
            });
        });
        test('Files: *.* exclude folder with leading wildcard', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: '*.*',
                excludePattern: { '**/examples': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 7);
                done();
            });
        });
        test('Files: *.* exclude folder with trailing wildcard', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: '*.*',
                excludePattern: { 'examples/**': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 7);
                done();
            });
        });
        test('Files: *.* exclude with unicode', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: '*.*',
                excludePattern: { '**/üm laut汉语': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 11);
                done();
            });
        });
        test('Files: Unicode and Spaces', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: '汉语'
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.path), '汉语.txt');
                done();
            });
        });
        test('Files: no results', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: 'nofilematch'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 0);
                done();
            });
        });
        test('Files: absolute path to file ignores excludes', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: path.normalize(path.join(require.toUrl('./fixtures'), 'site.css')),
                excludePattern: { '**/*.css': true }
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.path), 'site.css');
                done();
            });
        });
        test('Files: relative path to file ignores excludes', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: rootfolders(),
                filePattern: path.normalize(path.join('examples', 'company.js')),
                excludePattern: { '**/*.js': true }
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.path), 'company.js');
                done();
            });
        });
        test('Files: extraFiles only', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: [],
                extraFiles: [
                    path.normalize(path.join(require.toUrl('./fixtures'), 'site.css')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'examples', 'company.js')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'index.html'))
                ],
                filePattern: '*.js'
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.path), 'company.js');
                done();
            });
        });
        test('Files: extraFiles only (with include)', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: [],
                extraFiles: [
                    path.normalize(path.join(require.toUrl('./fixtures'), 'site.css')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'examples', 'company.js')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'index.html'))
                ],
                filePattern: '*.*',
                includePattern: { '**/*.css': true }
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.path), 'site.css');
                done();
            });
        });
        test('Files: extraFiles only (with exclude)', function (done) {
            var engine = new fileSearch_1.Engine({
                rootFolders: [],
                extraFiles: [
                    path.normalize(path.join(require.toUrl('./fixtures'), 'site.css')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'examples', 'company.js')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'index.html'))
                ],
                filePattern: '*.*',
                excludePattern: { '**/*.css': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 2);
                done();
            });
        });
        test('Text: GameOfLife', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.js',
                contentPattern: { pattern: 'GameOfLife', modifiers: 'i' }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 4);
                done();
            });
        });
        test('Text: GameOfLife (RegExp)', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.js',
                contentPattern: { pattern: 'Game.?fL\\w?fe', isRegExp: true }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 4);
                done();
            });
        });
        test('Text: GameOfLife (Word Match, Case Sensitive)', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.js',
                contentPattern: { pattern: 'GameOfLife', isWordMatch: true, isCaseSensitive: true }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 4);
                done();
            });
        });
        test('Text: Helvetica (UTF 16)', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.css',
                contentPattern: { pattern: 'Helvetica', modifiers: 'i' }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 2);
                done();
            });
        });
        test('Text: e', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.*',
                contentPattern: { pattern: 'e', modifiers: 'i' }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function (result) { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 748);
                done();
            });
        });
        test('Text: e (with excludes)', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.*',
                contentPattern: { pattern: 'e', modifiers: 'i' },
                excludePattern: { '**/examples': true }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function (result) { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 366);
                done();
            });
        });
        test('Text: e (with includes)', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.*',
                contentPattern: { pattern: 'e', modifiers: 'i' },
                includePattern: { '**/examples/**': true }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function (result) { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 382);
                done();
            });
        });
        test('Text: e (with includes and exclude)', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.*',
                contentPattern: { pattern: 'e', modifiers: 'i' },
                includePattern: { '**/examples/**': true },
                excludePattern: { '**/examples/small.js': true }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function (result) { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 361);
                done();
            });
        });
        test('Text: a (capped)', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.*',
                contentPattern: { pattern: 'a', modifiers: 'i' },
                maxResults: 520
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function (result) { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 520);
                done();
            });
        });
        test('Text: a (no results)', function (done) {
            var c = 0;
            var config = {
                rootFolders: rootfolders(),
                filePattern: '*.*',
                contentPattern: { pattern: 'ahsogehtdas', modifiers: 'i' }
            };
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(config));
            engine.search(function (result) {
                if (result && result.lineMatches) {
                    c += count(result.lineMatches);
                }
            }, function (result) { }, function (error) {
                assert.ok(!error);
                assert.equal(c, 0);
                done();
            });
        });
    });
});
//# sourceMappingURL=search.test.js.map