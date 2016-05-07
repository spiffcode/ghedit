var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/uri', 'vs/base/common/severity', 'vs/base/common/lifecycle', 'vs/editor/common/editorCommon', 'vs/editor/common/modes', 'vs/editor/common/modes/languageSelector', 'vs/languages/typescript/common/lib/typescriptServices'], function (require, exports, winjs_base_1, uri_1, severity_1, lifecycle, editor, modes, languageSelector_1, ts) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function register(modelService, markerService, selector, defaults, worker) {
        var disposables = [];
        disposables.push(modes.SuggestRegistry.register(selector, new SuggestAdapter(modelService, worker)));
        disposables.push(modes.ParameterHintsRegistry.register(selector, new ParameterHintsAdapter(modelService, worker)));
        disposables.push(modes.ExtraInfoRegistry.register(selector, new QuickInfoAdapter(modelService, worker)));
        disposables.push(modes.OccurrencesRegistry.register(selector, new OccurrencesAdapter(modelService, worker)));
        disposables.push(modes.DeclarationRegistry.register(selector, new DeclarationAdapter(modelService, worker)));
        disposables.push(modes.ReferenceSearchRegistry.register(selector, new ReferenceAdapter(modelService, worker)));
        disposables.push(modes.OutlineRegistry.register(selector, new OutlineAdapter(modelService, worker)));
        disposables.push(modes.FormatRegistry.register(selector, new FormatAdapter(modelService, worker)));
        disposables.push(modes.FormatOnTypeRegistry.register(selector, new FormatAdapter(modelService, worker)));
        disposables.push(new DiagnostcsAdapter(defaults, selector, markerService, modelService, worker));
        return lifecycle.combinedDisposable(disposables);
    }
    exports.register = register;
    var Adapter = (function () {
        function Adapter(_modelService, _worker) {
            this._modelService = _modelService;
            this._worker = _worker;
        }
        Adapter.prototype._positionToOffset = function (resource, position) {
            var model = this._modelService.getModel(resource);
            var result = position.column - 1;
            for (var i = 1; i < position.lineNumber; i++) {
                result += model.getLineContent(i).length + model.getEOL().length;
            }
            return result;
        };
        Adapter.prototype._offsetToPosition = function (resource, offset) {
            var model = this._modelService.getModel(resource);
            var lineNumber = 1;
            while (true) {
                var len = model.getLineContent(lineNumber).length + model.getEOL().length;
                if (offset < len) {
                    break;
                }
                offset -= len;
                lineNumber++;
            }
            return { lineNumber: lineNumber, column: 1 + offset };
        };
        Adapter.prototype._textSpanToRange = function (resource, span) {
            var p1 = this._offsetToPosition(resource, span.start);
            var p2 = this._offsetToPosition(resource, span.start + span.length);
            var startLineNumber = p1.lineNumber, startColumn = p1.column;
            var endLineNumber = p2.lineNumber, endColumn = p2.column;
            return { startLineNumber: startLineNumber, startColumn: startColumn, endLineNumber: endLineNumber, endColumn: endColumn };
        };
        return Adapter;
    }());
    // --- diagnostics --- ---
    var DiagnostcsAdapter = (function (_super) {
        __extends(DiagnostcsAdapter, _super);
        function DiagnostcsAdapter(_defaults, _selector, _markerService, modelService, worker) {
            var _this = this;
            _super.call(this, modelService, worker);
            this._defaults = _defaults;
            this._selector = _selector;
            this._markerService = _markerService;
            this._disposables = [];
            this._listener = Object.create(null);
            var onModelAdd = function (model) {
                if (!languageSelector_1.default(_selector, model.getAssociatedResource(), model.getModeId())) {
                    return;
                }
                var handle;
                _this._listener[model.getAssociatedResource().toString()] = model.addListener2(editor.EventType.ModelContentChanged2, function () {
                    clearTimeout(handle);
                    handle = setTimeout(function () { return _this._doValidate(model.getAssociatedResource()); }, 500);
                });
                _this._doValidate(model.getAssociatedResource());
            };
            var onModelRemoved = function (model) {
                delete _this._listener[model.getAssociatedResource().toString()];
            };
            this._disposables.push(modelService.onModelAdded(onModelAdd));
            this._disposables.push(modelService.onModelRemoved(onModelRemoved));
            this._disposables.push(modelService.onModelModeChanged(function (event) {
                onModelRemoved(event.model);
                onModelAdd(event.model);
            }));
            this._disposables.push({
                dispose: function () {
                    for (var key in _this._listener) {
                        _this._listener[key].dispose();
                    }
                }
            });
            modelService.getModels().forEach(onModelAdd);
        }
        DiagnostcsAdapter.prototype.dispose = function () {
            this._disposables = lifecycle.dispose(this._disposables);
        };
        DiagnostcsAdapter.prototype._doValidate = function (resource) {
            var _this = this;
            this._worker(resource).then(function (worker) {
                var promises = [];
                if (!_this._defaults.diagnosticsOptions.noSyntaxValidation) {
                    promises.push(worker.getSyntacticDiagnostics(resource.toString()));
                }
                if (!_this._defaults.diagnosticsOptions.noSemanticValidation) {
                    promises.push(worker.getSemanticDiagnostics(resource.toString()));
                }
                return winjs_base_1.TPromise.join(promises);
            }).then(function (diagnostics) {
                var markers = diagnostics
                    .reduce(function (p, c) { return c.concat(p); }, [])
                    .map(function (d) { return _this._convertDiagnostics(resource, d); });
                _this._markerService.changeOne(_this._selector, resource, markers);
            }).done(undefined, function (err) {
                console.error(err);
            });
        };
        DiagnostcsAdapter.prototype._convertDiagnostics = function (resource, diag) {
            var _a = this._offsetToPosition(resource, diag.start), startLineNumber = _a.lineNumber, startColumn = _a.column;
            var _b = this._offsetToPosition(resource, diag.start + diag.length), endLineNumber = _b.lineNumber, endColumn = _b.column;
            return {
                severity: severity_1.default.Error,
                startLineNumber: startLineNumber,
                startColumn: startColumn,
                endLineNumber: endLineNumber,
                endColumn: endColumn,
                message: ts.flattenDiagnosticMessageText(diag.messageText, '\n')
            };
        };
        return DiagnostcsAdapter;
    }(Adapter));
    // --- suggest ------
    var SuggestAdapter = (function (_super) {
        __extends(SuggestAdapter, _super);
        function SuggestAdapter() {
            _super.apply(this, arguments);
        }
        SuggestAdapter.prototype.suggest = function (resource, position, triggerCharacter) {
            var model = this._modelService.getModel(resource);
            var wordInfo = model.getWordUntilPosition(position);
            var offset = this._positionToOffset(resource, position);
            return this._worker(resource).then(function (worker) {
                return worker.getCompletionsAtPosition(resource.toString(), offset);
            }).then(function (info) {
                if (!info) {
                    return;
                }
                var suggestions = info.entries.map(function (entry) {
                    return {
                        label: entry.name,
                        codeSnippet: entry.name,
                        type: SuggestAdapter.asType(entry.kind)
                    };
                });
                return [{
                        currentWord: wordInfo && wordInfo.word,
                        suggestions: suggestions
                    }];
            });
        };
        SuggestAdapter.prototype.getSuggestionDetails = function (resource, position, suggestion) {
            var _this = this;
            return this._worker(resource).then(function (worker) {
                return worker.getCompletionEntryDetails(resource.toString(), _this._positionToOffset(resource, position), suggestion.label);
            }).then(function (details) {
                if (!details) {
                    return suggestion;
                }
                return {
                    label: details.name,
                    codeSnippet: details.name,
                    type: SuggestAdapter.asType(details.kind),
                    typeLabel: ts.displayPartsToString(details.displayParts),
                    documentationLabel: ts.displayPartsToString(details.documentation)
                };
            });
        };
        SuggestAdapter.asType = function (kind) {
            switch (kind) {
                case 'getter':
                case 'setting':
                case 'constructor':
                case 'method':
                case 'property':
                    return 'property';
                case 'function':
                case 'local function':
                    return 'function';
                case 'class':
                    return 'class';
                case 'interface':
                    return 'interface';
            }
            return 'variable';
        };
        SuggestAdapter.prototype.getTriggerCharacters = function () {
            return ['.'];
        };
        SuggestAdapter.prototype.shouldShowEmptySuggestionList = function () {
            return true;
        };
        SuggestAdapter.prototype.shouldAutotriggerSuggest = function (context, offset, triggeredByCharacter) {
            return true;
        };
        return SuggestAdapter;
    }(Adapter));
    var ParameterHintsAdapter = (function (_super) {
        __extends(ParameterHintsAdapter, _super);
        function ParameterHintsAdapter() {
            _super.apply(this, arguments);
        }
        ParameterHintsAdapter.prototype.getParameterHintsTriggerCharacters = function () {
            return ['(', ','];
        };
        ParameterHintsAdapter.prototype.shouldTriggerParameterHints = function (context, offset) {
            return true;
        };
        ParameterHintsAdapter.prototype.getParameterHints = function (resource, position, triggerCharacter) {
            var _this = this;
            return this._worker(resource).then(function (worker) { return worker.getSignatureHelpItems(resource.toString(), _this._positionToOffset(resource, position)); }).then(function (info) {
                if (!info) {
                    return;
                }
                var ret = {
                    currentSignature: info.selectedItemIndex,
                    currentParameter: info.argumentIndex,
                    signatures: []
                };
                info.items.forEach(function (item) {
                    var signature = {
                        label: '',
                        documentation: null,
                        parameters: []
                    };
                    signature.label += ts.displayPartsToString(item.prefixDisplayParts);
                    item.parameters.forEach(function (p, i, a) {
                        var label = ts.displayPartsToString(p.displayParts);
                        var parameter = {
                            label: label,
                            documentation: ts.displayPartsToString(p.documentation),
                            signatureLabelOffset: signature.label.length,
                            signatureLabelEnd: signature.label.length + label.length
                        };
                        signature.label += label;
                        signature.parameters.push(parameter);
                        if (i < a.length - 1) {
                            signature.label += ts.displayPartsToString(item.separatorDisplayParts);
                        }
                    });
                    signature.label += ts.displayPartsToString(item.suffixDisplayParts);
                    ret.signatures.push(signature);
                });
                return ret;
            });
        };
        return ParameterHintsAdapter;
    }(Adapter));
    // --- hover ------
    var QuickInfoAdapter = (function (_super) {
        __extends(QuickInfoAdapter, _super);
        function QuickInfoAdapter() {
            _super.apply(this, arguments);
        }
        QuickInfoAdapter.prototype.computeInfo = function (resource, position) {
            var _this = this;
            return this._worker(resource).then(function (worker) {
                return worker.getQuickInfoAtPosition(resource.toString(), _this._positionToOffset(resource, position));
            }).then(function (info) {
                if (!info) {
                    return;
                }
                return {
                    range: _this._textSpanToRange(resource, info.textSpan),
                    value: ts.displayPartsToString(info.displayParts)
                };
            });
        };
        return QuickInfoAdapter;
    }(Adapter));
    // --- occurrences ------
    var OccurrencesAdapter = (function (_super) {
        __extends(OccurrencesAdapter, _super);
        function OccurrencesAdapter() {
            _super.apply(this, arguments);
        }
        OccurrencesAdapter.prototype.findOccurrences = function (resource, position, strict) {
            var _this = this;
            return this._worker(resource).then(function (worker) {
                return worker.getOccurrencesAtPosition(resource.toString(), _this._positionToOffset(resource, position));
            }).then(function (entries) {
                if (!entries) {
                    return;
                }
                return entries.map(function (entry) {
                    return {
                        range: _this._textSpanToRange(resource, entry.textSpan),
                        kind: entry.isWriteAccess ? 'write' : 'text'
                    };
                });
            });
        };
        return OccurrencesAdapter;
    }(Adapter));
    // --- definition ------
    var DeclarationAdapter = (function (_super) {
        __extends(DeclarationAdapter, _super);
        function DeclarationAdapter() {
            _super.apply(this, arguments);
        }
        DeclarationAdapter.prototype.canFindDeclaration = function (context, offset) {
            return true;
        };
        DeclarationAdapter.prototype.findDeclaration = function (resource, position) {
            var _this = this;
            return this._worker(resource).then(function (worker) {
                return worker.getDefinitionAtPosition(resource.toString(), _this._positionToOffset(resource, position));
            }).then(function (entries) {
                if (!entries) {
                    return;
                }
                var result = [];
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var entry = entries_1[_i];
                    var uri = uri_1.default.parse(entry.fileName);
                    if (_this._modelService.getModel(uri)) {
                        result.push({
                            resource: uri,
                            range: _this._textSpanToRange(uri, entry.textSpan)
                        });
                    }
                }
                return result;
            });
        };
        return DeclarationAdapter;
    }(Adapter));
    // --- references ------
    var ReferenceAdapter = (function (_super) {
        __extends(ReferenceAdapter, _super);
        function ReferenceAdapter() {
            _super.apply(this, arguments);
        }
        ReferenceAdapter.prototype.canFindReferences = function (context, offset) {
            return true;
        };
        ReferenceAdapter.prototype.findReferences = function (resource, position, includeDeclaration) {
            var _this = this;
            return this._worker(resource).then(function (worker) {
                return worker.getReferencesAtPosition(resource.toString(), _this._positionToOffset(resource, position));
            }).then(function (entries) {
                if (!entries) {
                    return;
                }
                var result = [];
                for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                    var entry = entries_2[_i];
                    var uri = uri_1.default.parse(entry.fileName);
                    if (_this._modelService.getModel(uri)) {
                        result.push({
                            resource: uri,
                            range: _this._textSpanToRange(uri, entry.textSpan)
                        });
                    }
                }
                return result;
            });
        };
        return ReferenceAdapter;
    }(Adapter));
    // --- outline ------
    var OutlineAdapter = (function (_super) {
        __extends(OutlineAdapter, _super);
        function OutlineAdapter() {
            _super.apply(this, arguments);
        }
        OutlineAdapter.prototype.getOutline = function (resource) {
            var _this = this;
            return this._worker(resource).then(function (worker) { return worker.getNavigationBarItems(resource.toString()); }).then(function (items) {
                if (!items) {
                    return;
                }
                var convert = function (item) {
                    return {
                        label: item.text,
                        type: item.kind,
                        range: _this._textSpanToRange(resource, item.spans[0]),
                        children: item.childItems && item.childItems.map(convert)
                    };
                };
                return items.map(convert);
            });
        };
        return OutlineAdapter;
    }(Adapter));
    // --- formatting ----
    var FormatAdapter = (function (_super) {
        __extends(FormatAdapter, _super);
        function FormatAdapter() {
            _super.apply(this, arguments);
        }
        FormatAdapter.prototype.formatRange = function (resource, range, options) {
            var _this = this;
            return this._worker(resource).then(function (worker) {
                return worker.getFormattingEditsForRange(resource.toString(), _this._positionToOffset(resource, { lineNumber: range.startLineNumber, column: range.startColumn }), _this._positionToOffset(resource, { lineNumber: range.endLineNumber, column: range.endColumn }), FormatAdapter._convertOptions(options));
            }).then(function (edits) {
                if (edits) {
                    return edits.map(function (edit) { return _this._convertTextChanges(resource, edit); });
                }
            });
        };
        Object.defineProperty(FormatAdapter.prototype, "autoFormatTriggerCharacters", {
            get: function () {
                return [';', '}', '\n'];
            },
            enumerable: true,
            configurable: true
        });
        FormatAdapter.prototype.formatAfterKeystroke = function (resource, position, ch, options) {
            var _this = this;
            return this._worker(resource).then(function (worker) {
                return worker.getFormattingEditsAfterKeystroke(resource.toString(), _this._positionToOffset(resource, position), ch, FormatAdapter._convertOptions(options));
            }).then(function (edits) {
                if (edits) {
                    return edits.map(function (edit) { return _this._convertTextChanges(resource, edit); });
                }
            });
        };
        FormatAdapter.prototype._convertTextChanges = function (resource, change) {
            return {
                text: change.newText,
                range: this._textSpanToRange(resource, change.span)
            };
        };
        FormatAdapter._convertOptions = function (options) {
            return {
                ConvertTabsToSpaces: options.insertSpaces,
                TabSize: options.tabSize,
                IndentSize: options.tabSize,
                IndentStyle: ts.IndentStyle.Smart,
                NewLineCharacter: '\n',
                InsertSpaceAfterCommaDelimiter: true,
                InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
                InsertSpaceAfterKeywordsInControlFlowStatements: false,
                InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: true,
                InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: true,
                InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: true,
                InsertSpaceAfterSemicolonInForStatements: false,
                InsertSpaceBeforeAndAfterBinaryOperators: true,
                PlaceOpenBraceOnNewLineForControlBlocks: false,
                PlaceOpenBraceOnNewLineForFunctions: false
            };
        };
        return FormatAdapter;
    }(Adapter));
});
//# sourceMappingURL=languageFeatures.js.map