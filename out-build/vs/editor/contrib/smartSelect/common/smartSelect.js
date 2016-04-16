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
define(["require", "exports", 'vs/nls!vs/editor/contrib/smartSelect/common/smartSelect', 'vs/base/common/arrays', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/platform/instantiation/common/instantiation', 'vs/editor/common/core/range', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', './tokenSelectionSupport'], function (require, exports, nls, arrays, keyCodes_1, winjs_base_1, instantiation_1, range_1, editorAction_1, editorActionEnablement_1, editorCommon_1, editorCommonExtensions_1, tokenSelectionSupport_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // --- selection state machine
    var State = (function () {
        function State(editor) {
            this.editor = editor;
            this.next = null;
            this.previous = null;
            this.selection = editor.getSelection();
        }
        return State;
    }());
    // --- shared state between grow and shrink actions
    var state = null;
    var ignoreSelection = false;
    // -- action implementation
    var SmartSelect = (function (_super) {
        __extends(SmartSelect, _super);
        function SmartSelect(descriptor, editor, forward, instantiationService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus | editorActionEnablement_1.Behaviour.UpdateOnModelChange);
            this._tokenSelectionSupport = instantiationService.createInstance(tokenSelectionSupport_1.TokenSelectionSupport);
            this._forward = forward;
        }
        SmartSelect.prototype.run = function () {
            var _this = this;
            var selection = this.editor.getSelection();
            var model = this.editor.getModel();
            var selectionSupport = model.getMode().logicalSelectionSupport || this._tokenSelectionSupport;
            // forget about current state
            if (state) {
                if (state.editor !== this.editor) {
                    state = null;
                }
            }
            var promise = winjs_base_1.TPromise.as(null);
            if (!state) {
                promise = selectionSupport.getRangesToPosition(model.getAssociatedResource(), selection.getStartPosition()).then(function (elements) {
                    if (arrays.isFalsyOrEmpty(elements)) {
                        return;
                    }
                    var lastState;
                    elements.filter(function (element) {
                        // filter ranges inside the selection
                        var selection = _this.editor.getSelection();
                        var range = new range_1.Range(element.range.startLineNumber, element.range.startColumn, element.range.endLineNumber, element.range.endColumn);
                        return range.containsPosition(selection.getStartPosition()) && range.containsPosition(selection.getEndPosition());
                    }).forEach(function (element) {
                        // create ranges
                        var range = element.range;
                        var state = new State(_this.editor);
                        state.selection = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                        if (lastState) {
                            state.next = lastState;
                            lastState.previous = state;
                        }
                        lastState = state;
                    });
                    // insert current selection
                    var editorState = new State(_this.editor);
                    editorState.next = lastState;
                    if (lastState) {
                        lastState.previous = editorState;
                    }
                    state = editorState;
                    // listen to caret move and forget about state
                    var unhook = _this.editor.addListener(editorCommon_1.EventType.CursorPositionChanged, function (e) {
                        if (ignoreSelection) {
                            return;
                        }
                        state = null;
                        unhook();
                    });
                });
            }
            return promise.then(function () {
                if (!state) {
                    return;
                }
                state = _this._forward ? state.next : state.previous;
                if (!state) {
                    return;
                }
                ignoreSelection = true;
                try {
                    _this.editor.setSelection(state.selection);
                }
                finally {
                    ignoreSelection = false;
                }
                return true;
            });
        };
        return SmartSelect;
    }(editorAction_1.EditorAction));
    var GrowSelectionAction = (function (_super) {
        __extends(GrowSelectionAction, _super);
        function GrowSelectionAction(descriptor, editor, instantiationService) {
            _super.call(this, descriptor, editor, true, instantiationService);
        }
        GrowSelectionAction.ID = 'editor.action.smartSelect.grow';
        GrowSelectionAction = __decorate([
            __param(2, instantiation_1.IInstantiationService)
        ], GrowSelectionAction);
        return GrowSelectionAction;
    }(SmartSelect));
    var ShrinkSelectionAction = (function (_super) {
        __extends(ShrinkSelectionAction, _super);
        function ShrinkSelectionAction(descriptor, editor, instantiationService) {
            _super.call(this, descriptor, editor, false, instantiationService);
        }
        ShrinkSelectionAction.ID = 'editor.action.smartSelect.shrink';
        ShrinkSelectionAction = __decorate([
            __param(2, instantiation_1.IInstantiationService)
        ], ShrinkSelectionAction);
        return ShrinkSelectionAction;
    }(SmartSelect));
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(GrowSelectionAction, GrowSelectionAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.RightArrow,
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.RightArrow }
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(ShrinkSelectionAction, ShrinkSelectionAction.ID, nls.localize(1, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.LeftArrow,
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.LeftArrow }
    }));
});
//# sourceMappingURL=smartSelect.js.map