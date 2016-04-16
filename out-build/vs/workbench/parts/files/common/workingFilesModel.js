var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/arrays', 'vs/base/common/uri', 'vs/base/common/event', 'vs/base/common/paths', 'vs/base/common/errors', 'vs/base/common/labels', 'vs/base/common/lifecycle', 'vs/workbench/parts/files/common/files', 'vs/platform/files/common/files', 'vs/workbench/common/events', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/part/common/partService', 'vs/workbench/services/workspace/common/contextService', 'vs/workbench/common/editor', 'vs/platform/storage/common/storage', 'vs/platform/event/common/event'], function (require, exports, arrays, uri_1, event_1, paths, errors, labels, lifecycle_1, files_1, files_2, events_1, untitledEditorService_1, editorService_1, partService_1, contextService_1, editor_1, storage_1, event_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WorkingFilesModel = (function () {
        function WorkingFilesModel(storageService, eventService, partService, contextService, editorService, untitledEditorService, textFileService) {
            this.storageService = storageService;
            this.eventService = eventService;
            this.partService = partService;
            this.contextService = contextService;
            this.editorService = editorService;
            this.untitledEditorService = untitledEditorService;
            this.textFileService = textFileService;
            this.pathLabelProvider = new labels.PathLabelProvider(this.contextService);
            this.entries = [];
            this.toDispose = [];
            this.mapEntryToResource = Object.create(null);
            this._onModelChange = new event_1.Emitter();
            this._onWorkingFileChange = new event_1.Emitter();
            this.load();
            this.registerListeners();
        }
        WorkingFilesModel.prototype.registerListeners = function () {
            var _this = this;
            // listen to global file changes to clean up model
            this.toDispose.push(this.eventService.addListener2('files.internal:fileChanged', function (e) { return _this.onLocalFileChange(e); }));
            this.toDispose.push(this.eventService.addListener2(files_2.EventType.FILE_CHANGES, function (e) { return _this.onFileChanges(e); }));
            // listen to untitled
            this.toDispose.push(this.eventService.addListener2(events_1.EventType.UNTITLED_FILE_DIRTY, function (e) { return _this.onUntitledFileDirty(e); }));
            this.toDispose.push(this.eventService.addListener2(events_1.EventType.UNTITLED_FILE_DELETED, function (e) { return _this.onUntitledFileDeleted(e); }));
            // listen to files being changed locally
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_DIRTY, function (e) { return _this.onTextFileDirty(e); }));
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_SAVE_ERROR, function (e) { return _this.onTextFileSaveError(e); }));
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_SAVED, function (e) { return _this.onTextFileSaved(e); }));
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_REVERTED, function (e) { return _this.onTextFileReverted(e); }));
            // clean up model on set input error
            this.toDispose.push(this.eventService.addListener2(events_1.EventType.EDITOR_SET_INPUT_ERROR, function (e) { return _this.onEditorInputSetError(e); }));
        };
        WorkingFilesModel.prototype.onUntitledFileDirty = function (e) {
            this.updateDirtyState(e.resource, true);
        };
        WorkingFilesModel.prototype.onUntitledFileDeleted = function (e) {
            var entry = this.mapEntryToResource[e.resource.toString()];
            if (entry) {
                this.removeEntry(entry);
            }
        };
        WorkingFilesModel.prototype.onTextFileDirty = function (e) {
            if (this.textFileService.getAutoSaveMode() !== files_1.AutoSaveMode.AFTER_SHORT_DELAY) {
                this.updateDirtyState(e.getAfter().resource, true); // no indication needed when auto save is enabled for short delay
            }
            else {
                this.addEntry(e.getAfter().resource);
            }
        };
        WorkingFilesModel.prototype.onTextFileSaveError = function (e) {
            this.updateDirtyState(e.getAfter().resource, true);
        };
        WorkingFilesModel.prototype.onTextFileSaved = function (e) {
            this.updateDirtyState(e.getAfter().resource, false);
        };
        WorkingFilesModel.prototype.onTextFileReverted = function (e) {
            if (this.hasEntry(e.getAfter().resource)) {
                this.updateDirtyState(e.getAfter().resource, false);
            }
        };
        WorkingFilesModel.prototype.updateDirtyState = function (resource, isDirty) {
            // Add to model
            var entry = this.addEntry(resource);
            // Toggle dirty
            var oldDirty = entry.dirty;
            entry.setDirty(isDirty);
            if (oldDirty !== isDirty) {
                this.fireWorkingFileChange(entry);
            }
        };
        WorkingFilesModel.prototype.onLocalFileChange = function (e) {
            if (e.gotMoved()) {
                this.moveEntry(e.getBefore().resource, e.getAfter().resource);
            }
        };
        WorkingFilesModel.prototype.onFileChanges = function (e) {
            for (var resource in this.mapEntryToResource) {
                var entry = this.mapEntryToResource[resource];
                if (!entry.dirty && e.contains(uri_1.default.parse(resource), files_2.FileChangeType.DELETED)) {
                    this.removeEntry(entry);
                }
            }
        };
        WorkingFilesModel.prototype.onEditorInputSetError = function (e) {
            var fileInput = editor_1.asFileEditorInput(e.editorInput);
            if (fileInput) {
                var entry = this.mapEntryToResource[fileInput.getResource().toString()];
                if (entry && !entry.dirty) {
                    this.removeEntry(fileInput.getResource());
                }
            }
        };
        Object.defineProperty(WorkingFilesModel.prototype, "onModelChange", {
            get: function () {
                return this._onModelChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkingFilesModel.prototype, "onWorkingFileChange", {
            get: function () {
                return this._onWorkingFileChange.event;
            },
            enumerable: true,
            configurable: true
        });
        WorkingFilesModel.prototype.getEntries = function (excludeOutOfContext) {
            return this.entries;
        };
        WorkingFilesModel.prototype.first = function () {
            if (!this.entries.length) {
                return null;
            }
            return this.entries.slice(0).sort(WorkingFilesModel.compare)[0];
        };
        WorkingFilesModel.prototype.last = function () {
            if (!this.entries.length) {
                return null;
            }
            return this.entries.slice(0).sort(WorkingFilesModel.compare)[this.entries.length - 1];
        };
        WorkingFilesModel.prototype.next = function (start) {
            var entry = start && this.findEntry(start);
            if (entry) {
                var sorted = this.entries.slice(0).sort(WorkingFilesModel.compare);
                var index = sorted.indexOf(entry);
                if (index + 1 < sorted.length) {
                    return sorted[index + 1];
                }
            }
            return this.first();
        };
        WorkingFilesModel.prototype.previous = function (start) {
            var entry = start && this.findEntry(start);
            if (entry) {
                var sorted = this.entries.slice(0).sort(WorkingFilesModel.compare);
                var index = sorted.indexOf(entry);
                if (index > 0) {
                    return sorted[index - 1];
                }
            }
            return this.last();
        };
        WorkingFilesModel.prototype.getOutOfWorkspaceContextEntries = function () {
            var _this = this;
            return this.entries.filter(function (entry) { return _this.isOutOfWorkspace(entry.resource); });
        };
        WorkingFilesModel.prototype.isOutOfWorkspace = function (resource) {
            if (resource.scheme !== 'file') {
                return false;
            }
            var workspace = this.contextService.getWorkspace();
            return !workspace || !paths.isEqualOrParent(resource.fsPath, workspace.resource.fsPath);
        };
        WorkingFilesModel.prototype.count = function () {
            return this.entries.length;
        };
        WorkingFilesModel.prototype.addEntry = function (arg1) {
            var resource;
            if (arg1 instanceof WorkingFileEntry) {
                resource = arg1.resource;
            }
            else if (arg1 instanceof uri_1.default) {
                resource = arg1;
            }
            else {
                resource = arg1.resource;
            }
            var existing = this.findEntry(resource);
            if (existing) {
                return existing;
            }
            var entry;
            if (arg1 instanceof WorkingFileEntry) {
                entry = arg1;
            }
            else {
                entry = this.createEntry(resource);
            }
            this.entries.push(entry);
            this.mapEntryToResource[entry.resource.toString()] = entry;
            this.fireModelChange({ added: [entry] });
            return entry;
        };
        WorkingFilesModel.prototype.createEntry = function (resource, index, dirty) {
            return new WorkingFileEntry(resource, typeof index === 'number' ? index : this.entries.length, dirty);
        };
        WorkingFilesModel.prototype.moveEntry = function (oldResource, newResource) {
            var oldEntry = this.findEntry(oldResource);
            if (oldEntry && !this.findEntry(newResource)) {
                // Add new with properties from old one
                var newEntry = this.createEntry(newResource, oldEntry.index, oldEntry.dirty);
                this.entries.push(newEntry);
                this.mapEntryToResource[newResource.toString()] = newEntry;
                // Remove old
                this.entries.splice(this.entries.indexOf(oldEntry), 1);
                delete this.mapEntryToResource[oldResource.toString()];
                this.fireModelChange({ added: [newEntry], removed: [oldEntry] });
            }
        };
        WorkingFilesModel.prototype.removeEntry = function (arg1) {
            var resource = arg1 instanceof WorkingFileEntry ? arg1.resource : arg1;
            var index = this.indexOf(resource);
            if (index >= 0) {
                // Remove entry
                var removed = this.entries.splice(index, 1)[0];
                delete this.mapEntryToResource[resource.toString()];
                // Rebalance index
                var sortedEntries = this.entries.slice(0).sort(WorkingFilesModel.compare);
                var newTopIndex = 0;
                for (var i = 0; i < sortedEntries.length; i++) {
                    if (sortedEntries[i] === removed) {
                        continue;
                    }
                    sortedEntries[i].setIndex(newTopIndex++);
                }
                this.fireModelChange({ removed: [removed] });
                return removed;
            }
            return null;
        };
        WorkingFilesModel.prototype.reorder = function (source, target) {
            var sortedEntries = this.entries.slice(0).sort(WorkingFilesModel.compare);
            var indexOfSource = sortedEntries.indexOf(source);
            var indexOfTarget = sortedEntries.indexOf(target);
            arrays.move(sortedEntries, indexOfSource, indexOfTarget);
            // Rebalance index
            var newTopIndex = 0;
            for (var i = 0; i < sortedEntries.length; i++) {
                sortedEntries[i].setIndex(newTopIndex++);
            }
            // Fire event
            this.fireModelChange({});
        };
        WorkingFilesModel.prototype.clear = function () {
            var deleted = this.entries;
            this.entries = [];
            this.mapEntryToResource = Object.create(null);
            this.fireModelChange({ removed: deleted });
        };
        WorkingFilesModel.prototype.hasEntry = function (resource) {
            return !!this.findEntry(resource);
        };
        WorkingFilesModel.prototype.findEntry = function (resource) {
            return this.mapEntryToResource[resource.toString()];
        };
        WorkingFilesModel.prototype.indexOf = function (resource) {
            var entry = this.findEntry(resource);
            if (entry) {
                return this.entries.indexOf(entry);
            }
            return -1;
        };
        WorkingFilesModel.prototype.shutdown = function () {
            var sortedEntries = this.entries.slice(0).sort(WorkingFilesModel.compare);
            var index = 0;
            var entries = [];
            sortedEntries.forEach(function (entry) {
                if (!entry.isUntitled) {
                    entries.push({
                        resource: entry.resource.toString(),
                        index: index++
                    });
                }
            });
            this.storageService.store(WorkingFilesModel.STORAGE_KEY, JSON.stringify(entries), storage_1.StorageScope.WORKSPACE);
        };
        WorkingFilesModel.prototype.load = function () {
            var _this = this;
            // Load from settings
            var modelRaw = this.storageService.get(WorkingFilesModel.STORAGE_KEY, storage_1.StorageScope.WORKSPACE);
            if (modelRaw) {
                var model = JSON.parse(modelRaw);
                model.forEach(function (entry) {
                    _this.addEntry(new WorkingFileEntry(uri_1.default.parse(entry.resource), entry.index, false));
                });
            }
            // Add those that are set to open on startup
            var options = this.contextService.getOptions();
            var files = (options && options.filesToOpen) || [];
            if (options && options.filesToDiff) {
                files.push.apply(files, options.filesToDiff);
            }
            arrays
                .distinct(files, function (r) { return r.resource.toString(); }) // no duplicates
                .map(function (f) { return f.resource; }) // just the resource
                .filter(function (r) { return r.scheme === 'untitled' || _this.isOutOfWorkspace(r); }) // untitled or out of workspace
                .forEach(function (r) {
                _this.addEntry(r);
            });
            // Add untitled ones (after joinCreation() to make sure we catch everything)
            this.partService.joinCreation().done(function () {
                if (_this.untitledEditorService) {
                    _this.untitledEditorService.getAll().map(function (u) { return u.getResource(); })
                        .filter(function (r) { return !_this.untitledEditorService.hasAssociatedFilePath(r); }) // only those without association
                        .forEach(function (r) {
                        _this.addEntry(r);
                    });
                }
            }, errors.onUnexpectedError);
        };
        WorkingFilesModel.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        WorkingFilesModel.prototype.fireModelChange = function (event) {
            this._onModelChange.fire(event);
        };
        WorkingFilesModel.prototype.fireWorkingFileChange = function (file) {
            this._onWorkingFileChange.fire(file);
        };
        WorkingFilesModel.compare = function (element, otherElement) {
            return element.index - otherElement.index;
        };
        WorkingFilesModel.STORAGE_KEY = 'workingFiles.model.entries';
        WorkingFilesModel = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, event_2.IEventService),
            __param(2, partService_1.IPartService),
            __param(3, contextService_1.IWorkspaceContextService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, untitledEditorService_1.IUntitledEditorService),
            __param(6, files_1.ITextFileService)
        ], WorkingFilesModel);
        return WorkingFilesModel;
    }());
    exports.WorkingFilesModel = WorkingFilesModel;
    var WorkingFileEntry = (function () {
        function WorkingFileEntry(resource, index, dirty) {
            this._resource = resource;
            this._index = index;
            this._dirty = dirty;
        }
        Object.defineProperty(WorkingFileEntry.prototype, "resource", {
            get: function () {
                return this._resource;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkingFileEntry.prototype, "index", {
            get: function () {
                return this._index;
            },
            enumerable: true,
            configurable: true
        });
        WorkingFileEntry.prototype.setIndex = function (index) {
            this._index = index;
        };
        Object.defineProperty(WorkingFileEntry.prototype, "dirty", {
            get: function () {
                return this._dirty;
            },
            enumerable: true,
            configurable: true
        });
        WorkingFileEntry.prototype.setDirty = function (dirty) {
            this._dirty = dirty;
        };
        Object.defineProperty(WorkingFileEntry.prototype, "CLASS_ID", {
            get: function () {
                return files_1.WORKING_FILES_MODEL_ENTRY_CLASS_ID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkingFileEntry.prototype, "isFile", {
            get: function () {
                return this._resource.scheme === 'file';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkingFileEntry.prototype, "isUntitled", {
            get: function () {
                return this._resource.scheme === 'untitled';
            },
            enumerable: true,
            configurable: true
        });
        return WorkingFileEntry;
    }());
    exports.WorkingFileEntry = WorkingFileEntry;
});
