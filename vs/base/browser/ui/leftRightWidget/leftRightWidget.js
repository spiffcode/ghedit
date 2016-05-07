/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/browser/builder', 'vs/css!./leftRightWidget'], function (require, exports, builder_1) {
    'use strict';
    var LeftRightWidget = (function () {
        function LeftRightWidget(container, renderLeftFn, renderRightFn) {
            this.$el = builder_1.$('.monaco-left-right-widget').appendTo(container);
            this.toDispose = [
                renderRightFn(builder_1.$('.right').appendTo(this.$el).getHTMLElement()),
                renderLeftFn(builder_1.$('span.left').appendTo(this.$el).getHTMLElement())
            ].filter(function (x) { return !!x; });
        }
        LeftRightWidget.prototype.dispose = function () {
            if (this.$el) {
                this.$el.destroy();
                this.$el = null;
            }
        };
        return LeftRightWidget;
    }());
    exports.LeftRightWidget = LeftRightWidget;
});
//# sourceMappingURL=leftRightWidget.js.map