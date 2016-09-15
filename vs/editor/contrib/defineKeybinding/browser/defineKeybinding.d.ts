import 'vs/css!./defineKeybinding';
import { TPromise } from 'vs/base/common/winjs.base';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { EditorAction } from 'vs/editor/common/editorAction';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
export declare class DefineKeybindingController implements editorCommon.IEditorContribution {
    static ID: string;
    static get(editor: editorCommon.ICommonCodeEditor): DefineKeybindingController;
    private _editor;
    private _keybindingService;
    private _launchWidget;
    private _defineWidget;
    private _toDispose;
    private _modelToDispose;
    private _updateDecorations;
    constructor(editor: ICodeEditor, keybindingService: IKeybindingService);
    getId(): string;
    dispose(): void;
    launch(): void;
    private _onAccepted(keybinding);
    private _onModel();
    private _dec;
    private _updateDecorationsNow();
}
export declare class DefineKeybindingAction extends EditorAction {
    static ID: string;
    constructor(descriptor: editorCommon.IEditorActionDescriptorData, editor: editorCommon.ICommonCodeEditor);
    isSupported(): boolean;
    run(): TPromise<boolean>;
}
