/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./welcomePart';
import nls = require('vs/nls');
import dom = require('vs/base/browser/dom');
import {Part} from 'vs/workbench/browser/part';
import {Builder, $} from 'vs/base/browser/builder';
import {RepositoryInfo, Error} from 'github';
import {IGithubService, openRepository} from 'githubService';
import {InputBox} from 'vs/base/browser/ui/inputbox/inputBox';
import {Button} from 'vs/base/browser/ui/button/button';
import {KeyCode} from 'vs/base/common/keyCodes';
import {StandardKeyboardEvent} from 'vs/base/browser/keyboardEvent';

// TODO: localization
const DEFAULT_INPUT_ARIA_LABEL = 'Enter a Repository';

export class WelcomePart extends Part {
	private container: Builder;
	private inputBox: InputBox;
	private openButton: Button;

	constructor(
		id: string,
		private githubService: IGithubService
	) {
		super(id);
	}

	// The "monaco-*" classes are used to achieve the same look and feel as the Explorer.
	public createContentArea(parent: Builder): Builder {
		this.container = $(parent);
		let el = document.createElement('div');
		dom.addClass(el, 'monaco-workbench welcome-part');
		this.container.append(el, 0);

		if (this.githubService.isAuthenticated()) {
			// Encourage the user to choose a repository.
			let inputPrompt = document.createElement('span');
			// TODO: localization
			inputPrompt.textContent = 'Choose a Repository:';
			dom.addClass(inputPrompt, 'input-prompt');
			el.appendChild(inputPrompt);

			this.inputBox = new InputBox(el, null, {
				// TODO: localization
				placeholder: 'user/repository',
				ariaLabel: DEFAULT_INPUT_ARIA_LABEL
			});
			this.inputBox.focus();
			dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.KEY_DOWN, (e: KeyboardEvent) => {
				let keyboardEvent: StandardKeyboardEvent = new StandardKeyboardEvent(e);
				if (keyboardEvent.keyCode === KeyCode.Enter) {
					openRepository(this.inputBox.value);
				}
			});

			this.openButton = new Button(el);
			// TODO: localization
			this.openButton.label = 'Open';
			this.openButton.on('click', () => {
				openRepository(this.inputBox.value);
			});

			// Present a list of the user's repositories.
			let header = document.createElement('div');
			dom.addClass(header, 'header');
			// TODO: localization
			header.innerHTML = `Your GitHub Repositories`;
			el.appendChild(header);

			this.githubService.github.getUser().repos((err: Error, repos: RepositoryInfo[]) => {
				if (err)
					return;
				let list = document.createElement('div');
				dom.addClass(list, 'monaco-tree monaco-tree-rows');
				el.appendChild(list);

				for (var repo of repos) {
					let item = document.createElement('div');
					dom.addClass(item, 'monaco-tree-row');
					list.appendChild(item);
					$(item).bind(repo);

					$(item).on('click', (e, builder: Builder) => {
						let repo = builder.getBinding() as RepositoryInfo;
						openRepository(repo.full_name);
					});

					let anchor = document.createElement('a');
					$(anchor).text(repo.full_name);
					$(anchor).title(repo.description);

					item.appendChild(anchor);
				}
			});

		} else {
			// Encourage the user to sign in.
			// TODO: localization
			el.innerHTML = `<div class='content welcome-text'>Welcome! <a href='https://github.com/spiffcode/ghcode' target='_blank'>GH Code</a> is an
			experimental open source web IDE based on <a href='https://code.visualstudio.com' target='_blank'>Visual Studio Code</a>.<p>
			GH Code provides a fast, rich environment for browsing and editing GitHub repositories. Featuring:
			<ul>
			<li>Syntax highlighting</li>
			<li>IntelliSense for many languages including Javascript, Typescript, ...</li>
			<li>Lots of other cool stuff</li>
			</ul>
			To open GitHub repositories with GH Code sign in to your GitHub account and grant permissions.</div><p>`;

			this.openButton = new Button(el);
			// TODO: localization
			this.openButton.label = 'Sign In';
			this.openButton.on('click', () => {
				this.githubService.authenticate(false);
			});
		}

		return this.container;
	}
}