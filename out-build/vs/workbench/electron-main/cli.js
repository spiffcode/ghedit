/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'path', 'fs', 'os', 'child_process', 'vs/base/common/uri'], function (require, exports, path, fs, os, child_process_1, uri_1) {
    "use strict";
    var rootPath = path.dirname(uri_1.default.parse(require.toUrl('')).fsPath);
    var packageJsonPath = path.join(rootPath, 'package.json');
    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    var ArgParser = (function () {
        function ArgParser(argv) {
            this.argv = argv;
        }
        ArgParser.prototype.hasFlag = function (flag, alias) {
            return (flag && this.argv.indexOf('--' + flag) >= 0)
                || (alias && this.argv.indexOf('-' + alias) >= 0);
        };
        ArgParser.prototype.help = function () {
            var executable = 'code' + (os.platform() === 'win32' ? '.exe' : '');
            var indent = '  ';
            return "Visual Studio Code v" + packageJson.version + "\n\nUsage: " + executable + " [arguments] [paths...]\n\nOptions:\n" + indent + "-d, --diff            Open a diff editor. Requires to pass two file paths\n" + indent + "                      as arguments.\n" + indent + "--disable-extensions  Disable all installed extensions.\n" + indent + "-g, --goto            Open the file at path at the line and column (add\n" + indent + "                      :line[:column] to path).\n" + indent + "-h, --help            Print usage.\n" + indent + "--locale=LOCALE       The locale to use (e.g. en-US or zh-TW).\n" + indent + "-n, --new-window      Force a new instance of Code.\n" + indent + "-r, --reuse-window    Force opening a file or folder in the last active\n" + indent + "                      window.\n" + indent + "--user-data-dir=DIR   Specifies the directory that user data is kept in,\n" + indent + "                      useful when running as root.\n" + indent + "-v, --version         Print version.\n" + indent + "-w, --wait            Wait for the window to be closed before returning.";
        };
        return ArgParser;
    }());
    function main(argv) {
        var argParser = new ArgParser(argv);
        var exit = true;
        if (argParser.hasFlag('help', 'h')) {
            console.log(argParser.help());
        }
        else if (argParser.hasFlag('version', 'v')) {
            console.log(packageJson.version);
        }
        else {
            delete process.env['ATOM_SHELL_INTERNAL_RUN_AS_NODE'];
            if (argParser.hasFlag('wait', 'w')) {
                exit = false;
                var child = child_process_1.spawn(process.execPath, process.argv.slice(2), { detached: true, stdio: 'ignore' });
                child.on('exit', process.exit);
            }
            else {
                child_process_1.spawn(process.execPath, process.argv.slice(2), { detached: true, stdio: 'ignore' });
            }
        }
        if (exit) {
            process.exit(0);
        }
    }
    exports.main = main;
    main(process.argv.slice(2));
});
//# sourceMappingURL=cli.js.map