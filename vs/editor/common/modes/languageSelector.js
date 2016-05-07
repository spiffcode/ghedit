/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/glob'], function (require, exports, glob_1) {
    'use strict';
    function matches(selection, uri, language) {
        return score(selection, uri, language) > 0;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = matches;
    function score(selector, uri, language) {
        if (Array.isArray(selector)) {
            // for each
            var values = selector.map(function (item) { return score(item, uri, language); });
            return Math.max.apply(Math, values);
        }
        else if (typeof selector === 'string') {
            // compare language id
            if (selector === language) {
                return 10;
            }
            else if (selector === '*') {
                return 5;
            }
            else {
                return 0;
            }
        }
        else if (selector) {
            var filter = selector;
            var value = 0;
            // language id
            if (filter.language) {
                if (filter.language === language) {
                    value += 10;
                }
                else if (filter.language === '*') {
                    value += 5;
                }
                else {
                    return 0;
                }
            }
            // scheme
            if (filter.scheme) {
                if (filter.scheme === uri.scheme) {
                    value += 10;
                }
                else {
                    return 0;
                }
            }
            // match fsPath with pattern
            if (filter.pattern) {
                if (filter.pattern === uri.fsPath) {
                    value += 10;
                }
                else if (glob_1.match(filter.pattern, uri.fsPath)) {
                    value += 5;
                }
                else {
                    return 0;
                }
            }
            return value;
        }
    }
    exports.score = score;
});
//# sourceMappingURL=languageSelector.js.map