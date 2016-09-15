import { IDisposable } from 'vs/base/common/lifecycle';
import { ICommonCodeEditor } from 'vs/editor/common/editorCommon';
export declare enum Behaviour {
    TextFocus = 1,
    WidgetFocus = 2,
    Writeable = 4,
    UpdateOnModelChange = 8,
    UpdateOnConfigurationChange = 16,
    UpdateOnCursorPositionChange = 64,
}
export interface IEditorAction {
    isSupported(): boolean;
    getEnablementState(): boolean;
}
export declare function createActionEnablement(editor: ICommonCodeEditor, condition: Behaviour, action: IEditorAction): IEnablementState;
/**
 * Used to signal that something enabled
 */
export interface IEnablementState extends IDisposable {
    value(): boolean;
    reset(): void;
}
