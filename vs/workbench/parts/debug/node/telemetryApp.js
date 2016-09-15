/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/base/parts/ipc/node/ipc.cp","vs/platform/telemetry/node/appInsightsAppender","vs/platform/telemetry/common/telemetryIpc"],function(e,r,p,s,n){"use strict";var t=new s.AppInsightsAppender(process.argv[2],JSON.parse(process.argv[3]),process.argv[4]);process.once("exit",function(){return t.dispose()});var o=new n.TelemetryAppenderChannel(t),a=new p.Server;a.registerChannel("telemetryAppender",o)});