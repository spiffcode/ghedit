define(["require", "exports", 'assert', 'vs/base/common/keyCodes'], function (require, exports, assert, keyCodes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('keyCodes', function () {
        test('binary encoding', function () {
            function test(keybinding, k) {
                keybinding = keybinding || { key: keyCodes_1.KeyCode.Unknown };
                assert.equal(keyCodes_1.BinaryKeybindings.hasCtrlCmd(k), !!keybinding.ctrlCmd);
                assert.equal(keyCodes_1.BinaryKeybindings.hasShift(k), !!keybinding.shift);
                assert.equal(keyCodes_1.BinaryKeybindings.hasAlt(k), !!keybinding.alt);
                assert.equal(keyCodes_1.BinaryKeybindings.hasWinCtrl(k), !!keybinding.winCtrl);
                assert.equal(keyCodes_1.BinaryKeybindings.extractKeyCode(k), keybinding.key);
                var chord = keyCodes_1.BinaryKeybindings.extractChordPart(k);
                assert.equal(keyCodes_1.BinaryKeybindings.hasChord(k), !!keybinding.chord);
                if (keybinding.chord) {
                    assert.equal(keyCodes_1.BinaryKeybindings.hasCtrlCmd(chord), !!keybinding.chord.ctrlCmd);
                    assert.equal(keyCodes_1.BinaryKeybindings.hasShift(chord), !!keybinding.chord.shift);
                    assert.equal(keyCodes_1.BinaryKeybindings.hasAlt(chord), !!keybinding.chord.alt);
                    assert.equal(keyCodes_1.BinaryKeybindings.hasWinCtrl(chord), !!keybinding.chord.winCtrl);
                    assert.equal(keyCodes_1.BinaryKeybindings.extractKeyCode(chord), keybinding.chord.key);
                }
            }
            test(null, 0);
            test({ key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyCode.Enter);
            test({ key: keyCodes_1.KeyCode.Enter, chord: { key: keyCodes_1.KeyCode.Tab } }, keyCodes_1.KeyMod.chord(keyCodes_1.KeyCode.Enter, keyCodes_1.KeyCode.Tab));
            test({ ctrlCmd: false, shift: false, alt: false, winCtrl: false, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: false, shift: false, alt: false, winCtrl: true, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: false, shift: false, alt: true, winCtrl: false, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: false, shift: false, alt: true, winCtrl: true, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: false, shift: true, alt: false, winCtrl: false, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: false, shift: true, alt: false, winCtrl: true, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: false, shift: true, alt: true, winCtrl: false, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: false, shift: true, alt: true, winCtrl: true, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: true, shift: false, alt: false, winCtrl: false, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: true, shift: false, alt: false, winCtrl: true, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: true, shift: false, alt: true, winCtrl: false, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: true, shift: false, alt: true, winCtrl: true, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: true, shift: true, alt: false, winCtrl: false, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: true, shift: true, alt: false, winCtrl: true, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: true, shift: true, alt: true, winCtrl: false, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.Enter);
            test({ ctrlCmd: true, shift: true, alt: true, winCtrl: true, key: keyCodes_1.KeyCode.Enter }, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Enter);
            var encoded = keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_Y, keyCodes_1.KeyCode.KEY_Z);
            var encodedFirstPart = keyCodes_1.BinaryKeybindings.extractFirstPart(encoded);
            var encodedSecondPart = keyCodes_1.BinaryKeybindings.extractChordPart(encoded);
            assert.equal(keyCodes_1.BinaryKeybindings.hasChord(encoded), true, 'hasChord');
            assert.equal(encodedFirstPart, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_Y, 'first part');
            assert.equal(encodedSecondPart, encodedSecondPart, 'chord part');
        });
        test('getUserSettingsKeybindingRegex', function () {
            var regex = new RegExp(keyCodes_1.Keybinding.getUserSettingsKeybindingRegex());
            function testIsGood(userSettingsLabel, message) {
                if (message === void 0) { message = userSettingsLabel; }
                var userSettings = '"' + userSettingsLabel.replace(/\\/g, '\\\\') + '"';
                var isGood = regex.test(userSettings);
                assert.ok(isGood, message);
            }
            // check that all key codes are covered by the regex
            var ignore = [];
            ignore[keyCodes_1.KeyCode.Shift] = true;
            ignore[keyCodes_1.KeyCode.Ctrl] = true;
            ignore[keyCodes_1.KeyCode.Alt] = true;
            ignore[keyCodes_1.KeyCode.Meta] = true;
            for (var keyCode = keyCodes_1.KeyCode.Unknown + 1; keyCode < keyCodes_1.KeyCode.MAX_VALUE; keyCode++) {
                if (ignore[keyCode]) {
                    continue;
                }
                var userSettings = keyCodes_1.Keybinding.toUserSettingsLabel(keyCode);
                testIsGood(userSettings, keyCode + ' - ' + keyCodes_1.KeyCode[keyCode] + ' - ' + userSettings);
            }
            // one modifier
            testIsGood('ctrl+a');
            testIsGood('shift+a');
            testIsGood('alt+a');
            testIsGood('cmd+a');
            testIsGood('meta+a');
            testIsGood('win+a');
            // more modifiers
            testIsGood('ctrl+shift+a');
            testIsGood('shift+alt+a');
            testIsGood('ctrl+shift+alt+a');
            // chords
            testIsGood('ctrl+a ctrl+a');
        });
    });
});
//# sourceMappingURL=keyCodes.test.js.map