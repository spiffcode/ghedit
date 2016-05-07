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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/files/browser/editors/textFileEditor', 'vs/base/common/errors', 'vs/base/common/mime', 'vs/base/common/labels', 'vs/base/common/types', 'vs/base/common/paths', 'vs/base/common/actions', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/files/browser/saveErrorHandler', 'vs/workbench/browser/parts/editor/textEditor', 'vs/workbench/parts/files/common/editors/textFileEditorModel', 'vs/workbench/common/editor/binaryEditorModel', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/services/viewlet/common/viewletService', 'vs/platform/files/common/files', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/storage/common/storage', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/workbench/services/editor/common/editorService', 'vs/editor/common/services/modeService', 'vs/workbench/services/themes/common/themeService'], function (require, exports, winjs_base_1, nls, errors, mime_1, labels, types, paths, actions_1, files_1, saveErrorHandler_1, textEditor_1, textFileEditorModel_1, binaryEditorModel_1, fileEditorInput_1, quickOpenService_1, viewletService_1, files_2, telemetry_1, contextService_1, storage_1, configuration_1, event_1, instantiation_1, message_1, editorService_1, modeService_1, themeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * An implementation of editor for file system resources.
     */
    var TextFileEditor = (function (_super) {
        __extends(TextFileEditor, _super);
        function TextFileEditor(telemetryService, fileService, textFileService, viewletService, quickOpenService, instantiationService, contextService, storageService, messageService, configurationService, eventService, editorService, modeService, themeService) {
            var _this = this;
            _super.call(this, TextFileEditor.ID, telemetryService, instantiationService, contextService, storageService, messageService, configurationService, eventService, editorService, modeService, themeService);
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.viewletService = viewletService;
            this.quickOpenService = quickOpenService;
            // Since we are the one providing save-support for models, we hook up the error handler for saving
            textFileEditorModel_1.TextFileEditorModel.setSaveErrorHandler(instantiationService.createInstance(saveErrorHandler_1.SaveErrorHandler));
            // Clear view state for deleted files
            this.toUnbind.push(this.eventService.addListener(files_2.EventType.FILE_CHANGES, function (e) { return _this.onFilesChanged(e); }));
        }
        TextFileEditor.prototype.onFilesChanged = function (e) {
            var deleted = e.getDeleted();
            if (deleted && deleted.length) {
                this.clearTextEditorViewState(this.storageService, deleted.map(function (d) { return d.resource.toString(); }));
            }
        };
        TextFileEditor.prototype.getTitle = function () {
            return this.getInput() ? this.getInput().getName() : nls.localize(0, null);
        };
        TextFileEditor.prototype.setInput = function (input, options) {
            var _this = this;
            var oldInput = this.getInput();
            _super.prototype.setInput.call(this, input, options);
            // Detect options
            var forceOpen = options && options.forceOpen;
            // Same Input
            if (!forceOpen && input.matches(oldInput)) {
                // TextOptions (avoiding instanceof here for a reason, do not change!)
                if (options && types.isFunction(options.apply)) {
                    options.apply(this.getControl());
                }
                return winjs_base_1.TPromise.as(null);
            }
            // Remember view settings if input changes
            if (oldInput) {
                this.saveTextEditorViewState(this.storageService, oldInput.getResource().toString());
            }
            // Different Input (Reload)
            return this.editorService.resolveEditorModel(input, true /* Reload */).then(function (resolvedModel) {
                // There is a special case where the text editor has to handle binary file editor input: if a file with application/unknown
                // mime has been resolved and cached before, it maybe an actual instance of BinaryEditorModel. In this case our text
                // editor has to open this model using the binary editor. We return early in this case.
                if (resolvedModel instanceof binaryEditorModel_1.BinaryEditorModel && _this.openAsBinary(input, options)) {
                    return null;
                }
                // Assert Model interface
                if (!(resolvedModel instanceof textFileEditorModel_1.TextFileEditorModel)) {
                    return winjs_base_1.TPromise.wrapError('Invalid editor input. Text file editor requires a model instance of TextFileEditorModel.');
                }
                var textFileModel = resolvedModel;
                var textEditor = _this.getControl();
                // Assert Text Model
                if (!textFileModel.textEditorModel) {
                    return winjs_base_1.TPromise.wrapError('Unable to open the file because the associated text model is undefined.');
                }
                // First assert that the current input is still the one we expect
                // This prevents a race condition when reloading a content takes long
                // and the user meanwhile decided to open another file
                if (!_this.getInput() || _this.getInput().getResource().toString() !== textFileModel.getResource().toString()) {
                    return null;
                }
                // log the time it takes the editor to render the resource
                var mode = textFileModel.textEditorModel.getMode();
                var setModelEvent = _this.telemetryService.timedPublicLog('editorSetModel', {
                    mode: mode && mode.getId(),
                    resource: textFileModel.textEditorModel.getAssociatedResource().toString(),
                });
                // Editor
                textEditor.setModel(textFileModel.textEditorModel);
                // stop the event
                setModelEvent.stop();
                // TextOptions (avoiding instanceof here for a reason, do not change!)
                var optionsGotApplied = false;
                if (options && types.isFunction(options.apply)) {
                    optionsGotApplied = options.apply(textEditor);
                }
                // Otherwise restore View State
                if (!optionsGotApplied) {
                    var editorViewState = _this.loadTextEditorViewState(_this.storageService, _this.getInput().getResource().toString());
                    if (editorViewState) {
                        textEditor.restoreViewState(editorViewState);
                    }
                }
                // Add to working files if file is out of workspace
                if (!_this.contextService.isInsideWorkspace(textFileModel.getResource())) {
                    _this.textFileService.getWorkingFilesModel().addEntry(textFileModel.getResource());
                }
            }, function (error) {
                // In case we tried to open a file inside the text editor and the response
                // indicates that this is not a text file, reopen the file through the binary
                // editor by using application/octet-stream as mime.
                if (error.fileOperationResult === files_2.FileOperationResult.FILE_IS_BINARY && _this.openAsBinary(input, options)) {
                    return;
                }
                // Similar, handle case where we were asked to open a folder in the text editor.
                if (error.fileOperationResult === files_2.FileOperationResult.FILE_IS_DIRECTORY && _this.openAsFolder(input)) {
                    return;
                }
                // Offer to create a file from the error if we have a file not found and the name is valid
                if (error.fileOperationResult === files_2.FileOperationResult.FILE_NOT_FOUND && paths.isValidBasename(paths.basename(input.getResource().fsPath))) {
                    return winjs_base_1.TPromise.wrapError(errors.create(errors.toErrorMessage(error), { actions: [
                            message_1.CancelAction,
                            new actions_1.Action('workbench.files.action.createMissingFile', nls.localize(1, null), null, true, function () {
                                return _this.fileService.updateContent(input.getResource(), '').then(function () {
                                    // Add to working files
                                    _this.textFileService.getWorkingFilesModel().addEntry(input.getResource());
                                    // Open
                                    return _this.editorService.openEditor({
                                        resource: input.getResource(),
                                        mime: mime_1.MIME_TEXT
                                    });
                                });
                            })
                        ] }));
                }
                // Inform the user if the file is too large to open
                if (error.fileOperationResult === files_2.FileOperationResult.FILE_TOO_LARGE) {
                    _this.messageService.show(message_1.Severity.Info, nls.localize(2, null));
                    return;
                }
                // Otherwise make sure the error bubbles up
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TextFileEditor.prototype.openAsBinary = function (input, options) {
            if (input instanceof fileEditorInput_1.FileEditorInput) {
                var fileEditorInput = input;
                var fileInputBinary = this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, fileEditorInput.getResource(), mime_1.MIME_BINARY, void 0);
                this.editorService.openEditor(fileInputBinary, options, this.position).done(null, errors.onUnexpectedError);
                return true;
            }
            return false;
        };
        TextFileEditor.prototype.openAsFolder = function (input) {
            var _this = this;
            // Since we cannot open a folder, we have to restore the previous input if any or close the editor
            var handleEditorPromise;
            var previousInput = this.quickOpenService.getEditorHistory()[1];
            if (previousInput) {
                handleEditorPromise = this.editorService.openEditor(previousInput, null, this.position);
            }
            else {
                handleEditorPromise = this.editorService.closeEditor(this);
            }
            handleEditorPromise.done(function () {
                // Best we can do is to reveal the folder in the explorer
                if (input instanceof fileEditorInput_1.FileEditorInput) {
                    var fileEditorInput_2 = input;
                    // Reveal if we have a workspace path
                    if (_this.contextService.isInsideWorkspace(fileEditorInput_2.getResource())) {
                        _this.viewletService.openViewlet(files_1.VIEWLET_ID, true).done(function (viewlet) {
                            return viewlet.getExplorerView().select(fileEditorInput_2.getResource(), true);
                        }, errors.onUnexpectedError);
                    }
                    else {
                        _this.messageService.show(message_1.Severity.Info, nls.localize(3, null, labels.getPathLabel(fileEditorInput_2.getResource())));
                    }
                }
            }, errors.onUnexpectedError);
            return true; // in any case we handled it
        };
        TextFileEditor.prototype.getCodeEditorOptions = function () {
            var options = _super.prototype.getCodeEditorOptions.call(this);
            var input = this.getInput();
            var inputName = input && input.getName();
            options.ariaLabel = inputName ? nls.localize(4, null, inputName) : nls.localize(5, null);
            return options;
        };
        TextFileEditor.prototype.supportsSplitEditor = function () {
            return true; // yes, we can!
        };
        TextFileEditor.prototype.clearInput = function () {
            // Keep editor view state in settings to restore when coming back
            if (this.input) {
                this.saveTextEditorViewState(this.storageService, this.input.getResource().toString());
            }
            // Clear Model
            this.getControl().setModel(null);
            // Pass to super
            _super.prototype.clearInput.call(this);
        };
        TextFileEditor.prototype.shutdown = function () {
            // Save View State
            if (this.input) {
                this.saveTextEditorViewState(this.storageService, this.input.getResource().toString());
            }
            // Call Super
            _super.prototype.shutdown.call(this);
        };
        TextFileEditor.ID = files_1.TEXT_FILE_EDITOR_ID;
        TextFileEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, files_2.IFileService),
            __param(2, files_1.ITextFileService),
            __param(3, viewletService_1.IViewletService),
            __param(4, quickOpenService_1.IQuickOpenService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, contextService_1.IWorkspaceContextService),
            __param(7, storage_1.IStorageService),
            __param(8, message_1.IMessageService),
            __param(9, configuration_1.IConfigurationService),
            __param(10, event_1.IEventService),
            __param(11, editorService_1.IWorkbenchEditorService),
            __param(12, modeService_1.IModeService),
            __param(13, themeService_1.IThemeService)
        ], TextFileEditor);
        return TextFileEditor;
    }(textEditor_1.BaseTextEditor));
    exports.TextFileEditor = TextFileEditor;
});
//# sourceMappingURL=textFileEditor.js.map