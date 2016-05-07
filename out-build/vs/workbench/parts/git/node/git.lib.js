/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/node/extfs', 'vs/base/common/mime', 'vs/base/common/lifecycle', 'vs/base/common/objects', 'vs/base/common/uuid', 'vs/nls!vs/workbench/parts/git/node/git.lib', 'vs/base/common/strings', 'vs/workbench/parts/git/common/git', 'vs/base/node/mime', 'vs/platform/files/common/files', 'child_process', 'vs/base/node/encoding'], function (require, exports, winjs_base_1, extfs, mime_1, lifecycle_1, objects, uuid, nls, strings, git_1, mime_2, files, child_process_1, encoding_1) {
    "use strict";
    function exec(child, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var disposables = [];
        var once = function (ee, name, fn) {
            ee.once(name, fn);
            disposables.push(lifecycle_1.toDisposable(function () { return ee.removeListener(name, fn); }));
        };
        var on = function (ee, name, fn) {
            ee.on(name, fn);
            disposables.push(lifecycle_1.toDisposable(function () { return ee.removeListener(name, fn); }));
        };
        return winjs_base_1.TPromise.join([
            new winjs_base_1.TPromise(function (c, e) {
                once(child, 'error', e);
                once(child, 'exit', c);
            }),
            new winjs_base_1.TPromise(function (c) {
                var buffers = [];
                on(child.stdout, 'data', function (b) { return buffers.push(b); });
                once(child.stdout, 'close', function () { return c(encoding_1.decode(Buffer.concat(buffers), encoding)); });
            }),
            new winjs_base_1.TPromise(function (c) {
                var buffers = [];
                on(child.stderr, 'data', function (b) { return buffers.push(b); });
                once(child.stderr, 'close', function () { return c(encoding_1.decode(Buffer.concat(buffers), encoding)); });
            })
        ]).then(function (values) {
            lifecycle_1.dispose(disposables);
            return {
                exitCode: values[0],
                stdout: values[1],
                stderr: values[2]
            };
        });
    }
    var GitError = (function () {
        function GitError(data) {
            if (data.error) {
                this.error = data.error;
                this.message = data.error.message;
            }
            else {
                this.error = null;
            }
            this.message = this.message || data.message || 'Git error';
            this.stdout = data.stdout || null;
            this.stderr = data.stderr || null;
            this.exitCode = data.exitCode || null;
            this.gitErrorCode = data.gitErrorCode || null;
            this.gitCommand = data.gitCommand || null;
        }
        GitError.prototype.toString = function () {
            var result = this.message + ' ' + JSON.stringify({
                exitCode: this.exitCode,
                gitErrorCode: this.gitErrorCode,
                gitCommand: this.gitCommand,
                stdout: this.stdout,
                stderr: this.stderr
            }, null, 2);
            if (this.error) {
                result += this.error.stack;
            }
            return result;
        };
        return GitError;
    }());
    exports.GitError = GitError;
    var Git = (function () {
        function Git(options) {
            this.gitPath = options.gitPath;
            this.version = options.version;
            this.tmpPath = options.tmpPath;
            var encoding = options.defaultEncoding || 'utf8';
            this.defaultEncoding = encoding_1.encodingExists(encoding) ? encoding : 'utf8';
            this.env = options.env || {};
            this.outputListeners = [];
        }
        Git.prototype.run = function (cwd, args, options) {
            if (options === void 0) { options = {}; }
            options = objects.assign({ cwd: cwd }, options || {});
            return this.exec(args, options);
        };
        Git.prototype.stream = function (cwd, args, options) {
            if (options === void 0) { options = {}; }
            options = objects.assign({ cwd: cwd }, options || {});
            return this.spawn(args, options);
        };
        Git.prototype.open = function (repository, env) {
            if (env === void 0) { env = {}; }
            return new Repository(this, repository, this.defaultEncoding, env);
        };
        Git.prototype.clone = function (repository, repoURL) {
            var _this = this;
            return this.exec(['clone', repoURL, repository]).then(function () { return true; }, function (err) {
                return new winjs_base_1.TPromise(function (c, e) {
                    // If there's any error, git will still leave the folder in the FS,
                    // so we need to remove it.
                    extfs.del(repository, _this.tmpPath, function (err) {
                        if (err) {
                            return e(err);
                        }
                        c(true);
                    });
                });
            });
        };
        Git.prototype.config = function (name, value) {
            return this.exec(['config', '--global', name, value]);
        };
        Git.prototype.exec = function (args, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var child = this.spawn(args, options);
            if (options.input) {
                child.stdin.end(options.input, 'utf8');
            }
            return exec(child).then(function (result) {
                if (result.exitCode) {
                    var gitErrorCode = null;
                    if (/Authentication failed/.test(result.stderr)) {
                        gitErrorCode = git_1.GitErrorCodes.AuthenticationFailed;
                    }
                    else if (/Not a git repository/.test(result.stderr)) {
                        gitErrorCode = git_1.GitErrorCodes.NotAGitRepository;
                    }
                    else if (/bad config file/.test(result.stderr)) {
                        gitErrorCode = git_1.GitErrorCodes.BadConfigFile;
                    }
                    else if (/cannot make pipe for command substitution|cannot create standard input pipe/.test(result.stderr)) {
                        gitErrorCode = git_1.GitErrorCodes.CantCreatePipe;
                    }
                    else if (/Repository not found/.test(result.stderr)) {
                        gitErrorCode = git_1.GitErrorCodes.RepositoryNotFound;
                    }
                    else if (/unable to access/.test(result.stderr)) {
                        gitErrorCode = git_1.GitErrorCodes.CantAccessRemote;
                    }
                    if (options.log !== false) {
                        _this.log(result.stderr);
                    }
                    return winjs_base_1.TPromise.wrapError(new GitError({
                        message: 'Failed to execute git',
                        stdout: result.stdout,
                        stderr: result.stderr,
                        exitCode: result.exitCode,
                        gitErrorCode: gitErrorCode,
                        gitCommand: args[0]
                    }));
                }
                return result;
            });
        };
        Git.prototype.spawn = function (args, options) {
            if (options === void 0) { options = {}; }
            if (!this.gitPath) {
                throw new Error('git could not be found in the system.');
            }
            if (!options) {
                options = {};
            }
            if (!options.stdio && !options.input) {
                options.stdio = ['ignore', null, null]; // Unless provided, ignore stdin and leave default streams for stdout and stderr
            }
            options.env = objects.assign({}, options.env || {});
            options.env = objects.assign(options.env, this.env);
            options.env = objects.assign(options.env, {
                MONACO_REQUEST_GUID: uuid.v4().asHex(),
                VSCODE_GIT_REQUEST_ID: uuid.v4().asHex(),
                MONACO_GIT_COMMAND: args[0]
            });
            if (options.log !== false) {
                this.log(strings.format('git {0}\n', args.join(' ')));
            }
            return child_process_1.spawn(this.gitPath, args, options);
        };
        Git.prototype.onOutput = function (listener) {
            var _this = this;
            this.outputListeners.push(listener);
            return function () { return _this.outputListeners.splice(_this.outputListeners.indexOf(listener), 1); };
        };
        Git.prototype.log = function (output) {
            this.outputListeners.forEach(function (l) { return l(output); });
        };
        return Git;
    }());
    exports.Git = Git;
    var Repository = (function () {
        function Repository(git, repository, defaultEncoding, env) {
            if (env === void 0) { env = {}; }
            this.git = git;
            this.repository = repository;
            this.defaultEncoding = defaultEncoding;
            this.env = env;
        }
        Object.defineProperty(Repository.prototype, "version", {
            get: function () {
                return this.git.version;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Repository.prototype, "path", {
            get: function () {
                return this.repository;
            },
            enumerable: true,
            configurable: true
        });
        Repository.prototype.run = function (args, options) {
            if (options === void 0) { options = {}; }
            options.env = objects.assign({}, options.env || {});
            options.env = objects.assign(options.env, this.env);
            return this.git.run(this.repository, args, options);
        };
        Repository.prototype.stream = function (args, options) {
            if (options === void 0) { options = {}; }
            options.env = objects.assign({}, options.env || {});
            options.env = objects.assign(options.env, this.env);
            return this.git.stream(this.repository, args, options);
        };
        Repository.prototype.spawn = function (args, options) {
            if (options === void 0) { options = {}; }
            options.env = objects.assign({}, options.env || {});
            options.env = objects.assign(options.env, this.env);
            return this.git.spawn(args, options);
        };
        Repository.prototype.init = function () {
            return this.run(['init']);
        };
        Repository.prototype.config = function (scope, key, value, options) {
            var args = ['config'];
            if (scope) {
                args.push('--' + scope);
            }
            args.push(key);
            if (value) {
                args.push(value);
            }
            return this.run(args, options).then(function (result) { return result.stdout; });
        };
        Repository.prototype.show = function (object) {
            return this.stream(['show', object]);
        };
        Repository.prototype.buffer = function (object) {
            var _this = this;
            var child = this.show(object);
            return new winjs_base_1.Promise(function (c, e) {
                mime_2.detectMimesFromStream(child.stdout, null, function (err, result) {
                    if (err) {
                        e(err);
                    }
                    else if (mime_1.isBinaryMime(result.mimes)) {
                        e({
                            message: nls.localize(0, null),
                            fileOperationResult: files.FileOperationResult.FILE_IS_BINARY
                        });
                    }
                    else {
                        c(_this.doBuffer(object));
                    }
                });
            });
        };
        Repository.prototype.doBuffer = function (object) {
            var child = this.show(object);
            return exec(child, this.defaultEncoding).then(function (_a) {
                var exitCode = _a.exitCode, stdout = _a.stdout;
                if (exitCode) {
                    return winjs_base_1.TPromise.wrapError(new GitError({
                        message: 'Could not buffer object.',
                        exitCode: exitCode
                    }));
                }
                return winjs_base_1.TPromise.as(stdout);
            });
        };
        Repository.prototype.add = function (paths) {
            var args = ['add', '-A', '--'];
            if (paths && paths.length) {
                args.push.apply(args, paths);
            }
            else {
                args.push('.');
            }
            return this.run(args);
        };
        Repository.prototype.stage = function (path, data) {
            var _this = this;
            var child = this.stream(['hash-object', '--stdin', '-w'], { stdio: [null, null, null] });
            child.stdin.end(data, 'utf8');
            return exec(child).then(function (_a) {
                var exitCode = _a.exitCode, stdout = _a.stdout;
                if (exitCode) {
                    return winjs_base_1.TPromise.wrapError(new GitError({
                        message: 'Could not hash object.',
                        exitCode: exitCode
                    }));
                }
                return _this.run(['update-index', '--cacheinfo', '100644', stdout, path]);
            });
        };
        Repository.prototype.checkout = function (treeish, paths) {
            var args = ['checkout', '-q'];
            if (treeish) {
                args.push(treeish);
            }
            if (paths && paths.length) {
                args.push('--');
                args.push.apply(args, paths);
            }
            return this.run(args).then(null, function (err) {
                if (/Please, commit your changes or stash them/.test(err.stderr)) {
                    err.gitErrorCode = git_1.GitErrorCodes.DirtyWorkTree;
                }
                return winjs_base_1.Promise.wrapError(err);
            });
        };
        Repository.prototype.commit = function (message, all, amend) {
            var _this = this;
            var args = ['commit', '--quiet', '--allow-empty-message', '--file', '-'];
            if (all) {
                args.push('--all');
            }
            if (amend) {
                args.push('--amend');
            }
            return this.run(args, { input: message || '' }).then(null, function (commitErr) {
                if (/not possible because you have unmerged files/.test(commitErr.stderr)) {
                    commitErr.gitErrorCode = git_1.GitErrorCodes.UnmergedChanges;
                    return winjs_base_1.Promise.wrapError(commitErr);
                }
                return _this.run(['config', '--get-all', 'user.name']).then(null, function (err) {
                    err.gitErrorCode = git_1.GitErrorCodes.NoUserNameConfigured;
                    return winjs_base_1.Promise.wrapError(err);
                }).then(function () {
                    return _this.run(['config', '--get-all', 'user.email']).then(null, function (err) {
                        err.gitErrorCode = git_1.GitErrorCodes.NoUserEmailConfigured;
                        return winjs_base_1.Promise.wrapError(err);
                    }).then(function () {
                        return winjs_base_1.Promise.wrapError(commitErr);
                    });
                });
            });
        };
        Repository.prototype.branch = function (name, checkout) {
            var args = checkout ? ['checkout', '-q', '-b', name] : ['branch', '-q', name];
            return this.run(args);
        };
        Repository.prototype.clean = function (paths) {
            var args = ['clean', '-f', '-q', '--'].concat(paths);
            return this.run(args);
        };
        Repository.prototype.undo = function () {
            var _this = this;
            return this.run(['clean', '-fd']).then(function () {
                return _this.run(['checkout', '--', '.']).then(null, function (err) {
                    if (/did not match any file\(s\) known to git\./.test(err.stderr)) {
                        return winjs_base_1.TPromise.as(null);
                    }
                    return winjs_base_1.Promise.wrapError(err);
                });
            });
        };
        Repository.prototype.reset = function (treeish, hard) {
            if (hard === void 0) { hard = false; }
            var args = ['reset'];
            if (hard) {
                args.push('--hard');
            }
            args.push(treeish);
            return this.run(args);
        };
        Repository.prototype.revertFiles = function (treeish, paths) {
            var _this = this;
            return this.run(['branch']).then(function (result) {
                var args;
                // In case there are no branches, we must use rm --cached
                if (!result.stdout) {
                    args = ['rm', '--cached', '-r', '--'];
                }
                else {
                    args = ['reset', '-q', treeish, '--'];
                }
                if (paths && paths.length) {
                    args.push.apply(args, paths);
                }
                else {
                    args.push('.');
                }
                return _this.run(args).then(null, function (err) {
                    // In case there are merge conflicts to be resolved, git reset will output
                    // some "needs merge" data. We try to get around that.
                    if (/([^:]+: needs merge\n)+/m.test(err.stdout)) {
                        return winjs_base_1.TPromise.as(null);
                    }
                    return winjs_base_1.Promise.wrapError(err);
                });
            });
        };
        Repository.prototype.fetch = function () {
            return this.run(['fetch']).then(null, function (err) {
                if (/No remote repository specified\./.test(err.stderr)) {
                    err.gitErrorCode = git_1.GitErrorCodes.NoRemoteRepositorySpecified;
                }
                else if (/Could not read from remote repository/.test(err.stderr)) {
                    err.gitErrorCode = git_1.GitErrorCodes.RemoteConnectionError;
                }
                return winjs_base_1.Promise.wrapError(err);
            });
        };
        Repository.prototype.pull = function (rebase) {
            var args = ['pull'];
            if (rebase) {
                args.push('-r');
            }
            return this.run(args).then(null, function (err) {
                if (/^CONFLICT \([^)]+\): \b/m.test(err.stdout)) {
                    err.gitErrorCode = git_1.GitErrorCodes.Conflict;
                }
                else if (/Please tell me who you are\./.test(err.stderr)) {
                    err.gitErrorCode = git_1.GitErrorCodes.NoUserNameConfigured;
                }
                else if (/Could not read from remote repository/.test(err.stderr)) {
                    err.gitErrorCode = git_1.GitErrorCodes.RemoteConnectionError;
                }
                else if (/Pull is not possible because you have unmerged files|Cannot pull with rebase: You have unstaged changes|Your local changes to the following files would be overwritten|Please, commit your changes before you can merge/.test(err.stderr)) {
                    err.gitErrorCode = git_1.GitErrorCodes.DirtyWorkTree;
                }
                return winjs_base_1.Promise.wrapError(err);
            });
        };
        Repository.prototype.push = function (remote, name, options) {
            var args = ['push'];
            if (options && options.setUpstream) {
                args.push('-u');
            }
            if (remote) {
                args.push(remote);
            }
            if (name) {
                args.push(name);
            }
            return this.run(args).then(null, function (err) {
                if (/^error: failed to push some refs to\b/m.test(err.stderr)) {
                    err.gitErrorCode = git_1.GitErrorCodes.PushRejected;
                }
                else if (/Could not read from remote repository/.test(err.stderr)) {
                    err.gitErrorCode = git_1.GitErrorCodes.RemoteConnectionError;
                }
                return winjs_base_1.Promise.wrapError(err);
            });
        };
        Repository.prototype.sync = function () {
            var _this = this;
            return this.pull().then(function () { return _this.push(); });
        };
        Repository.prototype.getRoot = function () {
            return this.run(['rev-parse', '--show-toplevel'], { log: false }).then(function (result) { return result.stdout.trim(); });
        };
        Repository.prototype.getStatus = function () {
            return this.run(['status', '-z', '-u'], { log: false }).then(function (executionResult) {
                var status = executionResult.stdout;
                var result = [];
                var current;
                var i = 0;
                function readName() {
                    var start = i;
                    var c;
                    while ((c = status.charAt(i)) !== '\u0000') {
                        i++;
                    }
                    return status.substring(start, i++);
                }
                while (i < status.length) {
                    current = {
                        x: status.charAt(i++),
                        y: status.charAt(i++),
                        path: null,
                        mimetype: null
                    };
                    i++;
                    if (current.x === 'R') {
                        current.rename = readName();
                    }
                    current.path = readName();
                    current.mimetype = mime_1.guessMimeTypes(current.path)[0];
                    // If path ends with slash, it must be a nested git repo
                    if (current.path[current.path.length - 1] === '/') {
                        continue;
                    }
                    result.push(current);
                }
                return winjs_base_1.TPromise.as(result);
            });
        };
        Repository.prototype.getHEAD = function () {
            var _this = this;
            return this.run(['symbolic-ref', '--short', 'HEAD'], { log: false }).then(function (result) {
                if (!result.stdout) {
                    return winjs_base_1.TPromise.wrapError(new Error('Not in a branch'));
                }
                return winjs_base_1.TPromise.as({ name: result.stdout.trim() });
            }, function (err) {
                return _this.run(['rev-parse', 'HEAD'], { log: false }).then(function (result) {
                    if (!result.stdout) {
                        return winjs_base_1.TPromise.wrapError(new Error('Error parsing HEAD'));
                    }
                    return winjs_base_1.TPromise.as({ commit: result.stdout.trim() });
                });
            });
        };
        Repository.prototype.getHeads = function () {
            return this.run(['for-each-ref', '--format', '%(refname:short) %(objectname)', 'refs/heads/'], { log: false }).then(function (result) {
                return result.stdout.trim().split('\n')
                    .filter(function (b) { return !!b; })
                    .map(function (b) { return b.trim().split(' '); })
                    .map(function (a) { return ({ name: a[0], commit: a[1] }); });
            });
        };
        Repository.prototype.getTags = function () {
            return this.run(['for-each-ref', '--format', '%(refname:short) %(objectname)', 'refs/tags/'], { log: false }).then(function (result) {
                return result.stdout.trim().split('\n')
                    .filter(function (b) { return !!b; })
                    .map(function (b) { return b.trim().split(' '); })
                    .map(function (a) { return ({ name: a[0], commit: a[1] }); });
            });
        };
        Repository.prototype.getRemotes = function () {
            return this.run(['remote'], { log: false })
                .then(function (result) { return result.stdout
                .trim()
                .split('\n')
                .filter(function (b) { return !!b; })
                .map(function (name) { return ({ name: name }); }); });
        };
        Repository.prototype.getBranch = function (branch) {
            var _this = this;
            if (branch === 'HEAD') {
                return this.getHEAD();
            }
            return this.run(['rev-parse', branch], { log: false }).then(function (result) {
                if (!result.stdout) {
                    return winjs_base_1.TPromise.wrapError(new Error('No such branch'));
                }
                var commit = result.stdout.trim();
                return _this.run(['rev-parse', '--symbolic-full-name', '--abbrev-ref', branch + '@{u}'], { log: false }).then(function (result) {
                    var upstream = result.stdout.trim();
                    return _this.run(['rev-list', '--left-right', branch + '...' + upstream], { log: false }).then(function (result) {
                        var ahead = 0, behind = 0;
                        var i = 0;
                        while (i < result.stdout.length) {
                            switch (result.stdout.charAt(i)) {
                                case '<':
                                    ahead++;
                                    break;
                                case '>':
                                    behind++;
                                    break;
                                default:
                                    i++;
                                    break;
                            }
                            while (result.stdout.charAt(i++) !== '\n') { }
                        }
                        return {
                            name: branch,
                            commit: commit,
                            upstream: upstream,
                            ahead: ahead,
                            behind: behind
                        };
                    });
                }, function () {
                    return { name: branch, commit: commit };
                });
            });
        };
        Repository.prototype.onOutput = function (listener) {
            return this.git.onOutput(listener);
        };
        return Repository;
    }());
    exports.Repository = Repository;
});
//# sourceMappingURL=git.lib.js.map