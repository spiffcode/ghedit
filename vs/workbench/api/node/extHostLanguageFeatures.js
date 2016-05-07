var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/lifecycle', 'vs/platform/thread/common/thread', 'vs/workbench/api/node/extHostTypeConverters', 'vs/workbench/api/node/extHostTypes', 'vs/editor/common/modes', 'vs/workbench/api/node/extHostDocuments', 'vs/workbench/api/node/extHostCommands', 'vs/workbench/api/node/extHostDiagnostics', 'vs/workbench/parts/search/common/search', 'vs/base/common/async'], function (require, exports, winjs_base_1, lifecycle_1, thread_1, TypeConverters, extHostTypes_1, modes, extHostDocuments_1, extHostCommands_1, extHostDiagnostics_1, search_1, async_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // --- adapter
    var OutlineAdapter = (function () {
        function OutlineAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        OutlineAdapter.prototype.getOutline = function (resource) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentSymbols(doc, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.SymbolInformation.toOutlineEntry);
                }
            });
        };
        return OutlineAdapter;
    }());
    var CodeLensAdapter = (function () {
        function CodeLensAdapter(documents, commands, provider) {
            this._cache = Object.create(null);
            this._documents = documents;
            this._commands = commands;
            this._provider = provider;
        }
        CodeLensAdapter.prototype.findCodeLensSymbols = function (resource) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var version = doc.version;
            var key = resource.toString();
            // from cache
            var entry = this._cache[key];
            if (entry && entry.version === version) {
                return new async_1.ShallowCancelThenPromise(entry.data.then(function (cached) { return cached.symbols; }));
            }
            var newCodeLensData = async_1.asWinJsPromise(function (token) { return _this._provider.provideCodeLenses(doc, token); }).then(function (lenses) {
                if (!Array.isArray(lenses)) {
                    return;
                }
                var data = {
                    lenses: lenses,
                    symbols: [],
                    disposables: [],
                };
                lenses.forEach(function (lens, i) {
                    data.symbols.push({
                        id: String(i),
                        range: TypeConverters.fromRange(lens.range),
                        command: TypeConverters.Command.from(lens.command, { commands: _this._commands, disposables: data.disposables })
                    });
                });
                return data;
            });
            this._cache[key] = {
                version: version,
                data: newCodeLensData
            };
            return new async_1.ShallowCancelThenPromise(newCodeLensData.then(function (newCached) {
                if (entry) {
                    // only now dispose old commands et al
                    entry.data.then(function (oldCached) { return lifecycle_1.dispose(oldCached.disposables); });
                }
                return newCached && newCached.symbols;
            }));
        };
        CodeLensAdapter.prototype.resolveCodeLensSymbol = function (resource, symbol) {
            var _this = this;
            var entry = this._cache[resource.toString()];
            if (!entry) {
                return;
            }
            return entry.data.then(function (cachedData) {
                if (!cachedData) {
                    return;
                }
                var lens = cachedData.lenses[Number(symbol.id)];
                if (!lens) {
                    return;
                }
                var resolve;
                if (typeof _this._provider.resolveCodeLens !== 'function' || lens.isResolved) {
                    resolve = winjs_base_1.TPromise.as(lens);
                }
                else {
                    resolve = async_1.asWinJsPromise(function (token) { return _this._provider.resolveCodeLens(lens, token); });
                }
                return resolve.then(function (newLens) {
                    lens = newLens || lens;
                    var command = lens.command;
                    if (!command) {
                        command = {
                            title: '<<MISSING COMMAND>>',
                            command: 'missing',
                        };
                    }
                    symbol.command = TypeConverters.Command.from(command, { commands: _this._commands, disposables: cachedData.disposables });
                    return symbol;
                });
            });
        };
        return CodeLensAdapter;
    }());
    var DeclarationAdapter = (function () {
        function DeclarationAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        DeclarationAdapter.prototype.canFindDeclaration = function () {
            return true;
        };
        DeclarationAdapter.prototype.findDeclaration = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDefinition(doc, pos, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(DeclarationAdapter._convertLocation);
                }
                else if (value) {
                    return DeclarationAdapter._convertLocation(value);
                }
            });
        };
        DeclarationAdapter._convertLocation = function (location) {
            if (!location) {
                return;
            }
            return {
                resource: location.uri,
                range: TypeConverters.fromRange(location.range)
            };
        };
        return DeclarationAdapter;
    }());
    var ExtraInfoAdapter = (function () {
        function ExtraInfoAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        ExtraInfoAdapter.prototype.computeInfo = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideHover(doc, pos, token); }).then(function (value) {
                if (!value) {
                    return;
                }
                if (!value.range) {
                    value.range = doc.getWordRangeAtPosition(pos);
                }
                if (!value.range) {
                    value.range = new extHostTypes_1.Range(pos, pos);
                }
                return TypeConverters.fromHover(value);
            });
        };
        return ExtraInfoAdapter;
    }());
    var OccurrencesAdapter = (function () {
        function OccurrencesAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        OccurrencesAdapter.prototype.findOccurrences = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentHighlights(doc, pos, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(OccurrencesAdapter._convertDocumentHighlight);
                }
            });
        };
        OccurrencesAdapter._convertDocumentHighlight = function (documentHighlight) {
            return {
                range: TypeConverters.fromRange(documentHighlight.range),
                kind: extHostTypes_1.DocumentHighlightKind[documentHighlight.kind].toString().toLowerCase()
            };
        };
        return OccurrencesAdapter;
    }());
    var ReferenceAdapter = (function () {
        function ReferenceAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        ReferenceAdapter.prototype.canFindReferences = function () {
            return true;
        };
        ReferenceAdapter.prototype.findReferences = function (resource, position, includeDeclaration) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideReferences(doc, pos, { includeDeclaration: includeDeclaration }, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(ReferenceAdapter._convertLocation);
                }
            });
        };
        ReferenceAdapter._convertLocation = function (location) {
            return {
                resource: location.uri,
                range: TypeConverters.fromRange(location.range)
            };
        };
        return ReferenceAdapter;
    }());
    var QuickFixAdapter = (function () {
        function QuickFixAdapter(documents, commands, diagnostics, provider) {
            this._cachedCommands = [];
            this._documents = documents;
            this._commands = commands;
            this._diagnostics = diagnostics;
            this._provider = provider;
        }
        QuickFixAdapter.prototype.getQuickFixes = function (resource, range) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var ran = TypeConverters.toRange(range);
            var allDiagnostics = [];
            this._diagnostics.forEach(function (collection) {
                if (collection.has(resource)) {
                    for (var _i = 0, _a = collection.get(resource); _i < _a.length; _i++) {
                        var diagnostic = _a[_i];
                        if (diagnostic.range.intersection(ran)) {
                            allDiagnostics.push(diagnostic);
                        }
                    }
                }
            });
            this._cachedCommands = lifecycle_1.dispose(this._cachedCommands);
            var ctx = { commands: this._commands, disposables: this._cachedCommands };
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideCodeActions(doc, ran, { diagnostics: allDiagnostics }, token); }).then(function (commands) {
                if (!Array.isArray(commands)) {
                    return;
                }
                return commands.map(function (command, i) {
                    return {
                        command: TypeConverters.Command.from(command, ctx),
                        score: i
                    };
                });
            });
        };
        QuickFixAdapter.prototype.runQuickFixAction = function (resource, range, quickFix) {
            var command = TypeConverters.Command.to(quickFix.command);
            return (_a = this._commands).executeCommand.apply(_a, [command.command].concat(command.arguments));
            var _a;
        };
        return QuickFixAdapter;
    }());
    var DocumentFormattingAdapter = (function () {
        function DocumentFormattingAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        DocumentFormattingAdapter.prototype.formatDocument = function (resource, options) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentFormattingEdits(doc, options, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.TextEdit.from);
                }
            });
        };
        return DocumentFormattingAdapter;
    }());
    var RangeFormattingAdapter = (function () {
        function RangeFormattingAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        RangeFormattingAdapter.prototype.formatRange = function (resource, range, options) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var ran = TypeConverters.toRange(range);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentRangeFormattingEdits(doc, ran, options, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.TextEdit.from);
                }
            });
        };
        return RangeFormattingAdapter;
    }());
    var OnTypeFormattingAdapter = (function () {
        function OnTypeFormattingAdapter(documents, provider) {
            this.autoFormatTriggerCharacters = []; // not here
            this._documents = documents;
            this._provider = provider;
        }
        OnTypeFormattingAdapter.prototype.formatAfterKeystroke = function (resource, position, ch, options) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideOnTypeFormattingEdits(doc, pos, ch, options, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.TextEdit.from);
                }
            });
        };
        return OnTypeFormattingAdapter;
    }());
    var NavigateTypeAdapter = (function () {
        function NavigateTypeAdapter(provider) {
            this._provider = provider;
        }
        NavigateTypeAdapter.prototype.getNavigateToItems = function (search) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideWorkspaceSymbols(search, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.fromSymbolInformation);
                }
            });
        };
        return NavigateTypeAdapter;
    }());
    var RenameAdapter = (function () {
        function RenameAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        RenameAdapter.prototype.rename = function (resource, position, newName) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideRenameEdits(doc, pos, newName, token); }).then(function (value) {
                if (!value) {
                    return;
                }
                var result = {
                    currentName: undefined,
                    edits: []
                };
                for (var _i = 0, _a = value.entries(); _i < _a.length; _i++) {
                    var entry = _a[_i];
                    var uri = entry[0], textEdits = entry[1];
                    for (var _b = 0, textEdits_1 = textEdits; _b < textEdits_1.length; _b++) {
                        var textEdit = textEdits_1[_b];
                        result.edits.push({
                            resource: uri,
                            newText: textEdit.newText,
                            range: TypeConverters.fromRange(textEdit.range)
                        });
                    }
                }
                return result;
            }, function (err) {
                if (typeof err === 'string') {
                    return {
                        currentName: undefined,
                        edits: undefined,
                        rejectReason: err
                    };
                }
                return winjs_base_1.TPromise.wrapError(err);
            });
        };
        return RenameAdapter;
    }());
    var SuggestAdapter = (function () {
        function SuggestAdapter(documents, provider) {
            this._cache = Object.create(null);
            this._documents = documents;
            this._provider = provider;
        }
        SuggestAdapter.prototype.suggest = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            var ran = doc.getWordRangeAtPosition(pos);
            var key = resource.toString();
            delete this._cache[key];
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideCompletionItems(doc, pos, token); }).then(function (value) {
                var defaultSuggestions = {
                    suggestions: [],
                    currentWord: ran ? doc.getText(new extHostTypes_1.Range(ran.start.line, ran.start.character, pos.line, pos.character)) : '',
                };
                var allSuggestions = [defaultSuggestions];
                var list;
                if (Array.isArray(value)) {
                    list = new extHostTypes_1.CompletionList(value);
                }
                else if (value instanceof extHostTypes_1.CompletionList) {
                    list = value;
                    defaultSuggestions.incomplete = list.isIncomplete;
                }
                else {
                    return;
                }
                for (var i = 0; i < list.items.length; i++) {
                    var item = list.items[i];
                    var suggestion = TypeConverters.Suggest.from(item);
                    if (item.textEdit) {
                        var editRange = item.textEdit.range;
                        // invalid text edit
                        if (!editRange.isSingleLine || editRange.start.line !== pos.line) {
                            console.warn('INVALID text edit, must be single line and on the same line');
                            continue;
                        }
                        // insert the text of the edit and create a dedicated
                        // suggestion-container with overwrite[Before|After]
                        suggestion.codeSnippet = item.textEdit.newText;
                        suggestion.overwriteBefore = pos.character - editRange.start.character;
                        suggestion.overwriteAfter = editRange.end.character - pos.character;
                        allSuggestions.push({
                            currentWord: doc.getText(editRange),
                            suggestions: [suggestion],
                            incomplete: list.isIncomplete
                        });
                    }
                    else {
                        defaultSuggestions.suggestions.push(suggestion);
                    }
                    // assign identifier to suggestion
                    suggestion.id = String(i);
                }
                // cache for details call
                _this._cache[key] = list;
                return allSuggestions;
            });
        };
        SuggestAdapter.prototype.getSuggestionDetails = function (resource, position, suggestion) {
            var _this = this;
            if (typeof this._provider.resolveCompletionItem !== 'function') {
                return winjs_base_1.TPromise.as(suggestion);
            }
            var list = this._cache[resource.toString()];
            if (!list) {
                return winjs_base_1.TPromise.as(suggestion);
            }
            var item = list.items[Number(suggestion.id)];
            if (!item) {
                return winjs_base_1.TPromise.as(suggestion);
            }
            return async_1.asWinJsPromise(function (token) { return _this._provider.resolveCompletionItem(item, token); }).then(function (resolvedItem) {
                return TypeConverters.Suggest.from(resolvedItem || item);
            });
        };
        SuggestAdapter.prototype.getTriggerCharacters = function () {
            throw new Error('illegal state');
        };
        SuggestAdapter.prototype.shouldShowEmptySuggestionList = function () {
            throw new Error('illegal state');
        };
        SuggestAdapter.prototype.shouldAutotriggerSuggest = function (context, offset, triggeredByCharacter) {
            throw new Error('illegal state');
        };
        return SuggestAdapter;
    }());
    var ParameterHintsAdapter = (function () {
        function ParameterHintsAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        ParameterHintsAdapter.prototype.getParameterHints = function (resource, position, triggerCharacter) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideSignatureHelp(doc, pos, token); }).then(function (value) {
                if (value instanceof extHostTypes_1.SignatureHelp) {
                    return TypeConverters.SignatureHelp.from(value);
                }
            });
        };
        ParameterHintsAdapter.prototype.getParameterHintsTriggerCharacters = function () {
            throw new Error('illegal state');
        };
        ParameterHintsAdapter.prototype.shouldTriggerParameterHints = function (context, offset) {
            throw new Error('illegal state');
        };
        return ParameterHintsAdapter;
    }());
    var ExtHostLanguageFeatures = (function () {
        function ExtHostLanguageFeatures(threadService) {
            this._adapter = Object.create(null);
            this._proxy = threadService.getRemotable(MainThreadLanguageFeatures);
            this._documents = threadService.getRemotable(extHostDocuments_1.ExtHostModelService);
            this._commands = threadService.getRemotable(extHostCommands_1.ExtHostCommands);
            this._diagnostics = threadService.getRemotable(extHostDiagnostics_1.ExtHostDiagnostics);
        }
        ExtHostLanguageFeatures.prototype._createDisposable = function (handle) {
            var _this = this;
            return new extHostTypes_1.Disposable(function () {
                delete _this._adapter[handle];
                _this._proxy.$unregister(handle);
            });
        };
        ExtHostLanguageFeatures.prototype._nextHandle = function () {
            return ExtHostLanguageFeatures._handlePool++;
        };
        ExtHostLanguageFeatures.prototype._withAdapter = function (handle, ctor, callback) {
            var adapter = this._adapter[handle];
            if (!(adapter instanceof ctor)) {
                return winjs_base_1.TPromise.wrapError(new Error('no adapter found'));
            }
            return callback(adapter);
        };
        // --- outline
        ExtHostLanguageFeatures.prototype.registerDocumentSymbolProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new OutlineAdapter(this._documents, provider);
            this._proxy.$registerOutlineSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$getOutline = function (handle, resource) {
            return this._withAdapter(handle, OutlineAdapter, function (adapter) { return adapter.getOutline(resource); });
        };
        // --- code lens
        ExtHostLanguageFeatures.prototype.registerCodeLensProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new CodeLensAdapter(this._documents, this._commands, provider);
            this._proxy.$registerCodeLensSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$findCodeLensSymbols = function (handle, resource) {
            return this._withAdapter(handle, CodeLensAdapter, function (adapter) { return adapter.findCodeLensSymbols(resource); });
        };
        ExtHostLanguageFeatures.prototype.$resolveCodeLensSymbol = function (handle, resource, symbol) {
            return this._withAdapter(handle, CodeLensAdapter, function (adapter) { return adapter.resolveCodeLensSymbol(resource, symbol); });
        };
        // --- declaration
        ExtHostLanguageFeatures.prototype.registerDefinitionProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new DeclarationAdapter(this._documents, provider);
            this._proxy.$registerDeclaractionSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$findDeclaration = function (handle, resource, position) {
            return this._withAdapter(handle, DeclarationAdapter, function (adapter) { return adapter.findDeclaration(resource, position); });
        };
        // --- extra info
        ExtHostLanguageFeatures.prototype.registerHoverProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new ExtraInfoAdapter(this._documents, provider);
            this._proxy.$registerExtraInfoSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$computeInfo = function (handle, resource, position) {
            return this._withAdapter(handle, ExtraInfoAdapter, function (adpater) { return adpater.computeInfo(resource, position); });
        };
        // --- occurrences
        ExtHostLanguageFeatures.prototype.registerDocumentHighlightProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new OccurrencesAdapter(this._documents, provider);
            this._proxy.$registerOccurrencesSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$findOccurrences = function (handle, resource, position) {
            return this._withAdapter(handle, OccurrencesAdapter, function (adapter) { return adapter.findOccurrences(resource, position); });
        };
        // --- references
        ExtHostLanguageFeatures.prototype.registerReferenceProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new ReferenceAdapter(this._documents, provider);
            this._proxy.$registerReferenceSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$findReferences = function (handle, resource, position, includeDeclaration) {
            return this._withAdapter(handle, ReferenceAdapter, function (adapter) { return adapter.findReferences(resource, position, includeDeclaration); });
        };
        // --- quick fix
        ExtHostLanguageFeatures.prototype.registerCodeActionProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new QuickFixAdapter(this._documents, this._commands, this._diagnostics, provider);
            this._proxy.$registerQuickFixSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$getQuickFixes = function (handle, resource, range) {
            return this._withAdapter(handle, QuickFixAdapter, function (adapter) { return adapter.getQuickFixes(resource, range); });
        };
        ExtHostLanguageFeatures.prototype.$runQuickFixAction = function (handle, resource, range, quickFix) {
            return this._withAdapter(handle, QuickFixAdapter, function (adapter) { return adapter.runQuickFixAction(resource, range, quickFix); });
        };
        // --- formatting
        ExtHostLanguageFeatures.prototype.registerDocumentFormattingEditProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new DocumentFormattingAdapter(this._documents, provider);
            this._proxy.$registerDocumentFormattingSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$formatDocument = function (handle, resource, options) {
            return this._withAdapter(handle, DocumentFormattingAdapter, function (adapter) { return adapter.formatDocument(resource, options); });
        };
        ExtHostLanguageFeatures.prototype.registerDocumentRangeFormattingEditProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new RangeFormattingAdapter(this._documents, provider);
            this._proxy.$registerRangeFormattingSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$formatRange = function (handle, resource, range, options) {
            return this._withAdapter(handle, RangeFormattingAdapter, function (adapter) { return adapter.formatRange(resource, range, options); });
        };
        ExtHostLanguageFeatures.prototype.registerOnTypeFormattingEditProvider = function (selector, provider, triggerCharacters) {
            var handle = this._nextHandle();
            this._adapter[handle] = new OnTypeFormattingAdapter(this._documents, provider);
            this._proxy.$registerOnTypeFormattingSupport(handle, selector, triggerCharacters);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$formatAfterKeystroke = function (handle, resource, position, ch, options) {
            return this._withAdapter(handle, OnTypeFormattingAdapter, function (adapter) { return adapter.formatAfterKeystroke(resource, position, ch, options); });
        };
        // --- navigate types
        ExtHostLanguageFeatures.prototype.registerWorkspaceSymbolProvider = function (provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new NavigateTypeAdapter(provider);
            this._proxy.$registerNavigateTypeSupport(handle);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$getNavigateToItems = function (handle, search) {
            return this._withAdapter(handle, NavigateTypeAdapter, function (adapter) { return adapter.getNavigateToItems(search); });
        };
        // --- rename
        ExtHostLanguageFeatures.prototype.registerRenameProvider = function (selector, provider) {
            var handle = this._nextHandle();
            this._adapter[handle] = new RenameAdapter(this._documents, provider);
            this._proxy.$registerRenameSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$rename = function (handle, resource, position, newName) {
            return this._withAdapter(handle, RenameAdapter, function (adapter) { return adapter.rename(resource, position, newName); });
        };
        // --- suggestion
        ExtHostLanguageFeatures.prototype.registerCompletionItemProvider = function (selector, provider, triggerCharacters) {
            var handle = this._nextHandle();
            this._adapter[handle] = new SuggestAdapter(this._documents, provider);
            this._proxy.$registerSuggestSupport(handle, selector, triggerCharacters);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$suggest = function (handle, resource, position) {
            return this._withAdapter(handle, SuggestAdapter, function (adapter) { return adapter.suggest(resource, position); });
        };
        ExtHostLanguageFeatures.prototype.$getSuggestionDetails = function (handle, resource, position, suggestion) {
            return this._withAdapter(handle, SuggestAdapter, function (adapter) { return adapter.getSuggestionDetails(resource, position, suggestion); });
        };
        // --- parameter hints
        ExtHostLanguageFeatures.prototype.registerSignatureHelpProvider = function (selector, provider, triggerCharacters) {
            var handle = this._nextHandle();
            this._adapter[handle] = new ParameterHintsAdapter(this._documents, provider);
            this._proxy.$registerParameterHintsSupport(handle, selector, triggerCharacters);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$getParameterHints = function (handle, resource, position, triggerCharacter) {
            return this._withAdapter(handle, ParameterHintsAdapter, function (adapter) { return adapter.getParameterHints(resource, position, triggerCharacter); });
        };
        ExtHostLanguageFeatures._handlePool = 0;
        ExtHostLanguageFeatures = __decorate([
            thread_1.Remotable.ExtHostContext('ExtHostLanguageFeatures'),
            __param(0, thread_1.IThreadService)
        ], ExtHostLanguageFeatures);
        return ExtHostLanguageFeatures;
    }());
    exports.ExtHostLanguageFeatures = ExtHostLanguageFeatures;
    var MainThreadLanguageFeatures = (function () {
        function MainThreadLanguageFeatures(threadService) {
            this._registrations = Object.create(null);
            this._proxy = threadService.getRemotable(ExtHostLanguageFeatures);
        }
        MainThreadLanguageFeatures.prototype.$unregister = function (handle) {
            var registration = this._registrations[handle];
            if (registration) {
                registration.dispose();
                delete this._registrations[handle];
            }
            return undefined;
        };
        // --- outline
        MainThreadLanguageFeatures.prototype.$registerOutlineSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.OutlineRegistry.register(selector, {
                getOutline: function (resource) {
                    return _this._proxy.$getOutline(handle, resource);
                }
            });
            return undefined;
        };
        // --- code lens
        MainThreadLanguageFeatures.prototype.$registerCodeLensSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.CodeLensRegistry.register(selector, {
                findCodeLensSymbols: function (resource) {
                    return _this._proxy.$findCodeLensSymbols(handle, resource);
                },
                resolveCodeLensSymbol: function (resource, symbol) {
                    return _this._proxy.$resolveCodeLensSymbol(handle, resource, symbol);
                }
            });
            return undefined;
        };
        // --- declaration
        MainThreadLanguageFeatures.prototype.$registerDeclaractionSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.DeclarationRegistry.register(selector, {
                canFindDeclaration: function () {
                    return true;
                },
                findDeclaration: function (resource, position) {
                    return _this._proxy.$findDeclaration(handle, resource, position);
                }
            });
            return undefined;
        };
        // --- extra info
        MainThreadLanguageFeatures.prototype.$registerExtraInfoSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.ExtraInfoRegistry.register(selector, {
                computeInfo: function (resource, position) {
                    return _this._proxy.$computeInfo(handle, resource, position);
                }
            });
            return undefined;
        };
        // --- occurrences
        MainThreadLanguageFeatures.prototype.$registerOccurrencesSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.OccurrencesRegistry.register(selector, {
                findOccurrences: function (resource, position) {
                    return _this._proxy.$findOccurrences(handle, resource, position);
                }
            });
            return undefined;
        };
        // --- references
        MainThreadLanguageFeatures.prototype.$registerReferenceSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.ReferenceSearchRegistry.register(selector, {
                canFindReferences: function () {
                    return true;
                },
                findReferences: function (resource, position, includeDeclaration) {
                    return _this._proxy.$findReferences(handle, resource, position, includeDeclaration);
                }
            });
            return undefined;
        };
        // --- quick fix
        MainThreadLanguageFeatures.prototype.$registerQuickFixSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.QuickFixRegistry.register(selector, {
                getQuickFixes: function (resource, range) {
                    return _this._proxy.$getQuickFixes(handle, resource, range);
                },
                runQuickFixAction: function (resource, range, quickFix) {
                    return _this._proxy.$runQuickFixAction(handle, resource, range, quickFix);
                }
            });
            return undefined;
        };
        // --- formatting
        MainThreadLanguageFeatures.prototype.$registerDocumentFormattingSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.FormatRegistry.register(selector, {
                formatDocument: function (resource, options) {
                    return _this._proxy.$formatDocument(handle, resource, options);
                }
            });
            return undefined;
        };
        MainThreadLanguageFeatures.prototype.$registerRangeFormattingSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.FormatRegistry.register(selector, {
                formatRange: function (resource, range, options) {
                    return _this._proxy.$formatRange(handle, resource, range, options);
                }
            });
            return undefined;
        };
        MainThreadLanguageFeatures.prototype.$registerOnTypeFormattingSupport = function (handle, selector, autoFormatTriggerCharacters) {
            var _this = this;
            this._registrations[handle] = modes.FormatOnTypeRegistry.register(selector, {
                autoFormatTriggerCharacters: autoFormatTriggerCharacters,
                formatAfterKeystroke: function (resource, position, ch, options) {
                    return _this._proxy.$formatAfterKeystroke(handle, resource, position, ch, options);
                }
            });
            return undefined;
        };
        // --- navigate type
        MainThreadLanguageFeatures.prototype.$registerNavigateTypeSupport = function (handle) {
            var _this = this;
            this._registrations[handle] = search_1.NavigateTypesSupportRegistry.register({
                getNavigateToItems: function (search) {
                    return _this._proxy.$getNavigateToItems(handle, search);
                }
            });
            return undefined;
        };
        // --- rename
        MainThreadLanguageFeatures.prototype.$registerRenameSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.RenameRegistry.register(selector, {
                rename: function (resource, position, newName) {
                    return _this._proxy.$rename(handle, resource, position, newName);
                }
            });
            return undefined;
        };
        // --- suggest
        MainThreadLanguageFeatures.prototype.$registerSuggestSupport = function (handle, selector, triggerCharacters) {
            var _this = this;
            this._registrations[handle] = modes.SuggestRegistry.register(selector, {
                suggest: function (resource, position, triggerCharacter) {
                    return _this._proxy.$suggest(handle, resource, position);
                },
                getSuggestionDetails: function (resource, position, suggestion) {
                    return _this._proxy.$getSuggestionDetails(handle, resource, position, suggestion);
                },
                getTriggerCharacters: function () {
                    return triggerCharacters;
                },
                shouldShowEmptySuggestionList: function () {
                    return true;
                },
                shouldAutotriggerSuggest: function () {
                    return true;
                }
            });
            return undefined;
        };
        // --- parameter hints
        MainThreadLanguageFeatures.prototype.$registerParameterHintsSupport = function (handle, selector, triggerCharacter) {
            var _this = this;
            this._registrations[handle] = modes.ParameterHintsRegistry.register(selector, {
                getParameterHints: function (resource, position, triggerCharacter) {
                    return _this._proxy.$getParameterHints(handle, resource, position, triggerCharacter);
                },
                getParameterHintsTriggerCharacters: function () {
                    return triggerCharacter;
                },
                shouldTriggerParameterHints: function (context, offset) {
                    return true;
                }
            });
            return undefined;
        };
        MainThreadLanguageFeatures = __decorate([
            thread_1.Remotable.MainContext('MainThreadLanguageFeatures'),
            __param(0, thread_1.IThreadService)
        ], MainThreadLanguageFeatures);
        return MainThreadLanguageFeatures;
    }());
    exports.MainThreadLanguageFeatures = MainThreadLanguageFeatures;
});
//# sourceMappingURL=extHostLanguageFeatures.js.map