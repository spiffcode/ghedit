/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/builder', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/common/eventEmitter', 'vs/css!./menu'], function (require, exports, builder_1, actionbar_1, eventEmitter_1) {
    'use strict';
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu(container, actions, options) {
            if (options === void 0) { options = {}; }
            _super.call(this);
            builder_1.$(container).addClass('monaco-menu-container');
            var $menu = builder_1.$('.monaco-menu').appendTo(container);
            this.actionBar = new actionbar_1.ActionBar($menu, {
                orientation: actionbar_1.ActionsOrientation.VERTICAL,
                actionItemProvider: options.actionItemProvider,
                context: options.context,
                actionRunner: options.actionRunner
            });
            this.listener = this.addEmitter2(this.actionBar);
            this.actionBar.push(actions, { icon: true, label: true });
        }
        Menu.prototype.focus = function () {
            this.actionBar.focus();
        };
        Menu.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.actionBar) {
                this.actionBar.dispose();
                this.actionBar = null;
            }
            if (this.listener) {
                this.listener.dispose();
                this.listener = null;
            }
        };
        return Menu;
    }(eventEmitter_1.EventEmitter));
    exports.Menu = Menu;
});
//# sourceMappingURL=menu.js.map