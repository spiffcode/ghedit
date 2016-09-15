import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { Behaviour } from 'vs/editor/common/editorActionEnablement';
import { IActionDescriptor, ICommonCodeEditor, IEditorActionDescriptorData, IEditorContribution } from 'vs/editor/common/editorCommon';
export declare class EditorAction extends Action implements IEditorContribution {
    editor: ICommonCodeEditor;
    private _supportsReadonly;
    private _descriptor;
    private _enablementState;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, condition?: Behaviour);
    getId(): string;
    dispose(): void;
    getDescriptor(): IEditorActionDescriptorData;
    enabled: boolean;
    resetEnablementState(): void;
    /**
     * Returns {{true}} in case this action works
     * with the current mode. To be overwritten
     * in subclasses.
     */
    isSupported(): boolean;
    /**
     * Returns the enablement state of this action. This
     * method is being called in the process of {{updateEnablementState}}
     * and overwriters should call super (this method).
     */
    getEnablementState(): boolean;
    getAlias(): string;
}
export declare class HandlerEditorAction extends EditorAction {
    private _handlerId;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, handlerId: string);
    run(): TPromise<boolean>;
}
export declare class DynamicEditorAction extends EditorAction {
    private static _transformBehaviour(behaviour);
    private _run;
    private _tokensAtPosition;
    private _wordAtPosition;
    constructor(descriptor: IActionDescriptor, editor: ICommonCodeEditor);
    run(): TPromise<void>;
    getEnablementState(): boolean;
    private _getEnablementOnTokens();
    private _getEnablementOnWord();
}
