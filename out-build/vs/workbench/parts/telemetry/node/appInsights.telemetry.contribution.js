/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/platform', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/parts/telemetry/node/nodeAppInsightsTelemetryAppender'], function (require, exports, Platform, telemetry_1, AppInsightsTelemetryAppender) {
    'use strict';
    Platform.Registry.as(telemetry_1.Extenstions.TelemetryAppenders)
        .registerTelemetryAppenderDescriptor(AppInsightsTelemetryAppender.NodeAppInsightsTelemetryAppender);
});
//# sourceMappingURL=appInsights.telemetry.contribution.js.map