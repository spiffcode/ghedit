import { Platform } from 'vs/base/common/platform';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Builder } from 'vs/base/browser/builder';
export interface ITerminalFont {
    fontFamily: string;
    fontSize: string;
    lineHeight: number;
    charWidth: number;
    charHeight: number;
}
export interface IShell {
    executable: string;
    args: string[];
}
/**
 * Encapsulates terminal configuration logic, the primary purpose of this file is so that platform
 * specific test cases can be written.
 */
export declare class TerminalConfigHelper {
    private platform;
    private configurationService;
    private panelContainer;
    private charMeasureElement;
    constructor(platform: Platform, configurationService: IConfigurationService, panelContainer: Builder);
    getTheme(baseThemeId: string): string[];
    private measureFont(fontFamily, fontSize, lineHeight);
    /**
     * Gets the font information based on the terminal.integrated.fontFamily,
     * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
     */
    getFont(): ITerminalFont;
    getFontLigaturesEnabled(): boolean;
    getCursorBlink(): boolean;
    getShell(): IShell;
    isSetLocaleVariables(): boolean;
    private toInteger(source, minimum?);
}
