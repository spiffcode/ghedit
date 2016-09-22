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
import {IGithubService} from 'githubService';
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

		if (!this.githubService.isAuthenticated()) {
			// Encourage the user to sign in.
			// TODO: localization
			el.innerHTML = `<div class='content welcome-text'>Welcome! <a href='https://github.com/spiffcode/ghcode' target='_blank'>GHEdit</a> is an
			experimental open source web IDE based on <a href='https://code.visualstudio.com' target='_blank'>Visual Studio Code</a>.<p>
			GHEdit provides a fast, rich environment for browsing and editing GitHub repositories. Featuring:
			<ul>
			<li>GitHub integration (view and edit repositories and files)</li>
			<li>Complete project navigator and text editor</li>
			<li>Syntax highlighting for all major programming and markup languages</li>
			<li>IntelliSense for Javascript, TypeScript, JSON</li>
			<li>Project-wide search and replace</li>
			<li>Themes</li>
			<li>Side-by-side file comparison</li>
			<li>Customizable Keyboard Shortcuts</li>
			<li>Per-user, per-project customizable editor settings</li>
			<li><a href='https://github.com/spiffcode/ghcode'>Open Source!</a></li>
			</ul>
			Sign in to your GitHub account to open GitHub repositories.</div><p>
			<input id='privateRepos' type='checkbox'>
			<label for='privateRepos'>Include my private repositories (optional)</label>`;

			this.openButton = new Button(el);
			// TODO: localization
			this.openButton.label = 'Sign In';
			this.openButton.addListener2('click', () => {
				let checkbox = <HTMLInputElement>document.getElementById('privateRepos');
				this.githubService.authenticate(checkbox.checked);
			});
		}

		return this.container;
	}
}
