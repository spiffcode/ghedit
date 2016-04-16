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
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/common/keyCodes', 'vs/base/common/actions', 'vs/base/browser/dom', 'vs/platform/platform', 'vs/workbench/browser/actionBarRegistry', 'vs/platform/actions/common/actions', 'vs/workbench/common/actionRegistry', 'vs/workbench/browser/parts/compositePart', 'vs/workbench/browser/panel', 'vs/workbench/services/panel/common/panelService', 'vs/workbench/services/part/common/partService', 'vs/css!./media/panelPart'], function (require, exports, nls, winjs_base_1, keyCodes_1, actions_1, dom, platform_1, actionBarRegistry_1, actions_2, actionRegistry_1, compositePart_1, panel_1, panelService_1, partService_1) {
    "use strict";
    var PanelPart = (function (_super) {
        __extends(PanelPart, _super);
        function PanelPart(messageService, storageService, eventService, telemetryService, contextMenuService, partService, keybindingService, id) {
            _super.call(this, messageService, storageService, eventService, telemetryService, contextMenuService, partService, keybindingService, platform_1.Registry.as(panel_1.Extensions.Panels), PanelPart.activePanelSettingsKey, 'panel', 'panel', actionBarRegistry_1.Scope.PANEL, id);
            this.serviceId = panelService_1.IPanelService;
        }
        PanelPart.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            dom.addStandardDisposableListener(this.getContainer().getHTMLElement(), 'keyup', function (e) {
                if (e.equals(keyCodes_1.CommonKeybindings.ESCAPE)) {
                    _this.partService.setPanelHidden(true);
                    e.preventDefault();
                }
            });
        };
        PanelPart.prototype.openPanel = function (id, focus) {
            if (this.blockOpeningPanel) {
                return winjs_base_1.TPromise.as(null); // Workaround against a potential race condition
            }
            // First check if panel is hidden and show if so
            if (this.partService.isPanelHidden()) {
                try {
                    this.blockOpeningPanel = true;
                    this.partService.setPanelHidden(false);
                }
                finally {
                    this.blockOpeningPanel = false;
                }
            }
            return this.openComposite(id, focus);
        };
        PanelPart.prototype.getActions = function () {
            return [this.instantiationService.createInstance(ClosePanelAction, ClosePanelAction.ID, ClosePanelAction.LABEL)];
        };
        PanelPart.prototype.getActivePanel = function () {
            return this.getActiveComposite();
        };
        PanelPart.prototype.getLastActivePanelId = function () {
            return this.getLastActiveCompositetId();
        };
        PanelPart.prototype.hideActivePanel = function () {
            return this.hideActiveComposite();
        };
        PanelPart.activePanelSettingsKey = 'workbench.panelpart.activepanelid';
        return PanelPart;
    }(compositePart_1.CompositePart));
    exports.PanelPart = PanelPart;
    var ClosePanelAction = (function (_super) {
        __extends(ClosePanelAction, _super);
        function ClosePanelAction(id, name, partService) {
            _super.call(this, id, name, 'close-editor-action');
            this.partService = partService;
        }
        ClosePanelAction.prototype.run = function () {
            this.partService.setPanelHidden(true);
            return winjs_base_1.TPromise.as(true);
        };
        ClosePanelAction.ID = 'workbench.action.closePanel';
        ClosePanelAction.LABEL = nls.localize('closePanel', "Close");
        ClosePanelAction = __decorate([
            __param(2, partService_1.IPartService)
        ], ClosePanelAction);
        return ClosePanelAction;
    }(actions_1.Action));
    var TogglePanelAction = (function (_super) {
        __extends(TogglePanelAction, _super);
        function TogglePanelAction(id, name, partService) {
            _super.call(this, id, name, null);
            this.partService = partService;
        }
        TogglePanelAction.prototype.run = function () {
            this.partService.setPanelHidden(!this.partService.isPanelHidden());
            return winjs_base_1.TPromise.as(true);
        };
        TogglePanelAction.ID = 'workbench.action.togglePanel';
        TogglePanelAction.LABEL = nls.localize('togglePanel', "Toggle Panel Visibility");
        TogglePanelAction = __decorate([
            __param(2, partService_1.IPartService)
        ], TogglePanelAction);
        return TogglePanelAction;
    }(actions_1.Action));
    var actionRegistry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(TogglePanelAction, TogglePanelAction.ID, TogglePanelAction.LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_J }), nls.localize('view', "View"));
});
