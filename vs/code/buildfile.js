/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";function createModuleDescription(e,c){var o={},r=["vs/css","vs/nls"];return o.name=e,Array.isArray(c)&&c.length>0&&(r=r.concat(c)),o.exclude=r,o}exports.collectModules=function(){return[createModuleDescription("vs/code/electron-main/main",[]),createModuleDescription("vs/code/node/cli",[]),createModuleDescription("vs/code/node/cliProcessMain",["vs/code/node/cli"]),createModuleDescription("vs/code/node/sharedProcessMain",[])]};