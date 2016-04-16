var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/workbench/common/editor/textEditorModel', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/services/modeService', 'vs/editor/common/services/modelService', 'vs/editor/common/core/editOperation'], function (require, exports, winjs_base_1, textEditorModel_1, position_1, range_1, modeService_1, modelService_1, editOperation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * An editor model whith an in-memory, readonly content that is not backed by any particular resource.
     */
    var StringEditorModel = (function (_super) {
        __extends(StringEditorModel, _super);
        function StringEditorModel(value, mime, resource, modeService, modelService) {
            _super.call(this, modelService, modeService);
            this.value = value;
            this.mime = mime;
            this.resource = resource;
        }
        /**
         * The value of this string editor model.
         */
        StringEditorModel.prototype.getValue = function () {
            return this.value;
        };
        /**
         * Sets the value of this string editor model.
         */
        StringEditorModel.prototype.setValue = function (value) {
            this.value = value;
            if (this.textEditorModel) {
                this.textEditorModel.setValue(value);
            }
        };
        /**
         * Appends value to this string editor model.
         */
        StringEditorModel.prototype.append = function (value) {
            this.value += value;
            if (this.textEditorModel) {
                var model = this.textEditorModel;
                var lastLine = model.getLineCount();
                var lastLineMaxColumn = model.getLineMaxColumn(lastLine);
                model.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(lastLine, lastLineMaxColumn), value)]);
            }
        };
        /**
         * Clears the value of this string editor model
         */
        StringEditorModel.prototype.clearValue = function () {
            this.value = '';
            if (this.textEditorModel) {
                var model = this.textEditorModel;
                var lastLine = model.getLineCount();
                model.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, lastLine, model.getLineMaxColumn(lastLine)))]);
            }
        };
        /**
         * Removes all lines from the top if the line number exceeds the given line count. Returns the new value if lines got trimmed.
         */
        StringEditorModel.prototype.trim = function (linecount) {
            if (this.textEditorModel) {
                var model = this.textEditorModel;
                var lastLine = model.getLineCount();
                if (lastLine > linecount) {
                    model.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, lastLine - linecount + 1, 1))]);
                    var newValue = model.getValue();
                    this.value = newValue;
                    return this.value;
                }
            }
            return null;
        };
        StringEditorModel.prototype.getMime = function () {
            return this.mime;
        };
        StringEditorModel.prototype.load = function () {
            // Create text editor model if not yet done
            if (!this.textEditorModel) {
                return this.createTextEditorModel(this.value, this.resource, this.mime);
            }
            else {
                this.updateTextEditorModel(this.value);
            }
            return winjs_base_1.TPromise.as(this);
        };
        StringEditorModel = __decorate([
            __param(3, modeService_1.IModeService),
            __param(4, modelService_1.IModelService)
        ], StringEditorModel);
        return StringEditorModel;
    }(textEditorModel_1.BaseTextEditorModel));
    exports.StringEditorModel = StringEditorModel;
});
