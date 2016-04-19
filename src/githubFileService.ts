/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// This is a port of vs/workbench/services/files/node/fileService.ts with Node dependencies
// removed/replaced.

// TODO: import paths = require('path');
// TODO: import fs = require('fs');
// TODO: import os = require('os');
// TODO: import crypto = require('crypto');
// TODO: import assert = require('assert');

import files = require('vs/platform/files/common/files');
import strings = require('vs/base/common/strings');
import arrays = require('vs/base/common/arrays');
import baseMime = require('vs/base/common/mime');
import paths = require('vs/base/common/paths');
import {TPromise} from 'vs/base/common/winjs.base';
import types = require('vs/base/common/types');
import objects = require('vs/base/common/objects');
// TODO: import extfs = require('vs/base/node/extfs');
import {nfcall, Limiter, ThrottledDelayer} from 'vs/base/common/async';
import uri from 'vs/base/common/uri';
import nls = require('vs/nls');

// TODO: import pfs = require('vs/base/node/pfs');
// TODO: import encoding = require('vs/base/node/encoding');
// TODO: import mime = require('vs/base/node/mime');
// TODO: import flow = require('vs/base/node/flow');
// TODO: import {FileWatcher as UnixWatcherService} from 'vs/workbench/services/files/node/watcher/unix/watcherService';
// TODO: import {FileWatcher as WindowsWatcherService} from 'vs/workbench/services/files/node/watcher/win32/watcherService';
// TODO: import {toFileChangesEvent, normalize, IRawFileChange} from 'vs/workbench/services/files/node/watcher/common';
import {IEventService} from 'vs/platform/event/common/event';
import {Github, Repository, Error as GithubError} from 'github';

// TODO: Use vs/base/node/encoding replacement.
const encoding = {
	UTF8: 'utf8',
	UTF8_with_bom: 'utf8bom'
};

export interface IEncodingOverride {
	resource: uri;
	encoding: string;
}

export interface IFileServiceOptions {
	tmpDir?: string;
	errorLogger?: (msg: string) => void;
	encoding?: string;
	bom?: string;
	encodingOverride?: IEncodingOverride[];
	watcherIgnoredPatterns?: string[];
	disableWatcher?: boolean;
	verboseLogging?: boolean;
}

/* TODO:
function etag(stat: fs.Stats): string;
function etag(size: number, mtime: number): string;
function etag(arg1: any, arg2?: any): string {
	let size: number;
	let mtime: number;
	if (typeof arg2 === 'number') {
		size = arg1;
		mtime = arg2;
	} else {
		size = (<fs.Stats>arg1).size;
		mtime = (<fs.Stats>arg1).mtime.getTime();
	}

	return '"' + crypto.createHash('sha1').update(String(size) + String(mtime)).digest('hex') + '"';
}
*/
function etag(size: number, mtime: number): string;
function etag(arg1: any, arg2?: any): string {
	let size: number;
	let mtime: number;
	if (typeof arg2 === 'number') {
		size = arg1;
		mtime = arg2;
	} else {
		throw new Error('etag(fs.Stat) not implemented');
//		size = (<fs.Stats>arg1).size;
//		mtime = (<fs.Stats>arg1).mtime.getTime();
	}
	// TODO: non-Node crypto
	return '"' + String(size) + String(mtime) + '"';
}

export class FileService implements files.IFileService {

	public serviceId = files.IFileService;

	private static FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
	private static MAX_DEGREE_OF_PARALLEL_FS_OPS = 10; // degree of parallel fs calls that we accept at the same time

	private basePath: string;
	private tmpPath: string;
	private options: IFileServiceOptions;

	private workspaceWatcherToDispose: () => void;

	// TODO: private activeFileChangesWatchers: { [resource: string]: fs.FSWatcher; };
	private fileChangesWatchDelayer: ThrottledDelayer<void>;
	// TODO: private undeliveredRawFileChangesEvents: IRawFileChange[];

