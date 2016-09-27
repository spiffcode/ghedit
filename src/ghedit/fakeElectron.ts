'use strict';

import {EventEmitter} from 'vs/base/common/eventEmitter';

export interface BrowserWindow {}
export interface NativeImage {}

// https://github.com/electron/electron/blob/master/docs/api/menu-item.md
// https://github.com/electron/electron/blob/master/docs/api/accelerator.md

/**
 * The MenuItem allows you to add items to an application or context menu.
 */
export class MenuItem {
	/**
	 * Create a new menu item.
	 */
	constructor(private options: MenuItemOptions) {
		this.click = options.click;
		this.type = options.type || 'normal';
		if (options.submenu)
			this.type == 'submenu';
		this.role = options.role;
		this.accelerator = options.accelerator;
		this.icon = options.icon;
		this.submenu = options.submenu;
		this.label = options.label;
		this.sublabel = options.sublabel;
		this.enabled = options.enabled;
		this.visible = options.visible;
		this.checked = options.checked;
		this.id = options.id;
	}

	click: (menuItem: MenuItem, browserWindow: BrowserWindow, event: Event) => void;
	/**
	 * Read-only property.
	 */
	type: MenuItemType;
	/**
	 * Read-only property.
	 */
	role: MenuItemRole | MenuItemRoleMac;
	/**
	 * Read-only property.
	 */
	accelerator: string;
	/**
	 * Read-only property.
	 */
	icon: NativeImage | string;
	/**
	 * Read-only property.
	 */
	submenu: Menu | MenuItemOptions[];

	label: string;
	sublabel: string;
	enabled: boolean;
	visible: boolean;
	checked: boolean;
	id: string;
}

export type MenuItemType = 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
export type MenuItemRole = 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'pasteandmatchstyle' | 'selectall' | 'delete' | 'minimize' | 'close' | 'quit' | 'togglefullscreen';
export type MenuItemRoleMac = 'about' | 'hide' | 'hideothers' | 'unhide' | 'front' | 'zoom' | 'window' | 'help' | 'services';

export interface MenuItemOptions {
	/**
	 * Callback when the menu item is clicked.
	 */
	click?: (menuItem: MenuItem, browserWindow: BrowserWindow) => void;
	/**
	 * Can be normal, separator, submenu, checkbox or radio.
	 */
	type?: MenuItemType;
	label?: string;
	sublabel?: string;
	/**
	 * An accelerator is string that represents a keyboard shortcut, it can contain
	 * multiple modifiers and key codes, combined by the + character.
	 *
	 * Examples:
	 *   CommandOrControl+A
	 *   CommandOrControl+Shift+Z
	 *
	 * Platform notice:
	 *   On Linux and Windows, the Command key would not have any effect,
	 *   you can use CommandOrControl which represents Command on macOS and Control on
	 *   Linux and Windows to define some accelerators.
	 *
	 *   Use Alt instead of Option. The Option key only exists on macOS, whereas
	 *   the Alt key is available on all platforms.
	 *
	 *   The Super key is mapped to the Windows key on Windows and Linux and Cmd on macOS.
	 *
	 * Available modifiers:
	 *   Command (or Cmd for short)
	 *   Control (or Ctrl for short)
	 *   CommandOrControl (or CmdOrCtrl for short)
	 *   Alt
	 *   Option
	 *   AltGr
	 *   Shift
	 *   Super
	 *
	 * Available key codes:
	 *   0 to 9
	 *   A to Z
	 *   F1 to F24
	 *   Punctuations like ~, !, @, #, $, etc.
	 *   Plus
	 *   Space
	 *   Tab
	 *   Backspace
	 *   Delete
	 *   Insert
	 *   Return (or Enter as alias)
	 *   Up, Down, Left and Right
	 *   Home and End
	 *   PageUp and PageDown
	 *   Escape (or Esc for short)
	 *   VolumeUp, VolumeDown and VolumeMute
	 *   MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause
	 *   PrintScreen
	 */
	accelerator?: string;
	/**
	 * In Electron for the APIs that take images, you can pass either file paths
	 * or NativeImage instances. When passing null, an empty image will be used.
	 */
	icon?: NativeImage | string;
	/**
	 * If false, the menu item will be greyed out and unclickable.
	 */
	enabled?: boolean;
	/**
	 * If false, the menu item will be entirely hidden.
	 */
	visible?: boolean;
	/**
	 * Should only be specified for 'checkbox' or 'radio' type menu items.
	 */
	checked?: boolean;
	/**
	 * Should be specified for submenu type menu item, when it's specified the
	 * type: 'submenu' can be omitted for the menu item
	 */
	submenu?: Menu | MenuItemOptions[];
	/**
	 * Unique within a single menu. If defined then it can be used as a reference
	 * to this item by the position attribute.
	 */
	id?: string;
	/**
	 * This field allows fine-grained definition of the specific location within
	 * a given menu.
	 */
	position?: string;
	/**
	 * Define the action of the menu item, when specified the click property will be ignored
	 */
	role?: MenuItemRole | MenuItemRoleMac;
}

