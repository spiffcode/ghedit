define(["require", "exports", 'vs/editor/common/modes/languageFeatureRegistry'], function (require, exports, languageFeatureRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (IndentAction) {
        IndentAction[IndentAction["None"] = 0] = "None";
        IndentAction[IndentAction["Indent"] = 1] = "Indent";
        IndentAction[IndentAction["IndentOutdent"] = 2] = "IndentOutdent";
        IndentAction[IndentAction["Outdent"] = 3] = "Outdent";
    })(exports.IndentAction || (exports.IndentAction = {}));
    var IndentAction = exports.IndentAction;
    // --- feature registries ------
    exports.ReferenceSearchRegistry = new languageFeatureRegistry_1.default('referenceSupport');
    exports.RenameRegistry = new languageFeatureRegistry_1.default('renameSupport');
    exports.SuggestRegistry = new languageFeatureRegistry_1.default('suggestSupport');
    exports.ParameterHintsRegistry = new languageFeatureRegistry_1.default('parameterHintsSupport');
    exports.ExtraInfoRegistry = new languageFeatureRegistry_1.default('extraInfoSupport');
    exports.OutlineRegistry = new languageFeatureRegistry_1.default('outlineSupport');
    exports.OccurrencesRegistry = new languageFeatureRegistry_1.default('occurrencesSupport');
    exports.DeclarationRegistry = new languageFeatureRegistry_1.default('declarationSupport');
    exports.CodeLensRegistry = new languageFeatureRegistry_1.default('codeLensSupport');
    exports.QuickFixRegistry = new languageFeatureRegistry_1.default('quickFixSupport');
    exports.FormatRegistry = new languageFeatureRegistry_1.default('formattingSupport');
    exports.FormatOnTypeRegistry = new languageFeatureRegistry_1.default('formattingSupport');
});
//# sourceMappingURL=modes.js.map