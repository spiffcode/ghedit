var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/platform/configuration/common/configurationService', 'vs/platform/event/common/eventService', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/test/common/nullThreadService', 'vs/platform/workspace/common/baseWorkspaceContextService', 'vs/editor/common/services/modeServiceImpl', 'vs/editor/common/services/modelServiceImpl', 'vs/editor/test/common/mocks/mockExtensionService'], function (require, exports, uri_1, winjs_base_1, configurationService_1, eventService_1, instantiationService_1, nullThreadService_1, baseWorkspaceContextService_1, modeServiceImpl_1, modelServiceImpl_1, mockExtensionService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function createMockPlatformServices(mockPlatformServices) {
        if (mockPlatformServices === void 0) { mockPlatformServices = {}; }
        return {
            threadService: mockPlatformServices.threadService,
            extensionService: mockPlatformServices.extensionService,
            instantiationService: mockPlatformServices.instantiationService,
            lifecycleService: mockPlatformServices.lifecycleService,
            messageService: mockPlatformServices.messageService,
            markerService: mockPlatformServices.markerService,
            editorService: mockPlatformServices.editorService,
            requestService: mockPlatformServices.requestService,
            keybindingService: mockPlatformServices.keybindingService,
            contextService: mockPlatformServices.contextService,
            contextViewService: mockPlatformServices.contextViewService,
            contextMenuService: mockPlatformServices.contextMenuService,
            telemetryService: mockPlatformServices.telemetryService,
            eventService: mockPlatformServices.eventService,
            storageService: mockPlatformServices.storageService,
            configurationService: mockPlatformServices.configurationService,
            searchService: mockPlatformServices.searchService,
            progressService: mockPlatformServices.progressService,
            fileService: mockPlatformServices.fileService
        };
    }
    function createMockEditorWorkerServices(mockEditorWorkerServices) {
        if (mockEditorWorkerServices === void 0) { mockEditorWorkerServices = {}; }
        var ret = createMockPlatformServices(mockEditorWorkerServices);
        ret['resourceService'] = mockEditorWorkerServices.resourceService;
        return ret;
    }
    exports.createMockEditorWorkerServices = createMockEditorWorkerServices;
    var MockModeService = (function (_super) {
        __extends(MockModeService, _super);
        function MockModeService() {
            _super.apply(this, arguments);
        }
        return MockModeService;
    }(modeServiceImpl_1.ModeServiceImpl));
    var MockModelService = (function (_super) {
        __extends(MockModelService, _super);
        function MockModelService() {
            _super.apply(this, arguments);
        }
        return MockModelService;
    }(modelServiceImpl_1.ModelServiceImpl));
    function createMockModeService() {
        var threadService = nullThreadService_1.NULL_THREAD_SERVICE;
        var extensionService = new mockExtensionService_1.MockExtensionService();
        var modeService = new MockModeService(threadService, extensionService);
        var inst = instantiationService_1.createInstantiationService({
            threadService: threadService,
            extensionService: extensionService,
            modeService: modeService
        });
        threadService.setInstantiationService(inst);
        return modeService;
    }
    exports.createMockModeService = createMockModeService;
    function createMockModelService() {
        var contextService = new baseWorkspaceContextService_1.BaseWorkspaceContextService({
            resource: uri_1.default.create('inmemory', 'model', '/'),
            id: null,
            name: null,
            uid: null,
            mtime: null
        }, {});
        var eventService = new eventService_1.EventService();
        var configurationService = new MockConfigurationService(contextService, eventService);
        var threadService = nullThreadService_1.NULL_THREAD_SERVICE;
        var extensionService = new mockExtensionService_1.MockExtensionService();
        var modeService = new MockModeService(threadService, extensionService);
        var modelService = new MockModelService(threadService, null, modeService, configurationService, null);
        var inst = instantiationService_1.createInstantiationService({
            threadService: threadService,
            extensionService: extensionService,
            modeService: modeService,
            contextService: contextService,
            eventService: eventService,
            configurationService: configurationService
        });
        threadService.setInstantiationService(inst);
        return modelService;
    }
    exports.createMockModelService = createMockModelService;
    var MockConfigurationService = (function (_super) {
        __extends(MockConfigurationService, _super);
        function MockConfigurationService() {
            _super.apply(this, arguments);
        }
        MockConfigurationService.prototype.resolveContents = function (resources) {
            return winjs_base_1.TPromise.as(resources.map(function (resource) {
                return {
                    resource: resource,
                    value: ''
                };
            }));
        };
        MockConfigurationService.prototype.resolveContent = function (resource) {
            return winjs_base_1.TPromise.as({
                resource: resource,
                value: ''
            });
        };
        MockConfigurationService.prototype.resolveStat = function (resource) {
            return winjs_base_1.TPromise.as({
                resource: resource,
                isDirectory: false
            });
        };
        return MockConfigurationService;
    }(configurationService_1.ConfigurationService));
    exports.MockConfigurationService = MockConfigurationService;
});
//# sourceMappingURL=servicesTestUtils.js.map