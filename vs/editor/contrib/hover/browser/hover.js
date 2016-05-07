/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/hover/browser/hover', 'vs/base/common/keyCodes', 'vs/base/common/platform', 'vs/base/common/winjs.base', 'vs/platform/opener/common/opener', 'vs/platform/keybinding/common/keybindingService', 'vs/editor/common/core/range', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/browser/editorBrowserExtensions', './modesContentHover', './modesGlyphHover', 'vs/css!./hover'], function (require, exports, nls, keyCodes_1, platform, winjs_base_1, opener_1, keybindingService_1, range_1, editorAction_1, editorActionEnablement_1, editorCommon, editorCommonExtensions_1, editorBrowserExtensions_1, modesContentHover_1, modesGlyphHover_1) {
    'use strict';
    var ModesHoverController = (function () {
        function ModesHoverController(editor, openerService) {
            var _this = this;
            this._editor = editor;
            this._toUnhook = [];
            if (editor.getConfiguration().hover) {
                this._toUnhook.push(this._editor.addListener(editorCommon.EventType.MouseDown, function (e) { return _this._onEditorMouseDown(e); }));
                this._toUnhook.push(this._editor.addListener(editorCommon.EventType.MouseMove, function (e) { return _this._onEditorMouseMove(e); }));
                this._toUnhook.push(this._editor.addListener(editorCommon.EventType.MouseLeave, function (e) { return _this._hideWidgets(); }));
                this._toUnhook.push(this._editor.addListener(editorCommon.EventType.KeyDown, function (e) { return _this._onKeyDown(e); }));
                this._toUnhook.push(this._editor.addListener(editorCommon.EventType.ModelChanged, function () { return _this._hideWidgets(); }));
                this._toUnhook.push(this._editor.addListener(editorCommon.EventType.ModelDecorationsChanged, function () { return _this._onModelDecorationsChanged(); }));
                this._toUnhook.push(this._editor.addListener('scroll', function () { return _this._hideWidgets(); }));
                this._contentWidget = new modesContentHover_1.ModesContentHoverWidget(editor, openerService);
                this._glyphWidget = new modesGlyphHover_1.ModesGlyphHoverWidget(editor);
            }
        }
        ModesHoverController.getModesHoverController = function (editor) {
            return editor.getContribution(ModesHoverController.ID);
        };
        ModesHoverController.prototype._onModelDecorationsChanged = function () {
            this._contentWidget.onModelDecorationsChanged();
            this._glyphWidget.onModelDecorationsChanged();
        };
        ModesHoverController.prototype._onEditorMouseDown = function (mouseEvent) {
            var targetType = mouseEvent.target.type;
            if (targetType === editorCommon.MouseTargetType.CONTENT_WIDGET && mouseEvent.target.detail === modesContentHover_1.ModesContentHoverWidget.ID) {
                // mouse down on top of content hover widget
                return;
            }
            if (targetType === editorCommon.MouseTargetType.OVERLAY_WIDGET && mouseEvent.target.detail === modesGlyphHover_1.ModesGlyphHoverWidget.ID) {
                // mouse down on top of overlay hover widget
                return;
            }
            this._hideWidgets();
        };
        ModesHoverController.prototype._onEditorMouseMove = function (mouseEvent) {
            var targetType = mouseEvent.target.type;
            var stopKey = platform.isMacintosh ? 'metaKey' : 'ctrlKey';
            if (targetType === editorCommon.MouseTargetType.CONTENT_WIDGET && mouseEvent.target.detail === modesContentHover_1.ModesContentHoverWidget.ID && !mouseEvent.event[stopKey]) {
                // mouse moved on top of content hover widget
                return;
            }
            if (targetType === editorCommon.MouseTargetType.OVERLAY_WIDGET && mouseEvent.target.detail === modesGlyphHover_1.ModesGlyphHoverWidget.ID && !mouseEvent.event[stopKey]) {
                // mouse moved on top of overlay hover widget
                return;
            }
            if (this._editor.getConfiguration().hover && targetType === editorCommon.MouseTargetType.CONTENT_TEXT) {
                this._glyphWidget.hide();
                this._contentWidget.startShowingAt(mouseEvent.target.range, false);
            }
            else if (targetType === editorCommon.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                this._contentWidget.hide();
                this._glyphWidget.startShowingAt(mouseEvent.target.position.lineNumber);
            }
            else {
                this._hideWidgets();
            }
        };
        ModesHoverController.prototype._onKeyDown = function (e) {
            var stopKey = platform.isMacintosh ? keyCodes_1.KeyCode.Meta : keyCodes_1.KeyCode.Ctrl;
            if (e.keyCode !== stopKey) {
                // Do not hide hover when Ctrl/Meta is pressed
                this._hideWidgets();
            }
        };
        ModesHoverController.prototype._hideWidgets = function () {
            this._glyphWidget.hide();
            this._contentWidget.hide();
        };
        ModesHoverController.prototype.showContentHover = function (range, focus) {
            this._contentWidget.startShowingAt(range, focus);
        };
        ModesHoverController.prototype.getId = function () {
            return ModesHoverController.ID;
        };
        ModesHoverController.prototype.dispose = function () {
            while (this._toUnhook.length > 0) {
                this._toUnhook.pop()();
            }
            if (this._glyphWidget) {
                this._glyphWidget.dispose();
                this._glyphWidget = null;
            }
            if (this._contentWidget) {
                this._contentWidget.dispose();
                this._contentWidget = null;
            }
        };
        ModesHoverController.ID = 'editor.contrib.hover';
        ModesHoverController = __decorate([
            __param(1, opener_1.IOpenerService)
        ], ModesHoverController);
        return ModesHoverController;
    }());
    var ShowHoverAction = (function (_super) {
        __extends(ShowHoverAction, _super);
        function ShowHoverAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
        }
        ShowHoverAction.prototype.run = function () {
            var position = this.editor.getPosition();
            var range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            this.editor.getContribution(ModesHoverController.ID).showContentHover(range, true);
            return winjs_base_1.TPromise.as(null);
        };
        ShowHoverAction.ID = 'editor.action.showHover';
        return ShowHoverAction;
    }(editorAction_1.EditorAction));
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(ModesHoverController);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(ShowHoverAction, ShowHoverAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        kbExpr: keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS),
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_I)
    }));
});
//# sourceMappingURL=hover.js.map