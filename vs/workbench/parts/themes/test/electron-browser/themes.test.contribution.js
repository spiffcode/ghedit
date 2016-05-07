/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/paths', 'vs/editor/common/model/textModelWithTokens', 'vs/editor/common/model/textModel', 'vs/editor/common/services/modeService', 'vs/base/node/pfs', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/services/themes/common/themeService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/common/editor'], function (require, exports, winjs_base_1, paths, textModelWithTokens_1, textModel_1, modeService_1, pfs, keybindingsRegistry_1, instantiation_1, themeService_1, editorService_1, editor_1) {
    'use strict';
    var Snapper = (function () {
        function Snapper(modeService, themeService) {
            this.modeService = modeService;
            this.themeService = themeService;
        }
        Snapper.prototype.getTestNode = function (themeId) {
            var editorNode = document.createElement('div');
            editorNode.className = 'monaco-editor ' + themeId;
            document.body.appendChild(editorNode);
            var element = document.createElement('span');
            editorNode.appendChild(element);
            return element;
        };
        Snapper.prototype.normalizeType = function (type) {
            return type.split('.').sort().join('.');
        };
        Snapper.prototype.getStyle = function (testNode, scope) {
            testNode.className = 'token ' + scope.replace(/\./g, ' ');
            var cssStyles = window.getComputedStyle(testNode);
            if (cssStyles) {
                return cssStyles.color;
            }
            return '';
        };
        Snapper.prototype.getMatchedCSSRule = function (testNode, scope) {
            testNode.className = 'token ' + scope.replace(/\./g, ' ');
            var rulesList = window.getMatchedCSSRules(testNode);
            if (rulesList) {
                for (var i = rulesList.length - 1; i >= 0; i--) {
                    var selectorText = rulesList.item(i)['selectorText'];
                    if (selectorText && selectorText.match(/\.monaco-editor\..+token/)) {
                        return selectorText.substr(14);
                    }
                }
            }
            else {
                console.log('no match ' + scope);
            }
            return '';
        };
        Snapper.prototype.appendThemeInformation = function (data) {
            var _this = this;
            var currentTheme = this.themeService.getTheme();
            var getThemeName = function (id) {
                var part = 'vscode-theme-defaults-themes-';
                var startIdx = id.indexOf(part);
                if (startIdx !== -1) {
                    return id.substring(startIdx + part.length, id.length - 5);
                }
                return void 0;
            };
            return this.themeService.getThemes().then(function (themeDatas) {
                var defaultThemes = themeDatas.filter(function (themeData) { return !!getThemeName(themeData.id); });
                return winjs_base_1.TPromise.join(defaultThemes.map(function (defaultTheme) {
                    var themeId = defaultTheme.id;
                    return _this.themeService.setTheme(themeId, false).then(function (success) {
                        if (success) {
                            var testNode_1 = _this.getTestNode(themeId);
                            var themeName_1 = getThemeName(themeId);
                            data.forEach(function (entry) {
                                entry.r[themeName_1] = _this.getMatchedCSSRule(testNode_1, entry.t) + ' ' + _this.getStyle(testNode_1, entry.t);
                            });
                        }
                    });
                }));
            }).then(function (_) {
                return _this.themeService.setTheme(currentTheme, false).then(function (_) {
                    return data;
                });
            });
        };
        Snapper.prototype.captureSyntaxTokens = function (fileName, content) {
            var _this = this;
            return this.modeService.getOrCreateModeByFilenameOrFirstLine(fileName).then(function (mode) {
                var result = [];
                var model = new textModelWithTokens_1.TextModelWithTokens([], textModel_1.TextModel.toRawText(content, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS), false, mode);
                model.tokenIterator({ lineNumber: 1, column: 1 }, function (iterator) {
                    while (iterator.hasNext()) {
                        var tokenInfo = iterator.next();
                        var lineNumber = tokenInfo.lineNumber;
                        var content_1 = model.getValueInRange({ startLineNumber: lineNumber, endLineNumber: lineNumber, startColumn: tokenInfo.startColumn, endColumn: tokenInfo.endColumn });
                        result.push({
                            c: content_1,
                            t: _this.normalizeType(tokenInfo.token.type),
                            r: {}
                        });
                    }
                });
                return _this.appendThemeInformation(result);
            });
        };
        Snapper = __decorate([
            __param(0, modeService_1.IModeService),
            __param(1, themeService_1.IThemeService)
        ], Snapper);
        return Snapper;
    }());
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
        id: '_workbench.captureSyntaxTokens',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(0),
        handler: function (accessor, args) {
            var process = function (resource) {
                var filePath = resource.fsPath;
                var fileName = paths.basename(filePath);
                var snapper = accessor.get(instantiation_1.IInstantiationService).createInstance(Snapper);
                return pfs.readFile(filePath).then(function (content) {
                    return snapper.captureSyntaxTokens(fileName, content.toString());
                });
            };
            var resource = args[0];
            if (!resource) {
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var fileEditorInput = editor_1.asFileEditorInput(editorService.getActiveEditorInput());
                if (fileEditorInput) {
                    process(fileEditorInput.getResource()).then(function (result) {
                        console.log(result);
                    });
                }
                else {
                    console.log('No file editor active');
                }
            }
            else {
                return process(resource);
            }
        },
        context: undefined,
        primary: undefined
    });
});
//# sourceMappingURL=themes.test.contribution.js.map