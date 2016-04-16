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
define(["require", "exports", 'vs/nls!vs/workbench/node/extensionHostMain', 'vs/base/node/pfs', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/base/common/paths', 'vs/platform/extensions/common/extensions', 'vs/platform/extensions/common/extensionsRegistry', 'vs/workbench/api/node/extHost.api.impl', 'vs/workbench/api/node/extHostDocuments', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/extensions/common/nativeExtensionService', 'vs/platform/thread/common/extHostThreadService', 'vs/platform/telemetry/common/remoteTelemetryService', 'vs/platform/workspace/common/baseWorkspaceContextService', 'vs/editor/common/services/modeServiceImpl', 'vs/workbench/node/extensionPoints', 'vs/platform/workspace/common/workspace', 'vs/workbench/parts/extensions/common/extensions', 'vs/workbench/parts/extensions/node/extensionsService'], function (require, exports, nls, pfs, uri_1, winjs_base_1, paths, extensions_1, extensionsRegistry_1, extHost_api_impl_1, extHostDocuments_1, InstantiationService, nativeExtensionService_1, extHostThreadService_1, remoteTelemetryService_1, baseWorkspaceContextService_1, modeServiceImpl_1, extensionPoints_1, workspace_1, extensions_2, extensionsService_1) {
    'use strict';
    var DIRNAME = uri_1.default.parse(require.toUrl('./')).fsPath;
    var BASE_PATH = paths.normalize(paths.join(DIRNAME, '../../../..'));
    var BUILTIN_EXTENSIONS_PATH = paths.join(BASE_PATH, 'extensions');
    var nativeExit = process.exit.bind(process);
    process.exit = function () {
        var err = new Error('An extension called process.exit() and this was prevented.');
        console.warn(err.stack);
    };
    function exit(code) {
        nativeExit(code);
    }
    exports.exit = exit;
    function createServices(remoteCom, initData, sharedProcessClient) {
        var contextService = new baseWorkspaceContextService_1.BaseWorkspaceContextService(initData.contextService.workspace, initData.contextService.configuration, initData.contextService.options);
        var threadService = new extHostThreadService_1.ExtHostThreadService(remoteCom);
        threadService.setInstantiationService(InstantiationService.createInstantiationService({ threadService: threadService }));
        var telemetryService = new remoteTelemetryService_1.RemoteTelemetryService('pluginHostTelemetry', threadService);
        var modelService = threadService.getRemotable(extHostDocuments_1.ExtHostModelService);
        var extensionService = new nativeExtensionService_1.ExtHostExtensionService(threadService, telemetryService);
        var modeService = new modeServiceImpl_1.ModeServiceImpl(threadService, extensionService);
        var _services = {
            contextService: contextService,
            modelService: modelService,
            threadService: threadService,
            modeService: modeService,
            extensionService: extensionService,
            telemetryService: telemetryService
        };
        var instantiationService = InstantiationService.createInstantiationService(_services);
        threadService.setInstantiationService(instantiationService);
        // Create the monaco API
        instantiationService.createInstance(extHost_api_impl_1.ExtHostAPIImplementation);
        // Connect to shared process services
        instantiationService.addSingleton(extensions_2.IExtensionsService, sharedProcessClient.getService('ExtensionService', extensionsService_1.ExtensionsService));
        return instantiationService;
    }
    exports.createServices = createServices;
    var ExtensionHostMain = (function () {
        function ExtensionHostMain(contextService, extensionService) {
            this._isTerminating = false;
            this._contextService = contextService;
            this._extensionService = extensionService;
        }
        ExtensionHostMain.prototype.start = function () {
            return this.readExtensions();
        };
        ExtensionHostMain.prototype.terminate = function () {
            var _this = this;
            if (this._isTerminating) {
                // we are already shutting down...
                return;
            }
            this._isTerminating = true;
            try {
                var allExtensions = extensionsRegistry_1.ExtensionsRegistry.getAllExtensionDescriptions();
                var allExtensionsIds = allExtensions.map(function (ext) { return ext.id; });
                var activatedExtensions = allExtensionsIds.filter(function (id) { return _this._extensionService.isActivated(id); });
                activatedExtensions.forEach(function (extensionId) {
                    _this._extensionService.deactivate(extensionId);
                });
            }
            catch (err) {
            }
            // Give extensions 1 second to wrap up any async dispose, then exit
            setTimeout(function () {
                exit();
            }, 1000);
        };
        ExtensionHostMain.prototype.readExtensions = function () {
            var _this = this;
            var collector = new extensionPoints_1.MessagesCollector();
            var env = this._contextService.getConfiguration().env;
            return ExtensionHostMain.scanExtensions(collector, BUILTIN_EXTENSIONS_PATH, !env.disableExtensions ? env.userExtensionsHome : void 0, !env.disableExtensions ? env.extensionDevelopmentPath : void 0, env.version)
                .then(null, function (err) {
                collector.error('', err);
                return [];
            })
                .then(function (extensions) {
                // Register & Signal done
                extensionsRegistry_1.ExtensionsRegistry.registerExtensions(extensions);
                _this._extensionService.registrationDone(collector.getMessages());
            })
                .then(function () { return _this.handleEagerExtensions(); })
                .then(function () { return _this.handleExtensionTests(); });
        };
        ExtensionHostMain.scanExtensions = function (collector, builtinExtensionsPath, userInstallPath, extensionDevelopmentPath, version) {
            var builtinExtensions = extensionPoints_1.ExtensionScanner.scanExtensions(version, collector, builtinExtensionsPath, true);
            var userExtensions = !userInstallPath ? winjs_base_1.TPromise.as([]) : extensionPoints_1.ExtensionScanner.scanExtensions(version, collector, userInstallPath, false);
            var developedExtensions = !extensionDevelopmentPath ? winjs_base_1.TPromise.as([]) : extensionPoints_1.ExtensionScanner.scanOneOrMultipleExtensions(version, collector, extensionDevelopmentPath, false);
            return winjs_base_1.TPromise.join([builtinExtensions, userExtensions, developedExtensions]).then(function (_) {
                var builtinExtensions = _[0];
                var userExtensions = _[1];
                var developedExtensions = _[2];
                var result = {};
                builtinExtensions.forEach(function (builtinExtension) {
                    result[builtinExtension.id] = builtinExtension;
                });
                userExtensions.forEach(function (userExtension) {
                    if (result.hasOwnProperty(userExtension.id)) {
                        collector.warn(userExtension.extensionFolderPath, nls.localize(0, null, result[userExtension.id].extensionFolderPath, userExtension.extensionFolderPath));
                    }
                    result[userExtension.id] = userExtension;
                });
                developedExtensions.forEach(function (developedExtension) {
                    collector.info('', nls.localize(1, null, developedExtension.extensionFolderPath));
                    if (result.hasOwnProperty(developedExtension.id)) {
                        collector.warn(developedExtension.extensionFolderPath, nls.localize(2, null, result[developedExtension.id].extensionFolderPath, developedExtension.extensionFolderPath));
                    }
                    result[developedExtension.id] = developedExtension;
                });
                return Object.keys(result).map(function (name) { return result[name]; });
            });
        };
        // Handle "eager" activation extensions
        ExtensionHostMain.prototype.handleEagerExtensions = function () {
            this._extensionService.activateByEvent('*').then(null, function (err) {
                console.error(err);
            });
            return this.handleWorkspaceContainsEagerExtensions();
        };
        ExtensionHostMain.prototype.handleWorkspaceContainsEagerExtensions = function () {
            var _this = this;
            var workspace = this._contextService.getWorkspace();
            if (!workspace || !workspace.resource) {
                return winjs_base_1.TPromise.as(null);
            }
            var folderPath = workspace.resource.fsPath;
            var desiredFilesMap = {};
            extensionsRegistry_1.ExtensionsRegistry.getAllExtensionDescriptions().forEach(function (desc) {
                var activationEvents = desc.activationEvents;
                if (!activationEvents) {
                    return;
                }
                for (var i = 0; i < activationEvents.length; i++) {
                    if (/^workspaceContains:/.test(activationEvents[i])) {
                        var fileName = activationEvents[i].substr('workspaceContains:'.length);
                        desiredFilesMap[fileName] = true;
                    }
                }
            });
            return winjs_base_1.TPromise.join(Object.keys(desiredFilesMap).map(function (fileName) { return pfs.fileExistsWithResult(paths.join(folderPath, fileName), fileName); })).then(function (fileNames) {
                fileNames.forEach(function (existingFileName) {
                    if (!existingFileName) {
                        return;
                    }
                    var activationEvent = 'workspaceContains:' + existingFileName;
                    _this._extensionService.activateByEvent(activationEvent).then(null, function (err) {
                        console.error(err);
                    });
                });
            });
        };
        ExtensionHostMain.prototype.handleExtensionTests = function () {
            var _this = this;
            var env = this._contextService.getConfiguration().env;
            if (!env.extensionTestsPath || !env.extensionDevelopmentPath) {
                return winjs_base_1.TPromise.as(null);
            }
            // Require the test runner via node require from the provided path
            var testRunner;
            var requireError;
            try {
                testRunner = require.__$__nodeRequire(env.extensionTestsPath);
            }
            catch (error) {
                requireError = error;
            }
            // Execute the runner if it follows our spec
            if (testRunner && typeof testRunner.run === 'function') {
                return new winjs_base_1.TPromise(function (c, e) {
                    testRunner.run(env.extensionTestsPath, function (error, failures) {
                        if (error) {
                            e(error.toString());
                        }
                        else {
                            c(null);
                        }
                        // after tests have run, we shutdown the host
                        _this.gracefulExit(failures && failures > 0 ? 1 /* ERROR */ : 0 /* OK */);
                    });
                });
            }
            else {
                this.gracefulExit(1 /* ERROR */);
            }
            return winjs_base_1.TPromise.wrapError(requireError ? requireError.toString() : nls.localize(3, null, env.extensionTestsPath));
        };
        ExtensionHostMain.prototype.gracefulExit = function (code) {
            // to give the PH process a chance to flush any outstanding console
            // messages to the main process, we delay the exit() by some time
            setTimeout(function () { return exit(code); }, 500);
        };
        ExtensionHostMain = __decorate([
            __param(0, workspace_1.IWorkspaceContextService),
            __param(1, extensions_1.IExtensionService)
        ], ExtensionHostMain);
        return ExtensionHostMain;
    }());
    exports.ExtensionHostMain = ExtensionHostMain;
});
//# sourceMappingURL=extensionHostMain.js.map