	constructor(basePath: string, options: IFileServiceOptions, private eventEmitter: IEventService, private githubService: Github) {
		this.basePath = basePath ? paths.normalize(basePath) : void 0;

		this.options = options || Object.create(null);
		/* TODO:
		this.tmpPath = this.options.tmpDir || os.tmpdir();

		if (this.options && !this.options.errorLogger) {
			this.options.errorLogger = console.error;
		}

		if (this.basePath && !this.options.disableWatcher) {
			if (process.platform === 'win32') {
				this.setupWin32WorkspaceWatching();
			} else {
				this.setupUnixWorkspaceWatching();
			}
		}

		this.activeFileChangesWatchers = Object.create(null);
		this.fileChangesWatchDelayer = new ThrottledDelayer<void>(FileService.FS_EVENT_DELAY);
		this.undeliveredRawFileChangesEvents = [];
		*/
	}

	public updateOptions(options: IFileServiceOptions): void {
		if (options) {
			objects.mixin(this.options, options); // overwrite current options
		}
	}

	private setupWin32WorkspaceWatching(): void {
		/* TODO:
		this.workspaceWatcherToDispose = new WindowsWatcherService(this.basePath, this.options.watcherIgnoredPatterns, this.eventEmitter, this.options.errorLogger, this.options.verboseLogging).startWatching();
		*/
	}

	private setupUnixWorkspaceWatching(): void {
		/* TODO:
		this.workspaceWatcherToDispose = new UnixWatcherService(this.basePath, this.options.watcherIgnoredPatterns, this.eventEmitter, this.options.errorLogger, this.options.verboseLogging).startWatching();
		*/
	}

	public resolveFile(resource: uri, options?: files.IResolveFileOptions): TPromise<files.IFileStat> {
		return this.resolve(resource, options);
	}

	public resolveContent(resource: uri, options?: files.IResolveContentOptions): TPromise<files.IContent> {
		let preferredEncoding: string;
		if (options && options.encoding) {
			preferredEncoding = options.encoding; // give passed in encoding highest priority
		} else if (this.options.encoding === encoding.UTF8_with_bom) {
			preferredEncoding = encoding.UTF8; // if we did not detect UTF 8 BOM before, this can only be UTF 8 then
		}
		return this.resolveFileContent(resource, options && options.etag, preferredEncoding).then((content) => {

			// set our knowledge about the mime on the content obj
// TODO:			content.mime = detected.mimes.join(', ');

			return content;
		});

		/* TODO:
		let absolutePath = this.toAbsolutePath(resource);
		
		// 1.) detect mimes
		return nfcall(mime.detectMimesFromFile, absolutePath).then((detected: mime.IMimeAndEncoding) => {
			let isText = detected.mimes.indexOf(baseMime.MIME_BINARY) === -1;

			// Return error early if client only accepts text and this is not text
			if (options && options.acceptTextOnly && !isText) {
				return TPromise.wrapError(<files.IFileOperationResult>{
					message: nls.localize('fileBinaryError', "File seems to be binary and cannot be opened as text"),
					fileOperationResult: files.FileOperationResult.FILE_IS_BINARY
				});
			}

			let preferredEncoding: string;
			if (options && options.encoding) {
				if (detected.encoding === encoding.UTF8 && options.encoding === encoding.UTF8) {
					preferredEncoding = encoding.UTF8_with_bom; // indicate the file has BOM if we are to resolve with UTF 8
				} else {
					preferredEncoding = options.encoding; // give passed in encoding highest priority
				}
			} else if (detected.encoding) {
				if (detected.encoding === encoding.UTF8) {
					preferredEncoding = encoding.UTF8_with_bom; // if we detected UTF-8, it can only be because of a BOM
				} else {
					preferredEncoding = detected.encoding;
				}
			} else if (this.options.encoding === encoding.UTF8_with_bom) {
				preferredEncoding = encoding.UTF8; // if we did not detect UTF 8 BOM before, this can only be UTF 8 then
			}

			// 2.) get content
			return this.resolveFileContent(resource, options && options.etag, preferredEncoding).then((content) => {

				// set our knowledge about the mime on the content obj
				content.mime = detected.mimes.join(', ');

				return content;
			});
		}, (error) => {

			// bubble up existing file operation results
			if (!types.isUndefinedOrNull((<files.IFileOperationResult>error).fileOperationResult)) {
				return TPromise.wrapError(error);
			}

			// on error check if the file does not exist or is a folder and return with proper error result
			return pfs.exists(absolutePath).then((exists) => {

				// Return if file not found
				if (!exists) {
					return TPromise.wrapError(<files.IFileOperationResult>{
						message: nls.localize('fileNotFoundError', "File not found ({0})", absolutePath),
						fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
					});
				}

				// Otherwise check for file being a folder?
				return pfs.stat(absolutePath).then((stat) => {
					if (stat.isDirectory()) {
						return TPromise.wrapError(<files.IFileOperationResult>{
							message: nls.localize('fileIsDirectoryError', "File is directory ({0})", absolutePath),
							fileOperationResult: files.FileOperationResult.FILE_IS_DIRECTORY
						});
					}

					// otherwise just give up
					return TPromise.wrapError(error);
				});
			});
		});
		*/
	}

