/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/workbench/electron-main/env', 'vs/base/common/platform', 'electron'], function (require, exports, env, platform, electron_1) {
    'use strict';
    function configure(bus) {
        var cache = Object.create(null);
        electron_1.ipcMain.on('git:askpass', function (event, result) {
            cache[result.id].credentials = result.credentials;
        });
        bus.addListener('git:askpass', function (context) {
            var cachedResult = cache[context.id];
            if (typeof cachedResult !== 'undefined') {
                bus.emit('git:askpass:' + context.id, cachedResult.credentials);
                return;
            }
            if (context.command === 'fetch') {
                bus.emit('git:askpass:' + context.id, { id: context.id, credentials: { username: '', password: '' } });
                return;
            }
            var win = new electron_1.BrowserWindow({
                alwaysOnTop: true,
                skipTaskbar: true,
                resizable: false,
                width: 450,
                height: platform.isWindows ? 280 : 260,
                show: true,
                title: env.product.nameLong
            });
            win.setMenuBarVisibility(false);
            cache[context.id] = {
                window: win,
                credentials: null
            };
            win.loadURL(require.toUrl('vs/workbench/parts/git/electron-main/index.html'));
            win.webContents.executeJavaScript('init(' + JSON.stringify(context) + ')');
            win.once('closed', function () {
                bus.emit('git:askpass:' + context.id, cache[context.id].credentials);
                setTimeout(function () {
                    delete cache[context.id];
                }, 1000 * 10);
            });
        });
    }
    exports.configure = configure;
});
//# sourceMappingURL=index.js.map