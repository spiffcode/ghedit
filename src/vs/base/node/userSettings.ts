/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// import * as from 'fs';
// import * as path from 'path';

import winjs = require('vs/base/common/winjs.base');
import * as json from 'vs/base/common/json';
import * as objects from 'vs/base/common/objects';
import URI from 'vs/base/common/uri';
import {TPromise} from 'vs/base/common/winjs.base';
// import Event, {Emitter} from 'vs/base/common/event';
import {ServiceIdentifier, createDecorator} from 'vs/platform/instantiation/common/instantiation';
import {IWorkspaceContextService} from 'vs/workbench/services/workspace/common/contextService';
import {IFileService, IContent} from 'vs/platform/files/common/files';
import {IEventService} from 'vs/platform/event/common/event';

export const ISettingsService = createDecorator<ISettingsService>('settingsService');

export interface ISettingsService {
	serviceId: ServiceIdentifier<any>;
	loadSettings(): void;
}

export interface ISettings {
	settings: any;
	settingsParseErrors?: string[];
	keybindings: any[];
}

export class UserSettings implements ISettingsService {

//	private static CHANGE_BUFFER_DELAY = 300;

	globalSettings: ISettings;

//	private timeoutHandle: number;
//	private watcher: fs.FSWatcher;
//	private appSettingsPath: string;
//	private appKeybindingsPath: string;

//	private _onChange: Emitter<ISettings>;

	serviceId = ISettingsService;

//	constructor(appSettingsPath: string, appKeybindingsPath: string,
	constructor(
		@IFileService private fileService:IFileService,
		@IEventService private eventService: IEventService,
		@IWorkspaceContextService private contextService: IWorkspaceContextService) {

		// this.appSettingsPath = appSettingsPath;
		// this.appKeybindingsPath = appKeybindingsPath;

		//this._onChange = new Emitter<ISettings>();

		//this.registerWatchers();

		this.globalSettings = {
			settings: {},
			keybindings: []
		};

		this.registerListener();
	}

/*
	static getValue(userDataPath: string, key: string, fallback?: any): TPromise<any> {
		// TODO@joao cleanup!
		const appSettingsPath = path.join(userDataPath, 'User', 'settings.json');

		return new TPromise((c, e) => {
			fs.readFile(appSettingsPath, (error, fileContents) => {
				let root = Object.create(null);
				let content = fileContents ? fileContents.toString() : '{}';

				let contents = Object.create(null);
				try {
					contents = json.parse(content);
				} catch (error) {
					// ignore parse problem
				}

				for (let key in contents) {
					UserSettings.setNode(root, key, contents[key]);
				}

				return c(UserSettings.doGetValue(root, key, fallback));
			});
		});
	}
*/

/*
	get onChange(): Event<ISettings> {
		return this._onChange.event;
	}
*/

/*
	getValue(key: string, fallback?: any): any {
		return UserSettings.doGetValue(this.globalSettings.settings, key, fallback);
	}
*/

/*
	private static doGetValue(globalSettings: any, key: string, fallback?: any): any {
		if (!key) {
			return fallback;
		}

		let value = globalSettings;

		let parts = key.split('\.');
		while (parts.length && value) {
			let part = parts.shift();
			value = value[part];
		}

		return typeof value !== 'undefined' ? value : fallback;
	}
*/

/*
	private registerWatchers(): void {
		this.watcher = fs.watch(path.dirname(this.appSettingsPath));
		this.watcher.on('change', (eventType: string, fileName: string) => this.onSettingsFileChange(eventType, fileName));
	}

	private onSettingsFileChange(eventType: string, fileName: string): void {

		// we can get multiple change events for one change, so we buffer through a timeout
		if (this.timeoutHandle) {
			global.clearTimeout(this.timeoutHandle);
			this.timeoutHandle = null;
		}

		this.timeoutHandle = global.setTimeout(() => {

			// Reload
			let didChange = this.loadSync();

			// Emit event
			if (didChange) {
				this._onChange.fire(this.globalSettings);
			}

		}, UserSettings.CHANGE_BUFFER_DELAY);
	}
*/

/*
	loadSync(): boolean {
		let loadedSettings = this.doLoadSync();
		if (!objects.equals(loadedSettings, this.globalSettings)) {

			// Keep in class
			this.globalSettings = loadedSettings;

			return true; // changed value
		}

		return false; // no changed value
	}
*/

/*
	private doLoadSync(): ISettings {
		let settings = this.doLoadSettingsSync();

		return {
			settings: settings.contents,
			settingsParseErrors: settings.parseErrors,
			keybindings: this.doLoadKeybindingsSync()
		};
	}
*/

/*
	private doLoadSettingsSync(): { contents: any; parseErrors?: string[]; } {
		let root = Object.create(null);
		let content = '{}';
		try {
			content = fs.readFileSync(this.appSettingsPath).toString();
		} catch (error) {
			// ignore
		}

		let contents = Object.create(null);
		try {
			contents = json.parse(content);
		} catch (error) {
			// parse problem
			return {
				contents: Object.create(null),
				parseErrors: [this.appSettingsPath]
			};
		}

		for (let key in contents) {
			UserSettings.setNode(root, key, contents[key]);
		}

		return {
			contents: root
		};
	}
*/

