import { TPromise } from 'vs/base/common/winjs.base';
import { Dimension, Builder } from 'vs/base/browser/builder';
import { EditorInput, EditorOptions } from 'vs/workbench/common/editor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare abstract class BaseBinaryResourceEditor extends BaseEditor {
    private _editorService;
    private binaryContainer;
    private scrollbar;
    constructor(id: string, telemetryService: ITelemetryService, _editorService: IWorkbenchEditorService);
    getTitle(): string;
    editorService: IWorkbenchEditorService;
    createEditor(parent: Builder): void;
    setInput(input: EditorInput, options: EditorOptions): TPromise<void>;
    clearInput(): void;
    layout(dimension: Dimension): void;
    focus(): void;
    dispose(): void;
}
/**
 * An implementation of editor for binary files like images or videos.
 */
export declare class BinaryResourceEditor extends BaseBinaryResourceEditor {
    static ID: string;
    constructor(telemetryService: ITelemetryService, editorService: IWorkbenchEditorService);
}
