/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'child_process', 'vs/base/common/objects', './argv', './package'], function (require, exports, child_process_1, objects_1, argv_1, package_1) {
    "use strict";
    function main(args) {
        var argv = argv_1.parseArgs(args);
        if (argv.help) {
            console.log(argv_1.helpMessage);
        }
        else if (argv.version) {
            console.log(package_1.default.version);
        }
        else {
            var env = objects_1.assign({}, process.env, {
                // this will signal Code that it was spawned from this module
                'VSCODE_CLI': '1',
                'ELECTRON_NO_ATTACH_CONSOLE': '1'
            });
            delete env['ATOM_SHELL_INTERNAL_RUN_AS_NODE'];
            var child = child_process_1.spawn(process.execPath, args, {
                detached: true,
                stdio: 'ignore',
                env: env
            });
            if (argv.wait) {
                child.on('exit', process.exit);
                return;
            }
        }
        process.exit(0);
    }
    exports.main = main;
    main(process.argv.slice(2));
});
//# sourceMappingURL=cli.js.map