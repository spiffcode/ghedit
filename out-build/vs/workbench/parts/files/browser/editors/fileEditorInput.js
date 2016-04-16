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
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/platform/platform', 'vs/base/common/types', 'vs/base/common/paths', 'vs/base/common/mime', 'vs/base/common/labels', 'vs/base/common/strings', 'vs/base/common/assert', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor/binaryEditorModel', 'vs/platform/files/common/files', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/files/common/editors/textFileEditorModel', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/instantiation/common/instantiation'], function (require, exports, nls, winjs_base_1, platform_1, types, paths, mime_1, labels, strings, assert, baseEditor_1, binaryEditorModel_1, files_1, files_2, textFileEditorModel_1, contextService_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * A file editor input is the input type for the file editor of file system resources.
     */
    var FileEditorInput = (function (_super) {
        __extends(FileEditorInput, _super);
        /**
         * An editor input whos contents are retrieved from file services.
         */
        function FileEditorInput(resource, mime, preferredEncoding, instantiationService, contextService, textFileService) {
            _super.call(this);
            this.instantiationService = instantiationService;
            this.contextService = contextService;
            this.textFileService = textFileService;
            if (resource) {
                this.setResource(resource);
                this.setMime(mime || mime_1.guessMimeTypes(this.resource.fsPath).join(', '));
                this.preferredEncoding = preferredEncoding;
            }
        }
        FileEditorInput.prototype.setResource = function (resource) {
            if (resource.scheme !== 'file') {
                throw new Error('FileEditorInput can only handle file:// resources.');
            }
            this.resource = resource;
            // Reset resource dependent properties
            this.name = null;
            this.description = null;
            this.verboseDescription = null;
        };
        FileEditorInput.prototype.getResource = function () {
            return this.resource;
        };
        FileEditorInput.prototype.getMime = function () {
            return this.mime;
        };
        FileEditorInput.prototype.setMime = function (mime) {
            assert.ok(mime, 'Editor input needs mime type');
            this.mime = mime;
        };
        FileEditorInput.prototype.getEncoding = function () {
            var textModel = textFileEditorModel_1.CACHE.get(this.resource);
            if (textModel) {
                return textModel.getEncoding();
            }
            return this.preferredEncoding;
        };
        FileEditorInput.prototype.setEncoding = function (encoding, mode) {
            this.preferredEncoding = encoding;
            var textModel = textFileEditorModel_1.CACHE.get(this.resource);
            if (textModel) {
                textModel.setEncoding(encoding, mode);
            }
        };
        FileEditorInput.prototype.getId = function () {
            return files_2.FILE_EDITOR_INPUT_ID;
        };
        FileEditorInput.prototype.getName = function () {
            if (!this.name) {
                this.name = paths.basename(this.resource.fsPath);
            }
            return this.name;
        };
        FileEditorInput.prototype.getDescription = function (verbose) {
            if (!verbose) {
                if (!this.description) {
                    this.description = labels.getPathLabel(paths.dirname(this.resource.fsPath), this.contextService);
                }
                return this.description;
            }
            if (!this.verboseDescription) {
                this.verboseDescription = labels.getPathLabel(this.resource.fsPath);
            }
            return this.verboseDescription;
        };
        FileEditorInput.prototype.getStatus = function () {
            var textModel = textFileEditorModel_1.CACHE.get(this.resource);
            if (textModel) {
                var state = textModel.getState();
                switch (state) {
                    case textFileEditorModel_1.State.SAVED: {
                        return { state: 'saved', displayText: FileEditorInput.nlsSavedDisplay, description: FileEditorInput.nlsSavedMeta };
                    }
                    case textFileEditorModel_1.State.DIRTY: {
                        return { state: 'dirty', decoration: (this.textFileService.getAutoSaveMode() !== files_2.AutoSaveMode.AFTER_SHORT_DELAY) ? '\u25cf' : '', displayText: FileEditorInput.nlsDirtyDisplay, description: FileEditorInput.nlsDirtyMeta };
                    }
                    case textFileEditorModel_1.State.PENDING_SAVE:
                        return { state: 'saving', decoration: (this.textFileService.getAutoSaveMode() !== files_2.AutoSaveMode.AFTER_SHORT_DELAY) ? '\u25cf' : '', displayText: FileEditorInput.nlsPendingSaveDisplay, description: FileEditorInput.nlsPendingSaveMeta };
                    case textFileEditorModel_1.State.ERROR:
                        return { state: 'error', decoration: '\u25cf', displayText: FileEditorInput.nlsErrorDisplay, description: FileEditorInput.nlsErrorMeta };
                    case textFileEditorModel_1.State.CONFLICT:
                        return { state: 'conflict', decoration: '\u25cf', displayText: FileEditorInput.nlsConflictDisplay, description: FileEditorInput.nlsConflictMeta };
                }
            }
            return null;
        };
        FileEditorInput.prototype.getPreferredEditorId = function (candidates) {
            var editorRegistry = platform_1.Registry.as(baseEditor_1.Extensions.Editors);
            // Lookup Editor by Mime
            var descriptor;
            var mimes = this.mime.split(',');
            for (var m = 0; m < mimes.length; m++) {
                var mime = strings.trim(mimes[m]);
                for (var i = 0; i < candidates.length; i++) {
                    descriptor = editorRegistry.getEditorById(candidates[i]);
                    if (types.isFunction(descriptor.getMimeTypes)) {
                        var mimetypes = descriptor.getMimeTypes();
                        for (var j = 0; j < mimetypes.length; j++) {
                            var mimetype = mimetypes[j];
                            // Check for direct mime match
                            if (mime === mimetype) {
                                return descriptor.getId();
                            }
                            // Otherwise check for wildcard mime matches
                            if (strings.endsWith(mimetype, '/*') && strings.startsWith(mime, mimetype.substring(0, mimetype.length - 1))) {
                                return descriptor.getId();
                            }
                        }
                    }
                }
            }
            // Otherwise use default editor
            return files_2.BINARY_FILE_EDITOR_ID;
        };
        FileEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            var modelPromise;
            // Keep clients who resolved the input to support proper disposal
            var clients = FileEditorInput.FILE_EDITOR_MODEL_CLIENTS[this.resource.toString()];
            if (types.isUndefinedOrNull(clients)) {
                FileEditorInput.FILE_EDITOR_MODEL_CLIENTS[this.resource.toString()] = [this];
            }
            else if (this.indexOfClient() === -1) {
                FileEditorInput.FILE_EDITOR_MODEL_CLIENTS[this.resource.toString()].push(this);
            }
            // Check for running loader to ensure the model is only ever loaded once
            if (FileEditorInput.FILE_EDITOR_MODEL_LOADERS[this.resource.toString()]) {
                return FileEditorInput.FILE_EDITOR_MODEL_LOADERS[this.resource.toString()];
            }
            // Use Cached Model if present
            var cachedModel = textFileEditorModel_1.CACHE.get(this.resource);
            if (cachedModel && !refresh) {
                modelPromise = winjs_base_1.TPromise.as(cachedModel);
            }
            else if (cachedModel && refresh) {
                modelPromise = cachedModel.load();
                FileEditorInput.FILE_EDITOR_MODEL_LOADERS[this.resource.toString()] = modelPromise;
            }
            else {
                modelPromise = this.createAndLoadModel();
                FileEditorInput.FILE_EDITOR_MODEL_LOADERS[this.resource.toString()] = modelPromise;
            }
            return modelPromise.then(function (resolvedModel) {
                if (resolvedModel instanceof textFileEditorModel_1.TextFileEditorModel) {
                    textFileEditorModel_1.CACHE.add(_this.resource, resolvedModel); // Store into the text model cache unless this file is binary
                }
                FileEditorInput.FILE_EDITOR_MODEL_LOADERS[_this.resource.toString()] = null; // Remove from pending loaders
                return resolvedModel;
            }, function (error) {
                FileEditorInput.FILE_EDITOR_MODEL_LOADERS[_this.resource.toString()] = null; // Remove from pending loaders in case of an error
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        FileEditorInput.prototype.indexOfClient = function () {
            if (!types.isUndefinedOrNull(FileEditorInput.FILE_EDITOR_MODEL_CLIENTS[this.resource.toString()])) {
                for (var i = 0; i < FileEditorInput.FILE_EDITOR_MODEL_CLIENTS[this.resource.toString()].length; i++) {
                    var client = FileEditorInput.FILE_EDITOR_MODEL_CLIENTS[this.resource.toString()][i];
                    if (client === this) {
                        return i;
                    }
                }
            }
            return -1;
        };
        FileEditorInput.prototype.createAndLoadModel = function () {
            var _this = this;
            var descriptor = platform_1.Registry.as(baseEditor_1.Extensions.Editors).getEditor(this);
            if (!descriptor) {
                throw new Error('Unable to find an editor in the registry for this input.');
            }
            // Optimistically create a text model assuming that the file is not binary
            var textModel = this.instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, this.resource, this.preferredEncoding);
            return textModel.load().then(function () { return textModel; }, function (error) {
                // In case of an error that indicates that the file is binary or too large, just return with the binary editor model
                if (error.fileOperationResult === files_1.FileOperationResult.FILE_IS_BINARY || error.fileOperationResult === files_1.FileOperationResult.FILE_TOO_LARGE) {
                    textModel.dispose();
                    var binaryModel = new binaryEditorModel_1.BinaryEditorModel(_this.resource, _this.getName());
                    return binaryModel.load();
                }
                // Bubble any other error up
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        FileEditorInput.prototype.dispose = function (force) {
            // TextFileEditorModel
            var cachedModel = textFileEditorModel_1.CACHE.get(this.resource);
            if (cachedModel) {
                // Only dispose if the last client called dispose() unless a forced dispose is triggered
                var index = this.indexOfClient();
                if (index >= 0) {
                    // Remove from Clients List
                    FileEditorInput.FILE_EDITOR_MODEL_CLIENTS[this.resource.toString()].splice(index, 1);
                    // Still clients around, thereby do not dispose yet
                    if (!force && FileEditorInput.FILE_EDITOR_MODEL_CLIENTS[this.resource.toString()].length > 0) {
                        return;
                    }
                    // We typically never want to dispose a file editor model because this means loosing undo/redo history.
                    // For that, we will keep the model around unless someone forces a dispose on the input. A forced dispose
                    // can happen when the model has not been used for a while or was changed outside the application which
                    // means loosing the undo redo history anyways.
                    if (!force) {
                        return;
                    }
                    // Dispose for real
                    textFileEditorModel_1.CACHE.dispose(this.resource);
                }
            }
            _super.prototype.dispose.call(this);
        };
        FileEditorInput.prototype.matches = function (otherInput) {
            if (_super.prototype.matches.call(this, otherInput) === true) {
                return true;
            }
            if (otherInput) {
                // Note that we can not test for the mime type here because we cache resolved file editor input models by resource. And
                // these models have a fixed mode association that can not be changed afterwards. As such, we always treat this input
                // equal if the resource is equal so that there is always just one text editor model (with undo hisotry etc.) around.
                //
                // !!! DO NOT CHANGE THIS ASSUMPTION !!!
                //
                return otherInput instanceof FileEditorInput && otherInput.resource.toString() === this.resource.toString();
            }
            return false;
        };
        /**
         * Exposed so that other internal file API can access the list of all file editor inputs
         * that have been loaded during the session.
         */
        FileEditorInput.getAll = function (desiredFileOrFolderResource) {
            var inputsContainingResource = [];
            var clients = FileEditorInput.FILE_EDITOR_MODEL_CLIENTS;
            for (var resource in clients) {
                var inputs = clients[resource];
                // Check if path is identical or path is a folder that the content is inside
                if (paths.isEqualOrParent(resource, desiredFileOrFolderResource.toString())) {
                    inputsContainingResource.push.apply(inputsContainingResource, inputs);
                }
            }
            return inputsContainingResource;
        };
        // Do ref counting for all inputs that resolved to a model to be able to dispose when count = 0
        FileEditorInput.FILE_EDITOR_MODEL_CLIENTS = Object.create(null);
        // Keep promises that load a file editor model to avoid loading the same model twice
        FileEditorInput.FILE_EDITOR_MODEL_LOADERS = Object.create(null);
        // These nls things are looked up way too often to not cache them..
        FileEditorInput.nlsSavedDisplay = nls.localize('savedDisplay', "Saved");
        FileEditorInput.nlsSavedMeta = nls.localize('savedMeta', "All changes saved");
        FileEditorInput.nlsDirtyDisplay = nls.localize('dirtyDisplay', "Dirty");
        FileEditorInput.nlsDirtyMeta = nls.localize('dirtyMeta', "Changes have been made to the file...");
        FileEditorInput.nlsPendingSaveDisplay = nls.localize('savingDisplay', "Saving...");
        FileEditorInput.nlsPendingSaveMeta = nls.localize('pendingSaveMeeta', "Changes are currently being saved...");
        FileEditorInput.nlsErrorDisplay = nls.localize('saveErorDisplay', "Save error");
        FileEditorInput.nlsErrorMeta = nls.localize('saveErrorMeta', "Sorry, we are having trouble saving your changes");
        FileEditorInput.nlsConflictDisplay = nls.localize('saveConflictDisplay', "Conflict");
        FileEditorInput.nlsConflictMeta = nls.localize('saveConflictMeta', "Changes cannot be saved because they conflict with the version on disk");
        FileEditorInput = __decorate([
            __param(3, instantiation_1.IInstantiationService),
            __param(4, contextService_1.IWorkspaceContextService),
            __param(5, files_2.ITextFileService)
        ], FileEditorInput);
        return FileEditorInput;
    }(files_2.FileEditorInput));
    exports.FileEditorInput = FileEditorInput;
});
//# sourceMappingURL=fileEditorInput.js.map