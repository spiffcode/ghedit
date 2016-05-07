/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'electron', 'fs', 'vs/nls!vs/workbench/electron-main/main', 'vs/base/common/objects', 'vs/base/common/platform', 'vs/workbench/electron-main/env', 'vs/workbench/electron-main/windows', 'vs/workbench/electron-main/lifecycle', 'vs/workbench/electron-main/menus', 'vs/workbench/electron-main/settings', 'vs/workbench/electron-main/update-manager', 'vs/base/node/service.net', 'vs/base/node/env', 'vs/base/common/winjs.base', 'vs/workbench/parts/git/electron-main/askpassService', 'vs/workbench/electron-main/sharedProcess'], function (require, exports, electron_1, fs, nls, objects_1, platform, env, windows, lifecycle, menu, settings, update_manager_1, service_net_1, env_1, winjs_base_1, askpassService_1, sharedProcess_1) {
    'use strict';
    var LaunchService = (function () {
        function LaunchService() {
        }
        LaunchService.prototype.start = function (args, userEnv) {
            env.log('Received data from other instance', args);
            // Otherwise handle in windows manager
            var usedWindows;
            if (!!args.extensionDevelopmentPath) {
                windows.manager.openPluginDevelopmentHostWindow({ cli: args, userEnv: userEnv });
            }
            else if (args.pathArguments.length === 0 && args.openNewWindow) {
                usedWindows = windows.manager.open({ cli: args, userEnv: userEnv, forceNewWindow: true, forceEmpty: true });
            }
            else if (args.pathArguments.length === 0) {
                usedWindows = [windows.manager.focusLastActive(args)];
            }
            else {
                usedWindows = windows.manager.open({
                    cli: args,
                    userEnv: userEnv,
                    forceNewWindow: args.waitForWindowClose || args.openNewWindow,
                    preferNewWindow: !args.openInSameWindow,
                    diffMode: args.diffMode
                });
            }
            // If the other instance is waiting to be killed, we hook up a window listener if one window
            // is being used and only then resolve the startup promise which will kill this second instance
            if (args.waitForWindowClose && usedWindows && usedWindows.length === 1 && usedWindows[0]) {
                var windowId_1 = usedWindows[0].id;
                return new winjs_base_1.TPromise(function (c, e) {
                    var unbind = windows.onClose(function (id) {
                        if (id === windowId_1) {
                            unbind();
                            c(null);
                        }
                    });
                });
            }
            return winjs_base_1.TPromise.as(null);
        };
        return LaunchService;
    }());
    exports.LaunchService = LaunchService;
    // We handle uncaught exceptions here to prevent electron from opening a dialog to the user
    process.on('uncaughtException', function (err) {
        if (err) {
            // take only the message and stack property
            var friendlyError = {
                message: err.message,
                stack: err.stack
            };
            // handle on client side
            windows.manager.sendToFocused('vscode:reportError', JSON.stringify(friendlyError));
        }
        console.error('[uncaught exception in main]: ' + err);
        if (err.stack) {
            console.error(err.stack);
        }
    });
    function quit(arg) {
        var exitCode = 0;
        if (typeof arg === 'string') {
            env.log(arg);
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
        process.exit(exitCode);
    }
    function main(ipcServer, userEnv) {
        env.log('### VSCode main.js ###');
        env.log(env.appRoot, env.cliArgs);
        // Setup Windows mutex
        var windowsMutex = null;
        try {
            var Mutex_1 = require.__$__nodeRequire('windows-mutex').Mutex;
            windowsMutex = new Mutex_1(env.product.win32MutexName);
        }
        catch (e) {
        }
        // Register IPC services
        ipcServer.registerService('LaunchService', new LaunchService());
        ipcServer.registerService('GitAskpassService', new askpassService_1.GitAskpassService());
        // Used by sub processes to communicate back to the main instance
        process.env['VSCODE_PID'] = '' + process.pid;
        process.env['VSCODE_IPC_HOOK'] = env.mainIPCHandle;
        process.env['VSCODE_SHARED_IPC_HOOK'] = env.sharedIPCHandle;
        // Spawn shared process
        var sharedProcess = sharedProcess_1.spawnSharedProcess();
        // Make sure we associate the program with the app user model id
        // This will help Windows to associate the running program with
        // any shortcut that is pinned to the taskbar and prevent showing
        // two icons in the taskbar for the same app.
        if (platform.isWindows && env.product.win32AppUserModelId) {
            electron_1.app.setAppUserModelId(env.product.win32AppUserModelId);
        }
        // Set programStart in the global scope
        global.programStart = env.cliArgs.programStart;
        // Dispose on app quit
        electron_1.app.on('will-quit', function () {
            env.log('App#dispose: deleting running instance handle');
            if (ipcServer) {
                ipcServer.dispose();
                ipcServer = null;
            }
            sharedProcess.dispose();
            if (windowsMutex) {
                windowsMutex.release();
            }
        });
        // Lifecycle
        lifecycle.manager.ready();
        // Load settings
        settings.manager.loadSync();
        // Propagate to clients
        windows.manager.ready(userEnv);
        // Install Menu
        menu.manager.ready();
        // Install Tasks
        if (platform.isWindows && env.isBuilt) {
            electron_1.app.setUserTasks([
                {
                    title: nls.localize(0, null),
                    program: process.execPath,
                    arguments: '-n',
                    iconPath: process.execPath,
                    iconIndex: 0
                }
            ]);
        }
        // Setup auto update
        update_manager_1.Instance.initialize();
        // Open our first window
        if (env.cliArgs.openNewWindow && env.cliArgs.pathArguments.length === 0) {
            windows.manager.open({ cli: env.cliArgs, forceNewWindow: true, forceEmpty: true }); // new window if "-n" was used without paths
        }
        else if (global.macOpenFiles && global.macOpenFiles.length && (!env.cliArgs.pathArguments || !env.cliArgs.pathArguments.length)) {
            windows.manager.open({ cli: env.cliArgs, pathsToOpen: global.macOpenFiles }); // mac: open-file event received on startup
        }
        else {
            windows.manager.open({ cli: env.cliArgs, forceNewWindow: env.cliArgs.openNewWindow, diffMode: env.cliArgs.diffMode }); // default: read paths from cli
        }
    }
    function setupIPC() {
        function setup(retry) {
            return service_net_1.serve(env.mainIPCHandle).then(function (server) {
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
                return service_net_1.connect(env.mainIPCHandle).then(function (client) {
                    // Tests from CLI require to be the only instance currently (TODO@Ben support multiple instances and output)
                    if (env.isTestingFromCli) {
                        var msg = 'Running extension tests from the command line is currently only supported if no other instance of Code is running.';
                        console.error(msg);
                        client.dispose();
                        return winjs_base_1.TPromise.wrapError(msg);
                    }
                    env.log('Sending env to running instance...');
                    var service = client.getService('LaunchService', LaunchService);
                    return service.start(env.cliArgs, process.env)
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
                        fs.unlinkSync(env.mainIPCHandle);
                    }
                    catch (e) {
                        env.log('Fatal error deleting obsolete instance handle', e);
                        return winjs_base_1.TPromise.wrapError(e);
                    }
                    return setup(false);
                });
            });
        }
        return setup(true);
    }
    // On some platforms we need to manually read from the global environment variables
    // and assign them to the process environment (e.g. when doubleclick app on Mac)
    env_1.getUserEnvironment()
        .then(function (userEnv) {
        objects_1.assign(process.env, userEnv);
        // Make sure the NLS Config travels to the rendered process
        // See also https://github.com/Microsoft/vscode/issues/4558
        userEnv['VSCODE_NLS_CONFIG'] = process.env['VSCODE_NLS_CONFIG'];
        return setupIPC()
            .then(function (ipcServer) { return main(ipcServer, userEnv); });
    })
        .done(null, quit);
});
//# sourceMappingURL=main.js.map