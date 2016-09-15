import { IHTMLContentElement } from 'vs/base/common/htmlContent';
export interface ISimplifiedPlatform {
    isMacintosh: boolean;
    isWindows: boolean;
}
/**
 * Virtual Key Codes, the value does not hold any inherent meaning.
 * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
 * But these are "more general", as they should work across browsers & OS`s.
 */
export declare enum KeyCode {
    /**
     * Placed first to cover the 0 value of the enum.
     */
    Unknown = 0,
    Backspace = 1,
    Tab = 2,
    Enter = 3,
    Shift = 4,
    Ctrl = 5,
    Alt = 6,
    PauseBreak = 7,
    CapsLock = 8,
    Escape = 9,
    Space = 10,
    PageUp = 11,
    PageDown = 12,
    End = 13,
    Home = 14,
    LeftArrow = 15,
    UpArrow = 16,
    RightArrow = 17,
    DownArrow = 18,
    Insert = 19,
    Delete = 20,
    KEY_0 = 21,
    KEY_1 = 22,
    KEY_2 = 23,
    KEY_3 = 24,
    KEY_4 = 25,
    KEY_5 = 26,
    KEY_6 = 27,
    KEY_7 = 28,
    KEY_8 = 29,
    KEY_9 = 30,
    KEY_A = 31,
    KEY_B = 32,
    KEY_C = 33,
    KEY_D = 34,
    KEY_E = 35,
    KEY_F = 36,
    KEY_G = 37,
    KEY_H = 38,
    KEY_I = 39,
    KEY_J = 40,
    KEY_K = 41,
    KEY_L = 42,
    KEY_M = 43,
    KEY_N = 44,
    KEY_O = 45,
    KEY_P = 46,
    KEY_Q = 47,
    KEY_R = 48,
    KEY_S = 49,
    KEY_T = 50,
    KEY_U = 51,
    KEY_V = 52,
    KEY_W = 53,
    KEY_X = 54,
    KEY_Y = 55,
    KEY_Z = 56,
    Meta = 57,
    ContextMenu = 58,
    F1 = 59,
    F2 = 60,
    F3 = 61,
    F4 = 62,
    F5 = 63,
    F6 = 64,
    F7 = 65,
    F8 = 66,
    F9 = 67,
    F10 = 68,
    F11 = 69,
    F12 = 70,
    F13 = 71,
    F14 = 72,
    F15 = 73,
    F16 = 74,
    F17 = 75,
    F18 = 76,
    F19 = 77,
    NumLock = 78,
    ScrollLock = 79,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ';:' key
     */
    US_SEMICOLON = 80,
    /**
     * For any country/region, the '+' key
     * For the US standard keyboard, the '=+' key
     */
    US_EQUAL = 81,
    /**
     * For any country/region, the ',' key
     * For the US standard keyboard, the ',<' key
     */
    US_COMMA = 82,
    /**
     * For any country/region, the '-' key
     * For the US standard keyboard, the '-_' key
     */
    US_MINUS = 83,
    /**
     * For any country/region, the '.' key
     * For the US standard keyboard, the '.>' key
     */
    US_DOT = 84,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '/?' key
     */
    US_SLASH = 85,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '`~' key
     */
    US_BACKTICK = 86,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '[{' key
     */
    US_OPEN_SQUARE_BRACKET = 87,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '\|' key
     */
    US_BACKSLASH = 88,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ']}' key
     */
    US_CLOSE_SQUARE_BRACKET = 89,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ''"' key
     */
    US_QUOTE = 90,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     */
    OEM_8 = 91,
    /**
     * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
     */
    OEM_102 = 92,
    NUMPAD_0 = 93,
    NUMPAD_1 = 94,
    NUMPAD_2 = 95,
    NUMPAD_3 = 96,
    NUMPAD_4 = 97,
    NUMPAD_5 = 98,
    NUMPAD_6 = 99,
    NUMPAD_7 = 100,
    NUMPAD_8 = 101,
    NUMPAD_9 = 102,
    NUMPAD_MULTIPLY = 103,
    NUMPAD_ADD = 104,
    NUMPAD_SEPARATOR = 105,
    NUMPAD_SUBTRACT = 106,
    NUMPAD_DECIMAL = 107,
    NUMPAD_DIVIDE = 108,
    /**
     * Placed last to cover the length of the enum.
     */
    MAX_VALUE = 109,
}
export declare namespace KeyCode {
    function toString(key: KeyCode): string;
    function fromString(key: string): KeyCode;
}
export declare class BinaryKeybindings {
    static extractFirstPart(keybinding: number): number;
    static extractChordPart(keybinding: number): number;
    static hasChord(keybinding: number): boolean;
    static hasCtrlCmd(keybinding: number): boolean;
    static hasShift(keybinding: number): boolean;
    static hasAlt(keybinding: number): boolean;
    static hasWinCtrl(keybinding: number): boolean;
    static extractKeyCode(keybinding: number): KeyCode;
}
export declare class KeyMod {
    static CtrlCmd: number;
    static Shift: number;
    static Alt: number;
    static WinCtrl: number;
    static chord(firstPart: number, secondPart: number): number;
}
/**
 * A set of usual keybindings that can be reused in code
 */
