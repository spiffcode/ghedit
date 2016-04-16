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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/editor/common/editorCommon', 'vs/workbench/common/editor', 'vs/editor/common/services/modeService', 'vs/editor/common/services/modelService', 'vs/editor/common/model/textModel'], function (require, exports, winjs_base_1, editorCommon_1, editor_1, modeService_1, modelService_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * The base text editor model leverages the monaco code editor model. This class is only intended to be subclassed and not instantiated.
     */
    var BaseTextEditorModel = (function (_super) {
        __extends(BaseTextEditorModel, _super);
        function BaseTextEditorModel(modelService, modeService, textEditorModelHandle) {
            var _this = this;
            _super.call(this);
            this.modelService = modelService;
            this.modeService = modeService;
            this.textEditorModelHandle = textEditorModelHandle;
            if (textEditorModelHandle) {
                // We need the resource to point to an existing model
                var model = modelService.getModel(textEditorModelHandle);
                if (!model) {
                    throw new Error("Document with resource " + textEditorModelHandle.toString() + " does not exist");
                }
                // Since we did not create the model, we need to listen to it disposing
                // and properly trigger our dispose function so that events get emitted
                var unbind_1 = model.addListener(editorCommon_1.EventType.ModelDispose, function () {
                    _this.textEditorModelHandle = null; // make sure we do not dispose code editor model again
                    unbind_1();
                    _this.dispose();
                });
            }
        }
        Object.defineProperty(BaseTextEditorModel.prototype, "textEditorModel", {
            get: function () {
                return this.textEditorModelHandle ? this.modelService.getModel(this.textEditorModelHandle) : null;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Creates the text editor model with the provided value, mime (can be comma separated for multiple values) and optional resource URL.
         */
        BaseTextEditorModel.prototype.createTextEditorModel = function (value, resource, mime) {
            var _this = this;
            var firstLineText = this.getFirstLineText(value);
            // To avoid flickering, give the mode at most 50ms to load. If the mode doesn't load in 50ms, proceed creating the model with a mode promise
            return winjs_base_1.TPromise.any([winjs_base_1.TPromise.timeout(50), this.getOrCreateMode(this.modeService, mime, firstLineText)]).then(function () {
                var model = _this.modelService.createModel(value, _this.getOrCreateMode(_this.modeService, mime, firstLineText), resource);
                _this.createdEditorModel = true;
                _this.textEditorModelHandle = model.getAssociatedResource();
                return _this;
            });
        };
        BaseTextEditorModel.prototype.getFirstLineText = function (value) {
            var firstLineText = value.substr(0, 100);
            var crIndex = firstLineText.indexOf('\r');
            if (crIndex < 0) {
                crIndex = firstLineText.length;
            }
            var lfIndex = firstLineText.indexOf('\n');
            if (lfIndex < 0) {
                lfIndex = firstLineText.length;
            }
            firstLineText = firstLineText.substr(0, Math.min(crIndex, lfIndex));
            return firstLineText;
        };
        /**
         * Gets the mode for the given identifier. Subclasses can override to provide their own implementation of this lookup.
         *
         * @param firstLineText optional first line of the text buffer to set the mode on. This can be used to guess a mode from content.
         */
        BaseTextEditorModel.prototype.getOrCreateMode = function (modeService, mime, firstLineText) {
            return modeService.getOrCreateMode(mime);
        };
        /**
         * Updates the text editor model with the provided value. If the value is the same as the model has, this is a no-op.
         */
        BaseTextEditorModel.prototype.updateTextEditorModel = function (newValue) {
            if (!this.textEditorModel) {
                return;
            }
            var rawText = textModel_1.RawText.fromStringWithModelOptions(newValue, this.textEditorModel);
            // Return early if the text is already set in that form
            if (this.textEditorModel.equals(rawText)) {
                return;
            }
            // Otherwise update model
            this.textEditorModel.setValueFromRawText(rawText);
        };
        /**
         * Returns the textual value of this editor model or null if it has not yet been created.
         */
        BaseTextEditorModel.prototype.getValue = function () {
            var model = this.textEditorModel;
            if (model) {
                return model.getValue(editorCommon_1.EndOfLinePreference.TextDefined, true /* Preserve BOM */);
            }
            return null;
        };
        BaseTextEditorModel.prototype.dispose = function () {
            if (this.textEditorModelHandle && this.createdEditorModel) {
                this.modelService.destroyModel(this.textEditorModelHandle);
            }
            this.textEditorModelHandle = null;
            this.createdEditorModel = false;
            _super.prototype.dispose.call(this);
        };
        BaseTextEditorModel.prototype.isResolved = function () {
            return !!this.textEditorModelHandle;
        };
        BaseTextEditorModel = __decorate([
            __param(0, modelService_1.IModelService),
            __param(1, modeService_1.IModeService)
        ], BaseTextEditorModel);
        return BaseTextEditorModel;
    }(editor_1.EditorModel));
    exports.BaseTextEditorModel = BaseTextEditorModel;
});
