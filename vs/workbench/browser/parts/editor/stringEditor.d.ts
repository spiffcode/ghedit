import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorOptions } from 'vs/editor/common/editorCommon';
import { EditorInput, EditorOptions } from 'vs/workbench/common/editor';
import { BaseTextEditor } from 'vs/workbench/browser/parts/editor/textEditor';
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
 * An editor implementation that is capable of showing string inputs or promise inputs that resolve to a string.
 * Uses the TextEditor widget to show the contents.
 */
export declare class StringEditor extends BaseTextEditor {
    static ID: string;
    private mapResourceToEditorViewState;
    constructor(telemetryService: ITelemetryService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, storageService: IStorageService, messageService: IMessageService, configurationService: IConfigurationService, eventService: IEventService, editorService: IWorkbenchEditorService, modeService: IModeService, themeService: IThemeService);
    private onUntitledSavedEvent(e);
    getTitle(): string;
    setInput(input: EditorInput, options: EditorOptions): TPromise<void>;
    protected getCodeEditorOptions(): IEditorOptions;
    /**
     * Reveals the last line of this editor if it has a model set.
     */
    revealLastLine(): void;
    clearInput(): void;
}
