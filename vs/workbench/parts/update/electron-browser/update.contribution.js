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
define(["require", "exports", 'vs/nls!vs/workbench/parts/update/electron-browser/update.contribution', 'vs/platform/platform', 'vs/base/common/winjs.base', 'vs/workbench/common/contributions', 'vs/platform/storage/common/storage', 'vs/platform/workspace/common/workspace', 'vs/platform/message/common/message', 'vs/base/common/severity', 'vs/workbench/electron-browser/update', 'vs/base/common/actions', 'electron', 'semver'], function (require, exports, nls, platform_1, winjs_base_1, contributions_1, storage_1, workspace_1, message_1, severity_1, update_1, actions_1, electron_1, semver) {
    'use strict';
    var CloseAction = new actions_1.Action('close', nls.localize(0, null), '', true, function () { return null; });
    var ShowLicenseAction = function (licenseUrl) { return new actions_1.Action('update.showLicense', nls.localize(1, null), null, true, function () { electron_1.shell.openExternal(licenseUrl); return winjs_base_1.TPromise.as(null); }); };
    var UpdateContribution = (function () {
        function UpdateContribution(storageService, contextService, messageService) {
            var env = contextService.getConfiguration().env;
            var lastVersion = storageService.get(UpdateContribution.KEY, storage_1.StorageScope.GLOBAL, '');
            // was there an update?
            if (env.releaseNotesUrl && lastVersion && env.version !== lastVersion) {
                setTimeout(function () {
                    messageService.show(severity_1.default.Info, {
                        message: nls.localize(2, null, env.appName, env.version),
                        actions: [
                            CloseAction,
                            update_1.ShowReleaseNotesAction(env.releaseNotesUrl, true)
                        ]
                    });
                }, 0);
            }
            // should we show the new license?
            if (env.licenseUrl && lastVersion && semver.satisfies(lastVersion, '<1.0.0') && semver.satisfies(env.version, '>=1.0.0')) {
                setTimeout(function () {
                    messageService.show(severity_1.default.Info, {
                        message: nls.localize(3, null, env.appName, env.version),
                        actions: [
                            CloseAction,
                            ShowLicenseAction(env.licenseUrl)
                        ]
                    });
                }, 0);
            }
            storageService.store(UpdateContribution.KEY, env.version, storage_1.StorageScope.GLOBAL);
        }
        UpdateContribution.prototype.getId = function () { return 'vs.update'; };
        UpdateContribution.KEY = 'releaseNotes/lastVersion';
        UpdateContribution = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, message_1.IMessageService)
        ], UpdateContribution);
        return UpdateContribution;
    }());
    exports.UpdateContribution = UpdateContribution;
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(UpdateContribution);
});
//# sourceMappingURL=update.contribution.js.map