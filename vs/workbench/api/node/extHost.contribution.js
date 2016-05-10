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
define(["require", "exports", 'vs/platform/platform', 'vs/workbench/common/contributions', 'vs/platform/instantiation/common/instantiation', 'vs/platform/thread/common/thread', 'vs/workbench/api/node/extHostDocuments', 'vs/editor/node/textMate/TMSyntax', 'vs/editor/node/textMate/TMSnippets', 'vs/platform/jsonschemas/common/jsonValidationExtensionPoint', 'vs/editor/node/languageConfiguration', 'vs/workbench/api/node/extHostFileSystemEventService', 'vs/workbench/api/node/extHostQuickOpen', 'vs/workbench/api/node/extHostStatusBar', 'vs/workbench/api/node/extHostCommands', 'vs/platform/telemetry/common/remoteTelemetryService', 'vs/workbench/api/node/extHostDiagnostics', 'vs/workbench/api/node/extHostOutputService', 'vs/workbench/api/node/extHostMessageService', 'vs/workbench/api/node/extHostLanguages', 'vs/workbench/api/node/extHostEditors', 'vs/workbench/api/node/extHostWorkspace', 'vs/workbench/api/node/extHostConfiguration', 'vs/workbench/api/node/extHostLanguageFeatures', 'vs/platform/storage/common/remotable.storage', 'vs/workbench/api/node/extHost.api.impl'], function (require, exports, platform_1, contributions_1, instantiation_1, thread_1, extHostDocuments_1, TMSyntax_1, TMSnippets_1, jsonValidationExtensionPoint_1, languageConfiguration_1, extHostFileSystemEventService_1, extHostQuickOpen_1, extHostStatusBar_1, extHostCommands_1, remoteTelemetryService_1, extHostDiagnostics_1, extHostOutputService_1, extHostMessageService_1, extHostLanguages_1, extHostEditors_1, extHostWorkspace_1, extHostConfiguration_1, extHostLanguageFeatures_1, remotable_storage_1, extHost_api_impl_1) {
    'use strict';
    var ExtHostContribution = (function () {
        function ExtHostContribution(threadService, instantiationService) {
            this.threadService = threadService;
            this.instantiationService = instantiationService;
            this.initExtensionSystem();
        }
        ExtHostContribution.prototype.getId = function () {
            return 'vs.api.extHost';
        };
        ExtHostContribution.prototype.initExtensionSystem = function () {
            this.threadService.getRemotable(extHost_api_impl_1.MainProcessVSCodeAPIHelper);
            this.threadService.getRemotable(extHostDocuments_1.MainThreadDocuments);
            this.threadService.getRemotable(remoteTelemetryService_1.RemoteTelemetryServiceHelper);
            this.instantiationService.createInstance(TMSyntax_1.MainProcessTextMateSyntax);
            this.instantiationService.createInstance(TMSnippets_1.MainProcessTextMateSnippet);
            this.instantiationService.createInstance(jsonValidationExtensionPoint_1.JSONValidationExtensionPoint);
            this.instantiationService.createInstance(languageConfiguration_1.LanguageConfigurationFileHandler);
            this.threadService.getRemotable(extHostConfiguration_1.MainThreadConfiguration);
            this.threadService.getRemotable(extHostQuickOpen_1.MainThreadQuickOpen);
            this.threadService.getRemotable(extHostStatusBar_1.MainThreadStatusBar);
            this.instantiationService.createInstance(extHostFileSystemEventService_1.MainThreadFileSystemEventService);
            this.threadService.getRemotable(extHostCommands_1.MainThreadCommands);
            this.threadService.getRemotable(extHostOutputService_1.MainThreadOutputService);
            this.threadService.getRemotable(extHostDiagnostics_1.MainThreadDiagnostics);
            this.threadService.getRemotable(extHostMessageService_1.MainThreadMessageService);
            this.threadService.getRemotable(extHostLanguages_1.MainThreadLanguages);
            this.threadService.getRemotable(extHostWorkspace_1.MainThreadWorkspace);
            this.threadService.getRemotable(extHostEditors_1.MainThreadEditors);
            this.threadService.getRemotable(remotable_storage_1.MainThreadStorage);
            this.threadService.getRemotable(extHostLanguageFeatures_1.MainThreadLanguageFeatures);
        };
        ExtHostContribution = __decorate([
            __param(0, thread_1.IThreadService),
            __param(1, instantiation_1.IInstantiationService)
        ], ExtHostContribution);
        return ExtHostContribution;
    }());
    exports.ExtHostContribution = ExtHostContribution;
    // Register File Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExtHostContribution);
});
//# sourceMappingURL=extHost.contribution.js.map