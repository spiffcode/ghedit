/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/workbench/electron-browser/shell', 'vs/base/common/errors', 'vs/base/common/platform', 'vs/base/common/paths', 'vs/base/common/timer', 'vs/base/common/objects', 'vs/base/common/uri', 'vs/base/common/strings', 'vs/platform/event/common/eventService', 'vs/workbench/services/workspace/common/contextService', 'vs/workbench/services/configuration/node/configurationService', 'path', 'fs', 'graceful-fs'], function (require, exports, winjs, shell_1, errors, platform, paths, timer, objects_1, uri_1, strings, eventService_1, contextService_1, configurationService_1, path, fs, gracefulFs) {
    'use strict';
    gracefulFs.gracefulify(fs);
    var timers = window.MonacoEnvironment.timers;
    var domContentLoaded = winjs.Utilities.ready;
    function startup(environment, globalSettings) {
        // Inherit the user environment
        objects_1.assign(process.env, environment.userEnv);
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
        // Open workbench
        return openWorkbench(getWorkspace(environment), shellConfiguration, shellOptions);
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
            return null;
        }
        var realWorkspacePath = path.normalize(fs.realpathSync(environment.workspacePath));
        if (paths.isUNC(realWorkspacePath) && strings.endsWith(realWorkspacePath, paths.nativeSep)) {
            // for some weird reason, node adds a trailing slash to UNC paths
            // we never ever want trailing slashes as our workspace path unless
            // someone opens root ("/").
            // See also https://github.com/nodejs/io.js/issues/1765
            realWorkspacePath = strings.rtrim(realWorkspacePath, paths.nativeSep);
        }
        var workspaceResource = uri_1.default.file(realWorkspacePath);
        var folderName = path.basename(realWorkspacePath) || realWorkspacePath;
        var folderStat = fs.statSync(realWorkspacePath);
        var workspace = {
            'resource': workspaceResource,
            'id': platform.isLinux ? realWorkspacePath : realWorkspacePath.toLowerCase(),
            'name': folderName,
            'uid': platform.isLinux ? folderStat.ino : folderStat.birthtime.getTime(),
            'mtime': folderStat.mtime.getTime()
        };
        return workspace;
    }
    function openWorkbench(workspace, configuration, options) {
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
                    contextService: contextService
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