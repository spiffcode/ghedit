/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'fs', 'path', 'events', 'electron', 'vs/base/common/platform', 'vs/workbench/electron-main/env', 'vs/workbench/electron-main/settings', 'vs/workbench/electron-main/auto-updater.win32', 'vs/workbench/electron-main/auto-updater.linux', 'vs/workbench/electron-main/lifecycle'], function (require, exports, fs, path, events, electron, platform, env, settings, auto_updater_win32_1, auto_updater_linux_1, lifecycle_1) {
    'use strict';
    (function (State) {
        State[State["Uninitialized"] = 0] = "Uninitialized";
        State[State["Idle"] = 1] = "Idle";
        State[State["CheckingForUpdate"] = 2] = "CheckingForUpdate";
        State[State["UpdateAvailable"] = 3] = "UpdateAvailable";
        State[State["UpdateDownloaded"] = 4] = "UpdateDownloaded";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
    (function (ExplicitState) {
        ExplicitState[ExplicitState["Implicit"] = 0] = "Implicit";
        ExplicitState[ExplicitState["Explicit"] = 1] = "Explicit";
    })(exports.ExplicitState || (exports.ExplicitState = {}));
    var ExplicitState = exports.ExplicitState;
    var UpdateManager = (function (_super) {
        __extends(UpdateManager, _super);
        function UpdateManager() {
            _super.call(this);
            this._state = State.Uninitialized;
            this.explicitState = ExplicitState.Implicit;
            this._availableUpdate = null;
            this._lastCheckDate = null;
            this._feedUrl = null;
            this._channel = null;
            if (platform.isWindows) {
                this.raw = new auto_updater_win32_1.Win32AutoUpdaterImpl();
            }
            else if (platform.isLinux) {
                this.raw = new auto_updater_linux_1.LinuxAutoUpdaterImpl();
            }
            else if (platform.isMacintosh) {
                this.raw = electron.autoUpdater;
            }
            if (this.raw) {
                this.initRaw();
            }
        }
        UpdateManager.prototype.initRaw = function () {
            var _this = this;
            this.raw.on('error', function (event, message) {
                _this.emit('error', event, message);
                _this.setState(State.Idle);
            });
            this.raw.on('checking-for-update', function () {
                _this.emit('checking-for-update');
                _this.setState(State.CheckingForUpdate);
            });
            this.raw.on('update-available', function (event, url) {
                _this.emit('update-available', url);
                var data = null;
                if (url) {
                    data = {
                        releaseNotes: '',
                        version: '',
                        date: new Date(),
                        quitAndUpdate: function () { return electron.shell.openExternal(url); }
                    };
                }
                _this.setState(State.UpdateAvailable, data);
            });
            this.raw.on('update-not-available', function () {
                _this.emit('update-not-available', _this.explicitState === ExplicitState.Explicit);
                _this.setState(State.Idle);
            });
            this.raw.on('update-downloaded', function (event, releaseNotes, version, date, url, rawQuitAndUpdate) {
                var data = {
                    releaseNotes: releaseNotes,
                    version: version,
                    date: date,
                    quitAndUpdate: function () { return _this.quitAndUpdate(rawQuitAndUpdate); }
                };
                _this.emit('update-downloaded', data);
                _this.setState(State.UpdateDownloaded, data);
            });
        };
        UpdateManager.prototype.quitAndUpdate = function (rawQuitAndUpdate) {
            lifecycle_1.manager.quit().done(function (vetod) {
                if (vetod) {
                    return;
                }
                // for some reason updating on Mac causes the local storage not to be flushed.
                // we workaround this issue by forcing an explicit flush of the storage data.
                // see also https://github.com/Microsoft/vscode/issues/172
                if (platform.isMacintosh) {
                    electron.session.defaultSession.flushStorageData();
                }
                rawQuitAndUpdate();
            });
        };
        Object.defineProperty(UpdateManager.prototype, "feedUrl", {
            get: function () {
                return this._feedUrl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UpdateManager.prototype, "channel", {
            get: function () {
                return this._channel;
            },
            enumerable: true,
            configurable: true
        });
        UpdateManager.prototype.initialize = function () {
            var _this = this;
            if (this.feedUrl) {
                return; // already initialized
            }
            var channel = UpdateManager.getUpdateChannel();
            var feedUrl = UpdateManager.getUpdateFeedUrl(channel);
            if (!feedUrl) {
                return; // updates not available
            }
            this._channel = channel;
            this._feedUrl = feedUrl;
            this.raw.setFeedURL(feedUrl);
            this.setState(State.Idle);
            // Check for updates on startup after 30 seconds
            var timer = setTimeout(function () { return _this.checkForUpdates(); }, 30 * 1000);
            // Clear timer when checking for update
            this.on('error', function (error, message) { return console.error(error, message); });
            // Clear timer when checking for update
            this.on('checking-for-update', function () { return clearTimeout(timer); });
            // If update not found, try again in 10 minutes
            this.on('update-not-available', function () {
                timer = setTimeout(function () { return _this.checkForUpdates(); }, 10 * 60 * 1000);
            });
        };
        Object.defineProperty(UpdateManager.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UpdateManager.prototype, "availableUpdate", {
            get: function () {
                return this._availableUpdate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UpdateManager.prototype, "lastCheckDate", {
            get: function () {
                return this._lastCheckDate;
            },
            enumerable: true,
            configurable: true
        });
        UpdateManager.prototype.checkForUpdates = function (explicit) {
            if (explicit === void 0) { explicit = false; }
            this.explicitState = explicit ? ExplicitState.Explicit : ExplicitState.Implicit;
            this._lastCheckDate = new Date();
            this.raw.checkForUpdates();
        };
        UpdateManager.prototype.setState = function (state, availableUpdate) {
            if (availableUpdate === void 0) { availableUpdate = null; }
            this._state = state;
            this._availableUpdate = availableUpdate;
            this.emit('change');
        };
        UpdateManager.getUpdateChannel = function () {
            var channel = settings.manager.getValue('update.channel') || 'default';
            return channel === 'none' ? null : env.quality;
        };
        UpdateManager.getUpdateFeedUrl = function (channel) {
            if (!channel) {
                return null;
            }
            if (platform.isWindows && !fs.existsSync(path.join(path.dirname(process.execPath), 'unins000.exe'))) {
                return null;
            }
            if (!env.updateUrl || !env.product.commit) {
                return null;
            }
            return env.updateUrl + "/api/update/" + env.getPlatformIdentifier() + "/" + channel + "/" + env.product.commit;
        };
        return UpdateManager;
    }(events.EventEmitter));
    exports.UpdateManager = UpdateManager;
    exports.Instance = new UpdateManager();
});
//# sourceMappingURL=update-manager.js.map