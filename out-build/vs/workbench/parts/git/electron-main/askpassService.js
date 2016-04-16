/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls!vs/workbench/parts/git/electron-main/askpassService', 'electron', 'vs/base/common/platform', 'vs/base/common/winjs.base'], function (require, exports, nls, electron_1, platform, winjs_base_1) {
    "use strict";
    var GitAskpassService = (function () {
        function GitAskpassService() {
            var _this = this;
            this.askpassCache = Object.create(null);
            electron_1.ipcMain.on('git:askpass', function (event, result) {
                _this.askpassCache[result.id].credentials = result.credentials;
            });
        }
        GitAskpassService.prototype.askpass = function (id, host, command) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                var cachedResult = _this.askpassCache[id];
                if (typeof cachedResult !== 'undefined') {
                    return c(cachedResult.credentials);
                }
                if (command === 'fetch') {
                    return c({ username: '', password: '' });
                }
                var win = new electron_1.BrowserWindow({
                    alwaysOnTop: true,
                    skipTaskbar: true,
                    resizable: false,
                    width: 450,
                    height: platform.isWindows ? 280 : 260,
                    show: true,
                    title: nls.localize(0, null)
                });
                win.setMenuBarVisibility(false);
                _this.askpassCache[id] = {
                    window: win,
                    credentials: null
                };
                win.loadURL(require.toUrl('vs/workbench/parts/git/electron-main/index.html'));
                win.webContents.executeJavaScript('init(' + JSON.stringify({ id: id, host: host, command: command }) + ')');
                win.once('closed', function () {
                    c(_this.askpassCache[id].credentials);
                    setTimeout(function () { return delete _this.askpassCache[id]; }, 1000 * 10);
                });
            });
        };
        return GitAskpassService;
    }());
    exports.GitAskpassService = GitAskpassService;
});
//# sourceMappingURL=askpassService.js.map