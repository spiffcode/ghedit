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
define(["require", "exports", 'getmac', 'crypto', 'vs/base/common/winjs.base', 'vs/nls!vs/platform/telemetry/electron-browser/electronTelemetryService', 'vs/base/common/errors', 'vs/base/common/uuid', 'vs/platform/telemetry/browser/telemetryService', 'vs/platform/storage/common/storage', 'vs/platform/configuration/common/configurationRegistry', 'vs/platform/configuration/common/configuration', 'vs/platform/platform'], function (require, exports, getmac, crypto, winjs_base_1, nls, errors, uuid, telemetryService_1, storage_1, configurationRegistry_1, configuration_1, platform_1) {
    "use strict";
    var TELEMETRY_SECTION_ID = 'telemetry';
    var StorageKeys;
    (function (StorageKeys) {
        StorageKeys.MachineId = 'telemetry.machineId';
        StorageKeys.InstanceId = 'telemetry.instanceId';
    })(StorageKeys || (StorageKeys = {}));
    var ElectronTelemetryService = (function (_super) {
        __extends(ElectronTelemetryService, _super);
        function ElectronTelemetryService(_configurationService, _storageService, configuration) {
            _super.call(this, configuration);
            this._configurationService = _configurationService;
            this._storageService = _storageService;
            this._telemetryInfoPromise = this._setupTelemetryInfo();
            this._updateUserOptIn();
            this._configurationService.onDidUpdateConfiguration(this._updateUserOptIn, this, this._disposables);
            this.publicLog('optInStatus', { optIn: this._configuration.userOptIn });
        }
        ElectronTelemetryService.prototype._updateUserOptIn = function () {
            var config = this._configurationService.getConfiguration(TELEMETRY_SECTION_ID);
            this._configuration.userOptIn = config ? config.enableTelemetry : this._configuration.userOptIn;
        };
        ElectronTelemetryService.prototype.getTelemetryInfo = function () {
            return this._telemetryInfoPromise;
        };
        ElectronTelemetryService.prototype._setupTelemetryInfo = function () {
            var _this = this;
            var instanceId, machineId;
            return new winjs_base_1.TPromise(function (resolve) {
                // (1) instance identifier (from storage or fresh)
                instanceId = _this._storageService.get(StorageKeys.InstanceId) || uuid.generateUuid();
                _this._storageService.store(StorageKeys.InstanceId, instanceId);
                // (2) machine identifier (from stroage or fresh)
                machineId = _this._storageService.get(StorageKeys.MachineId);
                if (machineId) {
                    return resolve(_this);
                }
                // add a unique machine id as a hash of the macAddress
                try {
                    getmac.getMac(function (error, macAddress) {
                        if (!error) {
                            // crypt machine id
                            machineId = crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
                        }
                        else {
                            machineId = uuid.generateUuid(); // fallback, generate a UUID
                        }
                        _this._telemetryInfo.machineId = machineId;
                        _this._storageService.store(StorageKeys.MachineId, machineId);
                        resolve(_this);
                    });
                }
                catch (err) {
                    errors.onUnexpectedError(err);
                    machineId = uuid.generateUuid(); // fallback, generate a UUID
                    _this._storageService.store(StorageKeys.MachineId, machineId);
                    resolve(_this);
                }
            }).then(function () {
                _this._telemetryInfo.instanceId = instanceId;
                _this._telemetryInfo.machineId = machineId;
                return _this._telemetryInfo;
            });
        };
        ElectronTelemetryService = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, storage_1.IStorageService)
        ], ElectronTelemetryService);
        return ElectronTelemetryService;
    }(telemetryService_1.TelemetryService));
    exports.ElectronTelemetryService = ElectronTelemetryService;
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'id': TELEMETRY_SECTION_ID,
        'order': 20,
        'type': 'object',
        'title': nls.localize(0, null),
        'properties': {
            'telemetry.enableTelemetry': {
                'type': 'boolean',
                'description': nls.localize(1, null),
                'default': true
            }
        }
    });
});
//# sourceMappingURL=electronTelemetryService.js.map