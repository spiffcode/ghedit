/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import paths = require('vs/base/common/paths');
// TODO: import fs = require('fs');
// TODO: import os = require('os');
// TODO: import crypto = require('crypto');
// TODO: import assert = require('assert');

import flow = require('vs/base/node/flow');
import Files = require('vs/workbench/parts/files/common/files');
import {FileStat} from 'vs/workbench/parts/files/common/explorerViewModel';

import {IStringStream, IContent, IFileService, IResolveFileOptions, IResolveContentOptions, IFileStat, IStreamContent, IFileOperationResult, FileOperationResult, IBaseStat, IUpdateContentOptions, FileChangeType, EventType, IImportResult, MAX_FILE_SIZE} from 'vs/platform/files/common/files';
import strings = require('vs/base/common/strings');
import arrays = require('vs/base/common/arrays');
import baseMime = require('vs/base/common/mime');
import basePaths = require('vs/base/common/paths');
import {TPromise} from 'vs/base/common/winjs.base';
import types = require('vs/base/common/types');
import objects = require('vs/base/common/objects');
// TODO: import extfs = require('vs/base/node/extfs');
import {nfcall, Limiter, ThrottledDelayer} from 'vs/base/common/async';
import uri from 'vs/base/common/uri';
import nls = require('vs/nls');
import http = require('vs/base/common/http');
import {IRequestService} from 'vs/platform/request/common/request';
var github = require('lib/github');

// TODO: import pfs = require('vs/base/node/pfs');
// TODO: import encoding = require('vs/base/node/encoding');
// TODO: import mime = require('vs/base/node/mime');
// TODO: import flow = require('vs/base/node/flow');
// TODO: import {FileWatcher as UnixWatcherService} from 'vs/workbench/services/files/node/watcher/unix/watcherService';
// TODO: import {FileWatcher as WindowsWatcherService} from 'vs/workbench/services/files/node/watcher/win32/watcherService';
// TODO: import {toFileChangesEvent, normalize, IRawFileChange} from 'vs/workbench/services/files/node/watcher/common';
import {IEventService} from 'vs/platform/event/common/event';
import {Github, Repository, User, Gist, Error as GithubError} from 'github';
import {IGithubService} from 'githubService';
import {IWorkspaceContextService} from 'vs/platform/workspace/common/workspace';
import {IGithubTreeCache, IGithubTreeStat} from 'githubTreeCache';

interface GistInfo {
	gist: Gist;
	fileExists: boolean;
}

