define(["require", "exports", 'vs/base/common/event', 'vs/base/common/errors', 'vs/languages/typescript/common/lib/typescriptServices'], function (require, exports, event_1, errors_1, ts) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LanguageServiceDefaults = (function () {
        function LanguageServiceDefaults(compilerOptions, diagnosticsOptions) {
            this._onDidChange = new event_1.Emitter();
            this._extraLibs = Object.create(null);
            this.setCompilerOptions(compilerOptions);
            this.setDiagnosticsOptions(diagnosticsOptions);
        }
        Object.defineProperty(LanguageServiceDefaults.prototype, "onDidChange", {
            get: function () {
                return this._onDidChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LanguageServiceDefaults.prototype, "extraLibs", {
            get: function () {
                return Object.freeze(this._extraLibs);
            },
            enumerable: true,
            configurable: true
        });
        LanguageServiceDefaults.prototype.addExtraLib = function (content, filePath) {
            var _this = this;
            if (typeof filePath === 'undefined') {
                filePath = "ts:extralib-" + Date.now();
            }
            if (this._extraLibs[filePath]) {
                throw new Error(filePath + " already a extra lib");
            }
            this._extraLibs[filePath] = content;
            this._onDidChange.fire(this);
            return {
                dispose: function () {
                    if (delete _this._extraLibs[filePath]) {
                        _this._onDidChange.fire(_this);
                    }
                }
            };
        };
        Object.defineProperty(LanguageServiceDefaults.prototype, "compilerOptions", {
            get: function () {
                return this._compilerOptions;
            },
            enumerable: true,
            configurable: true
        });
        LanguageServiceDefaults.prototype.setCompilerOptions = function (options) {
            this._compilerOptions = options || Object.create(null);
            this._onDidChange.fire(this);
        };
        Object.defineProperty(LanguageServiceDefaults.prototype, "diagnosticsOptions", {
            get: function () {
                return this._diagnosticsOptions;
            },
            enumerable: true,
            configurable: true
        });
        LanguageServiceDefaults.prototype.setDiagnosticsOptions = function (options) {
            this._diagnosticsOptions = options || Object.create(null);
            this._onDidChange.fire(this);
        };
        return LanguageServiceDefaults;
    }());
    exports.LanguageServiceDefaults = LanguageServiceDefaults;
    exports.typeScriptDefaults = new LanguageServiceDefaults({ allowNonTsExtensions: true, target: ts.ScriptTarget.Latest }, { noSemanticValidation: false, noSyntaxValidation: false });
    exports.javaScriptDefaults = new LanguageServiceDefaults({ allowNonTsExtensions: true, allowJs: true, target: ts.ScriptTarget.Latest }, { noSemanticValidation: true, noSyntaxValidation: false });
    var TypeScriptWorkerProtocol = (function () {
        function TypeScriptWorkerProtocol() {
        }
        // --- model sync
        TypeScriptWorkerProtocol.prototype.acceptNewModel = function (data) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.acceptModelChanged = function (uri, events) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.acceptRemovedModel = function (uri) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.acceptDefaults = function (options, extraLibs) {
            throw errors_1.notImplemented();
        };
        // --- language features
        TypeScriptWorkerProtocol.prototype.getSyntacticDiagnostics = function (fileName) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getSemanticDiagnostics = function (fileName) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getCompletionsAtPosition = function (uri, offset) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getCompletionEntryDetails = function (fileName, position, entry) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getSignatureHelpItems = function (fileName, position) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getQuickInfoAtPosition = function (fileName, position) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getOccurrencesAtPosition = function (fileName, position) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getDefinitionAtPosition = function (fileName, position) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getReferencesAtPosition = function (fileName, position) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getNavigationBarItems = function (fileName) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getFormattingEditsForDocument = function (fileName, options) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getFormattingEditsForRange = function (fileName, start, end, options) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getFormattingEditsAfterKeystroke = function (fileName, postion, ch, options) {
            throw errors_1.notImplemented();
        };
        TypeScriptWorkerProtocol.prototype.getEmitOutput = function (fileName) {
            throw errors_1.notImplemented();
        };
        return TypeScriptWorkerProtocol;
    }());
    exports.TypeScriptWorkerProtocol = TypeScriptWorkerProtocol;
});
//# sourceMappingURL=typescript.js.map