define(["require", "exports", 'vs/base/common/flags', 'vs/base/common/uri', 'vs/platform/contextview/browser/contextMenuService', 'vs/platform/contextview/browser/contextViewService', 'vs/platform/event/common/eventService', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/markers/common/markerService', 'vs/platform/telemetry/browser/telemetryService', 'vs/platform/telemetry/common/telemetry', 'vs/platform/thread/common/mainThreadService', 'vs/platform/workspace/common/baseWorkspaceContextService', 'vs/editor/common/services/editorWorkerServiceImpl', 'vs/editor/common/services/modeServiceImpl', 'vs/editor/common/services/modelServiceImpl', 'vs/editor/browser/services/codeEditorServiceImpl', 'vs/editor/browser/standalone/simpleServices'], function (require, exports, flags, uri_1, contextMenuService_1, contextViewService_1, eventService_1, instantiationService_1, markerService_1, telemetryService_1, telemetry_1, mainThreadService_1, baseWorkspaceContextService_1, editorWorkerServiceImpl_1, modeServiceImpl_1, modelServiceImpl_1, codeEditorServiceImpl_1, simpleServices_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function shallowClone(obj) {
        var r = {};
        if (obj) {
            var keys = Object.keys(obj);
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                r[key] = obj[key];
            }
        }
        return r;
    }
    function ensureStaticPlatformServices(services) {
        services = shallowClone(services);
        var statics = getOrCreateStaticServices(services);
        var keys = Object.keys(statics);
        for (var i = 0, len = keys.length; i < len; i++) {
            var serviceId = keys[i];
            if (!services.hasOwnProperty(serviceId)) {
                services[serviceId] = statics[serviceId];
            }
        }
        return services;
    }
    exports.ensureStaticPlatformServices = ensureStaticPlatformServices;
    function ensureDynamicPlatformServices(domElement, services) {
        var r = [];
        if (typeof services.keybindingService === 'undefined') {
            var keybindingService = new simpleServices_1.StandaloneKeybindingService(services.configurationService, domElement);
            r.push(keybindingService);
            services.keybindingService = keybindingService;
        }
        if (typeof services.contextViewService === 'undefined') {
            var contextViewService = new contextViewService_1.ContextViewService(domElement, services.telemetryService, services.messageService);
            r.push(contextViewService);
            services.contextViewService = contextViewService;
        }
        if (typeof services.contextMenuService === 'undefined') {
            var contextMenuService = new contextMenuService_1.ContextMenuService(domElement, services.telemetryService, services.messageService, contextViewService);
            r.push(contextMenuService);
            services.contextMenuService = contextMenuService;
        }
        return r;
    }
    exports.ensureDynamicPlatformServices = ensureDynamicPlatformServices;
    // The static services represents a map of services that once 1 editor has been created must be used for all subsequent editors
    var staticServices = null;
    function getOrCreateStaticServices(services) {
        if (staticServices) {
            return staticServices;
        }
        services = services || {};
        var contextService = services.contextService;
        if (!contextService) {
            contextService = new baseWorkspaceContextService_1.BaseWorkspaceContextService({
                resource: uri_1.default.create('inmemory', 'model', '/'),
                id: null,
                name: null,
                uid: null,
                mtime: null
            }, {});
        }
        var telemetryService = services.telemetryService;
        if (!telemetryService) {
            var config = contextService.getConfiguration();
            var enableTelemetry = config && config.env ? !!config.env.enableTelemetry : false;
            telemetryService = enableTelemetry
                ? new telemetryService_1.TelemetryService()
                : telemetry_1.NullTelemetryService;
        }
        var eventService = services.eventService || new eventService_1.EventService();
        var configurationService = services.configurationService || new simpleServices_1.SimpleConfigurationService(contextService, eventService);
        // warn the user that standaloneEdiktorTelemetryEndpint is absolete
        if (flags.standaloneEditorTelemetryEndpoint) {
            console.warn('standaloneEditorTelemetryEndpoint is obsolete');
        }
        var threadService = services.threadService || new mainThreadService_1.MainThreadService(contextService, 'vs/editor/common/worker/editorWorkerServer', 2);
        var messageService = services.messageService || new simpleServices_1.SimpleMessageService();
        var extensionService = services.extensionService || new simpleServices_1.SimpleExtensionService();
        var markerService = services.markerService || new markerService_1.MainProcessMarkerService(threadService);
        var requestService = services.requestService || new simpleServices_1.SimpleEditorRequestService(contextService, telemetryService);
        var modeService = services.modeService || new modeServiceImpl_1.MainThreadModeServiceImpl(threadService, extensionService, configurationService);
        var modelService = services.modelService || new modelServiceImpl_1.ModelServiceImpl(threadService, markerService, modeService, configurationService, messageService);
        var editorWorkerService = services.editorWorkerService || new editorWorkerServiceImpl_1.EditorWorkerServiceImpl(modelService);
        var codeEditorService = services.codeEditorService || new codeEditorServiceImpl_1.CodeEditorServiceImpl();
        staticServices = {
            configurationService: configurationService,
            extensionService: extensionService,
            modeService: modeService,
            threadService: threadService,
            markerService: markerService,
            contextService: contextService,
            telemetryService: telemetryService,
            requestService: requestService,
            messageService: messageService,
            modelService: modelService,
            codeEditorService: codeEditorService,
            editorWorkerService: editorWorkerService,
            eventService: eventService,
            instantiationService: void 0
        };
        var instantiationService = instantiationService_1.createInstantiationService(staticServices);
        staticServices.instantiationService = instantiationService_1.createInstantiationService(staticServices);
        if (threadService instanceof mainThreadService_1.MainThreadService) {
            threadService.setInstantiationService(instantiationService);
        }
        return staticServices;
    }
    exports.getOrCreateStaticServices = getOrCreateStaticServices;
});
//# sourceMappingURL=standaloneServices.js.map