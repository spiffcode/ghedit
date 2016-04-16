/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'path', 'fs', 'events', 'vs/workbench/electron-main/env'], function (require, exports, path, fs, events, env) {
    'use strict';
    var dbPath = path.join(env.appHome, 'storage.json');
    var database = null;
    var EventTypes = {
        STORE: 'store'
    };
    var eventEmitter = new events.EventEmitter();
    function onStore(clb) {
        eventEmitter.addListener(EventTypes.STORE, clb);
        return function () { return eventEmitter.removeListener(EventTypes.STORE, clb); };
    }
    exports.onStore = onStore;
    function getItem(key, defaultValue) {
        if (!database) {
            database = load();
        }
        var res = database[key];
        if (typeof res === 'undefined') {
            return defaultValue;
        }
        return database[key];
    }
    exports.getItem = getItem;
    function setItem(key, data) {
        if (!database) {
            database = load();
        }
        // Shortcut for primitives that did not change
        if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
            if (database[key] === data) {
                return;
            }
        }
        var oldValue = database[key];
        database[key] = data;
        save();
        eventEmitter.emit(EventTypes.STORE, key, oldValue, data);
    }
    exports.setItem = setItem;
    function removeItem(key) {
        if (!database) {
            database = load();
        }
        if (database[key]) {
            var oldValue = database[key];
            delete database[key];
            save();
            eventEmitter.emit(EventTypes.STORE, key, oldValue, null);
        }
    }
    exports.removeItem = removeItem;
    function load() {
        try {
            return JSON.parse(fs.readFileSync(dbPath).toString());
        }
        catch (error) {
            if (env.cliArgs.verboseLogging) {
                console.error(error);
            }
            return {};
        }
    }
    function save() {
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 4));
    }
});
//# sourceMappingURL=storage.js.map