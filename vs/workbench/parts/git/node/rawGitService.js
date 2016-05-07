define(["require", "exports", 'path', 'vs/base/common/winjs.base', 'vs/base/node/mime', 'vs/base/node/pfs', 'vs/workbench/parts/git/node/git.lib', 'vs/workbench/parts/git/common/git'], function (require, exports, path, winjs_base_1, mime, pfs, git_lib_1, git_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var RawGitService = (function () {
        function RawGitService(repo) {
            this.repo = repo;
        }
        RawGitService.prototype.getVersion = function () {
            return winjs_base_1.TPromise.as(this.repo.version);
        };
        RawGitService.prototype.getRepositoryRoot = function () {
            return this._repositoryRoot || (this._repositoryRoot = pfs.realpath(this.repo.path));
        };
        RawGitService.prototype.serviceState = function () {
            return winjs_base_1.TPromise.as(this.repo
                ? git_1.RawServiceState.OK
                : git_1.RawServiceState.GitNotFound);
        };
        RawGitService.prototype.status = function () {
            var _this = this;
            return this.repo.getStatus()
                .then(function (status) { return _this.repo.getHEAD()
                .then(function (HEAD) {
                if (HEAD.name) {
                    return _this.repo.getBranch(HEAD.name).then(null, function () { return HEAD; });
                }
                else {
                    return HEAD;
                }
            }, function () { return null; })
                .then(function (HEAD) { return winjs_base_1.Promise.join([_this.getRepositoryRoot(), _this.repo.getHeads(), _this.repo.getTags(), _this.repo.getRemotes()]).then(function (r) {
                return {
                    repositoryRoot: r[0],
                    status: status,
                    HEAD: HEAD,
                    heads: r[1],
                    tags: r[2],
                    remotes: r[3]
                };
            }); }); })
                .then(null, function (err) {
                if (err.gitErrorCode === git_1.GitErrorCodes.BadConfigFile) {
                    return winjs_base_1.Promise.wrapError(err);
                }
                else if (err.gitErrorCode === git_1.GitErrorCodes.NotAtRepositoryRoot) {
                    return winjs_base_1.Promise.wrapError(err);
                }
                return null;
            });
        };
        RawGitService.prototype.init = function () {
            var _this = this;
            return this.repo.init().then(function () { return _this.status(); });
        };
        RawGitService.prototype.add = function (filePaths) {
            var _this = this;
            return this.repo.add(filePaths).then(function () { return _this.status(); });
        };
        RawGitService.prototype.stage = function (filePath, content) {
            var _this = this;
            return this.repo.stage(filePath, content).then(function () { return _this.status(); });
        };
        RawGitService.prototype.branch = function (name, checkout) {
            var _this = this;
            return this.repo.branch(name, checkout).then(function () { return _this.status(); });
        };
        RawGitService.prototype.checkout = function (treeish, filePaths) {
            var _this = this;
            return this.repo.checkout(treeish, filePaths).then(function () { return _this.status(); });
        };
        RawGitService.prototype.clean = function (filePaths) {
            var _this = this;
            return this.repo.clean(filePaths).then(function () { return _this.status(); });
        };
        RawGitService.prototype.undo = function () {
            var _this = this;
            return this.repo.undo().then(function () { return _this.status(); });
        };
        RawGitService.prototype.reset = function (treeish, hard) {
            var _this = this;
            return this.repo.reset(treeish, hard).then(function () { return _this.status(); });
        };
        RawGitService.prototype.revertFiles = function (treeish, filePaths) {
            var _this = this;
            return this.repo.revertFiles(treeish, filePaths).then(function () { return _this.status(); });
        };
        RawGitService.prototype.fetch = function () {
            var _this = this;
            return this.repo.fetch().then(null, function (err) {
                if (err.gitErrorCode === git_1.GitErrorCodes.NoRemoteRepositorySpecified) {
                    return winjs_base_1.TPromise.as(null);
                }
                return winjs_base_1.Promise.wrapError(err);
            }).then(function () { return _this.status(); });
        };
        RawGitService.prototype.pull = function (rebase) {
            var _this = this;
            return this.repo.pull(rebase).then(function () { return _this.status(); });
        };
        RawGitService.prototype.push = function (remote, name, options) {
            var _this = this;
            return this.repo.push(remote, name, options).then(function () { return _this.status(); });
        };
        RawGitService.prototype.sync = function () {
            var _this = this;
            return this.repo.sync().then(function () { return _this.status(); });
        };
        RawGitService.prototype.commit = function (message, amend, stage) {
            var _this = this;
            var promise = winjs_base_1.TPromise.as(null);
            if (stage) {
                promise = this.repo.add(null);
            }
            return promise
                .then(function () { return _this.repo.commit(message, stage, amend); })
                .then(function () { return _this.status(); });
        };
        RawGitService.prototype.detectMimetypes = function (filePath, treeish) {
            var _this = this;
            return pfs.exists(path.join(this.repo.path, filePath)).then(function (exists) {
                if (exists) {
                    return new winjs_base_1.TPromise(function (c, e) {
                        mime.detectMimesFromFile(path.join(_this.repo.path, filePath), function (err, result) {
                            if (err) {
                                e(err);
                            }
                            else {
                                c(result.mimes);
                            }
                        });
                    });
                }
                var child = _this.repo.show(treeish + ':' + filePath);
                return new winjs_base_1.TPromise(function (c, e) {
                    mime.detectMimesFromStream(child.stdout, filePath, function (err, result) {
                        if (err) {
                            e(err);
                        }
                        else {
                            c(result.mimes);
                        }
                    });
                });
            });
        };
        // careful, this buffers the whole object into memory
        RawGitService.prototype.show = function (filePath, treeish) {
            treeish = treeish === '~' ? '' : treeish;
            return this.repo.buffer(treeish + ':' + filePath).then(null, function (e) {
                if (e instanceof git_lib_1.GitError) {
                    return ''; // mostly untracked files end up in a git error
                }
                return winjs_base_1.TPromise.wrapError(e);
            });
        };
        RawGitService.prototype.onOutput = function () {
            var _this = this;
            var cancel;
            return new winjs_base_1.Promise(function (c, e, p) {
                cancel = _this.repo.onOutput(p);
            }, function () { return cancel(); });
        };
        return RawGitService;
    }());
    exports.RawGitService = RawGitService;
    var DelayedRawGitService = (function () {
        function DelayedRawGitService(raw) {
            this.raw = raw;
        }
        DelayedRawGitService.prototype.getVersion = function () {
            return this.raw.then(function (raw) { return raw.getVersion(); });
        };
        DelayedRawGitService.prototype.serviceState = function () {
            return this.raw.then(function (raw) { return raw.serviceState(); });
        };
        DelayedRawGitService.prototype.status = function () {
            return this.raw.then(function (raw) { return raw.status(); });
        };
        DelayedRawGitService.prototype.init = function () {
            return this.raw.then(function (raw) { return raw.init(); });
        };
        DelayedRawGitService.prototype.add = function (filesPaths) {
            return this.raw.then(function (raw) { return raw.add(filesPaths); });
        };
        DelayedRawGitService.prototype.stage = function (filePath, content) {
            return this.raw.then(function (raw) { return raw.stage(filePath, content); });
        };
        DelayedRawGitService.prototype.branch = function (name, checkout) {
            return this.raw.then(function (raw) { return raw.branch(name, checkout); });
        };
        DelayedRawGitService.prototype.checkout = function (treeish, filePaths) {
            return this.raw.then(function (raw) { return raw.checkout(treeish, filePaths); });
        };
        DelayedRawGitService.prototype.clean = function (filePaths) {
            return this.raw.then(function (raw) { return raw.clean(filePaths); });
        };
        DelayedRawGitService.prototype.undo = function () {
            return this.raw.then(function (raw) { return raw.undo(); });
        };
        DelayedRawGitService.prototype.reset = function (treeish, hard) {
            return this.raw.then(function (raw) { return raw.reset(treeish, hard); });
        };
        DelayedRawGitService.prototype.revertFiles = function (treeish, filePaths) {
            return this.raw.then(function (raw) { return raw.revertFiles(treeish, filePaths); });
        };
        DelayedRawGitService.prototype.fetch = function () {
            return this.raw.then(function (raw) { return raw.fetch(); });
        };
        DelayedRawGitService.prototype.pull = function (rebase) {
            return this.raw.then(function (raw) { return raw.pull(rebase); });
        };
        DelayedRawGitService.prototype.push = function (origin, name, options) {
            return this.raw.then(function (raw) { return raw.push(origin, name, options); });
        };
        DelayedRawGitService.prototype.sync = function () {
            return this.raw.then(function (raw) { return raw.sync(); });
        };
        DelayedRawGitService.prototype.commit = function (message, amend, stage) {
            return this.raw.then(function (raw) { return raw.commit(message, amend, stage); });
        };
        DelayedRawGitService.prototype.detectMimetypes = function (path, treeish) {
            return this.raw.then(function (raw) { return raw.detectMimetypes(path, treeish); });
        };
        DelayedRawGitService.prototype.show = function (path, treeish) {
            return this.raw.then(function (raw) { return raw.show(path, treeish); });
        };
        DelayedRawGitService.prototype.onOutput = function () {
            return this.raw.then(function (raw) { return raw.onOutput(); });
        };
        return DelayedRawGitService;
    }());
    exports.DelayedRawGitService = DelayedRawGitService;
});
//# sourceMappingURL=rawGitService.js.map