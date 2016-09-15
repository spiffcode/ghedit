import { ICommonCodeEditor } from 'vs/editor/common/editorCommon';
import emmet = require('emmet');
export declare class EditorAccessor implements emmet.Editor {
    editor: ICommonCodeEditor;
    private _hasMadeEdits;
    emmetSupportedModes: string[];
    constructor(editor: ICommonCodeEditor);
    isEmmetEnabledMode(): boolean;
    getSelectionRange(): emmet.Range;
    getCurrentLineRange(): emmet.Range;
    getCaretPos(): number;
    setCaretPos(pos: number): void;
    getCurrentLine(): string;
    onBeforeEmmetAction(): void;
    replaceContent(value: string, start: number, end: number, no_indent: boolean): void;
    onAfterEmmetAction(): void;
    getContent(): string;
    createSelection(startOffset: number, endOffset?: number): void;
    getSyntax(): string;
    getProfileName(): string;
    prompt(title: string): any;
    getSelection(): string;
    getFilePath(): string;
    private getPositionFromOffset(offset);
    private getOffsetFromPosition(position);
}
