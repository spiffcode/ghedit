/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/severity', 'vs/platform/event/common/eventService', 'vs/platform/extensions/common/abstractExtensionService', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/markers/common/markerService', 'vs/platform/request/common/baseRequestService', 'vs/platform/telemetry/common/remoteTelemetryService', 'vs/platform/thread/common/workerThreadService', 'vs/platform/workspace/common/baseWorkspaceContextService', 'vs/editor/common/services/modeServiceImpl', 'vs/editor/common/services/modelServiceImpl', 'vs/editor/common/services/resourceServiceImpl', 'vs/editor/common/languages.common', 'vs/editor/common/worker/validationHelper'], function (require, exports, severity_1, eventService_1, abstractExtensionService_1, instantiationService_1, markerService_1, baseRequestService_1, remoteTelemetryService_1, workerThreadService_1, baseWorkspaceContextService_1, modeServiceImpl_1, modelServiceImpl_1, resourceServiceImpl_1) {
    'use strict';
    var WorkerExtensionService = (function (_super) {
        __extends(WorkerExtensionService, _super);
        function WorkerExtensionService() {
            _super.call(this, true);
        }
        WorkerExtensionService.prototype._showMessage = function (severity, msg) {
            switch (severity) {
                case severity_1.default.Error:
                    console.error(msg);
                    break;
                case severity_1.default.Warning:
                    console.warn(msg);
                    break;
                case severity_1.default.Info:
                    console.info(msg);
                    break;
                default:
                    console.log(msg);
            }
        };
        WorkerExtensionService.prototype._createFailedExtension = function () {
            throw new Error('unexpected');
        };
        WorkerExtensionService.prototype._actualActivateExtension = function (extensionDescription) {
            throw new Error('unexpected');
        };
        return WorkerExtensionService;
    }(abstractExtensionService_1.AbstractExtensionService));
    var EditorWorkerServer = (function () {
        function EditorWorkerServer() {
        }
        EditorWorkerServer.prototype.initialize = function (mainThread, complete, error, progress, initData) {
            var extensionService = new WorkerExtensionService();
            var contextService = new baseWorkspaceContextService_1.BaseWorkspaceContextService(initData.contextService.workspace, initData.contextService.configuration, initData.contextService.options);
            this.threadService = new workerThreadService_1.WorkerThreadService(mainThread.getRemoteCom());
            this.threadService.setInstantiationService(instantiationService_1.createInstantiationService({ threadService: this.threadService }));
            var telemetryServiceInstance = new remoteTelemetryService_1.RemoteTelemetryService('workerTelemetry', this.threadService);
            var resourceService = new resourceServiceImpl_1.ResourceService();
            var markerService = new markerService_1.SecondaryMarkerService(this.threadService);
            var modeService = new modeServiceImpl_1.ModeServiceImpl(this.threadService, extensionService);
            var requestService = new baseRequestService_1.BaseRequestService(contextService, telemetryServiceInstance);
            var _services = {
                threadService: this.threadService,
                extensionService: extensionService,
                modeService: modeService,
                contextService: contextService,
                eventService: new eventService_1.EventService(),
                resourceService: resourceService,
                markerService: markerService,
                telemetryService: telemetryServiceInstance,
                requestService: requestService
            };
            var instantiationService = instantiationService_1.createInstantiationService(_services);
            this.threadService.setInstantiationService(instantiationService);
            // Instantiate thread actors
            this.threadService.getRemotable(modeServiceImpl_1.ModeServiceWorkerHelper);
            this.threadService.getRemotable(modelServiceImpl_1.ModelServiceWorkerHelper);
            complete(undefined);
        };
        EditorWorkerServer.prototype.request = function (mainThread, complete, error, progress, data) {
            this.threadService.dispatch(data).then(complete, error, progress);
        };
        return EditorWorkerServer;
    }());
    exports.EditorWorkerServer = EditorWorkerServer;
    exports.value = new EditorWorkerServer();
});
//# sourceMappingURL=editorWorkerServer.js.map