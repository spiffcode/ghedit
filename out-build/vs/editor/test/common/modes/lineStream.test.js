define(["require", "exports", 'assert', 'vs/editor/common/modes/lineStream'], function (require, exports, assert, lineStream_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Editor Modes - LineStream', function () {
        test('advanceIf - regex', function () {
            var lineStream = new lineStream_1.LineStream('...xxx...x.');
            assert.equal(lineStream.advanceIfRegExp(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfRegExp(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfRegExp(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfRegExp(/^x/), 'x');
            assert.equal(lineStream.advanceIfRegExp(/^x/), 'x');
            assert.equal(lineStream.advanceIfRegExp(/^x/), 'x');
            assert.equal(lineStream.advanceIfRegExp(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfRegExp(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfRegExp(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfRegExp(/^x/), 'x');
            assert.equal(lineStream.advanceIfRegExp(/^x/), '');
            lineStream.next();
            assert.ok(lineStream.eos());
        });
        test('advanceWhile - regex', function () {
            var lineStream = new lineStream_1.LineStream('...xxx...x.');
            assert.equal(lineStream.advanceWhile(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile(/^x/), 'xxx');
            assert.equal(lineStream.advanceWhile(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile(/^x/), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile(/^x/), 'x');
            assert.equal(lineStream.advanceWhile(/^x/), '');
            lineStream.next();
            assert.ok(lineStream.eos());
        });
        test('advanceUntil - regex', function () {
            var lineStream = new lineStream_1.LineStream('...x..xx..x');
            assert.equal(lineStream.advanceUntil(/^x/, false), '...');
            assert.equal(lineStream.advanceUntil(/^x/, false), '');
            lineStream.next();
            assert.equal(lineStream.advanceUntil(/^x/, false), '..');
            assert.equal(lineStream.advanceUntil(/^x/, false), '');
            lineStream.next();
            assert.equal(lineStream.advanceUntil(/^x/, false), '');
            lineStream.next();
            assert.equal(lineStream.advanceUntil(/^x/, false), '..');
            assert.equal(lineStream.advanceUntil(/^x/, false), '');
            lineStream.next();
            assert.ok(lineStream.eos());
        });
        test('advanceUntil - regex (including)', function () {
            var lineStream = new lineStream_1.LineStream('...x..xx..x');
            assert.equal(lineStream.advanceUntil(/^x/, true), '...x');
            assert.equal(lineStream.advanceUntil(/^x/, true), '..x');
            assert.equal(lineStream.advanceUntil(/^x/, true), 'x');
            assert.equal(lineStream.advanceUntil(/^x/, true), '..x');
            assert.ok(lineStream.eos());
        });
        test('advanceIf - string', function () {
            var lineStream = new lineStream_1.LineStream('...abcabcabc...abc.');
            assert.equal(lineStream.advanceIfString('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfString('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfString('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfString('abc'), 'abc');
            assert.equal(lineStream.advanceIfString('abc'), 'abc');
            assert.equal(lineStream.advanceIfString('abc'), 'abc');
            assert.equal(lineStream.advanceIfString('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfString('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfString('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceIfString('abc'), 'abc');
            assert.equal(lineStream.advanceIfString('abc'), '');
            lineStream.next();
            assert.ok(lineStream.eos());
        });
        test('advanceWhile - string', function () {
            var lineStream = new lineStream_1.LineStream('...abcabcabc...abc.');
            assert.equal(lineStream.advanceWhile('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile('abc'), 'abcabcabc');
            assert.equal(lineStream.advanceWhile('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile('abc'), '');
            lineStream.next();
            assert.equal(lineStream.advanceWhile('abc'), 'abc');
            assert.equal(lineStream.advanceWhile('abc'), '');
            lineStream.next();
            assert.ok(lineStream.eos());
        });
        test('advanceUntil - string', function () {
            var lineStream = new lineStream_1.LineStream('...abc..ab..abc..bc');
            assert.equal(lineStream.advanceUntil('abc', false), '...');
            assert.equal(lineStream.advanceUntil('abc', false), '');
            lineStream.next();
            assert.equal(lineStream.advanceUntil('abc', false), 'bc..ab..');
            assert.equal(lineStream.advanceUntil('abc', false), '');
            lineStream.next();
            assert.equal(lineStream.advanceUntil('abc', false), 'bc..bc');
            assert.ok(lineStream.eos());
        });
        test('advanceUntil - string (including)', function () {
            var lineStream = new lineStream_1.LineStream('...abc..ab..abc..bc');
            assert.equal(lineStream.advanceUntil('abc', true), '...abc');
            assert.equal(lineStream.advanceUntil('abc', true), '..ab..abc');
            assert.equal(lineStream.advanceUntil('abc', true), '..bc');
            assert.ok(lineStream.eos());
        });
        test('skipWhitespace', function () {
            var lineStream = new lineStream_1.LineStream('\ta bc d  \t   e ');
            assert.equal(lineStream.skipWhitespace(), '\t');
            lineStream.next();
            assert.equal(lineStream.skipWhitespace(), ' ');
            lineStream.next();
            lineStream.next();
            assert.equal(lineStream.skipWhitespace(), ' ');
            lineStream.next();
            assert.equal(lineStream.skipWhitespace(), '  \t   ');
            lineStream.next();
            assert.equal(lineStream.skipWhitespace(), ' ');
            assert.ok(lineStream.eos());
        });
        test('peekToken', function () {
            var lineStream = new lineStream_1.LineStream('a b  c edf ');
            assert.equal(lineStream.peekToken(), 'a');
            lineStream.next();
            assert.equal(lineStream.peekToken(), 'b');
            lineStream.next();
            assert.equal(lineStream.peekToken(), 'b');
            lineStream.next();
            assert.equal(lineStream.peekToken(), 'c');
            lineStream.next();
            assert.equal(lineStream.peekToken(), 'c');
            lineStream.next();
            assert.equal(lineStream.peekToken(), 'c');
            lineStream.next();
            assert.equal(lineStream.peekToken(), 'edf');
            lineStream.next();
            assert.equal(lineStream.peekToken(), 'edf');
            lineStream.next();
            lineStream.next();
            lineStream.next();
            lineStream.next();
            assert.throws(function () { lineStream.peekToken(); });
            assert.ok(lineStream.eos());
        });
        test('nextToken', function () {
            var lineStream = new lineStream_1.LineStream('a b  c edf ');
            assert.equal(lineStream.nextToken(), 'a');
            assert.equal(lineStream.nextToken(), 'b');
            assert.equal(lineStream.nextToken(), 'c');
            assert.equal(lineStream.nextToken(), 'edf');
            assert.equal(lineStream.nextToken(), '');
            assert.throws(function () { lineStream.nextToken(); });
            assert.ok(lineStream.eos());
        });
        function newTokenStream(source, separators, whitespace) {
            var lineStream = new lineStream_1.LineStream(source);
            lineStream.setTokenRules(separators, whitespace);
            return lineStream;
        }
        function checkPos(lineStream, pos) {
            assert.equal(lineStream.pos(), pos);
        }
        function check(lineStream, pos, token) {
            checkPos(lineStream, pos);
            assert.equal(lineStream.nextToken(), token);
        }
        test('corner cases', function () {
            var input, lineStream;
            var noTokens = function (lineStream) {
                assert.equal(lineStream.pos(), 0);
                assert.ok(lineStream.eos());
            };
            noTokens(newTokenStream('', '', ''));
            noTokens(newTokenStream('', '', 'x'));
            noTokens(newTokenStream('', 'x', ''));
            noTokens(newTokenStream('', 'x', 'x'));
            input = '.....';
            lineStream = newTokenStream(input, '.', '');
            for (var i = 0; i < input.length; i++) {
                check(lineStream, i, '.');
            }
            input = ' . . . . .';
            lineStream = newTokenStream(input, '.', ' ');
            for (var i = 0; i < input.length / 2; i++) {
                check(lineStream, (i * 2), '.');
            }
            input = '. . . . . ';
            lineStream = newTokenStream(input, '.', ' ');
            for (var i = 0; i < input.length / 2; i++) {
                check(lineStream, i === 0 ? 0 : (i * 2) - 1, '.');
            }
        });
        test('javascript assign', function () {
            var lineStream = newTokenStream('  var foo =bar("foo"); //x   ', '+-*/%&|^~!=<>(){}[]\'"\\/?;,', '\t ');
            assert.equal(lineStream.pos(), 0);
            assert.equal(lineStream.peekToken(), 'var');
            check(lineStream, 0, 'var');
            check(lineStream, 5, 'foo');
            check(lineStream, 9, '=');
            check(lineStream, 11, 'bar');
            check(lineStream, 14, '(');
            check(lineStream, 15, '"');
            check(lineStream, 16, 'foo');
            check(lineStream, 19, '"');
            check(lineStream, 20, ')');
            check(lineStream, 21, ';');
            check(lineStream, 22, '/');
            check(lineStream, 24, '/');
            check(lineStream, 25, 'x');
            checkPos(lineStream, 26);
            lineStream.skipWhitespace();
            assert.ok(lineStream.eos(), 'Stream finished');
        });
        test('javascript strings', function () {
            var lineStream = newTokenStream('x = "  my \\"string\\" ";', '=()\\";/', '\t ');
            check(lineStream, 0, 'x');
            check(lineStream, 1, '=');
            check(lineStream, 3, '"');
            check(lineStream, 5, 'my');
            check(lineStream, 9, '\\');
            check(lineStream, 11, '"');
            check(lineStream, 12, 'string');
            check(lineStream, 18, '\\');
            check(lineStream, 19, '"');
            check(lineStream, 20, '"');
            check(lineStream, 22, ';');
            assert.ok(lineStream.eos(), 'Stream finished');
        });
        test('peek', function () {
            var lineStream = newTokenStream('albert, bart, charlie, damon, erich', ',', ' ');
            assert.equal(lineStream.peekToken(), 'albert');
            assert.equal(lineStream.peek(), 'a');
            assert.equal(lineStream.nextToken(), 'albert');
            assert.equal(lineStream.nextToken(), ',');
            assert.equal(lineStream.peekToken(), 'bart');
            assert.equal(lineStream.peek(), ' ');
            assert.equal(lineStream.nextToken(), 'bart');
            assert.equal(lineStream.peekToken(), ',');
            assert.equal(lineStream.peek(), ',');
            assert.equal(lineStream.nextToken(), ',');
            lineStream.advanceToEOS();
            assert.throws(function () { lineStream.peekToken(); });
            assert.throws(function () { lineStream.peek(); });
        });
        test('next', function () {
            var lineStream = newTokenStream('albert, bart, charlie, damon, erich', ',', ' ');
            assert.equal(lineStream.peekToken(), 'albert');
            assert.equal(lineStream.next(), 'a');
            assert.equal(lineStream.next(), 'l');
            assert.equal(lineStream.next(), 'b');
            assert.equal(lineStream.nextToken(), 'ert');
            assert.equal(lineStream.nextToken(), ',');
            assert.equal(lineStream.nextToken(), 'bart');
            assert.equal(lineStream.peekToken(), ',');
            assert.equal(lineStream.next(), ',');
            assert.equal(lineStream.next(), ' ');
            assert.equal(lineStream.next(), 'c');
            assert.equal(lineStream.next(), 'h');
            assert.equal(lineStream.next(), 'a');
            assert.equal(lineStream.next(), 'r');
            assert.equal(lineStream.next(), 'l');
            assert.equal(lineStream.next(), 'i');
            assert.equal(lineStream.next(), 'e');
            assert.equal(lineStream.next(), ',');
            assert.equal(lineStream.nextToken(), 'damon');
            lineStream.advanceToEOS();
            assert.throws(function () { lineStream.peekToken(); });
            assert.throws(function () { lineStream.peek(); });
        });
        test('next & goBack', function () {
            var lineStream = new lineStream_1.LineStream('albert, bart, charlie, damon, erich');
            lineStream.setTokenRules(',', ' ');
            assert.equal(lineStream.peekToken(), 'albert');
            assert.equal(lineStream.next(), 'a');
            assert.equal(lineStream.next(), 'l');
            assert.equal(lineStream.next(), 'b');
            assert.equal(lineStream.nextToken(), 'ert');
            lineStream.goBack(6);
            assert.equal(lineStream.nextToken(), 'albert');
            assert.equal(lineStream.next(), ',');
            lineStream.goBack(7);
            assert.equal(lineStream.nextToken(), 'albert');
            assert.equal(lineStream.nextToken(), ',');
            assert.equal(lineStream.next(), ' ');
            assert.equal(lineStream.next(), 'b');
            assert.equal(lineStream.next(), 'a');
            lineStream.goBack(3);
            assert.equal(lineStream.nextToken(), 'bart');
            lineStream.goBack(5);
            assert.equal(lineStream.next(), ' ');
            lineStream.advanceToEOS();
            assert.throws(function () { lineStream.peekToken(); });
            assert.throws(function () { lineStream.peek(); });
        });
    });
});
//# sourceMappingURL=lineStream.test.js.map