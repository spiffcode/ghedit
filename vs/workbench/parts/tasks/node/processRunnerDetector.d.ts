import { TPromise } from 'vs/base/common/winjs.base';
import { IFileService } from 'vs/platform/files/common/files';
import { SystemVariables } from 'vs/workbench/parts/lib/node/systemVariables';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import * as FileConfig from './processRunnerConfiguration';
export interface DetectorResult {
    config: FileConfig.ExternalTaskRunnerConfiguration;
    stdout: string[];
    stderr: string[];
}
export declare class ProcessRunnerDetector {
    private static Version;
    private static SupportedRunners;
    private static TaskMatchers;
    static supports(runner: string): boolean;
    private static detectorConfig(runner);
    private static DefaultProblemMatchers;
    private fileService;
    private contextService;
    private variables;
    private taskConfiguration;
    private _stderr;
    private _stdout;
    constructor(fileService: IFileService, contextService: IWorkspaceContextService, variables: SystemVariables, config?: FileConfig.ExternalTaskRunnerConfiguration);
    stderr: string[];
    stdout: string[];
    detect(list?: boolean, detectSpecific?: string): TPromise<DetectorResult>;
    private tryDetectGulp(list);
    private tryDetectGrunt(list);
    private tryDetectJake(list);
    private runDetection(process, command, isShellCommand, matcher, problemMatchers, list);
    private createTaskDescriptions(tasks, problemMatchers, list);
    private testBuild(taskInfo, taskName, index);
    private testTest(taskInfo, taskName, index);
}
