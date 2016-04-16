var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/paths', 'vs/base/common/winjs.base', 'vs/base/common/eventEmitter', 'vs/base/common/objects', 'vs/base/common/errors', './model', 'vs/base/common/async', 'vs/base/common/lifecycle', 'vs/base/common/collections', './configuration', 'vs/platform/files/common/files', './configurationRegistry', 'vs/platform/platform', 'vs/base/common/event'], function (require, exports, paths, winjs_base_1, eventEmitter_1, objects, errors, model, async_1, lifecycle_1, collections, configuration_1, files_1, configurationRegistry_1, platform_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ConfigurationService = (function (_super) {
        __extends(ConfigurationService, _super);
        function ConfigurationService(contextService, eventService, workspaceSettingsRootFolder) {
            if (workspaceSettingsRootFolder === void 0) { workspaceSettingsRootFolder = '.vscode'; }
            _super.call(this);
            this.serviceId = configuration_1.IConfigurationService;
            this.contextService = contextService;
            this.eventService = eventService;
            this.workspaceSettingsRootFolder = workspaceSettingsRootFolder;
            this.workspaceFilePathToConfiguration = Object.create(null);
            this.cachedConfig = {
                merged: {},
                consolidated: { contents: {}, parseErrors: [] },
                globals: { contents: {}, parseErrors: [] }
            };
            this.onDidUpdateConfiguration = event_1.fromEventEmitter(this, configuration_1.ConfigurationServiceEventTypes.UPDATED);
            this.registerListeners();
        }
        ConfigurationService.prototype.registerListeners = function () {
            var _this = this;
            var unbind = this.eventService.addListener(files_1.EventType.FILE_CHANGES, function (events) { return _this.handleFileEvents(events); });
            var subscription = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).onDidRegisterConfiguration(function () { return _this.handleConfigurationChange(); });
            this.callOnDispose = function () {
                unbind();
                subscription.dispose();
            };
        };
        ConfigurationService.prototype.initialize = function () {
            return this.loadConfiguration().then(function () { return null; });
        };
        ConfigurationService.prototype.getConfiguration = function (section) {
            var result = section ? this.cachedConfig.merged[section] : this.cachedConfig.merged;
            var parseErrors = this.cachedConfig.consolidated.parseErrors;
            if (this.cachedConfig.globals.parseErrors) {
                parseErrors.push.apply(parseErrors, this.cachedConfig.globals.parseErrors);
            }
            if (parseErrors.length > 0) {
                if (!result) {
                    result = {};
                }
                result.$parseErrors = parseErrors;
            }
            return result;
        };
        ConfigurationService.prototype.loadConfiguration = function (section) {
            var _this = this;
            return this.doLoadConfiguration().then(function (res) {
                _this.cachedConfig = res;
                return _this.getConfiguration(section);
            });
        };
        ConfigurationService.prototype.doLoadConfiguration = function () {
            // Load globals
            var globals = this.loadGlobalConfiguration();
            // Load workspace locals
            return this.loadWorkspaceConfiguration().then(function (values) {
                // Consolidate
                var consolidated = model.consolidate(values);
                // Override with workspace locals
                var merged = objects.mixin(objects.clone(globals.contents), // target: global/default values (but dont modify!)
                consolidated.contents, // source: workspace configured values
                true // overwrite
                );
                return {
                    merged: merged,
                    consolidated: consolidated,
                    globals: globals
                };
            });
        };
        ConfigurationService.prototype.loadGlobalConfiguration = function () {
            return {
                contents: model.getDefaultValues()
            };
        };
        ConfigurationService.prototype.hasWorkspaceConfiguration = function () {
            return !!this.workspaceFilePathToConfiguration['.vscode/' + model.CONFIG_DEFAULT_NAME + '.json'];
        };
        ConfigurationService.prototype.loadWorkspaceConfiguration = function (section) {
            var _this = this;
            // once: when invoked for the first time we fetch *all* json
            // files using the bulk stats and content routes
            if (!this.bulkFetchFromWorkspacePromise) {
                this.bulkFetchFromWorkspacePromise = this.resolveStat(this.contextService.toResource(this.workspaceSettingsRootFolder)).then(function (stat) {
                    if (!stat.isDirectory) {
                        return winjs_base_1.TPromise.as([]);
                    }
                    return _this.resolveContents(stat.children.filter(function (stat) { return paths.extname(stat.resource.fsPath) === '.json'; }).map(function (stat) { return stat.resource; }));
                }, function (err) {
                    if (err) {
                        return []; // never fail this call
                    }
                }).then(function (contents) {
                    contents.forEach(function (content) { return _this.workspaceFilePathToConfiguration[_this.contextService.toWorkspaceRelativePath(content.resource)] = winjs_base_1.TPromise.as(model.newConfigFile(content.value)); });
                }, errors.onUnexpectedError);
            }
            // on change: join on *all* configuration file promises so that
            // we can merge them into a single configuration object. this
            // happens whenever a config file changes, is deleted, or added
            return this.bulkFetchFromWorkspacePromise.then(function () {
                return winjs_base_1.TPromise.join(_this.workspaceFilePathToConfiguration);
            });
        };
        ConfigurationService.prototype.handleConfigurationChange = function () {
            var _this = this;
            if (!this.reloadConfigurationScheduler) {
                this.reloadConfigurationScheduler = new async_1.RunOnceScheduler(function () {
                    _this.loadConfiguration().then(function (config) { return _this.emit(configuration_1.ConfigurationServiceEventTypes.UPDATED, { config: config }); }).done(null, errors.onUnexpectedError);
                }, ConfigurationService.RELOAD_CONFIGURATION_DELAY);
            }
            if (!this.reloadConfigurationScheduler.isScheduled()) {
                this.reloadConfigurationScheduler.schedule();
            }
        };
        ConfigurationService.prototype.handleFileEvents = function (event) {
            var events = event.changes;
            var affectedByChanges = false;
            for (var i = 0, len = events.length; i < len; i++) {
                var workspacePath = this.contextService.toWorkspaceRelativePath(events[i].resource);
                if (!workspacePath) {
                    continue; // event is not inside workspace
                }
                // Handle case where ".vscode" got deleted
                if (workspacePath === this.workspaceSettingsRootFolder && events[i].type === files_1.FileChangeType.DELETED) {
                    this.workspaceFilePathToConfiguration = Object.create(null);
                    affectedByChanges = true;
                }
                // outside my folder or not a *.json file
                if (paths.extname(workspacePath) !== '.json' || !paths.isEqualOrParent(workspacePath, this.workspaceSettingsRootFolder)) {
                    continue;
                }
                // insert 'fetch-promises' for add and update events and
                // remove promises for delete events
                switch (events[i].type) {
                    case files_1.FileChangeType.DELETED:
                        affectedByChanges = collections.remove(this.workspaceFilePathToConfiguration, workspacePath);
                        break;
                    case files_1.FileChangeType.UPDATED:
                    case files_1.FileChangeType.ADDED:
                        this.workspaceFilePathToConfiguration[workspacePath] = this.resolveContent(events[i].resource).then(function (content) { return model.newConfigFile(content.value); }, errors.onUnexpectedError);
                        affectedByChanges = true;
                }
            }
            if (affectedByChanges) {
                this.handleConfigurationChange();
            }
        };
        ConfigurationService.prototype.dispose = function () {
            if (this.reloadConfigurationScheduler) {
                this.reloadConfigurationScheduler.dispose();
            }
            this.callOnDispose = lifecycle_1.cAll(this.callOnDispose);
            _super.prototype.dispose.call(this);
        };
        ConfigurationService.RELOAD_CONFIGURATION_DELAY = 50;
        return ConfigurationService;
    }(eventEmitter_1.EventEmitter));
    exports.ConfigurationService = ConfigurationService;
});
