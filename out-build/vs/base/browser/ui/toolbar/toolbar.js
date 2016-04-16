/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/browser/builder', 'vs/base/common/types', 'vs/base/common/actions', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/browser/ui/dropdown/dropdown', 'vs/css!./toolbar'], function (require, exports, nls, winjs_base_1, builder_1, types, actions_1, actionbar_1, dropdown_1) {
    'use strict';
    exports.CONTEXT = 'context.toolbar';
    /**
     * A widget that combines an action bar for primary actions and a dropdown for secondary actions.
     */
    var ToolBar = (function () {
        function ToolBar(container, contextMenuProvider, options) {
            var _this = this;
            if (options === void 0) { options = { orientation: actionbar_1.ActionsOrientation.HORIZONTAL }; }
            this.options = options;
            this.toggleMenuAction = new ToggleMenuAction(function () { return _this.toggleMenuActionItem && _this.toggleMenuActionItem.show(); });
            var element = document.createElement('div');
            element.className = 'monaco-toolbar';
            container.appendChild(element);
            this.actionBar = new actionbar_1.ActionBar(builder_1.$(element), {
                orientation: options.orientation,
                ariaLabel: options.ariaLabel,
                actionItemProvider: function (action) {
                    // Return special action item for the toggle menu action
                    if (action.id === ToggleMenuAction.ID) {
                        // Dispose old
                        if (_this.toggleMenuActionItem) {
                            _this.toggleMenuActionItem.dispose();
                        }
                        // Create new
                        _this.toggleMenuActionItem = new DropdownMenuActionItem(action, action.menuActions, contextMenuProvider, _this.options.actionItemProvider, _this.actionRunner, 'toolbar-toggle-more');
                        return _this.toggleMenuActionItem;
                    }
                    return options.actionItemProvider ? options.actionItemProvider(action) : null;
                }
            });
        }
        Object.defineProperty(ToolBar.prototype, "actionRunner", {
            get: function () {
                return this.actionBar.actionRunner;
            },
            set: function (actionRunner) {
                this.actionBar.actionRunner = actionRunner;
            },
            enumerable: true,
            configurable: true
        });
        ToolBar.prototype.getContainer = function () {
            return this.actionBar.getContainer();
        };
        ToolBar.prototype.setAriaLabel = function (label) {
            this.actionBar.setAriaLabel(label);
        };
        ToolBar.prototype.setActions = function (primaryActions, secondaryActions) {
            var _this = this;
            return function () {
                var primaryActionsToSet = primaryActions ? primaryActions.slice(0) : [];
                // Inject additional action to open secondary actions if present
                _this.hasSecondaryActions = secondaryActions && secondaryActions.length > 0;
                if (_this.hasSecondaryActions) {
                    _this.toggleMenuAction.menuActions = secondaryActions.slice(0);
                    primaryActionsToSet.push(_this.toggleMenuAction);
                }
                _this.actionBar.clear();
                _this.actionBar.push(primaryActionsToSet, { icon: true, label: false });
            };
        };
        ToolBar.prototype.addPrimaryAction = function (primaryActions) {
            var _this = this;
            return function () {
                // Add after the "..." action if we have secondary actions
                if (_this.hasSecondaryActions) {
                    var itemCount = _this.actionBar.length();
                    _this.actionBar.push(primaryActions, { icon: true, label: false, index: itemCount });
                }
                else {
                    _this.actionBar.push(primaryActions, { icon: true, label: false });
                }
            };
        };
        ToolBar.prototype.dispose = function () {
            this.actionBar.dispose();
            this.toggleMenuAction.dispose();
            if (this.toggleMenuActionItem) {
                this.toggleMenuActionItem.dispose();
            }
        };
        return ToolBar;
    }());
    exports.ToolBar = ToolBar;
    var ToggleMenuAction = (function (_super) {
        __extends(ToggleMenuAction, _super);
        function ToggleMenuAction(toggleDropdownMenu) {
            _super.call(this, ToggleMenuAction.ID, nls.localize('more', "More"), null, true);
            this.toggleDropdownMenu = toggleDropdownMenu;
        }
        ToggleMenuAction.prototype.run = function () {
            this.toggleDropdownMenu();
            return winjs_base_1.TPromise.as(true);
        };
        Object.defineProperty(ToggleMenuAction.prototype, "menuActions", {
            get: function () {
                return this._menuActions;
            },
            set: function (actions) {
                this._menuActions = actions;
            },
            enumerable: true,
            configurable: true
        });
        ToggleMenuAction.ID = 'toolbar.toggle.more';
        return ToggleMenuAction;
    }(actions_1.Action));
    var DropdownMenuActionItem = (function (_super) {
        __extends(DropdownMenuActionItem, _super);
        function DropdownMenuActionItem(action, menuActionsOrProvider, contextMenuProvider, actionItemProvider, actionRunner, clazz) {
            _super.call(this, null, action);
            this.menuActionsOrProvider = menuActionsOrProvider;
            this.contextMenuProvider = contextMenuProvider;
            this.actionItemProvider = actionItemProvider;
            this.actionRunner = actionRunner;
            this.clazz = clazz;
        }
        DropdownMenuActionItem.prototype.render = function (container) {
            var _this = this;
            var labelRenderer = function (el) {
                _this.builder = builder_1.$('a.action-label').attr({
                    tabIndex: '0',
                    role: 'button',
                    'aria-haspopup': 'true',
                    title: _this._action.label || '',
                    class: _this.clazz
                });
                _this.builder.appendTo(el);
                return null;
            };
            var options = {
                contextMenuProvider: this.contextMenuProvider,
                labelRenderer: labelRenderer
            };
            // Render the DropdownMenu around a simple action to toggle it
            if (types.isArray(this.menuActionsOrProvider)) {
                options.actions = this.menuActionsOrProvider;
            }
            else {
                options.actionProvider = this.menuActionsOrProvider;
            }
            this.dropdownMenu = new dropdown_1.DropdownMenu(container, options);
            this.dropdownMenu.menuOptions = {
                actionItemProvider: this.actionItemProvider,
                actionRunner: this.actionRunner
            };
            // Reemit events for running actions
            this.toUnbind = this.addEmitter(this.dropdownMenu);
        };
        DropdownMenuActionItem.prototype.show = function () {
            if (this.dropdownMenu) {
                this.dropdownMenu.show();
            }
        };
        DropdownMenuActionItem.prototype.dispose = function () {
            this.toUnbind();
            this.dropdownMenu.dispose();
            _super.prototype.dispose.call(this);
        };
        return DropdownMenuActionItem;
    }(actionbar_1.BaseActionItem));
    exports.DropdownMenuActionItem = DropdownMenuActionItem;
});
