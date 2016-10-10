/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/shell';
import 'vs/css!vs/workbench/browser/parts/editor/media/editorpart';

import {IWorkbenchEditorService} from 'vs/workbench/services/editor/common/editorService';
import fileActions = require('vs/workbench/parts/files/browser/fileActions');
import goToDeclaration = require('vs/editor/contrib/goToDeclaration/browser/goToDeclaration');
import referenceSearch = require('vs/editor/contrib/referenceSearch/browser/referenceSearch');
import * as nls from 'vs/nls';
import {TPromise} from 'vs/base/common/winjs.base';
import * as platform from 'vs/base/common/platform';
import {Dimension, Builder, $} from 'vs/base/browser/builder';
import dom = require('vs/base/browser/dom');
import aria = require('vs/base/browser/ui/aria/aria');
import {dispose, IDisposable, Disposables} from 'vs/base/common/lifecycle';
import errors = require('vs/base/common/errors');
// DESKTOP: import product from 'vs/platform/product';
// DESKTOP: import pkg from 'vs/platform/package';
import {ContextViewService} from 'vs/platform/contextview/browser/contextViewService';
import timer = require('vs/base/common/timer');
import {Workbench} from 'vs/workbench/electron-browser/workbench';
import {Storage, inMemoryLocalStorageInstance} from 'vs/workbench/common/storage';
import {ITelemetryService, NullTelemetryService} from 'vs/platform/telemetry/common/telemetry';
// DESKTOP: import {ITelemetryAppenderChannel, TelemetryAppenderClient} from 'vs/platform/telemetry/common/telemetryIpc';
// DESKTOP: import {IdleMonitor, UserStatus} from  'vs/platform/telemetry/browser/idleMonitor';
// DESKTOP: import ErrorTelemetry from 'vs/platform/telemetry/browser/errorTelemetry';
// DESKTOP: import {resolveWorkbenchCommonProperties} from 'vs/platform/telemetry/node/workbenchCommonProperties';
// TODO: import {ElectronIntegration} from 'vs/workbench/electron-browser/integration';
// TODO: import {Update} from 'vs/workbench/electron-browser/update';
import {WorkspaceStats} from 'vs/workbench/services/telemetry/common/workspaceStats';
import {IWindowService, WindowService} from 'vs/workbench/services/window/electron-browser/windowService';
// TODO: import {MessageService} from 'vs/workbench/services/message/electron-browser/messageService';
import {WorkbenchMessageService as MessageService} from 'vs/workbench/services/message/browser/messageService';
// DESKTOP: import {IRequestService} from 'vs/platform/request/common/request';
// DESKTOP: import {RequestService} from 'vs/workbench/services/request/node/requestService';
import {IConfigurationService} from 'vs/platform/configuration/common/configuration';
import {FileService} from 'vs/workbench/services/files/electron-browser/fileService';
import {SearchService} from 'vs/workbench/services/search/node/searchService';
// TODO: import {LifecycleService} from 'vs/workbench/services/lifecycle/electron-browser/lifecycleService';
import {SimpleExtensionService as MainProcessExtensionService} from 'vs/editor/browser/standalone/simpleServices';
// TODO: import {MainThreadService} from 'vs/workbench/services/thread/electron-browser/threadService';
import {MarkerService} from 'vs/platform/markers/common/markerService';
import {IModelService} from 'vs/editor/common/services/modelService';
import {ModelServiceImpl} from 'vs/editor/common/services/modelServiceImpl';
import {ICompatWorkerService} from 'vs/editor/common/services/compatWorkerService';
import {MainThreadCompatWorkerService} from 'vs/editor/common/services/compatWorkerServiceMain';
import {CodeEditorServiceImpl} from 'vs/editor/browser/services/codeEditorServiceImpl';
import {ICodeEditorService} from 'vs/editor/common/services/codeEditorService';
import {EditorWorkerServiceImpl} from 'vs/editor/common/services/editorWorkerServiceImpl';
import {IEditorWorkerService} from 'vs/editor/common/services/editorWorkerService';
// TODO: import {MainProcessExtensionService} from 'vs/workbench/api/node/mainThreadExtensionService';
import {IOptions} from 'vs/workbench/common/options';
import {IStorageService} from 'vs/platform/storage/common/storage';
import {ServiceCollection} from 'vs/platform/instantiation/common/serviceCollection';
import {InstantiationService} from 'vs/platform/instantiation/common/instantiationService';
import {IContextViewService} from 'vs/platform/contextview/browser/contextView';
import {IEventService} from 'vs/platform/event/common/event';
import {IFileService} from 'vs/platform/files/common/files';
import {ILifecycleService, NullLifecycleService} from 'vs/platform/lifecycle/common/lifecycle';
import {IMarkerService} from 'vs/platform/markers/common/markers';
import {IEnvironmentService} from 'vs/platform/environment/common/environment';
import {IEnvService} from 'vs/code/electron-main/env';
import {IMessageService, Severity} from 'vs/platform/message/common/message';
import {ISearchService} from 'vs/platform/search/common/search';
// DESKTOP: import {IThreadService} from 'vs/workbench/services/thread/common/threadService';
import {ICommandService} from 'vs/platform/commands/common/commands';
import {CommandService} from 'vs/platform/commands/common/commandService';
import {IWorkspaceContextService, IWorkspace} from 'vs/platform/workspace/common/workspace';
import {IExtensionService} from 'vs/platform/extensions/common/extensions';
import {MainThreadModeServiceImpl} from 'vs/editor/common/services/modeServiceImpl';
import {IModeService} from 'vs/editor/common/services/modeService';
import {IUntitledEditorService, UntitledEditorService} from 'vs/workbench/services/untitled/common/untitledEditorService';
// TODO: import {CrashReporter} from 'vs/workbench/electron-browser/crashReporter';
import {IThemeService} from 'vs/workbench/services/themes/common/themeService';
// TODO: import {ThemeService} from 'vs/workbench/services/themes/electron-browser/themeService';
import {ThemeService} from 'vs/workbench/services/themes/electron-browser/themeService';
// DESKTOP: import {getDelayedChannel} from 'vs/base/parts/ipc/common/ipc';
// DESKTOP: import {connect as connectNet} from 'vs/base/parts/ipc/node/ipc.net';
// DESKTOP: import {Client as ElectronIPCClient} from 'vs/base/parts/ipc/common/ipc.electron';
// DESKTOP: import {ipcRenderer} from 'electron';
// DEKSTOP: import {IExtensionManagementChannel, ExtensionManagementChannelClient} from 'vs/platform/extensionManagement/common/extensionManagementIpc';
// DESKTOP: import {IExtensionManagementService} from 'vs/platform/extensionManagement/common/extensionManagement';
// DESKTOP: import {URLChannelClient} from 'vs/platform/url/common/urlIpc';
// DESKTOP: import {IURLService} from 'vs/platform/url/common/url';
// DESKTOP: import {ReloadWindowAction} from 'vs/workbench/electron-browser/actions';
import {Registry} from 'vs/platform/platform';

