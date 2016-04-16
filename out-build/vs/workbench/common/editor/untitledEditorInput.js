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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/mime', 'vs/base/common/labels', 'vs/base/common/paths', 'vs/workbench/common/editor', 'vs/workbench/common/editor/untitledEditorModel', 'vs/platform/instantiation/common/instantiation', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/workspace/common/workspace', 'vs/editor/common/services/modeService'], function (require, exports, winjs_base_1, mime_1, labels, paths, editor_1, untitledEditorModel_1, instantiation_1, lifecycle_1, workspace_1, modeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * An editor input to be used for untitled text buffers.
     */
    var UntitledEditorInput = (function (_super) {
        __extends(UntitledEditorInput, _super);
        function UntitledEditorInput(resource, hasAssociatedFilePath, modeId, instantiationService, lifecycleService, contextService, modeService) {
            _super.call(this);
            this.instantiationService = instantiationService;
            this.lifecycleService = lifecycleService;
            this.contextService = contextService;
            this.modeService = modeService;
            this.resource = resource;
            this.hasAssociatedFilePath = hasAssociatedFilePath;
            this.modeId = modeId;
        }
        UntitledEditorInput.prototype.getId = function () {
            return UntitledEditorInput.ID;
        };
        UntitledEditorInput.prototype.getResource = function () {
            return this.resource;
        };
        UntitledEditorInput.prototype.getName = function () {
            return this.hasAssociatedFilePath ? paths.basename(this.resource.fsPath) : this.resource.fsPath;
        };
        UntitledEditorInput.prototype.getDescription = function () {
            return this.hasAssociatedFilePath ? labels.getPathLabel(paths.dirname(this.resource.fsPath), this.contextService) : null;
        };
        UntitledEditorInput.prototype.isDirty = function () {
            return this.cachedModel && this.cachedModel.isDirty();
        };
        UntitledEditorInput.prototype.getStatus = function () {
            var isDirty = this.isDirty();
            if (isDirty) {
                return { state: 'dirty', decoration: '\u25cf' };
            }
            return null;
        };
        UntitledEditorInput.prototype.suggestFileName = function () {
            if (!this.hasAssociatedFilePath) {
                var mime = this.getMime();
                if (mime && mime !== mime_1.MIME_TEXT /* do not suggest when the mime type is simple plain text */) {
                    return mime_1.suggestFilename(mime, this.getName());
                }
            }
            return this.getName();
        };
        UntitledEditorInput.prototype.getMime = function () {
            if (this.cachedModel) {
                return this.modeService.getMimeForMode(this.cachedModel.getModeId());
            }
            return null;
        };
        UntitledEditorInput.prototype.getEncoding = function () {
            if (this.cachedModel) {
                return this.cachedModel.getEncoding();
            }
            return null;
        };
        UntitledEditorInput.prototype.setEncoding = function (encoding, mode /* ignored, we only have Encode */) {
            if (this.cachedModel) {
                this.cachedModel.setEncoding(encoding);
            }
        };
        UntitledEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            // Use Cached Model
            if (this.cachedModel) {
                return winjs_base_1.TPromise.as(this.cachedModel);
            }
            // Otherwise Create Model and load
            var model = this.createModel();
            return model.load().then(function (resolvedModel) {
                _this.cachedModel = resolvedModel;
                return _this.cachedModel;
            });
        };
        UntitledEditorInput.prototype.createModel = function () {
            var content = '';
            var mime = this.modeId;
            if (!mime && this.hasAssociatedFilePath) {
                var mimeFromPath = mime_1.guessMimeTypes(this.resource.fsPath)[0];
                if (!mime_1.isUnspecific(mimeFromPath)) {
                    mime = mimeFromPath; // take most specific mime type if file path is associated and mime is specific
                }
            }
            return this.instantiationService.createInstance(untitledEditorModel_1.UntitledEditorModel, content, mime || mime_1.MIME_TEXT, this.resource, this.hasAssociatedFilePath);
        };
        UntitledEditorInput.prototype.matches = function (otherInput) {
            if (_super.prototype.matches.call(this, otherInput) === true) {
                return true;
            }
            if (otherInput instanceof UntitledEditorInput) {
                var otherUntitledEditorInput = otherInput;
                // Otherwise compare by properties
                return otherUntitledEditorInput.resource.toString() === this.resource.toString();
            }
            return false;
        };
        UntitledEditorInput.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.cachedModel) {
                this.cachedModel.dispose();
                this.cachedModel = null;
            }
        };
        UntitledEditorInput.ID = 'workbench.editors.untitledEditorInput';
        UntitledEditorInput.SCHEMA = 'untitled';
        UntitledEditorInput = __decorate([
            __param(3, instantiation_1.IInstantiationService),
            __param(4, lifecycle_1.ILifecycleService),
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, modeService_1.IModeService)
        ], UntitledEditorInput);
        return UntitledEditorInput;
    }(editor_1.UntitledEditorInput));
    exports.UntitledEditorInput = UntitledEditorInput;
});
