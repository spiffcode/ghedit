/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/editor/common/editorCommon', 'vs/base/common/strings', 'vs/editor/contrib/snippet/common/snippet', 'vs/editor/common/core/range', 'vs/editor/common/commands/replaceCommand'], function (require, exports, editorCommon_1, strings, snippets, range_1, replaceCommand_1) {
    'use strict';
    var EditorAccessor = (function () {
        function EditorAccessor(editor) {
            this.lineStarts = null;
            this.emmetSupportedModes = ['html', 'razor', 'css', 'less', 'scss', 'xml', 'xsl', 'jade', 'handlebars', 'hbs', 'jsx', 'tsx', 'erb', 'php', 'twig'];
            this.editor = editor;
        }
        EditorAccessor.prototype.noExpansionOccurred = function () {
            // return the tab key handling back to the editor
            this.editor.trigger('emmet', editorCommon_1.Handler.Tab, {});
        };
        EditorAccessor.prototype.isEmmetEnabledMode = function () {
            var syntax = this.getSyntax();
            return (this.emmetSupportedModes.indexOf(syntax) !== -1);
        };
        EditorAccessor.prototype.getSelectionRange = function () {
            var selection = this.editor.getSelection();
            return {
                start: this.getOffsetFromPosition(selection.getStartPosition()),
                end: this.getOffsetFromPosition(selection.getEndPosition())
            };
        };
        EditorAccessor.prototype.getCurrentLineRange = function () {
            var currentLine = this.editor.getSelection().startLineNumber;
            var lineStarts = this.getLineStarts();
            var start = lineStarts[currentLine - 1];
            var end = lineStarts[currentLine];
            return {
                start: start,
                end: end
            };
        };
        EditorAccessor.prototype.getCaretPos = function () {
            var selectionStart = this.editor.getSelection().getStartPosition();
            return this.getOffsetFromPosition(selectionStart);
        };
        EditorAccessor.prototype.setCaretPos = function (pos) {
            //
        };
        EditorAccessor.prototype.getCurrentLine = function () {
            var selectionStart = this.editor.getSelection().getStartPosition();
            return this.editor.getModel().getLineContent(selectionStart.lineNumber);
        };
        EditorAccessor.prototype.replaceContent = function (value, start, end, no_indent) {
            //console.log('value', value);
            var startPosition = this.getPositionFromOffset(start);
            var endPosition = this.getPositionFromOffset(end);
            // test if < or </ are located before the replace range. Either replace these too, or block the expansion
            var currentLine = this.editor.getModel().getLineContent(startPosition.lineNumber).substr(0, startPosition.column); // cpontent before the replaced range
            var match = currentLine.match(/<[/]?$/);
            if (match) {
                if (strings.startsWith(value, match[0])) {
                    startPosition = { lineNumber: startPosition.lineNumber, column: startPosition.column - match[0].length };
                }
                else {
                    return; // ignore
                }
            }
            // shift column by +1 since they are 1 based
            var range = new range_1.Range(startPosition.lineNumber, startPosition.column + 1, endPosition.lineNumber, endPosition.column + 1);
            var deletePreviousChars = 0;
            if (range.startLineNumber === range.endLineNumber) {
                // The snippet will delete
                deletePreviousChars = range.endColumn - range.startColumn;
            }
            else {
                // We must manually delete
                var command = new replaceCommand_1.ReplaceCommand(range, '');
                this.editor.executeCommand('emmet', command);
                deletePreviousChars = 0;
            }
            var snippet = snippets.CodeSnippet.convertExternalSnippet(value, snippets.ExternalSnippetType.EmmetSnippet);
            var codeSnippet = new snippets.CodeSnippet(snippet);
            snippets.getSnippetController(this.editor).run(codeSnippet, deletePreviousChars, 0);
        };
        EditorAccessor.prototype.getContent = function () {
            return this.editor.getModel().getValue();
        };
        EditorAccessor.prototype.createSelection = function (start, end) {
            //
        };
        EditorAccessor.prototype.getSyntax = function () {
            var position = this.editor.getSelection().getStartPosition();
            var mode = this.editor.getModel().getModeAtPosition(position.lineNumber, position.column);
            var syntax = mode.getId().split('.').pop();
            if (/\b(razor|handlebars|erb|php|hbs|twig)\b/.test(syntax)) {
                return 'html';
            }
            if (/\b(typescriptreact|javascriptreact)\b/.test(syntax)) {
                return 'jsx';
            }
            if (syntax === 'sass') {
                return 'scss';
            }
            return syntax;
        };
        EditorAccessor.prototype.getProfileName = function () {
            return null;
        };
        EditorAccessor.prototype.prompt = function (title) {
            //
        };
        EditorAccessor.prototype.getSelection = function () {
            return '';
        };
        EditorAccessor.prototype.getFilePath = function () {
            return '';
        };
        EditorAccessor.prototype.flushCache = function () {
            this.lineStarts = null;
        };
        EditorAccessor.prototype.getPositionFromOffset = function (offset) {
            var lineStarts = this.getLineStarts();
            var low = 0;
            var high = lineStarts.length - 1;
            var mid;
            while (low <= high) {
                mid = low + ((high - low) / 2) | 0;
                if (lineStarts[mid] > offset) {
                    high = mid - 1;
                }
                else {
                    low = mid + 1;
                }
            }
            return {
                lineNumber: low,
                column: offset - lineStarts[low - 1]
            };
        };
        EditorAccessor.prototype.getOffsetFromPosition = function (position) {
            var lineStarts = this.getLineStarts();
            return lineStarts[position.lineNumber - 1] + position.column - 1;
        };
        EditorAccessor.prototype.getLineStarts = function () {
            if (this.lineStarts === null) {
                this.lineStarts = this.computeLineStarts();
            }
            return this.lineStarts;
        };
        EditorAccessor.prototype.computeLineStarts = function () {
            var value = this.editor.getModel().getValue();
            return strings.computeLineStarts(value);
        };
        return EditorAccessor;
    }());
    exports.EditorAccessor = EditorAccessor;
});
//# sourceMappingURL=editorAccessor.js.map