var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/uri', 'vs/base/common/errors'], function (require, exports, uri_1, errors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Disposable = (function () {
        function Disposable(callOnDispose) {
            this._callOnDispose = callOnDispose;
        }
        Disposable.from = function () {
            var disposables = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                disposables[_i - 0] = arguments[_i];
            }
            return new Disposable(function () {
                if (disposables) {
                    for (var _i = 0, disposables_1 = disposables; _i < disposables_1.length; _i++) {
                        var disposable = disposables_1[_i];
                        if (disposable && typeof disposable.dispose === 'function') {
                            disposable.dispose();
                        }
                    }
                    disposables = undefined;
                }
            });
        };
        Disposable.prototype.dispose = function () {
            if (typeof this._callOnDispose === 'function') {
                this._callOnDispose();
                this._callOnDispose = undefined;
            }
        };
        return Disposable;
    }());
    exports.Disposable = Disposable;
    var Position = (function () {
        function Position(line, character) {
            if (line < 0) {
                throw errors_1.illegalArgument('line must be positive');
            }
            if (character < 0) {
                throw errors_1.illegalArgument('character must be positive');
            }
            this._line = line;
            this._character = character;
        }
        Position.Min = function () {
            var positions = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                positions[_i - 0] = arguments[_i];
            }
            var result = positions.pop();
            for (var _a = 0, positions_1 = positions; _a < positions_1.length; _a++) {
                var p = positions_1[_a];
                if (p.isBefore(result)) {
                    result = p;
                }
            }
            return result;
        };
        Position.Max = function () {
            var positions = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                positions[_i - 0] = arguments[_i];
            }
            var result = positions.pop();
            for (var _a = 0, positions_2 = positions; _a < positions_2.length; _a++) {
                var p = positions_2[_a];
                if (p.isAfter(result)) {
                    result = p;
                }
            }
            return result;
        };
        Object.defineProperty(Position.prototype, "line", {
            get: function () {
                return this._line;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Position.prototype, "character", {
            get: function () {
                return this._character;
            },
            enumerable: true,
            configurable: true
        });
        Position.prototype.isBefore = function (other) {
            if (this._line < other._line) {
                return true;
            }
            if (other._line < this._line) {
                return false;
            }
            return this._character < other._character;
        };
        Position.prototype.isBeforeOrEqual = function (other) {
            if (this._line < other._line) {
                return true;
            }
            if (other._line < this._line) {
                return false;
            }
            return this._character <= other._character;
        };
        Position.prototype.isAfter = function (other) {
            return !this.isBeforeOrEqual(other);
        };
        Position.prototype.isAfterOrEqual = function (other) {
            return !this.isBefore(other);
        };
        Position.prototype.isEqual = function (other) {
            return this._line === other._line && this._character === other._character;
        };
        Position.prototype.compareTo = function (other) {
            if (this._line < other._line) {
                return -1;
            }
            else if (this._line > other.line) {
                return 1;
            }
            else {
                // equal line
                if (this._character < other._character) {
                    return -1;
                }
                else if (this._character > other._character) {
                    return 1;
                }
                else {
                    // equal line and character
                    return 0;
                }
            }
        };
        Position.prototype.translate = function (lineDelta, characterDelta) {
            if (lineDelta === void 0) { lineDelta = 0; }
            if (characterDelta === void 0) { characterDelta = 0; }
            if (lineDelta === 0 && characterDelta === 0) {
                return this;
            }
            return new Position(this.line + lineDelta, this.character + characterDelta);
        };
        Position.prototype.with = function (line, character) {
            if (line === void 0) { line = this.line; }
            if (character === void 0) { character = this.character; }
            if (line === this.line && character === this.character) {
                return this;
            }
            return new Position(line, character);
        };
        Position.prototype.toJSON = function () {
            return { line: this.line, character: this.character };
        };
        return Position;
    }());
    exports.Position = Position;
    var Range = (function () {
        function Range(startLineOrStart, startColumnOrEnd, endLine, endColumn) {
            var start;
            var end;
            if (typeof startLineOrStart === 'number' && typeof startColumnOrEnd === 'number' && typeof endLine === 'number' && typeof endColumn === 'number') {
                start = new Position(startLineOrStart, startColumnOrEnd);
                end = new Position(endLine, endColumn);
            }
            else if (startLineOrStart instanceof Position && startColumnOrEnd instanceof Position) {
                start = startLineOrStart;
                end = startColumnOrEnd;
            }
            if (!start || !end) {
                throw new Error('Invalid arguments');
            }
            if (start.isBefore(end)) {
                this._start = start;
                this._end = end;
            }
            else {
                this._start = end;
                this._end = start;
            }
        }
        Object.defineProperty(Range.prototype, "start", {
            get: function () {
                return this._start;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Range.prototype, "end", {
            get: function () {
                return this._end;
            },
            enumerable: true,
            configurable: true
        });
        Range.prototype.contains = function (positionOrRange) {
            if (positionOrRange instanceof Range) {
                return this.contains(positionOrRange._start)
                    && this.contains(positionOrRange._end);
            }
            else if (positionOrRange instanceof Position) {
                if (positionOrRange.isBefore(this._start)) {
                    return false;
                }
                if (this._end.isBefore(positionOrRange)) {
                    return false;
                }
                return true;
            }
            return false;
        };
        Range.prototype.isEqual = function (other) {
            return this._start.isEqual(other._start) && this._end.isEqual(other._end);
        };
        Range.prototype.intersection = function (other) {
            var start = Position.Max(other.start, this._start);
            var end = Position.Min(other.end, this._end);
            if (start.isAfter(end)) {
                // this happens when there is no overlap:
                // |-----|
                //          |----|
                return;
            }
            return new Range(start, end);
        };
        Range.prototype.union = function (other) {
            if (this.contains(other)) {
                return this;
            }
            else if (other.contains(this)) {
                return other;
            }
            var start = Position.Min(other.start, this._start);
            var end = Position.Max(other.end, this.end);
            return new Range(start, end);
        };
        Object.defineProperty(Range.prototype, "isEmpty", {
            get: function () {
                return this._start.isEqual(this._end);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Range.prototype, "isSingleLine", {
            get: function () {
                return this._start.line === this._end.line;
            },
            enumerable: true,
            configurable: true
        });
        Range.prototype.with = function (start, end) {
            if (start === void 0) { start = this.start; }
            if (end === void 0) { end = this.end; }
            if (start.isEqual(this._start) && end.isEqual(this.end)) {
                return this;
            }
            return new Range(start, end);
        };
        Range.prototype.toJSON = function () {
            return [this.start, this.end];
        };
        return Range;
    }());
    exports.Range = Range;
    var Selection = (function (_super) {
        __extends(Selection, _super);
        function Selection(anchorLineOrAnchor, anchorColumnOrActive, activeLine, activeColumn) {
            var anchor;
            var active;
            if (typeof anchorLineOrAnchor === 'number' && typeof anchorColumnOrActive === 'number' && typeof activeLine === 'number' && typeof activeColumn === 'number') {
                anchor = new Position(anchorLineOrAnchor, anchorColumnOrActive);
                active = new Position(activeLine, activeColumn);
            }
            else if (anchorLineOrAnchor instanceof Position && anchorColumnOrActive instanceof Position) {
                anchor = anchorLineOrAnchor;
                active = anchorColumnOrActive;
            }
            if (!anchor || !active) {
                throw new Error('Invalid arguments');
            }
            _super.call(this, anchor, active);
            this._anchor = anchor;
            this._active = active;
        }
        Object.defineProperty(Selection.prototype, "anchor", {
            get: function () {
                return this._anchor;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Selection.prototype, "active", {
            get: function () {
                return this._active;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Selection.prototype, "isReversed", {
            get: function () {
                return this._anchor === this._end;
            },
            enumerable: true,
            configurable: true
        });
        Selection.prototype.toJSON = function () {
            return {
                start: this.start,
                end: this.end,
                active: this.active,
                anchor: this.anchor
            };
        };
        return Selection;
    }(Range));
    exports.Selection = Selection;
    var TextEdit = (function () {
        function TextEdit(range, newText) {
            this.range = range;
            this.newText = newText;
        }
        TextEdit.replace = function (range, newText) {
            return new TextEdit(range, newText);
        };
        TextEdit.insert = function (position, newText) {
            return TextEdit.replace(new Range(position, position), newText);
        };
        TextEdit.delete = function (range) {
            return TextEdit.replace(range, '');
        };
        Object.defineProperty(TextEdit.prototype, "range", {
            get: function () {
                return this._range;
            },
            set: function (value) {
                if (!value) {
                    throw errors_1.illegalArgument('range');
                }
                this._range = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextEdit.prototype, "newText", {
            get: function () {
                return this._newText || '';
            },
            set: function (value) {
                this._newText = value;
            },
            enumerable: true,
            configurable: true
        });
        TextEdit.prototype.toJSON = function () {
            return {
                range: this.range,
                newText: this.newText
            };
        };
        return TextEdit;
    }());
    exports.TextEdit = TextEdit;
    var Uri = (function (_super) {
        __extends(Uri, _super);
        function Uri() {
            _super.apply(this, arguments);
        }
        return Uri;
    }(uri_1.default));
    exports.Uri = Uri;
    var WorkspaceEdit = (function () {
        function WorkspaceEdit() {
            this._values = [];
            this._index = Object.create(null);
        }
        WorkspaceEdit.prototype.replace = function (uri, range, newText) {
            var edit = new TextEdit(range, newText);
            var array = this.get(uri);
            if (array) {
                array.push(edit);
            }
            else {
                this.set(uri, [edit]);
            }
        };
        WorkspaceEdit.prototype.insert = function (resource, position, newText) {
            this.replace(resource, new Range(position, position), newText);
        };
        WorkspaceEdit.prototype.delete = function (resource, range) {
            this.replace(resource, range, '');
        };
        WorkspaceEdit.prototype.has = function (uri) {
            return typeof this._index[uri.toString()] !== 'undefined';
        };
        WorkspaceEdit.prototype.set = function (uri, edits) {
            var idx = this._index[uri.toString()];
            if (typeof idx === 'undefined') {
                var newLen = this._values.push([uri, edits]);
                this._index[uri.toString()] = newLen - 1;
            }
            else {
                this._values[idx][1] = edits;
            }
        };
        WorkspaceEdit.prototype.get = function (uri) {
            var idx = this._index[uri.toString()];
            return typeof idx !== 'undefined' && this._values[idx][1];
        };
        WorkspaceEdit.prototype.entries = function () {
            return this._values;
        };
        Object.defineProperty(WorkspaceEdit.prototype, "size", {
            get: function () {
                return this._values.length;
            },
            enumerable: true,
            configurable: true
        });
        WorkspaceEdit.prototype.toJSON = function () {
            return this._values;
        };
        return WorkspaceEdit;
    }());
    exports.WorkspaceEdit = WorkspaceEdit;
    (function (DiagnosticSeverity) {
        DiagnosticSeverity[DiagnosticSeverity["Hint"] = 3] = "Hint";
        DiagnosticSeverity[DiagnosticSeverity["Information"] = 2] = "Information";
        DiagnosticSeverity[DiagnosticSeverity["Warning"] = 1] = "Warning";
        DiagnosticSeverity[DiagnosticSeverity["Error"] = 0] = "Error";
    })(exports.DiagnosticSeverity || (exports.DiagnosticSeverity = {}));
    var DiagnosticSeverity = exports.DiagnosticSeverity;
    var Location = (function () {
        function Location(uri, range) {
            this.uri = uri;
            if (range instanceof Range) {
                this.range = range;
            }
            else if (range instanceof Position) {
                this.range = new Range(range, range);
            }
            else {
                throw new Error('Illegal argument');
            }
        }
        Location.prototype.toJSON = function () {
            return {
                uri: this.uri,
                range: this.range
            };
        };
        return Location;
    }());
    exports.Location = Location;
    var Diagnostic = (function () {
        function Diagnostic(range, message, severity) {
            if (severity === void 0) { severity = DiagnosticSeverity.Error; }
            this.range = range;
            this.message = message;
            this.severity = severity;
        }
        Diagnostic.prototype.toJSON = function () {
            return {
                severity: DiagnosticSeverity[this.severity],
                message: this.message,
                range: this.range,
                source: this.source,
                code: this.code,
            };
        };
        return Diagnostic;
    }());
    exports.Diagnostic = Diagnostic;
    var Hover = (function () {
        function Hover(contents, range) {
            if (!contents) {
                throw new Error('Illegal argument');
            }
            if (Array.isArray(contents)) {
                this.contents = contents;
            }
            else {
                this.contents = [contents];
            }
            this.range = range;
        }
        return Hover;
    }());
    exports.Hover = Hover;
    (function (DocumentHighlightKind) {
        DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
        DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
        DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
    })(exports.DocumentHighlightKind || (exports.DocumentHighlightKind = {}));
    var DocumentHighlightKind = exports.DocumentHighlightKind;
    var DocumentHighlight = (function () {
        function DocumentHighlight(range, kind) {
            if (kind === void 0) { kind = DocumentHighlightKind.Text; }
            this.range = range;
            this.kind = kind;
        }
        DocumentHighlight.prototype.toJSON = function () {
            return {
                range: this.range,
                kind: DocumentHighlightKind[this.kind]
            };
        };
        return DocumentHighlight;
    }());
    exports.DocumentHighlight = DocumentHighlight;
    (function (SymbolKind) {
        SymbolKind[SymbolKind["File"] = 0] = "File";
        SymbolKind[SymbolKind["Module"] = 1] = "Module";
        SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
        SymbolKind[SymbolKind["Package"] = 3] = "Package";
        SymbolKind[SymbolKind["Class"] = 4] = "Class";
        SymbolKind[SymbolKind["Method"] = 5] = "Method";
        SymbolKind[SymbolKind["Property"] = 6] = "Property";
        SymbolKind[SymbolKind["Field"] = 7] = "Field";
        SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
        SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
        SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
        SymbolKind[SymbolKind["Function"] = 11] = "Function";
        SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
        SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
        SymbolKind[SymbolKind["String"] = 14] = "String";
        SymbolKind[SymbolKind["Number"] = 15] = "Number";
        SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
        SymbolKind[SymbolKind["Array"] = 17] = "Array";
        SymbolKind[SymbolKind["Object"] = 18] = "Object";
        SymbolKind[SymbolKind["Key"] = 19] = "Key";
        SymbolKind[SymbolKind["Null"] = 20] = "Null";
    })(exports.SymbolKind || (exports.SymbolKind = {}));
    var SymbolKind = exports.SymbolKind;
    var SymbolInformation = (function () {
        function SymbolInformation(name, kind, range, uri, containerName) {
            this.name = name;
            this.kind = kind;
            this.location = new Location(uri, range);
            this.containerName = containerName;
        }
        SymbolInformation.prototype.toJSON = function () {
            return {
                name: this.name,
                kind: SymbolKind[this.kind],
                location: this.location,
                containerName: this.containerName
            };
        };
        return SymbolInformation;
    }());
    exports.SymbolInformation = SymbolInformation;
    var CodeLens = (function () {
        function CodeLens(range, command) {
            this.range = range;
            this.command = command;
        }
        Object.defineProperty(CodeLens.prototype, "isResolved", {
            get: function () {
                return !!this.command;
            },
            enumerable: true,
            configurable: true
        });
        return CodeLens;
    }());
    exports.CodeLens = CodeLens;
    var ParameterInformation = (function () {
        function ParameterInformation(label, documentation) {
            this.label = label;
            this.documentation = documentation;
        }
        return ParameterInformation;
    }());
    exports.ParameterInformation = ParameterInformation;
    var SignatureInformation = (function () {
        function SignatureInformation(label, documentation) {
            this.label = label;
            this.documentation = documentation;
            this.parameters = [];
        }
        return SignatureInformation;
    }());
    exports.SignatureInformation = SignatureInformation;
    var SignatureHelp = (function () {
        function SignatureHelp() {
            this.signatures = [];
        }
        return SignatureHelp;
    }());
    exports.SignatureHelp = SignatureHelp;
    (function (CompletionItemKind) {
        CompletionItemKind[CompletionItemKind["Text"] = 0] = "Text";
        CompletionItemKind[CompletionItemKind["Method"] = 1] = "Method";
        CompletionItemKind[CompletionItemKind["Function"] = 2] = "Function";
        CompletionItemKind[CompletionItemKind["Constructor"] = 3] = "Constructor";
        CompletionItemKind[CompletionItemKind["Field"] = 4] = "Field";
        CompletionItemKind[CompletionItemKind["Variable"] = 5] = "Variable";
        CompletionItemKind[CompletionItemKind["Class"] = 6] = "Class";
        CompletionItemKind[CompletionItemKind["Interface"] = 7] = "Interface";
        CompletionItemKind[CompletionItemKind["Module"] = 8] = "Module";
        CompletionItemKind[CompletionItemKind["Property"] = 9] = "Property";
        CompletionItemKind[CompletionItemKind["Unit"] = 10] = "Unit";
        CompletionItemKind[CompletionItemKind["Value"] = 11] = "Value";
        CompletionItemKind[CompletionItemKind["Enum"] = 12] = "Enum";
        CompletionItemKind[CompletionItemKind["Keyword"] = 13] = "Keyword";
        CompletionItemKind[CompletionItemKind["Snippet"] = 14] = "Snippet";
        CompletionItemKind[CompletionItemKind["Color"] = 15] = "Color";
        CompletionItemKind[CompletionItemKind["File"] = 16] = "File";
        CompletionItemKind[CompletionItemKind["Reference"] = 17] = "Reference";
    })(exports.CompletionItemKind || (exports.CompletionItemKind = {}));
    var CompletionItemKind = exports.CompletionItemKind;
    var CompletionItem = (function () {
        function CompletionItem(label) {
            this.label = label;
        }
        CompletionItem.prototype.toJSON = function () {
            return {
                label: this.label,
                kind: CompletionItemKind[this.kind],
                detail: this.detail,
                documentation: this.documentation,
                sortText: this.sortText,
                filterText: this.filterText,
                insertText: this.insertText,
                textEdit: this.textEdit
            };
        };
        return CompletionItem;
    }());
    exports.CompletionItem = CompletionItem;
    var CompletionList = (function () {
        function CompletionList(items, isIncomplete) {
            if (items === void 0) { items = []; }
            if (isIncomplete === void 0) { isIncomplete = false; }
            this.items = items;
            this.isIncomplete = isIncomplete;
        }
        return CompletionList;
    }());
    exports.CompletionList = CompletionList;
    (function (ViewColumn) {
        ViewColumn[ViewColumn["One"] = 1] = "One";
        ViewColumn[ViewColumn["Two"] = 2] = "Two";
        ViewColumn[ViewColumn["Three"] = 3] = "Three";
    })(exports.ViewColumn || (exports.ViewColumn = {}));
    var ViewColumn = exports.ViewColumn;
    (function (StatusBarAlignment) {
        StatusBarAlignment[StatusBarAlignment["Left"] = 1] = "Left";
        StatusBarAlignment[StatusBarAlignment["Right"] = 2] = "Right";
    })(exports.StatusBarAlignment || (exports.StatusBarAlignment = {}));
    var StatusBarAlignment = exports.StatusBarAlignment;
    (function (EndOfLine) {
        EndOfLine[EndOfLine["LF"] = 1] = "LF";
        EndOfLine[EndOfLine["CRLF"] = 2] = "CRLF";
    })(exports.EndOfLine || (exports.EndOfLine = {}));
    var EndOfLine = exports.EndOfLine;
});
//# sourceMappingURL=extHostTypes.js.map