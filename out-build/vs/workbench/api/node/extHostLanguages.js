var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/platform/thread/common/thread', 'vs/editor/common/services/modeService'], function (require, exports, winjs_base_1, thread_1, modeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostLanguages = (function () {
        function ExtHostLanguages(threadService) {
            this._proxy = threadService.getRemotable(MainThreadLanguages);
        }
        ExtHostLanguages.prototype.getLanguages = function () {
            return this._proxy._getLanguages();
        };
        ExtHostLanguages = __decorate([
            __param(0, thread_1.IThreadService)
        ], ExtHostLanguages);
        return ExtHostLanguages;
    }());
    exports.ExtHostLanguages = ExtHostLanguages;
    var MainThreadLanguages = (function () {
        function MainThreadLanguages(modeService) {
            this._modeService = modeService;
        }
        MainThreadLanguages.prototype._getLanguages = function () {
            return winjs_base_1.TPromise.as(this._modeService.getRegisteredModes());
        };
        MainThreadLanguages = __decorate([
            thread_1.Remotable.MainContext('MainThreadLanguages'),
            __param(0, modeService_1.IModeService)
        ], MainThreadLanguages);
        return MainThreadLanguages;
    }());
    exports.MainThreadLanguages = MainThreadLanguages;
});
//# sourceMappingURL=extHostLanguages.js.map