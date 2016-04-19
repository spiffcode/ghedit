/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// This is a port of vs/workbench/electron-browser/main.ts with Electron and Node dependencies
// removed/replaced.

import winjs = require('vs/base/common/winjs.base');
// TODO: import {WorkbenchShell} from 'vs/workbench/electron-browser/shell';
import {WorkbenchShell} from 'shell';
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
import {ConfigurationService} from 'configurationService';
import {Github, Repository, Error as GithubError} from 'github';
var github = require('github');
import {ninvoke} from 'vs/base/common/async';

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

const timers = (<any>window).MonacoEnvironment.timers;
const domContentLoaded: Function = (<any>winjs).Utilities.ready;

export interface IPath {
	filePath: string;
	lineNumber?: number;
	columnNumber?: number;
}

export interface IMainEnvironment extends IEnvironment {
	workspacePath?: string;
	filesToOpen?: IPath[];
	filesToCreate?: IPath[];
	filesToDiff?: IPath[];
	extensionsToInstall?: string[];
	githubService?: Github;
	userEnv: IEnv;
}

export function startup(environment: IMainEnvironment, globalSettings: IGlobalSettings): winjs.TPromise<void> {

	// Inherit the user environment
// TODO:	assign(process.env, environment.userEnv);

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
	environment.githubService = new github(options);

	// Open workbench
	return getWorkspace(environment).then((workspace: IWorkspace) => {
		return openWorkbench(workspace, shellConfiguration, shellOptions, environment.githubService);
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

function getWorkspace(environment: IMainEnvironment): winjs.TPromise<IWorkspace> {
	if (!environment.workspacePath) {
		return null;
	}

	let realWorkspacePath = path.normalize(fs.realpathSync(environment.workspacePath));
	if (paths.isUNC(realWorkspacePath) && strings.endsWith(realWorkspacePath, paths.nativeSep)) {
		// for some weird reason, node adds a trailing slash to UNC paths
		// we never ever want trailing slashes as our workspace path unless
		// someone opens root ("/").
		// See also https://github.com/nodejs/io.js/issues/1765
		realWorkspacePath = strings.rtrim(realWorkspacePath, paths.nativeSep);
	}

	let workspaceResource = uri.file(realWorkspacePath);
	let folderName = path.basename(realWorkspacePath) || realWorkspacePath;
	
	// Make async call to github to check for folder.
	let repo = environment.githubService.getRepo(environment.workspacePath);
	return new winjs.TPromise<IWorkspace>((c, e) => {
		repo.contents('master', '', (err: GithubError, contents?: any) => {
			err ? e(err) : c(contents);
		});
	}).then((contents: any) => {
		let workspace: IWorkspace = {
			'resource': workspaceResource,
			'id': platform.isLinux ? realWorkspacePath : realWorkspacePath.toLowerCase(),
			'name': folderName,
		// TODO:	'uid': platform.isLinux ? folderStat.ino : folderStat.birthtime.getTime(), // On Linux, birthtime is ctime, so we cannot use it! We use the ino instead!
		// TODO:	'mtime': folderStat.mtime.getTime()
		};
		return workspace;
	}, (error: GithubError) => {
		console.log('unable to repo.contents ' + environment.workspacePath);
	});
}

function openWorkbench(workspace: IWorkspace, configuration: IConfiguration, options: IOptions, githubService: Github): winjs.TPromise<void> {
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
				githubService
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