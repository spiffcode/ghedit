/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/viewModel/viewEventHandler'], function (require, exports, viewEventHandler_1) {
    'use strict';
    var DynamicViewOverlay = (function (_super) {
        __extends(DynamicViewOverlay, _super);
        function DynamicViewOverlay() {
            _super.apply(this, arguments);
        }
        return DynamicViewOverlay;
    }(viewEventHandler_1.ViewEventHandler));
    exports.DynamicViewOverlay = DynamicViewOverlay;
});
