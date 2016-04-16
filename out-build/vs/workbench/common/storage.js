var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/base/common/types', 'vs/base/common/errors', 'vs/base/common/strings', 'vs/platform/storage/common/storage'], function (require, exports, eventEmitter_1, types, errors, strings, storage_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Storage = (function (_super) {
        __extends(Storage, _super);
        function Storage(contextService, globalStorage, workspaceStorage) {
            if (workspaceStorage === void 0) { workspaceStorage = globalStorage; }
            _super.call(this);
            this.serviceId = storage_1.IStorageService;
            var workspace = contextService.getWorkspace();
            this.globalStorage = globalStorage;
            this.workspaceStorage = workspaceStorage;
            this.toUnbind = [];
            // Calculate workspace storage key
            this.workspaceKey = this.getWorkspaceKey(workspace);
            // Make sure to delete all workspace storage if the workspace has been recreated meanwhile
            var workspaceUniqueId = workspace ? workspace.uid : null;
            if (types.isNumber(workspaceUniqueId)) {
                this.cleanupWorkspaceScope(workspaceUniqueId, workspace.name);
            }
        }
        Storage.prototype.getWorkspaceKey = function (workspace) {
            var workspaceUri = null;
            if (workspace && workspace.resource) {
                workspaceUri = workspace.resource.toString();
            }
            return workspaceUri ? this.calculateWorkspaceKey(workspaceUri) : Storage.NO_WORKSPACE_IDENTIFIER;
        };
        Storage.prototype.calculateWorkspaceKey = function (workspaceUrl) {
            var root = 'file:///';
            var index = workspaceUrl.indexOf(root);
            if (index === 0) {
                return strings.rtrim(workspaceUrl.substr(root.length), '/') + '/';
            }
            return workspaceUrl;
        };
        Storage.prototype.cleanupWorkspaceScope = function (workspaceId, workspaceName) {
            var _this = this;
            // Get stored identifier from storage
            var id = this.getInteger(Storage.WORKSPACE_IDENTIFIER, storage_1.StorageScope.WORKSPACE);
            // If identifier differs, assume the workspace got recreated and thus clean all storage for this workspace
            if (types.isNumber(id) && workspaceId !== id) {
                var keyPrefix = this.toStorageKey('', storage_1.StorageScope.WORKSPACE);
                var toDelete = [];
                var length_1 = this.workspaceStorage.length;
                for (var i = 0; i < length_1; i++) {
                    var key = this.workspaceStorage.key(i);
                    if (key.indexOf(Storage.WORKSPACE_PREFIX) < 0) {
                        continue; // ignore stored things that don't belong to storage service or are defined globally
                    }
                    // Check for match on prefix
                    if (key.indexOf(keyPrefix) === 0) {
                        toDelete.push(key);
                    }
                }
                if (toDelete.length > 0) {
                    console.warn('Clearing previous version of local storage for workspace ', workspaceName);
                }
                // Run the delete
                toDelete.forEach(function (keyToDelete) {
                    _this.workspaceStorage.removeItem(keyToDelete);
                });
            }
            // Store workspace identifier now
            if (workspaceId !== id) {
                this.store(Storage.WORKSPACE_IDENTIFIER, workspaceId, storage_1.StorageScope.WORKSPACE);
            }
        };
        Storage.prototype.clear = function () {
            this.globalStorage.clear();
            this.workspaceStorage.clear();
        };
        Storage.prototype.store = function (key, value, scope) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            var storage = (scope === storage_1.StorageScope.GLOBAL) ? this.globalStorage : this.workspaceStorage;
            if (types.isUndefinedOrNull(value)) {
                this.remove(key, scope); // we cannot store null or undefined, in that case we remove the key
                return;
            }
            var storageKey = this.toStorageKey(key, scope);
            var before = storage.getItem(storageKey);
            var after = value.toString();
            // Store
            try {
                storage.setItem(storageKey, value);
            }
            catch (error) {
                errors.onUnexpectedError(error);
            }
            // Emit Event
            if (before !== after) {
                this.emit(storage_1.StorageEventType.STORAGE, new storage_1.StorageEvent(key, before, after));
            }
        };
        Storage.prototype.get = function (key, scope, defaultValue) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            var storage = (scope === storage_1.StorageScope.GLOBAL) ? this.globalStorage : this.workspaceStorage;
            var value = storage.getItem(this.toStorageKey(key, scope));
            if (types.isUndefinedOrNull(value)) {
                return defaultValue;
            }
            return value;
        };
        Storage.prototype.remove = function (key, scope) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            var storage = (scope === storage_1.StorageScope.GLOBAL) ? this.globalStorage : this.workspaceStorage;
            var storageKey = this.toStorageKey(key, scope);
            var before = storage.getItem(storageKey);
            var after = null;
            // Remove
            storage.removeItem(storageKey);
            // Emit Event
            if (before !== after) {
                this.emit(storage_1.StorageEventType.STORAGE, new storage_1.StorageEvent(key, before, after));
            }
        };
        Storage.prototype.swap = function (key, valueA, valueB, scope, defaultValue) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            var value = this.get(key, scope);
            if (types.isUndefinedOrNull(value) && defaultValue) {
                this.store(key, defaultValue, scope);
            }
            else if (value === valueA.toString()) {
                this.store(key, valueB, scope);
            }
            else {
                this.store(key, valueA, scope);
            }
        };
        Storage.prototype.getInteger = function (key, scope, defaultValue) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            var value = this.get(key, scope, defaultValue);
            if (types.isUndefinedOrNull(value)) {
                return defaultValue;
            }
            return parseInt(value, 10);
        };
        Storage.prototype.getBoolean = function (key, scope, defaultValue) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            var value = this.get(key, scope, defaultValue);
            if (types.isUndefinedOrNull(value)) {
                return defaultValue;
            }
            if (types.isString(value)) {
                return value.toLowerCase() === 'true' ? true : false;
            }
            return value ? true : false;
        };
        Storage.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            while (this.toUnbind.length) {
                this.toUnbind.pop()();
            }
        };
        Storage.prototype.toStorageKey = function (key, scope) {
            if (scope === storage_1.StorageScope.GLOBAL) {
                return Storage.GLOBAL_PREFIX + key.toLowerCase();
            }
            return Storage.WORKSPACE_PREFIX + this.workspaceKey + key.toLowerCase();
        };
        Storage.COMMON_PREFIX = 'storage://';
        Storage.GLOBAL_PREFIX = Storage.COMMON_PREFIX + 'global/';
        Storage.WORKSPACE_PREFIX = Storage.COMMON_PREFIX + 'workspace/';
        Storage.WORKSPACE_IDENTIFIER = 'workspaceIdentifier';
        Storage.NO_WORKSPACE_IDENTIFIER = '__$noWorkspace__';
        return Storage;
    }(eventEmitter_1.EventEmitter));
    exports.Storage = Storage;
    // In-Memory Local Storage Implementation
    var InMemoryLocalStorage = (function () {
        function InMemoryLocalStorage() {
            this.store = {};
        }
        Object.defineProperty(InMemoryLocalStorage.prototype, "length", {
            get: function () {
                return Object.keys(this.store).length;
            },
            enumerable: true,
            configurable: true
        });
        InMemoryLocalStorage.prototype.key = function (index) {
            var keys = Object.keys(this.store);
            if (keys.length > index) {
                return keys[index];
            }
            return null;
        };
        InMemoryLocalStorage.prototype.clear = function () {
            this.store = {};
        };
        InMemoryLocalStorage.prototype.setItem = function (key, value) {
            this.store[key] = value.toString();
        };
        InMemoryLocalStorage.prototype.getItem = function (key) {
            var item = this.store[key];
            if (!types.isUndefinedOrNull(item)) {
                return item;
            }
            return null;
        };
        InMemoryLocalStorage.prototype.removeItem = function (key) {
            delete this.store[key];
        };
        return InMemoryLocalStorage;
    }());
    exports.InMemoryLocalStorage = InMemoryLocalStorage;
    exports.inMemoryLocalStorageInstance = new InMemoryLocalStorage();
});
//# sourceMappingURL=storage.js.map