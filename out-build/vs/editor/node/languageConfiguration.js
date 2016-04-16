var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/editor/node/languageConfiguration', 'vs/base/common/json', 'vs/base/node/pfs', 'vs/editor/common/services/modeService'], function (require, exports, nls, json_1, pfs_1, modeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LanguageConfigurationFileHandler = (function () {
        function LanguageConfigurationFileHandler(modeService) {
            var _this = this;
            this._modeService = modeService;
            this._handleModes(this._modeService.getRegisteredModes());
            this._modeService.onDidAddModes(function (modes) { return _this._handleModes(modes); });
        }
        LanguageConfigurationFileHandler.prototype._handleModes = function (modes) {
            var _this = this;
            modes.forEach(function (modeId) { return _this._handleMode(modeId); });
        };
        LanguageConfigurationFileHandler.prototype._handleMode = function (modeId) {
            var _this = this;
            var disposable = this._modeService.onDidCreateMode(function (mode) {
                if (mode.getId() !== modeId) {
                    return;
                }
                var configurationFiles = _this._modeService.getConfigurationFiles(modeId);
                configurationFiles.forEach(function (configFilePath) { return _this._handleConfigFile(modeId, configFilePath); });
                disposable.dispose();
            });
        };
        LanguageConfigurationFileHandler.prototype._handleConfigFile = function (modeId, configFilePath) {
            var _this = this;
            pfs_1.readFile(configFilePath).then(function (fileContents) {
                var errors = [];
                var configuration = json_1.parse(fileContents.toString(), errors);
                if (errors.length) {
                    console.error(nls.localize(0, null, configFilePath, errors.join('\n')));
                }
                _this._handleConfig(modeId, configuration);
            }, function (err) {
                console.error(err);
            });
        };
        LanguageConfigurationFileHandler.prototype._handleConfig = function (modeId, configuration) {
            var richEditConfig = {};
            if (configuration.comments) {
                richEditConfig.comments = configuration.comments;
            }
            if (configuration.brackets) {
                richEditConfig.brackets = configuration.brackets;
                richEditConfig.__characterPairSupport = {
                    autoClosingPairs: configuration.brackets.map(function (pair) {
                        var open = pair[0], close = pair[1];
                        return { open: open, close: close };
                    })
                };
            }
            this._modeService.registerRichEditSupport(modeId, richEditConfig);
        };
        LanguageConfigurationFileHandler = __decorate([
            __param(0, modeService_1.IModeService)
        ], LanguageConfigurationFileHandler);
        return LanguageConfigurationFileHandler;
    }());
    exports.LanguageConfigurationFileHandler = LanguageConfigurationFileHandler;
});
//# sourceMappingURL=languageConfiguration.js.map