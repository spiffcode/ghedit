var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/editor/node/textMate/TMSnippets', 'vs/base/common/json', 'vs/base/common/paths', 'vs/base/node/pfs', 'vs/platform/extensions/common/extensionsRegistry', 'vs/editor/common/modes/supports', 'vs/editor/common/services/modeService', 'vs/editor/common/services/modelService', 'vs/editor/contrib/snippet/common/snippet'], function (require, exports, nls, json_1, paths, pfs_1, extensionsRegistry_1, supports_1, modeService_1, modelService_1, snippet_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function snippetUpdated(modeId, filePath) {
        return pfs_1.readFile(filePath).then(function (fileContents) {
            var errors = [];
            var snippetsObj = json_1.parse(fileContents.toString(), errors);
            var adaptedSnippets = TMSnippetsAdaptor.adapt(snippetsObj);
            supports_1.SnippetsRegistry.registerSnippets(modeId, filePath, adaptedSnippets);
        });
    }
    exports.snippetUpdated = snippetUpdated;
    var snippetsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('snippets', {
        description: nls.localize(0, null),
        type: 'array',
        defaultSnippets: [{ body: [{ language: '', path: '' }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { language: '{{id}}', path: './snippets/{{id}}.json.' } }],
            properties: {
                language: {
                    description: nls.localize(1, null),
                    type: 'string'
                },
                path: {
                    description: nls.localize(2, null),
                    type: 'string'
                }
            }
        }
    });
    var MainProcessTextMateSnippet = (function () {
        function MainProcessTextMateSnippet(modelService, modeService) {
            var _this = this;
            this._modelService = modelService;
            this._modeService = modeService;
            snippetsExtensionPoint.setHandler(function (extensions) {
                for (var i = 0; i < extensions.length; i++) {
                    var tmSnippets = extensions[i].value;
                    for (var j = 0; j < tmSnippets.length; j++) {
                        _this._withTMSnippetContribution(extensions[i].description.extensionFolderPath, tmSnippets[j], extensions[i].collector);
                    }
                }
            });
        }
        MainProcessTextMateSnippet.prototype._withTMSnippetContribution = function (extensionFolderPath, snippet, collector) {
            var _this = this;
            if (!snippet.language || (typeof snippet.language !== 'string') || !this._modeService.isRegisteredMode(snippet.language)) {
                collector.error(nls.localize(3, null, snippetsExtensionPoint.name, String(snippet.language)));
                return;
            }
            if (!snippet.path || (typeof snippet.path !== 'string')) {
                collector.error(nls.localize(4, null, snippetsExtensionPoint.name, String(snippet.path)));
                return;
            }
            var normalizedAbsolutePath = paths.normalize(paths.join(extensionFolderPath, snippet.path));
            if (normalizedAbsolutePath.indexOf(extensionFolderPath) !== 0) {
                collector.warn(nls.localize(5, null, snippetsExtensionPoint.name, normalizedAbsolutePath, extensionFolderPath));
            }
            var modeId = snippet.language;
            var disposable = this._modeService.onDidCreateMode(function (mode) {
                if (mode.getId() !== modeId) {
                    return;
                }
                _this.registerDefinition(modeId, normalizedAbsolutePath);
                disposable.dispose();
            });
        };
        MainProcessTextMateSnippet.prototype.registerDefinition = function (modeId, filePath) {
            pfs_1.readFile(filePath).then(function (fileContents) {
                var errors = [];
                var snippetsObj = json_1.parse(fileContents.toString(), errors);
                var adaptedSnippets = TMSnippetsAdaptor.adapt(snippetsObj);
                supports_1.SnippetsRegistry.registerDefaultSnippets(modeId, adaptedSnippets);
            });
        };
        MainProcessTextMateSnippet = __decorate([
            __param(0, modelService_1.IModelService),
            __param(1, modeService_1.IModeService)
        ], MainProcessTextMateSnippet);
        return MainProcessTextMateSnippet;
    }());
    exports.MainProcessTextMateSnippet = MainProcessTextMateSnippet;
    var TMSnippetsAdaptor = (function () {
        function TMSnippetsAdaptor() {
        }
        TMSnippetsAdaptor.adapt = function (snippetsObj) {
            var topLevelProperties = Object.keys(snippetsObj), result = [];
            var processSnippet = function (snippet, description) {
                var prefix = snippet['prefix'];
                var bodyStringOrArray = snippet['body'];
                if (Array.isArray(bodyStringOrArray)) {
                    bodyStringOrArray = bodyStringOrArray.join('\n');
                }
                if (typeof prefix === 'string' && typeof bodyStringOrArray === 'string') {
                    var convertedSnippet = TMSnippetsAdaptor.convertSnippet(bodyStringOrArray);
                    if (convertedSnippet !== null) {
                        result.push({
                            type: 'snippet',
                            label: prefix,
                            documentationLabel: snippet['description'] || description,
                            codeSnippet: convertedSnippet,
                            noAutoAccept: true
                        });
                    }
                }
            };
            topLevelProperties.forEach(function (topLevelProperty) {
                var scopeOrTemplate = snippetsObj[topLevelProperty];
                if (scopeOrTemplate['body'] && scopeOrTemplate['prefix']) {
                    processSnippet(scopeOrTemplate, topLevelProperty);
                }
                else {
                    var snippetNames = Object.keys(scopeOrTemplate);
                    snippetNames.forEach(function (name) {
                        processSnippet(scopeOrTemplate[name], name);
                    });
                }
            });
            return result;
        };
        TMSnippetsAdaptor.convertSnippet = function (textMateSnippet) {
            return snippet_1.CodeSnippet.convertExternalSnippet(textMateSnippet, snippet_1.ExternalSnippetType.TextMateSnippet);
        };
        return TMSnippetsAdaptor;
    }());
});
//# sourceMappingURL=TMSnippets.js.map