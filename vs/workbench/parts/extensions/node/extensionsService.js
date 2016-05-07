/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/extensions/node/extensionsService', 'os', 'path', 'vs/base/common/types', 'vs/base/common/service', 'vs/base/node/pfs', 'vs/base/common/objects', 'vs/base/common/arrays', 'vs/base/node/zip', 'vs/base/common/winjs.base', 'vs/workbench/parts/extensions/common/extensions', 'vs/base/node/request', 'vs/base/node/proxy', 'vs/workbench/services/workspace/common/contextService', 'vs/base/common/async', 'vs/base/common/event', 'vs/workbench/node/userSettings', 'semver', 'vs/base/common/collections', 'vs/platform/extensions/node/extensionValidator'], function (require, exports, nls, os_1, path, types, service_1, pfs, objects_1, arrays_1, zip_1, winjs_base_1, extensions_1, request_1, proxy_1, contextService_1, async_1, event_1, userSettings_1, semver, collections_1, extensionValidator_1) {
    'use strict';
    function parseManifest(raw) {
        return new winjs_base_1.Promise(function (c, e) {
            try {
                c(JSON.parse(raw));
            }
            catch (err) {
                e(new Error(nls.localize(0, null)));
            }
        });
    }
    function validate(zipPath, extension, version) {
        if (version === void 0) { version = extension && extension.version; }
        return zip_1.buffer(zipPath, 'extension/package.json')
            .then(function (buffer) { return parseManifest(buffer.toString('utf8')); })
            .then(function (manifest) {
            if (extension) {
                if (extension.name !== manifest.name) {
                    return winjs_base_1.Promise.wrapError(Error(nls.localize(1, null)));
                }
                if (extension.publisher !== manifest.publisher) {
                    return winjs_base_1.Promise.wrapError(Error(nls.localize(2, null)));
                }
                if (version !== manifest.version) {
                    return winjs_base_1.Promise.wrapError(Error(nls.localize(3, null)));
                }
            }
            return winjs_base_1.TPromise.as(manifest);
        });
    }
    function createExtension(manifest, galleryInformation, path) {
        var extension = {
            name: manifest.name,
            displayName: manifest.displayName || manifest.name,
            publisher: manifest.publisher,
            version: manifest.version,
            engines: { vscode: manifest.engines.vscode },
            description: manifest.description || ''
        };
        if (galleryInformation) {
            extension.galleryInformation = galleryInformation;
        }
        if (path) {
            extension.path = path;
        }
        return extension;
    }
    function getExtensionId(extension, version) {
        if (version === void 0) { version = extension.version; }
        return extension.publisher + "." + extension.name + "-" + version;
    }
    var ExtensionsService = (function () {
        function ExtensionsService(contextService) {
            this.contextService = contextService;
            this.serviceId = extensions_1.IExtensionsService;
            this._onInstallExtension = new event_1.Emitter();
            this.onInstallExtension = this._onInstallExtension.event;
            this._onDidInstallExtension = new event_1.Emitter();
            this.onDidInstallExtension = this._onDidInstallExtension.event;
            this._onUninstallExtension = new event_1.Emitter();
            this.onUninstallExtension = this._onUninstallExtension.event;
            this._onDidUninstallExtension = new event_1.Emitter();
            this.onDidUninstallExtension = this._onDidUninstallExtension.event;
            var env = contextService.getConfiguration().env;
            this.extensionsPath = env.userExtensionsHome;
            this.obsoletePath = path.join(this.extensionsPath, '.obsolete');
            this.obsoleteFileLimiter = new async_1.Limiter(1);
        }
        ExtensionsService.prototype.install = function (arg) {
            var _this = this;
            if (types.isString(arg)) {
                return this.installFromZip(arg);
            }
            var extension = arg;
            return this.isObsolete(extension).then(function (obsolete) {
                if (obsolete) {
                    return winjs_base_1.TPromise.wrapError(new Error(nls.localize(4, null, extension.name)));
                }
                return _this.installFromGallery(arg);
            });
        };
        ExtensionsService.prototype.installFromGallery = function (extension) {
            var _this = this;
            var galleryInformation = extension.galleryInformation;
            if (!galleryInformation) {
                return winjs_base_1.TPromise.wrapError(new Error(nls.localize(5, null)));
            }
            this._onInstallExtension.fire(extension);
            return this.getLastValidExtensionVersion(extension, extension.galleryInformation.versions).then(function (versionInfo) {
                var version = versionInfo.version;
                var url = versionInfo.downloadUrl;
                var headers = versionInfo.downloadHeaders;
                var zipPath = path.join(os_1.tmpdir(), galleryInformation.id);
                var extensionPath = path.join(_this.extensionsPath, getExtensionId(extension, version));
                var manifestPath = path.join(extensionPath, 'package.json');
                return _this.request(url)
                    .then(function (opts) { return objects_1.assign(opts, { headers: headers }); })
                    .then(function (opts) { return request_1.download(zipPath, opts); })
                    .then(function () { return validate(zipPath, extension, version); })
                    .then(function (manifest) { return zip_1.extract(zipPath, extensionPath, { sourcePath: 'extension', overwrite: true }).then(function () { return manifest; }); })
                    .then(function (manifest) { return objects_1.assign({ __metadata: galleryInformation }, manifest); })
                    .then(function (manifest) { return pfs.writeFile(manifestPath, JSON.stringify(manifest, null, '\t')); })
                    .then(function () { _this._onDidInstallExtension.fire({ extension: extension }); return extension; })
                    .then(null, function (error) { _this._onDidInstallExtension.fire({ extension: extension, error: error }); return winjs_base_1.TPromise.wrapError(error); });
            });
        };
        ExtensionsService.prototype.getLastValidExtensionVersion = function (extension, versions) {
            var _this = this;
            if (!versions.length) {
                return winjs_base_1.TPromise.wrapError(new Error(nls.localize(6, null, extension.displayName)));
            }
            var version = versions[0];
            return this.request(version.manifestUrl)
                .then(function (opts) { return request_1.json(opts); })
                .then(function (manifest) {
                var codeVersion = _this.contextService.getConfiguration().env.version;
                var desc = {
                    isBuiltin: false,
                    engines: { vscode: manifest.engines.vscode },
                    main: manifest.main
                };
                if (!extensionValidator_1.isValidExtensionVersion(codeVersion, desc, [])) {
                    return _this.getLastValidExtensionVersion(extension, versions.slice(1));
                }
                return version;
            });
        };
        ExtensionsService.prototype.installFromZip = function (zipPath) {
            var _this = this;
            return validate(zipPath).then(function (manifest) {
                var extensionPath = path.join(_this.extensionsPath, getExtensionId(manifest));
                _this._onInstallExtension.fire(manifest);
                return zip_1.extract(zipPath, extensionPath, { sourcePath: 'extension', overwrite: true })
                    .then(function () { return createExtension(manifest, manifest.__metadata, extensionPath); })
                    .then(function (extension) { _this._onDidInstallExtension.fire({ extension: extension }); return extension; });
            });
        };
        ExtensionsService.prototype.uninstall = function (extension) {
            var _this = this;
            var extensionPath = extension.path || path.join(this.extensionsPath, getExtensionId(extension));
            return pfs.exists(extensionPath)
                .then(function (exists) { return exists ? null : winjs_base_1.Promise.wrapError(new Error(nls.localize(7, null))); })
                .then(function () { return _this._onUninstallExtension.fire(extension); })
                .then(function () { return _this.setObsolete(extension); })
                .then(function () { return pfs.rimraf(extensionPath); })
                .then(function () { return _this.unsetObsolete(extension); })
                .then(function () { return _this._onDidUninstallExtension.fire(extension); });
        };
        ExtensionsService.prototype.getInstalled = function (includeDuplicateVersions) {
            if (includeDuplicateVersions === void 0) { includeDuplicateVersions = false; }
            var all = this.getAllInstalled();
            if (includeDuplicateVersions) {
                return all;
            }
            return all.then(function (extensions) {
                var byId = collections_1.values(collections_1.groupBy(extensions, function (p) { return (p.publisher + "." + p.name); }));
                return byId.map(function (p) { return p.sort(function (a, b) { return semver.rcompare(a.version, b.version); })[0]; });
            });
        };
        ExtensionsService.prototype.getAllInstalled = function () {
            var _this = this;
            var limiter = new async_1.Limiter(10);
            return this.getObsoleteExtensions()
                .then(function (obsolete) {
                return pfs.readdir(_this.extensionsPath)
                    .then(function (extensions) { return extensions.filter(function (e) { return !obsolete[e]; }); })
                    .then(function (extensions) { return winjs_base_1.Promise.join(extensions.map(function (e) {
                    var extensionPath = path.join(_this.extensionsPath, e);
                    return limiter.queue(function () { return pfs.readFile(path.join(extensionPath, 'package.json'), 'utf8')
                        .then(function (raw) { return parseManifest(raw); })
                        .then(function (manifest) { return createExtension(manifest, manifest.__metadata, extensionPath); })
                        .then(null, function () { return null; }); });
                })); })
                    .then(function (result) { return result.filter(function (a) { return !!a; }); });
            });
        };
        ExtensionsService.prototype.removeDeprecatedExtensions = function () {
            var _this = this;
            var outdated = this.getOutdatedExtensions()
                .then(function (extensions) { return extensions.map(function (e) { return getExtensionId(e); }); });
            var obsolete = this.getObsoleteExtensions()
                .then(function (obsolete) { return Object.keys(obsolete); });
            return winjs_base_1.TPromise.join([outdated, obsolete])
                .then(function (result) { return arrays_1.flatten(result); })
                .then(function (extensionsIds) {
                return winjs_base_1.TPromise.join(extensionsIds.map(function (id) {
                    return pfs.rimraf(path.join(_this.extensionsPath, id))
                        .then(function () { return _this.withObsoleteExtensions(function (obsolete) { return delete obsolete[id]; }); });
                }));
            });
        };
        ExtensionsService.prototype.getOutdatedExtensions = function () {
            return this.getAllInstalled().then(function (plugins) {
                var byId = collections_1.values(collections_1.groupBy(plugins, function (p) { return (p.publisher + "." + p.name); }));
                var extensions = arrays_1.flatten(byId.map(function (p) { return p.sort(function (a, b) { return semver.rcompare(a.version, b.version); }).slice(1); }));
                return extensions
                    .filter(function (e) { return !!e.path; });
            });
        };
        ExtensionsService.prototype.isObsolete = function (extension) {
            var id = getExtensionId(extension);
            return this.withObsoleteExtensions(function (obsolete) { return !!obsolete[id]; });
        };
        ExtensionsService.prototype.setObsolete = function (extension) {
            var id = getExtensionId(extension);
            return this.withObsoleteExtensions(function (obsolete) { return objects_1.assign(obsolete, (_a = {}, _a[id] = true, _a)); var _a; });
        };
        ExtensionsService.prototype.unsetObsolete = function (extension) {
            var id = getExtensionId(extension);
            return this.withObsoleteExtensions(function (obsolete) { return delete obsolete[id]; });
        };
        ExtensionsService.prototype.getObsoleteExtensions = function () {
            return this.withObsoleteExtensions(function (obsolete) { return obsolete; });
        };
        ExtensionsService.prototype.withObsoleteExtensions = function (fn) {
            var _this = this;
            return this.obsoleteFileLimiter.queue(function () {
                var result = null;
                return pfs.readFile(_this.obsoletePath, 'utf8')
                    .then(null, function (err) { return err.code === 'ENOENT' ? winjs_base_1.TPromise.as('{}') : winjs_base_1.TPromise.wrapError(err); })
                    .then(function (raw) { return JSON.parse(raw); })
                    .then(function (obsolete) { result = fn(obsolete); return obsolete; })
                    .then(function (obsolete) {
                    if (Object.keys(obsolete).length === 0) {
                        return pfs.rimraf(_this.obsoletePath);
                    }
                    else {
                        var raw = JSON.stringify(obsolete);
                        return pfs.writeFile(_this.obsoletePath, raw);
                    }
                })
                    .then(function () { return result; });
            });
        };
        // Helper for proxy business... shameful.
        // This should be pushed down and not rely on the context service
        ExtensionsService.prototype.request = function (url) {
            var settings = winjs_base_1.TPromise.join([
                userSettings_1.UserSettings.getValue(this.contextService, 'http.proxy'),
                userSettings_1.UserSettings.getValue(this.contextService, 'http.proxyStrictSSL')
            ]);
            return settings.then(function (settings) {
                var proxyUrl = settings[0];
                var strictSSL = settings[1];
                var agent = proxy_1.getProxyAgent(url, { proxyUrl: proxyUrl, strictSSL: strictSSL });
                return { url: url, agent: agent, strictSSL: strictSSL };
            });
        };
        __decorate([
            service_1.ServiceEvent
        ], ExtensionsService.prototype, "onInstallExtension", void 0);
        __decorate([
            service_1.ServiceEvent
        ], ExtensionsService.prototype, "onDidInstallExtension", void 0);
        __decorate([
            service_1.ServiceEvent
        ], ExtensionsService.prototype, "onUninstallExtension", void 0);
        __decorate([
            service_1.ServiceEvent
        ], ExtensionsService.prototype, "onDidUninstallExtension", void 0);
        ExtensionsService = __decorate([
            __param(0, contextService_1.IWorkspaceContextService)
        ], ExtensionsService);
        return ExtensionsService;
    }());
    exports.ExtensionsService = ExtensionsService;
});
//# sourceMappingURL=extensionsService.js.map