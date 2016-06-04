/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// Forked from c212f0908f3d29933317bbc3233568fbca7944b1:./vs/workbench/electron-browser/shell.ts
// This is a port of vs/workbench/electron-browser/shell.ts with Electron and Node dependencies
// removed/replaced.

import 'vs/css!vs/workbench/electron-browser/media/shell';
import 'vs/css!./editorpart';

import * as nls from 'vs/nls';
import {TPromise} from 'vs/base/common/winjs.base';
import * as platform from 'vs/base/common/platform';
import {Dimension, Builder, $} from 'vs/base/browser/builder';
import {escapeRegExpCharacters} from 'vs/base/common/strings';
import dom = require('vs/base/browser/dom');
import aria = require('vs/base/browser/ui/aria/aria');
import {dispose, IDisposable} from 'vs/base/common/lifecycle';
import errors = require('vs/base/common/errors');
import {ContextViewService} from 'vs/platform/contextview/browser/contextViewService';
import {ContextMenuService} from 'vs/platform/contextview/browser/contextMenuService';
import timer = require('vs/base/common/timer');
import {Workbench} from 'vs/workbench/browser/workbench';
import {Storage, inMemoryLocalStorageInstance} from 'vs/workbench/common/storage';
import {ITelemetryService, NullTelemetryService} from 'vs/platform/telemetry/common/telemetry';
// TODO: import {ElectronTelemetryService} from  'vs/platform/telemetry/electron-browser/electronTelemetryService';
// TODO: import {ElectronIntegration} from 'vs/workbench/electron-browser/integration';
// TODO: import {Update} from 'vs/workbench/electron-browser/update';
import {WorkspaceStats} from 'vs/platform/telemetry/common/workspaceStats';
import {IWindowService, WindowService} from 'forked/windowService';
// TODO: import {MessageService} from 'vs/workbench/services/message/electron-browser/messageService';
import {WorkbenchMessageService as MessageService} from 'vs/workbench/services/message/browser/messageService';
// TODO: import {RequestService} from 'vs/workbench/services/request/node/requestService';
import {IConfigurationService} from 'vs/platform/configuration/common/configuration';
import {FileService} from 'forked/fileService';
// TODO: import {SearchService} from 'vs/workbench/services/search/node/searchService';
// TODO: import {LifecycleService} from 'vs/workbench/services/lifecycle/electron-browser/lifecycleService';
// TODO: import {WorkbenchKeybindingService} from 'vs/workbench/services/keybinding/electron-browser/keybindingService';
import {StandaloneKeybindingService as WorkbenchKeybindingService, SimpleExtensionService as MainProcessExtensionService, SimpleEditorRequestService as RequestService} from 'vs/editor/browser/standalone/simpleServices';
// TODO: import {MainThreadService} from 'vs/workbench/services/thread/electron-browser/threadService';
import {MainThreadService} from 'vs/platform/thread/common/mainThreadService';
import {MainProcessMarkerService} from 'vs/platform/markers/common/markerService';
import {IActionsService} from 'vs/platform/actions/common/actions';
import ActionsService from 'vs/platform/actions/common/actionsService';
import {IModelService} from 'vs/editor/common/services/modelService';
import {ModelServiceImpl} from 'vs/editor/common/services/modelServiceImpl';
import {CodeEditorServiceImpl} from 'vs/editor/browser/services/codeEditorServiceImpl';
import {ICodeEditorService} from 'vs/editor/common/services/codeEditorService';
import {EditorWorkerServiceImpl} from 'vs/editor/common/services/editorWorkerServiceImpl';
import {IEditorWorkerService} from 'vs/editor/common/services/editorWorkerService';
// TODO: import {MainProcessExtensionService} from 'vs/platform/extensions/common/nativeExtensionService';
import {IOptions} from 'vs/workbench/common/options';
import {IStorageService} from 'vs/platform/storage/common/storage';
import {ServiceCollection} from 'vs/platform/instantiation/common/serviceCollection';
import {InstantiationService} from 'vs/platform/instantiation/common/instantiationService';
import {IContextViewService, IContextMenuService} from 'vs/platform/contextview/browser/contextView';
import {IEventService} from 'vs/platform/event/common/event';
import {IFileService} from 'vs/platform/files/common/files';
import {IKeybindingService, IKeybindingContextKey} from 'vs/platform/keybinding/common/keybindingService';
import {ILifecycleService, NullLifecycleService} from 'vs/platform/lifecycle/common/lifecycle';
import {IMarkerService} from 'vs/platform/markers/common/markers';
import {IMessageService, Severity} from 'vs/platform/message/common/message';
import {IRequestService} from 'vs/platform/request/common/request';
import {ISearchService} from 'vs/platform/search/common/search';
import {IThreadService} from 'vs/platform/thread/common/thread';
import {IConfiguration, IWorkspace} from 'vs/platform/workspace/common/workspace';
import {IWorkspaceContextService} from 'vs/workbench/services/workspace/common/contextService';
import {IExtensionService} from 'vs/platform/extensions/common/extensions';
import {MainThreadModeServiceImpl} from 'vs/editor/common/services/modeServiceImpl';
import {IModeService} from 'vs/editor/common/services/modeService';
import {IUntitledEditorService, UntitledEditorService} from 'vs/workbench/services/untitled/common/untitledEditorService';
// TODO: import {CrashReporter} from 'vs/workbench/electron-browser/crashReporter';
import {IThemeService} from 'vs/workbench/services/themes/common/themeService';
// TODO: import {ThemeService} from 'vs/workbench/services/themes/electron-browser/themeService';
import {ThemeService} from 'forked/themeService';
import {getDelayedChannel} from 'vs/base/parts/ipc/common/ipc';
// TODO: import {connect} from 'vs/base/parts/ipc/node/ipc.net';
import {IExtensionsChannel, ExtensionsChannelClient} from 'vs/workbench/parts/extensions/common/extensionsIpc';
import {IExtensionsService} from 'vs/workbench/parts/extensions/common/extensions';
// TODO: import {ReloadWindowAction} from 'vs/workbench/electron-browser/actions';

