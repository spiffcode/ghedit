/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import nls = require('vs/nls');
import scorer = require('vs/base/common/scorer');
import {TPromise} from 'vs/base/common/winjs.base';
import {RepositoryInfo, TagInfo, Error} from 'github';
import {QuickOpenHandler} from 'vs/workbench/browser/quickopen';
import {Mode, IEntryRunContext, IAutoFocus, IModel, IQuickNavigateConfiguration} from 'vs/base/parts/quickopen/common/quickOpen';
import {QuickOpenEntry, IContext, IHighlight, QuickOpenEntryGroup, QuickOpenModel} from 'vs/base/parts/quickopen/browser/quickOpenModel';
import {IQuickOpenService} from 'vs/workbench/services/quickopen/common/quickOpenService';
import {IGithubService, openRepository} from 'githubService'; 
import {ITree, IElementCallback} from 'vs/base/parts/tree/browser/tree';
import {Builder, $} from 'vs/base/browser/builder';
import {IWorkspaceContextService} from 'vs/workbench/services/workspace/common/contextService';
import {IMainEnvironment} from 'vs/workbench/electron-browser/main';
import {Limiter} from 'vs/base/common/async';
import {IMessageService, Severity} from 'vs/platform/message/common/message';

enum Group {
	Typing, Recent, User, Org, Other
}

class Info {
	login: string;
	name: string;	
	full_name: string;
	description: string;
	duplicate: boolean;
	group: Group;
	validated: boolean;
}

class RepoQuickOpenEntry extends QuickOpenEntryGroup {
	constructor(public info: Info, private contextService: IWorkspaceContextService, private githubService: IGithubService, private messageService:IMessageService) {		
		super();
	}

	public getHeight(): number {
		return 24;
	}

	public getLabel(): string {
		return this.info.full_name;
	}

	public getAriaLabel(): string {
		return nls.localize('entryAriaLabel', "{0}, repository picker", this.getLabel());
	}

	public getDescription(): string {
		return this.info.description || ' ';
	}

	private openRepo(): void {
		if (this.info.full_name !== this.githubService.repoName)
			openRepository(this.info.full_name, <IMainEnvironment>this.contextService.getConfiguration().env);
	}

	public updateFullName(fullName: string) {
		this.info.full_name = fullName;		
		try {
			this.info.login = fullName.split('/')[0];
			this.info.name = fullName.split('/')[1];
		} catch (error) {
			this.info.login = '';
			this.info.name = '';			
		}
	}

	public run(mode: Mode, context: IContext): boolean {
		if (mode === Mode.PREVIEW) {
			return false;
		}

		// If validated already, open the repo now 
		if (this.info.validated) {
			this.openRepo();
			return true;
		}

		// Not validated yet. Check if the user has entered a fully formed name.
		if (!this.info.login || !this.info.name) {
			return false;
		}

		// Ask github if it is valid before loading. If not, show a message.
		let repo = this.githubService.github.getRepo(this.info.login, this.info.name);
		repo.show((err: Error, info: RepositoryInfo) => {
			if (!err) {
				this.openRepo();
			} else {
				this.messageService.show(Severity.Error, 'Error opening repository ' + this.info.full_name);
			}
		});

		return true;
	}
}

export class OpenRepoHandler extends QuickOpenHandler {

	private model: QuickOpenModel;

	constructor(
		@IGithubService private githubService: IGithubService,
		@IWorkspaceContextService private contextService: IWorkspaceContextService,
		@IMessageService private messageService: IMessageService
	) {
		super();
	}

	private getInfoFromRepoInfo(info: RepositoryInfo): Info {
		let group: Group;		
		if (info.owner.type === 'User' && info.owner.login === this.githubService.getAuthenticatedUserInfo().login) {
			group = Group.User;
		} else if (info.owner.type === 'Organization') {
			group = Group.Org;
		} else {
			group = Group.Other;
		}

		return {
			login: info.owner.login,
			name: info.name,
			full_name: info.full_name,
			description: info.description || '',
			duplicate: false,
			group: group,
			validated: true
		};
	}

