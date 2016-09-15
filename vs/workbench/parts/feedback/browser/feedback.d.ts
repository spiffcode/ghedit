import 'vs/css!./media/feedback';
import { IDisposable } from 'vs/base/common/lifecycle';
import { Builder } from 'vs/base/browser/builder';
import { Dropdown } from 'vs/base/browser/ui/dropdown/dropdown';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
export interface IFeedback {
    feedback: string;
    sentiment: number;
}
export interface IFeedbackService {
    submitFeedback(feedback: IFeedback): void;
    getCharacterLimit(sentiment: number): number;
}
export interface IFeedbackDropdownOptions {
    contextViewProvider: IContextViewService;
    feedbackService?: IFeedbackService;
}
export declare class FeedbackDropdown extends Dropdown {
    protected telemetryService: ITelemetryService;
    private contextService;
    protected maxFeedbackCharacters: number;
    protected feedback: string;
    protected sentiment: number;
    protected aliasEnabled: boolean;
    protected isSendingFeedback: boolean;
    protected autoHideTimeout: number;
    protected feedbackService: IFeedbackService;
    protected feedbackForm: HTMLFormElement;
    protected feedbackDescriptionInput: HTMLTextAreaElement;
    protected smileyInput: Builder;
    protected frownyInput: Builder;
    protected sendButton: Builder;
    protected remainingCharacterCount: Builder;
    protected requestFeatureLink: string;
    protected reportIssueLink: string;
    constructor(container: HTMLElement, options: IFeedbackDropdownOptions, telemetryService: ITelemetryService, contextService: IWorkspaceContextService);
    renderContents(container: HTMLElement): IDisposable;
    private getCharCountText(charCount);
    private updateCharCountText();
    protected setSentiment(smile: boolean): void;
    protected invoke(element: Builder, callback: () => void): Builder;
    hide(): void;
    onEvent(e: Event, activeElement: HTMLElement): void;
    protected onSubmit(): void;
    private changeFormStatus(event);
    protected resetForm(): void;
}
