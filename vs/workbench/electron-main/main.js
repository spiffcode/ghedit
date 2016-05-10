/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'electron', 'fs', 'vs/nls', 'vs/base/common/objects', 'vs/base/common/platform', 'vs/workbench/electron-main/env', 'vs/workbench/electron-main/windows', 'vs/workbench/electron-main/lifecycle', 'vs/workbench/electron-main/menus', 'vs/workbench/electron-main/settings', 'vs/workbench/electron-main/update-manager', 'vs/base/parts/ipc/node/ipc.net', 'vs/base/node/env', 'vs/base/common/winjs.base', 'vs/workbench/parts/git/common/gitIpc', 'vs/workbench/parts/git/electron-main/askpassService', 'vs/workbench/electron-main/sharedProcess', './launch', 'vs/platform/instantiation/common/instantiation', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/instantiation/common/serviceCollection', 'vs/platform/instantiation/common/descriptors', './log', './storage'], function (require, exports, electron_1, fs, nls, objects_1, platform, env_1, windows, lifecycle_1, menus_1, settings_1, update_manager_1, ipc_net_1, env_2, winjs_base_1, gitIpc_1, askpassService_1, sharedProcess_1, launch_1, instantiation_1, instantiationService_1, serviceCollection_1, descriptors_1, log_1, storage_1) {
    'use strict';
    function quit(accessor, arg) {
        var logService = accessor.get(log_1.ILogService);
        var exitCode = 0;
        if (typeof arg === 'string') {
            logService.log(arg);
        }
        else {
            exitCode = 1; // signal error to the outside
            if (arg.stack) {
                console.error(arg.stack);
            }
            else {
                console.error('Startup error: ' + arg.toString());
            }
        }
        process.exit(exitCode); // in main, process.exit === app.exit
    }
    function main(accessor, ipcServer, userEnv) {
        var instantiationService = accessor.get(instantiation_1.IInstantiationService);
        var logService = accessor.get(log_1.ILogService);
        var envService = accessor.get(env_1.IEnvironmentService);
        var windowManager = accessor.get(windows.IWindowsService);
        var lifecycleService = accessor.get(lifecycle_1.ILifecycleService);
        var updateManager = accessor.get(update_manager_1.IUpdateService);
        var settingsManager = accessor.get(settings_1.ISettingsService);
        // We handle uncaught exceptions here to prevent electron from opening a dialog to the user
        process.on('uncaughtException', function (err) {
            if (err) {
                // take only the message and stack property
                var friendlyError = {
                    message: err.message,
                    stack: err.stack
                };
                // handle on client side
                windowManager.sendToFocused('vscode:reportError', JSON.stringify(friendlyError));
            }
            console.error('[uncaught exception in main]: ' + err);
            if (err.stack) {
                console.error(err.stack);
            }
        });
        logService.log('### VSCode main.js ###');
        logService.log(envService.appRoot, envService.cliArgs);
        // Setup Windows mutex
        var windowsMutex = null;
        try {
            var Mutex_1 = require.__$__nodeRequire('windows-mutex').Mutex;
            windowsMutex = new Mutex_1(envService.product.win32MutexName);
        }
        catch (e) {
        }
        // Register IPC services
        var launchService = instantiationService.createInstance(launch_1.LaunchService);
        var launchChannel = new launch_1.LaunchChannel(launchService);
        ipcServer.registerChannel('launch', launchChannel);
        var askpassService = new askpassService_1.GitAskpassService();
        var askpassChannel = new gitIpc_1.AskpassChannel(askpassService);
        ipcServer.registerChannel('askpass', askpassChannel);
        // Used by sub processes to communicate back to the main instance
        process.env['VSCODE_PID'] = '' + process.pid;
        process.env['VSCODE_IPC_HOOK'] = envService.mainIPCHandle;
        process.env['VSCODE_SHARED_IPC_HOOK'] = envService.sharedIPCHandle;
        // Spawn shared process
        var sharedProcess = instantiationService.invokeFunction(sharedProcess_1.spawnSharedProcess);
        // Make sure we associate the program with the app user model id
        // This will help Windows to associate the running program with
        // any shortcut that is pinned to the taskbar and prevent showing
        // two icons in the taskbar for the same app.
        if (platform.isWindows && envService.product.win32AppUserModelId) {
            electron_1.app.setAppUserModelId(envService.product.win32AppUserModelId);
        }
        // Set programStart in the global scope
        global.programStart = envService.cliArgs.programStart;
        function dispose() {
            if (ipcServer) {
                ipcServer.dispose();
                ipcServer = null;
            }
            sharedProcess.dispose();
            if (windowsMutex) {
                windowsMutex.release();
            }
        }
        // Dispose on app quit
        electron_1.app.on('will-quit', function () {
            logService.log('App#will-quit: disposing resources');
            dispose();
        });
        // Dispose on vscode:exit
        electron_1.ipcMain.on('vscode:exit', function (event, code) {
            logService.log('IPC#vscode:exit', code);
            dispose();
            process.exit(code); // in main, process.exit === app.exit
        });
        // Lifecycle
        lifecycleService.ready();
        // Load settings
        settingsManager.loadSync();
        // Propagate to clients
        windowManager.ready(userEnv);
        // Install Menu
        var menuManager = instantiationService.createInstance(menus_1.VSCodeMenu);
        menuManager.ready();
        // Install Tasks
        if (platform.isWindows && envService.isBuilt) {
            electron_1.app.setUserTasks([
                {
                    title: nls.localize('newWindow', "New Window"),
                    program: process.execPath,
                    arguments: '-n',
                    iconPath: process.execPath,
                    iconIndex: 0
                }
            ]);
        }
        // Setup auto update
        updateManager.initialize();
        // Open our first window
        if (envService.cliArgs.openNewWindow && envService.cliArgs.pathArguments.length === 0) {
            windowManager.open({ cli: envService.cliArgs, forceNewWindow: true, forceEmpty: true }); // new window if "-n" was used without paths
        }
        else if (global.macOpenFiles && global.macOpenFiles.length && (!envService.cliArgs.pathArguments || !envService.cliArgs.pathArguments.length)) {
            windowManager.open({ cli: envService.cliArgs, pathsToOpen: global.macOpenFiles }); // mac: open-file event received on startup
        }
        else {
            windowManager.open({ cli: envService.cliArgs, forceNewWindow: envService.cliArgs.openNewWindow, diffMode: envService.cliArgs.diffMode }); // default: read paths from cli
        }
    }
    function setupIPC(accessor) {
        var logService = accessor.get(log_1.ILogService);
        var envService = accessor.get(env_1.IEnvironmentService);
        function setup(retry) {
            return ipc_net_1.serve(envService.mainIPCHandle).then(function (server) {
                if (platform.isMacintosh) {
                    electron_1.app.dock.show(); // dock might be hidden at this case due to a retry
                }
                return server;
            }, function (err) {
                if (err.code !== 'EADDRINUSE') {
                    return winjs_base_1.TPromise.wrapError(err);
                }
                // Since we are the second instance, we do not want to show the dock
                if (platform.isMacintosh) {
                    electron_1.app.dock.hide();
                }
                // there's a running instance, let's connect to it
                return ipc_net_1.connect(envService.mainIPCHandle).then(function (client) {
                    // Tests from CLI require to be the only instance currently (TODO@Ben support multiple instances and output)
                    if (envService.isTestingFromCli) {
                        var msg = 'Running extension tests from the command line is currently only supported if no other instance of Code is running.';
                        console.error(msg);
                        client.dispose();
                        return winjs_base_1.TPromise.wrapError(msg);
                    }
                    logService.log('Sending env to running instance...');
                    var channel = client.getChannel('launch');
                    var service = new launch_1.LaunchChannelClient(channel);
                    return service.start(envService.cliArgs, process.env)
                        .then(function () { return client.dispose(); })
                        .then(function () { return winjs_base_1.TPromise.wrapError('Sent env to running instance. Terminating...'); });
                }, function (err) {
                    if (!retry || platform.isWindows || err.code !== 'ECONNREFUSED') {
                        return winjs_base_1.TPromise.wrapError(err);
                    }
                    // it happens on Linux and OS X that the pipe is left behind
                    // let's delete it, since we can't connect to it
                    // and the retry the whole thing
                    try {
                        fs.unlinkSync(envService.mainIPCHandle);
                    }
                    catch (e) {
                        logService.log('Fatal error deleting obsolete instance handle', e);
                        return winjs_base_1.TPromise.wrapError(e);
                    }
                    return setup(false);
                });
            });
        }
        return setup(true);
    }
    // TODO: isolate
    var services = new serviceCollection_1.ServiceCollection();
    services.set(env_1.IEnvironmentService, new descriptors_1.SyncDescriptor(env_1.EnvService));
    services.set(log_1.ILogService, new descriptors_1.SyncDescriptor(log_1.MainLogService));
    services.set(windows.IWindowsService, new descriptors_1.SyncDescriptor(windows.WindowsManager));
    services.set(lifecycle_1.ILifecycleService, new descriptors_1.SyncDescriptor(lifecycle_1.LifecycleService));
    services.set(storage_1.IStorageService, new descriptors_1.SyncDescriptor(storage_1.StorageService));
    services.set(update_manager_1.IUpdateService, new descriptors_1.SyncDescriptor(update_manager_1.UpdateManager));
    services.set(settings_1.ISettingsService, new descriptors_1.SyncDescriptor(settings_1.SettingsManager));
    var instantiationService = new instantiationService_1.InstantiationService(services);
    function getUserEnvironment() {
        return platform.isWindows ? winjs_base_1.TPromise.as({}) : env_2.getUnixUserEnvironment();
    }
    // On some platforms we need to manually read from the global environment variables
    // and assign them to the process environment (e.g. when doubleclick app on Mac)
    getUserEnvironment()
        .then(function (userEnv) {
        if (process.env['VSCODE_CLI'] !== '1') {
            objects_1.assign(process.env, userEnv);
        }
        // Make sure the NLS Config travels to the rendered process
        // See also https://github.com/Microsoft/vscode/issues/4558
        userEnv['VSCODE_NLS_CONFIG'] = process.env['VSCODE_NLS_CONFIG'];
        return instantiationService.invokeFunction(setupIPC)
            .then(function (ipcServer) { return instantiationService.invokeFunction(main, ipcServer, userEnv); });
    })
        .done(null, function (err) { return instantiationService.invokeFunction(quit, err); });
});
//# sourceMappingURL=main.js.map