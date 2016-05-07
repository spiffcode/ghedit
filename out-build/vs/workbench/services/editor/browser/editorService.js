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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/uri', 'vs/base/common/network', 'vs/base/common/mime', 'vs/platform/platform', 'vs/base/common/paths', 'vs/base/common/types', 'vs/editor/common/editorCommon', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor', 'vs/workbench/common/editor/resourceEditorInput', 'vs/workbench/common/editor/untitledEditorInput', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/editor/common/editorService', 'vs/platform/instantiation/common/instantiation'], function (require, exports, winjs_base_1, uri_1, network, mime_1, platform_1, paths_1, types, editorCommon_1, baseEditor_1, editor_1, resourceEditorInput_1, untitledEditorInput_1, untitledEditorService_1, editorService_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WorkbenchEditorService = (function () {
        function WorkbenchEditorService(editorPart, untitledEditorService, instantiationService) {
            this.untitledEditorService = untitledEditorService;
            this.instantiationService = instantiationService;
            this.serviceId = editorService_1.IWorkbenchEditorService;
            this.editorPart = editorPart;
            this.fileInputDescriptor = platform_1.Registry.as(baseEditor_1.Extensions.Editors).getDefaultFileInput();
        }
        WorkbenchEditorService.prototype.setInstantiationService = function (service) {
            this.instantiationService = service;
        };
        WorkbenchEditorService.prototype.getActiveEditor = function () {
            return this.editorPart.getActiveEditor();
        };
        WorkbenchEditorService.prototype.getActiveEditorInput = function () {
            return this.editorPart.getActiveEditorInput();
        };
        WorkbenchEditorService.prototype.getVisibleEditors = function () {
            return this.editorPart.getVisibleEditors();
        };
        WorkbenchEditorService.prototype.isVisible = function (input, includeDiff) {
            if (!input) {
                return false;
            }
            return this.getVisibleEditors().some(function (editor) {
                if (!editor.input) {
                    return false;
                }
                if (input.matches(editor.input)) {
                    return true;
                }
                if (includeDiff) {
                    var diffInput = editor.input;
                    if (types.isFunction(diffInput.getOriginalInput) && types.isFunction(diffInput.getModifiedInput)) {
                        return input.matches(diffInput.getModifiedInput()) || input.matches(diffInput.getOriginalInput());
                    }
                }
                return false;
            });
        };
        WorkbenchEditorService.prototype.moveEditor = function (from, to) {
            this.editorPart.moveEditor(from, to);
        };
        WorkbenchEditorService.prototype.arrangeEditors = function (arrangement) {
            this.editorPart.arrangeEditors(arrangement);
        };
        WorkbenchEditorService.prototype.setEditors = function (inputs, options) {
            var _this = this;
            return winjs_base_1.Promise.join(inputs.map(function (input) { return _this.inputToType(input); })).then(function (typedInputs) {
                return _this.editorPart.setEditors(typedInputs, options || inputs.map(function (input) {
                    if (input instanceof editor_1.EditorInput) {
                        return null; // no options for editor inputs
                    }
                    return editor_1.TextEditorOptions.from(input); // ITextInputs can carry settings, so support that!
                }));
            });
        };
        WorkbenchEditorService.prototype.openEditor = function (input, arg2, arg3) {
            var _this = this;
            // Support for closing an opened editor at a position by passing null as input
            if (input === null) {
                return this.doOpenEditor(input, null, (types.isNumber(arg2) || types.isBoolean(arg2)) ? arg2 : arg3);
            }
            // Workbench Input Support
            if (input instanceof editor_1.EditorInput) {
                return this.doOpenEditor(input, arg2, arg3);
            }
            // Support opening foreign resources (such as a http link that points outside of the workbench)
            var resourceInput = input;
            if (resourceInput.resource instanceof uri_1.default) {
                var schema = resourceInput.resource.scheme;
                if (schema === network.Schemas.http || schema === network.Schemas.https) {
                    window.open(resourceInput.resource.toString(true));
                    return winjs_base_1.TPromise.as(null);
                }
            }
            // Untyped Text Editor Support (required for code that uses this service below workbench level)
            var textInput = input;
            return this.inputToType(textInput).then(function (typedFileInput) {
                if (typedFileInput) {
                    return _this.doOpenEditor(typedFileInput, editor_1.TextEditorOptions.from(textInput), arg2);
                }
                return winjs_base_1.TPromise.as(null);
            });
        };
        WorkbenchEditorService.prototype.doOpenEditor = function (input, options, arg3) {
            return this.editorPart.openEditor(input, options, arg3);
        };
        WorkbenchEditorService.prototype.closeEditor = function (arg) {
            var targetEditor = this.findEditor(arg);
            if (targetEditor) {
                return this.editorPart.openEditor(null, null, targetEditor.position);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WorkbenchEditorService.prototype.closeEditors = function (othersOnly) {
            return this.editorPart.closeEditors(othersOnly);
        };
        WorkbenchEditorService.prototype.focusEditor = function (arg) {
            var targetEditor = this.findEditor(arg);
            if (targetEditor) {
                return this.editorPart.openEditor(targetEditor.input, null, targetEditor.position);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WorkbenchEditorService.prototype.activateEditor = function (arg) {
            var targetEditor = this.findEditor(arg);
            if (targetEditor) {
                this.editorPart.activateEditor(targetEditor);
            }
        };
        WorkbenchEditorService.prototype.findEditor = function (arg) {
            // Editor provided
            if (arg instanceof baseEditor_1.BaseEditor) {
                return arg;
            }
            // Find active editor
            if (types.isUndefinedOrNull(arg)) {
                return this.editorPart.getActiveEditor();
            }
            // Target position provided
            if (types.isNumber(arg)) {
                var position = arg;
                var visibleEditors = this.editorPart.getVisibleEditors();
                for (var i = 0; i < visibleEditors.length; i++) {
                    var editor = visibleEditors[i];
                    if (editor.position === position) {
                        return editor;
                    }
                }
            }
            return null;
        };
        WorkbenchEditorService.prototype.resolveEditorModel = function (input, refresh) {
            return this.inputToType(input).then(function (workbenchInput) {
                if (workbenchInput) {
                    // Resolve if applicable
                    if (workbenchInput instanceof editor_1.EditorInput) {
                        return workbenchInput.resolve(!!refresh);
                    }
                }
                return winjs_base_1.TPromise.as(null);
            });
        };
        WorkbenchEditorService.prototype.inputToType = function (input) {
            // Workbench Input Support
            if (input instanceof editor_1.EditorInput) {
                return winjs_base_1.TPromise.as(input);
            }
            // Base Text Editor Support for inmemory resources
            var resourceInput = input;
            if (resourceInput.resource instanceof uri_1.default && resourceInput.resource.scheme === network.Schemas.inMemory) {
                // For in-memory resources we only support to resolve the input from the current active editor
                // because the workbench does not track editor models by in memory URL. This concept is only
                // being used in the code editor.
                var activeEditor = this.getActiveEditor();
                if (activeEditor) {
                    var control = activeEditor.getControl();
                    if (types.isFunction(control.getEditorType)) {
                        // Single Editor: If code editor model matches, return input from editor
                        if (control.getEditorType() === editorCommon_1.EditorType.ICodeEditor) {
                            var codeEditor = control;
                            var model = this.findModel(codeEditor, input);
                            if (model) {
                                return winjs_base_1.TPromise.as(activeEditor.input);
                            }
                        }
                        else if (control.getEditorType() === editorCommon_1.EditorType.IDiffEditor) {
                            var diffInput = activeEditor.input;
                            var diffCodeEditor = control;
                            var originalModel = this.findModel(diffCodeEditor.getOriginalEditor(), input);
                            if (originalModel) {
                                return winjs_base_1.TPromise.as(diffInput.getOriginalInput());
                            }
                            var modifiedModel = this.findModel(diffCodeEditor.getModifiedEditor(), input);
                            if (modifiedModel) {
                                return winjs_base_1.TPromise.as(diffInput.getModifiedInput());
                            }
                        }
                    }
                }
            }
            else if (resourceInput.resource instanceof uri_1.default && (resourceInput.resource.scheme === untitledEditorInput_1.UntitledEditorInput.SCHEMA)) {
                return winjs_base_1.TPromise.as(this.untitledEditorService.createOrGet(resourceInput.resource));
            }
            else if (this.fileInputDescriptor && resourceInput.resource instanceof uri_1.default && resourceInput.resource.scheme === network.Schemas.file) {
                return this.createFileInput(resourceInput.resource, resourceInput.mime);
            }
            else if (resourceInput.resource instanceof uri_1.default) {
                return winjs_base_1.TPromise.as(this.instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, paths_1.basename(resourceInput.resource.fsPath), paths_1.dirname(resourceInput.resource.fsPath), resourceInput.resource));
            }
            return winjs_base_1.TPromise.as(null);
        };
        WorkbenchEditorService.prototype.createFileInput = function (resource, mime) {
            return this.instantiationService.createInstance(this.fileInputDescriptor).then(function (typedFileInput) {
                typedFileInput.setResource(resource);
                typedFileInput.setMime(mime || mime_1.guessMimeTypes(resource.fsPath).join(', '));
                return typedFileInput;
            });
        };
        WorkbenchEditorService.prototype.findModel = function (editor, input) {
            var model = editor.getModel();
            if (!model) {
                return null;
            }
            return model.getAssociatedResource().toString() === input.resource.toString() ? model : null;
        };
        WorkbenchEditorService = __decorate([
            __param(1, untitledEditorService_1.IUntitledEditorService),
            __param(2, instantiation_1.IInstantiationService)
        ], WorkbenchEditorService);
        return WorkbenchEditorService;
    }());
    exports.WorkbenchEditorService = WorkbenchEditorService;
    // Helper that implements IEditorPart through an instance of IEditorService
    var EditorPartDelegate = (function () {
        function EditorPartDelegate(service) {
            this.editorService = service;
        }
        EditorPartDelegate.prototype.setEditors = function (inputs) {
            return this.editorService.setEditors(inputs);
        };
        EditorPartDelegate.prototype.openEditor = function (input, options, arg3) {
            return this.editorService.openEditor(input, options, arg3);
        };
        EditorPartDelegate.prototype.getActiveEditor = function () {
            return this.editorService.getActiveEditor();
        };
        EditorPartDelegate.prototype.activateEditor = function (editor) {
            this.editorService.activateEditor(editor);
        };
        EditorPartDelegate.prototype.getActiveEditorInput = function () {
            return this.editorService.getActiveEditorInput();
        };
        EditorPartDelegate.prototype.getVisibleEditors = function () {
            return this.editorService.getVisibleEditors();
        };
        EditorPartDelegate.prototype.moveEditor = function (from, to) {
            this.editorService.moveEditor(from, to);
        };
        EditorPartDelegate.prototype.arrangeEditors = function (arrangement) {
            this.editorService.arrangeEditors(arrangement);
        };
        EditorPartDelegate.prototype.closeEditors = function (othersOnly) {
            return this.editorService.closeEditors(othersOnly);
        };
        return EditorPartDelegate;
    }());
    /**
     * Subclass of workbench editor service that delegates all calls to the provided editor service. Subclasses can choose to override the behavior
     * of openEditor() by providing a handler. The handler returns a promise that resolves to true or false to indicate if an action has been taken.
     * If false is returned, the service will delegate to editor service for handling the call to openEditor().
     *
     * This gives clients a chance to override the behavior of openEditor() to match their context.
     */
    var DelegatingWorkbenchEditorService = (function (_super) {
        __extends(DelegatingWorkbenchEditorService, _super);
        function DelegatingWorkbenchEditorService(editor, handler, untitledEditorService, instantiationService, editorService) {
            _super.call(this, new EditorPartDelegate(editorService), untitledEditorService, instantiationService);
            this.editor = editor;
            this.handler = handler;
        }
        DelegatingWorkbenchEditorService.prototype.doOpenEditor = function (input, options, arg3) {
            var _this = this;
            return this.handler(this.editor, input, options, arg3).then(function (result) {
                if (result) {
                    return winjs_base_1.TPromise.as(_this.editor);
                }
                return _super.prototype.doOpenEditor.call(_this, input, options, arg3);
            });
        };
        DelegatingWorkbenchEditorService = __decorate([
            __param(2, untitledEditorService_1.IUntitledEditorService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, editorService_1.IWorkbenchEditorService)
        ], DelegatingWorkbenchEditorService);
        return DelegatingWorkbenchEditorService;
    }(WorkbenchEditorService));
    exports.DelegatingWorkbenchEditorService = DelegatingWorkbenchEditorService;
});
//# sourceMappingURL=editorService.js.map