export declare class CommonKeybindings {
    static ENTER: number;
    static SHIFT_ENTER: number;
    static CTRLCMD_ENTER: number;
    static WINCTRL_ENTER: number;
    static TAB: number;
    static SHIFT_TAB: number;
    static ESCAPE: number;
    static SPACE: number;
    static DELETE: number;
    static SHIFT_DELETE: number;
    static CTRLCMD_BACKSPACE: number;
    static UP_ARROW: number;
    static WINCTRL_P: number;
    static SHIFT_UP_ARROW: number;
    static CTRLCMD_UP_ARROW: number;
    static DOWN_ARROW: number;
    static WINCTRL_N: number;
    static SHIFT_DOWN_ARROW: number;
    static CTRLCMD_DOWN_ARROW: number;
    static LEFT_ARROW: number;
    static RIGHT_ARROW: number;
    static HOME: number;
    static END: number;
    static PAGE_UP: number;
    static SHIFT_PAGE_UP: number;
    static PAGE_DOWN: number;
    static SHIFT_PAGE_DOWN: number;
    static F2: number;
    static CTRLCMD_S: number;
    static CTRLCMD_C: number;
    static CTRLCMD_V: number;
}
export declare class Keybinding {
    /**
     * Format the binding to a format appropiate for rendering in the UI
     */
    private static _toUSLabel(value, Platform);
    /**
     * Format the binding to a format appropiate for placing in an aria-label.
     */
    private static _toUSAriaLabel(value, Platform);
    /**
     * Format the binding to a format appropiate for rendering in the UI
     */
    private static _toUSHTMLLabel(value, Platform);
    /**
     * Format the binding to a format appropiate for rendering in the UI
     */
    private static _toCustomLabel(value, labelProvider, Platform);
    /**
     * Format the binding to a format appropiate for rendering in the UI
     */
    private static _toCustomHTMLLabel(value, labelProvider, Platform);
    /**
     * This prints the binding in a format suitable for electron's accelerators.
     * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
     */
    private static _toElectronAccelerator(value, Platform);
    private static _cachedKeybindingRegex;
    static getUserSettingsKeybindingRegex(): string;
    /**
     * Format the binding to a format appropiate for the user settings file.
     */
    static toUserSettingsLabel(value: number, Platform?: ISimplifiedPlatform): string;
    static fromUserSettingsLabel(input: string, Platform?: ISimplifiedPlatform): number;
    value: number;
    constructor(keybinding: number);
    hasCtrlCmd(): boolean;
    hasShift(): boolean;
    hasAlt(): boolean;
    hasWinCtrl(): boolean;
    extractKeyCode(): KeyCode;
    /**
     * Format the binding to a format appropiate for rendering in the UI
     */
    _toUSLabel(Platform?: ISimplifiedPlatform): string;
    /**
     * Format the binding to a format appropiate for placing in an aria-label.
     */
    _toUSAriaLabel(Platform?: ISimplifiedPlatform): string;
    /**
     * Format the binding to a format appropiate for rendering in the UI
     */
    _toUSHTMLLabel(Platform?: ISimplifiedPlatform): IHTMLContentElement[];
    /**
     * Format the binding to a format appropiate for rendering in the UI
     */
    toCustomLabel(labelProvider: IKeyBindingLabelProvider, Platform?: ISimplifiedPlatform): string;
    /**
     * Format the binding to a format appropiate for rendering in the UI
     */
    toCustomHTMLLabel(labelProvider: IKeyBindingLabelProvider, Platform?: ISimplifiedPlatform): IHTMLContentElement[];
    /**
     * This prints the binding in a format suitable for electron's accelerators.
     * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
     */
    _toElectronAccelerator(Platform?: ISimplifiedPlatform): string;
    /**
     * Format the binding to a format appropiate for the user settings file.
     */
    toUserSettingsLabel(Platform?: ISimplifiedPlatform): string;
}
export interface IKeyBindingLabelProvider {
    ctrlKeyLabel: string;
    shiftKeyLabel: string;
    altKeyLabel: string;
    cmdKeyLabel: string;
    windowsKeyLabel: string;
    modifierSeparator: string;
    getLabelForKey(keyCode: KeyCode): string;
}
/**
 * Print for Electron
 */
export declare class ElectronAcceleratorLabelProvider implements IKeyBindingLabelProvider {
    static INSTANCE: ElectronAcceleratorLabelProvider;
    ctrlKeyLabel: string;
    shiftKeyLabel: string;
    altKeyLabel: string;
    cmdKeyLabel: string;
    windowsKeyLabel: string;
    modifierSeparator: string;
    getLabelForKey(keyCode: KeyCode): string;
}
/**
 * Print for Mac UI
 */
export declare class MacUIKeyLabelProvider implements IKeyBindingLabelProvider {
    static INSTANCE: MacUIKeyLabelProvider;
    private static leftArrowUnicodeLabel;
    private static upArrowUnicodeLabel;
    private static rightArrowUnicodeLabel;
    private static downArrowUnicodeLabel;
    ctrlKeyLabel: string;
    shiftKeyLabel: string;
    altKeyLabel: string;
    cmdKeyLabel: string;
    windowsKeyLabel: string;
    modifierSeparator: string;
    getLabelForKey(keyCode: KeyCode): string;
}
/**
 * Aria label provider for Mac.
 */
export declare class AriaKeyLabelProvider implements IKeyBindingLabelProvider {
    static INSTANCE: MacUIKeyLabelProvider;
    ctrlKeyLabel: string;
    shiftKeyLabel: string;
    altKeyLabel: string;
    cmdKeyLabel: string;
    windowsKeyLabel: string;
    modifierSeparator: string;
    getLabelForKey(keyCode: KeyCode): string;
}
/**
 * Print for Windows, Linux UI
 */
export declare class ClassicUIKeyLabelProvider implements IKeyBindingLabelProvider {
    static INSTANCE: ClassicUIKeyLabelProvider;
    ctrlKeyLabel: string;
    shiftKeyLabel: string;
    altKeyLabel: string;
    cmdKeyLabel: string;
    windowsKeyLabel: string;
    modifierSeparator: string;
    getLabelForKey(keyCode: KeyCode): string;
}
