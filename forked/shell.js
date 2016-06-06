/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/platform', 'vs/base/browser/builder', 'vs/base/browser/dom', 'vs/base/browser/ui/aria/aria', 'vs/base/common/lifecycle', 'vs/base/common/errors', 'vs/platform/contextview/browser/contextViewService', 'vs/platform/contextview/browser/contextMenuService', 'vs/base/common/timer', 'vs/workbench/browser/workbench', 'vs/workbench/common/storage', 'vs/platform/telemetry/common/telemetry', 'vs/platform/telemetry/common/workspaceStats', 'forked/windowService', 'vs/workbench/services/message/browser/messageService', 'vs/platform/configuration/common/configuration', 'forked/fileService', 'vs/editor/browser/standalone/simpleServices', 'vs/platform/thread/common/mainThreadService', 'vs/platform/markers/common/markerService', 'vs/platform/actions/common/actions', 'vs/platform/actions/common/actionsService', 'vs/editor/common/services/modelService', 'vs/editor/common/services/modelServiceImpl', 'vs/editor/browser/services/codeEditorServiceImpl', 'vs/editor/common/services/codeEditorService', 'vs/editor/common/services/editorWorkerServiceImpl', 'vs/editor/common/services/editorWorkerService', 'vs/platform/storage/common/storage', 'vs/platform/instantiation/common/serviceCollection', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/contextview/browser/contextView', 'vs/platform/event/common/event', 'vs/platform/files/common/files', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/markers/common/markers', 'vs/platform/message/common/message', 'vs/platform/request/common/request', 'vs/platform/thread/common/thread', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/extensions/common/extensions', 'vs/editor/common/services/modeServiceImpl', 'vs/editor/common/services/modeService', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/themes/common/themeService', 'forked/themeService', 'vs/workbench/parts/files/common/files', 'forked/bogusTextFileServices', 'vs/editor/common/modes/modesRegistry', 'vs/platform/extensions/common/extensionsRegistry', 'vs/platform/jsonschemas/common/jsonContributionRegistry', 'vs/platform/platform', 'forked/navbarPart', 'forked/navbarService', 'forked/userSettings', 'userNavbarItem', 'githubService', 'vs/css!vs/workbench/electron-browser/media/shell', 'vs/css!./editorpart', 'vs/languages/json/common/json.contribution', 'vs/editor/standalone-languages/all', 'vs/editor/browser/standalone/standaloneSchemas', 'vs/platform/opener/electron-browser/opener.contribution'], function (require, exports, platform, builder_1, dom, aria, lifecycle_1, errors, contextViewService_1, contextMenuService_1, timer, workbench_1, storage_1, telemetry_1, workspaceStats_1, windowService_1, messageService_1, configuration_1, fileService_1, simpleServices_1, mainThreadService_1, markerService_1, actions_1, actionsService_1, modelService_1, modelServiceImpl_1, codeEditorServiceImpl_1, codeEditorService_1, editorWorkerServiceImpl_1, editorWorkerService_1, storage_2, serviceCollection_1, instantiationService_1, contextView_1, event_1, files_1, keybindingService_1, lifecycle_2, markers_1, message_1, request_1, thread_1, contextService_1, extensions_1, modeServiceImpl_1, modeService_1, untitledEditorService_1, themeService_1, themeService_2, files_2, bogusTextFileServices_1, modesRegistry_1, extensionsRegistry_1, jsonContributionRegistry_1, platform_1, navbarPart_1, navbarService_1, userSettings_1, userNavbarItem_1, githubService_1) {
    'use strict';
    var Identifiers = {
        NAVBAR_PART: 'workbench.parts.navbar'
    };
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
            var _a = this.initServiceCollection(), instantiationService = _a[0], serviceCollection = _a[1];
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
            /* TODO:
            const extensionsChannelPromise = sharedProcessClientPromise
                .then(client => client.getChannel<IExtensionsChannel>('extensions'));
    
            const channel = getDelayedChannel<IExtensionsChannel>(extensionsChannelPromise);
            const extensionsService = new ExtensionsChannelClient(channel);
    
            serviceCollection.set(IExtensionsService, extensionsService);
            */
            // Workbench
            this.workbench = instantiationService.createInstance(workbench_1.Workbench, workbenchContainer.getHTMLElement(), this.workspace, this.configuration, this.options, serviceCollection);
            this.workbench.startup({
                onWorkbenchStarted: function () {
                    _this.onWorkbenchStarted();
                    // Asynchronously load settings
                    var settingsService = instantiationService.createInstance(userSettings_1.UserSettings);
                    serviceCollection.set(settingsService, userSettings_1.UserSettings);
                    settingsService.loadSettings();
                },
                onServicesCreated: function () {
                    // The Navbar requires the IWorkbenchEditorService instantiated by the Workbench
                    // so it can't be created before this point. However, the Workbench performs layout
                    // for which the Navbar must be present. So we tuck its creation in here after
                    // the Workbench has created the services but before it initiates layout.
                    _this.navbarPart = new navbarPart_1.NavbarPart(Identifiers.NAVBAR_PART, instantiationService);
                    // TODO:		this.toDispose.push(this.navbarPart);
                    // TODO:		this.toShutdown.push(this.navbarPart);
                    serviceCollection.set(navbarService_1.INavbarService, _this.navbarPart);
                    _this.createNavbarPart();
                    _this.populateNavbar(instantiationService);
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
        WorkbenchShell.prototype.createNavbarPart = function () {
            var navbarContainer = builder_1.$(this.content).div({
                'class': ['part', 'navbar'],
                id: Identifiers.NAVBAR_PART,
                role: 'contentinfo'
            });
            this.navbarPart.create(navbarContainer);
        };
        WorkbenchShell.prototype.populateNavbar = function (instantiationService) {
            this.navbarPart.addEntry({ text: '$(beaker) GH Code', tooltip: 'Brought to you by Spiffcode, Inc', command: 'whatever' }, navbarService_1.NavbarAlignment.LEFT, 1000);
            var userItem = instantiationService.createInstance(userNavbarItem_1.UserNavbarItem);
            this.navbarPart.addItem(userItem, navbarService_1.NavbarAlignment.RIGHT, 400);
            if (this.githubService.isAuthenticated()) {
                this.navbarPart.addEntry({ text: '$(gear)', tooltip: 'User Settings', command: 'workbench.action.openGlobalSettings' }, navbarService_1.NavbarAlignment.RIGHT, 300);
                this.navbarPart.addEntry({ text: '$(keyboard)', tooltip: 'Keyboard Shortcuts', command: 'workbench.action.openGlobalKeybindings' }, navbarService_1.NavbarAlignment.RIGHT, 200);
                this.navbarPart.addEntry({ text: '$(question)', tooltip: 'info menu...', command: 'whatever' }, navbarService_1.NavbarAlignment.RIGHT, 100);
            }
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
                theme: this.currentTheme,
                language: platform.language
            });
            var workspaceStats = this.workbench.getInstantiationService().createInstance(workspaceStats_1.WorkspaceStats);
            workspaceStats.reportWorkspaceTags();
            /* GHC: Not need when running in-browser.
            if ((platform.isLinux || platform.isMacintosh) && process.getuid() === 0) {
                this.messageService.show(Severity.Warning, nls.localize('runningAsRoot', "It is recommended not to run Code as 'root'."));
            }
            */
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
            var i = uri.lastIndexOf('/');
            var pattern = uri.slice(i + 1) + '.json';
            // TODO: schemaRegistry.addSchemaFileAssociation(pattern, uri);
        };
        WorkbenchShell.prototype.initServiceCollection = function () {
            var _this = this;
            var serviceCollection = new serviceCollection_1.ServiceCollection();
            var instantiationService = new instantiationService_1.InstantiationService(serviceCollection, true);
            this.windowService = new windowService_1.WindowService();
            var disableWorkspaceStorage = this.configuration.env.extensionTestsPath || (!this.workspace && !this.configuration.env.extensionDevelopmentPath); // without workspace or in any extension test, we use inMemory storage unless we develop an extension where we want to preserve state
            this.storageService = new storage_1.Storage(this.contextService, window.localStorage, disableWorkspaceStorage ? storage_1.inMemoryLocalStorageInstance : window.localStorage);
            if (this.configuration.env.isBuilt && !this.configuration.env.extensionDevelopmentPath && !!this.configuration.env.enableTelemetry) {
            }
            else {
                this.telemetryService = telemetry_1.NullTelemetryService;
            }
            // TODO: this.messageService = new MessageService(this.contextService, this.windowService, this.telemetryService);
            this.messageService = new messageService_1.WorkbenchMessageService(this.telemetryService);
            var requestService = new simpleServices_1.SimpleEditorRequestService(this.contextService, this.telemetryService);
            // TODO: this.toUnbind.push(lifecycleService.onShutdown(() => requestService.dispose()));
            var fileService = new fileService_1.FileService(this.configurationService, this.eventService, this.contextService, this.messageService, requestService, this.githubService);
            fileService.updateOptions({
                settingsNotificationPaths: [
                    this.configuration.env.appSettingsPath,
                    this.configuration.env.appKeybindingsPath
                ],
                gistRegEx: this.configuration.env.gistRegEx
            });
            this.contextViewService = new contextViewService_1.ContextViewService(this.container, this.telemetryService, this.messageService);
            var lifecycleService = lifecycle_2.NullLifecycleService;
            this.toUnbind.push(lifecycleService.onShutdown(function () { return fileService.dispose(); }));
            // TODO: this.threadService = new MainThreadService(this.contextService, this.messageService, this.windowService, lifecycleService);
            this.threadService = new mainThreadService_1.MainThreadService(this.contextService, 'vs/editor/common/worker/editorWorkerServer', 1);
            // TODO:		let extensionService = new MainProcessExtensionService(this.contextService, this.threadService, this.messageService, this.telemetryService);
            var extensionService = new simpleServices_1.SimpleExtensionService();
            this.keybindingService = new simpleServices_1.StandaloneKeybindingService(this.configurationService, this.messageService, document.body);
            this.messagesShowingContextKey = this.keybindingService.createKey('globalMessageVisible', false);
            this.toUnbind.push(this.messageService.onMessagesShowing(function () { return _this.messagesShowingContextKey.set(true); }));
            this.toUnbind.push(this.messageService.onMessagesCleared(function () { return _this.messagesShowingContextKey.reset(); }));
            this.contextViewService = new contextViewService_1.ContextViewService(this.container, this.telemetryService, this.messageService);
            var markerService = new markerService_1.MainProcessMarkerService(this.threadService);
            var modeService = this.modeService = new modeServiceImpl_1.MainThreadModeServiceImpl(this.threadService, extensionService, this.configurationService);
            var modelService = this.modelService = new modelServiceImpl_1.ModelServiceImpl(this.threadService, markerService, modeService, this.configurationService, this.messageService);
            var editorWorkerService = this.editorWorkerService = new editorWorkerServiceImpl_1.EditorWorkerServiceImpl(modelService);
            var untitledEditorService = instantiationService.createInstance(untitledEditorService_1.UntitledEditorService);
            this.themeService = new themeService_2.ThemeService(extensionService, this.windowService, this.storageService);
            serviceCollection.set(telemetry_1.ITelemetryService, this.telemetryService);
            serviceCollection.set(event_1.IEventService, this.eventService);
            serviceCollection.set(request_1.IRequestService, requestService);
            serviceCollection.set(contextService_1.IWorkspaceContextService, this.contextService);
            serviceCollection.set(contextView_1.IContextViewService, this.contextViewService);
            serviceCollection.set(contextView_1.IContextMenuService, new contextMenuService_1.ContextMenuService(document.body /* TODO: correct element? */, this.telemetryService, this.messageService, this.contextViewService));
            serviceCollection.set(message_1.IMessageService, this.messageService);
            serviceCollection.set(storage_2.IStorageService, this.storageService);
            serviceCollection.set(lifecycle_2.ILifecycleService, lifecycleService);
            serviceCollection.set(thread_1.IThreadService, this.threadService);
            serviceCollection.set(extensions_1.IExtensionService, extensionService);
            serviceCollection.set(modeService_1.IModeService, modeService);
            serviceCollection.set(files_1.IFileService, fileService);
            serviceCollection.set(untitledEditorService_1.IUntitledEditorService, untitledEditorService);
            // TODO: serviceCollection.set(ISearchService, new SearchService(modelService, untitledEditorService, this.contextService, this.configurationService));
            serviceCollection.set(windowService_1.IWindowService, this.windowService);
            serviceCollection.set(configuration_1.IConfigurationService, this.configurationService);
            serviceCollection.set(keybindingService_1.IKeybindingService, this.keybindingService);
            serviceCollection.set(markers_1.IMarkerService, markerService);
            serviceCollection.set(modelService_1.IModelService, modelService);
            serviceCollection.set(codeEditorService_1.ICodeEditorService, new codeEditorServiceImpl_1.CodeEditorServiceImpl());
            serviceCollection.set(editorWorkerService_1.IEditorWorkerService, editorWorkerService);
            serviceCollection.set(themeService_1.IThemeService, this.themeService);
            serviceCollection.set(actions_1.IActionsService, new actionsService_1.default(extensionService, this.keybindingService));
            serviceCollection.set(githubService_1.IGithubService, this.githubService);
            this.textFileService = new bogusTextFileServices_1.TextFileService(this.contextService, instantiationService, fileService, untitledEditorService, lifecycleService, this.telemetryService, this.configurationService, this.eventService, modeService, null /* TODO: IWorkbenchEditorService */, this.windowService);
            serviceCollection.set(files_2.ITextFileService, this.textFileService);
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
            // Apply no-workspace state as CSS class
            if (!this.workspace) {
                builder_1.$(this.content).addClass('no-workspace');
            }
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
            var navbarStyle = this.navbarPart.getContainer().getComputedStyle();
            var navbarHeight = parseInt(navbarStyle.getPropertyValue('height'), 10) || 18;
            this.navbarPart.getContainer().position(0);
            this.contentsContainer.position(navbarHeight);
            this.contentsContainer.size(contentsSize.width, contentsSize.height - navbarHeight);
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