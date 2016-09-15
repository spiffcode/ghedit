import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorOptions } from 'vs/editor/common/editorCommon';
import { BaseTextEditor } from 'vs/workbench/browser/parts/editor/textEditor';
import { EditorInput, EditorOptions } from 'vs/workbench/common/editor';
import { IViewletService } from 'vs/workbench/services/viewlet/common/viewletService';
import { IFileService } from 'vs/platform/files/common/files';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEventService } from 'vs/platform/event/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMessageService } from 'vs/platform/message/common/message';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IThemeService } from 'vs/workbench/services/themes/common/themeService';
/**
 * An implementation of editor for file system resources.
 */
export declare class TextFileEditor extends BaseTextEditor {
    private fileService;
    private viewletService;
    static ID: string;
    constructor(telemetryService: ITelemetryService, fileService: IFileService, viewletService: IViewletService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, storageService: IStorageService, messageService: IMessageService, configurationService: IConfigurationService, eventService: IEventService, editorService: IWorkbenchEditorService, modeService: IModeService, themeService: IThemeService);
    private onFilesChanged(e);
    getTitle(): string;
    setInput(input: EditorInput, options: EditorOptions): TPromise<void>;
    private openAsBinary(input, options);
    private openAsFolder(input);
    protected getCodeEditorOptions(): IEditorOptions;
    /**
     * Saves the text editor view state under the given key.
     */
    private saveTextEditorViewState(storageService, key);
    /**
     * Clears the text editor view state under the given key.
     */
    private clearTextEditorViewState(storageService, keys);
    /**
     * Loads the text editor view state for the given key and returns it.
     */
    private loadTextEditorViewState(storageService, key);
    clearInput(): void;
    shutdown(): void;
}
