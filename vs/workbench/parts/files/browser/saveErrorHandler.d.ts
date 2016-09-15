import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import URI from 'vs/base/common/uri';
import { EditorModel } from 'vs/workbench/common/editor';
import { ResourceEditorInput } from 'vs/workbench/common/editor/resourceEditorInput';
import { DiffEditorInput } from 'vs/workbench/common/editor/diffEditorInput';
import { Position } from 'vs/platform/editor/common/editor';
import { FileEditorInput } from 'vs/workbench/parts/files/common/editors/fileEditorInput';
import { IFileService } from 'vs/platform/files/common/files';
import { TextFileEditorModel, ISaveErrorHandler } from 'vs/workbench/parts/files/common/editors/textFileEditorModel';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEventService } from 'vs/platform/event/common/event';
import { ITextFileService } from 'vs/workbench/parts/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMessageService } from 'vs/platform/message/common/message';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IModelService } from 'vs/editor/common/services/modelService';
export declare class SaveErrorHandler implements ISaveErrorHandler {
    private messageService;
    private eventService;
    private instantiationService;
    private messages;
    constructor(messageService: IMessageService, eventService: IEventService, instantiationService: IInstantiationService);
    private registerListeners();
    private onFileSavedOrReverted(resource);
    onSaveError(error: any, model: TextFileEditorModel): void;
}
export declare class ConflictResolutionDiffEditorInput extends DiffEditorInput {
    static ID: string;
    private model;
    constructor(model: TextFileEditorModel, name: string, description: string, originalInput: FileOnDiskEditorInput, modifiedInput: FileEditorInput);
    getModel(): TextFileEditorModel;
    getTypeId(): string;
}
export declare class FileOnDiskEditorInput extends ResourceEditorInput {
    private modeService;
    private fileService;
    private textFileService;
    private fileResource;
    private lastModified;
    private mime;
    private createdEditorModel;
    constructor(fileResource: URI, mime: string, name: string, description: string, modelService: IModelService, modeService: IModeService, instantiationService: IInstantiationService, fileService: IFileService, textFileService: ITextFileService);
    getLastModified(): number;
    resolve(refresh?: boolean): TPromise<EditorModel>;
    dispose(): void;
}
export declare class AcceptLocalChangesAction extends Action {
    private input;
    private position;
    private messageService;
    private instantiationService;
    private editorService;
    private messagesToHide;
    constructor(input: ConflictResolutionDiffEditorInput, position: Position, messageService: IMessageService, instantiationService: IInstantiationService, editorService: IWorkbenchEditorService);
    run(): TPromise<void>;
}
export declare class RevertLocalChangesAction extends Action {
    private input;
    private position;
    private instantiationService;
    private editorService;
    constructor(input: ConflictResolutionDiffEditorInput, position: Position, instantiationService: IInstantiationService, editorService: IWorkbenchEditorService);
    run(): TPromise<void>;
}
