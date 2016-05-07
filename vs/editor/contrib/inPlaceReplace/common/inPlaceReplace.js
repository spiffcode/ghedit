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
define(["require", "exports", 'vs/nls!vs/editor/contrib/inPlaceReplace/common/inPlaceReplace', 'vs/base/common/keyCodes', 'vs/base/common/winjs.base', 'vs/editor/common/core/range', 'vs/editor/common/editorAction', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/services/editorWorkerService', './inPlaceReplaceCommand'], function (require, exports, nls, keyCodes_1, winjs_base_1, range_1, editorAction_1, editorCommon_1, editorCommonExtensions_1, editorWorkerService_1, inPlaceReplaceCommand_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var InPlaceReplace = (function (_super) {
        __extends(InPlaceReplace, _super);
        function InPlaceReplace(descriptor, editor, up, editorWorkerService) {
            _super.call(this, descriptor, editor);
            this.editorWorkerService = editorWorkerService;
            this.up = up;
            this.requestIdPool = 0;
            this.currentRequest = winjs_base_1.TPromise.as(null);
            this.decorationRemover = winjs_base_1.TPromise.as(null);
            this.decorationIds = [];
        }
        InPlaceReplace.prototype.run = function () {
            var _this = this;
            // cancel any pending request
            this.currentRequest.cancel();
            var selection = this.editor.getSelection(), model = this.editor.getModel(), support = model.getMode().inplaceReplaceSupport, modelURI = model.getAssociatedResource();
            if (selection.startLineNumber !== selection.endLineNumber) {
                // Can't accept multiline selection
                return null;
            }
            var state = this.editor.captureState(editorCommon_1.CodeEditorStateFlag.Value, editorCommon_1.CodeEditorStateFlag.Position);
            this.currentRequest = this.editorWorkerService.navigateValueSet(modelURI, selection, this.up);
            this.currentRequest = this.currentRequest.then(function (basicResult) {
                if (basicResult && basicResult.range && basicResult.value) {
                    return basicResult;
                }
                if (support) {
                    return support.navigateValueSet(modelURI, selection, _this.up);
                }
                return null;
            });
            return this.currentRequest.then(function (result) {
                if (!result || !result.range || !result.value) {
                    // No proper result
                    return;
                }
                if (!state.validate(_this.editor)) {
                    // state has changed
                    return;
                }
                // Selection
                var editRange = range_1.Range.lift(result.range), highlightRange = result.range, diff = result.value.length - (selection.endColumn - selection.startColumn);
                // highlight
                highlightRange.endColumn = highlightRange.startColumn + result.value.length;
                selection.endColumn += diff > 1 ? (diff - 1) : 0;
                // Insert new text
                var command = new inPlaceReplaceCommand_1.InPlaceReplaceCommand(editRange, selection, result.value);
                _this.editor.executeCommand(_this.id, command);
                // add decoration
                _this.decorationIds = _this.editor.deltaDecorations(_this.decorationIds, [{
                        range: highlightRange,
                        options: InPlaceReplace.DECORATION
                    }]);
                // remove decoration after delay
                _this.decorationRemover.cancel();
                _this.decorationRemover = winjs_base_1.TPromise.timeout(350);
                _this.decorationRemover.then(function () {
                    _this.editor.changeDecorations(function (accessor) {
                        _this.decorationIds = accessor.deltaDecorations(_this.decorationIds, []);
                    });
                });
                return true;
            });
        };
        InPlaceReplace.DECORATION = {
            className: 'valueSetReplacement'
        };
        InPlaceReplace = __decorate([
            __param(3, editorWorkerService_1.IEditorWorkerService)
        ], InPlaceReplace);
        return InPlaceReplace;
    }(editorAction_1.EditorAction));
    var InPlaceReplaceUp = (function (_super) {
        __extends(InPlaceReplaceUp, _super);
        function InPlaceReplaceUp(descriptor, editor, editorWorkerService) {
            _super.call(this, descriptor, editor, true, editorWorkerService);
        }
        InPlaceReplaceUp.ID = 'editor.action.inPlaceReplace.up';
        InPlaceReplaceUp = __decorate([
            __param(2, editorWorkerService_1.IEditorWorkerService)
        ], InPlaceReplaceUp);
        return InPlaceReplaceUp;
    }(InPlaceReplace));
    var InPlaceReplaceDown = (function (_super) {
        __extends(InPlaceReplaceDown, _super);
        function InPlaceReplaceDown(descriptor, editor, editorWorkerService) {
            _super.call(this, descriptor, editor, false, editorWorkerService);
        }
        InPlaceReplaceDown.ID = 'editor.action.inPlaceReplace.down';
        InPlaceReplaceDown = __decorate([
            __param(2, editorWorkerService_1.IEditorWorkerService)
        ], InPlaceReplaceDown);
        return InPlaceReplaceDown;
    }(InPlaceReplace));
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(InPlaceReplaceUp, InPlaceReplaceUp.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_COMMA
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(InPlaceReplaceDown, InPlaceReplaceDown.ID, nls.localize(1, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_DOT
    }));
});
//# sourceMappingURL=inPlaceReplace.js.map