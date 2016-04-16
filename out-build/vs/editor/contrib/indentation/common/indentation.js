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
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/editor/common/editorAction', 'vs/editor/common/editorCommonExtensions', 'vs/editor/contrib/indentation/common/indentationCommands', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/editor/common/services/modelService', 'vs/editor/common/editorActionEnablement'], function (require, exports, nls, winjs_base_1, editorAction_1, editorCommonExtensions_1, indentationCommands_1, quickOpenService_1, modelService_1, editorActionEnablement_1) {
    "use strict";
    var IndentationToSpacesAction = (function (_super) {
        __extends(IndentationToSpacesAction, _super);
        function IndentationToSpacesAction(descriptor, editor) {
            _super.call(this, descriptor, editor);
        }
        IndentationToSpacesAction.prototype.run = function () {
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var modelOpts = model.getOptions();
            var command = new indentationCommands_1.IndentationToSpacesCommand(this.editor.getSelection(), modelOpts.tabSize);
            this.editor.executeCommands(this.id, [command]);
            model.updateOptions({
                insertSpaces: true
            });
            return winjs_base_1.TPromise.as(true);
        };
        IndentationToSpacesAction.ID = 'editor.action.indentationToSpaces';
        return IndentationToSpacesAction;
    }(editorAction_1.EditorAction));
    exports.IndentationToSpacesAction = IndentationToSpacesAction;
    var IndentationToTabsAction = (function (_super) {
        __extends(IndentationToTabsAction, _super);
        function IndentationToTabsAction(descriptor, editor) {
            _super.call(this, descriptor, editor);
        }
        IndentationToTabsAction.prototype.run = function () {
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var modelOpts = model.getOptions();
            var command = new indentationCommands_1.IndentationToTabsCommand(this.editor.getSelection(), modelOpts.tabSize);
            this.editor.executeCommands(this.id, [command]);
            model.updateOptions({
                insertSpaces: false
            });
            return winjs_base_1.TPromise.as(true);
        };
        IndentationToTabsAction.ID = 'editor.action.indentationToTabs';
        return IndentationToTabsAction;
    }(editorAction_1.EditorAction));
    exports.IndentationToTabsAction = IndentationToTabsAction;
    var ChangeIndentationSizeAction = (function (_super) {
        __extends(ChangeIndentationSizeAction, _super);
        function ChangeIndentationSizeAction(descriptor, editor, insertSpaces, quickOpenService, modelService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.Writeable);
            this.insertSpaces = insertSpaces;
            this.quickOpenService = quickOpenService;
            this.modelService = modelService;
        }
        ChangeIndentationSizeAction.prototype.run = function () {
            var _this = this;
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var creationOpts = this.modelService.getCreationOptions();
            var picks = [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return ({
                id: n.toString(),
                label: n.toString(),
                // add description for tabSize value set in the configuration
                description: n === creationOpts.tabSize ? nls.localize('configuredTabSize', "Configured Tab Size") : null
            }); });
            // auto focus the tabSize set for the current editor
            var autoFocusIndex = Math.min(model.getOptions().tabSize - 1, 7);
            return winjs_base_1.TPromise.timeout(50 /* quick open is sensitive to being opened so soon after another */).then(function () {
                return _this.quickOpenService.pick(picks, { placeHolder: nls.localize({ key: 'selectTabWidth', comment: ['Tab corresponds to the tab key'] }, "Select Tab Size for Current File"), autoFocus: { autoFocusIndex: autoFocusIndex } }).then(function (pick) {
                    if (pick) {
                        model.updateOptions({
                            tabSize: parseInt(pick.label, 10),
                            insertSpaces: _this.insertSpaces
                        });
                    }
                    return true;
                });
            });
        };
        return ChangeIndentationSizeAction;
    }(editorAction_1.EditorAction));
    exports.ChangeIndentationSizeAction = ChangeIndentationSizeAction;
    var IndentUsingTabs = (function (_super) {
        __extends(IndentUsingTabs, _super);
        function IndentUsingTabs(descriptor, editor, quickOpenService, modelService) {
            _super.call(this, descriptor, editor, false, quickOpenService, modelService);
        }
        IndentUsingTabs.ID = 'editor.action.indentUsingTabs';
        IndentUsingTabs = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService),
            __param(3, modelService_1.IModelService)
        ], IndentUsingTabs);
        return IndentUsingTabs;
    }(ChangeIndentationSizeAction));
    exports.IndentUsingTabs = IndentUsingTabs;
    var IndentUsingSpaces = (function (_super) {
        __extends(IndentUsingSpaces, _super);
        function IndentUsingSpaces(descriptor, editor, quickOpenService, modelService) {
            _super.call(this, descriptor, editor, true, quickOpenService, modelService);
        }
        IndentUsingSpaces.ID = 'editor.action.indentUsingSpaces';
        IndentUsingSpaces = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService),
            __param(3, modelService_1.IModelService)
        ], IndentUsingSpaces);
        return IndentUsingSpaces;
    }(ChangeIndentationSizeAction));
    exports.IndentUsingSpaces = IndentUsingSpaces;
    var DetectIndentation = (function (_super) {
        __extends(DetectIndentation, _super);
        function DetectIndentation(descriptor, editor, modelService) {
            _super.call(this, descriptor, editor);
            this.modelService = modelService;
        }
        DetectIndentation.prototype.run = function () {
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var creationOpts = this.modelService.getCreationOptions();
            model.detectIndentation(creationOpts.insertSpaces, creationOpts.tabSize);
        };
        DetectIndentation.ID = 'editor.action.detectIndentation';
        DetectIndentation = __decorate([
            __param(2, modelService_1.IModelService)
        ], DetectIndentation);
        return DetectIndentation;
    }(editorAction_1.EditorAction));
    exports.DetectIndentation = DetectIndentation;
    var ToggleRenderWhitespaceAction = (function (_super) {
        __extends(ToggleRenderWhitespaceAction, _super);
        function ToggleRenderWhitespaceAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
        }
        ToggleRenderWhitespaceAction.prototype.run = function () {
            this.editor.updateOptions({
                renderWhitespace: !this.editor.getConfiguration().renderWhitespace
            });
            return winjs_base_1.TPromise.as(true);
        };
        ToggleRenderWhitespaceAction.ID = 'editor.action.toggleRenderWhitespace';
        return ToggleRenderWhitespaceAction;
    }(editorAction_1.EditorAction));
    exports.ToggleRenderWhitespaceAction = ToggleRenderWhitespaceAction;
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(IndentationToSpacesAction, IndentationToSpacesAction.ID, nls.localize('indentationToSpaces', "Convert Indentation to Spaces")));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(IndentationToTabsAction, IndentationToTabsAction.ID, nls.localize('indentationToTabs', "Convert Indentation to Tabs")));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(IndentUsingSpaces, IndentUsingSpaces.ID, nls.localize('indentUsingSpaces', "Indent Using Spaces")));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(IndentUsingTabs, IndentUsingTabs.ID, nls.localize('indentUsingTabs', "Indent Using Tabs")));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(DetectIndentation, DetectIndentation.ID, nls.localize('detectIndentation', "Detect Indentation from Content")));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(ToggleRenderWhitespaceAction, ToggleRenderWhitespaceAction.ID, nls.localize('toggleRenderWhitespace', "Toggle Render Whitespace")));
});
