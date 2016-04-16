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
define(["require", "exports", 'vs/nls!vs/workbench/parts/git/browser/gitActionItems', 'vs/base/browser/keyboardEvent', 'vs/base/browser/builder', 'vs/base/common/strings', 'vs/base/browser/ui/inputbox/inputBox', 'vs/base/browser/ui/actionbar/actionbar', 'vs/workbench/parts/git/common/git', 'vs/platform/contextview/browser/contextView', 'vs/base/common/keyCodes'], function (require, exports, nls, Keyboard, Builder, Strings, InputBox, ActionBar, git_1, contextView_1, keyCodes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var $ = Builder.$;
    var CreateBranchActionItem = (function (_super) {
        __extends(CreateBranchActionItem, _super);
        function CreateBranchActionItem(action, contextViewService, gitService) {
            _super.call(this, null, action);
            this.contextViewService = contextViewService;
            this.gitService = gitService;
        }
        CreateBranchActionItem.prototype.render = function (container) {
            var _this = this;
            this.inputBox = new InputBox.InputBox(container, this.contextViewService, {
                placeholder: nls.localize(0, null),
                validationOptions: {
                    showMessage: false,
                    validation: function (v) { return _this.validate(v); }
                },
                ariaLabel: nls.localize(1, null)
            });
            $(this.inputBox.inputElement).on('keyup', function (e) { return _this.onKeyUp(e); });
            this._updateEnabled();
        };
        CreateBranchActionItem.prototype._updateEnabled = function () {
            if (this._action.enabled) {
                this.inputBox.enable();
            }
            else {
                this.inputBox.disable();
            }
        };
        CreateBranchActionItem.prototype.focus = function () {
            this.inputBox.focus();
        };
        CreateBranchActionItem.prototype.blur = function () {
            // no-op
        };
        CreateBranchActionItem.prototype.validate = function (value) {
            if (/^\.|\/\.|\.\.|~|\^|:|\/$|\.lock$|\.lock\/|\\|\*|^\s*$/.test(value)) {
                return { content: nls.localize(2, null) };
            }
            var model = this.gitService.getModel();
            var heads = model.getHeads();
            if (heads.some(function (h) { return h.name === value; })) {
                return { content: nls.localize(3, null) };
            }
            return null;
        };
        CreateBranchActionItem.prototype.onKeyUp = function (e) {
            var event = new Keyboard.StandardKeyboardEvent(e);
            if (event.equals(keyCodes_1.CommonKeybindings.ENTER)) {
                event.preventDefault();
                event.stopPropagation();
                if (this.validate(this.inputBox.value)) {
                    return;
                }
                var context = Strings.trim(this.inputBox.value);
                this.actionRunner.run(this._action, context).done();
            }
        };
        CreateBranchActionItem.prototype.dispose = function () {
            this.inputBox.dispose();
            _super.prototype.dispose.call(this);
        };
        CreateBranchActionItem = __decorate([
            __param(1, contextView_1.IContextViewService),
            __param(2, git_1.IGitService)
        ], CreateBranchActionItem);
        return CreateBranchActionItem;
    }(ActionBar.BaseActionItem));
    exports.CreateBranchActionItem = CreateBranchActionItem;
});
//# sourceMappingURL=gitActionItems.js.map