// TODO: Use vs/base/node/encoding replacement.
const encoding = {
	UTF8: 'utf8',
	UTF8_with_bom: 'utf8bom',
	UTF16be: 'utf16be',
	UTF16le: 'utf16le',
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
	commitMessage?: string;
	debugBrkFileWatcherPort?: number;
	settingsNotificationPaths?: string[];
	gistRegEx?: RegExp;
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

export class FileService implements IFileService {

	public _serviceBrand: any;

	private static FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
	private static MAX_DEGREE_OF_PARALLEL_FS_OPS = 10; // degree of parallel fs calls that we accept at the same time

	private basePath: string;
	private tmpPath: string;
	private options: IFileServiceOptions;
	private repo: Repository;
	private ref: string;
	private cache: IGithubTreeCache;

	private workspaceWatcherToDispose: () => void;

	// TODO: private activeFileChangesWatchers: { [resource: string]: fs.FSWatcher; };
	private fileChangesWatchDelayer: ThrottledDelayer<void>;
	// TODO: private undeliveredRawFileChangesEvents: IRawFileChange[];

	constructor(basePath: string, options: IFileServiceOptions, private eventEmitter: IEventService, private requestService: IRequestService, private githubService: IGithubService, private contextService: IWorkspaceContextService) {
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
		this.repo = this.githubService.github.getRepo(this.githubService.repoName);
		this.ref = this.githubService.ref;
		this.cache = this.githubService.getCache();
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
		this.workspaceWatcherToDispose = new UnixWatcherService(this.basePath, this.options.watcherIgnoredPatterns, this.eventEmitter, this.options.errorLogger, this.options.verboseLogging, this.options.debugBrkFileWatcherPort).startWatching();
		*/
	}

	public resolveFile(resource: uri, options?: IResolveFileOptions): TPromise<IFileStat> {
		return this.resolve(resource, options);
	}

	public existsFile(resource: uri): TPromise<boolean> {
		return this.resolveFile(resource).then(() => true, () => false);
	}

	public resolveContent(resource: uri, options?: IResolveContentOptions): TPromise<IContent> {
		return this.doResolveContent(resource, options, (resource, etag, enc) => this.resolveFileContent(resource, etag, enc));
	}

	public resolveStreamContent(resource: uri, options?: IResolveContentOptions): TPromise<IStreamContent> {
		return this.doResolveContent(resource, options, (resource, etag, enc) => this.resolveFileStreamContent(resource, etag, enc));
	}

	private doResolveContent<T extends IBaseStat>(resource: uri, options: IResolveContentOptions, contentResolver: (resource: uri, etag?: string, enc?: string) => TPromise<T>): TPromise<T> {
		let preferredEncoding: string;
		if (options && options.encoding) {
			preferredEncoding = options.encoding; // give passed in encoding highest priority
		} else if (this.options.encoding === encoding.UTF8_with_bom) {
			preferredEncoding = encoding.UTF8; // if we did not detect UTF 8 BOM before, this can only be UTF 8 then
		}
		return contentResolver(resource, options && options.etag, preferredEncoding).then((content) => {

			// set our knowledge about the mime on the content obj
			// TODO: content.mime = detected.mimes.join(', ');

			return content;
		});

		/* TODO:
		let absolutePath = this.toAbsolutePath(resource);

		// 1.) detect mimes
		return nfcall(mime.detectMimesFromFile, absolutePath).then((detected: mime.IMimeAndEncoding): TPromise<T> => {
			let isText = detected.mimes.indexOf(baseMime.MIME_BINARY) === -1;

			// Return error early if client only accepts text and this is not text
			if (options && options.acceptTextOnly && !isText) {
				return TPromise.wrapError(<IFileOperationResult>{
					message: nls.localize('fileBinaryError', "File seems to be binary and cannot be opened as text"),
					fileOperationResult: FileOperationResult.FILE_IS_BINARY
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
			return contentResolver(resource, options && options.etag, preferredEncoding).then((content) => {

				// set our knowledge about the mime on the content obj
				content.mime = detected.mimes.join(', ');

				return content;
			});
		}, (error) => {

			// bubble up existing file operation results
			if (!types.isUndefinedOrNull((<IFileOperationResult>error).fileOperationResult)) {
				return TPromise.wrapError(error);
			}

			// on error check if the file does not exist or is a folder and return with proper error result
			return pfs.exists(absolutePath).then((exists) => {

				// Return if file not found
				if (!exists) {
					return TPromise.wrapError(<IFileOperationResult>{
						message: nls.localize('fileNotFoundError', "File not found ({0})", absolutePath),
						fileOperationResult: FileOperationResult.FILE_NOT_FOUND
					});
				}

				// Otherwise check for file being a folder?
				return pfs.stat(absolutePath).then((stat) => {
					if (stat.isDirectory()) {
						return TPromise.wrapError(<IFileOperationResult>{
							message: nls.localize('fileIsDirectoryError', "File is directory ({0})", absolutePath),
							fileOperationResult: FileOperationResult.FILE_IS_DIRECTORY
						});
					}

					// otherwise just give up
					return TPromise.wrapError(error);
				});
			});
		});
		*/
	}

	public resolveContents(resources: uri[]): TPromise<IContent[]> {
		let limiter = new Limiter(FileService.MAX_DEGREE_OF_PARALLEL_FS_OPS);

		let contentPromises = <TPromise<IContent>[]>[];
		resources.forEach((resource) => {
			contentPromises.push(limiter.queue(() => this.resolveFileContent(resource).then((content) => content, (error) => TPromise.as(null /* ignore errors gracefully */))));
		});

		return TPromise.join(contentPromises).then((contents) => {
			return arrays.coalesce(contents);
		});
	}

	public updateContent(resource: uri, value: string, options: IUpdateContentOptions = Object.create(null)): TPromise<IFileStat> {
		if (this.isGistPath(resource)) {
			return this.updateGistContent(resource, value, options);
		} else {
			return this.updateRepoContent(resource, value, options);
		}
	}

	private updateGist(info: GistInfo, description:string, filename:string, value:string) : TPromise<boolean> {
		// Cases are:
		// 1. gist with description exists, file in gist exists.
		// 2. gist with description exists, file doesn't exist.
		// 3. gist with description doesn't exist.
		return new TPromise<boolean>((c, e) => {
			let data: any = {
				description: description,
				public: false,
				files: {}
			};
			data.files[filename] = {content: value || '{}' };

			// Gist exists?
			if (info.gist) {
				// Gists exists. Update it.
				let gist:Gist = new github.Gist({id: info.gist.id});
				gist.update(data, (err: GithubError) => {
					if (err) {
						e(err);
					} else {
						c(true);
					}
				});
			} else {
				// Create
				let gist:Gist = new github.Gist({});
				gist.create(data, (err: GithubError) => {
					if (err) {
						e(err);
					} else {
						c(true);
					}
				});
			}
		});
	}

	private checkNotify(absolutePath: string) {
		if (this.options.settingsNotificationPaths) {
			let notify:boolean = false;
			for (let i = 0; i < this.options.settingsNotificationPaths.length; i++) {
				if (absolutePath === this.options.settingsNotificationPaths[i]) {
					notify = true;
					break;
				}
			}
			if (notify) {
				setTimeout(() => { this.eventEmitter.emit("settingsFileChanged"); }, 0);
			}
		}
	}

	private updateGistContent(resource: uri, value: string, options: IUpdateContentOptions): TPromise<IFileStat> {
		// 0 = '', 1 = '$gist', 2 = description, 3 = filename
		let absolutePath = this.toAbsolutePath(resource);
		let parts = absolutePath.split('/');

		return new TPromise<IFileStat>((c, e) => {
			this.findGist(resource).then((info) => {
				// 1.) check file
				return this.checkFile(absolutePath, options).then((exists) => {
					let encodingToWrite = this.getEncoding(resource, options.encoding);
					let addBomPromise: TPromise<boolean> = TPromise.as(false);

					// UTF_16 BE and LE as well as UTF_8 with BOM always have a BOM
					if (encodingToWrite === encoding.UTF16be || encodingToWrite === encoding.UTF16le || encodingToWrite === encoding.UTF8_with_bom) {
						addBomPromise = TPromise.as(true);
					}

					// Existing UTF-8 file: check for options regarding BOM
					else if (exists && encodingToWrite === encoding.UTF8) {
						// TODO: Node-independent detectEncodingByBOM
						// if (options.overwriteEncoding) {
						// 	addBomPromise = TPromise.as(false); // if we are to overwrite the encoding, we do not preserve it if found
						// } else {
						// 	addBomPromise = nfcall(encoding.detectEncodingByBOM, absolutePath).then((enc) => enc === encoding.UTF8); // otherwise preserve it if found
						// }

						addBomPromise = TPromise.as(false);
					}

					// 3.) check to add UTF BOM
					return addBomPromise.then((addBom) => {
						let writeFilePromise: TPromise<boolean> = TPromise.as(false);

						// Write fast if we do UTF 8 without BOM
						if (!addBom && encodingToWrite === encoding.UTF8) {
							writeFilePromise = this.updateGist(info, parts[2], parts[3], value).then(() => {
								// Is this one of the settings files that requires change notification?
								this.checkNotify(absolutePath);
								return true;
							}, (error: GithubError) => {
								console.log('failed to gist.update ' + resource.toString(true));
							});
						}

						// Otherwise use encoding lib
						else {
							throw new Error('githubFileService.updateContent with non-UTF8 encoding not implemented yet');
							// TODO:
							// let encoded = encoding.encode(value, encodingToWrite, { addBOM: addBom });
							// writeFilePromise = pfs.writeFile(absolutePath, encoded);
						}

						// 4.) set contents
						return writeFilePromise.then(() => {
							this.resolve(resource).then((result: IFileStat) => {
								c(result);
							}, (error) => {
								e(error);
							});
						});
					});
				});
			}, (error: GithubError) => {
				return TPromise.wrapError(<IFileOperationResult>{
					fileOperationResult: FileOperationResult.FILE_NOT_FOUND
				});
			});
		});
	}

	private updateRepoContent(resource: uri, value: string, options: IUpdateContentOptions): TPromise<IFileStat> {
		let absolutePath = this.toAbsolutePath(resource);

		// 1.) check file
		return this.checkFile(absolutePath, options).then((exists) => {
			let encodingToWrite = this.getEncoding(resource, options.encoding);
			let addBomPromise: TPromise<boolean> = TPromise.as(false);

			// UTF_16 BE and LE as well as UTF_8 with BOM always have a BOM
			if (encodingToWrite === encoding.UTF16be || encodingToWrite === encoding.UTF16le || encodingToWrite === encoding.UTF8_with_bom) {
				addBomPromise = TPromise.as(true);
			}

			// Existing UTF-8 file: check for options regarding BOM
			else if (exists && encodingToWrite === encoding.UTF8) {
				/* TODO: Node-independent detectEncodingByBOM
				if (options.overwriteEncoding) {
					addBomPromise = TPromise.as(false); // if we are to overwrite the encoding, we do not preserve it if found
				} else {
					addBomPromise = nfcall(encoding.detectEncodingByBOM, absolutePath).then((enc) => enc === encoding.UTF8); // otherwise preserve it if found
				}*/
				addBomPromise = TPromise.as(false);
			}

			// 3.) check to add UTF BOM
			return addBomPromise.then((addBom) => {
				let writeFilePromise: TPromise<void>;

				// Write fast if we do UTF 8 without BOM
				if (!addBom && encodingToWrite === encoding.UTF8) {
// TODO:			writeFilePromise = pfs.writeFile(absolutePath, value, encoding.UTF8);
					writeFilePromise = new TPromise<void>((c, e) => {
						let path = resource.path.slice(1);
						let commitMessage = this.options.commitMessage || 'Update ' + path;
						this.repo.write(this.ref, path, value, commitMessage, { encode: true }, (err: GithubError) => {
							err ? e(err) : c(null);
						});
					}).then(() => {
						this.cache.markDirty();
						this.checkNotify(absolutePath);
						return;
					}, (error: GithubError) => {
						console.log('failed to repo.write ' + resource.toString(true));
					});
				}

				// Otherwise use encoding lib
				else {
					throw new Error('githubFileService.updateContent with non-UTF8 encoding not implemented yet');
					/* TODO:
					let encoded = encoding.encode(value, encodingToWrite, { addBOM: addBom });
					writeFilePromise = pfs.writeFile(absolutePath, encoded);
					*/
				}

				// 4.) set contents
				return writeFilePromise.then(() => {

					// 5.) resolve
					return this.resolve(resource);
				});
			});
		});
	}

	public createFile(resource: uri, content: string = ''): TPromise<IFileStat> {
		return this.updateContent(resource, content);
	}

	public createFolder(resource: uri): TPromise<IFileStat> {
		let path = this.toAbsolutePath(resource);
		if (path[0] == '/')
			path = path.slice(1, path.length);
		let newPath = paths.join(paths.dirname(path + '/'), ".keepdir");

		return this.createFile(uri.file(newPath), 'Git requires at least 1 file to be present in a folder.').then((stat: IFileStat) => {
			this.forceExplorerViewRefresh();
			return stat;
		}, (err: any) => {
			return err;
		});
	}

	public rename(resource: uri, newName: string): TPromise<IFileStat> {
		let oldPath = this.toAbsolutePath(resource);
		if (oldPath[0] == '/')
			oldPath = oldPath.slice(1, oldPath.length);
		let newPath = paths.join(paths.dirname(oldPath), newName);

		return this.moveGithubFile(oldPath, newPath).then(() => {
			return this.resolveFile(uri.file(newPath));
		}, () => {
			console.log('failed to rename file ' + resource.toString(true));
			return TPromise.as(false);
		});
	}

	public moveFile(source: uri, target: uri, overwrite?: boolean): TPromise<IFileStat> {
		return this.moveOrCopyFile(source, target, false, overwrite);
	}

	public copyFile(source: uri, target: uri, overwrite?: boolean): TPromise<IFileStat> {
		return this.moveOrCopyFile(source, target, true, overwrite);
	}

	private moveOrCopyFile(source: uri, target: uri, keepCopy: boolean, overwrite: boolean): TPromise<IFileStat> {
		let sourcePath = this.toAbsolutePath(source);
		let targetPath = this.toAbsolutePath(target);

		// 1.) move / copy
		return this.doMoveOrCopyFile(sourcePath, targetPath, keepCopy, overwrite).then(() => {

			// 2.) resolve
			return this.resolve(target);
		});
	}

	private forceExplorerViewRefresh() {
		// Should be part of fileActions.ts, trying not to 'fork' that file because it is imported in
		// many places.
		let event = new Files.LocalFileChangeEvent(new FileStat(this.contextService.getWorkspace().resource, true, true), new FileStat(this.contextService.getWorkspace().resource, true, true));
		this.eventEmitter.emit('files.internal:fileChanged', event);
	}

	private deleteGithubFile(sourcePath: string) : TPromise<boolean> {
		return new TPromise<void>((c, e) => {
			this.repo.delete(this.ref, sourcePath, (err: GithubError) => {
				err ? e(err) : c(null);
			});
		}).then(() => {
			// When the last file of a git directory is deleted, that directory is no longer part
			// of the repo. Refresh the entire explorer view to catch this case.
			this.cache.markDirty();
			this.forceExplorerViewRefresh();
			return true;
		}, (error: GithubError) => {
			console.log('failed to delete file ' + sourcePath);
			return false;
		});
	}

	private copyGithubFile(sourcePath: string, targetPath: string) : TPromise<boolean> {
		return new TPromise<boolean>((c, e) => {
			return this.resolveFileContent(uri.file(sourcePath)).then((content: IContent) => {
				return this.updateContent(uri.file(targetPath), content.value).then(()=> {
					c(true);
				}, () => {
					c(false);
				});
			});
		});
	}

	private moveGithubFile(sourcePath: string, targetPath: string) : TPromise<boolean> {
		return this.existsFile(uri.file(targetPath)).then((exists) => {
			if (exists) {
				return TPromise.wrapError(<IFileOperationResult>{
					fileOperationResult: FileOperationResult.FILE_MOVE_CONFLICT
				});
			}

			return this.copyGithubFile(sourcePath, targetPath).then((success: boolean) => {
				if (success) {
					return this.deleteGithubFile(sourcePath);
				} else {
					return this.deleteGithubFile(targetPath);
				}
			});
		});
	}

	private doMoveOrCopyFile(sourcePath: string, targetPath: string, keepCopy: boolean, overwrite: boolean): TPromise<boolean /* exists */> {
/*
		return TPromise.wrapError(<IFileOperationResult>{
			message: 'githubFileService.doMoveOrCopyFile not implemented (' + sourcePath + ' -> ' + targetPath + ')',
			fileOperationResult: FileOperationResult.FILE_NOT_FOUND
		});
*/

		return this.existsFile(uri.file(targetPath)).then((exists) => {
			let isCaseRename = sourcePath.toLowerCase() === targetPath.toLowerCase();
			let isSameFile = sourcePath === targetPath;

			// Return early with conflict if target exists and we are not told to overwrite
			if (exists && !isCaseRename && !overwrite) {
				return TPromise.wrapError(<IFileOperationResult>{
					fileOperationResult: FileOperationResult.FILE_MOVE_CONFLICT
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
				// Dir doesn't need to exist since this is git semantics not file system semantics
				// TODO: 3.) make sure parents exists
				// TODO: return pfs.mkdirp(paths.dirname(targetPath)).then(() => {
				return TPromise.as(true).then(() => {
					// 4.) copy/move
					if (isSameFile) {
						return TPromise.as(null);
					} else if (keepCopy) {
						return this.copyGithubFile(sourcePath, targetPath);
					} else {
						return this.moveGithubFile(sourcePath, targetPath);
					}
				}).then(() => exists);
			});
		});

		/* TODO:
		// 1.) check if target exists
		return pfs.exists(targetPath).then((exists) => {
			let isCaseRename = sourcePath.toLowerCase() === targetPath.toLowerCase();
			let isSameFile = sourcePath === targetPath;

			// Return early with conflict if target exists and we are not told to overwrite
			if (exists && !isCaseRename && !overwrite) {
				return TPromise.wrapError(<IFileOperationResult>{
					fileOperationResult: FileOperationResult.FILE_MOVE_CONFLICT
				});
			}

			// 2.) make sure target is deleted before we move/copy unless this is a case rename of the same file
			let deleteTargetPromise = TPromise.as(null);
			if (exists && !isCaseRename) {
				if (basePaths.isEqualOrParent(sourcePath, targetPath)) {
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

	public importFile(source: uri, targetFolder: uri): TPromise<IImportResult> {
		return TPromise.wrapError(<IFileOperationResult>{
			message: 'githubFileService.importFile not implemented (' + source.toString(true) + ')',
			fileOperationResult: FileOperationResult.FILE_NOT_FOUND
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
				return this.resolve(targetResource).then((stat) => <IImportResult>{ isNew: !exists, stat: stat });
			});
		});
		*/
	}

	public del(resource: uri): TPromise<void> {
		let absPath = this.toAbsolutePath(resource);
		if (absPath[0] == '/')
			absPath = absPath.slice(1, absPath.length);
		return new TPromise<void>((c) => {
			return this.deleteGithubFile(absPath).then(() => {
				c(<void>null);
			});
		});
	}

	// Helpers

	private toAbsolutePath(arg1: uri | IFileStat): string {
		let resource: uri;
		if (arg1 instanceof uri) {
			resource = <uri>arg1;
		} else {
			resource = (<IFileStat>arg1).resource;
		}

		return paths.normalize(resource.fsPath);
	}

	private resolve(resource: uri, options: IResolveFileOptions = Object.create(null)): TPromise<IFileStat> {
		if (this.isGistPath(resource)) {
			return this.resolveGistFile(resource, options);
		} else {
			return this.toStatResolver(resource).then(model => model.resolve(options));
		}
	}

	private toStatResolver(resource: uri): TPromise<StatResolver> {
		let absolutePath = this.toAbsolutePath(resource);
		return new TPromise<StatResolver>((c, e) => {
			this.cache.stat(absolutePath, (error: Error, result: IGithubTreeStat) => {
				if (error) {
					e(error)
				} else {
					c(new StatResolver(this.cache, resource, result, this.options.verboseLogging));
				}
			});
		});
	}

	private isGistPath(resource: uri) : boolean
	{
		// /$gist/<gist description property>/<filename>
		return this.options.gistRegEx && this.options.gistRegEx.test(this.toAbsolutePath(resource));
	}

	private findGist(resource: uri) : TPromise<GistInfo> {
		return new TPromise<GistInfo>((c, e) => {
			if (!this.githubService.isAuthenticated()) {
				// We don't have access to the current paths.makeAbsoluteuser's Gists.
				e({ path: resource.path, error: "not authenticated" });
				return;
			}

			let user: User = this.githubService.github.getUser();
			user.gists((err: GithubError, gists?: Gist[]) => {
				// Github api error
				if (err) {
					console.log('Error user.gists api ' + resource.path + ": " + err);
					e(err);
					return;
				}

				// 0 = '', 1 = '$gist', 2 = description, 3 = filename
				let parts = this.toAbsolutePath(resource).split('/');

				// Find the raw url referenced by the path
				for (let i = 0; i < gists.length; i++) {
					let gist = gists[i];
					if (gist.description !== parts[2]) {
						continue;
					}
					for (let filename in gist.files) {
						if (filename === parts[3]) {
							c({gist: gist, fileExists: true});
							return;
						}
					}
					c({gist: gist, fileExists: false});
					return;
				}
				c({gist: null, fileExists: false});
			});
		});
    }

	private resolveGistFile(resource: uri, options: IResolveFileOptions): TPromise<IFileStat> {
		return new TPromise<IFileStat>((c, e) => {
			this.findGist(resource).then((info) => {
				// Gist found but if file doesn't exist, error.
				if (!info.gist || !info.fileExists) {
					e(FileOperationResult.FILE_NOT_FOUND);
					return;
				}

				// 0 = '', 1 = '$gist', 2 = description, 3 = filename
				let parts = this.toAbsolutePath(resource).split('/');

				// Github is not returning Access-Control-Expose-Headers: ETag, so we
				// don't have access to that header in the response. Make
				// up an ETag. ETags don't have format dependencies.
				let size = info.gist.files[parts[3]].size;
				let etag: string = info.gist.updated_at + size;
				let stat: IFileStat = {
					resource: uri.file(resource.path),
					isDirectory: false,
					hasChildren: false,
					name: parts[2],
					mtime: Date.parse(info.gist.updated_at),
					etag: etag,
					size: size,
					mime: info.gist.files[parts[3]].type
				};

				// Extra data to return to the caller, for getting content
				(<any>stat).url = info.gist.files[parts[3]].raw_url;
				c(stat);

			}, (error: GithubError) => {
				e(FileOperationResult.FILE_NOT_FOUND);
			});
		});
	}

	private resolveFileContent(resource: uri, etag?: string, enc?: string): TPromise<IContent> {
		let absolutePath = this.toAbsolutePath(resource);

		return this.resolve(resource).then((model): TPromise<IContent> => {

			// Return early if file not modified since
			if (etag && etag === model.etag) {
				return TPromise.wrapError(<IFileOperationResult>{
					fileOperationResult: FileOperationResult.FILE_NOT_MODIFIED_SINCE
				});
			}

			// Return early if file is too large to load
			if (types.isNumber(model.size) && model.size > MAX_FILE_SIZE) {
				return TPromise.wrapError(<IFileOperationResult>{
					fileOperationResult: FileOperationResult.FILE_TOO_LARGE
				});
			}

			// Prepare result
			let result: IContent = {
				resource: model.resource,
				name: model.name,
				mtime: model.mtime,
				etag: model.etag,
				mime: model.mime,
				value: undefined,
				encoding: encoding.UTF8 // TODO
			};

			// Either a gist file or a repo file
			return new TPromise<IContent>((c, e) => {
				if ((<any>model).submodule_git_url) {
					result.value = 'Submodule URL: ' + (<any>model).submodule_git_url + '\nCommit SHA: ' + model.etag;
					c(result);
				} else if (this.isGistPath(resource)) {
					// Gist urls don't require authentication
					let url = (<any>model).url;
					this.requestService.makeRequest({ url }).then((res: http.IXHRResponse) => {
						if (res.status == 200) {
							result.value = res.responseText;
							c(result);
						} else {
							console.log('Http error: ' + http.getErrorStatusDescription(res.status) + ' url: ' + url);
							e(FileOperationResult.FILE_NOT_FOUND);
						}
					});
				} else {
					// Regular repo file
					this.repo.getBlobRaw(model.etag, (err: GithubError, content: string | boolean) => {
						if (!err) {
							// The GitHub API wrapper we uses returns the boolean true for content when there is none!!
							result.value = content == true ? '' : <string>content;
							c(result);
						} else {
							console.log('repo.getBlob error using sha ' + model.etag);
							e(FileOperationResult.FILE_NOT_FOUND);
						}
					});
				}
			});
		}, (error) => {
			return TPromise.wrapError(<IFileOperationResult>{
				fileOperationResult: FileOperationResult.FILE_NOT_FOUND
			});
		});
	}

	private resolveFileStreamContent(resource: uri, etag?: string, enc?: string): TPromise<IStreamContent> {
		return this.resolveFileContent(resource, etag, enc).then<IStreamContent>(content => {
			let streamContent: IStreamContent = <any>content;
			streamContent.value = new StringStream(content.value);
			return TPromise.as(streamContent);
		});
	}

/*
	private resolveFileStreamContent(resource: uri, etag?: string, enc?: string): TPromise<IStreamContent> {
		let absolutePath = this.toAbsolutePath(resource);

		return this.resolve(resource).then((model): TPromise<IStreamContent> => {

			// Return early if file not modified since
			if (etag && etag === model.etag) {
				return TPromise.wrapError(<IFileOperationResult>{
					fileOperationResult: FileOperationResult.FILE_NOT_MODIFIED_SINCE
				});
			}

			// Return early if file is too large to load
			if (types.isNumber(model.size) && model.size > MAX_FILE_SIZE) {
				return TPromise.wrapError(<IFileOperationResult>{
					fileOperationResult: FileOperationResult.FILE_TOO_LARGE
				});
			}

			let fileEncoding = this.getEncoding(model.resource, enc);

			const reader = fs.createReadStream(absolutePath).pipe(encoding.decodeStream(fileEncoding)); // decode takes care of stripping any BOMs from the file content

			let content: IStreamContent = <any>model;
			content.value = reader;
			content.encoding = fileEncoding; // make sure to store the encoding in the model to restore it later when writing

			return TPromise.as(content);
		});
	}

	private resolveFileContent(resource: uri, etag?: string, enc?: string): TPromise<IContent> {
		return this.resolveFileStreamContent(resource, etag, enc).then((streamContent) => {
			return new TPromise<IContent>((c, e) => {
				let done = false;
				let chunks: string[] = [];

				streamContent.value.on('data', (buf) => {
					chunks.push(buf);
				});

				streamContent.value.on('error', (error) => {
					if (!done) {
						done = true;
						e(error);
					}
				});

				streamContent.value.on('end', () => {
					let content: IContent = <any>streamContent;
					content.value = chunks.join('');

					if (!done) {
						done = true;
						c(content);
					}
				});
			});
		});
	}
	*/

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

	private checkFile(absolutePath: string, options: IUpdateContentOptions): TPromise<boolean /* exists */> {
		return TPromise.as(true);

		/* TODO: full implementation
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
							return TPromise.wrapError(<IFileOperationResult>{
								message: 'File Modified Since',
								fileOperationResult: FileOperationResult.FILE_MODIFIED_SINCE
							});
						}
					}

					let mode = stat.mode;
					let readonly = !(mode & 128);

					// Throw if file is readonly and we are not instructed to overwrite
					if (readonly && !options.overwriteReadonly) {
						return TPromise.wrapError(<IFileOperationResult>{
							message: nls.localize('fileReadOnlyError', "File is Read Only"),
							fileOperationResult: FileOperationResult.FILE_READ_ONLY
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
					type: FileChangeType.UPDATED,
					path: fsPath
				});

				// handle emit through delayer to accommodate for bulk changes
				this.fileChangesWatchDelayer.trigger(() => {
					let buffer = this.undeliveredRawFileChangesEvents;
					this.undeliveredRawFileChangesEvents = [];

					// Normalize
					let normalizedEvents = normalize(buffer);

					// Emit
					this.eventEmitter.emit(EventType.FILE_CHANGES, toFileChangesEvent(normalizedEvents));

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

export class StatResolver {
	private isDirectory: boolean;
	private mtime: number;
	private name: string;
	private mime: string;
	private etag: string;
	private size: number;

	constructor(private cache: IGithubTreeCache, private resource: uri, private stat: IGithubTreeStat, private verboseLogging: boolean) {
		// TODO: assert.ok(resource && resource.scheme === 'file', 'Invalid resource: ' + resource);

		this.isDirectory = stat.isDirectory();
		this.mtime = this.cache.getFakeMtime();
		this.name = paths.basename(resource.fsPath);
		this.mime = !this.isDirectory ? baseMime.guessMimeTypes(resource.fsPath).join(', ') : null;
		// this.etag = etag(size, mtime);
		this.etag = stat.sha;
		this.size = stat.size;
	}

	private addGithubFields(fileStat: IFileStat, githubStat: IGithubTreeStat) {
		if (githubStat.isSymbolicLink()) {
			(<any>fileStat).type = 'symlink';
		}
		if (githubStat.submodule_git_url) {
			(<any>fileStat).type = 'submodule';
			(<any>fileStat).submodule_git_url = githubStat.submodule_git_url;
		}
	}

	public resolve(options: IResolveFileOptions): TPromise<IFileStat> {

		// General Data
		let fileStat: IFileStat = {
			resource: this.resource,
			isDirectory: this.isDirectory,
			hasChildren: undefined,
			name: this.name,
			etag: this.etag,
			size: this.size,
			mtime: this.mtime,
			mime: this.mime
		};

		// Add github fields
		this.addGithubFields(fileStat, this.stat);

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

	private resolveChildren(absolutePath: string, absoluteTargetPaths: string[], resolveSingleChildDescendants: boolean, callback: (children: IFileStat[]) => void): void {
		// extfs.readdir(absolutePath, (error: Error, files: string[]) => {
		this.cache.readdir(absolutePath, (error: Error, files: string[]) => {
			if (error) {
				if (this.verboseLogging) {
					console.error(error);
				}

				return callback(null); // return - we might not have permissions to read the folder
			}

			// for each file in the folder
			flow.parallel(files, (file: string, clb: (error: Error, children: IFileStat) => void) => {
				//let fileResource = uri.file(paths.resolve(absolutePath, file));
				let fileResource = uri.file(paths.makePosixAbsolute(paths.join(absolutePath, file)));
				// let fileStat: fs.Stats;
				let fileStat: IGithubTreeStat;
				let $this = this;

				flow.sequence(
					function onError(error: Error): void {
						if ($this.verboseLogging) {
							console.error(error);
						}

						clb(null, null); // return - we might not have permissions to read the folder or stat the file
					},

					function stat(): void {
						// fs.stat(fileResource.fsPath, this);
						$this.cache.stat(fileResource.fsPath, this);
					},

					// function countChildren(fsstat: fs.stats): void {
					function countChildren(fsstat: IGithubTreeStat): void {
						fileStat = fsstat;

						if (fileStat.isDirectory()) {
							// extfs.readdir(fileResource.fsPath, (error, result) => {
							$this.cache.readdir(fileResource.fsPath, (error, result) => {
								this(null, result ? result.length : 0);
							});
						} else {
							this(null, 0);
						}
					},

					function resolve(childCount: number): void {
						let childStat: IFileStat = {
							resource: fileResource,
							isDirectory: fileStat.isDirectory(),
							hasChildren: childCount > 0,
							name: file,
							// mtime: fileStat.mtime.getTime(),
							// etag: etag(fileStat)
							mtime: $this.cache.getFakeMtime(),
							etag: fileStat.sha,
							size: fileStat.size,
							mime: !fileStat.isDirectory() ? baseMime.guessMimeTypes(fileResource.fsPath).join(', ') : undefined
						};

						// Add github fields
						$this.addGithubFields(childStat, fileStat);

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

class StringStream implements IStringStream {
	constructor(private value: string) {}

	on(event: string, callback: any): void {
		switch (event) {
			case 'data':
				callback(this.value);
				break;

			case 'error':
				break;

			case 'end':
				callback();
		}
	}
}
