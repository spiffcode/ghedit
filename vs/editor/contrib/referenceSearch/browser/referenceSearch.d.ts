import { TPromise } from 'vs/base/common/winjs.base';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { EditorAction } from 'vs/editor/common/editorAction';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { IPeekViewService } from 'vs/editor/contrib/zoneWidget/browser/peekViewWidget';
export declare class ReferenceAction extends EditorAction {
    static ID: string;
    private peekViewService;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, keybindingService: IKeybindingService, peekViewService: IPeekViewService);
    isSupported(): boolean;
    getEnablementState(): boolean;
    run(): TPromise<boolean>;
}
