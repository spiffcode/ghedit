define(["require", "exports", 'vs/languages/less/common/parser/lessParser', 'vs/languages/css/test/common/nodes.test'], function (require, exports, lessParser, nodesTest) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function assertNodes(fn, input, expected) {
        nodesTest.assertNodes(fn, input, expected);
    }
    exports.assertNodes = assertNodes;
    suite('LESS - Nodes', function () {
        function ruleset(input) {
            var parser = new lessParser.LessParser();
            var node = parser.internalParse(input, parser._parseRuleset);
            return node;
        }
        test('nodes - RuleSet', function () {
            assertNodes(ruleset, 'selector { prop: value }', 'ruleset,...,selector,...,declaration,...,property,...,expression');
            assertNodes(ruleset, 'selector { prop; }', 'ruleset,...,selector,...,selector');
            assertNodes(ruleset, 'selector { prop {} }', 'ruleset,...,ruleset');
        });
    });
});
//# sourceMappingURL=nodes.test.js.map