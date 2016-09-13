/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import {IDisposable} from 'vs/base/common/lifecycle';
import {IContextMenuService} from 'vs/platform/contextview/browser/contextView';
import {IInstantiationService} from 'vs/platform/instantiation/common/instantiation';
import {INavbarItem} from 'forked/navbar';
import {DropdownMenu} from 'vs/base/browser/ui/dropdown/dropdown';
import {IAction, Action} from 'vs/base/common/actions';
import {ActionItem, Separator} from 'vs/base/browser/ui/actionbar/actionbar';
import {TPromise} from 'vs/base/common/winjs.base';
import {MenuItemType, Menu, MenuItem } from 'fakeElectron';
import {dispose} from 'vs/base/common/lifecycle';
import {Keybinding} from 'vs/base/common/keyCodes';
import {IKeybindingService} from 'vs/platform/keybinding/common/keybinding';
import {IWorkbenchActionRegistry, Extensions as ActionExtensions} from 'vs/workbench/common/actionRegistry';
import {Registry} from 'vs/platform/platform';
import {ITelemetryService} from 'vs/platform/telemetry/common/telemetry';
import {IMessageService, Severity} from 'vs/platform/message/common/message';
import {ICommandService} from 'vs/platform/commands/common/commands';
import {IWorkbenchEditorService} from 'vs/workbench/services/editor/common/editorService';
import types = require('vs/base/common/types');
import {toErrorMessage} from 'vs/base/common/errors';
import nls = require('vs/nls');

export class MenusNavbarItem implements INavbarItem {
	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IContextMenuService private contextMenuService: IContextMenuService,
		@IKeybindingService private keybindingService: IKeybindingService,
		@ICommandService private commandService: ICommandService,
		@IMessageService private messageService: IMessageService,
		@ITelemetryService private telemetryService: ITelemetryService,
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService
	) {
	}

	// If the user is signed out show them a "Sign In" button.
	// If they're signed in show them a menu that includes a "Sign Out" item.
	public render(el: HTMLElement): IDisposable {
		let menusContainer = document.createElement('div');
		el.appendChild(menusContainer);

		const items = Menu.getApplicationMenu().items;
		for (let item of items) {
			let actions: IAction[] = [];
			let submenu = <Menu>item.submenu;
			let subitems = submenu.items;
			if (subitems) {
				for (let subitem of subitems) {
					var action: IAction;
					switch (subitem.type) {
					case 'separator':
						action = new Separator();
						break;

					default:
						if (subitem.label) {
							action = new Action(subitem.id, subitem.label, '', true, (event: any) => {
								if (subitem.click) {
									subitem.click(subitem, null, event);
								} else {
									this.executeCommand(subitem.id);
								}
								return TPromise.as(null);
								/*
								let builtInActionDescriptor = (<IWorkbenchActionRegistry>Registry.as(ActionExtensions.WorkbenchActions)).getWorkbenchAction(subitem.id);
								if (builtInActionDescriptor) {
									let action: IAction = this.instantiationService.createInstance(builtInActionDescriptor.syncDescriptor);
									return action.run() || TPromise.as(null);
								} else {
									return TPromise.as(null);
								}
								*/
							});
						}
					}
					actions.push(action);
				}
			}

			let dropdown = <DropdownMenu>this.instantiationService.createInstance(DropdownMenu, menusContainer, {
				tick: false,
				label: item.label,
				contextMenuProvider: this.contextMenuService,
				actions: actions
			});

			dropdown.menuOptions = {
				getKeyBinding: (action): Keybinding => {
					return this._keybindingFor(action);
				},

				actionItemProvider: (action: IAction) => {
					var keybinding = this._keybindingFor(action);
					if (keybinding) {
						return new ActionItem(action, action, { label: true, keybinding: this.keybindingService.getLabelFor(keybinding) });
					}

					var customActionItem = <any>action;
					if (typeof customActionItem.getActionItem === 'function') {
						return customActionItem.getActionItem();
					}

					return null;
				}
			}
		}

		return {
			dispose: () => {}
		}
	}

	private _keybindingFor(action: IAction): Keybinding {
		var opts = this.keybindingService.lookupKeybindings(action.id);
		if (opts.length > 0) {
			return opts[0]; // only take the first one
		}
		return null;
	}

	private executeCommand(id: string) {
		let action: IAction;
		let activeEditor = this.editorService.getActiveEditor();

		// Lookup built in commands
		let builtInActionDescriptor = (<IWorkbenchActionRegistry>Registry.as(ActionExtensions.WorkbenchActions)).getWorkbenchAction(id);
		if (builtInActionDescriptor) {
			action = this.instantiationService.createInstance(builtInActionDescriptor.syncDescriptor);
		}

		// Lookup editor commands
		if (!action) {
			let activeEditorControl = <any>(activeEditor ? activeEditor.getControl() : null);
			if (activeEditorControl && types.isFunction(activeEditorControl.getAction)) {
				action = activeEditorControl.getAction(id);
			}
		}

		// Some actions or commands might only be enabled for an active editor, so focus it first
		if (activeEditor) {
			activeEditor.focus();
		}

		// Run it if enabled
		if (action) {
			if (action.enabled) {
				this.telemetryService.publicLog('workbenchActionExecuted', { id: action.id, from: 'nav bar' });
				(action.run() || TPromise.as(null)).done(() => {
					action.dispose();
				}, (err) => this.messageService.show(Severity.Error, toErrorMessage(err)));
			} else {
				this.messageService.show(Severity.Warning, nls.localize('canNotRun', "Command '{0}' can not be run from here.", action.label || id));
			}
		}

		// Fallback to the keybinding service for any other case
		else {
			this.commandService.executeCommand(id).done(undefined, err => this.messageService.show(Severity.Error, toErrorMessage(err)));
		}
	}
}