// https://github.com/electron/electron/blob/master/docs/api/menu.md

/**
 * The Menu class is used to create native menus that can be used as application
 * menus and context menus. This module is a main process module which can be used
 * in a render process via the remote module.
 *
 * Each menu consists of multiple menu items, and each menu item can have a submenu.
 */
export class Menu extends EventEmitter {
	private static applicationMenu: Menu;

	/**
	 * Creates a new menu.
	 */
	constructor() {
		super()
	}

	/**
	 * Sets menu as the application menu on macOS. On Windows and Linux, the menu
	 * will be set as each window's top menu.
	 */
	static setApplicationMenu(menu: Menu): void {
		Menu.applicationMenu = menu;
	}

	/**
	 * @returns The application menu if set, or null if not set.
	 */
	static getApplicationMenu(): Menu {
		return Menu.applicationMenu;
	}

	/**
	 * Sends the action to the first responder of application.
	 * This is used for emulating default Cocoa menu behaviors,
	 * usually you would just use the role property of MenuItem.
	 *
	 * Note: This method is macOS only.
	 */
	static sendActionToFirstResponder(action: string): void {
		throw Error('Menu.sendActionToFirstResponder not implemented');
	}

	/**
	 * @param template Generally, just an array of options for constructing MenuItem.
	 * You can also attach other fields to element of the template, and they will
	 * become properties of the constructed menu items.
	 */
	static buildFromTemplate(template: MenuItemOptions[]): Menu {
		throw Error('Menu.buildFromTemplate not implemented');
	}

	/**
	 * Pops up this menu as a context menu in the browserWindow. You can optionally
	 * provide a (x,y) coordinate to place the menu at, otherwise it will be placed
	 * at the current mouse cursor position.
	 * @param x Horizontal coordinate where the menu will be placed.
	 * @param y Vertical coordinate where the menu will be placed.
	 */
	popup(browserWindow?: BrowserWindow, x?: number, y?: number, select?: number): void {
		throw Error('Menu.popup not implemented');
	}

	/**
	 * Appends the menuItem to the menu.
	 */
	append(menuItem: MenuItem): void {
		if (!this.items)
			this.items = [];
		this.items.push(menuItem);
	}

	/**
	 * Inserts the menuItem to the pos position of the menu.
	 */
	insert(position: number, menuItem: MenuItem): void {
		throw Error('Menu.insert not implemented');
	}

	/**
	 * @returns an array containing the menu’s items.
	 */
	public items: MenuItem[];
}

// From vs/code/electron-main/window.ts
export interface IPath {

	// the workspace spath for a VSCode instance which can be null
	workspacePath?: string;

	// the file path to open within a VSCode instance
	filePath?: string;

	// the line number in the file path to open
	lineNumber?: number;

	// the column number in the file path to open
	columnNumber?: number;

	// indicator to create the file path in the VSCode instance
	createFilePath?: boolean;

