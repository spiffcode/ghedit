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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls', 'vs/base/common/actions', 'vs/base/common/errors', 'vs/base/common/types', 'vs/workbench/browser/parts/editor/textEditor', 'vs/workbench/common/editor', 'vs/workbench/common/editor/stringEditorInput', 'vs/workbench/common/editor/resourceEditorInput', 'vs/workbench/common/editor/diffEditorInput', 'vs/editor/contrib/diffNavigator/common/diffNavigator', 'vs/editor/browser/widget/diffEditorWidget', 'vs/workbench/common/editor/textDiffEditorModel', 'vs/workbench/services/editor/browser/editorService', 'vs/platform/files/common/files', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/storage/common/storage', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/workbench/services/editor/common/editorService', 'vs/editor/common/services/modeService', 'vs/platform/keybinding/common/keybindingService', 'vs/workbench/services/themes/common/themeService', 'vs/css!./media/textdiffeditor'], function (require, exports, winjs_base_1, nls, actions_1, errors_1, types, textEditor_1, editor_1, stringEditorInput_1, resourceEditorInput_1, diffEditorInput_1, diffNavigator_1, diffEditorWidget_1, textDiffEditorModel_1, editorService_1, files_1, telemetry_1, contextService_1, storage_1, configuration_1, event_1, instantiation_1, message_1, editorService_2, modeService_1, keybindingService_1, themeService_1) {
    'use strict';
    /**
     * The text editor that leverages the monaco diff text editor for the editing experience.
     */
    var TextDiffEditor = (function (_super) {
        __extends(TextDiffEditor, _super);
        function TextDiffEditor(telemetryService, instantiationService, contextService, storageService, messageService, configurationService, eventService, editorService, modeService, keybindingService, themeService) {
            _super.call(this, TextDiffEditor.ID, telemetryService, instantiationService, contextService, storageService, messageService, configurationService, eventService, editorService, modeService, themeService);
            this.textDiffEditorVisible = keybindingService.createKey('textCompareEditorVisible', false);
        }
        TextDiffEditor.prototype.getTitle = function () {
            if (this.input) {
                return this.input.getName();
            }
            return nls.localize('textDiffEditor', "Text Diff Editor");
        };
        TextDiffEditor.prototype.createEditorControl = function (parent) {
            var _this = this;
            this.nextDiffAction = new NavigateAction(this, true);
            this.previousDiffAction = new NavigateAction(this, false);
            var delegatingService = this.instantiationService.createInstance(editorService_1.DelegatingWorkbenchEditorService, this, function (editor, input, options, arg4) {
                // Check if arg4 is a position argument that differs from this editors position
                if (types.isUndefinedOrNull(arg4) || arg4 === false || arg4 === _this.position) {
                    var activeDiffInput = _this.getInput();
                    if (input && options && activeDiffInput) {
                        // Input matches modified side of the diff editor: perform the action on modified side
                        if (input.matches(activeDiffInput.getModifiedInput())) {
                            return _this.setInput(_this.getInput(), options).then(function () {
                                return true;
                            });
                        }
                        else if (input.matches(activeDiffInput.getOriginalInput())) {
                            var originalEditor = _this.getControl().getOriginalEditor();
                            if (options instanceof editor_1.TextEditorOptions) {
                                options.apply(originalEditor);
                                return winjs_base_1.TPromise.as(true);
                            }
                        }
                    }
                }
                return winjs_base_1.TPromise.as(false);
            });
            // Create a special child of instantiator that will delegate all calls to openEditor() to the same diff editor if the input matches with the modified one
            var diffEditorInstantiator = this.instantiationService.createChild({
                editorService: delegatingService
            });
            return diffEditorInstantiator.createInstance(diffEditorWidget_1.DiffEditorWidget, parent.getHTMLElement(), this.getCodeEditorOptions());
        };
        TextDiffEditor.prototype.setInput = function (input, options) {
            var _this = this;
            var oldInput = this.getInput();
            _super.prototype.setInput.call(this, input, options);
            // Detect options
            var forceOpen = options && options.forceOpen;
            // Same Input
            if (!forceOpen && input.matches(oldInput)) {
                // TextOptions (avoiding instanceof here for a reason, do not change!)
                var textOptions = options;
                if (textOptions && types.isFunction(textOptions.apply)) {
                    textOptions.apply(this.getControl());
                }
                return winjs_base_1.TPromise.as(null);
            }
            // Dispose previous diff navigator
            if (this.diffNavigator) {
                this.diffNavigator.dispose();
            }
            // Different Input (Reload)
            return this.editorService.resolveEditorModel(input, true /* Reload */).then(function (resolvedModel) {
                // Assert Model Instance
                if (!(resolvedModel instanceof textDiffEditorModel_1.TextDiffEditorModel) && _this.openAsBinary(input, options)) {
                    return null;
                }
                // Assert that the current input is still the one we expect. This prevents a race condition when loading a diff takes long and another input was set meanwhile
                if (!_this.getInput() || _this.getInput() !== input) {
                    return null;
                }
                // Editor
                var diffEditor = _this.getControl();
                diffEditor.setModel(resolvedModel.textDiffEditorModel);
                // Respect text diff editor options
                var autoRevealFirstChange = true;
                if (options instanceof editor_1.TextDiffEditorOptions) {
                    var textDiffOptions = options;
                    autoRevealFirstChange = !types.isUndefinedOrNull(textDiffOptions.autoRevealFirstChange) ? textDiffOptions.autoRevealFirstChange : autoRevealFirstChange;
                }
                // listen on diff updated changes to reveal the first change
                _this.diffNavigator = new diffNavigator_1.DiffNavigator(diffEditor, {
                    alwaysRevealFirst: autoRevealFirstChange
                });
                _this.diffNavigator.addListener(diffNavigator_1.DiffNavigator.Events.UPDATED, function () {
                    _this.nextDiffAction.updateEnablement();
                    _this.previousDiffAction.updateEnablement();
                });
                // Handle TextOptions
                if (options && types.isFunction(options.apply)) {
                    options.apply(diffEditor);
                }
                // Apply options again because input has changed
                diffEditor.updateOptions(_this.getCodeEditorOptions());
            }, function (error) {
                // In case we tried to open a file and the response indicates that this is not a text file, fallback to binary diff.
                if (_this.isFileBinaryError(error) && _this.openAsBinary(input, options)) {
                    return null;
                }
                // Otherwise make sure the error bubbles up
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TextDiffEditor.prototype.openAsBinary = function (input, options) {
            if (input instanceof diffEditorInput_1.DiffEditorInput) {
                var originalInput = input.originalInput;
                var modifiedInput = input.modifiedInput;
                var binaryDiffInput = new diffEditorInput_1.DiffEditorInput(input.getName(), input.getDescription(), originalInput, modifiedInput, true);
                this.editorService.openEditor(binaryDiffInput, options, this.position).done(null, errors_1.onUnexpectedError);
                return true;
            }
            return false;
        };
        TextDiffEditor.prototype.getCodeEditorOptions = function () {
            var options = _super.prototype.getCodeEditorOptions.call(this);
            var input = this.input;
            if (input && types.isFunction(input.getModifiedInput)) {
                var modifiedInput = input.getModifiedInput();
                var readOnly = modifiedInput instanceof stringEditorInput_1.StringEditorInput || modifiedInput instanceof resourceEditorInput_1.ResourceEditorInput;
                options.readOnly = readOnly;
                var ariaLabel = void 0;
                var inputName = input && input.getName();
                if (readOnly) {
                    ariaLabel = inputName ? nls.localize('readonlyEditorWithInputAriaLabel', "{0}. Readonly text compare editor.", inputName) : nls.localize('readonlyEditorAriaLabel', "Readonly text compare editor.");
                }
                else {
                    ariaLabel = inputName ? nls.localize('editableEditorWithInputAriaLabel', "{0}. Text file compare editor.", inputName) : nls.localize('editableEditorAriaLabel', "Text file compare editor.");
                }
                options.ariaLabel = ariaLabel;
            }
            return options;
        };
        TextDiffEditor.prototype.isFileBinaryError = function (error) {
            var _this = this;
            if (types.isArray(error)) {
                var errors = error;
                return errors.some(function (e) { return _this.isFileBinaryError(e); });
            }
            return error.fileOperationResult === files_1.FileOperationResult.FILE_IS_BINARY;
        };
        TextDiffEditor.prototype.clearInput = function () {
            // Dispose previous diff navigator
            if (this.diffNavigator) {
                this.diffNavigator.dispose();
            }
            // Clear Model
            this.getControl().setModel(null);
            // Pass to super
            _super.prototype.clearInput.call(this);
        };
        TextDiffEditor.prototype.setVisible = function (visible, position) {
            this.textDiffEditorVisible.set(visible);
            return _super.prototype.setVisible.call(this, visible, position);
        };
        TextDiffEditor.prototype.getDiffNavigator = function () {
            return this.diffNavigator;
        };
        TextDiffEditor.prototype.getActions = function () {
            return [
                this.previousDiffAction,
                this.nextDiffAction
            ];
        };
        TextDiffEditor.prototype.getSecondaryActions = function () {
            var _this = this;
            var actions = _super.prototype.getSecondaryActions.call(this);
            var control = this.getControl();
            var inlineModeActive = control && !control.renderSideBySide;
            var inlineLabel = nls.localize('inlineDiffLabel', "Switch to Inline View");
            var sideBySideLabel = nls.localize('sideBySideDiffLabel', "Switch to Side by Side View");
            // Action to toggle editor mode from inline to side by side
            var toggleEditorModeAction = new actions_1.Action('toggle.diff.editorMode', inlineModeActive ? sideBySideLabel : inlineLabel, null, true, function () {
                _this.getControl().updateOptions({
                    renderSideBySide: inlineModeActive
                });
                inlineModeActive = !inlineModeActive;
                toggleEditorModeAction.label = inlineModeActive ? sideBySideLabel : inlineLabel;
                return winjs_base_1.TPromise.as(true);
            });
            toggleEditorModeAction.order = 50; // Closer to the end
            actions.push.apply(actions, [
                toggleEditorModeAction
            ]);
            return actions;
        };
        TextDiffEditor.prototype.getControl = function () {
            return _super.prototype.getControl.call(this);
        };
        TextDiffEditor.prototype.dispose = function () {
            // Dispose previous diff navigator
            if (this.diffNavigator) {
                this.diffNavigator.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        TextDiffEditor.ID = 'workbench.editors.textDiffEditor';
        TextDiffEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, contextService_1.IWorkspaceContextService),
            __param(3, storage_1.IStorageService),
            __param(4, message_1.IMessageService),
            __param(5, configuration_1.IConfigurationService),
            __param(6, event_1.IEventService),
            __param(7, editorService_2.IWorkbenchEditorService),
            __param(8, modeService_1.IModeService),
            __param(9, keybindingService_1.IKeybindingService),
            __param(10, themeService_1.IThemeService)
        ], TextDiffEditor);
        return TextDiffEditor;
    }(textEditor_1.BaseTextEditor));
    exports.TextDiffEditor = TextDiffEditor;
    var NavigateAction = (function (_super) {
        __extends(NavigateAction, _super);
        function NavigateAction(editor, next) {
            _super.call(this, next ? NavigateAction.ID_NEXT : NavigateAction.ID_PREV);
            this.editor = editor;
            this.next = next;
            this.label = this.next ? nls.localize('navigate.next.label', "Next Change") : nls.localize('navigate.prev.label', "Previous Change");
            this.class = this.next ? 'textdiff-editor-action next' : 'textdiff-editor-action previous';
            this.enabled = false;
        }
        NavigateAction.prototype.run = function () {
            if (this.next) {
                this.editor.getDiffNavigator().next();
            }
            else {
                this.editor.getDiffNavigator().previous();
            }
            return null;
        };
        NavigateAction.prototype.updateEnablement = function () {
            this.enabled = this.editor.getDiffNavigator().canNavigate();
        };
        NavigateAction.ID_NEXT = 'workbench.action.compareEditor.nextChange';
        NavigateAction.ID_PREV = 'workbench.action.compareEditor.previousChange';
        return NavigateAction;
    }(actions_1.Action));
});
