/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

var github = require('lib/github');
import {Github, Repository, UserInfo, Error as GithubError} from 'github';
import {createDecorator, ServiceIdentifier} from 'vs/platform/instantiation/common/instantiation';
import {TPromise} from 'vs/base/common/winjs.base';
import {GithubTreeCache, IGithubTreeCache} from 'githubTreeCache';

export var IGithubService = createDecorator<IGithubService>('githubService');

export interface IGithubService {
	serviceId: ServiceIdentifier<any>;
	github: Github;
	repo: Repository;
	repoName: string;
	ref: string;

	isFork(): boolean;
	isDefaultBranch(): boolean;
	getDefaultBranch(): string;
	getCache(): IGithubTreeCache;
	hasCredentials(): boolean;
	isAuthenticated(): boolean;
	authenticateUser(): TPromise<UserInfo>;
	getAuthenticatedUserInfo(): UserInfo;
	authenticate(privateRepos: boolean);
	openRepository(repo: string, ref?: string): TPromise<any>;
}

export class GithubService implements IGithubService {

	public serviceId = IGithubService;
	public github: Github;
	public repo: Repository;
	public repoName: string;
	public ref: string;

	private options: any;
	private authenticatedUserInfo: any;
	private repoInfo: any;
	private cache: GithubTreeCache;

	constructor(options?: any) {
		this.options = options;
		this.github = new github(options);
	}

	public isFork(): boolean {
		return 'parent' in this.repoInfo;
	}

	public isDefaultBranch(): boolean {
		return this.ref === this.repoInfo.default_branch;
	}

	public getDefaultBranch(): string {
		return this.repoInfo.default_branch;
	}

	public getCache(): IGithubTreeCache {
		return this.cache;
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

	public authenticate(privateRepos: boolean) {
		// If we're running on localhost authorize via the "GH Code localhost" application
		// so we're redirected back to localhost (instead of spiffcode.github.io/ghcode) after
		// the authorization is done.
		let client_id = (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') ? '60d6dd04487a8ef4b699' : 'bbc4f9370abd2b860a36';
		let repoScope = privateRepos ? 'repo' : 'public_repo';
		window.location.href = 'https://github.com/login/oauth/authorize?client_id=' + client_id + '&scope=' + repoScope + ' gist';
	}

	public openRepository(repoName: string, ref?: string): TPromise<any> {
		this.repoName = repoName;
		this.ref = ref;
		this.repo = this.github.getRepo(this.repoName);

		return new TPromise<any>((complete, error) => {
			this.repo.show((err: GithubError, info?: any) => {
				if (err) {
					error(err);
				} else {
					this.repoInfo = info;

					// Don't support symlinks until githubFileService can load symlinked paths
					this.cache = new GithubTreeCache(this, false);
					complete(info);
				}
			});
		});
	}
}

export function openRepository(repo: string, ref?: string) {
	let selfURL = window.location.origin + window.location.pathname;
	window.location.href = selfURL + '?repo=' + repo + (ref ? '&ref=' + ref : '');
}
