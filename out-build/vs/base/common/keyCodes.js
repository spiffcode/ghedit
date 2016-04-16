/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls', 'vs/base/common/platform'], function (require, exports, nls, defaultPlatform) {
    'use strict';
    /**
     * Virtual Key Codes, the value does not hold any inherent meaning.
     * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
     * But these are "more general", as they should work across browsers & OS`s.
     */
    (function (KeyCode) {
        /**
         * Placed first to cover the 0 value of the enum.
         */
        KeyCode[KeyCode["Unknown"] = 0] = "Unknown";
        KeyCode[KeyCode["Backspace"] = 1] = "Backspace";
        KeyCode[KeyCode["Tab"] = 2] = "Tab";
        KeyCode[KeyCode["Enter"] = 3] = "Enter";
        KeyCode[KeyCode["Shift"] = 4] = "Shift";
        KeyCode[KeyCode["Ctrl"] = 5] = "Ctrl";
        KeyCode[KeyCode["Alt"] = 6] = "Alt";
        KeyCode[KeyCode["PauseBreak"] = 7] = "PauseBreak";
        KeyCode[KeyCode["CapsLock"] = 8] = "CapsLock";
        KeyCode[KeyCode["Escape"] = 9] = "Escape";
        KeyCode[KeyCode["Space"] = 10] = "Space";
        KeyCode[KeyCode["PageUp"] = 11] = "PageUp";
        KeyCode[KeyCode["PageDown"] = 12] = "PageDown";
        KeyCode[KeyCode["End"] = 13] = "End";
        KeyCode[KeyCode["Home"] = 14] = "Home";
        KeyCode[KeyCode["LeftArrow"] = 15] = "LeftArrow";
        KeyCode[KeyCode["UpArrow"] = 16] = "UpArrow";
        KeyCode[KeyCode["RightArrow"] = 17] = "RightArrow";
        KeyCode[KeyCode["DownArrow"] = 18] = "DownArrow";
        KeyCode[KeyCode["Insert"] = 19] = "Insert";
        KeyCode[KeyCode["Delete"] = 20] = "Delete";
        KeyCode[KeyCode["KEY_0"] = 21] = "KEY_0";
        KeyCode[KeyCode["KEY_1"] = 22] = "KEY_1";
        KeyCode[KeyCode["KEY_2"] = 23] = "KEY_2";
        KeyCode[KeyCode["KEY_3"] = 24] = "KEY_3";
        KeyCode[KeyCode["KEY_4"] = 25] = "KEY_4";
        KeyCode[KeyCode["KEY_5"] = 26] = "KEY_5";
        KeyCode[KeyCode["KEY_6"] = 27] = "KEY_6";
        KeyCode[KeyCode["KEY_7"] = 28] = "KEY_7";
        KeyCode[KeyCode["KEY_8"] = 29] = "KEY_8";
        KeyCode[KeyCode["KEY_9"] = 30] = "KEY_9";
        KeyCode[KeyCode["KEY_A"] = 31] = "KEY_A";
        KeyCode[KeyCode["KEY_B"] = 32] = "KEY_B";
        KeyCode[KeyCode["KEY_C"] = 33] = "KEY_C";
        KeyCode[KeyCode["KEY_D"] = 34] = "KEY_D";
        KeyCode[KeyCode["KEY_E"] = 35] = "KEY_E";
        KeyCode[KeyCode["KEY_F"] = 36] = "KEY_F";
        KeyCode[KeyCode["KEY_G"] = 37] = "KEY_G";
        KeyCode[KeyCode["KEY_H"] = 38] = "KEY_H";
        KeyCode[KeyCode["KEY_I"] = 39] = "KEY_I";
        KeyCode[KeyCode["KEY_J"] = 40] = "KEY_J";
        KeyCode[KeyCode["KEY_K"] = 41] = "KEY_K";
        KeyCode[KeyCode["KEY_L"] = 42] = "KEY_L";
        KeyCode[KeyCode["KEY_M"] = 43] = "KEY_M";
        KeyCode[KeyCode["KEY_N"] = 44] = "KEY_N";
        KeyCode[KeyCode["KEY_O"] = 45] = "KEY_O";
        KeyCode[KeyCode["KEY_P"] = 46] = "KEY_P";
        KeyCode[KeyCode["KEY_Q"] = 47] = "KEY_Q";
        KeyCode[KeyCode["KEY_R"] = 48] = "KEY_R";
        KeyCode[KeyCode["KEY_S"] = 49] = "KEY_S";
        KeyCode[KeyCode["KEY_T"] = 50] = "KEY_T";
        KeyCode[KeyCode["KEY_U"] = 51] = "KEY_U";
        KeyCode[KeyCode["KEY_V"] = 52] = "KEY_V";
        KeyCode[KeyCode["KEY_W"] = 53] = "KEY_W";
        KeyCode[KeyCode["KEY_X"] = 54] = "KEY_X";
        KeyCode[KeyCode["KEY_Y"] = 55] = "KEY_Y";
        KeyCode[KeyCode["KEY_Z"] = 56] = "KEY_Z";
        KeyCode[KeyCode["Meta"] = 57] = "Meta";
        KeyCode[KeyCode["ContextMenu"] = 58] = "ContextMenu";
        KeyCode[KeyCode["F1"] = 59] = "F1";
        KeyCode[KeyCode["F2"] = 60] = "F2";
        KeyCode[KeyCode["F3"] = 61] = "F3";
        KeyCode[KeyCode["F4"] = 62] = "F4";
        KeyCode[KeyCode["F5"] = 63] = "F5";
        KeyCode[KeyCode["F6"] = 64] = "F6";
        KeyCode[KeyCode["F7"] = 65] = "F7";
        KeyCode[KeyCode["F8"] = 66] = "F8";
        KeyCode[KeyCode["F9"] = 67] = "F9";
        KeyCode[KeyCode["F10"] = 68] = "F10";
        KeyCode[KeyCode["F11"] = 69] = "F11";
        KeyCode[KeyCode["F12"] = 70] = "F12";
        KeyCode[KeyCode["F13"] = 71] = "F13";
        KeyCode[KeyCode["F14"] = 72] = "F14";
        KeyCode[KeyCode["F15"] = 73] = "F15";
        KeyCode[KeyCode["F16"] = 74] = "F16";
        KeyCode[KeyCode["F17"] = 75] = "F17";
        KeyCode[KeyCode["F18"] = 76] = "F18";
        KeyCode[KeyCode["F19"] = 77] = "F19";
        KeyCode[KeyCode["NumLock"] = 78] = "NumLock";
        KeyCode[KeyCode["ScrollLock"] = 79] = "ScrollLock";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ';:' key
         */
        KeyCode[KeyCode["US_SEMICOLON"] = 80] = "US_SEMICOLON";
        /**
         * For any country/region, the '+' key
         * For the US standard keyboard, the '=+' key
         */
        KeyCode[KeyCode["US_EQUAL"] = 81] = "US_EQUAL";
        /**
         * For any country/region, the ',' key
         * For the US standard keyboard, the ',<' key
         */
        KeyCode[KeyCode["US_COMMA"] = 82] = "US_COMMA";
        /**
         * For any country/region, the '-' key
         * For the US standard keyboard, the '-_' key
         */
        KeyCode[KeyCode["US_MINUS"] = 83] = "US_MINUS";
        /**
         * For any country/region, the '.' key
         * For the US standard keyboard, the '.>' key
         */
        KeyCode[KeyCode["US_DOT"] = 84] = "US_DOT";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '/?' key
         */
        KeyCode[KeyCode["US_SLASH"] = 85] = "US_SLASH";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '`~' key
         */
        KeyCode[KeyCode["US_BACKTICK"] = 86] = "US_BACKTICK";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '[{' key
         */
        KeyCode[KeyCode["US_OPEN_SQUARE_BRACKET"] = 87] = "US_OPEN_SQUARE_BRACKET";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '\|' key
         */
        KeyCode[KeyCode["US_BACKSLASH"] = 88] = "US_BACKSLASH";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ']}' key
         */
        KeyCode[KeyCode["US_CLOSE_SQUARE_BRACKET"] = 89] = "US_CLOSE_SQUARE_BRACKET";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ''"' key
         */
        KeyCode[KeyCode["US_QUOTE"] = 90] = "US_QUOTE";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         */
        KeyCode[KeyCode["OEM_8"] = 91] = "OEM_8";
        /**
         * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
         */
        KeyCode[KeyCode["OEM_102"] = 92] = "OEM_102";
        KeyCode[KeyCode["NUMPAD_0"] = 93] = "NUMPAD_0";
        KeyCode[KeyCode["NUMPAD_1"] = 94] = "NUMPAD_1";
        KeyCode[KeyCode["NUMPAD_2"] = 95] = "NUMPAD_2";
        KeyCode[KeyCode["NUMPAD_3"] = 96] = "NUMPAD_3";
        KeyCode[KeyCode["NUMPAD_4"] = 97] = "NUMPAD_4";
        KeyCode[KeyCode["NUMPAD_5"] = 98] = "NUMPAD_5";
        KeyCode[KeyCode["NUMPAD_6"] = 99] = "NUMPAD_6";
        KeyCode[KeyCode["NUMPAD_7"] = 100] = "NUMPAD_7";
        KeyCode[KeyCode["NUMPAD_8"] = 101] = "NUMPAD_8";
        KeyCode[KeyCode["NUMPAD_9"] = 102] = "NUMPAD_9";
        KeyCode[KeyCode["NUMPAD_MULTIPLY"] = 103] = "NUMPAD_MULTIPLY";
        KeyCode[KeyCode["NUMPAD_ADD"] = 104] = "NUMPAD_ADD";
        KeyCode[KeyCode["NUMPAD_SEPARATOR"] = 105] = "NUMPAD_SEPARATOR";
        KeyCode[KeyCode["NUMPAD_SUBTRACT"] = 106] = "NUMPAD_SUBTRACT";
        KeyCode[KeyCode["NUMPAD_DECIMAL"] = 107] = "NUMPAD_DECIMAL";
        KeyCode[KeyCode["NUMPAD_DIVIDE"] = 108] = "NUMPAD_DIVIDE";
        /**
         * Placed last to cover the length of the enum.
         */
        KeyCode[KeyCode["MAX_VALUE"] = 109] = "MAX_VALUE";
    })(exports.KeyCode || (exports.KeyCode = {}));
    var KeyCode = exports.KeyCode;
    var Mapping = (function () {
        function Mapping(fromKeyCode, toKeyCode) {
            this._fromKeyCode = fromKeyCode;
            this._toKeyCode = toKeyCode;
        }
        Mapping.prototype.fromKeyCode = function (keyCode) {
            return this._fromKeyCode[keyCode];
        };
        Mapping.prototype.toKeyCode = function (str) {
            if (this._toKeyCode.hasOwnProperty(str)) {
                return this._toKeyCode[str];
            }
            return KeyCode.Unknown;
        };
        return Mapping;
    }());
    function createMapping(fill1, fill2) {
        var MAP = [];
        fill1(MAP);
        var REVERSE_MAP = {};
        for (var i = 0, len = MAP.length; i < len; i++) {
            if (!MAP[i]) {
                continue;
            }
            REVERSE_MAP[MAP[i]] = i;
        }
        fill2(REVERSE_MAP);
        var FINAL_REVERSE_MAP = {};
        for (var entry in REVERSE_MAP) {
            if (REVERSE_MAP.hasOwnProperty(entry)) {
                FINAL_REVERSE_MAP[entry] = REVERSE_MAP[entry];
                FINAL_REVERSE_MAP[entry.toLowerCase()] = REVERSE_MAP[entry];
            }
        }
        return new Mapping(MAP, FINAL_REVERSE_MAP);
    }
    var STRING = createMapping(function (TO_STRING_MAP) {
        TO_STRING_MAP[KeyCode.Unknown] = 'unknown';
        TO_STRING_MAP[KeyCode.Backspace] = 'Backspace';
        TO_STRING_MAP[KeyCode.Tab] = 'Tab';
        TO_STRING_MAP[KeyCode.Enter] = 'Enter';
        TO_STRING_MAP[KeyCode.Shift] = 'Shift';
        TO_STRING_MAP[KeyCode.Ctrl] = 'Ctrl';
        TO_STRING_MAP[KeyCode.Alt] = 'Alt';
        TO_STRING_MAP[KeyCode.PauseBreak] = 'PauseBreak';
        TO_STRING_MAP[KeyCode.CapsLock] = 'CapsLock';
        TO_STRING_MAP[KeyCode.Escape] = 'Escape';
        TO_STRING_MAP[KeyCode.Space] = 'Space';
        TO_STRING_MAP[KeyCode.PageUp] = 'PageUp';
        TO_STRING_MAP[KeyCode.PageDown] = 'PageDown';
        TO_STRING_MAP[KeyCode.End] = 'End';
        TO_STRING_MAP[KeyCode.Home] = 'Home';
        TO_STRING_MAP[KeyCode.LeftArrow] = 'LeftArrow';
        TO_STRING_MAP[KeyCode.UpArrow] = 'UpArrow';
        TO_STRING_MAP[KeyCode.RightArrow] = 'RightArrow';
        TO_STRING_MAP[KeyCode.DownArrow] = 'DownArrow';
        TO_STRING_MAP[KeyCode.Insert] = 'Insert';
        TO_STRING_MAP[KeyCode.Delete] = 'Delete';
        TO_STRING_MAP[KeyCode.KEY_0] = '0';
        TO_STRING_MAP[KeyCode.KEY_1] = '1';
        TO_STRING_MAP[KeyCode.KEY_2] = '2';
        TO_STRING_MAP[KeyCode.KEY_3] = '3';
        TO_STRING_MAP[KeyCode.KEY_4] = '4';
        TO_STRING_MAP[KeyCode.KEY_5] = '5';
        TO_STRING_MAP[KeyCode.KEY_6] = '6';
        TO_STRING_MAP[KeyCode.KEY_7] = '7';
        TO_STRING_MAP[KeyCode.KEY_8] = '8';
        TO_STRING_MAP[KeyCode.KEY_9] = '9';
        TO_STRING_MAP[KeyCode.KEY_A] = 'A';
        TO_STRING_MAP[KeyCode.KEY_B] = 'B';
        TO_STRING_MAP[KeyCode.KEY_C] = 'C';
        TO_STRING_MAP[KeyCode.KEY_D] = 'D';
        TO_STRING_MAP[KeyCode.KEY_E] = 'E';
        TO_STRING_MAP[KeyCode.KEY_F] = 'F';
        TO_STRING_MAP[KeyCode.KEY_G] = 'G';
        TO_STRING_MAP[KeyCode.KEY_H] = 'H';
        TO_STRING_MAP[KeyCode.KEY_I] = 'I';
        TO_STRING_MAP[KeyCode.KEY_J] = 'J';
        TO_STRING_MAP[KeyCode.KEY_K] = 'K';
        TO_STRING_MAP[KeyCode.KEY_L] = 'L';
        TO_STRING_MAP[KeyCode.KEY_M] = 'M';
        TO_STRING_MAP[KeyCode.KEY_N] = 'N';
        TO_STRING_MAP[KeyCode.KEY_O] = 'O';
        TO_STRING_MAP[KeyCode.KEY_P] = 'P';
        TO_STRING_MAP[KeyCode.KEY_Q] = 'Q';
        TO_STRING_MAP[KeyCode.KEY_R] = 'R';
        TO_STRING_MAP[KeyCode.KEY_S] = 'S';
        TO_STRING_MAP[KeyCode.KEY_T] = 'T';
        TO_STRING_MAP[KeyCode.KEY_U] = 'U';
        TO_STRING_MAP[KeyCode.KEY_V] = 'V';
        TO_STRING_MAP[KeyCode.KEY_W] = 'W';
        TO_STRING_MAP[KeyCode.KEY_X] = 'X';
        TO_STRING_MAP[KeyCode.KEY_Y] = 'Y';
        TO_STRING_MAP[KeyCode.KEY_Z] = 'Z';
        TO_STRING_MAP[KeyCode.ContextMenu] = 'ContextMenu';
        TO_STRING_MAP[KeyCode.F1] = 'F1';
        TO_STRING_MAP[KeyCode.F2] = 'F2';
        TO_STRING_MAP[KeyCode.F3] = 'F3';
        TO_STRING_MAP[KeyCode.F4] = 'F4';
        TO_STRING_MAP[KeyCode.F5] = 'F5';
        TO_STRING_MAP[KeyCode.F6] = 'F6';
        TO_STRING_MAP[KeyCode.F7] = 'F7';
        TO_STRING_MAP[KeyCode.F8] = 'F8';
        TO_STRING_MAP[KeyCode.F9] = 'F9';
        TO_STRING_MAP[KeyCode.F10] = 'F10';
        TO_STRING_MAP[KeyCode.F11] = 'F11';
        TO_STRING_MAP[KeyCode.F12] = 'F12';
        TO_STRING_MAP[KeyCode.F13] = 'F13';
        TO_STRING_MAP[KeyCode.F14] = 'F14';
        TO_STRING_MAP[KeyCode.F15] = 'F15';
        TO_STRING_MAP[KeyCode.F16] = 'F16';
        TO_STRING_MAP[KeyCode.F17] = 'F17';
        TO_STRING_MAP[KeyCode.F18] = 'F18';
        TO_STRING_MAP[KeyCode.F19] = 'F19';
        TO_STRING_MAP[KeyCode.NumLock] = 'NumLock';
        TO_STRING_MAP[KeyCode.ScrollLock] = 'ScrollLock';
        TO_STRING_MAP[KeyCode.US_SEMICOLON] = ';';
        TO_STRING_MAP[KeyCode.US_EQUAL] = '=';
        TO_STRING_MAP[KeyCode.US_COMMA] = ',';
        TO_STRING_MAP[KeyCode.US_MINUS] = '-';
        TO_STRING_MAP[KeyCode.US_DOT] = '.';
        TO_STRING_MAP[KeyCode.US_SLASH] = '/';
        TO_STRING_MAP[KeyCode.US_BACKTICK] = '`';
        TO_STRING_MAP[KeyCode.US_OPEN_SQUARE_BRACKET] = '[';
        TO_STRING_MAP[KeyCode.US_BACKSLASH] = '\\';
        TO_STRING_MAP[KeyCode.US_CLOSE_SQUARE_BRACKET] = ']';
        TO_STRING_MAP[KeyCode.US_QUOTE] = '\'';
        TO_STRING_MAP[KeyCode.OEM_8] = 'OEM_8';
        TO_STRING_MAP[KeyCode.OEM_102] = 'OEM_102';
        TO_STRING_MAP[KeyCode.NUMPAD_0] = 'NumPad0';
        TO_STRING_MAP[KeyCode.NUMPAD_1] = 'NumPad1';
        TO_STRING_MAP[KeyCode.NUMPAD_2] = 'NumPad2';
        TO_STRING_MAP[KeyCode.NUMPAD_3] = 'NumPad3';
        TO_STRING_MAP[KeyCode.NUMPAD_4] = 'NumPad4';
        TO_STRING_MAP[KeyCode.NUMPAD_5] = 'NumPad5';
        TO_STRING_MAP[KeyCode.NUMPAD_6] = 'NumPad6';
        TO_STRING_MAP[KeyCode.NUMPAD_7] = 'NumPad7';
        TO_STRING_MAP[KeyCode.NUMPAD_8] = 'NumPad8';
        TO_STRING_MAP[KeyCode.NUMPAD_9] = 'NumPad9';
        TO_STRING_MAP[KeyCode.NUMPAD_MULTIPLY] = 'NumPad_Multiply';
        TO_STRING_MAP[KeyCode.NUMPAD_ADD] = 'NumPad_Add';
        TO_STRING_MAP[KeyCode.NUMPAD_SEPARATOR] = 'NumPad_Separator';
        TO_STRING_MAP[KeyCode.NUMPAD_SUBTRACT] = 'NumPad_Subtract';
        TO_STRING_MAP[KeyCode.NUMPAD_DECIMAL] = 'NumPad_Decimal';
        TO_STRING_MAP[KeyCode.NUMPAD_DIVIDE] = 'NumPad_Divide';
        // for (let i = 0; i < KeyCode.MAX_VALUE; i++) {
        // 	if (!TO_STRING_MAP[i]) {
        // 		console.warn('Missing string representation for ' + KeyCode[i]);
        // 	}
        // }
    }, function (FROM_STRING_MAP) {
        FROM_STRING_MAP['\r'] = KeyCode.Enter;
    });
    var USER_SETTINGS = createMapping(function (TO_USER_SETTINGS_MAP) {
        for (var i = 0, len = STRING._fromKeyCode.length; i < len; i++) {
            TO_USER_SETTINGS_MAP[i] = STRING._fromKeyCode[i];
        }
        TO_USER_SETTINGS_MAP[KeyCode.LeftArrow] = 'Left';
        TO_USER_SETTINGS_MAP[KeyCode.UpArrow] = 'Up';
        TO_USER_SETTINGS_MAP[KeyCode.RightArrow] = 'Right';
        TO_USER_SETTINGS_MAP[KeyCode.DownArrow] = 'Down';
    }, function (FROM_USER_SETTINGS_MAP) {
        FROM_USER_SETTINGS_MAP['OEM_1'] = KeyCode.US_SEMICOLON;
        FROM_USER_SETTINGS_MAP['OEM_PLUS'] = KeyCode.US_EQUAL;
        FROM_USER_SETTINGS_MAP['OEM_COMMA'] = KeyCode.US_COMMA;
        FROM_USER_SETTINGS_MAP['OEM_MINUS'] = KeyCode.US_MINUS;
        FROM_USER_SETTINGS_MAP['OEM_PERIOD'] = KeyCode.US_DOT;
        FROM_USER_SETTINGS_MAP['OEM_2'] = KeyCode.US_SLASH;
        FROM_USER_SETTINGS_MAP['OEM_3'] = KeyCode.US_BACKTICK;
        FROM_USER_SETTINGS_MAP['OEM_4'] = KeyCode.US_OPEN_SQUARE_BRACKET;
        FROM_USER_SETTINGS_MAP['OEM_5'] = KeyCode.US_BACKSLASH;
        FROM_USER_SETTINGS_MAP['OEM_6'] = KeyCode.US_CLOSE_SQUARE_BRACKET;
        FROM_USER_SETTINGS_MAP['OEM_7'] = KeyCode.US_QUOTE;
        FROM_USER_SETTINGS_MAP['OEM_8'] = KeyCode.OEM_8;
        FROM_USER_SETTINGS_MAP['OEM_102'] = KeyCode.OEM_102;
    });
    var KeyCode;
    (function (KeyCode) {
        function toString(key) {
            return STRING.fromKeyCode(key);
        }
        KeyCode.toString = toString;
        function fromString(key) {
            return STRING.toKeyCode(key);
        }
        KeyCode.fromString = fromString;
    })(KeyCode = exports.KeyCode || (exports.KeyCode = {}));
    // Binary encoding strategy:
    // 15:  1 bit for ctrlCmd
    // 14:  1 bit for shift
    // 13:  1 bit for alt
    // 12:  1 bit for winCtrl
    //  0: 12 bits for keyCode (up to a maximum keyCode of 4096. Given we have 83 at this point thats good enough)
    var BIN_CTRLCMD_MASK = 1 << 15;
    var BIN_SHIFT_MASK = 1 << 14;
    var BIN_ALT_MASK = 1 << 13;
    var BIN_WINCTRL_MASK = 1 << 12;
    var BIN_KEYCODE_MASK = 0x00000fff;
    var BinaryKeybindings = (function () {
        function BinaryKeybindings() {
        }
        BinaryKeybindings.extractFirstPart = function (keybinding) {
            return keybinding & 0x0000ffff;
        };
        BinaryKeybindings.extractChordPart = function (keybinding) {
            return (keybinding >> 16) & 0x0000ffff;
        };
        BinaryKeybindings.hasChord = function (keybinding) {
            return (this.extractChordPart(keybinding) !== 0);
        };
        BinaryKeybindings.hasCtrlCmd = function (keybinding) {
            return (keybinding & BIN_CTRLCMD_MASK ? true : false);
        };
        BinaryKeybindings.hasShift = function (keybinding) {
            return (keybinding & BIN_SHIFT_MASK ? true : false);
        };
        BinaryKeybindings.hasAlt = function (keybinding) {
            return (keybinding & BIN_ALT_MASK ? true : false);
        };
        BinaryKeybindings.hasWinCtrl = function (keybinding) {
            return (keybinding & BIN_WINCTRL_MASK ? true : false);
        };
        BinaryKeybindings.extractKeyCode = function (keybinding) {
            return (keybinding & BIN_KEYCODE_MASK);
        };
        return BinaryKeybindings;
    }());
    exports.BinaryKeybindings = BinaryKeybindings;
    var KeyMod = (function () {
        function KeyMod() {
        }
        KeyMod.chord = function (firstPart, secondPart) {
            return firstPart | ((secondPart & 0x0000ffff) << 16);
        };
        KeyMod.CtrlCmd = BIN_CTRLCMD_MASK;
        KeyMod.Shift = BIN_SHIFT_MASK;
        KeyMod.Alt = BIN_ALT_MASK;
        KeyMod.WinCtrl = BIN_WINCTRL_MASK;
        return KeyMod;
    }());
    exports.KeyMod = KeyMod;
    /**
     * A set of usual keybindings that can be reused in code
     */
    var CommonKeybindings = (function () {
        function CommonKeybindings() {
        }
        CommonKeybindings.ENTER = KeyCode.Enter;
        CommonKeybindings.SHIFT_ENTER = KeyMod.Shift | KeyCode.Enter;
        CommonKeybindings.CTRLCMD_ENTER = KeyMod.CtrlCmd | KeyCode.Enter;
        CommonKeybindings.WINCTRL_ENTER = KeyMod.WinCtrl | KeyCode.Enter;
        CommonKeybindings.TAB = KeyCode.Tab;
        CommonKeybindings.SHIFT_TAB = KeyMod.Shift | KeyCode.Tab;
        CommonKeybindings.ESCAPE = KeyCode.Escape;
        CommonKeybindings.SPACE = KeyCode.Space;
        CommonKeybindings.DELETE = KeyCode.Delete;
        CommonKeybindings.SHIFT_DELETE = KeyMod.Shift | KeyCode.Delete;
        CommonKeybindings.CTRLCMD_BACKSPACE = KeyMod.CtrlCmd | KeyCode.Backspace;
        CommonKeybindings.UP_ARROW = KeyCode.UpArrow;
        CommonKeybindings.SHIFT_UP_ARROW = KeyMod.Shift | KeyCode.UpArrow;
        CommonKeybindings.CTRLCMD_UP_ARROW = KeyMod.CtrlCmd | KeyCode.UpArrow;
        CommonKeybindings.DOWN_ARROW = KeyCode.DownArrow;
        CommonKeybindings.SHIFT_DOWN_ARROW = KeyMod.Shift | KeyCode.DownArrow;
        CommonKeybindings.CTRLCMD_DOWN_ARROW = KeyMod.CtrlCmd | KeyCode.DownArrow;
        CommonKeybindings.LEFT_ARROW = KeyCode.LeftArrow;
        CommonKeybindings.RIGHT_ARROW = KeyCode.RightArrow;
        CommonKeybindings.PAGE_UP = KeyCode.PageUp;
        CommonKeybindings.SHIFT_PAGE_UP = KeyMod.Shift | KeyCode.PageUp;
        CommonKeybindings.PAGE_DOWN = KeyCode.PageDown;
        CommonKeybindings.SHIFT_PAGE_DOWN = KeyMod.Shift | KeyCode.PageDown;
        CommonKeybindings.F2 = KeyCode.F2;
        CommonKeybindings.CTRLCMD_S = KeyMod.CtrlCmd | KeyCode.KEY_S;
        CommonKeybindings.CTRLCMD_C = KeyMod.CtrlCmd | KeyCode.KEY_C;
        CommonKeybindings.CTRLCMD_V = KeyMod.CtrlCmd | KeyCode.KEY_V;
        return CommonKeybindings;
    }());
    exports.CommonKeybindings = CommonKeybindings;
    var Keybinding = (function () {
        function Keybinding(keybinding) {
            this.value = keybinding;
        }
        /**
         * Format the binding to a format appropiate for rendering in the UI
         */
        Keybinding._toUSLabel = function (value, Platform) {
            return _asString(value, (Platform.isMacintosh ? MacUIKeyLabelProvider.INSTANCE : ClassicUIKeyLabelProvider.INSTANCE), Platform);
        };
        /**
         * Format the binding to a format appropiate for placing in an aria-label.
         */
        Keybinding._toUSAriaLabel = function (value, Platform) {
            return _asString(value, AriaKeyLabelProvider.INSTANCE, Platform);
        };
        /**
         * Format the binding to a format appropiate for rendering in the UI
         */
        Keybinding._toUSHTMLLabel = function (value, Platform) {
            return _asHTML(value, (Platform.isMacintosh ? MacUIKeyLabelProvider.INSTANCE : ClassicUIKeyLabelProvider.INSTANCE), Platform);
        };
        /**
         * Format the binding to a format appropiate for rendering in the UI
         */
        Keybinding._toCustomLabel = function (value, labelProvider, Platform) {
            return _asString(value, labelProvider, Platform);
        };
        /**
         * Format the binding to a format appropiate for rendering in the UI
         */
        Keybinding._toCustomHTMLLabel = function (value, labelProvider, Platform) {
            return _asHTML(value, labelProvider, Platform);
        };
        /**
         * This prints the binding in a format suitable for electron's accelerators.
         * See https://github.com/atom/electron/blob/master/docs/api/accelerator.md
         */
        Keybinding._toElectronAccelerator = function (value, Platform) {
            if (BinaryKeybindings.hasChord(value)) {
                // Electron cannot handle chords
                return null;
            }
            return _asString(value, ElectronAcceleratorLabelProvider.INSTANCE, Platform);
        };
        Keybinding.getUserSettingsKeybindingRegex = function () {
            if (!this._cachedKeybindingRegex) {
                var numpadKey = 'numpad(0|1|2|3|4|5|6|7|8|9|_multiply|_add|_subtract|_decimal|_divide|_separator)';
                var oemKey = '`|\\-|=|\\[|\\]|\\\\\\\\|;|\'|,|\\.|\\/|oem_8|oem_102';
                var specialKey = 'left|up|right|down|pageup|pagedown|end|home|tab|enter|escape|space|backspace|delete|pausebreak|capslock|insert|contextmenu|numlock|scrolllock';
                var casualKey = '[a-z]|[0-9]|f(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19)';
                var key = '((' + [numpadKey, oemKey, specialKey, casualKey].join(')|(') + '))';
                var mod = '((ctrl|shift|alt|cmd|win|meta)\\+)*';
                var keybinding = '(' + mod + key + ')';
                this._cachedKeybindingRegex = '"\\s*(' + keybinding + '(\\s+' + keybinding + ')?' + ')\\s*"';
            }
            return this._cachedKeybindingRegex;
        };
        /**
         * Format the binding to a format appropiate for the user settings file.
         */
        Keybinding.toUserSettingsLabel = function (value, Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            var result = _asString(value, UserSettingsKeyLabelProvider.INSTANCE, Platform);
            result = result.toLowerCase();
            if (Platform.isMacintosh) {
                result = result.replace(/meta/g, 'cmd');
            }
            else if (Platform.isWindows) {
                result = result.replace(/meta/g, 'win');
            }
            return result;
        };
        Keybinding.fromUserSettingsLabel = function (input, Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            if (!input) {
                return null;
            }
            input = input.toLowerCase().trim();
            var ctrlCmd = false, shift = false, alt = false, winCtrl = false, key = '';
            while (/^(ctrl|shift|alt|meta|win|cmd)(\+|\-)/.test(input)) {
                if (/^ctrl(\+|\-)/.test(input)) {
                    if (Platform.isMacintosh) {
                        winCtrl = true;
                    }
                    else {
                        ctrlCmd = true;
                    }
                    input = input.substr('ctrl-'.length);
                }
                if (/^shift(\+|\-)/.test(input)) {
                    shift = true;
                    input = input.substr('shift-'.length);
                }
                if (/^alt(\+|\-)/.test(input)) {
                    alt = true;
                    input = input.substr('alt-'.length);
                }
                if (/^meta(\+|\-)/.test(input)) {
                    if (Platform.isMacintosh) {
                        ctrlCmd = true;
                    }
                    else {
                        winCtrl = true;
                    }
                    input = input.substr('meta-'.length);
                }
                if (/^win(\+|\-)/.test(input)) {
                    if (Platform.isMacintosh) {
                        ctrlCmd = true;
                    }
                    else {
                        winCtrl = true;
                    }
                    input = input.substr('win-'.length);
                }
                if (/^cmd(\+|\-)/.test(input)) {
                    if (Platform.isMacintosh) {
                        ctrlCmd = true;
                    }
                    else {
                        winCtrl = true;
                    }
                    input = input.substr('cmd-'.length);
                }
            }
            var chord = 0;
            var firstSpaceIdx = input.indexOf(' ');
            if (firstSpaceIdx > 0) {
                key = input.substring(0, firstSpaceIdx);
                chord = Keybinding.fromUserSettingsLabel(input.substring(firstSpaceIdx), Platform);
            }
            else {
                key = input;
            }
            var keyCode = USER_SETTINGS.toKeyCode(key);
            var result = 0;
            if (ctrlCmd) {
                result |= KeyMod.CtrlCmd;
            }
            if (shift) {
                result |= KeyMod.Shift;
            }
            if (alt) {
                result |= KeyMod.Alt;
            }
            if (winCtrl) {
                result |= KeyMod.WinCtrl;
            }
            result |= keyCode;
            return KeyMod.chord(result, chord);
        };
        Keybinding.prototype.hasCtrlCmd = function () {
            return BinaryKeybindings.hasCtrlCmd(this.value);
        };
        Keybinding.prototype.hasShift = function () {
            return BinaryKeybindings.hasShift(this.value);
        };
        Keybinding.prototype.hasAlt = function () {
            return BinaryKeybindings.hasAlt(this.value);
        };
        Keybinding.prototype.hasWinCtrl = function () {
            return BinaryKeybindings.hasWinCtrl(this.value);
        };
        Keybinding.prototype.extractKeyCode = function () {
            return BinaryKeybindings.extractKeyCode(this.value);
        };
        /**
         * Format the binding to a format appropiate for rendering in the UI
         */
        Keybinding.prototype._toUSLabel = function (Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            return Keybinding._toUSLabel(this.value, Platform);
        };
        /**
         * Format the binding to a format appropiate for placing in an aria-label.
         */
        Keybinding.prototype._toUSAriaLabel = function (Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            return Keybinding._toUSAriaLabel(this.value, Platform);
        };
        /**
         * Format the binding to a format appropiate for rendering in the UI
         */
        Keybinding.prototype._toUSHTMLLabel = function (Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            return Keybinding._toUSHTMLLabel(this.value, Platform);
        };
        /**
         * Format the binding to a format appropiate for rendering in the UI
         */
        Keybinding.prototype.toCustomLabel = function (labelProvider, Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            return Keybinding._toCustomLabel(this.value, labelProvider, Platform);
        };
        /**
         * Format the binding to a format appropiate for rendering in the UI
         */
        Keybinding.prototype.toCustomHTMLLabel = function (labelProvider, Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            return Keybinding._toCustomHTMLLabel(this.value, labelProvider, Platform);
        };
        /**
         * This prints the binding in a format suitable for electron's accelerators.
         * See https://github.com/atom/electron/blob/master/docs/api/accelerator.md
         */
        Keybinding.prototype._toElectronAccelerator = function (Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            return Keybinding._toElectronAccelerator(this.value, Platform);
        };
        /**
         * Format the binding to a format appropiate for the user settings file.
         */
        Keybinding.prototype.toUserSettingsLabel = function (Platform) {
            if (Platform === void 0) { Platform = defaultPlatform; }
            return Keybinding.toUserSettingsLabel(this.value, Platform);
        };
        Keybinding._cachedKeybindingRegex = null;
        return Keybinding;
    }());
    exports.Keybinding = Keybinding;
    /**
     * Print for Electron
     */
    var ElectronAcceleratorLabelProvider = (function () {
        function ElectronAcceleratorLabelProvider() {
            this.ctrlKeyLabel = 'Ctrl';
            this.shiftKeyLabel = 'Shift';
            this.altKeyLabel = 'Alt';
            this.cmdKeyLabel = 'Cmd';
            this.windowsKeyLabel = 'Super';
            this.modifierSeparator = '+';
        }
        ElectronAcceleratorLabelProvider.prototype.getLabelForKey = function (keyCode) {
            switch (keyCode) {
                case KeyCode.UpArrow:
                    return 'Up';
                case KeyCode.DownArrow:
                    return 'Down';
                case KeyCode.LeftArrow:
                    return 'Left';
                case KeyCode.RightArrow:
                    return 'Right';
            }
            return KeyCode.toString(keyCode);
        };
        ElectronAcceleratorLabelProvider.INSTANCE = new ElectronAcceleratorLabelProvider();
        return ElectronAcceleratorLabelProvider;
    }());
    exports.ElectronAcceleratorLabelProvider = ElectronAcceleratorLabelProvider;
    /**
     * Print for Mac UI
     */
    var MacUIKeyLabelProvider = (function () {
        function MacUIKeyLabelProvider() {
            this.ctrlKeyLabel = '\u2303';
            this.shiftKeyLabel = '\u21E7';
            this.altKeyLabel = '\u2325';
            this.cmdKeyLabel = '\u2318';
            this.windowsKeyLabel = nls.localize('windowsKey', "Windows");
            this.modifierSeparator = '';
        }
        MacUIKeyLabelProvider.prototype.getLabelForKey = function (keyCode) {
            switch (keyCode) {
                case KeyCode.LeftArrow:
                    return MacUIKeyLabelProvider.leftArrowUnicodeLabel;
                case KeyCode.UpArrow:
                    return MacUIKeyLabelProvider.upArrowUnicodeLabel;
                case KeyCode.RightArrow:
                    return MacUIKeyLabelProvider.rightArrowUnicodeLabel;
                case KeyCode.DownArrow:
                    return MacUIKeyLabelProvider.downArrowUnicodeLabel;
            }
            return KeyCode.toString(keyCode);
        };
        MacUIKeyLabelProvider.INSTANCE = new MacUIKeyLabelProvider();
        MacUIKeyLabelProvider.leftArrowUnicodeLabel = String.fromCharCode(8592);
        MacUIKeyLabelProvider.upArrowUnicodeLabel = String.fromCharCode(8593);
        MacUIKeyLabelProvider.rightArrowUnicodeLabel = String.fromCharCode(8594);
        MacUIKeyLabelProvider.downArrowUnicodeLabel = String.fromCharCode(8595);
        return MacUIKeyLabelProvider;
    }());
    exports.MacUIKeyLabelProvider = MacUIKeyLabelProvider;
    /**
     * Aria label provider for Mac.
     */
    var AriaKeyLabelProvider = (function () {
        function AriaKeyLabelProvider() {
            this.ctrlKeyLabel = nls.localize('ctrlKey.long', "Control");
            this.shiftKeyLabel = nls.localize('shiftKey.long', "Shift");
            this.altKeyLabel = nls.localize('altKey.long', "Alt");
            this.cmdKeyLabel = nls.localize('cmdKey.long', "Command");
            this.windowsKeyLabel = nls.localize('windowsKey.long', "Windows");
            this.modifierSeparator = '+';
        }
        AriaKeyLabelProvider.prototype.getLabelForKey = function (keyCode) {
            return KeyCode.toString(keyCode);
        };
        AriaKeyLabelProvider.INSTANCE = new MacUIKeyLabelProvider();
        return AriaKeyLabelProvider;
    }());
    exports.AriaKeyLabelProvider = AriaKeyLabelProvider;
    /**
     * Print for Windows, Linux UI
     */
    var ClassicUIKeyLabelProvider = (function () {
        function ClassicUIKeyLabelProvider() {
            this.ctrlKeyLabel = nls.localize('ctrlKey', "Ctrl");
            this.shiftKeyLabel = nls.localize('shiftKey', "Shift");
            this.altKeyLabel = nls.localize('altKey', "Alt");
            this.cmdKeyLabel = nls.localize('cmdKey', "Command");
            this.windowsKeyLabel = nls.localize('windowsKey', "Windows");
            this.modifierSeparator = '+';
        }
        ClassicUIKeyLabelProvider.prototype.getLabelForKey = function (keyCode) {
            return KeyCode.toString(keyCode);
        };
        ClassicUIKeyLabelProvider.INSTANCE = new ClassicUIKeyLabelProvider();
        return ClassicUIKeyLabelProvider;
    }());
    exports.ClassicUIKeyLabelProvider = ClassicUIKeyLabelProvider;
    /**
     * Print for the user settings file.
     */
    var UserSettingsKeyLabelProvider = (function () {
        function UserSettingsKeyLabelProvider() {
            this.ctrlKeyLabel = 'Ctrl';
            this.shiftKeyLabel = 'Shift';
            this.altKeyLabel = 'Alt';
            this.cmdKeyLabel = 'Meta';
            this.windowsKeyLabel = 'Meta';
            this.modifierSeparator = '+';
        }
        UserSettingsKeyLabelProvider.prototype.getLabelForKey = function (keyCode) {
            return USER_SETTINGS.fromKeyCode(keyCode);
        };
        UserSettingsKeyLabelProvider.INSTANCE = new UserSettingsKeyLabelProvider();
        return UserSettingsKeyLabelProvider;
    }());
    function _asString(keybinding, labelProvider, Platform) {
        var result = [], ctrlCmd = BinaryKeybindings.hasCtrlCmd(keybinding), shift = BinaryKeybindings.hasShift(keybinding), alt = BinaryKeybindings.hasAlt(keybinding), winCtrl = BinaryKeybindings.hasWinCtrl(keybinding), keyCode = BinaryKeybindings.extractKeyCode(keybinding);
        var keyLabel = labelProvider.getLabelForKey(keyCode);
        if (!keyLabel) {
            // cannot trigger this key code under this kb layout
            return '';
        }
        // translate modifier keys: Ctrl-Shift-Alt-Meta
        if ((ctrlCmd && !Platform.isMacintosh) || (winCtrl && Platform.isMacintosh)) {
            result.push(labelProvider.ctrlKeyLabel);
        }
        if (shift) {
            result.push(labelProvider.shiftKeyLabel);
        }
        if (alt) {
            result.push(labelProvider.altKeyLabel);
        }
        if (ctrlCmd && Platform.isMacintosh) {
            result.push(labelProvider.cmdKeyLabel);
        }
        if (winCtrl && !Platform.isMacintosh) {
            result.push(labelProvider.windowsKeyLabel);
        }
        // the actual key
        result.push(keyLabel);
        var actualResult = result.join(labelProvider.modifierSeparator);
        if (BinaryKeybindings.hasChord(keybinding)) {
            return actualResult + ' ' + _asString(BinaryKeybindings.extractChordPart(keybinding), labelProvider, Platform);
        }
        return actualResult;
    }
    function _pushKey(result, str) {
        if (result.length > 0) {
            result.push({
                tagName: 'span',
                text: '+'
            });
        }
        result.push({
            tagName: 'span',
            className: 'monaco-kbkey',
            text: str
        });
    }
    function _asHTML(keybinding, labelProvider, Platform, isChord) {
        if (isChord === void 0) { isChord = false; }
        var result = [], ctrlCmd = BinaryKeybindings.hasCtrlCmd(keybinding), shift = BinaryKeybindings.hasShift(keybinding), alt = BinaryKeybindings.hasAlt(keybinding), winCtrl = BinaryKeybindings.hasWinCtrl(keybinding), keyCode = BinaryKeybindings.extractKeyCode(keybinding);
        var keyLabel = labelProvider.getLabelForKey(keyCode);
        if (!keyLabel) {
            // cannot trigger this key code under this kb layout
            return [];
        }
        // translate modifier keys: Ctrl-Shift-Alt-Meta
        if ((ctrlCmd && !Platform.isMacintosh) || (winCtrl && Platform.isMacintosh)) {
            _pushKey(result, labelProvider.ctrlKeyLabel);
        }
        if (shift) {
            _pushKey(result, labelProvider.shiftKeyLabel);
        }
        if (alt) {
            _pushKey(result, labelProvider.altKeyLabel);
        }
        if (ctrlCmd && Platform.isMacintosh) {
            _pushKey(result, labelProvider.cmdKeyLabel);
        }
        if (winCtrl && !Platform.isMacintosh) {
            _pushKey(result, labelProvider.windowsKeyLabel);
        }
        // the actual key
        _pushKey(result, keyLabel);
        var chordTo = null;
        if (BinaryKeybindings.hasChord(keybinding)) {
            chordTo = _asHTML(BinaryKeybindings.extractChordPart(keybinding), labelProvider, Platform, true);
            result.push({
                tagName: 'span',
                text: ' '
            });
            result = result.concat(chordTo);
        }
        if (isChord) {
            return result;
        }
        return [{
                tagName: 'span',
                className: 'monaco-kb',
                children: result
            }];
    }
});