	public resolveContents(resources: uri[]): TPromise<files.IContent[]> {
		let limiter = new Limiter(FileService.MAX_DEGREE_OF_PARALLEL_FS_OPS);

		let contentPromises = <TPromise<files.IContent>[]>[];
		resources.forEach((resource) => {
			contentPromises.push(limiter.queue(() => this.resolveFileContent(resource).then((content) => content, (error) => TPromise.as(null /* ignore errors gracefully */))));
		});

		return TPromise.join(contentPromises).then((contents) => {
			return arrays.coalesce(contents);
		});
	}

	public updateContent(resource: uri, value: string, options: files.IUpdateContentOptions = Object.create(null)): TPromise<files.IFileStat> {
		return TPromise.wrapError(<files.IFileOperationResult>{
			message: 'githubFileService.updateContent not implemented (' + resource.toString(true) + ')',
			fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
		});
		/* TODO:
		let absolutePath = this.toAbsolutePath(resource);

		// 1.) check file
		return this.checkFile(absolutePath, options).then((exists) => {
			let createParentsPromise: TPromise<boolean>;
			if (exists) {
				createParentsPromise = TPromise.as(null);
			} else {
				createParentsPromise = pfs.mkdirp(paths.dirname(absolutePath));
			}

			// 2.) create parents as needed
			return createParentsPromise.then(() => {
				let encodingToWrite = this.getEncoding(resource, options.encoding);
				let addBomPromise: TPromise<boolean> = TPromise.as(false);

				// UTF_16 BE and LE as well as UTF_8 with BOM always have a BOM
				if (encodingToWrite === encoding.UTF16be || encodingToWrite === encoding.UTF16le || encodingToWrite === encoding.UTF8_with_bom) {
					addBomPromise = TPromise.as(true);
				}

				// Existing UTF-8 file: check for options regarding BOM
				else if (exists && encodingToWrite === encoding.UTF8) {
					if (options.overwriteEncoding) {
						addBomPromise = TPromise.as(false); // if we are to overwrite the encoding, we do not preserve it if found
					} else {
						addBomPromise = nfcall(encoding.detectEncodingByBOM, absolutePath).then((enc) => enc === encoding.UTF8); // otherwise preserve it if found
					}
				}

				// 3.) check to add UTF BOM
				return addBomPromise.then((addBom) => {
					let writeFilePromise: TPromise<void>;

					// Write fast if we do UTF 8 without BOM
					if (!addBom && encodingToWrite === encoding.UTF8) {
						writeFilePromise = pfs.writeFile(absolutePath, value, encoding.UTF8);
					}

					// Otherwise use encoding lib
					else {
						let encoded = encoding.encode(value, encodingToWrite, { addBOM: addBom });
						writeFilePromise = pfs.writeFile(absolutePath, encoded);
					}

					// 4.) set contents
					return writeFilePromise.then(() => {

						// 5.) resolve
						return this.resolve(resource);
					});
				});
			});
		});
		*/
	}

