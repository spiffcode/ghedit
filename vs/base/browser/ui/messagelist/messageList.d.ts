import 'vs/css!./messageList';
import Event from 'vs/base/common/event';
import { Action } from 'vs/base/common/actions';
export declare enum Severity {
    Info = 0,
    Warning = 1,
    Error = 2,
}
export interface IMessageWithAction {
    message: string;
    actions: Action[];
}
export declare class IMessageListOptions {
    purgeInterval: number;
    maxMessages: number;
    maxMessageLength: number;
}
export interface IUsageLogger {
    publicLog(eventName: string, data?: any): void;
}
export declare class MessageList {
    private static DEFAULT_MESSAGE_PURGER_INTERVAL;
    private static DEFAULT_MAX_MESSAGES;
    private static DEFAULT_MAX_MESSAGE_LENGTH;
    private messages;
    private messageListPurger;
    private messageListContainer;
    private containerElementId;
    private options;
    private usageLogger;
    private _onMessagesShowing;
    private _onMessagesCleared;
    constructor(containerElementId: string, usageLogger?: IUsageLogger, options?: IMessageListOptions);
    onMessagesShowing: Event<void>;
    onMessagesCleared: Event<void>;
    showMessage(severity: Severity, message: string): () => void;
    showMessage(severity: Severity, message: Error): () => void;
    showMessage(severity: Severity, message: string[]): () => void;
    showMessage(severity: Severity, message: Error[]): () => void;
    showMessage(severity: Severity, message: IMessageWithAction): () => void;
    private getMessageText(message);
    private doShowMessage(id, message, severity);
    private doShowMessage(id, message, severity);
    private doShowMessage(id, message, severity);
    private renderMessages(animate, delta);
    private renderMessage(message, container, total, delta);
    private getMessageActions(message);
    private prepareMessages();
    private disposeMessages(messages);
    hideMessages(): void;
    show(): void;
    hide(): void;
    private hideMessage(messageText?);
    private purgeMessages();
}
