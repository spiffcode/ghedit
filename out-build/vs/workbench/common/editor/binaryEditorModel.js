var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/workbench/common/editor'], function (require, exports, editor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * An editor model that just represents a resource and mime for a resource that can be loaded.
     */
    var BinaryEditorModel = (function (_super) {
        __extends(BinaryEditorModel, _super);
        function BinaryEditorModel(resource, name) {
            _super.call(this);
            this.name = name;
            this.resource = resource;
        }
        /**
         * The name of the binary resource.
         */
        BinaryEditorModel.prototype.getName = function () {
            return this.name;
        };
        /**
         * The resource of the binary resource.
         */
        BinaryEditorModel.prototype.getResource = function () {
            return this.resource;
        };
        return BinaryEditorModel;
    }(editor_1.EditorModel));
    exports.BinaryEditorModel = BinaryEditorModel;
});
