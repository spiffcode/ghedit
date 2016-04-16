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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/strings', 'vs/base/common/event', 'vs/platform/event/common/event', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/instantiation/common/instantiation', 'vs/platform/storage/common/storage', 'vs/platform/platform', 'vs/workbench/common/editor', 'vs/workbench/parts/output/common/output', 'vs/workbench/parts/output/common/outputEditorInput', 'vs/workbench/services/panel/common/panelService'], function (require, exports, winjs_base_1, strings, event_1, event_2, lifecycle_1, instantiation_1, storage_1, platform_1, editor_1, output_1, outputEditorInput_1, panelService_1) {
    "use strict";
    var OUTPUT_ACTIVE_CHANNEL_KEY = 'output.activechannel';
    var OutputService = (function () {
        function OutputService(storageService, instantiationService, eventService, lifecycleService, panelService) {
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.eventService = eventService;
            this.lifecycleService = lifecycleService;
            this.panelService = panelService;
            this.serviceId = output_1.IOutputService;
            this._onOutput = new event_1.Emitter();
            this._onOutputChannel = new event_1.Emitter();
            this._onActiveOutputChannel = new event_1.Emitter();
            this.receivedOutput = Object.create(null);
            var channels = platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannels();
            this.activeChannelId = this.storageService.get(OUTPUT_ACTIVE_CHANNEL_KEY, storage_1.StorageScope.WORKSPACE, channels && channels.length > 0 ? channels[0].id : null);
        }
        Object.defineProperty(OutputService.prototype, "onOutput", {
            get: function () {
                return this._onOutput.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OutputService.prototype, "onOutputChannel", {
            get: function () {
                return this._onOutputChannel.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OutputService.prototype, "onActiveOutputChannel", {
            get: function () {
                return this._onActiveOutputChannel.event;
            },
            enumerable: true,
            configurable: true
        });
        OutputService.prototype.getChannel = function (id) {
            var _this = this;
            var channelData = platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannels().filter(function (channelData) { return channelData.id === id; }).pop();
            var self = this;
            return {
                id: id,
                label: channelData ? channelData.label : id,
                get output() {
                    return self.getOutput(id);
                },
                append: function (output) { return _this.append(id, output); },
                show: function (preserveFocus) { return _this.showOutput(id, preserveFocus); },
                clear: function () { return _this.clearOutput(id); }
            };
        };
        OutputService.prototype.append = function (channelId, output) {
            // Initialize
            if (!this.receivedOutput[channelId]) {
                this.receivedOutput[channelId] = '';
                this._onOutputChannel.fire(channelId); // emit event that we have a new channel
            }
            // Sanitize
            output = strings.removeAnsiEscapeCodes(output);
            // Store
            if (output) {
                this.receivedOutput[channelId] = strings.appendWithLimit(this.receivedOutput[channelId], output, output_1.MAX_OUTPUT_LENGTH);
            }
            this._onOutput.fire({ output: output, channelId: channelId });
        };
        OutputService.prototype.getActiveChannel = function () {
            return this.getChannel(this.activeChannelId);
        };
        OutputService.prototype.getOutput = function (channelId) {
            return this.receivedOutput[channelId] || '';
        };
        OutputService.prototype.clearOutput = function (channelId) {
            this.receivedOutput[channelId] = '';
            this._onOutput.fire({ channelId: channelId, output: null /* indicator to clear output */ });
        };
        OutputService.prototype.showOutput = function (channelId, preserveFocus) {
            var _this = this;
            var panel = this.panelService.getActivePanel();
            if (this.activeChannelId === channelId && panel && panel.getId() === output_1.OUTPUT_PANEL_ID) {
                return winjs_base_1.TPromise.as(panel);
            }
            this.activeChannelId = channelId;
            this.storageService.store(OUTPUT_ACTIVE_CHANNEL_KEY, this.activeChannelId, storage_1.StorageScope.WORKSPACE);
            this._onActiveOutputChannel.fire(channelId); // emit event that a new channel is active
            return this.panelService.openPanel(output_1.OUTPUT_PANEL_ID, !preserveFocus).then(function (outputPanel) {
                return outputPanel && outputPanel.setInput(outputEditorInput_1.OutputEditorInput.getInstance(_this.instantiationService, _this.getChannel(channelId)), editor_1.EditorOptions.create({ preserveFocus: preserveFocus })).
                    then(function () { return outputPanel; });
            });
        };
        OutputService = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, event_2.IEventService),
            __param(3, lifecycle_1.ILifecycleService),
            __param(4, panelService_1.IPanelService)
        ], OutputService);
        return OutputService;
    }());
    exports.OutputService = OutputService;
});
//# sourceMappingURL=outputServices.js.map