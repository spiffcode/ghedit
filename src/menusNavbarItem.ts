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
import {Action} from 'vs/base/common/actions';
import {TPromise} from 'vs/base/common/winjs.base';
import {MenuItemType, Menu, MenuItem } from 'fakeElectron';
import {dispose} from 'vs/base/common/lifecycle';

export class MenusNavbarItem implements INavbarItem {
	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IContextMenuService private contextMenuService: IContextMenuService
	) {
	}

	// If the user is signed out show them a "Sign In" button.
	// If they're signed in show them a menu that includes a "Sign Out" item.
	public render(el: HTMLElement): IDisposable {
		let menusContainer = document.createElement('div');
		el.appendChild(menusContainer);

		const items = Menu.getApplicationMenu().items;
		for (let item of items) {
			let actions: Action[] = [];
			let submenu = <Menu>item.submenu;
			let subitems = submenu.items;
			if (subitems) {
				for (let subitem of subitems) {
					if (subitem && subitem.label) {
						actions.push(
							new Action('signOut', subitem.label, 'tight-menu-items', true, (event: any) => {
								return TPromise.as(true);
							})
						);
					}
				}
			}

			this.instantiationService.createInstance(DropdownMenu, menusContainer, {
				tick: false,
				label: item.label,
				contextMenuProvider: this.contextMenuService,
				actions: actions
			});
		}

		return {
			dispose: () => {}
		}
	}
}