	public createFile(resource: uri, content: string = ''): TPromise<files.IFileStat> {
		return this.updateContent(resource, content);
	}

	public createFolder(resource: uri): TPromise<files.IFileStat> {
		return TPromise.wrapError(<files.IFileOperationResult>{
			message: 'githubFileService.createFolder not implemented (' + resource.toString(true) + ')',
			fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
		});

		/* TODO:
		// 1.) create folder
		let absolutePath = this.toAbsolutePath(resource);
		return pfs.mkdirp(absolutePath).then(() => {

			// 2.) resolve
			return this.resolve(resource);
		});
		*/
	}

	public rename(resource: uri, newName: string): TPromise<files.IFileStat> {
		return TPromise.wrapError(<files.IFileOperationResult>{
			message: 'githubFileService.rename not implemented (' + resource.toString(true) + ')',
			fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
		});
		/* TODO:
		let newPath = paths.join(paths.dirname(resource.fsPath), newName);

		return this.moveFile(resource, uri.file(newPath));
		*/
	}

	public moveFile(source: uri, target: uri, overwrite?: boolean): TPromise<files.IFileStat> {
		return this.moveOrCopyFile(source, target, false, overwrite);
	}

	public copyFile(source: uri, target: uri, overwrite?: boolean): TPromise<files.IFileStat> {
		return this.moveOrCopyFile(source, target, true, overwrite);
	}

	private moveOrCopyFile(source: uri, target: uri, keepCopy: boolean, overwrite: boolean): TPromise<files.IFileStat> {
		let sourcePath = this.toAbsolutePath(source);
		let targetPath = this.toAbsolutePath(target);

		// 1.) move / copy
		return this.doMoveOrCopyFile(sourcePath, targetPath, keepCopy, overwrite).then(() => {

			// 2.) resolve
			return this.resolve(target);
		});
	}

	private doMoveOrCopyFile(sourcePath: string, targetPath: string, keepCopy: boolean, overwrite: boolean): TPromise<boolean /* exists */> {
		return TPromise.wrapError(<files.IFileOperationResult>{
			message: 'githubFileService.doMoveOrCopyFile not implemented (' + sourcePath + ' -> ' + targetPath + ')',
			fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
		});

		/* TODO:
		// 1.) check if target exists
		return pfs.exists(targetPath).then((exists) => {
			let isCaseRename = sourcePath.toLowerCase() === targetPath.toLowerCase();
			let isSameFile = sourcePath === targetPath;

			// Return early with conflict if target exists and we are not told to overwrite
			if (exists && !isCaseRename && !overwrite) {
				return TPromise.wrapError(<files.IFileOperationResult>{
					fileOperationResult: files.FileOperationResult.FILE_MOVE_CONFLICT
				});
			}

			// 2.) make sure target is deleted before we move/copy unless this is a case rename of the same file
			let deleteTargetPromise = TPromise.as(null);
			if (exists && !isCaseRename) {
				if (paths.isEqualOrParent(sourcePath, targetPath)) {
					return TPromise.wrapError(nls.localize('unableToMoveCopyError', "Unable to move/copy. File would replace folder it is contained in.")); // catch this corner case!
				}

				deleteTargetPromise = this.del(uri.file(targetPath));
			}

			return deleteTargetPromise.then(() => {

				// 3.) make sure parents exists
				return pfs.mkdirp(paths.dirname(targetPath)).then(() => {

					// 4.) copy/move
					if (isSameFile) {
						return TPromise.as(null);
					} else if (keepCopy) {
						return nfcall(extfs.copy, sourcePath, targetPath);
					} else {
						return nfcall(extfs.mv, sourcePath, targetPath);
					}
				}).then(() => exists);
			});
		});
		*/
	}