	// indicator to install the extension (path to .vsix) in the VSCode instance
	installExtensionPath?: boolean;
}

// From vs/code/electron-main/env.ts
export interface ICommandLineArguments {
	verboseLogging: boolean;
	debugExtensionHostPort: number;
	debugBrkExtensionHost: boolean;
	debugBrkFileWatcherPort: number;
	logExtensionHostCommunication: boolean;
	disableExtensions: boolean;
	extensionsHomePath: string;
	extensionDevelopmentPath: string;
	extensionTestsPath: string;
	programStart: number;
	pathArguments?: string[];
	enablePerformance?: boolean;
	openNewWindow?: boolean;
	openInSameWindow?: boolean;
	gotoLineMode?: boolean;
	diffMode?: boolean;
	locale?: string;
	waitForWindowClose?: boolean;
}

export interface IEnvironmentService {
	_serviceBrand: any;
	cliArgs: ICommandLineArguments;
	userExtensionsHome: string;
	isTestingFromCli: boolean;
	isBuilt: boolean;
	product: IProductConfiguration;
	updateUrl: string;
	quality: string;
	userHome: string;
	appRoot: string;
	currentWorkingDirectory: string;
	appHome: string;
	appSettingsHome: string;
	appSettingsPath: string;
	appKeybindingsPath: string;
	mainIPCHandle: string;
	sharedIPCHandle: string;

	// DESKTOP: createPaths(): TPromise<void>;
}

// From vs/platform/product.ts
export interface IProductConfiguration {
	nameShort: string;
	nameLong: string;
	/*
	applicationName: string;
	win32AppUserModelId: string;
	win32MutexName: string;
	darwinBundleIdentifier: string;
	dataFolderName: string;
	downloadUrl: string;
	updateUrl?: string;
	quality?: string;
	commit: string;
	date: string;
	extensionsGallery: {
		serviceUrl: string;
		itemUrl: string;
	};
	extensionTips: { [id: string]: string; };
	extensionImportantTips: { [id: string]: string; };
	crashReporter: Electron.CrashReporterStartOptions;
	welcomePage: string;
	enableTelemetry: boolean;
	aiConfig: {
		key: string;
		asimovKey: string;
	};
	sendASmile: {
		reportIssueUrl: string,
		requestFeatureUrl: string
	};
	*/
	documentationUrl: string;
	releaseNotesUrl: string;
	twitterUrl: string;
	sendFeedbackUrl: string;
	requestFeatureUrl: string;
	reportIssueUrl: string;
	licenseUrl: string;
	privacyStatementUrl: string;
	npsSurveyUrl: string;
}

export interface IWindowsService {
	/*
	_serviceBrand: any;

	// TODO make proper events
	// events
	onOpen(clb: (path: IPath) => void): () => void;
	onReady(clb: (win: VSCodeWindow) => void): () => void;
	onClose(clb: (id: number) => void): () => void;

	// methods
	ready(initialUserEnv: IProcessEnvironment): void;
	reload(win: VSCodeWindow, cli?: ICommandLineArguments): void;
	open(openConfig: IOpenConfiguration): VSCodeWindow[];
	openPluginDevelopmentHostWindow(openConfig: IOpenConfiguration): void;
	openFileFolderPicker(forceNewWindow?: boolean): void;
	openFilePicker(forceNewWindow?: boolean): void;
	openFolderPicker(forceNewWindow?: boolean): void;
	focusLastActive(cli: ICommandLineArguments): VSCodeWindow;
	getLastActiveWindow(): VSCodeWindow;
	findWindow(workspacePath: string, filePath?: string, extensionDevelopmentPath?: string): VSCodeWindow;
	openNewWindow(): void;
	*/
	sendToFocused(channel: string, ...args: any[]): void;
	/*
	sendToAll(channel: string, payload: any, windowIdsToIgnore?: number[]): void;
	getFocusedWindow(): VSCodeWindow;
	getWindowById(windowId: number): VSCodeWindow;
	getWindows(): VSCodeWindow[];
	*/
	getWindowCount(): number;
}
