import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import * as editorCommon from 'vs/editor/common/editorCommon';
export declare function findFocusedEditor(commandId: string, accessor: ServicesAccessor, complain: boolean): editorCommon.ICommonCodeEditor;
export declare function withCodeEditorFromCommandHandler(commandId: string, accessor: ServicesAccessor, callback: (editor: editorCommon.ICommonCodeEditor) => void): void;
export declare function getActiveEditor(accessor: ServicesAccessor): editorCommon.ICommonCodeEditor;
