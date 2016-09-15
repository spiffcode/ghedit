import 'vs/css!./goToDeclaration';
import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorService } from 'vs/platform/editor/common/editor';
import { IMessageService } from 'vs/platform/message/common/message';
import { EditorAction } from 'vs/editor/common/editorAction';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { IPeekViewService } from 'vs/editor/contrib/zoneWidget/browser/peekViewWidget';
export declare class DefinitionActionConfig {
    condition: number;
    openToSide: boolean;
    openInPeek: boolean;
    filterCurrent: boolean;
    constructor(condition?: number, openToSide?: boolean, openInPeek?: boolean, filterCurrent?: boolean);
}
export declare class DefinitionAction extends EditorAction {
    private _messageService;
    private _editorService;
    private _configuration;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, _messageService: IMessageService, _editorService: IEditorService, _configuration: DefinitionActionConfig);
    isSupported(): boolean;
    getEnablementState(): boolean;
    run(): TPromise<any>;
    private _onResult(model);
    private _openReference(reference, sideBySide);
    private _openInPeek(target, model);
}
export declare class GoToDefinitionAction extends DefinitionAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, messageService: IMessageService, editorService: IEditorService);
}
export declare class OpenDefinitionToSideAction extends DefinitionAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, messageService: IMessageService, editorService: IEditorService);
}
export declare class PeekDefinitionAction extends DefinitionAction {
    private _peekViewService;
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor, messageService: IMessageService, editorService: IEditorService, _peekViewService: IPeekViewService);
    getEnablementState(): boolean;
}
