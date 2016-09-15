import { IDisposable } from 'vs/base/common/lifecycle';
import { IStatusbarItem } from 'vs/workbench/browser/parts/statusbar/statusbar';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class FeedbackStatusbarItem implements IStatusbarItem {
    private instantiationService;
    private contextViewService;
    private contextService;
    constructor(instantiationService: IInstantiationService, contextViewService: IContextViewService, contextService: IWorkspaceContextService);
    render(element: HTMLElement): IDisposable;
}