// Import everything we need to add all the standalone language and json schema support.
import {ITextFileService} from 'vs/workbench/parts/files/common/files';
import {TextFileService} from 'forked/bogusTextFileServices';
import {ILanguageExtensionPoint} from 'vs/editor/common/services/modeService';
import {ModesRegistry} from 'vs/editor/common/modes/modesRegistry';
import {ExtensionsRegistry} from 'vs/platform/extensions/common/extensionsRegistry';
import {ILanguage} from 'vs/editor/common/modes/monarch/monarchTypes';
import {IJSONSchema} from 'vs/base/common/jsonSchema';
import {Extensions, IJSONContributionRegistry} from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import {Registry} from 'vs/platform/platform';
import {ILanguageDef} from 'vs/editor/standalone-languages/types';
import 'vs/languages/json/common/json.contribution';
import 'vs/editor/standalone-languages/all';
import 'vs/editor/browser/standalone/standaloneSchemas';
import {Github, Repository, Error as GithubError} from 'github';
import {NavbarPart} from 'forked/navbarPart';
import {INavbarService, NavbarAlignment, INavbarEntry} from 'forked/navbarService';
import {ISettingsService, UserSettings} from 'forked/userSettings';
import {UserNavbarItem} from 'userNavbarItem';
import {IGithubService} from 'githubService';
import {IMainEnvironment} from 'forked/main';

const Identifiers = {
	NAVBAR_PART: 'workbench.parts.navbar'
};

// self registering service
// TODO: Despite its location this doesn't seem to have any Electron dependencies.
import 'vs/platform/opener/electron-browser/opener.contribution';

/**
 * Services that we require for the Shell
 */
export interface ICoreServices {
	contextService: IWorkspaceContextService;
	eventService: IEventService;
	configurationService: IConfigurationService;
	githubService: IGithubService;
}

let MonacoEditorLanguages: ILanguageDef[] = this.MonacoEditorLanguages || [];
let MonacoEditorSchemas: { [url:string]: IJSONSchema } = this.MonacoEditorSchemas || {};

/**
 * The Monaco Workbench Shell contains the Monaco workbench with a rich header containing navigation and the activity bar.
 * With the Shell being the top level element in the page, it is also responsible for driving the layouting.
 */
