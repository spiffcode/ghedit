var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls', 'vs/base/common/paths', 'vs/platform/extensions/common/extensionsRegistry', 'vs/workbench/services/themes/common/themeService', 'vs/platform/theme/common/themes', 'windowService', 'vs/platform/storage/common/storage', 'vs/workbench/common/constants', 'vs/base/browser/builder', 'vs/base/common/event'], function (require, exports, winjs_base_1, nls, Paths, extensionsRegistry_1, themeService_1, themes_1, windowService_1, storage_1, constants_1, builder_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // TODO: import plist = require('vs/base/node/plist');
    // TODO: import pfs = require('vs/base/node/pfs');
    // implementation
    var DEFAULT_THEME_ID = 'vs-dark vscode-theme-defaults-themes-dark_plus-json';
    var THEME_CHANNEL = 'vscode:changeTheme';
    var defaultBaseTheme = themes_1.getBaseThemeId(DEFAULT_THEME_ID);
    var defaultThemeExtensionId = 'vscode-theme-defaults';
    var oldDefaultThemeExtensionId = 'vscode-theme-colorful-defaults';
    function validateThemeId(theme) {
        // migrations
        switch (theme) {
            case 'vs': return "vs " + defaultThemeExtensionId + "-themes-light_vs-json";
            case 'vs-dark': return "vs-dark " + defaultThemeExtensionId + "-themes-dark_vs-json";
            case 'hc-black': return "hc-black " + defaultThemeExtensionId + "-themes-hc_black-json";
            case "vs " + oldDefaultThemeExtensionId + "-themes-light_plus-tmTheme": return "vs " + defaultThemeExtensionId + "-themes-light_plus-json";
            case "vs-dark " + oldDefaultThemeExtensionId + "-themes-dark_plus-tmTheme": return "vs-dark " + defaultThemeExtensionId + "-themes-dark_plus-json";
        }
        return theme;
    }
    var themesExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('themes', {
        description: nls.localize('vscode.extension.contributes.themes', 'Contributes textmate color themes.'),
        type: 'array',
        defaultSnippets: [{ body: [{ label: '{{label}}', uiTheme: 'vs-dark', path: './themes/{{id}}.tmTheme.' }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { label: '{{label}}', uiTheme: 'vs-dark', path: './themes/{{id}}.tmTheme.' } }],
            properties: {
                label: {
                    description: nls.localize('vscode.extension.contributes.themes.label', 'Label of the color theme as shown in the UI.'),
                    type: 'string'
                },
                uiTheme: {
                    description: nls.localize('vscode.extension.contributes.themes.uiTheme', 'Base theme defining the colors around the editor: \'vs\' is the light color theme, \'vs-dark\' is the dark color theme.'),
                    enum: ['vs', 'vs-dark', 'hc-black']
                },
                path: {
                    description: nls.localize('vscode.extension.contributes.themes.path', 'Path of the tmTheme file. The path is relative to the extension folder and is typically \'./themes/themeFile.tmTheme\'.'),
                    type: 'string'
                }
            }
        }
    });
    var ThemeService = (function () {
        function ThemeService(extensionService, windowService, storageService) {
            var _this = this;
            this.extensionService = extensionService;
            this.windowService = windowService;
            this.storageService = storageService;
            this.serviceId = themeService_1.IThemeService;
            this.knownThemes = [];
            this.onThemeChange = new event_1.Emitter();
            themesExtPoint.setHandler(function (extensions) {
                for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
                    var ext = extensions_1[_i];
                    _this.onThemes(ext.description.extensionFolderPath, ext.description.id, ext.value, ext.collector);
                }
            });
            windowService.onBroadcast(function (e) {
                if (e.channel === THEME_CHANNEL && typeof e.payload === 'string') {
                    _this.setTheme(e.payload, false);
                }
            });
        }
        Object.defineProperty(ThemeService.prototype, "onDidThemeChange", {
            get: function () {
                return this.onThemeChange.event;
            },
            enumerable: true,
            configurable: true
        });
        ThemeService.prototype.initialize = function (container) {
            this.container = container;
            var themeId = this.storageService.get(constants_1.Preferences.THEME, storage_1.StorageScope.GLOBAL, null);
            if (!themeId) {
                themeId = DEFAULT_THEME_ID;
                this.storageService.store(constants_1.Preferences.THEME, themeId, storage_1.StorageScope.GLOBAL);
            }
            return this.setTheme(themeId, false);
        };
        ThemeService.prototype.setTheme = function (themeId, broadcastToAllWindows) {
            var _this = this;
            if (!themeId) {
                return winjs_base_1.TPromise.as(false);
            }
            if (themeId === this.currentTheme) {
                if (broadcastToAllWindows) {
                    this.windowService.broadcast({ channel: THEME_CHANNEL, payload: themeId });
                }
                return winjs_base_1.TPromise.as(true);
            }
            themeId = validateThemeId(themeId); // migrate theme ids
            var onApply = function (newThemeId) {
                if (_this.container) {
                    if (_this.currentTheme) {
                        builder_1.$(_this.container).removeClass(_this.currentTheme);
                    }
                    _this.currentTheme = newThemeId;
                    builder_1.$(_this.container).addClass(newThemeId);
                }
                _this.storageService.store(constants_1.Preferences.THEME, newThemeId, storage_1.StorageScope.GLOBAL);
                if (broadcastToAllWindows) {
                    _this.windowService.broadcast({ channel: THEME_CHANNEL, payload: newThemeId });
                }
                _this.onThemeChange.fire(newThemeId);
            };
            return this.applyThemeCSS(themeId, DEFAULT_THEME_ID, onApply);
        };
        ThemeService.prototype.getTheme = function () {
            return this.currentTheme || this.storageService.get(constants_1.Preferences.THEME, storage_1.StorageScope.GLOBAL, DEFAULT_THEME_ID);
        };
        ThemeService.prototype.loadTheme = function (themeId, defaultId) {
            return this.getThemes().then(function (allThemes) {
                var themes = allThemes.filter(function (t) { return t.id === themeId; });
                if (themes.length > 0) {
                    return themes[0];
                }
                if (defaultId) {
                    var themes_2 = allThemes.filter(function (t) { return t.id === defaultId; });
                    if (themes_2.length > 0) {
                        return themes_2[0];
                    }
                }
                return null;
            });
        };
        ThemeService.prototype.applyThemeCSS = function (themeId, defaultId, onApply) {
            return this.loadTheme(themeId, defaultId).then(function (theme) {
                if (theme) {
                    return applyTheme(theme, onApply);
                }
                return false;
            });
        };
        ThemeService.prototype.getThemes = function () {
            var _this = this;
            return this.extensionService.onReady().then(function (isReady) {
                return _this.knownThemes;
            });
        };
        ThemeService.prototype.onThemes = function (extensionFolderPath, extensionId, themes, collector) {
            var _this = this;
            if (!Array.isArray(themes)) {
                collector.error(nls.localize('reqarray', "Extension point `{0}` must be an array.", themesExtPoint.name));
                return;
            }
            themes.forEach(function (theme) {
                if (!theme.path || (typeof theme.path !== 'string')) {
                    collector.error(nls.localize('reqpath', "Expected string in `contributes.{0}.path`. Provided value: {1}", themesExtPoint.name, String(theme.path)));
                    return;
                }
                var normalizedAbsolutePath = Paths.normalize(Paths.join(extensionFolderPath, theme.path));
                if (normalizedAbsolutePath.indexOf(extensionFolderPath) !== 0) {
                    collector.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", themesExtPoint.name, normalizedAbsolutePath, extensionFolderPath));
                }
                var themeSelector = toCssSelector(extensionId + '-' + Paths.normalize(theme.path));
                _this.knownThemes.push({
                    id: (theme.uiTheme || defaultBaseTheme) + " " + themeSelector,
                    label: theme.label || Paths.basename(theme.path),
                    description: theme.description,
                    path: normalizedAbsolutePath
                });
            });
        };
        ThemeService = __decorate([
            __param(1, windowService_1.IWindowService),
            __param(2, storage_1.IStorageService)
        ], ThemeService);
        return ThemeService;
    }());
    exports.ThemeService = ThemeService;
    function toCssSelector(str) {
        return str.replace(/[^_\-a-zA-Z0-9]/g, '-');
    }
    function applyTheme(theme, onApply) {
        if (theme.styleSheetContent) {
            _applyRules(theme.styleSheetContent);
            onApply(theme.id);
            return winjs_base_1.TPromise.as(true);
        }
        return _loadThemeDocument(theme.path).then(function (themeDocument) {
            var styleSheetContent = _processThemeObject(theme.id, themeDocument);
            theme.styleSheetContent = styleSheetContent;
            _applyRules(styleSheetContent);
            onApply(theme.id);
            return true;
        }, function (error) {
            return winjs_base_1.TPromise.wrapError(nls.localize('error.cannotloadtheme', "Unable to load {0}", theme.path));
        });
    }
    function _loadThemeDocument(themePath) {
        return winjs_base_1.TPromise.wrapError(nls.localize('error.cannotparse', "_themeLoadDocument not implemented"));
        /* TODO:
        return pfs.readFile(themePath).then(content => {
            if (Paths.extname(themePath) === '.json') {
                let errors: string[] = [];
                let contentValue = <ThemeDocument> Json.parse(content.toString(), errors);
                if (errors.length > 0) {
                    return TPromise.wrapError(new Error(nls.localize('error.cannotparsejson', "Problems parsing JSON theme file: {0}", errors.join(', '))));
                }
                if (contentValue.include) {
                    return _loadThemeDocument(Paths.join(Paths.dirname(themePath), contentValue.include)).then(includedValue => {
                        contentValue.settings = includedValue.settings.concat(contentValue.settings);
                        return TPromise.as(contentValue);
                    });
                }
                return TPromise.as(contentValue);
            } else {
                let parseResult = plist.parse(content.toString());
                if (parseResult.errors && parseResult.errors.length) {
                    return TPromise.wrapError(new Error(nls.localize('error.cannotparse', "Problems parsing plist file: {0}", parseResult.errors.join(', '))));
                }
                return TPromise.as(parseResult.value);
            }
        });
        */
    }
    function _processThemeObject(themeId, themeDocument) {
        var cssRules = [];
        var themeSettings = themeDocument.settings;
        var editorSettings = {
            background: void 0,
            foreground: void 0,
            caret: void 0,
            invisibles: void 0,
            lineHighlight: void 0,
            selection: void 0
        };
        var themeSelector = themes_1.getBaseThemeId(themeId) + "." + themes_1.getSyntaxThemeId(themeId);
        if (Array.isArray(themeSettings)) {
            themeSettings.forEach(function (s, index, arr) {
                if (index === 0 && !s.scope) {
                    editorSettings = s.settings;
                }
                else {
                    var scope = s.scope;
                    var settings = s.settings;
                    if (scope && settings) {
                        var rules = Array.isArray(scope) ? scope : scope.split(',');
                        var statements_1 = _settingsToStatements(settings);
                        rules.forEach(function (rule) {
                            rule = rule.trim().replace(/ /g, '.'); // until we have scope hierarchy in the editor dom: replace spaces with .
                            cssRules.push(".monaco-editor." + themeSelector + " .token." + rule + " { " + statements_1 + " }");
                        });
                    }
                }
            });
        }
        if (editorSettings.background) {
            var background = new Color(editorSettings.background);
            //cssRules.push(`.monaco-editor.${themeSelector} { background-color: ${background}; }`);
            cssRules.push(".monaco-editor." + themeSelector + " .monaco-editor-background { background-color: " + background + "; }");
            cssRules.push(".monaco-editor." + themeSelector + " .glyph-margin { background-color: " + background + "; }");
            cssRules.push("." + themeSelector + " .monaco-workbench .monaco-editor-background { background-color: " + background + "; }");
        }
        if (editorSettings.foreground) {
            var foreground = new Color(editorSettings.foreground);
            cssRules.push(".monaco-editor." + themeSelector + " { color: " + foreground + "; }");
            cssRules.push(".monaco-editor." + themeSelector + " .token { color: " + foreground + "; }");
        }
        if (editorSettings.selection) {
            var selection = new Color(editorSettings.selection);
            cssRules.push(".monaco-editor." + themeSelector + " .focused .selected-text { background-color: " + selection + "; }");
            cssRules.push(".monaco-editor." + themeSelector + " .selected-text { background-color: " + selection.transparent(0.5) + "; }");
        }
        if (editorSettings.lineHighlight) {
            var lineHighlight = new Color(editorSettings.lineHighlight);
            cssRules.push(".monaco-editor." + themeSelector + " .current-line { background-color: " + lineHighlight + "; border:0; }");
        }
        if (editorSettings.caret) {
            var caret = new Color(editorSettings.caret);
            var oppositeCaret = caret.opposite();
            cssRules.push(".monaco-editor." + themeSelector + " .cursor { background-color: " + caret + "; border-color: " + caret + "; color: " + oppositeCaret + "; }");
        }
        if (editorSettings.invisibles) {
            var invisibles = new Color(editorSettings.invisibles);
            cssRules.push(".monaco-editor." + themeSelector + " .token.whitespace { color: " + invisibles + " !important; }");
            cssRules.push(".monaco-editor." + themeSelector + " .token.indent-guide { border-left: 1px solid " + invisibles + "; }");
        }
        return cssRules.join('\n');
    }
    function _settingsToStatements(settings) {
        var statements = [];
        for (var settingName in settings) {
            var value = settings[settingName];
            switch (settingName) {
                case 'foreground':
                    var foreground = new Color(value);
                    statements.push("color: " + foreground + ";");
                    break;
                case 'background':
                    // do not support background color for now, see bug 18924
                    //let background = new Color(value);
                    //statements.push(`background-color: ${background};`);
                    break;
                case 'fontStyle':
                    var segments = value.split(' ');
                    segments.forEach(function (s) {
                        switch (value) {
                            case 'italic':
                                statements.push("font-style: italic;");
                                break;
                            case 'bold':
                                statements.push("font-weight: bold;");
                                break;
                            case 'underline':
                                statements.push("text-decoration: underline;");
                                break;
                        }
                    });
            }
        }
        return statements.join(' ');
    }
    var className = 'contributedColorTheme';
    function _applyRules(styleSheetContent) {
        var themeStyles = document.head.getElementsByClassName(className);
        if (themeStyles.length === 0) {
            var elStyle = document.createElement('style');
            elStyle.type = 'text/css';
            elStyle.className = className;
            elStyle.innerHTML = styleSheetContent;
            document.head.appendChild(elStyle);
        }
        else {
            themeStyles[0].innerHTML = styleSheetContent;
        }
    }
    var Color = (function () {
        function Color(arg) {
            if (typeof arg === 'string') {
                this.parsed = Color.parse(arg);
            }
            else {
                this.parsed = arg;
            }
            this.str = null;
        }
        Color.parse = function (color) {
            function parseHex(str) {
                return parseInt('0x' + str);
            }
            if (color.charAt(0) === '#' && color.length >= 7) {
                var r = parseHex(color.substr(1, 2));
                var g = parseHex(color.substr(3, 2));
                var b = parseHex(color.substr(5, 2));
                var a = color.length === 9 ? parseHex(color.substr(7, 2)) / 0xff : 1;
                return { r: r, g: g, b: b, a: a };
            }
            return { r: 255, g: 0, b: 0, a: 1 };
        };
        Color.prototype.toString = function () {
            if (!this.str) {
                var p = this.parsed;
                this.str = "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + +p.a.toFixed(2) + ")";
            }
            return this.str;
        };
        Color.prototype.transparent = function (factor) {
            var p = this.parsed;
            return new Color({ r: p.r, g: p.g, b: p.b, a: p.a * factor });
        };
        Color.prototype.opposite = function () {
            return new Color({
                r: 255 - this.parsed.r,
                g: 255 - this.parsed.g,
                b: 255 - this.parsed.b,
                a: this.parsed.a
            });
        };
        return Color;
    }());
});
