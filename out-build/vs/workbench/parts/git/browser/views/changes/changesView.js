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
define(["require", "exports", 'vs/nls!vs/workbench/parts/git/browser/views/changes/changesView', 'vs/base/common/platform', 'vs/base/common/lifecycle', 'vs/base/common/eventEmitter', 'vs/base/common/strings', 'vs/base/common/errors', 'vs/base/common/paths', 'vs/base/common/winjs.base', 'vs/base/browser/builder', 'vs/base/browser/keyboardEvent', 'vs/base/common/actions', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/parts/tree/browser/treeImpl', 'vs/workbench/common/events', 'vs/workbench/parts/git/common/git', 'vs/workbench/parts/git/browser/gitActions', 'vs/workbench/parts/git/common/gitModel', 'vs/workbench/parts/git/browser/views/changes/changesViewer', 'vs/workbench/parts/git/browser/gitEditorInputs', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/output/common/output', 'vs/workbench/common/editor', 'vs/base/browser/ui/inputbox/inputBox', 'vs/base/common/severity', 'vs/workbench/services/editor/common/editorService', 'vs/platform/contextview/browser/contextView', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/workspace/common/workspace', 'vs/platform/selection/common/selection', 'vs/platform/event/common/event', 'vs/base/common/keyCodes', 'vs/css!./changesView'], function (require, exports, nls, Platform, Lifecycle, EventEmitter, Strings, Errors, paths, WinJS, Builder, keyboardEvent_1, Actions, ActionBar, TreeImpl, WorkbenchEvents, git, GitActions, GitModel, Viewer, GitEditorInputs, Files, output_1, WorkbenchEditorCommon, InputBox, severity_1, editorService_1, contextView_1, instantiation_1, message_1, workspace_1, selection_1, event_1, keyCodes_1) {
    'use strict';
    var IGitService = git.IGitService;
    var $ = Builder.$;
    var ChangesView = (function (_super) {
        __extends(ChangesView, _super);
        function ChangesView(actionRunner, instantiationService, editorService, messageService, contextViewService, contextService, gitService, outputService, eventService) {
            var _this = this;
            _super.call(this);
            this.ID = 'changes';
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.messageService = messageService;
            this.contextViewService = contextViewService;
            this.contextService = contextService;
            this.gitService = gitService;
            this.outputService = outputService;
            this.visible = false;
            this.currentDimension = null;
            this.actionRunner = actionRunner;
            this.toDispose = [
                this.smartCommitAction = this.instantiationService.createInstance(GitActions.SmartCommitAction, this),
                eventService.addListener2(WorkbenchEvents.EventType.EDITOR_INPUT_CHANGED, function (e) { return _this.onEditorInputChanged(e.editorInput).done(null, Errors.onUnexpectedError); }),
                this.gitService.addListener2(git.ServiceEvents.OPERATION_START, function (e) { return _this.onGitOperationStart(e); }),
                this.gitService.addListener2(git.ServiceEvents.OPERATION_END, function (e) { return _this.onGitOperationEnd(e); }),
                this.gitService.getModel().addListener2(git.ModelEvents.MODEL_UPDATED, this.onGitModelUpdate.bind(this))
            ];
        }
        Object.defineProperty(ChangesView.prototype, "element", {
            // IView
            get: function () {
                this.render();
                return this.$el.getHTMLElement();
            },
            enumerable: true,
            configurable: true
        });
        ChangesView.prototype.render = function () {
            var _this = this;
            if (this.$el) {
                return;
            }
            this.$el = $('.changes-view');
            this.$commitView = $('.commit-view').appendTo(this.$el);
            // Commit view
            this.commitInputBox = new InputBox.InputBox(this.$commitView.getHTMLElement(), this.contextViewService, {
                placeholder: nls.localize(2, null, ChangesView.COMMIT_KEYBINDING),
                validationOptions: {
                    showMessage: true,
                    validation: function () { return null; }
                },
                ariaLabel: nls.localize(3, null, ChangesView.COMMIT_KEYBINDING),
                flexibleHeight: true
            });
            this.commitInputBox.onDidChange(function (value) { return _this.emit('change', value); });
            this.commitInputBox.onDidHeightChange(function (value) { return _this.emit('heightchange', value); });
            $(this.commitInputBox.inputElement).on('keydown', function (e) {
                var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (keyboardEvent.equals(keyCodes_1.CommonKeybindings.CTRLCMD_ENTER) || keyboardEvent.equals(keyCodes_1.CommonKeybindings.CTRLCMD_S)) {
                    if (_this.smartCommitAction.enabled) {
                        _this.actionRunner.run(_this.smartCommitAction).done();
                    }
                    else {
                        _this.commitInputBox.showMessage({ content: ChangesView.NOTHING_TO_COMMIT, formatContent: true, type: InputBox.MessageType.INFO });
                    }
                }
            }).on('blur', function () {
                _this.commitInputBox.hideMessage();
            });
            // Status view
            this.$statusView = $('.status-view').appendTo(this.$el);
            var actionProvider = this.instantiationService.createInstance(Viewer.ActionProvider);
            var renderer = this.instantiationService.createInstance(Viewer.Renderer, actionProvider, this.actionRunner);
            var dnd = this.instantiationService.createInstance(Viewer.DragAndDrop);
            var controller = this.instantiationService.createInstance(Viewer.Controller, actionProvider);
            this.tree = new TreeImpl.Tree(this.$statusView.getHTMLElement(), {
                dataSource: new Viewer.DataSource(),
                renderer: renderer,
                filter: new Viewer.Filter(),
                sorter: new Viewer.Sorter(),
                accessibilityProvider: new Viewer.AccessibilityProvider(),
                dnd: dnd,
                controller: controller
            }, {
                indentPixels: 0,
                twistiePixels: 20,
                ariaLabel: nls.localize(4, null)
            });
            this.tree.setInput(this.gitService.getModel().getStatus());
            this.tree.expandAll(this.gitService.getModel().getStatus().getGroups());
            this.toDispose.push(this.tree.addListener2('selection', function (e) { return _this.onSelection(e); }));
            this.toDispose.push(this.commitInputBox.onDidHeightChange(function () { return _this.layout(); }));
        };
        ChangesView.prototype.focus = function () {
            var selection = this.tree.getSelection();
            if (selection.length > 0) {
                this.tree.reveal(selection[0], 0.5).done(null, Errors.onUnexpectedError);
            }
            this.commitInputBox.focus();
        };
        ChangesView.prototype.layout = function (dimension) {
            if (dimension === void 0) { dimension = this.currentDimension; }
            if (!dimension) {
                return;
            }
            this.currentDimension = dimension;
            this.commitInputBox.layout();
            var statusViewHeight = dimension.height - (this.commitInputBox.height + 12 /* margin */);
            this.$statusView.size(dimension.width, statusViewHeight);
            this.tree.layout(statusViewHeight);
            if (this.commitInputBox.height === 134) {
                this.$commitView.addClass('scroll');
            }
            else {
                this.$commitView.removeClass('scroll');
            }
        };
        ChangesView.prototype.setVisible = function (visible) {
            this.visible = visible;
            if (visible) {
                this.tree.onVisible();
                return this.onEditorInputChanged(this.editorService.getActiveEditorInput());
            }
            else {
                this.tree.onHidden();
                return WinJS.TPromise.as(null);
            }
        };
        ChangesView.prototype.getSelection = function () {
            return new selection_1.StructuredSelection(this.tree.getSelection());
        };
        ChangesView.prototype.getControl = function () {
            return this.tree;
        };
        ChangesView.prototype.getActions = function () {
            var _this = this;
            if (!this.actions) {
                this.actions = [
                    this.smartCommitAction,
                    this.instantiationService.createInstance(GitActions.RefreshAction)
                ];
                this.actions.forEach(function (a) { return _this.toDispose.push(a); });
            }
            return this.actions;
        };
        ChangesView.prototype.getSecondaryActions = function () {
            var _this = this;
            if (!this.secondaryActions) {
                this.secondaryActions = [
                    this.instantiationService.createInstance(GitActions.SyncAction, GitActions.SyncAction.ID, GitActions.SyncAction.LABEL),
                    this.instantiationService.createInstance(GitActions.PullAction, GitActions.PullAction.ID, GitActions.PullAction.LABEL),
                    this.instantiationService.createInstance(GitActions.PullWithRebaseAction),
                    this.instantiationService.createInstance(GitActions.PushAction, GitActions.PushAction.ID, GitActions.PushAction.LABEL),
                    new ActionBar.Separator(),
                    this.instantiationService.createInstance(GitActions.PublishAction, GitActions.PublishAction.ID, GitActions.PublishAction.LABEL),
                    new ActionBar.Separator(),
                    this.instantiationService.createInstance(GitActions.CommitAction, this),
                    this.instantiationService.createInstance(GitActions.StageAndCommitAction, this),
                    this.instantiationService.createInstance(GitActions.UndoLastCommitAction, GitActions.UndoLastCommitAction.ID, GitActions.UndoLastCommitAction.LABEL),
                    new ActionBar.Separator(),
                    this.instantiationService.createInstance(GitActions.GlobalUnstageAction),
                    this.instantiationService.createInstance(GitActions.GlobalUndoAction),
                    new ActionBar.Separator(),
                    new Actions.Action('show.gitOutput', nls.localize(5, null), null, true, function () { return _this.outputService.getChannel('Git').show(); })
                ];
                this.secondaryActions.forEach(function (a) { return _this.toDispose.push(a); });
            }
            return this.secondaryActions;
        };
        // ICommitState
        ChangesView.prototype.getCommitMessage = function () {
            return Strings.trim(this.commitInputBox.value);
        };
        ChangesView.prototype.onEmptyCommitMessage = function () {
            this.commitInputBox.focus();
            this.commitInputBox.showMessage({ content: ChangesView.NEED_MESSAGE, formatContent: true, type: InputBox.MessageType.INFO });
        };
        // Events
        ChangesView.prototype.onGitModelUpdate = function () {
            var _this = this;
            if (this.tree) {
                this.tree.refresh().done(function () {
                    return _this.tree.expandAll(_this.gitService.getModel().getStatus().getGroups());
                });
            }
        };
        ChangesView.prototype.onEditorInputChanged = function (input) {
            var _this = this;
            if (!this.tree) {
                return WinJS.TPromise.as(null);
            }
            var status = this.getStatusFromInput(input);
            if (!status) {
                this.tree.clearSelection();
            }
            if (this.visible && this.tree.getSelection().indexOf(status) === -1) {
                return this.tree.reveal(status, 0.5).then(function () {
                    _this.tree.setSelection([status], { origin: 'implicit' });
                });
            }
            return WinJS.TPromise.as(null);
        };
        ChangesView.prototype.onSelection = function (e) {
            var _this = this;
            if (e.payload && e.payload && e.payload.origin === 'implicit') {
                return;
            }
            if (e.selection.length !== 1) {
                return;
            }
            var element = e.selection[0];
            if (!(element instanceof GitModel.FileStatus)) {
                return;
            }
            if (e.payload && e.payload.origin === 'keyboard' && !e.payload.originalEvent.equals(keyCodes_1.CommonKeybindings.ENTER)) {
                return;
            }
            var isMouseOrigin = e.payload && (e.payload.origin === 'mouse');
            if (isMouseOrigin && (e.payload.originalEvent.metaKey || e.payload.originalEvent.shiftKey)) {
                return;
            }
            var status = element;
            this.gitService.getInput(status).done(function (input) {
                var options = new WorkbenchEditorCommon.TextDiffEditorOptions();
                if (isMouseOrigin) {
                    options.preserveFocus = true;
                    var originalEvent = e && e.payload && e.payload.origin === 'mouse' && e.payload.originalEvent;
                    if (originalEvent && originalEvent.detail === 2) {
                        options.preserveFocus = false;
                        originalEvent.preventDefault(); // focus moves to editor, we need to prevent default
                    }
                }
                options.forceOpen = true;
                var sideBySide = (e && e.payload && e.payload.originalEvent && e.payload.originalEvent.altKey);
                return _this.editorService.openEditor(input, options, sideBySide);
            }, function (e) {
                if (e.gitErrorCode === git.GitErrorCodes.CantOpenResource) {
                    _this.messageService.show(severity_1.default.Warning, e);
                    return;
                }
                _this.messageService.show(severity_1.default.Error, e);
            });
        };
        ChangesView.prototype.onGitOperationStart = function (operation) {
            if (operation.id === git.ServiceOperations.COMMIT) {
                if (this.commitInputBox) {
                    this.commitInputBox.disable();
                }
            }
        };
        ChangesView.prototype.onGitOperationEnd = function (e) {
            if (e.operation.id === git.ServiceOperations.COMMIT) {
                if (this.commitInputBox) {
                    this.commitInputBox.enable();
                    if (!e.error) {
                        this.commitInputBox.value = '';
                    }
                }
            }
        };
        // Misc
        ChangesView.prototype.getStatusFromInput = function (input) {
            if (!input) {
                return null;
            }
            if (input instanceof GitEditorInputs.GitDiffEditorInput) {
                return input.getFileStatus();
            }
            if (input instanceof GitEditorInputs.NativeGitIndexStringEditorInput) {
                return input.getFileStatus() || null;
            }
            if (input instanceof Files.FileEditorInput) {
                var fileInput = input;
                var resource = fileInput.getResource();
                var workspaceRoot = this.contextService.getWorkspace().resource.fsPath;
                if (!workspaceRoot || !paths.isEqualOrParent(resource.fsPath, workspaceRoot)) {
                    return null; // out of workspace not yet supported
                }
                var repositoryRoot = this.gitService.getModel().getRepositoryRoot();
                if (!repositoryRoot || !paths.isEqualOrParent(resource.fsPath, repositoryRoot)) {
                    return null; // out of repository not supported
                }
                var repositoryRelativePath = paths.normalize(paths.relative(repositoryRoot, resource.fsPath));
                var status = this.gitService.getModel().getStatus().getWorkingTreeStatus().find(repositoryRelativePath);
                if (status && (status.getStatus() === git.Status.UNTRACKED || status.getStatus() === git.Status.IGNORED)) {
                    return status;
                }
                status = this.gitService.getModel().getStatus().getMergeStatus().find(repositoryRelativePath);
                if (status) {
                    return status;
                }
            }
            return null;
        };
        ChangesView.prototype.dispose = function () {
            if (this.$el) {
                this.$el.dispose();
                this.$el = null;
            }
            this.toDispose = Lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        ChangesView.COMMIT_KEYBINDING = Platform.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter';
        ChangesView.NEED_MESSAGE = nls.localize(0, null, ChangesView.COMMIT_KEYBINDING);
        ChangesView.NOTHING_TO_COMMIT = nls.localize(1, null, ChangesView.COMMIT_KEYBINDING);
        ChangesView = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, message_1.IMessageService),
            __param(4, contextView_1.IContextViewService),
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, IGitService),
            __param(7, output_1.IOutputService),
            __param(8, event_1.IEventService)
        ], ChangesView);
        return ChangesView;
    }(EventEmitter.EventEmitter));
    exports.ChangesView = ChangesView;
});
//# sourceMappingURL=changesView.js.map