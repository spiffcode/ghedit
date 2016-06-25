/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import {IDisposable} from 'vs/base/common/lifecycle';
import {IContextMenuService} from 'vs/platform/contextview/browser/contextView';
import {IInstantiationService} from 'vs/platform/instantiation/common/instantiation';
import {INavbarItem} from 'forked/navbar';
import {IGithubService, openRepository} from 'githubService';
import {DropdownMenu, IActionProvider} from 'vs/base/browser/ui/dropdown/dropdown';
import {Action, IAction} from 'vs/base/common/actions';
import {TPromise} from 'vs/base/common/winjs.base';
import {Error} from 'github';

export class RefNavbarItem implements INavbarItem, IActionProvider {
	private _actions: IAction[];

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IContextMenuService private contextMenuService: IContextMenuService,
		@IGithubService private githubService: IGithubService
	) {
	}

	public render(el: HTMLElement): IDisposable {
		let repo = this.githubService.github.getRepo(this.githubService.repo);
		repo.listBranches((err: Error, branches: string[]) => {
			if (err)
				return;

			this._actions = [];
			for (let branch of branches) {
				let action = new Action('ref', branch, 'tight-menu-items', true, (event: any) => {
					openRepository(this.githubService.repo, branch);
					return TPromise.as(true);
				});
				this._actions.push(action);
			}
		});

		return this.instantiationService.createInstance(DropdownMenu, el, {
			tick: true,
			label: this.githubService.ref,
			contextMenuProvider: this.contextMenuService,
			actionProvider: this
		});
	}

	// IActionProvider implementation

	public getActions(): IAction[] {
		if (this._actions)
			return this._actions;

		return [
			// TODO: string localization
			new Action('loading', 'Loading...', '', true, (event: any) => {
				return TPromise.as(true);
			}),
		];
	}
}
