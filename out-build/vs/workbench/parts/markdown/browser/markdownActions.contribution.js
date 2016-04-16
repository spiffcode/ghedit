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
define(["require", "exports", 'vs/nls!vs/workbench/parts/markdown/browser/markdownActions.contribution', 'vs/platform/platform', 'vs/platform/actions/common/actions', 'vs/workbench/browser/actionBarRegistry', 'vs/workbench/parts/files/common/files', 'vs/base/common/mime', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/parts/markdown/browser/markdownActions', 'vs/workbench/parts/markdown/common/markdown', 'vs/workbench/common/actionRegistry', 'vs/platform/instantiation/common/instantiation', 'vs/base/common/keyCodes'], function (require, exports, nls, platform_1, actions_1, actionBarRegistry_1, files_1, mime, baseEditor_1, markdownActions_1, markdown_1, actionRegistry_1, instantiation_1, keyCodes_1) {
    'use strict';
    var ExplorerViewerActionContributor = (function (_super) {
        __extends(ExplorerViewerActionContributor, _super);
        function ExplorerViewerActionContributor(instantiationService) {
            _super.call(this);
            this.instantiationService = instantiationService;
        }
        ExplorerViewerActionContributor.prototype.hasSecondaryActions = function (context) {
            var element = context.element;
            // Contribute only on file resources
            var fileResource = files_1.asFileResource(element);
            if (!fileResource) {
                return false;
            }
            return !fileResource.isDirectory && mime.guessMimeTypes(fileResource.resource.fsPath).indexOf(markdown_1.MARKDOWN_MIME) >= 0;
        };
        ExplorerViewerActionContributor.prototype.getSecondaryActions = function (context) {
            var actions = [];
            if (this.hasSecondaryActions(context)) {
                var fileResource = files_1.asFileResource(context.element);
                // Open Markdown
                var action = this.instantiationService.createInstance(markdownActions_1.PreviewMarkdownAction, fileResource.resource);
                action.order = 0; // on top of other actions
                actions.push(action);
            }
            return actions;
        };
        ExplorerViewerActionContributor = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], ExplorerViewerActionContributor);
        return ExplorerViewerActionContributor;
    }(actionBarRegistry_1.ActionBarContributor));
    var MarkdownFilesActionContributor = (function (_super) {
        __extends(MarkdownFilesActionContributor, _super);
        function MarkdownFilesActionContributor(instantiationService) {
            _super.call(this);
            this.instantiationService = instantiationService;
        }
        /* We override toId() to make the caching of actions based on the mime of the input if given */
        MarkdownFilesActionContributor.prototype.toId = function (context) {
            var id = _super.prototype.toId.call(this, context);
            var mime = this.getMimeFromContext(context);
            if (mime) {
                id += mime;
            }
            return id;
        };
        MarkdownFilesActionContributor.prototype.getMimeFromContext = function (context) {
            if (context && context.input && context.input instanceof files_1.FileEditorInput) {
                var fileInput = context.input;
                return fileInput.getMime();
            }
            return null;
        };
        MarkdownFilesActionContributor.prototype.hasActionsForEditorInput = function (context) {
            var input = context.input;
            if (input instanceof files_1.FileEditorInput) {
                var fileResource = input.getResource();
                return mime.guessMimeTypes(fileResource.fsPath).indexOf(markdown_1.MARKDOWN_MIME) >= 0;
            }
            return false;
        };
        MarkdownFilesActionContributor.prototype.getActionsForEditorInput = function (context) {
            if (this.hasActionsForEditorInput(context)) {
                return [
                    this.instantiationService.createInstance(markdownActions_1.PreviewMarkdownEditorInputAction)
                ];
            }
            return [];
        };
        MarkdownFilesActionContributor = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], MarkdownFilesActionContributor);
        return MarkdownFilesActionContributor;
    }(baseEditor_1.EditorInputActionContributor));
    // Contribute to viewers and editors of markdown files
    var actionBarRegistry = platform_1.Registry.as(actionBarRegistry_1.Extensions.Actionbar);
    actionBarRegistry.registerActionBarContributor(actionBarRegistry_1.Scope.VIEWER, ExplorerViewerActionContributor);
    actionBarRegistry.registerActionBarContributor(actionBarRegistry_1.Scope.EDITOR, MarkdownFilesActionContributor);
    var category = nls.localize(0, null);
    var workbenchActionsRegistry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(markdownActions_1.GlobalTogglePreviewMarkdownAction, markdownActions_1.GlobalTogglePreviewMarkdownAction.ID, markdownActions_1.GlobalTogglePreviewMarkdownAction.LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_V }), category);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(markdownActions_1.OpenPreviewToSideAction, markdownActions_1.OpenPreviewToSideAction.ID, markdownActions_1.OpenPreviewToSideAction.LABEL, { primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyCode.KEY_V) }), category);
});
//# sourceMappingURL=markdownActions.contribution.js.map