define(["require", "exports", 'vs/editor/common/editorCommon', 'vs/editor/common/core/range', 'vs/editor/common/model/model', 'vs/languages/json/common/features/jsonFormatter', 'vs/editor/common/model/mirrorModel', 'assert'], function (require, exports, EditorCommon, range_1, model_1, Formatter, MirrorModel, assert) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('JSON - formatter', function () {
        function format(unformatted, expected, insertSpaces) {
            if (insertSpaces === void 0) { insertSpaces = true; }
            var range = null;
            var mirrorModel = MirrorModel.createTestMirrorModelFromString(unformatted);
            var rangeStart = unformatted.indexOf('|');
            var rangeEnd = unformatted.lastIndexOf('|');
            if (rangeStart !== -1 && rangeEnd !== -1) {
                unformatted = unformatted.substring(0, rangeStart) + unformatted.substring(rangeStart + 1, rangeEnd) + unformatted.substring(rangeEnd + 1);
                var startPos = mirrorModel.getPositionFromOffset(rangeStart);
                var endPos = mirrorModel.getPositionFromOffset(rangeEnd);
                range = { startLineNumber: startPos.lineNumber, startColumn: startPos.column, endLineNumber: endPos.lineNumber, endColumn: endPos.column };
                mirrorModel = MirrorModel.createTestMirrorModelFromString(unformatted);
            }
            var operations = Formatter.format(mirrorModel, range, { tabSize: 2, insertSpaces: insertSpaces });
            var model = new model_1.Model(unformatted, model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            model.pushEditOperations([], operations.map(function (o) {
                return {
                    range: range_1.Range.lift(o.range),
                    text: o.text,
                    identifier: null,
                    forceMoveMarkers: false
                };
            }), function () { return []; });
            var newContent = model.getValue(EditorCommon.EndOfLinePreference.LF);
            assert.equal(newContent, expected);
            model.dispose();
        }
        test('object - single property', function () {
            var content = [
                '{"x" : 1}'
            ].join('\n');
            var expected = [
                '{',
                '  "x": 1',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - multiple properties', function () {
            var content = [
                '{"x" : 1,  "y" : "foo", "z"  : true}'
            ].join('\n');
            var expected = [
                '{',
                '  "x": 1,',
                '  "y": "foo",',
                '  "z": true',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - no properties ', function () {
            var content = [
                '{"x" : {    },  "y" : {}}'
            ].join('\n');
            var expected = [
                '{',
                '  "x": {},',
                '  "y": {}',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - nesting', function () {
            var content = [
                '{"x" : {  "y" : { "z"  : { }}, "a": true}}'
            ].join('\n');
            var expected = [
                '{',
                '  "x": {',
                '    "y": {',
                '      "z": {}',
                '    },',
                '    "a": true',
                '  }',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('array - single items', function () {
            var content = [
                '["[]"]'
            ].join('\n');
            var expected = [
                '[',
                '  "[]"',
                ']'
            ].join('\n');
            format(content, expected);
        });
        test('array - multiple items', function () {
            var content = [
                '[true,null,1.2]'
            ].join('\n');
            var expected = [
                '[',
                '  true,',
                '  null,',
                '  1.2',
                ']'
            ].join('\n');
            format(content, expected);
        });
        test('array - no items', function () {
            var content = [
                '[      ]'
            ].join('\n');
            var expected = [
                '[]'
            ].join('\n');
            format(content, expected);
        });
        test('array - nesting', function () {
            var content = [
                '[ [], [ [ {} ], "a" ]  ]'
            ].join('\n');
            var expected = [
                '[',
                '  [],',
                '  [',
                '    [',
                '      {}',
                '    ],',
                '    "a"',
                '  ]',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('syntax errors', function () {
            var content = [
                '[ null 1.2 ]'
            ].join('\n');
            var expected = [
                '[',
                '  null 1.2',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('empty lines', function () {
            var content = [
                '{',
                '"a": true,',
                '',
                '"b": true',
                '}',
            ].join('\n');
            var expected = [
                '{',
                '\t"a": true,',
                '\t"b": true',
                '}',
            ].join('\n');
            format(content, expected, false);
        });
        test('single line comment', function () {
            var content = [
                '[ ',
                '//comment',
                '"foo", "bar"',
                '] '
            ].join('\n');
            var expected = [
                '[',
                '  //comment',
                '  "foo",',
                '  "bar"',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('block line comment', function () {
            var content = [
                '[{',
                '        /*comment*/     ',
                '"foo" : true',
                '}] '
            ].join('\n');
            var expected = [
                '[',
                '  {',
                '    /*comment*/',
                '    "foo": true',
                '  }',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('single line comment on same line', function () {
            var content = [
                ' {  ',
                '        "a": {}// comment    ',
                ' } '
            ].join('\n');
            var expected = [
                '{',
                '  "a": {} // comment    ',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('block comment on same line', function () {
            var content = [
                '{      "a": {}, /*comment*/    ',
                '        /*comment*/ "b": {},    ',
                '        "c": {/*comment*/}    } ',
            ].join('\n');
            var expected = [
                '{',
                '  "a": {}, /*comment*/',
                '  /*comment*/ "b": {},',
                '  "c": { /*comment*/}',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('block comment on same line advanced', function () {
            var content = [
                ' {       "d": [',
                '             null',
                '        ] /*comment*/',
                '        ,"e": /*comment*/ [null] }',
            ].join('\n');
            var expected = [
                '{',
                '  "d": [',
                '    null',
                '  ] /*comment*/,',
                '  "e": /*comment*/ [',
                '    null',
                '  ]',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('multiple block comments on same line', function () {
            var content = [
                '{      "a": {} /*comment*/, /*comment*/   ',
                '        /*comment*/ "b": {}  /*comment*/  } '
            ].join('\n');
            var expected = [
                '{',
                '  "a": {} /*comment*/, /*comment*/',
                '  /*comment*/ "b": {} /*comment*/',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('range', function () {
            var content = [
                '{ "a": {},',
                '|"b": [null, null]|',
                '} '
            ].join('\n');
            var expected = [
                '{ "a": {},',
                '"b": [',
                '  null,',
                '  null',
                ']',
                '} ',
            ].join('\n');
            format(content, expected);
        });
        test('range with existing indent', function () {
            var content = [
                '{ "a": {},',
                '   |"b": [null],',
                '"c": {}',
                '} |'
            ].join('\n');
            var expected = [
                '{ "a": {},',
                '  "b": [',
                '    null',
                '  ],',
                '  "c": {}',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('range with existing indent - tabs', function () {
            var content = [
                '{ "a": {},',
                '|  "b": [null],   ',
                '"c": {}',
                '} |    '
            ].join('\n');
            var expected = [
                '{ "a": {},',
                '\t"b": [',
                '\t\tnull',
                '\t],',
                '\t"c": {}',
                '}',
            ].join('\n');
            format(content, expected, false);
        });
        test('block comment none-line breaking symbols', function () {
            var content = [
                '{ "a": [ 1',
                '/* comment */',
                ', 2',
                '/* comment */',
                ']',
                '/* comment */',
                ',',
                ' "b": true',
                '/* comment */',
                '}'
            ].join('\n');
            var expected = [
                '{',
                '  "a": [',
                '    1',
                '    /* comment */',
                '    ,',
                '    2',
                '    /* comment */',
                '  ]',
                '  /* comment */',
                '  ,',
                '  "b": true',
                '  /* comment */',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('line comment after none-line breaking symbols', function () {
            var content = [
                '{ "a":',
                '// comment',
                'null,',
                ' "b"',
                '// comment',
                ': null',
                '// comment',
                '}'
            ].join('\n');
            var expected = [
                '{',
                '  "a":',
                '  // comment',
                '  null,',
                '  "b"',
                '  // comment',
                '  : null',
                '  // comment',
                '}',
            ].join('\n');
            format(content, expected);
        });
    });
});
//# sourceMappingURL=formatter.test.js.map