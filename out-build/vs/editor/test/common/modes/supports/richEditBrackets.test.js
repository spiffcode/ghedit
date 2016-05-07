define(["require", "exports", 'assert', 'vs/editor/common/modes/supports/richEditBrackets'], function (require, exports, assert, richEditBrackets_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('richEditBrackets', function () {
        function findPrevBracketInToken(reversedBracketRegex, lineText, currentTokenStart, currentTokenEnd) {
            return richEditBrackets_1.BracketsUtils.findPrevBracketInToken(reversedBracketRegex, 1, lineText, currentTokenStart, currentTokenEnd);
        }
        function findNextBracketInToken(forwardBracketRegex, lineText, currentTokenStart, currentTokenEnd) {
            return richEditBrackets_1.BracketsUtils.findNextBracketInToken(forwardBracketRegex, 1, lineText, currentTokenStart, currentTokenEnd);
        }
        test('findPrevBracketInToken one char 1', function () {
            var result = findPrevBracketInToken(/(\{)|(\})/i, '{', 0, 1);
            assert.equal(result.startColumn, 1);
            assert.equal(result.endColumn, 2);
        });
        test('findPrevBracketInToken one char 2', function () {
            var result = findPrevBracketInToken(/(\{)|(\})/i, '{{', 0, 1);
            assert.equal(result.startColumn, 1);
            assert.equal(result.endColumn, 2);
        });
        test('findPrevBracketInToken one char 3', function () {
            var result = findPrevBracketInToken(/(\{)|(\})/i, '{hello world!', 0, 13);
            assert.equal(result.startColumn, 1);
            assert.equal(result.endColumn, 2);
        });
        test('findPrevBracketInToken more chars 1', function () {
            var result = findPrevBracketInToken(/(olleh)/i, 'hello world!', 0, 12);
            assert.equal(result.startColumn, 1);
            assert.equal(result.endColumn, 6);
        });
        test('findPrevBracketInToken more chars 2', function () {
            var result = findPrevBracketInToken(/(olleh)/i, 'hello world!', 0, 5);
            assert.equal(result.startColumn, 1);
            assert.equal(result.endColumn, 6);
        });
        test('findPrevBracketInToken more chars 3', function () {
            var result = findPrevBracketInToken(/(olleh)/i, ' hello world!', 0, 6);
            assert.equal(result.startColumn, 2);
            assert.equal(result.endColumn, 7);
        });
        test('findNextBracketInToken one char', function () {
            var result = findNextBracketInToken(/(\{)|(\})/i, '{', 0, 1);
            assert.equal(result.startColumn, 1);
            assert.equal(result.endColumn, 2);
        });
        test('findNextBracketInToken more chars', function () {
            var result = findNextBracketInToken(/(world)/i, 'hello world!', 0, 12);
            assert.equal(result.startColumn, 7);
            assert.equal(result.endColumn, 12);
        });
        test('issue #3894: [Handlebars] Curly braces edit issues', function () {
            var result = findPrevBracketInToken(/(\-\-!<)|(>\-\-)|(\{\{)|(\}\})/i, '{{asd}}', 0, 2);
            assert.equal(result.startColumn, 1);
            assert.equal(result.endColumn, 3);
        });
    });
});
//# sourceMappingURL=richEditBrackets.test.js.map