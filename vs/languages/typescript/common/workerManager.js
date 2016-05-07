define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/worker/defaultWorkerFactory', 'vs/base/common/worker/simpleWorker', 'vs/editor/common/services/editorWorkerServiceImpl', './typescript'], function (require, exports, lifecycle_1, defaultWorkerFactory_1, simpleWorker_1, editorWorkerServiceImpl_1, typescript_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WorkerManager = (function () {
        function WorkerManager(modelService, defaults) {
            this._client = null;
            this._clientDispose = [];
            this._factory = new defaultWorkerFactory_1.DefaultWorkerFactory();
            this._modelService = modelService;
            this._defaults = defaults;
        }
        WorkerManager.prototype._createClient = function () {
            var _this = this;
            var client = new simpleWorker_1.SimpleWorkerClient(this._factory, 'vs/languages/typescript/common/worker', typescript_1.TypeScriptWorkerProtocol);
            var manager = new editorWorkerServiceImpl_1.EditorModelManager(client.get(), this._modelService, true);
            this._clientDispose.push(manager);
            this._clientDispose.push(client);
            var stopWorker = function () {
                _this._clientDispose = lifecycle_1.dispose(_this._clientDispose);
                _this._client = null;
            };
            // stop worker after being idle
            var handle = setInterval(function () {
                if (Date.now() - client.getLastRequestTimestamp() > 1000 * 60) {
                    stopWorker();
                }
            }, 1000 * 60);
            this._clientDispose.push({ dispose: function () { clearInterval(handle); } });
            // stop worker when defaults change
            this._clientDispose.push(this._defaults.onDidChange(function () { return stopWorker(); }));
            // send default to worker right away
            var worker = client.get();
            var _a = this._defaults, compilerOptions = _a.compilerOptions, extraLibs = _a.extraLibs;
            return worker.acceptDefaults(compilerOptions, extraLibs).then(function () { return ({ worker: worker, manager: manager }); });
        };
        WorkerManager.prototype.dispose = function () {
            this._clientDispose = lifecycle_1.dispose(this._clientDispose);
            this._client = null;
        };
        WorkerManager.prototype.getLanguageServiceWorker = function () {
            var resources = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                resources[_i - 0] = arguments[_i];
            }
            if (!this._client) {
                this._client = this._createClient();
            }
            return this._client
                .then(function (data) { return data.manager.withSyncedResources(resources)
                .then(function (_) { return data.worker; }); });
        };
        return WorkerManager;
    }());
    function create(defaults, modelService) {
        return new WorkerManager(modelService, defaults);
    }
    exports.create = create;
});
//# sourceMappingURL=workerManager.js.map