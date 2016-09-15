import { IModeDescriptor } from 'vs/editor/common/modes';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CompatMode } from 'vs/editor/common/modes/abstractMode';
import { ICompatWorkerService } from 'vs/editor/common/services/compatWorkerService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class OutputMode extends CompatMode {
    private _modeWorkerManager;
    constructor(descriptor: IModeDescriptor, instantiationService: IInstantiationService, compatWorkerService: ICompatWorkerService, contextService: IWorkspaceContextService);
    private _worker<T>(runner);
    static $_configure: void;
    private _configure(workspaceResource);
    static $_provideLinks: void;
    private _provideLinks(resource);
}
