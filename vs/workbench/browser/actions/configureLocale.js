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
define(["require", "exports", 'vs/nls', 'vs/base/common/paths', 'vs/base/common/uri', 'vs/base/common/labels', 'vs/base/common/platform', 'vs/base/common/actions', 'vs/platform/platform', 'vs/workbench/common/actionRegistry', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/files/common/files', 'vs/platform/actions/common/actions', 'vs/platform/jsonschemas/common/jsonContributionRegistry'], function (require, exports, nls, Path, uri_1, Labels, Platform, actions_1, platform_1, actionRegistry_1, editorService_1, contextService_1, files_1, actions_2, jsonContributionRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ConfigureLocaleAction = (function (_super) {
        __extends(ConfigureLocaleAction, _super);
        function ConfigureLocaleAction(id, label, fileService, contextService, editorService) {
            _super.call(this, id, label);
            this.fileService = fileService;
            this.contextService = contextService;
            this.editorService = editorService;
        }
        ConfigureLocaleAction.prototype.run = function (event) {
            var _this = this;
            var file = uri_1.default.file(Path.join(this.contextService.getConfiguration().env.appSettingsHome, 'locale.json'));
            return this.fileService.resolveFile(file).then(null, function (error) {
                return _this.fileService.createFile(file, ConfigureLocaleAction.DEFAULT_CONTENT);
            }).then(function (stat) {
                if (!stat) {
                    return;
                }
                return _this.editorService.openEditor({
                    resource: stat.resource,
                    options: {
                        forceOpen: true
                    }
                });
            }, function (error) {
                throw new Error(nls.localize('fail.createSettings', "Unable to create '{0}' ({1}).", Labels.getPathLabel(file, _this.contextService), error));
            });
        };
        ConfigureLocaleAction.ID = 'workbench.action.configureLocale';
        ConfigureLocaleAction.LABEL = nls.localize('configureLocale', "Configure Language");
        ConfigureLocaleAction.DEFAULT_CONTENT = [
            '{',
            ("\t// " + nls.localize('displayLanguage', 'Defines VSCode\'s display language.')),
            ("\t// " + nls.localize('doc', 'See {0} for a list of supported languages.', 'https://go.microsoft.com/fwlink/?LinkId=761051')),
            ("\t// " + nls.localize('restart', 'Changing the value requires to restart VSCode.')),
            ("\t\"locale\":\"" + Platform.language + "\""),
            '}'
        ].join('\n');
        ConfigureLocaleAction = __decorate([
            __param(2, files_1.IFileService),
            __param(3, contextService_1.IWorkspaceContextService),
            __param(4, editorService_1.IWorkbenchEditorService)
        ], ConfigureLocaleAction);
        return ConfigureLocaleAction;
    }(actions_1.Action));
    var workbenchActionsRegistry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ConfigureLocaleAction, ConfigureLocaleAction.ID, ConfigureLocaleAction.LABEL), 'Configure Language');
    var schemaId = 'vscode://schemas/locale';
    // Keep en-US since we generated files with that content.
    var schema = {
        id: schemaId,
        description: 'Locale Definition file',
        type: 'object',
        default: {
            'locale': 'en'
        },
        required: ['locale'],
        properties: {
            locale: {
                type: 'string',
                enum: ['de', 'en', 'en-US', 'es', 'fr', 'it', 'ja', 'ko', 'ru', 'zh-CN', 'zh-tw'],
                description: nls.localize('JsonSchema.locale', 'The UI Language to use.')
            }
        }
    };
    var jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    jsonRegistry.registerSchema(schemaId, schema);
});
//# sourceMappingURL=configureLocale.js.map