import { TPromise } from 'vs/base/common/winjs.base';
import { TerminateResponse } from 'vs/base/common/processes';
import { EventEmitter } from 'vs/base/common/eventEmitter';
import { ITaskSystem, TaskDescription, TaskConfiguration, ITaskRunResult } from 'vs/workbench/parts/tasks/common/taskSystem';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IModeService } from 'vs/editor/common/services/modeService';
export interface LanguageServiceTaskConfiguration extends TaskConfiguration {
    modes: string[];
}
export declare class LanguageServiceTaskSystem extends EventEmitter implements ITaskSystem {
    static TelemetryEventName: string;
    private configuration;
    private telemetryService;
    private modeService;
    constructor(configuration: LanguageServiceTaskConfiguration, telemetryService: ITelemetryService, modeService: IModeService);
    build(): ITaskRunResult;
    rebuild(): ITaskRunResult;
    clean(): ITaskRunResult;
    runTest(): ITaskRunResult;
    run(taskIdentifier: string): ITaskRunResult;
    isActive(): TPromise<boolean>;
    isActiveSync(): boolean;
    canAutoTerminate(): boolean;
    terminate(): TPromise<TerminateResponse>;
    terminateSync(): TerminateResponse;
    tasks(): TPromise<TaskDescription[]>;
    private processMode(fn, taskName, trigger);
}
