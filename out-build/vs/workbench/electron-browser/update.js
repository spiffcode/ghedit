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
define(["require", "exports", 'vs/nls!vs/workbench/electron-browser/update', 'vs/base/common/severity', 'vs/base/common/winjs.base', 'vs/base/common/actions', 'electron', 'vs/platform/message/common/message', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/request/common/request'], function (require, exports, nls, severity_1, winjs_base_1, actions_1, electron_1, message_1, contextService_1, request_1) {
    'use strict';
    var ApplyUpdateAction = new actions_1.Action('update.applyUpdate', nls.localize(0, null), null, true, function () { electron_1.ipcRenderer.send('vscode:update-apply'); return winjs_base_1.TPromise.as(true); });
    var NotNowAction = new actions_1.Action('update.later', nls.localize(1, null), null, true, function () { return winjs_base_1.TPromise.as(true); });
    exports.ShowReleaseNotesAction = function (releaseNotesUrl, returnValue) {
        if (returnValue === void 0) { returnValue = false; }
        return new actions_1.Action('update.showReleaseNotes', nls.localize(2, null), null, true, function () { electron_1.shell.openExternal(releaseNotesUrl); return winjs_base_1.TPromise.as(returnValue); });
    };
    exports.DownloadAction = function (url) { return new actions_1.Action('update.download', nls.localize(3, null), null, true, function () { electron_1.shell.openExternal(url); return winjs_base_1.TPromise.as(true); }); };
    var Update = (function () {
        function Update(contextService, messageService, requestService) {
            var _this = this;
            this.contextService = contextService;
            this.messageService = messageService;
            this.requestService = requestService;
            var env = this.contextService.getConfiguration().env;
            electron_1.ipcRenderer.on('vscode:update-downloaded', function (event, update) {
                _this.messageService.show(severity_1.default.Info, {
                    message: nls.localize(4, null, env.appName),
                    actions: [exports.ShowReleaseNotesAction(env.releaseNotesUrl), NotNowAction, ApplyUpdateAction]
                });
            });
            electron_1.ipcRenderer.on('vscode:update-available', function (event, url) {
                _this.messageService.show(severity_1.default.Info, {
                    message: nls.localize(5, null),
                    actions: [exports.ShowReleaseNotesAction(env.releaseNotesUrl), NotNowAction, exports.DownloadAction(url)]
                });
            });
            electron_1.ipcRenderer.on('vscode:update-not-available', function () {
                _this.messageService.show(severity_1.default.Info, nls.localize(6, null));
            });
        }
        Update = __decorate([
            __param(0, contextService_1.IWorkspaceContextService),
            __param(1, message_1.IMessageService),
            __param(2, request_1.IRequestService)
        ], Update);
        return Update;
    }());
    exports.Update = Update;
});
//# sourceMappingURL=update.js.map