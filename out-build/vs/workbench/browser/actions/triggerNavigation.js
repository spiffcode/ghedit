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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/browser/actions/triggerNavigation', 'vs/platform/platform', 'vs/base/common/actions', 'vs/platform/actions/common/actions', 'vs/workbench/common/actionRegistry', 'vs/base/common/keyCodes', 'vs/workbench/services/history/common/history'], function (require, exports, winjs_base_1, nls, platform_1, actions_1, actions_2, actionRegistry_1, keyCodes_1, history_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var NAVIGATE_FORWARD_ID = 'workbench.action.navigateForward';
    var NAVIGATE_FORWARD_LABEL = nls.localize(0, null);
    var NavigateForwardAction = (function (_super) {
        __extends(NavigateForwardAction, _super);
        function NavigateForwardAction(id, label, historyService) {
            _super.call(this, id, label);
            this.historyService = historyService;
        }
        NavigateForwardAction.prototype.run = function () {
            this.historyService.forward();
            return winjs_base_1.TPromise.as(null);
        };
        NavigateForwardAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], NavigateForwardAction);
        return NavigateForwardAction;
    }(actions_1.Action));
    exports.NavigateForwardAction = NavigateForwardAction;
    var NAVIGATE_BACKWARDS_ID = 'workbench.action.navigateBack';
    var NAVIGATE_BACKWARDS_LABEL = nls.localize(1, null);
    var NavigateBackwardsAction = (function (_super) {
        __extends(NavigateBackwardsAction, _super);
        function NavigateBackwardsAction(id, label, historyService) {
            _super.call(this, id, label);
            this.historyService = historyService;
        }
        NavigateBackwardsAction.prototype.run = function () {
            this.historyService.back();
            return winjs_base_1.TPromise.as(null);
        };
        NavigateBackwardsAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], NavigateBackwardsAction);
        return NavigateBackwardsAction;
    }(actions_1.Action));
    exports.NavigateBackwardsAction = NavigateBackwardsAction;
    var registry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(NavigateForwardAction, NAVIGATE_FORWARD_ID, NAVIGATE_FORWARD_LABEL, {
        primary: null,
        win: { primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.RightArrow },
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_MINUS },
        linux: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_MINUS }
    }));
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(NavigateBackwardsAction, NAVIGATE_BACKWARDS_ID, NAVIGATE_BACKWARDS_LABEL, {
        primary: null,
        win: { primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.LeftArrow },
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.US_MINUS },
        linux: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.US_MINUS }
    }));
});
//# sourceMappingURL=triggerNavigation.js.map