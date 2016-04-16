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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls', 'vs/base/common/uri', 'vs/base/common/labels', 'vs/platform/platform', 'vs/base/common/actions', 'vs/workbench/common/actionRegistry', 'vs/workbench/common/editor/stringEditorInput', 'vs/platform/configuration/common/model', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/configuration/common/configuration', 'vs/platform/editor/common/editor', 'vs/platform/storage/common/storage', 'vs/platform/files/common/files', 'vs/platform/message/common/message', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/actions/common/actions', 'vs/platform/instantiation/common/instantiation', 'vs/base/common/keyCodes'], function (require, exports, winjs_base_1, nls, uri_1, labels, platform_1, actions_1, actionRegistry_1, stringEditorInput_1, model_1, editorService_1, contextService_1, configuration_1, editor_1, storage_1, files_1, message_1, keybindingService_1, actions_2, instantiation_1, keyCodes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var BaseTwoEditorsAction = (function (_super) {
        __extends(BaseTwoEditorsAction, _super);
        function BaseTwoEditorsAction(id, label, editorService, fileService, configurationService, messageService, contextService, keybindingService, instantiationService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.messageService = messageService;
            this.contextService = contextService;
            this.keybindingService = keybindingService;
            this.instantiationService = instantiationService;
            this.enabled = true;
        }
        BaseTwoEditorsAction.prototype.createIfNotExists = function (resource, contents) {
            var _this = this;
            return this.fileService.resolveContent(resource, { acceptTextOnly: true }).then(null, function (error) {
                if (error.fileOperationResult === files_1.FileOperationResult.FILE_NOT_FOUND) {
                    return _this.fileService.updateContent(resource, contents).then(null, function (error) {
                        return winjs_base_1.TPromise.wrapError(new Error(nls.localize('fail.createSettings', "Unable to create '{0}' ({1}).", labels.getPathLabel(resource, _this.contextService), error)));
                    });
                }
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        BaseTwoEditorsAction.prototype.openTwoEditors = function (leftHandDefaultInput, editableResource, defaultEditableContents) {
            var _this = this;
            // Create as needed and open in editor
            return this.createIfNotExists(editableResource, defaultEditableContents).then(function () {
                return _this.editorService.inputToType({ resource: editableResource }).then(function (typedRightHandEditableInput) {
                    return _this.editorService.setEditors([leftHandDefaultInput, typedRightHandEditableInput]).then(function () {
                        return _this.editorService.focusEditor(editor_1.Position.CENTER);
                    });
                });
            });
        };
        BaseTwoEditorsAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, files_1.IFileService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, message_1.IMessageService),
            __param(6, contextService_1.IWorkspaceContextService),
            __param(7, keybindingService_1.IKeybindingService),
            __param(8, instantiation_1.IInstantiationService)
        ], BaseTwoEditorsAction);
        return BaseTwoEditorsAction;
    }(actions_1.Action));
    exports.BaseTwoEditorsAction = BaseTwoEditorsAction;
    var BaseOpenSettingsAction = (function (_super) {
        __extends(BaseOpenSettingsAction, _super);
        function BaseOpenSettingsAction(id, label, editorService, fileService, configurationService, messageService, contextService, keybindingService, instantiationService) {
            _super.call(this, id, label, editorService, fileService, configurationService, messageService, contextService, keybindingService, instantiationService);
        }
        BaseOpenSettingsAction.prototype.open = function (emptySettingsContents, settingsResource) {
            return this.openTwoEditors(DefaultSettingsInput.getInstance(this.instantiationService), settingsResource, emptySettingsContents);
        };
        BaseOpenSettingsAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, files_1.IFileService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, message_1.IMessageService),
            __param(6, contextService_1.IWorkspaceContextService),
            __param(7, keybindingService_1.IKeybindingService),
            __param(8, instantiation_1.IInstantiationService)
        ], BaseOpenSettingsAction);
        return BaseOpenSettingsAction;
    }(BaseTwoEditorsAction));
    exports.BaseOpenSettingsAction = BaseOpenSettingsAction;
    var OpenGlobalSettingsAction = (function (_super) {
        __extends(OpenGlobalSettingsAction, _super);
        function OpenGlobalSettingsAction(id, label, editorService, fileService, configurationService, messageService, contextService, keybindingService, instantiationService, storageService) {
            _super.call(this, id, label, editorService, fileService, configurationService, messageService, contextService, keybindingService, instantiationService);
            this.storageService = storageService;
        }
        OpenGlobalSettingsAction.prototype.run = function (event) {
            var _this = this;
            // Inform user about workspace settings
            if (this.configurationService.hasWorkspaceConfiguration() && !this.storageService.getBoolean(OpenGlobalSettingsAction.SETTINGS_INFO_IGNORE_KEY, storage_1.StorageScope.WORKSPACE)) {
                this.messageService.show(message_1.Severity.Info, {
                    message: nls.localize('workspaceHasSettings', "The currently opened folder contains workspace settings that may override user settings"),
                    actions: [
                        message_1.CloseAction,
                        new actions_1.Action('neverShowAgain', nls.localize('neverShowAgain', "Don't show again"), null, true, function () {
                            _this.storageService.store(OpenGlobalSettingsAction.SETTINGS_INFO_IGNORE_KEY, true, storage_1.StorageScope.WORKSPACE);
                            return winjs_base_1.TPromise.as(true);
                        }),
                        new actions_1.Action('open.workspaceSettings', nls.localize('openWorkspaceSettings', "Open Workspace Settings"), null, true, function () {
                            var editorCount = _this.editorService.getVisibleEditors().length;
                            return _this.editorService.inputToType({ resource: _this.contextService.toResource('.vscode/settings.json') }).then(function (typedInput) {
                                return _this.editorService.openEditor(typedInput, null, editorCount === 2 ? editor_1.Position.RIGHT : editorCount === 1 ? editor_1.Position.CENTER : void 0);
                            });
                        })
                    ]
                });
            }
            // Open settings
            var emptySettingsHeader = nls.localize('emptySettingsHeader', "Place your settings in this file to overwrite the default settings");
            return this.open('// ' + emptySettingsHeader + '\n{\n}', uri_1.default.file(this.contextService.getConfiguration().env.appSettingsPath));
        };
        OpenGlobalSettingsAction.ID = 'workbench.action.openGlobalSettings';
        OpenGlobalSettingsAction.LABEL = nls.localize('openGlobalSettings', "Open User Settings");
        OpenGlobalSettingsAction.SETTINGS_INFO_IGNORE_KEY = 'settings.workspace.info.ignore';
        OpenGlobalSettingsAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, files_1.IFileService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, message_1.IMessageService),
            __param(6, contextService_1.IWorkspaceContextService),
            __param(7, keybindingService_1.IKeybindingService),
            __param(8, instantiation_1.IInstantiationService),
            __param(9, storage_1.IStorageService)
        ], OpenGlobalSettingsAction);
        return OpenGlobalSettingsAction;
    }(BaseOpenSettingsAction));
    exports.OpenGlobalSettingsAction = OpenGlobalSettingsAction;
    var OpenGlobalKeybindingsAction = (function (_super) {
        __extends(OpenGlobalKeybindingsAction, _super);
        function OpenGlobalKeybindingsAction(id, label, editorService, fileService, configurationService, messageService, contextService, keybindingService, instantiationService) {
            _super.call(this, id, label, editorService, fileService, configurationService, messageService, contextService, keybindingService, instantiationService);
        }
        OpenGlobalKeybindingsAction.prototype.run = function (event) {
            var emptyContents = '// ' + nls.localize('emptyKeybindingsHeader', "Place your key bindings in this file to overwrite the defaults") + '\n[\n]';
            return this.openTwoEditors(DefaultKeybindingsInput.getInstance(this.instantiationService, this.keybindingService), uri_1.default.file(this.contextService.getConfiguration().env.appKeybindingsPath), emptyContents);
        };
        OpenGlobalKeybindingsAction.ID = 'workbench.action.openGlobalKeybindings';
        OpenGlobalKeybindingsAction.LABEL = nls.localize('openGlobalKeybindings', "Open Keyboard Shortcuts");
        OpenGlobalKeybindingsAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, files_1.IFileService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, message_1.IMessageService),
            __param(6, contextService_1.IWorkspaceContextService),
            __param(7, keybindingService_1.IKeybindingService),
            __param(8, instantiation_1.IInstantiationService)
        ], OpenGlobalKeybindingsAction);
        return OpenGlobalKeybindingsAction;
    }(BaseTwoEditorsAction));
    exports.OpenGlobalKeybindingsAction = OpenGlobalKeybindingsAction;
    var OpenWorkspaceSettingsAction = (function (_super) {
        __extends(OpenWorkspaceSettingsAction, _super);
        function OpenWorkspaceSettingsAction() {
            _super.apply(this, arguments);
        }
        OpenWorkspaceSettingsAction.prototype.run = function (event) {
            if (!this.contextService.getWorkspace()) {
                this.messageService.show(message_1.Severity.Info, nls.localize('openFolderFirst', "Open a folder first to create workspace settings"));
                return;
            }
            var emptySettingsHeader = [
                '// ' + nls.localize('emptySettingsHeader1', "Place your settings in this file to overwrite default and user settings."),
                '{',
                '}'
            ].join('\n');
            return this.open(emptySettingsHeader, this.contextService.toResource('.vscode/settings.json'));
        };
        OpenWorkspaceSettingsAction.ID = 'workbench.action.openWorkspaceSettings';
        OpenWorkspaceSettingsAction.LABEL = nls.localize('openWorkspaceSettings', "Open Workspace Settings");
        return OpenWorkspaceSettingsAction;
    }(BaseOpenSettingsAction));
    exports.OpenWorkspaceSettingsAction = OpenWorkspaceSettingsAction;
    var DefaultSettingsInput = (function (_super) {
        __extends(DefaultSettingsInput, _super);
        function DefaultSettingsInput() {
            _super.apply(this, arguments);
        }
        DefaultSettingsInput.getInstance = function (instantiationService) {
            if (!DefaultSettingsInput.INSTANCE) {
                var defaults = model_1.getDefaultValuesContent();
                var defaultsHeader = '// ' + nls.localize('defaultSettingsHeader', "Overwrite settings by placing them into your settings file.");
                DefaultSettingsInput.INSTANCE = instantiationService.createInstance(DefaultSettingsInput, nls.localize('defaultName', "Default Settings"), null, defaultsHeader + '\n' + defaults, 'application/json', false);
            }
            return DefaultSettingsInput.INSTANCE;
        };
        DefaultSettingsInput.prototype.getResource = function () {
            return uri_1.default.create('vscode', 'defaultsettings', '/settings.json'); // URI is used to register JSON schema support
        };
        return DefaultSettingsInput;
    }(stringEditorInput_1.StringEditorInput));
    var DefaultKeybindingsInput = (function (_super) {
        __extends(DefaultKeybindingsInput, _super);
        function DefaultKeybindingsInput() {
            _super.apply(this, arguments);
        }
        DefaultKeybindingsInput.getInstance = function (instantiationService, keybindingService) {
            if (!DefaultKeybindingsInput.INSTANCE) {
                var defaultsHeader = '// ' + nls.localize('defaultKeybindingsHeader', "Overwrite key bindings by placing them into your key bindings file.");
                var defaultContents = keybindingService.getDefaultKeybindings();
                DefaultKeybindingsInput.INSTANCE = instantiationService.createInstance(DefaultKeybindingsInput, nls.localize('defaultKeybindings', "Default Keyboard Shortcuts"), null, defaultsHeader + '\n' + defaultContents, 'application/json', false);
            }
            return DefaultKeybindingsInput.INSTANCE;
        };
        DefaultKeybindingsInput.prototype.getResource = function () {
            return uri_1.default.create('vscode', 'defaultsettings', '/keybindings.json'); // URI is used to register JSON schema support
        };
        return DefaultKeybindingsInput;
    }(stringEditorInput_1.StringEditorInput));
    // Contribute Global Actions
    var category = nls.localize('preferences', "Preferences");
    var actionRegistry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(OpenGlobalSettingsAction, OpenGlobalSettingsAction.ID, OpenGlobalSettingsAction.LABEL, {
        primary: null,
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.US_COMMA }
    }), category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(OpenGlobalKeybindingsAction, OpenGlobalKeybindingsAction.ID, OpenGlobalKeybindingsAction.LABEL), category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(OpenWorkspaceSettingsAction, OpenWorkspaceSettingsAction.ID, OpenWorkspaceSettingsAction.LABEL), category);
});
//# sourceMappingURL=openSettings.js.map