import { IAction } from 'vs/base/common/actions';
import { SelectActionItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { IDebugService } from 'vs/workbench/parts/debug/common/debug';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class DebugSelectActionItem extends SelectActionItem {
    private debugService;
    constructor(action: IAction, debugService: IDebugService, configurationService: IConfigurationService);
    private registerConfigurationListeners(configurationService);
    render(container: HTMLElement): void;
    private updateOptions(changeDebugConfiguration);
}