import {ensureStaticPlatformServices} from 'vs/editor/browser/standalone/standaloneServices';
import {IJSONSchema} from 'vs/base/common/jsonSchema';
import {NavbarPart} from 'ghedit/navbarPart';
import {INavbarService, NavbarAlignment} from 'ghedit/navbarService';
import {UserNavbarItem} from 'ghedit/userNavbarItem';
import {MenusNavbarItem} from 'ghedit/menusNavbarItem';
import {IGithubService} from 'ghedit/githubService';
import {WelcomePart} from 'ghedit/welcomePart';
import {ChooseRepositoryAction, ChooseReferenceAction, AboutGHEditAction} from 'ghedit/githubActions';
import {IWorkbenchActionRegistry, Extensions as ActionExtensions} from 'vs/workbench/common/actionRegistry';
import {Action, IAction} from 'vs/base/common/actions';
import {VSCodeMenu} from 'vs/code/electron-main/menus';
import {IWindowConfiguration} from 'vs/workbench/electron-browser/main';

const Identifiers = {
	NAVBAR_PART: 'workbench.parts.navbar',
	WELCOME_PART: 'workbench.parts.welcome'
};

// self registering services
import 'vs/platform/opener/browser/opener.contribution';

/**
 * Services that we require for the Shell
 */
