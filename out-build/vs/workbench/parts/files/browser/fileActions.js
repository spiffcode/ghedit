/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/files/browser/fileActions', 'vs/base/common/platform', 'vs/base/common/async', 'vs/base/common/mime', 'vs/base/common/paths', 'vs/base/common/uri', 'vs/base/common/errors', 'vs/base/common/strings', 'vs/base/common/events', 'vs/base/common/labels', 'vs/base/common/severity', 'vs/base/common/diagnostics', 'vs/base/common/actions', 'vs/base/browser/ui/inputbox/inputBox', 'vs/base/common/lifecycle', 'vs/workbench/common/events', 'vs/workbench/parts/files/common/files', 'vs/platform/files/common/files', 'vs/workbench/common/editor/diffEditorInput', 'vs/workbench/common/editor', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/parts/files/common/explorerViewModel', 'vs/workbench/parts/files/common/editors/textFileEditorModel', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/services/viewlet/common/viewletService', 'vs/workbench/services/part/common/partService', 'vs/platform/storage/common/storage', 'vs/platform/editor/common/editor', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/progress/common/progress', 'vs/platform/workspace/common/workspace', 'vs/base/common/keyCodes', 'vs/css!./media/fileactions'], function (require, exports, winjs_base_1, nls, platform_1, async_1, mime_1, paths, uri_1, errors, strings, events_1, labels_1, severity_1, diagnostics, actions_1, inputBox_1, lifecycle_1, events_2, Files, files_1, diffEditorInput_1, editor_1, fileEditorInput_1, explorerViewModel_1, textFileEditorModel_1, untitledEditorService_1, editorService_1, quickOpenService_1, viewletService_1, partService_1, storage_1, editor_2, event_1, instantiation_1, message_1, progress_1, workspace_1, keyCodes_1) {
    'use strict';
    var ITextFileService = Files.ITextFileService;
    var BaseFileAction = (function (_super) {
        __extends(BaseFileAction, _super);
        function BaseFileAction(id, label, _contextService, _editorService, _fileService, _messageService, _textFileService, _eventService) {
            var _this = this;
            _super.call(this, id, label);
            this._contextService = _contextService;
            this._editorService = _editorService;
            this._fileService = _fileService;
            this._messageService = _messageService;
            this._textFileService = _textFileService;
            this._eventService = _eventService;
            this.enabled = false;
            // update enablement when options change
            this.listenerToUnbind = this._eventService.addListener(events_2.EventType.WORKBENCH_OPTIONS_CHANGED, function () { return _this._updateEnablement(); });
        }
        Object.defineProperty(BaseFileAction.prototype, "contextService", {
            get: function () {
                return this._contextService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseFileAction.prototype, "messageService", {
            get: function () {
                return this._messageService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseFileAction.prototype, "editorService", {
            get: function () {
                return this._editorService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseFileAction.prototype, "fileService", {
            get: function () {
                return this._fileService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseFileAction.prototype, "eventService", {
            get: function () {
                return this._eventService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseFileAction.prototype, "textFileService", {
            get: function () {
                return this._textFileService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseFileAction.prototype, "element", {
            get: function () {
                return this._element;
            },
            set: function (element) {
                this._element = element;
            },
            enumerable: true,
            configurable: true
        });
        BaseFileAction.prototype._isEnabled = function () {
            return true;
        };
        BaseFileAction.prototype._updateEnablement = function () {
            this.enabled = !!(this._contextService && this._fileService && this._editorService && !this._contextService.getOptions().readOnly && this._isEnabled());
        };
        BaseFileAction.prototype.onError = function (error) {
            this._messageService.show(message_1.Severity.Error, error);
        };
        BaseFileAction.prototype.onWarning = function (warning) {
            this._messageService.show(message_1.Severity.Warning, warning);
        };
        BaseFileAction.prototype.onErrorWithRetry = function (error, retry, extraAction) {
            var actions = [
                message_1.CancelAction,
                new actions_1.Action(this.id, nls.localize(0, null), null, true, function () { return retry(); })
            ];
            if (extraAction) {
                actions.push(extraAction);
            }
            var errorWithRetry = {
                actions: actions,
                message: errors.toErrorMessage(error, false)
            };
            this._messageService.show(message_1.Severity.Error, errorWithRetry);
        };
        BaseFileAction.prototype.handleDirty = function () {
            if (this.textFileService.isDirty(this._element.resource)) {
                var res = this.textFileService.confirmSave([this._element.resource]);
                if (res === Files.ConfirmResult.SAVE) {
                    return this.textFileService.save(this._element.resource).then(function () { return false; });
                }
                if (res === Files.ConfirmResult.DONT_SAVE) {
                    return this.textFileService.revert(this._element.resource).then(function () { return false; });
                }
                return winjs_base_1.TPromise.as(true);
            }
            return winjs_base_1.TPromise.as(false);
        };
        BaseFileAction.prototype.dispose = function () {
            this.listenerToUnbind();
            _super.prototype.dispose.call(this);
        };
        BaseFileAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, message_1.IMessageService),
            __param(6, ITextFileService),
            __param(7, event_1.IEventService)
        ], BaseFileAction);
        return BaseFileAction;
    }(actions_1.Action));
    exports.BaseFileAction = BaseFileAction;
    var TriggerRenameFileAction = (function (_super) {
        __extends(TriggerRenameFileAction, _super);
        function TriggerRenameFileAction(tree, element, contextService, editorService, fileService, messageService, textFileService, eventService, instantiationService) {
            _super.call(this, TriggerRenameFileAction.ID, nls.localize(1, null), contextService, editorService, fileService, messageService, textFileService, eventService);
            this.tree = tree;
            this.element = element;
            this.renameAction = instantiationService.createInstance(RenameFileAction, element);
            this._updateEnablement();
        }
        TriggerRenameFileAction.prototype.validateFileName = function (parent, name) {
            return this.renameAction.validateFileName(this.element.parent, name);
        };
        TriggerRenameFileAction.prototype.run = function (context) {
            var _this = this;
            if (!context) {
                return winjs_base_1.TPromise.wrapError('No context provided to BaseEnableFileRenameAction.');
            }
            var viewletState = context.viewletState;
            if (!viewletState) {
                return winjs_base_1.TPromise.wrapError('Invalid viewlet state provided to BaseEnableFileRenameAction.');
            }
            var stat = context.stat;
            if (!stat) {
                return winjs_base_1.TPromise.wrapError('Invalid stat provided to BaseEnableFileRenameAction.');
            }
            viewletState.setEditable(stat, {
                action: this.renameAction,
                validator: function (value) {
                    var message = _this.validateFileName(_this.element.parent, value);
                    if (!message) {
                        return null;
                    }
                    return {
                        content: message,
                        formatContent: true,
                        type: inputBox_1.MessageType.ERROR
                    };
                }
            });
            this.tree.refresh(stat, false).then(function () {
                _this.tree.setHighlight(stat);
                var unbind = _this.tree.addListener(events_1.EventType.HIGHLIGHT, function (e) {
                    if (!e.highlight) {
                        viewletState.clearEditable(stat);
                        _this.tree.refresh(stat).done(null, errors.onUnexpectedError);
                        unbind();
                    }
                });
            }).done(null, errors.onUnexpectedError);
        };
        TriggerRenameFileAction.ID = 'workbench.files.action.triggerRename';
        TriggerRenameFileAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, message_1.IMessageService),
            __param(6, ITextFileService),
            __param(7, event_1.IEventService),
            __param(8, instantiation_1.IInstantiationService)
        ], TriggerRenameFileAction);
        return TriggerRenameFileAction;
    }(BaseFileAction));
    exports.TriggerRenameFileAction = TriggerRenameFileAction;
    var BaseRenameAction = (function (_super) {
        __extends(BaseRenameAction, _super);
        function BaseRenameAction(id, label, element, contextService, editorService, fileService, messageService, textFileService, progressService, eventService) {
            _super.call(this, id, label, contextService, editorService, fileService, messageService, textFileService, eventService);
            this.progressService = progressService;
            this.element = element;
        }
        BaseRenameAction.prototype.run = function (context) {
            var _this = this;
            if (!context) {
                return winjs_base_1.TPromise.wrapError('No context provided to BaseRenameFileAction.');
            }
            var name = context.value;
            if (!name) {
                return winjs_base_1.TPromise.wrapError('No new name provided to BaseRenameFileAction.');
            }
            // Automatically trim whitespaces and trailing dots to produce nice file names
            name = getWellFormedFileName(name);
            var existingName = getWellFormedFileName(this.element.name);
            // Return early if name is invalid or didn't change
            if (name === existingName || this.validateFileName(this.element.parent, name)) {
                return winjs_base_1.TPromise.as(null);
            }
            // Call function and Emit Event through viewer
            var promise = this.runAction(name).then(function (stat) {
                if (stat) {
                    _this.onSuccess(stat);
                }
            }, function (error) {
                _this.onError(error);
            });
            if (this.progressService) {
                this.progressService.showWhile(promise, 800);
            }
            return promise;
        };
        BaseRenameAction.prototype.validateFileName = function (parent, name) {
            var source = this.element.name;
            var target = name;
            if (!platform_1.isLinux) {
                source = source.toLowerCase();
                target = target.toLowerCase();
            }
            if (getWellFormedFileName(source) === getWellFormedFileName(target)) {
                return null;
            }
            return validateFileName(parent, name, false);
        };
        BaseRenameAction.prototype.onSuccess = function (stat) {
            var before = null;
            if (!(this.element instanceof explorerViewModel_1.NewStatPlaceholder)) {
                before = this.element.clone(); // Clone element to not expose viewers element to listeners
            }
            this.eventService.emit('files.internal:fileChanged', new Files.LocalFileChangeEvent(before, stat));
        };
        BaseRenameAction = __decorate([
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, files_1.IFileService),
            __param(6, message_1.IMessageService),
            __param(7, ITextFileService),
            __param(8, progress_1.IProgressService),
            __param(9, event_1.IEventService)
        ], BaseRenameAction);
        return BaseRenameAction;
    }(BaseFileAction));
    exports.BaseRenameAction = BaseRenameAction;
    var RenameFileAction = (function (_super) {
        __extends(RenameFileAction, _super);
        function RenameFileAction(element, contextService, editorService, fileService, messageService, textFileService, progressService, eventService) {
            _super.call(this, RenameFileAction.ID, nls.localize(2, null), element, contextService, editorService, fileService, messageService, textFileService, progressService, eventService);
            this._updateEnablement();
        }
        RenameFileAction.prototype.runAction = function (newName) {
            var _this = this;
            // Check if file is dirty in editor and save it to avoid data loss
            return this.handleDirty().then(function (cancel) {
                if (cancel) {
                    return winjs_base_1.TPromise.as(null);
                }
                // If the file is still dirty, do not touch it because a save is pending to disk and we can not abort it
                if (_this.textFileService.isDirty(_this.element.resource)) {
                    _this.onWarning(nls.localize(3, null, labels_1.getPathLabel(_this.element.resource)));
                    return winjs_base_1.TPromise.as(null);
                }
                return _this.fileService.rename(_this.element.resource, newName).then(null, function (error) {
                    _this.onErrorWithRetry(error, function () { return _this.runAction(newName); });
                });
            });
        };
        RenameFileAction.ID = 'workbench.files.action.renameFile';
        RenameFileAction = __decorate([
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, files_1.IFileService),
            __param(4, message_1.IMessageService),
            __param(5, ITextFileService),
            __param(6, progress_1.IProgressService),
            __param(7, event_1.IEventService)
        ], RenameFileAction);
        return RenameFileAction;
    }(BaseRenameAction));
    exports.RenameFileAction = RenameFileAction;
    /* Base New File/Folder Action */
    var BaseNewAction = (function (_super) {
        __extends(BaseNewAction, _super);
        function BaseNewAction(id, label, tree, isFile, editableAction, element, contextService, editorService, fileService, messageService, textFileService, eventService) {
            _super.call(this, id, label, contextService, editorService, fileService, messageService, textFileService, eventService);
            if (element) {
                this.presetFolder = element.isDirectory ? element : element.parent;
            }
            this.tree = tree;
            this.isFile = isFile;
            this.renameAction = editableAction;
        }
        BaseNewAction.prototype.run = function (context) {
            var _this = this;
            if (!context) {
                return winjs_base_1.TPromise.wrapError('No context provided to BaseNewAction.');
            }
            var viewletState = context.viewletState;
            if (!viewletState) {
                return winjs_base_1.TPromise.wrapError('Invalid viewlet state provided to BaseNewAction.');
            }
            var folder = this.presetFolder;
            if (!folder) {
                var focus_1 = this.tree.getFocus();
                if (focus_1) {
                    folder = focus_1.isDirectory ? focus_1 : focus_1.parent;
                }
                else {
                    folder = this.tree.getInput();
                }
            }
            if (!folder) {
                return winjs_base_1.TPromise.wrapError('Invalid parent folder to create.');
            }
            return this.tree.reveal(folder, 0.5).then(function () {
                return _this.tree.expand(folder).then(function () {
                    var stat = explorerViewModel_1.NewStatPlaceholder.addNewStatPlaceholder(folder, !_this.isFile);
                    _this.renameAction.element = stat;
                    viewletState.setEditable(stat, {
                        action: _this.renameAction,
                        validator: function (value) {
                            var message = _this.renameAction.validateFileName(folder, value);
                            if (!message) {
                                return null;
                            }
                            return {
                                content: message,
                                formatContent: true,
                                type: inputBox_1.MessageType.ERROR
                            };
                        }
                    });
                    return _this.tree.refresh(folder).then(function () {
                        return _this.tree.expand(folder).then(function () {
                            return _this.tree.reveal(stat, 0.5).then(function () {
                                _this.tree.setHighlight(stat);
                                var unbind = _this.tree.addListener(events_1.EventType.HIGHLIGHT, function (e) {
                                    if (!e.highlight) {
                                        stat.destroy();
                                        _this.tree.refresh(folder).done(null, errors.onUnexpectedError);
                                        unbind();
                                    }
                                });
                            });
                        });
                    });
                });
            });
        };
        BaseNewAction = __decorate([
            __param(6, workspace_1.IWorkspaceContextService),
            __param(7, editorService_1.IWorkbenchEditorService),
            __param(8, files_1.IFileService),
            __param(9, message_1.IMessageService),
            __param(10, ITextFileService),
            __param(11, event_1.IEventService)
        ], BaseNewAction);
        return BaseNewAction;
    }(BaseFileAction));
    exports.BaseNewAction = BaseNewAction;
    /* New File */
    var NewFileAction = (function (_super) {
        __extends(NewFileAction, _super);
        function NewFileAction(tree, element, contextService, editorService, fileService, messageService, textFileService, eventService, instantiationService) {
            _super.call(this, 'workbench.action.files.newFile', nls.localize(4, null), tree, true, instantiationService.createInstance(CreateFileAction, element), null, contextService, editorService, fileService, messageService, textFileService, eventService);
            this.class = 'explorer-action new-file';
            this._updateEnablement();
        }
        NewFileAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, message_1.IMessageService),
            __param(6, ITextFileService),
            __param(7, event_1.IEventService),
            __param(8, instantiation_1.IInstantiationService)
        ], NewFileAction);
        return NewFileAction;
    }(BaseNewAction));
    exports.NewFileAction = NewFileAction;
    /* New Folder */
    var NewFolderAction = (function (_super) {
        __extends(NewFolderAction, _super);
        function NewFolderAction(tree, element, contextService, editorService, fileService, messageService, textFileService, eventService, instantiationService) {
            _super.call(this, 'workbench.action.files.newFolder', nls.localize(5, null), tree, false, instantiationService.createInstance(CreateFolderAction, element), null, contextService, editorService, fileService, messageService, textFileService, eventService);
            this.class = 'explorer-action new-folder';
            this._updateEnablement();
        }
        NewFolderAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, message_1.IMessageService),
            __param(6, ITextFileService),
            __param(7, event_1.IEventService),
            __param(8, instantiation_1.IInstantiationService)
        ], NewFolderAction);
        return NewFolderAction;
    }(BaseNewAction));
    exports.NewFolderAction = NewFolderAction;
    var BaseGlobalNewAction = (function (_super) {
        __extends(BaseGlobalNewAction, _super);
        function BaseGlobalNewAction(id, label, viewletService, instantiationService) {
            _super.call(this, id, label);
            this.viewletService = viewletService;
            this.instantiationService = instantiationService;
        }
        BaseGlobalNewAction.prototype.run = function () {
            var _this = this;
            return this.viewletService.openViewlet(Files.VIEWLET_ID, true).then(function (viewlet) {
                return winjs_base_1.TPromise.timeout(100).then(function () {
                    viewlet.focus();
                    var explorer = viewlet;
                    var explorerView = explorer.getExplorerView();
                    if (!explorerView.isExpanded()) {
                        explorerView.expand();
                    }
                    var action = _this.toDispose = _this.instantiationService.createInstance(_this.getAction(), explorerView.getViewer(), null);
                    return explorer.getActionRunner().run(action);
                });
            });
        };
        BaseGlobalNewAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.toDispose) {
                this.toDispose.dispose();
                this.toDispose = null;
            }
        };
        BaseGlobalNewAction = __decorate([
            __param(2, viewletService_1.IViewletService),
            __param(3, instantiation_1.IInstantiationService)
        ], BaseGlobalNewAction);
        return BaseGlobalNewAction;
    }(actions_1.Action));
    exports.BaseGlobalNewAction = BaseGlobalNewAction;
    /* Create new file from anywhere: Open untitled */
    var GlobalNewFileAction = (function (_super) {
        __extends(GlobalNewFileAction, _super);
        function GlobalNewFileAction(id, label, storageService, editorService, textFileService, untitledEditorService) {
            _super.call(this, id, label);
            this.storageService = storageService;
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.untitledEditorService = untitledEditorService;
        }
        GlobalNewFileAction.prototype.run = function () {
            var input = this.untitledEditorService.createOrGet();
            // Make sure this untitled buffer shows up in working files set
            this.textFileService.getWorkingFilesModel().addEntry(input.getResource());
            return this.editorService.openEditor(input);
        };
        GlobalNewFileAction.ID = 'workbench.action.files.newUntitledFile';
        GlobalNewFileAction.LABEL = nls.localize(6, null);
        GlobalNewFileAction = __decorate([
            __param(2, storage_1.IStorageService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, ITextFileService),
            __param(5, untitledEditorService_1.IUntitledEditorService)
        ], GlobalNewFileAction);
        return GlobalNewFileAction;
    }(actions_1.Action));
    exports.GlobalNewFileAction = GlobalNewFileAction;
    /* Create new folder from anywhere */
    var GlobalNewFolderAction = (function (_super) {
        __extends(GlobalNewFolderAction, _super);
        function GlobalNewFolderAction() {
            _super.apply(this, arguments);
        }
        GlobalNewFolderAction.prototype.getAction = function () {
            return NewFolderAction;
        };
        GlobalNewFolderAction.ID = 'workbench.action.files.newFolder';
        GlobalNewFolderAction.LABEL = nls.localize(7, null);
        return GlobalNewFolderAction;
    }(BaseGlobalNewAction));
    exports.GlobalNewFolderAction = GlobalNewFolderAction;
    /* Create New File/Folder (only used internally by explorerViewer) */
    var BaseCreateAction = (function (_super) {
        __extends(BaseCreateAction, _super);
        function BaseCreateAction() {
            _super.apply(this, arguments);
        }
        BaseCreateAction.prototype.validateFileName = function (parent, name) {
            if (this.element instanceof explorerViewModel_1.NewStatPlaceholder) {
                return validateFileName(parent, name, false);
            }
            return _super.prototype.validateFileName.call(this, parent, name);
        };
        return BaseCreateAction;
    }(BaseRenameAction));
    exports.BaseCreateAction = BaseCreateAction;
    /* Create New File (only used internally by explorerViewer) */
    var CreateFileAction = (function (_super) {
        __extends(CreateFileAction, _super);
        function CreateFileAction(element, contextService, editorService, fileService, messageService, textFileService, progressService, eventService) {
            _super.call(this, CreateFileAction.ID, CreateFileAction.LABEL, element, contextService, editorService, fileService, messageService, textFileService, progressService, eventService);
            this._updateEnablement();
        }
        CreateFileAction.prototype.runAction = function (fileName) {
            var _this = this;
            return this.fileService.createFile(uri_1.default.file(paths.join(this.element.parent.resource.fsPath, fileName))).then(function (stat) {
                _this.textFileService.getWorkingFilesModel().addEntry(stat.resource); // add to working files
                return stat;
            }, function (error) {
                _this.onErrorWithRetry(error, function () { return _this.runAction(fileName); });
            });
        };
        CreateFileAction.ID = 'workbench.files.action.createFileFromExplorer';
        CreateFileAction.LABEL = nls.localize(8, null);
        CreateFileAction = __decorate([
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, files_1.IFileService),
            __param(4, message_1.IMessageService),
            __param(5, ITextFileService),
            __param(6, progress_1.IProgressService),
            __param(7, event_1.IEventService)
        ], CreateFileAction);
        return CreateFileAction;
    }(BaseCreateAction));
    exports.CreateFileAction = CreateFileAction;
    /* Create New Folder (only used internally by explorerViewer) */
    var CreateFolderAction = (function (_super) {
        __extends(CreateFolderAction, _super);
        function CreateFolderAction(element, contextService, editorService, fileService, messageService, textFileService, progressService, eventService) {
            _super.call(this, CreateFolderAction.ID, CreateFolderAction.LABEL, null, contextService, editorService, fileService, messageService, textFileService, progressService, eventService);
            this._updateEnablement();
        }
        CreateFolderAction.prototype.runAction = function (fileName) {
            var _this = this;
            return this.fileService.createFolder(uri_1.default.file(paths.join(this.element.parent.resource.fsPath, fileName))).then(null, function (error) {
                _this.onErrorWithRetry(error, function () { return _this.runAction(fileName); });
            });
        };
        CreateFolderAction.ID = 'workbench.files.action.createFolderFromExplorer';
        CreateFolderAction.LABEL = nls.localize(9, null);
        CreateFolderAction = __decorate([
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, files_1.IFileService),
            __param(4, message_1.IMessageService),
            __param(5, ITextFileService),
            __param(6, progress_1.IProgressService),
            __param(7, event_1.IEventService)
        ], CreateFolderAction);
        return CreateFolderAction;
    }(BaseCreateAction));
    exports.CreateFolderAction = CreateFolderAction;
    var BaseDeleteFileAction = (function (_super) {
        __extends(BaseDeleteFileAction, _super);
        function BaseDeleteFileAction(id, label, tree, element, useTrash, contextService, editorService, fileService, messageService, textFileService, eventService) {
            _super.call(this, id, label, contextService, editorService, fileService, messageService, textFileService, eventService);
            this.tree = tree;
            this.element = element;
            this.useTrash = useTrash && !paths.isUNC(element.resource.fsPath); // on UNC shares there is no trash
            this._updateEnablement();
        }
        BaseDeleteFileAction.prototype.run = function () {
            var _this = this;
            // Remove highlight
            if (this.tree) {
                this.tree.clearHighlight();
            }
            // Ask for Confirm
            if (!this.skipConfirm) {
                var confirm_1;
                if (this.useTrash) {
                    confirm_1 = {
                        message: this.element.isDirectory ? nls.localize(10, null, this.element.name) : nls.localize(11, null, this.element.name),
                        detail: platform_1.isWindows ? nls.localize(12, null) : nls.localize(13, null),
                        primaryButton: platform_1.isWindows ? nls.localize(14, null) : nls.localize(15, null)
                    };
                }
                else {
                    confirm_1 = {
                        message: this.element.isDirectory ? nls.localize(16, null, this.element.name) : nls.localize(17, null, this.element.name),
                        detail: nls.localize(18, null),
                        primaryButton: nls.localize(19, null)
                    };
                }
                if (!this.messageService.confirm(confirm_1)) {
                    return winjs_base_1.TPromise.as(null);
                }
            }
            // Since a delete operation can take a while we want to emit the event proactively to avoid issues
            // with stale entries in the explorer tree.
            this.eventService.emit('files.internal:fileChanged', new Files.LocalFileChangeEvent(this.element.clone(), null));
            // Call function
            var servicePromise = this.fileService.del(this.element.resource, this.useTrash).then(function () {
                if (_this.element.parent) {
                    _this.tree.setFocus(_this.element.parent); // move focus to parent
                }
            }, function (error) {
                // Allow to retry
                var extraAction;
                if (_this.useTrash) {
                    extraAction = new actions_1.Action('permanentDelete', nls.localize(20, null), null, true, function () { _this.useTrash = false; _this.skipConfirm = true; return _this.run(); });
                }
                _this.onErrorWithRetry(error, function () { return _this.run(); }, extraAction);
                // Since the delete failed, best we can do is to refresh the explorer from the root to show the current state of files.
                var event = new Files.LocalFileChangeEvent(new explorerViewModel_1.FileStat(_this.contextService.getWorkspace().resource, true, true), new explorerViewModel_1.FileStat(_this.contextService.getWorkspace().resource, true, true));
                _this.eventService.emit('files.internal:fileChanged', event);
                // Focus back to tree
                _this.tree.DOMFocus();
            });
            return servicePromise;
        };
        BaseDeleteFileAction = __decorate([
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, editorService_1.IWorkbenchEditorService),
            __param(7, files_1.IFileService),
            __param(8, message_1.IMessageService),
            __param(9, ITextFileService),
            __param(10, event_1.IEventService)
        ], BaseDeleteFileAction);
        return BaseDeleteFileAction;
    }(BaseFileAction));
    exports.BaseDeleteFileAction = BaseDeleteFileAction;
    /* Move File/Folder to trash */
    var MoveFileToTrashAction = (function (_super) {
        __extends(MoveFileToTrashAction, _super);
        function MoveFileToTrashAction(tree, element, contextService, editorService, fileService, messageService, textFileService, eventService) {
            _super.call(this, MoveFileToTrashAction.ID, nls.localize(21, null), tree, element, true, contextService, editorService, fileService, messageService, textFileService, eventService);
        }
        MoveFileToTrashAction.ID = 'workbench.files.action.moveFileToTrash';
        MoveFileToTrashAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, message_1.IMessageService),
            __param(6, ITextFileService),
            __param(7, event_1.IEventService)
        ], MoveFileToTrashAction);
        return MoveFileToTrashAction;
    }(BaseDeleteFileAction));
    exports.MoveFileToTrashAction = MoveFileToTrashAction;
    /* Delete File/Folder */
    var DeleteFileAction = (function (_super) {
        __extends(DeleteFileAction, _super);
        function DeleteFileAction(tree, element, contextService, editorService, fileService, messageService, textFileService, eventService) {
            _super.call(this, DeleteFileAction.ID, nls.localize(22, null), tree, element, false, contextService, editorService, fileService, messageService, textFileService, eventService);
        }
        DeleteFileAction.ID = 'workbench.files.action.deleteFile';
        DeleteFileAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, message_1.IMessageService),
            __param(6, ITextFileService),
            __param(7, event_1.IEventService)
        ], DeleteFileAction);
        return DeleteFileAction;
    }(BaseDeleteFileAction));
    exports.DeleteFileAction = DeleteFileAction;
    /* Import File */
    var ImportFileAction = (function (_super) {
        __extends(ImportFileAction, _super);
        function ImportFileAction(tree, element, clazz, contextService, editorService, fileService, messageService, textFileService, eventService, progressService) {
            _super.call(this, ImportFileAction.ID, nls.localize(23, null), contextService, editorService, fileService, messageService, textFileService, eventService);
            this.progressService = progressService;
            this.tree = tree;
            this.element = element;
            if (clazz) {
                this.class = clazz;
            }
            this._updateEnablement();
        }
        ImportFileAction.prototype.getViewer = function () {
            return this.tree;
        };
        ImportFileAction.prototype.run = function (context) {
            var _this = this;
            var multiFileProgressTracker;
            var importPromise = winjs_base_1.TPromise.as(null).then(function () {
                var input = context.input;
                if (input.files && input.files.length > 0) {
                    // Find parent for import
                    var targetElement_1;
                    if (_this.element) {
                        targetElement_1 = _this.element;
                    }
                    else {
                        targetElement_1 = _this.tree.getFocus() || _this.tree.getInput();
                    }
                    if (!targetElement_1.isDirectory) {
                        targetElement_1 = targetElement_1.parent;
                    }
                    // Create real files array
                    var filesArray_1 = [];
                    for (var i = 0; i < input.files.length; i++) {
                        var file = input.files[i];
                        filesArray_1.push(file);
                    }
                    // Resolve target to check for name collisions and ask user
                    return _this.fileService.resolveFile(targetElement_1.resource).then(function (targetStat) {
                        // Check for name collisions
                        var targetNames = {};
                        targetStat.children.forEach(function (child) {
                            targetNames[platform_1.isLinux ? child.name : child.name.toLowerCase()] = child;
                        });
                        var overwrite = true;
                        if (filesArray_1.some(function (file) {
                            return !!targetNames[platform_1.isLinux ? file.name : file.name.toLowerCase()];
                        })) {
                            var confirm_2 = {
                                message: nls.localize(24, null),
                                detail: nls.localize(25, null),
                                primaryButton: nls.localize(26, null)
                            };
                            overwrite = _this.messageService.confirm(confirm_2);
                        }
                        if (!overwrite) {
                            return;
                        }
                        // Progress per file imported
                        if (filesArray_1.length > 1 && _this.progressService) {
                            multiFileProgressTracker = _this.progressService.show(filesArray_1.length);
                        }
                        // Run import in sequence
                        var importPromisesFactory = [];
                        filesArray_1.forEach(function (file) {
                            importPromisesFactory.push(function () {
                                var sourceFile = uri_1.default.file(file.path);
                                return _this.fileService.importFile(sourceFile, targetElement_1.resource).then(function (result) {
                                    // Progress
                                    if (multiFileProgressTracker) {
                                        multiFileProgressTracker.worked(1);
                                    }
                                    if (result.stat) {
                                        // Emit Deleted Event if file gets replaced unless it is the same file
                                        var oldFile = targetNames[platform_1.isLinux ? file.name : file.name.toLowerCase()];
                                        if (oldFile && oldFile.resource.fsPath !== result.stat.resource.fsPath) {
                                            _this.eventService.emit('files.internal:fileChanged', new Files.LocalFileChangeEvent(oldFile, null));
                                        }
                                        // Emit Import Event
                                        _this.eventService.emit('files.internal:fileChanged', new FileImportedEvent(result.stat, result.isNew, context.event));
                                    }
                                }, function (error) {
                                    _this.messageService.show(message_1.Severity.Error, error);
                                });
                            });
                        });
                        return async_1.sequence(importPromisesFactory);
                    });
                }
            });
            if (this.progressService && !multiFileProgressTracker) {
                this.progressService.showWhile(importPromise, 800);
            }
            return importPromise.then(function () {
                _this.tree.clearHighlight();
            }, function (error) {
                _this.onError(error);
                _this.tree.clearHighlight();
            });
        };
        ImportFileAction.ID = 'workbench.files.action.importFile';
        ImportFileAction = __decorate([
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, files_1.IFileService),
            __param(6, message_1.IMessageService),
            __param(7, ITextFileService),
            __param(8, event_1.IEventService),
            __param(9, progress_1.IProgressService)
        ], ImportFileAction);
        return ImportFileAction;
    }(BaseFileAction));
    exports.ImportFileAction = ImportFileAction;
    /** File import event is emitted when a file is import into the workbench. */
    var FileImportedEvent = (function (_super) {
        __extends(FileImportedEvent, _super);
        function FileImportedEvent(stat, isNew, originalEvent) {
            _super.call(this, null, stat, originalEvent);
            this.isNew = isNew;
        }
        FileImportedEvent.prototype.gotAdded = function () {
            return this.isNew;
        };
        FileImportedEvent.prototype.gotMoved = function () {
            return false;
        };
        FileImportedEvent.prototype.gotUpdated = function () {
            return !this.isNew;
        };
        FileImportedEvent.prototype.gotDeleted = function () {
            return false;
        };
        return FileImportedEvent;
    }(Files.LocalFileChangeEvent));
    exports.FileImportedEvent = FileImportedEvent;
    // Copy File/Folder
    var fileToCopy;
    var CopyFileAction = (function (_super) {
        __extends(CopyFileAction, _super);
        function CopyFileAction(tree, element, contextService, editorService, fileService, messageService, textFileService, eventService) {
            _super.call(this, CopyFileAction.ID, nls.localize(27, null), contextService, editorService, fileService, messageService, textFileService, eventService);
            this.tree = tree;
            this.element = element;
            this._updateEnablement();
        }
        CopyFileAction.prototype.run = function () {
            // Remember as file/folder to copy
            fileToCopy = this.element;
            // Remove highlight
            if (this.tree) {
                this.tree.clearHighlight();
            }
            this.tree.DOMFocus();
            return winjs_base_1.TPromise.as(null);
        };
        CopyFileAction.ID = 'workbench.files.action.copyFile';
        CopyFileAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, message_1.IMessageService),
            __param(6, ITextFileService),
            __param(7, event_1.IEventService)
        ], CopyFileAction);
        return CopyFileAction;
    }(BaseFileAction));
    exports.CopyFileAction = CopyFileAction;
    // Paste File/Folder
    var PasteFileAction = (function (_super) {
        __extends(PasteFileAction, _super);
        function PasteFileAction(tree, element, contextService, editorService, fileService, messageService, textFileService, eventService, instantiationService) {
            _super.call(this, PasteFileAction.ID, nls.localize(28, null), contextService, editorService, fileService, messageService, textFileService, eventService);
            this.instantiationService = instantiationService;
            this.tree = tree;
            this.element = element;
            this._updateEnablement();
        }
        PasteFileAction.prototype._isEnabled = function () {
            // Need at least a file to copy
            if (!fileToCopy) {
                return false;
            }
            // Check if file was deleted or moved meanwhile
            var root = this.tree.getInput();
            var exists = root.find(fileToCopy.resource);
            if (!exists) {
                fileToCopy = null;
                return false;
            }
            // Check if target is ancestor of pasted folder
            if (this.element.resource.toString() !== fileToCopy.resource.toString() && paths.isEqualOrParent(this.element.resource.fsPath, fileToCopy.resource.fsPath)) {
                return false;
            }
            return true;
        };
        PasteFileAction.prototype.run = function () {
            var _this = this;
            // Find target
            var target;
            if (this.element.resource.toString() === fileToCopy.resource.toString()) {
                target = this.element.parent;
            }
            else {
                target = this.element.isDirectory ? this.element : this.element.parent;
            }
            // Reuse duplicate action
            var pasteAction = this.instantiationService.createInstance(DuplicateFileAction, this.tree, fileToCopy, target);
            return pasteAction.run().then(function () {
                _this.tree.DOMFocus();
            });
        };
        PasteFileAction.ID = 'workbench.files.action.pasteFile';
        PasteFileAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, files_1.IFileService),
            __param(5, message_1.IMessageService),
            __param(6, ITextFileService),
            __param(7, event_1.IEventService),
            __param(8, instantiation_1.IInstantiationService)
        ], PasteFileAction);
        return PasteFileAction;
    }(BaseFileAction));
    exports.PasteFileAction = PasteFileAction;
    // Duplicate File/Folder
    var DuplicateFileAction = (function (_super) {
        __extends(DuplicateFileAction, _super);
        function DuplicateFileAction(tree, element, target, contextService, editorService, fileService, messageService, textFileService, eventService, progressService) {
            _super.call(this, 'workbench.files.action.duplicateFile', nls.localize(29, null), contextService, editorService, fileService, messageService, textFileService, eventService);
            this.progressService = progressService;
            this.tree = tree;
            this.element = element;
            this.target = (target && target.isDirectory) ? target : element.parent;
            this._updateEnablement();
        }
        DuplicateFileAction.prototype.run = function () {
            var _this = this;
            // Remove highlight
            if (this.tree) {
                this.tree.clearHighlight();
            }
            // Copy File and emit event
            var result = this.fileService.copyFile(this.element.resource, this.findTarget()).then(function (stat) {
                _this.eventService.emit('files.internal:fileChanged', new Files.LocalFileChangeEvent(null, stat));
            }, function (error) {
                _this.onError(error);
            });
            if (this.progressService) {
                this.progressService.showWhile(result, 800);
            }
            return result;
        };
        DuplicateFileAction.prototype.onError = function (error) {
            this.messageService.show(message_1.Severity.Error, error);
        };
        DuplicateFileAction.prototype.findTarget = function () {
            var root = this.tree.getInput();
            var name = this.element.name;
            var candidate = uri_1.default.file(paths.join(this.target.resource.fsPath, name));
            while (true) {
                if (!root.find(candidate)) {
                    break;
                }
                name = this.toCopyName(name, this.element.isDirectory);
                candidate = uri_1.default.file(paths.join(this.target.resource.fsPath, name));
            }
            return candidate;
        };
        DuplicateFileAction.prototype.toCopyName = function (name, isFolder) {
            // file.1.txt=>file.2.txt
            if (!isFolder && name.match(/(\d+)(\..*)$/)) {
                return name.replace(/(\d+)(\..*)$/, function (match, g1, g2) { return (parseInt(g1) + 1) + g2; });
            }
            // file.txt=>file.1.txt
            var lastIndexOfDot = name.lastIndexOf('.');
            if (!isFolder && lastIndexOfDot >= 0) {
                return strings.format('{0}.1{1}', name.substr(0, lastIndexOfDot), name.substr(lastIndexOfDot));
            }
            // folder.1=>folder.2
            if (isFolder && name.match(/(\d+)$/)) {
                return name.replace(/(\d+)$/, function (match) {
                    var groups = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        groups[_i - 1] = arguments[_i];
                    }
                    return String(parseInt(groups[0]) + 1);
                });
            }
            // file/folder=>file.1/folder.1
            return strings.format('{0}.1', name);
        };
        DuplicateFileAction = __decorate([
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, files_1.IFileService),
            __param(6, message_1.IMessageService),
            __param(7, ITextFileService),
            __param(8, event_1.IEventService),
            __param(9, progress_1.IProgressService)
        ], DuplicateFileAction);
        return DuplicateFileAction;
    }(BaseFileAction));
    exports.DuplicateFileAction = DuplicateFileAction;
    // Open to the side
    var OpenToSideAction = (function (_super) {
        __extends(OpenToSideAction, _super);
        function OpenToSideAction(tree, resource, preserveFocus, editorService) {
            _super.call(this, OpenToSideAction.ID, OpenToSideAction.LABEL);
            this.editorService = editorService;
            this.tree = tree;
            this.preserveFocus = preserveFocus;
            this.resource = resource;
            this.updateEnablement();
        }
        OpenToSideAction.prototype.updateEnablement = function () {
            var activeEditor = this.editorService.getActiveEditor();
            this.enabled = (!activeEditor || activeEditor.position !== editor_2.Position.RIGHT);
        };
        OpenToSideAction.prototype.run = function () {
            // Remove highlight
            this.tree.clearHighlight();
            // Set side input
            return this.editorService.openEditor({
                resource: this.resource,
                options: {
                    preserveFocus: this.preserveFocus
                }
            }, true);
        };
        OpenToSideAction.ID = 'workbench.files.action.openToSide';
        OpenToSideAction.LABEL = nls.localize(30, null);
        OpenToSideAction = __decorate([
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenToSideAction);
        return OpenToSideAction;
    }(actions_1.Action));
    exports.OpenToSideAction = OpenToSideAction;
    var globalResourceToCompare;
    var SelectResourceForCompareAction = (function (_super) {
        __extends(SelectResourceForCompareAction, _super);
        function SelectResourceForCompareAction(resource, tree) {
            _super.call(this, 'workbench.files.action.selectForCompare', nls.localize(31, null));
            this.tree = tree;
            this.resource = resource;
            this.enabled = true;
        }
        SelectResourceForCompareAction.prototype.run = function () {
            // Remember as source file to compare
            globalResourceToCompare = this.resource;
            // Remove highlight
            if (this.tree) {
                this.tree.clearHighlight();
                this.tree.DOMFocus();
            }
            return winjs_base_1.TPromise.as(null);
        };
        return SelectResourceForCompareAction;
    }(actions_1.Action));
    exports.SelectResourceForCompareAction = SelectResourceForCompareAction;
    // Global Compare with
    var GlobalCompareResourcesAction = (function (_super) {
        __extends(GlobalCompareResourcesAction, _super);
        function GlobalCompareResourcesAction(id, label, quickOpenService, instantiationService, editorService, messageService, eventService) {
            _super.call(this, id, label);
            this.quickOpenService = quickOpenService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.messageService = messageService;
            this.eventService = eventService;
        }
        GlobalCompareResourcesAction.prototype.run = function () {
            var _this = this;
            var fileInput = editor_1.asFileEditorInput(this.editorService.getActiveEditorInput());
            if (fileInput) {
                // Keep as resource to compare
                globalResourceToCompare = fileInput.getResource();
                // Listen for next editor to open
                var unbind_1 = this.eventService.addListener(events_2.EventType.EDITOR_INPUT_OPENING, function (e) {
                    unbind_1(); // listen once
                    var otherFileInput = editor_1.asFileEditorInput(e.editorInput);
                    if (otherFileInput) {
                        var compareAction_1 = _this.instantiationService.createInstance(CompareResourcesAction, otherFileInput.getResource(), null);
                        if (compareAction_1._isEnabled()) {
                            e.prevent();
                            compareAction_1.run().done(function () { return compareAction_1.dispose(); });
                        }
                        else {
                            _this.messageService.show(message_1.Severity.Info, nls.localize(33, null, paths.basename(globalResourceToCompare.fsPath)));
                        }
                    }
                });
                // Bring up quick open
                this.quickOpenService.show().then(function () {
                    unbind_1(); // make sure to unbind if quick open is closing
                });
            }
            else {
                this.messageService.show(message_1.Severity.Info, nls.localize(34, null));
            }
            return winjs_base_1.TPromise.as(true);
        };
        GlobalCompareResourcesAction.ID = 'workbench.files.action.compareFileWith';
        GlobalCompareResourcesAction.LABEL = nls.localize(32, null);
        GlobalCompareResourcesAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, message_1.IMessageService),
            __param(6, event_1.IEventService)
        ], GlobalCompareResourcesAction);
        return GlobalCompareResourcesAction;
    }(actions_1.Action));
    exports.GlobalCompareResourcesAction = GlobalCompareResourcesAction;
    // Compare with Resource
    var CompareResourcesAction = (function (_super) {
        __extends(CompareResourcesAction, _super);
        function CompareResourcesAction(resource, tree, contextService, instantiationService, editorService) {
            _super.call(this, 'workbench.files.action.compareFiles', CompareResourcesAction.computeLabel());
            this.contextService = contextService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.tree = tree;
            this.resource = resource;
        }
        CompareResourcesAction.computeLabel = function () {
            if (globalResourceToCompare) {
                return nls.localize(35, null, paths.basename(globalResourceToCompare.fsPath));
            }
            return nls.localize(36, null);
        };
        CompareResourcesAction.prototype.getLabel = function () {
            return CompareResourcesAction.computeLabel();
        };
        CompareResourcesAction.prototype._isEnabled = function () {
            // Need at least a resource to compare
            if (!globalResourceToCompare) {
                return false;
            }
            // Check if file was deleted or moved meanwhile (explorer only)
            if (this.tree) {
                var root = this.tree.getInput();
                if (root instanceof explorerViewModel_1.FileStat) {
                    var exists = root.find(globalResourceToCompare);
                    if (!exists) {
                        globalResourceToCompare = null;
                        return false;
                    }
                }
            }
            // Check if target is identical to source
            if (this.resource.toString() === globalResourceToCompare.toString()) {
                return false;
            }
            var mimeA = mime_1.guessMimeTypes(this.resource.fsPath).join(', ');
            var mimeB = mime_1.guessMimeTypes(globalResourceToCompare.fsPath).join(', ');
            // Check if target has same mime
            if (mimeA === mimeB) {
                return true;
            }
            // Ensure the mode is equal if this is text (limitation of current diff infrastructure)
            var isBinaryA = mime_1.isBinaryMime(mimeA);
            var isBinaryB = mime_1.isBinaryMime(mimeB);
            // Ensure we are not comparing binary with text
            if (isBinaryA !== isBinaryB) {
                return false;
            }
            return true;
        };
        CompareResourcesAction.prototype.run = function () {
            // Remove highlight
            if (this.tree) {
                this.tree.clearHighlight();
            }
            var leftInput = this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, globalResourceToCompare, void 0, void 0);
            var rightInput = this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, this.resource, void 0, void 0);
            return this.editorService.openEditor(new diffEditorInput_1.DiffEditorInput(diffEditorInput_1.toDiffLabel(globalResourceToCompare, this.resource, this.contextService), null, leftInput, rightInput));
        };
        CompareResourcesAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, editorService_1.IWorkbenchEditorService)
        ], CompareResourcesAction);
        return CompareResourcesAction;
    }(actions_1.Action));
    exports.CompareResourcesAction = CompareResourcesAction;
    // Refresh Explorer Viewer
    var RefreshViewExplorerAction = (function (_super) {
        __extends(RefreshViewExplorerAction, _super);
        function RefreshViewExplorerAction(explorerView, clazz) {
            _super.call(this, 'workbench.files.action.refreshExplorer', nls.localize(37, null), clazz, true, function (context) { return explorerView.refresh(); });
        }
        return RefreshViewExplorerAction;
    }(actions_1.Action));
    exports.RefreshViewExplorerAction = RefreshViewExplorerAction;
    var BaseActionWithErrorReporting = (function (_super) {
        __extends(BaseActionWithErrorReporting, _super);
        function BaseActionWithErrorReporting(id, label, messageService) {
            _super.call(this, id, label);
            this.messageService = messageService;
        }
        BaseActionWithErrorReporting.prototype.run = function () {
            var _this = this;
            return this.doRun().then(function () { return true; }, function (error) {
                _this.messageService.show(message_1.Severity.Error, errors.toErrorMessage(error, false));
            });
        };
        return BaseActionWithErrorReporting;
    }(actions_1.Action));
    exports.BaseActionWithErrorReporting = BaseActionWithErrorReporting;
    var BaseSaveFileAction = (function (_super) {
        __extends(BaseSaveFileAction, _super);
        function BaseSaveFileAction(id, label, editorService, textFileService, untitledEditorService, instantiationService, messageService) {
            _super.call(this, id, label, messageService);
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.untitledEditorService = untitledEditorService;
            this.instantiationService = instantiationService;
            this.enabled = true;
        }
        BaseSaveFileAction.prototype.setResource = function (resource) {
            this.resource = resource;
        };
        BaseSaveFileAction.prototype.doRun = function () {
            var _this = this;
            var source;
            if (this.resource) {
                source = this.resource;
            }
            else {
                source = editor_1.getUntitledOrFileResource(this.editorService.getActiveEditorInput(), true);
            }
            if (source) {
                // Save As (or Save untitled with associated path)
                if (this.isSaveAs() || source.scheme === 'untitled') {
                    var positionsOfSource_1 = findSaveAsPositions(this.editorService, source);
                    var mimeOfSource_1;
                    if (source.scheme === 'untitled') {
                        var selectedMime = this.untitledEditorService.get(source).getMime();
                        if (!mime_1.isUnspecific(selectedMime)) {
                            mimeOfSource_1 = [selectedMime, mime_1.MIME_TEXT].join(', ');
                        }
                    }
                    var encodingOfSource_1;
                    if (source.scheme === 'untitled') {
                        encodingOfSource_1 = this.untitledEditorService.get(source).getEncoding();
                    }
                    else if (source.scheme === 'file') {
                        var textModel = textFileEditorModel_1.CACHE.get(source);
                        encodingOfSource_1 = textModel && textModel.getEncoding(); // text model can be null e.g. if this is a binary file!
                    }
                    var selectionOfSource_1;
                    if (positionsOfSource_1.length) {
                        var activeEditor = this.editorService.getActiveEditor();
                        if (activeEditor && positionsOfSource_1.indexOf(activeEditor.position) >= 0) {
                            selectionOfSource_1 = activeEditor.getSelection();
                        }
                    }
                    // Special case: an untitled file with associated path gets saved directly unless "saveAs" is true
                    var savePromise = void 0;
                    if (!this.isSaveAs() && source.scheme === 'untitled' && this.untitledEditorService.hasAssociatedFilePath(source)) {
                        savePromise = this.textFileService.save(source).then(function (result) {
                            if (result) {
                                return uri_1.default.file(source.fsPath);
                            }
                            return null;
                        });
                    }
                    else {
                        savePromise = this.textFileService.saveAs(source);
                    }
                    return savePromise.then(function (target) {
                        if (!target) {
                            return;
                        }
                        // Reopen editors for the resource based on the positions
                        var reopenPromise = winjs_base_1.TPromise.as(null);
                        if (target.toString() !== source.toString() && positionsOfSource_1.length) {
                            var targetInput_1 = _this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, target, mimeOfSource_1, encodingOfSource_1);
                            var options_1;
                            if (selectionOfSource_1) {
                                options_1 = new editor_1.TextEditorOptions();
                                options_1.selection(selectionOfSource_1.startLineNumber, selectionOfSource_1.startColumn, selectionOfSource_1.endLineNumber, selectionOfSource_1.endColumn);
                            }
                            reopenPromise = _this.editorService.openEditor(targetInput_1, options_1, positionsOfSource_1[0]).then(function () {
                                if (positionsOfSource_1.length > 1) {
                                    return _this.editorService.openEditor(targetInput_1, options_1, positionsOfSource_1[1]).then(function () {
                                        if (positionsOfSource_1.length > 2) {
                                            return _this.editorService.openEditor(targetInput_1, options_1, positionsOfSource_1[2]);
                                        }
                                    });
                                }
                            });
                        }
                        return reopenPromise;
                    });
                }
                // Just save
                return this.textFileService.save(source);
            }
            return winjs_base_1.TPromise.as(false);
        };
        BaseSaveFileAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, ITextFileService),
            __param(4, untitledEditorService_1.IUntitledEditorService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, message_1.IMessageService)
        ], BaseSaveFileAction);
        return BaseSaveFileAction;
    }(BaseActionWithErrorReporting));
    exports.BaseSaveFileAction = BaseSaveFileAction;
    var SaveFileAction = (function (_super) {
        __extends(SaveFileAction, _super);
        function SaveFileAction() {
            _super.apply(this, arguments);
        }
        SaveFileAction.prototype.isSaveAs = function () {
            return false;
        };
        SaveFileAction.ID = 'workbench.action.files.save';
        SaveFileAction.LABEL = nls.localize(38, null);
        return SaveFileAction;
    }(BaseSaveFileAction));
    exports.SaveFileAction = SaveFileAction;
    var SaveFileAsAction = (function (_super) {
        __extends(SaveFileAsAction, _super);
        function SaveFileAsAction() {
            _super.apply(this, arguments);
        }
        SaveFileAsAction.prototype.isSaveAs = function () {
            return true;
        };
        SaveFileAsAction.ID = 'workbench.action.files.saveAs';
        SaveFileAsAction.LABEL = nls.localize(39, null);
        return SaveFileAsAction;
    }(BaseSaveFileAction));
    exports.SaveFileAsAction = SaveFileAsAction;
    var BaseSaveAllAction = (function (_super) {
        __extends(BaseSaveAllAction, _super);
        function BaseSaveAllAction(id, label, editorService, textFileService, untitledEditorService, instantiationService, eventService, messageService) {
            _super.call(this, id, label, messageService);
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.untitledEditorService = untitledEditorService;
            this.instantiationService = instantiationService;
            this.eventService = eventService;
            this.toDispose = [];
            this.lastIsDirty = this.textFileService.isDirty();
            this.enabled = this.lastIsDirty;
            this.registerListeners();
        }
        BaseSaveAllAction.prototype.registerListeners = function () {
            var _this = this;
            // listen to files being changed locally
            this.toDispose.push(this.eventService.addListener2(Files.EventType.FILE_DIRTY, function (e) { return _this.updateEnablement(true); }));
            this.toDispose.push(this.eventService.addListener2(Files.EventType.FILE_SAVED, function (e) { return _this.updateEnablement(false); }));
            this.toDispose.push(this.eventService.addListener2(Files.EventType.FILE_REVERTED, function (e) { return _this.updateEnablement(false); }));
            this.toDispose.push(this.eventService.addListener2(Files.EventType.FILE_SAVE_ERROR, function (e) { return _this.updateEnablement(true); }));
            if (this.includeUntitled()) {
                this.toDispose.push(this.eventService.addListener2(events_2.EventType.UNTITLED_FILE_DIRTY, function () { return _this.updateEnablement(true); }));
                this.toDispose.push(this.eventService.addListener2(events_2.EventType.UNTITLED_FILE_DELETED, function () { return _this.updateEnablement(false); }));
            }
        };
        BaseSaveAllAction.prototype.updateEnablement = function (isDirty) {
            if (this.lastIsDirty !== isDirty) {
                this.enabled = this.textFileService.isDirty();
                this.lastIsDirty = this.enabled;
            }
        };
        BaseSaveAllAction.prototype.doRun = function () {
            var _this = this;
            // Store mimes per untitled file to restore later
            var mapUntitledToProperties = Object.create(null);
            this.textFileService.getDirty()
                .filter(function (r) { return r.scheme === 'untitled'; }) // All untitled resources^
                .map(function (r) { return _this.untitledEditorService.get(r); }) // Mapped to their inputs
                .filter(function (i) { return !!i; }) // If possible :)
                .forEach(function (i) { return mapUntitledToProperties[i.getResource().toString()] = { mime: i.getMime(), encoding: i.getEncoding() }; });
            // Save all
            return this.textFileService.saveAll(this.includeUntitled()).then(function (result) {
                // all saved - now try to reopen saved untitled ones
                if (_this.includeUntitled()) {
                    var untitledResults = result.results.filter(function (res) { return res.source.scheme === 'untitled'; });
                    var reopenPromises_1 = [];
                    // Create a promise function for each editor open call to reopen
                    untitledResults.forEach(function (res) {
                        if (res.success) {
                            var positions = findSaveAsPositions(_this.editorService, res.source);
                            var mimeOfSource = void 0;
                            var selectedMime = mapUntitledToProperties[res.source.toString()] && mapUntitledToProperties[res.source.toString()].mime;
                            if (!mime_1.isUnspecific(selectedMime)) {
                                mimeOfSource = [selectedMime, mime_1.MIME_TEXT].join(', ');
                            }
                            var encodingOfSource = mapUntitledToProperties[res.source.toString()] && mapUntitledToProperties[res.source.toString()].encoding;
                            var targetInput_2 = _this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, res.target, mimeOfSource, encodingOfSource);
                            var options_2 = new editor_1.EditorOptions();
                            options_2.preserveFocus = true;
                            positions.forEach(function (position) {
                                reopenPromises_1.push(function () {
                                    return _this.editorService.openEditor(targetInput_2, options_2, position);
                                });
                            });
                        }
                    });
                    // Build a promise that completes when reopen is done
                    var reopenPromise = winjs_base_1.TPromise.as(null);
                    if (reopenPromises_1.length) {
                        reopenPromise = reopenPromises_1[0]().then(function () {
                            if (reopenPromises_1.length > 1) {
                                return reopenPromises_1[1]().then(function () {
                                    if (reopenPromises_1.length > 2) {
                                        return reopenPromises_1[2]();
                                    }
                                });
                            }
                        });
                    }
                    return reopenPromise;
                }
            });
        };
        BaseSaveAllAction.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        BaseSaveAllAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, ITextFileService),
            __param(4, untitledEditorService_1.IUntitledEditorService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, event_1.IEventService),
            __param(7, message_1.IMessageService)
        ], BaseSaveAllAction);
        return BaseSaveAllAction;
    }(BaseActionWithErrorReporting));
    exports.BaseSaveAllAction = BaseSaveAllAction;
    function findSaveAsPositions(editorService, outerResource) {
        var activeInput = editorService.getActiveEditorInput();
        return editorService.getVisibleEditors().filter(function (editor) {
            if (outerResource.scheme === 'file' && activeInput !== editor.input) {
                return false; // skip non active if this is about a file; for untitled respect them all
            }
            var innerResource = editor_1.getUntitledOrFileResource(editor.input);
            return innerResource && innerResource.toString() === outerResource.toString();
        }).map(function (editor) { return editor.position; });
    }
    var SaveAllAction = (function (_super) {
        __extends(SaveAllAction, _super);
        function SaveAllAction() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(SaveAllAction.prototype, "class", {
            get: function () {
                return 'explorer-action save-all';
            },
            enumerable: true,
            configurable: true
        });
        SaveAllAction.prototype.includeUntitled = function () {
            return true;
        };
        SaveAllAction.ID = 'workbench.action.files.saveAll';
        SaveAllAction.LABEL = nls.localize(40, null);
        return SaveAllAction;
    }(BaseSaveAllAction));
    exports.SaveAllAction = SaveAllAction;
    var SaveFilesAction = (function (_super) {
        __extends(SaveFilesAction, _super);
        function SaveFilesAction() {
            _super.apply(this, arguments);
        }
        SaveFilesAction.prototype.includeUntitled = function () {
            return false;
        };
        SaveFilesAction.ID = 'workbench.action.files.saveFiles';
        SaveFilesAction.LABEL = nls.localize(41, null);
        return SaveFilesAction;
    }(BaseSaveAllAction));
    exports.SaveFilesAction = SaveFilesAction;
    var RevertFileAction = (function (_super) {
        __extends(RevertFileAction, _super);
        function RevertFileAction(id, label, editorService, textFileService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.enabled = true;
        }
        RevertFileAction.prototype.setResource = function (resource) {
            this.resource = resource;
        };
        RevertFileAction.prototype.run = function () {
            var resource;
            if (this.resource) {
                resource = this.resource;
            }
            else {
                var activeFileInput = editor_1.asFileEditorInput(this.editorService.getActiveEditorInput(), true);
                if (activeFileInput) {
                    resource = activeFileInput.getResource();
                }
            }
            if (resource && resource.scheme !== 'untitled') {
                return this.textFileService.revert(resource, true /* force */);
            }
            return winjs_base_1.TPromise.as(true);
        };
        RevertFileAction.ID = 'workbench.action.files.revert';
        RevertFileAction.LABEL = nls.localize(42, null);
        RevertFileAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, ITextFileService)
        ], RevertFileAction);
        return RevertFileAction;
    }(actions_1.Action));
    exports.RevertFileAction = RevertFileAction;
    var OpenResourcesAction = (function (_super) {
        __extends(OpenResourcesAction, _super);
        function OpenResourcesAction(resources, diffMode, partService, editorService, viewletService, textFileService, contextService) {
            _super.call(this, 'workbench.files.action.openResourcesAction');
            this.partService = partService;
            this.editorService = editorService;
            this.viewletService = viewletService;
            this.textFileService = textFileService;
            this.contextService = contextService;
            this.resources = resources;
            this.diffMode = diffMode;
        }
        OpenResourcesAction.prototype.run = function () {
            var _this = this;
            return this.partService.joinCreation().then(function () {
                var viewletPromise = winjs_base_1.TPromise.as(null);
                if (!_this.partService.isSideBarHidden()) {
                    viewletPromise = _this.viewletService.openViewlet(Files.VIEWLET_ID, false);
                }
                return viewletPromise.then(function () {
                    // Out of workspace files get added right away to working files model
                    _this.resources.forEach(function (fileToOpen) {
                        var resource = fileToOpen.resource;
                        var workspace = _this.contextService.getWorkspace();
                        if (!workspace || !paths.isEqualOrParent(resource.fsPath, workspace.resource.fsPath)) {
                            _this.textFileService.getWorkingFilesModel().addEntry(resource);
                        }
                    });
                    // In diffMode we open 2 resources as diff
                    if (_this.diffMode) {
                        return winjs_base_1.TPromise.join(_this.resources.map(function (f) { return _this.editorService.inputToType(f); })).then(function (inputs) {
                            return _this.editorService.openEditor(new diffEditorInput_1.DiffEditorInput(diffEditorInput_1.toDiffLabel(_this.resources[0].resource, _this.resources[1].resource, _this.contextService), null, inputs[0], inputs[1]));
                        });
                    }
                    // For one file, just put it into the current active editor
                    if (_this.resources.length === 1) {
                        return _this.editorService.openEditor(_this.resources[0]);
                    }
                    // Otherwise replace all
                    return _this.editorService.setEditors(_this.resources);
                });
            });
        };
        OpenResourcesAction = __decorate([
            __param(2, partService_1.IPartService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, viewletService_1.IViewletService),
            __param(5, ITextFileService),
            __param(6, workspace_1.IWorkspaceContextService)
        ], OpenResourcesAction);
        return OpenResourcesAction;
    }(actions_1.Action));
    exports.OpenResourcesAction = OpenResourcesAction;
    var BaseCloseWorkingFileAction = (function (_super) {
        __extends(BaseCloseWorkingFileAction, _super);
        function BaseCloseWorkingFileAction(id, label, clazz, model, elements, untitledEditorService, editorService, textFileService, messageService, quickOpenService) {
            _super.call(this, id, label, clazz);
            this.untitledEditorService = untitledEditorService;
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.messageService = messageService;
            this.quickOpenService = quickOpenService;
            this.model = model;
            this.elements = elements ? elements.map(function (e) { return e.resource; }) : void 0 /* all */;
        }
        BaseCloseWorkingFileAction.prototype.run = function () {
            var _this = this;
            var workingFilesCount = this.model.getEntries().length;
            // Handle dirty
            var isDirty;
            if (this.elements) {
                isDirty = this.elements.some(function (e) { return _this.textFileService.isDirty(e); });
            }
            else {
                isDirty = this.textFileService.isDirty();
            }
            var saveOrRevertPromise = winjs_base_1.TPromise.as(null);
            if (isDirty) {
                var confirmResult = this.textFileService.confirmSave(this.elements);
                switch (confirmResult) {
                    case Files.ConfirmResult.SAVE:
                        if (this.elements) {
                            saveOrRevertPromise = this.textFileService.saveAll(this.elements);
                        }
                        else {
                            saveOrRevertPromise = this.textFileService.saveAll(true /* include untitled */);
                        }
                        break;
                    case Files.ConfirmResult.DONT_SAVE:
                        if (this.elements) {
                            saveOrRevertPromise = this.textFileService.revertAll(this.elements);
                        }
                        else {
                            saveOrRevertPromise = this.textFileService.revertAll();
                        }
                        break;
                    case Files.ConfirmResult.CANCEL:
                        return winjs_base_1.TPromise.as(null);
                }
            }
            return saveOrRevertPromise.then(function (result) {
                // Collect resources to dispose
                var resourcesToDispose = [];
                if (_this.elements) {
                    resourcesToDispose = _this.elements;
                }
                else {
                    resourcesToDispose = _this.model.getEntries().map(function (e) { return e.resource; });
                }
                // Remove those that failed from the save/revert if we had it
                if (result) {
                    var failed_1 = result.results.filter(function (r) { return !r.success; }).map(function (r) { return r.source.toString(); });
                    resourcesToDispose = resourcesToDispose.filter(function (r) { return failed_1.indexOf(r.toString()) < 0; });
                }
                // remove from model
                if (resourcesToDispose.length === workingFilesCount) {
                    _this.model.clear();
                }
                else {
                    resourcesToDispose.forEach(function (r) { return _this.model.removeEntry(r); });
                }
                // dispose
                resourcesToDispose.forEach(function (r) { return _this.disposeResource(r); });
            }, function (error) {
                _this.messageService.show(message_1.Severity.Error, error);
            });
        };
        BaseCloseWorkingFileAction.prototype.disposeResource = function (resource) {
            // file inputs
            fileEditorInputsForResource(resource, this.editorService, this.quickOpenService).forEach(function (input) {
                if (!input.isDisposed()) {
                    input.dispose(true);
                }
            });
            // untitled inputs
            var input = this.untitledEditorService.get(resource);
            if (input) {
                input.dispose();
            }
        };
        BaseCloseWorkingFileAction = __decorate([
            __param(5, untitledEditorService_1.IUntitledEditorService),
            __param(6, editorService_1.IWorkbenchEditorService),
            __param(7, ITextFileService),
            __param(8, message_1.IMessageService),
            __param(9, quickOpenService_1.IQuickOpenService)
        ], BaseCloseWorkingFileAction);
        return BaseCloseWorkingFileAction;
    }(actions_1.Action));
    exports.BaseCloseWorkingFileAction = BaseCloseWorkingFileAction;
    var CloseAllWorkingFilesAction = (function (_super) {
        __extends(CloseAllWorkingFilesAction, _super);
        function CloseAllWorkingFilesAction(model, untitledEditorService, editorService, textFileService, messageService, quickOpenService) {
            _super.call(this, CloseAllWorkingFilesAction.ID, nls.localize(43, null), 'action-close-all-files', model, null, untitledEditorService, editorService, textFileService, messageService, quickOpenService);
            this.enabled = (model.count() > 0);
            this.listenerToDispose = model.onModelChange(this.onModelChange, this);
        }
        CloseAllWorkingFilesAction.prototype.run = function () {
            var _this = this;
            return _super.prototype.run.call(this).then(function () { return closeNonFileEditors(_this.editorService); }); // close non file editors too
        };
        CloseAllWorkingFilesAction.prototype.onModelChange = function (event) {
            this.enabled = (this.model.count() > 0);
        };
        CloseAllWorkingFilesAction.prototype.dispose = function () {
            if (this.listenerToDispose) {
                this.listenerToDispose.dispose();
                this.listenerToDispose = null;
            }
            _super.prototype.dispose.call(this);
        };
        CloseAllWorkingFilesAction.ID = 'workbench.files.action.closeAllWorkingFiles';
        CloseAllWorkingFilesAction = __decorate([
            __param(1, untitledEditorService_1.IUntitledEditorService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, ITextFileService),
            __param(4, message_1.IMessageService),
            __param(5, quickOpenService_1.IQuickOpenService)
        ], CloseAllWorkingFilesAction);
        return CloseAllWorkingFilesAction;
    }(BaseCloseWorkingFileAction));
    exports.CloseAllWorkingFilesAction = CloseAllWorkingFilesAction;
    var CloseOneWorkingFileAction = (function (_super) {
        __extends(CloseOneWorkingFileAction, _super);
        function CloseOneWorkingFileAction(model, element, untitledEditorService, editorService, textFileService, messageService, quickOpenService) {
            _super.call(this, CloseOneWorkingFileAction.ID, nls.localize(44, null), element.dirty ? 'action-close-dirty-file' : 'action-close-file', model, [element], untitledEditorService, editorService, textFileService, messageService, quickOpenService);
        }
        CloseOneWorkingFileAction.ID = 'workbench.files.action.closeOneWorkingFile';
        CloseOneWorkingFileAction = __decorate([
            __param(2, untitledEditorService_1.IUntitledEditorService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, ITextFileService),
            __param(5, message_1.IMessageService),
            __param(6, quickOpenService_1.IQuickOpenService)
        ], CloseOneWorkingFileAction);
        return CloseOneWorkingFileAction;
    }(BaseCloseWorkingFileAction));
    exports.CloseOneWorkingFileAction = CloseOneWorkingFileAction;
    var CloseOtherWorkingFilesAction = (function (_super) {
        __extends(CloseOtherWorkingFilesAction, _super);
        function CloseOtherWorkingFilesAction(model, element, untitledEditorService, editorService, textFileService, messageService, quickOpenService) {
            _super.call(this, CloseOtherWorkingFilesAction.ID, nls.localize(45, null), 'action-close-file', model, model.getEntries().filter(function (e) { return e !== element; }), untitledEditorService, editorService, textFileService, messageService, quickOpenService);
        }
        CloseOtherWorkingFilesAction.prototype.run = function () {
            var _this = this;
            return _super.prototype.run.call(this).then(function () { return closeNonFileEditors(_this.editorService); }); // close non file editors too
        };
        CloseOtherWorkingFilesAction.ID = 'workbench.files.action.closeOtherWorkingFiles';
        CloseOtherWorkingFilesAction = __decorate([
            __param(2, untitledEditorService_1.IUntitledEditorService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, ITextFileService),
            __param(5, message_1.IMessageService),
            __param(6, quickOpenService_1.IQuickOpenService)
        ], CloseOtherWorkingFilesAction);
        return CloseOtherWorkingFilesAction;
    }(BaseCloseWorkingFileAction));
    exports.CloseOtherWorkingFilesAction = CloseOtherWorkingFilesAction;
    function disposeNonDirtyFileInputs(editorService, quickopenService, textFileService, exclude) {
        var activeFileInputs = editorService.getVisibleEditors().map(function (e) { return editor_1.asFileEditorInput(e.input, true); }).filter(function (i) { return i instanceof fileEditorInput_1.FileEditorInput; });
        activeFileInputs.forEach(function (f) {
            if (exclude && exclude.toString() === f.getResource().toString()) {
                return; // excluded
            }
            if (textFileService.isDirty(f.getResource())) {
                return; // do not touch dirty
            }
            fileEditorInputsForResource(f.getResource(), editorService, quickopenService).forEach(function (i) {
                if (!i.isDisposed()) {
                    i.dispose(true);
                }
            });
        });
    }
    function closeNonFileEditors(editorService) {
        var nonFileEditors = editorService.getVisibleEditors().filter(function (e) { return !editor_1.getUntitledOrFileResource(e.input, true); });
        return winjs_base_1.TPromise.join(nonFileEditors.map(function (e) { return editorService.closeEditor(e); })).then(function () { return true; }, errors.onUnexpectedError);
    }
    function fileEditorInputsForResource(resource, editorService, quickopenService) {
        // Get cached ones
        var inputs = fileEditorInput_1.FileEditorInput.getAll(resource);
        // Add those from history as well
        var history = quickopenService.getEditorHistory();
        for (var i = 0; i < history.length; i++) {
            var element = history[i];
            if (element instanceof fileEditorInput_1.FileEditorInput && element.getResource().toString() === resource.toString()) {
                inputs.push(element);
            }
        }
        // Add those from visible editors too
        var editors = editorService.getVisibleEditors();
        editors.forEach(function (editor) {
            var input = editor.input;
            if (input instanceof fileEditorInput_1.FileEditorInput && input.getResource().toString() === resource.toString()) {
                inputs.push(input);
            }
        });
        return inputs;
    }
    var CloseFileAction = (function (_super) {
        __extends(CloseFileAction, _super);
        function CloseFileAction(id, label, instantiationService, editorService, textFileService, messageService, quickOpenService) {
            _super.call(this, id, label);
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.messageService = messageService;
            this.quickOpenService = quickOpenService;
        }
        CloseFileAction.prototype.run = function () {
            var editor = this.editorService.getActiveEditor();
            var input = this.editorService.getActiveEditorInput();
            var resource = editor_1.getUntitledOrFileResource(input, true);
            // For a file or untitled
            if (resource) {
                var model = this.textFileService.getWorkingFilesModel();
                var entry = model.findEntry(resource);
                // Use action to close a working file that will take care of everthing
                if (entry) {
                    var closeAction_1 = this.instantiationService.createInstance(CloseOneWorkingFileAction, model, entry);
                    closeAction_1.run().done(function () { return closeAction_1.dispose(); }, errors.onUnexpectedError);
                }
                else {
                    if (input instanceof diffEditorInput_1.DiffEditorInput) {
                        input = input.getModifiedInput();
                    }
                    // File Input
                    if (input instanceof fileEditorInput_1.FileEditorInput) {
                        fileEditorInputsForResource(input.getResource(), this.editorService, this.quickOpenService).forEach(function (input) {
                            if (!input.isDisposed()) {
                                input.dispose(true);
                            }
                        });
                    }
                    else {
                        input.dispose();
                    }
                }
            }
            else if (editor) {
                this.editorService.closeEditor(editor).done(null, errors.onUnexpectedError);
                ;
            }
            else {
                this.messageService.show(message_1.Severity.Info, nls.localize(47, null));
            }
            return winjs_base_1.TPromise.as(true);
        };
        CloseFileAction.ID = 'workbench.files.action.closeFile';
        CloseFileAction.LABEL = nls.localize(46, null);
        CloseFileAction = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, ITextFileService),
            __param(5, message_1.IMessageService),
            __param(6, quickOpenService_1.IQuickOpenService)
        ], CloseFileAction);
        return CloseFileAction;
    }(actions_1.Action));
    exports.CloseFileAction = CloseFileAction;
    var CloseOtherFilesAction = (function (_super) {
        __extends(CloseOtherFilesAction, _super);
        function CloseOtherFilesAction(id, label, instantiationService, editorService, textFileService, messageService, quickOpenService) {
            _super.call(this, id, label);
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.messageService = messageService;
            this.quickOpenService = quickOpenService;
        }
        CloseOtherFilesAction.prototype.run = function () {
            var _this = this;
            var workingFilesModel = this.textFileService.getWorkingFilesModel();
            var activeResource = editor_1.getUntitledOrFileResource(this.editorService.getActiveEditorInput(), true);
            var actionToRun;
            // Close all but active resource
            if (activeResource && workingFilesModel.hasEntry(activeResource)) {
                actionToRun = this.instantiationService.createInstance(CloseOtherWorkingFilesAction, workingFilesModel, workingFilesModel.findEntry(activeResource));
            }
            else {
                actionToRun = this.instantiationService.createInstance(CloseAllWorkingFilesAction, workingFilesModel);
            }
            return actionToRun.run().then(function () {
                actionToRun.dispose();
                // Dispose remaining non dirty ones except for active one
                disposeNonDirtyFileInputs(_this.editorService, _this.quickOpenService, _this.textFileService, activeResource);
            });
        };
        CloseOtherFilesAction.ID = 'workbench.files.action.closeOtherFiles';
        CloseOtherFilesAction.LABEL = nls.localize(48, null);
        CloseOtherFilesAction = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, ITextFileService),
            __param(5, message_1.IMessageService),
            __param(6, quickOpenService_1.IQuickOpenService)
        ], CloseOtherFilesAction);
        return CloseOtherFilesAction;
    }(actions_1.Action));
    exports.CloseOtherFilesAction = CloseOtherFilesAction;
    var CloseAllFilesAction = (function (_super) {
        __extends(CloseAllFilesAction, _super);
        function CloseAllFilesAction(id, label, instantiationService, editorService, textFileService, messageService, quickOpenService) {
            _super.call(this, id, label);
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.messageService = messageService;
            this.quickOpenService = quickOpenService;
        }
        CloseAllFilesAction.prototype.run = function () {
            var _this = this;
            // Close all Working Files
            var closeAction = this.instantiationService.createInstance(CloseAllWorkingFilesAction, this.textFileService.getWorkingFilesModel());
            return closeAction.run().then(function () {
                closeAction.dispose();
                // Dispose remaining non dirty ones
                disposeNonDirtyFileInputs(_this.editorService, _this.quickOpenService, _this.textFileService);
            });
        };
        CloseAllFilesAction.ID = 'workbench.files.action.closeAllFiles';
        CloseAllFilesAction.LABEL = nls.localize(49, null);
        CloseAllFilesAction = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, ITextFileService),
            __param(5, message_1.IMessageService),
            __param(6, quickOpenService_1.IQuickOpenService)
        ], CloseAllFilesAction);
        return CloseAllFilesAction;
    }(actions_1.Action));
    exports.CloseAllFilesAction = CloseAllFilesAction;
    var OpenNextWorkingFile = (function (_super) {
        __extends(OpenNextWorkingFile, _super);
        function OpenNextWorkingFile(id, label, editorService, textFileService, messageService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.messageService = messageService;
        }
        OpenNextWorkingFile.prototype.run = function () {
            var model = this.textFileService.getWorkingFilesModel();
            // Return: No working files
            if (model.count() === 0) {
                this.messageService.show(message_1.Severity.Info, nls.localize(51, null));
            }
            else {
                var resource = editor_1.getUntitledOrFileResource(this.editorService.getActiveEditorInput(), true);
                return this.editorService.openEditor({ resource: model.next(resource).resource });
            }
            return winjs_base_1.TPromise.as(true);
        };
        OpenNextWorkingFile.ID = 'workbench.files.action.openNextWorkingFile';
        OpenNextWorkingFile.LABEL = nls.localize(50, null);
        OpenNextWorkingFile = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, ITextFileService),
            __param(4, message_1.IMessageService)
        ], OpenNextWorkingFile);
        return OpenNextWorkingFile;
    }(actions_1.Action));
    exports.OpenNextWorkingFile = OpenNextWorkingFile;
    var OpenPreviousWorkingFile = (function (_super) {
        __extends(OpenPreviousWorkingFile, _super);
        function OpenPreviousWorkingFile(id, label, editorService, textFileService, messageService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.messageService = messageService;
        }
        OpenPreviousWorkingFile.prototype.run = function () {
            var model = this.textFileService.getWorkingFilesModel();
            // Return: No working files
            if (model.count() === 0) {
                this.messageService.show(message_1.Severity.Info, nls.localize(53, null));
            }
            else {
                var resource = editor_1.getUntitledOrFileResource(this.editorService.getActiveEditorInput(), true);
                return this.editorService.openEditor({ resource: model.previous(resource).resource });
            }
            return winjs_base_1.TPromise.as(true);
        };
        OpenPreviousWorkingFile.ID = 'workbench.files.action.openPreviousWorkingFile';
        OpenPreviousWorkingFile.LABEL = nls.localize(52, null);
        OpenPreviousWorkingFile = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, ITextFileService),
            __param(4, message_1.IMessageService)
        ], OpenPreviousWorkingFile);
        return OpenPreviousWorkingFile;
    }(actions_1.Action));
    exports.OpenPreviousWorkingFile = OpenPreviousWorkingFile;
    var AddToWorkingFiles = (function (_super) {
        __extends(AddToWorkingFiles, _super);
        function AddToWorkingFiles(id, label, editorService, textFileService, messageService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.messageService = messageService;
        }
        AddToWorkingFiles.prototype.run = function () {
            var fileInput = editor_1.asFileEditorInput(this.editorService.getActiveEditorInput(), true);
            if (fileInput) {
                this.textFileService.getWorkingFilesModel().addEntry(fileInput.getResource());
            }
            else {
                this.messageService.show(message_1.Severity.Info, nls.localize(55, null));
            }
            return winjs_base_1.TPromise.as(true);
        };
        AddToWorkingFiles.ID = 'workbench.files.action.addToWorkingFiles';
        AddToWorkingFiles.LABEL = nls.localize(54, null);
        AddToWorkingFiles = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, ITextFileService),
            __param(4, message_1.IMessageService)
        ], AddToWorkingFiles);
        return AddToWorkingFiles;
    }(actions_1.Action));
    exports.AddToWorkingFiles = AddToWorkingFiles;
    var FocusWorkingFiles = (function (_super) {
        __extends(FocusWorkingFiles, _super);
        function FocusWorkingFiles(id, label, viewletService) {
            _super.call(this, id, label);
            this.viewletService = viewletService;
        }
        FocusWorkingFiles.prototype.run = function () {
            return this.viewletService.openViewlet(Files.VIEWLET_ID, true).then(function (viewlet) {
                viewlet.getWorkingFilesView().expand();
                viewlet.getWorkingFilesView().getViewer().DOMFocus();
            });
        };
        FocusWorkingFiles.ID = 'workbench.files.action.focusWorkingFiles';
        FocusWorkingFiles.LABEL = nls.localize(56, null);
        FocusWorkingFiles = __decorate([
            __param(2, viewletService_1.IViewletService)
        ], FocusWorkingFiles);
        return FocusWorkingFiles;
    }(actions_1.Action));
    exports.FocusWorkingFiles = FocusWorkingFiles;
    var FocusFilesExplorer = (function (_super) {
        __extends(FocusFilesExplorer, _super);
        function FocusFilesExplorer(id, label, viewletService) {
            _super.call(this, id, label);
            this.viewletService = viewletService;
        }
        FocusFilesExplorer.prototype.run = function () {
            return this.viewletService.openViewlet(Files.VIEWLET_ID, true).then(function (viewlet) {
                var view = viewlet.getExplorerView();
                if (view) {
                    view.expand();
                    view.getViewer().DOMFocus();
                }
            });
        };
        FocusFilesExplorer.ID = 'workbench.files.action.focusFilesExplorer';
        FocusFilesExplorer.LABEL = nls.localize(57, null);
        FocusFilesExplorer = __decorate([
            __param(2, viewletService_1.IViewletService)
        ], FocusFilesExplorer);
        return FocusFilesExplorer;
    }(actions_1.Action));
    exports.FocusFilesExplorer = FocusFilesExplorer;
    var ShowActiveFileInExplorer = (function (_super) {
        __extends(ShowActiveFileInExplorer, _super);
        function ShowActiveFileInExplorer(id, label, editorService, viewletService, contextService, messageService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.viewletService = viewletService;
            this.contextService = contextService;
            this.messageService = messageService;
        }
        ShowActiveFileInExplorer.prototype.run = function () {
            var _this = this;
            var fileInput = editor_1.asFileEditorInput(this.editorService.getActiveEditorInput(), true);
            if (fileInput) {
                return this.viewletService.openViewlet(Files.VIEWLET_ID, false).then(function (viewlet) {
                    var isInsideWorkspace = _this.contextService.isInsideWorkspace(fileInput.getResource());
                    if (isInsideWorkspace) {
                        var explorerView = viewlet.getExplorerView();
                        if (explorerView) {
                            explorerView.expand();
                            explorerView.select(fileInput.getResource(), true);
                        }
                    }
                    else {
                        var workingFilesView = viewlet.getWorkingFilesView();
                        workingFilesView.expand();
                    }
                });
            }
            else {
                this.messageService.show(severity_1.default.Info, nls.localize(59, null));
            }
            return winjs_base_1.TPromise.as(true);
        };
        ShowActiveFileInExplorer.ID = 'workbench.files.action.showActiveFileInExplorer';
        ShowActiveFileInExplorer.LABEL = nls.localize(58, null);
        ShowActiveFileInExplorer = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, viewletService_1.IViewletService),
            __param(4, workspace_1.IWorkspaceContextService),
            __param(5, message_1.IMessageService)
        ], ShowActiveFileInExplorer);
        return ShowActiveFileInExplorer;
    }(actions_1.Action));
    exports.ShowActiveFileInExplorer = ShowActiveFileInExplorer;
    function keybindingForAction(id) {
        switch (id) {
            case GlobalNewFileAction.ID:
                return new keyCodes_1.Keybinding(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_N);
            case TriggerRenameFileAction.ID:
                return new keyCodes_1.Keybinding(platform_1.isMacintosh ? keyCodes_1.KeyCode.Enter : keyCodes_1.KeyCode.F2);
            case SaveFileAction.ID:
                return new keyCodes_1.Keybinding(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_S);
            case DeleteFileAction.ID:
            case MoveFileToTrashAction.ID:
                return new keyCodes_1.Keybinding(keyCodes_1.KeyCode.Delete);
            case CopyFileAction.ID:
                return new keyCodes_1.Keybinding(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_C);
            case PasteFileAction.ID:
                return new keyCodes_1.Keybinding(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_V);
            case OpenToSideAction.ID:
                if (platform_1.isMacintosh) {
                    return new keyCodes_1.Keybinding(keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
                }
                else {
                    return new keyCodes_1.Keybinding(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.Enter);
                }
        }
        return null;
    }
    exports.keybindingForAction = keybindingForAction;
    function validateFileName(parent, name, allowOverwriting) {
        if (allowOverwriting === void 0) { allowOverwriting = false; }
        // Produce a well formed file name
        name = getWellFormedFileName(name);
        // Name not provided
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return nls.localize(60, null);
        }
        // Do not allow to overwrite existing file
        if (!allowOverwriting) {
            if (parent.children && parent.children.some(function (c) {
                if (platform_1.isLinux) {
                    return c.name === name;
                }
                return c.name.toLowerCase() === name.toLowerCase();
            })) {
                return nls.localize(61, null, name);
            }
        }
        // Invalid File name
        if (!paths.isValidBasename(name)) {
            return nls.localize(62, null, name);
        }
        // Max length restriction (on Windows)
        if (platform_1.isWindows) {
            var fullPathLength = name.length + parent.resource.fsPath.length + 1;
            if (fullPathLength > 255) {
                return nls.localize(63, null, name);
            }
        }
        return null;
    }
    exports.validateFileName = validateFileName;
    function getWellFormedFileName(filename) {
        if (!filename) {
            return filename;
        }
        // Trim whitespaces
        filename = strings.trim(strings.trim(filename, ' '), '\t');
        // Remove trailing dots
        filename = strings.rtrim(filename, '.');
        return filename;
    }
    exports.getWellFormedFileName = getWellFormedFileName;
    // Diagnostics support
    var diag;
    if (!diag) {
        diag = diagnostics.register('FileActionsDiagnostics', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            console.log(args[1] + ' - ' + args[0] + ' (time: ' + args[2].getTime() + ' [' + args[2].toUTCString() + '])');
        });
    }
});
//# sourceMappingURL=fileActions.js.map