export class WorkbenchShell {
	private storageService: IStorageService;
	private messageService: MessageService;
	private eventService: IEventService;
	private contextViewService: ContextViewService;
	private windowService: IWindowService;
	private threadService: MainThreadService;
	private configurationService: IConfigurationService;
	private themeService: ThemeService;
	private contextService: IWorkspaceContextService;
	private telemetryService: ITelemetryService;
	private keybindingService: WorkbenchKeybindingService;
	private githubService: IGithubService;
	private modeService: IModeService;
	private modelService: IModelService;

	// DWM: These are dependency injected into various modules. Normally they would
	// be provided by Electron-dependent modules.
	private textFileService: TextFileService;
	private editorWorkerService: IEditorWorkerService;

	private container: HTMLElement;
	private toUnbind: IDisposable[];
	private previousErrorValue: string;
	private previousErrorTime: number;
	private content: HTMLElement;
	private contentsContainer: Builder;
	private currentTheme: string;

	private configuration: IConfiguration;
	private workspace: IWorkspace;
	private options: IOptions;
	private workbench: Workbench;
	private navbarPart: NavbarPart;

	private messagesShowingContextKey: IKeybindingContextKey<boolean>;

	constructor(container: HTMLElement, workspace: IWorkspace, services: ICoreServices, configuration: IConfiguration, options: IOptions) {
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

	private createContents(parent: Builder): Builder {

		// ARIA
		aria.setARIAContainer(document.body);

		// Workbench Container
		let workbenchContainer = $(parent).div();

		// Instantiation service with services
		let [instantiationService, serviceCollection] = this.initServiceCollection();

		//crash reporting
		if (!!this.configuration.env.crashReporter) {
// TODO: 			let crashReporter = instantiationService.createInstance(CrashReporter, this.configuration.env.version, this.configuration.env.commitHash);
// TODO: 			crashReporter.start(this.configuration.env.crashReporter);
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
		this.workbench = instantiationService.createInstance(Workbench, workbenchContainer.getHTMLElement(), this.workspace, this.configuration, this.options, serviceCollection);
		this.workbench.startup({
			onWorkbenchStarted: () => {
				this.onWorkbenchStarted();

				// Asynchronously load settings
				let settingsService = instantiationService.createInstance(UserSettings);			
				serviceCollection.set(settingsService, UserSettings);
				settingsService.loadSettings();				
			},

			onServicesCreated: () => {
				// The Navbar requires the IWorkbenchEditorService instantiated by the Workbench
				// so it can't be created before this point. However, the Workbench performs layout
				// for which the Navbar must be present. So we tuck its creation in here after
				// the Workbench has created the services but before it initiates layout.
				this.navbarPart = new NavbarPart(Identifiers.NAVBAR_PART, instantiationService);
// TODO:		this.toDispose.push(this.navbarPart);
// TODO:		this.toShutdown.push(this.navbarPart);
				serviceCollection.set(INavbarService, this.navbarPart);
				this.createNavbarPart();
				this.fillNavbar(instantiationService);
			}
		});

		// Electron integration
// TODO:		this.workbench.getInstantiationService().createInstance(ElectronIntegration).integrate(this.container);

		// Update
// TODO:		this.workbench.getInstantiationService().createInstance(Update);

		// Handle case where workbench is not starting up properly
		let timeoutHandle = setTimeout(() => {
			console.warn('Workbench did not finish loading in 10 seconds, that might be a problem that should be reported.');
		}, 10000);

		this.workbench.joinCreation().then(() => {
			clearTimeout(timeoutHandle);
		});

		return workbenchContainer;
	}

	private createNavbarPart(): void {
		let navbarContainer = $(this.content).div({
			'class': ['part', 'navbar'],
			id: Identifiers.NAVBAR_PART,
			role: 'contentinfo'
		});

		this.navbarPart.create(navbarContainer);
	}
    
	private fillNavbar(instantiationService: InstantiationService): void {
		this.navbarPart.addEntry({ text: '$(beaker) GH Code', tooltip: 'Brought to you by Spiffcode, Inc', command: 'whatever' }, NavbarAlignment.LEFT, 1000);
		let userItem = instantiationService.createInstance(UserNavbarItem);
		this.navbarPart.addItem(userItem, NavbarAlignment.RIGHT, 400);
		this.navbarPart.addEntry({ text: '$(gear)', tooltip: 'User Settings', command: 'workbench.action.openGlobalSettings' }, NavbarAlignment.RIGHT, 300);
		this.navbarPart.addEntry({ text: '$(keyboard)', tooltip: 'Keyboard Shortcuts', command: 'workbench.action.openGlobalKeybindings' }, NavbarAlignment.RIGHT, 200);		
		this.navbarPart.addEntry({ text: '$(question)', tooltip: 'info menu...', command: 'whatever' }, NavbarAlignment.RIGHT, 100);
	}

	private onWorkbenchStarted(): void {

		// Log to telemetry service
		let windowSize = {
			innerHeight: window.innerHeight,
			innerWidth: window.innerWidth,
			outerHeight: window.outerHeight,
			outerWidth: window.outerWidth
		};

		this.telemetryService.publicLog('workspaceLoad',
			{
				userAgent: navigator.userAgent,
				windowSize: windowSize,
				emptyWorkbench: !this.contextService.getWorkspace(),
				customKeybindingsCount: this.keybindingService.customKeybindingsCount(),
				theme: this.currentTheme,
				language: platform.language
			});

		let workspaceStats: WorkspaceStats = <WorkspaceStats>this.workbench.getInstantiationService().createInstance(WorkspaceStats);
		workspaceStats.reportWorkspaceTags();

		/* GHC: Not need when running in-browser.
		if ((platform.isLinux || platform.isMacintosh) && process.getuid() === 0) {
			this.messageService.show(Severity.Warning, nls.localize('runningAsRoot', "It is recommended not to run Code as 'root'."));
		}
		*/

		// Register all built-in standalone languages.
		MonacoEditorLanguages.forEach((language) => {
			this.registerMonarchStandaloneLanguage(language, language.defModule);
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
	}

	// These are adapted versions of functions in vs/editor/browser/standalone/standaloneCodeEditor
	// without the creation of conflicting supporting services.
	private registerMonarchStandaloneLanguage(language:ILanguageExtensionPoint, defModule:string): void {
		ModesRegistry.registerLanguage(language);

		ExtensionsRegistry.registerOneTimeActivationEventListener('onLanguage:' + language.id, () => {
			require([defModule], (value:{language:ILanguage}) => {
				if (!value.language) {
					console.error('Expected ' + defModule + ' to export an `language`');
					return;
				}

				let modeService = this.modeService;
				let modelService = this.modelService;
				modeService.registerMonarchDefinition(modelService, this.editorWorkerService, language.id, value.language);
			}, (err) => {
				console.error('Cannot find module ' + defModule, err);
			});
		});
	}

	private registerStandaloneLanguage(language:ILanguageExtensionPoint, defModule:string): void {
		ModesRegistry.registerLanguage(language);

		ExtensionsRegistry.registerOneTimeActivationEventListener('onLanguage:' + language.id, () => {
			require([defModule], (value:{activate:()=>void}) => {
				if (!value.activate) {
					console.error('Expected ' + defModule + ' to export an `activate` function');
					return;
				}

				this.workbench.getInstantiationService().invokeFunction(value.activate);
			}, (err) => {
				console.error('Cannot find module ' + defModule, err);
			});
		});
	}

	private registerStandaloneSchema(uri:string, schema:IJSONSchema) {
		let schemaRegistry = <IJSONContributionRegistry>Registry.as(Extensions.JSONContribution);
		schemaRegistry.registerSchema(uri, schema);
		var i = uri.lastIndexOf('/');
		var pattern = uri.slice(i + 1) + '.json';
		// TODO: schemaRegistry.addSchemaFileAssociation(pattern, uri);
	}

	private initServiceCollection(): [InstantiationService, ServiceCollection] {
		let serviceCollection = new ServiceCollection();
		let instantiationService = new InstantiationService(serviceCollection, true);

		this.windowService = new WindowService();

		let disableWorkspaceStorage = this.configuration.env.extensionTestsPath || (!this.workspace && !this.configuration.env.extensionDevelopmentPath); // without workspace or in any extension test, we use inMemory storage unless we develop an extension where we want to preserve state
		this.storageService = new Storage(this.contextService, window.localStorage, disableWorkspaceStorage ? inMemoryLocalStorageInstance : window.localStorage);

		if (this.configuration.env.isBuilt && !this.configuration.env.extensionDevelopmentPath && !!this.configuration.env.enableTelemetry) {
			/* TODO:
			this.telemetryService = new ElectronTelemetryService(this.configurationService, this.storageService, {
				cleanupPatterns: [
					[new RegExp(escapeRegExpCharacters(this.configuration.env.appRoot), 'gi'), ''],
					[new RegExp(escapeRegExpCharacters(this.configuration.env.userExtensionsHome), 'gi'), '']
				],
				version: this.configuration.env.version,
				commitHash: this.configuration.env.commitHash
			});
			*/
		} else {
			this.telemetryService = NullTelemetryService;
		}

		// TODO: this.messageService = new MessageService(this.contextService, this.windowService, this.telemetryService);
		this.messageService = new MessageService(this.telemetryService);

		let requestService = new RequestService(
			this.contextService,
			this.telemetryService
		);
		// TODO: this.toUnbind.push(lifecycleService.onShutdown(() => requestService.dispose()));

		let fileService = new FileService(
			this.configurationService,
			this.eventService,
			this.contextService,
			this.messageService,
			requestService,
			this.githubService			
		);
				
		fileService.updateOptions({
			settingsNotificationPaths: [
				this.configuration.env.appSettingsPath,
				this.configuration.env.appKeybindingsPath
			],
			gistRegEx: (<IMainEnvironment>this.configuration.env).gistRegEx
		});
		
		this.contextViewService = new ContextViewService(this.container, this.telemetryService, this.messageService);

		let lifecycleService = NullLifecycleService;
		this.toUnbind.push(lifecycleService.onShutdown(() => fileService.dispose()));

		// TODO: this.threadService = new MainThreadService(this.contextService, this.messageService, this.windowService, lifecycleService);
		this.threadService = new MainThreadService(this.contextService, 'vs/editor/common/worker/editorWorkerServer', 1);

// TODO:		let extensionService = new MainProcessExtensionService(this.contextService, this.threadService, this.messageService, this.telemetryService);
		let extensionService = new MainProcessExtensionService();

		this.keybindingService = new WorkbenchKeybindingService(this.configurationService, this.messageService, document.body);
		this.messagesShowingContextKey = this.keybindingService.createKey('globalMessageVisible', false);
		this.toUnbind.push(this.messageService.onMessagesShowing(() => this.messagesShowingContextKey.set(true)));
		this.toUnbind.push(this.messageService.onMessagesCleared(() => this.messagesShowingContextKey.reset()));

		this.contextViewService = new ContextViewService(this.container, this.telemetryService, this.messageService);

		let markerService = new MainProcessMarkerService(this.threadService);


		let modeService = this.modeService = new MainThreadModeServiceImpl(this.threadService, extensionService, this.configurationService);
		let modelService = this.modelService = new ModelServiceImpl(this.threadService, markerService, modeService, this.configurationService, this.messageService);
		let editorWorkerService = this.editorWorkerService = new EditorWorkerServiceImpl(modelService);

		let untitledEditorService = instantiationService.createInstance(UntitledEditorService);
		this.themeService = new ThemeService(extensionService, this.windowService, this.storageService);

		serviceCollection.set(ITelemetryService, this.telemetryService);
		serviceCollection.set(IEventService, this.eventService);
		serviceCollection.set(IRequestService, requestService);
		serviceCollection.set(IWorkspaceContextService, this.contextService);
		serviceCollection.set(IContextViewService, this.contextViewService);
		serviceCollection.set(IContextMenuService, new ContextMenuService(document.body /* TODO: correct element? */, this.telemetryService, this.messageService, this.contextViewService));
		serviceCollection.set(IMessageService, this.messageService);
		serviceCollection.set(IStorageService, this.storageService);
		serviceCollection.set(ILifecycleService, lifecycleService);
		serviceCollection.set(IThreadService, this.threadService);
		serviceCollection.set(IExtensionService, extensionService);
		serviceCollection.set(IModeService, modeService);
		serviceCollection.set(IFileService, fileService);
		serviceCollection.set(IUntitledEditorService, untitledEditorService);
		// TODO: serviceCollection.set(ISearchService, new SearchService(modelService, untitledEditorService, this.contextService, this.configurationService));
		serviceCollection.set(IWindowService, this.windowService);
		serviceCollection.set(IConfigurationService, this.configurationService);
		serviceCollection.set(IKeybindingService, this.keybindingService);
		serviceCollection.set(IMarkerService, markerService);
		serviceCollection.set(IModelService, modelService);
		serviceCollection.set(ICodeEditorService, new CodeEditorServiceImpl());
		serviceCollection.set(IEditorWorkerService, editorWorkerService);
		serviceCollection.set(IThemeService, this.themeService);
		serviceCollection.set(IActionsService, new ActionsService(extensionService, this.keybindingService));

		serviceCollection.set(IGithubService, this.githubService);

		this.textFileService = new TextFileService(this.contextService, instantiationService, fileService, untitledEditorService,
				lifecycleService, this.telemetryService, this.configurationService, this.eventService, modeService,
				null /* TODO: IWorkbenchEditorService */, this.windowService);
		serviceCollection.set(ITextFileService, this.textFileService);

		return [instantiationService, serviceCollection];
	}

	public open(): void {

		// Listen on unexpected errors
		errors.setUnexpectedErrorHandler((error: any) => {
			this.onUnexpectedError(error);
		});

		// Shell Class for CSS Scoping
		$(this.container).addClass('monaco-shell');

		// Controls
		this.content = $('.monaco-shell-content').appendTo(this.container).getHTMLElement();

		// Apply no-workspace state as CSS class
		if (!this.workspace) {
			$(this.content).addClass('no-workspace');
		}

		// Handle Load Performance Timers
		this.writeTimers();

		// Create Contents
		this.contentsContainer = this.createContents($(this.content));

		// Layout
		this.layout();

		// Listeners
		this.registerListeners();

		// Enable theme support
		this.themeService.initialize(this.container).then(null, error => {
			errors.onUnexpectedError(error);
		});
	}

	private registerListeners(): void {

		// Resize
		$(window).on(dom.EventType.RESIZE, () => this.layout(), this.toUnbind);
	}

	private writeTimers(): void {
		let timers = (<any>window).GlobalEnvironment.timers;
		if (timers) {
			let events: timer.IExistingTimerEvent[] = [];

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
	}

	public onUnexpectedError(error: any): void {
		let errorMsg = errors.toErrorMessage(error, true);
		if (!errorMsg) {
			return;
		}

		let now = new Date().getTime();
		if (errorMsg === this.previousErrorValue && now - this.previousErrorTime <= 1000) {
			return; // Return if error message identical to previous and shorter than 1 second
		}

		this.previousErrorTime = now;
		this.previousErrorValue = errorMsg;

		// Log to console
		console.error(errorMsg);

		// Show to user if friendly message provided
		if (error && error.friendlyMessage && this.messageService) {
			this.messageService.show(Severity.Error, error.friendlyMessage);
		}
	}

	public layout(): void {
		let clArea = $(this.container).getClientArea();

		let contentsSize = new Dimension(clArea.width, clArea.height);

		const navbarStyle = this.navbarPart.getContainer().getComputedStyle();
		let navbarHeight = parseInt(navbarStyle.getPropertyValue('height'), 10) || 18;
		this.navbarPart.getContainer().position(0);
		this.contentsContainer.position(navbarHeight);
		this.contentsContainer.size(contentsSize.width, contentsSize.height - navbarHeight);

		this.contextViewService.layout();
		this.workbench.layout();
	}

	public joinCreation(): TPromise<boolean> {
		return this.workbench.joinCreation();
	}

	public dispose(): void {

		// Workbench
		if (this.workbench) {
			this.workbench.dispose();
		}

		this.contextViewService.dispose();
		this.storageService.dispose();

		// Listeners
		this.toUnbind = dispose(this.toUnbind);

		// Container
		$(this.container).empty();
	}
}
