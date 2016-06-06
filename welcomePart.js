var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/workbench/browser/part', 'vs/base/browser/builder'], function (require, exports, part_1, builder_1) {
    "use strict";
    var WelcomePart = (function (_super) {
        __extends(WelcomePart, _super);
        function WelcomePart(id) {
            _super.call(this, id);
        }
        WelcomePart.prototype.createContentArea = function (parent) {
            this.navItemsContainer = builder_1.$(parent);
            return this.navItemsContainer;
        };
        return WelcomePart;
    }(part_1.Part));
});
//# sourceMappingURL=welcomePart.js.map