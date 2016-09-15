import { IWindowService } from 'vs/workbench/services/window/electron-browser/windowService';
import { WorkbenchMessageService } from 'vs/workbench/services/message/browser/messageService';
import { IConfirmation } from 'vs/platform/message/common/message';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class MessageService extends WorkbenchMessageService {
    private contextService;
    private windowService;
    constructor(contextService: IWorkspaceContextService, windowService: IWindowService, telemetryService: ITelemetryService);
    confirm(confirmation: IConfirmation): boolean;
    private mnemonicLabel(label);
}
