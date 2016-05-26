/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import {IDisposable} from 'vs/base/common/lifecycle';
import {IContextViewService} from 'vs/platform/contextview/browser/contextView';
import {IInstantiationService} from 'vs/platform/instantiation/common/instantiation';
import {IWorkspaceContextService} from 'vs/platform/workspace/common/workspace';
import dom = require('vs/base/browser/dom');
import {INavbarItem} from 'forked/navbar';
import {Builder, $} from 'vs/base/browser/builder';
import {OcticonLabel} from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import {dispose} from 'vs/base/common/lifecycle';
import {IGithubService} from 'githubService';

export class UserNavbarItem implements INavbarItem {

	private textContainer: HTMLElement;

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IContextViewService private contextViewService: IContextViewService,
		@IWorkspaceContextService private contextService: IWorkspaceContextService,
		@IGithubService private githubService: IGithubService
	) {
	}

	public render(el: HTMLElement): IDisposable {
		let toDispose: IDisposable[] = [];
		dom.addClass(el, 'navbar-entry');

		let user = this.githubService.getAuthenticatedUserInfo();

		// Text Container
		this.textContainer = document.createElement('a');

		$(this.textContainer).on('click', (e) => {
			if (!this.githubService.isAuthenticated()) {
				this.githubService.authenticate();
			} else {
				// TODO: dropdown user menu w/ "sign out"
				console.log('user menu not implemented');
			}
		}, toDispose);

		// Label
		// TODO: string localization
		new OcticonLabel(this.textContainer).text = user ? user.login : 'Sign In';

		// Tooltip
		// TODO: string localization
		$(this.textContainer).title(user ? 'Hi!' : 'Grant access to your GitHub repos, gists, and user info');

		el.appendChild(this.textContainer);

		return {
			dispose: () => {
				toDispose = dispose(toDispose);
			}
		};
	}
}
