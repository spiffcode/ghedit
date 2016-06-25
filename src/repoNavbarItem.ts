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
import {RepositoryInfo, Error} from 'github';

export class RepoNavbarItem implements INavbarItem, IActionProvider {
	private _actions: IAction[];

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IContextMenuService private contextMenuService: IContextMenuService,
		@IGithubService private githubService: IGithubService
	) {
	}

	public render(el: HTMLElement): IDisposable {
		this.githubService.github.getUser().repos((err: Error, repos: RepositoryInfo[]) => {
			if (err)
				return;

			this._actions = [];
			for (let repo of repos) {
				let action = new Action('repo', repo.full_name, '', true, (event: any) => {
					openRepository(repo.full_name);
					return TPromise.as(true);
				});
				this._actions.push(action);
			}
		});

		return this.instantiationService.createInstance(DropdownMenu, el, {
			tick: true,
			label: this.githubService.repo,
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
