define(["require", "exports", 'vs/workbench/parts/git/common/git', 'vs/base/common/winjs.base'], function (require, exports, git, winjs_base_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var NoOpGitService = (function () {
        function NoOpGitService() {
        }
        NoOpGitService.prototype.getVersion = function () {
            return winjs_base_1.TPromise.as(null);
        };
        NoOpGitService.prototype.serviceState = function () {
            return winjs_base_1.TPromise.as(git.RawServiceState.OK);
        };
        NoOpGitService.prototype.status = function () {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.init = function () {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.add = function (filesPaths) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.stage = function (filePath, content) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.branch = function (name, checkout) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.checkout = function (treeish, filePaths) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.clean = function (filePaths) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.undo = function () {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.reset = function (treeish, hard) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.revertFiles = function (treeish, filePaths) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.fetch = function () {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.pull = function (rebase) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.push = function () {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.sync = function () {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.commit = function (message, amend, stage) {
            return winjs_base_1.TPromise.as(NoOpGitService.STATUS);
        };
        NoOpGitService.prototype.detectMimetypes = function (path, treeish) {
            return winjs_base_1.TPromise.as([]);
        };
        NoOpGitService.prototype.show = function (path, treeish) {
            return winjs_base_1.TPromise.as(null);
        };
        NoOpGitService.prototype.onOutput = function () {
            return winjs_base_1.TPromise.as(function () { return null; });
        };
        NoOpGitService.STATUS = {
            repositoryRoot: null,
            state: git.ServiceState.NotAWorkspace,
            status: [],
            HEAD: null,
            heads: [],
            tags: [],
            remotes: []
        };
        return NoOpGitService;
    }());
    exports.NoOpGitService = NoOpGitService;
});
//# sourceMappingURL=noopGitService.js.map