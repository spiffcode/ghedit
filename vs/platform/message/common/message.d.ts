import Severity from 'vs/base/common/severity';
import { Action } from 'vs/base/common/actions';
export interface IMessageWithAction {
    message: string;
    actions: Action[];
}
export interface IConfirmation {
    title?: string;
    message: string;
    detail?: string;
    primaryButton?: string;
    secondaryButton?: string;
}
export declare const CloseAction: Action;
export declare const LaterAction: Action;
export declare const CancelAction: Action;
export declare const IMessageService: {
    (...args: any[]): void;
    type: IMessageService;
};
export interface IMessageService {
    _serviceBrand: any;
    /**
     * Tells the service to show a message with a given severity
     * the returned function can be used to hide the message again
     */
    show(sev: Severity, message: string): () => void;
    show(sev: Severity, message: Error): () => void;
    show(sev: Severity, message: string[]): () => void;
    show(sev: Severity, message: Error[]): () => void;
    show(sev: Severity, message: IMessageWithAction): () => void;
    /**
     * Hide any messages showing currently.
     */
    hideAll(): void;
    /**
     * Ask the user for confirmation.
     */
    confirm(confirmation: IConfirmation): boolean;
}
export import Severity = Severity;
