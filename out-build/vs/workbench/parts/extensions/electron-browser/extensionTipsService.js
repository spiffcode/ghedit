/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/objects', 'vs/base/common/lifecycle', 'vs/base/common/glob', 'vs/workbench/parts/extensions/common/extensions', 'vs/editor/common/services/modelService', 'vs/platform/storage/common/storage', 'vs/platform/workspace/common/workspace'], function (require, exports, objects_1, lifecycle_1, glob_1, extensions_1, modelService_1, storage_1, workspace_1) {
    "use strict";
    var ExtensionTipsService = (function () {
        function ExtensionTipsService(_galleryService, _modelService, _storageService, contextService) {
            var _this = this;
            this._galleryService = _galleryService;
            this._modelService = _modelService;
            this._storageService = _storageService;
            this._disposables = [];
            if (!this._galleryService.isEnabled()) {
                return;
            }
            this._recommendations = objects_1.toObject(JSON.parse(_storageService.get('extensionsAssistant/recommendations', storage_1.StorageScope.GLOBAL, '[]')), function (id) { return id; }, function () { return true; });
            var extensionTips = contextService.getConfiguration().env.extensionTips;
            if (extensionTips) {
                this._availableRecommendations = extensionTips;
                this._disposables.push(this._modelService.onModelAdded(function (model) {
                    _this._suggest(model.getAssociatedResource());
                }));
                for (var _i = 0, _a = this._modelService.getModels(); _i < _a.length; _i++) {
                    var model = _a[_i];
                    this._suggest(model.getAssociatedResource());
                }
            }
        }
        ExtensionTipsService.prototype.getRecommendations = function () {
            var ids = Object.keys(this._recommendations);
            return this._galleryService.query({ ids: ids, pageSize: ids.length })
                .then(function (result) { return result.firstPage; }, function () { return []; });
        };
        ExtensionTipsService.prototype._suggest = function (uri) {
            var _this = this;
            if (!uri) {
                return;
            }
            var ids = Object.keys(this._availableRecommendations);
            var recommendations = ids
                .filter(function (id) { return glob_1.match(_this._availableRecommendations[id], uri.fsPath); });
            recommendations.forEach(function (r) { return _this._recommendations[r] = true; });
            this._storageService.store('extensionsAssistant/recommendations', JSON.stringify(Object.keys(this._recommendations)), storage_1.StorageScope.GLOBAL);
        };
        ExtensionTipsService.prototype.dispose = function () {
            this._disposables = lifecycle_1.dispose(this._disposables);
        };
        ExtensionTipsService = __decorate([
            __param(0, extensions_1.IGalleryService),
            __param(1, modelService_1.IModelService),
            __param(2, storage_1.IStorageService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], ExtensionTipsService);
        return ExtensionTipsService;
    }());
    exports.ExtensionTipsService = ExtensionTipsService;
});
//# sourceMappingURL=extensionTipsService.js.map