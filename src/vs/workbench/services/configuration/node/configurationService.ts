/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import {TPromise} from 'vs/base/common/winjs.base';
import uri from 'vs/base/common/uri';
// TODO: import strings = require('vs/base/common/strings');
// TODO: import platform = require('vs/base/common/platform');
// TODO: import paths = require('vs/base/common/paths');
// TODO: import extfs = require('vs/base/node/extfs');
import {IConfigFile} from 'vs/platform/configuration/common/model';
import objects = require('vs/base/common/objects');
import {IStat, IContent, ConfigurationService as CommonConfigurationService} from 'vs/platform/configuration/common/configurationService';
import {IWorkspaceContextService} from 'vs/workbench/services/workspace/common/contextService';
import {OptionsChangeEvent, EventType} from 'vs/workbench/common/events';
import {IEventService} from 'vs/platform/event/common/event';
import {IDisposable} from 'vs/base/common/lifecycle';
// TODO: import {readFile, writeFile} from 'vs/base/node/pfs';
import {JSONPath} from 'vs/base/common/json';
import {applyEdits} from 'vs/base/common/jsonFormatter';
import {setProperty} from 'vs/base/common/jsonEdit';
// TODO: import fs = require('fs');
import {IGithubService} from 'ghedit/githubService';
import {IGithubTreeCache, IGithubTreeStat} from 'ghedit/githubTreeCache';
import {Github, Repository, Error as GithubError} from 'github';
import paths = require('vs/base/common/paths');
import baseMime = require('vs/base/common/mime');

export class ConfigurationService extends CommonConfigurationService {

	public _serviceBrand: any;

	protected contextService: IWorkspaceContextService;
	private githubService: IGithubService;
	private cache: IGithubTreeCache;
	private toDispose: IDisposable;

	constructor(contextService: IWorkspaceContextService, eventService: IEventService, githubService: IGithubService) {
		super(contextService, eventService);

		this.githubService = githubService;
		this.cache = this.githubService.getCache();
		this.registerListeners();

		this.eventService.addListener2("settingsFileChanged", () => {
			this.loadConfiguration().then(() => this.handleConfigurationChange());
		});
	}

	protected registerListeners(): void {
		super.registerListeners();

		this.toDispose = this.eventService.addListener2(EventType.WORKBENCH_OPTIONS_CHANGED, (e) => this.onOptionsChanged(e));
	}

	private onOptionsChanged(e: OptionsChangeEvent): void {
		if (e.key === 'globalSettings') {
			this.handleConfigurationChange();
		}
	}

	protected resolveContents(resources: uri[]): TPromise<IContent[]> {
		let contents: IContent[] = [];

		return TPromise.join(resources.map((resource) => {
			return this.resolveContent(resource).then((content) => {
				contents.push(content);
			});
		})).then(() => contents);
	}

	protected resolveContent(resource: uri): TPromise<IContent> {
		return new TPromise<IContent>((c, e) => {
			this.cache.stat(resource.fsPath, (error: any, stat?: IGithubTreeStat) => {
				if (error) {
					e('Error loading ' + resource.fsPath);
					return;
				}
				this.githubService.repo.getBlobRaw(stat.sha, (err: GithubError, content: string | boolean) => {
					if (!err) {
						// The GitHub API wrapper we uses returns the boolean true for content when there is none!!
						c({ resource: resource, value: (content == true ? '' : <string>content) });
					} else {
						e('Error loading ' + resource.fsPath);
					}
				});
			});
		});
	}

	protected resolveStat(resource: uri): TPromise<IStat> {
		return new TPromise<IStat>((c, e) => {
			this.cache.readdir(resource.fsPath, (error, children) => {
				if (error) {
					if ((<any>error).code === 'ENOTDIR') {
						c({
							resource: resource,
							isDirectory: false
						});
					} else {
						e(error);
					}
				} else {
					c({
						resource: resource,
						isDirectory: true,
						children: children.map((child) => {
/*
							if (platform.isMacintosh) {
								child = strings.normalizeNFC(child); // Mac: uses NFD unicode form on disk, but we want NFC
							}
*/
							return {
								resource: uri.file(paths.join(resource.fsPath, child))
							};
						})
					});
				}
			});
		});
	}

	protected loadWorkspaceConfiguration(section?: string): TPromise<{ [relativeWorkspacePath: string]: IConfigFile }> {

		// Return early if we don't have a workspace
		if (!this.contextService.getWorkspace()) {
			return TPromise.as({});
		}

		return super.loadWorkspaceConfiguration(section);
	}

	protected loadGlobalConfiguration(): { contents: any; parseErrors?: string[]; } {
		const defaults = super.loadGlobalConfiguration();
		const globalSettings = this.contextService.getOptions().globalSettings;

		return {
			contents: objects.mixin(
				objects.clone(defaults.contents),	// target: default values (but don't modify!)
				globalSettings.settings,			// source: global configured values
				true								// overwrite
			),
			parseErrors: globalSettings.settingsParseErrors
		};
	}

	public setUserConfiguration(key: any, value: any) : Thenable<void> {
		console.log('configurationService.setUserConfiguration readFile(\"' + this.contextService.getConfiguration().env.appSettingsPath + '\") unimplemented');
		return TPromise.as(null);

		/* TODO:
		let appSettingsPath = this.contextService.getConfiguration().env.appSettingsPath;
		return readFile(appSettingsPath, 'utf8').then(content => {
			let {tabSize, insertSpaces} = this.getConfiguration<{ tabSize: number; insertSpaces: boolean }>('editor');
			let path: JSONPath = typeof key === 'string' ? (<string> key).split('.') : <JSONPath> key;
			let edits = setProperty(content, path, value, {insertSpaces, tabSize, eol: '\n'});
			content = applyEdits(content, edits);
			return writeFile(appSettingsPath, content, 'utf8');
		});
		*/
	}

	public dispose(): void {
		super.dispose();

		this.toDispose.dispose();
	}
}
