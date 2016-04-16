/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'fs', 'vs/base/common/platform', 'vs/base/node/service.net', 'vs/base/common/winjs.base', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/instantiation/common/descriptors', 'vs/platform/request/common/request', 'vs/workbench/services/request/node/requestService', 'vs/platform/workspace/common/workspace', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/event/common/event', 'vs/platform/event/common/eventService', 'vs/platform/configuration/common/configuration', 'vs/workbench/services/configuration/node/configurationService', 'vs/workbench/parts/extensions/common/extensions', 'vs/workbench/parts/extensions/node/extensionsService'], function (require, exports, fs, platform, service_net_1, winjs_base_1, instantiationService_1, descriptors_1, request_1, requestService_1, workspace_1, contextService_1, event_1, eventService_1, configuration_1, configurationService_1, extensions_1, extensionsService_1) {
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
        var configurationService = new configurationService_1.ConfigurationService(contextService, eventService);
        var requestService = new requestService_1.RequestService(contextService, configurationService);
        var instantiationService = instantiationService_1.createInstantiationService();
        instantiationService.addSingleton(event_1.IEventService, eventService);
        instantiationService.addSingleton(workspace_1.IWorkspaceContextService, contextService);
        instantiationService.addSingleton(configuration_1.IConfigurationService, configurationService);
        instantiationService.addSingleton(request_1.IRequestService, requestService);
        instantiationService.addSingleton(extensions_1.IExtensionsService, new descriptors_1.SyncDescriptor(extensionsService_1.ExtensionsService));
        var extensionService = instantiationService.getInstance(extensions_1.IExtensionsService);
        server.registerService('ExtensionService', extensionService);
        // eventually clean up old extensions
        setTimeout(function () { return extensionService.removeDeprecatedExtensions(); }, 5000);
    }
    function setupIPC(hook) {
        function setup(retry) {
            return service_net_1.serve(hook).then(null, function (err) {
                if (!retry || platform.isWindows || err.code !== 'EADDRINUSE') {
                    return winjs_base_1.TPromise.wrapError(err);
                }
                // should retry, not windows and eaddrinuse
                return service_net_1.connect(hook).then(function (client) {
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