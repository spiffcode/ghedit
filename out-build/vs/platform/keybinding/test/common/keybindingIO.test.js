define(["require", "exports", 'assert', 'vs/base/common/keyCodes', 'vs/platform/keybinding/common/keybindingResolver'], function (require, exports, assert, keyCodes_1, keybindingResolver_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Keybinding IO', function () {
        test('serialize/deserialize', function () {
            var WINDOWS = { isMacintosh: false, isWindows: true };
            var MACINTOSH = { isMacintosh: true, isWindows: false };
            var LINUX = { isMacintosh: false, isWindows: false };
            function testOneSerialization(keybinding, expected, msg, Platform) {
                var actualSerialized = keybindingResolver_1.IOSupport.writeKeybinding(keybinding, Platform);
                assert.equal(actualSerialized, expected, expected + ' - ' + msg);
            }
            function testSerialization(keybinding, expectedWin, expectedMac, expectedLinux) {
                testOneSerialization(keybinding, expectedWin, 'win', WINDOWS);
                testOneSerialization(keybinding, expectedMac, 'mac', MACINTOSH);
                testOneSerialization(keybinding, expectedLinux, 'linux', LINUX);
            }
            function testOneDeserialization(keybinding, expected, msg, Platform) {
                var actualDeserialized = keybindingResolver_1.IOSupport.readKeybinding(keybinding, Platform);
                assert.equal(actualDeserialized, expected, keybinding + ' - ' + msg);
            }
            function testDeserialization(inWin, inMac, inLinux, expected) {
                testOneDeserialization(inWin, expected, 'win', WINDOWS);
                testOneDeserialization(inMac, expected, 'mac', MACINTOSH);
                testOneDeserialization(inLinux, expected, 'linux', LINUX);
            }
            function testRoundtrip(keybinding, expectedWin, expectedMac, expectedLinux) {
                testSerialization(keybinding, expectedWin, expectedMac, expectedLinux);
                testDeserialization(expectedWin, expectedMac, expectedLinux, keybinding);
            }
            testRoundtrip(keyCodes_1.KeyCode.KEY_0, '0', '0', '0');
            testRoundtrip(keyCodes_1.KeyCode.KEY_A, 'a', 'a', 'a');
            testRoundtrip(keyCodes_1.KeyCode.UpArrow, 'up', 'up', 'up');
            testRoundtrip(keyCodes_1.KeyCode.RightArrow, 'right', 'right', 'right');
            testRoundtrip(keyCodes_1.KeyCode.DownArrow, 'down', 'down', 'down');
            testRoundtrip(keyCodes_1.KeyCode.LeftArrow, 'left', 'left', 'left');
            // one modifier
            testRoundtrip(keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_A, 'alt+a', 'alt+a', 'alt+a');
            testRoundtrip(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_A, 'ctrl+a', 'cmd+a', 'ctrl+a');
            testRoundtrip(keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_A, 'shift+a', 'shift+a', 'shift+a');
            testRoundtrip(keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A, 'win+a', 'ctrl+a', 'meta+a');
            // two modifiers
            testRoundtrip(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_A, 'ctrl+alt+a', 'alt+cmd+a', 'ctrl+alt+a');
            testRoundtrip(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_A, 'ctrl+shift+a', 'shift+cmd+a', 'ctrl+shift+a');
            testRoundtrip(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A, 'ctrl+win+a', 'ctrl+cmd+a', 'ctrl+meta+a');
            testRoundtrip(keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_A, 'shift+alt+a', 'shift+alt+a', 'shift+alt+a');
            testRoundtrip(keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A, 'shift+win+a', 'ctrl+shift+a', 'shift+meta+a');
            testRoundtrip(keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A, 'alt+win+a', 'ctrl+alt+a', 'alt+meta+a');
            // three modifiers
            testRoundtrip(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_A, 'ctrl+shift+alt+a', 'shift+alt+cmd+a', 'ctrl+shift+alt+a');
            testRoundtrip(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A, 'ctrl+shift+win+a', 'ctrl+shift+cmd+a', 'ctrl+shift+meta+a');
            testRoundtrip(keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A, 'shift+alt+win+a', 'ctrl+shift+alt+a', 'shift+alt+meta+a');
            // all modifiers
            testRoundtrip(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A, 'ctrl+shift+alt+win+a', 'ctrl+shift+alt+cmd+a', 'ctrl+shift+alt+meta+a');
            // chords
            testRoundtrip(keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_A, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_A), 'ctrl+a ctrl+a', 'cmd+a cmd+a', 'ctrl+a ctrl+a');
            testRoundtrip(keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.UpArrow, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.UpArrow), 'ctrl+up ctrl+up', 'cmd+up cmd+up', 'ctrl+up ctrl+up');
            // OEM keys
            testRoundtrip(keyCodes_1.KeyCode.US_SEMICOLON, ';', ';', ';');
            testRoundtrip(keyCodes_1.KeyCode.US_EQUAL, '=', '=', '=');
            testRoundtrip(keyCodes_1.KeyCode.US_COMMA, ',', ',', ',');
            testRoundtrip(keyCodes_1.KeyCode.US_MINUS, '-', '-', '-');
            testRoundtrip(keyCodes_1.KeyCode.US_DOT, '.', '.', '.');
            testRoundtrip(keyCodes_1.KeyCode.US_SLASH, '/', '/', '/');
            testRoundtrip(keyCodes_1.KeyCode.US_BACKTICK, '`', '`', '`');
            testRoundtrip(keyCodes_1.KeyCode.US_OPEN_SQUARE_BRACKET, '[', '[', '[');
            testRoundtrip(keyCodes_1.KeyCode.US_BACKSLASH, '\\', '\\', '\\');
            testRoundtrip(keyCodes_1.KeyCode.US_CLOSE_SQUARE_BRACKET, ']', ']', ']');
            testRoundtrip(keyCodes_1.KeyCode.US_QUOTE, '\'', '\'', '\'');
            testRoundtrip(keyCodes_1.KeyCode.OEM_8, 'oem_8', 'oem_8', 'oem_8');
            testRoundtrip(keyCodes_1.KeyCode.OEM_102, 'oem_102', 'oem_102', 'oem_102');
            // OEM aliases
            testDeserialization('OEM_1', 'OEM_1', 'OEM_1', keyCodes_1.KeyCode.US_SEMICOLON);
            testDeserialization('OEM_PLUS', 'OEM_PLUS', 'OEM_PLUS', keyCodes_1.KeyCode.US_EQUAL);
            testDeserialization('OEM_COMMA', 'OEM_COMMA', 'OEM_COMMA', keyCodes_1.KeyCode.US_COMMA);
            testDeserialization('OEM_MINUS', 'OEM_MINUS', 'OEM_MINUS', keyCodes_1.KeyCode.US_MINUS);
            testDeserialization('OEM_PERIOD', 'OEM_PERIOD', 'OEM_PERIOD', keyCodes_1.KeyCode.US_DOT);
            testDeserialization('OEM_2', 'OEM_2', 'OEM_2', keyCodes_1.KeyCode.US_SLASH);
            testDeserialization('OEM_3', 'OEM_3', 'OEM_3', keyCodes_1.KeyCode.US_BACKTICK);
            testDeserialization('OEM_4', 'OEM_4', 'OEM_4', keyCodes_1.KeyCode.US_OPEN_SQUARE_BRACKET);
            testDeserialization('OEM_5', 'OEM_5', 'OEM_5', keyCodes_1.KeyCode.US_BACKSLASH);
            testDeserialization('OEM_6', 'OEM_6', 'OEM_6', keyCodes_1.KeyCode.US_CLOSE_SQUARE_BRACKET);
            testDeserialization('OEM_7', 'OEM_7', 'OEM_7', keyCodes_1.KeyCode.US_QUOTE);
            testDeserialization('OEM_8', 'OEM_8', 'OEM_8', keyCodes_1.KeyCode.OEM_8);
            testDeserialization('OEM_102', 'OEM_102', 'OEM_102', keyCodes_1.KeyCode.OEM_102);
            // accepts '-' as separator
            testDeserialization('ctrl-shift-alt-win-a', 'ctrl-shift-alt-cmd-a', 'ctrl-shift-alt-meta-a', keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A);
            // various input mistakes
            testDeserialization(' ctrl-shift-alt-win-A ', ' shift-alt-cmd-Ctrl-A ', ' ctrl-shift-alt-META-A ', keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A);
        });
    });
});
//# sourceMappingURL=keybindingIO.test.js.map