define(["require", "exports", 'assert', 'vs/base/common/json'], function (require, exports, assert, json_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function assertKinds(text) {
        var kinds = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            kinds[_i - 1] = arguments[_i];
        }
        var _json = json_1.createScanner(text);
        var kind;
        while ((kind = _json.scan()) !== json_1.SyntaxKind.EOF) {
            assert.equal(kind, kinds.shift());
        }
        assert.equal(kinds.length, 0);
    }
    function assertValidParse(input, expected) {
        var errors = [];
        var actual = json_1.parse(input, errors);
        if (errors.length !== 0) {
            assert(false, errors[0]);
        }
        assert.deepEqual(actual, expected);
    }
    function assertInvalidParse(input, expected) {
        var errors = [];
        var actual = json_1.parse(input, errors);
        assert(errors.length > 0);
        assert.deepEqual(actual, expected);
    }
    suite('JSON', function () {
        test('tokens', function () {
            assertKinds('{', json_1.SyntaxKind.OpenBraceToken);
            assertKinds('}', json_1.SyntaxKind.CloseBraceToken);
            assertKinds('[', json_1.SyntaxKind.OpenBracketToken);
            assertKinds(']', json_1.SyntaxKind.CloseBracketToken);
            assertKinds(':', json_1.SyntaxKind.ColonToken);
            assertKinds(',', json_1.SyntaxKind.CommaToken);
        });
        test('comments', function () {
            assertKinds('// this is a comment', json_1.SyntaxKind.LineCommentTrivia);
            assertKinds('// this is a comment\n', json_1.SyntaxKind.LineCommentTrivia, json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('/* this is a comment*/', json_1.SyntaxKind.BlockCommentTrivia);
            assertKinds('/* this is a \r\ncomment*/', json_1.SyntaxKind.BlockCommentTrivia);
            assertKinds('/* this is a \ncomment*/', json_1.SyntaxKind.BlockCommentTrivia);
            // unexpected end
            assertKinds('/* this is a', json_1.SyntaxKind.BlockCommentTrivia);
            assertKinds('/* this is a \ncomment', json_1.SyntaxKind.BlockCommentTrivia);
            // broken comment
            assertKinds('/ ttt', json_1.SyntaxKind.Unknown, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.Unknown);
        });
        test('strings', function () {
            assertKinds('"test"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\""', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\/"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\b"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\f"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\n"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\r"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\t"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\v"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\u88ff"', json_1.SyntaxKind.StringLiteral);
            // unexpected end
            assertKinds('"test', json_1.SyntaxKind.StringLiteral);
            assertKinds('"test\n"', json_1.SyntaxKind.StringLiteral, json_1.SyntaxKind.LineBreakTrivia, json_1.SyntaxKind.StringLiteral);
        });
        test('numbers', function () {
            assertKinds('0', json_1.SyntaxKind.NumericLiteral);
            assertKinds('0.1', json_1.SyntaxKind.NumericLiteral);
            assertKinds('-0.1', json_1.SyntaxKind.NumericLiteral);
            assertKinds('-1', json_1.SyntaxKind.NumericLiteral);
            assertKinds('1', json_1.SyntaxKind.NumericLiteral);
            assertKinds('123456789', json_1.SyntaxKind.NumericLiteral);
            assertKinds('10', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90E+123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90e+123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90e-123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90E-123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90E123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90e123', json_1.SyntaxKind.NumericLiteral);
            // zero handling
            assertKinds('01', json_1.SyntaxKind.NumericLiteral, json_1.SyntaxKind.NumericLiteral);
            assertKinds('-01', json_1.SyntaxKind.NumericLiteral, json_1.SyntaxKind.NumericLiteral);
            // unexpected end
            assertKinds('-', json_1.SyntaxKind.Unknown);
            assertKinds('.0', json_1.SyntaxKind.Unknown);
        });
        test('keywords: true, false, null', function () {
            assertKinds('true', json_1.SyntaxKind.TrueKeyword);
            assertKinds('false', json_1.SyntaxKind.FalseKeyword);
            assertKinds('null', json_1.SyntaxKind.NullKeyword);
            assertKinds('true false null', json_1.SyntaxKind.TrueKeyword, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.FalseKeyword, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.NullKeyword);
            // invalid words
            assertKinds('nulllll', json_1.SyntaxKind.Unknown);
            assertKinds('True', json_1.SyntaxKind.Unknown);
            assertKinds('foo-bar', json_1.SyntaxKind.Unknown);
            assertKinds('foo bar', json_1.SyntaxKind.Unknown, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.Unknown);
        });
        test('trivia', function () {
            assertKinds(' ', json_1.SyntaxKind.Trivia);
            assertKinds('  \t  ', json_1.SyntaxKind.Trivia);
            assertKinds('  \t  \n  \t  ', json_1.SyntaxKind.Trivia, json_1.SyntaxKind.LineBreakTrivia, json_1.SyntaxKind.Trivia);
            assertKinds('\r\n', json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('\r', json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('\n', json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('\n\r', json_1.SyntaxKind.LineBreakTrivia, json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('\n   \n', json_1.SyntaxKind.LineBreakTrivia, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.LineBreakTrivia);
        });
        test('parse: literals', function () {
            assertValidParse('true', true);
            assertValidParse('false', false);
            assertValidParse('null', null);
            assertValidParse('"foo"', 'foo');
            assertValidParse('"\\"-\\\\-\\/-\\b-\\f-\\n-\\r-\\t"', '"-\\-/-\b-\f-\n-\r-\t');
            assertValidParse('"\\u00DC"', 'Ü');
            assertValidParse('9', 9);
            assertValidParse('-9', -9);
            assertValidParse('0.129', 0.129);
            assertValidParse('23e3', 23e3);
            assertValidParse('1.2E+3', 1.2E+3);
            assertValidParse('1.2E-3', 1.2E-3);
        });
        test('parse: objects', function () {
            assertValidParse('{}', {});
            assertValidParse('{ "foo": true }', { foo: true });
            assertValidParse('{ "bar": 8, "xoo": "foo" }', { bar: 8, xoo: 'foo' });
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} });
            assertValidParse('{ "a": false, "b": true, "c": [ 7.4 ] }', { a: false, b: true, c: [7.4] });
            assertValidParse('{ "lineComment": "//", "blockComment": ["/*", "*/"], "brackets": [ ["{", "}"], ["[", "]"], ["(", ")"] ] }', { lineComment: '//', blockComment: ["/*", "*/"], brackets: [["{", "}"], ["[", "]"], ["(", ")"]] });
        });
        test('parse: arrays', function () {
            assertValidParse('[]', []);
            assertValidParse('[ [],  [ [] ]]', [[], [[]]]);
            assertValidParse('[ 1, 2, 3 ]', [1, 2, 3]);
            assertValidParse('[ { "a": null } ]', [{ a: null }]);
        });
        test('parse: objects with errors', function () {
            assertInvalidParse('{,}', {});
            assertInvalidParse('{ "foo": true, }', { foo: true });
            assertInvalidParse('{ "bar": 8 "xoo": "foo" }', { bar: 8, xoo: 'foo' });
            assertInvalidParse('{ ,"bar": 8 }', { bar: 8 });
            assertInvalidParse('{ ,"bar": 8, "foo" }', { bar: 8 });
            assertInvalidParse('{ "bar": 8, "foo": }', { bar: 8 });
            assertInvalidParse('{ 8, "foo": 9 }', { foo: 9 });
        });
        test('parse: array with errors', function () {
            assertInvalidParse('[,]', []);
            assertInvalidParse('[ 1, 2, ]', [1, 2]);
            assertInvalidParse('[ 1 2, 3 ]', [1, 2, 3]);
            assertInvalidParse('[ ,1, 2, 3 ]', [1, 2, 3]);
            assertInvalidParse('[ ,1, 2, 3, ]', [1, 2, 3]);
        });
    });
});
//# sourceMappingURL=json.test.js.map