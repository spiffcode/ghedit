/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'events', 'vs/base/common/types', 'vs/base/node/request', 'vs/base/node/proxy', 'vs/workbench/electron-main/settings', 'vs/workbench/electron-main/env'], function (require, exports, events, types_1, request_1, proxy_1, settings_1, env) {
    'use strict';
    var LinuxAutoUpdaterImpl = (function (_super) {
        __extends(LinuxAutoUpdaterImpl, _super);
        function LinuxAutoUpdaterImpl() {
            _super.call(this);
            this.url = null;
            this.currentRequest = null;
        }
        LinuxAutoUpdaterImpl.prototype.setFeedURL = function (url) {
            this.url = url;
        };
        LinuxAutoUpdaterImpl.prototype.checkForUpdates = function () {
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
                }
                else {
                    _this.emit('update-available', null, env.product.downloadUrl);
                }
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
        return LinuxAutoUpdaterImpl;
    }(events.EventEmitter));
    exports.LinuxAutoUpdaterImpl = LinuxAutoUpdaterImpl;
});
//# sourceMappingURL=auto-updater.linux.js.map