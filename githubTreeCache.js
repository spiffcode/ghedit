/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/async', 'vs/base/common/paths'], function (require, exports, winjs_base_1, async_1, paths) {
    'use strict';
    var github = require('lib/github');
    var S_IFMT = 0xf000;
    var S_IFLNK = 0xa000;
    var S_IFREG = 0x8000;
    var S_IFDIR = 0x4000;
    var GithubTreeStat = (function () {
        function GithubTreeStat(mode, size) {
            this.mode = mode;
            this.size = size;
        }
        GithubTreeStat.prototype.isDirectory = function () {
            return (this.mode & S_IFMT) === S_IFDIR;
        };
        GithubTreeStat.prototype.isSymbolicLink = function () {
            return (this.mode & S_IFMT) === S_IFLNK;
        };
        return GithubTreeStat;
    }());
    exports.GithubTreeStat = GithubTreeStat;
    var GithubTreeCache = (function () {
        function GithubTreeCache(githubService) {
            this.githubService = githubService;
            this.scheduleRefresh(true);
        }
        GithubTreeCache.prototype.findEntry = function (path, symlinks) {
            if (!this.tree)
                return null;
            // The path must begin with '/'
            var parts = path.split('/');
            if (parts[0] !== '')
                return null;
            // Resolve each successive path component
            var entry = this.tree;
            for (var i = 1; i < parts.length; i++) {
                // Ignore trailing slash
                if (i === parts.length - 1 && parts[i] === '')
                    break;
                // Make sure this entry is a directory and it has children
                if ((entry.mode & S_IFMT) !== S_IFDIR || !entry.children)
                    return null;
                // Get the child entry
                entry = entry.children[parts[i]];
                // Follow symlinks so that only real paths are ever returned.
                // GHCode file loading code doesn't resolve paths with symlinks.
                if (symlinks) {
                    while (entry && (entry.mode & S_IFMT) === S_IFLNK) {
                        if (!entry.realpath)
                            return null;
                        entry = this.findEntry(entry.realpath, true);
                    }
                }
                if (!entry)
                    return null;
            }
            return entry;
        };
        GithubTreeCache.prototype.updateTreeWorker = function (items, refresh_counter) {
            var _this = this;
            var limiter = new async_1.Limiter(1);
            var symlinkPromises = [];
            // Rebuild the tree
            this.tree = { name: '', mode: S_IFDIR, size: 0 };
            items.forEach(function (item) {
                var entry = {
                    name: paths.basename(item.path),
                    mode: parseInt(item.mode, 8),
                    size: item.size
                };
                // Add the entry
                var dir = paths.dirname('/' + item.path);
                var parent = _this.findEntry(dir, false);
                if (!parent.children)
                    parent.children = {};
                parent.children[entry.name] = entry;
                // If it is a symlink, the symlink path needs to be retrieved
                if ((entry.mode & S_IFMT) == S_IFLNK) {
                    entry.realpath = null;
                    symlinkPromises.push(limiter.queue(function () { return new winjs_base_1.TPromise(function (s) {
                        _this.githubService.repo.getBlob(item.sha, function (err, path) {
                            if (!err) {
                                // github.js relies on axios, which returns numbers for results
                                // that can be parsed as numbers. Make sure the path is
                                // converted to a string.
                                entry.realpath = paths.makeAbsolute(paths.join(dir, '' + path));
                            }
                            s(null);
                        });
                    }); }));
                }
            });
            // Wait for the symlink resolution to finish
            winjs_base_1.TPromise.join(symlinkPromises).then(function () {
                if (refresh_counter != _this.refresh_counter) {
                    _this.scheduleRefresh(true);
                }
                else {
                    _this.refresh_counter = 0;
                }
            });
        };
        GithubTreeCache.prototype.updateTree = function () {
            var _this = this;
            // Remember the counter at the start so we know when we've caught up
            var refresh_counter = this.refresh_counter;
            var error = false;
            this.githubService.repo.getRef('heads/' + this.githubService.ref, function (err, sha) {
                if (err) {
                    error = true;
                    return;
                }
                _this.githubService.repo.getTreeRecursive(sha, function (err, items) {
                    if (err) {
                        error = true;
                        return;
                    }
                    _this.updateTreeWorker(items, refresh_counter);
                });
            });
            if (error)
                this.scheduleRefresh(true);
        };
        GithubTreeCache.prototype.scheduleRefresh = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            // Edge trigger delayed updates        
            if (force)
                this.refresh_counter = 0;
            this.refresh_counter++;
            if (this.refresh_counter == 1) {
                setTimeout(function () { return _this.updateTree(); }, 250);
            }
        };
        GithubTreeCache.prototype.stat = function (path, cb) {
            // stat follows symlinks
            var entry = this.findEntry(path, true);
            if (!entry)
                return cb(new Error('Cannot find file or directory.'));
            return cb(null, new GithubTreeStat(entry.mode, entry.size));
        };
        GithubTreeCache.prototype.lstat = function (path, cb) {
            // lstat does not follow symlinks
            var entry = this.findEntry(path, false);
            if (!entry)
                return cb(new Error('Cannot find file or directory.'));
            return cb(null, new GithubTreeStat(entry.mode, entry.size));
        };
        GithubTreeCache.prototype.realpath = function (path, cb) {
            var entry = this.findEntry(path, false);
            if (!entry)
                return cb(new Error('Cannot find file or directory.'));
            if ((entry.mode & S_IFMT) === S_IFLNK) {
                if (entry.realpath)
                    return cb(null, entry.realpath);
            }
            return cb(null, path);
        };
        GithubTreeCache.prototype.readdir = function (path, cb) {
            var entry = this.findEntry(path, true);
            if (!entry)
                return cb(new Error('Cannot find file or directory.'));
            if ((entry.mode & S_IFMT) !== S_IFDIR) {
                cb(new Error('This path is not a directory.'));
                return;
            }
            if (!entry.children) {
                cb(null, []);
                return;
            }
            cb(null, Object.keys(entry.children));
        };
        return GithubTreeCache;
    }());
    exports.GithubTreeCache = GithubTreeCache;
});
//# sourceMappingURL=githubTreeCache.js.map