export interface ICoreServices {
	contextService: IWorkspaceContextService;
	eventService: IEventService;
	configurationService: IConfigurationService;
	environmentService: IEnvironmentService;
	githubService: IGithubService;
}
// Patch _updateEnablement to consider read only state.
// Do this directly to prevent forking fileActions.ts which many other files import.
var fileActionsReadOnly = false;
var updateEnablementPrev = fileActions.BaseFileAction.prototype._updateEnablement;
fileActions.BaseFileAction.prototype._updateEnablement = function () {
	if (fileActionsReadOnly) {
		this.enabled = false;
	} else {
		updateEnablementPrev.apply(this, arguments);
	}
};

function getKeyValue(key: string) {
	let value = window.localStorage.getItem(key);
	if (!value) {
		var name = key + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				value = c.substring(name.length, c.length);
				break;
			}
		}
	}
	return value;
}

function setKeyValue(key: string, value: string) {
	try {
		// Raises an exception on Safari in private browsing mode
		window.localStorage.setItem(key, '' + value);
	} catch (error) {
		var d = new Date();
		d.setTime(d.getTime() + (365*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = key + "=" + value + "; " + expires;
	}
}

var g_messageService: IMessageService = null;
function showTip(key: string, message: string) {
	if (!getKeyValue(key)) {
		setKeyValue(key, '1');
		g_messageService.show(Severity.Info, message);
	}
}

var definitionActionRunPrev = goToDeclaration.DefinitionAction.prototype.run;
goToDeclaration.DefinitionAction.prototype.run = function () {
	showTip('definitionActionTip', 'Note: Go To and Peek Definition only work within opened files in GHEdit.');
	return definitionActionRunPrev.apply(this, arguments);
};

var referenceSearchRunPrev = referenceSearch.ReferenceAction.prototype.run;
referenceSearch.ReferenceAction.prototype.run = function () {
	showTip('referenceSearchTip', 'Note: Find All References only works within opened files in GHEdit.');
	return referenceSearchRunPrev.apply(this, arguments);
};

const CloseAction = new Action('welcome.close', nls.localize('close', "Close"), '', true, () => null);
const ShowDocumentationAction = new Action(
	'welcome.showDocumentation',
	nls.localize('documentation', 'Documentation'),
	null,
	true,
	() => {
		window.open('https://spiffcode.github.io/ghedit/documentation.html?welcome=1', 'openDocumentationUrl');
		return TPromise.as(true);
	}
);

function showWelcomeTip() {
	if (!getKeyValue('welcomeTip')) {
		setKeyValue('welcomeTip', '1');
		g_messageService.show(Severity.Info, {
			message: nls.localize('readDocumentation', 'Welcome to GHEdit! Would you like to read the documentation?'),
			actions:
			[
				CloseAction,
				ShowDocumentationAction
			]
		});
	}
}

/**
 * Put code for browser specific hacks here.
 */
export enum BrowserHack {
	EDITOR_MOUSE_CLICKS,
	MESSAGE_BOX_TEXT,
	TAB_DRAGGING,
	TAB_LABEL
}

export function enableBrowserHack(hack: BrowserHack) {
	// Check for browser type
	let isIE = navigator.userAgent.indexOf('Trident/') >= 0;
	let isEdge = navigator.userAgent.indexOf('Edge/') >= 0;

	switch (hack) {
	case BrowserHack.EDITOR_MOUSE_CLICKS:
		if (isIE || isEdge) {
			// IE/Edge have a buggy caretRangeFromPoint implementation (e.g. https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4471321/)
			// This causes in-editor mouse events to be improperly targeted. The crazy workaround is to
			// size the document body larger than any of the elements it contains (https://github.com/Microsoft/monaco-editor/issues/80).
			// Does this have any terrible side-effects? Good question!
			document.body.style.width = '12345px';
			document.body.style.height = '12345px';
		}
		break;

	case BrowserHack.MESSAGE_BOX_TEXT:
		if (isIE || isEdge) {
			// Add new css rules / override existing ones. First create a style sheet.
			// https://davidwalsh.name/add-rules-stylesheets
			let style = document.createElement("style");
			style.appendChild(document.createTextNode(""));
			document.head.appendChild(style);

			// Text in message boxes doesn't show due to how line-height affects display: block layout.
			// According to CSS 2.1, Edge is correct and Chrome et al are wrong. Spec says "The baseline of an
			// 'inline-block' is the baseline of its last line box in the normal flow, unless it has either no
			// in-flow line boxes or if its 'overflow' property has a computed value other than 'visible', in
			// which case the baseline is the bottom margin edge."
			(<any>style.sheet).insertRule(".message-left-side.message-overflow-ellipsis { overflow: visible !important; }", 0);
		}
		break;

	case BrowserHack.TAB_DRAGGING:
		if (isIE || isEdge) {
			// Custom scrollbars get created when dragging tabs so that the tab container can scroll.
			// On IE / Edge the actual scrollbars show instead. For now just forcefully deny overflow: scroll
			// so the scrollbar doesn't appear.
			let divs = document.getElementsByClassName('tabs-container');
			if (divs.length > 0) {
				divs[0].removeAttribute('style');
				divs[0].setAttribute('style', 'overflow: hidden !important');
			}
		}
		break;

	case BrowserHack.TAB_LABEL:
		if (isIE || isEdge) {
			// Add new css rules / override existing ones. First create a style sheet.
			// https://davidwalsh.name/add-rules-stylesheets
			let style = document.createElement("style");
			style.appendChild(document.createTextNode(""));
			document.head.appendChild(style);

			// min-width: fit-content doesn't work on IE or Edge
			(<any>style.sheet).insertRule(".monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab { width: auto !important; }", 0);

			if (isIE) {
				// min-width: fit-content doesn't work on IE or Edge
				(<any>style.sheet).insertRule(".monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab { display: inline-block !important; }", 0);

				// margin-top: auto doesn't work for vertical center alignment on IE.
				// display: inline-block needed for horizontal layout
				(<any>style.sheet).insertRule(".tab-label { margin-top: 6% !important; display: inline-block !important; }", 0);
				(<any>style.sheet).insertRule(".tab-close { margin-top: 8% !important; display: inline-block !important; }", 0);
			}
		}
	}
}

/**
 * The workbench shell contains the workbench with a rich header containing navigation and the activity bar.
 * With the Shell being the top level element in the page, it is also responsible for driving the layouting.
 */
export class WorkbenchShell {
	private storageService: IStorageService;
	private messageService: MessageService;
	private eventService: IEventService;
	private environmentService:IEnvironmentService;
	private contextViewService: ContextViewService;
	private windowService: IWindowService;
	// TODO: private threadService: MainThreadService;
	private configurationService: IConfigurationService;
	private themeService: ThemeService;
	private contextService: IWorkspaceContextService;
	private telemetryService: ITelemetryService;
	private githubService: IGithubService;

	private container: HTMLElement;
	private toUnbind: IDisposable[];
	private previousErrorValue: string;
	private previousErrorTime: number;
	private content: HTMLElement;
	private contentsContainer: Builder;

	private workspace: IWorkspace;
	private options: IOptions;
	private workbench: Workbench;
	private navbarPart: NavbarPart;
	private welcomePart: WelcomePart;

	constructor(container: HTMLElement, workspace: IWorkspace, services: ICoreServices, options: IOptions) {
		if (!container) {
			throw 'WorkbenchShell container == null?!';
		}
		this.container = container;

		this.workspace = workspace;
		this.options = options;

		this.contextService = services.contextService;
		this.eventService = services.eventService;
		this.configurationService = services.configurationService;
		this.environmentService = services.environmentService;
		this.githubService = services.githubService;

		this.toUnbind = [];
		this.previousErrorTime = 0;

		// Set read only state for file actions
		fileActionsReadOnly = this.githubService.isTag;
	}

	private createContents(parent: Builder): Builder {

		// ARIA
		aria.setARIAContainer(document.body);

		// Workbench Container
		const workbenchContainer = $(parent).div();

		// Instantiation service with services
		const [instantiationService, serviceCollection] = this.initServiceCollection();

		// Initialize the services expected by the standalone editor (Monaco). These are used
		// by the monaco-json/css/typescript/languages contributions.
		ensureStaticPlatformServices({
			modeService: <IModeService>serviceCollection.get(IModeService),
			modelService: <IModelService>serviceCollection.get(IModelService),
			markerService: <IMarkerService>serviceCollection.get(IMarkerService),
			messageService: <IMessageService>serviceCollection.get(IMessageService),
			commandService: <ICommandService>serviceCollection.get(ICommandService),
			compatWorkerService: <ICompatWorkerService>serviceCollection.get(ICompatWorkerService),
			storageService: <IStorageService>serviceCollection.get(IStorageService),
			telemetryService: <ITelemetryService>serviceCollection.get(ITelemetryService),
			contextService: <IWorkspaceContextService>serviceCollection.get(IWorkspaceContextService),
			eventService: <IEventService>serviceCollection.get(IEventService),
			extensionService: <IExtensionService>serviceCollection.get(IExtensionService),
			configurationService: <IConfigurationService>serviceCollection.get(IConfigurationService),
			codeEditorService: <ICodeEditorService>serviceCollection.get(ICodeEditorService),
			editorWorkerService: <IEditorWorkerService>serviceCollection.get(IEditorWorkerService),
			instantiationService: instantiationService
			/* TODO:
			menuService?:IMenuService;
			editorService?:IEditorService;
			keybindingService?:IKeybindingService;
			contextViewService?:IEditorContextViewService;
			contextMenuService?:IContextMenuService;
			progressService?:IProgressService;
			*/
		});

		/* DESKTOP:
		//crash reporting
		if (!!product.crashReporter) {
			const crashReporter = instantiationService.createInstance(CrashReporter, pkg.version, product.commit);
			crashReporter.start(product.crashReporter);
		}
		*/

		// Workbench
		this.workbench = instantiationService.createInstance(Workbench, workbenchContainer.getHTMLElement(), this.workspace, this.options, this.isWelcomeMode(), serviceCollection);
		this.workbench.startup({
			onWorkbenchStarted: (customKeybindingsCount) => {
				this.onWorkbenchStarted(customKeybindingsCount);

				// If authenticated but no repository, run ChooseRepositoryAction.
				if (this.githubService.isAuthenticated() && !this.githubService.repoName) {
					// Lookup commands
					let id = ChooseRepositoryAction.ID;
					let builtInActionDescriptor = (<IWorkbenchActionRegistry>Registry.as(ActionExtensions.WorkbenchActions)).getWorkbenchAction(id);
					if (builtInActionDescriptor) {
						let action: IAction = instantiationService.createInstance(builtInActionDescriptor.syncDescriptor);
						let promise = action.run() || TPromise.as(null);
						promise.done(null, null);
					}
				}

				// This browser hack must be enabled once the workbench is loaded
				enableBrowserHack(BrowserHack.TAB_DRAGGING);

				// Show a first timer welcome tip
				if (!this.isWelcomeMode()) {
					showWelcomeTip();
				}
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

				// Tell githubSearch about the editor service. Search needs to use IModels
				// to perform accurate searches. Github's search is not robust enough (doesn't
				// return line numbers, or all the matches) and is only used to get a list
				// of matching uris.
				let editorService = <IWorkbenchEditorService>serviceCollection.get(IWorkbenchEditorService);
				let searchService = <ISearchService>serviceCollection.get(ISearchService);
				(<any>searchService).githubSearch.setEditorService(editorService);
			}
		});

		// Electron integration
// TODO:		this.workbench.getInstantiationService().createInstance(ElectronIntegration).integrate(this.container);

		// Update
// TODO:		this.workbench.getInstantiationService().createInstance(Update);

		// Handle case where workbench is not starting up properly
		const timeoutHandle = setTimeout(() => {
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
		// Don't show these elements when in welcome mode.
		if (!this.isWelcomeMode()) {
			// Install Menu
			const menu = instantiationService.createInstance(VSCodeMenu);
			menu.ready();
			let menusItem = instantiationService.createInstance(MenusNavbarItem);
			this.navbarPart.addItem(menusItem, NavbarAlignment.LEFT, 900);
		}

		this.navbarPart.addEntry({
			text: '$(beaker)' + (this.isWelcomeMode() ? ' GHEdit' : '') + ((<IWindowConfiguration><any>this.environmentService).readOnly ? ' (read only)' : ''),
			tooltip: AboutGHEditAction.LABEL,
			command: AboutGHEditAction.ID,
		}, NavbarAlignment.LEFT, 1000);

		if (this.githubService.isAuthenticated()) {
			this.navbarPart.addEntry({
				text: this.githubService.repoName ? this.githubService.repoName : ChooseRepositoryAction.LABEL,
				tooltip: ChooseRepositoryAction.LABEL,
				command: ChooseRepositoryAction.ID
			}, NavbarAlignment.RIGHT, 600);

			if (this.githubService.repoName) {
				this.navbarPart.addEntry({
					text: this.githubService.ref,
					tooltip: ChooseReferenceAction.LABEL,
					command: ChooseReferenceAction.ID
				}, NavbarAlignment.RIGHT, 500);
			}
		}
		let userItem = instantiationService.createInstance(UserNavbarItem);
		this.navbarPart.addItem(userItem, NavbarAlignment.RIGHT, 400);
	}

	private createWelcomePart(): void {
		this.welcomePart = new WelcomePart(Identifiers.WELCOME_PART, this.githubService);

		this.welcomePart.create(this.contentsContainer);
	}

	private isWelcomeMode(): boolean {
		return !this.githubService.isAuthenticated() || !this.githubService.repoName;
	}

	private onWorkbenchStarted(customKeybindingsCount: number): void {
		// Log to telemetry service
		const windowSize = {
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
				customKeybindingsCount,
				theme: this.themeService.getColorTheme(),
				language: platform.language
			});

		const workspaceStats: WorkspaceStats = <WorkspaceStats>this.workbench.getInstantiationService().createInstance(WorkspaceStats);
		workspaceStats.reportWorkspaceTags();

		/* DESKTOP: Not needed when running in-browser.
		if ((platform.isLinux || platform.isMacintosh) && process.getuid() === 0) {
			this.messageService.show(Severity.Warning, nls.localize('runningAsRoot', "It is recommended not to run Code as 'root'."));
		}
		*/

		// Load the Monaco (standalone editor) contributions for language syntax, typescript, css, and json.
		require(['vs/basic-languages/src/monaco.contribution',
				'vs/language/typescript/src/monaco.contribution',
				'vs/language/json/monaco.contribution',
				'vs/language/css/monaco.contribution'], () => {
			// Register all built-in standalone JSON schemas.
			let global:any = self;
			let MonacoEditorSchemas: { [url:string]: IJSONSchema } = global.MonacoEditorSchemas;
			let schemas = [];
			for (var uri in MonacoEditorSchemas) {
				let i = uri.lastIndexOf('/');
				let pattern = uri.slice(i + 1) + '.json';
				schemas.push({ uri: uri, fileMatch: [ pattern ], schema: MonacoEditorSchemas[uri] });
			}
			global.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ validate: true, schemas: schemas });
		});
	}

	private initServiceCollection(): [InstantiationService, ServiceCollection] {
		const disposables = new Disposables();
		/* DESKTOP:
		const sharedProcess = connectNet(process.env['VSCODE_SHARED_IPC_HOOK']);
		sharedProcess.done(service => {
			service.onClose(() => {
				this.messageService.show(Severity.Error, {
					message: nls.localize('sharedProcessCrashed', "The shared process terminated unexpectedly. Please reload the window to recover."),
					actions: [instantiationService.createInstance(ReloadWindowAction, ReloadWindowAction.ID, ReloadWindowAction.LABEL)]
				});
			});
		}, errors.onUnexpectedError);

		const mainProcessClient = new ElectronIPCClient(ipcRenderer);
		disposables.add(mainProcessClient);
		*/

		const serviceCollection = new ServiceCollection();
		serviceCollection.set(IEventService, this.eventService);
		serviceCollection.set(IWorkspaceContextService, this.contextService);
		serviceCollection.set(IConfigurationService, this.configurationService);
		serviceCollection.set(IEnvironmentService, this.environmentService);
		// GHEdit: We've unified the env/ironmentService into a single data type and instance. Hopefully one will go away.
		serviceCollection.set(IEnvService, <IEnvService><any>this.environmentService);

		const instantiationService = new InstantiationService(serviceCollection, true);

		this.windowService = instantiationService.createInstance(WindowService);
		serviceCollection.set(IWindowService, this.windowService);

		// Storage
		const disableWorkspaceStorage = this.environmentService.extensionTestsPath || (!this.workspace && !this.environmentService.extensionDevelopmentPath); // without workspace or in any extension test, we use inMemory storage unless we develop an extension where we want to preserve state
		this.storageService = instantiationService.createInstance(Storage, window.localStorage, disableWorkspaceStorage ? inMemoryLocalStorageInstance : window.localStorage);
		serviceCollection.set(IStorageService, this.storageService);

		// Telemetry
		if (this.environmentService.isBuilt && !this.environmentService.extensionDevelopmentPath /* && !!product.enableTelemetry */) {
			/* TODO:
			const commit = product.commit;
			const version = pkg.version;

			const config: ITelemetryServiceConfig = {
				appender: new TelemetryAppenderClient(channel),
				commonProperties: resolveWorkbenchCommonProperties(this.storageService, commit, version),
				piiPaths: [this.environmentService.appRoot, this.environmentService.extensionsPath]
			};

			const telemetryService = instantiationService.createInstance(TelemetryService, config);
			this.telemetryService = telemetryService;

			const errorTelemetry = new ErrorTelemetry(telemetryService);
			const idleMonitor = new IdleMonitor(2 * 60 * 1000); // 2 minutes

			const listener = idleMonitor.onStatusChange(status =>
				this.telemetryService.publicLog(status === UserStatus.Active
					? TelemetryService.IDLE_STOP_EVENT_NAME
					: TelemetryService.IDLE_START_EVENT_NAME
				));
			disposables.add(telemetryService, errorTelemetry, listener, idleMonitor);
			*/
		} else {
			this.telemetryService = NullTelemetryService;
		}

		serviceCollection.set(IGithubService, this.githubService);
		serviceCollection.set(ITelemetryService, this.telemetryService);

		this.messageService = instantiationService.createInstance(MessageService);
		serviceCollection.set(IMessageService, this.messageService);
		g_messageService = this.messageService;

		const fileService = disposables.add(instantiationService.createInstance(FileService));
		fileService.updateOptions({
			settingsNotificationPaths: [
				this.environmentService.appSettingsPath,
				this.environmentService.appKeybindingsPath,
				'/.vscode/settings.json'
			],
			// The WindowConfiguration properties get merged into the EnvironmentService.
			gistRegEx: (<IWindowConfiguration><any>this.environmentService).gistRegEx
		});
		serviceCollection.set(IFileService, fileService);

		this.toUnbind.push(NullLifecycleService.onShutdown(() => disposables.dispose()));
		serviceCollection.set(ILifecycleService, NullLifecycleService);

		/* TODO:
		this.threadService = instantiationService.createInstance(MainThreadService);
		serviceCollection.set(IThreadService, this.threadService);
		*/

		const extensionService = instantiationService.createInstance(MainProcessExtensionService);
		serviceCollection.set(IExtensionService, extensionService);

		serviceCollection.set(ICommandService, new CommandService(instantiationService, extensionService));

		this.contextViewService = instantiationService.createInstance(ContextViewService, this.container);
		serviceCollection.set(IContextViewService, this.contextViewService);

		/* DESKTOP:
		let requestService = new RequestService(this.contextService, this.telemetryService);
		serviceCollection.set(IRequestService, requestService);
		*/

		let markerService = instantiationService.createInstance(MarkerService);
		serviceCollection.set(IMarkerService, markerService);

		const modeService = instantiationService.createInstance(MainThreadModeServiceImpl);
		serviceCollection.set(IModeService, modeService);

		const modelService = instantiationService.createInstance(ModelServiceImpl);
		serviceCollection.set(IModelService, modelService);

		const compatWorkerService = instantiationService.createInstance(MainThreadCompatWorkerService);
		serviceCollection.set(ICompatWorkerService, compatWorkerService);

		const editorWorkerService = instantiationService.createInstance(EditorWorkerServiceImpl);
		serviceCollection.set(IEditorWorkerService, editorWorkerService);

		const untitledEditorService = instantiationService.createInstance(UntitledEditorService);
		serviceCollection.set(IUntitledEditorService, untitledEditorService);

		this.themeService = instantiationService.createInstance(ThemeService);
		serviceCollection.set(IThemeService, this.themeService);

		const searchService = instantiationService.createInstance(SearchService);
		serviceCollection.set(ISearchService, searchService);

		const codeEditorService = instantiationService.createInstance(CodeEditorServiceImpl);
		serviceCollection.set(ICodeEditorService, codeEditorService);

		/* TODO:
		const extensionManagementChannel = getDelayedChannel<IExtensionManagementChannel>(sharedProcess.then(c => c.getChannel('extensions')));
		const extensionManagementChannelClient = new ExtensionManagementChannelClient(extensionManagementChannel);
		serviceCollection.set(IExtensionManagementService, extensionManagementChannelClient);
		const urlChannel = mainProcessClient.getChannel('url');
		const urlChannelClient = new URLChannelClient(urlChannel, this.windowService.getWindowId());
		serviceCollection.set(IURLService, urlChannelClient);
		*/

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

		// If the user isn't authenticated show a special welcome to help them get started.
		if (!this.githubService.isAuthenticated()) {
			this.createWelcomePart();
		}

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
		const timers = (<any>window).MonacoEnvironment.timers;
		if (timers) {
			const events: timer.IExistingTimerEvent[] = [];

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
		const errorMsg = errors.toErrorMessage(error, true);
		if (!errorMsg) {
			return;
		}

		const now = Date.now();
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
		const clArea = $(this.container).getClientArea();

		const contentsSize = new Dimension(clArea.width, clArea.height);

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

		// Listeners
		this.toUnbind = dispose(this.toUnbind);

		// Container
		$(this.container).empty();
	}
}
