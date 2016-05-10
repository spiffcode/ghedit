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
define(["require", "exports", 'vs/base/common/collections', 'vs/base/common/lifecycle', 'vs/base/common/glob', 'vs/workbench/parts/extensions/common/extensions', 'vs/editor/common/services/modelService', 'vs/platform/storage/common/storage', 'vs/platform/workspace/common/workspace'], function (require, exports, collections_1, lifecycle_1, glob_1, extensions_1, modelService_1, storage_1, workspace_1) {
    "use strict";
    var ExtensionTipsService = (function () {
        function ExtensionTipsService(_galleryService, _modelService, _storageService, contextService) {
            var _this = this;
            this._galleryService = _galleryService;
            this._modelService = _modelService;
            this._storageService = _storageService;
            this.serviceId = extensions_1.IExtensionTipsService;
            this._recommendations = Object.create(null);
            this._availableRecommendations = Object.create(null);
            this._disposables = [];
            if (!this._galleryService.isEnabled()) {
                return;
            }
            var extensionTips = contextService.getConfiguration().env.extensionTips;
            if (!extensionTips) {
                return;
            }
            // retrieve ids of previous recommendations
            var storedRecommendations = JSON.parse(_storageService.get('extensionsAssistant/recommendations', storage_1.StorageScope.GLOBAL, '[]'));
            for (var _i = 0, storedRecommendations_1 = storedRecommendations; _i < storedRecommendations_1.length; _i++) {
                var id = storedRecommendations_1[_i];
                this._recommendations[id] = true;
            }
            // group ids by pattern, like {**/*.md} -> [ext.foo1, ext.bar2]
            this._availableRecommendations = Object.create(null);
            collections_1.forEach(extensionTips, function (entry) {
                var id = entry.key, pattern = entry.value;
                var ids = _this._availableRecommendations[pattern];
                if (!ids) {
                    _this._availableRecommendations[pattern] = [id];
                }
                else {
                    ids.push(id);
                }
            });
            this._disposables.push(this._modelService.onModelAdded(function (model) {
                _this._suggest(model.getAssociatedResource());
            }));
            for (var _a = 0, _b = this._modelService.getModels(); _a < _b.length; _a++) {
                var model = _b[_a];
                this._suggest(model.getAssociatedResource());
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
            // re-schedule this bit of the operation to be off
            // the critical path - in case glob-match is slow
            setImmediate(function () {
                collections_1.forEach(_this._availableRecommendations, function (entry) {
                    var pattern = entry.key, ids = entry.value;
                    if (glob_1.match(pattern, uri.fsPath)) {
                        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                            var id = ids_1[_i];
                            _this._recommendations[id] = true;
                        }
                    }
                });
                _this._storageService.store('extensionsAssistant/recommendations', JSON.stringify(Object.keys(_this._recommendations)), storage_1.StorageScope.GLOBAL);
            });
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