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
define(["require", "exports", 'vs/nls!vs/workbench/parts/extensions/electron-browser/extensionsQuickOpen', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/base/common/types', 'vs/base/common/paging', 'vs/base/common/async', 'vs/base/browser/dom', 'vs/base/common/severity', 'vs/base/common/errors', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/common/quickOpenPaging', 'vs/base/common/filters', 'vs/workbench/browser/quickopen', 'vs/workbench/parts/extensions/common/extensions', 'vs/workbench/parts/extensions/electron-browser/extensionsActions', 'vs/platform/message/common/message', 'vs/platform/telemetry/common/telemetry', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/services/workspace/common/contextService', 'vs/base/browser/ui/highlightedlabel/highlightedLabel', 'vs/base/common/actions', 'vs/base/browser/ui/actionbar/actionbar', 'electron', 'vs/workbench/parts/extensions/common/extensionsUtil'], function (require, exports, nls, lifecycle_1, winjs_base_1, types_1, paging_1, async_1, dom, severity_1, errors_1, quickOpen_1, quickOpenPaging_1, filters_1, quickopen_1, extensions_1, extensionsActions_1, message_1, telemetry_1, instantiation_1, contextService_1, highlightedLabel_1, actions_1, actionbar_1, electron_1, extensionsUtil_1) {
    "use strict";
    var $ = dom.emmet;
    var InstallLabel = nls.localize(0, null);
    var UpdateLabel = nls.localize(1, null);
    (function (ExtensionState) {
        ExtensionState[ExtensionState["Uninstalled"] = 0] = "Uninstalled";
        ExtensionState[ExtensionState["Installed"] = 1] = "Installed";
        ExtensionState[ExtensionState["Outdated"] = 2] = "Outdated";
    })(exports.ExtensionState || (exports.ExtensionState = {}));
    var ExtensionState = exports.ExtensionState;
    function getHighlights(input, extension, nullIfEmpty) {
        if (nullIfEmpty === void 0) { nullIfEmpty = true; }
        var id = filters_1.matchesContiguousSubString(input, extension.publisher + "." + extension.name) || [];
        var name = filters_1.matchesContiguousSubString(input, extension.name) || [];
        var displayName = filters_1.matchesContiguousSubString(input, extension.displayName) || [];
        var description = filters_1.matchesContiguousSubString(input, extension.description) || [];
        if (nullIfEmpty && !id.length && !name.length && !displayName.length && !description.length) {
            return null;
        }
        return { id: id, name: name, displayName: displayName, description: description };
    }
    function extensionEntryCompare(one, other) {
        var oneInstallCount = one.extension.galleryInformation ? one.extension.galleryInformation.installCount : 0;
        var otherInstallCount = other.extension.galleryInformation ? other.extension.galleryInformation.installCount : 0;
        var diff = otherInstallCount - oneInstallCount;
        if (diff !== 0) {
            return diff;
        }
        return one.extension.displayName.localeCompare(other.extension.displayName);
    }
    var OpenLicenseAction = (function (_super) {
        __extends(OpenLicenseAction, _super);
        function OpenLicenseAction(contextService) {
            _super.call(this, 'extensions.open-license', nls.localize(2, null), '', true);
            this.contextService = contextService;
        }
        OpenLicenseAction.prototype.run = function (extension) {
            var url = this.contextService.getConfiguration().env.extensionsGallery.itemUrl + "/" + extension.publisher + "." + extension.name + "/license";
            electron_1.shell.openExternal(url);
            return winjs_base_1.TPromise.as(null);
        };
        OpenLicenseAction = __decorate([
            __param(0, contextService_1.IWorkspaceContextService)
        ], OpenLicenseAction);
        return OpenLicenseAction;
    }(actions_1.Action));
    var OpenInGalleryAction = (function (_super) {
        __extends(OpenInGalleryAction, _super);
        function OpenInGalleryAction(promptToInstall, messageService, contextService, instantiationService) {
            _super.call(this, 'extensions.open-in-gallery', nls.localize(3, null), '', true);
            this.promptToInstall = promptToInstall;
            this.messageService = messageService;
            this.contextService = contextService;
            this.instantiationService = instantiationService;
        }
        OpenInGalleryAction.prototype.run = function (extension) {
            var _this = this;
            var url = this.contextService.getConfiguration().env.extensionsGallery.itemUrl + "/" + extension.publisher + "." + extension.name;
            electron_1.shell.openExternal(url);
            if (!this.promptToInstall) {
                return winjs_base_1.TPromise.as(null);
            }
            var hideMessage = this.messageService.show(severity_1.default.Info, {
                message: nls.localize(4, null, extension.displayName),
                actions: [
                    new actions_1.Action('cancelaction', nls.localize(5, null)),
                    new actions_1.Action('installNow', nls.localize(6, null), null, true, function () {
                        hideMessage();
                        var hideInstallMessage = _this.messageService.show(severity_1.default.Info, nls.localize(7, null, extension.displayName));
                        var action = _this.instantiationService.createInstance(extensionsActions_1.InstallAction, '');
                        return action.run(extension).then(function (r) {
                            hideInstallMessage();
                            return winjs_base_1.TPromise.as(r);
                        }, function (e) {
                            hideInstallMessage();
                            return winjs_base_1.TPromise.wrapError(e);
                        });
                    })
                ]
            });
            return winjs_base_1.TPromise.as(null);
        };
        OpenInGalleryAction = __decorate([
            __param(1, message_1.IMessageService),
            __param(2, contextService_1.IWorkspaceContextService),
            __param(3, instantiation_1.IInstantiationService)
        ], OpenInGalleryAction);
        return OpenInGalleryAction;
    }(actions_1.Action));
    var InstallRunner = (function () {
        function InstallRunner(instantiationService) {
            this.instantiationService = instantiationService;
        }
        InstallRunner.prototype.run = function (entry, mode, context) {
            if (mode === quickOpen_1.Mode.PREVIEW) {
                return false;
            }
            if (entry.state === ExtensionState.Installed) {
                return false;
            }
            if (!this.action) {
                this.action = this.instantiationService.createInstance(extensionsActions_1.InstallAction, InstallLabel);
            }
            this.action.run(entry.extension).done(null, errors_1.onUnexpectedError);
            return true;
        };
        InstallRunner = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], InstallRunner);
        return InstallRunner;
    }());
    var AccessibilityProvider = (function () {
        function AccessibilityProvider() {
        }
        AccessibilityProvider.prototype.getAriaLabel = function (entry) {
            return nls.localize(8, null, entry.extension.displayName, entry.extension.description);
        };
        return AccessibilityProvider;
    }());
    var Renderer = (function () {
        function Renderer(instantiationService, extensionsService) {
            this.instantiationService = instantiationService;
            this.extensionsService = extensionsService;
        }
        Renderer.prototype.getHeight = function (entry) {
            return 48;
        };
        Renderer.prototype.getTemplateId = function (entry) {
            return 'extension';
        };
        Renderer.prototype.renderTemplate = function (templateId, container) {
            // Important to preserve order here.
            var root = dom.append(container, $('.extension'));
            var firstRow = dom.append(root, $('.row'));
            var secondRow = dom.append(root, $('.row'));
            var published = dom.append(firstRow, $('.published'));
            var displayName = new highlightedLabel_1.HighlightedLabel(dom.append(firstRow, $('span.name')));
            var installCount = dom.append(firstRow, $('span.installCount'));
            var version = dom.append(published, $('span.version'));
            var author = dom.append(published, $('span.author'));
            return {
                root: root,
                author: author,
                displayName: displayName,
                version: version,
                installCount: installCount,
                actionbar: new actionbar_1.ActionBar(dom.append(secondRow, $('.actions'))),
                description: new highlightedLabel_1.HighlightedLabel(dom.append(secondRow, $('span.description'))),
                disposables: []
            };
        };
        Renderer.prototype.renderPlaceholder = function (index, templateId, data) {
            dom.addClass(data.root, 'loading');
            data.author.textContent = nls.localize(9, null);
            data.displayName.set(nls.localize(10, null));
            data.version.textContent = '0.0.1';
            data.installCount.textContent = '';
            dom.removeClass(data.installCount, 'octicon');
            dom.removeClass(data.installCount, 'octicon-cloud-download');
            data.actionbar.clear();
            data.description.set(nls.localize(11, null));
            data.disposables = lifecycle_1.dispose(data.disposables);
        };
        Renderer.prototype.renderElement = function (entry, templateId, data) {
            var _this = this;
            dom.removeClass(data.root, 'loading');
            var extension = entry.extension;
            var publisher = extension.galleryInformation ? extension.galleryInformation.publisherDisplayName : extension.publisher;
            var installCount = extension.galleryInformation ? extension.galleryInformation.installCount : null;
            var actionOptions = { icon: true, label: false };
            var updateActions = function () {
                data.actionbar.clear();
                if (entry.extension.galleryInformation) {
                    data.actionbar.push(_this.instantiationService.createInstance(OpenInGalleryAction, entry.state !== ExtensionState.Installed), { label: true, icon: false });
                    data.actionbar.push(_this.instantiationService.createInstance(OpenLicenseAction), { label: true, icon: false });
                }
                switch (entry.state) {
                    case ExtensionState.Uninstalled:
                        if (entry.extension.galleryInformation) {
                            data.actionbar.push(_this.instantiationService.createInstance(extensionsActions_1.InstallAction, InstallLabel), actionOptions);
                        }
                        break;
                    case ExtensionState.Installed:
                        data.actionbar.push(_this.instantiationService.createInstance(extensionsActions_1.UninstallAction), actionOptions);
                        break;
                    case ExtensionState.Outdated:
                        data.actionbar.push(_this.instantiationService.createInstance(extensionsActions_1.UninstallAction), actionOptions);
                        data.actionbar.push(_this.instantiationService.createInstance(extensionsActions_1.InstallAction, UpdateLabel), actionOptions);
                        break;
                }
            };
            var onExtensionStateChange = function (e, state) {
                if (extensionsUtil_1.extensionEquals(e, extension)) {
                    entry.state = state;
                    updateActions();
                }
            };
            data.actionbar.context = extension;
            updateActions();
            data.disposables = lifecycle_1.dispose(data.disposables);
            data.disposables.push(this.extensionsService.onDidInstallExtension(function (e) { return onExtensionStateChange(e.extension, ExtensionState.Installed); }));
            data.disposables.push(this.extensionsService.onDidUninstallExtension(function (e) { return onExtensionStateChange(e, ExtensionState.Uninstalled); }));
            data.displayName.set(extension.displayName, entry.highlights.displayName);
            data.displayName.element.title = extension.name;
            data.version.textContent = extension.version;
            if (types_1.isNumber(installCount)) {
                data.installCount.textContent = String(installCount);
                dom.addClass(data.installCount, 'octicon');
                dom.addClass(data.installCount, 'octicon-cloud-download');
                if (!installCount) {
                    data.installCount.title = nls.localize(12, null, extension.displayName);
                }
                else if (installCount === 1) {
                    data.installCount.title = nls.localize(13, null, extension.displayName);
                }
                else {
                    data.installCount.title = nls.localize(14, null, extension.displayName, installCount);
                }
            }
            else {
                data.installCount.textContent = '';
                dom.removeClass(data.installCount, 'octicon');
                dom.removeClass(data.installCount, 'octicon-cloud-download');
            }
            data.author.textContent = publisher;
            data.description.set(extension.description, entry.highlights.description);
            data.description.element.title = extension.description;
        };
        Renderer.prototype.disposeTemplate = function (templateId, data) {
            data.displayName.dispose();
            data.description.dispose();
            data.disposables = lifecycle_1.dispose(data.disposables);
        };
        Renderer = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, extensions_1.IExtensionsService)
        ], Renderer);
        return Renderer;
    }());
    var DataSource = (function () {
        function DataSource() {
        }
        DataSource.prototype.getId = function (entry) {
            var extension = entry.extension;
            if (!extension) {
                throw new Error("Not an extension entry. Found " + Object.keys(entry).slice(5) + ",... instead.");
            }
            if (extension.galleryInformation) {
                return extension.galleryInformation.id + "-" + extension.version;
            }
            return "local@" + extension.publisher + "." + extension.name + "-" + extension.version + "@" + (extension.path || '');
        };
        DataSource.prototype.getLabel = function (entry) {
            return entry.extension.name;
        };
        return DataSource;
    }());
    var LocalExtensionsModel = (function () {
        function LocalExtensionsModel(extensions, instantiationService) {
            this.extensions = extensions;
            this.dataSource = new DataSource();
            this.accessibilityProvider = new AccessibilityProvider();
            this.runner = { run: function () { return false; } };
            this.renderer = instantiationService.createInstance(Renderer);
            this.entries = [];
        }
        Object.defineProperty(LocalExtensionsModel.prototype, "input", {
            set: function (input) {
                this.entries = this.extensions
                    .map(function (extension) { return ({ extension: extension, highlights: getHighlights(input.trim(), extension) }); })
                    .filter(function (_a) {
                    var highlights = _a.highlights;
                    return !!highlights;
                })
                    .map(function (_a) {
                    var extension = _a.extension, highlights = _a.highlights;
                    return ({
                        extension: extension,
                        highlights: highlights,
                        state: ExtensionState.Installed
                    });
                })
                    .sort(extensionEntryCompare);
            },
            enumerable: true,
            configurable: true
        });
        LocalExtensionsModel = __decorate([
            __param(1, instantiation_1.IInstantiationService)
        ], LocalExtensionsModel);
        return LocalExtensionsModel;
    }());
    var LocalExtensionsHandler = (function (_super) {
        __extends(LocalExtensionsHandler, _super);
        function LocalExtensionsHandler(instantiationService, extensionsService) {
            _super.call(this);
            this.instantiationService = instantiationService;
            this.extensionsService = extensionsService;
            this.modelPromise = null;
        }
        LocalExtensionsHandler.prototype.getAriaLabel = function () {
            return nls.localize(15, null);
        };
        LocalExtensionsHandler.prototype.getResults = function (input) {
            var _this = this;
            if (!this.modelPromise) {
                this.modelPromise = this.extensionsService.getInstalled()
                    .then(function (extensions) { return _this.instantiationService.createInstance(LocalExtensionsModel, extensions); });
            }
            return this.modelPromise.then(function (model) {
                model.input = input;
                return model;
            });
        };
        LocalExtensionsHandler.prototype.getEmptyLabel = function (input) {
            return nls.localize(16, null);
        };
        LocalExtensionsHandler.prototype.getAutoFocus = function (searchValue) {
            return { autoFocusFirstEntry: true };
        };
        LocalExtensionsHandler.prototype.onClose = function (canceled) {
            this.modelPromise = null;
        };
        LocalExtensionsHandler = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, extensions_1.IExtensionsService)
        ], LocalExtensionsHandler);
        return LocalExtensionsHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.LocalExtensionsHandler = LocalExtensionsHandler;
    var GalleryExtensionsHandler = (function (_super) {
        __extends(GalleryExtensionsHandler, _super);
        function GalleryExtensionsHandler(instantiationService, extensionsService, galleryService, telemetryService) {
            _super.call(this);
            this.instantiationService = instantiationService;
            this.extensionsService = extensionsService;
            this.galleryService = galleryService;
            this.telemetryService = telemetryService;
            this.delayer = new async_1.ThrottledDelayer(500);
        }
        GalleryExtensionsHandler.prototype.getAriaLabel = function () {
            return nls.localize(17, null);
        };
        GalleryExtensionsHandler.prototype.getResults = function (text) {
            var _this = this;
            return this.extensionsService.getInstalled().then(function (localExtensions) {
                return _this.delayer.trigger(function () { return _this.galleryService.query({ text: text }); }).then(function (result) {
                    var pager = paging_1.mapPager(result, function (extension) {
                        var local = localExtensions.filter(function (local) { return extensionsUtil_1.extensionEquals(local, extension); })[0];
                        return {
                            extension: extension,
                            highlights: getHighlights(text.trim(), extension, false),
                            state: local
                                ? (local.version === extension.version ? ExtensionState.Installed : ExtensionState.Outdated)
                                : ExtensionState.Uninstalled
                        };
                    });
                    return new quickOpenPaging_1.QuickOpenPagedModel(new paging_1.PagedModel(pager), new DataSource(), _this.instantiationService.createInstance(Renderer), _this.instantiationService.createInstance(InstallRunner));
                });
            });
        };
        GalleryExtensionsHandler.prototype.getEmptyLabel = function (input) {
            return nls.localize(18, null);
        };
        GalleryExtensionsHandler.prototype.getAutoFocus = function (searchValue) {
            return { autoFocusFirstEntry: true };
        };
        GalleryExtensionsHandler = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, extensions_1.IExtensionsService),
            __param(2, extensions_1.IGalleryService),
            __param(3, telemetry_1.ITelemetryService)
        ], GalleryExtensionsHandler);
        return GalleryExtensionsHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.GalleryExtensionsHandler = GalleryExtensionsHandler;
    var OutdatedExtensionsModel = (function () {
        function OutdatedExtensionsModel(outdatedExtensions, instantiationService) {
            this.outdatedExtensions = outdatedExtensions;
            this.dataSource = new DataSource();
            this.accessibilityProvider = new AccessibilityProvider();
            this.renderer = instantiationService.createInstance(Renderer);
            this.runner = instantiationService.createInstance(InstallRunner);
            this.entries = [];
        }
        Object.defineProperty(OutdatedExtensionsModel.prototype, "input", {
            set: function (input) {
                this.entries = this.outdatedExtensions
                    .map(function (extension) { return ({ extension: extension, highlights: getHighlights(input.trim(), extension) }); })
                    .filter(function (_a) {
                    var highlights = _a.highlights;
                    return !!highlights;
                })
                    .map(function (_a) {
                    var extension = _a.extension, highlights = _a.highlights;
                    return ({
                        extension: extension,
                        highlights: highlights,
                        state: ExtensionState.Outdated
                    });
                })
                    .sort(extensionEntryCompare);
            },
            enumerable: true,
            configurable: true
        });
        OutdatedExtensionsModel = __decorate([
            __param(1, instantiation_1.IInstantiationService)
        ], OutdatedExtensionsModel);
        return OutdatedExtensionsModel;
    }());
    var OutdatedExtensionsHandler = (function (_super) {
        __extends(OutdatedExtensionsHandler, _super);
        function OutdatedExtensionsHandler(instantiationService, extensionsService, galleryService, telemetryService) {
            _super.call(this);
            this.instantiationService = instantiationService;
            this.extensionsService = extensionsService;
            this.galleryService = galleryService;
            this.telemetryService = telemetryService;
        }
        OutdatedExtensionsHandler.prototype.getAriaLabel = function () {
            return nls.localize(19, null);
        };
        OutdatedExtensionsHandler.prototype.getResults = function (input) {
            var _this = this;
            if (!this.modelPromise) {
                this.telemetryService.publicLog('extensionGallery:open');
                this.modelPromise = this.instantiationService.invokeFunction(extensionsUtil_1.getOutdatedExtensions)
                    .then(function (outdated) { return _this.instantiationService.createInstance(OutdatedExtensionsModel, outdated); });
            }
            return this.modelPromise.then(function (model) {
                model.input = input;
                return model;
            });
        };
        OutdatedExtensionsHandler.prototype.onClose = function (canceled) {
            this.modelPromise = null;
        };
        OutdatedExtensionsHandler.prototype.getEmptyLabel = function (input) {
            return nls.localize(20, null);
        };
        OutdatedExtensionsHandler.prototype.getAutoFocus = function (searchValue) {
            return { autoFocusFirstEntry: true };
        };
        OutdatedExtensionsHandler = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, extensions_1.IExtensionsService),
            __param(2, extensions_1.IGalleryService),
            __param(3, telemetry_1.ITelemetryService)
        ], OutdatedExtensionsHandler);
        return OutdatedExtensionsHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.OutdatedExtensionsHandler = OutdatedExtensionsHandler;
    var SuggestedExtensionsModel = (function () {
        function SuggestedExtensionsModel(suggestedExtensions, localExtensions, instantiationService) {
            this.suggestedExtensions = suggestedExtensions;
            this.localExtensions = localExtensions;
            this.dataSource = new DataSource();
            this.renderer = instantiationService.createInstance(Renderer);
            this.runner = instantiationService.createInstance(InstallRunner);
            this.entries = [];
        }
        Object.defineProperty(SuggestedExtensionsModel.prototype, "input", {
            set: function (input) {
                var _this = this;
                this.entries = this.suggestedExtensions
                    .map(function (extension) { return ({ extension: extension, highlights: getHighlights(input.trim(), extension) }); })
                    .filter(function (_a) {
                    var extension = _a.extension, highlights = _a.highlights;
                    var local = _this.localExtensions.filter(function (local) { return extensionsUtil_1.extensionEquals(local, extension); })[0];
                    return !local && !!highlights;
                })
                    .map(function (_a) {
                    var extension = _a.extension, highlights = _a.highlights;
                    return {
                        extension: extension,
                        highlights: highlights,
                        state: ExtensionState.Uninstalled
                    };
                })
                    .sort(extensionEntryCompare);
            },
            enumerable: true,
            configurable: true
        });
        SuggestedExtensionsModel = __decorate([
            __param(2, instantiation_1.IInstantiationService)
        ], SuggestedExtensionsModel);
        return SuggestedExtensionsModel;
    }());
    var SuggestedExtensionHandler = (function (_super) {
        __extends(SuggestedExtensionHandler, _super);
        function SuggestedExtensionHandler(extensionTipsService, instantiationService, telemetryService, extensionsService) {
            _super.call(this);
            this.extensionTipsService = extensionTipsService;
            this.instantiationService = instantiationService;
            this.telemetryService = telemetryService;
            this.extensionsService = extensionsService;
        }
        SuggestedExtensionHandler.prototype.getResults = function (input) {
            var _this = this;
            if (!this.modelPromise) {
                this.telemetryService.publicLog('extensionRecommendations:open');
                this.modelPromise = winjs_base_1.TPromise.join([this.extensionTipsService.getRecommendations(), this.extensionsService.getInstalled()])
                    .then(function (result) { return _this.instantiationService.createInstance(SuggestedExtensionsModel, result[0], result[1]); });
            }
            return this.modelPromise.then(function (model) {
                model.input = input;
                return model;
            });
        };
        SuggestedExtensionHandler.prototype.onClose = function (canceled) {
            this.modelPromise = null;
        };
        SuggestedExtensionHandler.prototype.getEmptyLabel = function (input) {
            return nls.localize(21, null);
        };
        SuggestedExtensionHandler.prototype.getAutoFocus = function (searchValue) {
            return { autoFocusFirstEntry: true };
        };
        SuggestedExtensionHandler = __decorate([
            __param(0, extensions_1.IExtensionTipsService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, telemetry_1.ITelemetryService),
            __param(3, extensions_1.IExtensionsService)
        ], SuggestedExtensionHandler);
        return SuggestedExtensionHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.SuggestedExtensionHandler = SuggestedExtensionHandler;
});
//# sourceMappingURL=extensionsQuickOpen.js.map