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
define(["require", "exports", 'vs/nls!vs/workbench/parts/snippets/electron-browser/snippets.contribution', 'vs/base/common/winjs.base', 'vs/base/common/paths', 'vs/base/common/actions', 'vs/platform/actions/common/actions', 'vs/platform/platform', 'vs/workbench/common/actionRegistry', 'vs/workbench/common/contributions', './snippetsTracker', 'vs/base/common/errors', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/platform/workspace/common/workspace', 'vs/platform/jsonschemas/common/jsonContributionRegistry', 'vs/editor/common/services/modeService', 'electron', 'fs'], function (require, exports, nls, winjs, paths, actions, actions_1, platform, workbenchActionRegistry, workbenchContributions, snippetsTracker, errors, quickOpenService_1, workspace_1, JSONContributionRegistry, modeService_1, electron_1, fs) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var OpenSnippetsAction = (function (_super) {
        __extends(OpenSnippetsAction, _super);
        function OpenSnippetsAction(id, label, contextService, quickOpenService, modeService) {
            _super.call(this, id, label);
            this.contextService = contextService;
            this.quickOpenService = quickOpenService;
            this.modeService = modeService;
        }
        OpenSnippetsAction.prototype.openFile = function (filePath) {
            electron_1.ipcRenderer.send('vscode:windowOpen', [filePath]); // handled from browser process
        };
        OpenSnippetsAction.prototype.run = function () {
            var _this = this;
            var modeIds = this.modeService.getRegisteredModes();
            var picks = [];
            modeIds.forEach(function (modeId) {
                var name = _this.modeService.getLanguageName(modeId);
                if (name) {
                    picks.push({ label: name, id: modeId });
                }
            });
            picks = picks.sort(function (e1, e2) {
                return e1.label.localeCompare(e2.label);
            });
            return this.quickOpenService.pick(picks, { placeHolder: nls.localize(1, null) }).then(function (language) {
                if (language) {
                    var snippetPath = paths.join(_this.contextService.getConfiguration().env.appSettingsHome, 'snippets', language.id + '.json');
                    return fileExists(snippetPath).then(function (success) {
                        if (success) {
                            _this.openFile(snippetPath);
                            return winjs.TPromise.as(null);
                        }
                        var defaultContent = [
                            '{',
                            '/*',
                            '\t // Place your snippets for ' + language.label + ' here. Each snippet is defined under a snippet name and has a prefix, body and ',
                            '\t // description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:',
                            '\t // $1, $2 for tab stops, ${id} and ${id:label} and ${1:label} for variables. Variables with the same id are connected.',
                            '\t // Example:',
                            '\t "Print to console": {',
                            '\t\t"prefix": "log",',
                            '\t\t"body": [',
                            '\t\t\t"console.log(\'$1\');",',
                            '\t\t\t"$2"',
                            '\t\t],',
                            '\t\t"description": "Log output to console"',
                            '\t}',
                            '*/',
                            '}'
                        ].join('\n');
                        return createFile(snippetPath, defaultContent).then(function () {
                            _this.openFile(snippetPath);
                        }, function (err) {
                            errors.onUnexpectedError(nls.localize(2, null, snippetPath));
                        });
                    });
                }
                return winjs.TPromise.as(null);
            });
        };
        OpenSnippetsAction.ID = 'workbench.action.openSnippets';
        OpenSnippetsAction.LABEL = nls.localize(0, null);
        OpenSnippetsAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, quickOpenService_1.IQuickOpenService),
            __param(4, modeService_1.IModeService)
        ], OpenSnippetsAction);
        return OpenSnippetsAction;
    }(actions.Action));
    function fileExists(path) {
        return new winjs.TPromise(function (c, e, p) {
            fs.stat(path, function (err, stats) {
                if (err) {
                    return c(false);
                }
                if (stats.isFile()) {
                    return c(true);
                }
                c(false);
            });
        });
    }
    function createFile(path, content) {
        return new winjs.Promise(function (c, e, p) {
            fs.writeFile(path, content, function (err) {
                if (err) {
                    e(err);
                }
                c(true);
            });
        });
    }
    var preferencesCategory = nls.localize(3, null);
    var workbenchActionsRegistry = platform.Registry.as(workbenchActionRegistry.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(OpenSnippetsAction, OpenSnippetsAction.ID, OpenSnippetsAction.LABEL), preferencesCategory);
    platform.Registry.as(workbenchContributions.Extensions.Workbench).registerWorkbenchContribution(snippetsTracker.SnippetsTracker);
    var schemaId = 'vscode://schemas/snippets';
    var schema = {
        'id': schemaId,
        'defaultSnippets': [{
                'label': nls.localize(4, null),
                'body': { '{{snippetName}}': { 'prefix': '{{prefix}}', 'body': '{{snippet}}', 'description': '{{description}}' } }
            }],
        'type': 'object',
        'description': nls.localize(5, null),
        'additionalProperties': {
            'type': 'object',
            'required': ['prefix', 'body'],
            'properties': {
                'prefix': {
                    'description': nls.localize(6, null),
                    'type': 'string'
                },
                'body': {
                    'description': nls.localize(7, null),
                    'type': ['string', 'array'],
                    'items': {
                        'type': 'string'
                    }
                },
                'description': {
                    'description': nls.localize(8, null),
                    'type': 'string'
                }
            },
            'additionalProperties': false
        }
    };
    var schemaRegistry = platform.Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
    schemaRegistry.registerSchema(schemaId, schema);
    schemaRegistry.addSchemaFileAssociation('%APP_SETTINGS_HOME%/snippets/*.json', schemaId);
});
//# sourceMappingURL=snippets.contribution.js.map