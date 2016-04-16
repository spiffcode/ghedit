/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/browser/browser', 'vs/base/browser/dom', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser', 'vs/editor/browser/editorBrowserExtensions', 'vs/css!./iPadShowKeyboard'], function (require, exports, lifecycle_1, browser, dom, editorCommon_1, editorBrowser_1, editorBrowserExtensions_1) {
    'use strict';
    var IPadShowKeyboard = (function () {
        function IPadShowKeyboard(editor) {
            var _this = this;
            this.editor = editor;
            this.toDispose = [];
            if (browser.isIPad) {
                this.toDispose.push(editor.addListener2(editorCommon_1.EventType.ConfigurationChanged, function () { return _this.update(); }));
                this.update();
            }
        }
        IPadShowKeyboard.prototype.update = function () {
            var hasWidget = (!!this.widget);
            var shouldHaveWidget = (!this.editor.getConfiguration().readOnly);
            if (!hasWidget && shouldHaveWidget) {
                this.widget = new ShowKeyboardWidget(this.editor);
            }
            else if (hasWidget && !shouldHaveWidget) {
                this.widget.dispose();
                this.widget = null;
            }
        };
        IPadShowKeyboard.prototype.getId = function () {
            return IPadShowKeyboard.ID;
        };
        IPadShowKeyboard.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            if (this.widget) {
                this.widget.dispose();
                this.widget = null;
            }
        };
        IPadShowKeyboard.ID = 'editor.contrib.iPadShowKeyboard';
        return IPadShowKeyboard;
    }());
    exports.IPadShowKeyboard = IPadShowKeyboard;
    var ShowKeyboardWidget = (function () {
        function ShowKeyboardWidget(editor) {
            var _this = this;
            this.editor = editor;
            this._domNode = document.createElement('textarea');
            this._domNode.className = 'iPadShowKeyboard';
            this._toDispose = [];
            this._toDispose.push(dom.addDisposableListener(this._domNode, 'touchstart', function (e) {
                _this.editor.focus();
            }));
            this._toDispose.push(dom.addDisposableListener(this._domNode, 'focus', function (e) {
                _this.editor.focus();
            }));
            this.editor.addOverlayWidget(this);
        }
        ShowKeyboardWidget.prototype.dispose = function () {
            this.editor.removeOverlayWidget(this);
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        // ----- IOverlayWidget API
        ShowKeyboardWidget.prototype.getId = function () {
            return ShowKeyboardWidget.ID;
        };
        ShowKeyboardWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        ShowKeyboardWidget.prototype.getPosition = function () {
            return {
                preference: editorBrowser_1.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
            };
        };
        ShowKeyboardWidget.ID = 'editor.contrib.ShowKeyboardWidget';
        return ShowKeyboardWidget;
    }());
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(IPadShowKeyboard);
});
//# sourceMappingURL=iPadShowKeyboard.js.map