var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/base/common/processes', 'vs/base/common/objects', 'vs/base/common/platform', 'vs/base/common/types', 'vs/base/common/parsers'], function (require, exports, NLS, Objects, Platform, Types, parsers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (Source) {
        Source[Source["stdout"] = 0] = "stdout";
        Source[Source["stderr"] = 1] = "stderr";
    })(exports.Source || (exports.Source = {}));
    var Source = exports.Source;
    var ExecutableParser = (function (_super) {
        __extends(ExecutableParser, _super);
        function ExecutableParser(logger, validationStatus) {
            if (validationStatus === void 0) { validationStatus = new parsers_1.ValidationStatus(); }
            _super.call(this, logger, validationStatus);
        }
        ExecutableParser.prototype.parse = function (json, parserOptions) {
            if (parserOptions === void 0) { parserOptions = { globals: null, emptyCommand: false, noDefaults: false }; }
            var result = this.parseExecutable(json, parserOptions.globals);
            if (this.status.isFatal()) {
                return result;
            }
            var osExecutable;
            if (json.windows && Platform.platform === Platform.Platform.Windows) {
                osExecutable = this.parseExecutable(json.windows);
            }
            else if (json.osx && Platform.platform === Platform.Platform.Mac) {
                osExecutable = this.parseExecutable(json.osx);
            }
            else if (json.linux && Platform.platform === Platform.Platform.Linux) {
                osExecutable = this.parseExecutable(json.linux);
            }
            if (osExecutable) {
                result = ExecutableParser.mergeExecutable(result, osExecutable);
            }
            if ((!result || !result.command) && !parserOptions.emptyCommand) {
                this.status.state = parsers_1.ValidationState.Fatal;
                this.log(NLS.localize(0, null));
                return null;
            }
            if (!parserOptions.noDefaults) {
                parsers_1.Parser.merge(result, {
                    command: undefined,
                    isShellCommand: false,
                    args: [],
                    options: {}
                }, false);
            }
            return result;
        };
        ExecutableParser.prototype.parseExecutable = function (json, globals) {
            var command = undefined;
            var isShellCommand = undefined;
            var args = undefined;
            var options = undefined;
            if (this.is(json.command, Types.isString)) {
                command = json.command;
            }
            if (this.is(json.isShellCommand, Types.isBoolean, parsers_1.ValidationState.Warning, NLS.localize(1, null, json.isShellCommand))) {
                isShellCommand = json.isShellCommand;
            }
            if (this.is(json.args, Types.isStringArray, parsers_1.ValidationState.Warning, NLS.localize(2, null, json.isShellCommand))) {
                args = json.args.slice(0);
            }
            if (this.is(json.options, Types.isObject)) {
                options = this.parseCommandOptions(json.options);
            }
            return { command: command, isShellCommand: isShellCommand, args: args, options: options };
        };
        ExecutableParser.prototype.parseCommandOptions = function (json) {
            var result = {};
            if (!json) {
                return result;
            }
            if (this.is(json.cwd, Types.isString, parsers_1.ValidationState.Warning, NLS.localize(3, null, json.cwd))) {
                result.cwd = json.cwd;
            }
            if (!Types.isUndefined(json.env)) {
                result.env = Objects.clone(json.env);
            }
            return result;
        };
        ExecutableParser.mergeExecutable = function (executable, other) {
            if (!executable) {
                return other;
            }
            parsers_1.Parser.merge(executable, other, true);
            return executable;
        };
        return ExecutableParser;
    }(parsers_1.Parser));
    exports.ExecutableParser = ExecutableParser;
    function resolveCommandOptions(options, variables) {
        var result = Objects.clone(options);
        if (result.cwd) {
            result.cwd = variables.resolve(result.cwd);
        }
        if (result.env) {
            result.env = variables.resolve(result.env);
        }
        return result;
    }
    exports.resolveCommandOptions = resolveCommandOptions;
    function resolveExecutable(executable, variables) {
        var result = Objects.clone(executable);
        result.command = variables.resolve(result.command);
        result.args = variables.resolve(result.args);
        if (result.options) {
            result.options = resolveCommandOptions(result.options, variables);
        }
        return result;
    }
    exports.resolveExecutable = resolveExecutable;
});
//# sourceMappingURL=processes.js.map