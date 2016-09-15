import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorService } from 'vs/platform/editor/common/editor';
import { IEventService } from 'vs/platform/event/common/event';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IMessageService } from 'vs/platform/message/common/message';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { EditorAction } from 'vs/editor/common/editorAction';
import { IEditorActionDescriptorData } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
export declare class RenameAction extends EditorAction {
    private _messageService;
    private _eventService;
    private _editorService;
    private _progressService;
    static ID: string;
    private _renameInputField;
    private _renameInputVisible;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICodeEditor, _messageService: IMessageService, _eventService: IEventService, _editorService: IEditorService, _progressService: IProgressService, keybindingService: IKeybindingService);
    isSupported(): boolean;
    getEnablementState(): boolean;
    run(event?: any): TPromise<any>;
    acceptRenameInput(): void;
    cancelRenameInput(): void;
    private _prepareRename(newName);
}
