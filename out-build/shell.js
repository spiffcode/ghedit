/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/browser/builder', 'vs/base/browser/dom', 'vs/base/browser/ui/aria/aria', 'vs/base/common/lifecycle', 'vs/base/common/errors', 'vs/platform/contextview/browser/contextViewService', 'vs/platform/contextview/browser/contextMenuService', 'vs/base/common/timer', 'vs/workbench/browser/workbench', 'vs/workbench/common/storage', 'vs/platform/telemetry/common/telemetry', 'vs/platform/telemetry/common/workspaceStats', 'windowService', 'vs/workbench/services/message/browser/messageService', 'vs/platform/configuration/common/configuration', 'fileService', 'vs/platform/lifecycle/common/baseLifecycleService', 'vs/editor/browser/standalone/simpleServices', 'vs/platform/thread/common/mainThreadService', 'vs/platform/markers/common/markerService', 'vs/platform/actions/common/actions', 'vs/platform/actions/common/actionsService', 'vs/editor/common/services/modelService', 'vs/editor/common/services/modelServiceImpl', 'vs/editor/browser/services/codeEditorServiceImpl', 'vs/editor/common/services/codeEditorService', 'vs/editor/common/services/editorWorkerServiceImpl', 'vs/editor/common/services/editorWorkerService', 'vs/platform/jsonschemas/common/jsonValidationExtensionPoint', 'vs/platform/telemetry/common/remoteTelemetryService', 'vs/platform/storage/common/storage', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/contextview/browser/contextView', 'vs/platform/event/common/event', 'vs/platform/files/common/files', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/markers/common/markers', 'vs/platform/message/common/message', 'vs/platform/thread/common/thread', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/extensions/common/extensions', 'vs/editor/common/services/modeServiceImpl', 'vs/editor/common/services/modeService', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/themes/common/themeService', 'themeService', 'vs/workbench/parts/files/common/files', 'bogusTextFileServices', 'vs/editor/common/modes/modesRegistry', 'vs/platform/extensions/common/extensionsRegistry', 'vs/platform/jsonschemas/common/jsonContributionRegistry', 'vs/platform/platform', 'vs/css!vs/workbench/electron-browser/media/shell', 'vs/languages/json/common/json.contribution', 'vs/editor/standalone-languages/all', 'vs/editor/browser/standalone/standaloneSchemas'], function (require, exports, builder_1, dom, aria, lifecycle_1, errors, contextViewService_1, contextMenuService_1, timer, workbench_1, storage_1, telemetry_1, workspaceStats_1, windowService_1, messageService_1, configuration_1, fileService_1, baseLifecycleService_1, simpleServices_1, mainThreadService_1, markerService_1, actions_1, actionsService_1, modelService_1, modelServiceImpl_1, codeEditorServiceImpl_1, codeEditorService_1, editorWorkerServiceImpl_1, editorWorkerService_1, jsonValidationExtensionPoint_1, remoteTelemetryService_1, storage_2, instantiationService_1, contextView_1, event_1, files_1, keybindingService_1, lifecycle_2, markers_1, message_1, thread_1, contextService_1, extensions_1, modeServiceImpl_1, modeService_1, untitledEditorService_1, themeService_1, themeService_2, files_2, bogusTextFileServices_1, modesRegistry_1, extensionsRegistry_1, jsonContributionRegistry_1, platform_1) {
    'use strict';
    var MonacoEditorLanguages = this.MonacoEditorLanguages || [];
    var MonacoEditorSchemas = this.MonacoEditorSchemas || {};
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
            this.githubService = services.githubService;
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
            var instantiationService = this.initInstantiationService();
            //crash reporting
            if (!!this.configuration.env.crashReporter) {
            }
            /* TODO:
            const sharedProcessClientPromise = connect(process.env['VSCODE_SHARED_IPC_HOOK']);
            sharedProcessClientPromise.done(service => {
                service.onClose(() => {
                    this.messageService.show(Severity.Error, {
                        message: nls.localize('sharedProcessCrashed', "The shared process terminated unexpectedly. Please reload the window to recover."),
                        actions: [instantiationService.createInstance(ReloadWindowAction, ReloadWindowAction.ID, ReloadWindowAction.LABEL)]
                    });
                });
            }, errors.onUnexpectedError);
            */
            // TODO:		instantiationService.addSingleton(IExtensionsService, getService<IExtensionsService>(sharedProcessClientPromise, 'ExtensionService', ExtensionsService));
            // Workbench
            this.workbench = new workbench_1.Workbench(workbenchContainer.getHTMLElement(), this.workspace, this.configuration, this.options, instantiationService);
            this.workbench.startup({
                onServicesCreated: function () {
                    _this.initExtensionSystem();
                },
                onWorkbenchStarted: function () {
                    _this.onWorkbenchStarted();
                }
            });
            // Electron integration
            // TODO:		this.workbench.getInstantiationService().createInstance(ElectronIntegration).integrate(this.container);
            // Update
            // TODO:		this.workbench.getInstantiationService().createInstance(Update);
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
            var _this = this;
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
                theme: this.currentTheme
            });
            var workspaceStats = this.workbench.getInstantiationService().createInstance(workspaceStats_1.WorkspaceStats);
            workspaceStats.reportWorkspaceTags();
            // Register all built-in standalone languages.
            MonacoEditorLanguages.forEach(function (language) {
                _this.registerMonarchStandaloneLanguage(language, language.defModule);
            });
            // Register the languages we have smarter handlers for.
            // These lines come from typescript.contrbution.ts which can't simply be imported
            // because of its dependency on vs/editor/browser/standalone/standaloneCodeEditor
            // for the registerStandaloneLanguage implementation.
            this.registerStandaloneLanguage({
                id: 'typescript',
                extensions: ['.ts'],
                aliases: ['TypeScript', 'ts', 'typescript'],
                mimetypes: ['text/typescript'],
            }, 'vs/languages/typescript/common/mode');
            this.registerStandaloneLanguage({
                id: 'javascript',
                extensions: ['.js', '.es6'],
                firstLine: '^#!.*\\bnode',
                filenames: ['jakefile'],
                aliases: ['JavaScript', 'javascript', 'js'],
                mimetypes: ['text/javascript'],
            }, 'vs/languages/typescript/common/mode');
            // Register all built-in standalone JSON schemas.
            for (var uri in MonacoEditorSchemas) {
                this.registerStandaloneSchema(uri, MonacoEditorSchemas[uri]);
            }
        };
        // These are adapted versions of functions in vs/editor/browser/standalone/standaloneCodeEditor
        // without the creation of conflicting supporting services.
        WorkbenchShell.prototype.registerMonarchStandaloneLanguage = function (language, defModule) {
            var _this = this;
            modesRegistry_1.ModesRegistry.registerLanguage(language);
            extensionsRegistry_1.ExtensionsRegistry.registerOneTimeActivationEventListener('onLanguage:' + language.id, function () {
                require([defModule], function (value) {
                    if (!value.language) {
                        console.error('Expected ' + defModule + ' to export an `language`');
                        return;
                    }
                    var modeService = _this.modeService;
                    var modelService = _this.modelService;
                    modeService.registerMonarchDefinition(modelService, _this.editorWorkerService, language.id, value.language);
                }, function (err) {
                    console.error('Cannot find module ' + defModule, err);
                });
            });
        };
        WorkbenchShell.prototype.registerStandaloneLanguage = function (language, defModule) {
            var _this = this;
            modesRegistry_1.ModesRegistry.registerLanguage(language);
            extensionsRegistry_1.ExtensionsRegistry.registerOneTimeActivationEventListener('onLanguage:' + language.id, function () {
                require([defModule], function (value) {
                    if (!value.activate) {
                        console.error('Expected ' + defModule + ' to export an `activate` function');
                        return;
                    }
                    _this.workbench.getInstantiationService().invokeFunction(value.activate);
                }, function (err) {
                    console.error('Cannot find module ' + defModule, err);
                });
            });
        };
        WorkbenchShell.prototype.registerStandaloneSchema = function (uri, schema) {
            var schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
            schemaRegistry.registerSchema(uri, schema);
        };
        WorkbenchShell.prototype.initInstantiationService = function () {
            this.windowService = new windowService_1.WindowService();
            var disableWorkspaceStorage = this.configuration.env.extensionTestsPath || (!this.workspace && !this.configuration.env.extensionDevelopmentPath); // without workspace or in any extension test, we use inMemory storage unless we develop an extension where we want to preserve state
            this.storageService = new storage_1.Storage(this.contextService, window.localStorage, disableWorkspaceStorage ? storage_1.inMemoryLocalStorageInstance : window.localStorage);
            if (this.configuration.env.isBuilt
                && !this.configuration.env.extensionDevelopmentPath // no telemetry in a window for extension development!
                && !!this.configuration.env.enableTelemetry) {
            }
            else {
                this.telemetryService = telemetry_1.NullTelemetryService;
            }
            // TODO: 		this.keybindingService = new WorkbenchKeybindingService(this.configurationService, this.contextService, this.eventService, this.telemetryService, <any>window);
            this.keybindingService = new simpleServices_1.StandaloneKeybindingService(this.configurationService, document.body);
            // TODO: 		this.messageService = new MessageService(this.contextService, this.windowService, this.telemetryService, this.keybindingService);
            this.messageService = new messageService_1.WorkbenchMessageService(this.telemetryService, this.keybindingService);
            this.keybindingService.setMessageService(this.messageService);
            var fileService = new fileService_1.FileService(this.configurationService, this.eventService, this.contextService, this.githubService);
            this.contextViewService = new contextViewService_1.ContextViewService(this.container, this.telemetryService, this.messageService);
            // TODO: 		let lifecycleService = new LifecycleService(this.messageService, this.windowService);
            var lifecycleService = new baseLifecycleService_1.BaseLifecycleService();
            // TODO: 		lifecycleService.onShutdown(() => fileService.dispose());
            // TODO: 		this.threadService = new MainThreadService(this.contextService, this.messageService, this.windowService);
            this.threadService = new mainThreadService_1.MainThreadService(this.contextService, 'vs/editor/common/worker/editorWorkerServer', 1);
            // TODO: 		lifecycleService.onShutdown(() => this.threadService.dispose());
            /* TODO:
                    let requestService = new RequestService(
                        this.contextService,
                        this.configurationService,
                        this.telemetryService
                    );
            */
            // TODO: 		lifecycleService.onShutdown(() => requestService.dispose());
            var markerService = new markerService_1.MainProcessMarkerService(this.threadService);
            // TODO: 		let extensionService = new MainProcessExtensionService(this.contextService, this.threadService, this.messageService, this.telemetryService);
            var extensionService = new simpleServices_1.SimpleExtensionService();
            // TODO: 		this.keybindingService.setExtensionService(extensionService);
            var modeService = this.modeService = new modeServiceImpl_1.MainThreadModeServiceImpl(this.threadService, extensionService, this.configurationService);
            var modelService = this.modelService = new modelServiceImpl_1.ModelServiceImpl(this.threadService, markerService, modeService, this.configurationService, this.messageService);
            var editorWorkerService = this.editorWorkerService = new editorWorkerServiceImpl_1.EditorWorkerServiceImpl(modelService);
            var untitledEditorService = new untitledEditorService_1.UntitledEditorService();
            this.themeService = new themeService_2.ThemeService(extensionService, this.windowService, this.storageService);
            var result = instantiationService_1.createInstantiationService();
            result.addSingleton(telemetry_1.ITelemetryService, this.telemetryService);
            result.addSingleton(event_1.IEventService, this.eventService);
            // TODO:		result.addSingleton(IRequestService, requestService);
            result.addSingleton(contextService_1.IWorkspaceContextService, this.contextService);
            result.addSingleton(contextView_1.IContextViewService, this.contextViewService);
            result.addSingleton(contextView_1.IContextMenuService, new contextMenuService_1.ContextMenuService(document.body /* TODO: correct element? */, this.telemetryService, this.messageService, this.contextViewService));
            result.addSingleton(message_1.IMessageService, this.messageService);
            result.addSingleton(storage_2.IStorageService, this.storageService);
            result.addSingleton(lifecycle_2.ILifecycleService, lifecycleService);
            result.addSingleton(thread_1.IThreadService, this.threadService);
            result.addSingleton(extensions_1.IExtensionService, extensionService);
            result.addSingleton(modeService_1.IModeService, modeService);
            result.addSingleton(files_1.IFileService, fileService);
            result.addSingleton(untitledEditorService_1.IUntitledEditorService, untitledEditorService);
            // TODO: 		result.addSingleton(ISearchService, new SearchService(modelService, untitledEditorService, this.contextService, configService));
            result.addSingleton(windowService_1.IWindowService, this.windowService);
            result.addSingleton(configuration_1.IConfigurationService, this.configurationService);
            result.addSingleton(keybindingService_1.IKeybindingService, this.keybindingService);
            result.addSingleton(markers_1.IMarkerService, markerService);
            result.addSingleton(modelService_1.IModelService, modelService);
            result.addSingleton(codeEditorService_1.ICodeEditorService, new codeEditorServiceImpl_1.CodeEditorServiceImpl());
            result.addSingleton(editorWorkerService_1.IEditorWorkerService, editorWorkerService);
            result.addSingleton(themeService_1.IThemeService, this.themeService);
            result.addSingleton(actions_1.IActionsService, new actionsService_1.default(extensionService, this.keybindingService));
            // TODO: this should be moved to workbench.ts
            this.textFileService = new bogusTextFileServices_1.TextFileService(this.contextService, result, fileService, untitledEditorService, lifecycleService, this.telemetryService, this.configurationService, this.eventService, modeService, null /* TODO: IWorkbenchEditorService */, this.windowService);
            result.addSingleton(files_2.ITextFileService, this.textFileService);
            return result;
        };
        // TODO@Alex, TODO@Joh move this out of here?
        WorkbenchShell.prototype.initExtensionSystem = function () {
            // TODO: 		this.threadService.getRemotable(MainProcessVSCodeAPIHelper);
            // TODO: 		this.threadService.getRemotable(MainThreadDocuments);
            this.threadService.getRemotable(remoteTelemetryService_1.RemoteTelemetryServiceHelper);
            // TODO:		this.workbench.getInstantiationService().createInstance(MainProcessTextMateSyntax);
            // TODO:		this.workbench.getInstantiationService().createInstance(MainProcessTextMateSnippet);
            this.workbench.getInstantiationService().createInstance(jsonValidationExtensionPoint_1.JSONValidationExtensionPoint);
            // TODO:		this.workbench.getInstantiationService().createInstance(LanguageConfigurationFileHandler);
            // TODO: 		this.threadService.getRemotable(MainThreadConfiguration);
            // TODO: 		this.threadService.getRemotable(MainThreadQuickOpen);
            // TODO: 		this.threadService.getRemotable(MainThreadStatusBar);
            // TODO:		this.workbench.getInstantiationService().createInstance(MainThreadFileSystemEventService);
            // TODO: 		this.threadService.getRemotable(MainThreadCommands);
            // TODO: 		this.threadService.getRemotable(MainThreadOutputService);
            // TODO: 		this.threadService.getRemotable(MainThreadDiagnostics);
            // TODO: 		this.threadService.getRemotable(MainThreadMessageService);
            // TODO: 		this.threadService.getRemotable(MainThreadLanguages);
            // TODO: 		this.threadService.getRemotable(MainThreadWorkspace);
            // TODO: 		this.threadService.getRemotable(MainThreadEditors);
            // TODO: 		this.threadService.getRemotable(MainThreadStorage);
            // TODO: 		this.threadService.getRemotable(MainThreadLanguageFeatures);
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
            var timers = window.MonacoEnvironment.timers;
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
        WorkbenchShell.prototype.dispose = function (force) {
            // Workbench
            if (this.workbench) {
                var veto = this.workbench.shutdown(force);
                // If Workbench vetos dispose, return early
                if (veto) {
                    return;
                }
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