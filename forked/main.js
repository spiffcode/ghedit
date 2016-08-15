/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'forked/shell', 'vs/base/common/errors', 'vs/base/common/timer', 'vs/base/common/uri', 'vs/platform/event/common/eventService', 'vs/workbench/services/workspace/common/contextService', 'forked/configurationService', 'githubService'], function (require, exports, winjs, shell_1, errors, timer, uri_1, eventService_1, contextService_1, configurationService_1, githubService_1) {
    'use strict';
    // TODO: import path = require('path');
    var path = {
        normalize: function (_path) {
            console.log('path.normalize(\'' + _path + '\')');
            return _path;
        },
        basename: function (_path) {
            console.log('path.basename(\'' + _path + '\')');
            return _path;
        }
    };
    // TODO: import fs = require('fs');
    var fs = {
        realpathSync: function (_path) {
            console.log('fs.realpathSync(\'' + _path + '\')');
            return _path;
        }
    };
    // TODO: import gracefulFs = require('graceful-fs');
    // TODO: gracefulFs.gracefulify(fs);
    var timers = window.GlobalEnvironment.timers;
    var domContentLoaded = winjs.Utilities.ready;
    function startup(environment, globalSettings) {
        // Inherit the user environment
        /* TODO:
        // TODO@Joao: this inheritance should **not** happen here!
        if (process.env['VSCODE_CLI'] !== '1') {
            assign(process.env, environment.userEnv);
        }
        */
        // Shell Configuration
        var shellConfiguration = {
            env: environment
        };
        // Shell Options
        var filesToOpen = environment.filesToOpen && environment.filesToOpen.length ? toInputs(environment.filesToOpen) : null;
        var filesToCreate = environment.filesToCreate && environment.filesToCreate.length ? toInputs(environment.filesToCreate) : null;
        var filesToDiff = environment.filesToDiff && environment.filesToDiff.length ? toInputs(environment.filesToDiff) : null;
        var shellOptions = {
            singleFileMode: !environment.workspacePath,
            filesToOpen: filesToOpen,
            filesToCreate: filesToCreate,
            filesToDiff: filesToDiff,
            extensionsToInstall: environment.extensionsToInstall,
            globalSettings: globalSettings
        };
        if (environment.enablePerformance) {
            timer.ENABLE_TIMER = true;
        }
        var options = {};
        if (environment.userEnv['githubToken']) {
            options['token'] = environment.userEnv['githubToken'];
        }
        else if (environment.userEnv['githubUsername'] && environment.userEnv['githubPassword']) {
            options['username'] = environment.userEnv['githubUsername'];
            options['password'] = environment.userEnv['githubPassword'];
        }
        var githubService = new githubService_1.GithubService(options);
        // TODO: indeterminate progress indicator
        return githubService.authenticateUser().then(function (userInfo) {
            if (!environment.githubRepo)
                // Open workbench without a workspace.
                return openWorkbench(null, shellConfiguration, shellOptions, githubService);
            return githubService.openRepository(environment.githubRepo, environment.githubBranch ? environment.githubBranch : environment.githubTag, !environment.githubBranch).then(function (repoInfo) {
                // Tags aren't editable.
                if (!environment.githubBranch)
                    shellOptions.readOnly = true;
                var workspace = getWorkspace(environment, repoInfo);
                return openWorkbench(workspace, shellConfiguration, shellOptions, githubService);
            }, function (err) {
                // TODO: Welcome experience and/or error message (invalid repo, permissions, ...)
                // Open workbench without a workspace.
                return openWorkbench(null, shellConfiguration, shellOptions, githubService);
            });
        }, function (err) {
            // No user credentials or otherwise unable to authenticate them.
            // TODO: Welcome experience and/or error message (bad credentials, ...)
            // Open workbench without a workspace.
            return openWorkbench(null, shellConfiguration, shellOptions, githubService);
        });
    }
    exports.startup = startup;
    function toInputs(paths) {
        return paths.map(function (p) {
            var input = {
                resource: uri_1.default.file(p.filePath)
            };
            if (p.lineNumber) {
                input.options = {
                    selection: {
                        startLineNumber: p.lineNumber,
                        startColumn: p.columnNumber
                    }
                };
            }
            return input;
        });
    }
    function getWorkspace(environment, repoInfo) {
        if (!environment.workspacePath) {
            return null;
        }
        var workspaceResource = uri_1.default.file(environment.workspacePath);
        var workspace = {
            'resource': workspaceResource,
            'id': environment.githubRepo,
            'name': environment.githubRepo.split('/')[1],
            'uid': Date.parse(repoInfo.created_at),
            'mtime': Date.parse(repoInfo.updated_at),
        };
        return workspace;
    }
    function openWorkbench(workspace, configuration, options, githubService) {
        var eventService = new eventService_1.EventService();
        var contextService = new contextService_1.WorkspaceContextService(eventService, workspace, configuration, options);
        var configurationService = new configurationService_1.ConfigurationService(contextService, eventService);
        // Since the configuration service is one of the core services that is used in so many places, we initialize it
        // right before startup of the workbench shell to have its data ready for consumers
        return configurationService.initialize().then(function () {
            timers.beforeReady = new Date();
            return domContentLoaded(function () {
                timers.afterReady = new Date();
                // Open Shell
                var beforeOpen = new Date();
                var shell = new shell_1.WorkbenchShell(document.body, workspace, {
                    configurationService: configurationService,
                    eventService: eventService,
                    contextService: contextService,
                    githubService: githubService,
                }, configuration, options);
                shell.open();
                shell.joinCreation().then(function () {
                    timer.start(timer.Topic.STARTUP, 'Open Shell, Viewlet & Editor', beforeOpen, 'Workbench has opened after this event with viewlet and editor restored').stop();
                });
                // Inform user about loading issues from the loader
                self.require.config({
                    onError: function (err) {
                        if (err.errorCode === 'load') {
                            shell.onUnexpectedError(errors.loaderError(err));
                        }
                    }
                });
            }, true);
        });
    }
});
//# sourceMappingURL=main.js.map