define(["require", "exports", 'assert', 'vs/editor/common/modes', 'vs/editor/common/modes/supports/onEnter'], function (require, exports, assert, modes_1, onEnter_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('OnEnter', function () {
        test('uses indentationRules', function () {
            var support = new onEnter_1.OnEnterSupport(null, {
                indentationRules: {
                    decreaseIndentPattern: /^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
                    increaseIndentPattern: /(\{[^}"']*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
                    indentNextLinePattern: /^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$)/,
                    unIndentedLinePattern: /^(?!.*([;{}]|\S:)\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!.*(\{[^}"']*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$))/
                }
            });
            var testIndentAction = function (oneLineAboveText, beforeText, afterText, expected) {
                var actual = support._actualOnEnter(oneLineAboveText, beforeText, afterText);
                if (expected === modes_1.IndentAction.None) {
                    assert.equal(actual, null);
                }
                else {
                    assert.equal(actual.indentAction, expected);
                }
            };
            testIndentAction('', 'case', '', modes_1.IndentAction.None);
            testIndentAction('', 'case:', '', modes_1.IndentAction.Indent);
            testIndentAction('', 'if (true) {', '', modes_1.IndentAction.Indent);
            testIndentAction('', 'if (true)', '', modes_1.IndentAction.Indent);
            testIndentAction('', ' ', '}', modes_1.IndentAction.Outdent);
            testIndentAction('if(true)', '\treturn false', '', modes_1.IndentAction.Outdent);
        });
        test('uses brackets', function () {
            var brackets = [
                ['(', ')'],
                ['begin', 'end']
            ];
            var support = new onEnter_1.OnEnterSupport(null, {
                brackets: brackets
            });
            var testIndentAction = function (beforeText, afterText, expected) {
                var actual = support._actualOnEnter('', beforeText, afterText);
                if (expected === modes_1.IndentAction.None) {
                    assert.equal(actual, null);
                }
                else {
                    assert.equal(actual.indentAction, expected);
                }
            };
            testIndentAction('a', '', modes_1.IndentAction.None);
            testIndentAction('', 'b', modes_1.IndentAction.None);
            testIndentAction('(', 'b', modes_1.IndentAction.Indent);
            testIndentAction('a', ')', modes_1.IndentAction.None);
            testIndentAction('begin', 'ending', modes_1.IndentAction.Indent);
            testIndentAction('abegin', 'end', modes_1.IndentAction.None);
            testIndentAction('begin', ')', modes_1.IndentAction.Indent);
            testIndentAction('begin', 'end', modes_1.IndentAction.IndentOutdent);
            testIndentAction('begin ', ' end', modes_1.IndentAction.IndentOutdent);
            testIndentAction(' begin', 'end//as', modes_1.IndentAction.IndentOutdent);
            testIndentAction('(', ')', modes_1.IndentAction.IndentOutdent);
            testIndentAction('( ', ')', modes_1.IndentAction.IndentOutdent);
            testIndentAction('a(', ')b', modes_1.IndentAction.IndentOutdent);
            testIndentAction('(', '', modes_1.IndentAction.Indent);
            testIndentAction('(', 'foo', modes_1.IndentAction.Indent);
            testIndentAction('begin', 'foo', modes_1.IndentAction.Indent);
            testIndentAction('begin', '', modes_1.IndentAction.Indent);
        });
        test('uses regExpRules', function () {
            var support = new onEnter_1.OnEnterSupport(null, {
                regExpRules: [
                    {
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        afterText: /^\s*\*\/$/,
                        action: { indentAction: modes_1.IndentAction.IndentOutdent, appendText: ' * ' }
                    },
                    {
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        action: { indentAction: modes_1.IndentAction.None, appendText: ' * ' }
                    },
                    {
                        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                        action: { indentAction: modes_1.IndentAction.None, appendText: '* ' }
                    },
                    {
                        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                        action: { indentAction: modes_1.IndentAction.None, removeText: 1 }
                    }
                ]
            });
            var testIndentAction = function (beforeText, afterText, expectedIndentAction, expectedAppendText, removeText) {
                if (removeText === void 0) { removeText = 0; }
                var actual = support._actualOnEnter('', beforeText, afterText);
                if (expectedIndentAction === null) {
                    assert.equal(actual, null, 'isNull:' + beforeText);
                }
                else {
                    assert.equal(actual !== null, true, 'isNotNull:' + beforeText);
                    assert.equal(actual.indentAction, expectedIndentAction, 'indentAction:' + beforeText);
                    if (expectedAppendText !== null) {
                        assert.equal(actual.appendText, expectedAppendText, 'appendText:' + beforeText);
                    }
                    if (removeText !== 0) {
                        assert.equal(actual.removeText, removeText, 'removeText:' + beforeText);
                    }
                }
            };
            testIndentAction('\t/**', ' */', modes_1.IndentAction.IndentOutdent, ' * ');
            testIndentAction('\t/**', '', modes_1.IndentAction.None, ' * ');
            testIndentAction('\t/** * / * / * /', '', modes_1.IndentAction.None, ' * ');
            testIndentAction('\t/** /*', '', modes_1.IndentAction.None, ' * ');
            testIndentAction('/**', '', modes_1.IndentAction.None, ' * ');
            testIndentAction('\t/**/', '', null, null);
            testIndentAction('\t/***/', '', null, null);
            testIndentAction('\t/*******/', '', null, null);
            testIndentAction('\t/** * * * * */', '', null, null);
            testIndentAction('\t/** */', '', null, null);
            testIndentAction('\t/** asdfg */', '', null, null);
            testIndentAction('\t/* asdfg */', '', null, null);
            testIndentAction('\t/* asdfg */', '', null, null);
            testIndentAction('\t/** asdfg */', '', null, null);
            testIndentAction('*/', '', null, null);
            testIndentAction('\t/*', '', null, null);
            testIndentAction('\t*', '', null, null);
            testIndentAction('\t *', '', modes_1.IndentAction.None, '* ');
            testIndentAction('\t */', '', modes_1.IndentAction.None, null, 1);
            testIndentAction('\t * */', '', null, null);
            testIndentAction('\t * * / * / * / */', '', null, null);
            testIndentAction('\t * ', '', modes_1.IndentAction.None, '* ');
            testIndentAction(' * ', '', modes_1.IndentAction.None, '* ');
            testIndentAction(' * asdfsfagadfg', '', modes_1.IndentAction.None, '* ');
            testIndentAction(' * asdfsfagadfg * * * ', '', modes_1.IndentAction.None, '* ');
            testIndentAction(' * /*', '', modes_1.IndentAction.None, '* ');
            testIndentAction(' * asdfsfagadfg * / * / * /', '', modes_1.IndentAction.None, '* ');
            testIndentAction(' * asdfsfagadfg * / * / * /*', '', modes_1.IndentAction.None, '* ');
            testIndentAction(' */', '', modes_1.IndentAction.None, null, 1);
            testIndentAction('\t */', '', modes_1.IndentAction.None, null, 1);
            testIndentAction('\t\t */', '', modes_1.IndentAction.None, null, 1);
            testIndentAction('   */', '', modes_1.IndentAction.None, null, 1);
            testIndentAction('     */', '', modes_1.IndentAction.None, null, 1);
            testIndentAction('\t     */', '', modes_1.IndentAction.None, null, 1);
        });
    });
});
//# sourceMappingURL=onEnter.test.js.map