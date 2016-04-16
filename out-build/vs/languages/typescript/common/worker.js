var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/languages/typescript/common/lib/typescriptServices', 'vs/base/common/uri', 'vs/base/common/winjs.base', './typescript', 'vs/editor/common/model/mirrorModel2', 'vs/text!vs/languages/typescript/common/lib/lib.d.ts', 'vs/text!vs/languages/typescript/common/lib/lib.es6.d.ts'], function (require, exports, ts, uri_1, winjs_base_1, typescript_1, mirrorModel2_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var TypeScriptWorker = (function (_super) {
        __extends(TypeScriptWorker, _super);
        function TypeScriptWorker() {
            _super.apply(this, arguments);
            // --- model sync -----------------------
            this._models = Object.create(null);
            this._extraLibs = Object.create(null);
            this._languageService = ts.createLanguageService(this);
        }
        TypeScriptWorker.prototype.acceptNewModel = function (data) {
            this._models[data.url] = new mirrorModel2_1.MirrorModel2(uri_1.default.parse(data.url), data.value.lines, data.value.EOL, data.versionId);
        };
        TypeScriptWorker.prototype.acceptModelChanged = function (uri, events) {
            var model = this._models[uri];
            if (model) {
                model.onEvents(events);
            }
        };
        TypeScriptWorker.prototype.acceptRemovedModel = function (uri) {
            delete this._models[uri];
        };
        // --- default ---------
        TypeScriptWorker.prototype.acceptDefaults = function (options, extraLibs) {
            this._compilerOptions = options;
            this._extraLibs = extraLibs;
            return;
        };
        // --- language service host ---------------
        TypeScriptWorker.prototype.getCompilationSettings = function () {
            return this._compilerOptions;
        };
        TypeScriptWorker.prototype.getScriptFileNames = function () {
            return Object.keys(this._models).concat(Object.keys(this._extraLibs));
        };
        TypeScriptWorker.prototype.getScriptVersion = function (fileName) {
            if (fileName in this._models) {
                // version changes on type
                return this._models[fileName].version.toString();
            }
            else if (this.isDefaultLibFileName(fileName) || fileName in this._extraLibs) {
                // extra lib and default lib are static
                return '1';
            }
        };
        TypeScriptWorker.prototype.getScriptSnapshot = function (fileName) {
            var text;
            if (fileName in this._models) {
                // a true editor model
                text = this._models[fileName].getText();
            }
            else if (fileName in this._extraLibs) {
                // static extra lib
                text = this._extraLibs[fileName];
            }
            else if (this.isDefaultLibFileName(fileName)) {
                // load lib(.es6)?.d.ts as module
                text = require(fileName);
            }
            else {
                return;
            }
            return {
                getText: function (start, end) { return text.substring(start, end); },
                getLength: function () { return text.length; },
                getChangeRange: function () { return undefined; }
            };
        };
        TypeScriptWorker.prototype.getCurrentDirectory = function () {
            return '';
        };
        TypeScriptWorker.prototype.getDefaultLibFileName = function (options) {
            // TODO@joh support lib.es7.d.ts
            return options.target > ts.ScriptTarget.ES5
                ? 'vs/text!vs/languages/typescript/common/lib/lib.es6.d.ts'
                : 'vs/text!vs/languages/typescript/common/lib/lib.d.ts';
        };
        TypeScriptWorker.prototype.isDefaultLibFileName = function (fileName) {
            return fileName === this.getDefaultLibFileName(this._compilerOptions);
        };
        // --- language features
        TypeScriptWorker.prototype.getSyntacticDiagnostics = function (fileName) {
            var diagnostics = this._languageService.getSyntacticDiagnostics(fileName);
            diagnostics.forEach(function (diag) { return diag.file = undefined; }); // diag.file cannot be JSON'yfied
            return winjs_base_1.TPromise.as(diagnostics);
        };
        TypeScriptWorker.prototype.getSemanticDiagnostics = function (fileName) {
            var diagnostics = this._languageService.getSemanticDiagnostics(fileName);
            diagnostics.forEach(function (diag) { return diag.file = undefined; }); // diag.file cannot be JSON'yfied
            return winjs_base_1.TPromise.as(diagnostics);
        };
        TypeScriptWorker.prototype.getCompilerOptionsDiagnostics = function (fileName) {
            var diagnostics = this._languageService.getCompilerOptionsDiagnostics();
            diagnostics.forEach(function (diag) { return diag.file = undefined; }); // diag.file cannot be JSON'yfied
            return winjs_base_1.TPromise.as(diagnostics);
        };
        TypeScriptWorker.prototype.getCompletionsAtPosition = function (fileName, position) {
            return winjs_base_1.TPromise.as(this._languageService.getCompletionsAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getCompletionEntryDetails = function (fileName, position, entry) {
            return winjs_base_1.TPromise.as(this._languageService.getCompletionEntryDetails(fileName, position, entry));
        };
        TypeScriptWorker.prototype.getSignatureHelpItems = function (fileName, position) {
            return winjs_base_1.TPromise.as(this._languageService.getSignatureHelpItems(fileName, position));
        };
        TypeScriptWorker.prototype.getQuickInfoAtPosition = function (fileName, position) {
            return winjs_base_1.TPromise.as(this._languageService.getQuickInfoAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getOccurrencesAtPosition = function (fileName, position) {
            return winjs_base_1.TPromise.as(this._languageService.getOccurrencesAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getDefinitionAtPosition = function (fileName, position) {
            return winjs_base_1.TPromise.as(this._languageService.getDefinitionAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getReferencesAtPosition = function (fileName, position) {
            return winjs_base_1.TPromise.as(this._languageService.getReferencesAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getNavigationBarItems = function (fileName) {
            return winjs_base_1.TPromise.as(this._languageService.getNavigationBarItems(fileName));
        };
        TypeScriptWorker.prototype.getFormattingEditsForDocument = function (fileName, options) {
            return winjs_base_1.TPromise.as(this._languageService.getFormattingEditsForDocument(fileName, options));
        };
        TypeScriptWorker.prototype.getFormattingEditsForRange = function (fileName, start, end, options) {
            return winjs_base_1.TPromise.as(this._languageService.getFormattingEditsForRange(fileName, start, end, options));
        };
        TypeScriptWorker.prototype.getFormattingEditsAfterKeystroke = function (fileName, postion, ch, options) {
            return winjs_base_1.TPromise.as(this._languageService.getFormattingEditsAfterKeystroke(fileName, postion, ch, options));
        };
        TypeScriptWorker.prototype.getEmitOutput = function (fileName) {
            return winjs_base_1.TPromise.as(this._languageService.getEmitOutput(fileName));
        };
        return TypeScriptWorker;
    }(typescript_1.TypeScriptWorkerProtocol));
    function create() {
        return new TypeScriptWorker();
    }
    exports.create = create;
});
//# sourceMappingURL=worker.js.map