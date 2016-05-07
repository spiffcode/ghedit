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
define(["require", "exports", 'vs/nls!vs/editor/contrib/contextmenu/browser/contextmenu', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/base/common/sortedList', 'vs/base/common/winjs.base', 'vs/base/browser/dom', 'vs/base/browser/ui/actionbar/actionbar', 'vs/platform/contextview/browser/contextView', 'vs/platform/keybinding/common/keybindingService', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/browser/editorBrowserExtensions'], function (require, exports, nls, keyCodes_1, lifecycle_1, sortedList_1, winjs_base_1, dom, actionbar_1, contextView_1, keybindingService_1, editorAction_1, editorActionEnablement_1, editorCommon_1, editorCommonExtensions_1, editorBrowserExtensions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ContextMenuController = (function () {
        function ContextMenuController(editor, contextMenuService, contextViewService, keybindingService) {
            var _this = this;
            this.contextMenuService = contextMenuService;
            this.contextViewService = contextViewService;
            this.keybindingService = keybindingService;
            this._editor = editor;
            this._toDispose = [];
            this._contextMenuIsBeingShownCount = 0;
            this._toDispose.push(this._editor.addListener2(editorCommon_1.EventType.ContextMenu, function (e) { return _this._onContextMenu(e); }));
            this._toDispose.push(this._editor.addListener2(editorCommon_1.EventType.KeyDown, function (e) {
                if (e.keyCode === keyCodes_1.KeyCode.ContextMenu) {
                    // Chrome is funny like that
                    e.preventDefault();
                    e.stopPropagation();
                    _this.showContextMenu();
                }
            }));
        }
        ContextMenuController.prototype._onContextMenu = function (e) {
            if (!this._editor.getConfiguration().contextmenu) {
                this._editor.focus();
                // Ensure the cursor is at the position of the mouse click
                if (e.target.position && !this._editor.getSelection().containsPosition(e.target.position)) {
                    this._editor.setPosition(e.target.position);
                }
                return; // Context menu is turned off through configuration
            }
            if (e.target.type === editorCommon_1.MouseTargetType.OVERLAY_WIDGET) {
                return; // allow native menu on widgets to support right click on input field for example in find
            }
            e.event.preventDefault();
            if (e.target.type !== editorCommon_1.MouseTargetType.CONTENT_TEXT && e.target.type !== editorCommon_1.MouseTargetType.CONTENT_EMPTY && e.target.type !== editorCommon_1.MouseTargetType.TEXTAREA) {
                return; // only support mouse click into text or native context menu key for now
            }
            // Ensure the editor gets focus if it hasn't, so the right events are being sent to other contributions
            this._editor.focus();
            // Ensure the cursor is at the position of the mouse click
            if (e.target.position && !this._editor.getSelection().containsPosition(e.target.position)) {
                this._editor.setPosition(e.target.position);
            }
            // Unless the user triggerd the context menu through Shift+F10, use the mouse position as menu position
            var forcedPosition;
            if (e.target.type !== editorCommon_1.MouseTargetType.TEXTAREA) {
                forcedPosition = { x: e.event.posx, y: e.event.posy + 1 };
            }
            // Show the context menu
            this.showContextMenu(forcedPosition);
        };
        ContextMenuController.prototype.showContextMenu = function (forcedPosition) {
            if (!this._editor.getConfiguration().contextmenu) {
                return; // Context menu is turned off through configuration
            }
            if (!this.contextMenuService) {
                this._editor.focus();
                return; // We need the context menu service to function
            }
            var position = this._editor.getPosition();
            var editorModel = this._editor.getModel();
            if (!position || !editorModel) {
                return;
            }
            // Find actions available for menu
            var menuActions = this._getMenuActions();
            // Show menu if we have actions to show
            if (menuActions.length > 0) {
                this._doShowContextMenu(menuActions, forcedPosition);
            }
        };
        ContextMenuController.prototype._getMenuActions = function () {
            var editorModel = this._editor.getModel();
            if (!editorModel) {
                return [];
            }
            var allActions = this._editor.getActions();
            var contributedActions = allActions.filter(function (action) { return (typeof action.shouldShowInContextMenu === 'function') && action.shouldShowInContextMenu() && action.isSupported(); });
            return this._prepareActions(contributedActions);
        };
        ContextMenuController.prototype._prepareActions = function (actions) {
            var list = new sortedList_1.SortedList();
            actions.forEach(function (action) {
                var groups = action.getGroupId().split('/');
                var actionsForGroup = list.getValue(groups[0]);
                if (!actionsForGroup) {
                    actionsForGroup = new sortedList_1.SortedList();
                    list.add(groups[0], actionsForGroup);
                }
                actionsForGroup.add(groups[1] || groups[0], action);
            });
            var sortedAndGroupedActions = [];
            var groupIterator = list.getIterator();
            while (groupIterator.moveNext()) {
                var group = groupIterator.current.value;
                var actionsIterator = group.getIterator();
                while (actionsIterator.moveNext()) {
                    var action = actionsIterator.current.value;
                    sortedAndGroupedActions.push(action);
                }
                if (groupIterator.hasNext()) {
                    sortedAndGroupedActions.push(new actionbar_1.Separator());
                }
            }
            return sortedAndGroupedActions;
        };
        ContextMenuController.prototype._doShowContextMenu = function (actions, forcedPosition) {
            var _this = this;
            if (forcedPosition === void 0) { forcedPosition = null; }
            // Make the editor believe one of its widgets is focused
            this._editor.beginForcedWidgetFocus();
            // Disable hover
            var oldHoverSetting = this._editor.getConfiguration().hover;
            this._editor.updateOptions({
                hover: false
            });
            var menuPosition = forcedPosition;
            if (!menuPosition) {
                // Ensure selection is visible
                this._editor.revealPosition(this._editor.getPosition());
                this._editor.render();
                var cursorCoords = this._editor.getScrolledVisiblePosition(this._editor.getPosition());
                // Translate to absolute editor position
                var editorCoords = dom.getDomNodePosition(this._editor.getDomNode());
                var posx = editorCoords.left + cursorCoords.left;
                var posy = editorCoords.top + cursorCoords.top + cursorCoords.height;
                menuPosition = { x: posx, y: posy };
            }
            // Show menu
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return menuPosition; },
                getActions: function () {
                    return winjs_base_1.TPromise.as(actions);
                },
                getActionItem: function (action) {
                    var keybinding = _this._keybindingFor(action);
                    if (keybinding) {
                        return new actionbar_1.ActionItem(action, action, { label: true, keybinding: _this.keybindingService.getLabelFor(keybinding) });
                    }
                    var customActionItem = action;
                    if (typeof customActionItem.getActionItem === 'function') {
                        return customActionItem.getActionItem();
                    }
                    return null;
                },
                getKeyBinding: function (action) {
                    return _this._keybindingFor(action);
                },
                onHide: function (wasCancelled) {
                    _this._contextMenuIsBeingShownCount--;
                    _this._editor.focus();
                    _this._editor.endForcedWidgetFocus();
                    _this._editor.updateOptions({
                        hover: oldHoverSetting
                    });
                }
            });
        };
        ContextMenuController.prototype._keybindingFor = function (action) {
            var opts = this.keybindingService.lookupKeybindings(action.id);
            if (opts.length > 0) {
                return opts[0]; // only take the first one
            }
            return null;
        };
        ContextMenuController.prototype.getId = function () {
            return ContextMenuController.ID;
        };
        ContextMenuController.prototype.dispose = function () {
            if (this._contextMenuIsBeingShownCount > 0) {
                this.contextViewService.hideContextView();
            }
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        ContextMenuController.ID = 'editor.contrib.contextmenu';
        ContextMenuController = __decorate([
            __param(1, contextView_1.IContextMenuService),
            __param(2, contextView_1.IContextViewService),
            __param(3, keybindingService_1.IKeybindingService)
        ], ContextMenuController);
        return ContextMenuController;
    }());
    var ShowContextMenu = (function (_super) {
        __extends(ShowContextMenu, _super);
        function ShowContextMenu(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
        }
        ShowContextMenu.prototype.run = function () {
            var contribution = this.editor.getContribution(ContextMenuController.ID);
            if (!contribution) {
                return winjs_base_1.TPromise.as(null);
            }
            contribution.showContextMenu();
            return winjs_base_1.TPromise.as(null);
        };
        ShowContextMenu.ID = 'editor.action.showContextMenu';
        return ShowContextMenu;
    }(editorAction_1.EditorAction));
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(ContextMenuController);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(ShowContextMenu, ShowContextMenu.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.F10
    }));
});
//# sourceMappingURL=contextmenu.js.map