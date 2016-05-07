define(["require", "exports", 'assert', 'vs/languages/css/common/parser/cssSymbols', 'vs/languages/css/common/parser/cssNodes', 'vs/languages/css/common/parser/cssParser', 'vs/languages/css/common/services/occurrences', './css-worker.test'], function (require, exports, assert, symbols, nodes, parser, occurrences, workerTests) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function assertScopesAndSymbols(p, input, expected) {
        var global = createScope(p, input);
        assert.equal(scopeToString(global), expected);
    }
    exports.assertScopesAndSymbols = assertScopesAndSymbols;
    function assertOccurrences(p, input, marker, expectedMatches, expectedWrites, type) {
        var stylesheet = p.parseStylesheet(workerTests.mockMirrorModel(input));
        assertNoErrors(stylesheet);
        var index = input.indexOf(marker) + marker.length;
        var os = occurrences.findOccurrences(stylesheet, index);
        assert.equal(os.length, expectedMatches);
        assert.equal(os[0].type, type);
        var nWrites = 0;
        for (var index = 0; index < os.length; index++) {
            if (os[index].kind === 'write') {
                nWrites++;
            }
        }
        assert.equal(nWrites, expectedWrites);
    }
    exports.assertOccurrences = assertOccurrences;
    function assertSymbolsInScope(p, input, offset) {
        var selections = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            selections[_i - 3] = arguments[_i];
        }
        var global = createScope(p, input);
        var scope = global.findScope(offset);
        var getErrorMessage = function (name) {
            var all = 'symbol ' + name + ' not found. In scope: ';
            scope.getSymbols().forEach(function (sym) { all += (sym.name + ' '); });
            return all;
        };
        for (var i = 0; i < selections.length; i++) {
            var selection = selections[i];
            var sym = scope.getSymbol(selection.name, selection.type);
            assert.ok(!!sym, getErrorMessage(selection.name));
        }
    }
    exports.assertSymbolsInScope = assertSymbolsInScope;
    function assertScopeBuilding(p, input) {
        var scopes = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            scopes[_i - 2] = arguments[_i];
        }
        var global = createScope(p, input);
        function assertChildren(scope) {
            scope.children.forEach(function (scope) {
                // check bounds
                var expected = scopes.shift();
                assert.equal(scope.offset, expected.offset);
                assert.equal(scope.length, expected.length);
                // recursive descent
                assertChildren(scope);
            });
        }
        assertChildren(global);
        assert.equal(scopes.length, 0, 'remainig scopes: ' + scopes.join());
    }
    exports.assertScopeBuilding = assertScopeBuilding;
    function scopeToString(scope) {
        var str = '';
        var symbols = scope.getSymbols();
        for (var index = 0; index < symbols.length; index++) {
            if (str.length > 0) {
                str += ',';
            }
            str += symbols[index].name;
        }
        var scopes = scope.children;
        for (var index = 0; index < scopes.length; index++) {
            if (str.length > 0) {
                str += ',';
            }
            str += ('[' + scopeToString(scopes[index]) + ']');
        }
        return str;
    }
    function assertNoErrors(node) {
        var markers = nodes.ParseErrorCollector.entries(node);
        if (markers.length > 0) {
            assert.ok(false, 'node has errors: ' + markers[0].getMessage() + ', offset: ' + markers[0].getNode().offset);
        }
    }
    function createScope(p, input) {
        var styleSheet = p.parseStylesheet(workerTests.mockMirrorModel(input)), global = new symbols.GlobalScope(), builder = new symbols.ScopeBuilder(global);
        assertNoErrors(styleSheet);
        styleSheet.accept(builder);
        return global;
    }
    suite('CSS - symbols', function () {
        test('scope creation', function () {
            var global = new symbols.GlobalScope(), child1 = new symbols.Scope(10, 5), child2 = new symbols.Scope(15, 5);
            global.addChild(child1);
            global.addChild(child2);
            assert.equal(global.children.length, 2);
            assert.ok(child1.parent === global);
            assert.ok(child2.parent === global);
            // find children
            assert.ok(global.findScope(-1) === null);
            assert.ok(global.findScope(0) === global);
            assert.ok(global.findScope(10) === child1);
            assert.ok(global.findScope(14) === child1);
            assert.ok(global.findScope(15) === child2);
            assert.ok(global.findScope(19) === child2);
            assert.ok(global.findScope(19).parent === global);
        });
        test('scope building', function () {
            var p = new parser.Parser();
            assertScopeBuilding(p, '.class {}', { offset: 7, length: 2 });
            assertScopeBuilding(p, '.class {} .class {}', { offset: 7, length: 2 }, { offset: 17, length: 2 });
        });
        test('symbols in scopes', function () {
            var p = new parser.Parser();
            assertSymbolsInScope(p, '@keyframes animation {};', 0, { name: 'animation', type: nodes.ReferenceType.Keyframe });
            assertSymbolsInScope(p, ' .class1 {} .class2 {}', 0, { name: '.class1', type: nodes.ReferenceType.Rule }, { name: '.class2', type: nodes.ReferenceType.Rule });
        });
        test('scopes and symbols', function () {
            var p = new parser.Parser();
            assertScopesAndSymbols(p, '.class {}', '.class,[]');
            assertScopesAndSymbols(p, '@keyframes animation {}; .class {}', 'animation,.class,[],[]');
            assertScopesAndSymbols(p, '@page :pseudo-class { margin:2in; }', '[]');
            assertScopesAndSymbols(p, '@media print { body { font-size: 10pt } }', '[body,[]]');
            assertScopesAndSymbols(p, '@-moz-keyframes identifier { 0% { top: 0; } 50% { top: 30px; left: 20px; }}', 'identifier,[[],[]]');
            assertScopesAndSymbols(p, '@font-face { font-family: "Bitstream Vera Serif Bold"; }', '[]');
        });
        test('mark occurrences', function () {
            var p = new parser.Parser();
            assertOccurrences(p, '@keyframes id {}; #main { animation: /**/id 4s linear 0s infinite alternate; }', '/**/', 2, 1, nodes.ReferenceType.Keyframe);
            assertOccurrences(p, '@keyframes id {}; #main { animation-name: /**/id; foo: id;}', '/**/', 2, 1, nodes.ReferenceType.Keyframe);
        });
    });
});
//# sourceMappingURL=symbols.test.js.map