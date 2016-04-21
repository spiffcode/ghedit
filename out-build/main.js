/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'shell', 'vs/base/common/errors', 'vs/base/common/timer', 'vs/base/common/uri', 'vs/platform/event/common/eventService', 'vs/workbench/services/workspace/common/contextService', 'configurationService'], function (require, exports, winjs, shell_1, errors, timer, uri_1, eventService_1, contextService_1, configurationService_1) {
    'use strict';
    var github = require('lib/github');
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
    var timers = window.MonacoEnvironment.timers;
    var domContentLoaded = winjs.Utilities.ready;
    function startup(environment, globalSettings) {
        // Inherit the user environment
        // TODO:	assign(process.env, environment.userEnv);
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
        environment.githubService = new github(options);
        environment.githubService.repo = environment.githubRepo;
        environment.githubService.ref = environment.githubRef;
        // Open workbench
        return getWorkspace(environment).then(function (workspace) {
            return openWorkbench(workspace, shellConfiguration, shellOptions, environment.githubService);
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
    function getWorkspace(environment) {
        if (!environment.workspacePath) {
            return winjs.TPromise.as(null);
        }
        var workspaceResource = uri_1.default.file(environment.workspacePath);
        // Call Github to get repository information used to populate the workspace.
        var repo = environment.githubService.getRepo(environment.githubRepo);
        return new winjs.TPromise(function (c, e) {
            repo.show(function (err, info) {
                err ? e(err) : c(info);
            });
        }).then(function (info) {
            var workspace = {
                'resource': workspaceResource,
                'id': environment.githubRepo,
                'name': environment.githubRepo.split('/')[1],
                'uid': Date.parse(info.created_at),
                'mtime': Date.parse(info.updated_at),
            };
            return workspace;
        }, function (error) {
            console.log('unable to repo.show ' + environment.githubRepo);
        });
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
                    githubService: githubService
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