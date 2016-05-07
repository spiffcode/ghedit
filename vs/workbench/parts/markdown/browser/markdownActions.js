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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/actions', 'vs/base/common/errors', 'vs/nls!vs/workbench/parts/markdown/browser/markdownActions', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor', 'vs/workbench/parts/markdown/common/markdownEditorInput', 'vs/workbench/services/editor/common/editorService', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/css!./media/markdownactions'], function (require, exports, winjs_base_1, actions_1, errors, nls, baseEditor_1, editor_1, markdownEditorInput_1, editorService_1, instantiation_1, message_1) {
    'use strict';
    var GlobalTogglePreviewMarkdownAction = (function (_super) {
        __extends(GlobalTogglePreviewMarkdownAction, _super);
        function GlobalTogglePreviewMarkdownAction(id, label, instantiationService, editorService, messageService) {
            _super.call(this, id, label);
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.messageService = messageService;
        }
        GlobalTogglePreviewMarkdownAction.prototype.run = function (event) {
            var activeInput = this.editorService.getActiveEditorInput();
            // View source if we are in a markdown file already
            if (activeInput instanceof markdownEditorInput_1.MarkdownEditorInput) {
                this.editorService.openEditor({
                    resource: activeInput.getResource()
                }).done(null, errors.onUnexpectedError);
            }
            else {
                var msg = void 0;
                var resource = editor_1.getUntitledOrFileResource(activeInput);
                if (resource) {
                    var action_1 = this.instantiationService.createInstance(PreviewMarkdownAction, resource);
                    action_1.run().done(function () { return action_1.dispose(); }, errors.onUnexpectedError);
                }
                else {
                    msg = nls.localize(1, null);
                }
                if (msg) {
                    this.messageService.show(message_1.Severity.Info, msg);
                }
            }
            return winjs_base_1.TPromise.as(true);
        };
        GlobalTogglePreviewMarkdownAction.ID = 'workbench.action.markdown.togglePreview';
        GlobalTogglePreviewMarkdownAction.LABEL = nls.localize(0, null);
        GlobalTogglePreviewMarkdownAction = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, message_1.IMessageService)
        ], GlobalTogglePreviewMarkdownAction);
        return GlobalTogglePreviewMarkdownAction;
    }(actions_1.Action));
    exports.GlobalTogglePreviewMarkdownAction = GlobalTogglePreviewMarkdownAction;
    var OpenPreviewToSideAction = (function (_super) {
        __extends(OpenPreviewToSideAction, _super);
        function OpenPreviewToSideAction(id, label, instantiationService, editorService, messageService) {
            _super.call(this, id, label);
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.messageService = messageService;
        }
        OpenPreviewToSideAction.prototype.run = function (event) {
            var activeInput = this.editorService.getActiveEditorInput();
            // Do nothing if already in markdown preview
            if (activeInput instanceof markdownEditorInput_1.MarkdownEditorInput) {
                return winjs_base_1.TPromise.as(true);
            }
            else {
                var msg = void 0;
                var resource = editor_1.getUntitledOrFileResource(activeInput);
                if (resource) {
                    var input = this.instantiationService.createInstance(markdownEditorInput_1.MarkdownEditorInput, resource, void 0, void 0);
                    return this.editorService.openEditor(input, null, true /* to the side */);
                }
                else {
                    msg = nls.localize(3, null);
                }
                if (msg) {
                    this.messageService.show(message_1.Severity.Info, msg);
                }
            }
            return winjs_base_1.TPromise.as(true);
        };
        OpenPreviewToSideAction.ID = 'workbench.action.markdown.openPreviewSideBySide';
        OpenPreviewToSideAction.LABEL = nls.localize(2, null);
        OpenPreviewToSideAction = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, message_1.IMessageService)
        ], OpenPreviewToSideAction);
        return OpenPreviewToSideAction;
    }(actions_1.Action));
    exports.OpenPreviewToSideAction = OpenPreviewToSideAction;
    var PreviewMarkdownAction = (function (_super) {
        __extends(PreviewMarkdownAction, _super);
        function PreviewMarkdownAction(markdownResource, instantiationService, editorService) {
            _super.call(this, 'workbench.markdown.action.previewFromExplorer', nls.localize(4, null));
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.markdownResource = markdownResource;
        }
        PreviewMarkdownAction.prototype.run = function (event) {
            var input = this.instantiationService.createInstance(markdownEditorInput_1.MarkdownEditorInput, this.markdownResource, void 0, void 0);
            return this.editorService.openEditor(input);
        };
        PreviewMarkdownAction = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, editorService_1.IWorkbenchEditorService)
        ], PreviewMarkdownAction);
        return PreviewMarkdownAction;
    }(actions_1.Action));
    exports.PreviewMarkdownAction = PreviewMarkdownAction;
    var PreviewMarkdownEditorInputAction = (function (_super) {
        __extends(PreviewMarkdownEditorInputAction, _super);
        function PreviewMarkdownEditorInputAction(instantiationService, editorService) {
            _super.call(this, 'workbench.markdown.action.previewFromEditor', nls.localize(5, null));
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.class = 'markdown-action action-preview';
            this.order = 100; // far end
        }
        PreviewMarkdownEditorInputAction.prototype.run = function (event) {
            var input = this.input;
            var sideBySide = !!(event && (event.ctrlKey || event.metaKey));
            var markdownInput = this.instantiationService.createInstance(markdownEditorInput_1.MarkdownEditorInput, input.getResource(), void 0, void 0);
            return this.editorService.openEditor(markdownInput, null, sideBySide);
        };
        PreviewMarkdownEditorInputAction = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, editorService_1.IWorkbenchEditorService)
        ], PreviewMarkdownEditorInputAction);
        return PreviewMarkdownEditorInputAction;
    }(baseEditor_1.EditorInputAction));
    exports.PreviewMarkdownEditorInputAction = PreviewMarkdownEditorInputAction;
});
//# sourceMappingURL=markdownActions.js.map