/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'events', 'path', 'os', 'child_process', 'vs/base/node/pfs', 'vs/base/node/extfs', 'vs/base/common/types', 'vs/base/common/winjs.base', 'vs/base/node/request', 'vs/base/node/proxy', 'vs/workbench/electron-main/settings', 'vs/workbench/electron-main/lifecycle', './env'], function (require, exports, events, path, os, cp, pfs, extfs_1, types_1, winjs_base_1, request_1, proxy_1, settings_1, lifecycle_1, env_1) {
    'use strict';
    var Win32AutoUpdaterImpl = (function (_super) {
        __extends(Win32AutoUpdaterImpl, _super);
        function Win32AutoUpdaterImpl() {
            _super.call(this);
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
            var proxyUrl = settings_1.manager.getValue('http.proxy');
            var strictSSL = settings_1.manager.getValue('http.proxyStrictSSL', true);
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
            return this.cachePath.then(function (cachePath) { return path.join(cachePath, "CodeSetup-" + env_1.quality + "-" + version + ".exe"); });
        };
        Win32AutoUpdaterImpl.prototype.quitAndUpdate = function (updatePackagePath) {
            lifecycle_1.manager.quit().done(function (vetod) {
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
            if (exceptVersion === void 0) { exceptVersion = null; }
            var filter = exceptVersion ? function (one) { return !(new RegExp(env_1.quality + "-" + exceptVersion + "\\.exe$").test(one)); } : function () { return true; };
            return this.cachePath
                .then(function (cachePath) { return pfs.readdir(cachePath)
                .then(function (all) { return winjs_base_1.Promise.join(all
                .filter(filter)
                .map(function (one) { return pfs.unlink(path.join(cachePath, one)).then(null, function () { return null; }); })); }); });
        };
        return Win32AutoUpdaterImpl;
    }(events.EventEmitter));
    exports.Win32AutoUpdaterImpl = Win32AutoUpdaterImpl;
});
//# sourceMappingURL=auto-updater.win32.js.map