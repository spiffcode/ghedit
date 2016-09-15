import { ITerminalService } from 'vs/workbench/parts/execution/common/execution';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class WinTerminalService implements ITerminalService {
    private _configurationService;
    _serviceBrand: any;
    constructor(_configurationService: IConfigurationService);
    openTerminal(path?: string): void;
    private spawnTerminal(spawner, configuration, command, path?);
}
export declare class MacTerminalService implements ITerminalService {
    private _configurationService;
    _serviceBrand: any;
    constructor(_configurationService: IConfigurationService);
    openTerminal(path?: string): void;
    private spawnTerminal(spawner, configuration, path?);
}
export declare class LinuxTerminalService implements ITerminalService {
    private _configurationService;
    _serviceBrand: any;
    constructor(_configurationService: IConfigurationService);
    openTerminal(path?: string): void;
    private spawnTerminal(spawner, configuration, path?);
}
