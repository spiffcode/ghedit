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
define(["require", "exports", 'path', 'fs', 'events', 'vs/workbench/electron-main/env', 'vs/platform/instantiation/common/instantiation'], function (require, exports, path, fs, events, env, instantiation_1) {
    'use strict';
    var EventTypes = {
        STORE: 'store'
    };
    exports.IStorageService = instantiation_1.createDecorator('storageService');
    var StorageService = (function () {
        function StorageService(envService) {
            this.envService = envService;
            this.serviceId = exports.IStorageService;
            this.database = null;
            this.eventEmitter = new events.EventEmitter();
            this.dbPath = path.join(envService.appHome, 'storage.json');
        }
        StorageService.prototype.onStore = function (clb) {
            var _this = this;
            this.eventEmitter.addListener(EventTypes.STORE, clb);
            return function () { return _this.eventEmitter.removeListener(EventTypes.STORE, clb); };
        };
        StorageService.prototype.getItem = function (key, defaultValue) {
            if (!this.database) {
                this.database = this.load();
            }
            var res = this.database[key];
            if (typeof res === 'undefined') {
                return defaultValue;
            }
            return this.database[key];
        };
        StorageService.prototype.setItem = function (key, data) {
            if (!this.database) {
                this.database = this.load();
            }
            // Shortcut for primitives that did not change
            if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
                if (this.database[key] === data) {
                    return;
                }
            }
            var oldValue = this.database[key];
            this.database[key] = data;
            this.save();
            this.eventEmitter.emit(EventTypes.STORE, key, oldValue, data);
        };
        StorageService.prototype.removeItem = function (key) {
            if (!this.database) {
                this.database = this.load();
            }
            if (this.database[key]) {
                var oldValue = this.database[key];
                delete this.database[key];
                this.save();
                this.eventEmitter.emit(EventTypes.STORE, key, oldValue, null);
            }
        };
        StorageService.prototype.load = function () {
            try {
                return JSON.parse(fs.readFileSync(this.dbPath).toString());
            }
            catch (error) {
                if (this.envService.cliArgs.verboseLogging) {
                    console.error(error);
                }
                return {};
            }
        };
        StorageService.prototype.save = function () {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.database, null, 4));
        };
        StorageService = __decorate([
            __param(0, env.IEnvironmentService)
        ], StorageService);
        return StorageService;
    }());
    exports.StorageService = StorageService;
});
//# sourceMappingURL=storage.js.map