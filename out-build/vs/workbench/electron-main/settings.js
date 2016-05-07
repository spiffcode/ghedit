/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'electron', 'vs/workbench/electron-main/env', 'vs/workbench/node/userSettings'], function (require, exports, electron_1, env, userSettings_1) {
    'use strict';
    var SettingsManager = (function (_super) {
        __extends(SettingsManager, _super);
        function SettingsManager() {
            var _this = this;
            _super.call(this, env.appSettingsPath, env.appKeybindingsPath);
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
        return SettingsManager;
    }(userSettings_1.UserSettings));
    exports.SettingsManager = SettingsManager;
    exports.manager = new SettingsManager();
});
//# sourceMappingURL=settings.js.map