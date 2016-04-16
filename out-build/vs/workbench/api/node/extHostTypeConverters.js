define(["require", "exports", 'vs/base/common/severity', 'vs/base/common/arrays', './extHostTypes', 'vs/platform/editor/common/editor'], function (require, exports, severity_1, arrays_1, types, editor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function toSelection(selection) {
        var selectionStartLineNumber = selection.selectionStartLineNumber, selectionStartColumn = selection.selectionStartColumn, positionLineNumber = selection.positionLineNumber, positionColumn = selection.positionColumn;
        var start = new types.Position(selectionStartLineNumber - 1, selectionStartColumn - 1);
        var end = new types.Position(positionLineNumber - 1, positionColumn - 1);
        return new types.Selection(start, end);
    }
    exports.toSelection = toSelection;
    function fromSelection(selection) {
        var anchor = selection.anchor, active = selection.active;
        return {
            selectionStartLineNumber: anchor.line + 1,
            selectionStartColumn: anchor.character + 1,
            positionLineNumber: active.line + 1,
            positionColumn: active.character + 1
        };
    }
    exports.fromSelection = fromSelection;
    function fromRange(range) {
        var start = range.start, end = range.end;
        return {
            startLineNumber: start.line + 1,
            startColumn: start.character + 1,
            endLineNumber: end.line + 1,
            endColumn: end.character + 1
        };
    }
    exports.fromRange = fromRange;
    function toRange(range) {
        var startLineNumber = range.startLineNumber, startColumn = range.startColumn, endLineNumber = range.endLineNumber, endColumn = range.endColumn;
        return new types.Range(startLineNumber - 1, startColumn - 1, endLineNumber - 1, endColumn - 1);
    }
    exports.toRange = toRange;
    function toPosition(position) {
        return new types.Position(position.lineNumber - 1, position.column - 1);
    }
    exports.toPosition = toPosition;
    function fromPosition(position) {
        return { lineNumber: position.line + 1, column: position.character + 1 };
    }
    exports.fromPosition = fromPosition;
    function fromDiagnosticSeverity(value) {
        switch (value) {
            case types.DiagnosticSeverity.Error:
                return severity_1.default.Error;
            case types.DiagnosticSeverity.Warning:
                return severity_1.default.Warning;
            case types.DiagnosticSeverity.Information:
                return severity_1.default.Info;
            case types.DiagnosticSeverity.Hint:
                return severity_1.default.Ignore;
        }
        return severity_1.default.Error;
    }
    exports.fromDiagnosticSeverity = fromDiagnosticSeverity;
    function toDiagnosticSeverty(value) {
        switch (value) {
            case severity_1.default.Info:
                return types.DiagnosticSeverity.Information;
            case severity_1.default.Warning:
                return types.DiagnosticSeverity.Warning;
            case severity_1.default.Error:
                return types.DiagnosticSeverity.Error;
            case severity_1.default.Ignore:
                return types.DiagnosticSeverity.Hint;
        }
        return types.DiagnosticSeverity.Error;
    }
    exports.toDiagnosticSeverty = toDiagnosticSeverty;
    function fromViewColumn(column) {
        var editorColumn = editor_1.Position.LEFT;
        if (typeof column !== 'number') {
        }
        else if (column === types.ViewColumn.Two) {
            editorColumn = editor_1.Position.CENTER;
        }
        else if (column === types.ViewColumn.Three) {
            editorColumn = editor_1.Position.RIGHT;
        }
        return editorColumn;
    }
    exports.fromViewColumn = fromViewColumn;
    function toViewColumn(position) {
        if (typeof position !== 'number') {
            return;
        }
        if (position === editor_1.Position.LEFT) {
            return types.ViewColumn.One;
        }
        else if (position === editor_1.Position.CENTER) {
            return types.ViewColumn.Two;
        }
        else if (position === editor_1.Position.RIGHT) {
            return types.ViewColumn.Three;
        }
    }
    exports.toViewColumn = toViewColumn;
    function fromFormattedString(value) {
        if (typeof value === 'string') {
            return { markdown: value };
        }
        else if (typeof value === 'object') {
            return { code: value };
        }
    }
    exports.fromFormattedString = fromFormattedString;
    function toFormattedString(value) {
        if (typeof value.code === 'string') {
            return value.code;
        }
        var markdown = value.markdown, text = value.text;
        return markdown || text || '<???>';
    }
    exports.toFormattedString = toFormattedString;
    function isMarkedStringArr(something) {
        return Array.isArray(something);
    }
    function fromMarkedStringOrMarkedStringArr(something) {
        if (isMarkedStringArr(something)) {
            return something.map(function (msg) { return fromFormattedString(msg); });
        }
        else if (something) {
            return [fromFormattedString(something)];
        }
        else {
            return [];
        }
    }
    function isRangeWithMessage(something) {
        return (typeof something.range !== 'undefined');
    }
    function isRangeWithMessageArr(something) {
        if (something.length === 0) {
            return true;
        }
        return isRangeWithMessage(something[0]) ? true : false;
    }
    function fromRangeOrRangeWithMessage(ranges) {
        if (isRangeWithMessageArr(ranges)) {
            return ranges.map(function (r) {
                return {
                    range: fromRange(r.range),
                    hoverMessage: fromMarkedStringOrMarkedStringArr(r.hoverMessage)
                };
            });
        }
        else {
            return ranges.map(function (r) {
                return {
                    range: fromRange(r)
                };
            });
        }
    }
    exports.fromRangeOrRangeWithMessage = fromRangeOrRangeWithMessage;
    exports.TextEdit = {
        from: function (edit) {
            return {
                text: edit.newText,
                range: fromRange(edit.range)
            };
        },
        to: function (edit) {
            return new types.TextEdit(toRange(edit.range), edit.text);
        }
    };
    var SymbolKind;
    (function (SymbolKind) {
        function from(kind) {
            switch (kind) {
                case types.SymbolKind.Method:
                    return 'method';
                case types.SymbolKind.Function:
                    return 'function';
                case types.SymbolKind.Constructor:
                    return 'constructor';
                case types.SymbolKind.Variable:
                    return 'variable';
                case types.SymbolKind.Class:
                    return 'class';
                case types.SymbolKind.Interface:
                    return 'interface';
                case types.SymbolKind.Namespace:
                    return 'namespace';
                case types.SymbolKind.Package:
                    return 'package';
                case types.SymbolKind.Module:
                    return 'module';
                case types.SymbolKind.Property:
                    return 'property';
                case types.SymbolKind.Enum:
                    return 'enum';
                case types.SymbolKind.String:
                    return 'string';
                case types.SymbolKind.File:
                    return 'file';
                case types.SymbolKind.Array:
                    return 'array';
                case types.SymbolKind.Number:
                    return 'number';
                case types.SymbolKind.Boolean:
                    return 'boolean';
                case types.SymbolKind.Object:
                    return 'object';
                case types.SymbolKind.Key:
                    return 'key';
                case types.SymbolKind.Null:
                    return 'null';
            }
            return 'property';
        }
        SymbolKind.from = from;
        function to(type) {
            switch (type) {
                case 'method':
                    return types.SymbolKind.Method;
                case 'function':
                    return types.SymbolKind.Function;
                case 'constructor':
                    return types.SymbolKind.Constructor;
                case 'variable':
                    return types.SymbolKind.Variable;
                case 'class':
                    return types.SymbolKind.Class;
                case 'interface':
                    return types.SymbolKind.Interface;
                case 'namespace':
                    return types.SymbolKind.Namespace;
                case 'package':
                    return types.SymbolKind.Package;
                case 'module':
                    return types.SymbolKind.Module;
                case 'property':
                    return types.SymbolKind.Property;
                case 'enum':
                    return types.SymbolKind.Enum;
                case 'string':
                    return types.SymbolKind.String;
                case 'file':
                    return types.SymbolKind.File;
                case 'array':
                    return types.SymbolKind.Array;
                case 'number':
                    return types.SymbolKind.Number;
                case 'boolean':
                    return types.SymbolKind.Boolean;
                case 'object':
                    return types.SymbolKind.Object;
                case 'key':
                    return types.SymbolKind.Key;
                case 'null':
                    return types.SymbolKind.Null;
            }
            return types.SymbolKind.Property;
        }
        SymbolKind.to = to;
    })(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
    var SymbolInformation;
    (function (SymbolInformation) {
        function fromOutlineEntry(entry) {
            return new types.SymbolInformation(entry.label, SymbolKind.to(entry.type), toRange(entry.range), undefined, entry.containerLabel);
        }
        SymbolInformation.fromOutlineEntry = fromOutlineEntry;
        function toOutlineEntry(symbol) {
            return {
                type: SymbolKind.from(symbol.kind),
                range: fromRange(symbol.location.range),
                containerLabel: symbol.containerName,
                label: symbol.name,
                icon: undefined,
            };
        }
        SymbolInformation.toOutlineEntry = toOutlineEntry;
    })(SymbolInformation = exports.SymbolInformation || (exports.SymbolInformation = {}));
    function fromSymbolInformation(info) {
        return {
            name: info.name,
            type: types.SymbolKind[info.kind || types.SymbolKind.Property].toLowerCase(),
            range: fromRange(info.location.range),
            resourceUri: info.location.uri,
            containerName: info.containerName,
            parameters: '',
        };
    }
    exports.fromSymbolInformation = fromSymbolInformation;
    function toSymbolInformation(bearing) {
        return new types.SymbolInformation(bearing.name, types.SymbolKind[bearing.type.charAt(0).toUpperCase() + bearing.type.substr(1)], toRange(bearing.range), bearing.resourceUri, bearing.containerName);
    }
    exports.toSymbolInformation = toSymbolInformation;
    exports.location = {
        from: function (value) {
            return {
                range: fromRange(value.range),
                resource: value.uri
            };
        },
        to: function (value) {
            return new types.Location(value.resource, toRange(value.range));
        }
    };
    function fromHover(hover) {
        return {
            range: fromRange(hover.range),
            htmlContent: hover.contents.map(fromFormattedString)
        };
    }
    exports.fromHover = fromHover;
    function toHover(info) {
        return new types.Hover(info.htmlContent.map(toFormattedString), toRange(info.range));
    }
    exports.toHover = toHover;
    function toDocumentHighlight(occurrence) {
        return new types.DocumentHighlight(toRange(occurrence.range), types.DocumentHighlightKind[occurrence.kind.charAt(0).toUpperCase() + occurrence.kind.substr(1)]);
    }
    exports.toDocumentHighlight = toDocumentHighlight;
    exports.CompletionItemKind = {
        from: function (kind) {
            switch (kind) {
                case types.CompletionItemKind.Function: return 'function';
                case types.CompletionItemKind.Constructor: return 'constructor';
                case types.CompletionItemKind.Field: return 'field';
                case types.CompletionItemKind.Variable: return 'variable';
                case types.CompletionItemKind.Class: return 'class';
                case types.CompletionItemKind.Interface: return 'interface';
                case types.CompletionItemKind.Module: return 'module';
                case types.CompletionItemKind.Property: return 'property';
                case types.CompletionItemKind.Unit: return 'unit';
                case types.CompletionItemKind.Value: return 'value';
                case types.CompletionItemKind.Enum: return 'enum';
                case types.CompletionItemKind.Keyword: return 'keyword';
                case types.CompletionItemKind.Snippet: return 'snippet';
                case types.CompletionItemKind.Text: return 'text';
                case types.CompletionItemKind.Color: return 'color';
                case types.CompletionItemKind.File: return 'file';
                case types.CompletionItemKind.Reference: return 'reference';
            }
            return 'text';
        },
        to: function (type) {
            if (!type) {
                return types.CompletionItemKind.Text;
            }
            else {
                return types.CompletionItemKind[type.charAt(0).toUpperCase() + type.substr(1)];
            }
        }
    };
    exports.Suggest = {
        from: function (item) {
            var suggestion = {
                label: item.label,
                codeSnippet: item.insertText || item.label,
                type: exports.CompletionItemKind.from(item.kind),
                typeLabel: item.detail,
                documentationLabel: item.documentation,
                sortText: item.sortText,
                filterText: item.filterText
            };
            return suggestion;
        },
        to: function (container, position, suggestion) {
            var result = new types.CompletionItem(suggestion.label);
            result.insertText = suggestion.codeSnippet;
            result.kind = exports.CompletionItemKind.to(suggestion.type);
            result.detail = suggestion.typeLabel;
            result.documentation = suggestion.documentationLabel;
            result.sortText = suggestion.sortText;
            result.filterText = suggestion.filterText;
            var overwriteBefore = (typeof suggestion.overwriteBefore === 'number') ? suggestion.overwriteBefore : container.currentWord.length;
            var startPosition = new types.Position(position.line, Math.max(0, position.character - overwriteBefore));
            var endPosition = position;
            if (typeof suggestion.overwriteAfter === 'number') {
                endPosition = new types.Position(position.line, position.character + suggestion.overwriteAfter);
            }
            result.textEdit = types.TextEdit.replace(new types.Range(startPosition, endPosition), suggestion.codeSnippet);
            return result;
        }
    };
    var SignatureHelp;
    (function (SignatureHelp) {
        function from(signatureHelp) {
            var result = {
                currentSignature: signatureHelp.activeSignature,
                currentParameter: signatureHelp.activeParameter,
                signatures: []
            };
            for (var _i = 0, _a = signatureHelp.signatures; _i < _a.length; _i++) {
                var signature = _a[_i];
                var signatureItem = {
                    label: signature.label,
                    documentation: signature.documentation,
                    parameters: []
                };
                var idx = 0;
                for (var _b = 0, _c = signature.parameters; _b < _c.length; _b++) {
                    var parameter = _c[_b];
                    var parameterItem = {
                        label: parameter.label,
                        documentation: parameter.documentation,
                    };
                    signatureItem.parameters.push(parameterItem);
                    idx = signature.label.indexOf(parameter.label, idx);
                    if (idx >= 0) {
                        parameterItem.signatureLabelOffset = idx;
                        idx += parameter.label.length;
                        parameterItem.signatureLabelEnd = idx;
                    }
                    else {
                        parameterItem.signatureLabelOffset = 0;
                        parameterItem.signatureLabelEnd = 0;
                    }
                }
                result.signatures.push(signatureItem);
            }
            return result;
        }
        SignatureHelp.from = from;
        function to(hints) {
            var result = new types.SignatureHelp();
            result.activeSignature = hints.currentSignature;
            result.activeParameter = hints.currentParameter;
            for (var _i = 0, _a = hints.signatures; _i < _a.length; _i++) {
                var signature = _a[_i];
                var signatureItem = new types.SignatureInformation(signature.label, signature.documentation);
                result.signatures.push(signatureItem);
                for (var _b = 0, _c = signature.parameters; _b < _c.length; _b++) {
                    var parameter = _c[_b];
                    var parameterItem = new types.ParameterInformation(parameter.label, parameter.documentation);
                    signatureItem.parameters.push(parameterItem);
                }
            }
            return result;
        }
        SignatureHelp.to = to;
    })(SignatureHelp = exports.SignatureHelp || (exports.SignatureHelp = {}));
    var Command;
    (function (Command) {
        var _cache = Object.create(null);
        var _idPool = 1;
        function from(command, context) {
            if (!command) {
                return;
            }
            var result = {
                id: command.command,
                title: command.title
            };
            if (!arrays_1.isFalsyOrEmpty(command.arguments)) {
                // keep command around
                var id_1 = command.command + "-no-args-wrapper-" + _idPool++;
                result.id = id_1;
                _cache[id_1] = command;
                var disposable1 = context.commands.registerCommand(id_1, function () { return (_a = context.commands).executeCommand.apply(_a, [command.command].concat(_cache[id_1].arguments)); var _a; });
                var disposable2 = { dispose: function () { delete _cache[id_1]; } };
                context.disposables.push(disposable1, disposable2);
            }
            return result;
        }
        Command.from = from;
        function to(command) {
            var result = _cache[command.id];
            if (!result) {
                result = {
                    command: command.id,
                    title: command.title
                };
            }
            return result;
        }
        Command.to = to;
    })(Command = exports.Command || (exports.Command = {}));
});
//# sourceMappingURL=extHostTypeConverters.js.map