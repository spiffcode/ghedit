/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/workbench/parts/git/common/git', 'vs/workbench/parts/git/common/noopGitService', 'vs/workbench/parts/git/browser/gitServices', 'vs/platform/lifecycle/common/lifecycle', 'vs/workbench/parts/output/common/output', 'vs/workbench/services/editor/common/editorService', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/workspace/common/workspace', 'vs/base/node/service.cp', 'vs/workbench/parts/git/node/rawGitService', 'vs/base/common/uri', 'child_process', 'path', 'electron', 'vs/platform/storage/common/storage'], function (require, exports, winjs_base_1, git_1, noopGitService_1, gitServices_1, lifecycle_1, output_1, editorService_1, configuration_1, event_1, instantiation_1, message_1, workspace_1, service_cp_1, rawGitService_1, uri_1, child_process_1, path_1, electron_1, storage_1) {
    "use strict";
    function parseVersion(raw) {
        return raw.replace(/^git version /, '');
    }
    function findSpecificGit(path) {
        return new winjs_base_1.TPromise(function (c, e) {
            var buffers = [];
            var child = child_process_1.spawn(path, ['--version']);
            child.stdout.on('data', function (b) { return buffers.push(b); });
            child.on('error', e);
            child.on('exit', function (code) { return code ? e(new Error('Not found')) : c({ path: path, version: parseVersion(Buffer.concat(buffers).toString('utf8').trim()) }); });
        });
    }
    function findGitDarwin() {
        return new winjs_base_1.TPromise(function (c, e) {
            child_process_1.exec('which git', function (err, gitPathBuffer) {
                if (err) {
                    return e('git not found');
                }
                var path = gitPathBuffer.toString().replace(/^\s+|\s+$/g, '');
                function getVersion(path) {
                    // make sure git executes
                    child_process_1.exec('git --version', function (err, stdout) {
                        if (err) {
                            return e('git not found');
                        }
                        return c({ path: path, version: parseVersion(stdout.toString('utf8').trim()) });
                    });
                }
                if (path !== '/usr/bin/git') {
                    return getVersion(path);
                }
                // must check if XCode is installed
                child_process_1.exec('xcode-select -p', function (err) {
                    if (err && err.code === 2) {
                        // git is not installed, and launching /usr/bin/git
                        // will prompt the user to install it
                        return e('git not found');
                    }
                    getVersion(path);
                });
            });
        });
    }
    function findSystemGitWin32(base) {
        if (!base) {
            return winjs_base_1.TPromise.wrapError('Not found');
        }
        return findSpecificGit(path_1.join(base, 'Git', 'cmd', 'git.exe'));
    }
    function findGitWin32() {
        return findSystemGitWin32(process.env['ProgramW6432'])
            .then(null, function () { return findSystemGitWin32(process.env['ProgramFiles(x86)']); })
            .then(null, function () { return findSystemGitWin32(process.env['ProgramFiles']); })
            .then(null, function () { return findSpecificGit('git'); });
    }
    function findGit(hint) {
        var first = hint ? findSpecificGit(hint) : winjs_base_1.TPromise.wrapError(null);
        return first.then(null, function () {
            switch (process.platform) {
                case 'darwin': return findGitDarwin();
                case 'win32': return findGitWin32();
                default: return findSpecificGit('git');
            }
        });
    }
    var UnavailableRawGitService = (function (_super) {
        __extends(UnavailableRawGitService, _super);
        function UnavailableRawGitService() {
            _super.call(this, null);
        }
        return UnavailableRawGitService;
    }(rawGitService_1.RawGitService));
    var DisabledRawGitService = (function (_super) {
        __extends(DisabledRawGitService, _super);
        function DisabledRawGitService() {
            _super.call(this, null);
        }
        DisabledRawGitService.prototype.serviceState = function () {
            return winjs_base_1.TPromise.as(git_1.RawServiceState.Disabled);
        };
        return DisabledRawGitService;
    }(rawGitService_1.RawGitService));
    function createNativeRawGitService(workspaceRoot, path, defaultEncoding) {
        return findGit(path).then(function (_a) {
            var path = _a.path, version = _a.version;
            var client = new service_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
                serverName: 'Git',
                timeout: 1000 * 60,
                args: [path, workspaceRoot, defaultEncoding, electron_1.remote.process.execPath, version],
                env: {
                    ATOM_SHELL_INTERNAL_RUN_AS_NODE: 1,
                    AMD_ENTRYPOINT: 'vs/workbench/parts/git/electron-browser/gitApp'
                }
            });
            return client.getService('GitService', rawGitService_1.RawGitService);
        }, function () { return new UnavailableRawGitService(); });
    }
    var ElectronRawGitService = (function (_super) {
        __extends(ElectronRawGitService, _super);
        function ElectronRawGitService(workspaceRoot, configurationService) {
            _super.call(this, winjs_base_1.TPromise.as(configurationService.getConfiguration()).then(function (conf) {
                var enabled = conf.git ? conf.git.enabled : true;
                if (!enabled) {
                    return winjs_base_1.TPromise.as(new DisabledRawGitService());
                }
                var gitPath = (conf.git && conf.git.path) || null;
                var encoding = (conf.files && conf.files.encoding) || 'utf8';
                return createNativeRawGitService(workspaceRoot, gitPath, encoding);
            }));
        }
        ElectronRawGitService = __decorate([
            __param(1, configuration_1.IConfigurationService)
        ], ElectronRawGitService);
        return ElectronRawGitService;
    }(rawGitService_1.DelayedRawGitService));
    var ElectronGitService = (function (_super) {
        __extends(ElectronGitService, _super);
        function ElectronGitService(instantiationService, eventService, messageService, editorService, outputService, contextService, lifecycleService, storageService) {
            var workspace = contextService.getWorkspace();
            var raw = !workspace
                ? new noopGitService_1.NoOpGitService()
                : instantiationService.createInstance(ElectronRawGitService, workspace.resource.fsPath);
            _super.call(this, raw, instantiationService, eventService, messageService, editorService, outputService, contextService, lifecycleService, storageService);
        }
        ElectronGitService = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, event_1.IEventService),
            __param(2, message_1.IMessageService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, output_1.IOutputService),
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, lifecycle_1.ILifecycleService),
            __param(7, storage_1.IStorageService)
        ], ElectronGitService);
        return ElectronGitService;
    }(gitServices_1.GitService));
    exports.ElectronGitService = ElectronGitService;
});
//# sourceMappingURL=electronGitService.js.map