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
define(["require", "exports", 'vs/nls!vs/workbench/parts/output/browser/outputPanel', 'vs/base/common/lifecycle', 'vs/editor/common/services/modeService', 'vs/platform/telemetry/common/telemetry', 'vs/platform/storage/common/storage', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/workbench/browser/parts/editor/stringEditor', 'vs/workbench/parts/output/common/output', 'vs/workbench/parts/output/common/outputEditorInput', 'vs/workbench/parts/output/browser/outputActions', 'vs/workbench/services/workspace/common/contextService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/themes/common/themeService'], function (require, exports, nls, lifecycle, modeService_1, telemetry_1, storage_1, configuration_1, event_1, instantiation_1, message_1, stringEditor_1, output_1, outputEditorInput_1, outputActions_1, contextService_1, editorService_1, themeService_1) {
    "use strict";
    var OutputPanel = (function (_super) {
        __extends(OutputPanel, _super);
        function OutputPanel(telemetryService, instantiationService, contextService, storageService, messageService, configurationService, eventService, editorService, modeService, themeService, outputService) {
            _super.call(this, telemetryService, instantiationService, contextService, storageService, messageService, configurationService, eventService, editorService, modeService, themeService);
            this.outputService = outputService;
            this.toDispose = [];
        }
        OutputPanel.prototype.getId = function () {
            return output_1.OUTPUT_PANEL_ID;
        };
        OutputPanel.prototype.getActions = function () {
            var _this = this;
            if (!this.actions) {
                this.actions = [
                    this.instantiationService.createInstance(outputActions_1.SwitchOutputAction),
                    this.instantiationService.createInstance(outputActions_1.ClearOutputAction)
                ];
                this.actions.forEach(function (a) {
                    _this.toDispose.push(a);
                });
            }
            return this.actions;
        };
        OutputPanel.prototype.getActionItem = function (action) {
            if (action.id === outputActions_1.SwitchOutputAction.ID) {
                return this.instantiationService.createInstance(outputActions_1.SwitchOutputActionItem, action);
            }
            return _super.prototype.getActionItem.call(this, action);
        };
        OutputPanel.prototype.getCodeEditorOptions = function () {
            var options = _super.prototype.getCodeEditorOptions.call(this);
            options.wrappingColumn = 0; // all output editors wrap
            options.lineNumbers = false; // all output editors hide line numbers
            options.glyphMargin = false;
            options.lineDecorationsWidth = 20;
            options.rulers = [];
            options.folding = false;
            var channel = this.outputService.getActiveChannel();
            options.ariaLabel = channel ? nls.localize(0, null, channel.label) : nls.localize(1, null);
            return options;
        };
        OutputPanel.prototype.setInput = function (input, options) {
            var _this = this;
            return _super.prototype.setInput.call(this, input, options).then(function () { return _this.revealLastLine(); });
        };
        OutputPanel.prototype.create = function (parent) {
            var _this = this;
            return _super.prototype.create.call(this, parent)
                .then(function () { return _this.setInput(outputEditorInput_1.OutputEditorInput.getInstance(_this.instantiationService, _this.outputService.getActiveChannel()), null); });
        };
        OutputPanel.prototype.focus = function () {
            _super.prototype.focus.call(this);
            this.revealLastLine();
        };
        OutputPanel.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        OutputPanel = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, contextService_1.IWorkspaceContextService),
            __param(3, storage_1.IStorageService),
            __param(4, message_1.IMessageService),
            __param(5, configuration_1.IConfigurationService),
            __param(6, event_1.IEventService),
            __param(7, editorService_1.IWorkbenchEditorService),
            __param(8, modeService_1.IModeService),
            __param(9, themeService_1.IThemeService),
            __param(10, output_1.IOutputService)
        ], OutputPanel);
        return OutputPanel;
    }(stringEditor_1.StringEditor));
    exports.OutputPanel = OutputPanel;
});
//# sourceMappingURL=outputPanel.js.map