/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

var github = require('ghedit/lib/github');
import {Github, Repository, UserInfo, Error as GithubError} from 'github';
import {createDecorator, ServiceIdentifier} from 'vs/platform/instantiation/common/instantiation';
import {TPromise} from 'vs/base/common/winjs.base';
import {GithubTreeCache, IGithubTreeCache} from 'ghedit/githubTreeCache';
import {IMainEnvironment} from 'vs/workbench/electron-browser/main';

const RECENT_REPOS_COUNT = 4;

export var IGithubService = createDecorator<IGithubService>('githubService');

export interface IGithubService {
	_serviceBrand: any;

	github: Github;
	repo: Repository;
	repoName: string;
	ref: string;
	isTag: boolean;

	isFork(): boolean;
	isDefaultBranch(): boolean;
	getDefaultBranch(): string;
	getCache(): IGithubTreeCache;
	hasCredentials(): boolean;
	isAuthenticated(): boolean;
	authenticateUser(): TPromise<UserInfo>;
	getAuthenticatedUserInfo(): UserInfo;
	authenticate(privateRepos: boolean);
	openRepository(repo: string, ref?: string, isTag?: boolean): TPromise<any>;
	getRecentRepos(): string[];
	signOut(): void;
}

export class GithubService implements IGithubService {
	public _serviceBrand: any;

	public serviceId = IGithubService;
	public github: Github;
	public repo: Repository;
	public repoName: string;
	public ref: string;
	public isTag: boolean;

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
		return !this.isTag && this.ref === this.repoInfo.default_branch;
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
		(<any>window).sendGa('/requesting/' + (privateRepos ? 'private' : 'public'), () => {
			// If we're running on localhost authorize via the "GHEdit localhost" application
			// so we're redirected back to localhost (instead of spiffcode.github.io/ghedit) after
			// the authorization is done.
			let client_id = (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') ? '60d6dd04487a8ef4b699' : 'bbc4f9370abd2b860a36';
			let repoScope = privateRepos ? 'repo' : 'public_repo';
			window.location.href = 'https://github.com/login/oauth/authorize?client_id=' + client_id + '&scope=' + repoScope + ' gist';
		});
	}

	public openRepository(repoName: string, ref?: string, isTag?: boolean): TPromise<any> {
		this.repoName = repoName;
		this.ref = ref;
		this.isTag = isTag;
		this.repo = this.github.getRepo(this.repoName);

		return new TPromise<any>((complete, error) => {
			this.repo.show((err: GithubError, info?: any) => {
				if (err) {
					error(err);
				} else {
					this.addRecentRepo(this.repoName);
					this.repoInfo = info;

					// Don't support symlinks until githubFileService can load symlinked paths
					this.cache = new GithubTreeCache(this, false);
					complete(info);
				}
			});
		});
	}

	private addRecentRepo(repoName: string) {
		// Add repoName first
		let recentRepos = this.getRecentRepos().filter(repo => repo !== repoName);
		recentRepos.splice(0, 0, repoName);

		// Cap the list to RECENT_REPOS_COUNT entries
		recentRepos.slice(0, RECENT_REPOS_COUNT);

		// Save it out
		try {
			let s = JSON.stringify(recentRepos);
			window.sessionStorage.setItem('githubRecentRepos', s);
			window.localStorage.setItem('lastGithubRecentRepos', s);
		} catch (error) {
			// Safari raises Quota Exceeded exception in Private Browsing mode.
		}
	}

	public getRecentRepos(): string[] {
		// Grab the recent repos
		let recentReposJson = window.sessionStorage.getItem('githubRecentRepos');
		if (!recentReposJson) {
			recentReposJson = window.localStorage.getItem('lastGithubRecentRepos');
		}

		try {
			let recentRepos = JSON.parse(recentReposJson);
			if (!Array.isArray(recentRepos))
				return [];
			return recentRepos.filter((name => typeof name === 'string' && name.split('/').length === 2)).slice(0, RECENT_REPOS_COUNT);
		} catch (error) {
			return [];
		}
	}

	public signOut() {
		var d = new Date();
		d.setTime(d.getTime() - 1000);
		document.cookie = 'githubToken=;expires=' + d.toUTCString();
		window.localStorage.removeItem('githubToken');
		window.localStorage.removeItem('githubUser');
		window.localStorage.removeItem('githubPassword');
		window.localStorage.removeItem('lastGithubRepo');
		window.localStorage.removeItem('lastGithubRecentRepos');
		window.localStorage.removeItem('lastGithubBranch');
		window.localStorage.removeItem('lastGithubTag');
		window.sessionStorage.removeItem('githubRepo');
		window.sessionStorage.removeItem('githubRecentRepos');
		window.sessionStorage.removeItem('githubBranch');
		window.sessionStorage.removeItem('githubTag');

		// Refresh to the page to fully present the signed out state.
		location.href = location.origin + location.pathname;
	}
}

export function openRepository(repo: string, env: IMainEnvironment, ref?: string, isTag?: boolean) {
	let url = window.location.origin + window.location.pathname + '?repo=' + repo;
	if (ref) {
		url += (isTag ? '&tag=' : '&branch=') + ref;
	}
	if (env.buildType) {
		url += '&b=' + env.buildType;
	}
	window.location.href = url;
}
