/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'chokidar', 'fs', 'graceful-fs', 'vs/base/common/winjs.base', 'vs/platform/files/common/files', 'vs/base/common/async', 'vs/base/common/strings', 'vs/workbench/services/files/node/watcher/unix/watcherService', 'vs/workbench/services/files/node/watcher/common'], function (require, exports, chokidar, fs, gracefulFs, winjs_base_1, files_1, async_1, strings, watcherService_1, watcher) {
    'use strict';
    gracefulFs.gracefulify(fs);
    var ChokidarWatcherService = (function (_super) {
        __extends(ChokidarWatcherService, _super);
        function ChokidarWatcherService() {
            _super.apply(this, arguments);
        }
        ChokidarWatcherService.prototype.watch = function (request) {
            var _this = this;
            var watcherOpts = {
                ignoreInitial: true,
                ignorePermissionErrors: true,
                followSymlinks: true,
                ignored: request.ignored,
                interval: 1000,
                binaryInterval: 1000
            };
            var chokidarWatcher = chokidar.watch(request.basePath, watcherOpts);
            // Detect if for some reason the native watcher library fails to load
            if (process.platform === 'darwin' && !chokidarWatcher.options.useFsEvents) {
                console.error('Watcher is not using native fsevents library and is falling back to unefficient polling.');
            }
            var undeliveredFileEvents = [];
            var fileEventDelayer = new async_1.ThrottledDelayer(ChokidarWatcherService.FS_EVENT_DELAY);
            return new winjs_base_1.TPromise(function (c, e, p) {
                chokidarWatcher.on('all', function (type, path) {
                    if (path.indexOf(request.basePath) < 0) {
                        return; // we really only care about absolute paths here in our basepath context here
                    }
                    var event = null;
                    // Change
                    if (type === 'change') {
                        event = {
                            type: 0,
                            path: path
                        };
                    }
                    else if (type === 'add' || type === 'addDir') {
                        event = {
                            type: 1,
                            path: path
                        };
                    }
                    else if (type === 'unlink' || type === 'unlinkDir') {
                        event = {
                            type: 2,
                            path: path
                        };
                    }
                    if (event) {
                        // Logging
                        if (request.verboseLogging) {
                            console.log(event.type === files_1.FileChangeType.ADDED ? '[ADDED]' : event.type === files_1.FileChangeType.DELETED ? '[DELETED]' : '[CHANGED]', event.path);
                        }
                        // Check for spam
                        var now = Date.now();
                        if (undeliveredFileEvents.length === 0) {
                            _this.spamWarningLogged = false;
                            _this.spamCheckStartTime = now;
                        }
                        else if (!_this.spamWarningLogged && _this.spamCheckStartTime + ChokidarWatcherService.EVENT_SPAM_WARNING_THRESHOLD < now) {
                            _this.spamWarningLogged = true;
                            console.warn(strings.format('Watcher is busy catching up with {0} file changes in 60 seconds. Latest changed path is "{1}"', undeliveredFileEvents.length, event.path));
                        }
                        // Add to buffer
                        undeliveredFileEvents.push(event);
                        // Delay and send buffer
                        fileEventDelayer.trigger(function () {
                            var events = undeliveredFileEvents;
                            undeliveredFileEvents = [];
                            // Broadcast to clients normalized
                            var res = watcher.normalize(events);
                            p(res);
                            // Logging
                            if (request.verboseLogging) {
                                res.forEach(function (r) {
                                    console.log(' >> normalized', r.type === files_1.FileChangeType.ADDED ? '[ADDED]' : r.type === files_1.FileChangeType.DELETED ? '[DELETED]' : '[CHANGED]', r.path);
                                });
                            }
                            return winjs_base_1.TPromise.as(null);
                        });
                    }
                });
                chokidarWatcher.on('error', function (error) {
                    if (error) {
                        console.error(error.toString());
                    }
                });
            }, function () {
                chokidarWatcher.close();
                fileEventDelayer.cancel();
            });
        };
        ChokidarWatcherService.FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
        ChokidarWatcherService.EVENT_SPAM_WARNING_THRESHOLD = 60 * 1000; // warn after certain time span of event spam
        return ChokidarWatcherService;
    }(watcherService_1.WatcherService));
    exports.ChokidarWatcherService = ChokidarWatcherService;
});
//# sourceMappingURL=chokidarWatcherService.js.map