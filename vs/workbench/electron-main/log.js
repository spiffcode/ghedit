/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/platform/instantiation/common/instantiation', './env'], function (require, exports, instantiation_1, env_1) {
    'use strict';
    exports.ILogService = instantiation_1.createDecorator('logService');
    var MainLogService = (function () {
        function MainLogService(envService) {
            this.envService = envService;
            this.serviceId = exports.ILogService;
        }
        MainLogService.prototype.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var verboseLogging = this.envService.cliArgs.verboseLogging;
            if (verboseLogging) {
                console.log.apply(console, ["(" + new Date().toLocaleTimeString() + ")"].concat(args));
            }
        };
        MainLogService = __decorate([
            __param(0, env_1.IEnvironmentService)
        ], MainLogService);
        return MainLogService;
    }());
    exports.MainLogService = MainLogService;
});
//# sourceMappingURL=log.js.map