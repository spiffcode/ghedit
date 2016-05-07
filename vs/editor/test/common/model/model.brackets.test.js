define(["require", "exports", 'assert', 'vs/editor/common/core/range', 'vs/editor/common/model/textModel', 'vs/editor/common/model/textModelWithTokens'], function (require, exports, assert, range_1, textModel_1, textModelWithTokens_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('TextModelWithTokens', function () {
        function toRelaxedFoundBracket(a) {
            if (!a) {
                return null;
            }
            return {
                range: a.range.toString(),
                open: a.open,
                close: a.close,
                isOpen: a.isOpen
            };
        }
        function testBrackets(contents, brackets) {
            var charIsBracket = {};
            var charIsOpenBracket = {};
            var openForChar = {};
            var closeForChar = {};
            brackets.forEach(function (b) {
                charIsBracket[b[0]] = true;
                charIsBracket[b[1]] = true;
                charIsOpenBracket[b[0]] = true;
                charIsOpenBracket[b[1]] = false;
                openForChar[b[0]] = b[0];
                closeForChar[b[0]] = b[1];
                openForChar[b[1]] = b[0];
                closeForChar[b[1]] = b[1];
            });
            var expectedBrackets = [];
            for (var lineIndex = 0; lineIndex < contents.length; lineIndex++) {
                var lineText = contents[lineIndex];
                for (var charIndex = 0; charIndex < lineText.length; charIndex++) {
                    var ch = lineText.charAt(charIndex);
                    if (charIsBracket[ch]) {
                        expectedBrackets.push({
                            open: openForChar[ch],
                            close: closeForChar[ch],
                            isOpen: charIsOpenBracket[ch],
                            range: new range_1.Range(lineIndex + 1, charIndex + 1, lineIndex + 1, charIndex + 2)
                        });
                    }
                }
            }
            var model = new textModelWithTokens_1.TextModelWithTokens([], textModel_1.TextModel.toRawText(contents.join('\n'), textModel_1.TextModel.DEFAULT_CREATION_OPTIONS), false, null);
            // findPrevBracket
            {
                var expectedBracketIndex = expectedBrackets.length - 1;
                var currentExpectedBracket = expectedBracketIndex >= 0 ? expectedBrackets[expectedBracketIndex] : null;
                for (var lineNumber = contents.length; lineNumber >= 1; lineNumber--) {
                    var lineText = contents[lineNumber - 1];
                    for (var column = lineText.length + 1; column >= 1; column--) {
                        if (currentExpectedBracket) {
                            if (lineNumber === currentExpectedBracket.range.startLineNumber && column < currentExpectedBracket.range.endColumn) {
                                expectedBracketIndex--;
                                currentExpectedBracket = expectedBracketIndex >= 0 ? expectedBrackets[expectedBracketIndex] : null;
                            }
                        }
                        var actual = model.findPrevBracket({
                            lineNumber: lineNumber,
                            column: column
                        });
                        assert.deepEqual(toRelaxedFoundBracket(actual), toRelaxedFoundBracket(currentExpectedBracket), 'findPrevBracket of ' + lineNumber + ', ' + column);
                    }
                }
            }
            // findNextBracket
            {
                var expectedBracketIndex = 0;
                var currentExpectedBracket = expectedBracketIndex < expectedBrackets.length ? expectedBrackets[expectedBracketIndex] : null;
                for (var lineNumber = 1; lineNumber <= contents.length; lineNumber++) {
                    var lineText = contents[lineNumber - 1];
                    for (var column = 1; column <= lineText.length + 1; column++) {
                        if (currentExpectedBracket) {
                            if (lineNumber === currentExpectedBracket.range.startLineNumber && column > currentExpectedBracket.range.startColumn) {
                                expectedBracketIndex++;
                                currentExpectedBracket = expectedBracketIndex < expectedBrackets.length ? expectedBrackets[expectedBracketIndex] : null;
                            }
                        }
                        var actual = model.findNextBracket({
                            lineNumber: lineNumber,
                            column: column
                        });
                        assert.deepEqual(toRelaxedFoundBracket(actual), toRelaxedFoundBracket(currentExpectedBracket), 'findNextBracket of ' + lineNumber + ', ' + column);
                    }
                }
            }
            model.dispose();
        }
        test('brackets', function () {
            testBrackets([
                'if (a == 3) { return (7 * (a + 5)); }'
            ], [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ]);
        });
    });
});
//# sourceMappingURL=model.brackets.test.js.map