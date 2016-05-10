/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls', 'vs/base/common/platform', 'vs/base/browser/builder', 'vs/base/common/strings', 'vs/base/browser/dom', 'vs/base/browser/ui/aria/aria', 'vs/base/common/lifecycle', 'vs/base/common/errors', 'vs/platform/contextview/browser/contextViewService', 'vs/workbench/services/contextview/electron-browser/contextmenuService', 'vs/base/common/timer', 'vs/workbench/browser/workbench', 'vs/workbench/common/storage', 'vs/platform/telemetry/common/telemetry', 'vs/platform/telemetry/electron-browser/electronTelemetryService', 'vs/workbench/electron-browser/integration', 'vs/workbench/electron-browser/update', 'vs/platform/telemetry/common/workspaceStats', 'vs/workbench/services/window/electron-browser/windowService', 'vs/workbench/services/message/electron-browser/messageService', 'vs/workbench/services/request/node/requestService', 'vs/platform/configuration/common/configuration', 'vs/workbench/services/files/electron-browser/fileService', 'vs/workbench/services/search/node/searchService', 'vs/workbench/services/lifecycle/electron-browser/lifecycleService', 'vs/workbench/services/keybinding/electron-browser/keybindingService', 'vs/workbench/services/thread/electron-browser/threadService', 'vs/platform/markers/common/markerService', 'vs/platform/actions/common/actions', 'vs/platform/actions/common/actionsService', 'vs/editor/common/services/modelService', 'vs/editor/common/services/modelServiceImpl', 'vs/editor/browser/services/codeEditorServiceImpl', 'vs/editor/common/services/codeEditorService', 'vs/editor/common/services/editorWorkerServiceImpl', 'vs/editor/common/services/editorWorkerService', 'vs/platform/extensions/common/nativeExtensionService', 'vs/platform/storage/common/storage', 'vs/platform/instantiation/common/serviceCollection', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/contextview/browser/contextView', 'vs/platform/event/common/event', 'vs/platform/files/common/files', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/markers/common/markers', 'vs/platform/message/common/message', 'vs/platform/request/common/request', 'vs/platform/search/common/search', 'vs/platform/thread/common/thread', 'vs/platform/workspace/common/workspace', 'vs/platform/extensions/common/extensions', 'vs/editor/common/services/modeServiceImpl', 'vs/editor/common/services/modeService', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/electron-browser/crashReporter', 'vs/workbench/services/themes/common/themeService', 'vs/workbench/services/themes/electron-browser/themeService', 'vs/base/parts/ipc/common/ipc', 'vs/base/parts/ipc/node/ipc.net', 'vs/workbench/parts/extensions/common/extensionsIpc', 'vs/workbench/parts/extensions/common/extensions', 'vs/workbench/electron-browser/actions', 'vs/css!./media/shell', 'vs/platform/opener/electron-browser/opener.contribution'], function (require, exports, nls, platform, builder_1, strings_1, dom, aria, lifecycle_1, errors, contextViewService_1, contextmenuService_1, timer, workbench_1, storage_1, telemetry_1, electronTelemetryService_1, integration_1, update_1, workspaceStats_1, windowService_1, messageService_1, requestService_1, configuration_1, fileService_1, searchService_1, lifecycleService_1, keybindingService_1, threadService_1, markerService_1, actions_1, actionsService_1, modelService_1, modelServiceImpl_1, codeEditorServiceImpl_1, codeEditorService_1, editorWorkerServiceImpl_1, editorWorkerService_1, nativeExtensionService_1, storage_2, serviceCollection_1, instantiationService_1, contextView_1, event_1, files_1, keybindingService_2, lifecycle_2, markers_1, message_1, request_1, search_1, thread_1, workspace_1, extensions_1, modeServiceImpl_1, modeService_1, untitledEditorService_1, crashReporter_1, themeService_1, themeService_2, ipc_1, ipc_net_1, extensionsIpc_1, extensions_2, actions_2) {
    'use strict';
    /**
     * The Monaco Workbench Shell contains the Monaco workbench with a rich header containing navigation and the activity bar.
     * With the Shell being the top level element in the page, it is also responsible for driving the layouting.
     */
    var WorkbenchShell = (function () {
        function WorkbenchShell(container, workspace, services, configuration, options) {
            this.container = container;
            this.workspace = workspace;
            this.configuration = configuration;
            this.options = options;
            this.contextService = services.contextService;
            this.eventService = services.eventService;
            this.configurationService = services.configurationService;
            this.toUnbind = [];
            this.previousErrorTime = 0;
        }
        WorkbenchShell.prototype.createContents = function (parent) {
            var _this = this;
            // ARIA
            aria.setARIAContainer(document.body);
            // Workbench Container
            var workbenchContainer = builder_1.$(parent).div();
            // Instantiation service with services
            var _a = this.initServiceCollection(), instantiationService = _a[0], serviceCollection = _a[1];
            //crash reporting
            if (!!this.configuration.env.crashReporter) {
                var crashReporter = instantiationService.createInstance(crashReporter_1.CrashReporter, this.configuration.env.version, this.configuration.env.commitHash);
                crashReporter.start(this.configuration.env.crashReporter);
            }
            var sharedProcessClientPromise = ipc_net_1.connect(process.env['VSCODE_SHARED_IPC_HOOK']);
            sharedProcessClientPromise.done(function (service) {
                service.onClose(function () {
                    _this.messageService.show(message_1.Severity.Error, {
                        message: nls.localize('sharedProcessCrashed', "The shared process terminated unexpectedly. Please reload the window to recover."),
                        actions: [instantiationService.createInstance(actions_2.ReloadWindowAction, actions_2.ReloadWindowAction.ID, actions_2.ReloadWindowAction.LABEL)]
                    });
                });
            }, errors.onUnexpectedError);
            var extensionsChannelPromise = sharedProcessClientPromise
                .then(function (client) { return client.getChannel('extensions'); });
            var channel = ipc_1.getDelayedChannel(extensionsChannelPromise);
            var extensionsService = new extensionsIpc_1.ExtensionsChannelClient(channel);
            serviceCollection.set(extensions_2.IExtensionsService, extensionsService);
            // Workbench
            this.workbench = instantiationService.createInstance(workbench_1.Workbench, workbenchContainer.getHTMLElement(), this.workspace, this.configuration, this.options, serviceCollection);
            this.workbench.startup({
                onWorkbenchStarted: function () {
                    _this.onWorkbenchStarted();
                }
            });
            // Electron integration
            this.workbench.getInstantiationService().createInstance(integration_1.ElectronIntegration).integrate(this.container);
            // Update
            this.workbench.getInstantiationService().createInstance(update_1.Update);
            // Handle case where workbench is not starting up properly
            var timeoutHandle = setTimeout(function () {
                console.warn('Workbench did not finish loading in 10 seconds, that might be a problem that should be reported.');
            }, 10000);
            this.workbench.joinCreation().then(function () {
                clearTimeout(timeoutHandle);
            });
            return workbenchContainer;
        };
        WorkbenchShell.prototype.onWorkbenchStarted = function () {
            // Log to telemetry service
            var windowSize = {
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
                outerHeight: window.outerHeight,
                outerWidth: window.outerWidth
            };
            this.telemetryService.publicLog('workspaceLoad', {
                userAgent: navigator.userAgent,
                windowSize: windowSize,
                emptyWorkbench: !this.contextService.getWorkspace(),
                customKeybindingsCount: this.keybindingService.customKeybindingsCount(),
                theme: this.currentTheme,
                language: platform.language
            });
            var workspaceStats = this.workbench.getInstantiationService().createInstance(workspaceStats_1.WorkspaceStats);
            workspaceStats.reportWorkspaceTags();
            if ((platform.isLinux || platform.isMacintosh) && process.getuid() === 0) {
                this.messageService.show(message_1.Severity.Warning, nls.localize('runningAsRoot', "It is recommended not to run Code as 'root'."));
            }
        };
        WorkbenchShell.prototype.initServiceCollection = function () {
            var _this = this;
            var serviceCollection = new serviceCollection_1.ServiceCollection();
            var instantiationService = new instantiationService_1.InstantiationService(serviceCollection, true);
            this.windowService = new windowService_1.WindowService();
            var disableWorkspaceStorage = this.configuration.env.extensionTestsPath || (!this.workspace && !this.configuration.env.extensionDevelopmentPath); // without workspace or in any extension test, we use inMemory storage unless we develop an extension where we want to preserve state
            this.storageService = new storage_1.Storage(this.contextService, window.localStorage, disableWorkspaceStorage ? storage_1.inMemoryLocalStorageInstance : window.localStorage);
            if (this.configuration.env.isBuilt && !this.configuration.env.extensionDevelopmentPath && !!this.configuration.env.enableTelemetry) {
                this.telemetryService = new electronTelemetryService_1.ElectronTelemetryService(this.configurationService, this.storageService, {
                    cleanupPatterns: [
                        [new RegExp(strings_1.escapeRegExpCharacters(this.configuration.env.appRoot), 'gi'), ''],
                        [new RegExp(strings_1.escapeRegExpCharacters(this.configuration.env.userExtensionsHome), 'gi'), '']
                    ],
                    version: this.configuration.env.version,
                    commitHash: this.configuration.env.commitHash
                });
            }
            else {
                this.telemetryService = telemetry_1.NullTelemetryService;
            }
            this.messageService = new messageService_1.MessageService(this.contextService, this.windowService, this.telemetryService);
            var fileService = new fileService_1.FileService(this.configurationService, this.eventService, this.contextService, this.messageService);
            var lifecycleService = new lifecycleService_1.LifecycleService(this.messageService, this.windowService);
            this.toUnbind.push(lifecycleService.onShutdown(function () { return fileService.dispose(); }));
            this.threadService = new threadService_1.MainThreadService(this.contextService, this.messageService, this.windowService, lifecycleService);
            var extensionService = new nativeExtensionService_1.MainProcessExtensionService(this.contextService, this.threadService, this.messageService, this.telemetryService);
            this.keybindingService = new keybindingService_1.WorkbenchKeybindingService(this.configurationService, this.contextService, this.eventService, this.telemetryService, this.messageService, extensionService, window);
            this.messagesShowingContextKey = this.keybindingService.createKey('globalMessageVisible', false);
            this.toUnbind.push(this.messageService.onMessagesShowing(function () { return _this.messagesShowingContextKey.set(true); }));
            this.toUnbind.push(this.messageService.onMessagesCleared(function () { return _this.messagesShowingContextKey.reset(); }));
            this.contextViewService = new contextViewService_1.ContextViewService(this.container, this.telemetryService, this.messageService);
            var requestService = new requestService_1.RequestService(this.contextService, this.configurationService, this.telemetryService);
            this.toUnbind.push(lifecycleService.onShutdown(function () { return requestService.dispose(); }));
            var markerService = new markerService_1.MainProcessMarkerService(this.threadService);
            var modeService = new modeServiceImpl_1.MainThreadModeServiceImpl(this.threadService, extensionService, this.configurationService);
            var modelService = new modelServiceImpl_1.ModelServiceImpl(this.threadService, markerService, modeService, this.configurationService, this.messageService);
            var editorWorkerService = new editorWorkerServiceImpl_1.EditorWorkerServiceImpl(modelService);
            var untitledEditorService = instantiationService.createInstance(untitledEditorService_1.UntitledEditorService);
            this.themeService = new themeService_2.ThemeService(extensionService, this.windowService, this.storageService);
            serviceCollection.set(telemetry_1.ITelemetryService, this.telemetryService);
            serviceCollection.set(event_1.IEventService, this.eventService);
            serviceCollection.set(request_1.IRequestService, requestService);
            serviceCollection.set(workspace_1.IWorkspaceContextService, this.contextService);
            serviceCollection.set(contextView_1.IContextViewService, this.contextViewService);
            serviceCollection.set(contextView_1.IContextMenuService, new contextmenuService_1.ContextMenuService(this.messageService, this.telemetryService, this.keybindingService));
            serviceCollection.set(message_1.IMessageService, this.messageService);
            serviceCollection.set(storage_2.IStorageService, this.storageService);
            serviceCollection.set(lifecycle_2.ILifecycleService, lifecycleService);
            serviceCollection.set(thread_1.IThreadService, this.threadService);
            serviceCollection.set(extensions_1.IExtensionService, extensionService);
            serviceCollection.set(modeService_1.IModeService, modeService);
            serviceCollection.set(files_1.IFileService, fileService);
            serviceCollection.set(untitledEditorService_1.IUntitledEditorService, untitledEditorService);
            serviceCollection.set(search_1.ISearchService, new searchService_1.SearchService(modelService, untitledEditorService, this.contextService, this.configurationService));
            serviceCollection.set(windowService_1.IWindowService, this.windowService);
            serviceCollection.set(configuration_1.IConfigurationService, this.configurationService);
            serviceCollection.set(keybindingService_2.IKeybindingService, this.keybindingService);
            serviceCollection.set(markers_1.IMarkerService, markerService);
            serviceCollection.set(modelService_1.IModelService, modelService);
            serviceCollection.set(codeEditorService_1.ICodeEditorService, new codeEditorServiceImpl_1.CodeEditorServiceImpl());
            serviceCollection.set(editorWorkerService_1.IEditorWorkerService, editorWorkerService);
            serviceCollection.set(themeService_1.IThemeService, this.themeService);
            serviceCollection.set(actions_1.IActionsService, new actionsService_1.default(extensionService, this.keybindingService));
            return [instantiationService, serviceCollection];
        };
        WorkbenchShell.prototype.open = function () {
            var _this = this;
            // Listen on unexpected errors
            errors.setUnexpectedErrorHandler(function (error) {
                _this.onUnexpectedError(error);
            });
            // Shell Class for CSS Scoping
            builder_1.$(this.container).addClass('monaco-shell');
            // Controls
            this.content = builder_1.$('.monaco-shell-content').appendTo(this.container).getHTMLElement();
            // Handle Load Performance Timers
            this.writeTimers();
            // Create Contents
            this.contentsContainer = this.createContents(builder_1.$(this.content));
            // Layout
            this.layout();
            // Listeners
            this.registerListeners();
            // Enable theme support
            this.themeService.initialize(this.container).then(null, function (error) {
                errors.onUnexpectedError(error);
            });
        };
        WorkbenchShell.prototype.registerListeners = function () {
            var _this = this;
            // Resize
            builder_1.$(window).on(dom.EventType.RESIZE, function () { return _this.layout(); }, this.toUnbind);
        };
        WorkbenchShell.prototype.writeTimers = function () {
            var timers = window.GlobalEnvironment.timers;
            if (timers) {
                var events = [];
                // Program
                if (timers.beforeProgram) {
                    events.push({
                        startTime: timers.beforeProgram,
                        stopTime: timers.afterProgram,
                        topic: 'Startup',
                        name: 'Program Start',
                        description: 'Time it takes to pass control to VSCodes main method'
                    });
                }
                // Window
                if (timers.vscodeStart) {
                    events.push({
                        startTime: timers.vscodeStart,
                        stopTime: timers.beforeLoad,
                        topic: 'Startup',
                        name: 'VSCode Startup',
                        description: 'Time it takes to create a window and startup VSCode'
                    });
                }
                // Load
                events.push({
                    startTime: timers.beforeLoad,
                    stopTime: timers.afterLoad,
                    topic: 'Startup',
                    name: 'Load Modules',
                    description: 'Time it takes to load VSCodes main modules'
                });
                // Ready
                events.push({
                    startTime: timers.beforeReady,
                    stopTime: timers.afterReady,
                    topic: 'Startup',
                    name: 'Event DOMContentLoaded',
                    description: 'Time it takes for the DOM to emit DOMContentLoaded event'
                });
                // Write to Timer
                timer.getTimeKeeper().setInitialCollectedEvents(events, timers.start);
            }
        };
        WorkbenchShell.prototype.onUnexpectedError = function (error) {
            var errorMsg = errors.toErrorMessage(error, true);
            if (!errorMsg) {
                return;
            }
            var now = new Date().getTime();
            if (errorMsg === this.previousErrorValue && now - this.previousErrorTime <= 1000) {
                return; // Return if error message identical to previous and shorter than 1 second
            }
            this.previousErrorTime = now;
            this.previousErrorValue = errorMsg;
            // Log to console
            console.error(errorMsg);
            // Show to user if friendly message provided
            if (error && error.friendlyMessage && this.messageService) {
                this.messageService.show(message_1.Severity.Error, error.friendlyMessage);
            }
        };
        WorkbenchShell.prototype.layout = function () {
            var clArea = builder_1.$(this.container).getClientArea();
            var contentsSize = new builder_1.Dimension(clArea.width, clArea.height);
            this.contentsContainer.size(contentsSize.width, contentsSize.height);
            this.contextViewService.layout();
            this.workbench.layout();
        };
        WorkbenchShell.prototype.joinCreation = function () {
            return this.workbench.joinCreation();
        };
        WorkbenchShell.prototype.dispose = function () {
            // Workbench
            if (this.workbench) {
                this.workbench.dispose();
            }
            this.contextViewService.dispose();
            this.storageService.dispose();
            // Listeners
            this.toUnbind = lifecycle_1.dispose(this.toUnbind);
            // Container
            builder_1.$(this.container).empty();
        };
        return WorkbenchShell;
    }());
    exports.WorkbenchShell = WorkbenchShell;
});
//# sourceMappingURL=shell.js.map