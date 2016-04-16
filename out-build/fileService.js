define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/common/paths', 'vs/base/common/strings', 'vs/base/common/timer', 'vs/platform/files/common/files', 'vs/platform/configuration/common/configuration'], function (require, exports, nls, winjs_base_1, paths, strings, timer, files_1, configuration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // TODO: import {shell} from 'electron';
    var FileService = (function () {
        function FileService(configurationService, eventService, contextService) {
            this.configurationService = configurationService;
            this.eventService = eventService;
            this.contextService = contextService;
            this.serviceId = files_1.IFileService;
            var configuration = this.configurationService.getConfiguration();
            // adjust encodings (TODO@Ben knowledge on settings location ('.vscode') is hardcoded)
            /* TODO:
            let encodingOverride: IEncodingOverride[] = [];
            encodingOverride.push({ resource: uri.file(this.contextService.getConfiguration().env.appSettingsHome), encoding: encoding.UTF8 });
            if (this.contextService.getWorkspace()) {
                encodingOverride.push({ resource: uri.file(paths.join(this.contextService.getWorkspace().resource.fsPath, '.vscode')), encoding: encoding.UTF8 });
            }
            */
            var watcherIgnoredPatterns = [];
            if (configuration.files && configuration.files.watcherExclude) {
                watcherIgnoredPatterns = Object.keys(configuration.files.watcherExclude).filter(function (k) { return !!configuration.files.watcherExclude[k]; });
            }
            // build config
            /* TODO:
            let fileServiceConfig: IFileServiceOptions = {
                errorLogger: (msg: string) => errors.onUnexpectedError(msg),
                encoding: configuration.files && configuration.files.encoding,
                encodingOverride: encodingOverride,
                watcherIgnoredPatterns: watcherIgnoredPatterns,
                verboseLogging: this.contextService.getConfiguration().env.verboseLogging
            };
            */
            // create service
            /* TODO:
            let workspace = this.contextService.getWorkspace();
            this.raw = new NodeFileService(workspace ? workspace.resource.fsPath : void 0, this.eventService, fileServiceConfig);
            */
            // Listeners
            this.registerListeners();
        }
        FileService.prototype.registerListeners = function () {
            var _this = this;
            // Config Changes
            this.configurationChangeListenerUnbind = this.configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.onConfigurationChange(e.config); });
        };
        FileService.prototype.onConfigurationChange = function (configuration) {
            this.updateOptions(configuration.files);
        };
        FileService.prototype.updateOptions = function (options) {
            this.raw.updateOptions(options);
        };
        FileService.prototype.resolveFile = function (resource, options) {
            return this.raw.resolveFile(resource, options);
        };
        FileService.prototype.resolveContent = function (resource, options) {
            var contentId = resource.toString();
            var timerEvent = timer.start(timer.Topic.WORKBENCH, strings.format('Load {0}', contentId));
            return this.raw.resolveContent(resource, options).then(function (result) {
                timerEvent.stop();
                return result;
            });
        };
        FileService.prototype.resolveContents = function (resources) {
            return this.raw.resolveContents(resources);
        };
        FileService.prototype.updateContent = function (resource, value, options) {
            var timerEvent = timer.start(timer.Topic.WORKBENCH, strings.format('Save {0}', resource.toString()));
            return this.raw.updateContent(resource, value, options).then(function (result) {
                timerEvent.stop();
                return result;
            }, function (error) {
                timerEvent.stop();
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        FileService.prototype.moveFile = function (source, target, overwrite) {
            return this.raw.moveFile(source, target, overwrite);
        };
        FileService.prototype.copyFile = function (source, target, overwrite) {
            return this.raw.copyFile(source, target, overwrite);
        };
        FileService.prototype.createFile = function (resource, content) {
            return this.raw.createFile(resource, content);
        };
        FileService.prototype.createFolder = function (resource) {
            return this.raw.createFolder(resource);
        };
        FileService.prototype.rename = function (resource, newName) {
            return this.raw.rename(resource, newName);
        };
        FileService.prototype.del = function (resource, useTrash) {
            if (useTrash) {
                return this.doMoveItemToTrash(resource);
            }
            return this.raw.del(resource);
        };
        FileService.prototype.doMoveItemToTrash = function (resource) {
            var workspace = this.contextService.getWorkspace();
            if (!workspace) {
                return winjs_base_1.TPromise.wrapError('Need a workspace to use this');
            }
            var absolutePath = resource.fsPath;
            // TODO:		let result = shell.moveItemToTrash(absolutePath);
            console.log('shell.moveItemToTrash not implemented');
            var result = null;
            if (!result) {
                return winjs_base_1.TPromise.wrapError(new Error(nls.localize('trashFailed', "Failed to move '{0}' to the trash", paths.basename(absolutePath))));
            }
            return winjs_base_1.TPromise.as(null);
        };
        FileService.prototype.importFile = function (source, targetFolder) {
            return this.raw.importFile(source, targetFolder).then(function (result) {
                return {
                    isNew: result && result.isNew,
                    stat: result && result.stat
                };
            });
        };
        FileService.prototype.watchFileChanges = function (resource) {
            if (!resource) {
                return;
            }
            if (resource.scheme !== 'file') {
                return; // only support files
            }
            // return early if the resource is inside the workspace for which we have another watcher in place
            if (this.contextService.isInsideWorkspace(resource)) {
                return;
            }
            this.raw.watchFileChanges(resource);
        };
        FileService.prototype.unwatchFileChanges = function (arg1) {
            this.raw.unwatchFileChanges(arg1);
        };
        FileService.prototype.dispose = function () {
            // Listeners
            if (this.configurationChangeListenerUnbind) {
                this.configurationChangeListenerUnbind();
                this.configurationChangeListenerUnbind = null;
            }
            // Dispose service
            this.raw.dispose();
        };
        return FileService;
    }());
    exports.FileService = FileService;
});
//# sourceMappingURL=fileService.js.map