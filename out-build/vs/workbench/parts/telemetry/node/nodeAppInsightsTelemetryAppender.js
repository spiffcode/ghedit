var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/errors', 'vs/platform/storage/common/storage', 'vs/platform/workspace/common/workspace', 'vs/base/node/aiAdapter', 'winreg', 'os'], function (require, exports, errors, storage_1, workspace_1, aiAdapter_1, winreg, os) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var StorageKeys = (function () {
        function StorageKeys() {
        }
        StorageKeys.sqmUserId = 'telemetry.sqm.userId';
        StorageKeys.sqmMachineId = 'telemetry.sqm.machineId';
        StorageKeys.lastSessionDate = 'telemetry.lastSessionDate';
        StorageKeys.firstSessionDate = 'telemetry.firstSessionDate';
        return StorageKeys;
    }());
    var NodeAppInsightsTelemetryAppender = (function () {
        function NodeAppInsightsTelemetryAppender(storageService, contextService, 
            /* for test only */
            client) {
            this.commonProperties = {};
            this.commonMetrics = {};
            this.contextService = contextService;
            this.storageService = storageService;
            var config = this.contextService.getConfiguration().env.aiConfig;
            var key = config ? config.key : null;
            var asimovKey = config ? config.asimovKey : null;
            // for test
            if (client) {
                this.appInsights = client;
                if (asimovKey) {
                    this.appInsightsVortex = client;
                }
                return;
            }
            if (key) {
                this.appInsights = new aiAdapter_1.AIAdapter(key, NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX);
            }
            if (asimovKey) {
                this.appInsightsVortex = new aiAdapter_1.AIAdapter(asimovKey, NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX);
            }
            this.loadAddtionaProperties();
        }
        NodeAppInsightsTelemetryAppender.prototype.loadAddtionaProperties = function () {
            var _this = this;
            // add shell & render version
            if (process.versions) {
                this.commonProperties['version.shell'] = process.versions['electron'];
                this.commonProperties['version.renderer'] = process.versions['chrome'];
            }
            // add SQM data for windows machines
            if (process.platform === 'win32') {
                var sqmUserId = this.storageService.get(StorageKeys.sqmUserId);
                if (sqmUserId) {
                    this.commonProperties['sqm.userid'] = sqmUserId;
                }
                else {
                    this.getWinRegKeyData(NodeAppInsightsTelemetryAppender.SQM_KEY, 'UserId', winreg.HKCU, function (error, result) {
                        if (!error && result) {
                            _this.commonProperties['sqm.userid'] = result;
                            _this.storageService.store(StorageKeys.sqmUserId, result);
                        }
                    });
                }
                var sqmMachineId = this.storageService.get(StorageKeys.sqmMachineId);
                if (sqmMachineId) {
                    this.commonProperties['sqm.machineid'] = sqmMachineId;
                }
                else {
                    this.getWinRegKeyData(NodeAppInsightsTelemetryAppender.SQM_KEY, 'MachineId', winreg.HKLM, function (error, result) {
                        if (!error && result) {
                            _this.commonProperties['sqm.machineid'] = result;
                            _this.storageService.store(StorageKeys.sqmMachineId, result);
                        }
                    });
                }
            }
            var firstSessionDate = this.storageService.get(StorageKeys.firstSessionDate);
            if (!firstSessionDate) {
                firstSessionDate = (new Date()).toUTCString();
                this.storageService.store(StorageKeys.firstSessionDate, firstSessionDate);
            }
            this.commonProperties['firstSessionDate'] = firstSessionDate;
            //report last session date and isNewSession flag
            var lastSessionDate = this.storageService.get(StorageKeys.lastSessionDate);
            if (!lastSessionDate) {
                this.commonMetrics['isNewSession'] = 1;
            }
            else {
                this.commonMetrics['isNewSession'] = 0;
                this.commonProperties['lastSessionDate'] = lastSessionDate;
            }
            this.storageService.store(StorageKeys.lastSessionDate, (new Date()).toUTCString());
            if (os) {
                this.commonProperties['osVersion'] = os.release();
            }
        };
        NodeAppInsightsTelemetryAppender.prototype.getWinRegKeyData = function (key, name, hive, callback) {
            if (process.platform === 'win32') {
                try {
                    var reg = new winreg({
                        hive: hive,
                        key: key
                    });
                    reg.get(name, function (e, result) {
                        if (e || !result) {
                            callback(e, null);
                        }
                        else {
                            callback(null, result.value);
                        }
                    });
                }
                catch (err) {
                    errors.onUnexpectedError(err);
                    callback(err, null);
                }
            }
            else {
                callback(null, null);
            }
        };
        NodeAppInsightsTelemetryAppender.prototype.log = function (eventName, data) {
            data = data || Object.create(null);
            data = this.addCommonMetrics(data);
            data = this.addCommonProperties(data);
            if (this.appInsights) {
                this.appInsights.log(eventName, data);
            }
            if (this.appInsightsVortex) {
                this.appInsightsVortex.log(eventName, data);
            }
        };
        NodeAppInsightsTelemetryAppender.prototype.dispose = function () {
            if (this.appInsights) {
                this.appInsights.dispose();
            }
            if (this.appInsightsVortex) {
                this.appInsightsVortex.dispose();
            }
            this.appInsights = null;
            this.appInsightsVortex = null;
        };
        NodeAppInsightsTelemetryAppender.prototype.addCommonProperties = function (properties) {
            for (var prop in this.commonProperties) {
                properties['common.' + prop] = this.commonProperties[prop];
            }
            return properties;
        };
        NodeAppInsightsTelemetryAppender.prototype.addCommonMetrics = function (metrics) {
            for (var prop in this.commonMetrics) {
                metrics['common.' + prop] = this.commonMetrics[prop];
            }
            return metrics;
        };
        NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX = 'monacoworkbench';
        NodeAppInsightsTelemetryAppender.SQM_KEY = '\\Software\\Microsoft\\SQMClient';
        NodeAppInsightsTelemetryAppender = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, workspace_1.IWorkspaceContextService)
        ], NodeAppInsightsTelemetryAppender);
        return NodeAppInsightsTelemetryAppender;
    }());
    exports.NodeAppInsightsTelemetryAppender = NodeAppInsightsTelemetryAppender;
});
//# sourceMappingURL=nodeAppInsightsTelemetryAppender.js.map