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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/files/browser/views/explorerViewer', 'vs/base/common/lifecycle', 'vs/base/common/objects', 'vs/base/browser/dom', 'vs/base/common/uri', 'vs/base/common/mime', 'vs/base/common/async', 'vs/base/common/paths', 'vs/base/common/errors', 'vs/base/common/types', 'vs/base/common/actions', 'vs/base/common/comparers', 'vs/base/browser/ui/inputbox/inputBox', 'vs/base/browser/builder', 'vs/base/common/platform', 'vs/base/common/glob', 'vs/workbench/browser/actionBarRegistry', 'vs/workbench/parts/files/common/files', 'vs/platform/files/common/files', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/parts/files/browser/fileActions', 'vs/workbench/common/editor', 'vs/base/parts/tree/browser/tree', 'vs/base/common/labels', 'vs/base/parts/tree/browser/treeDnd', 'vs/base/parts/tree/browser/treeDefaults', 'vs/base/parts/tree/browser/actionsRenderer', 'vs/workbench/parts/files/common/explorerViewModel', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/part/common/partService', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/contextview/browser/contextView', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/progress/common/progress', 'vs/platform/telemetry/common/telemetry', 'vs/base/common/keyCodes'], function (require, exports, winjs_base_1, nls, lifecycle, objects, DOM, uri_1, mime_1, async, paths, errors, types_1, Actions, comparers, inputBox_1, builder_1, platform, glob, actionBarRegistry_1, files_1, files_2, fileEditorInput_1, fileActions_1, editor_1, tree_1, labels, treeDnd_1, treeDefaults_1, actionsRenderer_1, explorerViewModel_1, editorService_1, partService_1, contextService_1, contextView_1, event_1, instantiation_1, message_1, progress_1, telemetry_1, keyCodes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FileDataSource = (function () {
        function FileDataSource(progressService, messageService, fileService, partService, contextService) {
            this.progressService = progressService;
            this.messageService = messageService;
            this.fileService = fileService;
            this.partService = partService;
            this.workspace = contextService.getWorkspace();
        }
        FileDataSource.prototype.getId = function (tree, stat) {
            return stat.getId();
        };
        FileDataSource.prototype.hasChildren = function (tree, stat) {
            return stat.isDirectory;
        };
        FileDataSource.prototype.getChildren = function (tree, stat) {
            var _this = this;
            // Return early if stat is already resolved
            if (stat.isDirectoryResolved) {
                return winjs_base_1.TPromise.as(stat.children);
            }
            else {
                // Resolve
                var promise = this.fileService.resolveFile(stat.resource, { resolveSingleChildDescendants: true }).then(function (dirStat) {
                    // Convert to view model
                    var modelDirStat = explorerViewModel_1.FileStat.create(dirStat);
                    // Add children to folder
                    for (var i = 0; i < modelDirStat.children.length; i++) {
                        stat.addChild(modelDirStat.children[i]);
                    }
                    stat.isDirectoryResolved = true;
                    return stat.children;
                }, function (e) {
                    _this.messageService.show(message_1.Severity.Error, e);
                    return []; // we could not resolve any children because of an error
                });
                this.progressService.showWhile(promise, this.partService.isCreated() ? 800 : 3200 /* less ugly initial startup */);
                return promise;
            }
        };
        FileDataSource.prototype.getParent = function (tree, stat) {
            if (!stat) {
                return winjs_base_1.TPromise.as(null); // can be null if nothing selected in the tree
            }
            // Return if root reached
            if (this.workspace && stat.resource.toString() === this.workspace.resource.toString()) {
                return winjs_base_1.TPromise.as(null);
            }
            // Return if parent already resolved
            if (stat.parent) {
                return winjs_base_1.TPromise.as(stat.parent);
            }
            // We never actually resolve the parent from the disk for performance reasons. It wouldnt make
            // any sense to resolve parent by parent with requests to walk up the chain. Instead, the explorer
            // makes sure to properly resolve a deep path to a specific file and merges the result with the model.
            return winjs_base_1.TPromise.as(null);
        };
        FileDataSource = __decorate([
            __param(0, progress_1.IProgressService),
            __param(1, message_1.IMessageService),
            __param(2, files_2.IFileService),
            __param(3, partService_1.IPartService),
            __param(4, contextService_1.IWorkspaceContextService)
        ], FileDataSource);
        return FileDataSource;
    }());
    exports.FileDataSource = FileDataSource;
    var FileActionProvider = (function (_super) {
        __extends(FileActionProvider, _super);
        function FileActionProvider(state) {
            _super.call(this);
            this.state = state;
        }
        FileActionProvider.prototype.hasActions = function (tree, stat) {
            if (stat instanceof explorerViewModel_1.NewStatPlaceholder) {
                return false;
            }
            return _super.prototype.hasActions.call(this, tree, stat);
        };
        FileActionProvider.prototype.getActions = function (tree, stat) {
            if (stat instanceof explorerViewModel_1.NewStatPlaceholder) {
                return winjs_base_1.TPromise.as([]);
            }
            return _super.prototype.getActions.call(this, tree, stat);
        };
        FileActionProvider.prototype.hasSecondaryActions = function (tree, stat) {
            if (stat instanceof explorerViewModel_1.NewStatPlaceholder) {
                return false;
            }
            return _super.prototype.hasSecondaryActions.call(this, tree, stat);
        };
        FileActionProvider.prototype.getSecondaryActions = function (tree, stat) {
            if (stat instanceof explorerViewModel_1.NewStatPlaceholder) {
                return winjs_base_1.TPromise.as([]);
            }
            return _super.prototype.getSecondaryActions.call(this, tree, stat);
        };
        FileActionProvider.prototype.runAction = function (tree, stat, arg, context) {
            var _this = this;
            if (context === void 0) { context = {}; }
            context = objects.mixin({
                viewletState: this.state,
                stat: stat
            }, context);
            if (!types_1.isString(arg)) {
                var action = arg;
                if (action.enabled) {
                    return action.run(context);
                }
                return null;
            }
            var id = arg;
            var promise = this.hasActions(tree, stat) ? this.getActions(tree, stat) : winjs_base_1.TPromise.as([]);
            return promise.then(function (actions) {
                for (var i = 0, len = actions.length; i < len; i++) {
                    if (actions[i].id === id && actions[i].enabled) {
                        return actions[i].run(context);
                    }
                }
                promise = _this.hasSecondaryActions(tree, stat) ? _this.getSecondaryActions(tree, stat) : winjs_base_1.TPromise.as([]);
                return promise.then(function (actions) {
                    for (var i = 0, len = actions.length; i < len; i++) {
                        if (actions[i].id === id && actions[i].enabled) {
                            return actions[i].run(context);
                        }
                    }
                    return null;
                });
            });
        };
        return FileActionProvider;
    }(actionBarRegistry_1.ContributableActionProvider));
    exports.FileActionProvider = FileActionProvider;
    var FileViewletState = (function () {
        function FileViewletState() {
            this._actionProvider = new FileActionProvider(this);
            this.editableStats = Object.create(null);
        }
        Object.defineProperty(FileViewletState.prototype, "actionProvider", {
            get: function () {
                return this._actionProvider;
            },
            enumerable: true,
            configurable: true
        });
        FileViewletState.prototype.getEditableData = function (stat) {
            return this.editableStats[stat.resource && stat.resource.toString()];
        };
        FileViewletState.prototype.setEditable = function (stat, editableData) {
            if (editableData) {
                this.editableStats[stat.resource && stat.resource.toString()] = editableData;
            }
        };
        FileViewletState.prototype.clearEditable = function (stat) {
            delete this.editableStats[stat.resource && stat.resource.toString()];
        };
        return FileViewletState;
    }());
    exports.FileViewletState = FileViewletState;
    var ActionRunner = (function (_super) {
        __extends(ActionRunner, _super);
        function ActionRunner(state) {
            _super.call(this);
            this.viewletState = state;
        }
        ActionRunner.prototype.run = function (action, context) {
            return _super.prototype.run.call(this, action, { viewletState: this.viewletState });
        };
        return ActionRunner;
    }(Actions.ActionRunner));
    exports.ActionRunner = ActionRunner;
    // Explorer Renderer
    var FileRenderer = (function (_super) {
        __extends(FileRenderer, _super);
        function FileRenderer(state, actionRunner, contextViewService) {
            _super.call(this, {
                actionProvider: state.actionProvider,
                actionRunner: actionRunner
            });
            this.contextViewService = contextViewService;
            this.state = state;
        }
        FileRenderer.prototype.getContentHeight = function (tree, element) {
            return 22;
        };
        FileRenderer.prototype.renderContents = function (tree, stat, domElement, previousCleanupFn) {
            var _this = this;
            var el = builder_1.$(domElement).clearChildren();
            var item = builder_1.$('.explorer-item').addClass(this.iconClass(stat)).appendTo(el);
            // File/Folder label
            var editableData = this.state.getEditableData(stat);
            if (!editableData) {
                var label = builder_1.$('.explorer-item-label').appendTo(item);
                builder_1.$('a.plain').text(stat.name).appendTo(label);
                return null;
            }
            // Input field (when creating a new file or folder or renaming)
            var inputBox = new inputBox_1.InputBox(item.getHTMLElement(), this.contextViewService, {
                validationOptions: {
                    validation: editableData.validator,
                    showMessage: true
                },
                ariaLabel: nls.localize(0, null)
            });
            var value = stat.name || '';
            var lastDot = value.lastIndexOf('.');
            inputBox.value = value;
            inputBox.select({ start: 0, end: lastDot > 0 && !stat.isDirectory ? lastDot : value.length });
            inputBox.focus();
            var done = async.once(function (commit) {
                tree.clearHighlight();
                if (commit && inputBox.value) {
                    _this.state.actionProvider.runAction(tree, stat, editableData.action, { value: inputBox.value });
                }
                setTimeout(function () {
                    tree.DOMFocus();
                    lifecycle.dispose(toDispose);
                }, 0);
            });
            var toDispose = [
                inputBox,
                DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, function (e) {
                    if (e.equals(keyCodes_1.CommonKeybindings.ENTER)) {
                        if (inputBox.validate()) {
                            done(true);
                        }
                    }
                    else if (e.equals(keyCodes_1.CommonKeybindings.ESCAPE)) {
                        done(false);
                    }
                }),
                DOM.addDisposableListener(inputBox.inputElement, 'blur', function () {
                    done(inputBox.isInputValid());
                })
            ];
            return function () { return done(true); };
        };
        FileRenderer.prototype.iconClass = function (element) {
            if (element.isDirectory) {
                return 'folder-icon';
            }
            return 'text-file-icon';
        };
        FileRenderer = __decorate([
            __param(2, contextView_1.IContextViewService)
        ], FileRenderer);
        return FileRenderer;
    }(actionsRenderer_1.ActionsRenderer));
    exports.FileRenderer = FileRenderer;
    // Explorer Accessibility Provider
    var FileAccessibilityProvider = (function () {
        function FileAccessibilityProvider() {
        }
        FileAccessibilityProvider.prototype.getAriaLabel = function (tree, stat) {
            return nls.localize(1, null, stat.name);
        };
        return FileAccessibilityProvider;
    }());
    exports.FileAccessibilityProvider = FileAccessibilityProvider;
    // Explorer Controller
    var FileController = (function (_super) {
        __extends(FileController, _super);
        function FileController(state, editorService, textFileService, contextMenuService, eventService, instantiationService, telemetryService, contextService) {
            _super.call(this, { clickBehavior: treeDefaults_1.ClickBehavior.ON_MOUSE_DOWN });
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.contextMenuService = contextMenuService;
            this.eventService = eventService;
            this.instantiationService = instantiationService;
            this.telemetryService = telemetryService;
            this.contextService = contextService;
            this.workspace = contextService.getWorkspace();
            this.didCatchEnterDown = false;
            this.downKeyBindingDispatcher.set(platform.isMacintosh ? keyCodes_1.CommonKeybindings.CTRLCMD_DOWN_ARROW : keyCodes_1.CommonKeybindings.ENTER, this.onEnterDown.bind(this));
            this.upKeyBindingDispatcher.set(platform.isMacintosh ? keyCodes_1.CommonKeybindings.CTRLCMD_DOWN_ARROW : keyCodes_1.CommonKeybindings.ENTER, this.onEnterUp.bind(this));
            if (platform.isMacintosh) {
                this.upKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.WINCTRL_ENTER, this.onModifierEnterUp.bind(this)); // Mac: somehow Cmd+Enter does not work
            }
            else {
                this.upKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.CTRLCMD_ENTER, this.onModifierEnterUp.bind(this)); // Mac: somehow Cmd+Enter does not work
            }
            this.downKeyBindingDispatcher.set(platform.isMacintosh ? keyCodes_1.CommonKeybindings.ENTER : keyCodes_1.CommonKeybindings.F2, this.onF2.bind(this));
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.CTRLCMD_C, this.onCopy.bind(this));
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.CTRLCMD_V, this.onPaste.bind(this));
            if (platform.isMacintosh) {
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.CTRLCMD_UP_ARROW, this.onLeft.bind(this));
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.CTRLCMD_BACKSPACE, this.onDelete.bind(this));
            }
            else {
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.DELETE, this.onDelete.bind(this));
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.SHIFT_DELETE, this.onDelete.bind(this));
            }
            this.state = state;
        }
        /* protected */ FileController.prototype.onLeftClick = function (tree, stat, event, origin) {
            if (origin === void 0) { origin = 'mouse'; }
            var payload = { origin: origin };
            var isDoubleClick = (origin === 'mouse' && event.detail === 2);
            // Handle Highlight Mode
            if (tree.getHighlight()) {
                // Cancel Event
                event.preventDefault();
                event.stopPropagation();
                tree.clearHighlight(payload);
                return false;
            }
            // Handle root
            if (this.workspace && stat.resource.toString() === this.workspace.resource.toString()) {
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
            // Expand / Collapse
            tree.toggleExpansion(stat);
            // Allow to unselect
            if (event.shiftKey && !(stat instanceof explorerViewModel_1.NewStatPlaceholder)) {
                var selection = tree.getSelection();
                if (selection && selection.length > 0 && selection[0] === stat) {
                    tree.clearSelection(payload);
                }
            }
            else if (!(stat instanceof explorerViewModel_1.NewStatPlaceholder)) {
                var preserveFocus = !isDoubleClick;
                tree.setFocus(stat, payload);
                if (isDoubleClick) {
                    event.preventDefault(); // focus moves to editor, we need to prevent default
                }
                if (!stat.isDirectory) {
                    tree.setSelection([stat], payload);
                    this.openEditor(stat, preserveFocus, event && (event.ctrlKey || event.metaKey));
                    // Doubleclick: add to working files set
                    if (isDoubleClick) {
                        this.textFileService.getWorkingFilesModel().addEntry(stat);
                    }
                }
            }
            return true;
        };
        FileController.prototype.onContextMenu = function (tree, stat, event) {
            var _this = this;
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
                return false;
            }
            event.preventDefault();
            event.stopPropagation();
            tree.setFocus(stat);
            if (!this.state.actionProvider.hasSecondaryActions(tree, stat)) {
                return true;
            }
            var anchor = { x: event.posx + 1, y: event.posy };
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return anchor; },
                getActions: function () { return _this.state.actionProvider.getSecondaryActions(tree, stat); },
                getActionItem: this.state.actionProvider.getActionItem.bind(this.state.actionProvider, tree, stat),
                getKeyBinding: function (a) { return fileActions_1.keybindingForAction(a.id); },
                getActionsContext: function () {
                    return {
                        viewletState: _this.state,
                        stat: stat
                    };
                },
                onHide: function (wasCancelled) {
                    if (wasCancelled) {
                        tree.DOMFocus();
                    }
                }
            });
            return true;
        };
        FileController.prototype.onEnterDown = function (tree, event) {
            if (tree.getHighlight()) {
                return false;
            }
            var payload = { origin: 'keyboard' };
            var stat = tree.getFocus();
            if (stat) {
                // Directory: Toggle expansion
                if (stat.isDirectory) {
                    tree.toggleExpansion(stat);
                }
                else {
                    tree.setFocus(stat, payload);
                    this.openEditor(stat, false, false);
                }
            }
            this.didCatchEnterDown = true;
            return true;
        };
        FileController.prototype.onEnterUp = function (tree, event) {
            if (!this.didCatchEnterDown || tree.getHighlight()) {
                return false;
            }
            var stat = tree.getFocus();
            if (stat && !stat.isDirectory) {
                this.openEditor(stat, false, false);
            }
            this.didCatchEnterDown = false;
            return true;
        };
        FileController.prototype.onModifierEnterUp = function (tree, event) {
            if (tree.getHighlight()) {
                return false;
            }
            var stat = tree.getFocus();
            if (stat && !stat.isDirectory) {
                this.openEditor(stat, false, true);
            }
            this.didCatchEnterDown = false;
            return true;
        };
        FileController.prototype.onCopy = function (tree, event) {
            var stat = tree.getFocus();
            if (stat) {
                this.runAction(tree, stat, 'workbench.files.action.copyFile').done();
                return true;
            }
            return false;
        };
        FileController.prototype.onPaste = function (tree, event) {
            var stat = tree.getFocus() || tree.getInput();
            if (stat) {
                var pasteAction = this.instantiationService.createInstance(fileActions_1.PasteFileAction, tree, stat);
                if (pasteAction._isEnabled()) {
                    pasteAction.run().done(null, errors.onUnexpectedError);
                    return true;
                }
            }
            return false;
        };
        FileController.prototype.openEditor = function (stat, preserveFocus, sideBySide) {
            if (stat && !stat.isDirectory) {
                var editorInput = this.instantiationService.createInstance(fileEditorInput_1.FileEditorInput, stat.resource, stat.mime, void 0);
                var editorOptions = new editor_1.EditorOptions();
                if (preserveFocus) {
                    editorOptions.preserveFocus = true;
                }
                this.telemetryService.publicLog('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'explorer' });
                this.editorService.openEditor(editorInput, editorOptions, sideBySide).done(null, errors.onUnexpectedError);
            }
        };
        FileController.prototype.onF2 = function (tree, event) {
            var stat = tree.getFocus();
            if (stat) {
                this.runAction(tree, stat, 'workbench.files.action.triggerRename').done();
                return true;
            }
            return false;
        };
        FileController.prototype.onDelete = function (tree, event) {
            var useTrash = !event.shiftKey;
            var stat = tree.getFocus();
            if (stat) {
                this.runAction(tree, stat, useTrash ? 'workbench.files.action.moveFileToTrash' : 'workbench.files.action.deleteFile').done();
                return true;
            }
            return false;
        };
        FileController.prototype.runAction = function (tree, stat, id) {
            return this.state.actionProvider.runAction(tree, stat, id);
        };
        FileController = __decorate([
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, files_1.ITextFileService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, event_1.IEventService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, telemetry_1.ITelemetryService),
            __param(7, contextService_1.IWorkspaceContextService)
        ], FileController);
        return FileController;
    }(treeDefaults_1.DefaultController));
    exports.FileController = FileController;
    // Explorer Sorter
    var FileSorter = (function () {
        function FileSorter() {
        }
        FileSorter.prototype.compare = function (tree, statA, statB) {
            if (statA.isDirectory && !statB.isDirectory) {
                return -1;
            }
            if (statB.isDirectory && !statA.isDirectory) {
                return 1;
            }
            if (statA.isDirectory && statB.isDirectory) {
                return statA.name.toLowerCase().localeCompare(statB.name.toLowerCase());
            }
            if (statA instanceof explorerViewModel_1.NewStatPlaceholder) {
                return -1;
            }
            if (statB instanceof explorerViewModel_1.NewStatPlaceholder) {
                return 1;
            }
            return comparers.compareFileNames(statA.name, statB.name);
        };
        return FileSorter;
    }());
    exports.FileSorter = FileSorter;
    // Explorer Filter
    var FileFilter = (function () {
        function FileFilter(contextService) {
            this.contextService = contextService;
            this.hiddenExpression = Object.create(null);
        }
        FileFilter.prototype.updateConfiguration = function (configuration) {
            var excludesConfig = (configuration && configuration.files && configuration.files.exclude) || Object.create(null);
            var needsRefresh = !objects.equals(this.hiddenExpression, excludesConfig);
            this.hiddenExpression = objects.clone(excludesConfig); // do not keep the config, as it gets mutated under our hoods
            return needsRefresh;
        };
        FileFilter.prototype.isVisible = function (tree, stat) {
            return this.doIsVisible(stat);
        };
        FileFilter.prototype.doIsVisible = function (stat) {
            if (stat instanceof explorerViewModel_1.NewStatPlaceholder) {
                return true; // always visible
            }
            var siblings = stat.parent && stat.parent.children && stat.parent.children.map(function (c) { return c.name; });
            // Hide those that match Hidden Patterns
            if (glob.match(this.hiddenExpression, this.contextService.toWorkspaceRelativePath(stat.resource), siblings)) {
                return false; // hidden through pattern
            }
            return true;
        };
        FileFilter = __decorate([
            __param(0, contextService_1.IWorkspaceContextService)
        ], FileFilter);
        return FileFilter;
    }());
    exports.FileFilter = FileFilter;
    // Explorer Drag And Drop Controller
    var FileDragAndDrop = (function () {
        function FileDragAndDrop(messageService, contextService, eventService, progressService, fileService, instantiationService, textFileService) {
            this.messageService = messageService;
            this.contextService = contextService;
            this.eventService = eventService;
            this.progressService = progressService;
            this.fileService = fileService;
            this.instantiationService = instantiationService;
            this.textFileService = textFileService;
        }
        FileDragAndDrop.prototype.getDragURI = function (tree, stat) {
            return stat.resource && stat.resource.toString();
        };
        FileDragAndDrop.prototype.onDragStart = function (tree, data, originalEvent) {
            var sources = data.getData();
            var source = null;
            if (sources.length > 0) {
                source = sources[0];
            }
            // When dragging folders, make sure to collapse them to free up some space
            if (source && source.isDirectory && tree.isExpanded(source)) {
                tree.collapse(source, false);
            }
            // Native only: when a DownloadURL attribute is defined on the data transfer it is possible to
            // drag a file from the browser to the desktop and have it downloaded there.
            if (!(data instanceof treeDnd_1.DesktopDragAndDropData)) {
                if (source && !source.isDirectory) {
                    originalEvent.dataTransfer.setData('DownloadURL', [mime_1.MIME_BINARY, source.name, source.resource.toString()].join(':'));
                }
            }
        };
        FileDragAndDrop.prototype.onDragOver = function (tree, data, target, originalEvent) {
            var isCopy = originalEvent && ((originalEvent.ctrlKey && !platform.isMacintosh) || (originalEvent.altKey && platform.isMacintosh));
            var fromDesktop = data instanceof treeDnd_1.DesktopDragAndDropData;
            if (this.contextService.getOptions().readOnly) {
                return tree_1.DRAG_OVER_REJECT;
            }
            // Desktop DND
            if (fromDesktop) {
                var dragData = data.getData();
                var types = dragData.types;
                var typesArray = [];
                for (var i = 0; i < types.length; i++) {
                    typesArray.push(types[i]);
                }
                if (typesArray.length === 0 || !typesArray.some(function (type) { return type === 'Files'; })) {
                    return tree_1.DRAG_OVER_REJECT;
                }
            }
            else if (data instanceof treeDnd_1.ExternalElementsDragAndDropData) {
                return tree_1.DRAG_OVER_REJECT;
            }
            else {
                var sources = data.getData();
                if (!Array.isArray(sources)) {
                    return tree_1.DRAG_OVER_REJECT;
                }
                if (sources.some(function (source) {
                    if (source instanceof explorerViewModel_1.NewStatPlaceholder) {
                        return true; // NewStatPlaceholders can not be moved
                    }
                    if (source.resource.toString() === target.resource.toString()) {
                        return true; // Can not move anything onto itself
                    }
                    if (!isCopy && paths.dirname(source.resource.fsPath) === target.resource.fsPath) {
                        return true; // Can not move a file to the same parent unless we copy
                    }
                    if (paths.isEqualOrParent(target.resource.fsPath, source.resource.fsPath)) {
                        return true; // Can not move a parent folder into one of its children
                    }
                    return false;
                })) {
                    return tree_1.DRAG_OVER_REJECT;
                }
            }
            // All
            if (target.isDirectory) {
                return fromDesktop || isCopy ? tree_1.DRAG_OVER_ACCEPT_BUBBLE_DOWN_COPY : tree_1.DRAG_OVER_ACCEPT_BUBBLE_DOWN;
            }
            if (target.resource.toString() !== this.contextService.getWorkspace().resource.toString()) {
                return fromDesktop || isCopy ? tree_1.DRAG_OVER_ACCEPT_BUBBLE_UP_COPY : tree_1.DRAG_OVER_ACCEPT_BUBBLE_UP;
            }
            return tree_1.DRAG_OVER_REJECT;
        };
        FileDragAndDrop.prototype.drop = function (tree, data, target, originalEvent) {
            var _this = this;
            var promise = winjs_base_1.TPromise.as(null);
            // Desktop DND (Import file)
            if (data instanceof treeDnd_1.DesktopDragAndDropData) {
                var importAction = this.instantiationService.createInstance(fileActions_1.ImportFileAction, tree, target, null);
                promise = importAction.run({
                    input: {
                        files: data.getData().files
                    }
                });
            }
            else {
                var source_1 = data.getData()[0];
                var isCopy_1 = (originalEvent.ctrlKey && !platform.isMacintosh) || (originalEvent.altKey && platform.isMacintosh);
                promise = tree.expand(target).then(function () {
                    // Reuse action if user copies
                    if (isCopy_1) {
                        var copyAction = _this.instantiationService.createInstance(fileActions_1.DuplicateFileAction, tree, source_1, target);
                        return copyAction.run();
                    }
                    // Handle dirty
                    var saveOrRevertPromise = winjs_base_1.TPromise.as(null);
                    if (_this.textFileService.isDirty(source_1.resource)) {
                        var res = _this.textFileService.confirmSave([source_1.resource]);
                        if (res === files_1.ConfirmResult.SAVE) {
                            saveOrRevertPromise = _this.textFileService.save(source_1.resource);
                        }
                        else if (res === files_1.ConfirmResult.DONT_SAVE) {
                            saveOrRevertPromise = _this.textFileService.revert(source_1.resource);
                        }
                        else if (res === files_1.ConfirmResult.CANCEL) {
                            return winjs_base_1.TPromise.as(null);
                        }
                    }
                    // For move, first check if file is dirty and save
                    return saveOrRevertPromise.then(function () {
                        // If the file is still dirty, do not touch it because a save is pending to the disk and we can not abort it
                        if (_this.textFileService.isDirty(source_1.resource)) {
                            _this.messageService.show(message_1.Severity.Warning, nls.localize(2, null, labels.getPathLabel(source_1.resource)));
                            return winjs_base_1.TPromise.as(null);
                        }
                        var targetResource = uri_1.default.file(paths.join(target.resource.fsPath, source_1.name));
                        var didHandleConflict = false;
                        var onMove = function (result) {
                            _this.eventService.emit('files.internal:fileChanged', new files_1.LocalFileChangeEvent(source_1.clone(), result));
                        };
                        // Move File/Folder and emit event
                        return _this.fileService.moveFile(source_1.resource, targetResource).then(onMove, function (error) {
                            // Conflict
                            if (error.fileOperationResult === files_2.FileOperationResult.FILE_MOVE_CONFLICT) {
                                didHandleConflict = true;
                                var confirm_1 = {
                                    message: nls.localize(3, null, source_1.name),
                                    detail: nls.localize(4, null),
                                    primaryButton: nls.localize(5, null)
                                };
                                if (_this.messageService.confirm(confirm_1)) {
                                    return _this.fileService.moveFile(source_1.resource, targetResource, true).then(function (result) {
                                        var fakeTargetState = new explorerViewModel_1.FileStat(targetResource);
                                        _this.eventService.emit('files.internal:fileChanged', new files_1.LocalFileChangeEvent(fakeTargetState, null));
                                        onMove(result);
                                    }, function (error) {
                                        _this.messageService.show(message_1.Severity.Error, error);
                                    });
                                }
                                return;
                            }
                            _this.messageService.show(message_1.Severity.Error, error);
                        });
                    });
                }, errors.onUnexpectedError);
            }
            this.progressService.showWhile(promise, 800);
            promise.done(null, errors.onUnexpectedError);
        };
        FileDragAndDrop = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, contextService_1.IWorkspaceContextService),
            __param(2, event_1.IEventService),
            __param(3, progress_1.IProgressService),
            __param(4, files_2.IFileService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, files_1.ITextFileService)
        ], FileDragAndDrop);
        return FileDragAndDrop;
    }());
    exports.FileDragAndDrop = FileDragAndDrop;
});
//# sourceMappingURL=explorerViewer.js.map