/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/git/browser/views/disabled/disabledView', 'vs/base/common/winjs.base', 'vs/base/common/eventEmitter', 'vs/base/browser/builder', 'vs/platform/selection/common/selection', 'vs/css!./disabledView'], function (require, exports, nls, winjs, ee, builder, selection_1) {
    'use strict';
    var $ = builder.$;
    var DisabledView = (function (_super) {
        __extends(DisabledView, _super);
        function DisabledView() {
            _super.apply(this, arguments);
            this.ID = 'disabled';
        }
        Object.defineProperty(DisabledView.prototype, "element", {
            get: function () {
                if (!this._element) {
                    this.render();
                }
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        DisabledView.prototype.render = function () {
            this._element = $([
                '<div class="disabled-view">',
                '<p>', nls.localize(0, null), '</p>',
                '</div>'
            ].join('')).getHTMLElement();
        };
        DisabledView.prototype.focus = function () {
            return;
        };
        DisabledView.prototype.layout = function (dimension) {
            return;
        };
        DisabledView.prototype.setVisible = function (visible) {
            return winjs.TPromise.as(null);
        };
        DisabledView.prototype.getSelection = function () {
            return selection_1.Selection.EMPTY;
        };
        DisabledView.prototype.getControl = function () {
            return null;
        };
        DisabledView.prototype.getActions = function () {
            return [];
        };
        DisabledView.prototype.getSecondaryActions = function () {
            return [];
        };
        return DisabledView;
    }(ee.EventEmitter));
    exports.DisabledView = DisabledView;
});
//# sourceMappingURL=disabledView.js.map