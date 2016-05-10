/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/parts/ipc/common/ipc', './extensions'], function (require, exports, ipc_1, extensions_1) {
    'use strict';
    var ExtensionsChannel = (function () {
        function ExtensionsChannel(service) {
            this.service = service;
        }
        ExtensionsChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'event:onInstallExtension': return ipc_1.eventToCall(this.service.onInstallExtension);
                case 'event:onDidInstallExtension': return ipc_1.eventToCall(this.service.onDidInstallExtension);
                case 'event:onUninstallExtension': return ipc_1.eventToCall(this.service.onUninstallExtension);
                case 'event:onDidUninstallExtension': return ipc_1.eventToCall(this.service.onDidUninstallExtension);
                case 'install': return this.service.install(arg);
                case 'uninstall': return this.service.uninstall(arg);
                case 'getInstalled': return this.service.getInstalled(arg);
            }
        };
        return ExtensionsChannel;
    }());
    exports.ExtensionsChannel = ExtensionsChannel;
    var ExtensionsChannelClient = (function () {
        function ExtensionsChannelClient(channel) {
            this.channel = channel;
            this.serviceId = extensions_1.IExtensionsService;
            this._onInstallExtension = ipc_1.eventFromCall(this.channel, 'event:onInstallExtension');
            this._onDidInstallExtension = ipc_1.eventFromCall(this.channel, 'event:onDidInstallExtension');
            this._onUninstallExtension = ipc_1.eventFromCall(this.channel, 'event:onUninstallExtension');
            this._onDidUninstallExtension = ipc_1.eventFromCall(this.channel, 'event:onDidUninstallExtension');
        }
        Object.defineProperty(ExtensionsChannelClient.prototype, "onInstallExtension", {
            get: function () { return this._onInstallExtension; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionsChannelClient.prototype, "onDidInstallExtension", {
            get: function () { return this._onDidInstallExtension; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionsChannelClient.prototype, "onUninstallExtension", {
            get: function () { return this._onUninstallExtension; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionsChannelClient.prototype, "onDidUninstallExtension", {
            get: function () { return this._onDidUninstallExtension; },
            enumerable: true,
            configurable: true
        });
        ExtensionsChannelClient.prototype.install = function (arg) {
            return this.channel.call('install', arg);
        };
        ExtensionsChannelClient.prototype.uninstall = function (extension) {
            return this.channel.call('uninstall', extension);
        };
        ExtensionsChannelClient.prototype.getInstalled = function (includeDuplicateVersions) {
            return this.channel.call('getInstalled', includeDuplicateVersions);
        };
        return ExtensionsChannelClient;
    }());
    exports.ExtensionsChannelClient = ExtensionsChannelClient;
});
//# sourceMappingURL=extensionsIpc.js.map