/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/browser/builder', 'vs/base/browser/dnd', 'vs/base/common/actions', 'vs/base/browser/ui/actionbar/actionbar', 'vs/workbench/services/activity/common/activityService', 'vs/css!./media/activityaction'], function (require, exports, nls, builder_1, dnd_1, actions_1, actionbar_1, activityService_1) {
    'use strict';
    var ActivityAction = (function (_super) {
        __extends(ActivityAction, _super);
        function ActivityAction(id, name, clazz) {
            _super.call(this, id, name, clazz);
            this.badge = null;
        }
        ActivityAction.prototype.activate = function () {
            if (!this.checked) {
                this.checked = true;
                this.emit('checked', { source: this });
            }
        };
        ActivityAction.prototype.deactivate = function () {
            if (this.checked) {
                this.checked = false;
                this.emit('checked', { source: this });
            }
        };
        ActivityAction.prototype.getBadge = function () {
            return this.badge;
        };
        ActivityAction.prototype.setBadge = function (badge) {
            this.badge = badge;
            this.emit(ActivityAction.BADGE, { source: this });
        };
        ActivityAction.BADGE = 'badge';
        return ActivityAction;
    }(actions_1.Action));
    exports.ActivityAction = ActivityAction;
    var ActivityActionItem = (function (_super) {
        __extends(ActivityActionItem, _super);
        function ActivityActionItem(action, activityName, keybinding) {
            if (activityName === void 0) { activityName = action.label; }
            if (keybinding === void 0) { keybinding = null; }
            _super.call(this, null, action);
            this.cssClass = action.class;
            this.name = activityName;
            this._keybinding = keybinding;
        }
        ActivityActionItem.prototype.render = function (container) {
            var _this = this;
            _super.prototype.render.call(this, container);
            this.$e = builder_1.$('a.action-label').attr({
                tabIndex: '0',
                role: 'button'
            }).appendTo(this.builder);
            if (this.cssClass) {
                this.$e.addClass(this.cssClass);
            }
            this.$badge = this.builder.div({ 'class': 'badge' }, function (badge) {
                _this.$badgeContent = badge.div({ 'class': 'badge-content' });
            });
            this.$badge.hide();
            this.keybinding = this._keybinding; // force update
            // Activate on drag over to reveal targets
            [this.$badge, this.$e].forEach(function (b) { return new dnd_1.DelayedDragHandler(b.getHTMLElement(), function () {
                if (!_this.getAction().checked) {
                    _this.getAction().run();
                }
            }); });
        };
        ActivityActionItem.prototype.focus = function () {
            this.$e.domFocus();
        };
        ActivityActionItem.prototype.setBadge = function (badge) {
            this.updateBadge(badge);
        };
        Object.defineProperty(ActivityActionItem.prototype, "keybinding", {
            set: function (keybinding) {
                this._keybinding = keybinding;
                if (!this.$e) {
                    return;
                }
                var title;
                if (keybinding) {
                    title = nls.localize('titleKeybinding', "{0} ({1})", this.name, keybinding);
                }
                else {
                    title = this.name;
                }
                this.$e.title(title);
                this.$badge.title(title);
            },
            enumerable: true,
            configurable: true
        });
        ActivityActionItem.prototype.updateBadge = function (badge) {
            this.$badgeContent.empty();
            this.$badge.hide();
            if (badge) {
                // Number
                if (badge instanceof activityService_1.NumberBadge) {
                    var n = badge.number;
                    if (n) {
                        this.$badgeContent.text(n > 99 ? '99+' : n.toString());
                        this.$badge.show();
                    }
                }
                else if (badge instanceof activityService_1.TextBadge) {
                    this.$badgeContent.text(badge.text);
                    this.$badge.show();
                }
                else if (badge instanceof activityService_1.IconBadge) {
                    this.$badge.show();
                }
                else if (badge instanceof activityService_1.ProgressBadge) {
                    this.$badge.show();
                }
                this.$e.attr('aria-label', this.name + ' - ' + badge.getDescription());
            }
        };
        ActivityActionItem.prototype._updateClass = function () {
            if (this.cssClass) {
                this.$badge.removeClass(this.cssClass);
            }
            this.cssClass = this.getAction().class;
            this.$badge.addClass(this.cssClass);
        };
        ActivityActionItem.prototype._updateChecked = function () {
            if (this.getAction().checked) {
                this.$e.addClass('active');
            }
            else {
                this.$e.removeClass('active');
            }
        };
        ActivityActionItem.prototype._updateUnknown = function (event) {
            if (event.getType() === ActivityAction.BADGE) {
                var action = this.getAction();
                if (action instanceof ActivityAction) {
                    this.updateBadge(action.getBadge());
                }
            }
        };
        ActivityActionItem.prototype._updateEnabled = function () {
            if (this.getAction().enabled) {
                this.builder.removeClass('disabled');
            }
            else {
                this.builder.addClass('disabled');
            }
        };
        ActivityActionItem.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.$badge.destroy();
            this.$e.destroy();
        };
        return ActivityActionItem;
    }(actionbar_1.BaseActionItem));
    exports.ActivityActionItem = ActivityActionItem;
});
//# sourceMappingURL=activityAction.js.map