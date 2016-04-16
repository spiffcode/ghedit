/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", 'vs/nls!vs/workbench/browser/parts/editor/binaryEditor', 'vs/base/common/winjs.base', 'vs/base/browser/builder', 'vs/base/browser/ui/resourceviewer/resourceViewer', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor/binaryEditorModel', 'vs/workbench/services/editor/common/editorService', 'vs/platform/telemetry/common/telemetry', 'vs/css!./media/binaryeditor'], function (require, exports, nls, winjs_base_1, builder_1, resourceViewer_1, baseEditor_1, binaryEditorModel_1, editorService_1, telemetry_1) {
    'use strict';
    /*
     * This class is only intended to be subclassed and not instantiated.
     */
    var BaseBinaryResourceEditor = (function (_super) {
        __extends(BaseBinaryResourceEditor, _super);
        function BaseBinaryResourceEditor(id, telemetryService, _editorService) {
            _super.call(this, id, telemetryService);
            this._editorService = _editorService;
        }
        BaseBinaryResourceEditor.prototype.getTitle = function () {
            return this.getInput() ? this.getInput().getName() : nls.localize(0, null);
        };
        Object.defineProperty(BaseBinaryResourceEditor.prototype, "editorService", {
            get: function () {
                return this._editorService;
            },
            enumerable: true,
            configurable: true
        });
        BaseBinaryResourceEditor.prototype.createEditor = function (parent) {
            // Container for Binary
            var binaryContainerElement = document.createElement('div');
            binaryContainerElement.className = 'binary-container';
            this.binaryContainer = builder_1.$(binaryContainerElement);
            this.binaryContainer.tabindex(0); // enable focus support from the editor part (do not remove)
            parent.getHTMLElement().appendChild(this.binaryContainer.getHTMLElement());
        };
        BaseBinaryResourceEditor.prototype.setInput = function (input, options) {
            var _this = this;
            var oldInput = this.getInput();
            _super.prototype.setInput.call(this, input, options);
            // Detect options
            var forceOpen = options && options.forceOpen;
            // Same Input
            if (!forceOpen && input.matches(oldInput)) {
                return winjs_base_1.TPromise.as(null);
            }
            // Different Input (Reload)
            return this._editorService.resolveEditorModel(input, true /* Reload */).then(function (resolvedModel) {
                // Assert Model instance
                if (!(resolvedModel instanceof binaryEditorModel_1.BinaryEditorModel)) {
                    return winjs_base_1.TPromise.wrapError('Invalid editor input. Binary resource editor requires a model instance of BinaryEditorModel.');
                }
                // Assert that the current input is still the one we expect. This prevents a race condition when loading takes long and another input was set meanwhile
                if (!_this.getInput() || _this.getInput() !== input) {
                    return null;
                }
                // Render Input
                var binaryResourceModel = resolvedModel;
                resourceViewer_1.ResourceViewer.show(binaryResourceModel.getName(), binaryResourceModel.getResource(), _this.binaryContainer);
                return winjs_base_1.TPromise.as(null);
            });
        };
        BaseBinaryResourceEditor.prototype.clearInput = function () {
            // Empty HTML Container
            builder_1.$(this.binaryContainer).empty();
            _super.prototype.clearInput.call(this);
        };
        BaseBinaryResourceEditor.prototype.layout = function (dimension) {
            // Pass on to Binary Container
            this.binaryContainer.size(dimension.width, dimension.height);
        };
        BaseBinaryResourceEditor.prototype.focus = function () {
            this.binaryContainer.domFocus();
        };
        BaseBinaryResourceEditor.prototype.dispose = function () {
            // Destroy Container
            this.binaryContainer.destroy();
            _super.prototype.dispose.call(this);
        };
        return BaseBinaryResourceEditor;
    }(baseEditor_1.BaseEditor));
    exports.BaseBinaryResourceEditor = BaseBinaryResourceEditor;
    /**
     * An implementation of editor for binary files like images or videos.
     */
    var BinaryResourceEditor = (function (_super) {
        __extends(BinaryResourceEditor, _super);
        function BinaryResourceEditor(telemetryService, editorService) {
            _super.call(this, BinaryResourceEditor.ID, telemetryService, editorService);
        }
        BinaryResourceEditor.ID = 'workbench.editors.binaryResourceEditor';
        BinaryResourceEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, editorService_1.IWorkbenchEditorService)
        ], BinaryResourceEditor);
        return BinaryResourceEditor;
    }(BaseBinaryResourceEditor));
    exports.BinaryResourceEditor = BinaryResourceEditor;
});
//# sourceMappingURL=binaryEditor.js.map