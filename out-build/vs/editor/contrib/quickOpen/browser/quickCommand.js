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
define(["require", "exports", 'vs/nls!vs/editor/contrib/quickOpen/browser/quickCommand', 'vs/base/common/errors', 'vs/base/common/filters', 'vs/base/common/strings', 'vs/base/common/winjs.base', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/base/parts/quickopen/common/quickOpen', 'vs/platform/keybinding/common/keybindingService', 'vs/editor/common/editorActionEnablement', './editorQuickOpen'], function (require, exports, nls, errors_1, filters_1, strings, winjs_base_1, quickOpenModel_1, quickOpen_1, keybindingService_1, editorActionEnablement_1, editorQuickOpen_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var EditorActionCommandEntry = (function (_super) {
        __extends(EditorActionCommandEntry, _super);
        function EditorActionCommandEntry(key, highlights, action, editor) {
            _super.call(this);
            this.key = key;
            this.setHighlights(highlights);
            this.action = action;
            this.editor = editor;
        }
        EditorActionCommandEntry.prototype.getLabel = function () {
            return this.action.label;
        };
        EditorActionCommandEntry.prototype.getAriaLabel = function () {
            return nls.localize(0, null, this.getLabel());
        };
        EditorActionCommandEntry.prototype.getGroupLabel = function () {
            return this.key;
        };
        EditorActionCommandEntry.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === quickOpen_1.Mode.OPEN) {
                // Use a timeout to give the quick open widget a chance to close itself first
                winjs_base_1.TPromise.timeout(50).done(function () {
                    // Some actions are enabled only when editor has focus
                    _this.editor.focus();
                    if (_this.action.enabled) {
                        try {
                            var promise = _this.action.run() || winjs_base_1.TPromise.as(null);
                            promise.done(null, errors_1.onUnexpectedError);
                        }
                        catch (error) {
                            errors_1.onUnexpectedError(error);
                        }
                    }
                }, errors_1.onUnexpectedError);
                return true;
            }
            return false;
        };
        return EditorActionCommandEntry;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    exports.EditorActionCommandEntry = EditorActionCommandEntry;
    var QuickCommandAction = (function (_super) {
        __extends(QuickCommandAction, _super);
        function QuickCommandAction(descriptor, editor, keybindingService) {
            _super.call(this, descriptor, editor, nls.localize(1, null), editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.ShowInContextMenu);
            this._keybindingService = keybindingService;
        }
        QuickCommandAction.prototype._getModel = function (value) {
            return new quickOpenModel_1.QuickOpenModel(this._editorActionsToEntries(this.editor.getActions(), value));
        };
        QuickCommandAction.prototype.getGroupId = function () {
            return '4_tools/1_commands';
        };
        QuickCommandAction.prototype._sort = function (elementA, elementB) {
            var elementAName = elementA.getLabel().toLowerCase();
            var elementBName = elementB.getLabel().toLowerCase();
            return strings.localeCompare(elementAName, elementBName);
        };
        QuickCommandAction.prototype._editorActionsToEntries = function (actions, searchValue) {
            var _this = this;
            var entries = [];
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                var editorAction = action;
                if (!editorAction.isSupported()) {
                    continue; // do not show actions that are not supported in this context
                }
                var keys = this._keybindingService.lookupKeybindings(editorAction.id).map(function (k) { return _this._keybindingService.getLabelFor(k); });
                if (action.label) {
                    var highlights = filters_1.matchesFuzzy(searchValue, action.label);
                    if (highlights) {
                        entries.push(new EditorActionCommandEntry(keys.length > 0 ? keys.join(', ') : '', highlights, action, this.editor));
                    }
                }
            }
            // Sort by name
            entries = entries.sort(this._sort);
            return entries;
        };
        QuickCommandAction.prototype._getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: true,
                autoFocusPrefixMatch: searchValue
            };
        };
        QuickCommandAction.prototype._getInputAriaLabel = function () {
            return nls.localize(2, null);
        };
        QuickCommandAction.ID = 'editor.action.quickCommand';
        QuickCommandAction = __decorate([
            __param(2, keybindingService_1.IKeybindingService)
        ], QuickCommandAction);
        return QuickCommandAction;
    }(editorQuickOpen_1.BaseEditorQuickOpenAction));
    exports.QuickCommandAction = QuickCommandAction;
});
//# sourceMappingURL=quickCommand.js.map