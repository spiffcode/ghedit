import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ICodeEditorService } from 'vs/editor/common/services/codeEditorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEventService } from 'vs/platform/event/common/event';
export declare class SaveParticipant implements IWorkbenchContribution {
    private configurationService;
    private eventService;
    private codeEditorService;
    private trimTrailingWhitespace;
    private toUnbind;
    constructor(configurationService: IConfigurationService, eventService: IEventService, codeEditorService: ICodeEditorService);
    private registerListeners();
    private onConfigurationChange(configuration);
    getId(): string;
    private onTextFileSaving(e);
    /**
     * Trim trailing whitespace on a model and ignore lines on which cursors are sitting if triggered via auto save.
     */
    private doTrimTrailingWhitespace(model, isAutoSaved);
    dispose(): void;
}
