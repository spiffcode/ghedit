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
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/common/paths', 'vs/base/common/severity', 'vs/base/common/winjs.base', 'vs/platform/extensions/common/abstractExtensionService', 'vs/platform/extensions/common/extensionsRegistry', 'vs/platform/storage/common/remotable.storage', 'vs/platform/thread/common/thread'], function (require, exports, lifecycle_1, paths, severity_1, winjs_base_1, abstractExtensionService_1, extensionsRegistry_1, remotable_storage_1, thread_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var hasOwnProperty = Object.hasOwnProperty;
    /**
     * Represents a failed extension in the ext host.
     */
    var MainProcessFailedExtension = (function (_super) {
        __extends(MainProcessFailedExtension, _super);
        function MainProcessFailedExtension() {
            _super.call(this, true);
        }
        return MainProcessFailedExtension;
    }(abstractExtensionService_1.ActivatedExtension));
    /**
     * Represents an extension that was successfully loaded or an
     * empty extension in the ext host.
     */
    var MainProcessSuccessExtension = (function (_super) {
        __extends(MainProcessSuccessExtension, _super);
        function MainProcessSuccessExtension() {
            _super.call(this, false);
        }
        return MainProcessSuccessExtension;
    }(abstractExtensionService_1.ActivatedExtension));
    function messageWithSource(msg) {
        return (msg.source ? '[' + msg.source + ']: ' : '') + msg.message;
    }
    var MainProcessExtensionService = (function (_super) {
        __extends(MainProcessExtensionService, _super);
        /**
         * This class is constructed manually because it is a service, so it doesn't use any ctor injection
         */
        function MainProcessExtensionService(contextService, threadService, messageService, telemetryService) {
            var _this = this;
            _super.call(this, false);
            var config = contextService.getConfiguration();
            this._isDev = !config.env.isBuilt || !!config.env.extensionDevelopmentPath;
            this._messageService = messageService;
            threadService.registerRemotableInstance(MainProcessExtensionService, this);
            this._threadService = threadService;
            this._telemetryService = telemetryService;
            this._proxy = this._threadService.getRemotable(ExtHostExtensionService);
            this._extensionsStatus = {};
            extensionsRegistry_1.ExtensionsRegistry.handleExtensionPoints(function (msg) { return _this._handleMessage(msg); });
        }
        MainProcessExtensionService.prototype._handleMessage = function (msg) {
            this._showMessage(msg.type, messageWithSource(msg));
            if (!this._extensionsStatus[msg.source]) {
                this._extensionsStatus[msg.source] = { messages: [] };
            }
            this._extensionsStatus[msg.source].messages.push(msg);
        };
        MainProcessExtensionService.prototype.$localShowMessage = function (severity, msg) {
            var messageShown = false;
            if (severity === severity_1.default.Error || severity === severity_1.default.Warning) {
                if (this._isDev) {
                    // Only show nasty intrusive messages if doing extension development.
                    this._messageService.show(severity, msg);
                    messageShown = true;
                }
            }
            if (!messageShown) {
                switch (severity) {
                    case severity_1.default.Error:
                        console.error(msg);
                        break;
                    case severity_1.default.Warning:
                        console.warn(msg);
                        break;
                    default:
                        console.log(msg);
                }
            }
        };
        // -- overwriting AbstractExtensionService
        MainProcessExtensionService.prototype.getExtensionsStatus = function () {
            return this._extensionsStatus;
        };
        MainProcessExtensionService.prototype._showMessage = function (severity, msg) {
            this._proxy.$localShowMessage(severity, msg);
            this.$localShowMessage(severity, msg);
        };
        MainProcessExtensionService.prototype._createFailedExtension = function () {
            return new MainProcessFailedExtension();
        };
        MainProcessExtensionService.prototype._actualActivateExtension = function (extensionDescription) {
            var _this = this;
            // redirect extension activation to the extension host
            return this._proxy.$activateExtension(extensionDescription).then(function (_) {
                // the extension host calls $onExtensionActivated, where we write to `_activatedExtensions`
                return _this._activatedExtensions[extensionDescription.id];
            });
        };
        // -- called by extension host
        MainProcessExtensionService.prototype.$onExtensionHostReady = function (extensionDescriptions, messages) {
            var _this = this;
            extensionsRegistry_1.ExtensionsRegistry.registerExtensions(extensionDescriptions);
            messages.forEach(function (entry) { return _this._handleMessage(entry); });
            this._triggerOnReady();
        };
        MainProcessExtensionService.prototype.$onExtensionActivated = function (extensionId) {
            this._activatedExtensions[extensionId] = new MainProcessSuccessExtension();
        };
        MainProcessExtensionService.prototype.$onExtensionActivationFailed = function (extensionId) {
            this._activatedExtensions[extensionId] = new MainProcessFailedExtension();
        };
        MainProcessExtensionService = __decorate([
            thread_1.Remotable.MainContext('MainProcessExtensionService')
        ], MainProcessExtensionService);
        return MainProcessExtensionService;
    }(abstractExtensionService_1.AbstractExtensionService));
    exports.MainProcessExtensionService = MainProcessExtensionService;
    var ExtHostExtension = (function (_super) {
        __extends(ExtHostExtension, _super);
        function ExtHostExtension(activationFailed, module, exports, subscriptions) {
            _super.call(this, activationFailed);
            this.module = module;
            this.exports = exports;
            this.subscriptions = subscriptions;
        }
        return ExtHostExtension;
    }(abstractExtensionService_1.ActivatedExtension));
    exports.ExtHostExtension = ExtHostExtension;
    var ExtHostEmptyExtension = (function (_super) {
        __extends(ExtHostEmptyExtension, _super);
        function ExtHostEmptyExtension() {
            _super.call(this, false, { activate: undefined, deactivate: undefined }, undefined, []);
        }
        return ExtHostEmptyExtension;
    }(ExtHostExtension));
    exports.ExtHostEmptyExtension = ExtHostEmptyExtension;
    var ExtensionMemento = (function () {
        function ExtensionMemento(id, global, storage) {
            var _this = this;
            this._id = id;
            this._shared = global;
            this._storage = storage;
            this._init = this._storage.getValue(this._shared, this._id, Object.create(null)).then(function (value) {
                _this._value = value;
                return _this;
            });
        }
        Object.defineProperty(ExtensionMemento.prototype, "whenReady", {
            get: function () {
                return this._init;
            },
            enumerable: true,
            configurable: true
        });
        ExtensionMemento.prototype.get = function (key, defaultValue) {
            var value = this._value[key];
            if (typeof value === 'undefined') {
                value = defaultValue;
            }
            return value;
        };
        ExtensionMemento.prototype.update = function (key, value) {
            this._value[key] = value;
            return this._storage
                .setValue(this._shared, this._id, this._value)
                .then(function () { return true; });
        };
        return ExtensionMemento;
    }());
    var ExtHostExtensionService = (function (_super) {
        __extends(ExtHostExtensionService, _super);
        /**
         * This class is constructed manually because it is a service, so it doesn't use any ctor injection
         */
        function ExtHostExtensionService(threadService, telemetryService) {
            _super.call(this, true);
            threadService.registerRemotableInstance(ExtHostExtensionService, this);
            this._threadService = threadService;
            this._storage = new remotable_storage_1.ExtHostStorage(threadService);
            this._proxy = this._threadService.getRemotable(MainProcessExtensionService);
            this._telemetryService = telemetryService;
        }
        ExtHostExtensionService.prototype.$localShowMessage = function (severity, msg) {
            switch (severity) {
                case severity_1.default.Error:
                    console.error(msg);
                    break;
                case severity_1.default.Warning:
                    console.warn(msg);
                    break;
                default:
                    console.log(msg);
            }
        };
        ExtHostExtensionService.prototype.get = function (extensionId) {
            if (!hasOwnProperty.call(this._activatedExtensions, extensionId)) {
                throw new Error('Extension `' + extensionId + '` is not known or not activated');
            }
            return this._activatedExtensions[extensionId].exports;
        };
        ExtHostExtensionService.prototype.deactivate = function (extensionId) {
            var extension = this._activatedExtensions[extensionId];
            if (!extension) {
                return;
            }
            // call deactivate if available
            try {
                if (typeof extension.module.deactivate === 'function') {
                    extension.module.deactivate();
                }
            }
            catch (err) {
            }
            // clean up subscriptions
            try {
                lifecycle_1.dispose(extension.subscriptions);
            }
            catch (err) {
            }
        };
        ExtHostExtensionService.prototype.registrationDone = function (messages) {
            this._triggerOnReady();
            this._proxy.$onExtensionHostReady(extensionsRegistry_1.ExtensionsRegistry.getAllExtensionDescriptions(), messages);
        };
        // -- overwriting AbstractExtensionService
        ExtHostExtensionService.prototype._showMessage = function (severity, msg) {
            this._proxy.$localShowMessage(severity, msg);
            this.$localShowMessage(severity, msg);
        };
        ExtHostExtensionService.prototype._createFailedExtension = function () {
            return new ExtHostExtension(true, { activate: undefined, deactivate: undefined }, undefined, []);
        };
        ExtHostExtensionService.prototype._loadExtensionContext = function (extensionDescription) {
            var globalState = new ExtensionMemento(extensionDescription.id, true, this._storage);
            var workspaceState = new ExtensionMemento(extensionDescription.id, false, this._storage);
            return winjs_base_1.TPromise.join([globalState.whenReady, workspaceState.whenReady]).then(function () {
                return Object.freeze({
                    globalState: globalState,
                    workspaceState: workspaceState,
                    subscriptions: [],
                    get extensionPath() { return extensionDescription.extensionFolderPath; },
                    asAbsolutePath: function (relativePath) { return paths.normalize(paths.join(extensionDescription.extensionFolderPath, relativePath), true); }
                });
            });
        };
        ExtHostExtensionService.prototype._actualActivateExtension = function (extensionDescription) {
            var _this = this;
            return this._doActualActivateExtension(extensionDescription).then(function (activatedExtension) {
                _this._proxy.$onExtensionActivated(extensionDescription.id);
                return activatedExtension;
            }, function (err) {
                _this._proxy.$onExtensionActivationFailed(extensionDescription.id);
                throw err;
            });
        };
        ExtHostExtensionService.prototype._doActualActivateExtension = function (extensionDescription) {
            var _this = this;
            var event = getTelemetryActivationEvent(extensionDescription);
            this._telemetryService.publicLog('activatePlugin', event);
            if (!extensionDescription.main) {
                // Treat the extension as being empty => NOT AN ERROR CASE
                return winjs_base_1.TPromise.as(new ExtHostEmptyExtension());
            }
            return loadCommonJSModule(extensionDescription.main).then(function (extensionModule) {
                return _this._loadExtensionContext(extensionDescription).then(function (context) {
                    return ExtHostExtensionService._callActivate(extensionModule, context);
                });
            });
        };
        ExtHostExtensionService._callActivate = function (extensionModule, context) {
            // Make sure the extension's surface is not undefined
            extensionModule = extensionModule || {
                activate: undefined,
                deactivate: undefined
            };
            return this._callActivateOptional(extensionModule, context).then(function (extensionExports) {
                return new ExtHostExtension(false, extensionModule, extensionExports, context.subscriptions);
            });
        };
        ExtHostExtensionService._callActivateOptional = function (extensionModule, context) {
            if (typeof extensionModule.activate === 'function') {
                try {
                    return winjs_base_1.TPromise.as(extensionModule.activate.apply(global, [context]));
                }
                catch (err) {
                    return winjs_base_1.TPromise.wrapError(err);
                }
            }
            else {
                // No activate found => the module is the extension's exports
                return winjs_base_1.TPromise.as(extensionModule);
            }
        };
        // -- called by main thread
        ExtHostExtensionService.prototype.$activateExtension = function (extensionDescription) {
            return this._activateExtension(extensionDescription);
        };
        ExtHostExtensionService = __decorate([
            thread_1.Remotable.ExtHostContext('ExtHostExtensionService')
        ], ExtHostExtensionService);
        return ExtHostExtensionService;
    }(abstractExtensionService_1.AbstractExtensionService));
    exports.ExtHostExtensionService = ExtHostExtensionService;
    function loadCommonJSModule(modulePath) {
        var r = null;
        try {
            r = require.__$__nodeRequire(modulePath);
        }
        catch (e) {
            return winjs_base_1.TPromise.wrapError(e);
        }
        return winjs_base_1.TPromise.as(r);
    }
    function getTelemetryActivationEvent(extensionDescription) {
        var event = {
            id: extensionDescription.id,
            name: extensionDescription.name,
            publisherDisplayName: extensionDescription.publisher,
            activationEvents: extensionDescription.activationEvents ? extensionDescription.activationEvents.join(',') : null
        };
        for (var contribution in extensionDescription.contributes) {
            var contributionDetails = extensionDescription.contributes[contribution];
            if (!contributionDetails) {
                continue;
            }
            switch (contribution) {
                case 'debuggers':
                    var types = contributionDetails.reduce(function (p, c) { return p ? p + ',' + c['type'] : c['type']; }, '');
                    event['contribution.debuggers'] = types;
                    break;
                case 'grammars':
                    var grammers = contributionDetails.reduce(function (p, c) { return p ? p + ',' + c['language'] : c['language']; }, '');
                    event['contribution.grammars'] = grammers;
                    break;
                case 'languages':
                    var languages = contributionDetails.reduce(function (p, c) { return p ? p + ',' + c['id'] : c['id']; }, '');
                    event['contribution.languages'] = languages;
                    break;
                case 'tmSnippets':
                    var tmSnippets = contributionDetails.reduce(function (p, c) { return p ? p + ',' + c['languageId'] : c['languageId']; }, '');
                    event['contribution.tmSnippets'] = tmSnippets;
                    break;
                default:
                    event[("contribution." + contribution)] = true;
            }
        }
        return event;
    }
});
//# sourceMappingURL=nativeExtensionService.js.map