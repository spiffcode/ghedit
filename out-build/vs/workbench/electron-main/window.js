/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'path', 'electron', 'vs/base/common/winjs.base', 'vs/base/common/platform', 'vs/base/common/objects', 'vs/workbench/electron-main/env', 'vs/workbench/electron-main/storage'], function (require, exports, path, electron_1, winjs_base_1, platform, objects, env, storage) {
    'use strict';
    (function (WindowMode) {
        WindowMode[WindowMode["Maximized"] = 0] = "Maximized";
        WindowMode[WindowMode["Normal"] = 1] = "Normal";
        WindowMode[WindowMode["Minimized"] = 2] = "Minimized";
    })(exports.WindowMode || (exports.WindowMode = {}));
    var WindowMode = exports.WindowMode;
    exports.defaultWindowState = function (mode) {
        if (mode === void 0) { mode = WindowMode.Normal; }
        return {
            width: 1024,
            height: 768,
            mode: mode
        };
    };
    (function (ReadyState) {
        /**
         * This window has not loaded any HTML yet
         */
        ReadyState[ReadyState["NONE"] = 0] = "NONE";
        /**
         * This window is loading HTML
         */
        ReadyState[ReadyState["LOADING"] = 1] = "LOADING";
        /**
         * This window is navigating to another HTML
         */
        ReadyState[ReadyState["NAVIGATING"] = 2] = "NAVIGATING";
        /**
         * This window is done loading HTML
         */
        ReadyState[ReadyState["READY"] = 3] = "READY";
    })(exports.ReadyState || (exports.ReadyState = {}));
    var ReadyState = exports.ReadyState;
    var VSCodeWindow = (function () {
        function VSCodeWindow(config) {
            this._lastFocusTime = -1;
            this._readyState = ReadyState.NONE;
            this._extensionDevelopmentPath = config.extensionDevelopmentPath;
            this.whenReadyCallbacks = [];
            // Load window state
            this.restoreWindowState(config.state);
            // For VS theme we can show directly because background is white
            var usesLightTheme = /vs($| )/.test(storage.getItem(VSCodeWindow.themeStorageKey));
            var showDirectly = true; // set to false to prevent background color flash (flash should be fixed for Electron >= 0.37.x)
            if (showDirectly && !global.windowShow) {
                global.windowShow = new Date().getTime();
            }
            var options = {
                width: this.windowState.width,
                height: this.windowState.height,
                x: this.windowState.x,
                y: this.windowState.y,
                backgroundColor: usesLightTheme ? '#FFFFFF' : platform.isMacintosh ? '#171717' : '#1E1E1E',
                minWidth: VSCodeWindow.MIN_WIDTH,
                minHeight: VSCodeWindow.MIN_HEIGHT,
                show: showDirectly && this.currentWindowMode !== WindowMode.Maximized,
                title: env.product.nameLong
            };
            if (platform.isLinux) {
                // Windows and Mac are better off using the embedded icon(s)
                options.icon = path.join(env.appRoot, 'resources/linux/code.png');
            }
            // Create the browser window.
            this._win = new electron_1.BrowserWindow(options);
            this._id = this._win.id;
            if (showDirectly && this.currentWindowMode === WindowMode.Maximized) {
                this.win.maximize();
                if (!this.win.isVisible()) {
                    this.win.show(); // to reduce flicker from the default window size to maximize, we only show after maximize
                }
            }
            if (showDirectly) {
                this._lastFocusTime = new Date().getTime(); // since we show directly, we need to set the last focus time too
            }
            if (storage.getItem(VSCodeWindow.menuBarHiddenKey, false)) {
                this.setMenuBarVisibility(false); // respect configured menu bar visibility
            }
            this.registerListeners();
        }
        Object.defineProperty(VSCodeWindow.prototype, "isPluginDevelopmentHost", {
            get: function () {
                return !!this._extensionDevelopmentPath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VSCodeWindow.prototype, "extensionDevelopmentPath", {
            get: function () {
                return this._extensionDevelopmentPath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VSCodeWindow.prototype, "config", {
            get: function () {
                return this.currentConfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VSCodeWindow.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VSCodeWindow.prototype, "win", {
            get: function () {
                return this._win;
            },
            enumerable: true,
            configurable: true
        });
        VSCodeWindow.prototype.focus = function () {
            if (!this._win) {
                return;
            }
            if (this._win.isMinimized()) {
                this._win.restore();
            }
            this._win.focus();
        };
        Object.defineProperty(VSCodeWindow.prototype, "lastFocusTime", {
            get: function () {
                return this._lastFocusTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VSCodeWindow.prototype, "openedWorkspacePath", {
            get: function () {
                return this.currentConfig.workspacePath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VSCodeWindow.prototype, "openedFilePath", {
            get: function () {
                return this.currentConfig.filesToOpen && this.currentConfig.filesToOpen[0] && this.currentConfig.filesToOpen[0].filePath;
            },
            enumerable: true,
            configurable: true
        });
        VSCodeWindow.prototype.setReady = function () {
            this._readyState = ReadyState.READY;
            // inform all waiting promises that we are ready now
            while (this.whenReadyCallbacks.length) {
                this.whenReadyCallbacks.pop()(this);
            }
        };
        VSCodeWindow.prototype.ready = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c) {
                if (_this._readyState === ReadyState.READY) {
                    return c(_this);
                }
                // otherwise keep and call later when we are ready
                _this.whenReadyCallbacks.push(c);
            });
        };
        Object.defineProperty(VSCodeWindow.prototype, "readyState", {
            get: function () {
                return this._readyState;
            },
            enumerable: true,
            configurable: true
        });
        VSCodeWindow.prototype.registerListeners = function () {
            var _this = this;
            // Remember that we loaded
            this._win.webContents.on('did-finish-load', function () {
                _this._readyState = ReadyState.LOADING;
                // Associate properties from the load request if provided
                if (_this.pendingLoadConfig) {
                    _this.currentConfig = _this.pendingLoadConfig;
                    _this.pendingLoadConfig = null;
                }
                // To prevent flashing, we set the window visible after the page has finished to load but before VSCode is loaded
                if (!_this.win.isVisible()) {
                    if (!global.windowShow) {
                        global.windowShow = new Date().getTime();
                    }
                    if (_this.currentWindowMode === WindowMode.Maximized) {
                        _this.win.maximize();
                    }
                    if (!_this.win.isVisible()) {
                        _this.win.show();
                    }
                }
            });
            // App commands support
            this._win.on('app-command', function (e, cmd) {
                if (_this.readyState !== ReadyState.READY) {
                    return; // window must be ready
                }
                // Support navigation via mouse buttons 4/5
                if (cmd === 'browser-backward') {
                    _this.send('vscode:runAction', 'workbench.action.navigateBack');
                }
                else if (cmd === 'browser-forward') {
                    _this.send('vscode:runAction', 'workbench.action.navigateForward');
                }
            });
            // Handle code that wants to open links
            this._win.webContents.on('new-window', function (event, url) {
                event.preventDefault();
                electron_1.shell.openExternal(url);
            });
            // Window Focus
            this._win.on('focus', function () {
                _this._lastFocusTime = new Date().getTime();
            });
            // Window Failed to load
            this._win.webContents.on('did-fail-load', function (event, errorCode, errorDescription) {
                console.warn('[electron event]: fail to load, ', errorDescription);
            });
            // Prevent any kind of navigation triggered by the user!
            // But do not touch this in dev version because it will prevent "Reload" from dev tools
            if (env.isBuilt) {
                this._win.webContents.on('will-navigate', function (event) {
                    if (event) {
                        event.preventDefault();
                    }
                });
            }
        };
        VSCodeWindow.prototype.load = function (config) {
            var _this = this;
            // If this is the first time the window is loaded, we associate the paths
            // directly with the window because we assume the loading will just work
            if (this.readyState === ReadyState.NONE) {
                this.currentConfig = config;
            }
            else {
                this.pendingLoadConfig = config;
                this._readyState = ReadyState.NAVIGATING;
            }
            // Load URL
            this._win.loadURL(this.getUrl(config));
            // Make window visible if it did not open in N seconds because this indicates an error
            if (!config.isBuilt) {
                this.showTimeoutHandle = setTimeout(function () {
                    if (_this._win && !_this._win.isVisible() && !_this._win.isMinimized()) {
                        _this._win.show();
                        _this._win.focus();
                        _this._win.webContents.openDevTools();
                    }
                }, 10000);
            }
        };
        VSCodeWindow.prototype.reload = function (cli) {
            // Inherit current properties but overwrite some
            var configuration = objects.mixin({}, this.currentConfig);
            delete configuration.filesToOpen;
            delete configuration.filesToCreate;
            delete configuration.filesToDiff;
            delete configuration.extensionsToInstall;
            // Some configuration things get inherited if the window is being reloaded and we are
            // in plugin development mode. These options are all development related.
            if (this.isPluginDevelopmentHost && cli) {
                configuration.verboseLogging = cli.verboseLogging;
                configuration.logExtensionHostCommunication = cli.logExtensionHostCommunication;
                configuration.debugExtensionHostPort = cli.debugExtensionHostPort;
                configuration.debugBrkExtensionHost = cli.debugBrkExtensionHost;
                configuration.extensionsHomePath = cli.extensionsHomePath;
            }
            // Load config
            this.load(configuration);
        };
        VSCodeWindow.prototype.getUrl = function (config) {
            var url = require.toUrl('vs/workbench/electron-browser/index.html');
            // Config
            url += '?config=' + encodeURIComponent(JSON.stringify(config));
            return url;
        };
        VSCodeWindow.prototype.serializeWindowState = function () {
            if (this.win.isFullScreen()) {
                return exports.defaultWindowState(); // ignore state when in fullscreen mode and return defaults
            }
            var state = Object.create(null);
            var mode;
            // get window mode
            if (!platform.isMacintosh && this.win.isMaximized()) {
                mode = WindowMode.Maximized;
            }
            else if (this.win.isMinimized()) {
                mode = WindowMode.Minimized;
            }
            else {
                mode = WindowMode.Normal;
            }
            // we don't want to save minimized state, only maximized or normal
            if (mode === WindowMode.Maximized) {
                state.mode = WindowMode.Maximized;
            }
            else if (mode !== WindowMode.Minimized) {
                state.mode = WindowMode.Normal;
            }
            // only consider non-minimized window states
            if (mode === WindowMode.Normal || mode === WindowMode.Maximized) {
                var pos = this.win.getPosition();
                var size = this.win.getSize();
                state.x = pos[0];
                state.y = pos[1];
                state.width = size[0];
                state.height = size[1];
            }
            return state;
        };
        VSCodeWindow.prototype.restoreWindowState = function (state) {
            if (state) {
                try {
                    state = this.validateWindowState(state);
                }
                catch (err) {
                    env.log("Unexpected error validating window state: " + err + "\n" + err.stack); // somehow display API can be picky about the state to validate
                }
            }
            if (!state) {
                state = exports.defaultWindowState();
            }
            this.windowState = state;
            this.currentWindowMode = this.windowState.mode;
        };
        VSCodeWindow.prototype.validateWindowState = function (state) {
            if (!state) {
                return null;
            }
            if ([state.x, state.y, state.width, state.height].some(function (n) { return typeof n !== 'number'; })) {
                return null;
            }
            if (state.width <= 0 || state.height <= 0) {
                return null;
            }
            var displays = electron_1.screen.getAllDisplays();
            // Single Monitor: be strict about x/y positioning
            if (displays.length === 1) {
                var displayBounds = displays[0].bounds;
                // Careful with maximized: in that mode x/y can well be negative!
                if (state.mode !== WindowMode.Maximized && displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
                    if (state.x < displayBounds.x) {
                        state.x = displayBounds.x; // prevent window from falling out of the screen to the left
                    }
                    if (state.y < displayBounds.y) {
                        state.y = displayBounds.y; // prevent window from falling out of the screen to the top
                    }
                    if (state.x > (displayBounds.x + displayBounds.width)) {
                        state.x = displayBounds.x; // prevent window from falling out of the screen to the right
                    }
                    if (state.y > (displayBounds.y + displayBounds.height)) {
                        state.y = displayBounds.y; // prevent window from falling out of the screen to the bottom
                    }
                    if (state.width > displayBounds.width) {
                        state.width = displayBounds.width; // prevent window from exceeding display bounds width
                    }
                    if (state.height > displayBounds.height) {
                        state.height = displayBounds.height; // prevent window from exceeding display bounds height
                    }
                }
                if (state.mode === WindowMode.Maximized) {
                    return exports.defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
                }
                return state;
            }
            // Multi Monitor: be less strict because metrics can be crazy
            var bounds = { x: state.x, y: state.y, width: state.width, height: state.height };
            var display = electron_1.screen.getDisplayMatching(bounds);
            if (display && display.bounds.x + display.bounds.width > bounds.x && display.bounds.y + display.bounds.height > bounds.y) {
                if (state.mode === WindowMode.Maximized) {
                    var defaults = exports.defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
                    defaults.x = state.x; // carefull to keep x/y position so that the window ends up on the correct monitor
                    defaults.y = state.y;
                    return defaults;
                }
                return state;
            }
            return null;
        };
        VSCodeWindow.prototype.getBounds = function () {
            var pos = this.win.getPosition();
            var dimension = this.win.getSize();
            return { x: pos[0], y: pos[1], width: dimension[0], height: dimension[1] };
        };
        VSCodeWindow.prototype.toggleFullScreen = function () {
            var willBeFullScreen = !this.win.isFullScreen();
            this.win.setFullScreen(willBeFullScreen);
            // Windows & Linux: Hide the menu bar but still allow to bring it up by pressing the Alt key
            if (platform.isWindows || platform.isLinux) {
                if (willBeFullScreen) {
                    this.setMenuBarVisibility(false);
                }
                else {
                    this.setMenuBarVisibility(!storage.getItem(VSCodeWindow.menuBarHiddenKey, false)); // restore as configured
                }
            }
        };
        VSCodeWindow.prototype.setMenuBarVisibility = function (visible) {
            this.win.setMenuBarVisibility(visible);
            this.win.setAutoHideMenuBar(!visible);
        };
        VSCodeWindow.prototype.sendWhenReady = function (channel) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.ready().then(function () {
                _this.send.apply(_this, [channel].concat(args));
            });
        };
        VSCodeWindow.prototype.send = function (channel) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            (_a = this._win.webContents).send.apply(_a, [channel].concat(args));
            var _a;
        };
        VSCodeWindow.prototype.dispose = function () {
            if (this.showTimeoutHandle) {
                clearTimeout(this.showTimeoutHandle);
            }
            this._win = null; // Important to dereference the window object to allow for GC
        };
        VSCodeWindow.menuBarHiddenKey = 'menuBarHidden';
        VSCodeWindow.themeStorageKey = 'theme';
        VSCodeWindow.MIN_WIDTH = 200;
        VSCodeWindow.MIN_HEIGHT = 120;
        return VSCodeWindow;
    }());
    exports.VSCodeWindow = VSCodeWindow;
});
//# sourceMappingURL=window.js.map