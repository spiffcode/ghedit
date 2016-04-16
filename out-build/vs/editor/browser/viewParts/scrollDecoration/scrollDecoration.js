/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/dom', 'vs/base/browser/styleMutator', 'vs/editor/browser/editorBrowser', 'vs/editor/browser/view/viewPart', 'vs/css!./scrollDecoration'], function (require, exports, dom, styleMutator_1, editorBrowser_1, viewPart_1) {
    'use strict';
    var ScrollDecorationViewPart = (function (_super) {
        __extends(ScrollDecorationViewPart, _super);
        function ScrollDecorationViewPart(context) {
            _super.call(this, context);
            this._scrollTop = 0;
            this._width = 0;
            this._shouldShow = false;
            this._useShadows = this._context.configuration.editor.scrollbar.useShadows;
            this._domNode = document.createElement('div');
        }
        ScrollDecorationViewPart.prototype._updateShouldShow = function () {
            var newShouldShow = (this._useShadows && this._scrollTop > 0);
            if (this._shouldShow !== newShouldShow) {
                this._shouldShow = newShouldShow;
                return true;
            }
            return false;
        };
        ScrollDecorationViewPart.prototype.getDomNode = function () {
            return this._domNode;
        };
        // --- begin event handlers
        ScrollDecorationViewPart.prototype.onConfigurationChanged = function (e) {
            if (e.scrollbar) {
                this._useShadows = this._context.configuration.editor.scrollbar.useShadows;
            }
            return this._updateShouldShow();
        };
        ScrollDecorationViewPart.prototype.onLayoutChanged = function (layoutInfo) {
            if (this._width !== layoutInfo.width) {
                this._width = layoutInfo.width;
                return true;
            }
            return false;
        };
        ScrollDecorationViewPart.prototype.onScrollChanged = function (e) {
            this._scrollTop = e.scrollTop;
            return this._updateShouldShow();
        };
        // --- end event handlers
        ScrollDecorationViewPart.prototype.prepareRender = function (ctx) {
            // Nothing to read
            if (!this.shouldRender()) {
                throw new Error('I did not ask to render!');
            }
        };
        ScrollDecorationViewPart.prototype.render = function (ctx) {
            styleMutator_1.StyleMutator.setWidth(this._domNode, this._width);
            dom.toggleClass(this._domNode, editorBrowser_1.ClassNames.SCROLL_DECORATION, this._shouldShow);
        };
        return ScrollDecorationViewPart;
    }(viewPart_1.ViewPart));
    exports.ScrollDecorationViewPart = ScrollDecorationViewPart;
});
