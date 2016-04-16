define(["require", "exports", 'vs/base/common/strings', 'vs/nls!vs/languages/json/common/contributions/globPatternContribution'], function (require, exports, Strings, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var globProperties = [
        { type: 'value', label: nls.localize(0, null), codeSnippet: '"**/*.{{extension}}": true', documentationLabel: nls.localize(1, null) },
        { type: 'value', label: nls.localize(2, null), codeSnippet: '"**/*.{ext1,ext2,ext3}": true', documentationLabel: nls.localize(3, null) },
        { type: 'value', label: nls.localize(4, null), codeSnippet: '"**/*.{{source-extension}}": { "when": "$(basename).{{target-extension}}" }', documentationLabel: nls.localize(5, null) },
        { type: 'value', label: nls.localize(6, null), codeSnippet: '"{{name}}": true', documentationLabel: nls.localize(7, null) },
        { type: 'value', label: nls.localize(8, null), codeSnippet: '"{folder1,folder2,folder3}": true', documentationLabel: nls.localize(9, null) },
        { type: 'value', label: nls.localize(10, null), codeSnippet: '"**/{{name}}": true', documentationLabel: nls.localize(11, null) },
    ];
    var globValues = [
        { type: 'value', label: nls.localize(12, null), codeSnippet: 'true', documentationLabel: nls.localize(13, null) },
        { type: 'value', label: nls.localize(14, null), codeSnippet: 'false', documentationLabel: nls.localize(15, null) },
        { type: 'value', label: nls.localize(16, null), codeSnippet: '{ "when": "$(basename).{{extension}}" }', documentationLabel: nls.localize(17, null) }
    ];
    var GlobPatternContribution = (function () {
        function GlobPatternContribution() {
        }
        GlobPatternContribution.prototype.isSettingsFile = function (resource) {
            var path = resource.path;
            return Strings.endsWith(path, '/settings.json');
        };
        GlobPatternContribution.prototype.collectDefaultSuggestions = function (resource, result) {
            return null;
        };
        GlobPatternContribution.prototype.collectPropertySuggestions = function (resource, location, currentWord, addValue, isLast, result) {
            if (this.isSettingsFile(resource) && (location.matches(['files.exclude']) || location.matches(['search.exclude']))) {
                globProperties.forEach(function (e) { return result.add(e); });
            }
            return null;
        };
        GlobPatternContribution.prototype.collectValueSuggestions = function (resource, location, currentKey, result) {
            if (this.isSettingsFile(resource) && (location.matches(['files.exclude']) || location.matches(['search.exclude']))) {
                globValues.forEach(function (e) { return result.add(e); });
            }
            return null;
        };
        GlobPatternContribution.prototype.getInfoContribution = function (resource, location) {
            return null;
        };
        return GlobPatternContribution;
    }());
    exports.GlobPatternContribution = GlobPatternContribution;
});
//# sourceMappingURL=globPatternContribution.js.map