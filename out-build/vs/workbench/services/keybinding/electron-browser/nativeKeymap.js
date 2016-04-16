var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'native-keymap', 'vs/base/common/keyCodes', 'vs/base/browser/keyboardEvent', 'vs/base/common/platform'], function (require, exports, nativeKeymap, keyCodes_1, keyboardEvent_1, Platform) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var getNativeKeymap = (function () {
        var called = false;
        var result;
        return function getNativeKeymap() {
            if (!called) {
                called = true;
                result = nativeKeymap.getKeyMap();
            }
            return result;
        };
    })();
    // See https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
    // See https://github.com/Microsoft/node-native-keymap/blob/master/deps/chromium/keyboard_codes_win.h
    var NATIVE_KEY_CODE_TO_KEY_CODE = {
        VKEY_BACK: keyCodes_1.KeyCode.Backspace,
        VKEY_TAB: keyCodes_1.KeyCode.Tab,
        VKEY_CLEAR: keyCodes_1.KeyCode.Unknown,
        VKEY_RETURN: keyCodes_1.KeyCode.Enter,
        VKEY_SHIFT: keyCodes_1.KeyCode.Shift,
        VKEY_CONTROL: keyCodes_1.KeyCode.Ctrl,
        VKEY_MENU: keyCodes_1.KeyCode.Alt,
        VKEY_PAUSE: keyCodes_1.KeyCode.PauseBreak,
        VKEY_CAPITAL: keyCodes_1.KeyCode.CapsLock,
        VKEY_KANA: keyCodes_1.KeyCode.Unknown,
        VKEY_HANGUL: keyCodes_1.KeyCode.Unknown,
        VKEY_JUNJA: keyCodes_1.KeyCode.Unknown,
        VKEY_FINAL: keyCodes_1.KeyCode.Unknown,
        VKEY_HANJA: keyCodes_1.KeyCode.Unknown,
        VKEY_KANJI: keyCodes_1.KeyCode.Unknown,
        VKEY_ESCAPE: keyCodes_1.KeyCode.Escape,
        VKEY_CONVERT: keyCodes_1.KeyCode.Unknown,
        VKEY_NONCONVERT: keyCodes_1.KeyCode.Unknown,
        VKEY_ACCEPT: keyCodes_1.KeyCode.Unknown,
        VKEY_MODECHANGE: keyCodes_1.KeyCode.Unknown,
        VKEY_SPACE: keyCodes_1.KeyCode.Space,
        VKEY_PRIOR: keyCodes_1.KeyCode.PageUp,
        VKEY_NEXT: keyCodes_1.KeyCode.PageDown,
        VKEY_END: keyCodes_1.KeyCode.End,
        VKEY_HOME: keyCodes_1.KeyCode.Home,
        VKEY_LEFT: keyCodes_1.KeyCode.LeftArrow,
        VKEY_UP: keyCodes_1.KeyCode.UpArrow,
        VKEY_RIGHT: keyCodes_1.KeyCode.RightArrow,
        VKEY_DOWN: keyCodes_1.KeyCode.DownArrow,
        VKEY_SELECT: keyCodes_1.KeyCode.Unknown,
        VKEY_PRINT: keyCodes_1.KeyCode.Unknown,
        VKEY_EXECUTE: keyCodes_1.KeyCode.Unknown,
        VKEY_SNAPSHOT: keyCodes_1.KeyCode.Unknown,
        VKEY_INSERT: keyCodes_1.KeyCode.Insert,
        VKEY_DELETE: keyCodes_1.KeyCode.Delete,
        VKEY_HELP: keyCodes_1.KeyCode.Unknown,
        VKEY_0: keyCodes_1.KeyCode.KEY_0,
        VKEY_1: keyCodes_1.KeyCode.KEY_1,
        VKEY_2: keyCodes_1.KeyCode.KEY_2,
        VKEY_3: keyCodes_1.KeyCode.KEY_3,
        VKEY_4: keyCodes_1.KeyCode.KEY_4,
        VKEY_5: keyCodes_1.KeyCode.KEY_5,
        VKEY_6: keyCodes_1.KeyCode.KEY_6,
        VKEY_7: keyCodes_1.KeyCode.KEY_7,
        VKEY_8: keyCodes_1.KeyCode.KEY_8,
        VKEY_9: keyCodes_1.KeyCode.KEY_9,
        VKEY_A: keyCodes_1.KeyCode.KEY_A,
        VKEY_B: keyCodes_1.KeyCode.KEY_B,
        VKEY_C: keyCodes_1.KeyCode.KEY_C,
        VKEY_D: keyCodes_1.KeyCode.KEY_D,
        VKEY_E: keyCodes_1.KeyCode.KEY_E,
        VKEY_F: keyCodes_1.KeyCode.KEY_F,
        VKEY_G: keyCodes_1.KeyCode.KEY_G,
        VKEY_H: keyCodes_1.KeyCode.KEY_H,
        VKEY_I: keyCodes_1.KeyCode.KEY_I,
        VKEY_J: keyCodes_1.KeyCode.KEY_J,
        VKEY_K: keyCodes_1.KeyCode.KEY_K,
        VKEY_L: keyCodes_1.KeyCode.KEY_L,
        VKEY_M: keyCodes_1.KeyCode.KEY_M,
        VKEY_N: keyCodes_1.KeyCode.KEY_N,
        VKEY_O: keyCodes_1.KeyCode.KEY_O,
        VKEY_P: keyCodes_1.KeyCode.KEY_P,
        VKEY_Q: keyCodes_1.KeyCode.KEY_Q,
        VKEY_R: keyCodes_1.KeyCode.KEY_R,
        VKEY_S: keyCodes_1.KeyCode.KEY_S,
        VKEY_T: keyCodes_1.KeyCode.KEY_T,
        VKEY_U: keyCodes_1.KeyCode.KEY_U,
        VKEY_V: keyCodes_1.KeyCode.KEY_V,
        VKEY_W: keyCodes_1.KeyCode.KEY_W,
        VKEY_X: keyCodes_1.KeyCode.KEY_X,
        VKEY_Y: keyCodes_1.KeyCode.KEY_Y,
        VKEY_Z: keyCodes_1.KeyCode.KEY_Z,
        VKEY_LWIN: keyCodes_1.KeyCode.Meta,
        VKEY_COMMAND: keyCodes_1.KeyCode.Meta,
        VKEY_RWIN: keyCodes_1.KeyCode.Meta,
        VKEY_APPS: keyCodes_1.KeyCode.Unknown,
        VKEY_SLEEP: keyCodes_1.KeyCode.Unknown,
        VKEY_NUMPAD0: keyCodes_1.KeyCode.NUMPAD_0,
        VKEY_NUMPAD1: keyCodes_1.KeyCode.NUMPAD_1,
        VKEY_NUMPAD2: keyCodes_1.KeyCode.NUMPAD_2,
        VKEY_NUMPAD3: keyCodes_1.KeyCode.NUMPAD_3,
        VKEY_NUMPAD4: keyCodes_1.KeyCode.NUMPAD_4,
        VKEY_NUMPAD5: keyCodes_1.KeyCode.NUMPAD_5,
        VKEY_NUMPAD6: keyCodes_1.KeyCode.NUMPAD_6,
        VKEY_NUMPAD7: keyCodes_1.KeyCode.NUMPAD_7,
        VKEY_NUMPAD8: keyCodes_1.KeyCode.NUMPAD_8,
        VKEY_NUMPAD9: keyCodes_1.KeyCode.NUMPAD_9,
        VKEY_MULTIPLY: keyCodes_1.KeyCode.NUMPAD_MULTIPLY,
        VKEY_ADD: keyCodes_1.KeyCode.NUMPAD_ADD,
        VKEY_SEPARATOR: keyCodes_1.KeyCode.NUMPAD_SEPARATOR,
        VKEY_SUBTRACT: keyCodes_1.KeyCode.NUMPAD_SUBTRACT,
        VKEY_DECIMAL: keyCodes_1.KeyCode.NUMPAD_DECIMAL,
        VKEY_DIVIDE: keyCodes_1.KeyCode.NUMPAD_DIVIDE,
        VKEY_F1: keyCodes_1.KeyCode.F1,
        VKEY_F2: keyCodes_1.KeyCode.F2,
        VKEY_F3: keyCodes_1.KeyCode.F3,
        VKEY_F4: keyCodes_1.KeyCode.F4,
        VKEY_F5: keyCodes_1.KeyCode.F5,
        VKEY_F6: keyCodes_1.KeyCode.F6,
        VKEY_F7: keyCodes_1.KeyCode.F7,
        VKEY_F8: keyCodes_1.KeyCode.F8,
        VKEY_F9: keyCodes_1.KeyCode.F9,
        VKEY_F10: keyCodes_1.KeyCode.F10,
        VKEY_F11: keyCodes_1.KeyCode.F11,
        VKEY_F12: keyCodes_1.KeyCode.F12,
        VKEY_F13: keyCodes_1.KeyCode.F13,
        VKEY_F14: keyCodes_1.KeyCode.F14,
        VKEY_F15: keyCodes_1.KeyCode.F15,
        VKEY_F16: keyCodes_1.KeyCode.F16,
        VKEY_F17: keyCodes_1.KeyCode.F17,
        VKEY_F18: keyCodes_1.KeyCode.F18,
        VKEY_F19: keyCodes_1.KeyCode.F19,
        VKEY_F20: keyCodes_1.KeyCode.Unknown,
        VKEY_F21: keyCodes_1.KeyCode.Unknown,
        VKEY_F22: keyCodes_1.KeyCode.Unknown,
        VKEY_F23: keyCodes_1.KeyCode.Unknown,
        VKEY_F24: keyCodes_1.KeyCode.Unknown,
        VKEY_NUMLOCK: keyCodes_1.KeyCode.NumLock,
        VKEY_SCROLL: keyCodes_1.KeyCode.ScrollLock,
        VKEY_LSHIFT: keyCodes_1.KeyCode.Shift,
        VKEY_RSHIFT: keyCodes_1.KeyCode.Shift,
        VKEY_LCONTROL: keyCodes_1.KeyCode.Ctrl,
        VKEY_RCONTROL: keyCodes_1.KeyCode.Ctrl,
        VKEY_LMENU: keyCodes_1.KeyCode.Unknown,
        VKEY_RMENU: keyCodes_1.KeyCode.Unknown,
        VKEY_BROWSER_BACK: keyCodes_1.KeyCode.Unknown,
        VKEY_BROWSER_FORWARD: keyCodes_1.KeyCode.Unknown,
        VKEY_BROWSER_REFRESH: keyCodes_1.KeyCode.Unknown,
        VKEY_BROWSER_STOP: keyCodes_1.KeyCode.Unknown,
        VKEY_BROWSER_SEARCH: keyCodes_1.KeyCode.Unknown,
        VKEY_BROWSER_FAVORITES: keyCodes_1.KeyCode.Unknown,
        VKEY_BROWSER_HOME: keyCodes_1.KeyCode.Unknown,
        VKEY_VOLUME_MUTE: keyCodes_1.KeyCode.Unknown,
        VKEY_VOLUME_DOWN: keyCodes_1.KeyCode.Unknown,
        VKEY_VOLUME_UP: keyCodes_1.KeyCode.Unknown,
        VKEY_MEDIA_NEXT_TRACK: keyCodes_1.KeyCode.Unknown,
        VKEY_MEDIA_PREV_TRACK: keyCodes_1.KeyCode.Unknown,
        VKEY_MEDIA_STOP: keyCodes_1.KeyCode.Unknown,
        VKEY_MEDIA_PLAY_PAUSE: keyCodes_1.KeyCode.Unknown,
        VKEY_MEDIA_LAUNCH_MAIL: keyCodes_1.KeyCode.Unknown,
        VKEY_MEDIA_LAUNCH_MEDIA_SELECT: keyCodes_1.KeyCode.Unknown,
        VKEY_MEDIA_LAUNCH_APP1: keyCodes_1.KeyCode.Unknown,
        VKEY_MEDIA_LAUNCH_APP2: keyCodes_1.KeyCode.Unknown,
        VKEY_OEM_1: keyCodes_1.KeyCode.US_SEMICOLON,
        VKEY_OEM_PLUS: keyCodes_1.KeyCode.US_EQUAL,
        VKEY_OEM_COMMA: keyCodes_1.KeyCode.US_COMMA,
        VKEY_OEM_MINUS: keyCodes_1.KeyCode.US_MINUS,
        VKEY_OEM_PERIOD: keyCodes_1.KeyCode.US_DOT,
        VKEY_OEM_2: keyCodes_1.KeyCode.US_SLASH,
        VKEY_OEM_3: keyCodes_1.KeyCode.US_BACKTICK,
        VKEY_OEM_4: keyCodes_1.KeyCode.US_OPEN_SQUARE_BRACKET,
        VKEY_OEM_5: keyCodes_1.KeyCode.US_BACKSLASH,
        VKEY_OEM_6: keyCodes_1.KeyCode.US_CLOSE_SQUARE_BRACKET,
        VKEY_OEM_7: keyCodes_1.KeyCode.US_QUOTE,
        VKEY_OEM_8: keyCodes_1.KeyCode.OEM_8,
        VKEY_OEM_102: keyCodes_1.KeyCode.OEM_102,
        VKEY_PROCESSKEY: keyCodes_1.KeyCode.Unknown,
        VKEY_PACKET: keyCodes_1.KeyCode.Unknown,
        VKEY_DBE_SBCSCHAR: keyCodes_1.KeyCode.Unknown,
        VKEY_DBE_DBCSCHAR: keyCodes_1.KeyCode.Unknown,
        VKEY_ATTN: keyCodes_1.KeyCode.Unknown,
        VKEY_CRSEL: keyCodes_1.KeyCode.Unknown,
        VKEY_EXSEL: keyCodes_1.KeyCode.Unknown,
        VKEY_EREOF: keyCodes_1.KeyCode.Unknown,
        VKEY_PLAY: keyCodes_1.KeyCode.Unknown,
        VKEY_ZOOM: keyCodes_1.KeyCode.Unknown,
        VKEY_NONAME: keyCodes_1.KeyCode.Unknown,
        VKEY_PA1: keyCodes_1.KeyCode.Unknown,
        VKEY_OEM_CLEAR: keyCodes_1.KeyCode.Unknown,
        VKEY_UNKNOWN: keyCodes_1.KeyCode.Unknown,
        // Windows does not have a specific key code for AltGr. We use the unused
        // VK_OEM_AX to represent AltGr, matching the behaviour of Firefox on Linux.
        VKEY_ALTGR: keyCodes_1.KeyCode.Unknown,
    };
    var _b24_fixedVirtualKeyCodes = [
        { char: ';', virtualKeyCode: 186 },
        { char: ':', virtualKeyCode: 186 },
        { char: '=', virtualKeyCode: 187 },
        { char: '+', virtualKeyCode: 187 },
        { char: ',', virtualKeyCode: 188 },
        { char: '<', virtualKeyCode: 188 },
        { char: '-', virtualKeyCode: 189 },
        { char: '_', virtualKeyCode: 189 },
        { char: '.', virtualKeyCode: 190 },
        { char: '>', virtualKeyCode: 190 },
        { char: '/', virtualKeyCode: 191 },
        { char: '?', virtualKeyCode: 191 },
        { char: '`', virtualKeyCode: 192 },
        { char: '~', virtualKeyCode: 192 },
        { char: '[', virtualKeyCode: 219 },
        { char: '{', virtualKeyCode: 219 },
        { char: '\\', virtualKeyCode: 220 },
        { char: '|', virtualKeyCode: 220 },
        { char: ']', virtualKeyCode: 221 },
        { char: '}', virtualKeyCode: 221 },
        { char: '\'', virtualKeyCode: 222 },
        { char: '"', virtualKeyCode: 222 },
    ];
    var _b24_interestingChars = Object.create(null);
    _b24_fixedVirtualKeyCodes.forEach(function (el) { return _b24_interestingChars[el.char] = true; });
    var _b24_interestingVirtualKeyCodes = Object.create(null);
    _b24_fixedVirtualKeyCodes.forEach(function (el) { return _b24_interestingVirtualKeyCodes[el.virtualKeyCode] = true; });
    var _b24_getActualKeyCodeMap = (function () {
        var result = null;
        return function () {
            if (!result) {
                result = Object.create(null);
                var nativeMappings = getNativeKeymap();
                for (var i = 0, len = nativeMappings.length; i < len; i++) {
                    var nativeMapping = nativeMappings[i];
                    if (nativeMapping.value && _b24_interestingChars[nativeMapping.value]) {
                        // console.log(nativeMapping.value + " is made by " + nativeMapping.key_code);
                        var keyCode = NATIVE_KEY_CODE_TO_KEY_CODE[nativeMapping.key_code];
                        if (keyCode && keyCode !== keyCodes_1.KeyCode.Unknown) {
                            if (!result[nativeMapping.value] || result[nativeMapping.value] > keyCode) {
                                result[nativeMapping.value] = keyCode;
                            }
                        }
                    }
                    if (nativeMapping.withShift && _b24_interestingChars[nativeMapping.withShift]) {
                        // console.log(nativeMapping.withShift + " is made by " + nativeMapping.key_code);
                        var keyCode = NATIVE_KEY_CODE_TO_KEY_CODE[nativeMapping.key_code];
                        if (keyCode && keyCode !== keyCodes_1.KeyCode.Unknown) {
                            if (!result[nativeMapping.withShift] || result[nativeMapping.withShift] > keyCode) {
                                result[nativeMapping.withShift] = keyCode;
                            }
                        }
                    }
                }
            }
            return result;
        };
    })();
    keyboardEvent_1.setExtractKeyCode(function (e) {
        if (e.charCode) {
            // "keypress" events mostly
            var char = String.fromCharCode(e.charCode).toUpperCase();
            return keyCodes_1.KeyCode.fromString(char);
        }
        if (Platform.isMacintosh && _b24_interestingVirtualKeyCodes[e.keyCode] && typeof e.keyIdentifier === 'string') {
            var keyIdentifier = e.keyIdentifier;
            var strCharCode = keyIdentifier.substr(2);
            try {
                var charCode = parseInt(strCharCode, 16);
                var char = String.fromCharCode(charCode);
                var unfixMap = _b24_getActualKeyCodeMap();
                if (unfixMap[char]) {
                    return unfixMap[char];
                }
            }
            catch (err) {
            }
        }
        // _b24_getActualKeyCodeMap();
        // console.log('injected!!!');
        return keyboardEvent_1.lookupKeyCode(e);
    });
    var nativeAriaLabelProvider = null;
    function getNativeAriaLabelProvider() {
        if (!nativeAriaLabelProvider) {
            var remaps = getNativeLabelProviderRemaps();
            nativeAriaLabelProvider = new NativeAriaKeyLabelProvider(remaps);
        }
        return nativeAriaLabelProvider;
    }
    exports.getNativeAriaLabelProvider = getNativeAriaLabelProvider;
    var nativeLabelProvider = null;
    function getNativeLabelProvider() {
        if (!nativeLabelProvider) {
            var remaps = getNativeLabelProviderRemaps();
            if (Platform.isMacintosh) {
                nativeLabelProvider = new NativeMacUIKeyLabelProvider(remaps);
            }
            else {
                nativeLabelProvider = new NativeClassicUIKeyLabelProvider(remaps);
            }
        }
        return nativeLabelProvider;
    }
    exports.getNativeLabelProvider = getNativeLabelProvider;
    var nativeLabelRemaps = null;
    function getNativeLabelProviderRemaps() {
        if (!nativeLabelRemaps) {
            // See https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
            // See https://github.com/Microsoft/node-native-keymap/blob/master/deps/chromium/keyboard_codes_win.h
            var interestingKeyCodes = {
                VKEY_OEM_1: true,
                VKEY_OEM_PLUS: true,
                VKEY_OEM_COMMA: true,
                VKEY_OEM_MINUS: true,
                VKEY_OEM_PERIOD: true,
                VKEY_OEM_2: true,
                VKEY_OEM_3: true,
                VKEY_OEM_4: true,
                VKEY_OEM_5: true,
                VKEY_OEM_6: true,
                VKEY_OEM_7: true,
                VKEY_OEM_8: true,
                VKEY_OEM_102: true,
            };
            nativeLabelRemaps = [];
            for (var i = 0, len = keyCodes_1.KeyCode.MAX_VALUE; i < len; i++) {
                nativeLabelRemaps[i] = null;
            }
            var nativeMappings = getNativeKeymap();
            var hadRemap = false;
            for (var i = 0, len = nativeMappings.length; i < len; i++) {
                var nativeMapping = nativeMappings[i];
                if (interestingKeyCodes[nativeMapping.key_code]) {
                    var newValue = nativeMapping.value || nativeMapping.withShift;
                    if (newValue.length > 0) {
                        hadRemap = true;
                        nativeLabelRemaps[NATIVE_KEY_CODE_TO_KEY_CODE[nativeMapping.key_code]] = newValue;
                    }
                    else {
                    }
                }
            }
            if (hadRemap) {
                for (var interestingKeyCode in interestingKeyCodes) {
                    if (interestingKeyCodes.hasOwnProperty(interestingKeyCode)) {
                        var keyCode = NATIVE_KEY_CODE_TO_KEY_CODE[interestingKeyCode];
                        nativeLabelRemaps[keyCode] = nativeLabelRemaps[keyCode] || '';
                    }
                }
            }
        }
        return nativeLabelRemaps;
    }
    var NativeMacUIKeyLabelProvider = (function (_super) {
        __extends(NativeMacUIKeyLabelProvider, _super);
        function NativeMacUIKeyLabelProvider(remaps) {
            _super.call(this);
            this.remaps = remaps;
        }
        NativeMacUIKeyLabelProvider.prototype.getLabelForKey = function (keyCode) {
            if (this.remaps[keyCode] !== null) {
                return this.remaps[keyCode];
            }
            return _super.prototype.getLabelForKey.call(this, keyCode);
        };
        return NativeMacUIKeyLabelProvider;
    }(keyCodes_1.MacUIKeyLabelProvider));
    var NativeClassicUIKeyLabelProvider = (function (_super) {
        __extends(NativeClassicUIKeyLabelProvider, _super);
        function NativeClassicUIKeyLabelProvider(remaps) {
            _super.call(this);
            this.remaps = remaps;
        }
        NativeClassicUIKeyLabelProvider.prototype.getLabelForKey = function (keyCode) {
            if (this.remaps[keyCode] !== null) {
                return this.remaps[keyCode];
            }
            return _super.prototype.getLabelForKey.call(this, keyCode);
        };
        return NativeClassicUIKeyLabelProvider;
    }(keyCodes_1.ClassicUIKeyLabelProvider));
    var NativeAriaKeyLabelProvider = (function (_super) {
        __extends(NativeAriaKeyLabelProvider, _super);
        function NativeAriaKeyLabelProvider(remaps) {
            _super.call(this);
            this.remaps = remaps;
        }
        NativeAriaKeyLabelProvider.prototype.getLabelForKey = function (keyCode) {
            if (this.remaps[keyCode] !== null) {
                return this.remaps[keyCode];
            }
            return _super.prototype.getLabelForKey.call(this, keyCode);
        };
        return NativeAriaKeyLabelProvider;
    }(keyCodes_1.AriaKeyLabelProvider));
});
//# sourceMappingURL=nativeKeymap.js.map