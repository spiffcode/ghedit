/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/browser', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser', 'vs/editor/browser/view/viewPart', 'vs/editor/browser/viewParts/viewCursors/viewCursor', 'vs/css!./viewCursors'], function (require, exports, browser, editorCommon, editorBrowser_1, viewPart_1, viewCursor_1) {
    'use strict';
    var RenderType;
    (function (RenderType) {
        RenderType[RenderType["Hidden"] = 0] = "Hidden";
        RenderType[RenderType["Visible"] = 1] = "Visible";
        RenderType[RenderType["Blink"] = 2] = "Blink";
    })(RenderType || (RenderType = {}));
    var ViewCursors = (function (_super) {
        __extends(ViewCursors, _super);
        function ViewCursors(context) {
            _super.call(this, context);
            this._readOnly = this._context.configuration.editor.readOnly;
            this._cursorBlinking = this._context.configuration.editor.cursorBlinking;
            this._cursorStyle = this._context.configuration.editor.cursorStyle;
            this._primaryCursor = new viewCursor_1.ViewCursor(this._context, false);
            this._secondaryCursors = [];
            this._domNode = document.createElement('div');
            this._updateDomClassName();
            if (browser.canUseTranslate3d) {
                this._domNode.style.transform = 'translate3d(0px, 0px, 0px)';
            }
            this._domNode.appendChild(this._primaryCursor.getDomNode());
            this._blinkTimer = -1;
            this._editorHasFocus = false;
            this._updateBlinking();
        }
        ViewCursors.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this._blinkTimer !== -1) {
                window.clearInterval(this._blinkTimer);
                this._blinkTimer = -1;
            }
        };
        ViewCursors.prototype.getDomNode = function () {
            return this._domNode;
        };
        // --- begin event handlers
        ViewCursors.prototype.onModelFlushed = function () {
            this._primaryCursor.onModelFlushed();
            for (var i = 0, len = this._secondaryCursors.length; i < len; i++) {
                var domNode = this._secondaryCursors[i].getDomNode();
                domNode.parentNode.removeChild(domNode);
            }
            this._secondaryCursors = [];
            return true;
        };
        ViewCursors.prototype.onModelDecorationsChanged = function (e) {
            // true for inline decorations that can end up relayouting text
            return e.inlineDecorationsChanged;
        };
        ViewCursors.prototype.onModelLinesDeleted = function (e) {
            return true;
        };
        ViewCursors.prototype.onModelLineChanged = function (e) {
            return true;
        };
        ViewCursors.prototype.onModelLinesInserted = function (e) {
            return true;
        };
        ViewCursors.prototype.onModelTokensChanged = function (e) {
            var shouldRender = function (position) {
                return e.fromLineNumber <= position.lineNumber && position.lineNumber <= e.toLineNumber;
            };
            if (shouldRender(this._primaryCursor.getPosition())) {
                return true;
            }
            for (var i = 0; i < this._secondaryCursors.length; i++) {
                if (shouldRender(this._secondaryCursors[i].getPosition())) {
                    return true;
                }
            }
            return false;
        };
        ViewCursors.prototype.onCursorPositionChanged = function (e) {
            this._primaryCursor.onCursorPositionChanged(e.position, e.isInEditableRange);
            this._updateBlinking();
            if (this._secondaryCursors.length < e.secondaryPositions.length) {
                // Create new cursors
                var addCnt = e.secondaryPositions.length - this._secondaryCursors.length;
                for (var i = 0; i < addCnt; i++) {
                    var newCursor = new viewCursor_1.ViewCursor(this._context, true);
                    this._primaryCursor.getDomNode().parentNode.insertBefore(newCursor.getDomNode(), this._primaryCursor.getDomNode().nextSibling);
                    this._secondaryCursors.push(newCursor);
                }
            }
            else if (this._secondaryCursors.length > e.secondaryPositions.length) {
                // Remove some cursors
                var removeCnt = this._secondaryCursors.length - e.secondaryPositions.length;
                for (var i = 0; i < removeCnt; i++) {
                    this._secondaryCursors[0].getDomNode().parentNode.removeChild(this._secondaryCursors[0].getDomNode());
                    this._secondaryCursors.splice(0, 1);
                }
            }
            for (var i = 0; i < e.secondaryPositions.length; i++) {
                this._secondaryCursors[i].onCursorPositionChanged(e.secondaryPositions[i], e.isInEditableRange);
            }
            return true;
        };
        ViewCursors.prototype.onCursorSelectionChanged = function (e) {
            return false;
        };
        ViewCursors.prototype.onConfigurationChanged = function (e) {
            if (e.readOnly) {
                this._readOnly = this._context.configuration.editor.readOnly;
            }
            if (e.cursorBlinking) {
                this._cursorBlinking = this._context.configuration.editor.cursorBlinking;
            }
            if (e.cursorStyle) {
                this._cursorStyle = this._context.configuration.editor.cursorStyle;
            }
            this._primaryCursor.onConfigurationChanged(e);
            this._updateBlinking();
            if (e.cursorStyle) {
                this._updateDomClassName();
            }
            for (var i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].onConfigurationChanged(e);
            }
            return true;
        };
        ViewCursors.prototype.onLayoutChanged = function (layoutInfo) {
            return true;
        };
        ViewCursors.prototype.onScrollChanged = function (e) {
            return true;
        };
        ViewCursors.prototype.onZonesChanged = function () {
            return true;
        };
        ViewCursors.prototype.onScrollWidthChanged = function (scrollWidth) {
            return true;
        };
        ViewCursors.prototype.onScrollHeightChanged = function (scrollHeight) {
            return false;
        };
        ViewCursors.prototype.onViewFocusChanged = function (isFocused) {
            this._editorHasFocus = isFocused;
            this._updateBlinking();
            return false;
        };
        // --- end event handlers
        ViewCursors.prototype.getPosition = function () {
            return this._primaryCursor.getPosition();
        };
        // ---- blinking logic
        ViewCursors.prototype._getRenderType = function () {
            if (this._editorHasFocus) {
                if (this._primaryCursor.getIsInEditableRange() && !this._readOnly) {
                    switch (this._cursorBlinking) {
                        case 'blink':
                            return RenderType.Blink;
                        case 'visible':
                            return RenderType.Visible;
                        case 'hidden':
                            return RenderType.Hidden;
                        default:
                            return RenderType.Blink;
                    }
                }
                return RenderType.Visible;
            }
            return RenderType.Hidden;
        };
        ViewCursors.prototype._updateBlinking = function () {
            var _this = this;
            if (this._blinkTimer !== -1) {
                window.clearInterval(this._blinkTimer);
                this._blinkTimer = -1;
            }
            var renderType = this._getRenderType();
            if (renderType === RenderType.Visible || renderType === RenderType.Blink) {
                this._show();
            }
            else {
                this._hide();
            }
            if (renderType === RenderType.Blink) {
                this._blinkTimer = window.setInterval(function () { return _this._blink(); }, ViewCursors.BLINK_INTERVAL);
            }
        };
        // --- end blinking logic
        ViewCursors.prototype._updateDomClassName = function () {
            this._domNode.className = this._getClassName();
        };
        ViewCursors.prototype._getClassName = function () {
            var result = editorBrowser_1.ClassNames.VIEW_CURSORS_LAYER;
            var extraClassName;
            switch (this._cursorStyle) {
                case editorCommon.TextEditorCursorStyle.Line:
                    extraClassName = 'cursor-line-style';
                    break;
                case editorCommon.TextEditorCursorStyle.Block:
                    extraClassName = 'cursor-block-style';
                    break;
                case editorCommon.TextEditorCursorStyle.Underline:
                    extraClassName = 'cursor-underline-style';
                    break;
                default:
                    extraClassName = 'cursor-line-style';
            }
            return result + ' ' + extraClassName;
        };
        ViewCursors.prototype._blink = function () {
            if (this._isVisible) {
                this._hide();
            }
            else {
                this._show();
            }
        };
        ViewCursors.prototype._show = function () {
            this._primaryCursor.show();
            for (var i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].show();
            }
            this._isVisible = true;
        };
        ViewCursors.prototype._hide = function () {
            this._primaryCursor.hide();
            for (var i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].hide();
            }
            this._isVisible = false;
        };
        // ---- IViewPart implementation
        ViewCursors.prototype.prepareRender = function (ctx) {
            if (!this.shouldRender()) {
                throw new Error('I did not ask to render!');
            }
            this._primaryCursor.prepareRender(ctx);
            for (var i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].prepareRender(ctx);
            }
        };
        ViewCursors.prototype.render = function (ctx) {
            this._primaryCursor.render(ctx);
            for (var i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].render(ctx);
            }
        };
        ViewCursors.BLINK_INTERVAL = 500;
        return ViewCursors;
    }(viewPart_1.ViewPart));
    exports.ViewCursors = ViewCursors;
});
