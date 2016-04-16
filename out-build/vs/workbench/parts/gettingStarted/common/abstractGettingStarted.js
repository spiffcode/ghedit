var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/workbench/services/workspace/common/contextService', 'vs/platform/storage/common/storage', 'vs/platform/telemetry/common/telemetry'], function (require, exports, contextService_1, storage_1, telemetry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * This extensions handles the first launch expereince for new users
     */
    var AbstractGettingStarted = (function () {
        function AbstractGettingStarted(storageService, contextService, telemetryService) {
            this.storageService = storageService;
            this.contextService = contextService;
            this.telemetryService = telemetryService;
            var env = contextService.getConfiguration().env;
            this.appName = env.appName;
            if (env.welcomePage && !env.extensionTestsPath /* do not open a browser when we run tests */) {
                this.welcomePageURL = env.welcomePage;
                this.handleWelcome();
            }
        }
        AbstractGettingStarted.prototype.handleWelcome = function () {
            var _this = this;
            var firstStartup = !this.storageService.get(AbstractGettingStarted.hideWelcomeSettingskey);
            if (firstStartup && this.welcomePageURL) {
                this.telemetryService.getTelemetryInfo().then(function (info) {
                    var url = _this.getUrl(info);
                    _this.openExternal(url);
                    _this.storageService.store(AbstractGettingStarted.hideWelcomeSettingskey, true);
                });
            }
        };
        AbstractGettingStarted.prototype.getUrl = function (telemetryInfo) {
            return this.welcomePageURL + "&&from=" + this.appName + "&&id=" + telemetryInfo.machineId;
        };
        AbstractGettingStarted.prototype.openExternal = function (url) {
            throw new Error('implement me');
        };
        AbstractGettingStarted.prototype.getId = function () {
            return 'vs.gettingstarted';
        };
        AbstractGettingStarted.hideWelcomeSettingskey = 'workbench.hide.welcome';
        AbstractGettingStarted = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, contextService_1.IWorkspaceContextService),
            __param(2, telemetry_1.ITelemetryService)
        ], AbstractGettingStarted);
        return AbstractGettingStarted;
    }());
    exports.AbstractGettingStarted = AbstractGettingStarted;
});
//# sourceMappingURL=abstractGettingStarted.js.map