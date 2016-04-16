var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/event', 'vs/base/common/lifecycle', 'vs/base/common/objects', 'vs/base/common/platform', 'vs/platform/configuration/common/configurationRegistry', 'vs/platform/platform', 'vs/editor/common/config/defaultConfig', 'vs/editor/common/controller/handlerDispatcher', 'vs/editor/common/editorCommon', 'vs/editor/common/viewLayout/editorLayoutProvider'], function (require, exports, nls, event_1, lifecycle_1, objects, platform, configurationRegistry_1, platform_1, defaultConfig_1, handlerDispatcher_1, editorCommon, editorLayoutProvider_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Experimental screen reader support toggle
     */
    var GlobalScreenReaderNVDA = (function () {
        function GlobalScreenReaderNVDA() {
        }
        GlobalScreenReaderNVDA.getValue = function () {
            return this._value;
        };
        GlobalScreenReaderNVDA.setValue = function (value) {
            if (this._value === value) {
                return;
            }
            this._value = value;
            this._onChange.fire(this._value);
        };
        GlobalScreenReaderNVDA._value = false;
        GlobalScreenReaderNVDA._onChange = new event_1.Emitter();
        GlobalScreenReaderNVDA.onChange = GlobalScreenReaderNVDA._onChange.event;
        return GlobalScreenReaderNVDA;
    }());
    exports.GlobalScreenReaderNVDA = GlobalScreenReaderNVDA;
    var ConfigurationWithDefaults = (function () {
        function ConfigurationWithDefaults(options) {
            this._editor = objects.clone(defaultConfig_1.DefaultConfig.editor);
            this._mergeOptionsIn(options);
        }
        ConfigurationWithDefaults.prototype.getEditorOptions = function () {
            return this._editor;
        };
        ConfigurationWithDefaults.prototype._mergeOptionsIn = function (newOptions) {
            this._editor = objects.mixin(this._editor, newOptions || {});
        };
        ConfigurationWithDefaults.prototype.updateOptions = function (newOptions) {
            // Apply new options
            this._mergeOptionsIn(newOptions);
        };
        return ConfigurationWithDefaults;
    }());
    exports.ConfigurationWithDefaults = ConfigurationWithDefaults;
    var InternalEditorOptions = (function () {
        function InternalEditorOptions(input) {
            this.experimentalScreenReader = Boolean(input.experimentalScreenReader);
            this.rulers = Array.prototype.slice.call(input.rulers, 0);
            this.wordSeparators = String(input.wordSeparators);
            this.selectionClipboard = Boolean(input.selectionClipboard);
            this.ariaLabel = String(input.ariaLabel);
            this.lineNumbers = input.lineNumbers || false;
            this.selectOnLineNumbers = Boolean(input.selectOnLineNumbers);
            this.glyphMargin = Boolean(input.glyphMargin);
            this.revealHorizontalRightPadding = Number(input.revealHorizontalRightPadding) | 0;
            this.roundedSelection = Boolean(input.roundedSelection);
            this.theme = String(input.theme);
            this.readOnly = Boolean(input.readOnly);
            this.scrollbar = {
                arrowSize: Number(input.scrollbar.arrowSize) | 0,
                vertical: String(input.scrollbar.vertical),
                horizontal: String(input.scrollbar.horizontal),
                useShadows: Boolean(input.scrollbar.useShadows),
                verticalHasArrows: Boolean(input.scrollbar.verticalHasArrows),
                horizontalHasArrows: Boolean(input.scrollbar.horizontalHasArrows),
                handleMouseWheel: Boolean(input.scrollbar.handleMouseWheel),
                horizontalScrollbarSize: Number(input.scrollbar.horizontalScrollbarSize) | 0,
                horizontalSliderSize: Number(input.scrollbar.horizontalSliderSize) | 0,
                verticalScrollbarSize: Number(input.scrollbar.verticalScrollbarSize) | 0,
                verticalSliderSize: Number(input.scrollbar.verticalSliderSize) | 0,
                mouseWheelScrollSensitivity: Number(input.scrollbar.mouseWheelScrollSensitivity) | 0,
            };
            this.overviewRulerLanes = Number(input.overviewRulerLanes) | 0;
            this.cursorBlinking = String(input.cursorBlinking);
            this.cursorStyle = Number(input.cursorStyle) | 0;
            this.fontLigatures = Boolean(input.fontLigatures);
            this.hideCursorInOverviewRuler = Boolean(input.hideCursorInOverviewRuler);
            this.scrollBeyondLastLine = Boolean(input.scrollBeyondLastLine);
            this.wrappingIndent = String(input.wrappingIndent);
            this.wordWrapBreakBeforeCharacters = String(input.wordWrapBreakBeforeCharacters);
            this.wordWrapBreakAfterCharacters = String(input.wordWrapBreakAfterCharacters);
            this.wordWrapBreakObtrusiveCharacters = String(input.wordWrapBreakObtrusiveCharacters);
            this.tabFocusMode = Boolean(input.tabFocusMode);
            this.stopLineTokenizationAfter = Number(input.stopLineTokenizationAfter) | 0;
            this.stopRenderingLineAfter = Number(input.stopRenderingLineAfter) | 0;
            this.longLineBoundary = Number(input.longLineBoundary) | 0;
            this.forcedTokenizationBoundary = Number(input.forcedTokenizationBoundary) | 0;
            this.hover = Boolean(input.hover);
            this.contextmenu = Boolean(input.contextmenu);
            this.quickSuggestions = Boolean(input.quickSuggestions);
            this.quickSuggestionsDelay = Number(input.quickSuggestionsDelay) | 0;
            this.iconsInSuggestions = Boolean(input.iconsInSuggestions);
            this.autoClosingBrackets = Boolean(input.autoClosingBrackets);
            this.formatOnType = Boolean(input.formatOnType);
            this.suggestOnTriggerCharacters = Boolean(input.suggestOnTriggerCharacters);
            this.acceptSuggestionOnEnter = Boolean(input.acceptSuggestionOnEnter);
            this.selectionHighlight = Boolean(input.selectionHighlight);
            this.outlineMarkers = Boolean(input.outlineMarkers);
            this.referenceInfos = Boolean(input.referenceInfos);
            this.folding = Boolean(input.folding);
            this.renderWhitespace = Boolean(input.renderWhitespace);
            this.indentGuides = Boolean(input.indentGuides);
            this.layoutInfo = {
                width: Number(input.layoutInfo.width) | 0,
                height: Number(input.layoutInfo.height) | 0,
                glyphMarginLeft: Number(input.layoutInfo.glyphMarginLeft) | 0,
                glyphMarginWidth: Number(input.layoutInfo.glyphMarginWidth) | 0,
                glyphMarginHeight: Number(input.layoutInfo.glyphMarginHeight) | 0,
                lineNumbersLeft: Number(input.layoutInfo.lineNumbersLeft) | 0,
                lineNumbersWidth: Number(input.layoutInfo.lineNumbersWidth) | 0,
                lineNumbersHeight: Number(input.layoutInfo.lineNumbersHeight) | 0,
                decorationsLeft: Number(input.layoutInfo.decorationsLeft) | 0,
                decorationsWidth: Number(input.layoutInfo.decorationsWidth) | 0,
                decorationsHeight: Number(input.layoutInfo.decorationsHeight) | 0,
                contentLeft: Number(input.layoutInfo.contentLeft) | 0,
                contentWidth: Number(input.layoutInfo.contentWidth) | 0,
                contentHeight: Number(input.layoutInfo.contentHeight) | 0,
                verticalScrollbarWidth: Number(input.layoutInfo.verticalScrollbarWidth) | 0,
                horizontalScrollbarHeight: Number(input.layoutInfo.horizontalScrollbarHeight) | 0,
                overviewRuler: {
                    width: Number(input.layoutInfo.overviewRuler.width) | 0,
                    height: Number(input.layoutInfo.overviewRuler.height) | 0,
                    top: Number(input.layoutInfo.overviewRuler.top) | 0,
                    right: Number(input.layoutInfo.overviewRuler.right) | 0,
                }
            };
            this.stylingInfo = {
                editorClassName: String(input.stylingInfo.editorClassName),
                fontFamily: String(input.stylingInfo.fontFamily),
                fontSize: Number(input.stylingInfo.fontSize) | 0,
                lineHeight: Number(input.stylingInfo.lineHeight) | 0,
            };
            this.wrappingInfo = {
                isViewportWrapping: Boolean(input.wrappingInfo.isViewportWrapping),
                wrappingColumn: Number(input.wrappingInfo.wrappingColumn) | 0,
            };
            this.observedOuterWidth = Number(input.observedOuterWidth) | 0;
            this.observedOuterHeight = Number(input.observedOuterHeight) | 0;
            this.lineHeight = Number(input.lineHeight) | 0;
            this.pageSize = Number(input.pageSize) | 0;
            this.typicalHalfwidthCharacterWidth = Number(input.typicalHalfwidthCharacterWidth);
            this.typicalFullwidthCharacterWidth = Number(input.typicalFullwidthCharacterWidth);
            this.spaceWidth = Number(input.spaceWidth);
            this.fontSize = Number(input.fontSize) | 0;
        }
        return InternalEditorOptions;
    }());
    exports.InternalEditorOptions = InternalEditorOptions;
    var InternalEditorOptionsHelper = (function () {
        function InternalEditorOptionsHelper() {
        }
        InternalEditorOptionsHelper.createInternalEditorOptions = function (outerWidth, outerHeight, opts, editorClassName, requestedFontFamily, requestedFontSize, requestedLineHeight, adjustedLineHeight, themeOpts, isDominatedByLongLines, lineCount) {
            var wrappingColumn = toInteger(opts.wrappingColumn, -1);
            var stopLineTokenizationAfter;
            if (typeof opts.stopLineTokenizationAfter !== 'undefined') {
                stopLineTokenizationAfter = toInteger(opts.stopLineTokenizationAfter, -1);
            }
            else if (wrappingColumn >= 0) {
                stopLineTokenizationAfter = -1;
            }
            else {
                stopLineTokenizationAfter = 10000;
            }
            var stopRenderingLineAfter;
            if (typeof opts.stopRenderingLineAfter !== 'undefined') {
                stopRenderingLineAfter = toInteger(opts.stopRenderingLineAfter, -1);
            }
            else if (wrappingColumn >= 0) {
                stopRenderingLineAfter = -1;
            }
            else {
                stopRenderingLineAfter = 10000;
            }
            var mouseWheelScrollSensitivity = toFloat(opts.mouseWheelScrollSensitivity, 1);
            var scrollbar = this._sanitizeScrollbarOpts(opts.scrollbar, mouseWheelScrollSensitivity);
            var glyphMargin = toBoolean(opts.glyphMargin);
            var lineNumbers = opts.lineNumbers;
            var lineNumbersMinChars = toInteger(opts.lineNumbersMinChars, 1);
            var lineDecorationsWidth = toInteger(opts.lineDecorationsWidth, 0);
            if (opts.folding) {
                lineDecorationsWidth += 16;
            }
            var layoutInfo = editorLayoutProvider_1.EditorLayoutProvider.compute({
                outerWidth: outerWidth,
                outerHeight: outerHeight,
                showGlyphMargin: glyphMargin,
                lineHeight: themeOpts.lineHeight,
                showLineNumbers: !!lineNumbers,
                lineNumbersMinChars: lineNumbersMinChars,
                lineDecorationsWidth: lineDecorationsWidth,
                maxDigitWidth: themeOpts.maxDigitWidth,
                lineCount: lineCount,
                verticalScrollbarWidth: scrollbar.verticalScrollbarSize,
                horizontalScrollbarHeight: scrollbar.horizontalScrollbarSize,
                scrollbarArrowSize: scrollbar.arrowSize,
                verticalScrollbarHasArrows: scrollbar.verticalHasArrows
            });
            var pageSize = Math.floor(layoutInfo.height / themeOpts.lineHeight) - 2;
            if (isDominatedByLongLines && wrappingColumn > 0) {
                // Force viewport width wrapping if model is dominated by long lines
                wrappingColumn = 0;
            }
            var wrappingInfo;
            if (wrappingColumn === 0) {
                // If viewport width wrapping is enabled
                wrappingInfo = {
                    isViewportWrapping: true,
                    wrappingColumn: Math.max(1, Math.floor((layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth) / themeOpts.typicalHalfwidthCharacterWidth))
                };
            }
            else if (wrappingColumn > 0) {
                // Wrapping is enabled
                wrappingInfo = {
                    isViewportWrapping: false,
                    wrappingColumn: wrappingColumn
                };
            }
            else {
                wrappingInfo = {
                    isViewportWrapping: false,
                    wrappingColumn: -1
                };
            }
            var readOnly = toBoolean(opts.readOnly);
            var tabFocusMode = toBoolean(opts.tabFocusMode);
            if (readOnly) {
                tabFocusMode = true;
            }
            return {
                // ---- Options that are transparent - get no massaging
                lineNumbers: lineNumbers,
                selectOnLineNumbers: toBoolean(opts.selectOnLineNumbers),
                glyphMargin: glyphMargin,
                revealHorizontalRightPadding: toInteger(opts.revealHorizontalRightPadding, 0),
                roundedSelection: toBoolean(opts.roundedSelection),
                theme: opts.theme,
                readOnly: readOnly,
                scrollbar: scrollbar,
                overviewRulerLanes: toInteger(opts.overviewRulerLanes, 0, 3),
                cursorBlinking: opts.cursorBlinking,
                experimentalScreenReader: toBoolean(opts.experimentalScreenReader),
                rulers: toSortedIntegerArray(opts.rulers),
                wordSeparators: String(opts.wordSeparators),
                selectionClipboard: toBoolean(opts.selectionClipboard),
                ariaLabel: String(opts.ariaLabel),
                cursorStyle: editorCommon.cursorStyleFromString(opts.cursorStyle),
                fontLigatures: toBoolean(opts.fontLigatures),
                hideCursorInOverviewRuler: toBoolean(opts.hideCursorInOverviewRuler),
                scrollBeyondLastLine: toBoolean(opts.scrollBeyondLastLine),
                wrappingIndent: opts.wrappingIndent,
                wordWrapBreakBeforeCharacters: opts.wordWrapBreakBeforeCharacters,
                wordWrapBreakAfterCharacters: opts.wordWrapBreakAfterCharacters,
                wordWrapBreakObtrusiveCharacters: opts.wordWrapBreakObtrusiveCharacters,
                tabFocusMode: tabFocusMode,
                stopLineTokenizationAfter: stopLineTokenizationAfter,
                stopRenderingLineAfter: stopRenderingLineAfter,
                longLineBoundary: toInteger(opts.longLineBoundary),
                forcedTokenizationBoundary: toInteger(opts.forcedTokenizationBoundary),
                hover: toBoolean(opts.hover),
                contextmenu: toBoolean(opts.contextmenu),
                quickSuggestions: toBoolean(opts.quickSuggestions),
                quickSuggestionsDelay: toInteger(opts.quickSuggestionsDelay),
                iconsInSuggestions: toBoolean(opts.iconsInSuggestions),
                autoClosingBrackets: toBoolean(opts.autoClosingBrackets),
                formatOnType: toBoolean(opts.formatOnType),
                suggestOnTriggerCharacters: toBoolean(opts.suggestOnTriggerCharacters),
                acceptSuggestionOnEnter: toBoolean(opts.acceptSuggestionOnEnter),
                selectionHighlight: toBoolean(opts.selectionHighlight),
                outlineMarkers: toBoolean(opts.outlineMarkers),
                referenceInfos: toBoolean(opts.referenceInfos),
                folding: toBoolean(opts.folding),
                renderWhitespace: toBoolean(opts.renderWhitespace),
                indentGuides: toBoolean(opts.indentGuides),
                layoutInfo: layoutInfo,
                stylingInfo: {
                    editorClassName: editorClassName,
                    fontFamily: requestedFontFamily,
                    fontSize: requestedFontSize,
                    lineHeight: adjustedLineHeight
                },
                wrappingInfo: wrappingInfo,
                observedOuterWidth: outerWidth,
                observedOuterHeight: outerHeight,
                lineHeight: themeOpts.lineHeight,
                pageSize: pageSize,
                typicalHalfwidthCharacterWidth: themeOpts.typicalHalfwidthCharacterWidth,
                typicalFullwidthCharacterWidth: themeOpts.typicalFullwidthCharacterWidth,
                spaceWidth: themeOpts.spaceWidth,
                fontSize: themeOpts.fontSize,
            };
        };
        InternalEditorOptionsHelper._sanitizeScrollbarOpts = function (raw, mouseWheelScrollSensitivity) {
            var horizontalScrollbarSize = toIntegerWithDefault(raw.horizontalScrollbarSize, 10);
            var verticalScrollbarSize = toIntegerWithDefault(raw.verticalScrollbarSize, 14);
            return {
                vertical: toStringSet(raw.vertical, ['auto', 'visible', 'hidden'], 'auto'),
                horizontal: toStringSet(raw.horizontal, ['auto', 'visible', 'hidden'], 'auto'),
                arrowSize: toIntegerWithDefault(raw.arrowSize, 11),
                useShadows: toBooleanWithDefault(raw.useShadows, true),
                verticalHasArrows: toBooleanWithDefault(raw.verticalHasArrows, false),
                horizontalHasArrows: toBooleanWithDefault(raw.horizontalHasArrows, false),
                horizontalScrollbarSize: horizontalScrollbarSize,
                horizontalSliderSize: toIntegerWithDefault(raw.horizontalSliderSize, horizontalScrollbarSize),
                verticalScrollbarSize: verticalScrollbarSize,
                verticalSliderSize: toIntegerWithDefault(raw.verticalSliderSize, verticalScrollbarSize),
                handleMouseWheel: toBooleanWithDefault(raw.handleMouseWheel, true),
                mouseWheelScrollSensitivity: mouseWheelScrollSensitivity
            };
        };
        InternalEditorOptionsHelper.createConfigurationChangedEvent = function (prevOpts, newOpts) {
            return {
                experimentalScreenReader: (prevOpts.experimentalScreenReader !== newOpts.experimentalScreenReader),
                rulers: (!this._numberArraysEqual(prevOpts.rulers, newOpts.rulers)),
                wordSeparators: (prevOpts.wordSeparators !== newOpts.wordSeparators),
                selectionClipboard: (prevOpts.selectionClipboard !== newOpts.selectionClipboard),
                ariaLabel: (prevOpts.ariaLabel !== newOpts.ariaLabel),
                lineNumbers: (prevOpts.lineNumbers !== newOpts.lineNumbers),
                selectOnLineNumbers: (prevOpts.selectOnLineNumbers !== newOpts.selectOnLineNumbers),
                glyphMargin: (prevOpts.glyphMargin !== newOpts.glyphMargin),
                revealHorizontalRightPadding: (prevOpts.revealHorizontalRightPadding !== newOpts.revealHorizontalRightPadding),
                roundedSelection: (prevOpts.roundedSelection !== newOpts.roundedSelection),
                theme: (prevOpts.theme !== newOpts.theme),
                readOnly: (prevOpts.readOnly !== newOpts.readOnly),
                scrollbar: (!this._scrollbarOptsEqual(prevOpts.scrollbar, newOpts.scrollbar)),
                overviewRulerLanes: (prevOpts.overviewRulerLanes !== newOpts.overviewRulerLanes),
                cursorBlinking: (prevOpts.cursorBlinking !== newOpts.cursorBlinking),
                cursorStyle: (prevOpts.cursorStyle !== newOpts.cursorStyle),
                fontLigatures: (prevOpts.fontLigatures !== newOpts.fontLigatures),
                hideCursorInOverviewRuler: (prevOpts.hideCursorInOverviewRuler !== newOpts.hideCursorInOverviewRuler),
                scrollBeyondLastLine: (prevOpts.scrollBeyondLastLine !== newOpts.scrollBeyondLastLine),
                wrappingIndent: (prevOpts.wrappingIndent !== newOpts.wrappingIndent),
                wordWrapBreakBeforeCharacters: (prevOpts.wordWrapBreakBeforeCharacters !== newOpts.wordWrapBreakBeforeCharacters),
                wordWrapBreakAfterCharacters: (prevOpts.wordWrapBreakAfterCharacters !== newOpts.wordWrapBreakAfterCharacters),
                wordWrapBreakObtrusiveCharacters: (prevOpts.wordWrapBreakObtrusiveCharacters !== newOpts.wordWrapBreakObtrusiveCharacters),
                tabFocusMode: (prevOpts.tabFocusMode !== newOpts.tabFocusMode),
                stopLineTokenizationAfter: (prevOpts.stopLineTokenizationAfter !== newOpts.stopLineTokenizationAfter),
                stopRenderingLineAfter: (prevOpts.stopRenderingLineAfter !== newOpts.stopRenderingLineAfter),
                longLineBoundary: (prevOpts.longLineBoundary !== newOpts.longLineBoundary),
                forcedTokenizationBoundary: (prevOpts.forcedTokenizationBoundary !== newOpts.forcedTokenizationBoundary),
                hover: (prevOpts.hover !== newOpts.hover),
                contextmenu: (prevOpts.contextmenu !== newOpts.contextmenu),
                quickSuggestions: (prevOpts.quickSuggestions !== newOpts.quickSuggestions),
                quickSuggestionsDelay: (prevOpts.quickSuggestionsDelay !== newOpts.quickSuggestionsDelay),
                iconsInSuggestions: (prevOpts.iconsInSuggestions !== newOpts.iconsInSuggestions),
                autoClosingBrackets: (prevOpts.autoClosingBrackets !== newOpts.autoClosingBrackets),
                formatOnType: (prevOpts.formatOnType !== newOpts.formatOnType),
                suggestOnTriggerCharacters: (prevOpts.suggestOnTriggerCharacters !== newOpts.suggestOnTriggerCharacters),
                selectionHighlight: (prevOpts.selectionHighlight !== newOpts.selectionHighlight),
                outlineMarkers: (prevOpts.outlineMarkers !== newOpts.outlineMarkers),
                referenceInfos: (prevOpts.referenceInfos !== newOpts.referenceInfos),
                folding: (prevOpts.folding !== newOpts.folding),
                renderWhitespace: (prevOpts.renderWhitespace !== newOpts.renderWhitespace),
                indentGuides: (prevOpts.indentGuides !== newOpts.indentGuides),
                layoutInfo: (!editorLayoutProvider_1.EditorLayoutProvider.layoutEqual(prevOpts.layoutInfo, newOpts.layoutInfo)),
                stylingInfo: (!this._stylingInfoEqual(prevOpts.stylingInfo, newOpts.stylingInfo)),
                wrappingInfo: (!this._wrappingInfoEqual(prevOpts.wrappingInfo, newOpts.wrappingInfo)),
                observedOuterWidth: (prevOpts.observedOuterWidth !== newOpts.observedOuterWidth),
                observedOuterHeight: (prevOpts.observedOuterHeight !== newOpts.observedOuterHeight),
                lineHeight: (prevOpts.lineHeight !== newOpts.lineHeight),
                pageSize: (prevOpts.pageSize !== newOpts.pageSize),
                typicalHalfwidthCharacterWidth: (prevOpts.typicalHalfwidthCharacterWidth !== newOpts.typicalHalfwidthCharacterWidth),
                typicalFullwidthCharacterWidth: (prevOpts.typicalFullwidthCharacterWidth !== newOpts.typicalFullwidthCharacterWidth),
                spaceWidth: (prevOpts.spaceWidth !== newOpts.spaceWidth),
                fontSize: (prevOpts.fontSize !== newOpts.fontSize)
            };
        };
        InternalEditorOptionsHelper._scrollbarOptsEqual = function (a, b) {
            return (a.arrowSize === b.arrowSize
                && a.vertical === b.vertical
                && a.horizontal === b.horizontal
                && a.useShadows === b.useShadows
                && a.verticalHasArrows === b.verticalHasArrows
                && a.horizontalHasArrows === b.horizontalHasArrows
                && a.handleMouseWheel === b.handleMouseWheel
                && a.horizontalScrollbarSize === b.horizontalScrollbarSize
                && a.horizontalSliderSize === b.horizontalSliderSize
                && a.verticalScrollbarSize === b.verticalScrollbarSize
                && a.verticalSliderSize === b.verticalSliderSize
                && a.mouseWheelScrollSensitivity === b.mouseWheelScrollSensitivity);
        };
        InternalEditorOptionsHelper._stylingInfoEqual = function (a, b) {
            return (a.editorClassName === b.editorClassName
                && a.fontFamily === b.fontFamily
                && a.fontSize === b.fontSize
                && a.lineHeight === b.lineHeight);
        };
        InternalEditorOptionsHelper._wrappingInfoEqual = function (a, b) {
            return (a.isViewportWrapping === b.isViewportWrapping
                && a.wrappingColumn === b.wrappingColumn);
        };
        InternalEditorOptionsHelper._numberArraysEqual = function (a, b) {
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        };
        return InternalEditorOptionsHelper;
    }());
    function toBoolean(value) {
        return value === 'false' ? false : Boolean(value);
    }
    function toBooleanWithDefault(value, defaultValue) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        return toBoolean(value);
    }
    function toFloat(source, defaultValue) {
        var r = parseFloat(source);
        if (isNaN(r)) {
            r = defaultValue;
        }
        return r;
    }
    function toInteger(source, minimum, maximum) {
        var r = parseInt(source, 10);
        if (isNaN(r)) {
            r = 0;
        }
        if (typeof minimum === 'number') {
            r = Math.max(minimum, r);
        }
        if (typeof maximum === 'number') {
            r = Math.min(maximum, r);
        }
        return r;
    }
    function toSortedIntegerArray(source) {
        if (!Array.isArray(source)) {
            return [];
        }
        var arrSource = source;
        var r = arrSource.map(function (el) { return toInteger(el); });
        r.sort();
        return r;
    }
    function toIntegerWithDefault(source, defaultValue) {
        if (typeof source === 'undefined') {
            return defaultValue;
        }
        return toInteger(source);
    }
    function toStringSet(source, allowedValues, defaultValue) {
        if (typeof source !== 'string') {
            return defaultValue;
        }
        if (allowedValues.indexOf(source) === -1) {
            return defaultValue;
        }
        return source;
    }
    var CommonEditorConfiguration = (function (_super) {
        __extends(CommonEditorConfiguration, _super);
        function CommonEditorConfiguration(options, elementSizeObserver) {
            if (elementSizeObserver === void 0) { elementSizeObserver = null; }
            _super.call(this);
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._configWithDefaults = new ConfigurationWithDefaults(options);
            this._elementSizeObserver = elementSizeObserver;
            this._isDominatedByLongLines = false;
            this._lineCount = 1;
            this.handlerDispatcher = new handlerDispatcher_1.HandlerDispatcher();
            this.editor = this._computeInternalOptions();
            this.editorClone = new InternalEditorOptions(this.editor);
        }
        CommonEditorConfiguration.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        CommonEditorConfiguration.prototype._recomputeOptions = function () {
            var oldOpts = this.editor;
            this.editor = this._computeInternalOptions();
            this.editorClone = new InternalEditorOptions(this.editor);
            var changeEvent = InternalEditorOptionsHelper.createConfigurationChangedEvent(oldOpts, this.editor);
            var hasChanged = false;
            var keys = Object.keys(changeEvent);
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                if (changeEvent[key]) {
                    hasChanged = true;
                    break;
                }
            }
            if (hasChanged) {
                this._onDidChange.fire(changeEvent);
            }
        };
        CommonEditorConfiguration.prototype.getRawOptions = function () {
            return this._configWithDefaults.getEditorOptions();
        };
        CommonEditorConfiguration.prototype._computeInternalOptions = function () {
            var opts = this._configWithDefaults.getEditorOptions();
            var editorClassName = this._getEditorClassName(opts.theme, toBoolean(opts.fontLigatures));
            var requestedFontFamily = opts.fontFamily || '';
            var requestedFontSize = toInteger(opts.fontSize, 0, 100);
            var requestedLineHeight = toInteger(opts.lineHeight, 0, 150);
            var adjustedLineHeight = requestedLineHeight;
            if (requestedFontSize > 0 && requestedLineHeight === 0) {
                adjustedLineHeight = Math.round(1.3 * requestedFontSize);
            }
            var result = InternalEditorOptionsHelper.createInternalEditorOptions(this.getOuterWidth(), this.getOuterHeight(), opts, editorClassName, requestedFontFamily, requestedFontSize, requestedLineHeight, adjustedLineHeight, this.readConfiguration(editorClassName, requestedFontFamily, requestedFontSize, adjustedLineHeight), this._isDominatedByLongLines, this._lineCount);
            return new InternalEditorOptions(result);
        };
        CommonEditorConfiguration.prototype.updateOptions = function (newOptions) {
            this._configWithDefaults.updateOptions(newOptions);
            this._recomputeOptions();
        };
        CommonEditorConfiguration.prototype.setIsDominatedByLongLines = function (isDominatedByLongLines) {
            this._isDominatedByLongLines = isDominatedByLongLines;
            this._recomputeOptions();
        };
        CommonEditorConfiguration.prototype.setLineCount = function (lineCount) {
            this._lineCount = lineCount;
            this._recomputeOptions();
        };
        return CommonEditorConfiguration;
    }(lifecycle_1.Disposable));
    exports.CommonEditorConfiguration = CommonEditorConfiguration;
    /**
     * Helper to update Monaco Editor Settings from configurations service.
     */
    var EditorConfiguration = (function () {
        function EditorConfiguration() {
        }
        EditorConfiguration.apply = function (config, editorOrArray) {
            if (!config) {
                return;
            }
            var editors = editorOrArray;
            if (!Array.isArray(editorOrArray)) {
                editors = [editorOrArray];
            }
            for (var i = 0; i < editors.length; i++) {
                var editor = editors[i];
                // Editor Settings (Code Editor, Diff, Terminal)
                if (editor && typeof editor.updateOptions === 'function') {
                    var type = editor.getEditorType();
                    if (type !== editorCommon.EditorType.ICodeEditor && type !== editorCommon.EditorType.IDiffEditor) {
                        continue;
                    }
                    var editorConfig = config[EditorConfiguration.EDITOR_SECTION];
                    if (type === editorCommon.EditorType.IDiffEditor) {
                        var diffEditorConfig = config[EditorConfiguration.DIFF_EDITOR_SECTION];
                        if (diffEditorConfig) {
                            if (!editorConfig) {
                                editorConfig = diffEditorConfig;
                            }
                            else {
                                editorConfig = objects.mixin(editorConfig, diffEditorConfig);
                            }
                        }
                    }
                    if (editorConfig) {
                        delete editorConfig.readOnly; // Prevent someone from making editor readonly
                        editor.updateOptions(editorConfig);
                    }
                }
            }
        };
        EditorConfiguration.EDITOR_SECTION = 'editor';
        EditorConfiguration.DIFF_EDITOR_SECTION = 'diffEditor';
        return EditorConfiguration;
    }());
    exports.EditorConfiguration = EditorConfiguration;
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    var editorConfiguration = {
        'id': 'editor',
        'order': 5,
        'type': 'object',
        'title': nls.localize('editorConfigurationTitle', "Editor configuration"),
        'properties': {
            'editor.fontFamily': {
                'type': 'string',
                'default': defaultConfig_1.DefaultConfig.editor.fontFamily,
                'description': nls.localize('fontFamily', "Controls the font family.")
            },
            'editor.fontSize': {
                'type': 'number',
                'default': defaultConfig_1.DefaultConfig.editor.fontSize,
                'description': nls.localize('fontSize', "Controls the font size.")
            },
            'editor.lineHeight': {
                'type': 'number',
                'default': defaultConfig_1.DefaultConfig.editor.lineHeight,
                'description': nls.localize('lineHeight', "Controls the line height.")
            },
            'editor.lineNumbers': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.lineNumbers,
                'description': nls.localize('lineNumbers', "Controls visibility of line numbers")
            },
            'editor.glyphMargin': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.glyphMargin,
                'description': nls.localize('glyphMargin', "Controls visibility of the glyph margin")
            },
            'editor.rulers': {
                'type': 'array',
                'items': {
                    'type': 'number'
                },
                'default': defaultConfig_1.DefaultConfig.editor.rulers,
                'description': nls.localize('rulers', "Columns at which to show vertical rulers")
            },
            'editor.wordSeparators': {
                'type': 'string',
                'default': defaultConfig_1.DefaultConfig.editor.wordSeparators,
                'description': nls.localize('wordSeparators', "Characters that will be used as word separators when doing word related navigations or operations")
            },
            'editor.tabSize': {
                'type': 'number',
                'default': defaultConfig_1.DEFAULT_INDENTATION.tabSize,
                'minimum': 1,
                'description': nls.localize('tabSize', "The number of spaces a tab is equal to."),
                'errorMessage': nls.localize('tabSize.errorMessage', "Expected 'number'. Note that the value \"auto\" has been replaced by the `editor.detectIndentation` setting.")
            },
            'editor.insertSpaces': {
                'type': 'boolean',
                'default': defaultConfig_1.DEFAULT_INDENTATION.insertSpaces,
                'description': nls.localize('insertSpaces', "Insert spaces when pressing Tab."),
                'errorMessage': nls.localize('insertSpaces.errorMessage', "Expected 'boolean'. Note that the value \"auto\" has been replaced by the `editor.detectIndentation` setting.")
            },
            'editor.detectIndentation': {
                'type': 'boolean',
                'default': defaultConfig_1.DEFAULT_INDENTATION.detectIndentation,
                'description': nls.localize('detectIndentation', "When opening a file, `editor.tabSize` and `editor.insertSpaces` will be detected based on the file contents.")
            },
            'editor.roundedSelection': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.roundedSelection,
                'description': nls.localize('roundedSelection', "Controls if selections have rounded corners")
            },
            'editor.scrollBeyondLastLine': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.scrollBeyondLastLine,
                'description': nls.localize('scrollBeyondLastLine', "Controls if the editor will scroll beyond the last line")
            },
            'editor.wrappingColumn': {
                'type': 'integer',
                'default': defaultConfig_1.DefaultConfig.editor.wrappingColumn,
                'minimum': -1,
                'description': nls.localize('wrappingColumn', "Controls after how many characters the editor will wrap to the next line. Setting this to 0 turns on viewport width wrapping (word wrapping). Setting this to -1 forces the editor to never wrap.")
            },
            'editor.wrappingIndent': {
                'type': 'string',
                'enum': ['none', 'same', 'indent'],
                'default': defaultConfig_1.DefaultConfig.editor.wrappingIndent,
                'description': nls.localize('wrappingIndent', "Controls the indentation of wrapped lines. Can be one of 'none', 'same' or 'indent'.")
            },
            'editor.mouseWheelScrollSensitivity': {
                'type': 'number',
                'default': defaultConfig_1.DefaultConfig.editor.mouseWheelScrollSensitivity,
                'description': nls.localize('mouseWheelScrollSensitivity', "A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events")
            },
            'editor.quickSuggestions': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.quickSuggestions,
                'description': nls.localize('quickSuggestions', "Controls if quick suggestions should show up or not while typing")
            },
            'editor.quickSuggestionsDelay': {
                'type': 'integer',
                'default': defaultConfig_1.DefaultConfig.editor.quickSuggestionsDelay,
                'minimum': 0,
                'description': nls.localize('quickSuggestionsDelay', "Controls the delay in ms after which quick suggestions will show up")
            },
            'editor.autoClosingBrackets': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.autoClosingBrackets,
                'description': nls.localize('autoClosingBrackets', "Controls if the editor should automatically close brackets after opening them")
            },
            'editor.formatOnType': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.formatOnType,
                'description': nls.localize('formatOnType', "Controls if the editor should automatically format the line after typing")
            },
            'editor.suggestOnTriggerCharacters': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.suggestOnTriggerCharacters,
                'description': nls.localize('suggestOnTriggerCharacters', "Controls if suggestions should automatically show up when typing trigger characters")
            },
            'editor.acceptSuggestionOnEnter': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.acceptSuggestionOnEnter,
                'description': nls.localize('acceptSuggestionOnEnter', "Controls if suggestions should be accepted 'Enter' - in addition to 'Tab'. Helps to avoid ambiguity between inserting new lines or accepting suggestions.")
            },
            'editor.selectionHighlight': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.selectionHighlight,
                'description': nls.localize('selectionHighlight', "Controls whether the editor should highlight similar matches to the selection")
            },
            //		'editor.outlineMarkers' : {
            //			'type': 'boolean',
            //			'default': DefaultConfig.editor.outlineMarkers,
            //			'description': nls.localize('outlineMarkers', "Controls whether the editor should draw horizontal lines before classes and methods")
            //		},
            'editor.overviewRulerLanes': {
                'type': 'integer',
                'default': 3,
                'description': nls.localize('overviewRulerLanes', "Controls the number of decorations that can show up at the same position in the overview ruler")
            },
            'editor.cursorBlinking': {
                'type': 'string',
                'enum': ['blink', 'visible', 'hidden'],
                'default': defaultConfig_1.DefaultConfig.editor.cursorBlinking,
                'description': nls.localize('cursorBlinking', "Controls the cursor blinking animation, accepted values are 'blink', 'visible', and 'hidden'")
            },
            'editor.cursorStyle': {
                'type': 'string',
                'enum': ['block', 'line'],
                'default': defaultConfig_1.DefaultConfig.editor.cursorStyle,
                'description': nls.localize('cursorStyle', "Controls the cursor style, accepted values are 'block' and 'line'")
            },
            'editor.fontLigatures': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.fontLigatures,
                'description': nls.localize('fontLigatures', "Enables font ligatures")
            },
            'editor.hideCursorInOverviewRuler': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.hideCursorInOverviewRuler,
                'description': nls.localize('hideCursorInOverviewRuler', "Controls if the cursor should be hidden in the overview ruler.")
            },
            'editor.renderWhitespace': {
                'type': 'boolean',
                default: defaultConfig_1.DefaultConfig.editor.renderWhitespace,
                description: nls.localize('renderWhitespace', "Controls whether the editor should render whitespace characters")
            },
            'editor.indentGuides': {
                'type': 'boolean',
                default: defaultConfig_1.DefaultConfig.editor.indentGuides,
                description: nls.localize('indentGuides', "Controls whether the editor should render indent guides")
            },
            'editor.referenceInfos': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.referenceInfos,
                'description': nls.localize('referenceInfos', "Controls if the editor shows reference information for the modes that support it")
            },
            'editor.folding': {
                'type': 'boolean',
                'default': defaultConfig_1.DefaultConfig.editor.folding,
                'description': nls.localize('folding', "Controls whether the editor has code folding enabled")
            },
            'diffEditor.renderSideBySide': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('sideBySide', "Controls if the diff editor shows the diff side by side or inline")
            },
            'diffEditor.ignoreTrimWhitespace': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('ignoreTrimWhitespace', "Controls if the diff editor shows changes in leading or trailing whitespace as diffs")
            }
        }
    };
    if (platform.isLinux) {
        editorConfiguration['properties']['editor.selectionClipboard'] = {
            'type': 'boolean',
            'default': defaultConfig_1.DefaultConfig.editor.selectionClipboard,
            'description': nls.localize('selectionClipboard', "Controls if the Linux primary clipboard should be supported.")
        };
    }
    configurationRegistry.registerConfiguration(editorConfiguration);
});
//# sourceMappingURL=commonEditorConfig.js.map