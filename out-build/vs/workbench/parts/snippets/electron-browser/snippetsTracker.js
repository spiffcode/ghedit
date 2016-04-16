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
define(["require", "exports", 'vs/base/common/paths', 'vs/base/common/async', 'vs/base/common/winjs.base', 'vs/base/node/extfs', 'vs/base/common/lifecycle', 'vs/editor/node/textMate/TMSnippets', 'vs/platform/files/common/files', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/workspace/common/workspace', 'fs'], function (require, exports, paths, async, winjs, extfs, lifecycle, tmsnippets, files_1, lifecycle_1, workspace_1, fs) {
    'use strict';
    var SnippetsTracker = (function () {
        function SnippetsTracker(fileService, lifecycleService, contextService) {
            var _this = this;
            this.fileService = fileService;
            this.lifecycleService = lifecycleService;
            this.snippetFolder = paths.join(contextService.getConfiguration().env.appSettingsHome, 'snippets');
            this.toDispose = [];
            this.fileWatchDelayer = new async.ThrottledDelayer(SnippetsTracker.FILE_WATCH_DELAY);
            if (!fs.existsSync(this.snippetFolder)) {
                fs.mkdirSync(this.snippetFolder);
            }
            this.scanUserSnippets().then(function (_) {
                _this.registerListeners();
            });
        }
        SnippetsTracker.prototype.registerListeners = function () {
            var _this = this;
            var scheduler = new async.RunOnceScheduler(function () {
                _this.scanUserSnippets();
            }, 500);
            this.toDispose.push(scheduler);
            try {
                this.watcher = fs.watch(this.snippetFolder); // will be persistent but not recursive
                this.watcher.on('change', function (eventType) {
                    if (eventType === 'delete') {
                        _this.unregisterListener();
                        return;
                    }
                    scheduler.schedule();
                });
            }
            catch (error) {
            }
            this.lifecycleService.onShutdown(this.dispose, this);
        };
        SnippetsTracker.prototype.scanUserSnippets = function () {
            var _this = this;
            return readFilesInDir(this.snippetFolder, /\.json$/).then(function (snippetFiles) {
                return winjs.TPromise.join(snippetFiles.map(function (snippetFile) {
                    var modeId = snippetFile.replace(/\.json$/, '').toLowerCase();
                    var snippetPath = paths.join(_this.snippetFolder, snippetFile);
                    return tmsnippets.snippetUpdated(modeId, snippetPath);
                }));
            });
        };
        SnippetsTracker.prototype.unregisterListener = function () {
            if (this.watcher) {
                this.watcher.close();
                this.watcher = null;
            }
        };
        SnippetsTracker.prototype.getId = function () {
            return 'vs.snippets.snippetsTracker';
        };
        SnippetsTracker.prototype.dispose = function () {
            this.unregisterListener();
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        SnippetsTracker.FILE_WATCH_DELAY = 200;
        SnippetsTracker = __decorate([
            __param(0, files_1.IFileService),
            __param(1, lifecycle_1.ILifecycleService),
            __param(2, workspace_1.IWorkspaceContextService)
        ], SnippetsTracker);
        return SnippetsTracker;
    }());
    exports.SnippetsTracker = SnippetsTracker;
    function readDir(path) {
        return new winjs.TPromise(function (c, e, p) {
            extfs.readdir(path, function (err, files) {
                if (err) {
                    return e(err);
                }
                c(files);
            });
        });
    }
    function fileExists(path) {
        return new winjs.TPromise(function (c, e, p) {
            fs.stat(path, function (err, stats) {
                if (err) {
                    return c(false);
                }
                if (stats.isFile()) {
                    return c(true);
                }
                c(false);
            });
        });
    }
    function readFilesInDir(dirPath, namePattern) {
        if (namePattern === void 0) { namePattern = null; }
        return readDir(dirPath).then(function (children) {
            return winjs.TPromise.join(children.map(function (child) {
                if (namePattern && !namePattern.test(child)) {
                    return winjs.TPromise.as(null);
                }
                return fileExists(paths.join(dirPath, child)).then(function (isFile) {
                    return isFile ? child : null;
                });
            })).then(function (subdirs) {
                return subdirs.filter(function (subdir) { return (subdir !== null); });
            });
        });
    }
});
//# sourceMappingURL=snippetsTracker.js.map