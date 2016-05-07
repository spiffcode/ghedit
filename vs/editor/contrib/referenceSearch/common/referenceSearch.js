/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes'], function (require, exports, errors_1, winjs_base_1, editorCommonExtensions_1, modes_1) {
    'use strict';
    function findReferences(model, position) {
        // collect references from all providers
        var promises = modes_1.ReferenceSearchRegistry.ordered(model).map(function (provider) {
            return provider.findReferences(model.getAssociatedResource(), position, true).then(function (result) {
                if (Array.isArray(result)) {
                    return result;
                }
            }, function (err) {
                errors_1.onUnexpectedError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function (references) {
            var result = [];
            for (var _i = 0, references_1 = references; _i < references_1.length; _i++) {
                var ref = references_1[_i];
                if (ref) {
                    result.push.apply(result, ref);
                }
            }
            return result;
        });
    }
    exports.findReferences = findReferences;
    editorCommonExtensions_1.CommonEditorRegistry.registerDefaultLanguageCommand('_executeReferenceProvider', findReferences);
});
//# sourceMappingURL=referenceSearch.js.map