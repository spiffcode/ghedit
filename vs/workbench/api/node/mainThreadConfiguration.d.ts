import { IThreadService } from 'vs/workbench/services/thread/common/threadService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class MainThreadConfiguration {
    private _configurationService;
    private _toDispose;
    private _proxy;
    constructor(configurationService: IConfigurationService, threadService: IThreadService);
    dispose(): void;
}
