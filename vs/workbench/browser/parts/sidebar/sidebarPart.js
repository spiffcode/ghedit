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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls', 'vs/platform/platform', 'vs/base/common/actions', 'vs/workbench/browser/parts/compositePart', 'vs/workbench/browser/viewlet', 'vs/workbench/common/actionRegistry', 'vs/platform/actions/common/actions', 'vs/workbench/services/viewlet/common/viewletService', 'vs/workbench/services/part/common/partService', 'vs/workbench/browser/actionBarRegistry', 'vs/base/common/keyCodes', 'vs/css!./media/sidebarpart'], function (require, exports, winjs_base_1, nls, platform_1, actions_1, compositePart_1, viewlet_1, actionRegistry_1, actions_2, viewletService_1, partService_1, actionBarRegistry_1, keyCodes_1) {
    "use strict";
    var SidebarPart = (function (_super) {
        __extends(SidebarPart, _super);
        function SidebarPart(messageService, storageService, eventService, telemetryService, contextMenuService, partService, keybindingService, id) {
            _super.call(this, messageService, storageService, eventService, telemetryService, contextMenuService, partService, keybindingService, platform_1.Registry.as(viewlet_1.Extensions.Viewlets), SidebarPart.activeViewletSettingsKey, 'sideBar', 'viewlet', actionBarRegistry_1.Scope.VIEWLET, id);
            this.serviceId = viewletService_1.IViewletService;
        }
        SidebarPart.prototype.openViewlet = function (id, focus) {
            if (this.blockOpeningViewlet) {
                return winjs_base_1.TPromise.as(null); // Workaround against a potential race condition
            }
            // First check if sidebar is hidden and show if so
            if (this.partService.isSideBarHidden()) {
                try {
                    this.blockOpeningViewlet = true;
                    this.partService.setSideBarHidden(false);
                }
                finally {
                    this.blockOpeningViewlet = false;
                }
            }
            return this.openComposite(id, focus);
        };
        SidebarPart.prototype.getActiveViewlet = function () {
            return this.getActiveComposite();
        };
        SidebarPart.prototype.getLastActiveViewletId = function () {
            return this.getLastActiveCompositetId();
        };
        SidebarPart.prototype.hideActiveViewlet = function () {
            return this.hideActiveComposite();
        };
        SidebarPart.activeViewletSettingsKey = 'workbench.sidebar.activeviewletid';
        return SidebarPart;
    }(compositePart_1.CompositePart));
    exports.SidebarPart = SidebarPart;
    var FocusSideBarAction = (function (_super) {
        __extends(FocusSideBarAction, _super);
        function FocusSideBarAction(id, label, viewletService, partService) {
            _super.call(this, id, label);
            this.viewletService = viewletService;
            this.partService = partService;
        }
        FocusSideBarAction.prototype.run = function () {
            // Show side bar
            if (this.partService.isSideBarHidden()) {
                this.partService.setSideBarHidden(false);
            }
            else {
                var viewlet = this.viewletService.getActiveViewlet();
                if (viewlet) {
                    viewlet.focus();
                }
            }
            return winjs_base_1.TPromise.as(true);
        };
        FocusSideBarAction.ID = 'workbench.action.focusSideBar';
        FocusSideBarAction.LABEL = nls.localize('focusSideBar', "Focus into Side Bar");
        FocusSideBarAction = __decorate([
            __param(2, viewletService_1.IViewletService),
            __param(3, partService_1.IPartService)
        ], FocusSideBarAction);
        return FocusSideBarAction;
    }(actions_1.Action));
    exports.FocusSideBarAction = FocusSideBarAction;
    var registry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(FocusSideBarAction, FocusSideBarAction.ID, FocusSideBarAction.LABEL, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_0
    }), nls.localize('viewCategory', "View"));
});
//# sourceMappingURL=sidebarPart.js.map