	// private static setNode(root: any, key: string, value: any): any {
	private setNode(root: any, key: string, value: any): any {
		let segments = key.split('.');
		let last = segments.pop();

		let curr = root;
		segments.forEach((s) => {
			let obj = curr[s];
			switch (typeof obj) {
				case 'undefined':
					obj = curr[s] = {};
					break;
				case 'object':
					break;
				default:
					console.log('Conflicting user settings: ' + key + ' at ' + s + ' with ' + JSON.stringify(obj));
			}
			curr = obj;
		});
		curr[last] = value;
	}

/*
	private doLoadKeybindingsSync(): any {
		try {
			return json.parse(fs.readFileSync(this.appKeybindingsPath).toString());
		} catch (error) {
			// Ignore loading and parsing errors
		}

		return [];
	}
*/

/*
	dispose(): void {
		if (this.watcher) {
			this.watcher.close();
			this.watcher = null;
		}
	}
*/

	public loadSettings(): void {
		// TODO: restructure the below as a composite Promise using Promise.join(),
		// so that one notification broadcast can occur after loading both settings and keybindings.
		// See https://blogs.msdn.microsoft.com/windowsappdev/2013/06/11/all-about-promises-for-windows-store-apps-written-in-javascript/
		// to get the sequencing correct.

		// Load settings json
		let appSettingsPath = this.contextService.getConfiguration().env.appSettingsPath;
		if (appSettingsPath) {
			this.fileService.resolveContent(URI.file(appSettingsPath), { acceptTextOnly: true }).then((settingsContent: IContent) => {
				let settings: any = {};
				let settingsParseErrors: any[] = [];

				// Parse settings. The loop turns it into a dictionary tree, which is the runtime format.
				try {
					let contents = json.parse(settingsContent.value);
					for (let key in contents) {
						this.setNode(settings, key, contents[key]);
					}
				} catch (error) {
					settingsParseErrors.push(appSettingsPath);
				}

				// Update settings.
				setTimeout(() => {
					this.updateSettingsKey('settings', settings);
					if (settingsParseErrors) {
						this.updateSettingsKey('settingsParseErrors', settingsParseErrors);
					}
				}, 0);
			}, (error) => {
				// console.log('UserSettings error loading: ' + appSettingsPath)
			});
		}

		// Load keybindings json
		let appKeybindingsPath: string = this.contextService.getConfiguration().env.appKeybindingsPath;
		if (appKeybindingsPath != null) {
			this.fileService.resolveContent(URI.file(appKeybindingsPath), { acceptTextOnly: true }).then((keyBindingsContent: IContent) => {
				let keybindings: any[] = [];
				try {
					keybindings = json.parse(keyBindingsContent.value);
				} catch (error) {
					// Ignore loading and parsing errors for keybindings
				}

				// Update settings.
				if (keybindings) {
					setTimeout(() => this.updateSettingsKey('keybindings', keybindings), 0);
				}
			}, (error) => {
				// console.log('UserSettings error loading: ' + appKeybindingsPath)
			});
		}
	}

	private updateSettingsKey(key: string, value: any): void {
		if (!this.globalSettings.hasOwnProperty(key) || !objects.equals(this.globalSettings[key], value)) {
			this.globalSettings[key] = value;
			this.contextService.updateOptions('globalSettings', this.globalSettings);
		}
	}

	private registerListener(): void {
		this.eventService.addListener2("settingsFileChanged", () => {
			this.loadSettings();
		});
	}
}
