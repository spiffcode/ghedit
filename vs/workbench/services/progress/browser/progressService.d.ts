import { TPromise } from 'vs/base/common/winjs.base';
import { ProgressBar } from 'vs/base/browser/ui/progressbar/progressbar';
import { IEventService } from 'vs/platform/event/common/event';
import { IProgressService, IProgressRunner } from 'vs/platform/progress/common/progress';
export declare abstract class ScopedService {
    private _eventService;
    private scopeId;
    constructor(eventService: IEventService, scopeId: string);
    eventService: IEventService;
    registerListeners(): void;
    abstract onScopeActivated(): void;
    abstract onScopeDeactivated(): void;
}
export declare class WorkbenchProgressService extends ScopedService implements IProgressService {
    _serviceBrand: any;
    private isActive;
    private progressbar;
    private progressState;
    constructor(eventService: IEventService, progressbar: ProgressBar, scopeId?: string, isActive?: boolean);
    onScopeDeactivated(): void;
    onScopeActivated(): void;
    private clearProgressState();
    show(infinite: boolean, delay?: number): IProgressRunner;
    show(total: number, delay?: number): IProgressRunner;
    showWhile(promise: TPromise<any>, delay?: number): TPromise<void>;
    private doShowWhile(delay?);
}
