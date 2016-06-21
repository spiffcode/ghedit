/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'os', 'minimist', './package'], function (require, exports, os, minimist, package_1) {
    "use strict";
    var options = {
        string: [
            'locale',
            'user-data-dir',
            'extensionHomePath',
            'extensionDevelopmentPath',
            'extensionTestsPath',
            'timestamp'
        ],
        boolean: [
            'help',
            'version',
            'wait',
            'diff',
            'goto',
            'new-window',
            'reuse-window',
            'performance',
            'verbose',
            'logExtensionHostCommunication',
            'disable-extensions'
        ],
        alias: {
            help: 'h',
            version: 'v',
            wait: 'w',
            diff: 'd',
            goto: 'g',
            'new-window': 'n',
            'reuse-window': 'r',
            performance: 'p',
            'disable-extensions': 'disableExtensions'
        }
    };
    function parseArgs(args) {
        return minimist(args, options);
    }
    exports.parseArgs = parseArgs;
    var executable = 'code' + (os.platform() === 'win32' ? '.exe' : '');
    var indent = '  ';
    exports.helpMessage = "Visual Studio Code v" + package_1.default.version + "\n\nUsage: " + executable + " [arguments] [paths...]\n\nOptions:\n" + indent + "-d, --diff            Open a diff editor. Requires to pass two file paths\n" + indent + "                      as arguments.\n" + indent + "--disable-extensions  Disable all installed extensions.\n" + indent + "-g, --goto            Open the file at path at the line and column (add\n" + indent + "                      :line[:column] to path).\n" + indent + "-h, --help            Print usage.\n" + indent + "--locale <locale>     The locale to use (e.g. en-US or zh-TW).\n" + indent + "-n, --new-window      Force a new instance of Code.\n" + indent + "-r, --reuse-window    Force opening a file or folder in the last active\n" + indent + "                      window.\n" + indent + "--user-data-dir <dir> Specifies the directory that user data is kept in,\n" + indent + "                      useful when running as root.\n" + indent + "-v, --version         Print version.\n" + indent + "-w, --wait            Wait for the window to be closed before returning.";
});
//# sourceMappingURL=argv.js.map