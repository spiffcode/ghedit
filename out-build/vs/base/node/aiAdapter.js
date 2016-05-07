define(["require", "exports", 'vs/base/common/types', 'vs/base/common/objects', 'applicationinsights'], function (require, exports, types, objects_1, appInsights) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var AIAdapter = (function () {
        function AIAdapter(aiKey, eventPrefix, 
            /* for test only */
            client, additionalDataToLog) {
            this.aiKey = aiKey;
            this.eventPrefix = eventPrefix;
            this.additionalDataToLog = additionalDataToLog;
            // for test
            if (client) {
                this.appInsights = client;
                return;
            }
            if (aiKey) {
                // if another client is already initialized
                if (appInsights.client) {
                    this.appInsights = appInsights.getClient(aiKey);
                    // no other way to enable offline mode
                    this.appInsights.channel.setOfflineMode(true);
                }
                else {
                    this.appInsights = appInsights.setup(aiKey)
                        .setAutoCollectRequests(false)
                        .setAutoCollectPerformance(false)
                        .setAutoCollectExceptions(false)
                        .setOfflineMode(true)
                        .start()
                        .client;
                }
                if (aiKey.indexOf('AIF-') === 0) {
                    this.appInsights.config.endpointUrl = 'https://vortex.data.microsoft.com/collect/v1';
                }
                this.setupAIClient(this.appInsights);
            }
        }
        AIAdapter.prototype.setupAIClient = function (client) {
            //prevent App Insights from reporting machine name
            if (client && client.context &&
                client.context.keys && client.context.tags) {
                var machineNameKey = client.context.keys.deviceMachineName;
                client.context.tags[machineNameKey] = '';
            }
        };
        AIAdapter.prototype.getData = function (data) {
            var properties = {};
            var measurements = {};
            var event_data = this.flaten(data);
            for (var prop in event_data) {
                // enforce property names less than 150 char, take the last 150 char
                var propName = prop && prop.length > 150 ? prop.substr(prop.length - 149) : prop;
                var property = event_data[prop];
                if (types.isNumber(property)) {
                    measurements[propName] = property;
                }
                else if (types.isBoolean(property)) {
                    measurements[propName] = property ? 1 : 0;
                }
                else if (types.isString(property)) {
                    //enforce proeprty value to be less than 1024 char, take the first 1024 char
                    var propValue = property && property.length > 1024 ? property.substring(0, 1023) : property;
                    properties[propName] = propValue;
                }
                else if (!types.isUndefined(property) && property !== null) {
                    properties[propName] = property;
                }
            }
            return {
                properties: properties,
                measurements: measurements
            };
        };
        AIAdapter.prototype.flaten = function (obj, order, prefix) {
            if (order === void 0) { order = 0; }
            var result = {};
            var properties = obj ? Object.getOwnPropertyNames(obj) : [];
            for (var i = 0; i < properties.length; i++) {
                var item = properties[i];
                var index = prefix ? prefix + item : item;
                if (types.isArray(obj[item])) {
                    try {
                        result[index] = objects_1.safeStringify(obj[item]);
                    }
                    catch (e) {
                        // workaround for catching the edge case for #18383
                        // safe stringfy should never throw circular object exception
                        result[index] = '[Circular-Array]';
                    }
                }
                else if (obj[item] instanceof Date) {
                    result[index] = obj[item].toISOString();
                }
                else if (types.isObject(obj[item])) {
                    if (order < 2) {
                        var item_result = this.flaten(obj[item], order + 1, index + '.');
                        for (var prop in item_result) {
                            result[prop] = item_result[prop];
                        }
                    }
                    else {
                        try {
                            result[index] = objects_1.safeStringify(obj[item]);
                        }
                        catch (e) {
                            // workaround for catching the edge case for #18383
                            // safe stringfy should never throw circular object exception
                            result[index] = '[Circular]';
                        }
                    }
                }
                else {
                    result[index] = obj[item];
                }
            }
            return result;
        };
        AIAdapter.prototype.log = function (eventName, data) {
            if (this.additionalDataToLog) {
                data = objects_1.mixin(data, this.additionalDataToLog);
            }
            var result = this.getData(data);
            if (this.appInsights) {
                this.appInsights.trackEvent(this.eventPrefix + '/' + eventName, result.properties, result.measurements);
            }
        };
        AIAdapter.prototype.logException = function (exception) {
            if (this.appInsights) {
                this.appInsights.trackException(exception);
            }
        };
        AIAdapter.prototype.dispose = function () {
            this.appInsights = null;
        };
        return AIAdapter;
    }());
    exports.AIAdapter = AIAdapter;
});
//# sourceMappingURL=aiAdapter.js.map