define(["require", "exports", 'vs/base/parts/ipc/node/ipc.cp', './testService'], function (require, exports, ipc_cp_1, testService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var server = new ipc_cp_1.Server();
    var service = new testService_1.TestService();
    server.registerChannel('test', new testService_1.TestChannel(service));
});
//# sourceMappingURL=testApp.js.map