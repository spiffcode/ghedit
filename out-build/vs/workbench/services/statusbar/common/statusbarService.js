/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    'use strict';
    exports.IStatusbarService = instantiation_1.createDecorator('statusbarService');
    (function (StatusbarAlignment) {
        StatusbarAlignment[StatusbarAlignment["LEFT"] = 0] = "LEFT";
        StatusbarAlignment[StatusbarAlignment["RIGHT"] = 1] = "RIGHT";
    })(exports.StatusbarAlignment || (exports.StatusbarAlignment = {}));
    var StatusbarAlignment = exports.StatusbarAlignment;
});
