/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/editor/common/core/range', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes', 'vs/editor/common/services/modelService'], function (require, exports, errors_1, uri_1, winjs_base_1, range_1, editorCommonExtensions_1, modes_1, modelService_1) {
    'use strict';
    function getQuickFixes(model, range) {
        var quickFixes = [];
        var idPool = 0;
        var promises = modes_1.QuickFixRegistry.all(model).map(function (support) {
            return support.getQuickFixes(model.getAssociatedResource(), range).then(function (result) {
                if (!Array.isArray(result)) {
                    return;
                }
                for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                    var fix = result_1[_i];
                    quickFixes.push({
                        command: fix.command,
                        score: fix.score,
                        id: "quickfix_#" + idPool++,
                        support: support
                    });
                }
            }, function (err) {
                errors_1.onUnexpectedError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function () { return quickFixes; });
    }
    exports.getQuickFixes = getQuickFixes;
    editorCommonExtensions_1.CommonEditorRegistry.registerLanguageCommand('_executeCodeActionProvider', function (accessor, args) {
        var resource = args.resource, range = args.range;
        if (!(resource instanceof uri_1.default) || !range_1.Range.isIRange(range)) {
            throw errors_1.illegalArgument();
        }
        var model = accessor.get(modelService_1.IModelService).getModel(resource);
        if (!model) {
            throw errors_1.illegalArgument();
        }
        return getQuickFixes(model, range);
    });
});
//# sourceMappingURL=quickFix.js.map