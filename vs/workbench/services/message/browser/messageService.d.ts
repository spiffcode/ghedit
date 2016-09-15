import { IMessageService, IMessageWithAction, IConfirmation, Severity } from 'vs/platform/message/common/message';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import Event from 'vs/base/common/event';
export declare class WorkbenchMessageService implements IMessageService {
    private telemetryService;
    _serviceBrand: any;
    private handler;
    private disposeables;
    private canShowMessages;
    private messageBuffer;
    constructor(telemetryService: ITelemetryService);
    onMessagesShowing: Event<void>;
    onMessagesCleared: Event<void>;
    suspend(): void;
    resume(): void;
    private toBaseSeverity(severity);
    show(sev: Severity, message: string): () => void;
    show(sev: Severity, message: Error): () => void;
    show(sev: Severity, message: string[]): () => void;
    show(sev: Severity, message: Error[]): () => void;
    show(sev: Severity, message: IMessageWithAction): () => void;
    private doShow(sev, message);
    hideAll(): void;
    confirm(confirmation: IConfirmation): boolean;
    dispose(): void;
}
