define(["require", "exports", 'vs/base/common/strings', 'vs/nls'], function (require, exports, Strings, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var globProperties = [
        { type: 'value', label: nls.localize('fileLabel', "Files by Extension"), codeSnippet: '"**/*.{{extension}}": true', documentationLabel: nls.localize('fileDescription', "Match all files of a specific file extension.") },
        { type: 'value', label: nls.localize('filesLabel', "Files with Multiple Extensions"), codeSnippet: '"**/*.{ext1,ext2,ext3}": true', documentationLabel: nls.localize('filesDescription', "Match all files with any of the file extensions.") },
        { type: 'value', label: nls.localize('derivedLabel', "Files with Siblings by Name"), codeSnippet: '"**/*.{{source-extension}}": { "when": "$(basename).{{target-extension}}" }', documentationLabel: nls.localize('derivedDescription', "Match files that have siblings with the same name but a different extension.") },
        { type: 'value', label: nls.localize('topFolderLabel', "Folder by Name (Top Level)"), codeSnippet: '"{{name}}": true', documentationLabel: nls.localize('topFolderDescription', "Match a top level folder with a specific name.") },
        { type: 'value', label: nls.localize('topFoldersLabel', "Folders with Multiple Names (Top Level)"), codeSnippet: '"{folder1,folder2,folder3}": true', documentationLabel: nls.localize('topFoldersDescription', "Match multiple top level folders.") },
        { type: 'value', label: nls.localize('folderLabel', "Folder by Name (Any Location)"), codeSnippet: '"**/{{name}}": true', documentationLabel: nls.localize('folderDescription', "Match a folder with a specific name in any location.") },
    ];
    var globValues = [
        { type: 'value', label: nls.localize('trueLabel', "True"), codeSnippet: 'true', documentationLabel: nls.localize('trueDescription', "Enable the pattern.") },
        { type: 'value', label: nls.localize('falseLabel', "False"), codeSnippet: 'false', documentationLabel: nls.localize('falseDescription', "Disable the pattern.") },
        { type: 'value', label: nls.localize('derivedLabel', "Files with Siblings by Name"), codeSnippet: '{ "when": "$(basename).{{extension}}" }', documentationLabel: nls.localize('siblingsDescription', "Match files that have siblings with the same name but a different extension.") }
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