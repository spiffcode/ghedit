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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/output/browser/outputActions', 'vs/platform/platform', 'vs/base/common/actions', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/workbench/parts/output/common/output', 'vs/base/browser/ui/actionbar/actionbar', 'vs/workbench/services/part/common/partService', 'vs/workbench/services/panel/common/panelService'], function (require, exports, winjs_base_1, nls, platform_1, actions_1, editorAction_1, editorActionEnablement_1, output_1, actionbar_1, partService_1, panelService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ToggleOutputAction = (function (_super) {
        __extends(ToggleOutputAction, _super);
        function ToggleOutputAction(id, label, partService, panelService, outputService) {
            _super.call(this, id, label);
            this.partService = partService;
            this.panelService = panelService;
            this.outputService = outputService;
        }
        ToggleOutputAction.prototype.run = function (event) {
            var panel = this.panelService.getActivePanel();
            if (panel && panel.getId() === output_1.OUTPUT_PANEL_ID) {
                this.partService.setPanelHidden(true);
                return winjs_base_1.TPromise.as(null);
            }
            return this.outputService.getActiveChannel().show();
        };
        ToggleOutputAction.ID = 'workbench.action.output.toggleOutput';
        ToggleOutputAction.LABEL = nls.localize(0, null);
        ToggleOutputAction = __decorate([
            __param(2, partService_1.IPartService),
            __param(3, panelService_1.IPanelService),
            __param(4, output_1.IOutputService)
        ], ToggleOutputAction);
        return ToggleOutputAction;
    }(actions_1.Action));
    exports.ToggleOutputAction = ToggleOutputAction;
    var ClearOutputAction = (function (_super) {
        __extends(ClearOutputAction, _super);
        function ClearOutputAction(outputService, panelService) {
            _super.call(this, 'workbench.output.action.clearOutput', nls.localize(1, null), 'output-action clear-output');
            this.outputService = outputService;
            this.panelService = panelService;
        }
        ClearOutputAction.prototype.run = function () {
            this.outputService.getActiveChannel().clear();
            this.panelService.getActivePanel().focus();
            return winjs_base_1.TPromise.as(true);
        };
        ClearOutputAction = __decorate([
            __param(0, output_1.IOutputService),
            __param(1, panelService_1.IPanelService)
        ], ClearOutputAction);
        return ClearOutputAction;
    }(actions_1.Action));
    exports.ClearOutputAction = ClearOutputAction;
    var ClearOutputEditorAction = (function (_super) {
        __extends(ClearOutputEditorAction, _super);
        function ClearOutputEditorAction(descriptor, editor, outputService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.ShowInContextMenu);
            this.outputService = outputService;
        }
        ClearOutputEditorAction.prototype.getGroupId = function () {
            return 'clear';
        };
        ClearOutputEditorAction.prototype.isSupported = function () {
            var model = this.editor.getModel();
            var mode = model && model.getMode();
            return mode && mode.getId() === output_1.OUTPUT_MODE_ID && _super.prototype.isSupported.call(this);
        };
        ClearOutputEditorAction.prototype.run = function () {
            this.outputService.getActiveChannel().clear();
            return winjs_base_1.TPromise.as(false);
        };
        ClearOutputEditorAction.ID = 'editor.action.clearoutput';
        ClearOutputEditorAction = __decorate([
            __param(2, output_1.IOutputService)
        ], ClearOutputEditorAction);
        return ClearOutputEditorAction;
    }(editorAction_1.EditorAction));
    exports.ClearOutputEditorAction = ClearOutputEditorAction;
    var SwitchOutputAction = (function (_super) {
        __extends(SwitchOutputAction, _super);
        function SwitchOutputAction(outputService) {
            _super.call(this, SwitchOutputAction.ID, nls.localize(2, null));
            this.outputService = outputService;
            this.class = 'output-action switch-to-output';
        }
        SwitchOutputAction.prototype.run = function (channelId) {
            return this.outputService.getChannel(channelId).show();
        };
        SwitchOutputAction.ID = 'workbench.output.action.switchBetweenOutputs';
        SwitchOutputAction = __decorate([
            __param(0, output_1.IOutputService)
        ], SwitchOutputAction);
        return SwitchOutputAction;
    }(actions_1.Action));
    exports.SwitchOutputAction = SwitchOutputAction;
    var SwitchOutputActionItem = (function (_super) {
        __extends(SwitchOutputActionItem, _super);
        function SwitchOutputActionItem(action, outputService) {
            _super.call(this, null, action, SwitchOutputActionItem.getChannelLabels(outputService), Math.max(0, SwitchOutputActionItem.getChannelLabels(outputService).indexOf(outputService.getActiveChannel().label)));
            this.outputService = outputService;
            this.toDispose.push(this.outputService.onOutputChannel(this.onOutputChannel, this));
            this.toDispose.push(this.outputService.onActiveOutputChannel(this.onOutputChannel, this));
        }
        SwitchOutputActionItem.prototype.getActionContext = function (option) {
            var channel = platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannels().filter(function (channelData) { return channelData.label === option; }).pop();
            return channel ? channel.id : option;
        };
        SwitchOutputActionItem.prototype.onOutputChannel = function () {
            var channels = SwitchOutputActionItem.getChannelLabels(this.outputService);
            var selected = Math.max(0, channels.indexOf(this.outputService.getActiveChannel().label));
            this.setOptions(channels, selected);
        };
        SwitchOutputActionItem.getChannelLabels = function (outputService) {
            var contributedChannels = platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannels().map(function (channelData) { return channelData.label; });
            return contributedChannels.sort(); // sort by name
        };
        SwitchOutputActionItem = __decorate([
            __param(1, output_1.IOutputService)
        ], SwitchOutputActionItem);
        return SwitchOutputActionItem;
    }(actionbar_1.SelectActionItem));
    exports.SwitchOutputActionItem = SwitchOutputActionItem;
});
//# sourceMappingURL=outputActions.js.map