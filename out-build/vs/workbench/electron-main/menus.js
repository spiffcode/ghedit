/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'electron', 'vs/nls!vs/workbench/electron-main/menus', 'vs/base/common/platform', 'vs/base/common/arrays', 'vs/workbench/electron-main/windows', 'vs/workbench/electron-main/env', 'vs/workbench/electron-main/storage', 'vs/workbench/electron-main/update-manager', 'vs/base/common/keyCodes'], function (require, exports, electron_1, nls, platform, arrays, windows, env, storage, um, keyCodes_1) {
    'use strict';
    var UpdateManager = um.Instance;
    var VSCodeMenu = (function () {
        function VSCodeMenu() {
            this.actionIdKeybindingRequests = [];
            this.mapResolvedKeybindingToActionId = Object.create(null);
            this.mapLastKnownKeybindingToActionId = storage.getItem(VSCodeMenu.lastKnownKeybindingsMapStorageKey) || Object.create(null);
        }
        VSCodeMenu.prototype.ready = function () {
            this.registerListeners();
            this.install();
        };
        VSCodeMenu.prototype.registerListeners = function () {
            var _this = this;
            // Keep flag when app quits
            electron_1.app.on('will-quit', function () {
                _this.isQuitting = true;
            });
            // Listen to "open" & "close" event from window manager
            windows.onOpen(function (paths) { return _this.onOpen(paths); });
            windows.onClose(function (_) { return _this.onClose(windows.manager.getWindowCount()); });
            // Resolve keybindings when any first workbench is loaded
            windows.onReady(function (win) { return _this.resolveKeybindings(win); });
            // Listen to resolved keybindings
            electron_1.ipcMain.on('vscode:keybindingsResolved', function (event, rawKeybindings) {
                var keybindings = [];
                try {
                    keybindings = JSON.parse(rawKeybindings);
                }
                catch (error) {
                }
                // Fill hash map of resolved keybindings
                var needsMenuUpdate = false;
                keybindings.forEach(function (keybinding) {
                    var accelerator = new keyCodes_1.Keybinding(keybinding.binding)._toElectronAccelerator();
                    if (accelerator) {
                        _this.mapResolvedKeybindingToActionId[keybinding.id] = accelerator;
                        if (_this.mapLastKnownKeybindingToActionId[keybinding.id] !== accelerator) {
                            needsMenuUpdate = true; // we only need to update when something changed!
                        }
                    }
                });
                // A keybinding might have been unassigned, so we have to account for that too
                if (Object.keys(_this.mapLastKnownKeybindingToActionId).length !== Object.keys(_this.mapResolvedKeybindingToActionId).length) {
                    needsMenuUpdate = true;
                }
                if (needsMenuUpdate) {
                    storage.setItem(VSCodeMenu.lastKnownKeybindingsMapStorageKey, _this.mapResolvedKeybindingToActionId); // keep to restore instantly after restart
                    _this.mapLastKnownKeybindingToActionId = _this.mapResolvedKeybindingToActionId; // update our last known map
                    _this.updateMenu();
                }
            });
            // Listen to update manager
            UpdateManager.on('change', function () { return _this.updateMenu(); });
        };
        VSCodeMenu.prototype.resolveKeybindings = function (win) {
            if (this.keybindingsResolved) {
                return; // only resolve once
            }
            this.keybindingsResolved = true;
            // Resolve keybindings when workbench window is up
            if (this.actionIdKeybindingRequests.length) {
                win.send('vscode:resolveKeybindings', JSON.stringify(this.actionIdKeybindingRequests));
            }
        };
        VSCodeMenu.prototype.updateMenu = function () {
            var _this = this;
            // Due to limitations in Electron, it is not possible to update menu items dynamically. The suggested
            // workaround from Electron is to set the application menu again.
            // See also https://github.com/atom/electron/issues/846
            //
            // Run delayed to prevent updating menu while it is open
            if (!this.isQuitting) {
                setTimeout(function () {
                    if (!_this.isQuitting) {
                        _this.install();
                    }
                }, 10 /* delay this because there is an issue with updating a menu when it is open */);
            }
        };
        VSCodeMenu.prototype.onOpen = function (path) {
            this.addToOpenedPathsList(path.filePath || path.workspacePath, !!path.filePath);
            this.updateMenu();
        };
        VSCodeMenu.prototype.onClose = function (remainingWindowCount) {
            if (remainingWindowCount === 0 && platform.isMacintosh) {
                this.updateMenu();
            }
        };
        VSCodeMenu.prototype.install = function () {
            // Menus
            var menubar = new electron_1.Menu();
            // Mac: Application
            var macApplicationMenuItem;
            if (platform.isMacintosh) {
                var applicationMenu = new electron_1.Menu();
                macApplicationMenuItem = new electron_1.MenuItem({ label: env.product.nameShort, submenu: applicationMenu });
                this.setMacApplicationMenu(applicationMenu);
            }
            // File
            var fileMenu = new electron_1.Menu();
            var fileMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(0, null)), submenu: fileMenu });
            this.setFileMenu(fileMenu);
            // Edit
            var editMenu = new electron_1.Menu();
            var editMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(1, null)), submenu: editMenu });
            this.setEditMenu(editMenu);
            // View
            var viewMenu = new electron_1.Menu();
            var viewMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(2, null)), submenu: viewMenu });
            this.setViewMenu(viewMenu);
            // Goto
            var gotoMenu = new electron_1.Menu();
            var gotoMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(3, null)), submenu: gotoMenu });
            this.setGotoMenu(gotoMenu);
            // Mac: Window
            var macWindowMenuItem;
            if (platform.isMacintosh) {
                var windowMenu = new electron_1.Menu();
                macWindowMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(4, null)), submenu: windowMenu, role: 'window' });
                this.setMacWindowMenu(windowMenu);
            }
            // Help
            var helpMenu = new electron_1.Menu();
            var helpMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(5, null)), submenu: helpMenu, role: 'help' });
            this.setHelpMenu(helpMenu);
            // Menu Structure
            if (macApplicationMenuItem) {
                menubar.append(macApplicationMenuItem);
            }
            menubar.append(fileMenuItem);
            menubar.append(editMenuItem);
            menubar.append(viewMenuItem);
            menubar.append(gotoMenuItem);
            if (macWindowMenuItem) {
                menubar.append(macWindowMenuItem);
            }
            menubar.append(helpMenuItem);
            electron_1.Menu.setApplicationMenu(menubar);
            // Dock Menu
            if (platform.isMacintosh && !this.appMenuInstalled) {
                this.appMenuInstalled = true;
                var dockMenu = new electron_1.Menu();
                dockMenu.append(new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(6, null)), click: function () { return windows.manager.openNewWindow(); } }));
                electron_1.app.dock.setMenu(dockMenu);
            }
        };
        VSCodeMenu.prototype.addToOpenedPathsList = function (path, isFile) {
            if (!path) {
                return;
            }
            var mru = this.getOpenedPathsList();
            if (isFile) {
                mru.files.unshift(path);
                mru.files = arrays.distinct(mru.files, function (f) { return platform.isLinux ? f : f.toLowerCase(); });
            }
            else {
                mru.folders.unshift(path);
                mru.folders = arrays.distinct(mru.folders, function (f) { return platform.isLinux ? f : f.toLowerCase(); });
            }
            // Make sure its bounded
            mru.folders = mru.folders.slice(0, VSCodeMenu.MAX_RECENT_ENTRIES);
            mru.files = mru.files.slice(0, VSCodeMenu.MAX_RECENT_ENTRIES);
            storage.setItem(windows.WindowsManager.openedPathsListStorageKey, mru);
        };
        VSCodeMenu.prototype.removeFromOpenedPathsList = function (path) {
            var mru = this.getOpenedPathsList();
            var index = mru.files.indexOf(path);
            if (index >= 0) {
                mru.files.splice(index, 1);
            }
            index = mru.folders.indexOf(path);
            if (index >= 0) {
                mru.folders.splice(index, 1);
            }
            storage.setItem(windows.WindowsManager.openedPathsListStorageKey, mru);
        };
        VSCodeMenu.prototype.clearOpenedPathsList = function () {
            storage.setItem(windows.WindowsManager.openedPathsListStorageKey, { folders: [], files: [] });
            electron_1.app.clearRecentDocuments();
            this.updateMenu();
        };
        VSCodeMenu.prototype.getOpenedPathsList = function () {
            var mru = storage.getItem(windows.WindowsManager.openedPathsListStorageKey);
            if (!mru) {
                mru = { folders: [], files: [] };
            }
            return mru;
        };
        VSCodeMenu.prototype.setMacApplicationMenu = function (macApplicationMenu) {
            var _this = this;
            var about = new electron_1.MenuItem({ label: nls.localize(7, null, env.product.nameLong), role: 'about' });
            var checkForUpdates = this.getUpdateMenuItems();
            var preferences = this.getPreferencesMenu();
            var hide = new electron_1.MenuItem({ label: nls.localize(8, null, env.product.nameLong), role: 'hide', accelerator: 'Command+H' });
            var hideOthers = new electron_1.MenuItem({ label: nls.localize(9, null), role: 'hideothers', accelerator: 'Command+Alt+H' });
            var showAll = new electron_1.MenuItem({ label: nls.localize(10, null), role: 'unhide' });
            var quit = new electron_1.MenuItem({ label: nls.localize(11, null, env.product.nameLong), click: function () { return _this.quit(); }, accelerator: 'Command+Q' });
            var actions = [about];
            actions.push.apply(actions, checkForUpdates);
            actions.push.apply(actions, [
                __separator__(),
                preferences,
                __separator__(),
                hide,
                hideOthers,
                showAll,
                __separator__(),
                quit
            ]);
            actions.forEach(function (i) { return macApplicationMenu.append(i); });
        };
        VSCodeMenu.prototype.setFileMenu = function (fileMenu) {
            var _this = this;
            var hasNoWindows = (windows.manager.getWindowCount() === 0);
            var newFile;
            if (hasNoWindows) {
                newFile = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(12, null)), accelerator: this.getAccelerator('workbench.action.files.newUntitledFile'), click: function () { return windows.manager.openNewWindow(); } });
            }
            else {
                newFile = this.createMenuItem(nls.localize(13, null), 'workbench.action.files.newUntitledFile');
            }
            var open = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(14, null)), accelerator: this.getAccelerator('workbench.action.files.openFileFolder'), click: function () { return windows.manager.openFileFolderPicker(); } });
            var openFile = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(15, null)), accelerator: this.getAccelerator('workbench.action.files.openFile'), click: function () { return windows.manager.openFilePicker(); } });
            var openFolder = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(16, null)), accelerator: this.getAccelerator('workbench.action.files.openFolder'), click: function () { return windows.manager.openFolderPicker(); } });
            var openRecentMenu = new electron_1.Menu();
            this.setOpenRecentMenu(openRecentMenu);
            var openRecent = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(17, null)), submenu: openRecentMenu, enabled: openRecentMenu.items.length > 0 });
            var saveFile = this.createMenuItem(nls.localize(18, null), 'workbench.action.files.save', windows.manager.getWindowCount() > 0);
            var saveFileAs = this.createMenuItem(nls.localize(19, null), 'workbench.action.files.saveAs', windows.manager.getWindowCount() > 0);
            var saveAllFiles = this.createMenuItem(nls.localize(20, null), 'workbench.action.files.saveAll', windows.manager.getWindowCount() > 0);
            var preferences = this.getPreferencesMenu();
            var newWindow = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(21, null)), accelerator: this.getAccelerator('workbench.action.newWindow'), click: function () { return windows.manager.openNewWindow(); } });
            var revertFile = this.createMenuItem(nls.localize(22, null), 'workbench.action.files.revert', windows.manager.getWindowCount() > 0);
            var closeWindow = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(23, null)), accelerator: this.getAccelerator('workbench.action.closeWindow'), click: function () { return windows.manager.getLastActiveWindow().win.close(); }, enabled: windows.manager.getWindowCount() > 0 });
            var closeFolder = this.createMenuItem(nls.localize(24, null), 'workbench.action.closeFolder');
            var closeEditor = this.createMenuItem(nls.localize(25, null), 'workbench.action.closeActiveEditor');
            var exit = this.createMenuItem(nls.localize(26, null), function () { return _this.quit(); });
            arrays.coalesce([
                newFile,
                newWindow,
                __separator__(),
                platform.isMacintosh ? open : null,
                !platform.isMacintosh ? openFile : null,
                !platform.isMacintosh ? openFolder : null,
                openRecent,
                __separator__(),
                saveFile,
                saveFileAs,
                saveAllFiles,
                __separator__(),
                !platform.isMacintosh ? preferences : null,
                !platform.isMacintosh ? __separator__() : null,
                revertFile,
                closeEditor,
                closeFolder,
                !platform.isMacintosh ? closeWindow : null,
                !platform.isMacintosh ? __separator__() : null,
                !platform.isMacintosh ? exit : null
            ]).forEach(function (item) { return fileMenu.append(item); });
        };
        VSCodeMenu.prototype.getPreferencesMenu = function () {
            var userSettings = this.createMenuItem(nls.localize(27, null), 'workbench.action.openGlobalSettings');
            var workspaceSettings = this.createMenuItem(nls.localize(28, null), 'workbench.action.openWorkspaceSettings');
            var kebindingSettings = this.createMenuItem(nls.localize(29, null), 'workbench.action.openGlobalKeybindings');
            var snippetsSettings = this.createMenuItem(nls.localize(30, null), 'workbench.action.openSnippets');
            var themeSelection = this.createMenuItem(nls.localize(31, null), 'workbench.action.selectTheme');
            var preferencesMenu = new electron_1.Menu();
            preferencesMenu.append(userSettings);
            preferencesMenu.append(workspaceSettings);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(kebindingSettings);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(snippetsSettings);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(themeSelection);
            return new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(32, null)), submenu: preferencesMenu });
        };
        VSCodeMenu.prototype.quit = function () {
            var _this = this;
            // If the user selected to exit from an extension development host window, do not quit, but just
            // close the window unless this is the last window that is opened.
            var vscodeWindow = windows.manager.getFocusedWindow();
            if (vscodeWindow && vscodeWindow.isPluginDevelopmentHost && windows.manager.getWindowCount() > 1) {
                vscodeWindow.win.close();
            }
            else {
                setTimeout(function () {
                    _this.isQuitting = true;
                    electron_1.app.quit();
                }, 10 /* delay this because there is an issue with quitting while the menu is open */);
            }
        };
        VSCodeMenu.prototype.setOpenRecentMenu = function (openRecentMenu) {
            var _this = this;
            var recentList = this.getOpenedPathsList();
            // Folders
            recentList.folders.forEach(function (folder, index) {
                if (index < VSCodeMenu.MAX_RECENT_ENTRIES) {
                    openRecentMenu.append(_this.createOpenRecentMenuItem(folder));
                }
            });
            // Files
            var files = recentList.files;
            if (platform.isMacintosh && recentList.files.length > 0) {
                files = recentList.files.filter(function (f) { return recentList.folders.indexOf(f) < 0; }); // TODO@Ben migration (remove in the future)
            }
            if (files.length > 0) {
                if (recentList.folders.length > 0) {
                    openRecentMenu.append(__separator__());
                }
                files.forEach(function (file, index) {
                    if (index < VSCodeMenu.MAX_RECENT_ENTRIES) {
                        openRecentMenu.append(_this.createOpenRecentMenuItem(file));
                    }
                });
            }
            if (recentList.folders.length || files.length) {
                openRecentMenu.append(__separator__());
                openRecentMenu.append(new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(33, null)), click: function () { return _this.clearOpenedPathsList(); } }));
            }
        };
        VSCodeMenu.prototype.createOpenRecentMenuItem = function (path) {
            var _this = this;
            return new electron_1.MenuItem({
                label: path, click: function () {
                    var success = !!windows.manager.open({ cli: env.cliArgs, pathsToOpen: [path] });
                    if (!success) {
                        _this.removeFromOpenedPathsList(path);
                        _this.updateMenu();
                    }
                }
            });
        };
        VSCodeMenu.prototype.createRoleMenuItem = function (label, actionId, role) {
            var options = {
                label: mnemonicLabel(label),
                accelerator: this.getAccelerator(actionId),
                role: role,
                enabled: true
            };
            return new electron_1.MenuItem(options);
        };
        VSCodeMenu.prototype.setEditMenu = function (winLinuxEditMenu) {
            var undo;
            var redo;
            var cut;
            var copy;
            var paste;
            var selectAll;
            if (platform.isMacintosh) {
                undo = this.createDevToolsAwareMenuItem(nls.localize(34, null), 'undo', function (devTools) { return devTools.undo(); });
                redo = this.createDevToolsAwareMenuItem(nls.localize(35, null), 'redo', function (devTools) { return devTools.redo(); });
                cut = this.createRoleMenuItem(nls.localize(36, null), 'editor.action.clipboardCutAction', 'cut');
                copy = this.createRoleMenuItem(nls.localize(37, null), 'editor.action.clipboardCopyAction', 'copy');
                paste = this.createRoleMenuItem(nls.localize(38, null), 'editor.action.clipboardPasteAction', 'paste');
                selectAll = this.createDevToolsAwareMenuItem(nls.localize(39, null), 'editor.action.selectAll', function (devTools) { return devTools.selectAll(); });
            }
            else {
                undo = this.createMenuItem(nls.localize(40, null), 'undo');
                redo = this.createMenuItem(nls.localize(41, null), 'redo');
                cut = this.createMenuItem(nls.localize(42, null), 'editor.action.clipboardCutAction');
                copy = this.createMenuItem(nls.localize(43, null), 'editor.action.clipboardCopyAction');
                paste = this.createMenuItem(nls.localize(44, null), 'editor.action.clipboardPasteAction');
                selectAll = this.createMenuItem(nls.localize(45, null), 'editor.action.selectAll');
            }
            var find = this.createMenuItem(nls.localize(46, null), 'actions.find');
            var replace = this.createMenuItem(nls.localize(47, null), 'editor.action.startFindReplaceAction');
            var findInFiles = this.createMenuItem(nls.localize(48, null), 'workbench.view.search');
            [
                undo,
                redo,
                __separator__(),
                cut,
                copy,
                paste,
                selectAll,
                __separator__(),
                find,
                replace,
                __separator__(),
                findInFiles
            ].forEach(function (item) { return winLinuxEditMenu.append(item); });
        };
        VSCodeMenu.prototype.setViewMenu = function (viewMenu) {
            var explorer = this.createMenuItem(nls.localize(49, null), 'workbench.view.explorer');
            var search = this.createMenuItem(nls.localize(50, null), 'workbench.view.search');
            var git = this.createMenuItem(nls.localize(51, null), 'workbench.view.git');
            var debug = this.createMenuItem(nls.localize(52, null), 'workbench.view.debug');
            var commands = this.createMenuItem(nls.localize(53, null), 'workbench.action.showCommands');
            var markers = this.createMenuItem(nls.localize(54, null), 'workbench.action.showErrorsWarnings');
            var output = this.createMenuItem(nls.localize(55, null), 'workbench.action.output.toggleOutput');
            var debugConsole = this.createMenuItem(nls.localize(56, null), 'workbench.debug.action.toggleRepl');
            var fullscreen = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(57, null)), accelerator: this.getAccelerator('workbench.action.toggleFullScreen'), click: function () { return windows.manager.getLastActiveWindow().toggleFullScreen(); }, enabled: windows.manager.getWindowCount() > 0 });
            var toggleMenuBar = this.createMenuItem(nls.localize(58, null), 'workbench.action.toggleMenuBar');
            var splitEditor = this.createMenuItem(nls.localize(59, null), 'workbench.action.splitEditor');
            var toggleSidebar = this.createMenuItem(nls.localize(60, null), 'workbench.action.toggleSidebarVisibility');
            var moveSidebar = this.createMenuItem(nls.localize(61, null), 'workbench.action.toggleSidebarPosition');
            var togglePanel = this.createMenuItem(nls.localize(62, null), 'workbench.action.togglePanel');
            var toggleWordWrap = this.createMenuItem(nls.localize(63, null), 'editor.action.toggleWordWrap');
            var toggleRenderWhitespace = this.createMenuItem(nls.localize(64, null), 'editor.action.toggleRenderWhitespace');
            var zoomIn = this.createMenuItem(nls.localize(65, null), 'workbench.action.zoomIn');
            var zoomOut = this.createMenuItem(nls.localize(66, null), 'workbench.action.zoomOut');
            arrays.coalesce([
                explorer,
                search,
                git,
                debug,
                __separator__(),
                commands,
                markers,
                __separator__(),
                output,
                debugConsole,
                __separator__(),
                fullscreen,
                platform.isWindows || platform.isLinux ? toggleMenuBar : void 0,
                __separator__(),
                splitEditor,
                toggleSidebar,
                moveSidebar,
                togglePanel,
                __separator__(),
                toggleWordWrap,
                toggleRenderWhitespace,
                __separator__(),
                zoomIn,
                zoomOut
            ]).forEach(function (item) { return viewMenu.append(item); });
        };
        VSCodeMenu.prototype.setGotoMenu = function (gotoMenu) {
            var back = this.createMenuItem(nls.localize(67, null), 'workbench.action.navigateBack');
            var forward = this.createMenuItem(nls.localize(68, null), 'workbench.action.navigateForward');
            var navigateHistory = this.createMenuItem(nls.localize(69, null), 'workbench.action.openPreviousEditor');
            var gotoFile = this.createMenuItem(nls.localize(70, null), 'workbench.action.quickOpen');
            var gotoSymbol = this.createMenuItem(nls.localize(71, null), 'workbench.action.gotoSymbol');
            var gotoDefinition = this.createMenuItem(nls.localize(72, null), 'editor.action.goToDeclaration');
            var gotoLine = this.createMenuItem(nls.localize(73, null), 'workbench.action.gotoLine');
            [
                back,
                forward,
                __separator__(),
                navigateHistory,
                __separator__(),
                gotoFile,
                gotoSymbol,
                gotoDefinition,
                gotoLine
            ].forEach(function (item) { return gotoMenu.append(item); });
        };
        VSCodeMenu.prototype.setMacWindowMenu = function (macWindowMenu) {
            var minimize = new electron_1.MenuItem({ label: nls.localize(74, null), role: 'minimize', accelerator: 'Command+M', enabled: windows.manager.getWindowCount() > 0 });
            var close = new electron_1.MenuItem({ label: nls.localize(75, null), role: 'close', accelerator: 'Command+W', enabled: windows.manager.getWindowCount() > 0 });
            var bringAllToFront = new electron_1.MenuItem({ label: nls.localize(76, null), role: 'front', enabled: windows.manager.getWindowCount() > 0 });
            [
                minimize,
                close,
                __separator__(),
                bringAllToFront
            ].forEach(function (item) { return macWindowMenu.append(item); });
        };
        VSCodeMenu.prototype.setHelpMenu = function (helpMenu) {
            var toggleDevToolsItem = new electron_1.MenuItem({
                label: mnemonicLabel(nls.localize(77, null)),
                accelerator: this.getAccelerator('workbench.action.toggleDevTools'),
                click: toggleDevTools,
                enabled: (windows.manager.getWindowCount() > 0)
            });
            arrays.coalesce([
                env.product.documentationUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(78, null)), click: function () { return openUrl(env.product.documentationUrl, 'openDocumentationUrl'); } }) : null,
                env.product.releaseNotesUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(79, null)), click: function () { return openUrl(env.product.releaseNotesUrl, 'openReleaseNotesUrl'); } }) : null,
                (env.product.documentationUrl || env.product.releaseNotesUrl) ? __separator__() : null,
                env.product.twitterUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(80, null)), click: function () { return openUrl(env.product.twitterUrl, 'openTwitterUrl'); } }) : null,
                env.product.requestFeatureUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(81, null)), click: function () { return openUrl(env.product.requestFeatureUrl, 'openUserVoiceUrl'); } }) : null,
                env.product.reportIssueUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(82, null)), click: function () { return openUrl(env.product.reportIssueUrl, 'openReportIssues'); } }) : null,
                (env.product.twitterUrl || env.product.requestFeatureUrl || env.product.reportIssueUrl) ? __separator__() : null,
                env.product.licenseUrl ? new electron_1.MenuItem({
                    label: mnemonicLabel(nls.localize(83, null)), click: function () {
                        if (platform.language) {
                            var queryArgChar = env.product.licenseUrl.indexOf('?') > 0 ? '&' : '?';
                            openUrl("" + env.product.licenseUrl + queryArgChar + "lang=" + platform.language, 'openLicenseUrl');
                        }
                        else {
                            openUrl(env.product.licenseUrl, 'openLicenseUrl');
                        }
                    }
                }) : null,
                env.product.privacyStatementUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(84, null)), click: function () { return openUrl(env.product.privacyStatementUrl, 'openPrivacyStatement'); } }) : null,
                (env.product.licenseUrl || env.product.privacyStatementUrl) ? __separator__() : null,
                toggleDevToolsItem,
            ]).forEach(function (item) { return helpMenu.append(item); });
            if (!platform.isMacintosh) {
                var updateMenuItems = this.getUpdateMenuItems();
                if (updateMenuItems.length) {
                    helpMenu.append(__separator__());
                    updateMenuItems.forEach(function (i) { return helpMenu.append(i); });
                }
                helpMenu.append(__separator__());
                helpMenu.append(new electron_1.MenuItem({ label: mnemonicLabel(nls.localize(85, null)), click: openAboutDialog }));
            }
        };
        VSCodeMenu.prototype.getUpdateMenuItems = function () {
            switch (UpdateManager.state) {
                case um.State.Uninitialized:
                    return [];
                case um.State.UpdateDownloaded:
                    var update_1 = UpdateManager.availableUpdate;
                    return [new electron_1.MenuItem({
                            label: nls.localize(86, null), click: function () {
                                reportMenuActionTelemetry('RestartToUpdate');
                                update_1.quitAndUpdate();
                            }
                        })];
                case um.State.CheckingForUpdate:
                    return [new electron_1.MenuItem({ label: nls.localize(87, null), enabled: false })];
                case um.State.UpdateAvailable:
                    if (platform.isLinux) {
                        var update_2 = UpdateManager.availableUpdate;
                        return [new electron_1.MenuItem({
                                label: nls.localize(88, null), click: function () {
                                    update_2.quitAndUpdate();
                                }
                            })];
                    }
                    var updateAvailableLabel = platform.isWindows
                        ? nls.localize(89, null)
                        : nls.localize(90, null);
                    return [new electron_1.MenuItem({ label: updateAvailableLabel, enabled: false })];
                default:
                    var result = [new electron_1.MenuItem({
                            label: nls.localize(91, null), click: function () { return setTimeout(function () {
                                reportMenuActionTelemetry('CheckForUpdate');
                                UpdateManager.checkForUpdates(true);
                            }, 0); }
                        })];
                    if (UpdateManager.lastCheckDate) {
                        result.push(new electron_1.MenuItem({ label: nls.localize(92, null, UpdateManager.lastCheckDate.toLocaleTimeString()), enabled: false }));
                    }
                    return result;
            }
        };
        VSCodeMenu.prototype.createMenuItem = function (arg1, arg2, arg3) {
            var label = mnemonicLabel(arg1);
            var click = (typeof arg2 === 'function') ? arg2 : function () { return windows.manager.sendToFocused('vscode:runAction', arg2); };
            var enabled = typeof arg3 === 'boolean' ? arg3 : windows.manager.getWindowCount() > 0;
            var actionId;
            if (typeof arg2 === 'string') {
                actionId = arg2;
            }
            var options = {
                label: label,
                accelerator: this.getAccelerator(actionId),
                click: click,
                enabled: enabled
            };
            return new electron_1.MenuItem(options);
        };
        VSCodeMenu.prototype.createDevToolsAwareMenuItem = function (label, actionId, devToolsFocusedFn) {
            return new electron_1.MenuItem({
                label: mnemonicLabel(label),
                accelerator: this.getAccelerator(actionId),
                enabled: windows.manager.getWindowCount() > 0,
                click: function () {
                    var windowInFocus = windows.manager.getFocusedWindow();
                    if (!windowInFocus) {
                        return;
                    }
                    if (windowInFocus.win.isDevToolsFocused()) {
                        devToolsFocusedFn(windowInFocus.win.devToolsWebContents);
                    }
                    else {
                        windows.manager.sendToFocused('vscode:runAction', actionId);
                    }
                }
            });
        };
        VSCodeMenu.prototype.getAccelerator = function (actionId) {
            if (actionId) {
                var resolvedKeybinding = this.mapResolvedKeybindingToActionId[actionId];
                if (resolvedKeybinding) {
                    return resolvedKeybinding; // keybinding is fully resolved
                }
                if (!this.keybindingsResolved) {
                    this.actionIdKeybindingRequests.push(actionId); // keybinding needs to be resolved
                }
                var lastKnownKeybinding = this.mapLastKnownKeybindingToActionId[actionId];
                return lastKnownKeybinding; // return the last known keybining (chance of mismatch is very low unless it changed)
            }
            return void (0);
        };
        VSCodeMenu.lastKnownKeybindingsMapStorageKey = 'lastKnownKeybindings';
        VSCodeMenu.MAX_RECENT_ENTRIES = 10;
        return VSCodeMenu;
    }());
    exports.VSCodeMenu = VSCodeMenu;
    function openAboutDialog() {
        var lastActiveWindow = windows.manager.getFocusedWindow() || windows.manager.getLastActiveWindow();
        electron_1.dialog.showMessageBox(lastActiveWindow && lastActiveWindow.win, {
            title: env.product.nameLong,
            type: 'info',
            message: env.product.nameLong,
            detail: nls.localize(93, null, electron_1.app.getVersion(), env.product.commit || 'Unknown', env.product.date || 'Unknown', process.versions['electron'], process.versions['chrome'], process.versions['node']),
            buttons: [nls.localize(94, null)],
            noLink: true
        }, function (result) { return null; });
        reportMenuActionTelemetry('showAboutDialog');
    }
    function openUrl(url, id) {
        electron_1.shell.openExternal(url);
        reportMenuActionTelemetry(id);
    }
    function toggleDevTools() {
        var w = windows.manager.getFocusedWindow();
        if (w && w.win) {
            w.win.webContents.toggleDevTools();
        }
    }
    function reportMenuActionTelemetry(id) {
        windows.manager.sendToFocused('vscode:telemetry', { eventName: 'workbenchActionExecuted', data: { id: id, from: 'menu' } });
    }
    function __separator__() {
        return new electron_1.MenuItem({ type: 'separator' });
    }
    function mnemonicLabel(label) {
        if (platform.isMacintosh) {
            return label.replace(/&&/g, ''); // no mnemonic support on mac
        }
        return label.replace(/&&/g, '&');
    }
    exports.manager = new VSCodeMenu();
});
//# sourceMappingURL=menus.js.map