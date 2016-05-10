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
define(["require", "exports", 'electron', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/node/userSettings', 'vs/workbench/electron-main/env'], function (require, exports, electron_1, instantiation_1, userSettings_1, env_1) {
    'use strict';
    exports.ISettingsService = instantiation_1.createDecorator('settingsService');
    var SettingsManager = (function (_super) {
        __extends(SettingsManager, _super);
        function SettingsManager(envService) {
            var _this = this;
            _super.call(this, envService.appSettingsPath, envService.appKeybindingsPath);
            this.serviceId = exports.ISettingsService;
            electron_1.app.on('will-quit', function () {
                _this.dispose();
            });
        }
        SettingsManager.prototype.loadSync = function () {
            var settingsChanged = _super.prototype.loadSync.call(this);
            // Store into global so that any renderer can access the value with remote.getGlobal()
            if (settingsChanged) {
                global.globalSettingsValue = JSON.stringify(this.globalSettings);
            }
            return settingsChanged;
        };
        SettingsManager = __decorate([
            __param(0, env_1.IEnvironmentService)
        ], SettingsManager);
        return SettingsManager;
    }(userSettings_1.UserSettings));
    exports.SettingsManager = SettingsManager;
});
//# sourceMappingURL=settings.js.map