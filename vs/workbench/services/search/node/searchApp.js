/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/parts/ipc/node/ipc.cp', './searchIpc', './rawSearchService'], function (require, exports, ipc_cp_1, searchIpc_1, rawSearchService_1) {
    'use strict';
    var server = new ipc_cp_1.Server();
    var service = new rawSearchService_1.SearchService();
    var channel = new searchIpc_1.SearchChannel(service);
    server.registerChannel('search', channel);
});
//# sourceMappingURL=searchApp.js.map