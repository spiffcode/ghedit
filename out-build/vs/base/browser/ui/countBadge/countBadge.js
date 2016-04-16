/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/browser/builder', 'vs/base/common/strings', 'vs/css!./countBadge'], function (require, exports, builder_1, strings) {
    'use strict';
    var CountBadge = (function () {
        function CountBadge(container, count, titleFormat) {
            this.$el = builder_1.$('.monaco-count-badge').appendTo(container);
            this.titleFormat = titleFormat || '';
            this.setCount(count || 0);
        }
        CountBadge.prototype.setCount = function (count) {
            this.count = count;
            this.render();
        };
        CountBadge.prototype.setTitleFormat = function (titleFormat) {
            this.titleFormat = titleFormat;
            this.render();
        };
        CountBadge.prototype.render = function () {
            this.$el.text('' + this.count);
            this.$el.title(strings.format(this.titleFormat, this.count));
        };
        CountBadge.prototype.dispose = function () {
            if (this.$el) {
                this.$el.destroy();
                this.$el = null;
            }
        };
        return CountBadge;
    }());
    exports.CountBadge = CountBadge;
});
//# sourceMappingURL=countBadge.js.map