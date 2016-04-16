/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/files/common/files', 'vs/base/common/arrays', 'vs/base/common/winjs.base', 'vs/base/common/objects', 'vs/base/common/async', 'vs/base/common/uri'], function (require, exports, files, arrays, winjs_base_1, objects, async_1, uri_1) {
    'use strict';
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
    var FileService = (function () {
        // TODO: private undeliveredRawFileChangesEvents: IRawFileChange[];
        function FileService(basePath, options, eventEmitter) {
            this.eventEmitter = eventEmitter;
            this.serviceId = files.IFileService;
            /* TODO:
            this.basePath = basePath ? paths.normalize(basePath) : void 0;
    
            if (this.basePath && this.basePath.indexOf('\\\\') === 0 && strings.endsWith(this.basePath, paths.sep)) {
                // for some weird reason, node adds a trailing slash to UNC paths
                // we never ever want trailing slashes as our base path unless
                // someone opens root ("/").
                // See also https://github.com/nodejs/io.js/issues/1765
                this.basePath = strings.rtrim(this.basePath, paths.sep);
            }
    
            if (this.basePath && !paths.isAbsolute(basePath)) {
                throw new Error('basePath has to be an absolute path');
            }
    
            this.options = options || Object.create(null);
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
        FileService.prototype.updateOptions = function (options) {
            if (options) {
                objects.mixin(this.options, options); // overwrite current options
            }
        };
        FileService.prototype.setupWin32WorkspaceWatching = function () {
            /* TODO:
            this.workspaceWatcherToDispose = new WindowsWatcherService(this.basePath, this.options.watcherIgnoredPatterns, this.eventEmitter, this.options.errorLogger, this.options.verboseLogging).startWatching();
            */
        };
        FileService.prototype.setupUnixWorkspaceWatching = function () {
            /* TODO:
            this.workspaceWatcherToDispose = new UnixWatcherService(this.basePath, this.options.watcherIgnoredPatterns, this.eventEmitter, this.options.errorLogger, this.options.verboseLogging).startWatching();
            */
        };
        FileService.prototype.resolveFile = function (resource, options) {
            return this.resolve(resource, options);
        };
        FileService.prototype.resolveContent = function (resource, options) {
            return winjs_base_1.TPromise.wrapError({
                message: 'githubFileService.resolveContent not implemented (' + resource.toString(true) + ')',
                fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
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
        };
        FileService.prototype.resolveContents = function (resources) {
            var _this = this;
            var limiter = new async_1.Limiter(FileService.MAX_DEGREE_OF_PARALLEL_FS_OPS);
            var contentPromises = [];
            resources.forEach(function (resource) {
                contentPromises.push(limiter.queue(function () { return _this.resolveFileContent(resource).then(function (content) { return content; }, function (error) { return winjs_base_1.TPromise.as(null /* ignore errors gracefully */); }); }));
            });
            return winjs_base_1.TPromise.join(contentPromises).then(function (contents) {
                return arrays.coalesce(contents);
            });
        };
        FileService.prototype.updateContent = function (resource, value, options) {
            if (options === void 0) { options = Object.create(null); }
            return winjs_base_1.TPromise.wrapError({
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
        };
        FileService.prototype.createFile = function (resource, content) {
            if (content === void 0) { content = ''; }
            return this.updateContent(resource, content);
        };
        FileService.prototype.createFolder = function (resource) {
            return winjs_base_1.TPromise.wrapError({
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
        };
        FileService.prototype.rename = function (resource, newName) {
            return winjs_base_1.TPromise.wrapError({
                message: 'githubFileService.rename not implemented (' + resource.toString(true) + ')',
                fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
            });
            /* TODO:
            let newPath = paths.join(paths.dirname(resource.fsPath), newName);
    
            return this.moveFile(resource, uri.file(newPath));
            */
        };
        FileService.prototype.moveFile = function (source, target, overwrite) {
            return this.moveOrCopyFile(source, target, false, overwrite);
        };
        FileService.prototype.copyFile = function (source, target, overwrite) {
            return this.moveOrCopyFile(source, target, true, overwrite);
        };
        FileService.prototype.moveOrCopyFile = function (source, target, keepCopy, overwrite) {
            var _this = this;
            var sourcePath = this.toAbsolutePath(source);
            var targetPath = this.toAbsolutePath(target);
            // 1.) move / copy
            return this.doMoveOrCopyFile(sourcePath, targetPath, keepCopy, overwrite).then(function () {
                // 2.) resolve
                return _this.resolve(target);
            });
        };
        FileService.prototype.doMoveOrCopyFile = function (sourcePath, targetPath, keepCopy, overwrite) {
            return winjs_base_1.TPromise.wrapError({
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
        };
        FileService.prototype.importFile = function (source, targetFolder) {
            return winjs_base_1.TPromise.wrapError({
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
        };
        FileService.prototype.del = function (resource) {
            console.log('githubFileService.del not implemented (' + resource.toString(true) + ')');
            return winjs_base_1.TPromise.as(null);
            /* TODO:
            let absolutePath = this.toAbsolutePath(resource);
    
            return nfcall(extfs.del, absolutePath, this.tmpPath);
            */
        };
        // Helpers
        FileService.prototype.toAbsolutePath = function (arg1) {
            console.log('githubFileService.toAbsolutePath not implemented (' + arg1.toString(true) + ')');
            return null;
            /* TODO:
            let resource: uri;
            if (arg1 instanceof uri) {
                resource = <uri>arg1;
            } else {
                resource = (<files.IFileStat>arg1).resource;
            }
    
            assert.ok(resource && resource.scheme === 'file', 'Invalid resource: ' + resource);
    
            return paths.normalize(resource.fsPath);
            */
        };
        FileService.prototype.resolve = function (resource, options) {
            if (options === void 0) { options = Object.create(null); }
            return this.toStatResolver(resource)
                .then(function (model) { return model.resolve(options); });
        };
        FileService.prototype.toStatResolver = function (resource) {
            return winjs_base_1.TPromise.wrapError({
                message: 'githubFileService.toStatResolver not implemented (' + resource.toString(true) + ')',
                fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
            });
            /* TODO:
            let absolutePath = this.toAbsolutePath(resource);
    
            return pfs.stat(absolutePath).then((stat: fs.Stats) => {
                return new StatResolver(resource, stat.isDirectory(), stat.mtime.getTime(), stat.size, this.options.verboseLogging);
            });
            */
        };
        FileService.prototype.resolveFileContent = function (resource, etag, enc) {
            return winjs_base_1.TPromise.wrapError({
                message: 'githubFileService.resolveFileContent not implemented (' + resource.toString(true) + ')',
                fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
            });
            /* TODO:
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
                    let done = false;
                    let chunks: NodeBuffer[] = [];
                    let fileEncoding = this.getEncoding(model.resource, enc);
    
                    const reader = fs.createReadStream(absolutePath).pipe(encoding.decodeStream(fileEncoding)); // decode takes care of stripping any BOMs from the file content
    
                    reader.on('data', (buf) => {
                        chunks.push(buf);
                    });
    
                    reader.on('error', (error) => {
                        if (!done) {
                            done = true;
                            e(error);
                        }
                    });
    
                    reader.on('end', () => {
                        let content: files.IContent = <any>model;
                        content.value = chunks.join('');
                        content.encoding = fileEncoding; // make sure to store the encoding in the model to restore it later when writing
    
                        if (!done) {
                            done = true;
                            c(content);
                        }
                    });
                });
            });
            */
        };
        FileService.prototype.getEncoding = function (resource, preferredEncoding) {
            var fileEncoding;
            var override = this.getEncodingOverride(resource);
            if (override) {
                fileEncoding = override;
            }
            else if (preferredEncoding) {
                fileEncoding = preferredEncoding;
            }
            else {
                fileEncoding = this.options.encoding;
            }
            /* TODO:
            if (!fileEncoding || !encoding.encodingExists(fileEncoding)) {
                fileEncoding = encoding.UTF8; // the default is UTF 8
            }
            */
            return fileEncoding;
        };
        FileService.prototype.getEncodingOverride = function (resource) {
            if (resource && this.options.encodingOverride && this.options.encodingOverride.length) {
                for (var i = 0; i < this.options.encodingOverride.length; i++) {
                    var override = this.options.encodingOverride[i];
                    // check if the resource is a child of the resource with override and use
                    // the provided encoding in that case
                    if (resource.toString().indexOf(override.resource.toString() + '/') === 0) {
                        return override.encoding;
                    }
                }
            }
            return null;
        };
        FileService.prototype.checkFile = function (absolutePath, options) {
            return winjs_base_1.TPromise.wrapError({
                message: 'githubFileService.resolveFileContent not implemented (' + absolutePath + ')',
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
        };
        FileService.prototype.watchFileChanges = function (resource) {
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
        };
        FileService.prototype.unwatchFileChanges = function (arg1) {
            var resource = (typeof arg1 === 'string') ? uri_1.default.parse(arg1) : arg1;
            console.log('githubFileService.unwatchFileChanges not implemented (' + resource + ')');
            /* TODO:
            let watcher = this.activeFileChangesWatchers[resource.toString()];
            if (watcher) {
                watcher.close();
                delete this.activeFileChangesWatchers[resource.toString()];
            }
            */
        };
        FileService.prototype.dispose = function () {
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
        };
        FileService.FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
        FileService.MAX_DEGREE_OF_PARALLEL_FS_OPS = 10; // degree of parallel fs calls that we accept at the same time
        return FileService;
    }());
    exports.FileService = FileService;
    var StatResolver = (function () {
        function StatResolver(resource, isDirectory, mtime, size, verboseLogging) {
            console.log('githubFileService.StarResolver constructor not implemented');
            /* TODO:
            assert.ok(resource && resource.scheme === 'file', 'Invalid resource: ' + resource);
    
            this.resource = resource;
            this.isDirectory = isDirectory;
            this.mtime = mtime;
            this.name = paths.basename(resource.fsPath);
            this.mime = !this.isDirectory ? baseMime.guessMimeTypes(resource.fsPath).join(', ') : null;
            this.etag = etag(size, mtime);
            this.size = size;
    
            this.verboseLogging = verboseLogging;
            */
        }
        StatResolver.prototype.resolve = function (options) {
            var _this = this;
            // General Data
            var fileStat = {
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
                return winjs_base_1.TPromise.as(fileStat);
            }
            else {
                // Convert the paths from options.resolveTo to absolute paths
                var absoluteTargetPaths_1 = null;
                if (options && options.resolveTo) {
                    absoluteTargetPaths_1 = [];
                    options.resolveTo.forEach(function (resource) {
                        absoluteTargetPaths_1.push(resource.fsPath);
                    });
                }
                return new winjs_base_1.TPromise(function (c, e) {
                    // Load children
                    _this.resolveChildren(_this.resource.fsPath, absoluteTargetPaths_1, options && options.resolveSingleChildDescendants, function (children) {
                        children = arrays.coalesce(children); // we don't want those null children (could be permission denied when reading a child)
                        fileStat.hasChildren = children && children.length > 0;
                        fileStat.children = children || [];
                        c(fileStat);
                    });
                });
            }
        };
        StatResolver.prototype.resolveChildren = function (absolutePath, absoluteTargetPaths, resolveSingleChildDescendants, callback) {
            console.log('githubFileService.resolveChildren not implemented (' + absolutePath + ')');
            /* TODO:
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
                            } else if (childCount > 0 && absoluteTargetPaths && absoluteTargetPaths.some((targetPath) => basePaths.isEqualOrParent(targetPath, fileResource.fsPath))) {
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
            */
        };
        return StatResolver;
    }());
    exports.StatResolver = StatResolver;
});
//# sourceMappingURL=githubFileService.js.map