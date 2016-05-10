/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'events', 'path', 'os', 'child_process', 'vs/base/node/pfs', 'vs/base/node/extfs', 'vs/base/common/types', 'vs/base/common/winjs.base', 'vs/base/node/request', 'vs/base/node/proxy', 'vs/workbench/electron-main/settings', 'vs/workbench/electron-main/lifecycle', './env'], function (require, exports, events, path, os, cp, pfs, extfs_1, types_1, winjs_base_1, request_1, proxy_1, settings_1, lifecycle_1, env_1) {
    'use strict';
    var Win32AutoUpdaterImpl = (function (_super) {
        __extends(Win32AutoUpdaterImpl, _super);
        function Win32AutoUpdaterImpl(lifecycleService, envService, settingsManager) {
            _super.call(this);
            this.lifecycleService = lifecycleService;
            this.envService = envService;
            this.settingsManager = settingsManager;
            this.url = null;
            this.currentRequest = null;
        }
        Object.defineProperty(Win32AutoUpdaterImpl.prototype, "cachePath", {
            get: function () {
                var result = path.join(os.tmpdir(), 'vscode-update');
                return new winjs_base_1.TPromise(function (c, e) { return extfs_1.mkdirp(result, null, function (err) { return err ? e(err) : c(result); }); });
            },
            enumerable: true,
            configurable: true
        });
        Win32AutoUpdaterImpl.prototype.setFeedURL = function (url) {
            this.url = url;
        };
        Win32AutoUpdaterImpl.prototype.checkForUpdates = function () {
            var _this = this;
            if (!this.url) {
                throw new Error('No feed url set.');
            }
            if (this.currentRequest) {
                return;
            }
            this.emit('checking-for-update');
            var proxyUrl = this.settingsManager.getValue('http.proxy');
            var strictSSL = this.settingsManager.getValue('http.proxyStrictSSL', true);
            var agent = proxy_1.getProxyAgent(this.url, { proxyUrl: proxyUrl, strictSSL: strictSSL });
            this.currentRequest = request_1.json({ url: this.url, agent: agent })
                .then(function (update) {
                if (!update || !update.url || !update.version) {
                    _this.emit('update-not-available');
                    return _this.cleanup();
                }
                _this.emit('update-available');
                return _this.cleanup(update.version).then(function () {
                    return _this.getUpdatePackagePath(update.version).then(function (updatePackagePath) {
                        return pfs.exists(updatePackagePath).then(function (exists) {
                            if (exists) {
                                return winjs_base_1.TPromise.as(updatePackagePath);
                            }
                            var url = update.url;
                            var downloadPath = updatePackagePath + ".tmp";
                            var agent = proxy_1.getProxyAgent(url, { proxyUrl: proxyUrl, strictSSL: strictSSL });
                            return request_1.download(downloadPath, { url: url, agent: agent, strictSSL: strictSSL })
                                .then(function () { return pfs.rename(downloadPath, updatePackagePath); })
                                .then(function () { return updatePackagePath; });
                        });
                    }).then(function (updatePackagePath) {
                        _this.emit('update-downloaded', {}, update.releaseNotes, update.version, new Date(), _this.url, function () { return _this.quitAndUpdate(updatePackagePath); });
                    });
                });
            })
                .then(null, function (e) {
                if (types_1.isString(e) && /^Server returned/.test(e)) {
                    return;
                }
                _this.emit('update-not-available');
                _this.emit('error', e);
            })
                .then(function () { return _this.currentRequest = null; });
        };
        Win32AutoUpdaterImpl.prototype.getUpdatePackagePath = function (version) {
            var _this = this;
            return this.cachePath.then(function (cachePath) { return path.join(cachePath, "CodeSetup-" + _this.envService.quality + "-" + version + ".exe"); });
        };
        Win32AutoUpdaterImpl.prototype.quitAndUpdate = function (updatePackagePath) {
            this.lifecycleService.quit().done(function (vetod) {
                if (vetod) {
                    return;
                }
                cp.spawn(updatePackagePath, ['/silent', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                    detached: true,
                    stdio: ['ignore', 'ignore', 'ignore']
                });
            });
        };
        Win32AutoUpdaterImpl.prototype.cleanup = function (exceptVersion) {
            var _this = this;
            if (exceptVersion === void 0) { exceptVersion = null; }
            var filter = exceptVersion ? function (one) { return !(new RegExp(_this.envService.quality + "-" + exceptVersion + "\\.exe$").test(one)); } : function () { return true; };
            return this.cachePath
                .then(function (cachePath) { return pfs.readdir(cachePath)
                .then(function (all) { return winjs_base_1.Promise.join(all
                .filter(filter)
                .map(function (one) { return pfs.unlink(path.join(cachePath, one)).then(null, function () { return null; }); })); }); });
        };
        Win32AutoUpdaterImpl = __decorate([
            __param(0, lifecycle_1.ILifecycleService),
            __param(1, env_1.IEnvironmentService),
            __param(2, settings_1.ISettingsService)
        ], Win32AutoUpdaterImpl);
        return Win32AutoUpdaterImpl;
    }(events.EventEmitter));
    exports.Win32AutoUpdaterImpl = Win32AutoUpdaterImpl;
});
//# sourceMappingURL=auto-updater.win32.js.map