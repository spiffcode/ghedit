/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Sort of forked from 31ce12f023580d67a66d14843e7f9983caadbe56:./vs/workbench/browser/parts/statusbar/statusbar.ts

'use strict';

import {Registry} from 'vs/platform/platform';
import {IDisposable} from 'vs/base/common/lifecycle';
/* tslint:disable:no-unused-variable */
import navbarService = require('forked/navbarService');
/* tslint:enable:no-unused-variable */
import {SyncDescriptor0, createSyncDescriptor} from 'vs/platform/instantiation/common/descriptors';
import {IConstructorSignature0} from 'vs/platform/instantiation/common/instantiation';

export interface INavbarItem {
	render(element: HTMLElement): IDisposable;
}

export import NavbarAlignment = navbarService.NavbarAlignment;

export class NavbarItemDescriptor {

	public syncDescriptor: SyncDescriptor0<INavbarItem>;
	public alignment: NavbarAlignment;
	public priority: number;

	constructor(ctor: IConstructorSignature0<INavbarItem>, alignment?: NavbarAlignment, priority?: number) {
		this.syncDescriptor = createSyncDescriptor(ctor);
		this.alignment = alignment || NavbarAlignment.LEFT;
		this.priority = priority || 0;
	}
}

export interface INavbarRegistry {
	registerNavbarItem(descriptor: NavbarItemDescriptor): void;
	items: NavbarItemDescriptor[];
}

class NavbarRegistry implements INavbarRegistry {

	private _items: NavbarItemDescriptor[];

	constructor() {
		this._items = [];
	}

	public get items(): NavbarItemDescriptor[] {
		return this._items;
	}

	public registerNavbarItem(descriptor: NavbarItemDescriptor): void {
		this._items.push(descriptor);
	}
}

export const Extensions = {
	Navbar: 'workbench.contributions.navbar'
};

Registry.add(Extensions.Navbar, new NavbarRegistry());
