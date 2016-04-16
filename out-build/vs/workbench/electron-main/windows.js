/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'events', 'path', 'fs', 'electron', 'vs/base/common/platform', 'vs/workbench/electron-main/env', 'vs/workbench/electron-main/window', 'vs/workbench/electron-main/lifecycle', 'vs/nls!vs/workbench/electron-main/windows', 'vs/base/common/paths', 'vs/base/common/arrays', 'vs/base/common/objects', 'vs/workbench/electron-main/storage', 'vs/workbench/electron-main/settings', 'vs/workbench/electron-main/update-manager'], function (require, exports, events, path, fs, electron_1, platform, env, window, lifecycle, nls, paths, arrays, objects, storage, settings, update_manager_1) {
    'use strict';
    var eventEmitter = new events.EventEmitter();
    var EventTypes = {
        OPEN: 'open',
        CLOSE: 'close',
        READY: 'ready'
    };
    function onOpen(clb) {
        eventEmitter.addListener(EventTypes.OPEN, clb);
        return function () { return eventEmitter.removeListener(EventTypes.OPEN, clb); };
    }
    exports.onOpen = onOpen;
    function onReady(clb) {
        eventEmitter.addListener(EventTypes.READY, clb);
        return function () { return eventEmitter.removeListener(EventTypes.READY, clb); };
    }
    exports.onReady = onReady;
    function onClose(clb) {
        eventEmitter.addListener(EventTypes.CLOSE, clb);
        return function () { return eventEmitter.removeListener(EventTypes.CLOSE, clb); };
    }
    exports.onClose = onClose;
    var WindowError;
    (function (WindowError) {
        WindowError[WindowError["UNRESPONSIVE"] = 0] = "UNRESPONSIVE";
        WindowError[WindowError["CRASHED"] = 1] = "CRASHED";
    })(WindowError || (WindowError = {}));
    var WindowsManager = (function () {
        function WindowsManager() {
        }
        WindowsManager.prototype.ready = function (initialUserEnv) {
            this.registerListeners();
            this.initialUserEnv = initialUserEnv;
            this.windowsState = storage.getItem(WindowsManager.windowsStateStorageKey) || { openedFolders: [] };
        };
        WindowsManager.prototype.registerListeners = function () {
            var _this = this;
            electron_1.app.on('activate', function (event, hasVisibleWindows) {
                env.log('App#activate');
                // Mac only event: reopen last window when we get activated
                if (!hasVisibleWindows) {
                    // We want to open the previously opened folder, so we dont pass on the path argument
                    var cliArgWithoutPath = objects.clone(env.cliArgs);
                    cliArgWithoutPath.pathArguments = [];
                    _this.windowsState.openedFolders = []; // make sure we do not restore too much
                    _this.open({ cli: cliArgWithoutPath });
                }
            });
            var macOpenFiles = [];
            var runningTimeout = null;
            electron_1.app.on('open-file', function (event, path) {
                env.log('App#open-file: ', path);
                event.preventDefault();
                // Keep in array because more might come!
                macOpenFiles.push(path);
                // Clear previous handler if any
                if (runningTimeout !== null) {
                    clearTimeout(runningTimeout);
                    runningTimeout = null;
                }
                // Handle paths delayed in case more are coming!
                runningTimeout = setTimeout(function () {
                    _this.open({ cli: env.cliArgs, pathsToOpen: macOpenFiles, preferNewWindow: true /* dropping on the dock prefers to open in a new window */ });
                    macOpenFiles = [];
                    runningTimeout = null;
                }, 100);
            });
            settings.manager.onChange(function (newSettings) {
                _this.sendToAll('vscode:optionsChange', JSON.stringify({ globalSettings: newSettings }));
            }, this);
            electron_1.ipcMain.on('vscode:startCrashReporter', function (event, config) {
                env.log('IPC#vscode:startCrashReporter');
                electron_1.crashReporter.start(config);
            });
            electron_1.ipcMain.on('vscode:windowOpen', function (event, paths, forceNewWindow) {
                env.log('IPC#vscode-windowOpen: ', paths);
                if (paths && paths.length) {
                    _this.open({ cli: env.cliArgs, pathsToOpen: paths, forceNewWindow: forceNewWindow });
                }
            });
            electron_1.ipcMain.on('vscode:workbenchLoaded', function (event, windowId) {
                env.log('IPC#vscode-workbenchLoaded');
                var win = _this.getWindowById(windowId);
                if (win) {
                    win.setReady();
                    // Event
                    eventEmitter.emit(EventTypes.READY, win);
                }
            });
            electron_1.ipcMain.on('vscode:openFilePicker', function () {
                env.log('IPC#vscode-openFilePicker');
                _this.openFilePicker();
            });
            electron_1.ipcMain.on('vscode:openFolderPicker', function (event, forceNewWindow) {
                env.log('IPC#vscode-openFolderPicker');
                _this.openFolderPicker(forceNewWindow);
            });
            electron_1.ipcMain.on('vscode:openFileFolderPicker', function (event, forceNewWindow) {
                env.log('IPC#vscode-openFileFolderPicker');
                _this.openFileFolderPicker(forceNewWindow);
            });
            electron_1.ipcMain.on('vscode:closeFolder', function (event, windowId) {
                env.log('IPC#vscode-closeFolder');
                var win = _this.getWindowById(windowId);
                if (win) {
                    _this.open({ cli: env.cliArgs, forceEmpty: true, windowToUse: win });
                }
            });
            electron_1.ipcMain.on('vscode:openNewWindow', function () {
                env.log('IPC#vscode-openNewWindow');
                _this.openNewWindow();
            });
            electron_1.ipcMain.on('vscode:reloadWindow', function (event, windowId) {
                env.log('IPC#vscode:reloadWindow');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    _this.reload(vscodeWindow);
                }
            });
            electron_1.ipcMain.on('vscode:toggleFullScreen', function (event, windowId) {
                env.log('IPC#vscode:toggleFullScreen');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    vscodeWindow.toggleFullScreen();
                }
            });
            electron_1.ipcMain.on('vscode:setFullScreen', function (event, windowId, fullscreen) {
                env.log('IPC#vscode:setFullScreen');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    vscodeWindow.win.setFullScreen(fullscreen);
                }
            });
            electron_1.ipcMain.on('vscode:toggleDevTools', function (event, windowId) {
                env.log('IPC#vscode:toggleDevTools');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    vscodeWindow.win.webContents.toggleDevTools();
                }
            });
            electron_1.ipcMain.on('vscode:openDevTools', function (event, windowId) {
                env.log('IPC#vscode:openDevTools');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    vscodeWindow.win.webContents.openDevTools();
                    vscodeWindow.win.show();
                }
            });
            electron_1.ipcMain.on('vscode:setRepresentedFilename', function (event, windowId, fileName) {
                env.log('IPC#vscode:setRepresentedFilename');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    vscodeWindow.win.setRepresentedFilename(fileName);
                }
            });
            electron_1.ipcMain.on('vscode:setMenuBarVisibility', function (event, windowId, visibility) {
                env.log('IPC#vscode:setMenuBarVisibility');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    vscodeWindow.win.setMenuBarVisibility(visibility);
                }
            });
            electron_1.ipcMain.on('vscode:flashFrame', function (event, windowId) {
                env.log('IPC#vscode:flashFrame');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    vscodeWindow.win.flashFrame(!vscodeWindow.win.isFocused());
                }
            });
            electron_1.ipcMain.on('vscode:focusWindow', function (event, windowId) {
                env.log('IPC#vscode:focusWindow');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow) {
                    vscodeWindow.win.focus();
                }
            });
            electron_1.ipcMain.on('vscode:setDocumentEdited', function (event, windowId, edited) {
                env.log('IPC#vscode:setDocumentEdited');
                var vscodeWindow = _this.getWindowById(windowId);
                if (vscodeWindow && vscodeWindow.win.isDocumentEdited() !== edited) {
                    vscodeWindow.win.setDocumentEdited(edited);
                }
            });
            electron_1.ipcMain.on('vscode:toggleMenuBar', function (event, windowId) {
                env.log('IPC#vscode:toggleMenuBar');
                // Update in settings
                var menuBarHidden = storage.getItem(window.VSCodeWindow.menuBarHiddenKey, false);
                var newMenuBarHidden = !menuBarHidden;
                storage.setItem(window.VSCodeWindow.menuBarHiddenKey, newMenuBarHidden);
                // Update across windows
                WindowsManager.WINDOWS.forEach(function (w) { return w.setMenuBarVisibility(!newMenuBarHidden); });
                // Inform user if menu bar is now hidden
                if (newMenuBarHidden) {
                    var vscodeWindow = _this.getWindowById(windowId);
                    if (vscodeWindow) {
                        vscodeWindow.send('vscode:showInfoMessage', nls.localize(0, null));
                    }
                }
            });
            electron_1.ipcMain.on('vscode:broadcast', function (event, windowId, target, broadcast) {
                if (broadcast.channel && broadcast.payload) {
                    env.log('IPC#vscode:broadcast', target, broadcast.channel, broadcast.payload);
                    // Handle specific events on main side
                    _this.onBroadcast(broadcast.channel, broadcast.payload);
                    // Send to windows
                    if (target) {
                        var otherWindowsWithTarget = WindowsManager.WINDOWS.filter(function (w) { return w.id !== windowId && typeof w.openedWorkspacePath === 'string'; });
                        var directTargetMatch = otherWindowsWithTarget.filter(function (w) { return _this.isPathEqual(target, w.openedWorkspacePath); });
                        var parentTargetMatch = otherWindowsWithTarget.filter(function (w) { return paths.isEqualOrParent(target, w.openedWorkspacePath); });
                        var targetWindow = directTargetMatch.length ? directTargetMatch[0] : parentTargetMatch[0]; // prefer direct match over parent match
                        if (targetWindow) {
                            targetWindow.send('vscode:broadcast', broadcast);
                        }
                    }
                    else {
                        _this.sendToAll('vscode:broadcast', broadcast, [windowId]);
                    }
                }
            });
            electron_1.ipcMain.on('vscode:log', function (event, logEntry) {
                var args = [];
                try {
                    var parsed_1 = JSON.parse(logEntry.arguments);
                    args.push.apply(args, Object.getOwnPropertyNames(parsed_1).map(function (o) { return parsed_1[o]; }));
                }
                catch (error) {
                    args.push(logEntry.arguments);
                }
                console[logEntry.severity].apply(console, args);
            });
            electron_1.ipcMain.on('vscode:exit', function (event, code) {
                env.log('IPC#vscode:exit', code);
                process.exit(code);
            });
            electron_1.ipcMain.on('vscode:closeExtensionHostWindow', function (event, extensionDevelopmentPath) {
                env.log('IPC#vscode:closeExtensionHostWindow', extensionDevelopmentPath);
                var windowOnExtension = _this.findWindow(null, null, extensionDevelopmentPath);
                if (windowOnExtension) {
                    windowOnExtension.win.close();
                }
            });
            update_manager_1.Instance.on('update-downloaded', function (update) {
                _this.sendToFocused('vscode:telemetry', { eventName: 'update:downloaded', data: { version: update.version } });
                _this.sendToAll('vscode:update-downloaded', JSON.stringify({
                    releaseNotes: update.releaseNotes,
                    version: update.version,
                    date: update.date
                }));
            });
            electron_1.ipcMain.on('vscode:update-apply', function () {
                env.log('IPC#vscode:update-apply');
                if (update_manager_1.Instance.availableUpdate) {
                    update_manager_1.Instance.availableUpdate.quitAndUpdate();
                }
            });
            update_manager_1.Instance.on('update-not-available', function (explicit) {
                _this.sendToFocused('vscode:telemetry', { eventName: 'update:notAvailable', data: { explicit: explicit } });
                if (explicit) {
                    _this.sendToFocused('vscode:update-not-available', '');
                }
            });
            update_manager_1.Instance.on('update-available', function (url) {
                if (url) {
                    _this.sendToFocused('vscode:update-available', url);
                }
            });
            lifecycle.onBeforeQuit(function () {
                // 0-1 window open: Do not keep the list but just rely on the active window to be stored
                if (WindowsManager.WINDOWS.length < 2) {
                    _this.windowsState.openedFolders = [];
                    return;
                }
                // 2-N windows open: Keep a list of windows that are opened on a specific folder to restore it in the next session as needed
                _this.windowsState.openedFolders = WindowsManager.WINDOWS.filter(function (w) { return w.readyState === window.ReadyState.READY && !!w.openedWorkspacePath && !w.isPluginDevelopmentHost; }).map(function (w) {
                    return {
                        workspacePath: w.openedWorkspacePath,
                        uiState: w.serializeWindowState()
                    };
                });
            });
            electron_1.app.on('will-quit', function () {
                storage.setItem(WindowsManager.windowsStateStorageKey, _this.windowsState);
            });
            var loggedStartupTimes = false;
            onReady(function (window) {
                if (loggedStartupTimes) {
                    return; // only for the first window
                }
                loggedStartupTimes = true;
                window.send('vscode:telemetry', { eventName: 'startupTime', data: { ellapsed: Date.now() - global.vscodeStart } });
            });
        };
        WindowsManager.prototype.onBroadcast = function (event, payload) {
            // Theme changes
            if (event === 'vscode:changeTheme' && typeof payload === 'string') {
                storage.setItem(window.VSCodeWindow.themeStorageKey, payload);
            }
        };
        WindowsManager.prototype.reload = function (win, cli) {
            // Only reload when the window has not vetoed this
            lifecycle.manager.unload(win).done(function (veto) {
                if (!veto) {
                    win.reload(cli);
                }
            });
        };
        WindowsManager.prototype.open = function (openConfig) {
            var _this = this;
            var iPathsToOpen;
            var usedWindows = [];
            // Find paths from provided paths if any
            if (openConfig.pathsToOpen && openConfig.pathsToOpen.length > 0) {
                iPathsToOpen = openConfig.pathsToOpen.map(function (pathToOpen) {
                    var iPath = _this.toIPath(pathToOpen, false, openConfig.cli && openConfig.cli.gotoLineMode);
                    // Warn if the requested path to open does not exist
                    if (!iPath) {
                        var options = {
                            title: env.product.nameLong,
                            type: 'info',
                            buttons: [nls.localize(1, null)],
                            message: nls.localize(2, null),
                            detail: nls.localize(3, null, pathToOpen),
                            noLink: true
                        };
                        var activeWindow = electron_1.BrowserWindow.getFocusedWindow();
                        if (activeWindow) {
                            electron_1.dialog.showMessageBox(activeWindow, options);
                        }
                        else {
                            electron_1.dialog.showMessageBox(options);
                        }
                    }
                    return iPath;
                });
                // get rid of nulls
                iPathsToOpen = arrays.coalesce(iPathsToOpen);
                if (iPathsToOpen.length === 0) {
                    return null; // indicate to outside that open failed
                }
            }
            else if (openConfig.forceEmpty) {
                iPathsToOpen = [Object.create(null)];
            }
            else {
                var ignoreFileNotFound = openConfig.cli.pathArguments.length > 0; // we assume the user wants to create this file from command line
                iPathsToOpen = this.cliToPaths(openConfig.cli, ignoreFileNotFound);
            }
            var filesToOpen = [];
            var filesToDiff = [];
            var foldersToOpen = iPathsToOpen.filter(function (iPath) { return iPath.workspacePath && !iPath.filePath && !iPath.installExtensionPath; });
            var emptyToOpen = iPathsToOpen.filter(function (iPath) { return !iPath.workspacePath && !iPath.filePath && !iPath.installExtensionPath; });
            var extensionsToInstall = iPathsToOpen.filter(function (iPath) { return iPath.installExtensionPath; }).map(function (ipath) { return ipath.filePath; });
            var filesToCreate = iPathsToOpen.filter(function (iPath) { return !!iPath.filePath && iPath.createFilePath && !iPath.installExtensionPath; });
            // Diff mode needs special care
            var candidates = iPathsToOpen.filter(function (iPath) { return !!iPath.filePath && !iPath.createFilePath && !iPath.installExtensionPath; });
            if (openConfig.diffMode) {
                if (candidates.length === 2) {
                    filesToDiff = candidates;
                }
                else {
                    emptyToOpen = [Object.create(null)]; // improper use of diffMode, open empty
                }
                foldersToOpen = []; // diff is always in empty workspace
                filesToCreate = []; // diff ignores other files that do not exist
            }
            else {
                filesToOpen = candidates;
            }
            var configuration;
            // Handle files to open/diff or to create when we dont open a folder
            if (!foldersToOpen.length && (filesToOpen.length > 0 || filesToCreate.length > 0 || filesToDiff.length > 0 || extensionsToInstall.length > 0)) {
                // Let the user settings override how files are open in a new window or same window unless we are forced
                var openFilesInNewWindow = void 0;
                if (openConfig.forceNewWindow) {
                    openFilesInNewWindow = true;
                }
                else {
                    openFilesInNewWindow = openConfig.preferNewWindow;
                    if (openFilesInNewWindow && !openConfig.cli.extensionDevelopmentPath) {
                        openFilesInNewWindow = settings.manager.getValue('window.openFilesInNewWindow', openFilesInNewWindow);
                    }
                }
                // Open Files in last instance if any and flag tells us so
                var lastActiveWindow = this.getLastActiveWindow();
                if (!openFilesInNewWindow && lastActiveWindow) {
                    lastActiveWindow.focus();
                    lastActiveWindow.ready().then(function (readyWindow) {
                        readyWindow.send('vscode:openFiles', {
                            filesToOpen: filesToOpen,
                            filesToCreate: filesToCreate,
                            filesToDiff: filesToDiff
                        });
                        if (extensionsToInstall.length) {
                            readyWindow.send('vscode:installExtensions', { extensionsToInstall: extensionsToInstall });
                        }
                    });
                    usedWindows.push(lastActiveWindow);
                }
                else {
                    configuration = this.toConfiguration(openConfig.userEnv || this.initialUserEnv, openConfig.cli, null, filesToOpen, filesToCreate, filesToDiff, extensionsToInstall);
                    var browserWindow = this.openInBrowserWindow(configuration, true /* new window */);
                    usedWindows.push(browserWindow);
                    openConfig.forceNewWindow = true; // any other folders to open must open in new window then
                }
            }
            // Handle folders to open
            var openInNewWindow = openConfig.preferNewWindow || openConfig.forceNewWindow;
            if (foldersToOpen.length > 0) {
                // Check for existing instances
                var windowsOnWorkspacePath_1 = arrays.coalesce(foldersToOpen.map(function (iPath) { return _this.findWindow(iPath.workspacePath); }));
                if (windowsOnWorkspacePath_1.length > 0) {
                    var browserWindow = windowsOnWorkspacePath_1[0];
                    browserWindow.focus(); // just focus one of them
                    browserWindow.ready().then(function (readyWindow) {
                        readyWindow.send('vscode:openFiles', {
                            filesToOpen: filesToOpen,
                            filesToCreate: filesToCreate,
                            filesToDiff: filesToDiff
                        });
                        if (extensionsToInstall.length) {
                            readyWindow.send('vscode:installExtensions', { extensionsToInstall: extensionsToInstall });
                        }
                    });
                    usedWindows.push(browserWindow);
                    // Reset these because we handled them
                    filesToOpen = [];
                    filesToCreate = [];
                    filesToDiff = [];
                    extensionsToInstall = [];
                    openInNewWindow = true; // any other folders to open must open in new window then
                }
                // Open remaining ones
                foldersToOpen.forEach(function (folderToOpen) {
                    if (windowsOnWorkspacePath_1.some(function (win) { return _this.isPathEqual(win.openedWorkspacePath, folderToOpen.workspacePath); })) {
                        return; // ignore folders that are already open
                    }
                    configuration = _this.toConfiguration(openConfig.userEnv || _this.initialUserEnv, openConfig.cli, folderToOpen.workspacePath, filesToOpen, filesToCreate, filesToDiff, extensionsToInstall);
                    var browserWindow = _this.openInBrowserWindow(configuration, openInNewWindow, openInNewWindow ? void 0 : openConfig.windowToUse);
                    usedWindows.push(browserWindow);
                    // Reset these because we handled them
                    filesToOpen = [];
                    filesToCreate = [];
                    filesToDiff = [];
                    extensionsToInstall = [];
                    openInNewWindow = true; // any other folders to open must open in new window then
                });
            }
            // Handle empty
            if (emptyToOpen.length > 0) {
                emptyToOpen.forEach(function () {
                    var configuration = _this.toConfiguration(openConfig.userEnv || _this.initialUserEnv, openConfig.cli);
                    var browserWindow = _this.openInBrowserWindow(configuration, openInNewWindow, openInNewWindow ? void 0 : openConfig.windowToUse);
                    usedWindows.push(browserWindow);
                    openInNewWindow = true; // any other folders to open must open in new window then
                });
            }
            // Remember in recent document list
            iPathsToOpen.forEach(function (iPath) {
                if (iPath.filePath || iPath.workspacePath) {
                    electron_1.app.addRecentDocument(iPath.filePath || iPath.workspacePath);
                }
            });
            // Emit events
            iPathsToOpen.forEach(function (iPath) { return eventEmitter.emit(EventTypes.OPEN, iPath); });
            return arrays.distinct(usedWindows);
        };
        WindowsManager.prototype.openPluginDevelopmentHostWindow = function (openConfig) {
            var _this = this;
            // Reload an existing plugin development host window on the same path
            // We currently do not allow more than one extension development window
            // on the same plugin path.
            var res = WindowsManager.WINDOWS.filter(function (w) { return w.config && _this.isPathEqual(w.config.extensionDevelopmentPath, openConfig.cli.extensionDevelopmentPath); });
            if (res && res.length === 1) {
                this.reload(res[0], openConfig.cli);
                res[0].focus(); // make sure it gets focus and is restored
                return;
            }
            // Fill in previously opened workspace unless an explicit path is provided and we are not unit testing
            if (openConfig.cli.pathArguments.length === 0 && !openConfig.cli.extensionTestsPath) {
                var workspaceToOpen = this.windowsState.lastPluginDevelopmentHostWindow && this.windowsState.lastPluginDevelopmentHostWindow.workspacePath;
                if (workspaceToOpen) {
                    openConfig.cli.pathArguments = [workspaceToOpen];
                }
            }
            // Make sure we are not asked to open a path that is already opened
            if (openConfig.cli.pathArguments.length > 0) {
                res = WindowsManager.WINDOWS.filter(function (w) { return w.openedWorkspacePath && openConfig.cli.pathArguments.indexOf(w.openedWorkspacePath) >= 0; });
                if (res.length) {
                    openConfig.cli.pathArguments = [];
                }
            }
            // Open it
            this.open({ cli: openConfig.cli, forceNewWindow: true, forceEmpty: openConfig.cli.pathArguments.length === 0 });
        };
        WindowsManager.prototype.toConfiguration = function (userEnv, cli, workspacePath, filesToOpen, filesToCreate, filesToDiff, extensionsToInstall) {
            var configuration = objects.mixin({}, cli); // inherit all properties from CLI
            configuration.execPath = process.execPath;
            configuration.workspacePath = workspacePath;
            configuration.filesToOpen = filesToOpen;
            configuration.filesToCreate = filesToCreate;
            configuration.filesToDiff = filesToDiff;
            configuration.extensionsToInstall = extensionsToInstall;
            configuration.appName = env.product.nameLong;
            configuration.applicationName = env.product.applicationName;
            configuration.darwinBundleIdentifier = env.product.darwinBundleIdentifier;
            configuration.appRoot = env.appRoot;
            configuration.version = env.version;
            configuration.commitHash = env.product.commit;
            configuration.appSettingsHome = env.appSettingsHome;
            configuration.appSettingsPath = env.appSettingsPath;
            configuration.appKeybindingsPath = env.appKeybindingsPath;
            configuration.userExtensionsHome = env.userExtensionsHome;
            configuration.extensionTips = env.product.extensionTips;
            configuration.mainIPCHandle = env.mainIPCHandle;
            configuration.sharedIPCHandle = env.sharedIPCHandle;
            configuration.isBuilt = env.isBuilt;
            configuration.crashReporter = env.product.crashReporter;
            configuration.extensionsGallery = env.product.extensionsGallery;
            configuration.welcomePage = env.product.welcomePage;
            configuration.productDownloadUrl = env.product.downloadUrl;
            configuration.releaseNotesUrl = env.product.releaseNotesUrl;
            configuration.licenseUrl = env.product.licenseUrl;
            configuration.updateFeedUrl = update_manager_1.Instance.feedUrl;
            configuration.updateChannel = update_manager_1.Instance.channel;
            configuration.aiConfig = env.product.aiConfig;
            configuration.sendASmile = env.product.sendASmile;
            configuration.enableTelemetry = env.product.enableTelemetry;
            configuration.userEnv = userEnv;
            var recents = this.getRecentlyOpenedPaths(workspacePath, filesToOpen);
            configuration.recentFiles = recents.files;
            configuration.recentFolders = recents.folders;
            return configuration;
        };
        WindowsManager.prototype.getRecentlyOpenedPaths = function (workspacePath, filesToOpen) {
            var files;
            var folders;
            // Get from storage
            var storedRecents = storage.getItem(WindowsManager.openedPathsListStorageKey);
            if (storedRecents) {
                files = storedRecents.files || [];
                folders = storedRecents.folders || [];
            }
            else {
                files = [];
                folders = [];
            }
            // Add currently files to open to the beginning if any
            if (filesToOpen) {
                files.unshift.apply(files, filesToOpen.map(function (f) { return f.filePath; }));
            }
            // Add current workspace path to beginning if set
            if (workspacePath) {
                folders.unshift(workspacePath);
            }
            // Clear those dupes
            files = arrays.distinct(files);
            folders = arrays.distinct(folders);
            if (platform.isMacintosh && files.length > 0) {
                files = files.filter(function (f) { return folders.indexOf(f) < 0; }); // TODO@Ben migration (remove in the future)
            }
            // Make sure it is bounded
            files = files.slice(0, 10);
            folders = folders.slice(0, 10);
            return { files: files, folders: folders };
        };
        WindowsManager.prototype.toIPath = function (anyPath, ignoreFileNotFound, gotoLineMode) {
            if (!anyPath) {
                return null;
            }
            var parsedPath;
            if (gotoLineMode) {
                parsedPath = env.parseLineAndColumnAware(anyPath);
                anyPath = parsedPath.path;
            }
            var candidate = path.normalize(anyPath);
            try {
                var candidateStat = fs.statSync(candidate);
                if (candidateStat) {
                    return candidateStat.isFile() ?
                        {
                            filePath: candidate,
                            lineNumber: gotoLineMode ? parsedPath.line : void 0,
                            columnNumber: gotoLineMode ? parsedPath.column : void 0,
                            installExtensionPath: /\.vsix$/i.test(candidate)
                        } :
                        { workspacePath: candidate };
                }
            }
            catch (error) {
                if (ignoreFileNotFound) {
                    return { filePath: candidate, createFilePath: true }; // assume this is a file that does not yet exist
                }
            }
            return null;
        };
        WindowsManager.prototype.cliToPaths = function (cli, ignoreFileNotFound) {
            var _this = this;
            // Check for pass in candidate or last opened path
            var candidates = [];
            if (cli.pathArguments.length > 0) {
                candidates = cli.pathArguments;
            }
            else {
                var reopenFolders = settings.manager.getValue('window.reopenFolders', 'one');
                var lastActiveFolder = this.windowsState.lastActiveWindow && this.windowsState.lastActiveWindow.workspacePath;
                // Restore all
                if (reopenFolders === 'all') {
                    var lastOpenedFolders = this.windowsState.openedFolders.map(function (o) { return o.workspacePath; });
                    // If we have a last active folder, move it to the end
                    if (lastActiveFolder) {
                        lastOpenedFolders.splice(lastOpenedFolders.indexOf(lastActiveFolder), 1);
                        lastOpenedFolders.push(lastActiveFolder);
                    }
                    candidates.push.apply(candidates, lastOpenedFolders);
                }
                else if (lastActiveFolder && (reopenFolders === 'one' || reopenFolders !== 'none')) {
                    candidates.push(lastActiveFolder);
                }
            }
            var iPaths = candidates.map(function (candidate) { return _this.toIPath(candidate, ignoreFileNotFound, cli.gotoLineMode); }).filter(function (path) { return !!path; });
            if (iPaths.length > 0) {
                return iPaths;
            }
            // No path provided, return empty to open empty
            return [Object.create(null)];
        };
        WindowsManager.prototype.openInBrowserWindow = function (configuration, forceNewWindow, windowToUse) {
            var _this = this;
            var vscodeWindow;
            if (!forceNewWindow) {
                vscodeWindow = windowToUse || this.getLastActiveWindow();
                if (vscodeWindow) {
                    vscodeWindow.focus();
                }
            }
            // New window
            if (!vscodeWindow) {
                vscodeWindow = new window.VSCodeWindow({
                    state: this.getNewWindowState(configuration),
                    extensionDevelopmentPath: configuration.extensionDevelopmentPath
                });
                WindowsManager.WINDOWS.push(vscodeWindow);
                // Window Events
                vscodeWindow.win.webContents.on('crashed', function () { return _this.onWindowError(vscodeWindow, WindowError.CRASHED); });
                vscodeWindow.win.on('unresponsive', function () { return _this.onWindowError(vscodeWindow, WindowError.UNRESPONSIVE); });
                vscodeWindow.win.on('close', function () { return _this.onBeforeWindowClose(vscodeWindow); });
                vscodeWindow.win.on('closed', function () { return _this.onWindowClosed(vscodeWindow); });
                // Lifecycle
                lifecycle.manager.registerWindow(vscodeWindow);
            }
            else {
                // Some configuration things get inherited if the window is being reused and we are
                // in plugin development host mode. These options are all development related.
                var currentWindowConfig = vscodeWindow.config;
                if (!configuration.extensionDevelopmentPath && currentWindowConfig && !!currentWindowConfig.extensionDevelopmentPath) {
                    configuration.extensionDevelopmentPath = currentWindowConfig.extensionDevelopmentPath;
                    configuration.verboseLogging = currentWindowConfig.verboseLogging;
                    configuration.logExtensionHostCommunication = currentWindowConfig.logExtensionHostCommunication;
                    configuration.debugBrkExtensionHost = currentWindowConfig.debugBrkExtensionHost;
                    configuration.debugExtensionHostPort = currentWindowConfig.debugExtensionHostPort;
                    configuration.extensionsHomePath = currentWindowConfig.extensionsHomePath;
                }
            }
            // Only load when the window has not vetoed this
            lifecycle.manager.unload(vscodeWindow).done(function (veto) {
                if (!veto) {
                    // Load it
                    vscodeWindow.load(configuration);
                }
            });
            return vscodeWindow;
        };
        WindowsManager.prototype.getNewWindowState = function (configuration) {
            var _this = this;
            // plugin development host Window - load from stored settings if any
            if (!!configuration.extensionDevelopmentPath && this.windowsState.lastPluginDevelopmentHostWindow) {
                return this.windowsState.lastPluginDevelopmentHostWindow.uiState;
            }
            // Known Folder - load from stored settings if any
            if (configuration.workspacePath) {
                var stateForWorkspace = this.windowsState.openedFolders.filter(function (o) { return _this.isPathEqual(o.workspacePath, configuration.workspacePath); }).map(function (o) { return o.uiState; });
                if (stateForWorkspace.length) {
                    return stateForWorkspace[0];
                }
            }
            // First Window
            var lastActive = this.getLastActiveWindow();
            if (!lastActive && this.windowsState.lastActiveWindow) {
                return this.windowsState.lastActiveWindow.uiState;
            }
            //
            // In any other case, we do not have any stored settings for the window state, so we come up with something smart
            //
            // We want the new window to open on the same display that the last active one is in
            var displayToUse;
            var displays = electron_1.screen.getAllDisplays();
            // Single Display
            if (displays.length === 1) {
                displayToUse = displays[0];
            }
            else {
                // on mac there is 1 menu per window so we need to use the monitor where the cursor currently is
                if (platform.isMacintosh) {
                    var cursorPoint = electron_1.screen.getCursorScreenPoint();
                    displayToUse = electron_1.screen.getDisplayNearestPoint(cursorPoint);
                }
                // if we have a last active window, use that display for the new window
                if (!displayToUse && lastActive) {
                    displayToUse = electron_1.screen.getDisplayMatching(lastActive.getBounds());
                }
                // fallback to first display
                if (!displayToUse) {
                    displayToUse = displays[0];
                }
            }
            var defaultState = window.defaultWindowState();
            defaultState.x = displayToUse.bounds.x + (displayToUse.bounds.width / 2) - (defaultState.width / 2);
            defaultState.y = displayToUse.bounds.y + (displayToUse.bounds.height / 2) - (defaultState.height / 2);
            return this.ensureNoOverlap(defaultState);
        };
        WindowsManager.prototype.ensureNoOverlap = function (state) {
            if (WindowsManager.WINDOWS.length === 0) {
                return state;
            }
            var existingWindowBounds = WindowsManager.WINDOWS.map(function (win) { return win.getBounds(); });
            while (existingWindowBounds.some(function (b) { return b.x === state.x || b.y === state.y; })) {
                state.x += 30;
                state.y += 30;
            }
            return state;
        };
        WindowsManager.prototype.openFileFolderPicker = function (forceNewWindow) {
            this.doPickAndOpen({ pickFolders: true, pickFiles: true }, forceNewWindow);
        };
        WindowsManager.prototype.openFilePicker = function (forceNewWindow) {
            this.doPickAndOpen({ pickFiles: true }, forceNewWindow);
        };
        WindowsManager.prototype.openFolderPicker = function (forceNewWindow) {
            this.doPickAndOpen({ pickFolders: true }, forceNewWindow);
        };
        WindowsManager.prototype.doPickAndOpen = function (options, forceNewWindow) {
            var _this = this;
            this.getFileOrFolderPaths(options, function (paths) {
                if (paths && paths.length) {
                    _this.open({ cli: env.cliArgs, pathsToOpen: paths, forceNewWindow: forceNewWindow });
                }
            });
        };
        WindowsManager.prototype.getFileOrFolderPaths = function (options, clb) {
            var workingDir = storage.getItem(WindowsManager.workingDirPickerStorageKey);
            var focussedWindow = this.getFocusedWindow();
            var pickerProperties;
            if (options.pickFiles && options.pickFolders) {
                pickerProperties = ['multiSelections', 'openDirectory', 'openFile', 'createDirectory'];
            }
            else {
                pickerProperties = ['multiSelections', options.pickFolders ? 'openDirectory' : 'openFile', 'createDirectory'];
            }
            electron_1.dialog.showOpenDialog(focussedWindow && focussedWindow.win, {
                defaultPath: workingDir,
                properties: pickerProperties
            }, function (paths) {
                if (paths && paths.length > 0) {
                    // Remember path in storage for next time
                    storage.setItem(WindowsManager.workingDirPickerStorageKey, path.dirname(paths[0]));
                    // Return
                    clb(paths);
                }
                else {
                    clb(void (0));
                }
            });
        };
        WindowsManager.prototype.focusLastActive = function (cli) {
            var lastActive = this.getLastActiveWindow();
            if (lastActive) {
                lastActive.focus();
                return lastActive;
            }
            // No window - open new one
            this.windowsState.openedFolders = []; // make sure we do not open too much
            var res = this.open({ cli: cli });
            return res && res[0];
        };
        WindowsManager.prototype.getLastActiveWindow = function () {
            if (WindowsManager.WINDOWS.length) {
                var lastFocussedDate_1 = Math.max.apply(Math, WindowsManager.WINDOWS.map(function (w) { return w.lastFocusTime; }));
                var res = WindowsManager.WINDOWS.filter(function (w) { return w.lastFocusTime === lastFocussedDate_1; });
                if (res && res.length) {
                    return res[0];
                }
            }
            return null;
        };
        WindowsManager.prototype.findWindow = function (workspacePath, filePath, extensionDevelopmentPath) {
            var _this = this;
            if (WindowsManager.WINDOWS.length) {
                // Sort the last active window to the front of the array of windows to test
                var windowsToTest = WindowsManager.WINDOWS.slice(0);
                var lastActiveWindow = this.getLastActiveWindow();
                if (lastActiveWindow) {
                    windowsToTest.splice(windowsToTest.indexOf(lastActiveWindow), 1);
                    windowsToTest.unshift(lastActiveWindow);
                }
                // Find it
                var res = windowsToTest.filter(function (w) {
                    // match on workspace
                    if (typeof w.openedWorkspacePath === 'string' && (_this.isPathEqual(w.openedWorkspacePath, workspacePath))) {
                        return true;
                    }
                    // match on file
                    if (typeof w.openedFilePath === 'string' && _this.isPathEqual(w.openedFilePath, filePath)) {
                        return true;
                    }
                    // match on file path
                    if (typeof w.openedWorkspacePath === 'string' && filePath && paths.isEqualOrParent(filePath, w.openedWorkspacePath)) {
                        return true;
                    }
                    // match on extension development path
                    if (typeof extensionDevelopmentPath === 'string' && w.extensionDevelopmentPath === extensionDevelopmentPath) {
                        return true;
                    }
                    return false;
                });
                if (res && res.length) {
                    return res[0];
                }
            }
            return null;
        };
        WindowsManager.prototype.openNewWindow = function () {
            this.open({ cli: env.cliArgs, forceNewWindow: true, forceEmpty: true });
        };
        WindowsManager.prototype.sendToFocused = function (channel) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var focusedWindow = this.getFocusedWindow() || this.getLastActiveWindow();
            if (focusedWindow) {
                focusedWindow.sendWhenReady.apply(focusedWindow, [channel].concat(args));
            }
        };
        WindowsManager.prototype.sendToAll = function (channel, payload, windowIdsToIgnore) {
            WindowsManager.WINDOWS.forEach(function (w) {
                if (windowIdsToIgnore && windowIdsToIgnore.indexOf(w.id) >= 0) {
                    return; // do not send if we are instructed to ignore it
                }
                w.sendWhenReady(channel, payload);
            });
        };
        WindowsManager.prototype.getFocusedWindow = function () {
            var win = electron_1.BrowserWindow.getFocusedWindow();
            if (win) {
                return this.getWindowById(win.id);
            }
            return null;
        };
        WindowsManager.prototype.getWindowById = function (windowId) {
            var res = WindowsManager.WINDOWS.filter(function (w) { return w.id === windowId; });
            if (res && res.length === 1) {
                return res[0];
            }
            return null;
        };
        WindowsManager.prototype.getWindows = function () {
            return WindowsManager.WINDOWS;
        };
        WindowsManager.prototype.getWindowCount = function () {
            return WindowsManager.WINDOWS.length;
        };
        WindowsManager.prototype.onWindowError = function (vscodeWindow, error) {
            var _this = this;
            console.error(error === WindowError.CRASHED ? '[VS Code]: render process crashed!' : '[VS Code]: detected unresponsive');
            // Unresponsive
            if (error === WindowError.UNRESPONSIVE) {
                electron_1.dialog.showMessageBox(vscodeWindow.win, {
                    title: env.product.nameLong,
                    type: 'warning',
                    buttons: [nls.localize(4, null), nls.localize(5, null), nls.localize(6, null)],
                    message: nls.localize(7, null),
                    detail: nls.localize(8, null),
                    noLink: true
                }, function (result) {
                    if (result === 0) {
                        vscodeWindow.reload();
                    }
                    else if (result === 2) {
                        _this.onBeforeWindowClose(vscodeWindow); // 'close' event will not be fired on destroy(), so run it manually
                        vscodeWindow.win.destroy(); // make sure to destroy the window as it is unresponsive
                    }
                });
            }
            else {
                electron_1.dialog.showMessageBox(vscodeWindow.win, {
                    title: env.product.nameLong,
                    type: 'warning',
                    buttons: [nls.localize(9, null), nls.localize(10, null)],
                    message: nls.localize(11, null),
                    detail: nls.localize(12, null),
                    noLink: true
                }, function (result) {
                    if (result === 0) {
                        vscodeWindow.reload();
                    }
                    else if (result === 1) {
                        _this.onBeforeWindowClose(vscodeWindow); // 'close' event will not be fired on destroy(), so run it manually
                        vscodeWindow.win.destroy(); // make sure to destroy the window as it has crashed
                    }
                });
            }
        };
        WindowsManager.prototype.onBeforeWindowClose = function (win) {
            var _this = this;
            if (win.readyState !== window.ReadyState.READY) {
                return; // only persist windows that are fully loaded
            }
            // On Window close, update our stored state of this window
            var state = { workspacePath: win.openedWorkspacePath, uiState: win.serializeWindowState() };
            if (win.isPluginDevelopmentHost) {
                this.windowsState.lastPluginDevelopmentHostWindow = state;
            }
            else {
                this.windowsState.lastActiveWindow = state;
                this.windowsState.openedFolders.forEach(function (o) {
                    if (_this.isPathEqual(o.workspacePath, win.openedWorkspacePath)) {
                        o.uiState = state.uiState;
                    }
                });
            }
        };
        WindowsManager.prototype.onWindowClosed = function (win) {
            // Tell window
            win.dispose();
            // Remove from our list so that Electron can clean it up
            var index = WindowsManager.WINDOWS.indexOf(win);
            WindowsManager.WINDOWS.splice(index, 1);
            // Emit
            eventEmitter.emit(EventTypes.CLOSE, win.id);
        };
        WindowsManager.prototype.isPathEqual = function (pathA, pathB) {
            if (pathA === pathB) {
                return true;
            }
            if (!pathA || !pathB) {
                return false;
            }
            pathA = path.normalize(pathA);
            pathB = path.normalize(pathB);
            if (pathA === pathB) {
                return true;
            }
            if (!platform.isLinux) {
                pathA = pathA.toLowerCase();
                pathB = pathB.toLowerCase();
            }
            return pathA === pathB;
        };
        WindowsManager.openedPathsListStorageKey = 'openedPathsList';
        WindowsManager.workingDirPickerStorageKey = 'pickerWorkingDir';
        WindowsManager.windowsStateStorageKey = 'windowsState';
        WindowsManager.WINDOWS = [];
        return WindowsManager;
    }());
    exports.WindowsManager = WindowsManager;
    exports.manager = new WindowsManager();
});
//# sourceMappingURL=windows.js.map