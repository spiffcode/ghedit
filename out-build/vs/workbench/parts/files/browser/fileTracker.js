var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/errors', 'vs/nls!vs/workbench/parts/files/browser/fileTracker', 'vs/base/common/mime', 'vs/base/common/uri', 'vs/base/common/paths', 'vs/workbench/common/editor/diffEditorInput', 'vs/workbench/common/editor', 'vs/workbench/parts/files/common/files', 'vs/platform/files/common/files', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/common/editor/iframeEditorInput', 'vs/workbench/parts/files/common/editors/textFileEditorModel', 'vs/workbench/common/events', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/services/activity/common/activityService', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation'], function (require, exports, errors, nls, mime_1, uri_1, paths, diffEditorInput_1, editor_1, files_1, files_2, fileEditorInput_1, iframeEditorInput_1, textFileEditorModel_1, events_1, untitledEditorService_1, editorService_1, quickOpenService_1, activityService_1, event_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // This extension tracks files for changes to update editors and inputs accordingly.
    var FileTracker = (function () {
        function FileTracker(eventService, quickOpenService, editorService, activityService, textFileService, instantiationService, untitledEditorService) {
            this.eventService = eventService;
            this.quickOpenService = quickOpenService;
            this.editorService = editorService;
            this.activityService = activityService;
            this.textFileService = textFileService;
            this.instantiationService = instantiationService;
            this.untitledEditorService = untitledEditorService;
            this.toUnbind = [];
            this.workingFiles = textFileService.getWorkingFilesModel();
            this.registerListeners();
        }
        FileTracker.prototype.getId = function () {
            return 'vs.files.filetracker';
        };
        FileTracker.prototype.registerListeners = function () {
            var _this = this;
            // Update editors and inputs from local changes and saves
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.EDITOR_INPUT_CHANGED, function (e) { return _this.onEditorInputChanged(e); }));
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.UNTITLED_FILE_DELETED, function (e) { return _this.onUntitledEditorDeleted(e); }));
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.UNTITLED_FILE_DIRTY, function (e) { return _this.onUntitledEditorDirty(e); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_DIRTY, function (e) { return _this.onTextFileDirty(e); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_SAVING, function (e) { return _this.onTextFileSaving(e); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_SAVE_ERROR, function (e) { return _this.onTextFileSaveError(e); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_SAVED, function (e) { return _this.onTextFileSaved(e); }));
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_REVERTED, function (e) { return _this.onTextFileReverted(e); }));
            this.toUnbind.push(this.eventService.addListener('files.internal:fileChanged', function (e) { return _this.onLocalFileChange(e); }));
            // Update editors and inputs from disk changes
            this.toUnbind.push(this.eventService.addListener(files_2.EventType.FILE_CHANGES, function (e) { return _this.onFileChanges(e); }));
        };
        FileTracker.prototype.onEditorInputChanged = function (e) {
            this.disposeTextFileModels();
        };
        FileTracker.prototype.onTextFileDirty = function (e) {
            this.emitInputStateChangeEvent(e.getAfter().resource);
            if (this.textFileService.getAutoSaveMode() !== files_1.AutoSaveMode.AFTER_SHORT_DELAY) {
                this.updateActivityBadge(); // no indication needed when auto save is enabled for short delay
            }
        };
        FileTracker.prototype.onTextFileSaving = function (e) {
            this.emitInputStateChangeEvent(e.getAfter().resource);
        };
        FileTracker.prototype.onTextFileSaveError = function (e) {
            this.emitInputStateChangeEvent(e.getAfter().resource);
            this.updateActivityBadge();
        };
        FileTracker.prototype.onTextFileSaved = function (e) {
            this.emitInputStateChangeEvent(e.getAfter().resource);
            if (this.lastDirtyCount > 0) {
                this.updateActivityBadge();
            }
        };
        FileTracker.prototype.onTextFileReverted = function (e) {
            this.emitInputStateChangeEvent(e.getAfter().resource);
            if (this.lastDirtyCount > 0) {
                this.updateActivityBadge();
            }
        };
        FileTracker.prototype.onUntitledEditorDirty = function (e) {
            var input = this.untitledEditorService.get(e.resource);
            if (input) {
                this.eventService.emit(events_1.EventType.EDITOR_INPUT_STATE_CHANGED, new events_1.EditorInputEvent(input));
            }
            this.updateActivityBadge();
        };
        FileTracker.prototype.onUntitledEditorDeleted = function (e) {
            var input = this.untitledEditorService.get(e.resource);
            if (input) {
                this.eventService.emit(events_1.EventType.EDITOR_INPUT_STATE_CHANGED, new events_1.EditorInputEvent(input));
            }
            if (this.lastDirtyCount > 0) {
                this.updateActivityBadge();
            }
        };
        FileTracker.prototype.updateActivityBadge = function () {
            var dirtyCount = this.textFileService.getDirty().length;
            this.lastDirtyCount = dirtyCount;
            if (dirtyCount > 0) {
                this.activityService.showActivity(files_1.VIEWLET_ID, new activityService_1.NumberBadge(dirtyCount, function (num) { return nls.localize(0, null, dirtyCount); }), 'explorer-viewlet-label');
            }
            else {
                this.activityService.clearActivity(files_1.VIEWLET_ID);
            }
        };
        FileTracker.prototype.emitInputStateChangeEvent = function (resource) {
            var _this = this;
            // Find all file editor inputs that are open from the given file resource and emit a editor input state change event.
            // We could do all of this within the file editor input but having all the file change listeners in
            // one place is more elegant and keeps the logic together at once place.
            var editors = this.editorService.getVisibleEditors();
            editors.forEach(function (editor) {
                var input = editor.input;
                if (input instanceof diffEditorInput_1.DiffEditorInput) {
                    input = input.getModifiedInput();
                }
                // File Editor Input
                if (input instanceof fileEditorInput_1.FileEditorInput) {
                    var fileInput = input;
                    if (fileInput.getResource().toString() === resource.toString()) {
                        var inputEvent = editor.input instanceof diffEditorInput_1.DiffEditorInput ? editor.input : fileInput; // make sure to still send around the input from the diff editor if given
                        _this.eventService.emit(events_1.EventType.EDITOR_INPUT_STATE_CHANGED, new events_1.EditorInputEvent(inputEvent));
                    }
                }
            });
        };
        // Note: there is some duplication with the other file event handler below. Since we cannot always rely on the disk events
        // carrying all necessary data in all environments, we also use the local file events to make sure operations are handled.
        // In any case there is no guarantee if the local event is fired first or the disk one. Thus, code must handle the case
        // that the event ordering is random as well as might not carry all information needed.
        FileTracker.prototype.onLocalFileChange = function (e) {
            // Handle moves specially when file is opened
            if (e.gotMoved()) {
                var before = e.getBefore();
                var after = e.getAfter();
                this.handleMovedFileInVisibleEditors(before ? before.resource : null, after ? after.resource : null, after ? after.mime : null);
            }
            // Dispose all known inputs passed on resource
            var oldFile = e.getBefore();
            if ((e.gotMoved() || e.gotDeleted())) {
                this.disposeAll(oldFile.resource, this.quickOpenService.getEditorHistory());
            }
        };
        FileTracker.prototype.onFileChanges = function (e) {
            var _this = this;
            // Dispose inputs that got deleted
            var allDeleted = e.getDeleted();
            if (allDeleted && allDeleted.length > 0) {
                allDeleted.forEach(function (deleted) {
                    _this.disposeAll(deleted.resource, _this.quickOpenService.getEditorHistory());
                });
            }
            // Dispose models that got changed and are not visible. We do this because otherwise
            // cached file models will be stale from the contents on disk.
            e.getUpdated()
                .map(function (u) { return textFileEditorModel_1.CACHE.get(u.resource); })
                .filter(function (model) {
                var canDispose = _this.canDispose(model);
                if (!canDispose) {
                    return false;
                }
                if (new Date().getTime() - model.getLastDirtyTime() < FileTracker.FILE_CHANGE_UPDATE_DELAY) {
                    return false; // this is a weak check to see if the change came from outside the editor or not
                }
                return true; // ok boss
            })
                .forEach(function (model) { return textFileEditorModel_1.CACHE.dispose(model.getResource()); });
            // Update inputs that got updated
            var editors = this.editorService.getVisibleEditors();
            editors.forEach(function (editor) {
                var input = editor.input;
                if (input instanceof diffEditorInput_1.DiffEditorInput) {
                    input = _this.getMatchingFileEditorInputFromDiff(input, e);
                }
                // File Editor Input
                if (input instanceof fileEditorInput_1.FileEditorInput) {
                    var fileInput = input;
                    var fileInputResource = fileInput.getResource();
                    // Input got added or updated, so check for model and update
                    // Note: we also consider the added event because it could be that a file was added
                    // and updated right after.
                    if (e.contains(fileInputResource, files_2.FileChangeType.UPDATED) || e.contains(fileInputResource, files_2.FileChangeType.ADDED)) {
                        var textModel_1 = textFileEditorModel_1.CACHE.get(fileInputResource);
                        // Text file: check for last dirty time
                        if (textModel_1) {
                            var state = textModel_1.getState();
                            // We only ever update models that are in good saved state
                            if (state === textFileEditorModel_1.State.SAVED) {
                                var lastDirtyTime = textModel_1.getLastDirtyTime();
                                // Force a reopen of the input if this change came in later than our wait interval before we consider it
                                if (new Date().getTime() - lastDirtyTime > FileTracker.FILE_CHANGE_UPDATE_DELAY) {
                                    var codeEditor_1 = editor.getControl();
                                    var viewState_1 = codeEditor_1.saveViewState();
                                    var currentMtime_1 = textModel_1.getLastModifiedTime(); // optimize for the case where the file did actually not change
                                    textModel_1.load().done(function () {
                                        if (textModel_1.getLastModifiedTime() !== currentMtime_1 && _this.isEditorShowingPath(editor, textModel_1.getResource())) {
                                            codeEditor_1.restoreViewState(viewState_1);
                                        }
                                    }, errors.onUnexpectedError);
                                }
                            }
                        }
                        else if (editor.getId() === files_1.BINARY_FILE_EDITOR_ID) {
                            var editorOptions = new editor_1.EditorOptions();
                            editorOptions.forceOpen = true;
                            editorOptions.preserveFocus = true;
                            _this.editorService.openEditor(editor.input, editorOptions, editor.position).done(null, errors.onUnexpectedError);
                        }
                    }
                }
                else if (input instanceof iframeEditorInput_1.IFrameEditorInput) {
                    var iFrameInput = input;
                    if (e.contains(iFrameInput.getResource(), files_2.FileChangeType.UPDATED)) {
                        editor.reload();
                    }
                }
            });
        };
        FileTracker.prototype.isEditorShowingPath = function (editor, resource) {
            // Only relevant if Editor is visible
            if (!editor.isVisible()) {
                return false;
            }
            // Only relevant if Input is set
            var input = editor.getInput();
            if (!input) {
                return false;
            }
            // Support diff editor input too
            if (input instanceof diffEditorInput_1.DiffEditorInput) {
                input = input.getModifiedInput();
            }
            return input instanceof fileEditorInput_1.FileEditorInput && input.getResource().toString() === resource.toString();
        };
        FileTracker.prototype.handleMovedFileInVisibleEditors = function (oldResource, newResource, mimeHint) {
            var _this = this;
            var editors = this.editorService.getVisibleEditors();
            editors.forEach(function (editor) {
                var input = editor.input;
                if (input instanceof diffEditorInput_1.DiffEditorInput) {
                    input = input.getModifiedInput();
                }
                var inputResource;
                if (input instanceof fileEditorInput_1.FileEditorInput) {
                    inputResource = input.getResource();
                }
                else if (input instanceof iframeEditorInput_1.IFrameEditorInput) {
                    inputResource = input.getResource();
                }
                // Editor Input with associated Resource
                if (inputResource) {
                    // Update Editor if file (or any parent of the input) got renamed or moved
                    var updateInput = false;
                    if (paths.isEqualOrParent(inputResource.fsPath, oldResource.fsPath)) {
                        updateInput = true;
                    }
                    // Do update from move
                    if (updateInput) {
                        var reopenFileResource = void 0;
                        if (oldResource.toString() === inputResource.toString()) {
                            reopenFileResource = newResource;
                        }
                        else {
                            var index = inputResource.fsPath.indexOf(oldResource.fsPath);
                            reopenFileResource = uri_1.default.file(paths.join(newResource.fsPath, inputResource.fsPath.substr(index + oldResource.fsPath.length + 1))); // update the path by changing the old path value to the new one
                        }
                        var editorInput = void 0;
                        var editorOptions = new editor_1.EditorOptions();
                        editorOptions.preserveFocus = true;
                        // Reopen File Input
                        if (input instanceof fileEditorInput_1.FileEditorInput) {
                            editorInput = _this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, reopenFileResource, mimeHint || mime_1.MIME_UNKNOWN, void 0);
                        }
                        else if (input instanceof iframeEditorInput_1.IFrameEditorInput) {
                            var iFrameInput = input;
                            editorInput = iFrameInput.createNew(reopenFileResource);
                        }
                        if (editorInput) {
                            _this.editorService.openEditor(editorInput, editorOptions, editor.position).done(null, errors.onUnexpectedError);
                        }
                    }
                }
            });
        };
        FileTracker.prototype.getMatchingFileEditorInputFromDiff = function (input, arg) {
            // First try modifiedInput
            var modifiedInput = input.getModifiedInput();
            var res = this.getMatchingFileEditorInputFromInput(modifiedInput, arg);
            if (res) {
                return res;
            }
            // Second try originalInput
            var originalInput = input.getOriginalInput();
            return this.getMatchingFileEditorInputFromInput(originalInput, arg);
        };
        FileTracker.prototype.getMatchingFileEditorInputFromInput = function (input, arg) {
            if (input instanceof fileEditorInput_1.FileEditorInput) {
                if (arg instanceof uri_1.default) {
                    var deletedResource = arg;
                    if (this.containsResource(input, deletedResource)) {
                        return input;
                    }
                }
                else {
                    var updatedFiles = arg;
                    if (updatedFiles.contains(input.getResource(), files_2.FileChangeType.UPDATED)) {
                        return input;
                    }
                }
            }
            return null;
        };
        FileTracker.prototype.disposeAll = function (deletedResource, history) {
            var _this = this;
            if (this.textFileService.isDirty(deletedResource)) {
                return; // never dispose dirty resources
            }
            // Add existing clients matching resource
            var inputsContainingPath = fileEditorInput_1.FileEditorInput.getAll(deletedResource);
            // Add those from history as well
            for (var i = 0; i < history.length; i++) {
                var element = history[i];
                // File Input
                if (element instanceof fileEditorInput_1.FileEditorInput && this.containsResource(element, deletedResource)) {
                    inputsContainingPath.push(element);
                }
                else if (element instanceof iframeEditorInput_1.IFrameEditorInput && this.containsResource(element, deletedResource)) {
                    inputsContainingPath.push(element);
                }
            }
            // Add those from visible editors too
            var editors = this.editorService.getVisibleEditors();
            editors.forEach(function (editor) {
                var input = editor.input;
                if (input instanceof diffEditorInput_1.DiffEditorInput) {
                    input = _this.getMatchingFileEditorInputFromDiff(input, deletedResource);
                    if (input instanceof fileEditorInput_1.FileEditorInput) {
                        inputsContainingPath.push(input);
                    }
                }
                else if (input instanceof fileEditorInput_1.FileEditorInput && _this.containsResource(input, deletedResource)) {
                    inputsContainingPath.push(input);
                }
                else if (input instanceof iframeEditorInput_1.IFrameEditorInput && _this.containsResource(input, deletedResource)) {
                    inputsContainingPath.push(input);
                }
            });
            // Dispose all
            inputsContainingPath.forEach(function (input) {
                if (!input.isDisposed()) {
                    if (input instanceof fileEditorInput_1.FileEditorInput) {
                        var fileInputToDispose = input;
                        fileInputToDispose.dispose(true /* force */);
                    }
                    else {
                        input.dispose();
                    }
                }
            });
        };
        FileTracker.prototype.containsResource = function (input, resource) {
            var fileResource;
            if (input instanceof fileEditorInput_1.FileEditorInput) {
                fileResource = input.getResource();
            }
            else {
                fileResource = input.getResource();
            }
            if (paths.isEqualOrParent(fileResource.fsPath, resource.fsPath)) {
                return true;
            }
            return false;
        };
        FileTracker.prototype.disposeTextFileModels = function () {
            // To not grow our text file model cache infinitly, we dispose models that
            // are not showing up in any editor and are not in the working file set or dirty.
            var _this = this;
            // Get all cached file models
            textFileEditorModel_1.CACHE.getAll()
                .filter(function (model) { return !_this.workingFiles.hasEntry(model.getResource()) && _this.canDispose(model); })
                .forEach(function (model) { return textFileEditorModel_1.CACHE.dispose(model.getResource()); });
        };
        FileTracker.prototype.canDispose = function (textModel) {
            if (!textModel) {
                return false; // we need data!
            }
            if (textModel.textEditorModel && textModel.textEditorModel.isAttachedToEditor()) {
                return false; // never dispose when attached to editor
            }
            if (textModel.getState() !== textFileEditorModel_1.State.SAVED) {
                return false; // never dispose unsaved models
            }
            if (this.editorService.getVisibleEditors().some(function (e) {
                if (e.input instanceof iframeEditorInput_1.IFrameEditorInput) {
                    var iFrameInputResource = e.input.getResource();
                    return iFrameInputResource && iFrameInputResource.toString() === textModel.getResource().toString();
                }
                return false;
            })) {
                return false; // never dispose models that are used in iframe inputs
            }
            return true;
        };
        FileTracker.prototype.dispose = function () {
            while (this.toUnbind.length) {
                this.toUnbind.pop()();
            }
        };
        // Delay in ms that we wait at minimum before we update a model from a file change event.
        // This reduces the chance that a save from the client triggers an update of the editor.
        FileTracker.FILE_CHANGE_UPDATE_DELAY = 2000;
        FileTracker = __decorate([
            __param(0, event_1.IEventService),
            __param(1, quickOpenService_1.IQuickOpenService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, activityService_1.IActivityService),
            __param(4, files_1.ITextFileService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, untitledEditorService_1.IUntitledEditorService)
        ], FileTracker);
        return FileTracker;
    }());
    exports.FileTracker = FileTracker;
});
//# sourceMappingURL=fileTracker.js.map