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
define(["require", "exports", 'vs/workbench/parts/files/common/files', 'vs/platform/files/common/files', 'vs/workbench/parts/files/browser/fileActions', 'vs/base/common/platform', 'vs/workbench/common/editor', 'vs/base/common/errors', 'vs/workbench/services/editor/common/editorService', 'vs/base/common/uri', 'vs/workbench/services/window/electron-browser/windowService', 'vs/workbench/common/events', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/part/common/partService', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/lifecycle/common/lifecycle', 'electron'], function (require, exports, files_1, files_2, fileActions_1, plat, editor_1, errors, editorService_1, uri_1, windowService_1, events_1, untitledEditorService_1, partService_1, contextService_1, event_1, instantiation_1, lifecycle_1, electron_1) {
    'use strict';
    // This extension decorates the window as dirty when auto save is disabled and a file is dirty (mac only) and handles opening of files in the instance.
    var FileTracker = (function () {
        function FileTracker(contextService, eventService, partService, fileService, textFileService, editorService, instantiationService, untitledEditorService, lifecycleService, windowService) {
            this.contextService = contextService;
            this.eventService = eventService;
            this.partService = partService;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.untitledEditorService = untitledEditorService;
            this.lifecycleService = lifecycleService;
            this.windowService = windowService;
            this.toUnbind = [];
            this.isDocumentedEdited = false;
            this.activeOutOfWorkspaceWatchers = Object.create(null);
            // Make sure to reset any previous state
            if (plat.platform === plat.Platform.Mac) {
                electron_1.ipcRenderer.send('vscode:setDocumentEdited', this.windowService.getWindowId(), false); // handled from browser process
            }
            this.registerListeners();
        }
        FileTracker.prototype.registerListeners = function () {
            var _this = this;
            // Local text file changes
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.UNTITLED_FILE_DELETED, function () { return _this.onUntitledDeletedEvent(); }));
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.UNTITLED_FILE_DIRTY, function () { return _this.onUntitledDirtyEvent(); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_DIRTY, function (e) { return _this.onTextFileDirty(e); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_SAVED, function (e) { return _this.onTextFileSaved(e); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_SAVE_ERROR, function (e) { return _this.onTextFileSaveError(e); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_REVERTED, function (e) { return _this.onTextFileReverted(e); }));
            // Support openFiles event for existing and new files
            electron_1.ipcRenderer.on('vscode:openFiles', function (event, request) {
                var inputs = [];
                var diffMode = (request.filesToDiff.length === 2);
                if (!diffMode && request.filesToOpen) {
                    inputs.push.apply(inputs, _this.toInputs(request.filesToOpen, false));
                }
                if (!diffMode && request.filesToCreate) {
                    inputs.push.apply(inputs, _this.toInputs(request.filesToCreate, true));
                }
                if (diffMode) {
                    inputs.push.apply(inputs, _this.toInputs(request.filesToDiff, false));
                }
                if (inputs.length) {
                    var action = _this.instantiationService.createInstance(fileActions_1.OpenResourcesAction, inputs, diffMode);
                    action.run().done(null, errors.onUnexpectedError);
                    action.dispose();
                }
            });
            // Editor input changes
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.EDITOR_INPUT_CHANGED, function () { return _this.onEditorInputChanged(); }));
            // Lifecycle
            this.lifecycleService.onShutdown(this.dispose, this);
        };
        FileTracker.prototype.toInputs = function (paths, isNew) {
            var _this = this;
            return paths.map(function (p) {
                var input = {
                    resource: isNew ? _this.untitledEditorService.createOrGet(uri_1.default.file(p.filePath)).getResource() : uri_1.default.file(p.filePath)
                };
                if (!isNew && p.lineNumber) {
                    input.options = {
                        selection: {
                            startLineNumber: p.lineNumber,
                            startColumn: p.columnNumber
                        }
                    };
                }
                return input;
            });
        };
        FileTracker.prototype.onEditorInputChanged = function () {
            var _this = this;
            var visibleOutOfWorkspaceResources = this.editorService.getVisibleEditors().map(function (editor) {
                return editor_1.asFileEditorInput(editor.input, true);
            }).filter(function (input) {
                return !!input && !_this.contextService.isInsideWorkspace(input.getResource());
            }).map(function (input) {
                return input.getResource().toString();
            });
            // Handle no longer visible out of workspace resources
            Object.keys(this.activeOutOfWorkspaceWatchers).forEach(function (watchedResource) {
                if (visibleOutOfWorkspaceResources.indexOf(watchedResource) < 0) {
                    _this.fileService.unwatchFileChanges(watchedResource);
                    delete _this.activeOutOfWorkspaceWatchers[watchedResource];
                }
            });
            // Handle newly visible out of workspace resources
            visibleOutOfWorkspaceResources.forEach(function (resourceToWatch) {
                if (!_this.activeOutOfWorkspaceWatchers[resourceToWatch]) {
                    _this.fileService.watchFileChanges(uri_1.default.parse(resourceToWatch));
                    _this.activeOutOfWorkspaceWatchers[resourceToWatch] = true;
                }
            });
        };
        FileTracker.prototype.onUntitledDirtyEvent = function () {
            if (!this.isDocumentedEdited) {
                this.updateDocumentEdited();
            }
        };
        FileTracker.prototype.onUntitledDeletedEvent = function () {
            if (this.isDocumentedEdited) {
                this.updateDocumentEdited();
            }
        };
        FileTracker.prototype.onTextFileDirty = function (e) {
            if ((this.textFileService.getAutoSaveMode() !== files_1.AutoSaveMode.AFTER_SHORT_DELAY) && !this.isDocumentedEdited) {
                this.updateDocumentEdited(); // no indication needed when auto save is enabled for short delay
            }
        };
        FileTracker.prototype.onTextFileSaved = function (e) {
            if (this.isDocumentedEdited) {
                this.updateDocumentEdited();
            }
        };
        FileTracker.prototype.onTextFileSaveError = function (e) {
            if (!this.isDocumentedEdited) {
                this.updateDocumentEdited();
            }
        };
        FileTracker.prototype.onTextFileReverted = function (e) {
            if (this.isDocumentedEdited) {
                this.updateDocumentEdited();
            }
        };
        FileTracker.prototype.updateDocumentEdited = function () {
            if (plat.platform === plat.Platform.Mac) {
                var hasDirtyFiles = this.textFileService.isDirty();
                this.isDocumentedEdited = hasDirtyFiles;
                electron_1.ipcRenderer.send('vscode:setDocumentEdited', this.windowService.getWindowId(), hasDirtyFiles); // handled from browser process
            }
        };
        FileTracker.prototype.getId = function () {
            return 'vs.files.electronFileTracker';
        };
        FileTracker.prototype.dispose = function () {
            while (this.toUnbind.length) {
                this.toUnbind.pop()();
            }
            // Dispose watchers if any
            for (var key in this.activeOutOfWorkspaceWatchers) {
                this.fileService.unwatchFileChanges(key);
            }
            this.activeOutOfWorkspaceWatchers = Object.create(null);
        };
        FileTracker = __decorate([
            __param(0, contextService_1.IWorkspaceContextService),
            __param(1, event_1.IEventService),
            __param(2, partService_1.IPartService),
            __param(3, files_2.IFileService),
            __param(4, files_1.ITextFileService),
            __param(5, editorService_1.IWorkbenchEditorService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, untitledEditorService_1.IUntitledEditorService),
            __param(8, lifecycle_1.ILifecycleService),
            __param(9, windowService_1.IWindowService)
        ], FileTracker);
        return FileTracker;
    }());
    exports.FileTracker = FileTracker;
});
//# sourceMappingURL=electronFileTracker.js.map