	public importFile(source: uri, targetFolder: uri): TPromise<files.IImportResult> {
		return TPromise.wrapError(<files.IFileOperationResult>{
			message: 'githubFileService.importFile not implemented (' + source.toString(true) + ')',
			fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
		});
		/* TODO:
		let sourcePath = this.toAbsolutePath(source);
		let targetResource = uri.file(paths.join(targetFolder.fsPath, paths.basename(source.fsPath)));
		let targetPath = this.toAbsolutePath(targetResource);

		// 1.) resolve
		return pfs.stat(sourcePath).then((stat) => {
			if (stat.isDirectory()) {
				return TPromise.wrapError(nls.localize('foldersCopyError', "Folders cannot be copied into the workspace. Please select individual files to copy them.")); // for now we do not allow to import a folder into a workspace
			}

			// 2.) copy
			return this.doMoveOrCopyFile(sourcePath, targetPath, true, true).then((exists) => {

				// 3.) resolve
				return this.resolve(targetResource).then((stat) => <files.IImportResult>{ isNew: !exists, stat: stat });
			});
		});
		*/
	}

	public del(resource: uri): TPromise<void> {
		console.log('githubFileService.del not implemented (' + resource.toString(true) + ')');
		return TPromise.as<void>(null);
		/* TODO:
		let absolutePath = this.toAbsolutePath(resource);

		return nfcall(extfs.del, absolutePath, this.tmpPath);
		*/
	}

	// Helpers

	private toAbsolutePath(arg1: uri | files.IFileStat): string {
		let resource: uri;
		if (arg1 instanceof uri) {
			resource = <uri>arg1;
		} else {
			resource = (<files.IFileStat>arg1).resource;
		}

		return paths.normalize(resource.fsPath);
	}
	
	private toRepository(resource: uri): Repository {
		let path = resource.path;
		if (path[0] == '/')
			path = path.slice(1);
		let splitPath = path.split('/');
		if (splitPath.length < 2) {
			console.log('invalid repository: ' + resource.toString(true));
			return null;
		}
		return this.githubService.getRepo(splitPath[0], splitPath[1]);
	}

	private toRepoPath(resource: uri): string {
		let path = resource.path;
		if (path[0] == '/')
			path = path.slice(1);
		let splitPath = path.split('/');
		if (splitPath.length < 2) {
			console.log('invalid repository: ' + resource.toString(true));
			return null;
		}
		if (splitPath.length == 2)
			return '';
		splitPath.shift();
		splitPath.shift();
		return splitPath.join('/');
	}

	// TODO: options
	private resolve(resource: uri, options: files.IResolveFileOptions = Object.create(null)): TPromise<files.IFileStat> {
		let repo = this.toRepository(resource);
		let path = this.toRepoPath(resource);
		return new TPromise<files.IFileStat>((c, e) => {
			repo.contents('master', path, (err: GithubError, contents?: any) => {
				err ? e(err) : c(contents);
			});
		}).then((contents: any) => {
			if (!Array.isArray(contents)) {
				// TODO: switch on contents.type (file | symlink | submodule)
				return {
					resource: uri.file(paths.join(resource.path, contents.path)),
					isDirectory: false,
					hasChildren: false,
					name: contents.name,
					mtime: contents.updated_at, // TODO:
					etag: contents.sha,
					size: contents.size,
					mime: baseMime.guessMimeTypes(contents.name).join(', '),
					content: contents.content
				}
			}
			
			// TODO: recurse subdirs
			var stats: files.IFileStat[] = [];
			for (var i = 0; i < contents.length; i++) {
				let content = contents[i];
				stats.push({
					resource: uri.file(paths.join(resource.path, content.path)),
					isDirectory: content.type == "dir", // TODO: symlink, submodule
					hasChildren: content.type == "dir",
					name: content.name,
					mtime: content.updated_at, // TODO:
					etag: content.sha,
					size: content.size,
					mime: baseMime.guessMimeTypes(content.name).join(', ')
				});
			}
			return {
				resource: resource,
				isDirectory: true,
				hasChildren: true,
				name: path, // TODO:
				mtime: 0, // TODO:
				etag: '', // TODO: etag(fileStat),
				children: stats,
				mime: undefined
			}
		}, (error: GithubError) => {
			console.log('unable to repo.contents ' + resource.toString(true));
		});
	}
	
