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
define(["require", "exports", 'vs/nls!vs/editor/contrib/parameterHints/browser/parameterHints', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/platform/keybinding/common/keybindingService', 'vs/editor/common/editorAction', 'vs/editor/common/editorCommonExtensions', 'vs/editor/browser/editorBrowserExtensions', 'vs/editor/common/modes', './parameterHintsModel', './parameterHintsWidget'], function (require, exports, nls, keyCodes_1, winjs_base_1, keybindingService_1, editorAction_1, editorCommonExtensions_1, editorBrowserExtensions_1, modes_1, parameterHintsModel_1, parameterHintsWidget_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ParameterHintsController = (function () {
        function ParameterHintsController(editor, keybindingService) {
            var _this = this;
            this.editor = editor;
            this.model = new parameterHintsModel_1.ParameterHintsModel(this.editor);
            this.parameterHintsVisible = keybindingService.createKey(CONTEXT_PARAMETER_HINTS_VISIBLE, false);
            this.widget = new parameterHintsWidget_1.ParameterHintsWidget(this.model, this.editor, function () {
                _this.parameterHintsVisible.set(true);
            }, function () {
                _this.parameterHintsVisible.reset();
            });
        }
        ParameterHintsController.get = function (editor) {
            return editor.getContribution(ParameterHintsController.ID);
        };
        ParameterHintsController.prototype.dispose = function () {
            this.model.dispose();
            this.model = null;
            this.widget.destroy();
            this.widget = null;
        };
        ParameterHintsController.prototype.getId = function () {
            return ParameterHintsController.ID;
        };
        ParameterHintsController.prototype.closeWidget = function () {
            this.widget.cancel();
        };
        ParameterHintsController.prototype.showPrevHint = function () {
            this.widget.selectPrevious();
        };
        ParameterHintsController.prototype.showNextHint = function () {
            this.widget.selectNext();
        };
        ParameterHintsController.prototype.trigger = function () {
            this.model.trigger(undefined, 0);
        };
        ParameterHintsController.ID = 'editor.controller.parameterHints';
        ParameterHintsController = __decorate([
            __param(1, keybindingService_1.IKeybindingService)
        ], ParameterHintsController);
        return ParameterHintsController;
    }());
    var TriggerParameterHintsAction = (function (_super) {
        __extends(TriggerParameterHintsAction, _super);
        function TriggerParameterHintsAction(descriptor, editor) {
            _super.call(this, descriptor, editor);
        }
        TriggerParameterHintsAction.prototype.isSupported = function () {
            return modes_1.ParameterHintsRegistry.has(this.editor.getModel()) && _super.prototype.isSupported.call(this);
        };
        TriggerParameterHintsAction.prototype.run = function () {
            ParameterHintsController.get(this.editor).trigger();
            return winjs_base_1.TPromise.as(true);
        };
        TriggerParameterHintsAction.ID = 'editor.action.triggerParameterHints';
        return TriggerParameterHintsAction;
    }(editorAction_1.EditorAction));
    exports.TriggerParameterHintsAction = TriggerParameterHintsAction;
    var CONTEXT_PARAMETER_HINTS_VISIBLE = 'parameterHintsVisible';
    var weight = editorCommonExtensions_1.CommonEditorRegistry.commandWeight(75);
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(ParameterHintsController);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(TriggerParameterHintsAction, TriggerParameterHintsAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Space
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand('closeParameterHints', weight, { primary: keyCodes_1.KeyCode.Escape, secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Escape] }, true, CONTEXT_PARAMETER_HINTS_VISIBLE, function (ctx, editor, args) {
        ParameterHintsController.get(editor).closeWidget();
    });
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand('showPrevParameterHint', weight, { primary: keyCodes_1.KeyCode.UpArrow, secondary: [keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.UpArrow] }, true, CONTEXT_PARAMETER_HINTS_VISIBLE, function (ctx, editor, args) {
        ParameterHintsController.get(editor).showPrevHint();
    });
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand('showNextParameterHint', weight, { primary: keyCodes_1.KeyCode.DownArrow, secondary: [keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.DownArrow] }, true, CONTEXT_PARAMETER_HINTS_VISIBLE, function (ctx, editor, args) {
        ParameterHintsController.get(editor).showNextHint();
    });
});
//# sourceMappingURL=parameterHints.js.map