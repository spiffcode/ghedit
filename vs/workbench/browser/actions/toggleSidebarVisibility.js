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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/browser/actions/toggleSidebarVisibility', 'vs/platform/platform', 'vs/base/common/actions', 'vs/platform/actions/common/actions', 'vs/workbench/common/actionRegistry', 'vs/workbench/services/part/common/partService', 'vs/base/common/keyCodes'], function (require, exports, winjs_base_1, nls, platform_1, actions_1, actions_2, actionRegistry_1, partService_1, keyCodes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ID = 'workbench.action.toggleSidebarVisibility';
    var LABEL = nls.localize(0, null);
    var ToggleSidebarVisibilityAction = (function (_super) {
        __extends(ToggleSidebarVisibilityAction, _super);
        function ToggleSidebarVisibilityAction(id, label, partService) {
            _super.call(this, id, label);
            this.partService = partService;
            this.enabled = !!this.partService;
        }
        ToggleSidebarVisibilityAction.prototype.run = function () {
            var hideSidebar = !this.partService.isSideBarHidden();
            this.partService.setSideBarHidden(hideSidebar);
            return winjs_base_1.TPromise.as(null);
        };
        ToggleSidebarVisibilityAction = __decorate([
            __param(2, partService_1.IPartService)
        ], ToggleSidebarVisibilityAction);
        return ToggleSidebarVisibilityAction;
    }(actions_1.Action));
    exports.ToggleSidebarVisibilityAction = ToggleSidebarVisibilityAction;
    var registry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ToggleSidebarVisibilityAction, ID, LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_B }), nls.localize(1, null));
});
//# sourceMappingURL=toggleSidebarVisibility.js.map