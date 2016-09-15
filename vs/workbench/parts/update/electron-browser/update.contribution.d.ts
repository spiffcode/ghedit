import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IMessageService } from 'vs/platform/message/common/message';
export declare class UpdateContribution implements IWorkbenchContribution {
    private static KEY;
    private static INSIDER_KEY;
    getId(): string;
    constructor(storageService: IStorageService, contextService: IWorkspaceContextService, messageService: IMessageService);
}
