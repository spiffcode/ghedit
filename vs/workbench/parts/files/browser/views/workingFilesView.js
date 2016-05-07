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
define(["require", "exports", 'vs/nls!vs/workbench/parts/files/browser/views/workingFilesView', 'vs/base/browser/builder', 'vs/base/parts/tree/browser/treeImpl', 'vs/workbench/common/editor', 'vs/base/browser/ui/splitview/splitview', 'vs/workbench/parts/files/common/files', 'vs/base/browser/dom', 'vs/base/common/errors', 'vs/workbench/common/events', 'vs/workbench/browser/viewlet', 'vs/workbench/parts/files/browser/fileActions', 'vs/workbench/parts/files/browser/views/workingFilesViewer', 'vs/workbench/services/editor/common/editorService', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/contextview/browser/contextView', 'vs/platform/message/common/message'], function (require, exports, nls, builder_1, treeImpl_1, workbenchEditorCommon, splitview_1, files_1, DOM, errors, events_1, viewlet_1, fileActions_1, workingFilesViewer_1, editorService_1, configuration_1, event_1, instantiation_1, contextView_1, message_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WorkingFilesView = (function (_super) {
        __extends(WorkingFilesView, _super);
        function WorkingFilesView(actionRunner, settings, eventService, instantiationService, messageService, contextMenuService, textFileService, editorService, configurationService) {
            _super.call(this, actionRunner, WorkingFilesView.computeExpandedBodySize(textFileService.getWorkingFilesModel()), !!settings[WorkingFilesView.MEMENTO_COLLAPSED], nls.localize(0, null), messageService, contextMenuService);
            this.eventService = eventService;
            this.instantiationService = instantiationService;
            this.textFileService = textFileService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.settings = settings;
            this.model = this.textFileService.getWorkingFilesModel();
            this.lastDirtyCount = 0;
            this.disposeables = [];
        }
        WorkingFilesView.prototype.renderHeader = function (container) {
            var titleDiv = builder_1.$('div.title').appendTo(container);
            builder_1.$('span').text(nls.localize(1, null)).appendTo(titleDiv);
            this.dirtyCountElement = builder_1.$('div.monaco-count-badge').appendTo(titleDiv).hide().getHTMLElement();
            this.updateDirtyIndicator();
            _super.prototype.renderHeader.call(this, container);
        };
        WorkingFilesView.prototype.getActions = function () {
            return [
                this.instantiationService.createInstance(fileActions_1.SaveAllAction, fileActions_1.SaveAllAction.ID, fileActions_1.SaveAllAction.LABEL),
                this.instantiationService.createInstance(fileActions_1.CloseAllWorkingFilesAction, this.model)
            ];
        };
        WorkingFilesView.prototype.renderBody = function (container) {
            this.treeContainer = _super.prototype.renderViewTree.call(this, container);
            DOM.addClass(this.treeContainer, 'explorer-working-files');
            this.createViewer(builder_1.$(this.treeContainer));
        };
        WorkingFilesView.prototype.create = function () {
            // Load Config
            var configuration = this.configurationService.getConfiguration();
            this.onConfigurationUpdated(configuration);
            // listeners
            this.registerListeners();
            // highlight active input
            this.highlightInput(this.editorService.getActiveEditorInput());
            return _super.prototype.create.call(this);
        };
        WorkingFilesView.prototype.onConfigurationUpdated = function (configuration) {
            var visibleWorkingFiles = configuration && configuration.explorer && configuration.explorer.workingFiles && configuration.explorer.workingFiles.maxVisible;
            if (typeof visibleWorkingFiles === 'number') {
                this.maxVisibleWorkingFiles = visibleWorkingFiles;
            }
            else {
                this.maxVisibleWorkingFiles = WorkingFilesView.DEFAULT_MAX_VISIBLE_FILES;
            }
            var dynamicHeight = configuration && configuration.explorer && configuration.explorer.workingFiles && configuration.explorer.workingFiles.dynamicHeight;
            if (typeof dynamicHeight === 'boolean') {
                this.dynamicHeight = dynamicHeight;
            }
            else {
                this.dynamicHeight = WorkingFilesView.DEFAULT_DYNAMIC_HEIGHT;
            }
            // Adjust expanded body size
            this.expandedBodySize = this.getExpandedBodySize(this.model);
        };
        WorkingFilesView.prototype.registerListeners = function () {
            var _this = this;
            // update on model changes
            this.disposeables.push(this.model.onModelChange(this.onWorkingFilesModelChange, this));
            this.disposeables.push(this.model.onWorkingFileChange(this.onWorkingFileChange, this));
            // listen to untitled
            this.toDispose.push(this.eventService.addListener2(events_1.EventType.UNTITLED_FILE_DIRTY, function (e) { return _this.onUntitledFileDirty(); }));
            this.toDispose.push(this.eventService.addListener2(events_1.EventType.UNTITLED_FILE_DELETED, function (e) { return _this.onUntitledFileDeleted(); }));
            // listen to files being changed locally
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_DIRTY, function (e) { return _this.onTextFileDirty(e); }));
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_SAVED, function (e) { return _this.onTextFileSaved(e); }));
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_SAVE_ERROR, function (e) { return _this.onTextFileSaveError(e); }));
            this.toDispose.push(this.eventService.addListener2(files_1.EventType.FILE_REVERTED, function (e) { return _this.onTextFileReverted(e); }));
            // listen to files being opened
            this.toDispose.push(this.eventService.addListener2(events_1.EventType.EDITOR_INPUT_CHANGED, function (e) { return _this.onEditorInputChanged(e); }));
            // Also handle configuration updates
            this.toDispose.push(this.configurationService.addListener2(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.onConfigurationUpdated(e.config); }));
        };
        WorkingFilesView.prototype.onTextFileDirty = function (e) {
            if (this.textFileService.getAutoSaveMode() !== files_1.AutoSaveMode.AFTER_SHORT_DELAY) {
                this.updateDirtyIndicator(); // no indication needed when auto save is enabled for short delay
            }
        };
        WorkingFilesView.prototype.onTextFileSaved = function (e) {
            if (this.lastDirtyCount > 0) {
                this.updateDirtyIndicator();
            }
        };
        WorkingFilesView.prototype.onTextFileSaveError = function (e) {
            this.updateDirtyIndicator();
        };
        WorkingFilesView.prototype.onTextFileReverted = function (e) {
            if (this.lastDirtyCount > 0) {
                this.updateDirtyIndicator();
            }
        };
        WorkingFilesView.prototype.onUntitledFileDirty = function () {
            this.updateDirtyIndicator();
        };
        WorkingFilesView.prototype.onUntitledFileDeleted = function () {
            if (this.lastDirtyCount > 0) {
                this.updateDirtyIndicator();
            }
        };
        WorkingFilesView.prototype.updateDirtyIndicator = function () {
            var dirty = this.textFileService.getDirty().length;
            this.lastDirtyCount = dirty;
            if (dirty === 0) {
                builder_1.$(this.dirtyCountElement).hide();
            }
            else {
                var label = nls.localize(2, null, dirty);
                builder_1.$(this.dirtyCountElement).show().text(label).title(label);
            }
        };
        WorkingFilesView.prototype.onWorkingFilesModelChange = function (event) {
            if (this.isDisposed) {
                return;
            }
            // View size
            this.expandedBodySize = this.getExpandedBodySize(this.model);
            if (this.tree) {
                // Show in tree
                this.tree.refresh();
                // Make sure to keep active editor input highlighted
                var activeInput = this.editorService.getActiveEditorInput();
                this.highlightInput(activeInput);
            }
        };
        WorkingFilesView.prototype.onWorkingFileChange = function (file) {
            if (this.isDisposed) {
                return;
            }
            if (this.tree) {
                this.tree.refresh(file);
            }
        };
        WorkingFilesView.prototype.getExpandedBodySize = function (model) {
            return WorkingFilesView.computeExpandedBodySize(model, this.maxVisibleWorkingFiles, this.dynamicHeight);
        };
        WorkingFilesView.computeExpandedBodySize = function (model, maxVisibleWorkingFiles, hasDynamicHeight) {
            var entryCount = model.count();
            var visibleWorkingFiles = maxVisibleWorkingFiles;
            if (typeof visibleWorkingFiles !== 'number') {
                visibleWorkingFiles = WorkingFilesView.DEFAULT_MAX_VISIBLE_FILES;
            }
            var dynamicHeight = hasDynamicHeight;
            if (typeof dynamicHeight !== 'boolean') {
                dynamicHeight = WorkingFilesView.DEFAULT_DYNAMIC_HEIGHT;
            }
            var itemsToShow;
            if (dynamicHeight) {
                itemsToShow = Math.min(Math.max(visibleWorkingFiles, 1), entryCount);
            }
            else {
                itemsToShow = Math.max(visibleWorkingFiles, 1);
            }
            return itemsToShow * workingFilesViewer_1.WorkingFilesRenderer.FILE_ITEM_HEIGHT;
        };
        WorkingFilesView.prototype.onEditorInputChanged = function (e) {
            var activeInput = this.editorService.getActiveEditorInput();
            if (activeInput === e.editorInput) {
                this.highlightInput(e.editorInput);
            }
        };
        WorkingFilesView.prototype.highlightInput = function (input) {
            var entry;
            var resource = workbenchEditorCommon.getUntitledOrFileResource(input);
            if (resource) {
                entry = this.model.findEntry(resource);
            }
            if (entry) {
                this.highlightEntry(entry);
            }
            else {
                this.highlightEntry(null);
            }
        };
        WorkingFilesView.prototype.highlightEntry = function (entry) {
            this.tree.clearFocus();
            this.tree.clearSelection();
            if (entry) {
                this.tree.setFocus(entry);
                this.tree.setSelection([entry]);
                this.tree.reveal(entry).done(null, errors.onUnexpectedError);
            }
        };
        WorkingFilesView.prototype.createViewer = function (container) {
            var actionProvider = this.instantiationService.createInstance(workingFilesViewer_1.WorkingFilesActionProvider, this.model);
            var renderer = this.instantiationService.createInstance(workingFilesViewer_1.WorkingFilesRenderer, this.model, actionProvider, this.actionRunner);
            var dataSource = this.instantiationService.createInstance(workingFilesViewer_1.WorkingFilesDataSource);
            var controller = this.instantiationService.createInstance(workingFilesViewer_1.WorkingFilesController, this.model, actionProvider);
            var sorter = this.instantiationService.createInstance(workingFilesViewer_1.WorkingFilesSorter);
            var dnd = this.instantiationService.createInstance(workingFilesViewer_1.WorkingFilesDragAndDrop, this.model);
            var accessibility = this.instantiationService.createInstance(workingFilesViewer_1.WorkingFilesAccessibilityProvider);
            this.tree = new treeImpl_1.Tree(container.getHTMLElement(), {
                dataSource: dataSource,
                renderer: renderer,
                sorter: sorter,
                controller: controller,
                dnd: dnd,
                accessibilityProvider: accessibility
            }, {
                indentPixels: 0,
                twistiePixels: 8,
                ariaLabel: nls.localize(3, null)
            });
            this.tree.setInput(this.model);
            return this.tree;
        };
        WorkingFilesView.prototype.getOptimalWidth = function () {
            var parentNode = this.tree.getHTMLElement();
            var childNodes = [].slice.call(parentNode.querySelectorAll('.monaco-file-label > .file-name'));
            return DOM.getLargestChildWidth(parentNode, childNodes);
        };
        WorkingFilesView.prototype.shutdown = function () {
            this.settings[WorkingFilesView.MEMENTO_COLLAPSED] = (this.state === splitview_1.CollapsibleState.COLLAPSED);
            _super.prototype.shutdown.call(this);
        };
        WorkingFilesView.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            while (this.disposeables.length) {
                this.disposeables.pop().dispose();
            }
        };
        WorkingFilesView.MEMENTO_COLLAPSED = 'workingFiles.memento.collapsed';
        WorkingFilesView.DEFAULT_MAX_VISIBLE_FILES = 9;
        WorkingFilesView.DEFAULT_DYNAMIC_HEIGHT = true;
        WorkingFilesView = __decorate([
            __param(2, event_1.IEventService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, message_1.IMessageService),
            __param(5, contextView_1.IContextMenuService),
            __param(6, files_1.ITextFileService),
            __param(7, editorService_1.IWorkbenchEditorService),
            __param(8, configuration_1.IConfigurationService)
        ], WorkingFilesView);
        return WorkingFilesView;
    }(viewlet_1.AdaptiveCollapsibleViewletView));
    exports.WorkingFilesView = WorkingFilesView;
});
//# sourceMappingURL=workingFilesView.js.map