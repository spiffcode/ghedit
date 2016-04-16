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
define(["require", "exports", 'vs/nls', 'vs/base/common/errors', 'vs/base/common/event', 'vs/base/common/lifecycle', 'vs/base/common/objects', 'vs/base/common/paths', 'vs/base/common/winjs.base', 'vs/base/common/mime', 'vs/platform/instantiation/common/descriptors', 'vs/platform/extensions/common/extensionsRegistry', 'vs/platform/thread/common/thread', 'vs/editor/common/modes/abstractMode', 'vs/editor/common/modes/modesRegistry', 'vs/editor/common/modes/monarch/monarchCompile', 'vs/editor/common/modes/monarch/monarchDefinition', 'vs/editor/common/modes/monarch/monarchLexer', 'vs/editor/common/modes/supports/declarationSupport', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/common/services/languagesRegistry', 'vs/editor/common/services/modeService', 'vs/platform/configuration/common/configuration'], function (require, exports, nls, errors_1, event_1, lifecycle_1, objects, paths, winjs_base_1, mime, descriptors_1, extensionsRegistry_1, thread_1, abstractMode_1, modesRegistry_1, monarchCompile_1, monarchDefinition_1, monarchLexer_1, declarationSupport_1, richEditSupport_1, languagesRegistry_1, modeService_1, configuration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var languagesExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('languages', {
        description: nls.localize('vscode.extension.contributes.languages', 'Contributes language declarations.'),
        type: 'array',
        defaultSnippets: [{ body: [{ id: '', aliases: [], extensions: [] }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { id: '', extensions: [] } }],
            properties: {
                id: {
                    description: nls.localize('vscode.extension.contributes.languages.id', 'ID of the language.'),
                    type: 'string'
                },
                aliases: {
                    description: nls.localize('vscode.extension.contributes.languages.aliases', 'Name aliases for the language.'),
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
                extensions: {
                    description: nls.localize('vscode.extension.contributes.languages.extensions', 'File extensions associated to the language.'),
                    default: ['.foo'],
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
                filenames: {
                    description: nls.localize('vscode.extension.contributes.languages.filenames', 'File names associated to the language.'),
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
                filenamePatterns: {
                    description: nls.localize('vscode.extension.contributes.languages.filenamePatterns', 'File name glob patterns associated to the language.'),
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
                mimetypes: {
                    description: nls.localize('vscode.extension.contributes.languages.mimetypes', 'Mime types associated to the language.'),
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
                firstLine: {
                    description: nls.localize('vscode.extension.contributes.languages.firstLine', 'A regular expression matching the first line of a file of the language.'),
                    type: 'string'
                },
                configuration: {
                    description: nls.localize('vscode.extension.contributes.languages.configuration', 'A relative path to a file containing configuration options for the language.'),
                    type: 'string'
                }
            }
        }
    });
    function isUndefinedOrStringArray(value) {
        if (typeof value === 'undefined') {
            return true;
        }
        if (!Array.isArray(value)) {
            return false;
        }
        return value.every(function (item) { return typeof item === 'string'; });
    }
    function isValidLanguageExtensionPoint(value, collector) {
        if (!value) {
            collector.error(nls.localize('invalid.empty', "Empty value for `contributes.{0}`", languagesExtPoint.name));
            return false;
        }
        if (typeof value.id !== 'string') {
            collector.error(nls.localize('require.id', "property `{0}` is mandatory and must be of type `string`", 'id'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.extensions)) {
            collector.error(nls.localize('opt.extensions', "property `{0}` can be omitted and must be of type `string[]`", 'extensions'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.filenames)) {
            collector.error(nls.localize('opt.filenames', "property `{0}` can be omitted and must be of type `string[]`", 'filenames'));
            return false;
        }
        if (typeof value.firstLine !== 'undefined' && typeof value.firstLine !== 'string') {
            collector.error(nls.localize('opt.firstLine', "property `{0}` can be omitted and must be of type `string`", 'firstLine'));
            return false;
        }
        if (typeof value.configuration !== 'undefined' && typeof value.configuration !== 'string') {
            collector.error(nls.localize('opt.configuration', "property `{0}` can be omitted and must be of type `string`", 'configuration'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.aliases)) {
            collector.error(nls.localize('opt.aliases', "property `{0}` can be omitted and must be of type `string[]`", 'aliases'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.mimetypes)) {
            collector.error(nls.localize('opt.mimetypes', "property `{0}` can be omitted and must be of type `string[]`", 'mimetypes'));
            return false;
        }
        return true;
    }
    var ModeServiceImpl = (function () {
        function ModeServiceImpl(threadService, extensionService) {
            var _this = this;
            this.serviceId = modeService_1.IModeService;
            this._onDidAddModes = new event_1.Emitter();
            this.onDidAddModes = this._onDidAddModes.event;
            this._onDidCreateMode = new event_1.Emitter();
            this.onDidCreateMode = this._onDidCreateMode.event;
            this._threadService = threadService;
            this._extensionService = extensionService;
            this._activationPromises = {};
            this._instantiatedModes = {};
            this._config = {};
            this._registry = new languagesRegistry_1.LanguagesRegistry();
            this._registry.onDidAddModes(function (modes) { return _this._onDidAddModes.fire(modes); });
        }
        ModeServiceImpl.prototype.getConfigurationForMode = function (modeId) {
            return this._config[modeId] || {};
        };
        ModeServiceImpl.prototype.configureMode = function (mimetype, options) {
            var modeId = this.getModeId(mimetype);
            if (modeId) {
                this.configureModeById(modeId, options);
            }
        };
        ModeServiceImpl.prototype.configureModeById = function (modeId, options) {
            var previousOptions = this._config[modeId] || {};
            var newOptions = objects.mixin(objects.clone(previousOptions), options);
            if (objects.equals(previousOptions, newOptions)) {
                // This configure call is a no-op
                return;
            }
            this._config[modeId] = newOptions;
            var mode = this.getMode(modeId);
            if (mode && mode.configSupport) {
                mode.configSupport.configure(this.getConfigurationForMode(modeId));
            }
        };
        ModeServiceImpl.prototype.configureAllModes = function (config) {
            var _this = this;
            if (!config) {
                return;
            }
            var modes = this._registry.getRegisteredModes();
            modes.forEach(function (modeIdentifier) {
                var configuration = config[modeIdentifier];
                _this.configureModeById(modeIdentifier, configuration);
            });
        };
        ModeServiceImpl.prototype.isRegisteredMode = function (mimetypeOrModeId) {
            return this._registry.isRegisteredMode(mimetypeOrModeId);
        };
        ModeServiceImpl.prototype.isCompatMode = function (modeId) {
            var compatModeData = this._registry.getCompatMode(modeId);
            return (compatModeData ? true : false);
        };
        ModeServiceImpl.prototype.getRegisteredModes = function () {
            return this._registry.getRegisteredModes();
        };
        ModeServiceImpl.prototype.getRegisteredLanguageNames = function () {
            return this._registry.getRegisteredLanguageNames();
        };
        ModeServiceImpl.prototype.getExtensions = function (alias) {
            return this._registry.getExtensions(alias);
        };
        ModeServiceImpl.prototype.getMimeForMode = function (modeId) {
            return this._registry.getMimeForMode(modeId);
        };
        ModeServiceImpl.prototype.getLanguageName = function (modeId) {
            return this._registry.getLanguageName(modeId);
        };
        ModeServiceImpl.prototype.getModeIdForLanguageName = function (alias) {
            return this._registry.getModeIdForLanguageNameLowercase(alias);
        };
        ModeServiceImpl.prototype.getModeId = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            var modeIds = this._registry.extractModeIds(commaSeparatedMimetypesOrCommaSeparatedIds);
            if (modeIds.length > 0) {
                return modeIds[0];
            }
            return null;
        };
        ModeServiceImpl.prototype.getConfigurationFiles = function (modeId) {
            return this._registry.getConfigurationFiles(modeId);
        };
        // --- instantiation
        ModeServiceImpl.prototype.lookup = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            var r = [];
            var modeIds = this._registry.extractModeIds(commaSeparatedMimetypesOrCommaSeparatedIds);
            for (var i = 0; i < modeIds.length; i++) {
                var modeId = modeIds[i];
                r.push({
                    modeId: modeId,
                    isInstantiated: this._instantiatedModes.hasOwnProperty(modeId)
                });
            }
            return r;
        };
        ModeServiceImpl.prototype.getMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            var modeIds = this._registry.extractModeIds(commaSeparatedMimetypesOrCommaSeparatedIds);
            var isPlainText = false;
            for (var i = 0; i < modeIds.length; i++) {
                if (this._instantiatedModes.hasOwnProperty(modeIds[i])) {
                    return this._instantiatedModes[modeIds[i]];
                }
                isPlainText = isPlainText || (modeIds[i] === 'plaintext');
            }
            if (isPlainText) {
                // Try to do it synchronously
                var r = null;
                this.getOrCreateMode(commaSeparatedMimetypesOrCommaSeparatedIds).then(function (mode) {
                    r = mode;
                }).done(null, errors_1.onUnexpectedError);
                return r;
            }
        };
        ModeServiceImpl.prototype.getModeIdByLanguageName = function (languageName) {
            var modeIds = this._registry.getModeIdsFromLanguageName(languageName);
            if (modeIds.length > 0) {
                return modeIds[0];
            }
            return null;
        };
        ModeServiceImpl.prototype.getModeIdByFilenameOrFirstLine = function (filename, firstLine) {
            var modeIds = this._registry.getModeIdsFromFilenameOrFirstLine(filename, firstLine);
            if (modeIds.length > 0) {
                return modeIds[0];
            }
            return null;
        };
        ModeServiceImpl.prototype.onReady = function () {
            return this._extensionService.onReady();
        };
        ModeServiceImpl.prototype.getOrCreateMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            var _this = this;
            return this.onReady().then(function () {
                var modeId = _this.getModeId(commaSeparatedMimetypesOrCommaSeparatedIds);
                // Fall back to plain text if no mode was found
                return _this._getOrCreateMode(modeId || 'plaintext');
            });
        };
        ModeServiceImpl.prototype.getOrCreateModeByLanguageName = function (languageName) {
            var _this = this;
            return this.onReady().then(function () {
                var modeId = _this.getModeIdByLanguageName(languageName);
                // Fall back to plain text if no mode was found
                return _this._getOrCreateMode(modeId || 'plaintext');
            });
        };
        ModeServiceImpl.prototype.getOrCreateModeByFilenameOrFirstLine = function (filename, firstLine) {
            var _this = this;
            return this.onReady().then(function () {
                var modeId = _this.getModeIdByFilenameOrFirstLine(filename, firstLine);
                // Fall back to plain text if no mode was found
                return _this._getOrCreateMode(modeId || 'plaintext');
            });
        };
        ModeServiceImpl.prototype._getOrCreateMode = function (modeId) {
            var _this = this;
            if (this._instantiatedModes.hasOwnProperty(modeId)) {
                return winjs_base_1.TPromise.as(this._instantiatedModes[modeId]);
            }
            if (this._activationPromises.hasOwnProperty(modeId)) {
                return this._activationPromises[modeId];
            }
            var c, e;
            var promise = new winjs_base_1.TPromise(function (cc, ee, pp) { c = cc; e = ee; });
            this._activationPromises[modeId] = promise;
            this._createMode(modeId).then(function (mode) {
                _this._instantiatedModes[modeId] = mode;
                delete _this._activationPromises[modeId];
                _this._onDidCreateMode.fire(mode);
                _this._extensionService.activateByEvent("onLanguage:" + modeId).done(null, errors_1.onUnexpectedError);
                return _this._instantiatedModes[modeId];
            }).then(c, e);
            return promise;
        };
        ModeServiceImpl.prototype._createMode = function (modeId) {
            var _this = this;
            var modeDescriptor = this._createModeDescriptor(modeId);
            var compatModeData = this._registry.getCompatMode(modeId);
            if (compatModeData) {
                // This is a compatibility mode
                var compatModeAsyncDescriptor = descriptors_1.createAsyncDescriptor1(compatModeData.moduleId, compatModeData.ctorName);
                return this._threadService.createInstance(compatModeAsyncDescriptor, modeDescriptor).then(function (compatMode) {
                    if (compatMode.configSupport) {
                        compatMode.configSupport.configure(_this.getConfigurationForMode(modeId));
                    }
                    return compatMode;
                });
            }
            return winjs_base_1.TPromise.as(this._threadService.createInstance(abstractMode_1.FrankensteinMode, modeDescriptor));
        };
        ModeServiceImpl.prototype._createModeDescriptor = function (modeId) {
            return {
                id: modeId
            };
        };
        ModeServiceImpl.prototype._registerModeSupport = function (mode, support, callback) {
            if (mode.registerSupport) {
                return mode.registerSupport(support, callback);
            }
            else {
                console.warn('Cannot register support ' + support + ' on mode ' + mode.getId() + ' because it does not support it.');
                return lifecycle_1.empty;
            }
        };
        ModeServiceImpl.prototype.registerModeSupport = function (modeId, support, callback) {
            var _this = this;
            if (this._instantiatedModes.hasOwnProperty(modeId)) {
                return this._registerModeSupport(this._instantiatedModes[modeId], support, callback);
            }
            var cc;
            var promise = new winjs_base_1.TPromise(function (c, e) { cc = c; });
            var disposable = this.onDidCreateMode(function (mode) {
                if (mode.getId() !== modeId) {
                    return;
                }
                cc(_this._registerModeSupport(mode, support, callback));
                disposable.dispose();
            });
            return {
                dispose: function () {
                    promise.done(function (disposable) { return disposable.dispose(); }, null);
                }
            };
        };
        ModeServiceImpl.prototype.doRegisterMonarchDefinition = function (modeId, lexer) {
            var _this = this;
            return lifecycle_1.combinedDisposable(this.registerTokenizationSupport(modeId, function (mode) {
                return monarchLexer_1.createTokenizationSupport(_this, mode, lexer);
            }), this.registerRichEditSupport(modeId, monarchDefinition_1.createRichEditSupport(lexer)));
        };
        ModeServiceImpl.prototype.registerMonarchDefinition = function (modelService, editorWorkerService, modeId, language) {
            var lexer = monarchCompile_1.compile(objects.clone(language));
            return this.doRegisterMonarchDefinition(modeId, lexer);
        };
        ModeServiceImpl.prototype.registerRichEditSupport = function (modeId, support) {
            return this.registerModeSupport(modeId, 'richEditSupport', function (mode) { return new richEditSupport_1.RichEditSupport(modeId, mode.richEditSupport, support); });
        };
        ModeServiceImpl.prototype.registerDeclarativeDeclarationSupport = function (modeId, contribution) {
            return this.registerModeSupport(modeId, 'declarationSupport', function (mode) { return new declarationSupport_1.DeclarationSupport(modeId, contribution); });
        };
        ModeServiceImpl.prototype.registerTokenizationSupport = function (modeId, callback) {
            return this.registerModeSupport(modeId, 'tokenizationSupport', callback);
        };
        return ModeServiceImpl;
    }());
    exports.ModeServiceImpl = ModeServiceImpl;
    var MainThreadModeServiceImpl = (function (_super) {
        __extends(MainThreadModeServiceImpl, _super);
        function MainThreadModeServiceImpl(threadService, extensionService, configurationService) {
            var _this = this;
            _super.call(this, threadService, extensionService);
            this._configurationService = configurationService;
            this._hasInitialized = false;
            languagesExtPoint.setHandler(function (extensions) {
                var allValidLanguages = [];
                for (var i = 0, len = extensions.length; i < len; i++) {
                    var extension = extensions[i];
                    if (!Array.isArray(extension.value)) {
                        extension.collector.error(nls.localize('invalid', "Invalid `contributes.{0}`. Expected an array.", languagesExtPoint.name));
                        continue;
                    }
                    for (var j = 0, lenJ = extension.value.length; j < lenJ; j++) {
                        var ext = extension.value[j];
                        if (isValidLanguageExtensionPoint(ext, extension.collector)) {
                            var configuration = (ext.configuration ? paths.join(extension.description.extensionFolderPath, ext.configuration) : ext.configuration);
                            allValidLanguages.push({
                                id: ext.id,
                                extensions: ext.extensions,
                                filenames: ext.filenames,
                                filenamePatterns: ext.filenamePatterns,
                                firstLine: ext.firstLine,
                                aliases: ext.aliases,
                                mimetypes: ext.mimetypes,
                                configuration: configuration
                            });
                        }
                    }
                }
                modesRegistry_1.ModesRegistry.registerLanguages(allValidLanguages);
            });
            this._configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.onConfigurationChange(e.config); });
        }
        MainThreadModeServiceImpl.prototype.onReady = function () {
            var _this = this;
            if (!this._onReadyPromise) {
                var configuration_2 = this._configurationService.getConfiguration();
                this._onReadyPromise = this._extensionService.onReady().then(function () {
                    _this.onConfigurationChange(configuration_2);
                    return true;
                });
            }
            return this._onReadyPromise;
        };
        MainThreadModeServiceImpl.prototype.onConfigurationChange = function (configuration) {
            var _this = this;
            // Clear user configured mime associations
            mime.clearTextMimes(true /* user configured */);
            // Register based on settings
            if (configuration.files && configuration.files.associations) {
                Object.keys(configuration.files.associations).forEach(function (pattern) {
                    mime.registerTextMime({ mime: _this.getMimeForMode(configuration.files.associations[pattern]), filepattern: pattern, userConfigured: true });
                });
            }
        };
        MainThreadModeServiceImpl.prototype._getModeServiceWorkerHelper = function () {
            var r = this._threadService.getRemotable(ModeServiceWorkerHelper);
            if (!this._hasInitialized) {
                this._hasInitialized = true;
                var initData = {
                    compatModes: modesRegistry_1.ModesRegistry.getCompatModes(),
                    languages: modesRegistry_1.ModesRegistry.getLanguages()
                };
                r._initialize(initData);
                modesRegistry_1.ModesRegistry.onDidAddCompatModes(function (m) { return r._acceptCompatModes(m); });
                modesRegistry_1.ModesRegistry.onDidAddLanguages(function (m) { return r._acceptLanguages(m); });
            }
            return r;
        };
        MainThreadModeServiceImpl.prototype.configureModeById = function (modeId, options) {
            this._getModeServiceWorkerHelper().configureModeById(modeId, options);
            _super.prototype.configureModeById.call(this, modeId, options);
        };
        MainThreadModeServiceImpl.prototype._createMode = function (modeId) {
            // Instantiate mode also in worker
            this._getModeServiceWorkerHelper().instantiateMode(modeId);
            return _super.prototype._createMode.call(this, modeId);
        };
        MainThreadModeServiceImpl.prototype.registerMonarchDefinition = function (modelService, editorWorkerService, modeId, language) {
            this._getModeServiceWorkerHelper().registerMonarchDefinition(modeId, language);
            var lexer = monarchCompile_1.compile(objects.clone(language));
            return lifecycle_1.combinedDisposable(_super.prototype.doRegisterMonarchDefinition.call(this, modeId, lexer), this.registerModeSupport(modeId, 'suggestSupport', function (mode) {
                return monarchDefinition_1.createSuggestSupport(modelService, editorWorkerService, modeId, lexer);
            }));
        };
        return MainThreadModeServiceImpl;
    }(ModeServiceImpl));
    exports.MainThreadModeServiceImpl = MainThreadModeServiceImpl;
    var ModeServiceWorkerHelper = (function () {
        function ModeServiceWorkerHelper(modeService) {
            this._modeService = modeService;
        }
        ModeServiceWorkerHelper.prototype._initialize = function (initData) {
            modesRegistry_1.ModesRegistry.registerCompatModes(initData.compatModes);
            modesRegistry_1.ModesRegistry.registerLanguages(initData.languages);
        };
        ModeServiceWorkerHelper.prototype._acceptCompatModes = function (modes) {
            modesRegistry_1.ModesRegistry.registerCompatModes(modes);
        };
        ModeServiceWorkerHelper.prototype._acceptLanguages = function (languages) {
            modesRegistry_1.ModesRegistry.registerLanguages(languages);
        };
        ModeServiceWorkerHelper.prototype.instantiateMode = function (modeId) {
            this._modeService.getOrCreateMode(modeId).done(null, errors_1.onUnexpectedError);
        };
        ModeServiceWorkerHelper.prototype.configureModeById = function (modeId, options) {
            this._modeService.configureMode(modeId, options);
        };
        ModeServiceWorkerHelper.prototype.registerMonarchDefinition = function (modeId, language) {
            this._modeService.registerMonarchDefinition(null, null, modeId, language);
        };
        ModeServiceWorkerHelper = __decorate([
            thread_1.Remotable.WorkerContext('ModeServiceWorkerHelper', thread_1.ThreadAffinity.All),
            __param(0, modeService_1.IModeService)
        ], ModeServiceWorkerHelper);
        return ModeServiceWorkerHelper;
    }());
    exports.ModeServiceWorkerHelper = ModeServiceWorkerHelper;
});
