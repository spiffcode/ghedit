var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/node/service.cp', 'vs/base/common/objects', 'vs/base/common/uri', 'vs/workbench/parts/git/common/git', 'vs/workbench/parts/git/node/git.lib', 'vs/workbench/parts/git/node/rawGitService', 'path', 'os', 'vs/base/node/pfs'], function (require, exports, winjs_base_1, service_cp_1, objects, uri_1, git_1, gitlib, rawGitService_1, path_1, os_1, pfs_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var IPCRawGitService = (function (_super) {
        __extends(IPCRawGitService, _super);
        function IPCRawGitService(gitPath, workspaceRoot, defaultEncoding, exePath, version) {
            if (!gitPath) {
                _super.call(this, winjs_base_1.TPromise.as(new rawGitService_1.RawGitService(null)));
            }
            else {
                var gitRootPath = uri_1.default.parse(require.toUrl('vs/workbench/parts/git/electron-main')).fsPath;
                var bootstrapPath = uri_1.default.parse(require.toUrl('bootstrap')).fsPath + ".js";
                workspaceRoot = path_1.normalize(workspaceRoot);
                var env = objects.assign({}, process.env, {
                    GIT_ASKPASS: path_1.join(gitRootPath, 'askpass.sh'),
                    VSCODE_GIT_ASKPASS_BOOTSTRAP: bootstrapPath,
                    VSCODE_GIT_ASKPASS_NODE: exePath,
                    VSCODE_GIT_ASKPASS_MODULE_ID: 'vs/workbench/parts/git/electron-main/askpass'
                });
                var git_2 = new gitlib.Git({
                    gitPath: gitPath, version: version,
                    tmpPath: os_1.tmpdir(),
                    defaultEncoding: defaultEncoding,
                    env: env
                });
                var repo = git_2.open(workspaceRoot);
                var promise = repo.getRoot()
                    .then(null, function (err) {
                    if (err instanceof gitlib.GitError && err.gitErrorCode === git_1.GitErrorCodes.NotAGitRepository) {
                        return workspaceRoot;
                    }
                    return winjs_base_1.TPromise.wrapError(err);
                })
                    .then(function (root) { return pfs_1.realpath(root); })
                    .then(function (root) { return git_2.open(root); })
                    .then(function (repo) { return new rawGitService_1.RawGitService(repo); });
                _super.call(this, promise);
            }
        }
        return IPCRawGitService;
    }(rawGitService_1.DelayedRawGitService));
    var server = new service_cp_1.Server();
    server.registerService('GitService', new IPCRawGitService(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]));
});
//# sourceMappingURL=gitApp.js.map