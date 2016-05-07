var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/event', 'vs/editor/common/modes/languageSelector', 'vs/base/common/platform', 'vs/base/common/strings', 'vs/platform/thread/common/thread', 'vs/base/common/errors', 'vs/workbench/api/node/extHostFileSystemEventService', 'vs/workbench/api/node/extHostDocuments', 'vs/workbench/api/node/extHostConfiguration', 'vs/workbench/api/node/extHostDiagnostics', 'vs/workbench/api/node/extHostWorkspace', 'vs/workbench/api/node/extHostQuickOpen', 'vs/workbench/api/node/extHostStatusBar', 'vs/workbench/api/node/extHostCommands', 'vs/workbench/api/node/extHostOutputService', 'vs/workbench/api/node/extHostMessageService', 'vs/workbench/api/node/extHostEditors', 'vs/workbench/api/node/extHostLanguages', 'vs/workbench/api/node/extHostLanguageFeatures', 'vs/workbench/api/node/extHostApiCommands', 'vs/workbench/api/node/extHostTypes', 'vs/editor/common/modes', 'vs/editor/common/services/modeService', 'vs/base/common/uri', 'vs/base/common/severity', 'vs/editor/common/editorCommon', 'vs/platform/extensions/common/extensions', 'vs/platform/extensions/common/extensionsRegistry', 'vs/platform/workspace/common/workspace', 'vs/base/common/cancellation', 'vs/workbench/api/node/mainThreadEditors', 'vs/base/common/paths', 'vs/platform/telemetry/common/telemetry'], function (require, exports, event_1, languageSelector_1, Platform, strings_1, thread_1, errors, extHostFileSystemEventService_1, extHostDocuments_1, extHostConfiguration_1, extHostDiagnostics_1, extHostWorkspace_1, extHostQuickOpen_1, extHostStatusBar_1, extHostCommands_1, extHostOutputService_1, extHostMessageService_1, extHostEditors_1, extHostLanguages_1, extHostLanguageFeatures_1, extHostApiCommands_1, extHostTypes, Modes, modeService_1, uri_1, severity_1, EditorCommon, extensions_1, extensionsRegistry_1, workspace_1, cancellation_1, mainThreadEditors_1, paths, telemetry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * This class implements the API described in vscode.d.ts,
     * for the case of the extensionHost host process
     */
    var ExtHostAPIImplementation = (function () {
        function ExtHostAPIImplementation(threadService, extensionService, contextService, telemetryService) {
            var _this = this;
            this._threadService = threadService;
            this._proxy = threadService.getRemotable(MainProcessVSCodeAPIHelper);
            this.version = contextService.getConfiguration().env.version;
            this.Uri = uri_1.default;
            this.Location = extHostTypes.Location;
            this.Diagnostic = extHostTypes.Diagnostic;
            this.DiagnosticSeverity = extHostTypes.DiagnosticSeverity;
            this.EventEmitter = event_1.Emitter;
            this.Disposable = extHostTypes.Disposable;
            this.TextEdit = extHostTypes.TextEdit;
            this.WorkspaceEdit = extHostTypes.WorkspaceEdit;
            this.Position = extHostTypes.Position;
            this.Range = extHostTypes.Range;
            this.Selection = extHostTypes.Selection;
            this.CancellationTokenSource = cancellation_1.CancellationTokenSource;
            this.Hover = extHostTypes.Hover;
            this.SymbolKind = extHostTypes.SymbolKind;
            this.SymbolInformation = extHostTypes.SymbolInformation;
            this.DocumentHighlightKind = extHostTypes.DocumentHighlightKind;
            this.DocumentHighlight = extHostTypes.DocumentHighlight;
            this.CodeLens = extHostTypes.CodeLens;
            this.ParameterInformation = extHostTypes.ParameterInformation;
            this.SignatureInformation = extHostTypes.SignatureInformation;
            this.SignatureHelp = extHostTypes.SignatureHelp;
            this.CompletionItem = extHostTypes.CompletionItem;
            this.CompletionItemKind = extHostTypes.CompletionItemKind;
            this.CompletionList = extHostTypes.CompletionList;
            this.ViewColumn = extHostTypes.ViewColumn;
            this.StatusBarAlignment = extHostTypes.StatusBarAlignment;
            this.IndentAction = Modes.IndentAction;
            this.OverviewRulerLane = EditorCommon.OverviewRulerLane;
            this.TextEditorRevealType = mainThreadEditors_1.TextEditorRevealType;
            this.EndOfLine = extHostTypes.EndOfLine;
            this.TextEditorCursorStyle = EditorCommon.TextEditorCursorStyle;
            errors.setUnexpectedErrorHandler(function (err) {
                _this._proxy.onUnexpectedExtHostError(errors.transformErrorForSerialization(err));
            });
            var extHostCommands = this._threadService.getRemotable(extHostCommands_1.ExtHostCommands);
            var extHostEditors = this._threadService.getRemotable(extHostEditors_1.ExtHostEditors);
            var extHostMessageService = new extHostMessageService_1.ExtHostMessageService(this._threadService, this.commands);
            var extHostQuickOpen = this._threadService.getRemotable(extHostQuickOpen_1.ExtHostQuickOpen);
            var extHostStatusBar = new extHostStatusBar_1.ExtHostStatusBar(this._threadService);
            var extHostOutputService = new extHostOutputService_1.ExtHostOutputService(this._threadService);
            // env namespace
            var telemetryInfo;
            this.env = Object.freeze({
                get machineId() { return telemetryInfo.machineId; },
                get sessionId() { return telemetryInfo.sessionId; },
                get language() { return Platform.language; }
            });
            telemetryService.getTelemetryInfo().then(function (info) { return telemetryInfo = info; }, errors.onUnexpectedError);
            // commands namespace
            this.commands = {
                registerCommand: function (id, command, thisArgs) {
                    return extHostCommands.registerCommand(id, command, thisArgs);
                },
                registerTextEditorCommand: function (id, callback, thisArg) {
                    return extHostCommands.registerCommand(id, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        var activeTextEditor = extHostEditors.getActiveTextEditor();
                        if (!activeTextEditor) {
                            console.warn('Cannot execute ' + id + ' because there is no active text editor.');
                            return;
                        }
                        activeTextEditor.edit(function (edit) {
                            args.unshift(activeTextEditor, edit);
                            callback.apply(thisArg, args);
                        }).then(function (result) {
                            if (!result) {
                                console.warn('Edits from command ' + id + ' were not applied.');
                            }
                        }, function (err) {
                            console.warn('An error occured while running command ' + id, err);
                        });
                    });
                },
                executeCommand: function (id) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return extHostCommands.executeCommand.apply(extHostCommands, [id].concat(args));
                },
                getCommands: function (filterInternal) {
                    if (filterInternal === void 0) { filterInternal = false; }
                    return extHostCommands.getCommands(filterInternal);
                }
            };
            this.window = {
                get activeTextEditor() {
                    return extHostEditors.getActiveTextEditor();
                },
                get visibleTextEditors() {
                    return extHostEditors.getVisibleTextEditors();
                },
                showTextDocument: function (document, column, preserveFocus) {
                    return extHostEditors.showTextDocument(document, column, preserveFocus);
                },
                createTextEditorDecorationType: function (options) {
                    return extHostEditors.createTextEditorDecorationType(options);
                },
                onDidChangeActiveTextEditor: extHostEditors.onDidChangeActiveTextEditor.bind(extHostEditors),
                onDidChangeTextEditorSelection: function (listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorSelection(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorOptions: function (listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorOptions(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorViewColumn: function (listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeTextEditorViewColumn(listener, thisArg, disposables);
                },
                showInformationMessage: function (message) {
                    var items = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        items[_i - 1] = arguments[_i];
                    }
                    return extHostMessageService.showMessage(severity_1.default.Info, message, items);
                },
                showWarningMessage: function (message) {
                    var items = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        items[_i - 1] = arguments[_i];
                    }
                    return extHostMessageService.showMessage(severity_1.default.Warning, message, items);
                },
                showErrorMessage: function (message) {
                    var items = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        items[_i - 1] = arguments[_i];
                    }
                    return extHostMessageService.showMessage(severity_1.default.Error, message, items);
                },
                showQuickPick: function (items, options) {
                    return extHostQuickOpen.show(items, options);
                },
                showInputBox: extHostQuickOpen.input.bind(extHostQuickOpen),
                createStatusBarItem: function (position, priority) {
                    return extHostStatusBar.createStatusBarEntry(position, priority);
                },
                setStatusBarMessage: function (text, timeoutOrThenable) {
                    return extHostStatusBar.setStatusBarMessage(text, timeoutOrThenable);
                },
                createOutputChannel: function (name) {
                    return extHostOutputService.createOutputChannel(name);
                }
            };
            //
            var workspacePath = contextService.getWorkspace() ? contextService.getWorkspace().resource.fsPath : undefined;
            var extHostFileSystemEvent = threadService.getRemotable(extHostFileSystemEventService_1.ExtHostFileSystemEventService);
            var extHostWorkspace = new extHostWorkspace_1.ExtHostWorkspace(this._threadService, workspacePath);
            var extHostDocuments = this._threadService.getRemotable(extHostDocuments_1.ExtHostModelService);
            this.workspace = Object.freeze({
                get rootPath() {
                    return extHostWorkspace.getPath();
                },
                set rootPath(value) {
                    throw errors.readonly();
                },
                asRelativePath: function (pathOrUri) {
                    return extHostWorkspace.getRelativePath(pathOrUri);
                },
                findFiles: function (include, exclude, maxResults, token) {
                    return extHostWorkspace.findFiles(include, exclude, maxResults, token);
                },
                saveAll: function (includeUntitled) {
                    return extHostWorkspace.saveAll(includeUntitled);
                },
                applyEdit: function (edit) {
                    return extHostWorkspace.appyEdit(edit);
                },
                createFileSystemWatcher: function (pattern, ignoreCreate, ignoreChange, ignoreDelete) {
                    return extHostFileSystemEvent.createFileSystemWatcher(pattern, ignoreCreate, ignoreChange, ignoreDelete);
                },
                get textDocuments() {
                    return extHostDocuments.getAllDocumentData().map(function (data) { return data.document; });
                },
                set textDocuments(value) {
                    throw errors.readonly();
                },
                openTextDocument: function (uriOrFileName) {
                    var uri;
                    if (typeof uriOrFileName === 'string') {
                        uri = uri_1.default.file(uriOrFileName);
                    }
                    else if (uriOrFileName instanceof uri_1.default) {
                        uri = uriOrFileName;
                    }
                    else {
                        throw new Error('illegal argument - uriOrFileName');
                    }
                    return extHostDocuments.ensureDocumentData(uri).then(function () {
                        var data = extHostDocuments.getDocumentData(uri);
                        return data && data.document;
                    });
                },
                registerTextDocumentContentProvider: function (scheme, provider) {
                    return extHostDocuments.registerTextDocumentContentProvider(scheme, provider);
                },
                onDidOpenTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocuments.onDidAddDocument(listener, thisArgs, disposables);
                },
                onDidCloseTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocuments.onDidRemoveDocument(listener, thisArgs, disposables);
                },
                onDidChangeTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocuments.onDidChangeDocument(listener, thisArgs, disposables);
                },
                onDidSaveTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocuments.onDidSaveDocument(listener, thisArgs, disposables);
                },
                onDidChangeConfiguration: function (listener, thisArgs, disposables) {
                    return extHostConfiguration.onDidChangeConfiguration(listener, thisArgs, disposables);
                },
                getConfiguration: function (section) {
                    return extHostConfiguration.getConfiguration(section);
                }
            });
            //
            extHostApiCommands_1.registerApiCommands(threadService);
            //
            var languages = new extHostLanguages_1.ExtHostLanguages(this._threadService);
            var extHostDiagnostics = threadService.getRemotable(extHostDiagnostics_1.ExtHostDiagnostics);
            var languageFeatures = threadService.getRemotable(extHostLanguageFeatures_1.ExtHostLanguageFeatures);
            this.languages = {
                createDiagnosticCollection: function (name) {
                    return extHostDiagnostics.createDiagnosticCollection(name);
                },
                getLanguages: function () {
                    return languages.getLanguages();
                },
                match: function (selector, document) {
                    return languageSelector_1.score(selector, document.uri, document.languageId);
                },
                registerCodeActionsProvider: function (selector, provider) {
                    return languageFeatures.registerCodeActionProvider(selector, provider);
                },
                registerCodeLensProvider: function (selector, provider) {
                    return languageFeatures.registerCodeLensProvider(selector, provider);
                },
                registerDefinitionProvider: function (selector, provider) {
                    return languageFeatures.registerDefinitionProvider(selector, provider);
                },
                registerHoverProvider: function (selector, provider) {
                    return languageFeatures.registerHoverProvider(selector, provider);
                },
                registerDocumentHighlightProvider: function (selector, provider) {
                    return languageFeatures.registerDocumentHighlightProvider(selector, provider);
                },
                registerReferenceProvider: function (selector, provider) {
                    return languageFeatures.registerReferenceProvider(selector, provider);
                },
                registerRenameProvider: function (selector, provider) {
                    return languageFeatures.registerRenameProvider(selector, provider);
                },
                registerDocumentSymbolProvider: function (selector, provider) {
                    return languageFeatures.registerDocumentSymbolProvider(selector, provider);
                },
                registerWorkspaceSymbolProvider: function (provider) {
                    return languageFeatures.registerWorkspaceSymbolProvider(provider);
                },
                registerDocumentFormattingEditProvider: function (selector, provider) {
                    return languageFeatures.registerDocumentFormattingEditProvider(selector, provider);
                },
                registerDocumentRangeFormattingEditProvider: function (selector, provider) {
                    return languageFeatures.registerDocumentRangeFormattingEditProvider(selector, provider);
                },
                registerOnTypeFormattingEditProvider: function (selector, provider, firstTriggerCharacter) {
                    var moreTriggerCharacters = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        moreTriggerCharacters[_i - 3] = arguments[_i];
                    }
                    return languageFeatures.registerOnTypeFormattingEditProvider(selector, provider, [firstTriggerCharacter].concat(moreTriggerCharacters));
                },
                registerSignatureHelpProvider: function (selector, provider) {
                    var triggerCharacters = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        triggerCharacters[_i - 2] = arguments[_i];
                    }
                    return languageFeatures.registerSignatureHelpProvider(selector, provider, triggerCharacters);
                },
                registerCompletionItemProvider: function (selector, provider) {
                    var triggerCharacters = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        triggerCharacters[_i - 2] = arguments[_i];
                    }
                    return languageFeatures.registerCompletionItemProvider(selector, provider, triggerCharacters);
                },
                setLanguageConfiguration: function (language, configuration) {
                    return _this._setLanguageConfiguration(language, configuration);
                }
            };
            var extHostConfiguration = threadService.getRemotable(extHostConfiguration_1.ExtHostConfiguration);
            //
            this.extensions = {
                getExtension: function (extensionId) {
                    var desc = extensionsRegistry_1.ExtensionsRegistry.getExtensionDescription(extensionId);
                    if (desc) {
                        return new Extension(extensionService, desc);
                    }
                },
                get all() {
                    return extensionsRegistry_1.ExtensionsRegistry.getAllExtensionDescriptions().map(function (desc) { return new Extension(extensionService, desc); });
                }
            };
            // Intentionally calling a function for typechecking purposes
            defineAPI(this);
        }
        ExtHostAPIImplementation.generateDisposeToken = function () {
            return String(++ExtHostAPIImplementation._LAST_REGISTER_TOKEN);
        };
        ExtHostAPIImplementation.prototype._disposableFromToken = function (disposeToken) {
            var _this = this;
            return new extHostTypes.Disposable(function () { return _this._proxy.disposeByToken(disposeToken); });
        };
        ExtHostAPIImplementation.prototype._setLanguageConfiguration = function (modeId, configuration) {
            var wordPattern = configuration.wordPattern;
            // check for a valid word pattern
            if (wordPattern && strings_1.regExpLeadsToEndlessLoop(wordPattern)) {
                throw new Error("Invalid language configuration: wordPattern '" + wordPattern + "' is not allowed to match the empty string.");
            }
            // word definition
            if (wordPattern) {
                extHostDocuments_1.setWordDefinitionFor(modeId, wordPattern);
            }
            else {
                extHostDocuments_1.setWordDefinitionFor(modeId, null);
            }
            return this.Modes_RichEditSupport_register(modeId, configuration);
        };
        ExtHostAPIImplementation.prototype.Modes_RichEditSupport_register = function (modeId, configuration) {
            var disposeToken = ExtHostAPIImplementation.generateDisposeToken();
            this._proxy.Modes_RichEditSupport_register(disposeToken, modeId, configuration);
            return this._disposableFromToken(disposeToken);
        };
        ExtHostAPIImplementation._LAST_REGISTER_TOKEN = 0;
        ExtHostAPIImplementation = __decorate([
            __param(0, thread_1.IThreadService),
            __param(1, extensions_1.IExtensionService),
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, telemetry_1.ITelemetryService)
        ], ExtHostAPIImplementation);
        return ExtHostAPIImplementation;
    }());
    exports.ExtHostAPIImplementation = ExtHostAPIImplementation;
    var Extension = (function () {
        function Extension(extensionService, description) {
            this._extensionService = extensionService;
            this.id = description.id;
            this.extensionPath = paths.normalize(description.extensionFolderPath, true);
            this.packageJSON = description;
        }
        Object.defineProperty(Extension.prototype, "isActive", {
            get: function () {
                return this._extensionService.isActivated(this.id);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "exports", {
            get: function () {
                return this._extensionService.get(this.id);
            },
            enumerable: true,
            configurable: true
        });
        Extension.prototype.activate = function () {
            var _this = this;
            return this._extensionService.activateById(this.id).then(function () { return _this.exports; });
        };
        return Extension;
    }());
    function defineAPI(impl) {
        var node_module = require.__$__nodeRequire('module');
        var original = node_module._load;
        node_module._load = function load(request, parent, isMain) {
            if (request === 'vscode') {
                return impl;
            }
            return original.apply(this, arguments);
        };
        define('vscode', [], impl);
    }
    var MainProcessVSCodeAPIHelper = (function () {
        function MainProcessVSCodeAPIHelper(modeService) {
            this._modeService = modeService;
            this._token2Dispose = {};
        }
        MainProcessVSCodeAPIHelper.prototype.onUnexpectedExtHostError = function (err) {
            errors.onUnexpectedError(err);
        };
        MainProcessVSCodeAPIHelper.prototype.disposeByToken = function (disposeToken) {
            if (this._token2Dispose[disposeToken]) {
                this._token2Dispose[disposeToken].dispose();
                delete this._token2Dispose[disposeToken];
            }
        };
        MainProcessVSCodeAPIHelper.prototype.Modes_RichEditSupport_register = function (disposeToken, modeId, configuration) {
            this._token2Dispose[disposeToken] = this._modeService.registerRichEditSupport(modeId, configuration);
        };
        MainProcessVSCodeAPIHelper = __decorate([
            thread_1.Remotable.MainContext('MainProcessVSCodeAPIHelper'),
            __param(0, modeService_1.IModeService)
        ], MainProcessVSCodeAPIHelper);
        return MainProcessVSCodeAPIHelper;
    }());
    exports.MainProcessVSCodeAPIHelper = MainProcessVSCodeAPIHelper;
});
//# sourceMappingURL=extHost.api.impl.js.map