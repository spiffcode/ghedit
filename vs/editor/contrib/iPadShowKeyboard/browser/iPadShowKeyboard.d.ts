import 'vs/css!./iPadShowKeyboard';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
export declare class IPadShowKeyboard implements IEditorContribution {
    static ID: string;
    private editor;
    private widget;
    private toDispose;
    constructor(editor: ICodeEditor);
    private update();
    getId(): string;
    dispose(): void;
}
