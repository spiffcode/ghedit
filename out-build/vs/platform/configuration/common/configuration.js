/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    "use strict";
    exports.IConfigurationService = instantiation_1.createDecorator('configurationService');
    var ConfigurationServiceEventTypes = (function () {
        function ConfigurationServiceEventTypes() {
        }
        /**
         * This event happens after configuration is updated either programmatically
         * or through a file change. It will include a IConfigurationServiceEvent
         * object that includes the new config and which section was updated
         * or null if entire config was updated.
         *
         * Subscribers can use the provided updated configuration
         * rather than re-pulling for updates
         */
        ConfigurationServiceEventTypes.UPDATED = 'update';
        return ConfigurationServiceEventTypes;
    }());
    exports.ConfigurationServiceEventTypes = ConfigurationServiceEventTypes;
    function extractSetting(config, settingPath) {
        function accessSetting(config, path) {
            var current = config;
            for (var i = 0; i < path.length; i++) {
                current = current[path[i]];
                if (!current) {
                    return undefined;
                }
            }
            return current;
        }
        var path = settingPath.split('.');
        return accessSetting(config, path);
    }
    exports.extractSetting = extractSetting;
});
//# sourceMappingURL=configuration.js.map