	private resolveFileContent(resource: uri, etag?: string, enc?: string): TPromise<files.IContent> {
		let absolutePath = this.toAbsolutePath(resource);

		// 1.) stat
		return this.resolve(resource).then((model) => {

			// Return early if file not modified since
			if (etag && etag === model.etag) {
				return TPromise.wrapError(<files.IFileOperationResult>{
					fileOperationResult: files.FileOperationResult.FILE_NOT_MODIFIED_SINCE
				});
			}

			// Return early if file is too large to load
			if (types.isNumber(model.size) && model.size > files.MAX_FILE_SIZE) {
				return TPromise.wrapError(<files.IFileOperationResult>{
					fileOperationResult: files.FileOperationResult.FILE_TOO_LARGE
				});
			}

			// 2.) read contents
			return new TPromise<files.IContent>((c, e) => {
				var content: files.IContent = {
					resource: model.resource,
					name: model.name,
					mtime: model.mtime,
					etag: model.etag,
					mime: model.mime,
					value: atob((<any>model).content),
					encoding: encoding.UTF8 // TODO:
				}
				c(content);
			});
		});
	}

	private getEncoding(resource: uri, preferredEncoding?: string): string {
		let fileEncoding: string;

		let override = this.getEncodingOverride(resource);
		if (override) {
			fileEncoding = override;
		} else if (preferredEncoding) {
			fileEncoding = preferredEncoding;
		} else {
			fileEncoding = this.options.encoding;
		}

		/* TODO:
		if (!fileEncoding || !encoding.encodingExists(fileEncoding)) {
			fileEncoding = encoding.UTF8; // the default is UTF 8
		}
		*/

		return fileEncoding;
	}

	private getEncodingOverride(resource: uri): string {
		if (resource && this.options.encodingOverride && this.options.encodingOverride.length) {
			for (let i = 0; i < this.options.encodingOverride.length; i++) {
				let override = this.options.encodingOverride[i];

				// check if the resource is a child of the resource with override and use
				// the provided encoding in that case
				if (resource.toString().indexOf(override.resource.toString() + '/') === 0) {
					return override.encoding;
				}
			}
		}

		return null;
	}

	private checkFile(absolutePath: string, options: files.IUpdateContentOptions): TPromise<boolean /* exists */> {
		return TPromise.wrapError(<files.IFileOperationResult>{
			message: 'githubFileService.checkFile not implemented (' + absolutePath + ')',
			fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
		});
		
		/* TODO:
		return pfs.exists(absolutePath).then((exists) => {
			if (exists) {
				return pfs.stat(absolutePath).then((stat: fs.Stats) => {
					if (stat.isDirectory()) {
						return TPromise.wrapError(new Error('Expected file is actually a directory'));
					}

					// Dirty write prevention
					if (typeof options.mtime === 'number' && typeof options.etag === 'string' && options.mtime < stat.mtime.getTime()) {

						// Find out if content length has changed
						if (options.etag !== etag(stat.size, options.mtime)) {
							return TPromise.wrapError(<files.IFileOperationResult>{
								message: 'File Modified Since',
								fileOperationResult: files.FileOperationResult.FILE_MODIFIED_SINCE
							});
						}
					}

					let mode = stat.mode;
					let readonly = !(mode & 128);

					// Throw if file is readonly and we are not instructed to overwrite
					if (readonly && !options.overwriteReadonly) {
						return TPromise.wrapError(<files.IFileOperationResult>{
							message: nls.localize('fileReadOnlyError', "File is Read Only"),
							fileOperationResult: files.FileOperationResult.FILE_READ_ONLY
						});
					}

					if (readonly) {
						mode = mode | 128;
						return pfs.chmod(absolutePath, mode).then(() => exists);
					}

					return TPromise.as<boolean>(exists);
				});
			}

			return TPromise.as<boolean>(exists);
		});
		*/
	}

