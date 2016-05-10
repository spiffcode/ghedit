/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'crypto', 'fs', 'path', 'os', 'electron', 'vs/base/common/arrays', 'vs/base/common/strings', 'vs/base/common/paths', 'vs/base/common/platform', 'vs/base/common/uri', 'vs/base/common/types', 'vs/platform/instantiation/common/instantiation', './product', './argv'], function (require, exports, crypto, fs, path, os, electron_1, arrays, strings, paths, platform, uri_1, types, instantiation_1, product_1, argv_1) {
    'use strict';
    exports.IEnvironmentService = instantiation_1.createDecorator('environmentService');
    function getNumericValue(value, defaultValue, fallback) {
        if (fallback === void 0) { fallback = void 0; }
        var numericValue = parseInt(value);
        if (types.isNumber(numericValue)) {
            return numericValue;
        }
        if (value) {
            return defaultValue;
        }
        return fallback;
    }
    var EnvService = (function () {
        function EnvService() {
            this.serviceId = exports.IEnvironmentService;
            this._appRoot = path.dirname(uri_1.default.parse(require.toUrl('')).fsPath);
            this._currentWorkingDirectory = process.env['VSCODE_CWD'] || process.cwd();
            this._version = electron_1.app.getVersion();
            this._appHome = electron_1.app.getPath('userData');
            this._appSettingsHome = path.join(this._appHome, 'User');
            // TODO move out of here!
            if (!fs.existsSync(this._appSettingsHome)) {
                fs.mkdirSync(this._appSettingsHome);
            }
            this._appSettingsPath = path.join(this._appSettingsHome, 'settings.json');
            this._appKeybindingsPath = path.join(this._appSettingsHome, 'keybindings.json');
            // Remove the Electron executable
            var _a = process.argv, args = _a.slice(1);
            // If dev, remove the first non-option argument: it's the app location
            if (!this.isBuilt) {
                var index = arrays.firstIndex(args, function (a) { return !/^-/.test(a); });
                if (index > -1) {
                    args.splice(index, 1);
                }
            }
            // Finally, prepend any extra arguments from the 'argv' file
            if (fs.existsSync(path.join(this._appRoot, 'argv'))) {
                var extraargs = JSON.parse(fs.readFileSync(path.join(this._appRoot, 'argv'), 'utf8'));
                args = extraargs.concat(args);
            }
            var argv = argv_1.parseArgs(args);
            var debugBrkExtensionHostPort = getNumericValue(argv.debugBrkPluginHost, 5870);
            var debugExtensionHostPort = getNumericValue(argv.debugPluginHost, 5870, this.isBuilt ? void 0 : 5870);
            var pathArguments = parsePathArguments(this._currentWorkingDirectory, argv._, argv.goto);
            var timestamp = parseInt(argv.timestamp);
            var debugBrkFileWatcherPort = getNumericValue(argv.debugBrkFileWatcherPort, void 0);
            this._cliArgs = Object.freeze({
                pathArguments: pathArguments,
                programStart: types.isNumber(timestamp) ? timestamp : 0,
                enablePerformance: argv.performance,
                verboseLogging: argv.verbose,
                debugExtensionHostPort: debugBrkExtensionHostPort || debugExtensionHostPort,
                debugBrkExtensionHost: !!debugBrkExtensionHostPort,
                logExtensionHostCommunication: argv.logExtensionHostCommunication,
                debugBrkFileWatcherPort: debugBrkFileWatcherPort,
                openNewWindow: argv['new-window'],
                openInSameWindow: argv['reuse-window'],
                gotoLineMode: argv.goto,
                diffMode: argv.diff && pathArguments.length === 2,
                extensionsHomePath: normalizePath(argv.extensionHomePath),
                extensionDevelopmentPath: normalizePath(argv.extensionDevelopmentPath),
                extensionTestsPath: normalizePath(argv.extensionTestsPath),
                disableExtensions: argv['disable-extensions'],
                locale: argv.locale,
                waitForWindowClose: argv.wait
            });
            this._isTestingFromCli = this.cliArgs.extensionTestsPath && !this.cliArgs.debugBrkExtensionHost;
            this._userHome = path.join(electron_1.app.getPath('home'), product_1.default.dataFolderName);
            // TODO move out of here!
            if (!fs.existsSync(this._userHome)) {
                fs.mkdirSync(this._userHome);
            }
            this._userExtensionsHome = this.cliArgs.extensionsHomePath || path.join(this._userHome, 'extensions');
            // TODO move out of here!
            if (!fs.existsSync(this._userExtensionsHome)) {
                fs.mkdirSync(this._userExtensionsHome);
            }
            this._mainIPCHandle = this.getMainIPCHandle();
            this._sharedIPCHandle = this.getSharedIPCHandle();
        }
        Object.defineProperty(EnvService.prototype, "cliArgs", {
            get: function () { return this._cliArgs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "userExtensionsHome", {
            get: function () { return this._userExtensionsHome; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "isTestingFromCli", {
            get: function () { return this._isTestingFromCli; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "isBuilt", {
            get: function () { return !process.env['VSCODE_DEV']; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "product", {
            get: function () { return product_1.default; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "updateUrl", {
            get: function () { return product_1.default.updateUrl; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "quality", {
            get: function () { return product_1.default.quality; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "userHome", {
            get: function () { return this._userHome; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "appRoot", {
            get: function () { return this._appRoot; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "currentWorkingDirectory", {
            get: function () { return this._currentWorkingDirectory; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "version", {
            get: function () { return this._version; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "appHome", {
            get: function () { return this._appHome; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "appSettingsHome", {
            get: function () { return this._appSettingsHome; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "appSettingsPath", {
            get: function () { return this._appSettingsPath; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "appKeybindingsPath", {
            get: function () { return this._appKeybindingsPath; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "mainIPCHandle", {
            get: function () { return this._mainIPCHandle; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnvService.prototype, "sharedIPCHandle", {
            get: function () { return this._sharedIPCHandle; },
            enumerable: true,
            configurable: true
        });
        EnvService.prototype.getMainIPCHandle = function () {
            return this.getIPCHandleName() + (process.platform === 'win32' ? '-sock' : '.sock');
        };
        EnvService.prototype.getSharedIPCHandle = function () {
            return this.getIPCHandleName() + '-shared' + (process.platform === 'win32' ? '-sock' : '.sock');
        };
        EnvService.prototype.getIPCHandleName = function () {
            var handleName = electron_1.app.getName();
            if (!this.isBuilt) {
                handleName += '-dev';
            }
            // Support to run VS Code multiple times as different user
            // by making the socket unique over the logged in user
            var userId = EnvService.getUniqueUserId();
            if (userId) {
                handleName += ('-' + userId);
            }
            if (process.platform === 'win32') {
                return '\\\\.\\pipe\\' + handleName;
            }
            return path.join(os.tmpdir(), handleName);
        };
        EnvService.getUniqueUserId = function () {
            var username;
            if (platform.isWindows) {
                username = process.env.USERNAME;
            }
            else {
                username = process.env.USER;
            }
            if (!username) {
                return ''; // fail gracefully if there is no user name
            }
            // use sha256 to ensure the userid value can be used in filenames and are unique
            return crypto.createHash('sha256').update(username).digest('hex').substr(0, 6);
        };
        return EnvService;
    }());
    exports.EnvService = EnvService;
    function parsePathArguments(cwd, args, gotoLineMode) {
        var result = args.map(function (arg) {
            var pathCandidate = arg;
            var parsedPath;
            if (gotoLineMode) {
                parsedPath = parseLineAndColumnAware(arg);
                pathCandidate = parsedPath.path;
            }
            if (pathCandidate) {
                pathCandidate = preparePath(cwd, pathCandidate);
            }
            var realPath;
            try {
                realPath = fs.realpathSync(pathCandidate);
            }
            catch (error) {
                // in case of an error, assume the user wants to create this file
                // if the path is relative, we join it to the cwd
                realPath = path.normalize(path.isAbsolute(pathCandidate) ? pathCandidate : path.join(cwd, pathCandidate));
            }
            if (!paths.isValidBasename(path.basename(realPath))) {
                return null; // do not allow invalid file names
            }
            if (gotoLineMode) {
                parsedPath.path = realPath;
                return toLineAndColumnPath(parsedPath);
            }
            return realPath;
        });
        var caseInsensitive = platform.isWindows || platform.isMacintosh;
        var distinct = arrays.distinct(result, function (e) { return e && caseInsensitive ? e.toLowerCase() : e; });
        return arrays.coalesce(distinct);
    }
    function preparePath(cwd, p) {
        // Trim trailing quotes
        if (platform.isWindows) {
            p = strings.rtrim(p, '"'); // https://github.com/Microsoft/vscode/issues/1498
        }
        // Trim whitespaces
        p = strings.trim(strings.trim(p, ' '), '\t');
        if (platform.isWindows) {
            // Resolve the path against cwd if it is relative
            p = path.resolve(cwd, p);
            // Trim trailing '.' chars on Windows to prevent invalid file names
            p = strings.rtrim(p, '.');
        }
        return p;
    }
    function normalizePath(p) {
        return p ? path.normalize(p) : p;
    }
    function getPlatformIdentifier() {
        if (process.platform === 'linux') {
            return "linux-" + process.arch;
        }
        return process.platform;
    }
    exports.getPlatformIdentifier = getPlatformIdentifier;
    function parseLineAndColumnAware(rawPath) {
        var segments = rawPath.split(':'); // C:\file.txt:<line>:<column>
        var path;
        var line = null;
        var column = null;
        segments.forEach(function (segment) {
            var segmentAsNumber = Number(segment);
            if (!types.isNumber(segmentAsNumber)) {
                path = !!path ? [path, segment].join(':') : segment; // a colon can well be part of a path (e.g. C:\...)
            }
            else if (line === null) {
                line = segmentAsNumber;
            }
            else if (column === null) {
                column = segmentAsNumber;
            }
        });
        return {
            path: path,
            line: line !== null ? line : void 0,
            column: column !== null ? column : line !== null ? 1 : void 0 // if we have a line, make sure column is also set
        };
    }
    exports.parseLineAndColumnAware = parseLineAndColumnAware;
    function toLineAndColumnPath(parsedPath) {
        var segments = [parsedPath.path];
        if (types.isNumber(parsedPath.line)) {
            segments.push(String(parsedPath.line));
        }
        if (types.isNumber(parsedPath.column)) {
            segments.push(String(parsedPath.column));
        }
        return segments.join(':');
    }
    exports.toLineAndColumnPath = toLineAndColumnPath;
});
//# sourceMappingURL=env.js.map