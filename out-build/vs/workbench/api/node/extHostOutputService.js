var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/platform/thread/common/thread', 'vs/platform/platform', 'vs/workbench/parts/output/common/output', 'vs/workbench/services/part/common/partService', 'vs/workbench/services/panel/common/panelService'], function (require, exports, thread_1, platform_1, output_1, partService_1, panelService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostOutputChannel = (function () {
        function ExtHostOutputChannel(name, proxy) {
            this._name = name;
            this._id = 'extension-output-#' + (ExtHostOutputChannel._idPool++);
            this._proxy = proxy;
        }
        Object.defineProperty(ExtHostOutputChannel.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostOutputChannel.prototype.dispose = function () {
            var _this = this;
            if (!this._disposed) {
                this._proxy.clear(this._id, this._name).then(function () {
                    _this._disposed = true;
                });
            }
        };
        ExtHostOutputChannel.prototype.append = function (value) {
            this._proxy.append(this._id, this._name, value);
        };
        ExtHostOutputChannel.prototype.appendLine = function (value) {
            this.append(value + '\n');
        };
        ExtHostOutputChannel.prototype.clear = function () {
            this._proxy.clear(this._id, this._name);
        };
        ExtHostOutputChannel.prototype.show = function (columnOrPreserveFocus, preserveFocus) {
            if (typeof columnOrPreserveFocus === 'boolean') {
                preserveFocus = columnOrPreserveFocus;
            }
            this._proxy.reveal(this._id, this._name, preserveFocus);
        };
        ExtHostOutputChannel.prototype.hide = function () {
            this._proxy.close(this._id);
        };
        ExtHostOutputChannel._idPool = 1;
        return ExtHostOutputChannel;
    }());
    exports.ExtHostOutputChannel = ExtHostOutputChannel;
    var ExtHostOutputService = (function () {
        function ExtHostOutputService(threadService) {
            this._proxy = threadService.getRemotable(MainThreadOutputService);
        }
        ExtHostOutputService.prototype.createOutputChannel = function (name) {
            name = name.trim();
            if (!name) {
                throw new Error('illegal argument `name`. must not be falsy');
            }
            else {
                return new ExtHostOutputChannel(name, this._proxy);
            }
        };
        return ExtHostOutputService;
    }());
    exports.ExtHostOutputService = ExtHostOutputService;
    var MainThreadOutputService = (function () {
        function MainThreadOutputService(outputService, partService, panelService) {
            this._outputService = outputService;
            this._partService = partService;
            this._panelService = panelService;
        }
        MainThreadOutputService.prototype.append = function (channelId, label, value) {
            this._getChannel(channelId, label).append(value);
            return undefined;
        };
        MainThreadOutputService.prototype.clear = function (channelId, label) {
            this._getChannel(channelId, label).clear();
            return undefined;
        };
        MainThreadOutputService.prototype.reveal = function (channelId, label, preserveFocus) {
            this._getChannel(channelId, label).show(preserveFocus);
            return undefined;
        };
        MainThreadOutputService.prototype._getChannel = function (channelId, label) {
            if (platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannels().every(function (channel) { return channel.id !== channelId; })) {
                platform_1.Registry.as(output_1.Extensions.OutputChannels).registerChannel(channelId, label);
            }
            return this._outputService.getChannel(channelId);
        };
        MainThreadOutputService.prototype.close = function (channelId) {
            var panel = this._panelService.getActivePanel();
            if (panel && panel.getId() === output_1.OUTPUT_PANEL_ID && channelId === this._outputService.getActiveChannel().id) {
                this._partService.setPanelHidden(true);
            }
            return undefined;
        };
        MainThreadOutputService = __decorate([
            thread_1.Remotable.MainContext('MainThreadOutputService'),
            __param(0, output_1.IOutputService),
            __param(1, partService_1.IPartService),
            __param(2, panelService_1.IPanelService)
        ], MainThreadOutputService);
        return MainThreadOutputService;
    }());
    exports.MainThreadOutputService = MainThreadOutputService;
});
//# sourceMappingURL=extHostOutputService.js.map