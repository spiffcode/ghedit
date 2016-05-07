/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/node/service.cp', 'vs/workbench/services/search/node/rawSearchService'], function (require, exports, service_cp_1, rawSearchService_1) {
    'use strict';
    var server = new service_cp_1.Server();
    server.registerService('SearchService', new rawSearchService_1.SearchService());
});
//# sourceMappingURL=searchApp.js.map