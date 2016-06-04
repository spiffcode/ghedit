/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
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
define(["require", "exports", 'vs/base/common/json', 'vs/base/common/objects', 'vs/base/common/uri', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/files/common/files', 'vs/platform/event/common/event'], function (require, exports, json, objects, uri_1, instantiation_1, contextService_1, files_1, event_1) {
    'use strict';
    exports.ISettingsService = instantiation_1.createDecorator('settingsService');
    var UserSettings = (function () {
        //	constructor(appSettingsPath: string, appKeybindingsPath: string,
        function UserSettings(fileService, eventService, contextService) {
            // this.appSettingsPath = appSettingsPath;
            // this.appKeybindingsPath = appKeybindingsPath;
            this.fileService = fileService;
            this.eventService = eventService;
            this.contextService = contextService;
            //	private timeoutHandle: number;
            //	private watcher: fs.FSWatcher;
            //	private appSettingsPath: string;
            //	private appKeybindingsPath: string;
            //	private _onChange: Emitter<ISettings>;
            this.serviceId = exports.ISettingsService;
            //this._onChange = new Emitter<ISettings>();
            //this.registerWatchers();
            this.globalSettings = {
                settings: {},
                keybindings: []
            };
            this.registerListener();
        }
        /*
            public static getValue(contextService: IWorkspaceContextService, key: string, fallback?: any): TPromise<any> {
                return new TPromise((c, e) => {
                    const appSettingsPath = contextService.getConfiguration().env.appSettingsPath;
        
                    // fs.readFile(appSettingsPath, (error, fileContents) => {
                    this.readSettingsFile(appSettingsPath, (fileContents) => {
                        let root = Object.create(null);
                        let content = fileContents ? fileContents.toString() : '{}';
        
                        let contents = Object.create(null);
                        try {
                            contents = json.parse(content);
                        } catch (error) {
                            // ignore parse problem
                        }
        
                        for (let key in contents) {
                            UserSettings.setNode(root, key, contents[key]);
                        }
        
                        return c(UserSettings.doGetValue(root, key, fallback));
                    });
                });
            }
        */
        /*
            public get onChange(): Event<ISettings> {
                return this._onChange.event;
            }
        */
        /*
            public getValue(key: string, fallback?: any): any {
                return UserSettings.doGetValue(this.globalSettings.settings, key, fallback);
            }
        */
        /*
            private static doGetValue(globalSettings: any, key: string, fallback?: any): any {
                if (!key) {
                    return fallback;
                }
        
                let value = globalSettings;
        
                let parts = key.split('\.');
                while (parts.length && value) {
                    let part = parts.shift();
                    value = value[part];
                }
        
                return typeof value !== 'undefined' ? value : fallback;
            }
        */
        /*
            private registerWatchers(): void {
                this.watcher = fs.watch(path.dirname(this.appSettingsPath));
                this.watcher.on('change', (eventType: string, fileName: string) => this.onSettingsFileChange(eventType, fileName));
            }
        
            private onSettingsFileChange(eventType: string, fileName: string): void {
        
                // we can get multiple change events for one change, so we buffer through a timeout
                if (this.timeoutHandle) {
                    global.clearTimeout(this.timeoutHandle);
                    this.timeoutHandle = null;
                }
        
                this.timeoutHandle = global.setTimeout(() => {
        
                    // Reload
                    let didChange = this.loadSync();
        
                    // Emit event
                    if (didChange) {
                        this._onChange.fire(this.globalSettings);
                    }
        
                }, UserSettings.CHANGE_BUFFER_DELAY);
            }
        */
        /*
            public loadSync(): boolean {
                let loadedSettings = this.doLoadSync();
                if (!objects.equals(loadedSettings, this.globalSettings)) {
        
                    // Keep in class
                    this.globalSettings = loadedSettings;
        
                    return true; // changed value
                }
        
                return false; // no changed value
            }
        */
        /*
            private doLoadSync(): ISettings {
                let settings = this.doLoadSettingsSync();
        
                return {
                    settings: settings.contents,
                    settingsParseErrors: settings.parseErrors,
                    keybindings: this.doLoadKeybindingsSync()
                };
            }
        */
        /*
            private doLoadSettingsSync(): { contents: any; parseErrors?: string[]; } {
                let root = Object.create(null);
                let content = '{}';
                try {
                    // content = fs.readFileSync(this.appSettingsPath).toString();
                    content = this.readTextFileSync(this.appSettingsPath);
                } catch (error) {
                    // ignore
                }
        
                let contents = Object.create(null);
                try {
                    contents = json.parse(content);
                } catch (error) {
                    // parse problem
                    return {
                        contents: Object.create(null),
                        parseErrors: [this.appSettingsPath]
                    };
                }
        
                for (let key in contents) {
                    UserSettings.setNode(root, key, contents[key]);
                }
        
                return {
                    contents: root
                };
            }
        */
        // private static setNode(root: any, key: string, value: any): any {
        UserSettings.prototype.setNode = function (root, key, value) {
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
        /*
            private doLoadKeybindingsSync(): any {
                try {
                    return json.parse(fs.readFileSync(this.appKeybindingsPath).toString());
                } catch (error) {
                    // Ignore loading and parsing errors
                }
        
                return [];
            }
        */
        /*
            public dispose(): void {
                if (this.watcher) {
                    this.watcher.close();
                    this.watcher = null;
                }
            }
        */
        UserSettings.prototype.loadSettings = function () {
            // TODO: restructure the below as a composite Promise using Promise.join(),
            // so that one notification broadcast can occur after loading both settings and keybindings.
            // See https://blogs.msdn.microsoft.com/windowsappdev/2013/06/11/all-about-promises-for-windows-store-apps-written-in-javascript/
            // to get the sequencing correct.
            var _this = this;
            // Load settings json
            var appSettingsPath = this.contextService.getConfiguration().env.appSettingsPath;
            if (appSettingsPath) {
                this.fileService.resolveContent(uri_1.default.file(appSettingsPath), { acceptTextOnly: true }).then(function (settingsContent) {
                    var settings = {};
                    var settingsParseErrors = [];
                    // Parse settings. The loop turns it into a dictionary tree, which is the runtime format.
                    try {
                        var contents = json.parse(settingsContent.value);
                        for (var key in contents) {
                            _this.setNode(settings, key, contents[key]);
                        }
                    }
                    catch (error) {
                        settingsParseErrors.push(appSettingsPath);
                    }
                    // Update settings.
                    setTimeout(function () {
                        _this.updateSettingsKey('settings', settings);
                        if (settingsParseErrors) {
                            _this.updateSettingsKey('settingsParseErrors', settingsParseErrors);
                        }
                    }, 0);
                }, function (error) {
                    // console.log('UserSettings error loading: ' + appSettingsPath)
                });
            }
            // Load keybindings json
            var appKeybindingsPath = this.contextService.getConfiguration().env.appKeybindingsPath;
            if (appKeybindingsPath != null) {
                this.fileService.resolveContent(uri_1.default.file(appKeybindingsPath), { acceptTextOnly: true }).then(function (keyBindingsContent) {
                    var keybindings = [];
                    try {
                        keybindings = json.parse(keyBindingsContent.value);
                    }
                    catch (error) {
                    }
                    // Update settings.
                    if (keybindings) {
                        setTimeout(function () { return _this.updateSettingsKey('keybindings', keybindings); }, 0);
                    }
                }, function (error) {
                    // console.log('UserSettings error loading: ' + appKeybindingsPath)
                });
            }
        };
        UserSettings.prototype.updateSettingsKey = function (key, value) {
            if (!this.globalSettings.hasOwnProperty(key) || !objects.equals(this.globalSettings[key], value)) {
                this.globalSettings[key] = value;
                this.contextService.updateOptions('globalSettings', this.globalSettings);
            }
        };
        UserSettings.prototype.registerListener = function () {
            var _this = this;
            this.eventService.addListener("settingsFileChanged", function () {
                _this.loadSettings();
            });
        };
        UserSettings = __decorate([
            __param(0, files_1.IFileService),
            __param(1, event_1.IEventService),
            __param(2, contextService_1.IWorkspaceContextService)
        ], UserSettings);
        return UserSettings;
    }());
    exports.UserSettings = UserSettings;
});
//# sourceMappingURL=userSettings.js.map