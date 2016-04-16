define(["require", "exports", 'vs/base/browser/styleMutator', 'vs/editor/common/editorCommon'], function (require, exports, styleMutator_1, editorCommon_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ViewCursor = (function () {
        function ViewCursor(context, isSecondary) {
            this._context = context;
            this._cursorStyle = this._context.configuration.editor.cursorStyle;
            this._lineHeight = this._context.configuration.editor.lineHeight;
            this._lastRenderedContent = '';
            this._isInEditableRange = true;
            this._domNode = this._createCursorDomNode(isSecondary);
            this._isVisible = true;
            styleMutator_1.StyleMutator.setDisplay(this._domNode, 'none');
            this.updatePosition({
                lineNumber: 1,
                column: 1
            });
        }
        ViewCursor.prototype._createCursorDomNode = function (isSecondary) {
            var domNode = document.createElement('div');
            domNode.className = 'cursor';
            if (isSecondary) {
                domNode.className += ' secondary';
            }
            styleMutator_1.StyleMutator.setHeight(domNode, this._lineHeight);
            styleMutator_1.StyleMutator.setTop(domNode, 0);
            styleMutator_1.StyleMutator.setLeft(domNode, 0);
            domNode.setAttribute('role', 'presentation');
            domNode.setAttribute('aria-hidden', 'true');
            return domNode;
        };
        ViewCursor.prototype.getDomNode = function () {
            return this._domNode;
        };
        ViewCursor.prototype.getIsInEditableRange = function () {
            return this._isInEditableRange;
        };
        ViewCursor.prototype.getPositionTop = function () {
            return this._positionTop;
        };
        ViewCursor.prototype.getPosition = function () {
            return this._position;
        };
        ViewCursor.prototype.show = function () {
            if (!this._isVisible) {
                styleMutator_1.StyleMutator.setVisibility(this._domNode, 'inherit');
                this._isVisible = true;
            }
        };
        ViewCursor.prototype.hide = function () {
            if (this._isVisible) {
                styleMutator_1.StyleMutator.setVisibility(this._domNode, 'hidden');
                this._isVisible = false;
            }
        };
        ViewCursor.prototype.onModelFlushed = function () {
            this.updatePosition({
                lineNumber: 1,
                column: 1
            });
            this._isInEditableRange = true;
            return true;
        };
        ViewCursor.prototype.onCursorPositionChanged = function (position, isInEditableRange) {
            this.updatePosition(position);
            this._isInEditableRange = isInEditableRange;
            return true;
        };
        ViewCursor.prototype.onConfigurationChanged = function (e) {
            if (e.lineHeight) {
                this._lineHeight = this._context.configuration.editor.lineHeight;
            }
            if (e.cursorStyle) {
                this._cursorStyle = this._context.configuration.editor.cursorStyle;
            }
            return true;
        };
        ViewCursor.prototype.prepareRender = function (ctx) {
            var visibleRange = ctx.visibleRangeForPosition(this._position);
            if (visibleRange) {
                this._positionTop = visibleRange.top;
                this._positionLeft = visibleRange.left;
                this._isInViewport = true;
            }
            else {
                this._isInViewport = false;
            }
        };
        ViewCursor.prototype._getRenderedContent = function () {
            if (this._cursorStyle === editorCommon_1.TextEditorCursorStyle.Block) {
                var lineContent = this._context.model.getLineContent(this._position.lineNumber);
                return lineContent.charAt(this._position.column - 1);
            }
            return '';
        };
        ViewCursor.prototype.render = function (ctx) {
            if (this._isInViewport) {
                var renderContent = this._getRenderedContent();
                if (this._lastRenderedContent !== renderContent) {
                    this._lastRenderedContent = renderContent;
                    this._domNode.textContent = this._lastRenderedContent;
                }
                styleMutator_1.StyleMutator.setDisplay(this._domNode, 'block');
                styleMutator_1.StyleMutator.setLeft(this._domNode, this._positionLeft);
                styleMutator_1.StyleMutator.setTop(this._domNode, this._positionTop + ctx.viewportTop - ctx.bigNumbersDelta);
                styleMutator_1.StyleMutator.setLineHeight(this._domNode, this._lineHeight);
                styleMutator_1.StyleMutator.setHeight(this._domNode, this._lineHeight);
            }
            else {
                styleMutator_1.StyleMutator.setDisplay(this._domNode, 'none');
            }
        };
        ViewCursor.prototype.updatePosition = function (newPosition) {
            this._position = newPosition;
            this._domNode.setAttribute('lineNumber', this._position.lineNumber.toString());
            this._domNode.setAttribute('column', this._position.column.toString());
            this._isInViewport = false;
        };
        return ViewCursor;
    }());
    exports.ViewCursor = ViewCursor;
});
//# sourceMappingURL=viewCursor.js.map