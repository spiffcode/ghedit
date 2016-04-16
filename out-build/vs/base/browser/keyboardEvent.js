/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/keyCodes', 'vs/base/common/platform', 'vs/base/browser/browser'], function (require, exports, keyCodes_1, platform, browser) {
    'use strict';
    var KEY_CODE_MAP = {};
    (function () {
        KEY_CODE_MAP[8] = keyCodes_1.KeyCode.Backspace;
        KEY_CODE_MAP[9] = keyCodes_1.KeyCode.Tab;
        KEY_CODE_MAP[13] = keyCodes_1.KeyCode.Enter;
        KEY_CODE_MAP[16] = keyCodes_1.KeyCode.Shift;
        KEY_CODE_MAP[17] = keyCodes_1.KeyCode.Ctrl;
        KEY_CODE_MAP[18] = keyCodes_1.KeyCode.Alt;
        KEY_CODE_MAP[19] = keyCodes_1.KeyCode.PauseBreak;
        KEY_CODE_MAP[20] = keyCodes_1.KeyCode.CapsLock;
        KEY_CODE_MAP[27] = keyCodes_1.KeyCode.Escape;
        KEY_CODE_MAP[32] = keyCodes_1.KeyCode.Space;
        KEY_CODE_MAP[33] = keyCodes_1.KeyCode.PageUp;
        KEY_CODE_MAP[34] = keyCodes_1.KeyCode.PageDown;
        KEY_CODE_MAP[35] = keyCodes_1.KeyCode.End;
        KEY_CODE_MAP[36] = keyCodes_1.KeyCode.Home;
        KEY_CODE_MAP[37] = keyCodes_1.KeyCode.LeftArrow;
        KEY_CODE_MAP[38] = keyCodes_1.KeyCode.UpArrow;
        KEY_CODE_MAP[39] = keyCodes_1.KeyCode.RightArrow;
        KEY_CODE_MAP[40] = keyCodes_1.KeyCode.DownArrow;
        KEY_CODE_MAP[45] = keyCodes_1.KeyCode.Insert;
        KEY_CODE_MAP[46] = keyCodes_1.KeyCode.Delete;
        KEY_CODE_MAP[48] = keyCodes_1.KeyCode.KEY_0;
        KEY_CODE_MAP[49] = keyCodes_1.KeyCode.KEY_1;
        KEY_CODE_MAP[50] = keyCodes_1.KeyCode.KEY_2;
        KEY_CODE_MAP[51] = keyCodes_1.KeyCode.KEY_3;
        KEY_CODE_MAP[52] = keyCodes_1.KeyCode.KEY_4;
        KEY_CODE_MAP[53] = keyCodes_1.KeyCode.KEY_5;
        KEY_CODE_MAP[54] = keyCodes_1.KeyCode.KEY_6;
        KEY_CODE_MAP[55] = keyCodes_1.KeyCode.KEY_7;
        KEY_CODE_MAP[56] = keyCodes_1.KeyCode.KEY_8;
        KEY_CODE_MAP[57] = keyCodes_1.KeyCode.KEY_9;
        KEY_CODE_MAP[65] = keyCodes_1.KeyCode.KEY_A;
        KEY_CODE_MAP[66] = keyCodes_1.KeyCode.KEY_B;
        KEY_CODE_MAP[67] = keyCodes_1.KeyCode.KEY_C;
        KEY_CODE_MAP[68] = keyCodes_1.KeyCode.KEY_D;
        KEY_CODE_MAP[69] = keyCodes_1.KeyCode.KEY_E;
        KEY_CODE_MAP[70] = keyCodes_1.KeyCode.KEY_F;
        KEY_CODE_MAP[71] = keyCodes_1.KeyCode.KEY_G;
        KEY_CODE_MAP[72] = keyCodes_1.KeyCode.KEY_H;
        KEY_CODE_MAP[73] = keyCodes_1.KeyCode.KEY_I;
        KEY_CODE_MAP[74] = keyCodes_1.KeyCode.KEY_J;
        KEY_CODE_MAP[75] = keyCodes_1.KeyCode.KEY_K;
        KEY_CODE_MAP[76] = keyCodes_1.KeyCode.KEY_L;
        KEY_CODE_MAP[77] = keyCodes_1.KeyCode.KEY_M;
        KEY_CODE_MAP[78] = keyCodes_1.KeyCode.KEY_N;
        KEY_CODE_MAP[79] = keyCodes_1.KeyCode.KEY_O;
        KEY_CODE_MAP[80] = keyCodes_1.KeyCode.KEY_P;
        KEY_CODE_MAP[81] = keyCodes_1.KeyCode.KEY_Q;
        KEY_CODE_MAP[82] = keyCodes_1.KeyCode.KEY_R;
        KEY_CODE_MAP[83] = keyCodes_1.KeyCode.KEY_S;
        KEY_CODE_MAP[84] = keyCodes_1.KeyCode.KEY_T;
        KEY_CODE_MAP[85] = keyCodes_1.KeyCode.KEY_U;
        KEY_CODE_MAP[86] = keyCodes_1.KeyCode.KEY_V;
        KEY_CODE_MAP[87] = keyCodes_1.KeyCode.KEY_W;
        KEY_CODE_MAP[88] = keyCodes_1.KeyCode.KEY_X;
        KEY_CODE_MAP[89] = keyCodes_1.KeyCode.KEY_Y;
        KEY_CODE_MAP[90] = keyCodes_1.KeyCode.KEY_Z;
        KEY_CODE_MAP[93] = keyCodes_1.KeyCode.ContextMenu;
        KEY_CODE_MAP[96] = keyCodes_1.KeyCode.NUMPAD_0;
        KEY_CODE_MAP[97] = keyCodes_1.KeyCode.NUMPAD_1;
        KEY_CODE_MAP[98] = keyCodes_1.KeyCode.NUMPAD_2;
        KEY_CODE_MAP[99] = keyCodes_1.KeyCode.NUMPAD_3;
        KEY_CODE_MAP[100] = keyCodes_1.KeyCode.NUMPAD_4;
        KEY_CODE_MAP[101] = keyCodes_1.KeyCode.NUMPAD_5;
        KEY_CODE_MAP[102] = keyCodes_1.KeyCode.NUMPAD_6;
        KEY_CODE_MAP[103] = keyCodes_1.KeyCode.NUMPAD_7;
        KEY_CODE_MAP[104] = keyCodes_1.KeyCode.NUMPAD_8;
        KEY_CODE_MAP[105] = keyCodes_1.KeyCode.NUMPAD_9;
        KEY_CODE_MAP[106] = keyCodes_1.KeyCode.NUMPAD_MULTIPLY;
        KEY_CODE_MAP[107] = keyCodes_1.KeyCode.NUMPAD_ADD;
        KEY_CODE_MAP[108] = keyCodes_1.KeyCode.NUMPAD_SEPARATOR;
        KEY_CODE_MAP[109] = keyCodes_1.KeyCode.NUMPAD_SUBTRACT;
        KEY_CODE_MAP[110] = keyCodes_1.KeyCode.NUMPAD_DECIMAL;
        KEY_CODE_MAP[111] = keyCodes_1.KeyCode.NUMPAD_DIVIDE;
        KEY_CODE_MAP[112] = keyCodes_1.KeyCode.F1;
        KEY_CODE_MAP[113] = keyCodes_1.KeyCode.F2;
        KEY_CODE_MAP[114] = keyCodes_1.KeyCode.F3;
        KEY_CODE_MAP[115] = keyCodes_1.KeyCode.F4;
        KEY_CODE_MAP[116] = keyCodes_1.KeyCode.F5;
        KEY_CODE_MAP[117] = keyCodes_1.KeyCode.F6;
        KEY_CODE_MAP[118] = keyCodes_1.KeyCode.F7;
        KEY_CODE_MAP[119] = keyCodes_1.KeyCode.F8;
        KEY_CODE_MAP[120] = keyCodes_1.KeyCode.F9;
        KEY_CODE_MAP[121] = keyCodes_1.KeyCode.F10;
        KEY_CODE_MAP[122] = keyCodes_1.KeyCode.F11;
        KEY_CODE_MAP[123] = keyCodes_1.KeyCode.F12;
        KEY_CODE_MAP[124] = keyCodes_1.KeyCode.F13;
        KEY_CODE_MAP[125] = keyCodes_1.KeyCode.F14;
        KEY_CODE_MAP[126] = keyCodes_1.KeyCode.F15;
        KEY_CODE_MAP[127] = keyCodes_1.KeyCode.F16;
        KEY_CODE_MAP[128] = keyCodes_1.KeyCode.F17;
        KEY_CODE_MAP[129] = keyCodes_1.KeyCode.F18;
        KEY_CODE_MAP[130] = keyCodes_1.KeyCode.F19;
        KEY_CODE_MAP[144] = keyCodes_1.KeyCode.NumLock;
        KEY_CODE_MAP[145] = keyCodes_1.KeyCode.ScrollLock;
        KEY_CODE_MAP[186] = keyCodes_1.KeyCode.US_SEMICOLON;
        KEY_CODE_MAP[187] = keyCodes_1.KeyCode.US_EQUAL;
        KEY_CODE_MAP[188] = keyCodes_1.KeyCode.US_COMMA;
        KEY_CODE_MAP[189] = keyCodes_1.KeyCode.US_MINUS;
        KEY_CODE_MAP[190] = keyCodes_1.KeyCode.US_DOT;
        KEY_CODE_MAP[191] = keyCodes_1.KeyCode.US_SLASH;
        KEY_CODE_MAP[192] = keyCodes_1.KeyCode.US_BACKTICK;
        KEY_CODE_MAP[219] = keyCodes_1.KeyCode.US_OPEN_SQUARE_BRACKET;
        KEY_CODE_MAP[220] = keyCodes_1.KeyCode.US_BACKSLASH;
        KEY_CODE_MAP[221] = keyCodes_1.KeyCode.US_CLOSE_SQUARE_BRACKET;
        KEY_CODE_MAP[222] = keyCodes_1.KeyCode.US_QUOTE;
        KEY_CODE_MAP[223] = keyCodes_1.KeyCode.OEM_8;
        KEY_CODE_MAP[226] = keyCodes_1.KeyCode.OEM_102;
        if (browser.isIE11orEarlier) {
            KEY_CODE_MAP[91] = keyCodes_1.KeyCode.Meta;
        }
        else if (browser.isFirefox) {
            KEY_CODE_MAP[59] = keyCodes_1.KeyCode.US_SEMICOLON;
            KEY_CODE_MAP[107] = keyCodes_1.KeyCode.US_EQUAL;
            KEY_CODE_MAP[109] = keyCodes_1.KeyCode.US_MINUS;
            if (platform.isMacintosh) {
                KEY_CODE_MAP[224] = keyCodes_1.KeyCode.Meta;
            }
        }
        else if (browser.isWebKit) {
            KEY_CODE_MAP[91] = keyCodes_1.KeyCode.Meta;
            if (platform.isMacintosh) {
                // the two meta keys in the Mac have different key codes (91 and 93)
                KEY_CODE_MAP[93] = keyCodes_1.KeyCode.Meta;
            }
            else {
                KEY_CODE_MAP[92] = keyCodes_1.KeyCode.Meta;
            }
        }
    })();
    function lookupKeyCode(e) {
        return KEY_CODE_MAP[e.keyCode] || keyCodes_1.KeyCode.Unknown;
    }
    exports.lookupKeyCode = lookupKeyCode;
    var extractKeyCode = function extractKeyCode(e) {
        if (e.charCode) {
            // "keypress" events mostly
            var char = String.fromCharCode(e.charCode).toUpperCase();
            return keyCodes_1.KeyCode.fromString(char);
        }
        return lookupKeyCode(e);
    };
    function setExtractKeyCode(newExtractKeyCode) {
        extractKeyCode = newExtractKeyCode;
    }
    exports.setExtractKeyCode = setExtractKeyCode;
    var ctrlKeyMod = (platform.isMacintosh ? keyCodes_1.KeyMod.WinCtrl : keyCodes_1.KeyMod.CtrlCmd);
    var altKeyMod = keyCodes_1.KeyMod.Alt;
    var shiftKeyMod = keyCodes_1.KeyMod.Shift;
    var metaKeyMod = (platform.isMacintosh ? keyCodes_1.KeyMod.CtrlCmd : keyCodes_1.KeyMod.WinCtrl);
    var StandardKeyboardEvent = (function () {
        function StandardKeyboardEvent(source) {
            if (source instanceof StandardKeyboardEvent) {
                this.browserEvent = null;
                this.target = source.target;
                this.ctrlKey = source.ctrlKey;
                this.shiftKey = source.shiftKey;
                this.altKey = source.altKey;
                this.metaKey = source.metaKey;
                this.keyCode = source.keyCode;
                this._asKeybinding = source._asKeybinding;
            }
            else {
                var e = source;
                this.browserEvent = e;
                this.target = e.target || e.targetNode;
                this.ctrlKey = e.ctrlKey;
                this.shiftKey = e.shiftKey;
                this.altKey = e.altKey;
                this.metaKey = e.metaKey;
                this.keyCode = extractKeyCode(e);
                // console.info(e.type + ": keyCode: " + e.keyCode + ", which: " + e.which + ", charCode: " + e.charCode + ", detail: " + e.detail + " ====> " + this.keyCode + ' -- ' + KeyCode[this.keyCode]);
                this.ctrlKey = this.ctrlKey || this.keyCode === keyCodes_1.KeyCode.Ctrl;
                this.altKey = this.altKey || this.keyCode === keyCodes_1.KeyCode.Alt;
                this.shiftKey = this.shiftKey || this.keyCode === keyCodes_1.KeyCode.Shift;
                this.metaKey = this.metaKey || this.keyCode === keyCodes_1.KeyCode.Meta;
                this._asKeybinding = this._computeKeybinding();
            }
        }
        StandardKeyboardEvent.prototype.preventDefault = function () {
            if (this.browserEvent && this.browserEvent.preventDefault) {
                this.browserEvent.preventDefault();
            }
        };
        StandardKeyboardEvent.prototype.stopPropagation = function () {
            if (this.browserEvent && this.browserEvent.stopPropagation) {
                this.browserEvent.stopPropagation();
            }
        };
        StandardKeyboardEvent.prototype.clone = function () {
            return new StandardKeyboardEvent(this);
        };
        StandardKeyboardEvent.prototype.asKeybinding = function () {
            return this._asKeybinding;
        };
        StandardKeyboardEvent.prototype.equals = function (other) {
            return (this._asKeybinding === other);
        };
        StandardKeyboardEvent.prototype._computeKeybinding = function () {
            var key = keyCodes_1.KeyCode.Unknown;
            if (this.keyCode !== keyCodes_1.KeyCode.Ctrl && this.keyCode !== keyCodes_1.KeyCode.Shift && this.keyCode !== keyCodes_1.KeyCode.Alt && this.keyCode !== keyCodes_1.KeyCode.Meta) {
                key = this.keyCode;
            }
            var result = 0;
            if (this.ctrlKey) {
                result |= ctrlKeyMod;
            }
            if (this.altKey) {
                result |= altKeyMod;
            }
            if (this.shiftKey) {
                result |= shiftKeyMod;
            }
            if (this.metaKey) {
                result |= metaKeyMod;
            }
            result |= key;
            return result;
        };
        return StandardKeyboardEvent;
    }());
    exports.StandardKeyboardEvent = StandardKeyboardEvent;
});
