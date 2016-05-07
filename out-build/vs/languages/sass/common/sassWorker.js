var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/languages/css/common/cssWorker', './parser/sassParser', './services/intelliSense'], function (require, exports, cssWorker, sassParser, sassIntellisense) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SassWorker = (function (_super) {
        __extends(SassWorker, _super);
        function SassWorker() {
            _super.apply(this, arguments);
        }
        SassWorker.prototype.createIntellisense = function () {
            return new sassIntellisense.SASSIntellisense();
        };
        SassWorker.prototype.createParser = function () {
            return new sassParser.SassParser();
        };
        return SassWorker;
    }(cssWorker.CSSWorker));
    exports.SassWorker = SassWorker;
});
//# sourceMappingURL=sassWorker.js.map