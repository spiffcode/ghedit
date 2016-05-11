/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    // Sort of forked from c212f0908f3d29933317bbc3233568fbca7944b1:./vs/workbench/services/statusbar/common/statusbarService.ts
    'use strict';
    exports.INavbarService = instantiation_1.createDecorator('forked/navbarService');
    (function (NavbarAlignment) {
        NavbarAlignment[NavbarAlignment["LEFT"] = 0] = "LEFT";
        NavbarAlignment[NavbarAlignment["RIGHT"] = 1] = "RIGHT";
    })(exports.NavbarAlignment || (exports.NavbarAlignment = {}));
    var NavbarAlignment = exports.NavbarAlignment;
});
//# sourceMappingURL=navbarService.js.map