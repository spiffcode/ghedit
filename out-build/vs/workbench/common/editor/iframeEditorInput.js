var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/workbench/common/editor'], function (require, exports, winjs_base_1, editor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * An editor input to use with the IFrameEditor.
     */
    var IFrameEditorInput = (function (_super) {
        __extends(IFrameEditorInput, _super);
        function IFrameEditorInput(resource, name, description) {
            _super.call(this);
            this.resource = resource;
            this.name = name;
            this.description = description;
        }
        IFrameEditorInput.prototype.getId = function () {
            return IFrameEditorInput.ID;
        };
        IFrameEditorInput.prototype.getResource = function () {
            return this.resource;
        };
        IFrameEditorInput.prototype.getName = function () {
            return this.name;
        };
        IFrameEditorInput.prototype.getDescription = function () {
            return this.description;
        };
        IFrameEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            var modelPromise;
            // Use Cached Model
            if (this.cachedModel && !refresh) {
                modelPromise = winjs_base_1.TPromise.as(this.cachedModel);
            }
            else if (this.cachedModel && refresh) {
                modelPromise = this.cachedModel.load();
            }
            else {
                var model = this.createModel();
                modelPromise = model.load();
            }
            return modelPromise.then(function (resolvedModel) {
                _this.cachedModel = resolvedModel;
                return _this.cachedModel;
            });
        };
        IFrameEditorInput.prototype.matches = function (otherInput) {
            if (_super.prototype.matches.call(this, otherInput) === true) {
                return true;
            }
            if (otherInput instanceof IFrameEditorInput) {
                var otherIFrameEditorInput = otherInput;
                // Otherwise compare by properties
                return otherIFrameEditorInput.resource.toString() === this.resource.toString();
            }
            return false;
        };
        IFrameEditorInput.prototype.dispose = function () {
            if (this.cachedModel) {
                this.cachedModel.dispose();
                this.cachedModel = null;
            }
            _super.prototype.dispose.call(this);
        };
        IFrameEditorInput.ID = 'workbench.editors.iFrameEditorInput';
        return IFrameEditorInput;
    }(editor_1.EditorInput));
    exports.IFrameEditorInput = IFrameEditorInput;
});
