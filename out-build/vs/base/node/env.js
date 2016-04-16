/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/platform', 'vs/base/common/winjs.base', 'child_process'], function (require, exports, platform, winjs_base_1, cp) {
    'use strict';
    function getUserEnvironment() {
        if (platform.isWindows) {
            return winjs_base_1.TPromise.as({});
        }
        return new winjs_base_1.TPromise(function (c, e) {
            var child = cp.spawn(process.env.SHELL, ['-ilc', 'env'], {
                detached: true,
                stdio: ['ignore', 'pipe', process.stderr],
            });
            child.stdout.setEncoding('utf8');
            child.on('error', function () { return c({}); });
            var buffer = '';
            child.stdout.on('data', function (d) { buffer += d; });
            child.on('close', function (code, signal) {
                if (code !== 0) {
                    return c({});
                }
                c(parseEnvOutput(buffer));
            });
        });
    }
    exports.getUserEnvironment = getUserEnvironment;
    /**
     * Parse output from `env`, attempting to retain any multiple-line variables.
     */
    function parseEnvOutput(output) {
        var result = Object.create(null);
        var vars = output.split('\n');
        // Rejoin lines to the preceeding line if it doesn't look like the line is a new variable
        var current = 0;
        for (var i = 1; i < vars.length; i++) {
            if (vars[i].match(/^[\w_][\w\d_]*=/) === null) {
                vars[current] += "\n" + vars[i];
            }
            else {
                vars[++current] = vars[i];
            }
        }
        // Trim any remaining vars that had been moved
        vars.length = current + 1;
        // Turn the array into a map
        vars.forEach(function (line) {
            var pos = line.indexOf('=');
            if (pos > 0) {
                var key = line.substring(0, pos);
                var value = line.substring(pos + 1);
                if (!key || typeof result[key] === 'string') {
                    return;
                }
                result[key] = value;
            }
        });
        return result;
    }
    exports.parseEnvOutput = parseEnvOutput;
});
//# sourceMappingURL=env.js.map