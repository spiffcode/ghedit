define(["require", "exports", 'vs/base/common/async', 'vs/base/common/lifecycle', 'vs/editor/common/services/resourceService'], function (require, exports, async_1, lifecycle_1, resourceService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ValidationModel = (function () {
        function ValidationModel(model, changeCallback) {
            var _this = this;
            this._toDispose = [];
            this._changeCallback = changeCallback;
            this._model = model;
            this._isDirty = false;
            this._toDispose.push({
                dispose: model.addBulkListener(function (events) { return _this._onModelChanged(events); })
            });
        }
        ValidationModel.prototype.dispose = function () {
            this._toDispose = lifecycle_1.dispose(this._toDispose);
            this._changeCallback = null;
        };
        ValidationModel.prototype.markAsClean = function () {
            this._isDirty = false;
        };
        ValidationModel.prototype.markAsDirty = function () {
            this._isDirty = true;
        };
        ValidationModel.prototype.isDirty = function () {
            return this._isDirty;
        };
        ValidationModel.prototype.getMirrorModel = function () {
            return this._model;
        };
        ValidationModel.prototype._onModelChanged = function (events) {
            var containsChanged = false;
            for (var i = 0; !containsChanged && i < events.length; i++) {
                if (events[i].getType() === 'changed') {
                    containsChanged = true;
                }
            }
            if (containsChanged) {
                this._changeCallback(this);
            }
        };
        return ValidationModel;
    }());
    var ValidationHelper = (function () {
        function ValidationHelper(resourceService, modeId, callback) {
            var _this = this;
            this._toDispose = [];
            this._resourceService = resourceService;
            this._callback = callback;
            this._filter = function (resource) { return (resource.getMode().getId() === modeId); };
            this._validationDelay = 500;
            this._models = {};
            this._isDueToConfigurationChange = false;
            this._toDispose.push(this._resourceService.addListener2_(resourceService_1.ResourceEvents.ADDED, function (e) {
                _this._onResourceAdded(e);
            }));
            this._toDispose.push(this._resourceService.addListener2_(resourceService_1.ResourceEvents.REMOVED, function (e) {
                _this._onResourceRemoved(e);
            }));
            this._validate = new async_1.RunOnceScheduler(function () { return _this._invokeCallback(); }, this._validationDelay);
            this._toDispose.push(this._validate);
            this._resourceService.all().forEach(function (element) { return _this._addElement(element); });
        }
        ValidationHelper.prototype.dispose = function () {
            var _this = this;
            this._toDispose = lifecycle_1.dispose(this._toDispose);
            lifecycle_1.dispose(Object.keys(this._models).map(function (modelUrl) { return _this._models[modelUrl]; }));
            this._models = null;
        };
        ValidationHelper.prototype.trigger = function () {
            this._validate.schedule();
        };
        ValidationHelper.prototype.triggerDueToConfigurationChange = function () {
            this._isDueToConfigurationChange = true;
            this._validate.schedule();
        };
        ValidationHelper.prototype._addElement = function (element) {
            var _this = this;
            if (!this._filter(element)) {
                return;
            }
            var model = element;
            var validationModel = new ValidationModel(model, function (model) { return _this._onChanged(model); });
            this._models[model.getAssociatedResource().toString()] = validationModel;
            this._onChanged(validationModel);
        };
        ValidationHelper.prototype._onResourceAdded = function (e) {
            var stringUrl = e.url.toString();
            if (this._models.hasOwnProperty(stringUrl)) {
                this._models[stringUrl].dispose();
            }
            this._addElement(e.addedElement);
        };
        ValidationHelper.prototype._onResourceRemoved = function (e) {
            var stringUrl = e.url.toString();
            if (this._models.hasOwnProperty(stringUrl)) {
                this._models[stringUrl].dispose();
                delete this._models[stringUrl];
            }
        };
        ValidationHelper.prototype._onChanged = function (model) {
            model.markAsDirty();
            this._validate.schedule();
        };
        ValidationHelper.prototype._invokeCallback = function () {
            var _this = this;
            if (!this._isEnabled) {
                return;
            }
            var dirtyModels = [];
            var cleanModels = [];
            Object.keys(this._models)
                .map(function (modelUrl) { return _this._models[modelUrl]; })
                .forEach(function (model) {
                if (model.isDirty()) {
                    dirtyModels.push(model.getMirrorModel().getAssociatedResource());
                    model.markAsClean();
                }
                else {
                    cleanModels.push(model.getMirrorModel().getAssociatedResource());
                }
            });
            var isDueToConfigurationChange = this._isDueToConfigurationChange;
            this._isDueToConfigurationChange = false;
            var toValidate = dirtyModels;
            if (isDueToConfigurationChange) {
                toValidate = toValidate.concat(cleanModels);
            }
            this._callback(toValidate);
        };
        ValidationHelper.prototype.enable = function () {
            this._isEnabled = true;
            this.trigger();
        };
        return ValidationHelper;
    }());
    exports.ValidationHelper = ValidationHelper;
});
//# sourceMappingURL=validationHelper.js.map