	private getRecentInfos(infos: Info[]): TPromise<Info[]> {
		// Create recent infos. Parse recent repos.
		let limiter = new Limiter(1);
		let promises: TPromise<void>[] = [];
		let infosRecent: Info[] = [];
		let fullNames = infos.map(info => info.full_name);
		this.githubService.getRecentRepos().forEach(name => {
			// If the info is already present, duplicate it as a recent entry.
			// These are visible before the user types anything but are hidden
			// right after.
			let index = fullNames.indexOf(name);
			if (index >= 0) {
				let copy = (<Info>{});
				Object.keys(infos[index]).forEach(key => copy[key] = infos[index][key]);
				copy.group = Group.Recent;
				copy.duplicate = true;
				infosRecent.push(copy);
				return;
			}

			// This repo isn't in the infos we have; try to load it.
			// This is in an exception handler in case name is garbage, since
			// it was loaded from local storage.
			let parts: string[];			
			try {
				parts = name.split('/');
			} catch (error) {
				parts = [];
			}
			if (parts.length != 2)
				return;

			// Make a reasonable default info
			infosRecent.push({
				login: parts[0],
				name: parts[1],
				full_name: name,
				description: '',
				group: Group.Recent,
				duplicate: false,
				validated: false
			});
			let indexPushed = infosRecent.length - 1;

			// Get info on this repository and update the description
			promises.push(limiter.queue(() => new TPromise<void>((c, e) => {
				let repo = this.githubService.github.getRepo(parts[0], parts[1]);
				repo.show((err: Error, info: RepositoryInfo) => {
					if (!err) {
						infosRecent[indexPushed].description = info.description || '';
						infosRecent[indexPushed].validated = true;
					}
					c(null);
				});
			})));
		});

		return TPromise.join(promises).then(() => {
			return infosRecent;
		});
	}

	private getModel(): TPromise<QuickOpenModel> {
		return new TPromise<QuickOpenModel>((c, e) => {
			if (this.model) {
				c(this.model);
				return;
			}

			this.githubService.github.getUser().repos({ per_page: 1000 }, (err: Error, repositoryInfos: RepositoryInfo[]) => {
				if (err) {
					e(err);
					return;
				}

				// Make an stand-in info for what is being typed
				let infoTyped: Info = {
					login: '',
					name: '',
					full_name: '',
					description: '',
					duplicate: false,
					group: Group.Typing,
					validated: false
				}

				// Return a model from sorted repo infos
				let infos = repositoryInfos.map(info => this.getInfoFromRepoInfo(info));
				this.getRecentInfos(infos).then((infosRecent) => {
					// Sort regular infos. infoTyped and infosRecent aren't sorted on purpose.
					let infosSorted = infos.sort((a, b) => {
						let n = a.group - b.group;
						if (n != 0)
							return n;
						n = a.login.toLowerCase().localeCompare(b.login.toLowerCase());
						if (n != 0)
							return n;
						return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
					});

					// Create a model from all these infos.
					this.model = new QuickOpenModel([...[infoTyped], ...infosRecent, ...infosSorted].map(info => new RepoQuickOpenEntry(info, this.contextService, this.githubService, this.messageService)));
					c(this.model);
				});
			});
		});
	}

	public getResults(searchValue: string): TPromise<IModel<any>> {
		return new TPromise<QuickOpenModel>((c, e) => {
			this.getModel().then((model: QuickOpenModel) => {
				// Add in the repos associated with this user
				let entries: RepoQuickOpenEntry[] = <RepoQuickOpenEntry[]>model.getEntries();				

				// Fuzzy match and filter. Just hide/show entries
				let indexLastVisible = -1;
				entries.forEach((e, index) => {
					// Don't show the Typing entry unless there is something unique to show
					if (index === 0) {
						if (!searchValue || entries.map(entry => entry.info.full_name).indexOf(searchValue) >= 1) {
							e.setHidden(true);
							return;
						} else {
							e.updateFullName(searchValue);
						}
					}

					// Only hide regular entries if there is a searchValue
					if (searchValue) { 
						// Some items are duplicates so they can appear in Recents before the user types anything
						if (searchValue && e.info.duplicate) {
							e.setHidden(true);
							return;
						}
						if (!scorer.matches(e.getLabel(), searchValue.toLowerCase())) {
							e.setHidden(true);
							return;
						}
					}

					// Set visible and calc highlights.
					e.setHidden(false);
					if (searchValue) {
						const {labelHighlights, descriptionHighlights} = QuickOpenEntry.highlight(e, searchValue, true);
						e.setHighlights(labelHighlights, descriptionHighlights);						
					} else {
						e.setHighlights([], []);
					}

					// Set group labels and borders
					if (indexLastVisible < 0 || entries[indexLastVisible].info.group != e.info.group) {
						e.setGroupLabel(Group[e.info.group]);
						e.setShowBorder(indexLastVisible >= 0);
					} else {
						e.setGroupLabel('');
						e.setShowBorder(false);
					}

					// Remember this as the last visible entry
					indexLastVisible = index;
				});
				c(model);
			}, (err) => e(err));
		});
	}

	public getGroupLabel(): string {
		return nls.localize('repositories', 'repositories');
	}

	public getAutoFocus(searchValue: string): IAutoFocus {
		return {
			autoFocusFirstEntry: true
		};
	}	
}
