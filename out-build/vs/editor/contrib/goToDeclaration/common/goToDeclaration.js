/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes'], function (require, exports, errors_1, winjs_base_1, editorCommonExtensions_1, modes_1) {
    'use strict';
    function getDeclarationsAtPosition(model, position) {
        var resource = model.getAssociatedResource();
        var provider = modes_1.DeclarationRegistry.ordered(model);
        // get results
        var promises = provider.map(function (provider, idx) {
            return provider.findDeclaration(resource, position).then(function (result) {
                return result;
            }, function (err) {
                errors_1.onUnexpectedError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function (allReferences) {
            var result = [];
            for (var _i = 0, allReferences_1 = allReferences; _i < allReferences_1.length; _i++) {
                var references = allReferences_1[_i];
                if (Array.isArray(references)) {
                    result.push.apply(result, references);
                }
                else if (references) {
                    result.push(references);
                }
            }
            return result;
        });
    }
    exports.getDeclarationsAtPosition = getDeclarationsAtPosition;
    editorCommonExtensions_1.CommonEditorRegistry.registerDefaultLanguageCommand('_executeDefinitionProvider', getDeclarationsAtPosition);
});
//# sourceMappingURL=goToDeclaration.js.map