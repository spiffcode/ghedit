var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/workbench/common/editor/resourceEditorInput'], function (require, exports, resourceEditorInput_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var HtmlInput = (function (_super) {
        __extends(HtmlInput, _super);
        function HtmlInput() {
            _super.apply(this, arguments);
        }
        // just a marker class
        HtmlInput.prototype.getResource = function () {
            return this.resource;
        };
        return HtmlInput;
    }(resourceEditorInput_1.ResourceEditorInput));
    exports.HtmlInput = HtmlInput;
});
//# sourceMappingURL=htmlInput.js.map