define(["require","exports","vs/base/parts/ipc/node/ipc.cp","vs/workbench/services/files/node/watcher/unix/watcherIpc","vs/workbench/services/files/node/watcher/unix/chokidarWatcherService"],function(e,r,c,i,n){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";var s=new c.Server,a=new n.ChokidarWatcherService,h=new i.WatcherChannel(a);s.registerChannel("watcher",h)});