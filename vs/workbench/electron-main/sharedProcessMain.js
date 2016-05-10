/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'fs', 'vs/base/common/platform', 'vs/base/parts/ipc/node/ipc.net', 'vs/base/common/winjs.base', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/event/common/eventService', 'vs/workbench/parts/extensions/common/extensionsIpc', 'vs/workbench/parts/extensions/node/extensionsService'], function (require, exports, fs, platform, ipc_net_1, winjs_base_1, contextService_1, eventService_1, extensionsIpc_1, extensionsService_1) {
    "use strict";
    function quit(err) {
        if (err) {
            console.error(err);
        }
        process.exit(err ? 1 : 0);
    }
    /**
     * Plan B is to kill oneself if one's parent dies. Much drama.
     */
    function setupPlanB(parentPid) {
        setInterval(function () {
            try {
                process.kill(parentPid, 0); // throws an exception if the main process doesn't exist anymore.
            }
            catch (e) {
                process.exit();
            }
        }, 5000);
    }
    function main(server, initData) {
        var eventService = new eventService_1.EventService();
        var contextService = new contextService_1.WorkspaceContextService(eventService, null, initData.configuration, initData.contextServiceOptions);
        var extensionService = new extensionsService_1.ExtensionsService(contextService);
        var channel = new extensionsIpc_1.ExtensionsChannel(extensionService);
        server.registerChannel('extensions', channel);
        // eventually clean up old extensions
        setTimeout(function () { return extensionService.removeDeprecatedExtensions(); }, 5000);
    }
    function setupIPC(hook) {
        function setup(retry) {
            return ipc_net_1.serve(hook).then(null, function (err) {
                if (!retry || platform.isWindows || err.code !== 'EADDRINUSE') {
                    return winjs_base_1.TPromise.wrapError(err);
                }
                // should retry, not windows and eaddrinuse
                return ipc_net_1.connect(hook).then(function (client) {
                    // we could connect to a running instance. this is not good, abort
                    client.dispose();
                    return winjs_base_1.TPromise.wrapError(new Error('There is an instance already running.'));
                }, function (err) {
                    // it happens on Linux and OS X that the pipe is left behind
                    // let's delete it, since we can't connect to it
                    // and the retry the whole thing
                    try {
                        fs.unlinkSync(hook);
                    }
                    catch (e) {
                        return winjs_base_1.TPromise.wrapError(new Error('Error deleting the shared ipc hook.'));
                    }
                    return setup(false);
                });
            });
        }
        return setup(true);
    }
    function handshake() {
        return new winjs_base_1.TPromise(function (c, e) {
            process.once('message', c);
            process.once('error', e);
            process.send('hello');
        });
    }
    winjs_base_1.TPromise.join([setupIPC(process.env['VSCODE_SHARED_IPC_HOOK']), handshake()])
        .then(function (r) { return main(r[0], r[1]); })
        .then(function () { return setupPlanB(process.env['VSCODE_PID']); })
        .done(null, quit);
});
//# sourceMappingURL=sharedProcessMain.js.map