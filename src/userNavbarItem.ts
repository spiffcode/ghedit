/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import {IDisposable} from 'vs/base/common/lifecycle';
import {IContextMenuService} from 'vs/platform/contextview/browser/contextView';
import {IInstantiationService} from 'vs/platform/instantiation/common/instantiation';
import {INavbarItem} from 'forked/navbar';
import {$} from 'vs/base/browser/builder';
import {OcticonLabel} from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import {dispose} from 'vs/base/common/lifecycle';
import {IGithubService} from 'githubService';
import {DropdownMenu} from 'vs/base/browser/ui/dropdown/dropdown';
import {Action} from 'vs/base/common/actions';
import {TPromise} from 'vs/base/common/winjs.base';
import dom = require('vs/base/browser/dom');

export class UserNavbarItem implements INavbarItem {

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IContextMenuService private contextMenuService: IContextMenuService,
		@IGithubService private githubService: IGithubService
	) {
	}

	// If the user is signed out show them a "Sign In" button.
	// If they're signed in show them a menu that includes a "Sign Out" item.
	public render(el: HTMLElement): IDisposable {
		let user = this.githubService.getAuthenticatedUserInfo();

		if (!user) {
			return this.renderSignedOut(el);
		}

		let actions = [
			// TODO: string localization
			new Action('signOut', 'Sign Out', 'tight-menu-items', true, (event: any) => {
				window.localStorage.removeItem('githubToken');
				var d = new Date();
				d.setTime(d.getTime() - 1000);
				document.cookie = 'githubToken=;expires=' + d.toUTCString();;
				window.localStorage.removeItem('githubUser');
				window.localStorage.removeItem('githubPassword');
				window.sessionStorage.removeItem('githubRepo');
				window.sessionStorage.removeItem('githuRef');
				window.localStorage.removeItem('lastGithubRepo');
				window.localStorage.removeItem('lastGithubRef');

				// Refresh to the page to fully present the signed out state.
				location.href = location.origin + location.pathname;
				return TPromise.as(true);
			}),
		];

		return this.instantiationService.createInstance(DropdownMenu, el, {
			tick: true,
			label: user.login,
			contextMenuProvider: this.contextMenuService,
			actions: actions
		});
	}

	private renderSignedOut(el: HTMLElement): IDisposable {
		let toDispose: IDisposable[] = [];
		dom.addClass(el, 'navbar-entry');

		// Text Container
		let textContainer = document.createElement('a');

		$(textContainer).on('click', (e) => {
			this.githubService.authenticate();
		}, toDispose);

		// Label
		// TODO: string localization
		new OcticonLabel(textContainer).text = 'Sign In';

		// Tooltip
		// TODO: string localization
		$(textContainer).title('Grant access to your GitHub repos, gists, and user info');

		el.appendChild(textContainer);

		return {
			dispose: () => {
				toDispose = dispose(toDispose);
			}
		};
	}
}
