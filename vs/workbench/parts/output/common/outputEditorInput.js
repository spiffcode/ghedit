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
define(["require", "exports", 'vs/nls!vs/workbench/parts/output/common/outputEditorInput', 'vs/base/common/lifecycle', 'vs/base/common/strings', 'vs/base/common/async', 'vs/workbench/common/editor/stringEditorInput', 'vs/workbench/parts/output/common/output', 'vs/platform/instantiation/common/instantiation', 'vs/platform/event/common/event', 'vs/workbench/common/events', 'vs/workbench/services/panel/common/panelService'], function (require, exports, nls, lifecycle, strings, async_1, stringEditorInput_1, output_1, instantiation_1, event_1, events_1, panelService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Output Editor Input
     */
    var OutputEditorInput = (function (_super) {
        __extends(OutputEditorInput, _super);
        function OutputEditorInput(outputChannel, instantiationService, outputService, panelService, eventService) {
            var _this = this;
            _super.call(this, nls.localize(0, null), outputChannel ? nls.localize(1, null, outputChannel.label) : '', '', output_1.OUTPUT_MIME, true, instantiationService);
            this.outputChannel = outputChannel;
            this.outputService = outputService;
            this.panelService = panelService;
            this.eventService = eventService;
            this.bufferedOutput = '';
            this.toDispose = [];
            this.toDispose.push(this.outputService.onOutput(this.onOutputReceived, this));
            this.toDispose.push(this.outputService.onActiveOutputChannel(function () { return _this.scheduleOutputAppend(); }));
            this.toDispose.push(this.eventService.addListener2(events_1.EventType.COMPOSITE_OPENED, function (e) {
                if (e.compositeId === output_1.OUTPUT_PANEL_ID) {
                    _this.appendOutput();
                }
            }));
            this.appendOutputScheduler = new async_1.RunOnceScheduler(function () {
                if (_this.isVisible()) {
                    _this.appendOutput();
                }
            }, OutputEditorInput.OUTPUT_DELAY);
        }
        OutputEditorInput.getInstances = function () {
            return Object.keys(OutputEditorInput.instances).map(function (key) { return OutputEditorInput.instances[key]; });
        };
        OutputEditorInput.getInstance = function (instantiationService, channel) {
            if (OutputEditorInput.instances[channel.id]) {
                return OutputEditorInput.instances[channel.id];
            }
            OutputEditorInput.instances[channel.id] = instantiationService.createInstance(OutputEditorInput, channel);
            return OutputEditorInput.instances[channel.id];
        };
        OutputEditorInput.prototype.appendOutput = function () {
            if (this.value.length + this.bufferedOutput.length > output_1.MAX_OUTPUT_LENGTH) {
                this.setValue(this.outputChannel.output);
            }
            else {
                this.append(this.bufferedOutput);
            }
            this.bufferedOutput = '';
            var panel = this.panelService.getActivePanel();
            panel.revealLastLine();
        };
        OutputEditorInput.prototype.onOutputReceived = function (e) {
            if (this.outputSet && e.channelId === this.outputChannel.id) {
                if (e.output) {
                    this.bufferedOutput = strings.appendWithLimit(this.bufferedOutput, e.output, output_1.MAX_OUTPUT_LENGTH);
                    this.scheduleOutputAppend();
                }
                else if (e.output === null) {
                    this.clearValue(); // special output indicates we should clear
                }
            }
        };
        OutputEditorInput.prototype.isVisible = function () {
            var panel = this.panelService.getActivePanel();
            return panel && panel.getId() === output_1.OUTPUT_PANEL_ID && this.outputService.getActiveChannel().id === this.outputChannel.id;
        };
        OutputEditorInput.prototype.scheduleOutputAppend = function () {
            if (this.isVisible() && this.bufferedOutput && !this.appendOutputScheduler.isScheduled()) {
                this.appendOutputScheduler.schedule();
            }
        };
        OutputEditorInput.prototype.getId = function () {
            return output_1.OUTPUT_EDITOR_INPUT_ID;
        };
        OutputEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            return _super.prototype.resolve.call(this, refresh).then(function (model) {
                // Just return model if output already set
                if (_this.outputSet) {
                    return model;
                }
                _this.setValue(_this.outputChannel.output);
                _this.outputSet = true;
                return model;
            });
        };
        OutputEditorInput.prototype.matches = function (otherInput) {
            if (otherInput instanceof OutputEditorInput) {
                var otherOutputEditorInput = otherInput;
                if (otherOutputEditorInput.outputChannel.id === this.outputChannel.id) {
                    return _super.prototype.matches.call(this, otherInput);
                }
            }
            return false;
        };
        OutputEditorInput.prototype.dispose = function () {
            this.appendOutputScheduler.dispose();
            this.toDispose = lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        OutputEditorInput.OUTPUT_DELAY = 300; // delay in ms to accumulate output before emitting an event about it
        OutputEditorInput.instances = Object.create(null);
        OutputEditorInput = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, output_1.IOutputService),
            __param(3, panelService_1.IPanelService),
            __param(4, event_1.IEventService)
        ], OutputEditorInput);
        return OutputEditorInput;
    }(stringEditorInput_1.StringEditorInput));
    exports.OutputEditorInput = OutputEditorInput;
});
//# sourceMappingURL=outputEditorInput.js.map