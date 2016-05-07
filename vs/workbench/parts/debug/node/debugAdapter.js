/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/node/debugAdapter', 'vs/base/common/paths', 'vs/base/common/platform'], function (require, exports, nls, paths, platform) {
    "use strict";
    var Adapter = (function () {
        function Adapter(rawAdapter, systemVariables, extensionFolderPath) {
            if (rawAdapter.windows) {
                rawAdapter.win = rawAdapter.windows;
            }
            if (platform.isWindows && !process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432') && rawAdapter.winx86) {
                this.runtime = rawAdapter.winx86.runtime;
                this.runtimeArgs = rawAdapter.winx86.runtimeArgs;
                this.program = rawAdapter.winx86.program;
                this.args = rawAdapter.winx86.args;
            }
            else if (platform.isWindows && rawAdapter.win) {
                this.runtime = rawAdapter.win.runtime;
                this.runtimeArgs = rawAdapter.win.runtimeArgs;
                this.program = rawAdapter.win.program;
                this.args = rawAdapter.win.args;
            }
            else if (platform.isMacintosh && rawAdapter.osx) {
                this.runtime = rawAdapter.osx.runtime;
                this.runtimeArgs = rawAdapter.osx.runtimeArgs;
                this.program = rawAdapter.osx.program;
                this.args = rawAdapter.osx.args;
            }
            else if (platform.isLinux && rawAdapter.linux) {
                this.runtime = rawAdapter.linux.runtime;
                this.runtimeArgs = rawAdapter.linux.runtimeArgs;
                this.program = rawAdapter.linux.program;
                this.args = rawAdapter.linux.args;
            }
            this.runtime = this.runtime || rawAdapter.runtime;
            this.runtimeArgs = this.runtimeArgs || rawAdapter.runtimeArgs;
            this.program = this.program || rawAdapter.program;
            this.args = this.args || rawAdapter.args;
            if (this.program) {
                this.program = systemVariables ? systemVariables.resolve(this.program) : this.program;
                this.program = paths.join(extensionFolderPath, this.program);
            }
            if (this.runtime && this.runtime.indexOf('./') === 0) {
                this.runtime = systemVariables ? systemVariables.resolve(this.runtime) : this.runtime;
                this.runtime = paths.join(extensionFolderPath, this.runtime);
            }
            this.type = rawAdapter.type;
            this.configurationAttributes = rawAdapter.configurationAttributes;
            this.initialConfigurations = rawAdapter.initialConfigurations;
            this._label = rawAdapter.label;
            this.enableBreakpointsFor = rawAdapter.enableBreakpointsFor;
            this.aiKey = rawAdapter.aiKey;
        }
        Object.defineProperty(Adapter.prototype, "label", {
            get: function () {
                return this._label || this.type;
            },
            enumerable: true,
            configurable: true
        });
        Adapter.prototype.getSchemaAttributes = function () {
            var _this = this;
            // fill in the default configuration attributes shared by all adapters.
            if (this.configurationAttributes) {
                return Object.keys(this.configurationAttributes).map(function (request) {
                    var attributes = _this.configurationAttributes[request];
                    var defaultRequired = ['name', 'type', 'request'];
                    attributes.required = attributes.required && attributes.required.length ? defaultRequired.concat(attributes.required) : defaultRequired;
                    attributes.additionalProperties = false;
                    attributes.type = 'object';
                    if (!attributes.properties) {
                        attributes.properties = {};
                    }
                    var properties = attributes.properties;
                    properties.type = {
                        enum: [_this.type],
                        description: nls.localize(0, null)
                    };
                    properties.name = {
                        type: 'string',
                        description: nls.localize(1, null),
                        default: 'Launch'
                    };
                    properties.request = {
                        enum: [request],
                        description: nls.localize(2, null),
                    };
                    properties.preLaunchTask = {
                        type: ['string', 'null'],
                        default: null,
                        description: nls.localize(3, null)
                    };
                    _this.warnRelativePaths(properties.outDir);
                    _this.warnRelativePaths(properties.program);
                    _this.warnRelativePaths(properties.cwd);
                    _this.warnRelativePaths(properties.runtimeExecutable);
                    return attributes;
                });
            }
            return null;
        };
        Adapter.prototype.warnRelativePaths = function (attribute) {
            if (attribute) {
                attribute.pattern = '^\\${.*}.*|' + paths.isAbsoluteRegex.source;
                attribute.errorMessage = nls.localize(4, null);
            }
        };
        return Adapter;
    }());
    exports.Adapter = Adapter;
});
//# sourceMappingURL=debugAdapter.js.map