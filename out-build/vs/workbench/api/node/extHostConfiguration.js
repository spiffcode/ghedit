var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/objects', 'vs/base/common/lifecycle', 'vs/platform/thread/common/thread', 'vs/platform/configuration/common/configuration', 'vs/base/common/event'], function (require, exports, objects_1, lifecycle_1, thread_1, configuration_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostConfiguration = (function () {
        function ExtHostConfiguration() {
            this._onDidChangeConfiguration = new event_1.Emitter();
        }
        Object.defineProperty(ExtHostConfiguration.prototype, "onDidChangeConfiguration", {
            get: function () {
                return this._onDidChangeConfiguration && this._onDidChangeConfiguration.event;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostConfiguration.prototype._acceptConfigurationChanged = function (config) {
            this._config = config;
            this._hasConfig = true;
            this._onDidChangeConfiguration.fire(undefined);
        };
        ExtHostConfiguration.prototype.getConfiguration = function (section) {
            if (!this._hasConfig) {
                return;
            }
            var config = section
                ? ExtHostConfiguration._lookUp(section, this._config)
                : this._config;
            var result = config ? objects_1.clone(config) : {};
            // result = Object.freeze(result);
            result.has = function (key) {
                return typeof ExtHostConfiguration._lookUp(key, config) !== 'undefined';
            };
            result.get = function (key, defaultValue) {
                var result = ExtHostConfiguration._lookUp(key, config);
                if (typeof result === 'undefined') {
                    result = defaultValue;
                }
                return result;
            };
            return result;
        };
        ExtHostConfiguration._lookUp = function (section, config) {
            if (!section) {
                return;
            }
            var parts = section.split('.');
            var node = config;
            while (node && parts.length) {
                node = node[parts.shift()];
            }
            return node;
        };
        ExtHostConfiguration = __decorate([
            thread_1.Remotable.ExtHostContext('ExtHostConfiguration')
        ], ExtHostConfiguration);
        return ExtHostConfiguration;
    }());
    exports.ExtHostConfiguration = ExtHostConfiguration;
    var MainThreadConfiguration = (function () {
        function MainThreadConfiguration(configurationService, threadService) {
            var _this = this;
            this._configurationService = configurationService;
            this._proxy = threadService.getRemotable(ExtHostConfiguration);
            this._toDispose = [];
            this._toDispose.push(this._configurationService.addListener2(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) {
                _this._proxy._acceptConfigurationChanged(e.config);
            }));
            this._proxy._acceptConfigurationChanged(this._configurationService.getConfiguration());
        }
        MainThreadConfiguration.prototype.dispose = function () {
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        MainThreadConfiguration = __decorate([
            thread_1.Remotable.MainContext('MainProcessConfigurationServiceHelper'),
            __param(0, configuration_1.IConfigurationService),
            __param(1, thread_1.IThreadService)
        ], MainThreadConfiguration);
        return MainThreadConfiguration;
    }());
    exports.MainThreadConfiguration = MainThreadConfiguration;
});
//# sourceMappingURL=extHostConfiguration.js.map