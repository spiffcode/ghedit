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
    var DirEntry = (function () {
        function DirEntry(name, mode, size, sha) {
            this.name = name;
            this.mode = mode;
            this.size = size;
            this.sha = sha;
        }
        DirEntry.prototype.isDirectory = function () {
            return (this.mode & S_IFMT) === S_IFDIR;
        };
        DirEntry.prototype.isSymbolicLink = function () {
            return (this.mode & S_IFMT) === S_IFLNK;
        };
        return DirEntry;
    }());
    var GithubTreeCache = (function () {
        function GithubTreeCache(githubService, supportSymlinks) {
            this.githubService = githubService;
            this.supportSymlinks = supportSymlinks;
            this.markDirty();
            this.fakeMtime = new Date().getTime();
        }
        GithubTreeCache.prototype.markDirty = function () {
            this.dirty = true;
        };
        GithubTreeCache.prototype.getFakeMtime = function () {
            return this.fakeMtime;
        };
        GithubTreeCache.prototype.findEntry = function (path, useSymlinks) {
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
                // Follow symlinks
                if (this.supportSymlinks) {
                    if (i !== parts.length - 1 || useSymlinks) {
                        while (entry && (entry.mode & S_IFMT) === S_IFLNK) {
                            if (!entry.realpath)
                                return null;
                            entry = this.findEntry(entry.realpath, true);
                        }
                    }
                }
                if (!entry)
                    return null;
            }
            return entry;
        };
        GithubTreeCache.prototype.updateTreeWorker = function (items) {
            var _this = this;
            // Limit to one query at a time to not flood github api
            var limiter = new async_1.Limiter(1);
            var promises = [];
            // Rebuild the tree
            this.tree = new DirEntry('', S_IFDIR, 0, '');
            items.forEach(function (item) {
                // Add the entry
                var entry = new DirEntry(paths.basename(item.path), parseInt(item.mode, 8), item.size || 0, item.sha);
                var dir = paths.dirname('/' + item.path);
                var parent = _this.findEntry(dir, false);
                if (!parent.children)
                    parent.children = {};
                parent.children[entry.name] = entry;
                // If it's a type 'commit' it may be a git submodule in which case we need the gitsubmodule_url.
                if (item.type === 'commit') {
                    promises.push(limiter.queue(function () { return new winjs_base_1.TPromise(function (c, e) {
                        _this.githubService.repo.contents(_this.githubService.ref, item.path, function (err, contents) {
                            if (err) {
                                console.log('repo.contents api failed ' + item.path);
                                e(null);
                            }
                            else {
                                if (contents.submodule_git_url) {
                                    entry.submodule_git_url = contents.submodule_git_url;
                                }
                                c(null);
                            }
                        });
                    }); }));
                }
                // If it is a symlink, the symlink's realpath needs to be retrieved              
                if (_this.supportSymlinks && entry.isSymbolicLink()) {
                    entry.realpath = null;
                    promises.push(limiter.queue(function () { return new winjs_base_1.TPromise(function (c, e) {
                        _this.githubService.repo.getBlob(item.sha, function (err, path) {
                            if (err) {
                                e(null);
                            }
                            else {
                                // github.js relies on axios, which returns numbers for results
                                // that can be parsed as numbers. Make sure the path is
                                // converted to a string.
                                entry.realpath = paths.makeAbsolute(paths.join(dir, '' + path));
                                c(null);
                            }
                        });
                    }); }));
                }
            });
            // Wait for the symlink resolution to finish
            return winjs_base_1.TPromise.join(promises).then(function () {
                return;
            });
        };
        GithubTreeCache.prototype.refresh = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                if (!_this.dirty)
                    return c(null);
                _this.githubService.repo.getRef('heads/' + _this.githubService.ref, function (err, sha) {
                    if (err)
                        return e(null);
                    _this.githubService.repo.getTreeRecursive(sha, function (err, items) {
                        if (err)
                            return e(null);
                        _this.updateTreeWorker(items).then(function () {
                            _this.dirty = false;
                            return c(null);
                        }, function () { return e(null); });
                    });
                });
            });
        };
        GithubTreeCache.prototype.stat = function (path, cb) {
            var _this = this;
            // stat follows symlinks
            this.refresh().then(function () {
                var entry = _this.findEntry(path, true);
                if (!entry)
                    return cb(new Error('Cannot find file or directory.'));
                return cb(null, entry);
            }, function () {
                return cb(new Error('Error contacting service.'));
            });
        };
        GithubTreeCache.prototype.lstat = function (path, cb) {
            var _this = this;
            // lstat does not follow symlinks
            this.refresh().then(function () {
                var entry = _this.findEntry(path, false);
                if (!entry)
                    return cb(new Error('Cannot find file or directory.'));
                return cb(null, entry);
            }, function () {
                return cb(new Error('Error contacting service.'));
            });
        };
        GithubTreeCache.prototype.realpath = function (path, cb) {
            var _this = this;
            this.refresh().then(function () {
                var entry = _this.findEntry(path, false);
                if (!entry)
                    return cb(new Error('Cannot find file or directory.'));
                if ((entry.mode & S_IFMT) === S_IFLNK) {
                    if (entry.realpath)
                        return cb(null, entry.realpath);
                }
                return cb(null, path);
            }, function () {
                return cb(new Error('Error contacting service.'));
            });
        };
        GithubTreeCache.prototype.readdir = function (path, cb) {
            var _this = this;
            this.refresh().then(function () {
                var entry = _this.findEntry(path, true);
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
            }, function () {
                return cb(new Error('Error contacting service.'));
            });
        };
        return GithubTreeCache;
    }());
    exports.GithubTreeCache = GithubTreeCache;
});
//# sourceMappingURL=githubTreeCache.js.map