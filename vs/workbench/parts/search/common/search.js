/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/errors', 'vs/editor/common/editorCommonExtensions'], function (require, exports, winjs_base_1, errors_1, editorCommonExtensions_1) {
    'use strict';
    var NavigateTypesSupportRegistry;
    (function (NavigateTypesSupportRegistry) {
        var _supports = [];
        function register(support) {
            if (support) {
                _supports.push(support);
            }
            return {
                dispose: function () {
                    if (support) {
                        var idx = _supports.indexOf(support);
                        if (idx >= 0) {
                            _supports.splice(idx, 1);
                            support = undefined;
                        }
                    }
                }
            };
        }
        NavigateTypesSupportRegistry.register = register;
        function all() {
            return _supports.slice(0);
        }
        NavigateTypesSupportRegistry.all = all;
    })(NavigateTypesSupportRegistry = exports.NavigateTypesSupportRegistry || (exports.NavigateTypesSupportRegistry = {}));
    function getNavigateToItems(query) {
        var promises = NavigateTypesSupportRegistry.all().map(function (support) {
            return support.getNavigateToItems(query).then(function (value) { return value; }, errors_1.onUnexpectedError);
        });
        return winjs_base_1.TPromise.join(promises).then(function (all) {
            var result = [];
            for (var _i = 0, all_1 = all; _i < all_1.length; _i++) {
                var bearings = all_1[_i];
                if (Array.isArray(bearings)) {
                    result.push.apply(result, bearings);
                }
            }
            return result;
        });
    }
    exports.getNavigateToItems = getNavigateToItems;
    editorCommonExtensions_1.CommonEditorRegistry.registerLanguageCommand('_executeWorkspaceSymbolProvider', function (accessor, args) {
        var query = args.query;
        if (typeof query !== 'string') {
            throw errors_1.illegalArgument();
        }
        return getNavigateToItems(query);
    });
});
//# sourceMappingURL=search.js.map