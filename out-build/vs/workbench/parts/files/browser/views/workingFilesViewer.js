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
define(["require", "exports", 'vs/nls!vs/workbench/parts/files/browser/views/workingFilesViewer', 'vs/base/common/winjs.base', 'vs/base/common/platform', 'vs/base/browser/builder', 'vs/base/parts/tree/browser/tree', 'vs/base/browser/ui/filelabel/fileLabel', 'vs/base/parts/tree/browser/treeDnd', 'vs/base/parts/tree/browser/treeDefaults', 'vs/base/common/errors', 'vs/base/common/mime', 'vs/base/common/paths', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/parts/tree/browser/actionsRenderer', 'vs/workbench/browser/actionBarRegistry', 'vs/workbench/parts/files/browser/fileActions', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/files/common/workingFilesModel', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/contextview/browser/contextView', 'vs/platform/instantiation/common/instantiation', 'vs/platform/telemetry/common/telemetry', 'vs/base/common/keyCodes'], function (require, exports, nls, winjs_base_1, platform, builder_1, tree_1, fileLabel_1, treeDnd_1, treeDefaults_1, errors, mime, paths, actionbar_1, actionsRenderer_1, actionBarRegistry_1, fileActions_1, files_1, workingFilesModel_1, untitledEditorService_1, editorService_1, contextService_1, contextView_1, instantiation_1, telemetry_1, keyCodes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ROOT_ID = '__WORKING_FILES_ROOT';
    var WorkingFilesDataSource = (function () {
        function WorkingFilesDataSource() {
        }
        WorkingFilesDataSource.prototype.getId = function (tree, element) {
            if (element instanceof workingFilesModel_1.WorkingFileEntry) {
                return element.resource.toString();
            }
            return ROOT_ID;
        };
        WorkingFilesDataSource.prototype.hasChildren = function (tree, element) {
            if (element instanceof workingFilesModel_1.WorkingFilesModel) {
                return element.count() > 0;
            }
            return false;
        };
        WorkingFilesDataSource.prototype.getChildren = function (tree, element) {
            if (element instanceof workingFilesModel_1.WorkingFilesModel) {
                return winjs_base_1.TPromise.as(element.getEntries());
            }
            return winjs_base_1.TPromise.as([]);
        };
        WorkingFilesDataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(null);
        };
        return WorkingFilesDataSource;
    }());
    exports.WorkingFilesDataSource = WorkingFilesDataSource;
    var WorkingFilesSorter = (function () {
        function WorkingFilesSorter() {
        }
        WorkingFilesSorter.prototype.compare = function (tree, element, otherElement) {
            return workingFilesModel_1.WorkingFilesModel.compare(element, otherElement);
        };
        return WorkingFilesSorter;
    }());
    exports.WorkingFilesSorter = WorkingFilesSorter;
    var WorkingFilesRenderer = (function (_super) {
        __extends(WorkingFilesRenderer, _super);
        function WorkingFilesRenderer(model, actionProvider, actionRunner, contextService) {
            _super.call(this, {
                actionProvider: actionProvider,
                actionRunner: actionRunner
            });
            this.contextService = contextService;
        }
        WorkingFilesRenderer.prototype.getHeight = function (tree, element) {
            return WorkingFilesRenderer.FILE_ITEM_HEIGHT;
        };
        WorkingFilesRenderer.prototype.renderContents = function (tree, element, container) {
            var entry = element;
            var $el = builder_1.$(container).clearChildren();
            var item = builder_1.$('.working-files-item').appendTo($el);
            var label = builder_1.$('.working-files-item-label').appendTo(item);
            new fileLabel_1.FileLabel(label.getHTMLElement(), entry.resource, this.contextService);
            if (entry.dirty) {
                builder_1.$(container.parentElement).addClass('working-file-dirty');
            }
            else {
                builder_1.$(container.parentElement).removeClass('working-file-dirty');
            }
            return null;
        };
        WorkingFilesRenderer.FILE_ITEM_HEIGHT = 22;
        WorkingFilesRenderer = __decorate([
            __param(3, contextService_1.IWorkspaceContextService)
        ], WorkingFilesRenderer);
        return WorkingFilesRenderer;
    }(actionsRenderer_1.ActionsRenderer));
    exports.WorkingFilesRenderer = WorkingFilesRenderer;
    var WorkingFilesAccessibilityProvider = (function () {
        function WorkingFilesAccessibilityProvider() {
        }
        WorkingFilesAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            var entry = element;
            return nls.localize(0, null, paths.basename(entry.resource.fsPath));
        };
        return WorkingFilesAccessibilityProvider;
    }());
    exports.WorkingFilesAccessibilityProvider = WorkingFilesAccessibilityProvider;
    var WorkingFilesActionProvider = (function (_super) {
        __extends(WorkingFilesActionProvider, _super);
        function WorkingFilesActionProvider(model, instantiationService, untitledEditorService, textFileService) {
            _super.call(this);
            this.instantiationService = instantiationService;
            this.untitledEditorService = untitledEditorService;
            this.textFileService = textFileService;
            this.model = model;
        }
        WorkingFilesActionProvider.prototype.hasActions = function (tree, element) {
            return element instanceof workingFilesModel_1.WorkingFileEntry || _super.prototype.hasActions.call(this, tree, element);
        };
        // we don't call into super here because we put only one primary action to the left (Remove/Dirty Indicator)
        WorkingFilesActionProvider.prototype.getActions = function (tree, element) {
            var actions = [];
            if (element instanceof workingFilesModel_1.WorkingFileEntry) {
                actions.push(this.instantiationService.createInstance(fileActions_1.CloseOneWorkingFileAction, this.model, element));
            }
            return winjs_base_1.TPromise.as(actions);
        };
        WorkingFilesActionProvider.prototype.hasSecondaryActions = function (tree, element) {
            return element instanceof workingFilesModel_1.WorkingFileEntry || _super.prototype.hasActions.call(this, tree, element);
        };
        WorkingFilesActionProvider.prototype.getSecondaryActions = function (tree, element) {
            var _this = this;
            return _super.prototype.getSecondaryActions.call(this, tree, element).then(function (actions) {
                if (element instanceof workingFilesModel_1.WorkingFileEntry) {
                    // Open to side
                    var openToSideAction = _this.instantiationService.createInstance(fileActions_1.OpenToSideAction, tree, element.resource, false);
                    actions.unshift(openToSideAction); // be on top
                    // Files: Save / Revert
                    var autoSaveEnabled = (_this.textFileService.getAutoSaveMode() !== files_1.AutoSaveMode.OFF);
                    if ((!autoSaveEnabled || element.dirty) && element.isFile) {
                        actions.push(new actionbar_1.Separator());
                        var saveAction = _this.instantiationService.createInstance(fileActions_1.SaveFileAction, fileActions_1.SaveFileAction.ID, fileActions_1.SaveFileAction.LABEL);
                        saveAction.setResource(element.resource);
                        saveAction.enabled = element.dirty;
                        actions.push(saveAction);
                        var revertAction = _this.instantiationService.createInstance(fileActions_1.RevertFileAction, fileActions_1.RevertFileAction.ID, fileActions_1.RevertFileAction.LABEL);
                        revertAction.setResource(element.resource);
                        revertAction.enabled = element.dirty;
                        actions.push(revertAction);
                    }
                    // Untitled: Save / Save As
                    if (element.isUntitled) {
                        actions.push(new actionbar_1.Separator());
                        if (_this.untitledEditorService.hasAssociatedFilePath(element.resource)) {
                            var saveUntitledAction = _this.instantiationService.createInstance(fileActions_1.SaveFileAction, fileActions_1.SaveFileAction.ID, fileActions_1.SaveFileAction.LABEL);
                            saveUntitledAction.setResource(element.resource);
                            actions.push(saveUntitledAction);
                        }
                        var saveAsAction = _this.instantiationService.createInstance(fileActions_1.SaveFileAsAction, fileActions_1.SaveFileAsAction.ID, fileActions_1.SaveFileAsAction.LABEL);
                        saveAsAction.setResource(element.resource);
                        actions.push(saveAsAction);
                    }
                    // Compare
                    if (!element.isUntitled) {
                        actions.push(new actionbar_1.Separator());
                        // Run Compare
                        var runCompareAction = _this.instantiationService.createInstance(fileActions_1.CompareResourcesAction, element.resource, tree);
                        if (runCompareAction._isEnabled()) {
                            actions.push(runCompareAction);
                        }
                        // Select for Compare
                        actions.push(_this.instantiationService.createInstance(fileActions_1.SelectResourceForCompareAction, element.resource, tree));
                    }
                    // Close
                    actions.push(new actionbar_1.Separator());
                    actions.push(_this.instantiationService.createInstance(fileActions_1.CloseOneWorkingFileAction, _this.model, element));
                    actions.push(_this.instantiationService.createInstance(fileActions_1.CloseAllWorkingFilesAction, _this.model));
                    if (_this.model.count() > 1) {
                        actions.push(_this.instantiationService.createInstance(fileActions_1.CloseOtherWorkingFilesAction, _this.model, element));
                    }
                }
                return actions;
            });
        };
        WorkingFilesActionProvider = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, untitledEditorService_1.IUntitledEditorService),
            __param(3, files_1.ITextFileService)
        ], WorkingFilesActionProvider);
        return WorkingFilesActionProvider;
    }(actionBarRegistry_1.ContributableActionProvider));
    exports.WorkingFilesActionProvider = WorkingFilesActionProvider;
    var WorkingFilesDragAndDrop = (function (_super) {
        __extends(WorkingFilesDragAndDrop, _super);
        function WorkingFilesDragAndDrop(model, contextService) {
            _super.call(this);
            this.contextService = contextService;
            this.model = model;
        }
        WorkingFilesDragAndDrop.prototype.getDragURI = function (tree, element) {
            return element.resource.toString();
        };
        WorkingFilesDragAndDrop.prototype.onDragStart = function (tree, data, originalEvent) {
            var sources = data.getData();
            var source = null;
            if (Array.isArray(sources)) {
                source = sources[0];
            }
            // Native only: when a DownloadURL attribute is defined on the data transfer it is possible to
            // drag a file from the browser to the desktop and have it downloaded there.
            if (!(data instanceof treeDnd_1.DesktopDragAndDropData) && source && source.isFile) {
                var name_1 = paths.basename(source.resource.fsPath);
                originalEvent.dataTransfer.setData('DownloadURL', [mime.MIME_BINARY, name_1, source.resource.toString()].join(':'));
            }
        };
        WorkingFilesDragAndDrop.prototype.onDragOver = function (baum, data, target, originalEvent) {
            if (!(target instanceof workingFilesModel_1.WorkingFileEntry)) {
                return tree_1.DRAG_OVER_REJECT;
            }
            if (data instanceof treeDnd_1.ExternalElementsDragAndDropData) {
                var resource = files_1.asFileResource(data.getData()[0]);
                if (!resource) {
                    return tree_1.DRAG_OVER_REJECT;
                }
                return resource.isDirectory ? tree_1.DRAG_OVER_REJECT : tree_1.DRAG_OVER_ACCEPT;
            }
            if (data instanceof treeDnd_1.DesktopDragAndDropData) {
                return tree_1.DRAG_OVER_REJECT;
            }
            if (!(data instanceof treeDnd_1.ElementsDragAndDropData)) {
                return tree_1.DRAG_OVER_REJECT;
            }
            var sourceResource;
            var targetResource = target.resource;
            var draggedData = data.getData()[0];
            if (draggedData instanceof workingFilesModel_1.WorkingFileEntry) {
                sourceResource = draggedData.resource;
            }
            else {
                var source = files_1.asFileResource(draggedData);
                if (!source) {
                    return tree_1.DRAG_OVER_REJECT;
                }
                sourceResource = source.resource;
            }
            if (!targetResource || !sourceResource) {
                return tree_1.DRAG_OVER_REJECT;
            }
            return targetResource.toString() === sourceResource.toString() ? tree_1.DRAG_OVER_REJECT : tree_1.DRAG_OVER_ACCEPT;
        };
        WorkingFilesDragAndDrop.prototype.drop = function (tree, data, target, originalEvent) {
            var draggedElement;
            // Support drop from explorer viewer
            if (data instanceof treeDnd_1.ExternalElementsDragAndDropData) {
                var resource = files_1.asFileResource(data.getData()[0]);
                draggedElement = this.model.addEntry(resource.resource);
            }
            else {
                var source = data.getData();
                if (Array.isArray(source)) {
                    draggedElement = source[0];
                }
            }
            if (draggedElement) {
                this.model.reorder(draggedElement, target);
            }
        };
        WorkingFilesDragAndDrop = __decorate([
            __param(1, contextService_1.IWorkspaceContextService)
        ], WorkingFilesDragAndDrop);
        return WorkingFilesDragAndDrop;
    }(treeDefaults_1.DefaultDragAndDrop));
    exports.WorkingFilesDragAndDrop = WorkingFilesDragAndDrop;
    var WorkingFilesController = (function (_super) {
        __extends(WorkingFilesController, _super);
        function WorkingFilesController(model, provider, editorService, instantiationService, contextMenuService, telemetryService) {
            _super.call(this, { clickBehavior: treeDefaults_1.ClickBehavior.ON_MOUSE_DOWN });
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.telemetryService = telemetryService;
            this.model = model;
            this.actionProvider = provider;
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.ENTER, this.onEnterDown.bind(this));
            if (platform.isMacintosh) {
                this.upKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.WINCTRL_ENTER, this.onModifierEnterUp.bind(this)); // Mac: somehow Cmd+Enter does not work
            }
            else {
                this.upKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.CTRLCMD_ENTER, this.onModifierEnterUp.bind(this)); // Mac: somehow Cmd+Enter does not work
            }
        }
        /* protected */ WorkingFilesController.prototype.onClick = function (tree, element, event) {
            // Close working file on middle mouse click
            if (element instanceof workingFilesModel_1.WorkingFileEntry && event.browserEvent && event.browserEvent.button === 1 /* Middle Button */) {
                var closeAction_1 = this.instantiationService.createInstance(fileActions_1.CloseOneWorkingFileAction, this.model, element);
                closeAction_1.run().done(function () {
                    closeAction_1.dispose();
                }, errors.onUnexpectedError);
                return true;
            }
            return _super.prototype.onClick.call(this, tree, element, event);
        };
        /* protected */ WorkingFilesController.prototype.onLeftClick = function (tree, element, event, origin) {
            if (origin === void 0) { origin = 'mouse'; }
            var payload = { origin: origin };
            var isDoubleClick = (origin === 'mouse' && event.detail === 2);
            // Handle outside element click
            if (element instanceof workingFilesModel_1.WorkingFilesModel) {
                tree.clearFocus(payload);
                tree.clearSelection(payload);
                return false;
            }
            // Cancel Event
            var isMouseDown = event && event.browserEvent && event.browserEvent.type === 'mousedown';
            if (!isMouseDown) {
                event.preventDefault(); // we cannot preventDefault onMouseDown because this would break DND otherwise
            }
            event.stopPropagation();
            // Set DOM focus
            tree.DOMFocus();
            // Allow to unselect
            if (event.shiftKey) {
                var selection = tree.getSelection();
                if (selection && selection.length > 0 && selection[0] === element) {
                    tree.clearSelection(payload);
                }
            }
            else {
                var preserveFocus = !isDoubleClick;
                tree.setFocus(element, payload);
                if (isDoubleClick) {
                    event.preventDefault(); // focus moves to editor, we need to prevent default
                }
                tree.setSelection([element], payload);
                this.openEditor(element, preserveFocus, event && (event.ctrlKey || event.metaKey));
            }
            return true;
        };
        WorkingFilesController.prototype.onEnterDown = function (tree, event) {
            var payload = { origin: 'keyboard' };
            var element = tree.getFocus();
            if (element) {
                tree.setFocus(element, payload);
                this.openEditor(element, false, false);
            }
            return true;
        };
        WorkingFilesController.prototype.onModifierEnterUp = function (tree, event) {
            var element = tree.getFocus();
            if (element) {
                this.openEditor(element, false, true);
            }
            return true;
        };
        WorkingFilesController.prototype.onContextMenu = function (tree, element, event) {
            var _this = this;
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
                return false;
            }
            event.preventDefault();
            event.stopPropagation();
            tree.setFocus(element);
            var anchor = { x: event.posx + 1, y: event.posy };
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return anchor; },
                getActions: function () { return _this.actionProvider.getSecondaryActions(tree, element); },
                getKeyBinding: function (a) { return _this.getKeyBinding(a); },
                onHide: function (wasCancelled) {
                    if (wasCancelled) {
                        tree.DOMFocus();
                    }
                }
            });
            return true;
        };
        WorkingFilesController.prototype.getKeyBinding = function (action) {
            return fileActions_1.keybindingForAction(action.id);
        };
        WorkingFilesController.prototype.openEditor = function (element, preserveFocus, sideBySide) {
            if (element) {
                this.telemetryService.publicLog('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'workingSet' });
                this.editorService.openEditor({
                    resource: element.resource,
                    options: {
                        preserveFocus: preserveFocus
                    }
                }, sideBySide).done(null, errors.onUnexpectedError);
            }
        };
        WorkingFilesController = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, contextView_1.IContextMenuService),
            __param(5, telemetry_1.ITelemetryService)
        ], WorkingFilesController);
        return WorkingFilesController;
    }(treeDefaults_1.DefaultController));
    exports.WorkingFilesController = WorkingFilesController;
});
//# sourceMappingURL=workingFilesViewer.js.map