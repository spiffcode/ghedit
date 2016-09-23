/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// TODO: import {ElectronWindow} from 'vs/workbench/electron-browser/window';
import {createDecorator} from 'vs/platform/instantiation/common/instantiation';
import Event, {Emitter} from 'vs/base/common/event';

// TODO: import {ipcRenderer as ipc, remote} from 'electron';

// TODO: const windowId = remote.getCurrentWindow().id;
const windowId = 666;

export const IWindowService = createDecorator<IWindowService>('windowService');

export class BogusWindow {
	public showSaveDialog(options: Electron.SaveDialogOptions, callback?: (fileName: string) => void): string {
		console.log('BogusWindow.showSaveDialog not implemented');
		/* TODO:
		if (callback) {
			return dialog.showSaveDialog(this.win, options, callback);
		}

		return dialog.showSaveDialog(this.win, options); // https://github.com/atom/electron/issues/4936
		*/
		return 'unimplemented';
	}

	public showMessageBox(options: Electron.ShowMessageBoxOptions): number {
		const buttonCount = options.buttons != null ? options.buttons.length : 0;
		switch (buttonCount) {
			case 0:
			case 1:
				window.alert(options.message);
				return 0;

			case 2:
				if (options.cancelId === undefined || options.cancelId == 0)
					return window.confirm(options.message) ? 1 : 0;
				else
					throw Error('BogusWindow.showMessageBox(' + JSON.stringify(options) + ') not implemented');

			default:
				console.log('BogusWindow.showMessageBox(' + JSON.stringify(options) + ') not implemented');
				throw Error('BogusWindow.showMessageBox(' + JSON.stringify(options) + ') not implemented');
// TODO:		return dialog.showMessageBox(this.win, options);
		}
	}
}

export interface IWindowServices {
	windowService?: IWindowService;
}

export interface IBroadcast {
	channel: string;
	payload: any;
}

export interface IWindowService {
	_serviceBrand: any;

	getWindowId(): number;

	getWindow(): BogusWindow;

	registerWindow(win: BogusWindow): void;

	broadcast(b: IBroadcast, target?: string): void;

	onBroadcast: Event<IBroadcast>;
}

export class WindowService implements IWindowService {
	public _serviceBrand: any;

	private win: BogusWindow;
	private windowId: number;
	private _onBroadcast: Emitter<IBroadcast>;

	constructor() {
		this.win = new BogusWindow();
		this._onBroadcast = new Emitter<IBroadcast>();
		this.windowId = windowId;

		this.registerListeners();
	}

	private registerListeners(): void {
		/* TODO:
		ipc.on('vscode:broadcast', (event, b: IBroadcast) => {
			this._onBroadcast.fire(b);
		});
		*/
	}

	public get onBroadcast(): Event<IBroadcast> {
		return this._onBroadcast.event;
	}

	public getWindowId(): number {
		return this.windowId;
	}

	public getWindow(): BogusWindow {
		return this.win;
	}

	public registerWindow(win: BogusWindow): void {
		this.win = win;
	}

	public broadcast(b: IBroadcast, target?: string): void {
		/* TODO:
		ipc.send('vscode:broadcast', this.getWindowId(), target, {
			channel: b.channel,
			payload: b.payload
		});
		*/
	}
}