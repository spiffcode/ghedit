/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/platform'], function (require, exports, platform_1) {
    'use strict';
    // Telemetry endpoint (used in the standalone editor) for hosts that want to collect editor telemetry
    exports.standaloneEditorTelemetryEndpoint = environment('telemetryEndpoint', null);
    // Option for hosts to overwrite the worker script url (used in the standalone editor)
    exports.getCrossOriginWorkerScriptUrl = environment('getWorkerUrl', null);
    function environment(name, fallback) {
        if (fallback === void 0) { fallback = false; }
        if (platform_1.globals.GlobalEnvironment && platform_1.globals.GlobalEnvironment.hasOwnProperty(name)) {
            return platform_1.globals.GlobalEnvironment[name];
        }
        return fallback;
    }
    function workersCount(defaultCount) {
        return environment('workersCount', defaultCount);
    }
    exports.workersCount = workersCount;
});
//# sourceMappingURL=flags.js.map