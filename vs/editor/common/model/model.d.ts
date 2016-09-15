import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { IModel, ITextModelCreationOptions, IModeSupportChangedEvent, IModelDecorationsChangedEvent, IModelOptionsChangedEvent, IModelModeChangedEvent, IRawText } from 'vs/editor/common/editorCommon';
import { EditableTextModel } from 'vs/editor/common/model/editableTextModel';
import { IMode } from 'vs/editor/common/modes';
import { IDisposable } from 'vs/base/common/lifecycle';
import { BulkListenerCallback } from 'vs/base/common/eventEmitter';
export declare class Model extends EditableTextModel implements IModel {
    onDidChangeModeSupport(listener: (e: IModeSupportChangedEvent) => void): IDisposable;
    onDidChangeDecorations(listener: (e: IModelDecorationsChangedEvent) => void): IDisposable;
    onDidChangeOptions(listener: (e: IModelOptionsChangedEvent) => void): IDisposable;
    onWillDispose(listener: () => void): IDisposable;
    onDidChangeMode(listener: (e: IModelModeChangedEvent) => void): IDisposable;
    addBulkListener(listener: BulkListenerCallback): IDisposable;
    static createFromString(text: string, options?: ITextModelCreationOptions, mode?: IMode | TPromise<IMode>, uri?: URI): Model;
    id: string;
    private _associatedResource;
    private _attachedEditorCount;
    /**
     * Instantiates a new model
     * @param rawText
     *   The raw text buffer. It may start with a UTF-16 BOM, which can be
     *   optionally preserved when doing a getValue call. The lines may be
     *   separated by different EOL combinations, such as \n or \r\n. These
     *   can also be preserved when doing a getValue call.
     * @param mode
     *   The language service name this model is bound to.
     * @param associatedResource
     *   The resource associated with this model. If the value is not provided an
     *   unique in memory URL is constructed as the associated resource.
     */
    constructor(rawText: IRawText, modeOrPromise: IMode | TPromise<IMode>, associatedResource?: URI);
    getModeId(): string;
    destroy(): void;
    dispose(): void;
    onBeforeAttached(): void;
    onBeforeDetached(): void;
    protected _shouldAutoTokenize(): boolean;
    isAttachedToEditor(): boolean;
    uri: URI;
}
