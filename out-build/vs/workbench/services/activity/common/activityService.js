var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var BaseBadge = (function () {
        function BaseBadge(descriptorFn) {
            this.descriptorFn = descriptorFn;
        }
        /* protected */ BaseBadge.prototype.getDescription = function () {
            return this.descriptorFn(null);
        };
        return BaseBadge;
    }());
    exports.BaseBadge = BaseBadge;
    var NumberBadge = (function (_super) {
        __extends(NumberBadge, _super);
        function NumberBadge(number, descriptorFn) {
            _super.call(this, descriptorFn);
            this.number = number;
        }
        /* protected */ NumberBadge.prototype.getDescription = function () {
            return this.descriptorFn(this.number);
        };
        return NumberBadge;
    }(BaseBadge));
    exports.NumberBadge = NumberBadge;
    var TextBadge = (function (_super) {
        __extends(TextBadge, _super);
        function TextBadge(text, descriptorFn) {
            _super.call(this, descriptorFn);
            this.text = text;
        }
        return TextBadge;
    }(BaseBadge));
    exports.TextBadge = TextBadge;
    var IconBadge = (function (_super) {
        __extends(IconBadge, _super);
        function IconBadge(descriptorFn) {
            _super.call(this, descriptorFn);
        }
        return IconBadge;
    }(BaseBadge));
    exports.IconBadge = IconBadge;
    var ProgressBadge = (function (_super) {
        __extends(ProgressBadge, _super);
        function ProgressBadge() {
            _super.apply(this, arguments);
        }
        return ProgressBadge;
    }(BaseBadge));
    exports.ProgressBadge = ProgressBadge;
    exports.IActivityService = instantiation_1.createDecorator('activityService');
});
//# sourceMappingURL=activityService.js.map