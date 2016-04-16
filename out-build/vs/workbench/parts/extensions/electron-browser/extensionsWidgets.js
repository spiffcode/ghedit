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
define(["require", "exports", 'vs/nls!vs/workbench/parts/extensions/electron-browser/extensionsWidgets', 'vs/base/common/severity', 'vs/base/common/async', 'vs/base/browser/dom', 'vs/base/common/lifecycle', 'vs/base/common/errors', 'vs/base/common/objects', 'vs/workbench/parts/output/common/output', 'vs/platform/extensions/common/extensions', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/parts/extensions/common/extensions', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/parts/extensions/common/extensionsUtil'], function (require, exports, nls, severity_1, async_1, dom_1, lifecycle_1, errors_1, objects_1, output_1, extensions_1, instantiation_1, extensions_2, quickOpenService_1, extensionsUtil_1) {
    "use strict";
    var InitialState = {
        errors: [],
        installing: [],
        outdated: []
    };
    function extensionEquals(one, other) {
        return one.publisher === other.publisher && one.name === other.name;
    }
    var OutdatedPeriod = 5 * 60 * 1000; // every 5 minutes
    var ExtensionsStatusbarItem = (function () {
        function ExtensionsStatusbarItem(extensionService, outputService, extensionsService, instantiationService, quickOpenService) {
            this.extensionService = extensionService;
            this.outputService = outputService;
            this.extensionsService = extensionsService;
            this.instantiationService = instantiationService;
            this.quickOpenService = quickOpenService;
            this.state = InitialState;
            this.outdatedDelayer = new async_1.ThrottledDelayer(OutdatedPeriod);
        }
        ExtensionsStatusbarItem.prototype.render = function (container) {
            var _this = this;
            this.domNode = dom_1.append(container, dom_1.emmet('a.extensions-statusbar'));
            dom_1.append(this.domNode, dom_1.emmet('.icon'));
            this.domNode.onclick = function () { return _this.onClick(); };
            this.checkErrors();
            this.checkOutdated();
            var disposables = [];
            this.extensionsService.onInstallExtension(this.onInstallExtension, this, disposables);
            this.extensionsService.onDidInstallExtension(this.onDidInstallExtension, this, disposables);
            this.extensionsService.onDidUninstallExtension(this.onDidUninstallExtension, this, disposables);
            return lifecycle_1.combinedDisposable(disposables);
        };
        ExtensionsStatusbarItem.prototype.updateState = function (obj) {
            this.state = objects_1.assign(this.state, obj);
            this.onStateChange();
        };
        Object.defineProperty(ExtensionsStatusbarItem.prototype, "hasErrors", {
            get: function () { return this.state.errors.length > 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionsStatusbarItem.prototype, "isInstalling", {
            get: function () { return this.state.installing.length > 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionsStatusbarItem.prototype, "hasUpdates", {
            get: function () { return this.state.outdated.length > 0; },
            enumerable: true,
            configurable: true
        });
        ExtensionsStatusbarItem.prototype.onStateChange = function () {
            dom_1.toggleClass(this.domNode, 'has-errors', this.hasErrors);
            dom_1.toggleClass(this.domNode, 'is-installing', !this.hasErrors && this.isInstalling);
            dom_1.toggleClass(this.domNode, 'has-updates', !this.hasErrors && !this.isInstalling && this.hasUpdates);
            if (this.hasErrors) {
                var singular = nls.localize(0, null);
                var plural = nls.localize(1, null, this.state.errors.length);
                this.domNode.title = this.state.errors.length > 1 ? plural : singular;
            }
            else if (this.isInstalling) {
                this.domNode.title = nls.localize(2, null, this.state.installing.length);
            }
            else if (this.hasUpdates) {
                var singular = nls.localize(3, null);
                var plural = nls.localize(4, null, this.state.outdated.length);
                this.domNode.title = this.state.outdated.length > 1 ? plural : singular;
            }
            else {
                this.domNode.title = nls.localize(5, null);
            }
        };
        ExtensionsStatusbarItem.prototype.onClick = function () {
            if (this.hasErrors) {
                this.showErrors(this.state.errors);
                this.updateState({ errors: [] });
            }
            else if (this.hasUpdates) {
                this.quickOpenService.show("ext update ");
            }
            else {
                this.quickOpenService.show(">" + extensions_2.ExtensionsLabel + ": ");
            }
        };
        ExtensionsStatusbarItem.prototype.showErrors = function (errors) {
            var _this = this;
            var promise = errors_1.onUnexpectedPromiseError(this.extensionsService.getInstalled());
            promise.done(function (installed) {
                errors.forEach(function (m) {
                    var extension = installed.filter(function (ext) { return ext.path === m.source; }).pop();
                    var name = extension && extension.name;
                    var message = name ? name + ": " + m.message : m.message;
                    var outputChannel = _this.outputService.getChannel(extensions_2.ExtensionsChannelId);
                    outputChannel.append(message);
                    outputChannel.show(true);
                });
            });
        };
        ExtensionsStatusbarItem.prototype.onInstallExtension = function (manifest) {
            var installing = this.state.installing.concat([manifest]);
            this.updateState({ installing: installing });
        };
        ExtensionsStatusbarItem.prototype.onDidInstallExtension = function (_a) {
            var _this = this;
            var extension = _a.extension;
            var installing = this.state.installing
                .filter(function (e) { return !extensionEquals(extension, e); });
            this.updateState({ installing: installing });
            this.outdatedDelayer.trigger(function () { return _this.checkOutdated(); }, 0);
        };
        ExtensionsStatusbarItem.prototype.onDidUninstallExtension = function () {
            var _this = this;
            this.outdatedDelayer.trigger(function () { return _this.checkOutdated(); }, 0);
        };
        ExtensionsStatusbarItem.prototype.checkErrors = function () {
            var _this = this;
            var promise = errors_1.onUnexpectedPromiseError(this.extensionService.onReady());
            promise.done(function () {
                var status = _this.extensionService.getExtensionsStatus();
                var errors = Object.keys(status)
                    .map(function (k) { return status[k].messages; })
                    .reduce(function (r, m) { return r.concat(m); }, [])
                    .filter(function (m) { return m.type > severity_1.default.Info; });
                _this.updateState({ errors: errors });
            });
        };
        ExtensionsStatusbarItem.prototype.checkOutdated = function () {
            var _this = this;
            return this.instantiationService.invokeFunction(extensionsUtil_1.getOutdatedExtensions)
                .then(null, function (_) { return []; }) // ignore errors
                .then(function (outdated) {
                _this.updateState({ outdated: outdated });
                // repeat this later
                _this.outdatedDelayer.trigger(function () { return _this.checkOutdated(); });
            });
        };
        ExtensionsStatusbarItem = __decorate([
            __param(0, extensions_1.IExtensionService),
            __param(1, output_1.IOutputService),
            __param(2, extensions_2.IExtensionsService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, quickOpenService_1.IQuickOpenService)
        ], ExtensionsStatusbarItem);
        return ExtensionsStatusbarItem;
    }());
    exports.ExtensionsStatusbarItem = ExtensionsStatusbarItem;
});
//# sourceMappingURL=extensionsWidgets.js.map