	public watchFileChanges(resource: uri): void {
		console.log('githubFileService.watchFileChanges not implemented (' + resource.toString(true) + ')');
		/* TODO:
		assert.ok(resource && resource.scheme === 'file', 'Invalid resource for watching: ' + resource);

		let fsPath = resource.fsPath;

		// Create or get watcher for provided path
		let watcher = this.activeFileChangesWatchers[resource.toString()];
		if (!watcher) {
			try {
				watcher = fs.watch(fsPath); // will be persistent but not recursive
			} catch (error) {
				// the path might not exist anymore, ignore this error and return
				return;
			}

			this.activeFileChangesWatchers[resource.toString()] = watcher;

			// eventType is either 'rename' or 'change'
			watcher.on('change', (eventType: string) => {
				if (eventType !== 'change') {
					return; // only care about changes for now ('rename' is not reliable and can be send even if the file is still there with some tools)
				}

				// add to bucket of undelivered events
				this.undeliveredRawFileChangesEvents.push({
					type: files.FileChangeType.UPDATED,
					path: fsPath
				});

				// handle emit through delayer to accommodate for bulk changes
				this.fileChangesWatchDelayer.trigger(() => {
					let buffer = this.undeliveredRawFileChangesEvents;
					this.undeliveredRawFileChangesEvents = [];

					// Normalize
					let normalizedEvents = normalize(buffer);

					// Emit
					this.eventEmitter.emit(files.EventType.FILE_CHANGES, toFileChangesEvent(normalizedEvents));

					return TPromise.as(null);
				});
			});
		}
		*/
	}

	public unwatchFileChanges(resource: uri): void;
	public unwatchFileChanges(path: string): void;
	public unwatchFileChanges(arg1: any): void {
		let resource = (typeof arg1 === 'string') ? uri.parse(arg1) : arg1;
		console.log('githubFileService.unwatchFileChanges not implemented (' + resource + ')');
		
		/* TODO:
		let watcher = this.activeFileChangesWatchers[resource.toString()];
		if (watcher) {
			watcher.close();
			delete this.activeFileChangesWatchers[resource.toString()];
		}
		*/
	}

	public dispose(): void {
		if (this.workspaceWatcherToDispose) {
			this.workspaceWatcherToDispose();
			this.workspaceWatcherToDispose = null;
		}

		/* TODO:
		for (let key in this.activeFileChangesWatchers) {
			let watcher = this.activeFileChangesWatchers[key];
			watcher.close();
		}
		this.activeFileChangesWatchers = Object.create(null);
		*/
	}
}

