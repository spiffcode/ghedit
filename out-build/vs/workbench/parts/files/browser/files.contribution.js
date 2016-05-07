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
define(["require", "exports", 'vs/base/common/uri', 'vs/workbench/browser/viewlet', 'vs/nls!vs/workbench/parts/files/browser/files.contribution', 'vs/platform/actions/common/actions', 'vs/platform/platform', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/browser/actions/quickOpenAction', 'vs/platform/configuration/common/configurationRegistry', 'vs/workbench/common/actionRegistry', 'vs/workbench/common/contributions', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/browser/quickopen', 'vs/workbench/parts/files/browser/files', 'vs/platform/files/common/files', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/files/browser/fileTracker', 'vs/workbench/parts/files/common/editors/saveParticipant', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/parts/files/browser/editors/textFileEditor', 'vs/workbench/parts/files/browser/editors/binaryFileEditor', 'vs/platform/instantiation/common/descriptors', 'vs/workbench/services/viewlet/common/viewletService', 'vs/workbench/services/editor/common/editorService', 'vs/base/common/keyCodes', 'vs/base/common/platform', 'vs/css!./media/files.contribution'], function (require, exports, uri_1, viewlet_1, nls, actions_1, platform_1, quickOpenService_1, quickOpenAction_1, configurationRegistry_1, actionRegistry_1, contributions_1, baseEditor_1, quickopen_1, files_1, files_2, files_3, fileTracker_1, saveParticipant_1, fileEditorInput_1, textFileEditor_1, binaryFileEditor_1, descriptors_1, viewletService_1, editorService_1, keyCodes_1, platform) {
    'use strict';
    // Viewlet Action
    var OpenExplorerViewletAction = (function (_super) {
        __extends(OpenExplorerViewletAction, _super);
        function OpenExplorerViewletAction(id, label, viewletService, editorService) {
            _super.call(this, id, label, files_3.VIEWLET_ID, viewletService, editorService);
        }
        OpenExplorerViewletAction.ID = files_3.VIEWLET_ID;
        OpenExplorerViewletAction.LABEL = nls.localize(0, null);
        OpenExplorerViewletAction = __decorate([
            __param(2, viewletService_1.IViewletService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenExplorerViewletAction);
        return OpenExplorerViewletAction;
    }(viewlet_1.ToggleViewletAction));
    exports.OpenExplorerViewletAction = OpenExplorerViewletAction;
    // Register Viewlet
    platform_1.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet(new viewlet_1.ViewletDescriptor('vs/workbench/parts/files/browser/explorerViewlet', 'ExplorerViewlet', files_3.VIEWLET_ID, nls.localize(1, null), 'explore', 0));
    platform_1.Registry.as(viewlet_1.Extensions.Viewlets).setDefaultViewletId(files_3.VIEWLET_ID);
    var openViewletKb = {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_E
    };
    // Register Action to Open Viewlet
    var registry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(OpenExplorerViewletAction, OpenExplorerViewletAction.ID, OpenExplorerViewletAction.LABEL, openViewletKb), nls.localize(2, null));
    // Register file editors
    platform_1.Registry.as(baseEditor_1.Extensions.Editors).registerEditor(new files_1.FileEditorDescriptor(textFileEditor_1.TextFileEditor.ID, // explicit dependency because we don't want these editors lazy loaded
    nls.localize(3, null), 'vs/workbench/parts/files/browser/editors/textFileEditor', 'TextFileEditor', [
        'text/*',
        // In case the mime type is unknown, we prefer the text file editor over the binary editor to leave a chance
        // of opening a potential text file properly. The resolution of the file in the text file editor will fail
        // early on in case the file is actually binary, to prevent downloading a potential large binary file.
        'application/unknown'
    ]), [
        new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)
    ]);
    platform_1.Registry.as(baseEditor_1.Extensions.Editors).registerEditor(new files_1.FileEditorDescriptor(binaryFileEditor_1.BinaryFileEditor.ID, // explicit dependency because we don't want these editors lazy loaded
    nls.localize(4, null), 'vs/workbench/parts/files/browser/editors/binaryFileEditor', 'BinaryFileEditor', [
        'image/*',
        'application/pdf',
        'audio/*',
        'video/*',
        'application/octet-stream'
    ]), [
        new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)
    ]);
    // Register default file input handler
    // Note: because of service injection, the descriptor needs to have the exact count
    // of arguments as the FileEditorInput constructor. Otherwise when creating an
    // instance through the instantiation service he will inject the services wrong!
    var descriptor = new descriptors_1.AsyncDescriptor('vs/workbench/parts/files/browser/editors/fileEditorInput', 'FileEditorInput', /* DO NOT REMOVE */ void 0, /* DO NOT REMOVE */ void 0, /* DO NOT REMOVE */ void 0);
    platform_1.Registry.as(baseEditor_1.Extensions.Editors).registerDefaultFileInput(descriptor);
    // Register Editor Input Factory
    var FileEditorInputFactory = (function () {
        function FileEditorInputFactory() {
        }
        FileEditorInputFactory.prototype.serialize = function (editorInput) {
            var fileEditorInput = editorInput;
            var fileInput = {
                resource: fileEditorInput.getResource().toString(),
                mime: fileEditorInput.getMime()
            };
            return JSON.stringify(fileInput);
        };
        FileEditorInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            var fileInput = JSON.parse(serializedEditorInput);
            return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, uri_1.default.parse(fileInput.resource), fileInput.mime, void 0);
        };
        return FileEditorInputFactory;
    }());
    platform_1.Registry.as(baseEditor_1.Extensions.Editors).registerEditorInputFactory(files_3.FILE_EDITOR_INPUT_ID, FileEditorInputFactory);
    // Register File Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(fileTracker_1.FileTracker);
    // Register Save Participant
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(saveParticipant_1.SaveParticipant);
    // Configuration
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'files',
        'order': 7,
        'title': nls.localize(5, null),
        'type': 'object',
        'properties': {
            'files.exclude': {
                'type': 'object',
                'description': nls.localize(6, null),
                'default': { '**/.git': true, '**/.DS_Store': true },
                'additionalProperties': {
                    'anyOf': [
                        {
                            'type': 'boolean',
                            'description': nls.localize(7, null),
                        },
                        {
                            'type': 'object',
                            'properties': {
                                'when': {
                                    'type': 'string',
                                    'pattern': '\\w*\\$\\(basename\\)\\w*',
                                    'default': '$(basename).ext',
                                    'description': nls.localize(8, null)
                                }
                            }
                        }
                    ]
                }
            },
            'files.associations': {
                'type': 'object',
                'description': nls.localize(9, null),
            },
            'files.encoding': {
                'type': 'string',
                'enum': Object.keys(files_2.SUPPORTED_ENCODINGS),
                'default': 'utf8',
                'description': nls.localize(10, null),
            },
            'files.eol': {
                'type': 'string',
                'enum': [
                    '\n',
                    '\r\n'
                ],
                'default': (platform.isLinux || platform.isMacintosh) ? '\n' : '\r\n',
                'description': nls.localize(11, null),
            },
            'files.trimTrailingWhitespace': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(12, null)
            },
            'files.autoSave': {
                'type': 'string',
                'enum': [files_2.AutoSaveConfiguration.OFF, files_2.AutoSaveConfiguration.AFTER_DELAY, files_2.AutoSaveConfiguration.ON_FOCUS_CHANGE],
                'default': files_2.AutoSaveConfiguration.OFF,
                'description': nls.localize(13, null, files_2.AutoSaveConfiguration.OFF, files_2.AutoSaveConfiguration.AFTER_DELAY, files_2.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_2.AutoSaveConfiguration.AFTER_DELAY)
            },
            'files.autoSaveDelay': {
                'type': 'number',
                'default': 1000,
                'description': nls.localize(14, null, files_2.AutoSaveConfiguration.AFTER_DELAY)
            },
            'files.watcherExclude': {
                'type': 'object',
                'default': (platform.isLinux || platform.isMacintosh) ? { '**/.git/objects/**': true, '**/node_modules/**': true } : { '**/.git/objects/**': true },
                'description': nls.localize(15, null)
            }
        }
    });
    configurationRegistry.registerConfiguration({
        'id': 'explorer',
        'order': 8,
        'title': nls.localize(16, null),
        'type': 'object',
        'properties': {
            'explorer.workingFiles.maxVisible': {
                'type': 'number',
                'description': nls.localize(17, null),
                'default': 9
            },
            'explorer.workingFiles.dynamicHeight': {
                'type': 'boolean',
                'description': nls.localize(18, null),
                'default': true
            },
            'explorer.autoReveal': {
                'type': 'boolean',
                'description': nls.localize(19, null),
                'default': true
            }
        }
    });
    // Register quick open handler for working files
    var ALL_WORKING_FILES_PREFIX = '~';
    var OpenWorkingFileByNameAction = (function (_super) {
        __extends(OpenWorkingFileByNameAction, _super);
        function OpenWorkingFileByNameAction(actionId, actionLabel, quickOpenService) {
            _super.call(this, actionId, actionLabel, ALL_WORKING_FILES_PREFIX, quickOpenService);
        }
        OpenWorkingFileByNameAction.ID = 'workbench.files.action.workingFilesPicker';
        OpenWorkingFileByNameAction.LABEL = nls.localize(20, null);
        OpenWorkingFileByNameAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService)
        ], OpenWorkingFileByNameAction);
        return OpenWorkingFileByNameAction;
    }(quickOpenAction_1.QuickOpenAction));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor('vs/workbench/parts/files/browser/workingFilesPicker', 'WorkingFilesPicker', ALL_WORKING_FILES_PREFIX, [
        {
            prefix: ALL_WORKING_FILES_PREFIX,
            needsEditor: false,
            description: nls.localize(21, null)
        }
    ]));
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(OpenWorkingFileByNameAction, OpenWorkingFileByNameAction.ID, OpenWorkingFileByNameAction.LABEL, {
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_P)
    }), nls.localize(22, null));
});
//# sourceMappingURL=files.contribution.js.map