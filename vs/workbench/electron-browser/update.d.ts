import { Action } from 'vs/base/common/actions';
import { IMessageService } from 'vs/platform/message/common/message';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IRequestService } from 'vs/platform/request/common/request';
export declare const ShowReleaseNotesAction: (releaseNotesUrl: string, returnValue?: boolean) => Action;
export declare const DownloadAction: (url: string) => Action;
export declare class Update {
    private contextService;
    private messageService;
    private requestService;
    constructor(contextService: IWorkspaceContextService, messageService: IMessageService, requestService: IRequestService);
}
