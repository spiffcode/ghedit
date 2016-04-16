define(["require", "exports", 'vs/base/node/service.cp', 'vs/base/test/node/service/testService'], function (require, exports, service_cp_1, testService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var server = new service_cp_1.Server();
    server.registerService('TestService', new testService_1.TestService());
});
//# sourceMappingURL=testApp.js.map