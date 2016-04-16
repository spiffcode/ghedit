define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/browser/dom', 'vs/editor/common/core/position', 'vs/editor/browser/editorBrowser'], function (require, exports, lifecycle_1, dom, position_1, editorBrowser_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LightBulpWidget = (function () {
        function LightBulpWidget(editor, onclick) {
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.editor = editor;
            this.onclick = onclick;
            this.toDispose = [];
            this.editor.addContentWidget(this);
        }
        LightBulpWidget.prototype.dispose = function () {
            this.editor.removeContentWidget(this);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        LightBulpWidget.prototype.getId = function () {
            return '__lightBulpWidget';
        };
        LightBulpWidget.prototype.getDomNode = function () {
            var _this = this;
            if (!this.domNode) {
                this.domNode = document.createElement('div');
                this.domNode.style.width = '20px';
                this.domNode.style.height = '20px';
                this.domNode.className = 'lightbulp-glyph';
                this.toDispose.push(dom.addDisposableListener(this.domNode, 'click', function (e) {
                    _this.editor.focus();
                    _this.onclick(_this.position);
                }));
            }
            return this.domNode;
        };
        LightBulpWidget.prototype.getPosition = function () {
            return this.visible
                ? { position: this.position, preference: [editorBrowser_1.ContentWidgetPositionPreference.BELOW, editorBrowser_1.ContentWidgetPositionPreference.ABOVE] }
                : null;
        };
        LightBulpWidget.prototype.show = function (where) {
            if (this.visible && position_1.Position.equals(this.position, where)) {
                return;
            }
            this.position = where;
            this.visible = true;
            this.editor.layoutContentWidget(this);
        };
        LightBulpWidget.prototype.hide = function () {
            if (!this.visible) {
                return;
            }
            this.visible = false;
            this.editor.layoutContentWidget(this);
        };
        return LightBulpWidget;
    }());
    exports.LightBulpWidget = LightBulpWidget;
});
//# sourceMappingURL=lightBulpWidget.js.map