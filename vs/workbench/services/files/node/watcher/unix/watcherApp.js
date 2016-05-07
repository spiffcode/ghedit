define(["require", "exports", 'vs/base/node/service.cp', 'vs/workbench/services/files/node/watcher/unix/chokidarWatcherService'], function (require, exports, service_cp_1, chokidarWatcherService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var server = new service_cp_1.Server();
    server.registerService('WatcherService', new chokidarWatcherService_1.ChokidarWatcherService());
});
//# sourceMappingURL=watcherApp.js.map