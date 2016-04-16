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
define(["require", "exports", 'vs/platform/contextview/browser/contextView', 'vs/platform/keybinding/common/keybindingService', 'vs/editor/browser/editorBrowserExtensions', 'vs/editor/contrib/find/browser/findWidget', 'vs/editor/contrib/find/common/findController'], function (require, exports, contextView_1, keybindingService_1, editorBrowserExtensions_1, findWidget_1, findController_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FindController = (function (_super) {
        __extends(FindController, _super);
        function FindController(editor, contextViewService, keybindingService) {
            _super.call(this, editor, keybindingService);
            this._widget = this._register(new findWidget_1.FindWidget(editor, this, this._state, contextViewService, keybindingService));
        }
        FindController.prototype._start = function (opts) {
            _super.prototype._start.call(this, opts);
            if (opts.shouldFocus === findController_1.FindStartFocusAction.FocusReplaceInput) {
                this._widget.focusReplaceInput();
            }
            else if (opts.shouldFocus === findController_1.FindStartFocusAction.FocusFindInput) {
                this._widget.focusFindInput();
            }
        };
        FindController = __decorate([
            __param(1, contextView_1.IContextViewService),
            __param(2, keybindingService_1.IKeybindingService)
        ], FindController);
        return FindController;
    }(findController_1.CommonFindController));
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(FindController);
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(findController_1.SelectionHighlighter);
});
//# sourceMappingURL=find.js.map