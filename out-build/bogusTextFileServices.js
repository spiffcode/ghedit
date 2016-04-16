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
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/common/paths', 'vs/base/common/strings', 'vs/base/common/platform', 'vs/base/common/uri', 'vs/platform/event/common/event', 'vs/workbench/parts/files/browser/textFileServices', 'vs/workbench/parts/files/common/editors/textFileEditorModel', 'vs/workbench/parts/files/common/files', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/platform/files/common/files', 'vs/workbench/common/editor/binaryEditorModel', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/telemetry/common/telemetry', 'vs/platform/configuration/common/configuration', 'vs/editor/common/services/modeService', 'vs/workbench/services/editor/common/editorService', 'windowService'], function (require, exports, nls, winjs_base_1, paths, strings, platform_1, uri_1, event_1, textFileServices_1, textFileEditorModel_1, files_1, untitledEditorService_1, files_2, binaryEditorModel_1, instantiation_1, contextService_1, lifecycle_1, telemetry_1, configuration_1, modeService_1, editorService_1, windowService_1) {
    'use strict';
    var TextFileService = (function (_super) {
        __extends(TextFileService, _super);
        function TextFileService(contextService, instantiationService, fileService, untitledEditorService, lifecycleService, telemetryService, configurationService, eventService, modeService, editorService, windowService) {
            _super.call(this, contextService, instantiationService, configurationService, telemetryService, lifecycleService, eventService);
            this.fileService = fileService;
            this.untitledEditorService = untitledEditorService;
            this.modeService = modeService;
            this.editorService = editorService;
            this.windowService = windowService;
            this.init();
        }
        TextFileService.prototype.beforeShutdown = function () {
            var _this = this;
            _super.prototype.beforeShutdown.call(this);
            // Dirty files need treatment on shutdown
            if (this.getDirty().length) {
                // If auto save is enabled, save all files and then check again for dirty files
                if (this.getAutoSaveMode() !== files_1.AutoSaveMode.OFF) {
                    return this.saveAll(false /* files only */).then(function () {
                        if (_this.getDirty().length) {
                            return _this.confirmBeforeShutdown(); // we still have dirty files around, so confirm normally
                        }
                        return false; // all good, no veto
                    });
                }
                // Otherwise just confirm what to do
                return this.confirmBeforeShutdown();
            }
            return false; // no veto
        };
        TextFileService.prototype.confirmBeforeShutdown = function () {
            var confirm = this.confirmSave();
            // Save
            if (confirm === files_1.ConfirmResult.SAVE) {
                return this.saveAll(true /* includeUntitled */).then(function (result) {
                    if (result.results.some(function (r) { return !r.success; })) {
                        return true; // veto if some saves failed
                    }
                    return false; // no veto
                });
            }
            else if (confirm === files_1.ConfirmResult.DONT_SAVE) {
                return false; // no veto
            }
            else if (confirm === files_1.ConfirmResult.CANCEL) {
                return true; // veto
            }
        };
        TextFileService.prototype.revertAll = function (resources, force) {
            var _this = this;
            // Revert files
            return _super.prototype.revertAll.call(this, resources, force).then(function (r) {
                // Revert untitled
                var untitledInputs = _this.untitledEditorService.getAll(resources);
                untitledInputs.forEach(function (input) {
                    if (input) {
                        input.dispose();
                        r.results.push({
                            source: input.getResource(),
                            success: true
                        });
                    }
                });
                return r;
            });
        };
        TextFileService.prototype.getDirty = function (resources) {
            var _this = this;
            // Collect files
            var dirty = _super.prototype.getDirty.call(this, resources);
            // Add untitled ones
            if (!resources) {
                dirty.push.apply(dirty, this.untitledEditorService.getDirty());
            }
            else {
                var dirtyUntitled = resources.map(function (r) { return _this.untitledEditorService.get(r); }).filter(function (u) { return u && u.isDirty(); }).map(function (u) { return u.getResource(); });
                dirty.push.apply(dirty, dirtyUntitled);
            }
            return dirty;
        };
        TextFileService.prototype.isDirty = function (resource) {
            if (_super.prototype.isDirty.call(this, resource)) {
                return true;
            }
            return this.untitledEditorService.getDirty().some(function (dirty) { return !resource || dirty.toString() === resource.toString(); });
        };
        TextFileService.prototype.confirmSave = function (resources) {
            if (!!this.contextService.getConfiguration().env.extensionDevelopmentPath) {
                return files_1.ConfirmResult.DONT_SAVE; // no veto when we are in extension dev mode because we cannot assum we run interactive (e.g. tests)
            }
            var resourcesToConfirm = this.getDirty(resources);
            if (resourcesToConfirm.length === 0) {
                return files_1.ConfirmResult.DONT_SAVE;
            }
            var message = [
                resourcesToConfirm.length === 1 ? nls.localize('saveChangesMessage', "Do you want to save the changes you made to {0}?", paths.basename(resourcesToConfirm[0].fsPath)) : nls.localize('saveChangesMessages', "Do you want to save the changes to the following files?")
            ];
            if (resourcesToConfirm.length > 1) {
                message.push('');
                message.push.apply(message, resourcesToConfirm.map(function (r) { return paths.basename(r.fsPath); }));
                message.push('');
            }
            // Button order
            // Windows: Save | Don't Save | Cancel
            // Mac/Linux: Save | Cancel | Don't
            var save = { label: resourcesToConfirm.length > 1 ? this.mnemonicLabel(nls.localize({ key: 'saveAll', comment: ['&& denotes a mnemonic'] }, "&&Save All")) : this.mnemonicLabel(nls.localize({ key: 'save', comment: ['&& denotes a mnemonic'] }, "&&Save")), result: files_1.ConfirmResult.SAVE };
            var dontSave = { label: this.mnemonicLabel(nls.localize({ key: 'dontSave', comment: ['&& denotes a mnemonic'] }, "Do&&n't Save")), result: files_1.ConfirmResult.DONT_SAVE };
            var cancel = { label: nls.localize('cancel', "Cancel"), result: files_1.ConfirmResult.CANCEL };
            var buttons = [save];
            if (platform_1.isWindows) {
                buttons.push(dontSave, cancel);
            }
            else {
                buttons.push(cancel, dontSave);
            }
            var opts = {
                title: this.contextService.getConfiguration().env.appName,
                message: message.join('\n'),
                type: 'warning',
                detail: nls.localize('saveChangesDetail', "Your changes will be lost if you don't save them."),
                buttons: buttons.map(function (b) { return b.label; }),
                noLink: true,
                cancelId: buttons.indexOf(cancel)
            };
            var choice = this.windowService.getWindow().showMessageBox(opts);
            return buttons[choice].result;
        };
        TextFileService.prototype.mnemonicLabel = function (label) {
            if (!platform_1.isWindows) {
                return label.replace(/&&/g, ''); // no mnemonic support on mac/linux in buttons yet
            }
            return label.replace(/&&/g, '&');
        };
        TextFileService.prototype.saveAll = function (arg1) {
            // get all dirty
            var toSave = [];
            if (Array.isArray(arg1)) {
                toSave = this.getDirty(arg1);
            }
            else {
                toSave = this.getDirty();
            }
            // split up between files and untitled
            var filesToSave = [];
            var untitledToSave = [];
            toSave.forEach(function (s) {
                if (s.scheme === 'file') {
                    filesToSave.push(s);
                }
                else if ((Array.isArray(arg1) || arg1 === true /* includeUntitled */) && s.scheme === 'untitled') {
                    untitledToSave.push(s);
                }
            });
            return this.doSaveAll(filesToSave, untitledToSave);
        };
        TextFileService.prototype.doSaveAll = function (fileResources, untitledResources) {
            var _this = this;
            // Preflight for untitled to handle cancellation from the dialog
            var targetsForUntitled = [];
            for (var i = 0; i < untitledResources.length; i++) {
                var untitled = this.untitledEditorService.get(untitledResources[i]);
                if (untitled) {
                    var targetPath = void 0;
                    // Untitled with associated file path don't need to prompt
                    if (this.untitledEditorService.hasAssociatedFilePath(untitled.getResource())) {
                        targetPath = untitled.getResource().fsPath;
                    }
                    else {
                        targetPath = this.promptForPathSync(this.suggestFileName(untitledResources[i]));
                        if (!targetPath) {
                            return winjs_base_1.TPromise.as({
                                results: fileResources.concat(untitledResources).map(function (r) {
                                    return {
                                        source: r
                                    };
                                })
                            });
                        }
                    }
                    targetsForUntitled.push(uri_1.default.file(targetPath));
                }
            }
            // Handle files
            return _super.prototype.saveAll.call(this, fileResources).then(function (result) {
                // Handle untitled
                var untitledSaveAsPromises = [];
                targetsForUntitled.forEach(function (target, index) {
                    var untitledSaveAsPromise = _this.saveAs(untitledResources[index], target).then(function (uri) {
                        result.results.push({
                            source: untitledResources[index],
                            target: uri,
                            success: !!uri
                        });
                    });
                    untitledSaveAsPromises.push(untitledSaveAsPromise);
                });
                return winjs_base_1.TPromise.join(untitledSaveAsPromises).then(function () {
                    return result;
                });
            });
        };
        TextFileService.prototype.saveAs = function (resource, target) {
            var _this = this;
            // Get to target resource
            var targetPromise;
            if (target) {
                targetPromise = winjs_base_1.TPromise.as(target);
            }
            else {
                var dialogPath = resource.fsPath;
                if (resource.scheme === 'untitled') {
                    dialogPath = this.suggestFileName(resource);
                }
                targetPromise = this.promptForPathAsync(dialogPath).then(function (path) { return path ? uri_1.default.file(path) : null; });
            }
            return targetPromise.then(function (target) {
                if (!target) {
                    return null; // user canceled
                }
                // Just save if target is same as models own resource
                if (resource.toString() === target.toString()) {
                    return _this.save(resource).then(function () { return resource; });
                }
                // Do it
                return _this.doSaveAs(resource, target);
            });
        };
        TextFileService.prototype.doSaveAs = function (resource, target) {
            var _this = this;
            // Retrieve text model from provided resource if any
            var modelPromise = winjs_base_1.TPromise.as(null);
            if (resource.scheme === 'file') {
                modelPromise = winjs_base_1.TPromise.as(textFileEditorModel_1.CACHE.get(resource));
            }
            else if (resource.scheme === 'untitled') {
                var untitled = this.untitledEditorService.get(resource);
                if (untitled) {
                    modelPromise = untitled.resolve();
                }
            }
            return modelPromise.then(function (model) {
                // We have a model: Use it (can be null e.g. if this file is binary and not a text file or was never opened before)
                if (model) {
                    return _this.doSaveTextFileAs(model, resource, target);
                }
                // Otherwise we can only copy
                return _this.fileService.copyFile(resource, target);
            }).then(function () {
                // Add target to working files because this is an operation that indicates activity
                _this.getWorkingFilesModel().addEntry(target);
                // Revert the source
                return _this.revert(resource).then(function () {
                    // Done: return target
                    return target;
                });
            });
        };
        TextFileService.prototype.doSaveTextFileAs = function (sourceModel, resource, target) {
            var _this = this;
            // create the target file empty if it does not exist already
            return this.fileService.resolveFile(target).then(function (stat) { return stat; }, function () { return null; }).then(function (stat) { return stat || _this.fileService.createFile(target); }).then(function (stat) {
                // resolve a model for the file (which can be binary if the file is not a text file)
                return _this.editorService.resolveEditorModel({ resource: target }).then(function (targetModel) {
                    // binary model: delete the file and run the operation again
                    if (targetModel instanceof binaryEditorModel_1.BinaryEditorModel) {
                        return _this.fileService.del(target).then(function () { return _this.doSaveTextFileAs(sourceModel, resource, target); });
                    }
                    // text model: take over encoding and model value from source model
                    targetModel.updatePreferredEncoding(sourceModel.getEncoding());
                    targetModel.textEditorModel.setValue(sourceModel.getValue());
                    // save model
                    return targetModel.save();
                });
            });
        };
        TextFileService.prototype.suggestFileName = function (untitledResource) {
            var workspace = this.contextService.getWorkspace();
            if (workspace) {
                return uri_1.default.file(paths.join(workspace.resource.fsPath, this.untitledEditorService.get(untitledResource).suggestFileName())).fsPath;
            }
            return this.untitledEditorService.get(untitledResource).suggestFileName();
        };
        TextFileService.prototype.promptForPathAsync = function (defaultPath) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                _this.windowService.getWindow().showSaveDialog(_this.getSaveDialogOptions(defaultPath ? paths.normalize(defaultPath, true) : void 0), function (path) {
                    c(path);
                });
            });
        };
        TextFileService.prototype.promptForPathSync = function (defaultPath) {
            return this.windowService.getWindow().showSaveDialog(this.getSaveDialogOptions(defaultPath ? paths.normalize(defaultPath, true) : void 0));
        };
        TextFileService.prototype.getSaveDialogOptions = function (defaultPath) {
            var _this = this;
            var options = {
                defaultPath: defaultPath
            };
            // Filters are working flaky in Electron and there are bugs. On Windows they are working
            // somewhat but we see issues:
            // - https://github.com/atom/electron/issues/3556
            // - https://github.com/Microsoft/vscode/issues/451
            // - Bug on Windows: When "All Files" is picked, the path gets an extra ".*"
            // Until these issues are resolved, we disable the dialog file extension filtering.
            var disable = true; // Simply using if (true) flags the code afterwards as not reachable.
            if (disable) {
                return options;
            }
            // Build the file filter by using our known languages
            var ext = paths.extname(defaultPath);
            var matchingFilter;
            var filters = this.modeService.getRegisteredLanguageNames().map(function (languageName) {
                var extensions = _this.modeService.getExtensions(languageName);
                if (!extensions || !extensions.length) {
                    return null;
                }
                var filter = { name: languageName, extensions: extensions.map(function (e) { return strings.trim(e, '.'); }) };
                if (ext && extensions.indexOf(ext) >= 0) {
                    matchingFilter = filter;
                    return null; // matching filter will be added last to the top
                }
                return filter;
            }).filter(function (f) { return !!f; });
            // Filters are a bit weird on Windows, based on having a match or not:
            // Match: we put the matching filter first so that it shows up selected and the all files last
            // No match: we put the all files filter first
            var allFilesFilter = { name: nls.localize('allFiles', "All Files"), extensions: ['*'] };
            if (matchingFilter) {
                filters.unshift(matchingFilter);
                filters.push(allFilesFilter);
            }
            else {
                filters.unshift(allFilesFilter);
            }
            options.filters = filters;
            return options;
        };
        TextFileService = __decorate([
            __param(0, contextService_1.IWorkspaceContextService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, files_2.IFileService),
            __param(3, untitledEditorService_1.IUntitledEditorService),
            __param(4, lifecycle_1.ILifecycleService),
            __param(5, telemetry_1.ITelemetryService),
            __param(6, configuration_1.IConfigurationService),
            __param(7, event_1.IEventService),
            __param(8, modeService_1.IModeService),
            __param(9, editorService_1.IWorkbenchEditorService),
            __param(10, windowService_1.IWindowService)
        ], TextFileService);
        return TextFileService;
    }(textFileServices_1.TextFileService));
    exports.TextFileService = TextFileService;
});
