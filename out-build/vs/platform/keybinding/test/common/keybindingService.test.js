define(["require", "exports", 'assert', 'vs/base/common/keyCodes', 'vs/platform/keybinding/common/keybindingResolver', 'vs/platform/keybinding/common/keybindingService'], function (require, exports, assert, keyCodes_1, keybindingResolver_1, keybindingService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Keybinding Service', function () {
        test('resolve key', function () {
            var keybinding = keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_Z;
            var contextRules = keybindingService_1.KbExpr.equals('bar', 'baz');
            var keybindingItem = {
                command: 'yes',
                context: contextRules,
                keybinding: keybinding,
                weight1: 0,
                weight2: 0
            };
            assert.equal(keybindingResolver_1.KeybindingResolver.contextMatchesRules({ bar: 'baz' }, contextRules), true);
            assert.equal(keybindingResolver_1.KeybindingResolver.contextMatchesRules({ bar: 'bz' }, contextRules), false);
            var resolver = new keybindingResolver_1.KeybindingResolver([keybindingItem], []);
            assert.equal(resolver.resolve({ bar: 'baz' }, 0, keybinding).commandId, 'yes');
            assert.equal(resolver.resolve({ bar: 'bz' }, 0, keybinding), null);
        });
        test('normalizeRule', function () {
            var key1IsTrue = keybindingService_1.KbExpr.equals('key1', true);
            var key1IsNotFalse = keybindingService_1.KbExpr.notEquals('key1', false);
            var key1IsFalse = keybindingService_1.KbExpr.equals('key1', false);
            var key1IsNotTrue = keybindingService_1.KbExpr.notEquals('key1', true);
            assert.ok(key1IsTrue.normalize().equals(keybindingService_1.KbExpr.has('key1')));
            assert.ok(key1IsNotFalse.normalize().equals(keybindingService_1.KbExpr.has('key1')));
            assert.ok(key1IsFalse.normalize().equals(keybindingService_1.KbExpr.not('key1')));
            assert.ok(key1IsNotTrue.normalize().equals(keybindingService_1.KbExpr.not('key1')));
        });
        test('contextIsEntirelyIncluded', function () {
            var assertIsIncluded = function (a, b) {
                assert.equal(keybindingResolver_1.KeybindingResolver.contextIsEntirelyIncluded(false, new keybindingService_1.KbAndExpression(a), new keybindingService_1.KbAndExpression(b)), true);
            };
            var assertIsNotIncluded = function (a, b) {
                assert.equal(keybindingResolver_1.KeybindingResolver.contextIsEntirelyIncluded(false, new keybindingService_1.KbAndExpression(a), new keybindingService_1.KbAndExpression(b)), false);
            };
            var key1IsTrue = keybindingService_1.KbExpr.equals('key1', true);
            var key1IsNotFalse = keybindingService_1.KbExpr.notEquals('key1', false);
            var key1IsFalse = keybindingService_1.KbExpr.equals('key1', false);
            var key1IsNotTrue = keybindingService_1.KbExpr.notEquals('key1', true);
            var key2IsTrue = keybindingService_1.KbExpr.equals('key2', true);
            var key2IsNotFalse = keybindingService_1.KbExpr.notEquals('key2', false);
            var key3IsTrue = keybindingService_1.KbExpr.equals('key3', true);
            var key4IsTrue = keybindingService_1.KbExpr.equals('key4', true);
            assertIsIncluded([key1IsTrue], null);
            assertIsIncluded([key1IsTrue], []);
            assertIsIncluded([key1IsTrue], [key1IsTrue]);
            assertIsIncluded([key1IsTrue], [key1IsNotFalse]);
            assertIsIncluded([key1IsFalse], []);
            assertIsIncluded([key1IsFalse], [key1IsFalse]);
            assertIsIncluded([key1IsFalse], [key1IsNotTrue]);
            assertIsIncluded([key2IsNotFalse], []);
            assertIsIncluded([key2IsNotFalse], [key2IsNotFalse]);
            assertIsIncluded([key2IsNotFalse], [key2IsTrue]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], [key2IsTrue]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], [key2IsNotFalse]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], [key1IsTrue]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], [key1IsNotFalse]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], []);
            assertIsNotIncluded([key1IsTrue], [key1IsFalse]);
            assertIsNotIncluded([key1IsTrue], [key1IsNotTrue]);
            assertIsNotIncluded([key1IsNotFalse], [key1IsFalse]);
            assertIsNotIncluded([key1IsNotFalse], [key1IsNotTrue]);
            assertIsNotIncluded([key1IsFalse], [key1IsTrue]);
            assertIsNotIncluded([key1IsFalse], [key1IsNotFalse]);
            assertIsNotIncluded([key1IsNotTrue], [key1IsTrue]);
            assertIsNotIncluded([key1IsNotTrue], [key1IsNotFalse]);
            assertIsNotIncluded([key1IsTrue, key2IsNotFalse], [key3IsTrue]);
            assertIsNotIncluded([key1IsTrue, key2IsNotFalse], [key4IsTrue]);
            assertIsNotIncluded([key1IsTrue], [key2IsTrue]);
            assertIsNotIncluded([], [key2IsTrue]);
            assertIsNotIncluded(null, [key2IsTrue]);
        });
        test('resolve command', function () {
            var items = [
                // This one will never match because its context is always overwritten by another one
                {
                    keybinding: keyCodes_1.KeyCode.KEY_X,
                    context: keybindingService_1.KbExpr.and(keybindingService_1.KbExpr.equals('key1', true), keybindingService_1.KbExpr.notEquals('key2', false)),
                    command: 'first',
                    weight1: 1,
                    weight2: 0
                },
                // This one always overwrites first
                {
                    keybinding: keyCodes_1.KeyCode.KEY_X,
                    context: keybindingService_1.KbExpr.equals('key2', true),
                    command: 'second',
                    weight1: 2,
                    weight2: 0
                },
                // This one is a secondary mapping for `second`
                {
                    keybinding: keyCodes_1.KeyCode.KEY_Z,
                    context: null,
                    command: 'second',
                    weight1: 2.5,
                    weight2: 0
                },
                // This one sometimes overwrites first
                {
                    keybinding: keyCodes_1.KeyCode.KEY_X,
                    context: keybindingService_1.KbExpr.equals('key3', true),
                    command: 'third',
                    weight1: 3,
                    weight2: 0
                },
                // This one is always overwritten by another one
                {
                    keybinding: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_Y,
                    context: keybindingService_1.KbExpr.equals('key4', true),
                    command: 'fourth',
                    weight1: 4,
                    weight2: 0
                },
                // This one overwrites with a chord the previous one
                {
                    keybinding: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_Y, keyCodes_1.KeyCode.KEY_Z),
                    context: null,
                    command: 'fifth',
                    weight1: 5,
                    weight2: 0
                },
                // This one has no keybinding
                {
                    keybinding: 0,
                    context: null,
                    command: 'sixth',
                    weight1: 6,
                    weight2: 0
                },
                {
                    keybinding: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_U),
                    context: null,
                    command: 'seventh',
                    weight1: 6.5,
                    weight2: 0
                },
                {
                    keybinding: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K),
                    context: null,
                    command: 'seventh',
                    weight1: 6.5,
                    weight2: 0
                },
                {
                    keybinding: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_U),
                    context: null,
                    command: 'uncomment lines',
                    weight1: 7,
                    weight2: 0
                },
                {
                    keybinding: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_C),
                    context: null,
                    command: 'comment lines',
                    weight1: 8,
                    weight2: 0
                },
                {
                    keybinding: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_G, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_C),
                    context: null,
                    command: 'unreachablechord',
                    weight1: 10,
                    weight2: 0
                },
                {
                    keybinding: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_G,
                    context: null,
                    command: 'eleven',
                    weight1: 11,
                    weight2: 0
                }
            ];
            var resolver = new keybindingResolver_1.KeybindingResolver(items, [], false);
            var testKey = function (commandId, expectedKeys) {
                // Test lookup
                var lookupResult = resolver.lookupKeybinding(commandId);
                assert.equal(lookupResult.length, expectedKeys.length, 'Length mismatch @ commandId ' + commandId + '; GOT: ' + JSON.stringify(lookupResult, null, '\t'));
                for (var i = 0, len = lookupResult.length; i < len; i++) {
                    assert.equal(lookupResult[i].value, expectedKeys[i]);
                }
            };
            var testResolve = function (ctx, expectedKey, commandId) {
                if (keyCodes_1.BinaryKeybindings.hasChord(expectedKey)) {
                    var firstPart = keyCodes_1.BinaryKeybindings.extractFirstPart(expectedKey);
                    var chordPart = keyCodes_1.BinaryKeybindings.extractChordPart(expectedKey);
                    var result = resolver.resolve(ctx, 0, firstPart);
                    assert.ok(result !== null, 'Enters chord for ' + commandId);
                    assert.equal(result.commandId, null, 'Enters chord for ' + commandId);
                    assert.equal(result.enterChord, firstPart, 'Enters chord for ' + commandId);
                    result = resolver.resolve(ctx, firstPart, chordPart);
                    assert.ok(result !== null, 'Enters chord for ' + commandId);
                    assert.equal(result.commandId, commandId, 'Finds chorded command ' + commandId);
                    assert.equal(result.enterChord, 0, 'Finds chorded command ' + commandId);
                }
                else {
                    var result = resolver.resolve(ctx, 0, expectedKey);
                    assert.ok(result !== null, 'Finds command ' + commandId);
                    assert.equal(result.commandId, commandId, 'Finds command ' + commandId);
                    assert.equal(result.enterChord, 0, 'Finds command ' + commandId);
                }
            };
            testKey('first', []);
            testKey('second', [keyCodes_1.KeyCode.KEY_Z, keyCodes_1.KeyCode.KEY_X]);
            testResolve({ key2: true }, keyCodes_1.KeyCode.KEY_X, 'second');
            testResolve({}, keyCodes_1.KeyCode.KEY_Z, 'second');
            testKey('third', [keyCodes_1.KeyCode.KEY_X]);
            testResolve({ key3: true }, keyCodes_1.KeyCode.KEY_X, 'third');
            testKey('fourth', []);
            testKey('fifth', [keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_Y, keyCodes_1.KeyCode.KEY_Z)]);
            testResolve({}, keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_Y, keyCodes_1.KeyCode.KEY_Z), 'fifth');
            testKey('seventh', [keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K)]);
            testResolve({}, keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K), 'seventh');
            testKey('uncomment lines', [keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_U)]);
            testResolve({}, keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_U), 'uncomment lines');
            testKey('comment lines', [keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_C)]);
            testResolve({}, keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_C), 'comment lines');
            testKey('unreachablechord', []);
            testKey('eleven', [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_G]);
            testResolve({}, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_G, 'eleven');
            testKey('sixth', []);
        });
        test('contextMatchesRules', function () {
            /* tslint:disable:triple-equals */
            var context = {
                'a': true,
                'b': false,
                'c': '5'
            };
            function testExpression(expr, expected) {
                var rules = keybindingResolver_1.IOSupport.readKeybindingContexts(expr);
                assert.equal(keybindingResolver_1.KeybindingResolver.contextMatchesRules(context, rules), expected, expr);
            }
            function testBatch(expr, value) {
                testExpression(expr, !!value);
                testExpression(expr + ' == true', !!value);
                testExpression(expr + ' != true', !value);
                testExpression(expr + ' == false', !value);
                testExpression(expr + ' != false', !!value);
                testExpression(expr + ' == 5', value == '5');
                testExpression(expr + ' != 5', value != '5');
                testExpression('!' + expr, !value);
            }
            testExpression('', true);
            testBatch('a', true);
            testBatch('b', false);
            testBatch('c', '5');
            testBatch('z', undefined);
            testExpression('a && !b', true && !false);
            testExpression('a && b', true && false);
            testExpression('a && !b && c == 5', true && !false && '5' == '5');
            /* tslint:enable:triple-equals */
        });
    });
});
//# sourceMappingURL=keybindingService.test.js.map