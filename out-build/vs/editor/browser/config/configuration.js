var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/event', 'vs/base/common/lifecycle', 'vs/base/common/platform', 'vs/base/browser/browser', 'vs/base/browser/dom', 'vs/editor/common/config/commonEditorConfig', 'vs/editor/browser/config/elementSizeObserver'], function (require, exports, event_1, lifecycle_1, platform, browser, dom, commonEditorConfig_1, elementSizeObserver_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var CSSBasedConfigurationCache = (function () {
        function CSSBasedConfigurationCache() {
            this._keys = {};
            this._values = {};
        }
        CSSBasedConfigurationCache.prototype.has = function (item) {
            return this._values.hasOwnProperty(CSSBasedConfigurationCache._key(item));
        };
        CSSBasedConfigurationCache.prototype.get = function (item) {
            return this._values[CSSBasedConfigurationCache._key(item)];
        };
        CSSBasedConfigurationCache.prototype.put = function (item, value) {
            this._values[CSSBasedConfigurationCache._key(item)] = value;
        };
        CSSBasedConfigurationCache.prototype.getKeys = function () {
            var r = [];
            for (var key in this._keys) {
                r.push(this._keys[key]);
            }
            return r;
        };
        CSSBasedConfigurationCache._key = function (item) {
            return item.editorClassName + '-' + item.fontFamily + '-' + item.fontSize + '-' + item.lineHeight;
        };
        return CSSBasedConfigurationCache;
    }());
    var CSSBasedConfiguration = (function (_super) {
        __extends(CSSBasedConfiguration, _super);
        function CSSBasedConfiguration() {
            _super.call(this);
            this._changeMonitorTimeout = -1;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._cache = new CSSBasedConfigurationCache();
        }
        CSSBasedConfiguration.prototype.dispose = function () {
            if (this._changeMonitorTimeout !== -1) {
                clearTimeout(this._changeMonitorTimeout);
                this._changeMonitorTimeout = -1;
            }
            _super.prototype.dispose.call(this);
        };
        CSSBasedConfiguration.prototype.readConfiguration = function (editorClassName, fontFamily, fontSize, lineHeight) {
            var styling = {
                editorClassName: editorClassName,
                fontFamily: fontFamily,
                fontSize: fontSize,
                lineHeight: lineHeight
            };
            if (!this._cache.has(styling)) {
                var readConfig = CSSBasedConfiguration._actualReadConfiguration(styling);
                if (readConfig.lineHeight <= 2 || readConfig.typicalHalfwidthCharacterWidth <= 2 || readConfig.typicalFullwidthCharacterWidth <= 2 || readConfig.spaceWidth <= 2 || readConfig.maxDigitWidth <= 2) {
                    // Hey, it's Bug 14341 ... we couldn't read
                    readConfig.lineHeight = Math.max(readConfig.lineHeight, 5);
                    readConfig.typicalHalfwidthCharacterWidth = Math.max(readConfig.typicalHalfwidthCharacterWidth, 5);
                    readConfig.typicalFullwidthCharacterWidth = Math.max(readConfig.typicalFullwidthCharacterWidth, 5);
                    readConfig.spaceWidth = Math.max(readConfig.spaceWidth, 5);
                    readConfig.maxDigitWidth = Math.max(readConfig.maxDigitWidth, 5);
                    this._installChangeMonitor();
                }
                this._cache.put(styling, readConfig);
            }
            return this._cache.get(styling);
        };
        CSSBasedConfiguration.prototype._installChangeMonitor = function () {
            var _this = this;
            if (this._changeMonitorTimeout === -1) {
                this._changeMonitorTimeout = setTimeout(function () {
                    _this._changeMonitorTimeout = -1;
                    _this._monitorForChanges();
                }, 500);
            }
        };
        CSSBasedConfiguration.prototype._monitorForChanges = function () {
            var shouldInstallChangeMonitor = false;
            var keys = this._cache.getKeys();
            for (var i = 0; i < keys.length; i++) {
                var styling = keys[i];
                var newValue = CSSBasedConfiguration._actualReadConfiguration(styling);
                if (newValue.lineHeight <= 2 || newValue.typicalHalfwidthCharacterWidth <= 2 || newValue.typicalFullwidthCharacterWidth <= 2 || newValue.maxDigitWidth <= 2) {
                    // We still couldn't read the CSS config
                    shouldInstallChangeMonitor = true;
                }
                else {
                    this._cache.put(styling, newValue);
                    this._onDidChange.fire();
                }
            }
            if (shouldInstallChangeMonitor) {
                this._installChangeMonitor();
            }
        };
        CSSBasedConfiguration._testElementId = function (index) {
            return 'editorSizeProvider' + index;
        };
        CSSBasedConfiguration._createTestElement = function (index, character) {
            var r = document.createElement('span');
            r.id = this._testElementId(index);
            if (character === ' ') {
                var htmlString = '&nbsp;';
                // Repeat character 256 (2^8) times
                for (var i = 0; i < 8; i++) {
                    htmlString += htmlString;
                }
                r.innerHTML = htmlString;
            }
            else {
                var testString = character;
                // Repeat character 256 (2^8) times
                for (var i = 0; i < 8; i++) {
                    testString += testString;
                }
                r.textContent = testString;
            }
            return r;
        };
        CSSBasedConfiguration._createTestElements = function (styling) {
            var container = document.createElement('div');
            Configuration.applyEditorStyling(container, styling);
            container.style.position = 'absolute';
            container.style.top = '-50000px';
            container.style.width = '50000px';
            for (var i = 0, len = CSSBasedConfiguration._USUAL_CHARS.length; i < len; i++) {
                container.appendChild(document.createElement('br'));
                container.appendChild(this._createTestElement(i, CSSBasedConfiguration._USUAL_CHARS[i]));
            }
            var heightTestElementId = this._testElementId(CSSBasedConfiguration._USUAL_CHARS.length);
            var heightTestElement = document.createElement('div');
            heightTestElement.id = heightTestElementId;
            heightTestElement.appendChild(document.createTextNode('heightTestContent'));
            container.appendChild(document.createElement('br'));
            container.appendChild(heightTestElement);
            return container;
        };
        CSSBasedConfiguration._readFromTestElements = function () {
            var r = [];
            for (var i = 0, len = CSSBasedConfiguration._USUAL_CHARS.length; i < len; i++) {
                r.push(document.getElementById(this._testElementId(i)).offsetWidth / 256);
            }
            return r;
        };
        CSSBasedConfiguration._actualReadConfiguration = function (styling) {
            // Create a test container with all these test elements
            var testContainer = this._createTestElements(styling);
            // Add the container to the DOM
            document.body.appendChild(testContainer);
            // Read various properties
            var usualCharsWidths = this._readFromTestElements();
            var firstTestElement = document.getElementById(this._testElementId(0));
            var computedStyle = dom.getComputedStyle(firstTestElement);
            var result_font = this._getFontFromComputedStyle(computedStyle);
            var result_fontSize = computedStyle ? parseInt(computedStyle.fontSize, 10) : 0;
            var heightTestElement = document.getElementById(this._testElementId(CSSBasedConfiguration._USUAL_CHARS.length));
            var result_lineHeight = heightTestElement.clientHeight;
            // Remove the container from the DOM
            document.body.removeChild(testContainer);
            // Find maximum digit width and thinnest character width
            var maxDigitWidth = 0;
            var typicalHalfwidthCharacterWidth = 0;
            var typicalFullwidthCharacterWidth = 0;
            var spaceWidth = 0;
            for (var i = 0, len = CSSBasedConfiguration._USUAL_CHARS.length; i < len; i++) {
                var character = CSSBasedConfiguration._USUAL_CHARS.charAt(i);
                if (character >= '0' && character <= '9') {
                    maxDigitWidth = Math.max(maxDigitWidth, usualCharsWidths[i]);
                }
                else if (character === CSSBasedConfiguration._HALF_WIDTH_TYPICAL) {
                    typicalHalfwidthCharacterWidth = usualCharsWidths[i];
                }
                else if (character === CSSBasedConfiguration._FULL_WIDTH_TYPICAL) {
                    typicalFullwidthCharacterWidth = usualCharsWidths[i];
                }
                else if (character === CSSBasedConfiguration._SPACE) {
                    spaceWidth = usualCharsWidths[i];
                }
            }
            return {
                typicalHalfwidthCharacterWidth: typicalHalfwidthCharacterWidth,
                typicalFullwidthCharacterWidth: typicalFullwidthCharacterWidth,
                spaceWidth: spaceWidth,
                maxDigitWidth: maxDigitWidth,
                lineHeight: result_lineHeight,
                font: result_font,
                fontSize: result_fontSize
            };
        };
        CSSBasedConfiguration._getFontFromComputedStyle = function (computedStyle) {
            if (!computedStyle) {
                return 'unknown';
            }
            if (computedStyle.font) {
                return computedStyle.font;
            }
            return (computedStyle.fontFamily + ' ' +
                computedStyle.fontSize + ' ' +
                computedStyle.fontSizeAdjust + ' ' +
                computedStyle.fontStretch + ' ' +
                computedStyle.fontStyle + ' ' +
                computedStyle.fontVariant + ' ' +
                computedStyle.fontWeight + ' ');
        };
        CSSBasedConfiguration.INSTANCE = new CSSBasedConfiguration();
        CSSBasedConfiguration._HALF_WIDTH_TYPICAL = 'n';
        CSSBasedConfiguration._FULL_WIDTH_TYPICAL = '\uff4d';
        CSSBasedConfiguration._SPACE = ' ';
        CSSBasedConfiguration._USUAL_CHARS = '0123456789' + CSSBasedConfiguration._HALF_WIDTH_TYPICAL + CSSBasedConfiguration._FULL_WIDTH_TYPICAL + CSSBasedConfiguration._SPACE;
        return CSSBasedConfiguration;
    }(lifecycle_1.Disposable));
    var Configuration = (function (_super) {
        __extends(Configuration, _super);
        function Configuration(options, referenceDomElement) {
            var _this = this;
            if (referenceDomElement === void 0) { referenceDomElement = null; }
            _super.call(this, options, new elementSizeObserver_1.ElementSizeObserver(referenceDomElement, function () { return _this._onReferenceDomElementSizeChanged(); }));
            this._register(CSSBasedConfiguration.INSTANCE.onDidChange(function () { return function () { return _this._onCSSBasedConfigurationChanged(); }; }));
            if (this._configWithDefaults.getEditorOptions().automaticLayout) {
                this._elementSizeObserver.startObserving();
            }
        }
        Configuration.applyEditorStyling = function (domNode, styling) {
            domNode.className = styling.editorClassName;
            if (styling.fontFamily && styling.fontFamily.length > 0) {
                domNode.style.fontFamily = styling.fontFamily;
            }
            else {
                domNode.style.fontFamily = '';
            }
            if (styling.fontSize > 0) {
                domNode.style.fontSize = styling.fontSize + 'px';
            }
            else {
                domNode.style.fontSize = '';
            }
            if (styling.lineHeight > 0) {
                domNode.style.lineHeight = styling.lineHeight + 'px';
            }
            else {
                domNode.style.lineHeight = '';
            }
        };
        Configuration.prototype._onReferenceDomElementSizeChanged = function () {
            this._recomputeOptions();
        };
        Configuration.prototype._onCSSBasedConfigurationChanged = function () {
            this._recomputeOptions();
        };
        Configuration.prototype.observeReferenceElement = function (dimension) {
            this._elementSizeObserver.observe(dimension);
        };
        Configuration.prototype.dispose = function () {
            this._elementSizeObserver.dispose();
            _super.prototype.dispose.call(this);
        };
        Configuration.prototype._getEditorClassName = function (theme, fontLigatures) {
            var extra = '';
            if (browser.isIE11orEarlier) {
                extra += 'ie ';
            }
            else if (browser.isFirefox) {
                extra += 'ff ';
            }
            if (browser.isIE9) {
                extra += 'ie9 ';
            }
            if (platform.isMacintosh) {
                extra += 'mac ';
            }
            if (fontLigatures) {
                extra += 'enable-ligatures ';
            }
            return 'monaco-editor ' + extra + theme;
        };
        Configuration.prototype.getOuterWidth = function () {
            return this._elementSizeObserver.getWidth();
        };
        Configuration.prototype.getOuterHeight = function () {
            return this._elementSizeObserver.getHeight();
        };
        Configuration.prototype.readConfiguration = function (editorClassName, fontFamily, fontSize, lineHeight) {
            return CSSBasedConfiguration.INSTANCE.readConfiguration(editorClassName, fontFamily, fontSize, lineHeight);
        };
        return Configuration;
    }(commonEditorConfig_1.CommonEditorConfiguration));
    exports.Configuration = Configuration;
});
