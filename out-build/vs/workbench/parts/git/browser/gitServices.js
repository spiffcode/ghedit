var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/git/browser/gitServices', 'vs/base/common/platform', 'vs/base/common/winjs.base', 'vs/base/common/lifecycle', 'vs/base/common/types', 'vs/base/common/actions', 'vs/base/common/errors', 'vs/base/common/mime', 'vs/base/common/paths', 'vs/base/common/eventEmitter', 'vs/workbench/common/events', 'vs/workbench/parts/git/common/git', 'vs/workbench/parts/git/common/gitModel', 'vs/workbench/parts/git/browser/gitEditorInputs', 'vs/workbench/parts/git/browser/gitOperations', 'vs/workbench/parts/files/common/files', 'vs/platform/files/common/files', 'vs/base/common/async', 'vs/base/common/severity', 'vs/workbench/parts/output/common/output', 'vs/workbench/services/editor/common/editorService', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/workspace/common/workspace', 'vs/platform/lifecycle/common/lifecycle', 'vs/base/common/uri', 'semver', 'electron', 'vs/platform/storage/common/storage'], function (require, exports, nls, platform, winjs, lifecycle, types, actions, errors, mime, paths, ee, wbevents, git, model, giteditorinputs, operations, filesCommon, files_1, async, severity_1, output_1, editorService_1, configuration_1, event_1, instantiation_1, message_1, workspace_1, lifecycle_1, uri_1, semver, electron_1, storage_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function toReadablePath(path) {
        if (!platform.isWindows) {
            return path;
        }
        return path.replace(/\//g, '\\');
    }
    var EditorInputCache = (function () {
        function EditorInputCache(gitService, // gitService passed as argument, not by injection
            instantiationService, fileService, eventService, editorService, contextService) {
            var _this = this;
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this.eventService = eventService;
            this.editorService = editorService;
            this.contextService = contextService;
            this.gitService = gitService;
            this.cache = {};
            this.toDispose = [];
            this.toDispose.push(this.gitService.getModel().addListener2('fileStatus:dispose', function (fileStatus) { return _this.onFileStatusDispose(fileStatus); }));
        }
        EditorInputCache.prototype.getInput = function (status) {
            var result = this.cache[status.getId()];
            if (result) {
                return result;
            }
            result = this.createInput(status);
            this.cache[status.getId()] = result;
            return result;
        };
        EditorInputCache.prototype.createInput = function (status) {
            return winjs.TPromise.join([this.createLeftInput(status), this.createRightInput(status)]).then(function (result) {
                var leftInput = result[0];
                var rightInput = result[1];
                var fileSegment;
                var folderSegment;
                if (status.getStatus() === git.Status.INDEX_RENAMED) {
                    var pathComponents = status.getRename().split('/');
                    fileSegment = pathComponents[pathComponents.length - 1];
                    folderSegment = toReadablePath(pathComponents.slice(0, pathComponents.length - 1).join('/'));
                }
                else {
                    var pathComponents = status.getPathComponents();
                    fileSegment = pathComponents[pathComponents.length - 1];
                    folderSegment = toReadablePath(pathComponents.slice(0, pathComponents.length - 1).join('/'));
                }
                if (!leftInput) {
                    if (!rightInput) {
                        var error = new Error(nls.localize(0, null));
                        error.gitErrorCode = git.GitErrorCodes.CantOpenResource;
                        return winjs.Promise.wrapError(error);
                    }
                    return winjs.TPromise.as(rightInput);
                }
                switch (status.getStatus()) {
                    case git.Status.INDEX_MODIFIED:
                        return winjs.TPromise.as(new giteditorinputs.GitIndexDiffEditorInput(fileSegment, nls.localize(1, null, folderSegment), leftInput, rightInput, status));
                    case git.Status.INDEX_RENAMED:
                        return winjs.TPromise.as(new giteditorinputs.GitIndexDiffEditorInput(fileSegment, nls.localize(2, null, folderSegment), leftInput, rightInput, status));
                    case git.Status.MODIFIED:
                        return winjs.TPromise.as(new giteditorinputs.GitWorkingTreeDiffEditorInput(fileSegment, nls.localize(3, null, folderSegment), leftInput, rightInput, status));
                    default:
                        return winjs.TPromise.as(new giteditorinputs.GitDiffEditorInput(fileSegment, nls.localize(4, null, folderSegment), leftInput, rightInput, status));
                }
            }).then(function (editorInput) {
                return editorInput;
            }, function (errs) {
                return winjs.Promise.wrapError(types.isArray(errs) ? errs[0] || errs[1] : errs);
            });
        };
        EditorInputCache.prototype.createLeftInput = function (status) {
            var path = status.getPath();
            var model = this.gitService.getModel();
            switch (status.getStatus()) {
                case git.Status.INDEX_MODIFIED:
                case git.Status.INDEX_RENAMED:
                    return this.gitService.show(path, status, 'HEAD', status.getMimetype());
                case git.Status.MODIFIED:
                    var indexStatus = model.getStatus().find(path, git.StatusType.INDEX);
                    if (indexStatus && indexStatus.getStatus() === git.Status.INDEX_RENAMED) {
                        return this.gitService.show(indexStatus.getRename(), status, '~', status.getMimetype());
                    }
                    if (indexStatus) {
                        return this.gitService.show(path, status, '~', status.getMimetype());
                    }
                    return this.gitService.show(path, status, 'HEAD', status.getMimetype());
                default:
                    return winjs.TPromise.as(null);
            }
        };
        EditorInputCache.prototype.createRightInput = function (status) {
            var model = this.gitService.getModel();
            var path = status.getPath();
            var resource = uri_1.default.file(paths.join(model.getRepositoryRoot(), path));
            switch (status.getStatus()) {
                case git.Status.INDEX_MODIFIED:
                case git.Status.INDEX_ADDED:
                case git.Status.INDEX_COPIED:
                    return this.gitService.show(path, status, '~', status.getMimetype());
                case git.Status.INDEX_RENAMED:
                    return this.gitService.show(status.getRename(), status, '~', status.getMimetype());
                case git.Status.INDEX_DELETED:
                case git.Status.DELETED:
                    return this.gitService.show(path, status, 'HEAD', status.getMimetype());
                case git.Status.MODIFIED:
                case git.Status.UNTRACKED:
                case git.Status.IGNORED:
                    var indexStatus = model.getStatus().find(path, git.StatusType.INDEX);
                    if (indexStatus && indexStatus.getStatus() === git.Status.INDEX_RENAMED) {
                        resource = uri_1.default.file(paths.join(model.getRepositoryRoot(), indexStatus.getRename()));
                    }
                    return this.editorService.inputToType({ resource: resource });
                case git.Status.BOTH_MODIFIED:
                    return this.editorService.inputToType({ resource: resource });
                default:
                    return winjs.TPromise.as(null);
            }
        };
        EditorInputCache.prototype.onFileStatusDispose = function (fileStatus) {
            var _this = this;
            var id = fileStatus.getId();
            var editorInputPromise = this.cache[id];
            if (editorInputPromise) {
                editorInputPromise.done(function (editorInput) { _this.eventuallyDispose(editorInput); });
                delete this.cache[id];
            }
        };
        /**
         * If the disposed status is the same as this input's status, we must try to dispose the input.
         * But we should not do it while the input is still open. This method will eventually call dispose
         * when the editor input goes out of the visible editors.
         */
        EditorInputCache.prototype.eventuallyDispose = function (editorInput) {
            var _this = this;
            if (!this.maybeDispose(editorInput)) {
                var listener = this.eventService.addListener2(wbevents.EventType.EDITOR_INPUT_CHANGED, function () {
                    if (_this.maybeDispose(editorInput)) {
                        listener.dispose();
                    }
                });
            }
        };
        EditorInputCache.prototype.maybeDispose = function (editorInput) {
            if (!this.editorService.getVisibleEditors().some(function (editor) { return editor.input && editor.input.matches(editorInput); })) {
                editorInput.dispose();
                return true;
            }
            return false;
        };
        EditorInputCache.prototype.dispose = function () {
            var _this = this;
            Object.keys(this.cache).forEach(function (key) {
                _this.cache[key].done(function (editorInput) { editorInput.dispose(); });
                delete _this.cache[key];
            });
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        EditorInputCache = __decorate([
            // gitService passed as argument, not by injection
            __param(1, instantiation_1.IInstantiationService),
            __param(2, files_1.IFileService),
            __param(3, event_1.IEventService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, workspace_1.IWorkspaceContextService)
        ], EditorInputCache);
        return EditorInputCache;
    }());
    var AutoFetcher = (function () {
        function AutoFetcher(gitService, // gitService passed as argument, not by injection
            eventService, messageService, editorService, configurationService, instantiationService) {
            var _this = this;
            this._state = git.AutoFetcherState.Disabled;
            this.gitService = gitService;
            this.eventService = eventService;
            this.messageService = messageService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.currentRequest = null;
            this.timeout = AutoFetcher.MIN_TIMEOUT;
            this.toDispose = [];
            this.toDispose.push(this.configurationService.addListener2(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.onConfiguration(e.config.git); }));
            this.onConfiguration(configurationService.getConfiguration('git'));
        }
        Object.defineProperty(AutoFetcher.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        AutoFetcher.prototype.onConfiguration = function (config) {
            if (config.autofetch === false) {
                this.disable();
            }
            else {
                this.enable();
            }
        };
        AutoFetcher.prototype.enable = function () {
            var _this = this;
            if (this._state !== git.AutoFetcherState.Disabled) {
                return;
            }
            this.gitServiceStateDisposable = this.gitService.addListener2(git.ServiceEvents.STATE_CHANGED, function (e) { return _this.onGitServiceStateChange(e); });
            this._state = git.AutoFetcherState.Active;
            this.onGitServiceStateChange(this.gitService.getState());
        };
        AutoFetcher.prototype.disable = function () {
            if (this.gitServiceStateDisposable) {
                this.gitServiceStateDisposable.dispose();
                this.gitServiceStateDisposable = null;
            }
            this.deactivate();
            this._state = git.AutoFetcherState.Disabled;
        };
        AutoFetcher.prototype.onGitServiceStateChange = function (state) {
            if (state === git.ServiceState.OK) {
                this.activate();
            }
            else {
                this.deactivate();
            }
        };
        AutoFetcher.prototype.activate = function () {
            if (this.currentRequest) {
                this.currentRequest.cancel();
            }
            this._state = git.AutoFetcherState.Active;
            this.loop();
        };
        AutoFetcher.prototype.deactivate = function () {
            if (!this.currentRequest) {
                return;
            }
            this._state = git.AutoFetcherState.Inactive;
            this.currentRequest.cancel();
            this.currentRequest = null;
        };
        AutoFetcher.prototype.loop = function () {
            var _this = this;
            this._state = git.AutoFetcherState.Fetching;
            this.currentRequest = this.gitService.fetch().then(function () {
                _this.timeout = AutoFetcher.MIN_TIMEOUT;
            }, function (err) {
                if (errors.isPromiseCanceledError(err)) {
                    return winjs.Promise.wrapError(err);
                }
                else if (err.gitErrorCode === git.GitErrorCodes.AuthenticationFailed) {
                    return winjs.Promise.wrapError(err);
                }
                else {
                    _this.timeout = Math.min(Math.round(_this.timeout * 1.2), AutoFetcher.MAX_TIMEOUT); // backoff
                }
            });
            this.currentRequest.then(function () {
                _this._state = git.AutoFetcherState.Active;
                _this.currentRequest = winjs.TPromise.timeout(_this.timeout);
                return _this.currentRequest;
            }).then(function () { return _this.loop(); }, function (err) { return _this.deactivate(); });
        };
        AutoFetcher.prototype.dispose = function () {
            this.disable();
        };
        AutoFetcher.MIN_TIMEOUT = 2 * 60 * 1000; // every two minutes
        AutoFetcher.MAX_TIMEOUT = 5 * 60 * 1000; // every five minutes
        AutoFetcher = __decorate([
            // gitService passed as argument, not by injection
            __param(1, event_1.IEventService),
            __param(2, message_1.IMessageService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, instantiation_1.IInstantiationService)
        ], AutoFetcher);
        return AutoFetcher;
    }());
    exports.AutoFetcher = AutoFetcher;
    var IgnoreOldGitStorageKey = 'settings.workspace.git.ignoreOld';
    var GitService = (function (_super) {
        __extends(GitService, _super);
        function GitService(raw, instantiationService, eventService, messageService, editorService, outputService, contextService, lifecycleService, storageService) {
            _super.call(this);
            this.serviceId = git.IGitService;
            this.instantiationService = instantiationService;
            this.eventService = eventService;
            this.messageService = messageService;
            this.editorService = editorService;
            this.outputService = outputService;
            this.contextService = contextService;
            this.lifecycleService = lifecycleService;
            this.raw = raw;
            this.state = git.ServiceState.NotInitialized;
            this.operations = [];
            this.model = new model.Model();
            this.toDispose = [];
            this.needsRefresh = false;
            this.refreshDelayer = new async.PeriodThrottledDelayer(500, 10000);
            this.autoFetcher = this.instantiationService.createInstance(AutoFetcher, this);
            this.registerListeners();
            this.inputCache = this.instantiationService.createInstance(EditorInputCache, this);
            this.triggerStatus(true); // trigger initial status
            if (!storageService.getBoolean(IgnoreOldGitStorageKey, storage_1.StorageScope.GLOBAL, false)) {
                this.raw.getVersion().done(function (version) {
                    version = version || '';
                    version = version.replace(/^(\d+\.\d+\.\d+).*$/, '$1');
                    version = semver.valid(version);
                    if (version && semver.satisfies(version, '<2.0.0')) {
                        messageService.show(severity_1.default.Warning, {
                            message: nls.localize(5, null, version),
                            actions: [
                                message_1.CloseAction,
                                new actions.Action('neverShowAgain', nls.localize(6, null), null, true, function () {
                                    storageService.store(IgnoreOldGitStorageKey, true, storage_1.StorageScope.GLOBAL);
                                    return null;
                                }),
                                new actions.Action('downloadLatest', nls.localize(7, null), '', true, function () {
                                    electron_1.shell.openExternal('https://git-scm.com/');
                                    return null;
                                })
                            ]
                        });
                    }
                });
            }
        }
        GitService.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_CHANGES, function (e) { return _this.onFileChanges(e); }));
            this.toDispose.push(this.eventService.addListener2(filesCommon.EventType.FILE_SAVED, function (e) { return _this.onLocalFileChange(e); }));
            this.toDispose.push(this.eventService.addListener2(filesCommon.EventType.FILE_REVERTED, function (e) { return _this.onLocalFileChange(e); }));
            this.lifecycleService.onShutdown(this.dispose, this);
        };
        GitService.prototype.triggerStatus = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            if (this.isInitialized() && !this.isIdle() && !force) {
                this.refreshDelayer.cancel();
                return;
            }
            var onError = async.once(function (e) {
                if (!errors.isPromiseCanceledError(e)) {
                    _this.messageService.show(severity_1.default.Error, e);
                }
            });
            this.refreshDelayer.trigger(function () { return _this.status(); }).done(null, onError);
        };
        GitService.prototype.onLocalFileChange = function (e) {
            var shouldTriggerStatus = e.gotUpdated() && paths.basename(e.getAfter().resource.fsPath) === '.gitignore';
            if (!shouldTriggerStatus) {
                return;
            }
            this.triggerStatus();
        };
        GitService.prototype.onFileChanges = function (e) {
            var _this = this;
            var isIdle = this.isIdle();
            var shouldTriggerStatus = e.changes.some(function (c) {
                var workspacePath = _this.contextService.toWorkspaceRelativePath(c.resource);
                if (!workspacePath) {
                    return false; // ignore out of workspace files
                }
                // for .gitindex, the service must be idle
                if ('.git/index' === workspacePath) {
                    return isIdle;
                }
                // for anything other that .git*
                if (!/^\.git/.test(workspacePath)) {
                    return true;
                }
                // added or deleted .git folder
                if (workspacePath === '.git') {
                    return c.type === files_1.FileChangeType.ADDED || c.type === files_1.FileChangeType.DELETED;
                }
                return ['.git/index.lock', '.git/FETCH_HEAD', '.gitignore', '.gitmodules'].indexOf(workspacePath) === -1;
            });
            if (!shouldTriggerStatus) {
                return;
            }
            this.triggerStatus();
        };
        GitService.prototype.onGitServiceOperationEnd = function (e) {
            if (e.operation.id === git.ServiceOperations.COMMAND) {
                this.triggerStatus();
            }
        };
        GitService.prototype.getState = function () {
            return this.state;
        };
        GitService.prototype.getModel = function () {
            return this.model;
        };
        GitService.prototype.status = function () {
            var _this = this;
            return this.run(git.ServiceOperations.STATUS, function () { return _this.raw.status(); });
        };
        GitService.prototype.init = function () {
            var _this = this;
            return this.run(git.ServiceOperations.INIT, function () { return _this.raw.init(); });
        };
        GitService.prototype.add = function (files) {
            var _this = this;
            return this.run(git.ServiceOperations.ADD, function () { return _this.raw.add(GitService.toPaths(files)); });
        };
        GitService.prototype.stage = function (filePath, content) {
            var _this = this;
            return this.run(git.ServiceOperations.STAGE, function () { return _this.raw.stage(filePath, content); });
        };
        GitService.prototype.branch = function (name, checkout) {
            var _this = this;
            if (checkout === void 0) { checkout = false; }
            return this.run(git.ServiceOperations.BRANCH, function () { return _this.raw.branch(name, checkout); });
        };
        GitService.prototype.checkout = function (treeish, files) {
            var _this = this;
            if (treeish === void 0) { treeish = ''; }
            if (files === void 0) { files = null; }
            return this.run(git.ServiceOperations.CHECKOUT, function () { return _this.raw.checkout(treeish, GitService.toPaths(files)); });
        };
        GitService.prototype.clean = function (files) {
            var _this = this;
            return this.run(git.ServiceOperations.CLEAN, function () { return _this.raw.clean(files.map(function (s) { return s.getPath(); })); });
        };
        GitService.prototype.undo = function () {
            var _this = this;
            return this.run(git.ServiceOperations.UNDO, function () { return _this.raw.undo(); });
        };
        GitService.prototype.reset = function (treeish, hard) {
            var _this = this;
            return this.run(git.ServiceOperations.RESET, function () { return _this.raw.reset(treeish, hard); });
        };
        GitService.prototype.revertFiles = function (treeish, files) {
            var _this = this;
            return this.run(git.ServiceOperations.RESET, function () { return _this.raw.revertFiles(treeish, (files || []).map(function (s) { return s.getPath(); })); });
        };
        GitService.prototype.fetch = function () {
            var _this = this;
            return this.run(git.ServiceOperations.BACKGROUND_FETCH, function () { return _this.raw.fetch(); });
        };
        GitService.prototype.pull = function (rebase) {
            var _this = this;
            return this.run(git.ServiceOperations.PULL, function () { return _this.raw.pull(rebase); });
        };
        GitService.prototype.push = function (remote, name, options) {
            var _this = this;
            return this.run(git.ServiceOperations.PUSH, function () { return _this.raw.push(remote, name, options); });
        };
        GitService.prototype.sync = function (rebase) {
            var _this = this;
            var head = this.model.getHEAD();
            var isAhead = head && head.upstream && !!head.ahead;
            if (!isAhead) {
                return this.run(git.ServiceOperations.SYNC, function () { return _this.raw.pull(rebase); });
            }
            else {
                return this.run(git.ServiceOperations.SYNC, function () { return _this.raw.sync(); });
            }
        };
        GitService.prototype.commit = function (message, amend, stage) {
            var _this = this;
            if (amend === void 0) { amend = false; }
            if (stage === void 0) { stage = false; }
            return this.run(git.ServiceOperations.COMMIT, function () { return _this.raw.commit(message, amend, stage); });
        };
        GitService.prototype.detectMimetypes = function (path, treeish) {
            if (treeish === void 0) { treeish = '~'; }
            return this.raw.detectMimetypes(path, treeish);
        };
        GitService.prototype.run = function (operationId, fn) {
            var _this = this;
            return this.raw.serviceState().then(function (state) {
                if (state === git.RawServiceState.GitNotFound) {
                    _this.transition(git.ServiceState.NoGit);
                    return winjs.TPromise.as(null);
                }
                else if (state === git.RawServiceState.Disabled) {
                    _this.transition(git.ServiceState.Disabled);
                    return winjs.TPromise.as(null);
                }
                else {
                    return _this._run(operationId, fn);
                }
            });
        };
        GitService.prototype._run = function (operationId, fn) {
            var _this = this;
            var operation = new operations.GitOperation(operationId, fn);
            this.operations.push(operation);
            this.emit(git.ServiceEvents.OPERATION_START, operation);
            this.emit(git.ServiceEvents.OPERATION, operation);
            var onDone = function (error) {
                if (error === void 0) { error = null; }
                var index = _this.operations.indexOf(operation);
                if (index > -1) {
                    _this.operations.splice(index, 1);
                }
                var e = { operation: operation, error: error };
                _this.emit(git.ServiceEvents.OPERATION_END, e);
                _this.onGitServiceOperationEnd(e);
                _this.emit(git.ServiceEvents.OPERATION, operation);
            };
            return operation.run().then(function (status) {
                _this.model.update(status);
                onDone();
                if (status) {
                    _this.transition(types.isUndefinedOrNull(status.state) ? git.ServiceState.OK : status.state);
                }
                else {
                    _this.transition(git.ServiceState.NotARepo);
                }
                return _this.model;
            }, function (e) {
                onDone(e);
                if (errors.isPromiseCanceledError(e)) {
                    return winjs.Promise.wrapError(e);
                }
                var gitErrorCode = e.gitErrorCode || null;
                if (gitErrorCode === git.GitErrorCodes.NotAtRepositoryRoot) {
                    _this.transition(git.ServiceState.NotAtRepoRoot);
                    return winjs.TPromise.as(_this.model);
                }
                _this.emit(git.ServiceEvents.ERROR, e);
                _this.transition(git.ServiceState.OK);
                if (gitErrorCode === git.GitErrorCodes.NoUserNameConfigured || gitErrorCode === git.GitErrorCodes.NoUserEmailConfigured) {
                    _this.messageService.show(severity_1.default.Warning, nls.localize(8, null));
                    return winjs.TPromise.as(null);
                }
                else if (gitErrorCode === git.GitErrorCodes.BadConfigFile) {
                    _this.messageService.show(severity_1.default.Error, nls.localize(9, null, e.message));
                    return winjs.TPromise.as(null);
                }
                else if (gitErrorCode === git.GitErrorCodes.UnmergedChanges) {
                    _this.messageService.show(severity_1.default.Warning, nls.localize(10, null));
                    return winjs.TPromise.as(null);
                }
                var error;
                var showOutputAction = new actions.Action('show.gitOutput', nls.localize(11, null), null, true, function () { return _this.outputService.getChannel('Git').show(); });
                var cancelAction = new actions.Action('close.message', nls.localize(12, null), null, true, function () { return winjs.TPromise.as(true); });
                error = errors.create(nls.localize(13, null), { actions: [showOutputAction, cancelAction] });
                error.gitErrorCode = gitErrorCode;
                return winjs.Promise.wrapError(error);
            });
        };
        GitService.prototype.transition = function (state) {
            var oldState = this.state;
            this.state = state;
            if (state !== oldState) {
                this.emit(git.ServiceEvents.STATE_CHANGED, state);
            }
        };
        GitService.prototype.buffer = function (path, treeish) {
            if (treeish === void 0) { treeish = '~'; }
            return this.raw.show(path, treeish);
        };
        GitService.prototype.show = function (path, status, treeish, mimetype) {
            var _this = this;
            if (treeish === void 0) { treeish = '~'; }
            if (mimetype === void 0) { mimetype = 'text/plain'; }
            return this.detectMimetypes(path, treeish).then(function (mimetypes) {
                var pathComponents = status.getPathComponents();
                var fileSegment = pathComponents[pathComponents.length - 1];
                var folderSegment = toReadablePath(pathComponents.slice(0, pathComponents.length - 1).join('/'));
                var description;
                if (treeish === '~') {
                    description = nls.localize(14, null, folderSegment);
                }
                else {
                    description = nls.localize(15, null, folderSegment, treeish);
                }
                if (mime.isUnspecific(mimetypes)) {
                    mimetypes = mime.guessMimeTypes(path); // guess from path if our detection did not yield results
                }
                // Binary: our story is weak here for binary files on the index. Since we run natively, we do not have a way currently
                // to e.g. show images as binary inside the renderer because images need to be served through a URL to show. We could revisit this by
                // allowing to use data URLs for resource inputs to render them. However, this would mean potentially loading a large file into memory
                //
                // Our solution now is to detect binary files and immediately return an input that is flagged as binary unknown mime type.
                if (mime.isBinaryMime(mime.guessMimeTypes(path)) || mimetypes.indexOf(mime.MIME_BINARY) >= 0) {
                    return winjs.Promise.wrapError(new Error('The resource seems to be binary and cannot be displayed'));
                }
                // Text
                return winjs.TPromise.as(_this.instantiationService.createInstance(giteditorinputs.NativeGitIndexStringEditorInput, fileSegment, description, mimetypes.join(', '), status, path, treeish));
            });
        };
        GitService.prototype.getInput = function (status) {
            var _this = this;
            return this.inputCache.getInput(status).then(null, function (err) {
                if (err.gitErrorCode = git.GitErrorCodes.CantOpenResource) {
                    _this.messageService.show(severity_1.default.Warning, nls.localize(16, null));
                    return winjs.TPromise.as(null);
                }
                return winjs.Promise.wrapError(err);
            });
        };
        GitService.prototype.isInitialized = function () {
            return this.state === git.ServiceState.OK;
        };
        GitService.prototype.isIdle = function () {
            return this.isInitialized() && !this.operations.some(function (op) { return op.id !== git.ServiceOperations.BACKGROUND_FETCH; });
        };
        GitService.prototype.getRunningOperations = function () {
            return this.operations;
        };
        GitService.prototype.onOutput = function () {
            return this.raw.onOutput();
        };
        GitService.prototype.getAutoFetcher = function () {
            return this.autoFetcher;
        };
        GitService.toPaths = function (files) {
            if (!files) {
                return null;
            }
            return files.map(function (status) {
                /*	In the case that a file was renamed in the index and (changed || deleted) in the
                    working tree, we must use its new name, running the checkout command.
                */
                switch (status.getStatus()) {
                    case git.Status.MODIFIED:
                    case git.Status.DELETED:
                        if (status.getRename()) {
                            return status.getRename();
                        }
                    default:
                        return status.getPath();
                }
            });
        };
        GitService.prototype.dispose = function () {
            this.emit(git.ServiceEvents.DISPOSE);
            if (this.model) {
                this.model.dispose();
                this.model = null;
            }
            if (this.remoteListenerUnbind) {
                this.remoteListenerUnbind();
                this.remoteListenerUnbind = null;
            }
            _super.prototype.dispose.call(this);
        };
        GitService.ID = 'Monaco.IDE.UI.Services.GitService';
        GitService = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, event_1.IEventService),
            __param(3, message_1.IMessageService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, output_1.IOutputService),
            __param(6, workspace_1.IWorkspaceContextService),
            __param(7, lifecycle_1.ILifecycleService),
            __param(8, storage_1.IStorageService)
        ], GitService);
        return GitService;
    }(ee.EventEmitter));
    exports.GitService = GitService;
});
//# sourceMappingURL=gitServices.js.map