/*
export class StatResolver {
	private resource: uri;
	private isDirectory: boolean;
	private mtime: number;
	private name: string;
	private mime: string;
	private etag: string;
	private size: number;
	private verboseLogging: boolean;

	constructor(resource: uri, isDirectory: boolean, mtime: number, size: number, verboseLogging: boolean) {
		// TODO: assert.ok(resource && resource.scheme === 'file', 'Invalid resource: ' + resource);

		this.resource = resource;
		this.isDirectory = isDirectory;
		this.mtime = mtime;
		this.name = paths.basename(resource.fsPath);
		this.mime = !this.isDirectory ? baseMime.guessMimeTypes(resource.fsPath).join(', ') : null;
		this.etag = etag(size, mtime);
		this.size = size;

		this.verboseLogging = verboseLogging;
	}

	public resolve(options: files.IResolveFileOptions): TPromise<files.IFileStat> {

		// General Data
		let fileStat: files.IFileStat = {
			resource: this.resource,
			isDirectory: this.isDirectory,
			hasChildren: undefined,
			name: this.name,
			etag: this.etag,
			size: this.size,
			mtime: this.mtime,
			mime: this.mime
		};

		// File Specific Data
		if (!this.isDirectory) {
			return TPromise.as(fileStat);
		}

		// Directory Specific Data
		else {

			// Convert the paths from options.resolveTo to absolute paths
			let absoluteTargetPaths: string[] = null;
			if (options && options.resolveTo) {
				absoluteTargetPaths = [];
				options.resolveTo.forEach((resource) => {
					absoluteTargetPaths.push(resource.fsPath);
				});
			}

			return new TPromise((c, e) => {

				// Load children
				this.resolveChildren(this.resource.fsPath, absoluteTargetPaths, options && options.resolveSingleChildDescendants, (children) => {
					children = arrays.coalesce(children); // we don't want those null children (could be permission denied when reading a child)
					fileStat.hasChildren = children && children.length > 0;
					fileStat.children = children || [];

					c(fileStat);
				});
			});
		}
	}

	private resolveChildren(absolutePath: string, absoluteTargetPaths: string[], resolveSingleChildDescendants: boolean, callback: (children: files.IFileStat[]) => void): void {
		console.log('githubFileService.resolveChildren not implemented (' + absolutePath + ')');
		
		extfs.readdir(absolutePath, (error: Error, files: string[]) => {
			if (error) {
				if (this.verboseLogging) {
					console.error(error);
				}

				return callback(null); // return - we might not have permissions to read the folder
			}

			// for each file in the folder
			flow.parallel(files, (file: string, clb: (error: Error, children: files.IFileStat) => void) => {
				let fileResource = uri.file(paths.resolve(absolutePath, file));
				let fileStat: fs.Stats;
				let $this = this;

				flow.sequence(
					function onError(error: Error): void {
						if ($this.verboseLogging) {
							console.error(error);
						}

						clb(null, null); // return - we might not have permissions to read the folder or stat the file
					},

					function stat(): void {
						fs.stat(fileResource.fsPath, this);
					},

					function countChildren(fsstat: fs.Stats): void {
						fileStat = fsstat;

						if (fileStat.isDirectory()) {
							extfs.readdir(fileResource.fsPath, (error, result) => {
								this(null, result ? result.length : 0);
							});
						} else {
							this(null, 0);
						}
					},

					function resolve(childCount: number): void {
						let childStat: files.IFileStat = {
							resource: fileResource,
							isDirectory: fileStat.isDirectory(),
							hasChildren: childCount > 0,
							name: file,
							mtime: fileStat.mtime.getTime(),
							etag: etag(fileStat),
							size: fileStat.size,
							mime: !fileStat.isDirectory() ? baseMime.guessMimeTypes(fileResource.fsPath).join(', ') : undefined
						};

						// Return early for files
						if (!fileStat.isDirectory()) {
							return clb(null, childStat);
						}

						// Handle Folder
						let resolveFolderChildren = false;
						if (files.length === 1 && resolveSingleChildDescendants) {
							resolveFolderChildren = true;
						} else if (childCount > 0 && absoluteTargetPaths && absoluteTargetPaths.some((targetPath) => paths.isEqualOrParent(targetPath, fileResource.fsPath))) {
							resolveFolderChildren = true;
						}

						// Continue resolving children based on condition
						if (resolveFolderChildren) {
							$this.resolveChildren(fileResource.fsPath, absoluteTargetPaths, resolveSingleChildDescendants, (children) => {
								children = arrays.coalesce(children);  // we don't want those null children
								childStat.hasChildren = children && children.length > 0;
								childStat.children = children || [];

								clb(null, childStat);
							});
						}

						// Otherwise return result
						else {
							clb(null, childStat);
						}
					});
			}, (errors, result) => {
				callback(result);
			});
		});
	}
}
*/