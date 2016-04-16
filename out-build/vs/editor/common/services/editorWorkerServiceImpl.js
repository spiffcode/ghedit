var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/async', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/base/common/worker/simpleWorker', 'vs/base/worker/defaultWorkerFactory', 'vs/editor/common/editorCommon', 'vs/editor/common/model/textModelWithTokensHelpers', 'vs/editor/common/services/editorSimpleWorkerCommon', 'vs/editor/common/services/editorWorkerService'], function (require, exports, async_1, lifecycle_1, winjs_base_1, simpleWorker_1, defaultWorkerFactory_1, editorCommon, textModelWithTokensHelpers_1, editorSimpleWorkerCommon_1, editorWorkerService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Stop syncing a model to the worker if it was not needed for 1 min.
     */
    var STOP_SYNC_MODEL_DELTA_TIME_MS = 60 * 1000;
    /**
     * Stop the worker if it was not needed for 5 min.
     */
    var STOP_WORKER_DELTA_TIME_MS = 5 * 60 * 1000;
    var EditorWorkerServiceImpl = (function () {
        function EditorWorkerServiceImpl(modelService) {
            this.serviceId = editorWorkerService_1.IEditorWorkerService;
            this._workerManager = new WorkerManager(modelService);
        }
        EditorWorkerServiceImpl.prototype.computeDiff = function (original, modified, ignoreTrimWhitespace) {
            return this._workerManager.withWorker().then(function (client) { return client.computeDiff(original, modified, ignoreTrimWhitespace); });
        };
        EditorWorkerServiceImpl.prototype.computeDirtyDiff = function (original, modified, ignoreTrimWhitespace) {
            return this._workerManager.withWorker().then(function (client) { return client.computeDirtyDiff(original, modified, ignoreTrimWhitespace); });
        };
        EditorWorkerServiceImpl.prototype.computeLinks = function (resource) {
            return this._workerManager.withWorker().then(function (client) { return client.computeLinks(resource); });
        };
        EditorWorkerServiceImpl.prototype.textualSuggest = function (resource, position) {
            return this._workerManager.withWorker().then(function (client) { return client.textualSuggest(resource, position); });
        };
        EditorWorkerServiceImpl.prototype.navigateValueSet = function (resource, range, up) {
            return this._workerManager.withWorker().then(function (client) { return client.navigateValueSet(resource, range, up); });
        };
        return EditorWorkerServiceImpl;
    }());
    exports.EditorWorkerServiceImpl = EditorWorkerServiceImpl;
    var WorkerManager = (function (_super) {
        __extends(WorkerManager, _super);
        function WorkerManager(modelService) {
            var _this = this;
            _super.call(this);
            this._modelService = modelService;
            this._editorWorkerClient = null;
            var stopWorkerInterval = this._register(new async_1.IntervalTimer());
            stopWorkerInterval.cancelAndSet(function () { return _this._checkStopWorker(); }, Math.round(STOP_WORKER_DELTA_TIME_MS / 2));
        }
        WorkerManager.prototype.dispose = function () {
            if (this._editorWorkerClient) {
                this._editorWorkerClient.dispose();
                this._editorWorkerClient = null;
            }
            _super.prototype.dispose.call(this);
        };
        WorkerManager.prototype._checkStopWorker = function () {
            if (!this._editorWorkerClient) {
                return;
            }
            var timeSinceLastWorkerUsedTime = (new Date()).getTime() - this._lastWorkerUsedTime;
            if (timeSinceLastWorkerUsedTime > STOP_WORKER_DELTA_TIME_MS) {
                this._editorWorkerClient.dispose();
                this._editorWorkerClient = null;
            }
        };
        WorkerManager.prototype.withWorker = function () {
            this._lastWorkerUsedTime = (new Date()).getTime();
            if (!this._editorWorkerClient) {
                this._editorWorkerClient = new EditorWorkerClient(this._modelService);
            }
            return winjs_base_1.TPromise.as(this._editorWorkerClient);
        };
        return WorkerManager;
    }(lifecycle_1.Disposable));
    var EditorModelManager = (function (_super) {
        __extends(EditorModelManager, _super);
        function EditorModelManager(proxy, modelService, keepIdleModels) {
            var _this = this;
            _super.call(this);
            this._syncedModels = Object.create(null);
            this._syncedModelsLastUsedTime = Object.create(null);
            this._proxy = proxy;
            this._modelService = modelService;
            if (!keepIdleModels) {
                var timer = new async_1.IntervalTimer();
                timer.cancelAndSet(function () { return _this._checkStopModelSync(); }, Math.round(STOP_SYNC_MODEL_DELTA_TIME_MS / 2));
                this._register(timer);
            }
        }
        EditorModelManager.prototype.dispose = function () {
            for (var modelUrl in this._syncedModels) {
                lifecycle_1.dispose(this._syncedModels[modelUrl]);
            }
            this._syncedModels = Object.create(null);
            this._syncedModelsLastUsedTime = Object.create(null);
            _super.prototype.dispose.call(this);
        };
        EditorModelManager.prototype.withSyncedResources = function (resources) {
            for (var i = 0; i < resources.length; i++) {
                var resource = resources[i];
                var resourceStr = resource.toString();
                if (!this._syncedModels[resourceStr]) {
                    this._beginModelSync(resource);
                }
                if (this._syncedModels[resourceStr]) {
                    this._syncedModelsLastUsedTime[resourceStr] = (new Date()).getTime();
                }
            }
            return winjs_base_1.TPromise.as(null);
        };
        EditorModelManager.prototype._checkStopModelSync = function () {
            var currentTime = (new Date()).getTime();
            var toRemove = [];
            for (var modelUrl in this._syncedModelsLastUsedTime) {
                var elapsedTime = currentTime - this._syncedModelsLastUsedTime[modelUrl];
                if (elapsedTime > STOP_SYNC_MODEL_DELTA_TIME_MS) {
                    toRemove.push(modelUrl);
                }
            }
            for (var i = 0; i < toRemove.length; i++) {
                this._stopModelSync(toRemove[i]);
            }
        };
        EditorModelManager.prototype._beginModelSync = function (resource) {
            var _this = this;
            var modelUrl = resource.toString();
            var model = this._modelService.getModel(resource);
            if (!model) {
                return;
            }
            if (model.isTooLargeForHavingARichMode()) {
                return;
            }
            this._proxy.acceptNewModel({
                url: model.getAssociatedResource().toString(),
                value: model.toRawText(),
                versionId: model.getVersionId()
            });
            var toDispose = [];
            toDispose.push(model.addBulkListener2(function (events) {
                var changedEvents = [];
                for (var i = 0, len = events.length; i < len; i++) {
                    var e = events[i];
                    switch (e.getType()) {
                        case editorCommon.EventType.ModelContentChanged2:
                            changedEvents.push(e.getData());
                            break;
                        case editorCommon.EventType.ModelDispose:
                            _this._stopModelSync(modelUrl);
                            return;
                    }
                }
                if (changedEvents.length > 0) {
                    _this._proxy.acceptModelChanged(modelUrl.toString(), changedEvents);
                }
            }));
            toDispose.push({
                dispose: function () {
                    _this._proxy.acceptRemovedModel(modelUrl);
                }
            });
            this._syncedModels[modelUrl] = toDispose;
        };
        EditorModelManager.prototype._stopModelSync = function (modelUrl) {
            var toDispose = this._syncedModels[modelUrl];
            delete this._syncedModels[modelUrl];
            delete this._syncedModelsLastUsedTime[modelUrl];
            lifecycle_1.dispose(toDispose);
        };
        return EditorModelManager;
    }(lifecycle_1.Disposable));
    exports.EditorModelManager = EditorModelManager;
    var EditorWorkerClient = (function (_super) {
        __extends(EditorWorkerClient, _super);
        function EditorWorkerClient(modelService) {
            _super.call(this);
            this._modelService = modelService;
            this._worker = this._register(new simpleWorker_1.SimpleWorkerClient(new defaultWorkerFactory_1.DefaultWorkerFactory(), 'vs/editor/common/services/editorSimpleWorker', editorSimpleWorkerCommon_1.EditorSimpleWorker));
            this._proxy = this._worker.get();
            this._modelManager = new EditorModelManager(this._proxy, this._modelService, false);
        }
        EditorWorkerClient.prototype.computeDiff = function (original, modified, ignoreTrimWhitespace) {
            var _this = this;
            return this._modelManager.withSyncedResources([original, modified]).then(function (_) {
                return _this._proxy.computeDiff(original.toString(), modified.toString(), ignoreTrimWhitespace);
            });
        };
        EditorWorkerClient.prototype.computeDirtyDiff = function (original, modified, ignoreTrimWhitespace) {
            var _this = this;
            return this._modelManager.withSyncedResources([original, modified]).then(function (_) {
                return _this._proxy.computeDirtyDiff(original.toString(), modified.toString(), ignoreTrimWhitespace);
            });
        };
        EditorWorkerClient.prototype.computeLinks = function (resource) {
            var _this = this;
            return this._modelManager.withSyncedResources([resource]).then(function (_) {
                return _this._proxy.computeLinks(resource.toString());
            });
        };
        EditorWorkerClient.prototype.textualSuggest = function (resource, position) {
            var _this = this;
            return this._modelManager.withSyncedResources([resource]).then(function (_) {
                var model = _this._modelService.getModel(resource);
                if (!model) {
                    return null;
                }
                var wordDefRegExp = textModelWithTokensHelpers_1.WordHelper.massageWordDefinitionOf(model.getMode());
                var wordDef = wordDefRegExp.source;
                var wordDefFlags = (wordDefRegExp.global ? 'g' : '') + (wordDefRegExp.ignoreCase ? 'i' : '') + (wordDefRegExp.multiline ? 'm' : '');
                return _this._proxy.textualSuggest(resource.toString(), position, wordDef, wordDefFlags);
            });
        };
        EditorWorkerClient.prototype.navigateValueSet = function (resource, range, up) {
            var _this = this;
            return this._modelManager.withSyncedResources([resource]).then(function (_) {
                var model = _this._modelService.getModel(resource);
                if (!model) {
                    return null;
                }
                var wordDefRegExp = textModelWithTokensHelpers_1.WordHelper.massageWordDefinitionOf(model.getMode());
                var wordDef = wordDefRegExp.source;
                var wordDefFlags = (wordDefRegExp.global ? 'g' : '') + (wordDefRegExp.ignoreCase ? 'i' : '') + (wordDefRegExp.multiline ? 'm' : '');
                return _this._proxy.navigateValueSet(resource.toString(), range, up, wordDef, wordDefFlags);
            });
        };
        return EditorWorkerClient;
    }(lifecycle_1.Disposable));
});
