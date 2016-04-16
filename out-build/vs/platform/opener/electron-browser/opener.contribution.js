/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/instantiation/common/extensions', 'vs/platform/opener/electron-browser/openerService', 'vs/platform/opener/common/opener'], function (require, exports, extensions_1, openerService_1, opener_1) {
    'use strict';
    extensions_1.registerSingleton(opener_1.IOpenerService, openerService_1.OpenerService);
});
//# sourceMappingURL=opener.contribution.js.map