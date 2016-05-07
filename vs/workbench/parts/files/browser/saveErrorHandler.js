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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/files/browser/saveErrorHandler', 'vs/base/common/errors', 'vs/base/common/paths', 'vs/base/common/actions', 'vs/base/common/uri', 'vs/base/common/mime', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor/resourceEditorInput', 'vs/workbench/common/editor/diffEditorInput', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/parts/files/browser/fileActions', 'vs/platform/files/common/files', 'vs/workbench/services/editor/common/editorService', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/workspace/common/workspace', 'vs/editor/common/services/modeService', 'vs/editor/common/services/modelService'], function (require, exports, winjs_base_1, nls, errors, paths, actions_1, uri_1, mime_1, baseEditor_1, resourceEditorInput_1, diffEditorInput_1, fileEditorInput_1, fileActions_1, files_1, editorService_1, event_1, instantiation_1, message_1, workspace_1, modeService_1, modelService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // A handler for save error happening with conflict resolution actions
    var SaveErrorHandler = (function () {
        function SaveErrorHandler(messageService, instantiationService) {
            this.messageService = messageService;
            this.instantiationService = instantiationService;
        }
        SaveErrorHandler.prototype.onSaveError = function (error, model) {
            var _this = this;
            var message;
            // Dirty write prevention
            if (error.fileOperationResult === files_1.FileOperationResult.FILE_MODIFIED_SINCE) {
                message = this.instantiationService.createInstance(ResolveSaveConflictMessage, model, null);
            }
            else {
                var isReadonly = error.fileOperationResult === files_1.FileOperationResult.FILE_READ_ONLY;
                var actions = [];
                // Cancel
                actions.push(message_1.CancelAction);
                // Retry
                if (isReadonly) {
                    actions.push(new actions_1.Action('workbench.files.action.overwrite', nls.localize(0, null), null, true, function () {
                        if (!model.isDisposed()) {
                            return model.save(true /* overwrite readonly */).then(function () { return true; });
                        }
                        return winjs_base_1.TPromise.as(true);
                    }));
                }
                else {
                    actions.push(new actions_1.Action('workbench.files.action.retry', nls.localize(1, null), null, true, function () {
                        var saveFileAction = _this.instantiationService.createInstance(fileActions_1.SaveFileAction, fileActions_1.SaveFileAction.ID, fileActions_1.SaveFileAction.LABEL);
                        saveFileAction.setResource(model.getResource());
                        return saveFileAction.run().then(function () { saveFileAction.dispose(); return true; });
                    }));
                }
                // Discard
                actions.push(new actions_1.Action('workbench.files.action.discard', nls.localize(2, null), null, true, function () {
                    var revertFileAction = _this.instantiationService.createInstance(fileActions_1.RevertFileAction, fileActions_1.RevertFileAction.ID, fileActions_1.RevertFileAction.LABEL);
                    revertFileAction.setResource(model.getResource());
                    return revertFileAction.run().then(function () { revertFileAction.dispose(); return true; });
                }));
                // Save As
                actions.push(new actions_1.Action('workbench.files.action.saveAs', fileActions_1.SaveFileAsAction.LABEL, null, true, function () {
                    var saveAsAction = _this.instantiationService.createInstance(fileActions_1.SaveFileAsAction, fileActions_1.SaveFileAsAction.ID, fileActions_1.SaveFileAsAction.LABEL);
                    saveAsAction.setResource(model.getResource());
                    return saveAsAction.run().then(function () { saveAsAction.dispose(); return true; });
                }));
                var errorMessage = void 0;
                if (isReadonly) {
                    errorMessage = nls.localize(3, null, paths.basename(model.getResource().fsPath));
                }
                else {
                    errorMessage = nls.localize(4, null, paths.basename(model.getResource().fsPath), errors.toErrorMessage(error, false));
                }
                message = {
                    message: errorMessage,
                    actions: actions
                };
            }
            if (this.messageService) {
                this.messageService.show(message_1.Severity.Error, message);
            }
        };
        SaveErrorHandler = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, instantiation_1.IInstantiationService)
        ], SaveErrorHandler);
        return SaveErrorHandler;
    }());
    exports.SaveErrorHandler = SaveErrorHandler;
    // Save conflict resolution editor input
    var ConflictResolutionDiffEditorInput = (function (_super) {
        __extends(ConflictResolutionDiffEditorInput, _super);
        function ConflictResolutionDiffEditorInput(model, name, description, originalInput, modifiedInput, messageService, instantiationService, eventService, editorService) {
            _super.call(this, name, description, originalInput, modifiedInput);
            this.messageService = messageService;
            this.instantiationService = instantiationService;
            this.eventService = eventService;
            this.editorService = editorService;
            this.model = model;
        }
        ConflictResolutionDiffEditorInput.prototype.getModel = function () {
            return this.model;
        };
        ConflictResolutionDiffEditorInput.prototype.getId = function () {
            return ConflictResolutionDiffEditorInput.ID;
        };
        ConflictResolutionDiffEditorInput.ID = 'workbench.editors.files.conflictResolutionDiffEditorInput';
        ConflictResolutionDiffEditorInput = __decorate([
            __param(5, message_1.IMessageService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, event_1.IEventService),
            __param(8, editorService_1.IWorkbenchEditorService)
        ], ConflictResolutionDiffEditorInput);
        return ConflictResolutionDiffEditorInput;
    }(diffEditorInput_1.DiffEditorInput));
    exports.ConflictResolutionDiffEditorInput = ConflictResolutionDiffEditorInput;
    var FileOnDiskEditorInput = (function (_super) {
        __extends(FileOnDiskEditorInput, _super);
        function FileOnDiskEditorInput(fileResource, mime, name, description, modelService, modeService, instantiationService, fileService) {
            // We create a new resource URI here that is different from the file resource because we represent the state of
            // the file as it is on disk and not as it is (potentially cached) in Code. That allows us to have a different
            // model for the left-hand comparision compared to the conflicting one in Code to the right.
            _super.call(this, name, description, uri_1.default.create('disk', null, fileResource.fsPath), modelService, instantiationService);
            this.modeService = modeService;
            this.fileService = fileService;
            this.fileResource = fileResource;
            this.mime = mime;
        }
        FileOnDiskEditorInput.prototype.getLastModified = function () {
            return this.lastModified;
        };
        FileOnDiskEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            // Make sure our file from disk is resolved up to date
            return this.fileService.resolveContent(this.fileResource).then(function (content) {
                _this.lastModified = content.mtime;
                var codeEditorModel = _this.modelService.getModel(_this.resource);
                if (!codeEditorModel) {
                    _this.modelService.createModel(content.value, _this.modeService.getOrCreateMode(_this.mime), _this.resource);
                    _this.createdEditorModel = true;
                }
                else {
                    codeEditorModel.setValue(content.value);
                }
                return _super.prototype.resolve.call(_this, refresh);
            });
        };
        FileOnDiskEditorInput.prototype.dispose = function () {
            if (this.createdEditorModel) {
                this.modelService.destroyModel(this.resource);
                this.createdEditorModel = false;
            }
            _super.prototype.dispose.call(this);
        };
        FileOnDiskEditorInput = __decorate([
            __param(4, modelService_1.IModelService),
            __param(5, modeService_1.IModeService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, files_1.IFileService)
        ], FileOnDiskEditorInput);
        return FileOnDiskEditorInput;
    }(resourceEditorInput_1.ResourceEditorInput));
    exports.FileOnDiskEditorInput = FileOnDiskEditorInput;
    // A message with action to resolve a 412 save conflict
    var ResolveSaveConflictMessage = (function () {
        function ResolveSaveConflictMessage(model, message, messageService, instantiationService, contextService, editorService) {
            var _this = this;
            this.messageService = messageService;
            this.instantiationService = instantiationService;
            this.contextService = contextService;
            this.editorService = editorService;
            this.model = model;
            var resource = model.getResource();
            if (message) {
                this.message = message;
            }
            else {
                this.message = nls.localize(5, null, paths.basename(resource.fsPath));
            }
            this.actions = [
                new actions_1.Action('workbench.files.action.resolveConflict', nls.localize(6, null), null, true, function () {
                    if (!_this.model.isDisposed()) {
                        var mime = mime_1.guessMimeTypes(resource.fsPath).join(', ');
                        var originalInput = _this.instantiationService.createInstance(FileOnDiskEditorInput, resource, mime, paths.basename(resource.fsPath), resource.fsPath);
                        var modifiedInput = _this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, mime, void 0);
                        var conflictInput = _this.instantiationService.createInstance(ConflictResolutionDiffEditorInput, _this.model, nls.localize(7, null, modifiedInput.getName(), _this.contextService.getConfiguration().env.appName), nls.localize(8, null, modifiedInput.getDescription()), originalInput, modifiedInput);
                        return _this.editorService.openEditor(conflictInput).then(function () {
                            // We have to bring the model into conflict resolution mode to prevent subsequent save erros when the user makes edits
                            _this.model.setConflictResolutionMode();
                            // Inform user
                            _this.messageService.show(message_1.Severity.Info, nls.localize(9, null));
                        });
                    }
                    return winjs_base_1.TPromise.as(true);
                })
            ];
        }
        ResolveSaveConflictMessage = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, workspace_1.IWorkspaceContextService),
            __param(5, editorService_1.IWorkbenchEditorService)
        ], ResolveSaveConflictMessage);
        return ResolveSaveConflictMessage;
    }());
    // Accept changes to resolve a conflicting edit
    var AcceptLocalChangesAction = (function (_super) {
        __extends(AcceptLocalChangesAction, _super);
        function AcceptLocalChangesAction(messageService, instantiationService, editorService) {
            _super.call(this, 'workbench.files.action.acceptLocalChanges', nls.localize(10, null), 'conflict-editor-action accept-changes');
            this.messageService = messageService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.messagesToHide = [];
        }
        AcceptLocalChangesAction.prototype.run = function () {
            var _this = this;
            var conflictInput = this.input;
            var model = conflictInput.getModel();
            var localModelValue = model.getValue();
            // 1.) Get the diff editor model from cache (resolve(false)) to have access to the mtime of the file we currently show to the left
            return conflictInput.resolve(false).then(function (diffModel) {
                var knownLastModified = conflictInput.originalInput.getLastModified();
                // 2.) Revert the model to get the latest copy from disk and to have access to the mtime of the file now
                return model.revert().then(function () {
                    var diskLastModified = model.getLastModifiedTime();
                    // 3. a) If we know that the file on the left hand side was not modified meanwhile, restore the user value and trigger a save
                    if (diskLastModified <= knownLastModified) {
                        // Restore user value
                        model.textEditorModel.setValue(localModelValue);
                        // Trigger save
                        return model.save().then(function () {
                            // Hide any previously shown messages
                            while (_this.messagesToHide.length) {
                                _this.messagesToHide.pop()();
                            }
                            // Reopen file input
                            var input = _this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, model.getResource(), mime_1.guessMimeTypes(model.getResource().fsPath).join(', '), void 0);
                            return _this.editorService.openEditor(input, null, _this.position).then(function () {
                                // Dispose conflict input
                                conflictInput.dispose();
                            });
                        });
                    }
                    else {
                        // Again, we have to bring the model into conflict resolution because revert() would have cleared it
                        model.setConflictResolutionMode();
                        // Restore user value
                        model.textEditorModel.setValue(localModelValue);
                        // Reload the left hand side of the diff editor to show the up to date version and inform the user that he has to redo the action
                        return conflictInput.originalInput.resolve(true).then(function () {
                            _this.messagesToHide.push(_this.messageService.show(message_1.Severity.Info, nls.localize(11, null)));
                        });
                    }
                });
            });
        };
        AcceptLocalChangesAction = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, editorService_1.IWorkbenchEditorService)
        ], AcceptLocalChangesAction);
        return AcceptLocalChangesAction;
    }(baseEditor_1.EditorInputAction));
    exports.AcceptLocalChangesAction = AcceptLocalChangesAction;
    // Revert changes to resolve a conflicting edit
    var RevertLocalChangesAction = (function (_super) {
        __extends(RevertLocalChangesAction, _super);
        function RevertLocalChangesAction(instantiationService, editorService) {
            _super.call(this, 'workbench.action.files.revert', nls.localize(12, null), 'conflict-editor-action revert-changes');
            this.instantiationService = instantiationService;
            this.editorService = editorService;
        }
        RevertLocalChangesAction.prototype.run = function () {
            var _this = this;
            var conflictInput = this.input;
            var model = conflictInput.getModel();
            // Revert on model
            return model.revert().then(function () {
                // Reopen file input
                var input = _this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, model.getResource(), mime_1.guessMimeTypes(model.getResource().fsPath).join(', '), void 0);
                return _this.editorService.openEditor(input, null, _this.position).then(function () {
                    // Dispose conflict input
                    conflictInput.dispose();
                });
            });
        };
        RevertLocalChangesAction = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, editorService_1.IWorkbenchEditorService)
        ], RevertLocalChangesAction);
        return RevertLocalChangesAction;
    }(baseEditor_1.EditorInputAction));
    exports.RevertLocalChangesAction = RevertLocalChangesAction;
});
//# sourceMappingURL=saveErrorHandler.js.map