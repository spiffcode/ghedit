define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/parts/ipc/node/ipc.cp', 'vs/base/common/objects', 'vs/base/common/uri', 'vs/workbench/parts/git/common/git', 'vs/workbench/parts/git/node/git.lib', 'vs/workbench/parts/git/node/rawGitService', 'path', 'os', 'vs/base/node/pfs', 'vs/workbench/parts/git/common/gitIpc'], function (require, exports, winjs_base_1, ipc_cp_1, objects, uri_1, git_1, gitlib, rawGitService_1, path_1, os_1, pfs_1, gitIpc_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function createRawGitService(gitPath, workspaceRoot, defaultEncoding, exePath, version) {
        if (!gitPath) {
            return winjs_base_1.TPromise.as(new rawGitService_1.RawGitService(null));
        }
        var gitRootPath = uri_1.default.parse(require.toUrl('vs/workbench/parts/git/node')).fsPath;
        var bootstrapPath = uri_1.default.parse(require.toUrl('bootstrap')).fsPath + ".js";
        workspaceRoot = path_1.normalize(workspaceRoot);
        var env = objects.assign({}, process.env, {
            GIT_ASKPASS: path_1.join(gitRootPath, 'askpass.sh'),
            VSCODE_GIT_ASKPASS_BOOTSTRAP: bootstrapPath,
            VSCODE_GIT_ASKPASS_NODE: exePath,
            VSCODE_GIT_ASKPASS_MODULE_ID: 'vs/workbench/parts/git/node/askpass'
        });
        var git = new gitlib.Git({
            gitPath: gitPath, version: version,
            tmpPath: os_1.tmpdir(),
            defaultEncoding: defaultEncoding,
            env: env
        });
        var repo = git.open(workspaceRoot);
        return repo.getRoot()
            .then(null, function (err) {
            if (err instanceof gitlib.GitError && err.gitErrorCode === git_1.GitErrorCodes.NotAGitRepository) {
                return workspaceRoot;
            }
            return winjs_base_1.TPromise.wrapError(err);
        })
            .then(function (root) { return pfs_1.realpath(root); })
            .then(function (root) { return git.open(root); })
            .then(function (repo) { return new rawGitService_1.RawGitService(repo); });
    }
    var server = new ipc_cp_1.Server();
    var service = createRawGitService(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
    var channel = new gitIpc_1.GitChannel(service);
    server.registerChannel('git', channel);
});
//# sourceMappingURL=gitApp.js.map