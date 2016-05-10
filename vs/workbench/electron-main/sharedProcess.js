/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'child_process', 'vs/base/common/uri', 'vs/base/common/objects', 'vs/workbench/electron-main/env', 'vs/workbench/electron-main/settings', 'vs/workbench/electron-main/update-manager'], function (require, exports, cp, uri_1, objects_1, env_1, settings_1, update_manager_1) {
    "use strict";
    var boostrapPath = uri_1.default.parse(require.toUrl('bootstrap')).fsPath;
    function getEnvironment(envService, updateManager) {
        var configuration = objects_1.assign({}, envService.cliArgs);
        configuration.execPath = process.execPath;
        configuration.appName = envService.product.nameLong;
        configuration.appRoot = envService.appRoot;
        configuration.version = envService.version;
        configuration.commitHash = envService.product.commit;
        configuration.appSettingsHome = envService.appSettingsHome;
        configuration.appSettingsPath = envService.appSettingsPath;
        configuration.appKeybindingsPath = envService.appKeybindingsPath;
        configuration.userExtensionsHome = envService.userExtensionsHome;
        configuration.isBuilt = envService.isBuilt;
        configuration.updateFeedUrl = updateManager.feedUrl;
        configuration.updateChannel = updateManager.channel;
        configuration.extensionsGallery = envService.product.extensionsGallery;
        return configuration;
    }
    function _spawnSharedProcess(envService, updateManager, settingsManager) {
        // Make sure the nls configuration travels to the shared process.
        var opts = {
            env: objects_1.assign(objects_1.assign({}, process.env), {
                AMD_ENTRYPOINT: 'vs/workbench/electron-main/sharedProcessMain'
            })
        };
        var result = cp.fork(boostrapPath, ['--type=SharedProcess'], opts);
        // handshake
        result.once('message', function () {
            result.send({
                configuration: {
                    env: getEnvironment(envService, updateManager)
                },
                contextServiceOptions: {
                    globalSettings: settingsManager.globalSettings
                }
            });
        });
        return result;
    }
    var spawnCount = 0;
    function spawnSharedProcess(accessor) {
        var envService = accessor.get(env_1.IEnvironmentService);
        var updateManager = accessor.get(update_manager_1.IUpdateService);
        var settingsManager = accessor.get(settings_1.ISettingsService);
        var child;
        var spawn = function () {
            if (++spawnCount > 10) {
                return;
            }
            child = _spawnSharedProcess(envService, updateManager, settingsManager);
            child.on('exit', spawn);
        };
        spawn();
        return {
            dispose: function () {
                if (child) {
                    child.removeListener('exit', spawn);
                    child.kill();
                    child = null;
                }
            }
        };
    }
    exports.spawnSharedProcess = spawnSharedProcess;
});
//# sourceMappingURL=sharedProcess.js.map