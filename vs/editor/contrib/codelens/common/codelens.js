/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes', 'vs/editor/common/services/modelService'], function (require, exports, errors_1, uri_1, winjs_base_1, editorCommonExtensions_1, modes_1, modelService_1) {
    'use strict';
    function getCodeLensData(model) {
        var symbols = [];
        var promises = modes_1.CodeLensRegistry.all(model).map(function (support) {
            return support.findCodeLensSymbols(model.getAssociatedResource()).then(function (result) {
                if (!Array.isArray(result)) {
                    return;
                }
                for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                    var symbol = result_1[_i];
                    symbols.push({ symbol: symbol, support: support });
                }
            }, function (err) {
                if (!errors_1.isPromiseCanceledError(err)) {
                    errors_1.onUnexpectedError(err);
                }
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function () { return symbols; });
    }
    exports.getCodeLensData = getCodeLensData;
    editorCommonExtensions_1.CommonEditorRegistry.registerLanguageCommand('_executeCodeLensProvider', function (accessor, args) {
        var resource = args.resource;
        if (!(resource instanceof uri_1.default)) {
            throw errors_1.illegalArgument();
        }
        var model = accessor.get(modelService_1.IModelService).getModel(resource);
        if (!model) {
            throw errors_1.illegalArgument();
        }
        return getCodeLensData(model);
    });
});
//# sourceMappingURL=codelens.js.map