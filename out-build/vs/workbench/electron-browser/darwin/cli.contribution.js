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
define(["require", "exports", 'vs/nls!vs/workbench/electron-browser/darwin/cli.contribution', 'path', 'fs', 'os', 'child_process', 'vs/base/node/pfs', 'vs/base/common/async', 'vs/base/common/winjs.base', 'vs/base/common/uri', 'vs/base/common/actions', 'vs/workbench/common/actionRegistry', 'vs/workbench/common/contributions', 'vs/platform/platform', 'vs/platform/actions/common/actions', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/message/common/message', 'vs/platform/editor/common/editor', 'vs/platform/instantiation/common/instantiation'], function (require, exports, nls, path, fs, os, cp, pfs, async_1, winjs_base_1, uri_1, actions_1, actionRegistry_1, contributions_1, platform_1, actions_2, contextService_1, message_1, editor_1, instantiation_1) {
    "use strict";
    function ignore(code, value) {
        if (value === void 0) { value = null; }
        return function (err) { return err.code === code ? winjs_base_1.TPromise.as(value) : winjs_base_1.TPromise.wrapError(err); };
    }
    function readOrEmpty(name) {
        return pfs.readFile(name, 'utf8').then(null, ignore('ENOENT', ''));
    }
    var root = uri_1.default.parse(require.toUrl('')).fsPath;
    var source = path.resolve(root, '..', 'bin', 'code');
    var isAvailable = fs.existsSync(source);
    var InstallAction = (function (_super) {
        __extends(InstallAction, _super);
        function InstallAction(id, label, contextService, messageService, editorService) {
            _super.call(this, id, label);
            this.contextService = contextService;
            this.messageService = messageService;
            this.editorService = editorService;
        }
        Object.defineProperty(InstallAction.prototype, "applicationName", {
            get: function () {
                return this.contextService.getConfiguration().env.applicationName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InstallAction.prototype, "target", {
            get: function () {
                return "/usr/local/bin/" + this.applicationName;
            },
            enumerable: true,
            configurable: true
        });
        InstallAction.prototype.run = function () {
            var _this = this;
            return this.checkLegacy()
                .then(function (uses) {
                if (uses.length > 0) {
                    var _a = uses[0], file_1 = _a.file, lineNumber = _a.lineNumber;
                    var resource = uri_1.default.create('file', null, file_1);
                    var env = _this.contextService.getConfiguration().env;
                    var message = nls.localize(1, null, env.darwinBundleIdentifier, file_1, lineNumber);
                    var input_1 = { resource: resource, mime: 'text/x-shellscript' };
                    var actions = [
                        new actions_1.Action('inlineEdit', nls.localize(2, null, file_1), '', true, function () {
                            return _this.editorService.openEditor(input_1).then(function () {
                                var message = nls.localize(3, null, _this.applicationName, file_1);
                                var actions = [
                                    new actions_1.Action('cancel', nls.localize(4, null)),
                                    new actions_1.Action('continue', nls.localize(5, null), '', true, function () { return _this.run(); })
                                ];
                                _this.messageService.show(message_1.Severity.Info, { message: message, actions: actions });
                            });
                        })
                    ];
                    _this.messageService.show(message_1.Severity.Warning, { message: message, actions: actions });
                    return winjs_base_1.TPromise.as(null);
                }
                return _this.isInstalled()
                    .then(function (isInstalled) {
                    if (!isAvailable || isInstalled) {
                        return winjs_base_1.TPromise.as(null);
                    }
                    else {
                        var createSymlink_1 = function () {
                            return pfs.unlink(_this.target)
                                .then(null, ignore('ENOENT'))
                                .then(function () { return pfs.symlink(source, _this.target); });
                        };
                        return createSymlink_1().then(null, function (err) {
                            if (err.code === 'EACCES' || err.code === 'ENOENT') {
                                return _this.createBinFolder()
                                    .then(function () { return createSymlink_1(); });
                            }
                            return winjs_base_1.TPromise.wrapError(err);
                        });
                    }
                })
                    .then(function () { return _this.messageService.show(message_1.Severity.Info, nls.localize(6, null, _this.applicationName)); });
            });
        };
        InstallAction.prototype.isInstalled = function () {
            var _this = this;
            return pfs.lstat(this.target)
                .then(function (stat) { return stat.isSymbolicLink(); })
                .then(function () { return pfs.readlink(_this.target); })
                .then(function (link) { return link === source; })
                .then(null, ignore('ENOENT', false));
        };
        InstallAction.prototype.createBinFolder = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                var message = nls.localize(7, null);
                var actions = [
                    new actions_1.Action('cancel2', nls.localize(8, null), '', true, function () { e(new Error(nls.localize(9, null))); return null; }),
                    new actions_1.Action('ok', nls.localize(10, null), '', true, function () {
                        var command = 'osascript -e "do shell script \\"mkdir -p /usr/local/bin && chown \\" & (do shell script (\\"whoami\\")) & \\" /usr/local/bin\\" with administrator privileges"';
                        async_1.nfcall(cp.exec, command, {})
                            .then(null, function (_) { return winjs_base_1.TPromise.wrapError(new Error(nls.localize(11, null))); })
                            .done(c, e);
                        return null;
                    })
                ];
                _this.messageService.show(message_1.Severity.Info, { message: message, actions: actions });
            });
        };
        InstallAction.prototype.checkLegacy = function () {
            var _this = this;
            var files = [
                path.join(os.homedir(), '.bash_profile'),
                path.join(os.homedir(), '.bashrc'),
                path.join(os.homedir(), '.zshrc')
            ];
            return winjs_base_1.TPromise.join(files.map(function (f) { return readOrEmpty(f); })).then(function (result) {
                return result.reduce(function (result, contents, index) {
                    var file = files[index];
                    var env = _this.contextService.getConfiguration().env;
                    var lines = contents.split(/\r?\n/);
                    lines.some(function (line, index) {
                        if (line.indexOf(env.darwinBundleIdentifier) > -1 && !/^\s*#/.test(line)) {
                            result.push({ file: file, lineNumber: index + 1 });
                            return true;
                        }
                        return false;
                    });
                    return result;
                }, []);
            });
        };
        InstallAction.ID = 'workbench.action.installCommandLine';
        InstallAction.LABEL = nls.localize(0, null);
        InstallAction = __decorate([
            __param(2, contextService_1.IWorkspaceContextService),
            __param(3, message_1.IMessageService),
            __param(4, editor_1.IEditorService)
        ], InstallAction);
        return InstallAction;
    }(actions_1.Action));
    var UninstallAction = (function (_super) {
        __extends(UninstallAction, _super);
        function UninstallAction(id, label, contextService, messageService) {
            _super.call(this, id, label);
            this.contextService = contextService;
            this.messageService = messageService;
        }
        Object.defineProperty(UninstallAction.prototype, "applicationName", {
            get: function () {
                return this.contextService.getConfiguration().env.applicationName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UninstallAction.prototype, "target", {
            get: function () {
                return "/usr/local/bin/" + this.applicationName;
            },
            enumerable: true,
            configurable: true
        });
        UninstallAction.prototype.run = function () {
            var _this = this;
            return pfs.unlink(this.target)
                .then(null, ignore('ENOENT'))
                .then(function () { return _this.messageService.show(message_1.Severity.Info, nls.localize(13, null, _this.applicationName)); });
        };
        UninstallAction.ID = 'workbench.action.uninstallCommandLine';
        UninstallAction.LABEL = nls.localize(12, null);
        UninstallAction = __decorate([
            __param(2, contextService_1.IWorkspaceContextService),
            __param(3, message_1.IMessageService)
        ], UninstallAction);
        return UninstallAction;
    }(actions_1.Action));
    var DarwinCLIHelper = (function () {
        function DarwinCLIHelper(instantiationService, messageService) {
            var installAction = instantiationService.createInstance(InstallAction, InstallAction.ID, InstallAction.LABEL);
            installAction.checkLegacy().done(function (files) {
                if (files.length > 0) {
                    var message = nls.localize(14, null, installAction.applicationName);
                    var now = new actions_1.Action('changeNow', nls.localize(15, null), '', true, function () { return installAction.run(); });
                    var later = new actions_1.Action('later', nls.localize(16, null), '', true, function () {
                        messageService.show(message_1.Severity.Info, nls.localize(17, null, installAction.label));
                        return null;
                    });
                    var actions = [later, now];
                    messageService.show(message_1.Severity.Info, { message: message, actions: actions });
                }
            });
        }
        DarwinCLIHelper.prototype.getId = function () {
            return 'darwin.cli';
        };
        DarwinCLIHelper = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, message_1.IMessageService)
        ], DarwinCLIHelper);
        return DarwinCLIHelper;
    }());
    if (isAvailable && process.platform === 'darwin') {
        var category = nls.localize(18, null);
        var workbenchActionsRegistry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(InstallAction, InstallAction.ID, InstallAction.LABEL), category);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(UninstallAction, UninstallAction.ID, UninstallAction.LABEL), category);
        var workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(DarwinCLIHelper);
    }
});
//# sourceMappingURL=cli.contribution.js.map