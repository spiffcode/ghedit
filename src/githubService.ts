/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

var github = require('lib/github');
import {Github, UserInfo, Error as GithubError} from 'github';
import {createDecorator, ServiceIdentifier} from 'vs/platform/instantiation/common/instantiation';
import {TPromise} from 'vs/base/common/winjs.base';

export var IGithubService = createDecorator<IGithubService>('githubService');

export interface IGithubService {
	serviceId: ServiceIdentifier<any>;
	github: Github;
	repo: string;
	ref: string;

	hasCredentials(): boolean;
	isAuthenticated(): boolean;
	authenticateUser(): TPromise<UserInfo>;
	getAuthenticatedUserInfo(): UserInfo;
	authenticate();
	openRepository(repo: string, ref?: string): TPromise<any>;
}

export class GithubService implements IGithubService {

	public serviceId = IGithubService;
	public github: Github;
	public repo: string;
	public ref: string;

	private options: any;
	private authenticatedUserInfo: any;
	private repoInfo: any;

	constructor(options?: any) {
		this.options = options;
		this.github = new github(options);
	}

	public hasCredentials(): boolean {
		return (this.options.username && this.options.password) || this.options.token;
	}

	public isAuthenticated(): boolean {
		return !!this.authenticatedUserInfo;
	}

	public authenticateUser(): TPromise<UserInfo> {
		if (!this.hasCredentials()) {
			return TPromise.wrapError<UserInfo>('authenticateUser requires user credentials');
		}
		return new TPromise<UserInfo>((complete, error) => {
			this.github.getUser().show(null, (err: GithubError, info?: UserInfo) => {
				if (err) {
					error(err);
				} else {
					this.authenticatedUserInfo = info;
					complete(info);
				}
			});
		});
	}

	public getAuthenticatedUserInfo(): UserInfo {
		return this.authenticatedUserInfo;
	}

	public authenticate() {
		// If we're running on localhost authorize via the "GH Code localhost" application
		// so we're redirected back to localhost (instead of spiffcode.github.io/ghcode) after
		// the authorization is done.
		let client_id = window.location.hostname == 'localhost' ? '60d6dd04487a8ef4b699' : 'bbc4f9370abd2b860a36';
		window.location.href = 'https://github.com/login/oauth/authorize?client_id=' + client_id + '&scope=user repo gist';
	}

	public openRepository(repoName: string, ref?: string): TPromise<any> {
		this.repo = repoName;
		this.ref = ref;

		let repo = this.github.getRepo(this.repo);
		return new TPromise<any>((complete, error) => {
			repo.show((err: GithubError, info?: any) => {
				if (err) {
					error(err);
				} else {
					this.repoInfo = info;
					complete(info);
				}
			});
		});
	}
}
