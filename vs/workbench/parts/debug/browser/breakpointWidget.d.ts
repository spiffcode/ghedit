import 'vs/css!../browser/media/breakpointWidget';
import editorbrowser = require('vs/editor/browser/editorBrowser');
import { ZoneWidget } from 'vs/editor/contrib/zoneWidget/browser/zoneWidget';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import debug = require('vs/workbench/parts/debug/common/debug');
export declare class BreakpointWidget extends ZoneWidget {
    private lineNumber;
    private contextViewService;
    private debugService;
    static INSTANCE: BreakpointWidget;
    private inputBox;
    private toDispose;
    private breakpointWidgetVisible;
    constructor(editor: editorbrowser.ICodeEditor, lineNumber: number, contextViewService: IContextViewService, debugService: debug.IDebugService, keybindingService: IKeybindingService);
    static createInstance(editor: editorbrowser.ICodeEditor, lineNumber: number, instantiationService: IInstantiationService): void;
    protected _fillContainer(container: HTMLElement): void;
    dispose(): void;
}
