import Event from 'vs/base/common/event';
import cp = require('child_process');
import { Builder } from 'vs/base/browser/builder';
import { TPromise } from 'vs/base/common/winjs.base';
export declare const TERMINAL_PANEL_ID: string;
export declare const TERMINAL_SERVICE_ID: string;
export declare const TERMINAL_DEFAULT_SHELL_LINUX: any;
export declare const TERMINAL_DEFAULT_SHELL_OSX: any;
export declare const TERMINAL_DEFAULT_SHELL_WINDOWS: string;
/**
 * A context key that is set when the integrated terminal has focus.
 */
export declare const KEYBINDING_CONTEXT_TERMINAL_FOCUS: string;
export declare const ITerminalService: {
    (...args: any[]): void;
    type: ITerminalService;
};
export interface ITerminalConfiguration {
    terminal: {
        integrated: {
            shell: {
                linux: string;
                osx: string;
                windows: string;
            };
            shellArgs: {
                linux: string[];
                osx: string[];
            };
            cursorBlinking: boolean;
            fontFamily: string;
            fontLigatures: boolean;
            fontSize: number;
            lineHeight: number;
            setLocaleVariables: boolean;
        };
    };
}
export interface ITerminalProcess {
    title: string;
    process: cp.ChildProcess;
}
export interface ITerminalService {
    _serviceBrand: any;
    onActiveInstanceChanged: Event<string>;
    onInstancesChanged: Event<string>;
    onInstanceTitleChanged: Event<string>;
    close(): TPromise<any>;
    copySelection(): TPromise<any>;
    createNew(): TPromise<any>;
    focus(): TPromise<any>;
    focusNext(): TPromise<any>;
    focusPrevious(): TPromise<any>;
    hide(): TPromise<any>;
    paste(): TPromise<any>;
    runSelectedText(): TPromise<any>;
    setActiveTerminal(index: number): TPromise<any>;
    toggle(): TPromise<any>;
    getActiveTerminalIndex(): number;
    getTerminalInstanceTitles(): string[];
    initConfigHelper(panelContainer: Builder): void;
    killTerminalProcess(terminalProcess: ITerminalProcess): void;
}
