/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/parts/ipc/common/ipc', './git'], function (require, exports, winjs_base_1, ipc_1, git_1) {
    'use strict';
    var GitChannel = (function () {
        function GitChannel(service) {
            this.service = service;
        }
        GitChannel.prototype.call = function (command, args) {
            switch (command) {
                case 'getVersion': return this.service.then(function (s) { return s.getVersion(); });
                case 'serviceState': return this.service.then(function (s) { return s.serviceState(); });
                case 'status': return this.service.then(function (s) { return s.status(); });
                case 'status': return this.service.then(function (s) { return s.status(); });
                case 'init': return this.service.then(function (s) { return s.init(); });
                case 'add': return this.service.then(function (s) { return s.add(args); });
                case 'stage': return this.service.then(function (s) { return s.stage(args[0], args[1]); });
                case 'branch': return this.service.then(function (s) { return s.branch(args[0], args[1]); });
                case 'checkout': return this.service.then(function (s) { return s.checkout(args[0], args[1]); });
                case 'clean': return this.service.then(function (s) { return s.clean(args); });
                case 'undo': return this.service.then(function (s) { return s.undo(); });
                case 'reset': return this.service.then(function (s) { return s.reset(args[0], args[1]); });
                case 'revertFiles': return this.service.then(function (s) { return s.revertFiles(args[0], args[1]); });
                case 'fetch': return this.service.then(function (s) { return s.fetch(); });
                case 'pull': return this.service.then(function (s) { return s.pull(args); });
                case 'push': return this.service.then(function (s) { return s.push(args[0], args[1], args[2]); });
                case 'sync': return this.service.then(function (s) { return s.sync(); });
                case 'commit': return this.service.then(function (s) { return s.commit(args[0], args[1], args[2]); });
                case 'detectMimetypes': return this.service.then(function (s) { return s.detectMimetypes(args[0], args[1]); });
                case 'show': return this.service.then(function (s) { return s.show(args[0], args[1]); });
                case 'onOutput': return this.service.then(function (s) { return ipc_1.eventToCall(s.onOutput); });
            }
        };
        return GitChannel;
    }());
    exports.GitChannel = GitChannel;
    var UnavailableGitChannel = (function () {
        function UnavailableGitChannel() {
        }
        UnavailableGitChannel.prototype.call = function (command) {
            switch (command) {
                case 'serviceState': return winjs_base_1.TPromise.as(git_1.RawServiceState.GitNotFound);
                default: return winjs_base_1.TPromise.as(null);
            }
        };
        return UnavailableGitChannel;
    }());
    exports.UnavailableGitChannel = UnavailableGitChannel;
    var GitChannelClient = (function () {
        function GitChannelClient(channel) {
            this.channel = channel;
            this._onOutput = ipc_1.eventFromCall(this.channel, 'onOutput');
        }
        Object.defineProperty(GitChannelClient.prototype, "onOutput", {
            get: function () { return this._onOutput; },
            enumerable: true,
            configurable: true
        });
        GitChannelClient.prototype.getVersion = function () {
            return this.channel.call('getVersion');
        };
        GitChannelClient.prototype.serviceState = function () {
            return this.channel.call('serviceState');
        };
        GitChannelClient.prototype.status = function () {
            return this.channel.call('status');
        };
        GitChannelClient.prototype.init = function () {
            return this.channel.call('init');
        };
        GitChannelClient.prototype.add = function (filesPaths) {
            return this.channel.call('add', filesPaths);
        };
        GitChannelClient.prototype.stage = function (filePath, content) {
            return this.channel.call('stage', [filePath, content]);
        };
        GitChannelClient.prototype.branch = function (name, checkout) {
            return this.channel.call('branch', [name, checkout]);
        };
        GitChannelClient.prototype.checkout = function (treeish, filePaths) {
            return this.channel.call('checkout', [treeish, filePaths]);
        };
        GitChannelClient.prototype.clean = function (filePaths) {
            return this.channel.call('clean', filePaths);
        };
        GitChannelClient.prototype.undo = function () {
            return this.channel.call('undo');
        };
        GitChannelClient.prototype.reset = function (treeish, hard) {
            return this.channel.call('reset', [treeish, hard]);
        };
        GitChannelClient.prototype.revertFiles = function (treeish, filePaths) {
            return this.channel.call('revertFiles', [treeish, filePaths]);
        };
        GitChannelClient.prototype.fetch = function () {
            return this.channel.call('fetch');
        };
        GitChannelClient.prototype.pull = function (rebase) {
            return this.channel.call('pull', rebase);
        };
        GitChannelClient.prototype.push = function (remote, name, options) {
            return this.channel.call('push', [remote, name, options]);
        };
        GitChannelClient.prototype.sync = function () {
            return this.channel.call('sync');
        };
        GitChannelClient.prototype.commit = function (message, amend, stage) {
            return this.channel.call('commit', [message, amend, stage]);
        };
        GitChannelClient.prototype.detectMimetypes = function (path, treeish) {
            return this.channel.call('detectMimetypes', [path, treeish]);
        };
        GitChannelClient.prototype.show = function (path, treeish) {
            return this.channel.call('show', [path, treeish]);
        };
        return GitChannelClient;
    }());
    exports.GitChannelClient = GitChannelClient;
    var AskpassChannel = (function () {
        function AskpassChannel(service) {
            this.service = service;
        }
        AskpassChannel.prototype.call = function (command) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            switch (command) {
                case 'askpass': return this.service.askpass(args[0], args[1], args[2]);
            }
        };
        return AskpassChannel;
    }());
    exports.AskpassChannel = AskpassChannel;
    var AskpassChannelClient = (function () {
        function AskpassChannelClient(channel) {
            this.channel = channel;
        }
        AskpassChannelClient.prototype.askpass = function (id, host, command) {
            return this.channel.call('askpass', id, host, command);
        };
        return AskpassChannelClient;
    }());
    exports.AskpassChannelClient = AskpassChannelClient;
});
//# sourceMappingURL=gitIpc.js.map