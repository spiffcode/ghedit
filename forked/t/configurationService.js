/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/objects', 'vs/platform/configuration/common/configurationService', 'vs/workbench/common/events', 'vs/platform/configuration/common/configuration'], function (require, exports, winjs_base_1, objects, configurationService_1, events_1, configuration_1) {
    'use strict';
    // TODO: import fs = require('fs');
    var ConfigurationService = (function (_super) {
        __extends(ConfigurationService, _super);
        function ConfigurationService(contextService, eventService) {
            _super.call(this, contextService, eventService);
            this.serviceId = configuration_1.IConfigurationService;
            this.registerListeners();
        }
        ConfigurationService.prototype.registerListeners = function () {
            var _this = this;
            _super.prototype.registerListeners.call(this);
            this.toDispose = this.eventService.addListener(events_1.EventType.WORKBENCH_OPTIONS_CHANGED, function (e) { return _this.onOptionsChanged(e); });
        };
        ConfigurationService.prototype.onOptionsChanged = function (e) {
            if (e.key === 'globalSettings') {
                this.handleConfigurationChange();
            }
        };
        ConfigurationService.prototype.resolveContents = function (resources) {
            var _this = this;
            var contents = [];
            return winjs_base_1.TPromise.join(resources.map(function (resource) {
                return _this.resolveContent(resource).then(function (content) {
                    contents.push(content);
                });
            })).then(function () { return contents; });
        };
        ConfigurationService.prototype.resolveContent = function (resource) {
            console.log('configurationService.resolveContent fs.readFile(\"' + resource.toString(true) + '\") unimplemented');
            return new winjs_base_1.TPromise(function (c, e) {
                e('configurationService.resolveContent not implemented');
                /* TODO:
                fs.readFile(resource.fsPath, (error, contents) => {
                    if (error) {
                        e(error);
                    } else {
                        c({
                            resource: resource,
                            value: contents.toString()
                        });
                    }
                });
                */
            });
        };
        ConfigurationService.prototype.resolveStat = function (resource) {
            console.log('configurationService.resolveStat extfs.readdir(\"' + resource.toString(true) + '\") unimplemented');
            return new winjs_base_1.TPromise(function (c, e) {
                e('configurationService.resolveStat not implemented');
                /* TODO:
                extfs.readdir(resource.fsPath, (error, children) => {
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
                                if (platform.isMacintosh) {
                                    child = strings.normalizeNFC(child); // Mac: uses NFD unicode form on disk, but we want NFC
                                }
    
                                return {
                                    resource: uri.file(paths.join(resource.fsPath, child))
                                };
                            })
                        });
                    }
                });
                */
            });
        };
        ConfigurationService.prototype.loadWorkspaceConfiguration = function (section) {
            // Return early if we don't have a workspace
            if (!this.contextService.getWorkspace()) {
                return winjs_base_1.TPromise.as({});
            }
            return _super.prototype.loadWorkspaceConfiguration.call(this, section);
        };
        ConfigurationService.prototype.loadGlobalConfiguration = function () {
            var defaults = _super.prototype.loadGlobalConfiguration.call(this);
            var globalSettings = this.contextService.getOptions().globalSettings;
            return {
                contents: objects.mixin(objects.clone(defaults.contents), // target: default values (but don't modify!)
                globalSettings.settings, // source: global configured values
                true // overwrite
                ),
                parseErrors: globalSettings.settingsParseErrors
            };
        };
        ConfigurationService.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose();
        };
        return ConfigurationService;
    }(configurationService_1.ConfigurationService));
    exports.ConfigurationService = ConfigurationService;
});
//# sourceMappingURL=configurationService.js.map