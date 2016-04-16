var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/languages/css/common/cssWorker', './parser/lessParser', './services/intelliSense'], function (require, exports, cssWorker, lessParser, lessIntellisense) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LessWorker = (function (_super) {
        __extends(LessWorker, _super);
        function LessWorker() {
            _super.apply(this, arguments);
        }
        LessWorker.prototype.createIntellisense = function () {
            return new lessIntellisense.LESSIntellisense();
        };
        LessWorker.prototype.createParser = function () {
            return new lessParser.LessParser();
        };
        return LessWorker;
    }(cssWorker.CSSWorker));
    exports.LessWorker = LessWorker;
});
//# sourceMappingURL=lessWorker.js.map