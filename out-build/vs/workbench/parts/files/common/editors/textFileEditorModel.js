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
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/common/errors', 'vs/base/common/uri', 'vs/base/common/paths', 'vs/base/common/diagnostics', 'vs/base/common/types', 'vs/editor/common/editorCommon', 'vs/workbench/common/events', 'vs/workbench/parts/files/common/files', 'vs/workbench/common/editor', 'vs/workbench/common/editor/textEditorModel', 'vs/platform/files/common/files', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/editor/common/services/modeService', 'vs/editor/common/services/modelService', 'vs/platform/telemetry/common/telemetry'], function (require, exports, nls, winjs_base_1, errors_1, uri_1, paths, diagnostics, types, editorCommon_1, events_1, files_1, editor_1, textEditorModel_1, files_2, event_1, instantiation_1, message_1, modeService_1, modelService_1, telemetry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var DefaultSaveErrorHandler = (function () {
        function DefaultSaveErrorHandler(messageService) {
            this.messageService = messageService;
        }
        DefaultSaveErrorHandler.prototype.onSaveError = function (error, model) {
            this.messageService.show(message_1.Severity.Error, nls.localize('genericSaveError', "Failed to save '{0}': {1}", paths.basename(model.getResource().fsPath), errors_1.toErrorMessage(error, false)));
        };
        DefaultSaveErrorHandler = __decorate([
            __param(0, message_1.IMessageService)
        ], DefaultSaveErrorHandler);
        return DefaultSaveErrorHandler;
    }());
    // Diagnostics support
    var diag;
    if (!diag) {
        diag = diagnostics.register('TextFileEditorModelDiagnostics', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            console.log(args[1] + ' - ' + args[0] + ' (time: ' + args[2].getTime() + ' [' + args[2].toUTCString() + '])');
        });
    }
    /**
     * States the text text file editor model can be in.
     */
    (function (State) {
        State[State["SAVED"] = 0] = "SAVED";
        State[State["DIRTY"] = 1] = "DIRTY";
        State[State["PENDING_SAVE"] = 2] = "PENDING_SAVE";
        State[State["CONFLICT"] = 3] = "CONFLICT";
        State[State["ERROR"] = 4] = "ERROR";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
    /**
     * The text file editor model listens to changes to its underlying code editor model and saves these changes through the file service back to the disk.
     */
    var TextFileEditorModel = (function (_super) {
        __extends(TextFileEditorModel, _super);
        function TextFileEditorModel(resource, preferredEncoding, messageService, modeService, modelService, eventService, fileService, instantiationService, telemetryService, textFileService) {
            _super.call(this, modelService, modeService);
            this.messageService = messageService;
            this.eventService = eventService;
            this.fileService = fileService;
            this.instantiationService = instantiationService;
            this.telemetryService = telemetryService;
            this.textFileService = textFileService;
            this.resource = resource;
            if (this.resource.scheme !== 'file') {
                throw new Error('TextFileEditorModel can only handle file:// resources.');
            }
            this.preferredEncoding = preferredEncoding;
            this.textModelChangeListener = null;
            this.dirty = false;
            this.autoSavePromises = [];
            this.versionId = 0;
            this.lastDirtyTime = 0;
            this.mapPendingSaveToVersionId = {};
            this.updateAutoSaveConfiguration(textFileService.getAutoSaveConfiguration());
            this.registerListeners();
        }
        TextFileEditorModel.prototype.registerListeners = function () {
            var _this = this;
            this.textFileServiceListener = this.textFileService.onAutoSaveConfigurationChange(function (config) { return _this.updateAutoSaveConfiguration(config); });
        };
        TextFileEditorModel.prototype.updateAutoSaveConfiguration = function (config) {
            if (typeof config.autoSaveDelay === 'number' && config.autoSaveDelay > 0) {
                this.autoSaveAfterMillies = config.autoSaveDelay;
                this.autoSaveAfterMilliesEnabled = true;
            }
            else {
                this.autoSaveAfterMillies = void 0;
                this.autoSaveAfterMilliesEnabled = false;
            }
        };
        /**
         * Set a save error handler to install code that executes when save errors occur.
         */
        TextFileEditorModel.setSaveErrorHandler = function (handler) {
            TextFileEditorModel.saveErrorHandler = handler;
        };
        /**
         * When set, will disable any saving (including auto save) until the model is loaded again. This allows to resolve save conflicts
         * without running into subsequent save errors when editing the model.
         */
        TextFileEditorModel.prototype.setConflictResolutionMode = function () {
            diag('setConflictResolutionMode() - enabled conflict resolution mode', this.resource, new Date());
            this.inConflictResolutionMode = true;
        };
        /**
         * Answers if this model is currently in conflic resolution mode or not.
         */
        TextFileEditorModel.prototype.isInConflictResolutionMode = function () {
            return this.inConflictResolutionMode;
        };
        /**
         * Discards any local changes and replaces the model with the contents of the version on disk.
         */
        TextFileEditorModel.prototype.revert = function () {
            var _this = this;
            if (!this.isResolved()) {
                return winjs_base_1.TPromise.as(null);
            }
            // Cancel any running auto-saves
            this.cancelAutoSavePromises();
            // Be prepared to send out a file change event in case reverting changes anything
            var oldStat = this.cloneStat(this.versionOnDiskStat);
            // Unset flags
            var undo = this.setDirty(false);
            // Reload
            return this.load(true /* force */).then(function () {
                // Emit file change event
                _this.emitEvent(files_1.EventType.FILE_REVERTED, new files_1.TextFileChangeEvent(_this.textEditorModel, oldStat, _this.versionOnDiskStat));
            }, function (error) {
                // FileNotFound means the file got deleted meanwhile, so emit revert event because thats ok
                if (error.fileOperationResult === files_2.FileOperationResult.FILE_NOT_FOUND) {
                    _this.emitEvent(files_1.EventType.FILE_REVERTED, new files_1.TextFileChangeEvent(_this.textEditorModel, oldStat, _this.versionOnDiskStat));
                }
                else {
                    undo();
                }
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TextFileEditorModel.prototype.load = function (force /* bypass any caches and really go to disk */) {
            var _this = this;
            diag('load() - enter', this.resource, new Date());
            // It is very important to not reload the model when the model is dirty. We only want to reload the model from the disk
            // if no save is pending to avoid data loss. This might cause a save conflict in case the file has been modified on the disk
            // meanwhile, but this is a very low risk.
            if (this.dirty) {
                diag('load() - exit - without loading because model is dirty', this.resource, new Date());
                return winjs_base_1.TPromise.as(this);
            }
            // Decide on etag
            var etag;
            if (force) {
                etag = undefined; // bypass cache if force loading is true
            }
            else if (this.versionOnDiskStat) {
                etag = this.versionOnDiskStat.etag; // otherwise respect etag to support caching
            }
            // Resolve Content
            return this.fileService.resolveContent(this.resource, { acceptTextOnly: true, etag: etag, encoding: this.preferredEncoding }).then(function (content) {
                diag('load() - resolved content', _this.resource, new Date());
                // Telemetry
                _this.telemetryService.publicLog('fileGet', { mimeType: content.mime, ext: paths.extname(_this.resource.fsPath), path: telemetry_1.anonymize(_this.resource.fsPath) });
                // Update our resolved disk stat model
                var resolvedStat = {
                    resource: _this.resource,
                    name: content.name,
                    mtime: content.mtime,
                    etag: content.etag,
                    mime: content.mime,
                    isDirectory: false,
                    hasChildren: false,
                    children: void 0,
                };
                _this.updateVersionOnDiskStat(resolvedStat);
                // Keep the original encoding to not loose it when saving
                var oldEncoding = _this.contentEncoding;
                _this.contentEncoding = content.encoding;
                // Handle events if encoding changed
                if (_this.preferredEncoding) {
                    _this.updatePreferredEncoding(_this.contentEncoding); // make sure to reflect the real encoding of the file (never out of sync)
                }
                else if (oldEncoding !== _this.contentEncoding) {
                    _this.eventService.emit(events_1.EventType.RESOURCE_ENCODING_CHANGED, new events_1.ResourceEvent(_this.resource));
                }
                // Update Existing Model
                if (_this.textEditorModel) {
                    diag('load() - updated text editor model', _this.resource, new Date());
                    _this.setDirty(false); // Ensure we are not tracking a stale state
                    _this.blockModelContentChange = true;
                    try {
                        _this.updateTextEditorModel(content.value);
                    }
                    finally {
                        _this.blockModelContentChange = false;
                    }
                    return winjs_base_1.TPromise.as(_this);
                }
                else if (_this.createTextEditorModelPromise) {
                    diag('load() - join existing text editor model promise', _this.resource, new Date());
                    return _this.createTextEditorModelPromise;
                }
                else {
                    diag('load() - created text editor model', _this.resource, new Date());
                    _this.createTextEditorModelPromise = _this.createTextEditorModel(content.value, content.resource).then(function () {
                        _this.createTextEditorModelPromise = null;
                        _this.setDirty(false); // Ensure we are not tracking a stale state
                        _this.textModelChangeListener = _this.textEditorModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) { return _this.onModelContentChanged(e); });
                        return _this;
                    }, function (error) {
                        _this.createTextEditorModelPromise = null;
                        return winjs_base_1.TPromise.wrapError(error);
                    });
                    return _this.createTextEditorModelPromise;
                }
            }, function (error) {
                // NotModified status code is expected and can be handled gracefully
                if (error.fileOperationResult === files_2.FileOperationResult.FILE_NOT_MODIFIED_SINCE) {
                    _this.setDirty(false); // Ensure we are not tracking a stale state
                    return winjs_base_1.TPromise.as(_this);
                }
                // Otherwise bubble up the error
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TextFileEditorModel.prototype.getOrCreateMode = function (modeService, preferredModeIds, firstLineText) {
            return modeService.getOrCreateModeByFilenameOrFirstLine(this.resource.fsPath, firstLineText);
        };
        TextFileEditorModel.prototype.onModelContentChanged = function (e) {
            diag('onModelContentChanged(' + e.changeType + ') - enter', this.resource, new Date());
            // In any case increment the version id because it tracks the textual content state of the model at all times
            this.versionId++;
            diag('onModelContentChanged() - new versionId ' + this.versionId, this.resource, new Date());
            // Ignore if blocking model changes
            if (this.blockModelContentChange) {
                return;
            }
            // The contents changed as a matter of Undo and the version reached matches the saved one
            // In this case we clear the dirty flag and emit a SAVED event to indicate this state.
            // Note: we currently only do this check when auto-save is turned off because there you see
            // a dirty indicator that you want to get rid of when undoing to the saved version.
            if (!this.autoSaveAfterMilliesEnabled && this.textEditorModel.getAlternativeVersionId() === this.bufferSavedVersionId) {
                diag('onModelContentChanged() - model content changed back to last saved version', this.resource, new Date());
                // Clear flags
                this.setDirty(false);
                // Emit event
                this.emitEvent(files_1.EventType.FILE_REVERTED, new files_1.TextFileChangeEvent(this.textEditorModel, this.versionOnDiskStat));
                return;
            }
            diag('onModelContentChanged() - model content changed and marked as dirty', this.resource, new Date());
            // Mark as dirty
            this.makeDirty(e);
            // Start auto save process unless we are in conflict resolution mode and unless it is disabled
            if (this.autoSaveAfterMilliesEnabled) {
                if (!this.inConflictResolutionMode) {
                    this.doAutoSave(this.versionId);
                }
                else {
                    diag('makeDirty() - prevented save because we are in conflict resolution mode', this.resource, new Date());
                }
            }
        };
        TextFileEditorModel.prototype.makeDirty = function (e) {
            // Track dirty state and version id
            var wasDirty = this.dirty;
            this.setDirty(true);
            this.lastDirtyTime = new Date().getTime();
            // Emit as Event if we turned dirty
            if (!wasDirty) {
                var stat = this.cloneStat(this.versionOnDiskStat);
                this.emitEvent(files_1.EventType.FILE_DIRTY, new files_1.TextFileChangeEvent(this.textEditorModel, stat, stat, e));
            }
        };
        TextFileEditorModel.prototype.doAutoSave = function (versionId) {
            var _this = this;
            diag('doAutoSave() - enter for versionId ' + versionId, this.resource, new Date());
            // Cancel any currently running auto saves to make this the one that succeeds
            this.cancelAutoSavePromises();
            // Create new save promise and keep it
            var promise = winjs_base_1.TPromise.timeout(this.autoSaveAfterMillies).then(function () {
                // Only trigger save if the version id has not changed meanwhile
                if (versionId === _this.versionId) {
                    _this.doSave(versionId, true); // Very important here to not return the promise because if the timeout promise is canceled it will bubble up the error otherwise - do not change
                }
            });
            this.autoSavePromises.push(promise);
            return promise;
        };
        TextFileEditorModel.prototype.cancelAutoSavePromises = function () {
            while (this.autoSavePromises.length) {
                this.autoSavePromises.pop().cancel();
            }
        };
        /**
         * Saves the current versionId of this editor model if it is dirty.
         */
        TextFileEditorModel.prototype.save = function (overwriteReadonly, overwriteEncoding) {
            if (!this.isResolved()) {
                return winjs_base_1.TPromise.as(null);
            }
            diag('save() - enter', this.resource, new Date());
            // Cancel any currently running auto saves to make this the one that succeeds
            this.cancelAutoSavePromises();
            return this.doSave(this.versionId, false, overwriteReadonly, overwriteEncoding);
        };
        TextFileEditorModel.prototype.doSave = function (versionId, isAutoSave, overwriteReadonly, overwriteEncoding) {
            var _this = this;
            diag('doSave(' + versionId + ') - enter with versionId ' + versionId, this.resource, new Date());
            // Lookup any running pending save for this versionId and return it if found
            var pendingSave = this.mapPendingSaveToVersionId[versionId];
            if (pendingSave) {
                diag('doSave(' + versionId + ') - exit - found a pending save for versionId ' + versionId, this.resource, new Date());
                return pendingSave;
            }
            // Return early if not dirty or version changed meanwhile
            if (!this.dirty || versionId !== this.versionId) {
                diag('doSave(' + versionId + ') - exit - because not dirty and/or versionId is different (this.isDirty: ' + this.dirty + ', this.versionId: ' + this.versionId + ')', this.resource, new Date());
                return winjs_base_1.TPromise.as(null);
            }
            // Return if currently saving by scheduling another auto save. Never ever must 2 saves execute at the same time because
            // this can lead to dirty writes and race conditions
            if (this.isBusySaving()) {
                diag('doSave(' + versionId + ') - exit - because busy saving', this.resource, new Date());
                // Avoid endless loop here and guard if auto save is disabled
                if (this.autoSaveAfterMilliesEnabled) {
                    return this.doAutoSave(versionId);
                }
            }
            // Push all edit operations to the undo stack so that the user has a chance to
            // Ctrl+Z back to the saved version. We only do this when auto-save is turned off
            if (!this.autoSaveAfterMilliesEnabled) {
                this.textEditorModel.pushStackElement();
            }
            // Emit file saving event: Listeners can still change the model now and since we are so close to saving
            // we do not want to trigger another auto save or similar, so we block this
            // In addition we update our version right after in case it changed because of a model change
            var versionOnDiskStatClone = this.cloneStat(this.versionOnDiskStat);
            this.blockModelContentChange = true;
            try {
                var saveEvent = new files_1.TextFileChangeEvent(this.textEditorModel, versionOnDiskStatClone);
                saveEvent.setAutoSaved(isAutoSave);
                this.emitEvent(files_1.EventType.FILE_SAVING, saveEvent);
            }
            finally {
                this.blockModelContentChange = false;
            }
            versionId = this.versionId;
            // Clear error flag since we are trying to save again
            this.inErrorMode = false;
            // Save to Disk
            diag('doSave(' + versionId + ') - before updateContent()', this.resource, new Date());
            this.mapPendingSaveToVersionId[versionId] = this.fileService.updateContent(this.versionOnDiskStat.resource, this.getValue(), {
                overwriteReadonly: overwriteReadonly,
                overwriteEncoding: overwriteEncoding,
                mtime: this.versionOnDiskStat.mtime,
                encoding: this.getEncoding(),
                etag: this.versionOnDiskStat.etag
            }).then(function (stat) {
                diag('doSave(' + versionId + ') - after updateContent()', _this.resource, new Date());
                // Telemetry
                _this.telemetryService.publicLog('filePUT', { mimeType: stat.mime, ext: paths.extname(_this.versionOnDiskStat.resource.fsPath) });
                // Remove from pending saves
                delete _this.mapPendingSaveToVersionId[versionId];
                // Update dirty state unless model has changed meanwhile
                if (versionId === _this.versionId) {
                    diag('doSave(' + versionId + ') - setting dirty to false because versionId did not change', _this.resource, new Date());
                    _this.setDirty(false);
                }
                else {
                    diag('doSave(' + versionId + ') - not setting dirty to false because versionId did change meanwhile', _this.resource, new Date());
                }
                // Updated resolved stat with updated stat, and keep old for event
                var oldStat = _this.versionOnDiskStat;
                _this.updateVersionOnDiskStat(stat);
                // Emit File Change Event
                var oldValue = _this.cloneStat(oldStat);
                var newValue = _this.cloneStat(_this.versionOnDiskStat);
                _this.emitEvent('files.internal:fileChanged', new files_1.TextFileChangeEvent(_this.textEditorModel, oldValue, newValue));
                // Emit File Saved Event
                _this.emitEvent(files_1.EventType.FILE_SAVED, new files_1.TextFileChangeEvent(_this.textEditorModel, oldValue, newValue));
            }, function (error) {
                diag('doSave(' + versionId + ') - exit - resulted in a save error: ' + error.toString(), _this.resource, new Date());
                // Remove from pending saves
                delete _this.mapPendingSaveToVersionId[versionId];
                // Flag as error state
                _this.inErrorMode = true;
                // Show to user
                _this.onSaveError(error);
                // Emit as event
                _this.emitEvent(files_1.EventType.FILE_SAVE_ERROR, new files_1.TextFileChangeEvent(_this.textEditorModel, versionOnDiskStatClone));
            });
            return this.mapPendingSaveToVersionId[versionId];
        };
        TextFileEditorModel.prototype.setDirty = function (dirty) {
            var _this = this;
            var wasDirty = this.dirty;
            var wasInConflictResolutionMode = this.inConflictResolutionMode;
            var wasInErrorMode = this.inErrorMode;
            var oldBufferSavedVersionId = this.bufferSavedVersionId;
            if (!dirty) {
                this.dirty = false;
                this.inConflictResolutionMode = false;
                this.inErrorMode = false;
                // we remember the models alternate version id to remember when the version
                // of the model matches with the saved version on disk. we need to keep this
                // in order to find out if the model changed back to a saved version (e.g.
                // when undoing long enough to reach to a version that is saved and then to
                // clear the dirty flag)
                if (this.textEditorModel) {
                    this.bufferSavedVersionId = this.textEditorModel.getAlternativeVersionId();
                }
            }
            else {
                this.dirty = true;
            }
            // Return function to revert this call
            return function () {
                _this.dirty = wasDirty;
                _this.inConflictResolutionMode = wasInConflictResolutionMode;
                _this.inErrorMode = wasInErrorMode;
                _this.bufferSavedVersionId = oldBufferSavedVersionId;
            };
        };
        TextFileEditorModel.prototype.updateVersionOnDiskStat = function (newVersionOnDiskStat) {
            // First resolve - just take
            if (!this.versionOnDiskStat) {
                this.versionOnDiskStat = newVersionOnDiskStat;
            }
            else if (this.versionOnDiskStat.mtime <= newVersionOnDiskStat.mtime) {
                this.versionOnDiskStat = newVersionOnDiskStat;
            }
        };
        TextFileEditorModel.prototype.onSaveError = function (error) {
            // Prepare handler
            if (!TextFileEditorModel.saveErrorHandler) {
                TextFileEditorModel.setSaveErrorHandler(this.instantiationService.createInstance(DefaultSaveErrorHandler));
            }
            // Handle
            TextFileEditorModel.saveErrorHandler.onSaveError(error, this);
        };
        TextFileEditorModel.prototype.emitEvent = function (type, event) {
            try {
                this.eventService.emit(type, event);
            }
            catch (e) {
                e.friendlyMessage = nls.localize('unexpectedEventError', "An unexpected error was thrown from a file change listener of type: {0}", type);
                errors_1.onUnexpectedError(e);
            }
        };
        TextFileEditorModel.prototype.isBusySaving = function () {
            return !types.isEmptyObject(this.mapPendingSaveToVersionId);
        };
        /**
         * Returns true if the content of this model has changes that are not yet saved back to the disk.
         */
        TextFileEditorModel.prototype.isDirty = function () {
            return this.dirty;
        };
        /**
         * Returns the time in millies when this working copy was edited by the user.
         */
        TextFileEditorModel.prototype.getLastDirtyTime = function () {
            return this.lastDirtyTime;
        };
        /**
         * Returns the time in millies when this working copy was last modified by the user or some other program.
         */
        TextFileEditorModel.prototype.getLastModifiedTime = function () {
            return this.versionOnDiskStat ? this.versionOnDiskStat.mtime : -1;
        };
        /**
         * Returns the state this text text file editor model is in with regards to changes and saving.
         */
        TextFileEditorModel.prototype.getState = function () {
            if (this.inConflictResolutionMode) {
                return State.CONFLICT;
            }
            if (this.inErrorMode) {
                return State.ERROR;
            }
            if (!this.dirty) {
                return State.SAVED;
            }
            if (this.isBusySaving()) {
                return State.PENDING_SAVE;
            }
            if (this.dirty) {
                return State.DIRTY;
            }
        };
        TextFileEditorModel.prototype.getEncoding = function () {
            return this.preferredEncoding || this.contentEncoding;
        };
        TextFileEditorModel.prototype.setEncoding = function (encoding, mode) {
            if (!this.isNewEncoding(encoding)) {
                return; // return early if the encoding is already the same
            }
            // Encode: Save with encoding
            if (mode === editor_1.EncodingMode.Encode) {
                this.updatePreferredEncoding(encoding);
                // Save
                if (!this.isDirty()) {
                    this.versionId++; // needs to increment because we change the model potentially
                    this.makeDirty();
                }
                if (!this.inConflictResolutionMode) {
                    this.save(false, true /* overwriteEncoding due to forced encoding change */).done(null, errors_1.onUnexpectedError);
                }
            }
            else {
                if (this.isDirty()) {
                    this.messageService.show(message_1.Severity.Info, nls.localize('saveFileFirst', "The file is dirty. Please save it first before reopening it with another encoding."));
                    return;
                }
                this.updatePreferredEncoding(encoding);
                // Load
                this.load(true /* force because encoding has changed */).done(null, errors_1.onUnexpectedError);
            }
        };
        TextFileEditorModel.prototype.updatePreferredEncoding = function (encoding) {
            if (!this.isNewEncoding(encoding)) {
                return;
            }
            this.preferredEncoding = encoding;
            // Emit
            this.eventService.emit(events_1.EventType.RESOURCE_ENCODING_CHANGED, new events_1.ResourceEvent(this.resource));
        };
        TextFileEditorModel.prototype.isNewEncoding = function (encoding) {
            if (this.preferredEncoding === encoding) {
                return false; // return early if the encoding is already the same
            }
            if (!this.preferredEncoding && this.contentEncoding === encoding) {
                return false; // also return if we don't have a preferred encoding but the content encoding is already the same
            }
            return true;
        };
        TextFileEditorModel.prototype.isResolved = function () {
            return !types.isUndefinedOrNull(this.versionOnDiskStat);
        };
        /**
         * Returns true if the dispose() method of this model has been called.
         */
        TextFileEditorModel.prototype.isDisposed = function () {
            return this.disposed;
        };
        /**
         * Returns the full resource URI of the file this text file editor model is about.
         */
        TextFileEditorModel.prototype.getResource = function () {
            return this.resource;
        };
        TextFileEditorModel.prototype.dispose = function () {
            this.disposed = true;
            this.inConflictResolutionMode = false;
            this.inErrorMode = false;
            this.createTextEditorModelPromise = null;
            if (this.textModelChangeListener) {
                this.textModelChangeListener();
                this.textModelChangeListener = null;
            }
            if (this.textFileServiceListener) {
                this.textFileServiceListener.dispose();
                this.textFileServiceListener = null;
            }
            this.cancelAutoSavePromises();
            exports.CACHE.remove(this.resource);
            _super.prototype.dispose.call(this);
        };
        TextFileEditorModel.prototype.cloneStat = function (stat) {
            return {
                resource: uri_1.default.parse(stat.resource.toString()),
                name: stat.name,
                mtime: stat.mtime,
                etag: stat.etag,
                mime: stat.mime,
                isDirectory: stat.isDirectory,
                hasChildren: stat.hasChildren,
                children: stat.children
            };
        };
        TextFileEditorModel.ID = 'workbench.editors.files.textFileEditorModel';
        TextFileEditorModel = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, modeService_1.IModeService),
            __param(4, modelService_1.IModelService),
            __param(5, event_1.IEventService),
            __param(6, files_2.IFileService),
            __param(7, instantiation_1.IInstantiationService),
            __param(8, telemetry_1.ITelemetryService),
            __param(9, files_1.ITextFileService)
        ], TextFileEditorModel);
        return TextFileEditorModel;
    }(textEditorModel_1.BaseTextEditorModel));
    exports.TextFileEditorModel = TextFileEditorModel;
    var TextFileEditorModelCache = (function () {
        function TextFileEditorModelCache() {
            this.mapResourcePathToModel = Object.create(null);
        }
        TextFileEditorModelCache.prototype.dispose = function (resource) {
            var model = this.get(resource);
            if (model) {
                if (model.isDirty()) {
                    return; // we never dispose dirty models to avoid data loss
                }
                model.dispose();
            }
        };
        TextFileEditorModelCache.prototype.get = function (resource) {
            return this.mapResourcePathToModel[resource.toString()];
        };
        TextFileEditorModelCache.prototype.getAll = function (resource) {
            var _this = this;
            return Object.keys(this.mapResourcePathToModel)
                .filter(function (r) { return !resource || resource.toString() === r; })
                .map(function (r) { return _this.mapResourcePathToModel[r]; });
        };
        TextFileEditorModelCache.prototype.add = function (resource, model) {
            this.mapResourcePathToModel[resource.toString()] = model;
        };
        // Clients should not call this method
        TextFileEditorModelCache.prototype.clear = function () {
            this.mapResourcePathToModel = Object.create(null);
        };
        // Clients should not call this method
        TextFileEditorModelCache.prototype.remove = function (resource) {
            delete this.mapResourcePathToModel[resource.toString()];
        };
        return TextFileEditorModelCache;
    }());
    exports.TextFileEditorModelCache = TextFileEditorModelCache;
    exports.CACHE = new TextFileEditorModelCache();
});
