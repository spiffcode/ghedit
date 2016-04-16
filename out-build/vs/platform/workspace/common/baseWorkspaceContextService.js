define(["require", "exports", 'vs/base/common/uri', 'vs/base/common/paths', './workspace'], function (require, exports, uri_1, paths, workspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Simple IWorkspaceContextService implementation to allow sharing of this service implementation
     * between different layers of the platform.
     */
    var BaseWorkspaceContextService = (function () {
        function BaseWorkspaceContextService(workspace, configuration, options) {
            if (options === void 0) { options = {}; }
            this.serviceId = workspace_1.IWorkspaceContextService;
            this.workspace = workspace;
            this.configuration = configuration;
            this.options = options;
        }
        BaseWorkspaceContextService.prototype.getWorkspace = function () {
            return this.workspace;
        };
        BaseWorkspaceContextService.prototype.getConfiguration = function () {
            return this.configuration;
        };
        BaseWorkspaceContextService.prototype.getOptions = function () {
            return this.options;
        };
        BaseWorkspaceContextService.prototype.isInsideWorkspace = function (resource) {
            if (resource && this.workspace) {
                return paths.isEqualOrParent(resource.fsPath, this.workspace.resource.fsPath);
            }
            return false;
        };
        BaseWorkspaceContextService.prototype.toWorkspaceRelativePath = function (resource) {
            if (this.isInsideWorkspace(resource)) {
                return paths.normalize(paths.relative(this.workspace.resource.fsPath, resource.fsPath));
            }
            return null;
        };
        BaseWorkspaceContextService.prototype.toResource = function (workspaceRelativePath) {
            if (typeof workspaceRelativePath === 'string' && this.workspace) {
                return uri_1.default.file(paths.join(this.workspace.resource.fsPath, workspaceRelativePath));
            }
            return null;
        };
        return BaseWorkspaceContextService;
    }());
    exports.BaseWorkspaceContextService = BaseWorkspaceContextService;
});
