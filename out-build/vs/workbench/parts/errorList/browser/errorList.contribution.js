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
define(["require", "exports", 'vs/nls!vs/workbench/parts/errorList/browser/errorList.contribution', 'vs/base/common/actions', 'vs/base/common/winjs.base', 'vs/platform/platform', 'vs/workbench/browser/panel', 'vs/workbench/parts/errorList/browser/errorListConstants', 'vs/workbench/services/part/common/partService', 'vs/workbench/services/panel/common/panelService'], function (require, exports, nls, actions_1, winjs_base_1, platform, panel, errorListConstants_1, partService_1, panelService_1) {
    "use strict";
    var ToggleErrorListAction = (function (_super) {
        __extends(ToggleErrorListAction, _super);
        function ToggleErrorListAction(id, label, partService, panelService) {
            _super.call(this, id, label);
            this.partService = partService;
            this.panelService = panelService;
        }
        ToggleErrorListAction.prototype.run = function (event) {
            var panel = this.panelService.getActivePanel();
            if (panel && panel.getId() === errorListConstants_1.ERROR_LIST_PANEL_ID) {
                this.partService.setPanelHidden(true);
                return winjs_base_1.TPromise.as(null);
            }
            return this.panelService.openPanel(errorListConstants_1.ERROR_LIST_PANEL_ID, true);
        };
        ToggleErrorListAction.ID = 'workbench.action.errorList.toggle';
        ToggleErrorListAction.LABEL = nls.localize(0, null);
        ToggleErrorListAction = __decorate([
            __param(2, partService_1.IPartService),
            __param(3, panelService_1.IPanelService)
        ], ToggleErrorListAction);
        return ToggleErrorListAction;
    }(actions_1.Action));
    // register panel
    platform.Registry.as(panel.Extensions.Panels).registerPanel(new panel.PanelDescriptor('vs/workbench/parts/errorList/browser/errorList', 'ErrorList', errorListConstants_1.ERROR_LIST_PANEL_ID, nls.localize(1, null), 'errorList'));
});
// register toggle output action globally
// let actionRegistry = <IWorkbenchActionRegistry>platform.Registry.as(ActionExtensions.WorkbenchActions);
// actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ToggleErrorListAction, ToggleErrorListAction.ID, ToggleErrorListAction.LABEL, {
// 	primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_A,
// 	linux: {
// 		primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_A
// 	}
// }), nls.localize('viewCategory', "View"));
//# sourceMappingURL=errorList.contribution.js.map