import mouse = require('vs/base/browser/mouseEvent');
import keyboard = require('vs/base/browser/keyboardEvent');
import tree = require('vs/base/parts/tree/browser/tree');
import treedefaults = require('vs/base/parts/tree/browser/treeDefaults');
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare class Controller extends treedefaults.DefaultController {
    private editorService;
    private telemetryService;
    constructor(editorService: IWorkbenchEditorService, telemetryService: ITelemetryService);
    protected onLeftClick(tree: tree.ITree, element: any, event: mouse.IMouseEvent): boolean;
    protected onEnter(tree: tree.ITree, event: keyboard.IKeyboardEvent): boolean;
    protected onSpace(tree: tree.ITree, event: keyboard.IKeyboardEvent): boolean;
    private openFileAtElement(element, preserveFocus, sideByside, pinned);
}
