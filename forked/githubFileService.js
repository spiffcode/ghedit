/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'forked/flow', 'vs/workbench/parts/files/common/files', 'vs/workbench/parts/files/common/explorerViewModel', 'vs/platform/files/common/files', 'vs/base/common/arrays', 'vs/base/common/mime', 'vs/base/common/paths', 'vs/base/common/winjs.base', 'vs/base/common/types', 'vs/base/common/objects', 'vs/base/common/async', 'vs/base/common/uri', 'vs/nls', 'vs/base/common/http'], function (require, exports, flow, Files, explorerViewModel_1, files, arrays, baseMime, paths, winjs_base_1, types, objects, async_1, uri_1, nls, http) {
    'use strict';
    var github = require('lib/github');
    // TODO: Use vs/base/node/encoding replacement.
    var encoding = {
        UTF8: 'utf8',
        UTF8_with_bom: 'utf8bom',
        UTF16be: 'utf16be',
        UTF16le: 'utf16le',
    };
    function etag(arg1, arg2) {
        var size;
        var mtime;
        if (typeof arg2 === 'number') {
            size = arg1;
            mtime = arg2;
        }
        else {
            throw new Error('etag(fs.Stat) not implemented');
        }
        // TODO: non-Node crypto
        return '"' + String(size) + String(mtime) + '"';
    }
    var FileService = (function () {
        // TODO: private undeliveredRawFileChangesEvents: IRawFileChange[];
        function FileService(basePath, options, eventEmitter, requestService, githubService, contextService) {
            this.eventEmitter = eventEmitter;
            this.requestService = requestService;
            this.githubService = githubService;
            this.contextService = contextService;
            this.serviceId = files.IFileService;
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
            this.workspaceWatcherToDispose = new UnixWatcherService(this.basePath, this.options.watcherIgnoredPatterns, this.eventEmitter, this.options.errorLogger, this.options.verboseLogging, this.options.debugBrkFileWatcherPort).startWatching();
            */
        };
        FileService.prototype.resolveFile = function (resource, options) {
            return this.resolve(resource, options);
        };
        FileService.prototype.existsFile = function (resource) {
            return this.resolveFile(resource).then(function () { return true; }, function () { return false; });
        };
        FileService.prototype.resolveContent = function (resource, options) {
            var preferredEncoding;
            if (options && options.encoding) {
                preferredEncoding = options.encoding; // give passed in encoding highest priority
            }
            else if (this.options.encoding === encoding.UTF8_with_bom) {
                preferredEncoding = encoding.UTF8; // if we did not detect UTF 8 BOM before, this can only be UTF 8 then
            }
            return this.resolveFileContent(resource, options && options.etag, preferredEncoding);
            // set our knowledge about the mime on the content obj
            // TODO:			content.mime = detected.mimes.join(', ');
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
            if (this.isGistPath(resource)) {
                return this.updateGistContent(resource, value, options);
            }
            else {
                return this.updateRepoContent(resource, value, options);
            }
        };
        FileService.prototype.updateGist = function (info, description, filename, value) {
            // Cases are:
            // 1. gist with description exists, file in gist exists.
            // 2. gist with description exists, file doesn't exist.
            // 3. gist with description doesn't exist.
            return new winjs_base_1.TPromise(function (c, e) {
                var data = {
                    description: description,
                    public: false,
                    files: {}
                };
                data.files[filename] = { content: value };
                // Gist exists?
                if (info.gist) {
                    // Gists exists. Update it.
                    var gist = new github.Gist({ id: info.gist.id });
                    gist.update(data, function (err) {
                        if (err) {
                            e(err);
                        }
                        else {
                            c(true);
                        }
                    });
                }
                else {
                    // Create
                    var gist = new github.Gist({});
                    gist.create(data, function (err) {
                        if (err) {
                            e(err);
                        }
                        else {
                            c(true);
                        }
                    });
                }
            });
        };
        FileService.prototype.updateGistContent = function (resource, value, options) {
            var _this = this;
            // 0 = '', 1 = '$gist', 2 = description, 3 = filename
            var absolutePath = this.toAbsolutePath(resource);
            var parts = absolutePath.split('/');
            return new winjs_base_1.TPromise(function (c, e) {
                _this.findGist(resource).then(function (info) {
                    // 1.) check file
                    return _this.checkFile(absolutePath, options).then(function (exists) {
                        var encodingToWrite = _this.getEncoding(resource, options.encoding);
                        var addBomPromise = winjs_base_1.TPromise.as(false);
                        // UTF_16 BE and LE as well as UTF_8 with BOM always have a BOM
                        if (encodingToWrite === encoding.UTF16be || encodingToWrite === encoding.UTF16le || encodingToWrite === encoding.UTF8_with_bom) {
                            addBomPromise = winjs_base_1.TPromise.as(true);
                        }
                        else if (exists && encodingToWrite === encoding.UTF8) {
                            // TODO: Node-independent detectEncodingByBOM
                            // if (options.overwriteEncoding) {
                            // 	addBomPromise = TPromise.as(false); // if we are to overwrite the encoding, we do not preserve it if found
                            // } else {
                            // 	addBomPromise = nfcall(encoding.detectEncodingByBOM, absolutePath).then((enc) => enc === encoding.UTF8); // otherwise preserve it if found
                            // }
                            addBomPromise = winjs_base_1.TPromise.as(false);
                        }
                        // 3.) check to add UTF BOM
                        return addBomPromise.then(function (addBom) {
                            var writeFilePromise = winjs_base_1.TPromise.as(false);
                            // Write fast if we do UTF 8 without BOM
                            if (!addBom && encodingToWrite === encoding.UTF8) {
                                writeFilePromise = _this.updateGist(info, parts[2], parts[3], value).then(function () {
                                    // Is this one of the settings files that requires change notification?
                                    if (_this.options.settingsNotificationPaths) {
                                        var notify = false;
                                        for (var i = 0; i < _this.options.settingsNotificationPaths.length; i++) {
                                            if (absolutePath === _this.options.settingsNotificationPaths[i]) {
                                                notify = true;
                                                break;
                                            }
                                        }
                                        if (notify) {
                                            setTimeout(function () { _this.eventEmitter.emit("settingsFileChanged"); }, 0);
                                        }
                                    }
                                    return true;
                                }, function (error) {
                                    console.log('failed to gist.update ' + resource.toString(true));
                                });
                            }
                            else {
                                throw new Error('githubFileService.updateContent with non-UTF8 encoding not implemented yet');
                            }
                            // 4.) set contents
                            return writeFilePromise.then(function () {
                                _this.resolve(resource).then(function (result) {
                                    c(result);
                                }, function (error) {
                                    e(error);
                                });
                            });
                        });
                    });
                }, function (error) {
                    return winjs_base_1.TPromise.wrapError({
                        fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
                    });
                });
            });
        };
        FileService.prototype.updateRepoContent = function (resource, value, options) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(resource);
            // 1.) check file
            return this.checkFile(absolutePath, options).then(function (exists) {
                var encodingToWrite = _this.getEncoding(resource, options.encoding);
                var addBomPromise = winjs_base_1.TPromise.as(false);
                // UTF_16 BE and LE as well as UTF_8 with BOM always have a BOM
                if (encodingToWrite === encoding.UTF16be || encodingToWrite === encoding.UTF16le || encodingToWrite === encoding.UTF8_with_bom) {
                    addBomPromise = winjs_base_1.TPromise.as(true);
                }
                else if (exists && encodingToWrite === encoding.UTF8) {
                    /* TODO: Node-independent detectEncodingByBOM
                    if (options.overwriteEncoding) {
                        addBomPromise = TPromise.as(false); // if we are to overwrite the encoding, we do not preserve it if found
                    } else {
                        addBomPromise = nfcall(encoding.detectEncodingByBOM, absolutePath).then((enc) => enc === encoding.UTF8); // otherwise preserve it if found
                    }*/
                    addBomPromise = winjs_base_1.TPromise.as(false);
                }
                // 3.) check to add UTF BOM
                return addBomPromise.then(function (addBom) {
                    var writeFilePromise;
                    // Write fast if we do UTF 8 without BOM
                    if (!addBom && encodingToWrite === encoding.UTF8) {
                        // TODO:			writeFilePromise = pfs.writeFile(absolutePath, value, encoding.UTF8);
                        writeFilePromise = new winjs_base_1.TPromise(function (c, e) {
                            var path = resource.path.slice(1);
                            var commitMessage = _this.options.commitMessage || 'Update ' + path;
                            _this.repo.write(_this.ref, path, value, commitMessage, { encode: true }, function (err) {
                                err ? e(err) : c(null);
                            });
                        }).then(function () {
                            _this.cache.markDirty();
                            return;
                        }, function (error) {
                            console.log('failed to repo.write ' + resource.toString(true));
                        });
                    }
                    else {
                        throw new Error('githubFileService.updateContent with non-UTF8 encoding not implemented yet');
                    }
                    // 4.) set contents
                    return writeFilePromise.then(function () {
                        // 5.) resolve
                        return _this.resolve(resource);
                    });
                });
            });
        };
        FileService.prototype.createFile = function (resource, content) {
            if (content === void 0) { content = ''; }
            return this.updateContent(resource, content);
        };
        FileService.prototype.createFolder = function (resource) {
            var _this = this;
            var path = this.toAbsolutePath(resource);
            if (path[0] == '/')
                path = path.slice(1, path.length);
            var newPath = paths.join(paths.dirname(path + '/'), ".keepdir");
            return this.createFile(uri_1.default.file(newPath), 'Git requires at least 1 file to be present in a folder.').then(function (stat) {
                _this.forceExplorerViewRefresh();
                return stat;
            }, function (err) {
                return err;
            });
        };
        FileService.prototype.rename = function (resource, newName) {
            var _this = this;
            var oldPath = this.toAbsolutePath(resource);
            if (oldPath[0] == '/')
                oldPath = oldPath.slice(1, oldPath.length);
            var newPath = paths.join(paths.dirname(oldPath), newName);
            return this.moveGithubFile(oldPath, newPath).then(function () {
                return _this.resolveFile(uri_1.default.file(newPath));
            }, function () {
                console.log('failed to rename file ' + resource.toString(true));
                return winjs_base_1.TPromise.as(false);
            });
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
        FileService.prototype.forceExplorerViewRefresh = function () {
            // Should be part of fileActions.ts, trying not to 'fork' that file because it is imported in
            // many places.
            var event = new Files.LocalFileChangeEvent(new explorerViewModel_1.FileStat(this.contextService.getWorkspace().resource, true, true), new explorerViewModel_1.FileStat(this.contextService.getWorkspace().resource, true, true));
            this.eventEmitter.emit('files.internal:fileChanged', event);
        };
        FileService.prototype.deleteGithubFile = function (sourcePath) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                _this.repo.delete(_this.ref, sourcePath, function (err) {
                    err ? e(err) : c(null);
                });
            }).then(function () {
                // When the last file of a git directory is deleted, that directory is no longer part
                // of the repo. Refresh the entire explorer view to catch this case.
                _this.cache.markDirty();
                _this.forceExplorerViewRefresh();
                return true;
            }, function (error) {
                console.log('failed to delete file ' + sourcePath);
                return false;
            });
        };
        FileService.prototype.copyGithubFile = function (sourcePath, targetPath) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                return _this.resolveFileContent(uri_1.default.file(sourcePath)).then(function (content) {
                    return _this.updateContent(uri_1.default.file(targetPath), content.value).then(function () {
                        c(true);
                    }, function () {
                        c(false);
                    });
                });
            });
        };
        FileService.prototype.moveGithubFile = function (sourcePath, targetPath) {
            var _this = this;
            return this.existsFile(uri_1.default.file(targetPath)).then(function (exists) {
                if (exists) {
                    return winjs_base_1.TPromise.wrapError({
                        fileOperationResult: files.FileOperationResult.FILE_MOVE_CONFLICT
                    });
                }
                return _this.copyGithubFile(sourcePath, targetPath).then(function (success) {
                    if (success) {
                        return _this.deleteGithubFile(sourcePath);
                    }
                    else {
                        return _this.deleteGithubFile(targetPath);
                    }
                });
            });
        };
        FileService.prototype.doMoveOrCopyFile = function (sourcePath, targetPath, keepCopy, overwrite) {
            /*
                    return TPromise.wrapError(<files.IFileOperationResult>{
                        message: 'githubFileService.doMoveOrCopyFile not implemented (' + sourcePath + ' -> ' + targetPath + ')',
                        fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
                    });
            */
            var _this = this;
            return this.existsFile(uri_1.default.file(targetPath)).then(function (exists) {
                var isCaseRename = sourcePath.toLowerCase() === targetPath.toLowerCase();
                var isSameFile = sourcePath === targetPath;
                // Return early with conflict if target exists and we are not told to overwrite
                if (exists && !isCaseRename && !overwrite) {
                    return winjs_base_1.TPromise.wrapError({
                        fileOperationResult: files.FileOperationResult.FILE_MOVE_CONFLICT
                    });
                }
                // 2.) make sure target is deleted before we move/copy unless this is a case rename of the same file
                var deleteTargetPromise = winjs_base_1.TPromise.as(null);
                if (exists && !isCaseRename) {
                    if (paths.isEqualOrParent(sourcePath, targetPath)) {
                        return winjs_base_1.TPromise.wrapError(nls.localize('unableToMoveCopyError', "Unable to move/copy. File would replace folder it is contained in.")); // catch this corner case!
                    }
                    deleteTargetPromise = _this.del(uri_1.default.file(targetPath));
                }
                return deleteTargetPromise.then(function () {
                    // Dir doesn't need to exist since this is git semantics not file system semantics
                    // TODO: 3.) make sure parents exists
                    // TODO: return pfs.mkdirp(paths.dirname(targetPath)).then(() => {
                    return winjs_base_1.TPromise.as(true).then(function () {
                        // 4.) copy/move
                        if (isSameFile) {
                            return winjs_base_1.TPromise.as(null);
                        }
                        else if (keepCopy) {
                            return _this.copyGithubFile(sourcePath, targetPath);
                        }
                        else {
                            return _this.moveGithubFile(sourcePath, targetPath);
                        }
                    }).then(function () { return exists; });
                });
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
            var _this = this;
            var absPath = this.toAbsolutePath(resource);
            if (absPath[0] == '/')
                absPath = absPath.slice(1, absPath.length);
            return new winjs_base_1.TPromise(function (c) {
                return _this.deleteGithubFile(absPath).then(function () {
                    c(null);
                });
            });
        };
        // Helpers
        FileService.prototype.toAbsolutePath = function (arg1) {
            var resource;
            if (arg1 instanceof uri_1.default) {
                resource = arg1;
            }
            else {
                resource = arg1.resource;
            }
            return paths.normalize(resource.fsPath);
        };
        FileService.prototype.resolve = function (resource, options) {
            if (options === void 0) { options = Object.create(null); }
            if (this.isGistPath(resource)) {
                return this.resolveGistFile(resource, options);
            }
            else {
                return this.toStatResolver(resource).then(function (model) { return model.resolve(options); });
            }
        };
        FileService.prototype.toStatResolver = function (resource) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(resource);
            return new winjs_base_1.TPromise(function (c, e) {
                _this.cache.stat(absolutePath, function (error, result) {
                    if (error) {
                        e(error);
                    }
                    else {
                        c(new StatResolver(_this.cache, resource, result, _this.options.verboseLogging));
                    }
                });
            });
        };
        FileService.prototype.isGistPath = function (resource) {
            // /$gist/<gist description property>/<filename>
            return this.options.gistRegEx && this.options.gistRegEx.test(this.toAbsolutePath(resource));
        };
        FileService.prototype.findGist = function (resource) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                if (!_this.githubService.isAuthenticated()) {
                    // We don't have access to the current paths.makeAbsoluteuser's Gists.
                    e({ path: resource.path, error: "not authenticated" });
                    return;
                }
                var user = _this.githubService.github.getUser();
                user.gists(function (err, gists) {
                    // Github api error
                    if (err) {
                        console.log('Error user.gists api ' + resource.path + ": " + err);
                        e(err);
                        return;
                    }
                    // 0 = '', 1 = '$gist', 2 = description, 3 = filename
                    var parts = _this.toAbsolutePath(resource).split('/');
                    // Find the raw url referenced by the path
                    for (var i = 0; i < gists.length; i++) {
                        var gist = gists[i];
                        if (gist.description !== parts[2]) {
                            continue;
                        }
                        for (var filename in gist.files) {
                            if (filename === parts[3]) {
                                c({ gist: gist, fileExists: true });
                                return;
                            }
                        }
                        c({ gist: gist, fileExists: false });
                        return;
                    }
                    c({ gist: null, fileExists: false });
                });
            });
        };
        FileService.prototype.resolveGistFile = function (resource, options) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                _this.findGist(resource).then(function (info) {
                    // Gist found but if file doesn't exist, error.
                    if (!info.gist || !info.fileExists) {
                        e(files.FileOperationResult.FILE_NOT_FOUND);
                        return;
                    }
                    // 0 = '', 1 = '$gist', 2 = description, 3 = filename
                    var parts = _this.toAbsolutePath(resource).split('/');
                    // Github is not returning Access-Control-Expose-Headers: ETag, so we
                    // don't have access to that header in the response. Make
                    // up an ETag. ETags don't have format dependencies.
                    var size = info.gist.files[parts[3]].size;
                    var etag = info.gist.updated_at + size;
                    var stat = {
                        resource: uri_1.default.file(resource.path),
                        isDirectory: false,
                        hasChildren: false,
                        name: parts[2],
                        mtime: Date.parse(info.gist.updated_at),
                        etag: etag,
                        size: size,
                        mime: info.gist.files[parts[3]].type
                    };
                    // Extra data to return to the caller, for getting content
                    stat.url = info.gist.files[parts[3]].raw_url;
                    c(stat);
                }, function (error) {
                    e(files.FileOperationResult.FILE_NOT_FOUND);
                });
            });
        };
        FileService.prototype.resolveFileContent = function (resource, etag, enc) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(resource);
            // 1.) stat
            return this.resolve(resource).then(function (model) {
                // Return early if file not modified since
                if (etag && etag === model.etag) {
                    return winjs_base_1.TPromise.wrapError({
                        fileOperationResult: files.FileOperationResult.FILE_NOT_MODIFIED_SINCE
                    });
                }
                // Return early if file is too large to load
                if (types.isNumber(model.size) && model.size > files.MAX_FILE_SIZE) {
                    return winjs_base_1.TPromise.wrapError({
                        fileOperationResult: files.FileOperationResult.FILE_TOO_LARGE
                    });
                }
                // Prepare result
                var result = {
                    resource: model.resource,
                    name: model.name,
                    mtime: model.mtime,
                    etag: model.etag,
                    mime: model.mime,
                    value: undefined,
                    encoding: encoding.UTF8 // TODO
                };
                // Either a gist file or a repo file
                return new winjs_base_1.TPromise(function (c, e) {
                    if (model.submodule_git_url) {
                        result.value = 'Submodule URL: ' + model.submodule_git_url + '\nCommit SHA: ' + model.etag;
                        c(result);
                    }
                    else if (_this.isGistPath(resource)) {
                        // Gist urls don't require authentication
                        var url_1 = model.url;
                        _this.requestService.makeRequest({ url: url_1 }).then(function (res) {
                            if (res.status == 200) {
                                result.value = res.responseText;
                                c(result);
                            }
                            else {
                                console.log('Http error: ' + http.getErrorStatusDescription(res.status) + ' url: ' + url_1);
                                e(files.FileOperationResult.FILE_NOT_FOUND);
                            }
                        });
                    }
                    else {
                        // Regular repo file
                        _this.repo.getBlobRaw(model.etag, function (err, content) {
                            if (!err) {
                                result.value = content;
                                c(result);
                            }
                            else {
                                console.log('repo.getBlob error using sha ' + model.etag);
                                e(files.FileOperationResult.FILE_NOT_FOUND);
                            }
                        });
                    }
                });
            }, function (error) {
                return winjs_base_1.TPromise.wrapError({
                    fileOperationResult: files.FileOperationResult.FILE_NOT_FOUND
                });
            });
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
            return winjs_base_1.TPromise.as(true);
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
        function StatResolver(cache, resource, stat, verboseLogging) {
            // TODO: assert.ok(resource && resource.scheme === 'file', 'Invalid resource: ' + resource);
            this.cache = cache;
            this.resource = resource;
            this.stat = stat;
            this.verboseLogging = verboseLogging;
            this.isDirectory = stat.isDirectory();
            this.mtime = this.cache.getFakeMtime();
            this.name = paths.basename(resource.fsPath);
            this.mime = !this.isDirectory ? baseMime.guessMimeTypes(resource.fsPath).join(', ') : null;
            // this.etag = etag(size, mtime);
            this.etag = stat.sha;
            this.size = stat.size;
        }
        StatResolver.prototype.addGithubFields = function (fileStat, githubStat) {
            if (githubStat.isSymbolicLink()) {
                fileStat.type = 'symlink';
            }
            if (githubStat.submodule_git_url) {
                fileStat.type = 'submodule';
                fileStat.submodule_git_url = githubStat.submodule_git_url;
            }
        };
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
            // Add github fields
            this.addGithubFields(fileStat, this.stat);
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
            var _this = this;
            // extfs.readdir(absolutePath, (error: Error, files: string[]) => {
            this.cache.readdir(absolutePath, function (error, files) {
                if (error) {
                    if (_this.verboseLogging) {
                        console.error(error);
                    }
                    return callback(null); // return - we might not have permissions to read the folder
                }
                // for each file in the folder
                flow.parallel(files, function (file, clb) {
                    //let fileResource = uri.file(paths.resolve(absolutePath, file));
                    var fileResource = uri_1.default.file(paths.makeAbsolute(paths.join(absolutePath, file)));
                    // let fileStat: fs.Stats;
                    var fileStat;
                    var $this = _this;
                    flow.sequence(function onError(error) {
                        if ($this.verboseLogging) {
                            console.error(error);
                        }
                        clb(null, null); // return - we might not have permissions to read the folder or stat the file
                    }, function stat() {
                        // fs.stat(fileResource.fsPath, this);
                        $this.cache.stat(fileResource.fsPath, this);
                    }, 
                    // function countChildren(fsstat: fs.stats): void {
                    function countChildren(fsstat) {
                        var _this = this;
                        fileStat = fsstat;
                        if (fileStat.isDirectory()) {
                            // extfs.readdir(fileResource.fsPath, (error, result) => {							
                            $this.cache.readdir(fileResource.fsPath, function (error, result) {
                                _this(null, result ? result.length : 0);
                            });
                        }
                        else {
                            this(null, 0);
                        }
                    }, function resolve(childCount) {
                        var childStat = {
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
                        var resolveFolderChildren = false;
                        if (files.length === 1 && resolveSingleChildDescendants) {
                            resolveFolderChildren = true;
                        }
                        else if (childCount > 0 && absoluteTargetPaths && absoluteTargetPaths.some(function (targetPath) { return paths.isEqualOrParent(targetPath, fileResource.fsPath); })) {
                            resolveFolderChildren = true;
                        }
                        // Continue resolving children based on condition
                        if (resolveFolderChildren) {
                            $this.resolveChildren(fileResource.fsPath, absoluteTargetPaths, resolveSingleChildDescendants, function (children) {
                                children = arrays.coalesce(children); // we don't want those null children
                                childStat.hasChildren = children && children.length > 0;
                                childStat.children = children || [];
                                clb(null, childStat);
                            });
                        }
                        else {
                            clb(null, childStat);
                        }
                    });
                }, function (errors, result) {
                    callback(result);
                });
            });
        };
        return StatResolver;
    }());
    exports.StatResolver = StatResolver;
});
//# sourceMappingURL=githubFileService.js.map