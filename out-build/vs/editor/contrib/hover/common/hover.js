/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/arrays', 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes'], function (require, exports, arrays_1, errors_1, winjs_base_1, editorCommonExtensions_1, modes_1) {
    'use strict';
    function getExtraInfoAtPosition(model, position) {
        var resource = model.getAssociatedResource();
        var supports = modes_1.ExtraInfoRegistry.ordered(model);
        var values = [];
        var promises = supports.map(function (support, idx) {
            return support.computeInfo(resource, position).then(function (result) {
                if (result) {
                    var hasRange = (typeof result.range !== 'undefined');
                    var hasValue = (typeof result.value !== 'undefined');
                    var hasHtmlContent = (typeof result.htmlContent !== 'undefined' && result.htmlContent && result.htmlContent.length > 0);
                    if (hasRange && (hasValue || hasHtmlContent)) {
                        values[idx] = result;
                    }
                }
            }, function (err) {
                errors_1.onUnexpectedError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function () { return arrays_1.coalesce(values); });
    }
    exports.getExtraInfoAtPosition = getExtraInfoAtPosition;
    editorCommonExtensions_1.CommonEditorRegistry.registerDefaultLanguageCommand('_executeHoverProvider', getExtraInfoAtPosition);
});
//# sourceMappingURL=hover.js.map