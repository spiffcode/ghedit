/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// This is a port of vs/workbench/electron-browser/shell.ts with Electron and Node dependencies
// removed/replaced.

import 'vs/css!vs/workbench/electron-browser/media/shell';

// TODO: import * as nls from 'vs/nls';
import {TPromise} from 'vs/base/common/winjs.base';
// TODO: import * as platform from 'vs/base/common/platform';
import {Dimension, Builder, $} from 'vs/base/browser/builder';
// TODO: import {escapeRegExpCharacters} from 'vs/base/common/strings';
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
import {IWindowService, WindowService} from 'windowService';
// TODO: import {MessageService} from 'vs/workbench/services/message/electron-browser/messageService';
import {WorkbenchMessageService as MessageService} from 'vs/workbench/services/message/browser/messageService';
// TODO: import {RequestService} from 'vs/workbench/services/request/node/requestService';
import {IConfigurationService} from 'vs/platform/configuration/common/configuration';
import {FileService} from 'fileService';
// TODO: import {SearchService} from 'vs/workbench/services/search/node/searchService';
// TODO: import {LifecycleService} from 'vs/workbench/services/lifecycle/electron-browser/lifecycleService';
import {BaseLifecycleService as LifecycleService} from 'vs/platform/lifecycle/common/baseLifecycleService';
// TODO: import {WorkbenchKeybindingService} from 'vs/workbench/services/keybinding/electron-browser/keybindingService';
import {StandaloneKeybindingService as WorkbenchKeybindingService, SimpleExtensionService as MainProcessExtensionService} from 'vs/editor/browser/standalone/simpleServices';
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
// TODO: import {MainProcessVSCodeAPIHelper} from 'vs/workbench/api/node/extHost.api.impl';
// TODO: import {MainProcessExtensionService} from 'vs/platform/extensions/common/nativeExtensionService';
// TODO: import {MainThreadDocuments} from 'vs/workbench/api/node/extHostDocuments';
// TODO: import {MainProcessTextMateSyntax} from 'vs/editor/node/textMate/TMSyntax';
// TODO: import {MainProcessTextMateSnippet} from 'vs/editor/node/textMate/TMSnippets';
// TODO: import {JSONValidationExtensionPoint} from 'vs/platform/jsonschemas/common/jsonValidationExtensionPoint';
// TODO: import {LanguageConfigurationFileHandler} from 'vs/editor/node/languageConfiguration';
// TODO: import {MainThreadFileSystemEventService} from 'vs/workbench/api/node/extHostFileSystemEventService';
// TODO: import {MainThreadQuickOpen} from 'vs/workbench/api/node/extHostQuickOpen';
// TODO: import {MainThreadStatusBar} from 'vs/workbench/api/node/extHostStatusBar';
// TODO: import {MainThreadCommands} from 'vs/workbench/api/node/extHostCommands';
import {RemoteTelemetryServiceHelper} from 'vs/platform/telemetry/common/remoteTelemetryService';
// TODO: import {MainThreadDiagnostics} from 'vs/workbench/api/node/extHostDiagnostics';
// TODO: import {MainThreadOutputService} from 'vs/workbench/api/node/extHostOutputService';
// TODO: import {MainThreadMessageService} from 'vs/workbench/api/node/extHostMessageService';
// TODO: import {MainThreadLanguages} from 'vs/workbench/api/node/extHostLanguages';
// TODO: import {MainThreadEditors} from 'vs/workbench/api/node/extHostEditors';
// TODO: import {MainThreadWorkspace} from 'vs/workbench/api/node/extHostWorkspace';
// TODO: import {MainThreadConfiguration} from 'vs/workbench/api/node/extHostConfiguration';
// TODO: import {MainThreadLanguageFeatures} from 'vs/workbench/api/node/extHostLanguageFeatures';
import {IOptions} from 'vs/workbench/common/options';
import {IStorageService} from 'vs/platform/storage/common/storage';
// TODO: import {MainThreadStorage} from 'vs/platform/storage/common/remotable.storage';
import {IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import {createInstantiationService as createInstantiationService } from 'vs/platform/instantiation/common/instantiationService';
import {IContextViewService, IContextMenuService} from 'vs/platform/contextview/browser/contextView';
import {IEventService} from 'vs/platform/event/common/event';
import {IFileService} from 'vs/platform/files/common/files';
import {IKeybindingService} from 'vs/platform/keybinding/common/keybindingService';
import {ILifecycleService} from 'vs/platform/lifecycle/common/lifecycle';
import {IMarkerService} from 'vs/platform/markers/common/markers';
import {IMessageService, Severity} from 'vs/platform/message/common/message';
// TODO: import {IRequestService} from 'vs/platform/request/common/request';
// TODO: import {ISearchService} from 'vs/platform/search/common/search';
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
import {ThemeService} from 'themeService';
// TODO: import {getService } from 'vs/base/common/service';
// TODO: import {connect} from 'vs/base/node/service.net';
// TODO: import {IExtensionsService} from 'vs/workbench/parts/extensions/common/extensions';
// TODO: import {ExtensionsService} from 'vs/workbench/parts/extensions/node/extensionsService';
// TODO: import {ReloadWindowAction} from 'vs/workbench/electron-browser/actions';

import {ITextFileService} from 'vs/workbench/parts/files/common/files';
import {TextFileService} from 'bogusTextFileServices';
/* TODO:
import {ILanguageExtensionPoint} from 'vs/editor/common/services/modeService';
import {ModesRegistry} from 'vs/editor/common/modes/modesRegistry';
import {ExtensionsRegistry} from 'vs/platform/extensions/common/extensionsRegistry';
import {ILanguage} from 'vs/editor/common/modes/monarch/monarchTypes';
import {IJSONSchema} from 'vs/base/common/jsonSchema';
import {Extensions, IJSONContributionRegistry} from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import {Registry} from 'vs/platform/platform';
import {ILanguageDef} from 'vs/editor/standalone-languages/types';
//import 'vs/editor/standalone-languages/all';
//import 'vs/editor/browser/standalone/standaloneSchemas';
*/
import {Github, Repository, Error as GithubError} from 'github';

/**
 * Services that we require for the Shell
 */
export interface ICoreServices {
	contextService: IWorkspaceContextService;
	eventService: IEventService;
	configurationService: IConfigurationService;
	githubService: Github;
}

/* TODO:
let MonacoEditorLanguages: ILanguageDef[] = this.MonacoEditorLanguages || [];
let MonacoEditorSchemas: { [url:string]: IJSONSchema } = this.MonacoEditorSchemas || {};
*/

/**
 * The Monaco Workbench Shell contains the Monaco workbench with a rich header containing navigation and the activity bar.
 * With the Shell being the top level element in the page, it is also responsible for driving the layouting.
 */
export class WorkbenchShell {
	private storageService: IStorageService;
	private messageService: IMessageService;
	private eventService: IEventService;
	private contextViewService: ContextViewService;
	private windowService: IWindowService;
	private threadService: MainThreadService;
	private configurationService: IConfigurationService;
	private themeService: ThemeService;
	private contextService: IWorkspaceContextService;
	private telemetryService: ITelemetryService;
	private keybindingService: WorkbenchKeybindingService;
	private githubService: Github;

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
		let instantiationService = this.initInstantiationService();

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

// TODO:		instantiationService.addSingleton(IExtensionsService, getService<IExtensionsService>(sharedProcessClientPromise, 'ExtensionService', ExtensionsService));

		// Workbench
		this.workbench = new Workbench(workbenchContainer.getHTMLElement(), this.workspace, this.configuration, this.options, instantiationService);
		this.workbench.startup({
			onServicesCreated: () => {
				this.initExtensionSystem();
			},
			onWorkbenchStarted: () => {
				this.onWorkbenchStarted();
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
				theme: this.currentTheme
			});

		let workspaceStats: WorkspaceStats = <WorkspaceStats>this.workbench.getInstantiationService().createInstance(WorkspaceStats);
		workspaceStats.reportWorkspaceTags();
/*
		// Register all built-in standalone languages
		MonacoEditorLanguages.forEach((language) => {
			this.registerStandaloneLanguage(language, language.defModule);
		});

		// Register all built-in standalone JSON schemas
		for (var uri in MonacoEditorSchemas) {
			this.registerStandaloneSchema(uri, MonacoEditorSchemas[uri]);
		}
		*/
	}

/* TODO:
	private registerStandaloneLanguage(language:ILanguageExtensionPoint, defModule:string): void {
		ModesRegistry.registerLanguage(language);

		ExtensionsRegistry.registerOneTimeActivationEventListener('onLanguage:' + language.id, () => {
			require([defModule], (value:{language:ILanguage}) => {
				if (!value.language) {
					console.error('Expected ' + defModule + ' to export a `language`');
					return;
				}

				this.modeService.registerMonarchDefinition(this.modelService, this.editorWorkerService, language.id, value.language);
			}, (err) => {
				console.error('Cannot find module ' + defModule, err);
			});
		});
	}
	private registerStandaloneSchema(uri:string, schema:IJSONSchema) {
		let schemaRegistry = <IJSONContributionRegistry>Registry.as(Extensions.JSONContribution);
		schemaRegistry.registerSchema(uri, schema);
	}
*/

	private initInstantiationService(): IInstantiationService {
		this.windowService = new WindowService();

		let disableWorkspaceStorage = this.configuration.env.extensionTestsPath || (!this.workspace && !this.configuration.env.extensionDevelopmentPath); // without workspace or in any extension test, we use inMemory storage unless we develop an extension where we want to preserve state
		this.storageService = new Storage(this.contextService, window.localStorage, disableWorkspaceStorage ? inMemoryLocalStorageInstance : window.localStorage);

		if (this.configuration.env.isBuilt
			&& !this.configuration.env.extensionDevelopmentPath // no telemetry in a window for extension development!
			&& !!this.configuration.env.enableTelemetry) {

			/* TODO:
			this.telemetryService = new ElectronTelemetryService(this.configurationService, this.storageService, {
				cleanupPatterns: [new RegExp(escapeRegExpCharacters(this.configuration.env.appRoot), 'gi'), new RegExp(escapeRegExpCharacters(this.configuration.env.userExtensionsHome), 'gi')],
				version: this.configuration.env.version,
				commitHash: this.configuration.env.commitHash
			});
			*/
		} else {
			this.telemetryService = NullTelemetryService;
		}

// TODO: 		this.keybindingService = new WorkbenchKeybindingService(this.configurationService, this.contextService, this.eventService, this.telemetryService, <any>window);
		this.keybindingService = new WorkbenchKeybindingService(this.configurationService, document.body);

// TODO: 		this.messageService = new MessageService(this.contextService, this.windowService, this.telemetryService, this.keybindingService);
		this.messageService = new MessageService(this.telemetryService, this.keybindingService);
		this.keybindingService.setMessageService(this.messageService);

		let fileService = new FileService(
			this.configurationService,
			this.eventService,
			this.contextService,
			this.githubService
		);
		this.contextViewService = new ContextViewService(this.container, this.telemetryService, this.messageService);

// TODO: 		let lifecycleService = new LifecycleService(this.messageService, this.windowService);
		let lifecycleService = new LifecycleService();
// TODO: 		lifecycleService.onShutdown(() => fileService.dispose());

// TODO: 		this.threadService = new MainThreadService(this.contextService, this.messageService, this.windowService);
		this.threadService = new MainThreadService(this.contextService, 'vs/editor/common/worker/editorWorkerServer', 1);
// TODO: 		lifecycleService.onShutdown(() => this.threadService.dispose());

/* TODO:
		let requestService = new RequestService(
			this.contextService,
			this.configurationService,
			this.telemetryService
		);
*/
// TODO: 		lifecycleService.onShutdown(() => requestService.dispose());

		let markerService = new MainProcessMarkerService(this.threadService);

// TODO: 		let extensionService = new MainProcessExtensionService(this.contextService, this.threadService, this.messageService, this.telemetryService);
		let extensionService = new MainProcessExtensionService();
// TODO: 		this.keybindingService.setExtensionService(extensionService);

		let modeService = new MainThreadModeServiceImpl(this.threadService, extensionService, this.configurationService);
		let modelService = new ModelServiceImpl(this.threadService, markerService, modeService, this.configurationService, this.messageService);
		let editorWorkerService = this.editorWorkerService = new EditorWorkerServiceImpl(modelService);

		let untitledEditorService = new UntitledEditorService();
		this.themeService = new ThemeService(extensionService, this.windowService, this.storageService);

		let result = createInstantiationService();
		result.addSingleton(ITelemetryService, this.telemetryService);
		result.addSingleton(IEventService, this.eventService);
// TODO:		result.addSingleton(IRequestService, requestService);
		result.addSingleton(IWorkspaceContextService, this.contextService);
		result.addSingleton(IContextViewService, this.contextViewService);
		result.addSingleton(IContextMenuService, new ContextMenuService(document.body /* TODO: correct element? */, this.telemetryService, this.messageService, this.contextViewService));
		result.addSingleton(IMessageService, this.messageService);
		result.addSingleton(IStorageService, this.storageService);
		result.addSingleton(ILifecycleService, lifecycleService);
		result.addSingleton(IThreadService, this.threadService);
		result.addSingleton(IExtensionService, extensionService);
		result.addSingleton(IModeService, modeService);
		result.addSingleton(IFileService, fileService);
		result.addSingleton(IUntitledEditorService, untitledEditorService);
// TODO: 		result.addSingleton(ISearchService, new SearchService(modelService, untitledEditorService, this.contextService, configService));
		result.addSingleton(IWindowService, this.windowService);
		result.addSingleton(IConfigurationService, this.configurationService);
		result.addSingleton(IKeybindingService, this.keybindingService);
		result.addSingleton(IMarkerService, markerService);
		result.addSingleton(IModelService, modelService);
		result.addSingleton(ICodeEditorService, new CodeEditorServiceImpl());
		result.addSingleton(IEditorWorkerService, editorWorkerService);
		result.addSingleton(IThemeService, this.themeService);
		result.addSingleton(IActionsService, new ActionsService(extensionService, this.keybindingService));

		// TODO: this should be moved to workbench.ts
		this.textFileService = new TextFileService(this.contextService, result, fileService, untitledEditorService,
				lifecycleService, this.telemetryService, this.configurationService, this.eventService, modeService, null /* TODO: IWorkbenchEditorService */, this.windowService);
		result.addSingleton(ITextFileService, this.textFileService);

		return result;
	}

	// TODO@Alex, TODO@Joh move this out of here?
	private initExtensionSystem(): void {
// TODO: 		this.threadService.getRemotable(MainProcessVSCodeAPIHelper);
// TODO: 		this.threadService.getRemotable(MainThreadDocuments);
		this.threadService.getRemotable(RemoteTelemetryServiceHelper);
// TODO:		this.workbench.getInstantiationService().createInstance(MainProcessTextMateSyntax);
// TODO:		this.workbench.getInstantiationService().createInstance(MainProcessTextMateSnippet);
// TODO:		this.workbench.getInstantiationService().createInstance(JSONValidationExtensionPoint);
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
		let timers = (<any>window).MonacoEnvironment.timers;
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
		this.contentsContainer.size(contentsSize.width, contentsSize.height);

		this.contextViewService.layout();
		this.workbench.layout();
	}

	public joinCreation(): TPromise<boolean> {
		return this.workbench.joinCreation();
	}

	public dispose(force?: boolean): void {

		// Workbench
		if (this.workbench) {
			let veto = this.workbench.shutdown(force);

			// If Workbench vetos dispose, return early
			if (veto) {
				return;
			}
		}

		this.contextViewService.dispose();
		this.storageService.dispose();

		// Listeners
		this.toUnbind = dispose(this.toUnbind);

		// Container
		$(this.container).empty();
	}
}