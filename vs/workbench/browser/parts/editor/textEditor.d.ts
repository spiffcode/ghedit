import { TPromise } from 'vs/base/common/winjs.base';
import { Dimension, Builder } from 'vs/base/browser/builder';
import { EditorInput, EditorOptions } from 'vs/workbench/common/editor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { IEditor, IEditorOptions } from 'vs/editor/common/editorCommon';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { Position } from 'vs/platform/editor/common/editor';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEventService } from 'vs/platform/event/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMessageService } from 'vs/platform/message/common/message';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IThemeService } from 'vs/workbench/services/themes/common/themeService';
import { Selection } from 'vs/editor/common/core/selection';
/**
 * The base class of editors that leverage the text editor for the editing experience. This class is only intended to
 * be subclassed and not instantiated.
 */
export declare abstract class BaseTextEditor extends BaseEditor {
    private _instantiationService;
    private _contextService;
    private _storageService;
    private _messageService;
    private configurationService;
    private _eventService;
    private _editorService;
    private _modeService;
    private _themeService;
    private editorControl;
    private _editorContainer;
    private _hasPendingConfigurationChange;
    constructor(id: string, telemetryService: ITelemetryService, _instantiationService: IInstantiationService, _contextService: IWorkspaceContextService, _storageService: IStorageService, _messageService: IMessageService, configurationService: IConfigurationService, _eventService: IEventService, _editorService: IWorkbenchEditorService, _modeService: IModeService, _themeService: IThemeService);
    instantiationService: IInstantiationService;
    contextService: IWorkspaceContextService;
    storageService: IStorageService;
    messageService: IMessageService;
    private handleConfigurationChangeEvent(configuration?);
    private consumePendingConfigurationChangeEvent();
    protected applyConfiguration(configuration?: any): void;
    protected getCodeEditorOptions(): IEditorOptions;
    eventService: IEventService;
    editorService: IWorkbenchEditorService;
    editorContainer: Builder;
    createEditor(parent: Builder): void;
    /**
     * This method creates and returns the text editor control to be used. Subclasses can override to
     * provide their own editor control that should be used (e.g. a DiffEditor).
     */
    createEditorControl(parent: Builder): IEditor;
    setInput(input: EditorInput, options: EditorOptions): TPromise<void>;
    setEditorVisible(visible: boolean, position?: Position): void;
    focus(): void;
    layout(dimension: Dimension): void;
    getControl(): IEditor;
    getSelection(): Selection;
    dispose(): void;
}
