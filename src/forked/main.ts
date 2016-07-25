/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// Forked from c212f0908f3d29933317bbc3233568fbca7944b1:./vs/workbench/electron-browser/main.ts
// This is a port of vs/workbench/electron-browser/main.ts with Electron and Node dependencies
// removed/replaced.

import winjs = require('vs/base/common/winjs.base');
// TODO: import {WorkbenchShell} from 'vs/workbench/electron-browser/shell';
import {WorkbenchShell} from 'forked/shell';
import {IOptions, IGlobalSettings} from 'vs/workbench/common/options';
import errors = require('vs/base/common/errors');
import platform = require('vs/base/common/platform');
import paths = require('vs/base/common/paths');
import timer = require('vs/base/common/timer');
// TODO: import {assign} from 'vs/base/common/objects';
import uri from 'vs/base/common/uri';
import strings = require('vs/base/common/strings');
import {IResourceInput} from 'vs/platform/editor/common/editor';
// TODO: import {IEnv} from 'vs/base/node/env';
export interface IEnv {
	[key: string]: string;
}
import {EventService} from 'vs/platform/event/common/eventService';
import {WorkspaceContextService} from 'vs/workbench/services/workspace/common/contextService';
import {IWorkspace, IConfiguration, IEnvironment} from 'vs/platform/workspace/common/workspace';
import {ConfigurationService} from 'forked/configurationService';
import {Github, Repository, Error as GithubError, UserInfo} from 'github';
import {GithubService, IGithubService} from 'githubService';

// TODO: import path = require('path');
var path = {
	normalize: function (_path) {
		console.log('path.normalize(\'' + _path + '\')');
		return _path;
	},
	basename: function (_path) {
		console.log('path.basename(\'' + _path + '\')');
		return _path;
	}
};

// TODO: import fs = require('fs');
var fs = {
	realpathSync: function (_path) {
		console.log('fs.realpathSync(\'' + _path + '\')');
		return _path;
	}
};

// TODO: import gracefulFs = require('graceful-fs');
// TODO: gracefulFs.gracefulify(fs);

const timers = (<any>window).GlobalEnvironment.timers;
const domContentLoaded: Function = (<any>winjs).Utilities.ready;

export interface IPath {
	filePath: string;
	lineNumber?: number;
	columnNumber?: number;
}

// TODO: Perhaps move these into IEnvironment? Then accessing them would be easier from IConfiguration.
export interface IMainEnvironment extends IEnvironment {
	workspacePath?: string;
	filesToOpen?: IPath[];
	filesToCreate?: IPath[];
	filesToDiff?: IPath[];
	extensionsToInstall?: string[];
	github?: Github;
	userEnv: IEnv;
	githubRef?: string;
	githubRepo?: string;
	gistRegEx?: RegExp;
}

export function startup(environment: IMainEnvironment, globalSettings: IGlobalSettings): winjs.TPromise<void> {

	// Inherit the user environment
    /* TODO:
	// TODO@Joao: this inheritance should **not** happen here!
	if (process.env['VSCODE_CLI'] !== '1') {
		assign(process.env, environment.userEnv);
	}
    */

	// Shell Configuration
	let shellConfiguration: IConfiguration = {
		env: environment
	};


	// Shell Options
	let filesToOpen = environment.filesToOpen && environment.filesToOpen.length ? toInputs(environment.filesToOpen) : null;
	let filesToCreate = environment.filesToCreate && environment.filesToCreate.length ? toInputs(environment.filesToCreate) : null;
	let filesToDiff = environment.filesToDiff && environment.filesToDiff.length ? toInputs(environment.filesToDiff) : null;
	let shellOptions: IOptions = {
		singleFileMode: !environment.workspacePath,
		filesToOpen: filesToOpen,
		filesToCreate: filesToCreate,
		filesToDiff: filesToDiff,
		extensionsToInstall: environment.extensionsToInstall,
		globalSettings: globalSettings
	};

	if (environment.enablePerformance) {
		timer.ENABLE_TIMER = true;
	}

	var options = {};
	if (environment.userEnv['githubToken']) {
		options['token'] = environment.userEnv['githubToken'];
	} else if (environment.userEnv['githubUsername'] && environment.userEnv['githubPassword']) {
		options['username'] = environment.userEnv['githubUsername'];
		options['password'] = environment.userEnv['githubPassword'];
	}
	let githubService = new GithubService(options);

	// TODO: indeterminate progress indicator
	return githubService.authenticateUser().then((userInfo: UserInfo) => {
		if (!environment.githubRepo)
			// Open workbench without a workspace.
			return openWorkbench(null, shellConfiguration, shellOptions, githubService);

		return githubService.openRepository(environment.githubRepo, environment.githubRef).then((repoInfo: any) => {
			let workspace = getWorkspace(environment, repoInfo);
			return openWorkbench(workspace, shellConfiguration, shellOptions, githubService);
		}, (err: Error) => {
			// TODO: Welcome experience and/or error message (invalid repo, permissions, ...)
			// Open workbench without a workspace.
			return openWorkbench(null, shellConfiguration, shellOptions, githubService);
		});
	}, (err: Error) => {
		// No user credentials or otherwise unable to authenticate them.
		// TODO: Welcome experience and/or error message (bad credentials, ...)
		// Open workbench without a workspace.
		return openWorkbench(null, shellConfiguration, shellOptions, githubService);
	});
}

function toInputs(paths: IPath[]): IResourceInput[] {
	return paths.map(p => {
		let input = <IResourceInput>{
			resource: uri.file(p.filePath)
		};

		if (p.lineNumber) {
			input.options = {
				selection: {
					startLineNumber: p.lineNumber,
					startColumn: p.columnNumber
				}
			};
		}

		return input;
	});
}

function getWorkspace(environment: IMainEnvironment, repoInfo: any): IWorkspace {
	if (!environment.workspacePath) {
		return null;
	}

	let workspaceResource = uri.file(environment.workspacePath);

	let workspace: IWorkspace = {
		'resource': workspaceResource,
		'id': environment.githubRepo,
		'name': environment.githubRepo.split('/')[1], // Repository name minus the user name.
		'uid': Date.parse(repoInfo.created_at),
		'mtime': Date.parse(repoInfo.updated_at),
	};
	return workspace;
}

function openWorkbench(workspace: IWorkspace, configuration: IConfiguration, options: IOptions, githubService: IGithubService): winjs.TPromise<void> {
	let eventService = new EventService();
	let contextService = new WorkspaceContextService(eventService, workspace, configuration, options);
	let configurationService = new ConfigurationService(contextService, eventService);

	// Since the configuration service is one of the core services that is used in so many places, we initialize it
	// right before startup of the workbench shell to have its data ready for consumers
	return configurationService.initialize().then(() => {
		timers.beforeReady = new Date();

		return domContentLoaded(() => {
			timers.afterReady = new Date();

			// Open Shell
			let beforeOpen = new Date();
			let shell = new WorkbenchShell(document.body, workspace, {
				configurationService,
				eventService,
				contextService,
				githubService,
			}, configuration, options);
			shell.open();

			shell.joinCreation().then(() => {
				timer.start(timer.Topic.STARTUP, 'Open Shell, Viewlet & Editor', beforeOpen, 'Workbench has opened after this event with viewlet and editor restored').stop();
			});

			// Inform user about loading issues from the loader
			(<any>self).require.config({
				onError: (err: any) => {
					if (err.errorCode === 'load') {
						shell.onUnexpectedError(errors.loaderError(err));
					}
				}
			});
		}, true);
	});
}