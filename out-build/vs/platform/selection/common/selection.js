var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Selection = (function () {
        function Selection(selection) {
            this._selection = selection || [];
        }
        Object.defineProperty(Selection.prototype, "selection", {
            get: function () {
                return this._selection;
            },
            enumerable: true,
            configurable: true
        });
        Selection.prototype.isEmpty = function () {
            return this._selection.length === 0;
        };
        Selection.EMPTY = new Selection([]);
        return Selection;
    }());
    exports.Selection = Selection;
    var StructuredSelection = (function (_super) {
        __extends(StructuredSelection, _super);
        function StructuredSelection() {
            _super.apply(this, arguments);
        }
        StructuredSelection.prototype.toArray = function () {
            return this.selection;
        };
        return StructuredSelection;
    }(Selection));
    exports.StructuredSelection = StructuredSelection;
});
