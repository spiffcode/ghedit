var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/events', 'vs/platform/instantiation/common/instantiation'], function (require, exports, events_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.ID = 'storageService';
    exports.IStorageService = instantiation_1.createDecorator(exports.ID);
    var StorageEventType;
    (function (StorageEventType) {
        /**
         * Event type for when a storage value is changed.
         */
        StorageEventType.STORAGE = 'storage';
    })(StorageEventType = exports.StorageEventType || (exports.StorageEventType = {}));
    /**
     * Storage events are being emitted when user settings change which are persisted to local storage.
     */
    var StorageEvent = (function (_super) {
        __extends(StorageEvent, _super);
        function StorageEvent(key, before, after, originalEvent) {
            _super.call(this, key, before, after, originalEvent);
        }
        /**
         * Returns true if the storage change has occurred from this browser window and false if its coming from a different window.
         */
        StorageEvent.prototype.isLocal = function () {
            // By the spec a storage event is only ever emitted if it occurs from a different browser tab or window
            // so we can use the check for originalEvent being set or not as a way to find out if the event is local or not.
            return !this.originalEvent;
        };
        return StorageEvent;
    }(events_1.PropertyChangeEvent));
    exports.StorageEvent = StorageEvent;
    (function (StorageScope) {
        /**
         * The stored data will be scoped to all workspaces of this domain.
         */
        StorageScope[StorageScope["GLOBAL"] = 0] = "GLOBAL";
        /**
         * The stored data will be scoped to the current workspace.
         */
        StorageScope[StorageScope["WORKSPACE"] = 1] = "WORKSPACE";
    })(exports.StorageScope || (exports.StorageScope = {}));
    var StorageScope = exports.StorageScope;
});
//# sourceMappingURL=storage.js.map