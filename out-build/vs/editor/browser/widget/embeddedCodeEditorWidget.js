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
define(["require", "exports", 'vs/base/common/objects', 'vs/platform/instantiation/common/instantiation', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/telemetry/common/telemetry', 'vs/editor/common/editorCommon', 'vs/editor/common/services/codeEditorService', 'vs/editor/browser/widget/codeEditorWidget'], function (require, exports, objects, instantiation_1, keybindingService_1, telemetry_1, editorCommon_1, codeEditorService_1, codeEditorWidget_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var EmbeddedCodeEditorWidget = (function (_super) {
        __extends(EmbeddedCodeEditorWidget, _super);
        function EmbeddedCodeEditorWidget(domElement, options, parentEditor, instantiationService, codeEditorService, keybindingService, telemetryService) {
            var _this = this;
            _super.call(this, domElement, parentEditor.getRawConfiguration(), instantiationService, codeEditorService, keybindingService, telemetryService);
            this._parentEditor = parentEditor;
            this._overwriteOptions = options;
            // Overwrite parent's options
            _super.prototype.updateOptions.call(this, this._overwriteOptions);
            this._lifetimeDispose.push(parentEditor.addListener2(editorCommon_1.EventType.ConfigurationChanged, function (e) { return _this._onParentConfigurationChanged(e); }));
        }
        EmbeddedCodeEditorWidget.prototype._onParentConfigurationChanged = function (e) {
            _super.prototype.updateOptions.call(this, this._parentEditor.getRawConfiguration());
            _super.prototype.updateOptions.call(this, this._overwriteOptions);
        };
        EmbeddedCodeEditorWidget.prototype.updateOptions = function (newOptions) {
            objects.mixin(this._overwriteOptions, newOptions, true);
            _super.prototype.updateOptions.call(this, this._overwriteOptions);
        };
        EmbeddedCodeEditorWidget = __decorate([
            __param(3, instantiation_1.IInstantiationService),
            __param(4, codeEditorService_1.ICodeEditorService),
            __param(5, keybindingService_1.IKeybindingService),
            __param(6, telemetry_1.ITelemetryService)
        ], EmbeddedCodeEditorWidget);
        return EmbeddedCodeEditorWidget;
    }(codeEditorWidget_1.CodeEditorWidget));
    exports.EmbeddedCodeEditorWidget = EmbeddedCodeEditorWidget;
});
//# sourceMappingURL=embeddedCodeEditorWidget.js.map