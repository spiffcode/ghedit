var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/platform/files/common/files', 'vs/platform/thread/common/thread', 'vs/base/common/event', './extHostTypes', 'vs/platform/event/common/event', 'vs/base/common/async', 'vs/base/common/glob'], function (require, exports, files_1, thread_1, event_1, extHostTypes_1, event_2, async_1, glob_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FileSystemWatcher = (function () {
        function FileSystemWatcher(dispatcher, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            var _this = this;
            this._onDidCreate = new event_1.Emitter();
            this._onDidChange = new event_1.Emitter();
            this._onDidDelete = new event_1.Emitter();
            this._config = 0;
            if (!ignoreCreateEvents) {
                this._config += 1;
            }
            if (!ignoreChangeEvents) {
                this._config += 2;
            }
            if (!ignoreDeleteEvents) {
                this._config += 4;
            }
            var subscription = dispatcher(function (events) {
                if (!ignoreCreateEvents) {
                    for (var _i = 0, _a = events.created; _i < _a.length; _i++) {
                        var created = _a[_i];
                        if (glob_1.match(globPattern, created.fsPath)) {
                            _this._onDidCreate.fire(created);
                        }
                    }
                }
                if (!ignoreChangeEvents) {
                    for (var _b = 0, _c = events.changed; _b < _c.length; _b++) {
                        var changed = _c[_b];
                        if (glob_1.match(globPattern, changed.fsPath)) {
                            _this._onDidChange.fire(changed);
                        }
                    }
                }
                if (!ignoreDeleteEvents) {
                    for (var _d = 0, _e = events.deleted; _d < _e.length; _d++) {
                        var deleted = _e[_d];
                        if (glob_1.match(globPattern, deleted.fsPath)) {
                            _this._onDidDelete.fire(deleted);
                        }
                    }
                }
            });
            this._disposable = extHostTypes_1.Disposable.from(this._onDidCreate, this._onDidChange, this._onDidDelete, subscription);
        }
        Object.defineProperty(FileSystemWatcher.prototype, "ignoreCreateEvents", {
            get: function () {
                return Boolean(this._config & 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemWatcher.prototype, "ignoreChangeEvents", {
            get: function () {
                return Boolean(this._config & 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemWatcher.prototype, "ignoreDeleteEvents", {
            get: function () {
                return Boolean(this._config & 4);
            },
            enumerable: true,
            configurable: true
        });
        FileSystemWatcher.prototype.dispose = function () {
            this._disposable.dispose();
        };
        Object.defineProperty(FileSystemWatcher.prototype, "onDidCreate", {
            get: function () {
                return this._onDidCreate.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemWatcher.prototype, "onDidChange", {
            get: function () {
                return this._onDidChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemWatcher.prototype, "onDidDelete", {
            get: function () {
                return this._onDidDelete.event;
            },
            enumerable: true,
            configurable: true
        });
        return FileSystemWatcher;
    }());
    exports.FileSystemWatcher = FileSystemWatcher;
    var ExtHostFileSystemEventService = (function () {
        function ExtHostFileSystemEventService() {
            this._emitter = new event_1.Emitter();
        }
        ExtHostFileSystemEventService.prototype.createFileSystemWatcher = function (globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            return new FileSystemWatcher(this._emitter.event, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
        };
        ExtHostFileSystemEventService.prototype._onFileEvent = function (events) {
            this._emitter.fire(events);
        };
        ExtHostFileSystemEventService = __decorate([
            thread_1.Remotable.ExtHostContext('ExtHostFileSystemEventService')
        ], ExtHostFileSystemEventService);
        return ExtHostFileSystemEventService;
    }());
    exports.ExtHostFileSystemEventService = ExtHostFileSystemEventService;
    var MainThreadFileSystemEventService = (function () {
        function MainThreadFileSystemEventService(eventService, threadService) {
            var proxy = threadService.getRemotable(ExtHostFileSystemEventService);
            var events = {
                created: [],
                changed: [],
                deleted: []
            };
            var scheduler = new async_1.RunOnceScheduler(function () {
                proxy._onFileEvent(events);
                events.created.length = 0;
                events.changed.length = 0;
                events.deleted.length = 0;
            }, 100);
            eventService.addListener('files:fileChanges', function (event) {
                for (var _i = 0, _a = event.changes; _i < _a.length; _i++) {
                    var change = _a[_i];
                    switch (change.type) {
                        case files_1.FileChangeType.ADDED:
                            events.created.push(change.resource);
                            break;
                        case files_1.FileChangeType.UPDATED:
                            events.changed.push(change.resource);
                            break;
                        case files_1.FileChangeType.DELETED:
                            events.deleted.push(change.resource);
                            break;
                    }
                }
                scheduler.schedule();
            });
        }
        MainThreadFileSystemEventService = __decorate([
            __param(0, event_2.IEventService),
            __param(1, thread_1.IThreadService)
        ], MainThreadFileSystemEventService);
        return MainThreadFileSystemEventService;
    }());
    exports.MainThreadFileSystemEventService = MainThreadFileSystemEventService;
});
//# sourceMappingURL=extHostFileSystemEventService.js.map