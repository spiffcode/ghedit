/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'electron', 'vs/nls', 'vs/base/common/platform', 'vs/base/common/arrays', 'vs/workbench/electron-main/windows', 'vs/workbench/electron-main/env', 'vs/workbench/electron-main/storage', 'vs/workbench/electron-main/update-manager', 'vs/base/common/keyCodes'], function (require, exports, electron_1, nls, platform, arrays, windows_1, env, storage_1, update_manager_1, keyCodes_1) {
    'use strict';
    var VSCodeMenu = (function () {
        function VSCodeMenu(storageService, updateManager, windowsManager, envService) {
            this.storageService = storageService;
            this.updateManager = updateManager;
            this.windowsManager = windowsManager;
            this.envService = envService;
            this.actionIdKeybindingRequests = [];
            this.mapResolvedKeybindingToActionId = Object.create(null);
            this.mapLastKnownKeybindingToActionId = this.storageService.getItem(VSCodeMenu.lastKnownKeybindingsMapStorageKey) || Object.create(null);
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
            this.windowsManager.onOpen(function (paths) { return _this.onOpen(paths); });
            this.windowsManager.onClose(function (_) { return _this.onClose(_this.windowsManager.getWindowCount()); });
            // Resolve keybindings when any first workbench is loaded
            this.windowsManager.onReady(function (win) { return _this.resolveKeybindings(win); });
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
                    _this.storageService.setItem(VSCodeMenu.lastKnownKeybindingsMapStorageKey, _this.mapResolvedKeybindingToActionId); // keep to restore instantly after restart
                    _this.mapLastKnownKeybindingToActionId = _this.mapResolvedKeybindingToActionId; // update our last known map
                    _this.updateMenu();
                }
            });
            // Listen to update manager
            this.updateManager.on('change', function () { return _this.updateMenu(); });
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
            // See also https://github.com/electron/electron/issues/846
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
            var _this = this;
            // Menus
            var menubar = new electron_1.Menu();
            // Mac: Application
            var macApplicationMenuItem;
            if (platform.isMacintosh) {
                var applicationMenu = new electron_1.Menu();
                macApplicationMenuItem = new electron_1.MenuItem({ label: this.envService.product.nameShort, submenu: applicationMenu });
                this.setMacApplicationMenu(applicationMenu);
            }
            // File
            var fileMenu = new electron_1.Menu();
            var fileMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'mFile', comment: ['&& denotes a mnemonic'] }, "&&File")), submenu: fileMenu });
            this.setFileMenu(fileMenu);
            // Edit
            var editMenu = new electron_1.Menu();
            var editMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'mEdit', comment: ['&& denotes a mnemonic'] }, "&&Edit")), submenu: editMenu });
            this.setEditMenu(editMenu);
            // View
            var viewMenu = new electron_1.Menu();
            var viewMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'mView', comment: ['&& denotes a mnemonic'] }, "&&View")), submenu: viewMenu });
            this.setViewMenu(viewMenu);
            // Goto
            var gotoMenu = new electron_1.Menu();
            var gotoMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'mGoto', comment: ['&& denotes a mnemonic'] }, "&&Goto")), submenu: gotoMenu });
            this.setGotoMenu(gotoMenu);
            // Mac: Window
            var macWindowMenuItem;
            if (platform.isMacintosh) {
                var windowMenu = new electron_1.Menu();
                macWindowMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize('mWindow', "Window")), submenu: windowMenu, role: 'window' });
                this.setMacWindowMenu(windowMenu);
            }
            // Help
            var helpMenu = new electron_1.Menu();
            var helpMenuItem = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'mHelp', comment: ['&& denotes a mnemonic'] }, "&&Help")), submenu: helpMenu, role: 'help' });
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
                dockMenu.append(new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miNewWindow', comment: ['&& denotes a mnemonic'] }, "&&New Window")), click: function () { return _this.windowsManager.openNewWindow(); } }));
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
            this.storageService.setItem(windows_1.WindowsManager.openedPathsListStorageKey, mru);
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
            this.storageService.setItem(windows_1.WindowsManager.openedPathsListStorageKey, mru);
        };
        VSCodeMenu.prototype.clearOpenedPathsList = function () {
            this.storageService.setItem(windows_1.WindowsManager.openedPathsListStorageKey, { folders: [], files: [] });
            electron_1.app.clearRecentDocuments();
            this.updateMenu();
        };
        VSCodeMenu.prototype.getOpenedPathsList = function () {
            var mru = this.storageService.getItem(windows_1.WindowsManager.openedPathsListStorageKey);
            if (!mru) {
                mru = { folders: [], files: [] };
            }
            return mru;
        };
        VSCodeMenu.prototype.setMacApplicationMenu = function (macApplicationMenu) {
            var _this = this;
            var about = new electron_1.MenuItem({ label: nls.localize('mAbout', "About {0}", this.envService.product.nameLong), role: 'about' });
            var checkForUpdates = this.getUpdateMenuItems();
            var preferences = this.getPreferencesMenu();
            var hide = new electron_1.MenuItem({ label: nls.localize('mHide', "Hide {0}", this.envService.product.nameLong), role: 'hide', accelerator: 'Command+H' });
            var hideOthers = new electron_1.MenuItem({ label: nls.localize('mHideOthers', "Hide Others"), role: 'hideothers', accelerator: 'Command+Alt+H' });
            var showAll = new electron_1.MenuItem({ label: nls.localize('mShowAll', "Show All"), role: 'unhide' });
            var quit = new electron_1.MenuItem({ label: nls.localize('miQuit', "Quit {0}", this.envService.product.nameLong), click: function () { return _this.quit(); }, accelerator: 'Command+Q' });
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
            var hasNoWindows = (this.windowsManager.getWindowCount() === 0);
            var newFile;
            if (hasNoWindows) {
                newFile = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miNewFile', comment: ['&& denotes a mnemonic'] }, "&&New File")), accelerator: this.getAccelerator('workbench.action.files.newUntitledFile'), click: function () { return _this.windowsManager.openNewWindow(); } });
            }
            else {
                newFile = this.createMenuItem(nls.localize({ key: 'miNewFile', comment: ['&& denotes a mnemonic'] }, "&&New File"), 'workbench.action.files.newUntitledFile');
            }
            var open = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miOpen', comment: ['&& denotes a mnemonic'] }, "&&Open...")), accelerator: this.getAccelerator('workbench.action.files.openFileFolder'), click: function () { return _this.windowsManager.openFileFolderPicker(); } });
            var openFile = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miOpenFile', comment: ['&& denotes a mnemonic'] }, "&&Open File...")), accelerator: this.getAccelerator('workbench.action.files.openFile'), click: function () { return _this.windowsManager.openFilePicker(); } });
            var openFolder = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miOpenFolder', comment: ['&& denotes a mnemonic'] }, "Open &&Folder...")), accelerator: this.getAccelerator('workbench.action.files.openFolder'), click: function () { return _this.windowsManager.openFolderPicker(); } });
            var openRecentMenu = new electron_1.Menu();
            this.setOpenRecentMenu(openRecentMenu);
            var openRecent = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miOpenRecent', comment: ['&& denotes a mnemonic'] }, "Open &&Recent")), submenu: openRecentMenu, enabled: openRecentMenu.items.length > 0 });
            var saveFile = this.createMenuItem(nls.localize({ key: 'miSave', comment: ['&& denotes a mnemonic'] }, "&&Save"), 'workbench.action.files.save', this.windowsManager.getWindowCount() > 0);
            var saveFileAs = this.createMenuItem(nls.localize({ key: 'miSaveAs', comment: ['&& denotes a mnemonic'] }, "Save &&As..."), 'workbench.action.files.saveAs', this.windowsManager.getWindowCount() > 0);
            var saveAllFiles = this.createMenuItem(nls.localize({ key: 'miSaveAll', comment: ['&& denotes a mnemonic'] }, "Save A&&ll"), 'workbench.action.files.saveAll', this.windowsManager.getWindowCount() > 0);
            var preferences = this.getPreferencesMenu();
            var newWindow = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miNewWindow', comment: ['&& denotes a mnemonic'] }, "&&New Window")), accelerator: this.getAccelerator('workbench.action.newWindow'), click: function () { return _this.windowsManager.openNewWindow(); } });
            var revertFile = this.createMenuItem(nls.localize({ key: 'miRevert', comment: ['&& denotes a mnemonic'] }, "Revert F&&ile"), 'workbench.action.files.revert', this.windowsManager.getWindowCount() > 0);
            var closeWindow = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miCloseWindow', comment: ['&& denotes a mnemonic'] }, "Close &&Window")), accelerator: this.getAccelerator('workbench.action.closeWindow'), click: function () { return _this.windowsManager.getLastActiveWindow().win.close(); }, enabled: this.windowsManager.getWindowCount() > 0 });
            var closeFolder = this.createMenuItem(nls.localize({ key: 'miCloseFolder', comment: ['&& denotes a mnemonic'] }, "Close &&Folder"), 'workbench.action.closeFolder');
            var closeEditor = this.createMenuItem(nls.localize({ key: 'miCloseEditor', comment: ['&& denotes a mnemonic'] }, "Close &&Editor"), 'workbench.action.closeActiveEditor');
            var exit = this.createMenuItem(nls.localize({ key: 'miExit', comment: ['&& denotes a mnemonic'] }, "E&&xit"), function () { return _this.quit(); });
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
            var userSettings = this.createMenuItem(nls.localize({ key: 'miOpenSettings', comment: ['&& denotes a mnemonic'] }, "&&User Settings"), 'workbench.action.openGlobalSettings');
            var workspaceSettings = this.createMenuItem(nls.localize({ key: 'miOpenWorkspaceSettings', comment: ['&& denotes a mnemonic'] }, "&&Workspace Settings"), 'workbench.action.openWorkspaceSettings');
            var kebindingSettings = this.createMenuItem(nls.localize({ key: 'miOpenKeymap', comment: ['&& denotes a mnemonic'] }, "&&Keyboard Shortcuts"), 'workbench.action.openGlobalKeybindings');
            var snippetsSettings = this.createMenuItem(nls.localize({ key: 'miOpenSnippets', comment: ['&& denotes a mnemonic'] }, "User &&Snippets"), 'workbench.action.openSnippets');
            var themeSelection = this.createMenuItem(nls.localize({ key: 'miSelectTheme', comment: ['&& denotes a mnemonic'] }, "&&Color Theme"), 'workbench.action.selectTheme');
            var preferencesMenu = new electron_1.Menu();
            preferencesMenu.append(userSettings);
            preferencesMenu.append(workspaceSettings);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(kebindingSettings);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(snippetsSettings);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(themeSelection);
            return new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miPreferences', comment: ['&& denotes a mnemonic'] }, "&&Preferences")), submenu: preferencesMenu });
        };
        VSCodeMenu.prototype.quit = function () {
            var _this = this;
            // If the user selected to exit from an extension development host window, do not quit, but just
            // close the window unless this is the last window that is opened.
            var vscodeWindow = this.windowsManager.getFocusedWindow();
            if (vscodeWindow && vscodeWindow.isPluginDevelopmentHost && this.windowsManager.getWindowCount() > 1) {
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
            openRecentMenu.append(this.createMenuItem(nls.localize({ key: 'miReopenClosedFile', comment: ['&& denotes a mnemonic'] }, "&&Reopen Closed File"), 'workbench.files.action.reopenClosedFile'));
            var recentList = this.getOpenedPathsList();
            // Folders
            if (recentList.folders.length > 0) {
                openRecentMenu.append(__separator__());
                recentList.folders.forEach(function (folder, index) {
                    if (index < VSCodeMenu.MAX_RECENT_ENTRIES) {
                        openRecentMenu.append(_this.createOpenRecentMenuItem(folder));
                    }
                });
            }
            // Files
            var files = recentList.files;
            if (platform.isMacintosh && recentList.files.length > 0) {
                files = recentList.files.filter(function (f) { return recentList.folders.indexOf(f) < 0; }); // TODO@Ben migration (remove in the future)
            }
            if (files.length > 0) {
                openRecentMenu.append(__separator__());
                files.forEach(function (file, index) {
                    if (index < VSCodeMenu.MAX_RECENT_ENTRIES) {
                        openRecentMenu.append(_this.createOpenRecentMenuItem(file));
                    }
                });
            }
            if (recentList.folders.length || files.length) {
                openRecentMenu.append(__separator__());
                openRecentMenu.append(new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miClearItems', comment: ['&& denotes a mnemonic'] }, "&&Clear Items")), click: function () { return _this.clearOpenedPathsList(); } }));
            }
        };
        VSCodeMenu.prototype.createOpenRecentMenuItem = function (path) {
            var _this = this;
            return new electron_1.MenuItem({
                label: path, click: function () {
                    var success = !!_this.windowsManager.open({ cli: _this.envService.cliArgs, pathsToOpen: [path] });
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
                undo = this.createDevToolsAwareMenuItem(nls.localize({ key: 'miUndo', comment: ['&& denotes a mnemonic'] }, "&&Undo"), 'undo', function (devTools) { return devTools.undo(); });
                redo = this.createDevToolsAwareMenuItem(nls.localize({ key: 'miRedo', comment: ['&& denotes a mnemonic'] }, "&&Redo"), 'redo', function (devTools) { return devTools.redo(); });
                cut = this.createRoleMenuItem(nls.localize({ key: 'miCut', comment: ['&& denotes a mnemonic'] }, "&&Cut"), 'editor.action.clipboardCutAction', 'cut');
                copy = this.createRoleMenuItem(nls.localize({ key: 'miCopy', comment: ['&& denotes a mnemonic'] }, "C&&opy"), 'editor.action.clipboardCopyAction', 'copy');
                paste = this.createRoleMenuItem(nls.localize({ key: 'miPaste', comment: ['&& denotes a mnemonic'] }, "&&Paste"), 'editor.action.clipboardPasteAction', 'paste');
                selectAll = this.createDevToolsAwareMenuItem(nls.localize({ key: 'miSelectAll', comment: ['&& denotes a mnemonic'] }, "&&Select All"), 'editor.action.selectAll', function (devTools) { return devTools.selectAll(); });
            }
            else {
                undo = this.createMenuItem(nls.localize({ key: 'miUndo', comment: ['&& denotes a mnemonic'] }, "&&Undo"), 'undo');
                redo = this.createMenuItem(nls.localize({ key: 'miRedo', comment: ['&& denotes a mnemonic'] }, "&&Redo"), 'redo');
                cut = this.createMenuItem(nls.localize({ key: 'miCut', comment: ['&& denotes a mnemonic'] }, "&&Cut"), 'editor.action.clipboardCutAction');
                copy = this.createMenuItem(nls.localize({ key: 'miCopy', comment: ['&& denotes a mnemonic'] }, "C&&opy"), 'editor.action.clipboardCopyAction');
                paste = this.createMenuItem(nls.localize({ key: 'miPaste', comment: ['&& denotes a mnemonic'] }, "&&Paste"), 'editor.action.clipboardPasteAction');
                selectAll = this.createMenuItem(nls.localize({ key: 'miSelectAll', comment: ['&& denotes a mnemonic'] }, "&&Select All"), 'editor.action.selectAll');
            }
            var find = this.createMenuItem(nls.localize({ key: 'miFind', comment: ['&& denotes a mnemonic'] }, "&&Find"), 'actions.find');
            var replace = this.createMenuItem(nls.localize({ key: 'miReplace', comment: ['&& denotes a mnemonic'] }, "&&Replace"), 'editor.action.startFindReplaceAction');
            var findInFiles = this.createMenuItem(nls.localize({ key: 'miFindInFiles', comment: ['&& denotes a mnemonic'] }, "Find &&in Files"), 'workbench.view.search');
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
            var _this = this;
            var explorer = this.createMenuItem(nls.localize({ key: 'miViewExplorer', comment: ['&& denotes a mnemonic'] }, "&&Explorer"), 'workbench.view.explorer');
            var search = this.createMenuItem(nls.localize({ key: 'miViewSearch', comment: ['&& denotes a mnemonic'] }, "&&Search"), 'workbench.view.search');
            var git = this.createMenuItem(nls.localize({ key: 'miViewGit', comment: ['&& denotes a mnemonic'] }, "&&Git"), 'workbench.view.git');
            var debug = this.createMenuItem(nls.localize({ key: 'miViewDebug', comment: ['&& denotes a mnemonic'] }, "&&Debug"), 'workbench.view.debug');
            var commands = this.createMenuItem(nls.localize({ key: 'miCommandPalette', comment: ['&& denotes a mnemonic'] }, "&&Command Palette..."), 'workbench.action.showCommands');
            var markers = this.createMenuItem(nls.localize({ key: 'miMarker', comment: ['&& denotes a mnemonic'] }, "&&Errors and Warnings..."), 'workbench.action.showErrorsWarnings');
            var output = this.createMenuItem(nls.localize({ key: 'miToggleOutput', comment: ['&& denotes a mnemonic'] }, "Toggle &&Output"), 'workbench.action.output.toggleOutput');
            var debugConsole = this.createMenuItem(nls.localize({ key: 'miToggleDebugConsole', comment: ['&& denotes a mnemonic'] }, "Toggle De&&bug Console"), 'workbench.debug.action.toggleRepl');
            var fullscreen = new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miToggleFullScreen', comment: ['&& denotes a mnemonic'] }, "Toggle &&Full Screen")), accelerator: this.getAccelerator('workbench.action.toggleFullScreen'), click: function () { return _this.windowsManager.getLastActiveWindow().toggleFullScreen(); }, enabled: this.windowsManager.getWindowCount() > 0 });
            var toggleMenuBar = this.createMenuItem(nls.localize({ key: 'miToggleMenuBar', comment: ['&& denotes a mnemonic'] }, "Toggle Menu &&Bar"), 'workbench.action.toggleMenuBar');
            var splitEditor = this.createMenuItem(nls.localize({ key: 'miSplitEditor', comment: ['&& denotes a mnemonic'] }, "Split &&Editor"), 'workbench.action.splitEditor');
            var toggleSidebar = this.createMenuItem(nls.localize({ key: 'miToggleSidebar', comment: ['&& denotes a mnemonic'] }, "&&Toggle Side Bar"), 'workbench.action.toggleSidebarVisibility');
            var moveSidebar = this.createMenuItem(nls.localize({ key: 'miMoveSidebar', comment: ['&& denotes a mnemonic'] }, "&&Move Side Bar"), 'workbench.action.toggleSidebarPosition');
            var togglePanel = this.createMenuItem(nls.localize({ key: 'miTogglePanel', comment: ['&& denotes a mnemonic'] }, "Toggle &&Panel"), 'workbench.action.togglePanel');
            var toggleWordWrap = this.createMenuItem(nls.localize({ key: 'miToggleWordWrap', comment: ['&& denotes a mnemonic'] }, "Toggle &&Word Wrap"), 'editor.action.toggleWordWrap');
            var toggleRenderWhitespace = this.createMenuItem(nls.localize({ key: 'miToggleRenderWhitespace', comment: ['&& denotes a mnemonic'] }, "Toggle &&Render Whitespace"), 'editor.action.toggleRenderWhitespace');
            var zoomIn = this.createMenuItem(nls.localize({ key: 'miZoomIn', comment: ['&& denotes a mnemonic'] }, "&&Zoom in"), 'workbench.action.zoomIn');
            var zoomOut = this.createMenuItem(nls.localize({ key: 'miZoomOut', comment: ['&& denotes a mnemonic'] }, "Zoom o&&ut"), 'workbench.action.zoomOut');
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
            var back = this.createMenuItem(nls.localize({ key: 'miBack', comment: ['&& denotes a mnemonic'] }, "&&Back"), 'workbench.action.navigateBack');
            var forward = this.createMenuItem(nls.localize({ key: 'miForward', comment: ['&& denotes a mnemonic'] }, "&&Forward"), 'workbench.action.navigateForward');
            var navigateHistory = this.createMenuItem(nls.localize({ key: 'miNavigateHistory', comment: ['&& denotes a mnemonic'] }, "&&Navigate History"), 'workbench.action.openPreviousEditor');
            var gotoFile = this.createMenuItem(nls.localize({ key: 'miGotoFile', comment: ['&& denotes a mnemonic'] }, "Go to &&File..."), 'workbench.action.quickOpen');
            var gotoSymbol = this.createMenuItem(nls.localize({ key: 'miGotoSymbol', comment: ['&& denotes a mnemonic'] }, "Go to &&Symbol..."), 'workbench.action.gotoSymbol');
            var gotoDefinition = this.createMenuItem(nls.localize({ key: 'miGotoDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Definition"), 'editor.action.goToDeclaration');
            var gotoLine = this.createMenuItem(nls.localize({ key: 'miGotoLine', comment: ['&& denotes a mnemonic'] }, "Go to &&Line..."), 'workbench.action.gotoLine');
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
            var minimize = new electron_1.MenuItem({ label: nls.localize('mMinimize', "Minimize"), role: 'minimize', accelerator: 'Command+M', enabled: this.windowsManager.getWindowCount() > 0 });
            var close = new electron_1.MenuItem({ label: nls.localize('mClose', "Close"), role: 'close', accelerator: 'Command+W', enabled: this.windowsManager.getWindowCount() > 0 });
            var bringAllToFront = new electron_1.MenuItem({ label: nls.localize('mBringToFront', "Bring All to Front"), role: 'front', enabled: this.windowsManager.getWindowCount() > 0 });
            [
                minimize,
                close,
                __separator__(),
                bringAllToFront
            ].forEach(function (item) { return macWindowMenu.append(item); });
        };
        VSCodeMenu.prototype.toggleDevTools = function () {
            var w = this.windowsManager.getFocusedWindow();
            if (w && w.win) {
                w.win.webContents.toggleDevTools();
            }
        };
        VSCodeMenu.prototype.setHelpMenu = function (helpMenu) {
            var _this = this;
            var toggleDevToolsItem = new electron_1.MenuItem({
                label: mnemonicLabel(nls.localize({ key: 'miToggleDevTools', comment: ['&& denotes a mnemonic'] }, "&&Toggle Developer Tools")),
                accelerator: this.getAccelerator('workbench.action.toggleDevTools'),
                click: function () { return _this.toggleDevTools(); },
                enabled: (this.windowsManager.getWindowCount() > 0)
            });
            arrays.coalesce([
                this.envService.product.documentationUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miDocumentation', comment: ['&& denotes a mnemonic'] }, "&&Documentation")), click: function () { return _this.openUrl(_this.envService.product.documentationUrl, 'openDocumentationUrl'); } }) : null,
                this.envService.product.releaseNotesUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miReleaseNotes', comment: ['&& denotes a mnemonic'] }, "&&Release Notes")), click: function () { return _this.openUrl(_this.envService.product.releaseNotesUrl, 'openReleaseNotesUrl'); } }) : null,
                (this.envService.product.documentationUrl || this.envService.product.releaseNotesUrl) ? __separator__() : null,
                this.envService.product.twitterUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miTwitter', comment: ['&& denotes a mnemonic'] }, "&&Join us on Twitter")), click: function () { return _this.openUrl(_this.envService.product.twitterUrl, 'openTwitterUrl'); } }) : null,
                this.envService.product.requestFeatureUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miUserVoice', comment: ['&& denotes a mnemonic'] }, "&&Request Features")), click: function () { return _this.openUrl(_this.envService.product.requestFeatureUrl, 'openUserVoiceUrl'); } }) : null,
                this.envService.product.reportIssueUrl ? new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miReportIssues', comment: ['&& denotes a mnemonic'] }, "Report &&Issues")), click: function () { return _this.openUrl(_this.envService.product.reportIssueUrl, 'openReportIssues'); } }) : null,
                (this.envService.product.twitterUrl || this.envService.product.requestFeatureUrl || this.envService.product.reportIssueUrl) ? __separator__() : null,
                this.envService.product.licenseUrl ? new electron_1.MenuItem({
                    label: mnemonicLabel(nls.localize({ key: 'miLicense', comment: ['&& denotes a mnemonic'] }, "&&View License")), click: function () {
                        if (platform.language) {
                            var queryArgChar = _this.envService.product.licenseUrl.indexOf('?') > 0 ? '&' : '?';
                            _this.openUrl("" + _this.envService.product.licenseUrl + queryArgChar + "lang=" + platform.language, 'openLicenseUrl');
                        }
                        else {
                            _this.openUrl(_this.envService.product.licenseUrl, 'openLicenseUrl');
                        }
                    }
                }) : null,
                this.envService.product.privacyStatementUrl ? new electron_1.MenuItem({
                    label: mnemonicLabel(nls.localize({ key: 'miPrivacyStatement', comment: ['&& denotes a mnemonic'] }, "&&Privacy Statement")), click: function () {
                        if (platform.language) {
                            var queryArgChar = _this.envService.product.licenseUrl.indexOf('?') > 0 ? '&' : '?';
                            _this.openUrl("" + _this.envService.product.privacyStatementUrl + queryArgChar + "lang=" + platform.language, 'openPrivacyStatement');
                        }
                        else {
                            _this.openUrl(_this.envService.product.privacyStatementUrl, 'openPrivacyStatement');
                        }
                    }
                }) : null,
                (this.envService.product.licenseUrl || this.envService.product.privacyStatementUrl) ? __separator__() : null,
                toggleDevToolsItem,
            ]).forEach(function (item) { return helpMenu.append(item); });
            if (!platform.isMacintosh) {
                var updateMenuItems = this.getUpdateMenuItems();
                if (updateMenuItems.length) {
                    helpMenu.append(__separator__());
                    updateMenuItems.forEach(function (i) { return helpMenu.append(i); });
                }
                helpMenu.append(__separator__());
                helpMenu.append(new electron_1.MenuItem({ label: mnemonicLabel(nls.localize({ key: 'miAbout', comment: ['&& denotes a mnemonic'] }, "&&About")), click: function () { return _this.openAboutDialog(); } }));
            }
        };
        VSCodeMenu.prototype.getUpdateMenuItems = function () {
            var _this = this;
            switch (this.updateManager.state) {
                case update_manager_1.State.Uninitialized:
                    return [];
                case update_manager_1.State.UpdateDownloaded:
                    var update_1 = this.updateManager.availableUpdate;
                    return [new electron_1.MenuItem({
                            label: nls.localize('miRestartToUpdate', "Restart To Update..."), click: function () {
                                _this.reportMenuActionTelemetry('RestartToUpdate');
                                update_1.quitAndUpdate();
                            }
                        })];
                case update_manager_1.State.CheckingForUpdate:
                    return [new electron_1.MenuItem({ label: nls.localize('miCheckingForUpdates', "Checking For Updates..."), enabled: false })];
                case update_manager_1.State.UpdateAvailable:
                    if (platform.isLinux) {
                        var update_2 = this.updateManager.availableUpdate;
                        return [new electron_1.MenuItem({
                                label: nls.localize('miDownloadUpdate', "Download Available Update"), click: function () {
                                    update_2.quitAndUpdate();
                                }
                            })];
                    }
                    var updateAvailableLabel = platform.isWindows
                        ? nls.localize('miDownloadingUpdate', "Downloading Update...")
                        : nls.localize('miInstallingUpdate', "Installing Update...");
                    return [new electron_1.MenuItem({ label: updateAvailableLabel, enabled: false })];
                default:
                    var result = [new electron_1.MenuItem({
                            label: nls.localize('miCheckForUpdates', "Check For Updates..."), click: function () { return setTimeout(function () {
                                _this.reportMenuActionTelemetry('CheckForUpdate');
                                _this.updateManager.checkForUpdates(true);
                            }, 0); }
                        })];
                    if (this.updateManager.lastCheckDate) {
                        result.push(new electron_1.MenuItem({ label: nls.localize('miLastCheckedAt', "Last checked at {0}", this.updateManager.lastCheckDate.toLocaleTimeString()), enabled: false }));
                    }
                    return result;
            }
        };
        VSCodeMenu.prototype.createMenuItem = function (arg1, arg2, arg3) {
            var _this = this;
            var label = mnemonicLabel(arg1);
            var click = (typeof arg2 === 'function') ? arg2 : function () { return _this.windowsManager.sendToFocused('vscode:runAction', arg2); };
            var enabled = typeof arg3 === 'boolean' ? arg3 : this.windowsManager.getWindowCount() > 0;
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
            var _this = this;
            return new electron_1.MenuItem({
                label: mnemonicLabel(label),
                accelerator: this.getAccelerator(actionId),
                enabled: this.windowsManager.getWindowCount() > 0,
                click: function () {
                    var windowInFocus = _this.windowsManager.getFocusedWindow();
                    if (!windowInFocus) {
                        return;
                    }
                    if (windowInFocus.win.isDevToolsFocused()) {
                        devToolsFocusedFn(windowInFocus.win.devToolsWebContents);
                    }
                    else {
                        _this.windowsManager.sendToFocused('vscode:runAction', actionId);
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
        VSCodeMenu.prototype.openAboutDialog = function () {
            var lastActiveWindow = this.windowsManager.getFocusedWindow() || this.windowsManager.getLastActiveWindow();
            electron_1.dialog.showMessageBox(lastActiveWindow && lastActiveWindow.win, {
                title: this.envService.product.nameLong,
                type: 'info',
                message: this.envService.product.nameLong,
                detail: nls.localize('aboutDetail', "\nVersion {0}\nCommit {1}\nDate {2}\nShell {3}\nRenderer {4}\nNode {5}", electron_1.app.getVersion(), this.envService.product.commit || 'Unknown', this.envService.product.date || 'Unknown', process.versions['electron'], process.versions['chrome'], process.versions['node']),
                buttons: [nls.localize('okButton', "OK")],
                noLink: true
            }, function (result) { return null; });
            this.reportMenuActionTelemetry('showAboutDialog');
        };
        VSCodeMenu.prototype.openUrl = function (url, id) {
            electron_1.shell.openExternal(url);
            this.reportMenuActionTelemetry(id);
        };
        VSCodeMenu.prototype.reportMenuActionTelemetry = function (id) {
            this.windowsManager.sendToFocused('vscode:telemetry', { eventName: 'workbenchActionExecuted', data: { id: id, from: 'menu' } });
        };
        VSCodeMenu.lastKnownKeybindingsMapStorageKey = 'lastKnownKeybindings';
        VSCodeMenu.MAX_RECENT_ENTRIES = 10;
        VSCodeMenu = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, update_manager_1.IUpdateService),
            __param(2, windows_1.IWindowsService),
            __param(3, env.IEnvironmentService)
        ], VSCodeMenu);
        return VSCodeMenu;
    }());
    exports.VSCodeMenu = VSCodeMenu;
    function __separator__() {
        return new electron_1.MenuItem({ type: 'separator' });
    }
    function mnemonicLabel(label) {
        if (platform.isMacintosh) {
            return label.replace(/&&/g, ''); // no mnemonic support on mac
        }
        return label.replace(/&&/g, '&');
    }
});
//# sourceMappingURL=menus.js.map