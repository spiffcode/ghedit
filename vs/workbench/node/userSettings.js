/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'fs', 'path', 'vs/base/common/json', 'vs/base/common/objects', 'vs/base/common/winjs.base', 'vs/base/common/event'], function (require, exports, fs, path, json, objects, winjs_base_1, event_1) {
    'use strict';
    var UserSettings = (function () {
        function UserSettings(appSettingsPath, appKeybindingsPath) {
            this.appSettingsPath = appSettingsPath;
            this.appKeybindingsPath = appKeybindingsPath;
            this._onChange = new event_1.Emitter();
            this.registerWatchers();
        }
        UserSettings.getValue = function (contextService, key, fallback) {
            return new winjs_base_1.TPromise(function (c, e) {
                var appSettingsPath = contextService.getConfiguration().env.appSettingsPath;
                fs.readFile(appSettingsPath, function (error /* ignore */, fileContents) {
                    var root = Object.create(null);
                    var content = fileContents ? fileContents.toString() : '{}';
                    var contents = Object.create(null);
                    try {
                        contents = json.parse(content);
                    }
                    catch (error) {
                    }
                    for (var key_1 in contents) {
                        UserSettings.setNode(root, key_1, contents[key_1]);
                    }
                    return c(UserSettings.doGetValue(root, key, fallback));
                });
            });
        };
        Object.defineProperty(UserSettings.prototype, "onChange", {
            get: function () {
                return this._onChange.event;
            },
            enumerable: true,
            configurable: true
        });
        UserSettings.prototype.getValue = function (key, fallback) {
            return UserSettings.doGetValue(this.globalSettings.settings, key, fallback);
        };
        UserSettings.doGetValue = function (globalSettings, key, fallback) {
            if (!key) {
                return fallback;
            }
            var value = globalSettings;
            var parts = key.split('\.');
            while (parts.length && value) {
                var part = parts.shift();
                value = value[part];
            }
            return typeof value !== 'undefined' ? value : fallback;
        };
        UserSettings.prototype.registerWatchers = function () {
            var _this = this;
            this.watcher = fs.watch(path.dirname(this.appSettingsPath));
            this.watcher.on('change', function (eventType, fileName) { return _this.onSettingsFileChange(eventType, fileName); });
        };
        UserSettings.prototype.onSettingsFileChange = function (eventType, fileName) {
            var _this = this;
            // we can get multiple change events for one change, so we buffer through a timeout
            if (this.timeoutHandle) {
                global.clearTimeout(this.timeoutHandle);
                this.timeoutHandle = null;
            }
            this.timeoutHandle = global.setTimeout(function () {
                // Reload
                var didChange = _this.loadSync();
                // Emit event
                if (didChange) {
                    _this._onChange.fire(_this.globalSettings);
                }
            }, UserSettings.CHANGE_BUFFER_DELAY);
        };
        UserSettings.prototype.loadSync = function () {
            var loadedSettings = this.doLoadSync();
            if (!objects.equals(loadedSettings, this.globalSettings)) {
                // Keep in class
                this.globalSettings = loadedSettings;
                return true; // changed value
            }
            return false; // no changed value
        };
        UserSettings.prototype.doLoadSync = function () {
            var settings = this.doLoadSettingsSync();
            return {
                settings: settings.contents,
                settingsParseErrors: settings.parseErrors,
                keybindings: this.doLoadKeybindingsSync()
            };
        };
        UserSettings.prototype.doLoadSettingsSync = function () {
            var root = Object.create(null);
            var content = '{}';
            try {
                content = fs.readFileSync(this.appSettingsPath).toString();
            }
            catch (error) {
            }
            var contents = Object.create(null);
            try {
                contents = json.parse(content);
            }
            catch (error) {
                // parse problem
                return {
                    contents: Object.create(null),
                    parseErrors: [this.appSettingsPath]
                };
            }
            for (var key in contents) {
                UserSettings.setNode(root, key, contents[key]);
            }
            return {
                contents: root
            };
        };
        UserSettings.setNode = function (root, key, value) {
            var segments = key.split('.');
            var last = segments.pop();
            var curr = root;
            segments.forEach(function (s) {
                var obj = curr[s];
                switch (typeof obj) {
                    case 'undefined':
                        obj = curr[s] = {};
                        break;
                    case 'object':
                        break;
                    default:
                        console.log('Conflicting user settings: ' + key + ' at ' + s + ' with ' + JSON.stringify(obj));
                }
                curr = obj;
            });
            curr[last] = value;
        };
        UserSettings.prototype.doLoadKeybindingsSync = function () {
            try {
                return json.parse(fs.readFileSync(this.appKeybindingsPath).toString());
            }
            catch (error) {
            }
            return [];
        };
        UserSettings.prototype.dispose = function () {
            if (this.watcher) {
                this.watcher.close();
                this.watcher = null;
            }
        };
        UserSettings.CHANGE_BUFFER_DELAY = 300;
        return UserSettings;
    }());
    exports.UserSettings = UserSettings;
});
//# sourceMappingURL=userSettings.js.map