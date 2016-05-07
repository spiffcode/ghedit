define(["require", "exports", 'assert', 'vs/editor/common/model/model', 'vs/editor/contrib/folding/common/indentFoldStrategy'], function (require, exports, assert, model_1, indentFoldStrategy_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Indentation Folding', function () {
        function assertRanges(lines, tabSize, expected) {
            var model = new model_1.Model(lines.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
            var actual = indentFoldStrategy_1.computeRanges(model, tabSize);
            actual.sort(function (r1, r2) { return r1.startLineNumber - r2.startLineNumber; });
            assert.deepEqual(actual, expected);
            model.dispose();
        }
        function r(startLineNumber, endLineNumber, indent) {
            return { startLineNumber: startLineNumber, endLineNumber: endLineNumber, indent: indent };
        }
        test('Fold one level', function () {
            assertRanges([
                'A',
                '  A',
                '  A',
                '  A'
            ], 4, [r(1, 4, 0)]);
        });
        test('Fold two levels', function () {
            assertRanges([
                'A',
                '  A',
                '  A',
                '    A',
                '    A'
            ], 4, [r(1, 5, 0), r(3, 5, 2)]);
        });
        test('Fold three levels', function () {
            assertRanges([
                'A',
                '  A',
                '    A',
                '      A',
                'A'
            ], 4, [r(1, 4, 0), r(2, 4, 2), r(3, 4, 4)]);
        });
        test('Fold decreasing indent', function () {
            assertRanges([
                '    A',
                '  A',
                'A'
            ], 4, []);
        });
        test('Fold Java', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '  void foo() {',
                /* 3*/ '    console.log();',
                /* 4*/ '    console.log();',
                /* 5*/ '  }',
                /* 6*/ '',
                /* 7*/ '  void bar() {',
                /* 8*/ '    console.log();',
                /* 9*/ '  }',
                /*10*/ '}',
                /*11*/ 'interface B {',
                /*12*/ '  void bar();',
                /*13*/ '}',
            ], 4, [r(1, 9, 0), r(2, 4, 2), r(7, 8, 2), r(11, 12, 0)]);
        });
        test('Fold Javadoc', function () {
            assertRanges([
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '  }',
                /* 7*/ '}',
            ], 4, [r(1, 3, 0), r(4, 6, 0)]);
        });
        test('Fold Whitespace', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '',
                /* 3*/ '  void foo() {',
                /* 4*/ '     ',
                /* 5*/ '     return 0;',
                /* 6*/ '  }',
                /* 7*/ '      ',
                /* 8*/ '}',
            ], 4, [r(1, 7, 0), r(3, 5, 2)]);
        });
        test('Fold Tabs', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '\t\t',
                /* 3*/ '\tvoid foo() {',
                /* 4*/ '\t \t//hello',
                /* 5*/ '\t    return 0;',
                /* 6*/ '  \t}',
                /* 7*/ '      ',
                /* 8*/ '}',
            ], 4, [r(1, 7, 0), r(3, 5, 4)]);
        });
        test('Limit By indent', function () {
            var ranges = [r(1, 4, 0), r(3, 4, 2), r(5, 8, 0), r(6, 7, 1), r(9, 15, 0), r(10, 15, 10), r(11, 12, 2000), r(14, 15, 2000)];
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 8), [r(1, 4, 0), r(3, 4, 2), r(5, 8, 0), r(6, 7, 1), r(9, 15, 0), r(10, 15, 10), r(11, 12, 2000), r(14, 15, 2000)]);
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 7), [r(1, 4, 0), r(3, 4, 2), r(5, 8, 0), r(6, 7, 1), r(9, 15, 0), r(10, 15, 10)]);
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 6), [r(1, 4, 0), r(3, 4, 2), r(5, 8, 0), r(6, 7, 1), r(9, 15, 0), r(10, 15, 10)]);
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 5), [r(1, 4, 0), r(3, 4, 2), r(5, 8, 0), r(6, 7, 1), r(9, 15, 0)]);
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 4), [r(1, 4, 0), r(5, 8, 0), r(6, 7, 1), r(9, 15, 0)]);
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 3), [r(1, 4, 0), r(5, 8, 0), r(9, 15, 0)]);
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 2), []);
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 1), []);
            assert.deepEqual(indentFoldStrategy_1.limitByIndent(ranges, 0), []);
        });
        test('Compute indent level', function () {
            assert.equal(indentFoldStrategy_1.computeIndentLevel('Hello', 4), 0);
            assert.equal(indentFoldStrategy_1.computeIndentLevel(' Hello', 4), 1);
            assert.equal(indentFoldStrategy_1.computeIndentLevel('   Hello', 4), 3);
            assert.equal(indentFoldStrategy_1.computeIndentLevel('\tHello', 4), 4);
            assert.equal(indentFoldStrategy_1.computeIndentLevel(' \tHello', 4), 4);
            assert.equal(indentFoldStrategy_1.computeIndentLevel('  \tHello', 4), 4);
            assert.equal(indentFoldStrategy_1.computeIndentLevel('   \tHello', 4), 4);
            assert.equal(indentFoldStrategy_1.computeIndentLevel('    \tHello', 4), 8);
            assert.equal(indentFoldStrategy_1.computeIndentLevel('     \tHello', 4), 8);
            assert.equal(indentFoldStrategy_1.computeIndentLevel('\t Hello', 4), 5);
            assert.equal(indentFoldStrategy_1.computeIndentLevel('\t \tHello', 4), 8);
        });
    });
});
//# sourceMappingURL=indentFold.test.js.map