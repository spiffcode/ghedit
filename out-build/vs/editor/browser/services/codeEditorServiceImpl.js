var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/objects', 'vs/base/common/strings', 'vs/base/common/uri', 'vs/base/browser/dom', 'vs/editor/common/editorCommon', 'vs/editor/common/services/abstractCodeEditorService'], function (require, exports, objects, strings, uri_1, dom, editorCommon_1, abstractCodeEditorService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var CodeEditorServiceImpl = (function (_super) {
        __extends(CodeEditorServiceImpl, _super);
        function CodeEditorServiceImpl() {
            _super.call(this);
            this._styleSheet = dom.createStyleSheet();
            this._decorationRenderOptions = Object.create(null);
        }
        CodeEditorServiceImpl.prototype.registerDecorationType = function (key, options) {
            if (this._decorationRenderOptions[key]) {
                this._decorationRenderOptions[key].dispose();
                delete this._decorationRenderOptions[key];
            }
            var decorationRenderOptions = new DecorationRenderOptions(this._styleSheet, key, options);
            this._decorationRenderOptions[key] = decorationRenderOptions;
        };
        CodeEditorServiceImpl.prototype.removeDecorationType = function (key) {
            if (this._decorationRenderOptions[key]) {
                this._decorationRenderOptions[key].dispose();
                delete this._decorationRenderOptions[key];
                this.listCodeEditors().forEach(function (ed) { return ed.removeDecorations(key); });
            }
        };
        CodeEditorServiceImpl.prototype.resolveDecorationType = function (key) {
            if (this._decorationRenderOptions[key]) {
                return this._decorationRenderOptions[key];
            }
            throw new Error('Unknown decoration type key: ' + key);
        };
        return CodeEditorServiceImpl;
    }(abstractCodeEditorService_1.AbstractCodeEditorService));
    exports.CodeEditorServiceImpl = CodeEditorServiceImpl;
    var DecorationRenderOptions = (function () {
        function DecorationRenderOptions(styleSheet, key, options) {
            var themedOpts = resolveDecorationRenderOptions(options);
            this._styleSheet = styleSheet;
            this._key = key;
            this.className = DecorationRenderOptions._handle(this._styleSheet, this._key, ModelDecorationCSSRuleType.ClassName, DecorationRenderOptions._getCSSTextForModelDecorationClassName(themedOpts.light), DecorationRenderOptions._getCSSTextForModelDecorationClassName(themedOpts.dark));
            this.inlineClassName = DecorationRenderOptions._handle(this._styleSheet, this._key, ModelDecorationCSSRuleType.InlineClassName, DecorationRenderOptions._getCSSTextForModelDecorationInlineClassName(themedOpts.light), DecorationRenderOptions._getCSSTextForModelDecorationInlineClassName(themedOpts.dark));
            this.glyphMarginClassName = DecorationRenderOptions._handle(this._styleSheet, this._key, ModelDecorationCSSRuleType.GlyphMarginClassName, DecorationRenderOptions._getCSSTextForModelDecorationGlyphMarginClassName(themedOpts.light), DecorationRenderOptions._getCSSTextForModelDecorationGlyphMarginClassName(themedOpts.dark));
            this.isWholeLine = Boolean(options.isWholeLine);
            if (typeof themedOpts.light.overviewRulerColor !== 'undefined'
                || typeof themedOpts.dark.overviewRulerColor !== 'undefined') {
                this.overviewRuler = {
                    color: themedOpts.light.overviewRulerColor || themedOpts.dark.overviewRulerColor,
                    darkColor: themedOpts.dark.overviewRulerColor || themedOpts.light.overviewRulerColor,
                    position: options.overviewRulerLane || editorCommon_1.OverviewRulerLane.Center
                };
            }
        }
        DecorationRenderOptions.prototype.dispose = function () {
            dom.removeCSSRulesWithPrefix(CSSNameHelper.getDeletionPrefixFor(ThemeType.Light, this._key), this._styleSheet);
            dom.removeCSSRulesWithPrefix(CSSNameHelper.getDeletionPrefixFor(ThemeType.Dark, this._key), this._styleSheet);
        };
        /**
         * Build the CSS for decorations styled via `className`.
         */
        DecorationRenderOptions._getCSSTextForModelDecorationClassName = function (opts) {
            var cssTextArr = [];
            if (typeof opts.backgroundColor !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.backgroundColor, opts.backgroundColor));
            }
            if (typeof opts.outlineColor !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.outlineColor, opts.outlineColor));
            }
            if (typeof opts.outlineStyle !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.outlineStyle, opts.outlineStyle));
            }
            if (typeof opts.outlineWidth !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.outlineWidth, opts.outlineWidth));
            }
            if (typeof opts.borderColor !== 'undefined'
                || typeof opts.borderRadius !== 'undefined'
                || typeof opts.borderSpacing !== 'undefined'
                || typeof opts.borderStyle !== 'undefined'
                || typeof opts.borderWidth !== 'undefined') {
                cssTextArr.push(strings.format('box-sizing: border-box;'));
            }
            if (typeof opts.borderColor !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.borderColor, opts.borderColor));
            }
            if (typeof opts.borderRadius !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.borderRadius, opts.borderRadius));
            }
            if (typeof opts.borderSpacing !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.borderSpacing, opts.borderSpacing));
            }
            if (typeof opts.borderStyle !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.borderStyle, opts.borderStyle));
            }
            if (typeof opts.borderWidth !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.borderWidth, opts.borderWidth));
            }
            return cssTextArr.join('');
        };
        /**
         * Build the CSS for decorations styled via `inlineClassName`.
         */
        DecorationRenderOptions._getCSSTextForModelDecorationInlineClassName = function (opts) {
            var cssTextArr = [];
            if (typeof opts.textDecoration !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.textDecoration, opts.textDecoration));
            }
            if (typeof opts.cursor !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.cursor, opts.cursor));
            }
            if (typeof opts.color !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.color, opts.color));
            }
            if (typeof opts.letterSpacing !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.letterSpacing, opts.letterSpacing));
            }
            return cssTextArr.join('');
        };
        /**
         * Build the CSS for decorations styled via `glpyhMarginClassName`.
         */
        DecorationRenderOptions._getCSSTextForModelDecorationGlyphMarginClassName = function (opts) {
            var cssTextArr = [];
            if (typeof opts.gutterIconPath !== 'undefined') {
                cssTextArr.push(strings.format(this._CSS_MAP.gutterIconPath, uri_1.default.file(opts.gutterIconPath).toString()));
            }
            return cssTextArr.join('');
        };
        DecorationRenderOptions._handle = function (styleSheet, key, ruleType, lightCSS, darkCSS) {
            if (lightCSS.length > 0 || darkCSS.length > 0) {
                if (lightCSS.length > 0) {
                    this._createCSSSelector(styleSheet, ThemeType.Light, key, ruleType, lightCSS);
                }
                if (darkCSS.length > 0) {
                    this._createCSSSelector(styleSheet, ThemeType.Dark, key, ruleType, darkCSS);
                }
                return CSSNameHelper.getClassName(key, ruleType);
            }
            return undefined;
        };
        DecorationRenderOptions._createCSSSelector = function (styleSheet, themeType, key, ruleType, cssText) {
            dom.createCSSRule(CSSNameHelper.getSelector(themeType, key, ruleType), cssText, styleSheet);
        };
        DecorationRenderOptions._CSS_MAP = {
            color: 'color:{0} !important;',
            backgroundColor: 'background-color:{0};',
            outlineColor: 'outline-color:{0};',
            outlineStyle: 'outline-style:{0};',
            outlineWidth: 'outline-width:{0};',
            borderColor: 'border-color:{0};',
            borderRadius: 'border-radius:{0};',
            borderSpacing: 'border-spacing:{0};',
            borderStyle: 'border-style:{0};',
            borderWidth: 'border-width:{0};',
            textDecoration: 'text-decoration:{0};',
            cursor: 'cursor:{0};',
            letterSpacing: 'letter-spacing:{0};',
            gutterIconPath: 'background:url(\'{0}\') center center no-repeat;',
        };
        return DecorationRenderOptions;
    }());
    var ThemeType;
    (function (ThemeType) {
        ThemeType[ThemeType["Light"] = 0] = "Light";
        ThemeType[ThemeType["Dark"] = 1] = "Dark";
    })(ThemeType || (ThemeType = {}));
    var ModelDecorationCSSRuleType;
    (function (ModelDecorationCSSRuleType) {
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["ClassName"] = 0] = "ClassName";
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["InlineClassName"] = 1] = "InlineClassName";
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["GlyphMarginClassName"] = 2] = "GlyphMarginClassName";
    })(ModelDecorationCSSRuleType || (ModelDecorationCSSRuleType = {}));
    var CSSNameHelper = (function () {
        function CSSNameHelper() {
        }
        CSSNameHelper._getSelectorPrefixOf = function (theme) {
            if (theme === ThemeType.Light) {
                return '.monaco-editor.vs';
            }
            return '.monaco-editor.vs-dark';
        };
        CSSNameHelper.getClassName = function (key, type) {
            return 'ced-' + key + '-' + type;
        };
        CSSNameHelper.getSelector = function (themeType, key, ruleType) {
            return this._getSelectorPrefixOf(themeType) + ' .' + this.getClassName(key, ruleType);
        };
        CSSNameHelper.getDeletionPrefixFor = function (themeType, key) {
            return this._getSelectorPrefixOf(themeType) + ' .ced-' + key;
        };
        return CSSNameHelper;
    }());
    function resolveDecorationRenderOptions(opts) {
        var light = objects.deepClone(opts);
        objects.mixin(light, opts.light);
        var dark = objects.deepClone(opts);
        objects.mixin(dark, opts.dark);
        return {
            light: light,
            dark: dark
        };
    }
});
