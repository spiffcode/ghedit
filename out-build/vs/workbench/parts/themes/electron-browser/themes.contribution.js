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
define(["require", "exports", 'vs/nls!vs/workbench/parts/themes/electron-browser/themes.contribution', 'vs/base/common/actions', 'vs/platform/actions/common/actions', 'vs/platform/message/common/message', 'vs/platform/platform', 'vs/workbench/common/actionRegistry', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/platform/workspace/common/workspace', 'vs/workbench/services/themes/common/themeService', 'vs/base/common/async'], function (require, exports, nls, actions, actions_1, message_1, platform, workbenchActionRegistry, quickOpenService_1, workspace_1, themeService_1, async_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SelectThemeAction = (function (_super) {
        __extends(SelectThemeAction, _super);
        function SelectThemeAction(id, label, contextService, quickOpenService, messageService, themeService) {
            _super.call(this, id, label);
            this.contextService = contextService;
            this.quickOpenService = quickOpenService;
            this.messageService = messageService;
            this.themeService = themeService;
        }
        SelectThemeAction.prototype.run = function () {
            var _this = this;
            return this.themeService.getThemes().then(function (contributedThemes) {
                var currentTheme = _this.themeService.getTheme();
                var picks = [];
                contributedThemes.forEach(function (theme) {
                    picks.push({ id: theme.id, label: theme.label, description: theme.description });
                    contributedThemes[theme.id] = theme;
                });
                picks = picks.sort(function (t1, t2) { return t1.label.localeCompare(t2.label); });
                var selectedPickIndex;
                picks.forEach(function (p, index) {
                    if (p.id === currentTheme) {
                        selectedPickIndex = index;
                    }
                });
                var selectTheme = function (pick, broadcast) {
                    if (pick) {
                        var themeId = pick.id;
                        _this.themeService.setTheme(themeId, broadcast).then(null, function (error) {
                            _this.messageService.show(message_1.Severity.Info, nls.localize(1, null, error.message));
                        });
                    }
                    else {
                        _this.themeService.setTheme(currentTheme, broadcast);
                    }
                };
                var themeToPreview = null;
                var previewThemeScheduler = new async_1.RunOnceScheduler(function () {
                    selectTheme(themeToPreview, false);
                }, 100);
                var previewTheme = function (pick) {
                    themeToPreview = pick;
                    previewThemeScheduler.schedule();
                };
                var pickTheme = function (pick) {
                    previewThemeScheduler.dispose();
                    selectTheme(pick, true);
                };
                return _this.quickOpenService.pick(picks, { placeHolder: nls.localize(2, null), autoFocus: { autoFocusIndex: selectedPickIndex } }).then(pickTheme, null, previewTheme);
            });
        };
        SelectThemeAction.ID = 'workbench.action.selectTheme';
        SelectThemeAction.LABEL = nls.localize(0, null);
        SelectThemeAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, quickOpenService_1.IQuickOpenService),
            __param(4, message_1.IMessageService),
            __param(5, themeService_1.IThemeService)
        ], SelectThemeAction);
        return SelectThemeAction;
    }(actions.Action));
    var category = nls.localize(3, null);
    var workbenchActionsRegistry = platform.Registry.as(workbenchActionRegistry.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(SelectThemeAction, SelectThemeAction.ID, SelectThemeAction.LABEL), category);
});
//# sourceMappingURL=themes.contribution.js.map